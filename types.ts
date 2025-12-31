
export type ClientStatus = 'Pilot' | 'Active' | 'Inactive';
export type RiskLevel = 'Low' | 'Medium' | 'High';

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
  foodCostPct: number;
  staffCostPct: number;
}

export interface AiInsight {
  observation: string;
  importance: string;
  recommendation: string;
  impactPotential: string;
}

// Data structures for revenue breakdown by channel
export interface RevenueData {
  channel: string;
  gross: number;
  net: number;
  commissions: number;
  discounts: number;
}

// Data structures for cost analysis
export interface CostCategory {
  name: string;
  value: number;
  benchmark: number;
}

// Detailed menu item performance metrics
export interface MenuItem {
  name: string;
  cost: number;
  price: number;
  sold: number;
  contribution: number;
  popularityRank: number;
  profitRank: number;
}
