
import { Client, MonthlyRecord, Benchmark } from './types';

export const BENCHMARKS: Benchmark = {
  foodCostPct: { healthy: [28, 33], label: 'Food Cost (COGS)' },
  staffCostPct: { healthy: [18, 24], label: 'Staffing/Labor' },
  netMargin: { healthy: [15, 25], label: 'Net Profit Margin' },
  marketingPct: { healthy: [3, 7], label: 'Marketing Spend' }
};

export const MOCK_CLIENTS: Client[] = [
  {
    id: 'c1',
    name: 'Paradise Heights',
    type: 'Hybrid',
    city: 'Hyderabad',
    cuisine: 'Mughlai',
    pricingLevel: 'High',
    status: 'active',
    startMonth: 'Jan 2024',
    lastUpdatedAt: '2024-03-20T10:00:00Z',
    insightHistory: []
  },
  {
    id: 'c2',
    name: 'Saffron Cloud',
    type: 'Cloud',
    city: 'Hyderabad',
    cuisine: 'North Indian',
    pricingLevel: 'Mid',
    status: 'pilot',
    startMonth: 'Feb 2024',
    lastUpdatedAt: '2024-03-18T14:30:00Z',
    insightHistory: []
  }
];

export const MOCK_RECORDS: Record<string, MonthlyRecord[]> = {
  'c1': [
    {
      clientId: 'c1',
      month: 'March 2024',
      revenue: { total: 1250000, online: 550000, offline: 700000, orders: 2200 },
      costs: { food: 420000, staff: 260000, rent: 150000, utilities: 60000, marketing: 85000, packaging: 30000, discounts: 80000 },
      topItems: ['Signature Biryani', 'Butter Chicken', 'Truffle Fries'],
      dataQualityScore: 95
    },
    {
      clientId: 'c1',
      month: 'February 2024',
      revenue: { total: 1100000, online: 350000, offline: 750000, orders: 1900 },
      costs: { food: 310000, staff: 240000, rent: 150000, utilities: 52000, marketing: 50000, packaging: 22000, discounts: 65000 },
      topItems: ['Signature Biryani', 'Butter Chicken', 'Dal Makhani'],
      dataQualityScore: 90
    }
  ],
  'c2': [
    {
      clientId: 'c2',
      month: 'March 2024',
      revenue: { total: 850000, online: 750000, offline: 100000, orders: 1500 },
      costs: { food: 290000, staff: 120000, rent: 80000, utilities: 30000, marketing: 120000, packaging: 45000, discounts: 90000 },
      topItems: ['Saffron Pulao', 'Chicken Tikka', 'Garlic Naan'],
      dataQualityScore: 85
    }
  ]
};
