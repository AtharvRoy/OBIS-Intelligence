
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, LineChart, Line 
} from 'recharts';
import { StatCard } from './StatCard';
import { 
  TrendingUp, CreditCard, PieChart as PieIcon, AlertCircle, 
  IndianRupee, Percent, Utensils, LayoutGrid 
} from 'lucide-react';
import { BusinessSummary, RevenueData, CostCategory } from '../types';

interface DashboardProps {
  summary: BusinessSummary;
  revenue: RevenueData[];
  costs: CostCategory[];
}

export const Dashboard: React.FC<DashboardProps> = ({ summary, revenue, costs }) => {
  const formatCurrency = (val: number) => `₹${(val / 100000).toFixed(2)}L`;

  const revenueChartData = revenue.map(r => ({
    name: r.channel,
    'Gross Revenue': r.gross,
    'Net Revenue': r.net
  }));

  const costPieData = costs.map(c => ({
    name: c.name,
    value: c.value
  }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Gross Revenue" 
          value={formatCurrency(summary.revenue)} 
          subValue="Monthly Target: ₹15L"
          icon={<IndianRupee className="w-5 h-5" />}
        />
        <StatCard 
          label="Net Profit" 
          value={formatCurrency(summary.netProfit)} 
          subValue={`${summary.margin}% Margin`}
          color="green"
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <StatCard 
          label="Operating Costs" 
          value={formatCurrency(summary.costs)} 
          subValue={`${((summary.costs / summary.revenue) * 100).toFixed(1)}% of Revenue`}
          color="orange"
          icon={<CreditCard className="w-5 h-5" />}
        />
        <StatCard 
          label="Risk Assessment" 
          value={summary.riskLevel} 
          subValue="Healthy Band"
          color={summary.riskLevel === 'Low' ? 'blue' : 'red'}
          icon={<AlertCircle className="w-5 h-5" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-blue-500" />
              Revenue Channel Breakdown
            </h3>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => `₹${value.toLocaleString()}`}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend />
                <Bar dataKey="Gross Revenue" fill="#93c5fd" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Net Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-emerald-500" />
              Cost Structure Analysis
            </h3>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={costPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {costPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                <Legend layout="vertical" align="right" verticalAlign="middle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
