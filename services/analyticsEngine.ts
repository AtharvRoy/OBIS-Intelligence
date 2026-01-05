import { MonthlyRecord, BusinessSummary, RiskLevel, PerformanceMetadata, PerformanceBandLevel, MenuItem } from '../types';

export function runAnalyticsEngine(currentRecord: MonthlyRecord, previousRecord?: MonthlyRecord): BusinessSummary {
  const { revenue, costs, menuItems = [] } = currentRecord;
  const totalCosts = Object.values(costs).reduce((a, b) => a + Number(b), 0);
  const netProfit = revenue.total - totalCosts;
  const margin = (netProfit / revenue.total) * 100;
  
  const foodCostPct = (costs.food / revenue.total) * 100;
  const staffCostPct = (costs.staff / revenue.total) * 100;
  const marketingPct = (costs.marketing / revenue.total) * 100;
  const onlineDependencyPct = (revenue.online / revenue.total) * 100;
  const discountPct = (costs.discounts / revenue.total) * 100;

  // --- MENU INTELLIGENCE ---
  const processedItems: MenuItem[] = menuItems.map(item => {
    const price = Number(item.price) || 0;
    const cost = Number(item.cost) || 0;
    const sold = Number(item.sold) || 0;
    const contribution = (price - cost) * sold;
    return { ...item, price, cost, sold, contribution };
  });

  const sortedByPopularity = [...processedItems].sort((a, b) => b.sold - a.sold);
  const sortedByProfit = [...processedItems].sort((a, b) => b.contribution - a.contribution);
  
  const rankedMenuItems: MenuItem[] = processedItems.map(item => ({
    ...item,
    popularityRank: sortedByPopularity.findIndex(i => i.name === item.name) + 1,
    profitRank: sortedByProfit.findIndex(i => i.name === item.name) + 1
  }));

  let bestItem: MenuItem | undefined = rankedMenuItems.find(i => i.profitRank === 1);
  let worstItem: MenuItem | undefined = [...rankedMenuItems].sort((a, b) => (a.cost/a.price) - (b.cost/b.price)).pop();

  // --- HEALTH ANALYSIS ---
  let financialHealth: PerformanceBandLevel = 'Healthy';
  if (margin < 10) financialHealth = 'Dangerous';
  else if (margin < 18) financialHealth = 'Weak';

  let structuralResilience: PerformanceBandLevel = 'Healthy';
  if (onlineDependencyPct > 70 || foodCostPct > 36 || currentRecord.dataQualityScore < 70) {
    structuralResilience = 'Dangerous';
  } else if (onlineDependencyPct > 55 || foodCostPct > 33 || discountPct > 10) {
    structuralResilience = 'Weak';
  }

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

  // --- DELTA CALCULATIONS ---
  let deltas;
  if (previousRecord) {
    const prevTotalCosts = Object.values(previousRecord.costs).reduce((a, b) => a + Number(b), 0);
    const prevNetProfit = previousRecord.revenue.total - prevTotalCosts;
    const prevMargin = (prevNetProfit / previousRecord.revenue.total) * 100;
    const prevFoodCostPct = (previousRecord.costs.food / previousRecord.revenue.total) * 100;
    const prevStaffCostPct = (previousRecord.costs.staff / previousRecord.revenue.total) * 100;
    const prevOnlinePct = (previousRecord.revenue.online / previousRecord.revenue.total) * 100;
    const prevMarketingPct = (previousRecord.costs.marketing / previousRecord.revenue.total) * 100;

    deltas = {
      revenue: ((revenue.total - previousRecord.revenue.total) / previousRecord.revenue.total) * 100,
      margin: margin - prevMargin,
      foodCost: foodCostPct - prevFoodCostPct,
      staffCost: staffCostPct - prevStaffCostPct,
      onlineDependency: onlineDependencyPct - prevOnlinePct,
      marketing: marketingPct - prevMarketingPct,
      netProfit: prevNetProfit !== 0 ? ((netProfit - prevNetProfit) / Math.abs(prevNetProfit)) * 100 : 0,
      orders: previousRecord.revenue.orders !== 0 ? ((revenue.orders - previousRecord.revenue.orders) / previousRecord.revenue.orders) * 100 : 0
    };
  }

  // --- ATTENTION SCORE ---
  const qualityPenalty = (100 - currentRecord.dataQualityScore) * 0.35;
  const riskPenalty = riskLevel === 'High' ? 35 : riskLevel === 'Medium' ? 15 : 0;
  const discountPenalty = isHighDiscount ? 15 : 0;
  const volatilityPenalty = deltas ? Math.min(15, Math.abs(deltas.margin) * 3 + Math.abs(deltas.onlineDependency) * 1) : 0;

  const attentionScore = Math.min(100, qualityPenalty + riskPenalty + discountPenalty + volatilityPenalty);

  const narrative = {
    health: `Business is ${financialHealth.toLowerCase()} financially and ${structuralResilience.toLowerCase()} structurally. Efficiency index is ${margin.toFixed(0)}%.`,
    change: isHighDiscount 
      ? `Promotional spending is high at ${discountPct.toFixed(1)}% of revenue. Digital platforms are currently capturing a large share of value.`
      : (bestItem 
        ? `${bestItem.name} is the primary profit anchor, contributing ${((bestItem.contribution/revenue.total)*100).toFixed(1)}% of total revenue.`
        : 'Initial performance baseline established.'),
    action: isHighDiscount 
      ? 'Audit all active platform coupons. Cap promotional burn at 8% and prioritize direct-to-consumer loyalty efforts.'
      : (worstItem && (worstItem.cost/worstItem.price) > 0.45
        ? `Immediate audit required for ${worstItem.name}. Current unit margin of ${((1 - worstItem.cost/worstItem.price)*100).toFixed(1)}% is below industry average.`
        : level === 'Healthy' 
          ? 'Operations stable. Focus on scaling marketing spend to 5-7% of revenue to drive new customer acquisition.' 
          : `Prioritize ${driver} optimization to move overall business health to the next efficiency band.`)
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
    marketingPct,
    onlineDependencyPct,
    dataQuality: currentRecord.dataQualityScore,
    attentionScore,
    bestItem,
    worstItem,
    rankedMenuItems,
    deltas
  };
}