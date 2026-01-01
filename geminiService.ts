
import { GoogleGenAI, Type } from "@google/genai";
import { BusinessSummary, AiInsight, InsightHistoryItem } from './types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const PROMPT_VERSION = "v1.6.0-trust-aware";

export const generateInsights = async (
  summary: BusinessSummary,
  topItems: string[],
  history: InsightHistoryItem[] = []
): Promise<AiInsight[]> => {
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
    You are a restaurant business intelligence assistant (OBIS Internal Analyst).
    
    Objective:
    - Analyze the current performance metrics.
    - Specifically address the Profit Anchor and Efficiency Leak.
    - Review history to ensure continuity.
    - SIGNAL CONFIDENCE: If dataQualityScore is low (<75), be more cautious. 

    Context:
    - Current Metrics: ${JSON.stringify(metrics)}
    - ${historyContext}

    Tasks:
    1. Identify 3 critical business problems. 
    2. Suggest 3 practical, "owner-friendly" recommendations.
    3. Calculate a confidenceScore (0-100) for each insight based on the reliability of the input data and provide a confidenceReason.

    Structure the response as a JSON array of objects with keys: observation, importance, recommendation, impactPotential, confidenceScore, confidenceReason.
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
              confidenceScore: { type: Type.NUMBER },
              confidenceReason: { type: Type.STRING },
            },
            required: ["observation", "importance", "recommendation", "impactPotential", "confidenceScore", "confidenceReason"],
          },
        },
      },
    });

    const text = response.text;
    if (!text) return [];

    const parsed = JSON.parse(text.trim());
    return parsed.map((item: any) => ({ ...item, promptVersion: PROMPT_VERSION }));
  } catch (error) {
    console.error("Error generating insights:", error);
    return [];
  }
};
