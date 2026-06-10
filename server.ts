import express from "express";
import 'dotenv/config';
import path from "path";
import { createServer as createViteServer } from "vite";
import { Resend } from "resend";
import { 
    runGeminiJsonQuery, 
    streamGeminiQuery, 
    runDossierQuery, 
    generateConversationTitle, 
    generateImageAd,
    streamGoalComparisonAnalysis,
    streamTeamStrategy,
    getTrainingAnalysis,
    generateSocialMediaSummaries,
    enrichLeadsWithAI
} from "./services/gemini.server";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- Lead Search & Enrichment Routes ---

app.get("/api/leads/status", (req, res) => {
    try {
        const hasKey = Boolean(process.env.GOOGLE_PLACES_API_KEY);
        res.json({
            ok: true,
            googlePlacesConfigured: hasKey,
            environment: process.env.NODE_ENV || "development",
            mockAllowed: process.env.NODE_ENV === "development" && !hasKey
        });
    } catch (err: any) {
        res.status(500).json({ ok: false, error: "Falha ao obter status" });
    }
});

app.post("/api/leads/test-google-places", async (req, res) => {
    try {
        const { query } = req.body;
        const apiKey = process.env.GOOGLE_PLACES_API_KEY;
        
        if (!apiKey) {
            return res.status(400).json({ ok: false, error: "GOOGLE_PLACES_API_KEY is missing", googlePlacesConfigured: false });
        }

        const leads = await searchLeadsWithGooglePlaces(query || "provedores em Campinas");
        res.json({ ok: true, source: "google_places", count: leads.length, leads });
    } catch (err: any) {
        res.status(500).json({ ok: false, error: err.message, googlePlacesConfigured: Boolean(process.env.GOOGLE_PLACES_API_KEY) });
    }
});

function normalizeCnpj(value: string): string {
    return String(value || '').replace(/\D/g, '');
}

async function fetchCompanyByCnpj(cnpj: string): Promise<any> {
    const cleanCnpj = normalizeCnpj(cnpj);

    if (!/^\d{14}$/.test(cleanCnpj)) {
        throw new Error('CNPJ inválido');
    }

    try {
        console.log(`[BrasilAPI] Fetching CNPJ: ${cleanCnpj}`);
        const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`, {
            headers: {
                'User-Agent': 'AgenteGreatek/1.0 (B2B Sales Support System)'
            }
        });

        if (response.status === 404) {
            return null;
        }

        if (response.status === 403) {
            console.warn(`[BrasilAPI] Access forbidden (403) for CNPJ: ${cleanCnpj}. Likely blocked pattern or rate limit.`);
            return null; // Treat as not found/unavailable to avoid breaking the flow
        }

        if (!response.ok) {
            throw new Error(`Erro ao consultar BrasilAPI: ${response.status}`);
        }

        return await response.json();
    } catch (error: any) {
        console.error(`[BrasilAPI] Error fetching ${cleanCnpj}:`, error.message);
        return null; // Return null instead of throwing to keep the sequential process moving
    }
}

async function searchLeadsWithGooglePlaces(query: string): Promise<any[]> {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
        throw new Error("GOOGLE_PLACES_API_KEY is missing");
    }

    // Defensive check for broad queries to avoid hitting API limits
    const lowerQuery = query.toLowerCase();
    const broadTerms = ["região", "centro oeste", "nordeste", "sudeste", "norte", "sul", "brasil"];
    const hasBroadTerm = broadTerms.some(term => lowerQuery.includes(term));
    const hasSpecificLocation = /\b(em|no|na|de|sp|rj|mg|rs|sc|pr|ba|pe|ce|df|go|mt|ms|am|pa|al|rn|pb|ma|pi|se|to|ro|ac|ap|rr)\b/i.test(lowerQuery);

    if (hasBroadTerm && !hasSpecificLocation && lowerQuery.split(' ').length < 4) {
        throw new Error("Busca muito ampla. Por favor, adicione uma cidade ou estado para resultados mais precisos.");
    }

    console.log(`[Google Places] Searching for: ${query}`);

    try {
        const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': apiKey,
                'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.internationalPhoneNumber,places.websiteUri,places.addressComponents,places.location,places.businessStatus'
            },
            body: JSON.stringify({ 
                textQuery: query, 
                languageCode: 'pt-BR',
                maxResultCount: 10 // Strictly limit to 10 to save quota
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[Google Places] API Error: ${response.status}`, errorText);
            
            if (response.status === 429 || errorText.includes('Rate exceeded')) {
                const err: any = new Error('Limite temporário da Google Places API atingido. Tente novamente em alguns minutos.');
                err.status = 429;
                throw err;
            }
            
            throw new Error(`Google Places API Error: ${response.status}`);
        }

        const data: any = await response.json();
        const places = data.places || [];

        return places.map((place: any) => {
            let city = "N/A";
            let uf = "N/A";

            if (place.addressComponents) {
                const locality = place.addressComponents.find((c: any) => c.types.includes("locality"));
                const state = place.addressComponents.find((c: any) => c.types.includes("administrative_area_level_1"));
                
                if (locality) city = locality.shortText || locality.longText;
                if (state) uf = state.shortText || state.longText;
            }

            return {
                name: place.displayName?.text || "Nome não disponível",
                legal_name: 'N/A',
                trade_name: 'N/A',
                cnpj: 'N/A',
                responsible_name: 'N/A',
                city,
                uf,
                contact_info: place.nationalPhoneNumber || place.internationalPhoneNumber || 'N/A',
                whatsapp: 'N/A',
                website: place.websiteUri || 'N/A',
                company_status: 'N/A',
                main_cnae: 'N/A',
                main_cnae_description: 'N/A',
                secondary_cnaes: [],
                qsa: [],
                cnpj_validated: false,
                cnpj_source: 'not_provided',
                relevance_score: 'Pendente',
                reason: 'Resultado encontrado via Google Places. Aguardando enriquecimento por IA.',
                potential_products: []
            };
        });
    } catch (err: any) {
        console.error("[Google Places] Fetch Exception:", err.message);
        throw err;
    }
}

app.post("/api/leads/search", async (req, res) => {
    try {
        const { query } = req.body;
        const apiKey = process.env.GOOGLE_PLACES_API_KEY;
        const isDev = process.env.NODE_ENV !== "production";
        const hasKey = Boolean(apiKey);

        console.log(`[LeadHunter API] Search requested: "${query}"`);
        console.log(`[LeadHunter API] Google Places configured: ${hasKey}`);
        console.log(`[LeadHunter API] Environment: ${process.env.NODE_ENV || 'development'}`);

        if (!hasKey) {
            if (isDev) {
                console.warn("[LeadHunter API] GOOGLE_PLACES_API_KEY missing. Returning mock data in dev mode.");
                const mockLeads = [
                    { 
                        name: "Provedor Exemplo 1 (Simulado)", 
                        legal_name: "EXEMPLO TELECOM LTDA",
                        city: "Campinas", 
                        uf: "SP", 
                        website: "https://exemplo1.com.br", 
                        contact_info: "(19) 9999-9999", 
                        cnpj: "12345678000199",
                        cnpj_source: "mock",
                        company_status: "ATIVA",
                        relevance_score: "Alta", 
                        reason: "Demonstração de busca básica.", 
                        potential_products: [] 
                    },
                    { 
                        name: "Net Ráida Campinas (Simulado)", 
                        legal_name: "NET RAPIDA SERVICOS DE INTERNET",
                        city: "Campinas", 
                        uf: "SP", 
                        website: "https://netrapida.com.br", 
                        contact_info: "(19) 8888-8888", 
                        cnpj: "98765432000188",
                        cnpj_source: "mock",
                        company_status: "ATIVA",
                        relevance_score: "Média", 
                        reason: "Demonstração de busca básica.", 
                        potential_products: [] 
                    },
                    { 
                        name: "Conecta ISP (Simulado)", 
                        legal_name: "CONECTA SERVICOS TELECOM",
                        city: "Campinas", 
                        uf: "SP", 
                        website: "https://conecta.com.br", 
                        contact_info: "(19) 7777-7777", 
                        cnpj: "55555555000155",
                        cnpj_source: "mock",
                        company_status: "ATIVA",
                        relevance_score: "Média", 
                        reason: "Demonstração de busca básica.", 
                        potential_products: [] 
                    }
                ];
                return res.json({ leads: mockLeads, source: "mock" });
            } else {
                return res.status(500).json({ error: "Fonte de busca não configurada. Configure GOOGLE_PLACES_API_KEY." });
            }
        }

        if (!query || query.length < 5) {
            return res.status(400).json({ error: "A busca deve ser mais específica." });
        }

        const leads = await searchLeadsWithGooglePlaces(query);
        res.json({ ok: true, leads, source: "google_places" });
    } catch (err: any) {
        const status = err.status || 500;
        res.status(status).json({ 
            ok: false, 
            error: err.message || "Falha na busca de dados básicos via Google Places.",
            code: status === 429 ? "RATE_LIMIT" : "GOOGLE_PLACES_ERROR"
        });
    }
});

app.post("/api/leads/validate-cnpj", async (req, res) => {
    try {
        const { cnpj } = req.body;
        const data = await fetchCompanyByCnpj(cnpj);
        
        if (!data) {
            return res.json({ ok: false, error: "CNPJ não encontrado" });
        }

        res.json({ ok: true, company: data });
    } catch (err: any) {
        console.error("Validate CNPJ Error:", err);
        res.status(500).json({ ok: false, error: err.message });
    }
});

app.post("/api/leads/enrich-cnpj", async (req, res) => {
    try {
        const { leads } = req.body;
        if (!Array.isArray(leads)) {
            return res.status(400).json({ error: "Leads must be an array" });
        }

        const enrichedLeads = [];
        // Process leads sequentially with small delay to avoid 429 from BrasilAPI
        for (const lead of leads) {
            const cnpj = normalizeCnpj(lead.cnpj || '');
            
            // Skip enrichment for leads explicitly marked as mock or if CNPJ is dummy pattern
            const isMock = lead.cnpj_source === 'mock' || ['12345678000199', '98765432000188', '55555555000155'].includes(cnpj);

            if (cnpj.length === 14 && !isMock) {
                try {
                    const data = await fetchCompanyByCnpj(cnpj);
                    if (data) {
                        enrichedLeads.push({
                            ...lead,
                            legal_name: data.razao_social || lead.legal_name || 'N/A',
                            trade_name: data.nome_fantasia || lead.name || 'N/A',
                            name: data.nome_fantasia || lead.name || data.razao_social || lead.name,
                            cnpj: data.cnpj || lead.cnpj,
                            company_status: data.descricao_situacao_cadastral || data.situacao_cadastral || 'N/A',
                            city: data.municipio || lead.city || 'N/A',
                            uf: data.uf || lead.uf || 'N/A',
                            contact_info: data.ddd_telefone_1 ? `(${data.ddd_telefone_1}) ${data.telefone_1 || ''}` : lead.contact_info,
                            main_cnae: data.cnae_fiscal ? String(data.cnae_fiscal) : lead.main_cnae,
                            main_cnae_description: data.cnae_fiscal_descricao || lead.main_cnae_description,
                            qsa: Array.isArray(data.qsa)
                                ? data.qsa.map((socio: any) => socio.nome_socio || socio.nome || '').filter(Boolean)
                                : lead.qsa || [],
                            cnpj_validated: true,
                            cnpj_source: 'brasilapi'
                        });
                    } else {
                        enrichedLeads.push({ 
                            ...lead, 
                            cnpj_validated: false, 
                            cnpj_source: 'not_found' 
                        });
                    }
                } catch (err: any) {
                    enrichedLeads.push({ 
                        ...lead, 
                        cnpj_validated: false, 
                        cnpj_source: 'brasilapi',
                        cnpj_error: err.message 
                    });
                }
                // Small delay to be polite
                await new Promise(resolve => setTimeout(resolve, 150));
            } else if (isMock) {
                enrichedLeads.push({
                    ...lead,
                    cnpj_validated: true,
                    cnpj_source: 'mock'
                });
            } else {
                enrichedLeads.push({ 
                    ...lead, 
                    cnpj_validated: false, 
                    cnpj_source: lead.cnpj && lead.cnpj !== 'N/A' ? 'manual' : 'not_provided' 
                });
            }
        }

        res.json(enrichedLeads);
    } catch (err: any) {
        console.error("Enrich CNPJ Error:", err);
        res.status(500).json({ error: "Falha ao enriquecer leads via BrasilAPI" });
    }
});

app.post("/api/leads/enrich", async (req, res) => {
    try {
        const { leads, query } = req.body;
        if (!leads || !Array.isArray(leads)) {
             return res.status(400).json({ error: "Dados inválidos: lista de leads ausente." });
        }
        const enrichedLeads = await enrichLeadsWithAI(leads, query);
        res.json(enrichedLeads);
    } catch (err: any) {
        console.error("[LeadHunter API] Lead Enrichment Error:", err.message);
        const status = err.status || 500;
        res.status(status).json({ 
            error: err.message || "Falha no enriquecimento por IA",
            code: status === 429 ? "QUOTA_EXHAUSTED" : status === 503 ? "SERVICE_UNAVAILABLE" : "UNKNOWN_ERROR"
        });
    }
});

let resend: Resend | null = null;

// --- Gemini API Proxies ---

app.post("/api/gemini/json", async (req, res) => {
    try {
        const { mode, history } = req.body;
        const result = await runGeminiJsonQuery(mode, history);
        res.json(result);
    } catch (err: any) {
        console.error("Gemini JSON Error:", err);
        res.status(500).json({ error: err.message || "Gemini Error" });
    }
});

app.post("/api/gemini/title", async (req, res) => {
    try {
        const { firstMessage } = req.body;
        const title = await generateConversationTitle(firstMessage);
        res.json({ title });
    } catch (err: any) {
        console.error("Gemini Title Error:", err);
        res.status(500).json({ error: err.message || "Gemini Error" });
    }
});

app.post("/api/gemini/image", async (req, res) => {
    try {
        const { prompt } = req.body;
        const result = await generateImageAd(prompt);
        res.json(result);
    } catch (err: any) {
        console.error("Gemini Image Error:", err);
        res.status(500).json({ error: err.message || "Gemini Error" });
    }
});

app.post("/api/gemini/dossier", async (req, res) => {
    try {
        const { history } = req.body;
        const result = await runDossierQuery(history);
        res.json(result);
    } catch (err: any) {
        console.error("Gemini Dossier Error:", err);
        res.status(500).json({ error: err.message || "Gemini Error" });
    }
});

app.post("/api/gemini/social-summaries", async (req, res) => {
    try {
        const { topic, blogContent } = req.body;
        const result = await generateSocialMediaSummaries(topic, blogContent);
        res.json(result);
    } catch (err: any) {
        console.error("Gemini Social Summaries Error:", err);
        res.status(500).json({ error: err.message || "Gemini Error" });
    }
});

app.post("/api/gemini/training-analysis", async (req, res) => {
    try {
        const { transcript } = req.body;
        const result = await getTrainingAnalysis(transcript);
        res.json(result);
    } catch (err: any) {
        console.error("Gemini Training Analysis Error:", err);
        res.status(500).json({ error: err.message || "Gemini Error" });
    }
});

// SSE Streaming Helper
const setupSSE = (res: any) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
};

app.post("/api/gemini/stream", async (req, res) => {
    const { mode, history } = req.body;
    if (!mode || !history) return res.status(400).send("Missing params");

    setupSSE(res);

    try {
        const stream = streamGeminiQuery(mode as any, history);

        for await (const chunk of stream) {
            res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
        }
        res.write('data: [DONE]\n\n');
        res.end();
    } catch (err: any) {
        console.error("Gemini Stream Error:", err);
        res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
        res.end();
    }
});

app.get("/api/gemini/stream-comparison", async (req, res) => {
    const { data } = req.query;
    if (!data) return res.status(400).send("Missing data");

    setupSSE(res);

    try {
        const parsedData = JSON.parse(data as string);
        const stream = streamGoalComparisonAnalysis(parsedData);

        for await (const chunk of stream) {
            res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
        }
        res.write('data: [DONE]\n\n');
        res.end();
    } catch (err: any) {
        console.error("Gemini Comparison Stream Error:", err);
        res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
        res.end();
    }
});

app.get("/api/gemini/stream-team", async (req, res) => {
    const { globalGoal, members } = req.query;
    if (!globalGoal || !members) return res.status(400).send("Missing params");

    setupSSE(res);

    try {
        const parsedMembers = JSON.parse(members as string);
        const stream = streamTeamStrategy(globalGoal as string, parsedMembers);

        for await (const chunk of stream) {
            res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
        }
        res.write('data: [DONE]\n\n');
        res.end();
    } catch (err: any) {
        console.error("Gemini Team Stream Error:", err);
        res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
        res.end();
    }
});

// API route for sending proposals
app.post("/api/send-proposal", async (req, res) => {
    const { name, email, cnpj, phone, productInterest, quantity } = req.body;

    if (!name || !email || !cnpj || !phone || !productInterest || !quantity) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        console.error("RESEND_API_KEY is missing");
        return res.status(500).json({ error: "Configuração de e-mail ausente no servidor." });
    }

    try {
        if (!resend) {
            resend = new Resend(apiKey);
        }

        console.log(`Attempting to send email to: ${email} for product: ${productInterest}`);

        const { data, error } = await resend.emails.send({
            from: "Greatek Brasil <onboarding@resend.dev>", // Usando 'onboarding' que é o padrão do Resend para testes
            to: [email],
            subject: `Proposta Formal - Greatek Brasil - ${productInterest}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
                    <div style="background-color: #004a99; color: white; padding: 20px; text-align: center;">
                        <h1 style="margin: 0; font-size: 24px;">Greatek Brasil</h1>
                        <p style="margin: 5px 0 0; opacity: 0.8;">Proposta de Equipamentos Telecom</p>
                    </div>
                    
                    <div style="padding: 30px;">
                        <h2 style="color: #333; border-bottom: 2px solid #004a99; padding-bottom: 10px;">Resumo da Solicitação</h2>
                        
                        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                            <tr style="background-color: #f9f9f9;">
                                <td style="padding: 12px; font-weight: bold; width: 40%;">Produto:</td>
                                <td style="padding: 12px;">${productInterest}</td>
                            </tr>
                            <tr>
                                <td style="padding: 12px; font-weight: bold;">Quantidade:</td>
                                <td style="padding: 12px;">${quantity} unidades</td>
                            </tr>
                        </table>

                        <h2 style="color: #333; border-bottom: 2px solid #004a99; padding-bottom: 10px; margin-top: 40px;">Dados do Cliente</h2>
                        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                            <tr>
                                <td style="padding: 8px; font-weight: bold; width: 40%;">Nome:</td>
                                <td style="padding: 8px;">${name}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px; font-weight: bold;">CNPJ:</td>
                                <td style="padding: 8px;">${cnpj}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px; font-weight: bold;">E-mail:</td>
                                <td style="padding: 8px;">${email}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px; font-weight: bold;">WhatsApp:</td>
                                <td style="padding: 8px;">${phone}</td>
                            </tr>
                        </table>

                        <div style="margin-top: 40px; text-align: center; background-color: #f8fafc; padding: 20px; border-radius: 8px;">
                            <p style="color: #64748b; font-size: 14px; margin-bottom: 20px;">
                                Nosso time comercial já foi notificado e entrará em contato em breve para finalizar os detalhes e prazos.
                            </p>
                            <a href="https://wa.me/5512992218852" style="display: inline-block; background-color: #25d366; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                                Falar com Gerente Comercial
                            </a>
                        </div>
                    </div>

                    <div style="background-color: #f4f4f4; color: #777; padding: 20px; text-align: center; font-size: 12px;">
                        <p style="margin: 0;">Greatek Brasil - Tecnologia em Conectividade</p>
                        <p style="margin: 5px 0 0;">Este é um documento formal gerado pelo Agente SDR Inteligente.</p>
                    </div>
                </div>
            `
        });

        if (error) {
            console.error("Resend API Error:", error);
            return res.status(500).json({ error: error.message || "Erro na API do Resend" });
        }

        console.log("Email sent successfully:", data);
        res.json({ success: true, data });
    } catch (err: any) {
        console.error("Server exception:", err);
        res.status(500).json({ error: err.message || "Internal Server Error" });
    }
});

async function startServer() {
    if (process.env.NODE_ENV !== "production") {
        const vite = await createViteServer({
            server: { middlewareMode: true },
            appType: "spa",
        });
        app.use(vite.middlewares);
    } else {
        const distPath = path.join(process.cwd(), 'dist');
        app.use(express.static(distPath));
        app.get('*', (req, res) => {
            res.sendFile(path.join(distPath, 'index.html'));
        });
    }

    // --- Global Error Handler (MUST BE BEFORE app.listen AND AFTER ROUTES) ---
    app.use((err: any, req: any, res: any, next: any) => {
        console.error('[Server Error Middleware]', err);

        if (res.headersSent) {
            return next(err);
        }

        const message = String(err?.message || '');
        const isRate = message.toLowerCase().includes('rate') || 
                       message.toLowerCase().includes('quota') || 
                       message.toLowerCase().includes('too many') ||
                       err.status === 429;

        if (isRate) {
            return res.status(429).json({
                ok: false,
                code: 'RATE_LIMIT',
                error: 'Limite temporário da API atingido. Aguarde alguns minutos e tente novamente.'
            });
        }

        return res.status(err.status || 500).json({
            ok: false,
            code: err.code || 'UNKNOWN_ERROR',
            error: err.message || 'Erro interno ao processar a solicitação.'
        });
    });

    app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

startServer().catch(err => {
    console.error("CRITICAL: Failed to start server:", err);
    process.exit(1);
});
