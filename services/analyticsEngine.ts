
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

  // Granular Menu Analysis
  let bestItem: MenuItem | undefined;
  let worstItem: MenuItem | undefined;

  if (menuItems.length > 0) {
    const sortedByProfit = [...menuItems].sort((a, b) => b.contribution - a.contribution);
    const sortedByEfficiency = [...menuItems].sort((a, b) => (a.cost/a.price) - (b.cost/b.price));
    
    bestItem = sortedByProfit[0];
    worstItem = sortedByEfficiency[sortedByEfficiency.length - 1];
  }

  // Metadata Classification
  let level: PerformanceBandLevel = 'Healthy';
  let reason = 'Operations are within healthy industry bands.';
  let driver = 'Balanced revenue/cost mix.';
  let riskLevel: RiskLevel = 'Low';

  // DISCOUNT LEAKAGE DETECTION
  const isHighDiscount = discountPct > 10;

  if (margin < 8 || foodCostPct > 36) {
    level = 'Dangerous';
    riskLevel = 'High';
    reason = margin < 8 ? 'Net margin is in the critical danger zone.' : 'Food cost is cannibalizing all profits.';
    driver = isHighDiscount ? 'Discount Burn' : (foodCostPct > 36 ? 'Procurement & Waste' : 'High Fixed Overheads');
  } else if (margin < 15 || foodCostPct > 33 || onlineDependencyPct > 60 || isHighDiscount) {
    level = 'Weak';
    riskLevel = 'Medium';
    reason = isHighDiscount ? `Discount burn (${discountPct.toFixed(1)}%) is eroding your base margin.` : (margin < 15 ? 'Profitability is trailing the target.' : 'External dependency is high.');
    driver = isHighDiscount ? 'Revenue Leakage' : (onlineDependencyPct > 60 ? 'Platform Commissions' : 'Menu Costing');
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

  // ATTENTION SCORE (Priority Metric)
  const attentionScore = Math.min(100, 
    (100 - currentRecord.dataQualityScore) * 0.4 + 
    (riskLevel === 'High' ? 40 : riskLevel === 'Medium' ? 15 : 0) + 
    (isHighDiscount ? 15 : 0) +
    (Math.abs(deltas?.margin || 0) > 3 ? 20 : 0)
  );

  const narrative = {
    health: `The business is currently operating at a ${level} level. Net margin is ${margin.toFixed(1)}%.`,
    change: isHighDiscount 
      ? `Promotional spending is high at ${discountPct.toFixed(1)}% of revenue. Every ₹100 earned is losing ₹${discountPct.toFixed(0)} to discounts.`
      : (bestItem 
        ? `${bestItem.name} is your top anchor (₹${bestItem.contribution.toLocaleString()} profit contribution), while ${worstItem?.name} is your highest cost-drag item.`
        : 'Initial pilot baseline created.'),
    action: isHighDiscount 
      ? 'Audit platform-wide "Auto-Apply" coupons. Target a discount ceiling of 7% to recover margin.'
      : (worstItem && (worstItem.cost/worstItem.price) > 0.45
        ? `Audit the preparation cost of ${worstItem.name} immediately; it is currently cannibalizing your margin.`
        : level === 'Healthy' 
          ? 'Increase marketing spend on high-margin items to scale profit.' 
          : `Address ${driver} issues to restore health.`)
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
    attentionScore,
    bestItem,
    worstItem,
    deltas
  };
}
