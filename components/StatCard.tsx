
import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, CheckCircle2, AlertTriangle } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  color?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isGood: boolean;
    type: 'percentage' | 'points';
  };
  benchmarkStatus?: {
    isSafe: boolean;
    label: string;
  };
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, subValue, color = 'blue', icon, trend, benchmarkStatus }) => {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    red: 'bg-rose-50 text-rose-700 border-rose-100',
    orange: 'bg-amber-50 text-amber-700 border-amber-100',
  };

  const renderTrend = () => {
    if (!trend) return null;
    const isZero = Math.abs(trend.value) < 0.1;
    if (isZero) return <span className="flex items-center gap-1 text-slate-400"><Minus className="w-3 h-3" /> 0%</span>;

    const isPositive = trend.value > 0;
    const Icon = isPositive ? ArrowUpRight : ArrowDownRight;
    const colorClass = trend.isGood ? 'text-emerald-600' : 'text-rose-600';
    const sign = isPositive ? '+' : '';
    const unit = trend.type === 'percentage' ? '%' : 'pp';

    return (
      <span className={`flex items-center gap-0.5 font-black text-[10px] ${colorClass} bg-white/60 px-2 py-0.5 rounded-full border border-current/10 shadow-sm`}>
        <Icon className="w-3 h-3" />
        {sign}{trend.value.toFixed(1)}{unit}
      </span>
    );
  };

  return (
    <div className={`p-8 rounded-[2.5rem] border ${colorClasses[color] || colorClasses.blue} shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 group relative overflow-hidden`}>
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">{label}</span>
          {benchmarkStatus && (
            <div className={`flex items-center gap-1 text-[8px] font-black uppercase tracking-widest mt-0.5 ${benchmarkStatus.isSafe ? 'text-emerald-600' : 'text-rose-600'}`}>
              {benchmarkStatus.isSafe ? <CheckCircle2 className="w-2.5 h-2.5" /> : <AlertTriangle className="w-2.5 h-2.5" />}
              {benchmarkStatus.label}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {renderTrend()}
          <div className="opacity-40 group-hover:opacity-100 transition-opacity">
            {icon}
          </div>
        </div>
      </div>
      <div className="text-4xl font-black tracking-tighter relative z-10 group-hover:scale-105 transition-transform origin-left">{value}</div>
      {subValue && <div className="text-[10px] mt-3 opacity-60 font-bold uppercase tracking-wider relative z-10">{subValue}</div>}
      
      {/* Decorative background shape */}
      <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-current opacity-[0.03] rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
    </div>
  );
};
