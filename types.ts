
export type ClientStatus = 'Pilot' | 'Active' | 'Inactive';
export type RiskLevel = 'Low' | 'Medium' | 'High';
export type PerformanceBand = 'Healthy' | 'Weak' | 'Dangerous';

export interface Client {
  id: string;
  name: string;
  type: 'Dine-in' | 'Cloud' | 'Hybrid';
  city: string;
  cuisine: string;
  pricingLevel: 'Mid' | 'High';
  status: ClientStatus;
  startMonth: string;
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
}

export interface BusinessSummary {
  revenue: number;
  costs: number;
  netProfit: number;
  margin: number;
  riskLevel: RiskLevel;
  performanceBand: PerformanceBand;
  foodCostPct: number;
  staffCostPct: number;
  onlineDependencyPct: number;
}

export interface AiInsight {
  observation: string;
  importance: string;
  recommendation: string;
  impactPotential: string;
}

export interface RevenueData {
  channel: string;
  gross: number;
  net: number;
  commissions: number;
  discounts: number;
}

export interface CostCategory {
  name: string;
  value: number;
  benchmark: number;
}

export interface MenuItem {
  name: string;
  cost: number;
  price: number;
  sold: number;
  contribution: number;
  popularityRank: number;
  profitRank: number;
}
