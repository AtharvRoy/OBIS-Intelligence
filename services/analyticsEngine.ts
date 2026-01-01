
import { MonthlyRecord, BusinessSummary, RiskLevel, PerformanceMetadata, PerformanceBandLevel, MenuItem } from '../types';

export function runAnalyticsEngine(currentRecord: MonthlyRecord, previousRecord?: MonthlyRecord): BusinessSummary {
  // Safe extraction with deep defaults
  const revenue = currentRecord?.revenue || { total: 0, online: 0, offline: 0, orders: 0 };
  const costs = currentRecord?.costs || { food: 0, staff: 0, rent: 0, utilities: 0, marketing: 0, packaging: 0, discounts: 0 };
  const menuItems = currentRecord?.menuItems || [];
  
  // Safe normalization of all inputs to prevent NaN
  const totalRev = Math.max(0.01, Number(revenue.total) || 0);
  const totalCosts = Object.values(costs).reduce((a, b) => a + (Number(b) || 0), 0);
  const netProfit = totalRev - totalCosts;
  const margin = (netProfit / totalRev) * 100;
  
  const foodCostPct = ((Number(costs.food) || 0) / totalRev) * 100;
  const staffCostPct = ((Number(costs.staff) || 0) / totalRev) * 100;
  const marketingPct = ((Number(costs.marketing) || 0) / totalRev) * 100;
  const onlineDependencyPct = ((Number(revenue.online) || 0) / totalRev) * 100;
  const discountPct = ((Number(costs.discounts) || 0) / totalRev) * 100;

  // --- MENU INTELLIGENCE: DYNAMIC RANKING PIPELINE ---
  const processedItems: MenuItem[] = menuItems.map(item => {
    const p = Number(item.price) || 0;
    const c = Number(item.cost) || 0;
    const s = Number(item.sold) || 0;
    const contribution = (p - c) * s;
    return { 
      ...item, 
      name: item.name || 'Unnamed Item',
      price: p, 
      cost: c, 
      sold: s, 
      contribution,
      popularityRank: 0,
      profitRank: 0
    };
  });

  const sortedByPopularity = [...processedItems].sort((a, b) => b.sold - a.sold);
  const sortedByProfit = [...processedItems].sort((a, b) => b.contribution - a.contribution);
  
  const rankedMenuItems: MenuItem[] = processedItems.map(item => ({
    ...item,
    popularityRank: sortedByPopularity.findIndex(i => i.name === item.name) + 1,
    profitRank: sortedByProfit.findIndex(i => i.name === item.name) + 1
  }));

  const bestItem: MenuItem | undefined = rankedMenuItems.find(i => i.profitRank === 1);
  const worstItem: MenuItem | undefined = [...rankedMenuItems]
    .filter(i => i.price > 0)
    .sort((a, b) => (a.cost / Math.max(0.1, a.price)) - (b.cost / Math.max(0.1, b.price)))
    .pop();

  // --- DUAL AXIS HEALTH ANALYSIS ---
  let financialHealth: PerformanceBandLevel = 'Healthy';
  if (margin < 10) financialHealth = 'Dangerous';
  else if (margin < 18) financialHealth = 'Weak';

  let structuralResilience: PerformanceBandLevel = 'Healthy';
  const dataQuality = Number(currentRecord?.dataQualityScore) || 0;
  
  if (onlineDependencyPct > 70 || foodCostPct > 36 || dataQuality < 70) {
    structuralResilience = 'Dangerous';
  } else if (onlineDependencyPct > 55 || foodCostPct > 33 || discountPct > 10) {
    structuralResilience = 'Weak';
  }

  const level: PerformanceBandLevel = financialHealth === 'Dangerous' || structuralResilience === 'Dangerous' ? 'Dangerous' : 
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
  let deltas = {
    revenue: 0, margin: 0, foodCost: 0, onlineDependency: 0, marketing: 0, netProfit: 0, orders: 0
  };

  if (previousRecord) {
    const prevTotalRev = Math.max(0.01, Number(previousRecord.revenue?.total) || 0);
    const prevTotalCosts = Object.values(previousRecord.costs || {}).reduce((a, b) => a + (Number(b) || 0), 0);
    const prevNetProfit = prevTotalRev - prevTotalCosts;
    const prevMargin = (prevNetProfit / prevTotalRev) * 100;
    const prevFoodCostPct = ((Number(previousRecord.costs?.food) || 0) / prevTotalRev) * 100;
    const prevOnlinePct = ((Number(previousRecord.revenue?.online) || 0) / prevTotalRev) * 100;
    const prevMarketingPct = ((Number(previousRecord.costs?.marketing) || 0) / prevTotalRev) * 100;

    deltas = {
      revenue: ((totalRev - prevTotalRev) / prevTotalRev) * 100,
      margin: margin - prevMargin,
      foodCost: foodCostPct - prevFoodCostPct,
      onlineDependency: onlineDependencyPct - prevOnlinePct,
      marketing: marketingPct - prevMarketingPct,
      netProfit: prevNetProfit !== 0 ? ((netProfit - prevNetProfit) / Math.abs(prevNetProfit)) * 100 : 0,
      orders: previousRecord.revenue?.orders ? ((revenue.orders - previousRecord.revenue.orders) / previousRecord.revenue.orders) * 100 : 0
    };
  }

  const attentionScore = Math.min(100, 
    (100 - dataQuality) * 0.4 + 
    (riskLevel === 'High' ? 40 : riskLevel === 'Medium' ? 15 : 0) + 
    (isHighDiscount ? 15 : 0) +
    (Math.abs(deltas.margin) > 3 ? 20 : 0)
  );

  const narrative = {
    health: `Business is ${financialHealth} financially and ${structuralResilience} structurally.`,
    change: isHighDiscount 
      ? `Promotional spending is high at ${discountPct.toFixed(1)}% of revenue. This is a primary leakage point.`
      : (bestItem 
        ? `${bestItem.name} is driving ${((bestItem.contribution / totalRev) * 100).toFixed(1)}% of total revenue contribution.`
        : 'Initial pilot baseline created.'),
    action: isHighDiscount 
      ? 'Audit platform-wide "Auto-Apply" coupons. Set a hard ceiling of 8% for promotional burn.'
      : (worstItem && (worstItem.cost / Math.max(0.1, worstItem.price)) > 0.45
        ? `Audit prep waste for ${worstItem.name} immediately; margin is ${((1 - worstItem.cost / Math.max(0.1, worstItem.price)) * 100).toFixed(1)}%.`
        : level === 'Healthy' 
          ? 'Maintain current procurement standards while scaling marketing.' 
          : `Prioritize ${driver} optimization to move health to the next band.`)
  };

  return {
    revenue: totalRev,
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
    dataQuality,
    attentionScore,
    bestItem,
    worstItem,
    rankedMenuItems,
    deltas
  };
}
