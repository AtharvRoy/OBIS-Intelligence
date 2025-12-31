
import { MonthlyRecord, BusinessSummary, RiskLevel, PerformanceMetadata, PerformanceBandLevel } from '../types';
import { BENCHMARKS } from '../constants';

export function runAnalyticsEngine(currentRecord: MonthlyRecord, previousRecord?: MonthlyRecord): BusinessSummary {
  const { revenue, costs } = currentRecord;
  const totalCosts = Object.values(costs).reduce((a, b) => a + b, 0);
  const netProfit = revenue.total - totalCosts;
  const margin = (netProfit / revenue.total) * 100;
  
  const foodCostPct = (costs.food / revenue.total) * 100;
  const staffCostPct = (costs.staff / revenue.total) * 100;
  const marketingPct = (costs.marketing / revenue.total) * 100;
  const onlineDependencyPct = (revenue.online / revenue.total) * 100;

  // Metadata Classification
  let level: PerformanceBandLevel = 'Healthy';
  let reason = 'Operations are within healthy industry bands.';
  let driver = 'Balanced revenue/cost mix.';
  let riskLevel: RiskLevel = 'Low';

  if (margin < 8 || foodCostPct > 36) {
    level = 'Dangerous';
    riskLevel = 'High';
    reason = margin < 8 ? 'Net margin is in the critical danger zone.' : 'Food cost is cannibalizing all profits.';
    driver = foodCostPct > 36 ? 'Procurement & Waste' : 'High Fixed Overheads';
  } else if (margin < 15 || foodCostPct > 33 || onlineDependencyPct > 60) {
    level = 'Weak';
    riskLevel = 'Medium';
    reason = margin < 15 ? 'Profitability is trailing the 18% target.' : 'External dependency (Online/Costs) is high.';
    driver = onlineDependencyPct > 60 ? 'Platform Commissions' : 'Menu Costing';
  }

  // Delta calculations
  let deltas;
  if (previousRecord) {
    const prevTotalCosts = Object.values(previousRecord.costs).reduce((a, b) => a + b, 0);
    const prevNetProfit = previousRecord.revenue.total - prevTotalCosts;
    const prevMargin = (prevNetProfit / previousRecord.revenue.total) * 100;
    const prevFoodCostPct = (previousRecord.costs.food / previousRecord.revenue.total) * 100;
    const prevOnlinePct = (previousRecord.revenue.online / previousRecord.revenue.total) * 100;
    const prevMarketingPct = (previousRecord.costs.marketing / previousRecord.revenue.total) * 100;

    deltas = {
      revenue: ((revenue.total - previousRecord.revenue.total) / previousRecord.revenue.total) * 100,
      margin: margin - prevMargin,
      foodCost: foodCostPct - prevFoodCostPct,
      onlineDependency: onlineDependencyPct - prevOnlinePct,
      marketing: marketingPct - prevMarketingPct,
      netProfit: prevNetProfit !== 0 ? ((netProfit - prevNetProfit) / Math.abs(prevNetProfit)) * 100 : 0,
      orders: previousRecord.revenue.orders !== 0 ? ((revenue.orders - previousRecord.revenue.orders) / previousRecord.revenue.orders) * 100 : 0
    };
  }

  // Narrative Assembly
  const narrative = {
    health: `The business is currently operating at a ${level} level with a ${margin.toFixed(1)}% net margin.`,
    change: deltas 
      ? `Compared to last month, revenue is ${deltas.revenue > 0 ? 'up' : 'down'} by ${Math.abs(deltas.revenue).toFixed(0)}%, while food cost changed by ${deltas.foodCost.toFixed(1)}pp.`
      : 'This is the initial baseline for the pilot period.',
    action: level === 'Healthy' 
      ? 'Focus on scale and volume to increase total net profit.' 
      : `Prioritize reducing ${driver} to restore the net margin to 18%.`
  };

  const performanceBand: PerformanceMetadata = { level, reason, driver, narrative };

  return {
    revenue: revenue.total,
    costs: totalCosts,
    netProfit,
    margin,
    riskLevel,
    performanceBand,
    foodCostPct,
    staffCostPct,
    onlineDependencyPct,
    dataQuality: currentRecord.dataQualityScore,
    deltas
  };
}
