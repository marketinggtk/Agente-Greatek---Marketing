
import { AppMode, Message, ImageAdPackage, TrainingAnalysisReport, CustomerDossier, SalesTeamMember, SocialMediaSummaries } from "../types";

export const runGeminiJsonQuery = async (mode: AppMode, history: Message[], signal?: AbortSignal): Promise<any> => {
    const response = await fetch("/api/gemini/json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, history }),
        signal
    });
    if (!response.ok) {
        let errorMsg = "Failed to fetch Gemini response";
        try {
            const error = await response.json();
            errorMsg = error.error || errorMsg;
        } catch (e) {
            // If not JSON, try text
            try {
                const text = await response.text();
                errorMsg = text || errorMsg;
            } catch (e2) {}
        }
        throw new Error(errorMsg);
    }
    return response.json();
};

export const runDossierQuery = async (history: Message[], signal?: AbortSignal): Promise<CustomerDossier> => {
    const response = await fetch("/api/gemini/dossier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history }),
        signal
    });
    if (!response.ok) {
        let errorMsg = "Failed to fetch Dossier";
        try {
            const error = await response.json();
            errorMsg = error.error || errorMsg;
        } catch (e) {
            try {
                const text = await response.text();
                errorMsg = text || errorMsg;
            } catch (e2) {}
        }
        throw new Error(errorMsg);
    }
    return response.json();
};

export const generateConversationTitle = async (firstMessage: string): Promise<string> => {
    const response = await fetch("/api/gemini/title", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstMessage }),
    });
    if (!response.ok) return "Nova Conversa";
    const data = await response.json();
    return data.title;
};

export const generateImageAd = async (prompt: string): Promise<ImageAdPackage> => {
    const response = await fetch("/api/gemini/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate image");
    }
    return response.json();
};

// SSE Stream Helper for Client
async function* sseStream(url: string, optionsOrSignal?: RequestInit | AbortSignal) {
    let options: RequestInit = {};
    if (optionsOrSignal) {
        if (optionsOrSignal instanceof AbortSignal) {
            options = { signal: optionsOrSignal };
        } else {
            options = optionsOrSignal;
        }
    }
    const response = await fetch(url, options);
    
    if (!response.ok) {
        let errorMsg = `Stream failed (${response.status})`;
        try {
            const contentType = response.headers.get("content-type") || "";
            if (contentType.includes("application/json")) {
                const data = await response.json();
                errorMsg = data.error || errorMsg;
            } else {
                const text = await response.text();
                errorMsg = text || errorMsg;
            }
        } catch (e) {}
        throw new Error(errorMsg);
    }

    const reader = response.body?.getReader();
    if (!reader) return;

    const decoder = new TextDecoder();
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
            if (line.startsWith('data: ')) {
                const data = line.slice(6).trim();
                if (data === '[DONE]') return;
                try {
                    const parsed = JSON.parse(data);
                    if (parsed.error) throw new Error(parsed.error);
                    if (parsed.chunk) yield parsed.chunk;
                } catch (e) {
                    // Ignore non-json or incomplete lines
                }
            }
        }
    }
}

export const streamGeminiQuery = (mode: AppMode, history: Message[], signal?: AbortSignal) => {
    return sseStream(`/api/gemini/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, history }),
        signal
    });
};

export const streamGoalComparisonAnalysis = (data: any, signal?: AbortSignal) => {
    const params = new URLSearchParams({
        data: JSON.stringify(data)
    });
    return sseStream(`/api/gemini/stream-comparison?${params}`, signal);
};

export const streamTeamStrategy = (globalGoal: string, members: SalesTeamMember[], signal?: AbortSignal) => {
    const params = new URLSearchParams({
        globalGoal,
        members: JSON.stringify(members)
    });
    return sseStream(`/api/gemini/stream-team?${params}`, signal);
};

export const getTrainingAnalysis = async (transcript: string): Promise<TrainingAnalysisReport> => {
    const response = await fetch("/api/gemini/training-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript }),
    });
    if (!response.ok) {
        let errorMsg = "Failed to fetch training analysis";
        try {
            const error = await response.json();
            errorMsg = error.error || errorMsg;
        } catch (e) {
            try {
                const text = await response.text();
                errorMsg = text || errorMsg;
            } catch (e2) {}
        }
        throw new Error(errorMsg);
    }
    return response.json();
};

export const generateSocialMediaSummaries = async (topic: string, blogContent: string): Promise<SocialMediaSummaries> => {
    const response = await fetch("/api/gemini/social-summaries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, blogContent }),
    });
    if (!response.ok) {
        let errorMsg = "Failed to generate social media summaries";
        try {
            const error = await response.json();
            errorMsg = error.error || errorMsg;
        } catch (e) {
            try {
                const text = await response.text();
                errorMsg = text || errorMsg;
            } catch (e2) {}
        }
        throw new Error(errorMsg);
    }
    return response.json();
};
