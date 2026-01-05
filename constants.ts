
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
    insightHistory: [
      {
        month: 'February 2024',
        problems: ['High waste in perishable stock observed.'],
        actions: ['Negotiated new credit terms with vendor "FreshLine".', 'Implemented daily stock audit.'],
        timestamp: '2024-02-28T18:00:00Z'
      }
    ],
    decisionLog: []
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
    insightHistory: [],
    decisionLog: []
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
      menuItems: [
        { name: 'Signature Biryani', price: 450, cost: 120, sold: 850, contribution: 280500, popularityRank: 1, profitRank: 1 },
        { name: 'Butter Chicken', price: 380, cost: 140, sold: 620, contribution: 148800, popularityRank: 2, profitRank: 2 },
        { name: 'Truffle Fries', price: 220, cost: 160, sold: 300, contribution: 18000, popularityRank: 3, profitRank: 4 },
        { name: 'Cold Drink Large', price: 90, cost: 20, sold: 1200, contribution: 84000, popularityRank: 4, profitRank: 3 }
      ],
      dataQualityScore: 95
    },
    {
      clientId: 'c1',
      month: 'February 2024',
      revenue: { total: 1100000, online: 450000, offline: 650000, orders: 1900 },
      costs: { food: 380000, staff: 240000, rent: 150000, utilities: 55000, marketing: 60000, packaging: 25000, discounts: 70000 },
      topItems: ['Signature Biryani', 'Butter Chicken'],
      dataQualityScore: 90
    }
  ],
  'c2': [
    {
      clientId: 'c2',
      month: 'March 2024',
      revenue: { total: 920000, online: 780000, offline: 140000, orders: 1800 },
      costs: { food: 310000, staff: 140000, rent: 80000, utilities: 35000, marketing: 95000, packaging: 48000, discounts: 65000 },
      topItems: ['Saffron Pulao', 'Chicken Tikka', 'Garlic Naan'],
      menuItems: [
        { name: 'Saffron Pulao', price: 280, cost: 65, sold: 1100, contribution: 236500, popularityRank: 1, profitRank: 1 },
        { name: 'Chicken Tikka', price: 320, cost: 110, sold: 400, contribution: 84000, popularityRank: 2, profitRank: 2 },
        { name: 'Garlic Naan', price: 60, cost: 12, sold: 1500, contribution: 72000, popularityRank: 3, profitRank: 3 }
      ],
      dataQualityScore: 92
    },
    {
      clientId: 'c2',
      month: 'February 2024',
      revenue: { total: 850000, online: 700000, offline: 150000, orders: 1550 },
      costs: { food: 290000, staff: 130000, rent: 80000, utilities: 32000, marketing: 110000, packaging: 42000, discounts: 95000 },
      topItems: ['Saffron Pulao', 'Chicken Tikka'],
      dataQualityScore: 88
    }
  ]
};
