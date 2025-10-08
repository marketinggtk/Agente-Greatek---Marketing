interface FeedbackPayload {
    name: string;
    email: string;
    suggestion: string;
}

/**
 * Sends feedback data to a secure backend endpoint or a third-party form handler service.
 * This implementation uses the `fetch` API to send a POST request.
 *
 * @param {FeedbackPayload} payload - The user's feedback data.
 * @returns {Promise<{ success: boolean }>} A promise that resolves when the data is successfully sent.
 */
export const sendFeedbackEmail = async (payload: FeedbackPayload): Promise<{ success: boolean }> => {
    // Este é o endpoint do Formspree que você configurou.
    // Para funcionar, você precisa enviar um formulário de teste e ativar o endpoint no e-mail que o Formspree enviará.
    const FORM_ENDPOINT_URL = 'https://formspree.io/f/mldpwdkg';

    try {
        const response = await fetch(FORM_ENDPOINT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                name: payload.name,
                email: payload.email,
                suggestion: payload.suggestion,
                _subject: `Nova sugestão para o Agente Greatek de ${payload.name}`,
            }),
        });

        if (response.ok) {
            return { success: true };
        } else {
            // Se a resposta não for 'ok', lança um erro com o status.
            throw new Error(`Falha no envio do formulário: Status ${response.status}`);
        }
    } catch (error) {
        console.error("Erro ao enviar o feedback:", error);
        // Propaga o erro para que a UI possa lidar com ele.
        throw error;
    }
};