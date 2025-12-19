import { GoogleGenAI, Type } from "@google/genai";
import { CRM_DOCUMENTATION } from '../constants';

// The API key is obtained exclusively from the environment variable process.env.API_KEY.
// When deploying to Netlify, add 'API_KEY' in the Site Settings > Environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAssistantResponse = async (userMessage: string, chatHistory: { role: 'user' | 'model', parts: { text: string }[] }[]) => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: [
              ...chatHistory,
              { role: 'user', parts: [{ text: userMessage }] }
            ],
            config: {
                systemInstruction: `You are a helpful AI assistant for the MediCourier CRM. Your knowledge base is the following document. Answer questions based on this document only. Be concise and helpful. CRM Documentation: ${CRM_DOCUMENTATION}`,
            }
        });

        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return "Sorry, I encountered an error. Please ensure your API key is correctly configured in Netlify environment variables.";
    }
};

export interface PaymentAnalysisResult {
    paidAmount: number;
    difference: number;
    notes: string;
}

export const analyzePaymentProof = async (invoiceTotal: number, imagesBase64: string[]): Promise<PaymentAnalysisResult | null> => {
    try {
        // Prepare image parts. Strip the data URL prefix if present.
        const imageParts = imagesBase64.map(base64String => {
            const matches = base64String.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
            
            if (matches && matches.length === 3) {
                return {
                    inlineData: {
                        mimeType: matches[1],
                        data: matches[2]
                    }
                };
            }
            return null;
        }).filter(part => part !== null);

        if (imageParts.length === 0) return null;

        const prompt = `
            Analyze the attached payment proof image(s). 
            The expected Invoice Total is ${invoiceTotal}.
            1. Identify the total amount paid shown in the screenshot.
            2. Calculate the difference: (Expected Invoice Total - Amount Paid).
            3. Provide a brief note explaining findings.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: {
                parts: [
                    ...imageParts as any,
                    { text: prompt }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        paidAmount: { type: Type.NUMBER, description: "The amount found in the receipt image." },
                        difference: { type: Type.NUMBER, description: "Invoice Total minus Paid Amount." },
                        notes: { type: Type.STRING, description: "A short explanation of the findings." }
                    },
                    required: ["paidAmount", "difference", "notes"]
                }
            }
        });

        if (response.text) {
            return JSON.parse(response.text) as PaymentAnalysisResult;
        }
        return null;

    } catch (error) {
        console.error("Error analyzing payment proof:", error);
        return null;
    }
};