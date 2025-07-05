

import { GoogleGenAI, GenerateContentResponse, Content } from "@google/genai";
import { AppSettings, AiPersonaName } from '../types';

interface AiServiceParams {
    context: AiPersonaName;
    userPrompt: string;
    settings: AppSettings['ai'];
    history?: Content[];
}

export const getAiResponse = async ({ context, userPrompt, settings, history = [] }: AiServiceParams): Promise<string> => {
    
    console.log('%cAI Service Request', 'color: #8b5cf6; font-weight: bold;', { context, userPrompt, historyLength: history?.length });
    
    if (!settings.enabled) {
        console.warn("AI features are currently disabled in settings.");
        return "AI features are currently disabled in the settings.";
    }

    const apiKey = (typeof process !== 'undefined' && process.env?.API_KEY) || '';

    if (!apiKey) {
        const errorMessage = "Error: The application's AI features are not configured because the API key is missing.";
        console.error(errorMessage);
        return errorMessage;
    }

    try {
        const ai = new GoogleGenAI({ apiKey });
        
        const corePersona = settings.personas.main;
        const contextPersona = settings.personas[context];

        let systemInstruction = `
//--- CORE INSTRUCTION (Your base personality) ---
${corePersona.instructions}

//--- SPECIALIZED TASK (Your current role as ${context}) ---
Your current task is related to ${context}. Your specific instructions are:
${contextPersona.instructions}
        `.trim();
        
        if (settings.plainTextMode) {
            systemInstruction += `\n\n--- FORMATTING RULE ---\nIMPORTANT: Your entire response must be in plain text. Do not use any markdown formatting. Do not use asterisks for bolding or italics. Do not use # for headings. Do not use numbered or bulleted lists. Use simple line breaks to separate paragraphs or ideas.`;
        }
        
        console.log(`[AI Request] Persona: ${context}, Model: ${contextPersona.model}, Temp: ${contextPersona.temperature}`);
        console.log('[AI Request] System Instruction:', systemInstruction);


        const contents: Content[] = [
            ...history,
            {
                role: 'user',
                parts: [{ text: userPrompt }]
            }
        ];

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: contextPersona.model,
            contents: contents,
            config: {
                systemInstruction,
                temperature: contextPersona.temperature,
            }
        });

        console.log('%cAI Service Response', 'color: #10b981; font-weight: bold;', { response });
        return response.text;

    } catch (error) {
        console.error("Error fetching AI response:", error);
        if (error instanceof Error) {
            return `An error occurred while contacting the AI service: ${error.message}`;
        }
        return "An unknown error occurred while contacting the AI service.";
    }
};