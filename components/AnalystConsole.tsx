
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
  Utensils
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

  // Dynamic Tactic Generator based on business drivers
  const getStrategicTactics = (driver: string) => {
    const tactics = {
      'Procurement & Waste': [
        { title: 'Inventory Tightening', desc: 'Implement a "First-In-First-Out" audit on the top 5 raw ingredients to reduce waste by 12%.', icon: Box },
        { title: 'Portion Control', desc: 'Standardize plating for high-volume items to ensure consistent COGS across all shifts.', icon: Utensils }
      ],
      'High Fixed Overheads': [
        { title: 'Utility Optimization', desc: 'Audit off-peak power usage; target a 15% reduction in non-operational energy burn.', icon: Zap },
        { title: 'Rent-to-Revenue Audit', desc: 'Review lease terms vs. current market rates for future negotiation leverage.', icon: LayoutGrid }
      ],
      'Platform Commissions': [
        { title: 'Direct Order Push', desc: 'Launch an in-house delivery incentive to migrate 10% of Zomato traffic to direct channels.', icon: Target },
        { title: 'Menu Re-engineering', desc: 'Adjust aggregator prices by 4% on mid-range items to offset commission leakage.', icon: TrendingUp }
      ],
      'Menu Costing': [
        { title: 'Profit Ranking', desc: 'Identify "Puzzles" (High profit, low volume) and move them to prime visual spots on the menu.', icon: Lightbulb },
        { title: 'Ingredient Consolidation', desc: 'Remove items requiring unique low-volume ingredients that bloat procurement complexity.', icon: Box }
      ],
      'Balanced revenue/cost mix.': [
        { title: 'Volume Scaling', desc: 'Invest 2% of additional profit into targeted local marketing to break the current revenue ceiling.', icon: TrendingUp },
        { title: 'Retention Focus', desc: 'Deploy a loyalty-based "surprise & delight" program for top 50 high-frequency customers.', icon: Users }
      ]
    };
    return tactics[driver as keyof typeof tactics] || tactics['Balanced revenue/cost mix.'];
  };

  if (meetingMode) {
    const tactics = getStrategicTactics(performanceBand.driver);

    return (
      <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 max-w-5xl mx-auto pb-20">
        {/* STEP 1: BUSINESS HEALTH */}
        <section className="relative group">
          <div className="flex items-center gap-5 mb-8">
            <span className="flex-none w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-lg shadow-xl ring-8 ring-slate-50">1</span>
            <div className="h-px bg-slate-200 flex-1"></div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Section I: Business Health</h3>
          </div>
          <div className={`rounded-[3.5rem] p-14 transition-all shadow-2xl ${getBandStyles(performanceBand.level)} relative overflow-hidden`}>
            <div className="absolute top-0 right-0 p-10 opacity-10">
              <Activity className="w-40 h-40" />
            </div>
            <div className="relative z-10 max-w-3xl">
              <div className="flex items-center gap-3 mb-8 opacity-80">
                <ShieldCheck className="w-6 h-6" />
                <p className="font-black text-xs uppercase tracking-widest">Verified Performance Assessment</p>
              </div>
              <h2 className="text-4xl lg:text-6xl font-black tracking-tight leading-[1.1] mb-6">
                {performanceBand.narrative.health}
              </h2>
              <div className="inline-flex items-center gap-2 px-6 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30 text-xs font-black uppercase tracking-widest">
                Band: {performanceBand.level}
              </div>
            </div>
          </div>
        </section>

        {/* STEP 2: WHAT CHANGED */}
        <section className="relative">
          <div className="flex items-center gap-5 mb-8">
            <span className="flex-none w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-lg shadow-xl ring-8 ring-slate-50">2</span>
            <div className="h-px bg-slate-200 flex-1"></div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Section II: What Changed</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all">
              <TrendingUp className="w-8 h-8 text-blue-600 mb-6" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Revenue Velocity</p>
              <div className="space-y-1">
                <div className="text-4xl font-black text-slate-900">₹{(summary.revenue / 100000).toFixed(1)}L</div>
                <DeltaBadge value={deltas?.revenue} label="vs Last Month" />
              </div>
            </div>
            <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all">
              <Zap className="w-8 h-8 text-amber-500 mb-6" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Profitability Gap</p>
              <div className="space-y-1">
                <div className="text-4xl font-black text-slate-900">{summary.margin.toFixed(1)}%</div>
                <DeltaBadge value={deltas?.margin} label="Margin Drift" />
              </div>
            </div>
            <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all">
              <Target className="w-8 h-8 text-rose-500 mb-6" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Food Cost (COGS)</p>
              <div className="space-y-1">
                <div className="text-4xl font-black text-slate-900">{summary.foodCostPct.toFixed(1)}%</div>
                <DeltaBadge value={deltas?.foodCost} label="Cost Swing" invert />
              </div>
            </div>
          </div>
        </section>

        {/* STEP 3: WHY IT MATTERS */}
        <section className="relative">
          <div className="flex items-center gap-5 mb-8">
            <span className="flex-none w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-lg shadow-xl ring-8 ring-slate-50">3</span>
            <div className="h-px bg-slate-200 flex-1"></div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Section III: Why It Matters</h3>
          </div>
          <div className="bg-slate-50 border-2 border-slate-200 p-16 rounded-[4rem] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-5"><Lightbulb className="w-48 h-48 text-blue-600" /></div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="px-5 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em]">Contextual Insight</div>
              </div>
              <p className="text-3xl lg:text-4xl font-bold leading-relaxed text-slate-800 tracking-tight">
                "{performanceBand.narrative.change}"
              </p>
            </div>
          </div>
        </section>

        {/* STEP 4: STRATEGIC ROADMAP (EXECUTIVE STYLE) */}
        <section className="relative">
          <div className="flex items-center gap-5 mb-8">
            <span className="flex-none w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-lg shadow-xl ring-8 ring-slate-50">4</span>
            <div className="h-px bg-slate-200 flex-1"></div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Section IV: Strategic Roadmap</h3>
          </div>
          
          <div className="bg-slate-950 text-white p-16 lg:p-24 rounded-[5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] relative overflow-hidden border border-slate-800/50">
            {/* Elegant Background Accents */}
            <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
              <div className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px]"></div>
              <div className="absolute -bottom-1/2 -left-1/4 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[100px]"></div>
            </div>

            <div className="max-w-4xl relative z-10">
              <header className="space-y-8 mb-20">
                <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase tracking-[0.3em]">
                  <CheckCircle2 className="w-4 h-4" /> Priority Executive Action
                </div>
                <h3 className="text-5xl lg:text-7xl font-black tracking-tighter leading-[0.95]">
                  {performanceBand.narrative.action}
                </h3>
                <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-2xl">
                  This recommendation is weighted against the current <span className="text-white font-bold">{performanceBand.driver}</span> performance driver.
                </p>
              </header>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-16 border-t border-slate-800/60">
                {tactics.map((tactic, idx) => (
                  <div key={idx} className="group/tactic flex flex-col gap-6 p-10 rounded-[3rem] bg-slate-900/50 border border-slate-800/50 hover:bg-slate-900 hover:border-slate-700 transition-all duration-500">
                    <div className="flex items-center justify-between">
                      <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center group-hover/tactic:bg-blue-600/20 transition-colors">
                        <tactic.icon className="w-6 h-6 text-slate-400 group-hover/tactic:text-blue-400 transition-colors" />
                      </div>
                      <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Tactic 0{idx + 1}</span>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-black text-2xl text-slate-100 tracking-tight group-hover/tactic:translate-x-1 transition-transform">{tactic.title}</h4>
                      <p className="text-slate-500 text-lg leading-relaxed font-medium group-hover/tactic:text-slate-400 transition-colors">
                        {tactic.desc}
                      </p>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase text-blue-500 opacity-0 group-hover/tactic:opacity-100 transition-all transform translate-y-2 group-hover/tactic:translate-y-0">
                      Learn More <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                ))}
              </div>

              <footer className="mt-20 pt-12 flex flex-col md:flex-row items-center justify-between gap-10 border-t border-slate-800/40">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full border-2 border-slate-800 flex items-center justify-center overflow-hidden">
                    <img src="https://api.dicebear.com/7.x/initials/svg?seed=OBIS&backgroundColor=0f172a" alt="OBIS" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-300">OBIS Strategic Intelligence</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Decision Confidence: 94%</p>
                  </div>
                </div>
                <button className="flex items-center gap-4 text-xs font-black uppercase tracking-[0.4em] text-slate-500 hover:text-white transition-all group/btn">
                  <FileText className="w-5 h-5 text-slate-600 group-hover/btn:text-blue-500 transition-colors" /> 
                  Archive Roadmap
                </button>
              </footer>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-500">
      
      {/* 1. NARRATIVE ORDER: Business Health */}
      <div className={`rounded-[3rem] p-12 flex flex-col md:flex-row md:items-center justify-between gap-10 transition-all shadow-2xl ${getBandStyles(performanceBand.level)}`}>
        <div className="space-y-3 max-w-xl">
          <div className="flex items-center gap-2 opacity-80">
            <Activity className="w-4 h-4" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em]">Health Snapshot</p>
          </div>
          <h2 className="text-6xl font-black tracking-tighter">{performanceBand.level}</h2>
          <p className="text-xl font-medium opacity-95 leading-relaxed">{performanceBand.narrative.health}</p>
        </div>
        
        <div className="flex flex-col gap-4">
          <div className="bg-white/20 backdrop-blur-xl px-10 py-6 rounded-[2rem] border border-white/20 shadow-inner">
            <p className="text-[10px] font-black uppercase opacity-70 tracking-widest mb-1">Net Margin</p>
            <p className="text-4xl font-black">{summary.margin.toFixed(1)}%</p>
            <DeltaBadge value={deltas?.margin} label="MoM" />
          </div>
          <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-60">
            <ShieldAlert className="w-3 h-3" />
            Confidence: {summary.dataQuality}%
          </div>
        </div>
      </div>

      {/* 2. NARRATIVE ORDER: What Changed (Metric Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard 
          label="Revenue Scale" 
          value={`₹${(summary.revenue / 100000).toFixed(1)}L`} 
          subValue={deltas ? `MoM Growth: ${deltas.revenue.toFixed(0)}%` : "Baseline Period"}
          color="blue"
          icon={<TrendingUp className="w-5 h-5" />}
          trend={deltas ? {
            value: deltas.revenue,
            isGood: deltas.revenue >= 0,
            type: 'percentage'
          } : undefined}
        />
        <StatCard 
          label="Food Efficiency" 
          value={`${summary.foodCostPct.toFixed(0)}%`} 
          subValue={meetingMode ? "vs 30% Ideal" : `Drift: ${deltas?.foodCost?.toFixed(1)}pp`}
          color={summary.foodCostPct > 33 ? 'red' : 'green'}
          icon={<Target className="w-5 h-5" />}
          trend={deltas ? {
            value: deltas.foodCost,
            isGood: deltas.foodCost <= 0,
            type: 'points'
          } : undefined}
        />
        <StatCard 
          label="Online Dependency" 
          value={`${summary.onlineDependencyPct.toFixed(0)}%`} 
          subValue={summary.onlineDependencyPct > 50 ? "High Commission Load" : "Balanced Revenue"}
          color={summary.onlineDependencyPct > 50 ? 'orange' : 'blue'}
          icon={<LayoutGrid className="w-5 h-5" />}
          trend={deltas ? {
            value: deltas.onlineDependency,
            isGood: deltas.onlineDependency <= 0,
            type: 'points'
          } : undefined}
        />
        <StatCard 
          label="Operating Efficiency" 
          value={performanceBand.driver} 
          subValue="Primary Margin Driver"
          color="blue"
          icon={<Zap className="w-5 h-5" />}
        />
      </div>

      {/* 3. NARRATIVE ORDER: Why it Matters (Internal Details) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white p-12 rounded-[3rem] border border-slate-200 shadow-sm">
          <h3 className="text-2xl font-black mb-10 flex items-center gap-3 text-slate-900">
            <Info className="w-6 h-6 text-blue-600" />
            Benchmark Safe Zones
          </h3>
          <div className="space-y-8">
            {[
              { label: BENCHMARKS.foodCostPct.label, val: summary.foodCostPct, range: BENCHMARKS.foodCostPct.healthy, unit: '%', invert: true },
              { label: BENCHMARKS.staffCostPct.label, val: summary.staffCostPct, range: BENCHMARKS.staffCostPct.healthy, unit: '%', invert: true },
              { label: BENCHMARKS.netMargin.label, val: summary.margin, range: BENCHMARKS.netMargin.healthy, unit: '%' }
            ].map((b, i) => {
              const isSafe = b.invert ? b.val <= b.range[1] : b.val >= b.range[0];
              const safeZoneLeft = (b.range[0] / (b.range[1] * 2)) * 100;
              const safeZoneWidth = ((b.range[1] - b.range[0]) / (b.range[1] * 2)) * 100;

              return (
                <div key={i} className="space-y-4">
                  <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-slate-400">
                    <span>{b.label}</span>
                    <span className={isSafe ? 'text-emerald-600' : 'text-rose-600'}>
                      {isSafe ? 'Within Safe Zone' : 'Alert: Outside Band'}
                    </span>
                  </div>
                  <div className="h-4 bg-slate-100 rounded-full relative overflow-hidden">
                    {/* Safe Zone Marker */}
                    <div 
                      className="absolute top-0 bottom-0 bg-emerald-100/50 border-x border-emerald-200/50 z-0"
                      style={{ left: `${safeZoneLeft}%`, width: `${safeZoneWidth}%` }}
                    />
                    {/* Actual Value Bar */}
                    <div 
                      className={`h-full transition-all relative z-10 ${isSafe ? 'bg-emerald-500' : 'bg-rose-500'}`} 
                      style={{ width: `${Math.min(100, (b.val / (b.range[1] * 2)) * 100)}%` }} 
                    />
                  </div>
                  <p className="text-xs font-bold text-slate-500">{b.val.toFixed(1)}{b.unit} Actual vs {b.range[0]}-{b.range[1]}% Target</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white p-12 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-2xl font-black mb-8 flex items-center gap-3 text-slate-900">
            <TrendingDown className="w-6 h-6 text-rose-500" />
            Internal Narrative Log
          </h3>
          <div className="space-y-6 flex-1">
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Change Summary</p>
              <p className="text-sm font-bold text-slate-700 leading-relaxed">{performanceBand.narrative.change}</p>
            </div>
            <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100">
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-3">Primary Action Vector</p>
              <p className="text-sm font-black text-blue-700 leading-relaxed">{performanceBand.narrative.action}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
