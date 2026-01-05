import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { StatCard } from './StatCard';
import { 
  TrendingUp, CreditCard, PieChart as PieIcon, AlertCircle, 
  IndianRupee, LayoutGrid, Activity, ShieldCheck, ArrowUpRight, ArrowDownRight, Zap, Tag, Info, Users, Megaphone
} from 'lucide-react';
import { BusinessSummary, RevenueData, CostCategory } from '../types';
import { BENCHMARKS } from '../constants';

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

  const isNetMarginSafe = summary.margin >= BENCHMARKS.netMargin.healthy[0];
  const discountVal = costs.find(c => c.name === 'Discounts')?.value || 0;
  const discountBurn = (discountVal / summary.revenue) * 100;

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard 
          label="Gross Revenue" 
          value={formatCurrency(summary.revenue)} 
          subValue={summary.deltas ? `vs Last Month: ₹${((summary.revenue * (summary.deltas.revenue / 100)) / 100000).toFixed(1)}L swing` : "Baseline Period"}
          icon={<IndianRupee className="w-5 h-5" />}
          trend={summary.deltas ? {
            value: summary.deltas.revenue,
            isGood: summary.deltas.revenue >= 0,
            type: 'percentage'
          } : undefined}
        />
        <StatCard 
          label="Net Profit" 
          value={formatCurrency(summary.netProfit)} 
          subValue={`${summary.margin.toFixed(1)}% Margin`}
          color={isNetMarginSafe ? "green" : "red"}
          icon={<TrendingUp className="w-5 h-5" />}
          trend={summary.deltas ? {
            value: summary.deltas.netProfit,
            isGood: summary.deltas.netProfit >= 0,
            type: 'percentage'
          } : undefined}
          benchmarkStatus={{
            isSafe: isNetMarginSafe,
            label: isNetMarginSafe ? "Healthy Margin" : "Low Margin Alert"
          }}
        />
        <StatCard 
          label="Food Cost Pct" 
          value={`${summary.foodCostPct.toFixed(1)}%`} 
          subValue={`Target: ${BENCHMARKS.foodCostPct.healthy[0]}-${BENCHMARKS.foodCostPct.healthy[1]}%`}
          color={summary.foodCostPct > BENCHMARKS.foodCostPct.healthy[1] ? "red" : "green"}
          icon={<Tag className="w-5 h-5" />}
          trend={summary.deltas ? {
            value: summary.deltas.foodCost,
            isGood: summary.deltas.foodCost <= 0,
            type: 'points'
          } : undefined}
          benchmarkStatus={{
            isSafe: summary.foodCostPct <= BENCHMARKS.foodCostPct.healthy[1],
            label: summary.foodCostPct <= BENCHMARKS.foodCostPct.healthy[1] ? "Efficient COGS" : "Cost Leakage"
          }}
        />
        <StatCard 
          label="Data Quality" 
          value={`${summary.dataQuality}%`} 
          subValue="Confidence Level"
          color={summary.dataQuality > 80 ? 'blue' : 'red'}
          icon={<Activity className="w-5 h-5" />}
        />
      </div>

      <section className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden min-h-[160px]">
        <div className="absolute top-0 right-0 p-12 opacity-5"><Zap className="w-32 h-32" /></div>
        <div className="relative z-10">
          <h3 className="text-sm font-black uppercase tracking-[0.3em] text-blue-400 mb-8 flex items-center gap-3">
            <Activity className="w-4 h-4" /> Performance Momentum (MoM Shifts)
          </h3>
          {summary.deltas ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
              {[
                { label: 'Revenue', val: summary.deltas.revenue, unit: '%', isGood: summary.deltas.revenue >= 0, icon: IndianRupee },
                { label: 'Profit', val: summary.deltas.netProfit, unit: '%', isGood: summary.deltas.netProfit >= 0, icon: TrendingUp },
                { label: 'Margin', val: summary.deltas.margin, unit: 'pp', isGood: summary.deltas.margin >= 0, icon: Activity },
                { label: 'Food Cost', val: summary.deltas.foodCost, unit: 'pp', isGood: summary.deltas.foodCost <= 0, icon: Tag },
                { label: 'Staffing', val: summary.deltas.staffCost, unit: 'pp', isGood: summary.deltas.staffCost <= 0, icon: Users },
                { label: 'Marketing', val: summary.deltas.marketing, unit: 'pp', isGood: summary.deltas.marketing <= 0, icon: Megaphone },
              ].map((m, idx) => (
                <div key={idx} className="space-y-2 p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <m.icon className="w-3 h-3 text-slate-500" />
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{m.label}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xl font-black ${m.isGood ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {m.val > 0 ? '+' : ''}{m.val.toFixed(1)}{m.unit}
                    </span>
                    {Math.abs(m.val) > 0.1 && (m.isGood ? <ArrowUpRight className="w-4 h-4 text-emerald-400" /> : <ArrowDownRight className="w-4 h-4 text-rose-400" />)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-4 text-slate-400">
               <Info className="w-6 h-6" />
               <p className="font-bold">Momentum tracking will activate once you add data for a second consecutive month.</p>
            </div>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black flex items-center gap-3">
              <LayoutGrid className="w-6 h-6 text-blue-500" />
              Channel Performance
            </h3>
            {summary.deltas && (
              <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${summary.deltas.onlineDependency > 0 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                Online Drift: {summary.deltas.onlineDependency > 0 ? '+' : ''}{summary.deltas.onlineDependency.toFixed(1)}pp
              </div>
            )}
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} />
                <Tooltip 
                  formatter={(value: number) => `₹${value.toLocaleString()}`}
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 800 }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 700 }} />
                <Bar dataKey="Gross Revenue" fill="#93c5fd" radius={[10, 10, 0, 0]} />
                <Bar dataKey="Net Revenue" fill="#3b82f6" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black flex items-center gap-3">
              <PieIcon className="w-6 h-6 text-emerald-500" />
              Spend Allocation
            </h3>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={costPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {costPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => `₹${value.toLocaleString()}`}
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 800 }}
                />
                <Legend layout="vertical" align="right" verticalAlign="middle" iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 700, paddingLeft: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};