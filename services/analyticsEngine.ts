
import { MonthlyRecord, BusinessSummary, PerformanceBand, RiskLevel } from '../types';

export function runAnalyticsEngine(record: MonthlyRecord): BusinessSummary {
  const { revenue, costs } = record;
  const totalCosts = Object.values(costs).reduce((a, b) => a + b, 0);
  const netProfit = revenue.total - totalCosts;
  const margin = (netProfit / revenue.total) * 100;
  const foodCostPct = (costs.food / revenue.total) * 100;
  const staffCostPct = (costs.staff / revenue.total) * 100;
  const onlineDependencyPct = (revenue.online / revenue.total) * 100;

  // Logic-based classification (Not AI)
  let performanceBand: PerformanceBand = 'Healthy';
  let riskLevel: RiskLevel = 'Low';

  if (margin < 10 || foodCostPct > 35) {
    performanceBand = 'Dangerous';
    riskLevel = 'High';
  } else if (margin < 15 || foodCostPct > 32) {
    performanceBand = 'Weak';
    riskLevel = 'Medium';
  }

  return {
    revenue: revenue.total,
    costs: totalCosts,
    netProfit,
    margin,
    riskLevel,
    performanceBand,
    foodCostPct,
    staffCostPct,
    onlineDependencyPct
  };
}
