
import { Client, MonthlyRecord } from './types';

export const MOCK_CLIENTS: Client[] = [
  {
    id: 'c1',
    name: 'Paradise Heights',
    type: 'Hybrid',
    city: 'Hyderabad',
    cuisine: 'Mughlai',
    pricingLevel: 'High',
    status: 'Pilot',
    startMonth: 'Jan 2024'
  },
  {
    id: 'c2',
    name: 'Saffron Cloud',
    type: 'Cloud',
    city: 'Hyderabad',
    cuisine: 'North Indian',
    pricingLevel: 'Mid',
    status: 'Active',
    startMonth: 'Feb 2024'
  }
];

export const MOCK_RECORDS: Record<string, MonthlyRecord> = {
  'c1': {
    clientId: 'c1',
    month: 'March 2024',
    revenue: {
      total: 1250000,
      online: 450000,
      offline: 800000,
      orders: 2200
    },
    costs: {
      food: 375000,
      staff: 240000,
      rent: 150000,
      utilities: 55000,
      marketing: 60000,
      packaging: 25000,
      discounts: 75000
    },
    topItems: ['Signature Biryani', 'Butter Chicken', 'Truffle Fries']
  }
};
