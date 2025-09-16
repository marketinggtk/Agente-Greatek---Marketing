interface FeedbackPayload {
    name: string;
    email: string;
    suggestion: string;
}

/**
 * Simulates sending a feedback email via a secure backend API.
 * In a real-world application, this function would make a `fetch` request
 * to a serverless function or a dedicated backend endpoint.
 *
 * @param {FeedbackPayload} payload - The user's feedback data.
 * @returns {Promise<{ success: boolean }>} A promise that resolves when the email is "sent".
 */
export const sendFeedbackEmail = (payload: FeedbackPayload): Promise<{ success: boolean }> => {
    return new Promise((resolve, reject) => {
        console.log('--- SIMULATING EMAIL SEND ---');
        console.log('Recipient: marketing@greatek.com.br');
        console.log('Subject: Ideia de melhoria para o Agente Greatek');
        console.log('Payload:', payload);

        // Simulate a network delay
        setTimeout(() => {
            // Simulate a potential but rare failure
            if (Math.random() < 0.1) { // 10% chance of failure
                console.error('--- SIMULATED EMAIL SEND FAILURE ---');
                reject(new Error('Simulated server error'));
            } else {
                console.log('--- SIMULATED EMAIL SEND SUCCESS ---');
                resolve({ success: true });
            }
        }, 1500); // 1.5 second delay
    });
};
