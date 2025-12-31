
import React, { useState, useMemo } from 'react';
import { 
  Users, 
  FileInput, 
  BarChart3, 
  Lightbulb, 
  FileText, 
  ChevronRight, 
  Search,
  Plus,
  ArrowLeft,
  ToggleLeft as Toggle,
  ToggleRight as ToggleOn,
  EyeOff,
  ShieldCheck,
  Lock,
  ArrowRight
} from 'lucide-react';
import { AnalystConsole } from './components/AnalystConsole';
import { DataInputForm } from './components/DataInputForm';
import { Client, MonthlyRecord, BusinessSummary, AiInsight } from './types';
import { generateInsights } from './geminiService';
import { runAnalyticsEngine } from './services/analyticsEngine';
import { MOCK_CLIENTS, MOCK_RECORDS } from './constants';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'input' | 'analysis' | 'insights' | 'export'>('analysis');
  const [meetingMode, setMeetingMode] = useState(false);
  const [insights, setInsights] = useState<AiInsight[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [showNewClientForm, setShowNewClientForm] = useState(false);

  // Active client data
  const activeClient = useMemo(() => 
    MOCK_CLIENTS.find(c => c.id === selectedClientId), 
    [selectedClientId]
  );
  
  const activeRecord = useMemo(() => 
    selectedClientId ? MOCK_RECORDS[selectedClientId] : null,
    [selectedClientId]
  );

  // Use Centralized Analytics Engine
  const summary: BusinessSummary | null = useMemo(() => {
    if (!activeRecord) return null;
    return runAnalyticsEngine(activeRecord);
  }, [activeRecord]);

  const handleFetchAiInsights = async () => {
    if (!summary || !activeRecord) return;
    setLoadingInsights(true);
    const results = await generateInsights(summary, activeRecord.topItems);
    setInsights(results);
    setLoadingInsights(false);
  };

  // Simulated Login Screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] p-12 shadow-2xl text-center">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl mx-auto mb-8 flex items-center justify-center text-white font-black text-4xl shadow-xl shadow-blue-500/20 italic">O</div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">OBIS Internal</h1>
          <p className="text-slate-500 font-medium mb-10 text-sm">Restricted Analyst Console Access</p>
          
          <div className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="password" 
                placeholder="Analyst Key" 
                defaultValue="••••••••"
                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold"
              />
            </div>
            <button 
              onClick={() => setIsLoggedIn(true)}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-black transition-all shadow-xl shadow-slate-900/20"
            >
              Unlock Terminal
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
              Proprietary System • Hyderabad Pilot Phase v1.1<br/>
              Open Business Intelligence System
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Client Selection View
  if (!selectedClientId) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 lg:p-12 animate-in fade-in zoom-in duration-500">
        <div className="max-w-6xl mx-auto space-y-12">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl">O</div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Portfolio</h1>
              </div>
              <p className="text-slate-500 font-medium ml-1 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-500" />
                Logged in as Master Analyst
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  placeholder="Search clients..." 
                  className="pl-12 pr-6 py-3.5 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 w-80 font-bold shadow-sm"
                />
              </div>
              <button 
                onClick={() => setShowNewClientForm(true)}
                className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3.5 rounded-2xl font-black shadow-2xl hover:bg-black transition-all hover:scale-[1.02]"
              >
                <Plus className="w-5 h-5" />
                Add Client
              </button>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {MOCK_CLIENTS.map(client => (
              <button 
                key={client.id}
                onClick={() => setSelectedClientId(client.id)}
                className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all text-left group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <BarChart3 className="w-24 h-24" />
                </div>
                <div className="flex justify-between items-start mb-10">
                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${client.status === 'Pilot' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {client.status}
                  </div>
                  <ChevronRight className="w-6 h-6 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-2 leading-tight">{client.name}</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-10">{client.cuisine} • {client.city}</p>
                <div className="grid grid-cols-2 gap-8 border-t border-slate-50 pt-8">
                  <div>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Pricing</p>
                    <p className="font-black text-slate-700">{client.pricingLevel} Tier</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Cycle</p>
                    <p className="font-black text-slate-700">{client.startMonth}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* New Client Modal (Simple implementation) */}
        {showNewClientForm && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="bg-white rounded-[2.5rem] p-12 max-w-xl w-full shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-300">
              <h3 className="text-3xl font-black mb-2">New Client Profile</h3>
              <p className="text-slate-500 mb-8 font-medium">Add a restaurant to the OBIS pipeline.</p>
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Restaurant Name</label>
                  <input placeholder="e.g. Hyderabad Grill" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Type</label>
                    <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold appearance-none">
                      <option>Cloud Kitchen</option>
                      <option>Dine-in</option>
                      <option>Hybrid</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Segment</label>
                    <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold appearance-none">
                      <option>Mid-range</option>
                      <option>High-end</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-4 pt-6">
                  <button onClick={() => setShowNewClientForm(false)} className="flex-1 py-4 text-slate-500 font-black">Cancel</button>
                  <button onClick={() => setShowNewClientForm(false)} className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black shadow-xl">Create Profile</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Dashboard View
  return (
    <div className="min-h-screen flex bg-slate-50 overflow-hidden">
      <aside className="hidden lg:flex w-80 bg-slate-900 flex-col p-8 transition-all">
        <button 
          onClick={() => setSelectedClientId(null)}
          className="flex items-center gap-3 text-slate-500 hover:text-white mb-14 transition-colors font-bold text-sm"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Portfolio
        </button>

        <div className="mb-12">
          <h2 className="text-2xl font-black text-white mb-2 leading-tight">{activeClient?.name}</h2>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${summary?.performanceBand === 'Healthy' ? 'bg-emerald-500' : summary?.performanceBand === 'Weak' ? 'bg-amber-500' : 'bg-rose-500'}`}></span>
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">{activeClient?.type} • {summary?.performanceBand}</p>
          </div>
        </div>

        <nav className="space-y-3 flex-1">
          {[
            { id: 'input', label: 'Data Input', icon: FileInput },
            { id: 'analysis', label: 'Analytics Engine', icon: BarChart3 },
            { id: 'insights', label: 'AI Strategy', icon: Lightbulb },
            { id: 'export', label: 'Meeting Report', icon: FileText }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${
                activeTab === item.id 
                  ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/40' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-bold text-sm tracking-tight">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto space-y-6">
          <div className="bg-slate-800/50 p-6 rounded-[2rem] border border-white/5 shadow-inner">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Meeting Mode</span>
              <button onClick={() => setMeetingMode(!meetingMode)} className="transition-transform active:scale-95">
                {meetingMode ? <ToggleOn className="w-8 h-8 text-blue-400" /> : <Toggle className="w-8 h-8 text-slate-600" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">Hides internal risk flags & raw costs for client presentations.</p>
          </div>
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/20 flex items-center justify-center text-blue-400 font-black text-xs">MA</div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Master Analyst</div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-2xl border-b border-slate-200 px-10 py-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">
              {activeTab === 'analysis' ? 'Analytics Feed' : activeTab === 'insights' ? 'Strategy Drafts' : activeTab === 'input' ? 'Monthly Feed' : 'Export Hub'}
            </h2>
          </div>
          <div className="flex items-center gap-6">
            {meetingMode && (
              <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 animate-pulse">
                <EyeOff className="w-4 h-4" />
                <span className="text-[11px] font-black uppercase tracking-widest">Meeting View Active</span>
              </div>
            )}
            <div className="h-10 w-px bg-slate-200"></div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{activeRecord?.month} Dataset</div>
          </div>
        </header>

        <div className="p-10 lg:p-14 max-w-6xl mx-auto w-full pb-24">
          {activeTab === 'input' && <DataInputForm initialData={activeRecord || undefined} onSave={() => {}} />}
          
          {activeTab === 'analysis' && summary && <AnalystConsole summary={summary} meetingMode={meetingMode} />}
          
          {activeTab === 'insights' && (
            <div className="space-y-10">
              <div className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl">
                <div className="relative z-10 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                    <Lightbulb className="w-3 h-3" />
                    Internal Analysis Engine
                  </div>
                  <h3 className="text-5xl font-black mb-6 leading-tight">Generate Insights</h3>
                  <p className="text-slate-400 mb-10 text-lg font-medium leading-relaxed">Runs the Master AI Logic to identify top 3 problems and practical actions. Review drafts below before the meeting.</p>
                  <button 
                    onClick={handleFetchAiInsights}
                    disabled={loadingInsights}
                    className="px-10 py-4 bg-blue-600 hover:bg-blue-700 rounded-2xl font-black transition-all shadow-2xl shadow-blue-900/60 disabled:opacity-50 text-lg"
                  >
                    {loadingInsights ? 'Analyzing Business Rules...' : 'Run Strategy Drafts'}
                  </button>
                </div>
                <div className="absolute -bottom-12 -right-12 p-8 opacity-5">
                  <Lightbulb className="w-96 h-96 text-blue-400 rotate-12" />
                </div>
              </div>

              {insights.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-8">
                  {insights.map((insight, idx) => (
                    <div key={idx} className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:border-blue-200 transition-all group flex flex-col">
                      <div className="flex justify-between items-center mb-8">
                        <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full uppercase tracking-widest">Analyst Observation #{idx + 1}</span>
                        <div className="text-emerald-600 font-black text-[10px] uppercase tracking-widest">
                          {insight.impactPotential}
                        </div>
                      </div>
                      <h4 className="text-2xl font-black text-slate-900 mb-4 leading-tight group-hover:text-blue-600 transition-colors">{insight.observation}</h4>
                      <p className="text-slate-500 mb-10 leading-relaxed font-medium text-base">{insight.importance}</p>
                      
                      <div className="mt-auto bg-slate-50 p-6 rounded-3xl border border-slate-100 group-hover:bg-blue-50/50 transition-colors">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Action for Client</p>
                        <p className="text-base font-bold text-slate-800 leading-snug">{insight.recommendation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'export' && (
            <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border-4 border-dashed border-slate-100 animate-in fade-in duration-700">
              <div className="w-24 h-24 bg-blue-50 rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-blue-100">
                <FileText className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-4xl font-black text-slate-900 mb-4">Meeting Package Ready</h3>
              <p className="text-slate-500 mb-12 max-w-sm text-center font-medium text-lg">Consolidates the {activeRecord?.month} health summary, strategy drafts, and benchmarks into a meeting-ready PDF.</p>
              <button className="px-14 py-5 bg-slate-900 text-white rounded-2xl font-black shadow-2xl hover:bg-black transition-all hover:scale-105 text-lg">
                Export Strategic Summary
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
