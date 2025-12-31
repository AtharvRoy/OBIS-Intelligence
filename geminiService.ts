
import { GoogleGenAI, Type } from "@google/genai";
import { BusinessSummary, AiInsight, InsightHistoryItem } from './types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const PROMPT_VERSION = "v1.4.0-history-aware";

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
    topItems: topItems.join(', ')
  };

  const historyContext = history.length > 0 
    ? `Historical Context (Previous Recommendations):\n${history.slice(0, 3).map(h => `- ${h.month}: Problems [${h.problems.join(', ')}], Recommended Actions [${h.actions.join(', ')}]`).join('\n')}`
    : "No previous historical data available for this client.";

  const prompt = `
    You are a restaurant business intelligence assistant (OBIS Internal Analyst).
    
    Objective:
    - Analyze the current performance metrics.
    - Review the historical context to ensure continuity and track progress.
    - Provide consistent, actionable insights that don't contradict previous advice unless the data shows a clear shift.

    Context:
    - Current Metrics: ${JSON.stringify(metrics)}
    - ${historyContext}

    Prompt Version: ${PROMPT_VERSION}

    Tasks:
    1. Identify the top 3 critical business problems. If a previous problem persists, acknowledge it or refine the strategy.
    2. Explain the financial importance of each.
    3. Suggest 3 practical, "owner-friendly" recommendations.
    4. Estimate the impact potential for each (e.g., "High", "Medium", "Low").

    Guidelines:
    - Avoid jargon. Be the "thinking assistant".
    - Focus on the Narrative Order: Business Health -> What Changed -> Why It Matters -> What To Do Next.
    - Be realistic and conservative.

    Structure the response as a JSON array of objects with keys: observation, importance, recommendation, and impactPotential.
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

    const parsed = JSON.parse(text.trim());
    return parsed.map((item: any) => ({ ...item, promptVersion: PROMPT_VERSION }));
  } catch (error) {
    console.error("Error generating insights:", error);
    return [];
  }
};
