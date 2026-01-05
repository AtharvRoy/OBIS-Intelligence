import { GoogleGenAI, Type } from "@google/genai";
import { BusinessSummary, AiInsight, InsightHistoryItem } from './types';

const PROMPT_VERSION = "v1.6.5-flash-native";

export const generateInsights = async (
  summary: BusinessSummary,
  topItems: string[] = [],
  history: InsightHistoryItem[] = []
): Promise<AiInsight[]> => {
  // Obtain API key exclusively from process.env.API_KEY as per guidelines
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    console.warn("Gemini API Key missing in process.env.API_KEY.");
    return [{
      observation: "AI Engine Offline",
      importance: "System Configuration Issue",
      recommendation: "Please ensure your Google Gemini API Key is correctly configured in the platform settings.",
      impactPotential: "Low",
      confidenceScore: 0,
      confidenceReason: "API_KEY not found",
      promptVersion: PROMPT_VERSION
    }];
  }

  const ai = new GoogleGenAI({ apiKey });
  
  // Safe metrics calculation
  const metrics = {
    netMargin: `${(summary.margin || 0).toFixed(1)}%`,
    foodCost: `${(summary.foodCostPct || 0).toFixed(1)}%`,
    staffCost: `${(summary.staffCostPct || 0).toFixed(1)}%`,
    performanceBand: summary.performanceBand?.level || 'N/A',
    performanceReason: summary.performanceBand?.reason || 'N/A',
    onlineDependency: `${(summary.onlineDependencyPct || 0).toFixed(0)}%`,
    dataQualityScore: summary.dataQuality || 0,
    bestItem: summary.bestItem?.name || 'N/A'
  };

  // Safe data joiners
  const safeTopItems = Array.isArray(topItems) ? topItems : [];
  const topSellersText = safeTopItems.length > 0 ? safeTopItems.join(', ') : "No data";

  const historyContext = (Array.isArray(history) && history.length > 0)
    ? `\nPrevious Months Context:\n${history.map(h => {
        const probs = Array.isArray(h.problems) ? h.problems.join(', ') : "None";
        const acts = Array.isArray(h.actions) ? h.actions.join(', ') : "None";
        return `- ${h.month}: Problems: ${probs} | Actions: ${acts}`;
      }).join('\n')}`
    : "";

  const prompt = `
    Analyze this restaurant's performance for the current reporting cycle.
    
    Current Metrics: ${JSON.stringify(metrics)}
    Top Sellers: ${topSellersText}
    ${historyContext}

    Instructions:
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
  } catch (error: any) {
    console.error("OBIS SDK ERROR:", error);
    
    // Check for specific API Key invalidation
    const isInvalidKey = error?.message?.includes("API key not valid") || error?.status === "INVALID_ARGUMENT";

    return [{
      observation: isInvalidKey ? "API Key Rejected" : "AI Analysis Failed",
      importance: isInvalidKey ? "Authentication Failure" : "Service Interruption",
      recommendation: isInvalidKey 
        ? "The provided API key is invalid or has expired. Please update it in your project configuration." 
        : "The AI engine encountered an error. Please try again in a few minutes.",
      impactPotential: "None",
      confidenceScore: 0,
      confidenceReason: error instanceof Error ? error.message : "Internal Error",
      promptVersion: PROMPT_VERSION
    }];
  }
};