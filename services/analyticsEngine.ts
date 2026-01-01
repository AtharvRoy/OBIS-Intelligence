
import { MonthlyRecord, BusinessSummary, RiskLevel, PerformanceMetadata, PerformanceBandLevel, MenuItem } from '../types';

export function runAnalyticsEngine(currentRecord: MonthlyRecord, previousRecord?: MonthlyRecord): BusinessSummary {
  const { revenue, costs, menuItems = [] } = currentRecord;
  const totalCosts = Object.values(costs).reduce((a, b) => a + b, 0);
  const netProfit = revenue.total - totalCosts;
  const margin = (netProfit / revenue.total) * 100;
  
  const foodCostPct = (costs.food / revenue.total) * 100;
  const staffCostPct = (costs.staff / revenue.total) * 100;
  const marketingPct = (costs.marketing / revenue.total) * 100;
  const onlineDependencyPct = (revenue.online / revenue.total) * 100;
  const discountPct = (costs.discounts / revenue.total) * 100;

  // --- MENU INTELLIGENCE CALCULATIONS ---
  // Ensure we have ranks calculated for the UI
  const sortedByPopularity = [...menuItems].sort((a, b) => b.sold - a.sold);
  const sortedByProfit = [...menuItems].sort((a, b) => b.contribution - a.contribution);
  
  const rankedMenuItems: MenuItem[] = menuItems.map(item => ({
    ...item,
    popularityRank: sortedByPopularity.findIndex(i => i.name === item.name) + 1,
    profitRank: sortedByProfit.findIndex(i => i.name === item.name) + 1
  }));

  let bestItem: MenuItem | undefined = rankedMenuItems.find(i => i.profitRank === 1);
  let worstItem: MenuItem | undefined = [...rankedMenuItems].sort((a, b) => (a.cost/a.price) - (b.cost/b.price)).pop();

  // --- DUAL AXIS HEALTH ANALYSIS ---
  
  // 1. Financial Health (Margin Focused)
  let financialHealth: PerformanceBandLevel = 'Healthy';
  if (margin < 10) financialHealth = 'Dangerous';
  else if (margin < 18) financialHealth = 'Weak';

  // 2. Structural Resilience (Dependencies & Operational Costs)
  let structuralResilience: PerformanceBandLevel = 'Healthy';
  if (onlineDependencyPct > 70 || foodCostPct > 36 || currentRecord.dataQualityScore < 70) {
    structuralResilience = 'Dangerous';
  } else if (onlineDependencyPct > 55 || foodCostPct > 33 || discountPct > 10) {
    structuralResilience = 'Weak';
  }

  // Combined Performance Band (Legacy mapping for UI)
  let level: PerformanceBandLevel = financialHealth === 'Dangerous' || structuralResilience === 'Dangerous' ? 'Dangerous' : 
                                    (financialHealth === 'Weak' || structuralResilience === 'Weak' ? 'Weak' : 'Healthy');

  let reason = 'Operations are within healthy industry bands.';
  let driver = 'Balanced revenue/cost mix.';
  let riskLevel: RiskLevel = 'Low';

  const isHighDiscount = discountPct > 10;

  if (level === 'Dangerous') {
    riskLevel = 'High';
    reason = margin < 10 ? 'Net margin is in the critical danger zone.' : 'Structural dependencies are cannibalizing profit.';
    driver = isHighDiscount ? 'Discount Burn' : (foodCostPct > 36 ? 'Procurement & Waste' : 'High Fixed Overheads');
  } else if (level === 'Weak') {
    riskLevel = 'Medium';
    reason = isHighDiscount ? `Discount burn (${discountPct.toFixed(1)}%) is eroding your base margin.` : 'Efficiency optimization required.';
    driver = isHighDiscount ? 'Revenue Leakage' : (onlineDependencyPct > 55 ? 'Platform Commissions' : 'Menu Costing');
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

  const attentionScore = Math.min(100, 
    (100 - currentRecord.dataQualityScore) * 0.4 + 
    (riskLevel === 'High' ? 40 : riskLevel === 'Medium' ? 15 : 0) + 
    (isHighDiscount ? 15 : 0) +
    (Math.abs(deltas?.margin || 0) > 3 ? 20 : 0)
  );

  const narrative = {
    health: `Business is ${financialHealth} financially and ${structuralResilience} structurally.`,
    change: isHighDiscount 
      ? `Promotional spending is high at ${discountPct.toFixed(1)}% of revenue. This is a primary leakage point.`
      : (bestItem 
        ? `${bestItem.name} is driving ${((bestItem.contribution/revenue.total)*100).toFixed(1)}% of total revenue contribution.`
        : 'Initial pilot baseline created.'),
    action: isHighDiscount 
      ? 'Audit platform-wide "Auto-Apply" coupons. Set a hard ceiling of 8% for promotional burn.'
      : (worstItem && (worstItem.cost/worstItem.price) > 0.45
        ? `Audit prep waste for ${worstItem.name} immediately; margin is ${((1 - worstItem.cost/worstItem.price)*100).toFixed(1)}%.`
        : level === 'Healthy' 
          ? 'Maintain current procurement standards while scaling marketing.' 
          : `Prioritize ${driver} optimization to move health to the next band.`)
  };

  return {
    revenue: revenue.total,
    costs: totalCosts,
    netProfit,
    margin,
    riskLevel,
    financialHealth,
    structuralResilience,
    performanceBand: { level, reason, driver, narrative },
    foodCostPct,
    staffCostPct,
    onlineDependencyPct,
    dataQuality: currentRecord.dataQualityScore,
    attentionScore,
    bestItem,
    worstItem,
    deltas
  };
}
