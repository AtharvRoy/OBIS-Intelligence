import React from 'react';
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
  Map,
  Layers,
  Sparkles,
  IndianRupee
} from 'lucide-react';
import { StatCard } from './StatCard';
import { BusinessSummary } from '../types';
import { BENCHMARKS } from '../constants';

interface AnalystConsoleProps {
  summary: BusinessSummary;
  meetingMode: boolean;
}

export const AnalystConsole: React.FC<AnalystConsoleProps> = ({ summary, meetingMode }) => {
  const { performanceBand, deltas } = summary;

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
      <div className="space-y-20 animate-in fade-in slide-in-from-bottom-12 duration-1000 max-w-6xl mx-auto pb-32">
        {/* PRESENTATION HEADER */}
        <section className="bg-white p-10 rounded-[3.5rem] border border-slate-200 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="space-y-2">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600 mb-2">Executive Agenda</h3>
              <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Strategic Review</h2>
            </div>
            <div className="flex gap-4">
              {[
                { label: 'Revenue', val: `₹${(summary.revenue / 100000).toFixed(1)}L`, icon: IndianRupee },
                { label: 'Profit', val: `${summary.margin.toFixed(0)}%`, icon: TrendingUp },
                { label: 'Attention', val: summary.attentionScore.toFixed(0), icon: Activity }
              ].map((m, i) => (
                <div key={i} className="px-6 py-4 bg-slate-50 border border-slate-100 rounded-3xl text-center min-w-[120px]">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{m.label}</p>
                  <p className="text-xl font-black text-slate-900">{m.val}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* STEP 1: CURRENT STATE */}
        <section className="relative">
          <div className={`rounded-[4rem] p-16 lg:p-24 transition-all shadow-2xl ${getBandStyles(performanceBand.level)} relative overflow-hidden`}>
            <div className="absolute -top-10 -right-10 opacity-10 rotate-12"><ShieldCheck className="w-80 h-80" /></div>
            <div className="relative z-10 max-w-4xl">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center font-black text-white border border-white/30">1</div>
                <p className="font-black text-xs uppercase tracking-[0.3em]">Business Health Assessment</p>
              </div>
              <h2 className="text-5xl lg:text-8xl font-black tracking-tighter leading-[0.9] mb-10">
                Current Status: <span className="opacity-75">{performanceBand.level}</span>
              </h2>
              <div className="p-10 bg-black/10 backdrop-blur-md rounded-[3rem] border border-white/20">
                <p className="text-2xl lg:text-3xl font-bold leading-tight italic">"{performanceBand.narrative.health}"</p>
              </div>
            </div>
          </div>
        </section>

        {/* STEP 2: NARRATIVE CHANGE */}
        <section className="bg-white rounded-[4rem] p-16 lg:p-24 border border-slate-200 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-16 opacity-[0.03]"><Layers className="w-64 h-64" /></div>
          <div className="max-w-4xl relative z-10">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-900 border border-slate-200">2</div>
              <p className="font-black text-xs uppercase tracking-[0.3em] text-slate-400">Critical Observations</p>
            </div>
            <h3 className="text-4xl lg:text-6xl font-black text-slate-900 tracking-tighter leading-[1] mb-12">
              What has shifted in the business?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="w-16 h-1 bg-blue-600 rounded-full"></div>
                <p className="text-2xl font-medium text-slate-500 leading-relaxed">{performanceBand.narrative.change}</p>
              </div>
              <div className="bg-slate-50 rounded-[3rem] p-10 space-y-4 border border-slate-100">
                <div className="flex items-center gap-3 text-blue-600 font-black text-[10px] uppercase tracking-widest">
                  <Sparkles className="w-4 h-4" /> Root Cause Identified
                </div>
                <p className="text-xl font-black text-slate-900">{performanceBand.reason}</p>
                <div className="pt-4 border-t border-slate-200 mt-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Primary Constraint</p>
                  <p className="text-lg font-bold text-slate-700">{performanceBand.driver}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STEP 3: ACTION ROADMAP */}
        <section className="relative">
          <div className="bg-slate-950 text-white p-16 lg:p-24 rounded-[5rem] shadow-2xl relative overflow-hidden">
            <div className="absolute -bottom-20 -left-20 opacity-5"><Target className="w-96 h-96" /></div>
            <div className="max-w-4xl relative z-10">
              <div className="flex items-center gap-4 mb-16">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center font-black text-white border border-white/20">3</div>
                <p className="font-black text-xs uppercase tracking-[0.3em] text-blue-400">The Roadmap to Efficiency</p>
              </div>
              <header className="space-y-8 mb-20">
                <h3 className="text-5xl lg:text-7xl font-black tracking-tighter leading-[0.95] text-white">
                  Strategic Mandate
                </h3>
                <div className="p-10 bg-blue-600/10 border border-blue-500/20 rounded-[3rem]">
                   <p className="text-2xl lg:text-3xl font-black text-blue-400 leading-tight">
                    {performanceBand.narrative.action}
                   </p>
                </div>
              </header>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {tactics.map((tactic, idx) => (
                  <div key={idx} className="flex flex-col gap-8 p-12 rounded-[4rem] bg-slate-900 border border-slate-800 hover:border-blue-500/50 transition-all group">
                    <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-blue-600/20 transition-all">
                      <tactic.icon className="w-10 h-10 text-slate-400 group-hover:text-blue-400" />
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-black text-3xl text-slate-100 tracking-tight">{tactic.title}</h4>
                      <p className="text-slate-500 text-xl leading-relaxed font-medium">{tactic.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-20 pt-16 border-t border-slate-800 flex justify-between items-center opacity-40">
                <p className="text-sm font-black uppercase tracking-widest italic">OBIS INTELLIGENCE ENGINE v1.6.5</p>
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                </div>
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
          subValue={summary.deltas ? `Growth: ${summary.deltas.revenue.toFixed(0)}%` : "Baseline Period"}
          icon={<TrendingUp className="w-5 h-5" />}
          trend={summary.deltas ? { value: summary.deltas.revenue, isGood: summary.deltas.revenue >= 0, type: 'percentage' } : undefined}
        />
        <StatCard 
          label="Food/COGS" 
          value={`${summary.foodCostPct.toFixed(0)}%`} 
          subValue={summary.foodCostPct <= 33 ? "Safe Zone" : "Alert Zone"}
          color={summary.foodCostPct > 33 ? 'red' : 'green'}
          icon={<Target className="w-5 h-5" />}
          trend={summary.deltas ? { value: summary.deltas.foodCost, isGood: summary.deltas.foodCost <= 0, type: 'points' } : undefined}
        />
        <StatCard 
          label="Dependency" 
          value={`${summary.onlineDependencyPct.toFixed(0)}%`} 
          subValue="Online Sales Mix"
          color={summary.onlineDependencyPct > 55 ? 'orange' : 'blue'}
          icon={<LayoutGrid className="w-5 h-5" />}
          trend={summary.deltas ? { value: summary.deltas.onlineDependency, isGood: summary.deltas.onlineDependency <= 0, type: 'points' } : undefined}
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
              { label: BENCHMARKS.foodCostPct.label, val: summary.foodCostPct, range: BENCHMARKS.foodCostPct.healthy, invert: true, trend: deltas?.foodCost },
              { label: BENCHMARKS.staffCostPct.label, val: summary.staffCostPct, range: BENCHMARKS.staffCostPct.healthy, invert: true, trend: deltas?.staffCost },
              { label: BENCHMARKS.netMargin.label, val: summary.margin, range: BENCHMARKS.netMargin.healthy, trend: deltas?.margin }
            ].map((b, i) => {
              const isSafe = b.invert ? b.val <= b.range[1] : b.val >= b.range[0];
              const isTrendGood = b.trend !== undefined ? (b.invert ? b.trend <= 0 : b.trend >= 0) : true;
              return (
                <div key={i} className="space-y-4">
                  <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-slate-400">
                    <div className="flex items-center gap-2">
                      <span>{b.label}</span>
                      {b.trend !== undefined && (
                        <span className={`flex items-center gap-0.5 text-[8px] px-2 py-0.5 rounded-full border ${isTrendGood ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                          {b.trend > 0 ? '+' : ''}{b.trend.toFixed(1)}pp
                        </span>
                      )}
                    </div>
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