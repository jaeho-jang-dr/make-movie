// Grok AI Agent using X.AI API
export class GrokAgent {
    private apiKey: string;
    private baseUrl = 'https://api.x.ai/v1';

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    async generateContent(prompt: string, systemInstruction?: string): Promise<string> {
        const messages: any[] = [];

        if (systemInstruction) {
            messages.push({
                role: 'system',
                content: systemInstruction
            });
        }

        messages.push({
            role: 'user',
            content: prompt
        });

        try {
            const response = await fetch(`${this.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: 'grok-3',
                    messages: messages,
                    temperature: 0.7,
                    max_tokens: 4000
                })
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`Grok API Error (${response.status}): ${error}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error: any) {
            console.error('❌ Grok API Error:', error.message);
            throw error;
        }
    }
}
