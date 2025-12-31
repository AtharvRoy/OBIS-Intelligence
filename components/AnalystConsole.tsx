
import React from 'react';
import { StatCard } from './StatCard';
import { 
  AlertTriangle, 
  TrendingDown, 
  Target, 
  Activity, 
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react';
import { BusinessSummary } from '../types';

interface AnalystConsoleProps {
  summary: BusinessSummary;
}

export const AnalystConsole: React.FC<AnalystConsoleProps> = ({ summary }) => {
  const getRiskColor = (level: string) => {
    if (level === 'High') return 'red';
    if (level === 'Medium') return 'orange';
    return 'blue';
  };

  const isFoodCostHigh = summary.foodCostPct > 35;
  const isMarginWeak = summary.margin < 12;

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 rounded-2xl p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Analyst Assessment</span>
            <Activity className="w-3 h-3 text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold">Health Status: <span className={summary.riskLevel === 'High' ? 'text-rose-400' : 'text-emerald-400'}>{summary.riskLevel} Risk</span></h2>
        </div>
        
        <div className="flex gap-3">
          {isFoodCostHigh && (
            <div className="bg-rose-500/10 border border-rose-500/20 px-4 py-2 rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span className="text-xs font-bold text-rose-300">Food Cost Spike</span>
            </div>
          )}
          {isMarginWeak && (
            <div className="bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-xl flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-amber-300">Margin Erosion</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Net Margin" 
          value={`${summary.margin.toFixed(1)}%`} 
          subValue={summary.margin > 15 ? 'Healthy Range' : 'Below Benchmark'}
          color={getRiskColor(summary.riskLevel)}
          icon={<ShieldAlert className="w-5 h-5" />}
        />
        <StatCard 
          label="Food Cost %" 
          value={`${summary.foodCostPct.toFixed(1)}%`} 
          subValue="Target: < 30%"
          color={summary.foodCostPct > 35 ? 'red' : 'blue'}
          icon={<Target className="w-5 h-5" />}
        />
        <StatCard 
          label="Net Profit" 
          value={`₹${(summary.netProfit / 1000).toFixed(0)}k`} 
          subValue="Monthly Contribution"
          color="green"
          icon={<ArrowUpRight className="w-5 h-5" />}
        />
        <StatCard 
          label="Dependency" 
          value="Medium" 
          subValue="Online vs Offline"
          color="blue"
          icon={<Activity className="w-5 h-5" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-rose-500" />
            Leaking Points
          </h3>
          <div className="space-y-4">
            {[
              { label: 'Unchecked Discounts', status: 'High Impact', color: 'text-rose-600' },
              { label: 'Packaging Waste', status: 'Minor', color: 'text-slate-400' },
              { label: 'Channel Commission', status: 'Growing', color: 'text-amber-600' }
            ].map((leak, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="font-semibold text-slate-700">{leak.label}</span>
                <span className={`text-xs font-bold ${leak.color}`}>{leak.status}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-500" />
            Profit Targets
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <p className="text-xs font-bold text-emerald-600 uppercase mb-1">Action Priority</p>
              <p className="text-sm font-bold text-emerald-900 leading-tight">Increase net profit by ₹45k next month by reducing food cost to 28%.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
