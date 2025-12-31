
import React, { useState, useMemo, useEffect } from 'react';
import { 
  FileInput, 
  BarChart3, 
  Lightbulb, 
  FileText, 
  Plus,
  ArrowLeft,
  ToggleLeft as Toggle,
  ToggleRight as ToggleOn,
  EyeOff,
  ShieldCheck,
  Lock,
  ArrowRight,
  Clock,
  Sparkles,
  Archive,
  Download,
  MapPin,
  Calendar,
  Activity,
  ChevronDown
} from 'lucide-react';
import { AnalystConsole } from './components/AnalystConsole';
import { Dashboard } from './components/Dashboard';
import { DataInputForm } from './components/DataInputForm';
import { MenuIntelligence } from './components/MenuIntelligence';
import { Client, MonthlyRecord, BusinessSummary, AiInsight, InsightHistoryItem } from './types';
import { generateInsights } from './geminiService';
import { runAnalyticsEngine } from './services/analyticsEngine';
import { MOCK_CLIENTS, MOCK_RECORDS } from './constants';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
  const [records, setRecords] = useState<Record<string, MonthlyRecord[]>>(MOCK_RECORDS);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'input' | 'analysis' | 'insights' | 'export'>('analysis');
  const [meetingMode, setMeetingMode] = useState(false);
  const [insights, setInsights] = useState<AiInsight[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [isInsightCommitted, setIsInsightCommitted] = useState(false);

  useEffect(() => {
    setInsights([]);
    setIsInsightCommitted(false);
    if (selectedClientId) setActiveTab('analysis');
  }, [selectedClientId]);

  const activeClient = useMemo(() => clients.find(c => c.id === selectedClientId), [selectedClientId, clients]);
  const clientRecords = useMemo(() => selectedClientId ? records[selectedClientId] || [] : [], [selectedClientId, records]);
  const activeRecord = clientRecords[0] || null;
  const previousRecord = clientRecords[1] || null;

  const summary: BusinessSummary | null = useMemo(() => {
    if (!activeRecord) return null;
    return runAnalyticsEngine(activeRecord, previousRecord);
  }, [activeRecord, previousRecord]);

  const dashboardData = useMemo(() => {
    if (!activeRecord) return null;
    const revenue = [
      { channel: 'Online', gross: activeRecord.revenue.online, net: activeRecord.revenue.online * 0.72 },
      { channel: 'Offline', gross: activeRecord.revenue.offline, net: activeRecord.revenue.offline * 0.95 }
    ];
    const costs = [
      { name: 'Food', value: activeRecord.costs.food },
      { name: 'Staff', value: activeRecord.costs.staff },
      { name: 'Rent', value: activeRecord.costs.rent },
      { name: 'Marketing', value: activeRecord.costs.marketing },
      { name: 'Packaging', value: activeRecord.costs.packaging },
      { name: 'Utilities', value: activeRecord.costs.utilities }
    ];
    return { revenue, costs };
  }, [activeRecord]);

  const handleSaveData = (data: any) => {
    if (!selectedClientId) return;
    const newRecord: MonthlyRecord = {
      clientId: selectedClientId,
      month: new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
      revenue: {
        total: data.revenue,
        online: data.online,
        offline: data.revenue - data.online,
        orders: data.orders || 0
      },
      costs: {
        food: data.foodCost,
        staff: data.staff,
        rent: data.rent || 0,
        utilities: data.utilities || 0,
        marketing: data.marketing || 0,
        packaging: data.packaging || 0,
        discounts: data.discounts || 0
      },
      topItems: data.menuItems?.slice(0, 3).map((i: any) => i.name) || [],
      menuItems: data.menuItems,
      dataQualityScore: data.dataQualityScore
    };

    setRecords(prev => ({ ...prev, [selectedClientId]: [newRecord, ...(prev[selectedClientId] || [])] }));
    setClients(prev => prev.map(c => c.id === selectedClientId ? { ...c, lastUpdatedAt: new Date().toISOString() } : c));
    setActiveTab('analysis');
  };

  const handleFetchAiInsights = async () => {
    if (!summary || !activeRecord || !activeClient) return;
    setLoadingInsights(true);
    const results = await generateInsights(summary, activeRecord.topItems, activeClient.insightHistory);
    setInsights(results);
    setLoadingInsights(false);
  };

  const handleCommitInsights = () => {
    if (!selectedClientId || insights.length === 0 || !activeRecord) return;
    const newHistoryItem: InsightHistoryItem = {
      month: activeRecord.month,
      problems: insights.map(i => i.observation),
      actions: insights.map(i => i.recommendation),
      timestamp: new Date().toISOString()
    };
    setClients(prev => prev.map(c => c.id === selectedClientId ? { ...c, insightHistory: [newHistoryItem, ...c.insightHistory], lastUpdatedAt: new Date().toISOString() } : c));
    setIsInsightCommitted(true);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white rounded-[3rem] p-12 shadow-2xl">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl mx-auto mb-8 flex items-center justify-center text-white font-black text-4xl shadow-xl italic">O</div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">OBIS Terminal</h1>
          <p className="text-slate-500 font-medium mb-10 text-sm">Analyst-only intelligence access</p>
          <div className="space-y-4">
            <input type="password" placeholder="Analyst Key" defaultValue="••••••••" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 font-bold" />
            <button onClick={() => setIsLoggedIn(true)} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-95 shadow-xl">Unlock Console <ArrowRight className="w-5 h-5" /></button>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedClientId) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 lg:p-12 animate-in fade-in duration-500">
        <div className="max-w-6xl mx-auto space-y-12">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-xl italic">O</div>
                <h1 className="text-5xl font-black text-slate-900 tracking-tighter">Portfolio</h1>
              </div>
              <p className="text-slate-500 font-medium ml-1 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-blue-500" /> {clients.length} Active Audits</p>
            </div>
            <button onClick={() => setShowNewClientForm(true)} className="flex items-center gap-3 bg-slate-900 text-white px-10 py-5 rounded-[1.5rem] font-black shadow-2xl hover:bg-black transition-all hover:scale-105 active:scale-95"><Plus className="w-5 h-5" /> Add New Client</button>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {clients.map(client => (
              <button key={client.id} onClick={() => setSelectedClientId(client.id)} className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm hover:shadow-2xl transition-all text-left group overflow-hidden relative">
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-10 w-fit ${client.status === 'pilot' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>{client.status}</div>
                <h3 className="text-3xl font-black text-slate-900 mb-2 leading-tight">{client.name}</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-10">{client.cuisine} • {client.city}</p>
                <div className="grid grid-cols-2 gap-8 border-t border-slate-50 pt-8">
                  <div>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Status</p>
                    <p className="font-black text-slate-700">Audit Ready</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">History</p>
                    <p className="font-black text-slate-700">{client.insightHistory.length} Cycles</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      <aside className="no-print hidden lg:flex w-80 bg-slate-900 flex-col p-8 transition-all h-screen sticky top-0">
        <button onClick={() => setSelectedClientId(null)} className="flex items-center gap-3 text-slate-500 hover:text-white mb-14 transition-colors font-bold text-sm">
          <ArrowLeft className="w-5 h-5" /> Back to Portfolio
        </button>
        <div className="mb-12 px-2">
          <h2 className="text-2xl font-black text-white mb-2 leading-tight">{activeClient?.name}</h2>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${summary?.performanceBand.level === 'Healthy' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Live Engine Feed</p>
          </div>
        </div>
        <nav className="space-y-3 flex-1">
          {[
            { id: 'input', label: 'Snapshot Entry', icon: FileInput },
            { id: 'analysis', label: 'Engine Feed', icon: BarChart3 },
            { id: 'insights', label: 'Strategy Drafts', icon: Lightbulb },
            { id: 'export', label: 'Meeting Hub', icon: FileText }
          ].map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`w-full flex items-center gap-4 px-6 py-5 rounded-[1.5rem] transition-all ${activeTab === item.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/40' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
              <item.icon className="w-5 h-5" /> <span className="font-bold text-sm tracking-tight">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="mt-auto bg-slate-800/50 p-6 rounded-[2rem] border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Meeting Mode</span>
            <button onClick={() => setMeetingMode(!meetingMode)}>
              {meetingMode ? <ToggleOn className="w-8 h-8 text-blue-400" /> : <Toggle className="w-8 h-8 text-slate-600" />}
            </button>
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed font-medium">Hides risk flags for client view.</p>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="no-print sticky top-0 z-30 bg-white/70 backdrop-blur-2xl border-b border-slate-200 px-12 py-7 flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">{activeTab}</h2>
          <div className="flex items-center gap-6">
            {meetingMode && <div className="text-blue-600 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 animate-pulse text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><EyeOff className="w-4 h-4" /> Presentation Mode</div>}
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{activeRecord?.month}</div>
          </div>
        </header>

        <div className="p-10 lg:p-14 max-w-6xl mx-auto w-full pb-24">
          {activeTab === 'input' && <DataInputForm onSave={handleSaveData} />}
          {activeTab === 'analysis' && summary && dashboardData && (
            <div className="space-y-16 animate-in fade-in duration-500">
              {!meetingMode && <Dashboard summary={summary} revenue={dashboardData.revenue} costs={dashboardData.costs} />}
              
              {/* ITEM-LEVEL PROFIT/LOSS ANCHORS */}
              {summary.bestItem && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="bg-emerald-50 border border-emerald-100 p-10 rounded-[3rem] space-y-4">
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em]">Profit Anchor Item</p>
                    <h4 className="text-4xl font-black text-emerald-900">{summary.bestItem.name}</h4>
                    <p className="text-sm font-bold text-emerald-700/70">Generated ₹{summary.bestItem.contribution.toLocaleString()} in net profit this month.</p>
                  </div>
                  <div className="bg-rose-50 border border-rose-100 p-10 rounded-[3rem] space-y-4">
                    <p className="text-[10px] font-black text-rose-600 uppercase tracking-[0.3em]">Efficiency Leak Item</p>
                    <h4 className="text-4xl font-black text-rose-900">{summary.worstItem?.name}</h4>
                    <p className="text-sm font-bold text-rose-700/70">High prep cost ({( (summary.worstItem?.cost || 0) / (summary.worstItem?.price || 1) * 100).toFixed(0)}% of price) is draining margins.</p>
                  </div>
                </div>
              )}

              <AnalystConsole summary={summary} meetingMode={meetingMode} />
              {activeRecord.menuItems && <MenuIntelligence menu={activeRecord.menuItems} />}
            </div>
          )}
          
          {activeTab === 'insights' && (
            <div className="space-y-16 animate-in fade-in slide-in-from-bottom-6 duration-700">
              <div className="bg-slate-900 rounded-[4rem] p-16 text-white shadow-2xl relative overflow-hidden">
                <div className="relative z-10 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-black uppercase tracking-[0.2em] mb-6"><Sparkles className="w-3 h-3" /> OBIS Insight Engine</div>
                  <h3 className="text-6xl font-black mb-6 leading-tight tracking-tighter">Drafting Strategy</h3>
                  <p className="text-slate-400 mb-10 text-xl font-medium leading-relaxed">Converting engine deltas into in-meeting narratives for {activeClient?.name}.</p>
                  <div className="flex items-center gap-4">
                    <button onClick={handleFetchAiInsights} disabled={loadingInsights} className="px-12 py-5 bg-blue-600 hover:bg-blue-700 rounded-3xl font-black transition-all shadow-2xl disabled:opacity-50 active:scale-95 text-lg">
                      {loadingInsights ? 'Analyzing Metrics...' : 'Generate AI Insights'}
                    </button>
                    {insights.length > 0 && !isInsightCommitted && (
                      <button onClick={handleCommitInsights} className="px-12 py-5 bg-white text-slate-900 hover:bg-slate-100 rounded-3xl font-black transition-all active:scale-95 text-lg flex items-center gap-3">
                        <Archive className="w-5 h-5" /> Archive Report
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              {insights.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {insights.map((insight, idx) => (
                    <div key={`${selectedClientId}-${idx}`} className="bg-white p-12 rounded-[4rem] border border-slate-200 shadow-sm hover:shadow-2xl transition-all group flex flex-col">
                      <div className="flex justify-between items-center mb-10">
                        <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full uppercase tracking-widest">Observation #{idx + 1}</span>
                        <div className="text-emerald-600 font-black text-[10px] uppercase tracking-widest">{insight.impactPotential} IMPACT</div>
                      </div>
                      <h4 className="text-3xl font-black text-slate-900 mb-6 leading-tight group-hover:text-blue-600 transition-colors">{insight.observation}</h4>
                      <p className="text-slate-500 mb-12 font-medium text-lg leading-relaxed">{insight.importance}</p>
                      <div className="mt-auto bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 group-hover:bg-blue-50 transition-colors">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Meeting Action</p>
                        <p className="text-lg font-black text-slate-800 leading-snug">{insight.recommendation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'export' && (
            <div className="no-print flex flex-col items-center justify-center py-40 bg-white rounded-[4rem] border-4 border-dashed border-slate-100 text-center animate-in fade-in duration-700">
              <div className="w-28 h-28 bg-blue-50 rounded-[2.5rem] flex items-center justify-center mb-10 shadow-2xl shadow-blue-100"><FileText className="w-12 h-12 text-blue-600" /></div>
              <h3 className="text-5xl font-black text-slate-900 mb-6 tracking-tighter">Executive Export Ready</h3>
              <p className="text-slate-500 mb-14 max-w-sm font-medium text-xl leading-relaxed">PDF report generated with granular item-level insights for {activeClient?.name}.</p>
              <button onClick={handlePrint} className="px-16 py-6 bg-slate-900 text-white rounded-[2rem] font-black shadow-2xl hover:bg-black transition-all hover:scale-105 active:scale-95 text-xl flex items-center gap-3">
                <Download className="w-6 h-6" /> Download Summary PDF
              </button>
            </div>
          )}
        </div>

        {/* UNIVERSAL PRINT CONTAINER (Always in DOM, Hidden Visually) */}
        {summary && activeClient && activeRecord && (
          <div className="print-only bg-white p-12 space-y-12 border-t-8 border-slate-900 w-full min-h-screen">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <h1 className="text-4xl font-black tracking-tighter uppercase">{activeClient.name}</h1>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">OBIS Business Intelligence Report • {activeRecord.month}</p>
              </div>
              <div className="bg-slate-900 text-white p-4 rounded-xl text-xs font-black italic">O</div>
            </div>

            <div className="grid grid-cols-3 gap-8 border-y border-slate-100 py-10">
              <div className="space-y-1 text-center">
                <p className="text-[8px] font-black uppercase text-slate-400">Monthly Revenue</p>
                <p className="text-2xl font-black">₹{(summary.revenue/100000).toFixed(2)}L</p>
              </div>
              <div className="space-y-1 text-center border-x border-slate-100">
                <p className="text-[8px] font-black uppercase text-slate-400">Net Profit Margin</p>
                <p className="text-2xl font-black text-emerald-600">{summary.margin.toFixed(1)}%</p>
              </div>
              <div className="space-y-1 text-center">
                <p className="text-[8px] font-black uppercase text-slate-400">Health Band</p>
                <p className="text-2xl font-black text-slate-900 uppercase">{summary.performanceBand.level}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Core Profit Narratives</h4>
              <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100">
                <p className="text-xl font-bold italic text-slate-800 leading-relaxed">"{summary.performanceBand.narrative.health}"</p>
                <div className="mt-6 h-px bg-slate-200"></div>
                <p className="mt-6 text-sm font-medium text-slate-600 leading-relaxed"><strong>Current Driver:</strong> {summary.performanceBand.narrative.change}</p>
              </div>
            </div>

            {summary.bestItem && (
              <div className="grid grid-cols-2 gap-8">
                <div className="p-6 border border-emerald-100 rounded-2xl">
                  <p className="text-[8px] font-black uppercase text-emerald-600 mb-2">Primary Profit Anchor</p>
                  <p className="text-lg font-black">{summary.bestItem.name}</p>
                  <p className="text-xs text-slate-500 mt-1">₹{summary.bestItem.contribution.toLocaleString()} Net Contribution</p>
                </div>
                <div className="p-6 border border-rose-100 rounded-2xl">
                  <p className="text-[8px] font-black uppercase text-rose-600 mb-2">Efficiency Warning</p>
                  <p className="text-lg font-black">{summary.worstItem?.name}</p>
                  <p className="text-xs text-slate-500 mt-1">Audit preparation costs immediately.</p>
                </div>
              </div>
            )}

            <div className="bg-slate-900 text-white p-10 rounded-3xl space-y-6">
              <p className="text-[8px] font-black uppercase tracking-[0.4em] text-blue-400">Priority Strategic Action</p>
              <h3 className="text-3xl font-black leading-tight tracking-tight">{summary.performanceBand.narrative.action}</h3>
            </div>

            <footer className="pt-10 flex justify-between items-center text-[8px] font-bold text-slate-400 uppercase tracking-widest">
              <p>OBIS Proprietary Intelligence • Hyderabad 2024</p>
              <p>Decision Confidence: {summary.dataQuality}%</p>
            </footer>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
