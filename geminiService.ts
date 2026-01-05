import { GoogleGenAI, Type } from "@google/genai";
import { BusinessSummary, AiInsight, InsightHistoryItem } from './types';

const PROMPT_VERSION = "v1.6.5-flash-native";

export const generateInsights = async (
  summary: BusinessSummary,
  topItems: string[],
  history: InsightHistoryItem[] = []
): Promise<AiInsight[]> => {
  // Obtain API key exclusively from process.env.API_KEY as per guidelines
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    console.error("Gemini API Key missing in process.env.API_KEY. AI Insights will be disabled.");
    // Return a safe fallback instead of throwing to prevent app-wide crash
    return [{
      observation: "AI Engine Offline",
      importance: "System Configuration Issue",
      recommendation: "Please ensure the API_KEY is correctly configured in your environment variables.",
      impactPotential: "Low",
      confidenceScore: 0,
      confidenceReason: "API_KEY not found",
      promptVersion: PROMPT_VERSION
    }];
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const metrics = {
    netMargin: `${summary.margin.toFixed(1)}%`,
    foodCost: `${summary.foodCostPct.toFixed(1)}%`,
    staffCost: `${summary.staffCostPct.toFixed(1)}%`,
    performanceBand: summary.performanceBand.level,
    performanceReason: summary.performanceBand.reason,
    onlineDependency: `${summary.onlineDependencyPct.toFixed(0)}%`,
    dataQualityScore: summary.dataQuality,
    bestItem: summary.bestItem ? summary.bestItem.name : 'N/A'
  };

  const historyContext = history.length > 0 
    ? `\nPrevious Months Context:\n${history.map(h => `- ${h.month}: Problems: ${h.problems.join(', ')} | Actions Taken: ${h.actions.join(', ')}`).join('\n')}`
    : "";

  const prompt = `
    Analyze this restaurant's performance for the current reporting cycle.
    
    Current Metrics: ${JSON.stringify(metrics)}
    Top Sellers: ${topItems.join(', ')}
    ${historyContext}

    Instructions:
    1. Identify critical profit leaks or growth opportunities.
    2. Ensure recommendations are consistent with or build upon previous actions (do not repeat basic advice if it was already recommended and implemented).
    3. Be specific, professional, and data-driven.

    Return exactly 3 strategic business insights as a JSON array. 
    Each insight needs: observation, importance, recommendation, impactPotential, confidenceScore, confidenceReason.
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
    console.error("OBIS SDK ERROR:", error);
    return [{
      observation: "AI Analysis Failed",
      importance: "Service Interruption",
      recommendation: "Wait a moment and try refreshing the analysis.",
      impactPotential: "None",
      confidenceScore: 0,
      confidenceReason: error instanceof Error ? error.message : "Unknown error",
      promptVersion: PROMPT_VERSION
    }];
  }
};