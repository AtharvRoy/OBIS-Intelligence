import React from 'react';
import { StatCard } from './StatCard';
import { 
  ShieldAlert,
  Target,
  TrendingUp,
  TrendingDown,
  LayoutGrid,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Activity,
  Zap,
  CheckCircle2,
  FileText,
  Lightbulb,
  ShieldCheck,
  ChevronRight,
  Box,
  Users,
  Utensils,
  Map
} from 'lucide-react';
import { BusinessSummary } from '../types';
import { BENCHMARKS } from '../constants';

interface AnalystConsoleProps {
  summary: BusinessSummary;
  meetingMode: boolean;
}

export const AnalystConsole: React.FC<AnalystConsoleProps> = ({ summary, meetingMode }) => {
  const { performanceBand, deltas } = summary;

  const DeltaBadge = ({ value, label, invert = false }: { value?: number, label: string, invert?: boolean }) => {
    if (value === undefined || Math.abs(value) < 0.1) return null;
    const isPositiveChange = value > 0;
    const isGood = invert ? !isPositiveChange : isPositiveChange;
    const Icon = isPositiveChange ? ArrowUpRight : ArrowDownRight;
    const colorClass = isGood ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50';
    
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${colorClass} mt-1`}>
        <Icon className="w-3 h-3" />
        {isPositiveChange ? '+' : ''}{value.toFixed(1)}% {label}
      </div>
    );
  };

  const getBandStyles = (level: string) => {
    if (level === 'Dangerous') return 'bg-rose-500 text-white';
    if (level === 'Weak') return 'bg-amber-500 text-white';
    return 'bg-emerald-500 text-white';
  };

  const getStrategicTactics = (driver: string) => {
    const tactics = {
      'Procurement & Waste': [
        { title: 'Inventory Tightening', desc: 'Implement a "First-In-First-Out" audit on the top 5 raw ingredients.', icon: Box },
        { title: 'Portion Control', desc: 'Standardize plating for high-volume items to ensure consistent COGS.', icon: Utensils }
      ],
      'High Fixed Overheads': [
        { title: 'Utility Optimization', desc: 'Audit off-peak power usage; target a 15% reduction.', icon: Zap },
        { title: 'Rent-to-Revenue Audit', desc: 'Review lease terms vs. current market rates.', icon: LayoutGrid }
      ],
      'Platform Commissions': [
        { title: 'Direct Order Push', desc: 'Launch an in-house delivery incentive to migrate 10% of traffic.', icon: Target },
        { title: 'Menu Re-engineering', desc: 'Adjust aggregator prices by 4% on mid-range items.', icon: TrendingUp }
      ],
      'Menu Costing': [
        { title: 'Profit Ranking', desc: 'Identify "Puzzles" and move them to prime visual spots.', icon: Lightbulb },
        { title: 'Ingredient Consolidation', desc: 'Remove items requiring unique low-volume ingredients.', icon: Box }
      ],
      'Balanced revenue/cost mix.': [
        { title: 'Volume Scaling', desc: 'Invest 2% of profit into targeted local marketing.', icon: TrendingUp },
        { title: 'Retention Focus', desc: 'Deploy a loyalty-based program for top 50 frequency customers.', icon: Users }
      ]
    };
    return tactics[driver as keyof typeof tactics] || tactics['Balanced revenue/cost mix.'];
  };

  if (meetingMode) {
    const tactics = getStrategicTactics(performanceBand.driver);
    return (
      <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 max-w-5xl mx-auto pb-20">
        <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Map className="w-5 h-5 text-blue-600" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Meeting Narrative Flow</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Business Health', 'What Changed', 'Why It Matters', 'Action Roadmap'].map((step, i) => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-white">
                <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm text-slate-900 font-black text-xs">{i+1}</div>
                <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-tight">{step}</span>
              </div>
            ))}
          </div>
        </section>

        <section id="health" className="relative group">
          <div className={`rounded-[3.5rem] p-14 transition-all shadow-2xl ${getBandStyles(performanceBand.level)} relative overflow-hidden`}>
            <div className="absolute top-0 right-0 p-10 opacity-10"><Activity className="w-40 h-40" /></div>
            <div className="relative z-10 max-w-3xl">
              <div className="flex items-center gap-3 mb-8 opacity-80">
                <ShieldCheck className="w-6 h-6" />
                <p className="font-black text-xs uppercase tracking-widest">Performance Assessment</p>
              </div>
              <h2 className="text-4xl lg:text-6xl font-black tracking-tight leading-[1.1] mb-6">{performanceBand.narrative.health}</h2>
              <div className="inline-flex items-center gap-2 px-6 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30 text-xs font-black uppercase tracking-widest">Priority Driver: {performanceBand.driver}</div>
            </div>
          </div>
        </section>

        <section id="roadmap" className="relative">
          <div className="bg-slate-950 text-white p-16 lg:p-24 rounded-[5rem] shadow-2xl relative overflow-hidden">
            <div className="max-w-4xl relative z-10">
              <header className="space-y-8 mb-20">
                <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase tracking-[0.3em]">
                  <CheckCircle2 className="w-4 h-4" /> Recommended Executive Action
                </div>
                <h3 className="text-5xl lg:text-7xl font-black tracking-tighter leading-[0.95]">{performanceBand.narrative.action}</h3>
              </header>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-16 border-t border-slate-800/60">
                {tactics.map((tactic, idx) => (
                  <div key={idx} className="flex flex-col gap-6 p-10 rounded-[3rem] bg-slate-900/50 border border-slate-800/50">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center"><tactic.icon className="w-6 h-6 text-slate-400" /></div>
                    <div className="space-y-3">
                      <h4 className="font-black text-2xl text-slate-100 tracking-tight">{tactic.title}</h4>
                      <p className="text-slate-500 text-lg leading-relaxed font-medium">{tactic.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-500">
      <div className={`rounded-[3rem] p-12 flex flex-col md:flex-row md:items-center justify-between gap-10 transition-all shadow-2xl ${getBandStyles(performanceBand.level)}`}>
        <div className="space-y-3 max-w-xl">
          <div className="flex items-center gap-2 opacity-80">
            <Activity className="w-4 h-4" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em]">Intelligence Snapshot</p>
          </div>
          <h2 className="text-6xl font-black tracking-tighter uppercase">{performanceBand.level}</h2>
          <p className="text-xl font-medium opacity-95 leading-relaxed">{performanceBand.narrative.health}</p>
        </div>
        <div className="bg-white/20 backdrop-blur-xl px-10 py-6 rounded-[2rem] border border-white/20 shadow-inner text-center">
            <p className="text-[10px] font-black uppercase opacity-70 tracking-widest mb-1">Attention Score</p>
            <p className="text-4xl font-black">{summary.attentionScore.toFixed(0)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard 
          label="Revenue Hub" 
          value={`₹${(summary.revenue / 100000).toFixed(1)}L`} 
          subValue={deltas ? `Growth: ${deltas.revenue.toFixed(0)}%` : "Baseline Period"}
          icon={<TrendingUp className="w-5 h-5" />}
          trend={deltas ? { value: deltas.revenue, isGood: deltas.revenue >= 0, type: 'percentage' } : undefined}
        />
        <StatCard 
          label="Food/COGS" 
          value={`${summary.foodCostPct.toFixed(0)}%`} 
          subValue={summary.foodCostPct <= 33 ? "Safe Zone" : "Alert Zone"}
          color={summary.foodCostPct > 33 ? 'red' : 'green'}
          icon={<Target className="w-5 h-5" />}
          trend={deltas ? { value: deltas.foodCost, isGood: deltas.foodCost <= 0, type: 'points' } : undefined}
        />
        <StatCard 
          label="Dependency" 
          value={`${summary.onlineDependencyPct.toFixed(0)}%`} 
          subValue="Online Sales Mix"
          color={summary.onlineDependencyPct > 55 ? 'orange' : 'blue'}
          icon={<LayoutGrid className="w-5 h-5" />}
        />
        <StatCard 
          label="Resilience" 
          value={summary.structuralResilience} 
          subValue="Operational Health"
          color={summary.structuralResilience === 'Healthy' ? 'green' : 'red'}
          icon={<ShieldCheck className="w-5 h-5" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white p-12 rounded-[3rem] border border-slate-200 shadow-sm">
          <h3 className="text-2xl font-black mb-10 flex items-center gap-3 text-slate-900">
            <Activity className="w-6 h-6 text-blue-600" /> Performance Benchmarks
          </h3>
          <div className="space-y-8">
            {[
              { label: BENCHMARKS.foodCostPct.label, val: summary.foodCostPct, range: BENCHMARKS.foodCostPct.healthy, invert: true },
              { label: BENCHMARKS.staffCostPct.label, val: summary.staffCostPct, range: BENCHMARKS.staffCostPct.healthy, invert: true },
              { label: BENCHMARKS.netMargin.label, val: summary.margin, range: BENCHMARKS.netMargin.healthy }
            ].map((b, i) => {
              const isSafe = b.invert ? b.val <= b.range[1] : b.val >= b.range[0];
              return (
                <div key={i} className="space-y-4">
                  <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-slate-400">
                    <span>{b.label}</span>
                    <span className={isSafe ? 'text-emerald-600' : 'text-rose-600'}>{isSafe ? 'Target Met' : 'Action Required'}</span>
                  </div>
                  <div className="h-4 bg-slate-100 rounded-full relative overflow-hidden">
                    <div className={`h-full transition-all ${isSafe ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: `${Math.min(100, (b.val/50)*100)}%` }} />
                  </div>
                  <p className="text-xs font-bold text-slate-500">{b.val.toFixed(1)}% vs {b.range[0]}-{b.range[1]}% Target</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white p-12 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-2xl font-black mb-8 flex items-center gap-3 text-slate-900"><Lightbulb className="w-6 h-6 text-blue-600" /> Narrative Synthesis</h3>
          <div className="space-y-6 flex-1">
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Core Observation</p>
              <p className="text-sm font-bold text-slate-700 leading-relaxed">{performanceBand.narrative.change}</p>
            </div>
            <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100">
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-3">Strategic Mandate</p>
              <p className="text-sm font-black text-blue-700 leading-relaxed">{performanceBand.narrative.action}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};