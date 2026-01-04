import { GoogleGenAI, Type } from "@google/genai";
import { BusinessSummary, AiInsight, InsightHistoryItem } from './types';

const PROMPT_VERSION = "v1.6.3-flash";

export const generateInsights = async (
  summary: BusinessSummary,
  topItems: string[],
  history: InsightHistoryItem[] = []
): Promise<AiInsight[]> => {
  // Always initialize with the latest configuration requirements
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const metrics = {
    netMargin: `${summary.margin.toFixed(1)}%`,
    foodCost: `${summary.foodCostPct.toFixed(1)}%`,
    staffCost: `${summary.staffCostPct.toFixed(1)}%`,
    performanceBand: summary.performanceBand.level,
    performanceReason: summary.performanceBand.reason,
    onlineDependency: `${summary.onlineDependencyPct.toFixed(0)}%`,
    revenueDelta: summary.deltas ? `${summary.deltas.revenue.toFixed(1)}%` : 'N/A',
    dataQualityScore: summary.dataQuality,
    bestItem: summary.bestItem ? `${summary.bestItem.name} (Profit Anchor)` : 'None identified',
    worstItem: summary.worstItem ? `${summary.worstItem.name} (Efficiency Leak)` : 'None identified'
  };

  const historyContext = history.length > 0 
    ? `Historical Context (Previous Recommendations):\n${history.slice(0, 3).map(h => `- ${h.month}: Problems [${h.problems.join(', ')}], Recommended Actions [${h.actions.join(', ')}]`).join('\n')}`
    : "No previous historical data available for this client.";

  const prompt = `
    Analyze this restaurant's performance for the latest reporting cycle.
    
    Data Summary: ${JSON.stringify(metrics)}
    ${historyContext}

    Return exactly 3 strategic insights in simple English for the owner.
    Structure your response as a JSON array.
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
              observation: { type: Type.STRING, description: "Key finding from the data." },
              importance: { type: Type.STRING, description: "Why the owner should pay attention." },
              recommendation: { type: Type.STRING, description: "1 actionable step." },
              impactPotential: { type: Type.STRING, description: "Estimated profit impact." },
              confidenceScore: { type: Type.NUMBER, description: "0-100 score." },
              confidenceReason: { type: Type.STRING, description: "Logic for the score." },
            },
            required: ["observation", "importance", "recommendation", "impactPotential", "confidenceScore", "confidenceReason"],
          },
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("Empty AI response received.");

    const parsed = JSON.parse(text.trim());
    return parsed.map((item: any) => ({ ...item, promptVersion: PROMPT_VERSION }));
  } catch (error) {
    console.error("OBIS Intelligence Engine Error:", error);
    throw error; // Let the UI handle the specific error display
  }
};