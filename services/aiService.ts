import { GoogleGenAI } from "@google/genai";
import { DriverCalculated, SummaryData } from "../types";

export const generateRescuePlan = async (
    apiKey: string,
    needingRescue: DriverCalculated[],
    onPace: DriverCalculated[],
    summary: SummaryData,
    hoursRemaining: number
): Promise<string> => {
    
    if (!apiKey) {
        throw new Error("API Key is missing. Please set it in the settings.");
    }

    // Initialize Gemini with the provided key at runtime
    const ai = new GoogleGenAI({ apiKey });
    const model = "gemini-2.5-flash";
    
    // Prepare a concise context payload
    const context = {
        situation: `Logistics Rescue Planning. ${hoursRemaining.toFixed(2)} hours remaining in shift.`,
        summary: summary,
        driversInTrouble: needingRescue.map(d => ({
            name: d.name,
            stopsBehind: d.diff,
            currentPace: d.pace,
            stopsRemaining: d.remaining
        })),
        topHelpers: onPace.slice(0, 8).map(d => ({
            name: d.name,
            surplusCapacity: Math.abs(d.diff),
            pace: d.pace
        }))
    };

    const prompt = `
    You are an expert logistics coordinator AI. 
    Analyze the JSON data provided below regarding delivery drivers.
    
    Data: ${JSON.stringify(context)}

    Your Goal: Create a concise, tactical "Rescue Plan".
    
    Guidelines:
    1. Identify the most critical driver (highest stops behind).
    2. Suggest specific swaps: "Assign [Driver A] to take [X] stops from [Driver B]". Match high-pace helpers with struggling drivers.
    3. Keep it under 150 words. Use bullet points.
    4. Be direct and action-oriented.
    5. If the deficit is huge and helpers are few, warn the dispatcher to call in extra shifts.
    `;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });
        return response.text || "AI could not generate a plan.";
    } catch (error) {
        console.error("AI Generation Error:", error);
        return "Error generating AI plan. Please check your API Key in settings.";
    }
};