
import React from 'react';
import { StatCard } from './StatCard';
import { 
  AlertTriangle, 
  TrendingDown, 
  Target, 
  Activity, 
  ShieldAlert,
  ArrowUpRight,
  TrendingUp,
  LayoutGrid
} from 'lucide-react';
import { BusinessSummary } from '../types';

interface AnalystConsoleProps {
  summary: BusinessSummary;
  meetingMode: boolean;
}

export const AnalystConsole: React.FC<AnalystConsoleProps> = ({ summary, meetingMode }) => {
  const getBandStyles = (band: string) => {
    if (band === 'Dangerous') return 'bg-rose-500 text-white shadow-rose-200';
    if (band === 'Weak') return 'bg-amber-500 text-white shadow-amber-200';
    return 'bg-emerald-500 text-white shadow-emerald-200';
  };

  const formatCurrency = (val: number) => `₹${(val / 1000).toFixed(0)}k`;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
      {/* Performance Header - Logic Driven */}
      <div className={`rounded-[2.5rem] p-10 flex flex-col md:flex-row md:items-center justify-between gap-8 transition-all shadow-2xl ${getBandStyles(summary.performanceBand)}`}>
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-70">Business Health Index</p>
          <h2 className="text-5xl font-black tracking-tighter">{summary.performanceBand}</h2>
          <p className="text-base font-medium opacity-90">
            {summary.performanceBand === 'Healthy' 
              ? "Operation is within healthy profitability benchmarks."
              : "Action required on cost structures to restore margins."}
          </p>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-white/20 backdrop-blur-md px-8 py-5 rounded-3xl border border-white/20">
            <p className="text-[10px] font-black uppercase opacity-70 tracking-widest mb-1">Net Margin</p>
            <p className="text-3xl font-black tracking-tight">{summary.margin.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      {/* Meeting Mode aware Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Profit Band" 
          value={summary.margin > 15 ? 'Strong' : summary.margin > 10 ? 'Standard' : 'Low'} 
          subValue={meetingMode ? "Benchmark Performance" : `${summary.margin.toFixed(1)}% Net`}
          color={summary.performanceBand === 'Dangerous' ? 'red' : summary.performanceBand === 'Weak' ? 'orange' : 'green'}
          icon={<ShieldAlert className="w-5 h-5" />}
        />
        <StatCard 
          label="Cost Control" 
          value={summary.foodCostPct < 30 ? 'Optimized' : 'Review'} 
          subValue={meetingMode ? "COGS Efficiency" : `${summary.foodCostPct.toFixed(0)}% Food Cost`}
          color={summary.foodCostPct > 35 ? 'red' : 'blue'}
          icon={<Target className="w-5 h-5" />}
        />
        <StatCard 
          label="Revenue Scale" 
          value={meetingMode ? "Consistent" : formatCurrency(summary.revenue)} 
          subValue="Monthly Velocity"
          color="blue"
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <StatCard 
          label="Online Mix" 
          value={summary.onlineDependencyPct > 40 ? 'Heavy' : 'Balanced'} 
          subValue="Channel Dependency"
          color="orange"
          icon={<LayoutGrid className="w-5 h-5" />}
        />
      </div>

      {/* Analyst Leaks - HIDDEN in Meeting Mode */}
      {!meetingMode && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <h3 className="text-2xl font-black mb-8 flex items-center gap-3 text-slate-900">
              <TrendingDown className="w-6 h-6 text-rose-500" />
              Margin Erosion Points
            </h3>
            <div className="space-y-4">
              {[
                { label: 'Unchecked Discounts', impact: 'High', color: 'text-rose-600', bg: 'bg-rose-50' },
                { label: 'Platform Commissions', impact: 'Critical', color: 'text-rose-600', bg: 'bg-rose-50' },
                { label: 'Staff Overtime', impact: 'Minor', color: 'text-slate-400', bg: 'bg-slate-50' }
              ].map((leak, i) => (
                <div key={i} className={`flex items-center justify-between p-5 ${leak.bg} rounded-[1.5rem] border border-black/5`}>
                  <span className="font-bold text-slate-800">{leak.label}</span>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${leak.color}`}>{leak.impact} Impact</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <h3 className="text-2xl font-black mb-8 flex items-center gap-3 text-slate-900">
              <Activity className="w-6 h-6 text-blue-500" />
              Analyst Benchmarks
            </h3>
            <div className="space-y-6">
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Target Net Margin</p>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full transition-all" style={{ width: `${Math.min(100, (summary.margin / 15) * 100)}%` }}></div>
                </div>
                <p className="text-xs font-bold text-slate-500 mt-2 text-right">Target: 15%</p>
              </div>
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Efficiency Gap</p>
                <p className="text-sm font-bold text-slate-700">Currently {Math.abs(summary.foodCostPct - 30).toFixed(1)}% away from ideal food cost target.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Meeting View Strategic Summary */}
      {meetingMode && (
        <div className="bg-slate-900 text-white p-12 rounded-[3rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-10">
            <TrendingUp className="w-48 h-48" />
          </div>
          <h3 className="text-3xl font-black mb-10 relative z-10">Monthly Performance Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
            <div className="space-y-6">
              <div className="flex gap-5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center shrink-0 font-black text-white">01</div>
                <div>
                  <h4 className="font-bold text-xl mb-1">Growth Opportunity</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">Revenue has stabilized. Focus now shifts to optimizing menu contribution rather than just volume.</p>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex gap-5">
                <div className="w-10 h-10 rounded-2xl bg-blue-500 flex items-center justify-center shrink-0 font-black text-white">02</div>
                <div>
                  <h4 className="font-bold text-xl mb-1">Cost Optimization</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">Minor adjustments in procurement can lead to a direct 3% margin improvement next cycle.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
