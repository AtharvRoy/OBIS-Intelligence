
export type ClientStatus = 'pilot' | 'active' | 'paused' | 'inactive';
export type RiskLevel = 'Low' | 'Medium' | 'High';
export type PerformanceBandLevel = 'Healthy' | 'Weak' | 'Dangerous';

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
  dataQualityScore: number;
}

export interface BusinessSummary {
  revenue: number;
  costs: number;
  netProfit: number;
  margin: number;
  riskLevel: RiskLevel;
  performanceBand: PerformanceMetadata;
  foodCostPct: number;
  staffCostPct: number;
  onlineDependencyPct: number;
  dataQuality: number;
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

export interface AiInsight {
  observation: string;
  importance: string;
  recommendation: string;
  impactPotential: string;
  promptVersion: string;
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

export interface MenuItem {
  name: string;
  price: number;
  sold: number;
  contribution: number;
  popularityRank: number;
  profitRank: number;
}
