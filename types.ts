
export type ClientStatus = 'pilot' | 'active' | 'paused' | 'inactive';
export type RiskLevel = 'Low' | 'Medium' | 'High';
export type PerformanceBandLevel = 'Healthy' | 'Weak' | 'Dangerous';
export type DecisionStatus = 'Accepted' | 'Modified' | 'Rejected' | 'Pending';

export interface PerformanceMetadata {
  level: PerformanceBandLevel;
  reason: string;
  driver: string;
  narrative: {
    health: string;
    change: string;
    action: string;
  };
}

export interface DecisionLogEntry {
  id: string;
  recommendation: string;
  status: DecisionStatus;
  notes: string;
  timestamp: string;
  targetMonth: string;
}

export interface InsightHistoryItem {
  month: string;
  problems: string[];
  actions: string[];
  timestamp: string;
}

export interface Client {
  id: string;
  name: string;
  type: 'Dine-in' | 'Cloud' | 'Hybrid';
  city: string;
  cuisine: string;
  pricingLevel: 'Mid' | 'High';
  status: ClientStatus;
  startMonth: string;
  lastUpdatedAt: string;
  insightHistory: InsightHistoryItem[];
  decisionLog: DecisionLogEntry[]; 
  currentInsights?: AiInsight[]; // Persistent storage for generated insights
}

export interface MenuItem {
  name: string;
  price: number;
  cost: number;
  sold: number;
  contribution: number;
  popularityRank: number;
  profitRank: number;
}

export interface MonthlyRecord {
  clientId: string;
  month: string;
  revenue: {
    total: number;
    online: number;
    offline: number;
    orders: number;
  };
  costs: {
    food: number;
    staff: number;
    rent: number;
    utilities: number;
    marketing: number;
    packaging: number;
    discounts: number;
  };
  topItems: string[];
  menuItems?: MenuItem[];
  dataQualityScore: number;
}

export interface BusinessSummary {
  revenue: number;
  costs: number;
  netProfit: number;
  margin: number;
  riskLevel: RiskLevel;
  financialHealth: PerformanceBandLevel;
  structuralResilience: PerformanceBandLevel;
  performanceBand: PerformanceMetadata;
  foodCostPct: number;
  staffCostPct: number;
  onlineDependencyPct: number;
  dataQuality: number;
  attentionScore: number; 
  bestItem?: MenuItem;
  worstItem?: MenuItem;
  deltas?: {
    revenue: number;
    margin: number;
    foodCost: number;
    onlineDependency: number;
    marketing: number;
    netProfit: number;
    orders: number;
  };
}

export interface Benchmark {
  foodCostPct: { healthy: [number, number], label: string };
  staffCostPct: { healthy: [number, number], label: string };
  netMargin: { healthy: [number, number], label: string };
  marketingPct: { healthy: [number, number], label: string };
}

export interface RevenueData {
  channel: string;
  gross: number;
  net: number;
}

export interface CostCategory {
  name: string;
  value: number;
}

export interface AiInsight {
  observation: string;
  importance: string;
  recommendation: string;
  impactPotential: string;
  confidenceScore: number; 
  confidenceReason: string;
  promptVersion: string;
}
