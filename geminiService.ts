
import { GoogleGenAI, Type } from "@google/genai";
import { BusinessSummary } from './types';

// Initialize the Google GenAI client with the mandatory process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateInsights = async (
  summary: BusinessSummary,
  topItems: string[]
) => {
  // MASTER AI PROMPT implementation
  const metrics = {
    netMargin: `${summary.margin.toFixed(1)}%`,
    foodCost: `${summary.foodCostPct.toFixed(1)}%`,
    staffCost: `${summary.staffCostPct.toFixed(1)}%`,
    performanceBand: summary.performanceBand,
    onlineDependency: `${summary.onlineDependencyPct.toFixed(0)}%`,
    topItems: topItems.join(', ')
  };

  const prompt = `
    You are a restaurant business intelligence assistant (OBIS Internal Analyst).
    Context:
    - This is a monthly performance review for a client.
    - This is NOT accounting or tax advice.
    - Use simple, professional language.

    Given the metrics: ${JSON.stringify(metrics)}

    Do the following:
    1. Identify the top 3 business problems.
    2. Explain why each problem matters financially.
    3. Suggest 3 practical actions for next month.
    4. Avoid technical jargon.
    5. Do NOT promise profit or guarantees.

    Structure the response as a JSON array of objects with the keys: observation, importance, recommendation, and impactPotential.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              observation: { type: Type.STRING },
              importance: { type: Type.STRING },
              recommendation: { type: Type.STRING },
              impactPotential: { type: Type.STRING },
            },
            required: ["observation", "importance", "recommendation", "impactPotential"],
          },
        },
      },
    });

    const text = response.text;
    if (!text) return [];

    return JSON.parse(text.trim());
  } catch (error) {
    console.error("Error generating insights:", error);
    return [];
  }
};
