
import { GoogleGenAI, Type } from "@google/genai";
import { BusinessSummary, RevenueData, CostCategory, MenuItem } from './types';

// Initialize the Google GenAI client with the mandatory process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateInsights = async (
  summary: BusinessSummary,
  revenue: RevenueData[],
  costs: CostCategory[],
  menu: MenuItem[]
) => {
  const prompt = `
    Act as a Senior Business Consultant for high-end restaurants in Hyderabad.
    Analyze this data for a restaurant:
    - Summary: ${JSON.stringify(summary)}
    - Revenue breakdown: ${JSON.stringify(revenue)}
    - Cost structure: ${JSON.stringify(costs)}
    - Menu performance: ${JSON.stringify(menu)}

    Provide 4 actionable insights. For each insight, explain the observation, why it matters, a recommendation, and the potential profit impact.
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

    // Extract text output from response property as per guidelines
    const text = response.text;
    if (!text) {
      return [];
    }

    return JSON.parse(text.trim());
  } catch (error) {
    console.error("Error generating insights:", error);
    return [];
  }
};
