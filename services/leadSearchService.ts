import { LeadData } from '../types';

export type LeadSearchProvider = 'google_custom_search' | 'serpapi' | 'bing' | 'places' | 'internal_database' | 'gemini_search';

export async function getLeadHunterStatus(): Promise<{ googlePlacesConfigured: boolean, environment: string, mockAllowed: boolean }> {
    try {
        const response = await fetch('/api/leads/status');
        if (!response.ok) return { googlePlacesConfigured: false, environment: 'unknown', mockAllowed: false };
        return await response.json();
    } catch (error) {
        console.error("Status check failed", error);
        return { googlePlacesConfigured: false, environment: 'unknown', mockAllowed: false };
    }
}

export async function searchLeadsWithoutAI(query: string, provider: LeadSearchProvider = 'gemini_search'): Promise<{ leads: LeadData[], source: string, ok?: boolean }> {
  try {
    const response = await fetch('/api/leads/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, provider })
    });
    
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
        const text = await response.text();
        console.error("[LeadHunter] Non-JSON response received:", text.substring(0, 500));
        if (text.toLowerCase().includes('rate exceeded') || text.toLowerCase().includes('quota') || response.status === 429) {
            throw new Error("Limite temporário da API atingido. Aguarde alguns minutos e tente novamente.");
        }
        throw new Error("Erro no servidor: Resposta inesperada.");
    }

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || `Busca falhou: ${response.statusText}`);
    }
    
    return data;
  } catch (error: any) {
    console.error("Non-AI search failed:", error.message);
    throw error;
  }
}

export async function enrichLeadsWithAI(leads: LeadData[], query: string): Promise<LeadData[]> {
    try {
        const response = await fetch('/api/leads/enrich', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ leads, query })
        });
        
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            const text = await response.text();
            console.error("[LeadHunter] Non-JSON response received:", text.substring(0, 500));
            throw new Error("Erro no servidor: Resposta inesperada (não-JSON).");
        }

        const data = await response.json();
        
        if (!response.ok) {
            const error = new Error(data.error || "IA indisponível");
            (error as any).status = response.status;
            throw error;
        }
        
        return data;
    } catch (error: any) {
        console.error("AI Enrichment failed:", error.message);
        throw error;
    }
}

export async function enrichLeadsWithCnpj(leads: LeadData[]): Promise<LeadData[]> {
    try {
        const response = await fetch('/api/leads/enrich-cnpj', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ leads })
        });
        
        const contentType = response.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
            const text = await response.text();
            console.error("[LeadHunter] Non-JSON response (CNPJ):", text.substring(0, 500));
            throw new Error("Erro no servidor ao validar CNPJs.");
        }

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || "BrasilAPI indisponível");
        }
        
        return data;
    } catch (error: any) {
        console.error("CNPJ Enrichment failed:", error.message);
        throw error;
    }
}
