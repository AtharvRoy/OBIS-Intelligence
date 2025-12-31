
import React, { useState, useMemo } from 'react';
import { 
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
  ArrowRight,
  Clock,
  Sparkles,
  Archive,
  CheckCircle,
  History,
  Download,
  Printer,
  Calendar,
  MapPin
} from 'lucide-react';
import { AnalystConsole } from './components/AnalystConsole';
import { Dashboard } from './components/Dashboard';
import { DataInputForm } from './components/DataInputForm';
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

  // Memoized Active Client Access
  const activeClient = useMemo(() => 
    clients.find(c => c.id === selectedClientId), 
    [selectedClientId, clients]
  );
  
  const clientRecords = useMemo(() => 
    selectedClientId ? records[selectedClientId] || [] : [],
    [selectedClientId, records]
  );

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

  const handleAddClient = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newClient: Client = {
      id: `c${Date.now()}`,
      name: formData.get('name') as string,
      type: formData.get('type') as any,
      city: 'Hyderabad',
      cuisine: formData.get('cuisine') as string,
      pricingLevel: formData.get('pricing') as any,
      status: 'pilot',
      startMonth: new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
      lastUpdatedAt: new Date().toISOString(),
      insightHistory: []
    };
    setClients(prev => [newClient, ...prev]);
    setShowNewClientForm(false);
    setSelectedClientId(newClient.id);
    setActiveTab('input');
  };

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
      topItems: activeRecord?.topItems || ['Pending Analysis...'],
      dataQualityScore: data.dataQualityScore
    };

    setRecords(prev => ({
      ...prev,
      [selectedClientId]: [newRecord, ...(prev[selectedClientId] || [])]
    }));
    
    setClients(prev => prev.map(c => c.id === selectedClientId ? { ...c, lastUpdatedAt: new Date().toISOString() } : c));
    setActiveTab('analysis');
    setInsights([]); 
    setIsInsightCommitted(false);
  };

  const handleFetchAiInsights = async () => {
    if (!summary || !activeRecord || !activeClient) return;
    setLoadingInsights(true);
    const results = await generateInsights(
      summary, 
      activeRecord.topItems, 
      activeClient.insightHistory
    );
    setInsights(results);
    setLoadingInsights(false);
    setIsInsightCommitted(false);
  };

  const handleCommitInsights = () => {
    if (!selectedClientId || insights.length === 0 || !activeRecord) return;

    const newHistoryItem: InsightHistoryItem = {
      month: activeRecord.month,
      problems: insights.map(i => i.observation),
      actions: insights.map(i => i.recommendation),
      timestamp: new Date().toISOString()
    };

    setClients(prev => prev.map(c => {
      if (c.id === selectedClientId) {
        return {
          ...c,
          insightHistory: [newHistoryItem, ...c.insightHistory],
          lastUpdatedAt: new Date().toISOString()
        };
      }
      return c;
    }));

    setIsInsightCommitted(true);
  };

  const handleExportPdf = () => {
    window.print();
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[3rem] p-12 shadow-2xl text-center">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl mx-auto mb-8 flex items-center justify-center text-white font-black text-4xl shadow-xl italic">O</div>
          <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">OBIS Terminal</h1>
          <p className="text-slate-500 font-medium mb-10 text-sm">Analyst-only intelligence access</p>
          <div className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="password" placeholder="Analyst Key" defaultValue="••••••••" className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold" />
            </div>
            <button onClick={() => setIsLoggedIn(true)} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-black transition-all shadow-xl active:scale-95">Unlock Console <ArrowRight className="w-5 h-5" /></button>
          </div>
          <p className="mt-8 text-[9px] font-black uppercase text-slate-400 tracking-widest">v1.4 Internal Release • Hyderabad</p>
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
                <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-xl">O</div>
                <h1 className="text-5xl font-black text-slate-900 tracking-tighter">Portfolio</h1>
              </div>
              <p className="text-slate-500 font-medium ml-1 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-blue-500" /> {clients.length} Business Entities Monitored</p>
            </div>
            <button onClick={() => setShowNewClientForm(true)} className="flex items-center gap-3 bg-slate-900 text-white px-10 py-5 rounded-[1.5rem] font-black shadow-2xl hover:bg-black transition-all hover:scale-105 active:scale-95"><Plus className="w-5 h-5" /> Add New Client</button>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {clients.map(client => {
              const lastUpdated = new Date(client.lastUpdatedAt);
              const isStale = (Date.now() - lastUpdated.getTime()) > 1000 * 60 * 60 * 24 * 7;
              return (
                <button key={client.id} onClick={() => setSelectedClientId(client.id)} className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all text-left group relative overflow-hidden">
                  <div className="flex justify-between items-start mb-10">
                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      client.status === 'pilot' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {client.status}
                    </div>
                    {isStale && <div className="text-rose-600 flex items-center gap-1 text-[9px] font-black uppercase tracking-widest bg-rose-50 px-3 py-1 rounded-full"><Clock className="w-3 h-3" /> Stale</div>}
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 mb-2 leading-tight">{client.name}</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-10">{client.cuisine} • {client.city}</p>
                  <div className="grid grid-cols-2 gap-8 border-t border-slate-50 pt-8">
                    <div>
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Pricing Tier</p>
                      <p className="font-black text-slate-700">{client.pricingLevel}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">History</p>
                      <p className="font-black text-slate-700">{client.insightHistory.length} Cycles</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {showNewClientForm && (
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-6">
            <form onSubmit={handleAddClient} className="bg-white rounded-[4rem] p-16 max-w-xl w-full shadow-2xl animate-in zoom-in-95 duration-300">
              <h3 className="text-4xl font-black mb-2 tracking-tight">New Client Profile</h3>
              <p className="text-slate-500 mb-10 font-medium">Create a baseline for a new restaurant pilot.</p>
              <div className="space-y-8">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Restaurant Name</label>
                  <input name="name" required placeholder="e.g. Hyderabad Grill" className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-3xl font-black focus:ring-4 focus:ring-blue-500/10 outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Cuisine</label>
                    <input name="cuisine" required placeholder="North Indian" className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-3xl font-black outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Type</label>
                    <select name="type" className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-3xl font-black appearance-none outline-none">
                      <option value="Hybrid">Hybrid</option>
                      <option value="Cloud">Cloud Kitchen</option>
                      <option value="Dine-in">Dine-in</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-6 pt-6">
                  <button type="button" onClick={() => setShowNewClientForm(false)} className="flex-1 py-5 text-slate-500 font-black">Cancel</button>
                  <button type="submit" className="flex-1 bg-slate-900 text-white py-5 rounded-3xl font-black shadow-2xl active:scale-95 transition-transform">Start Pilot</button>
                </div>
              </div>
            </form>
          </div>
        )}
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
            <span className={`w-2 h-2 rounded-full ${summary?.performanceBand.level === 'Healthy' ? 'bg-emerald-500' : summary?.performanceBand.level === 'Weak' ? 'bg-amber-500' : 'bg-rose-500'}`}></span>
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">{activeClient?.status} Active</p>
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
        <div className="mt-auto space-y-6">
          <div className="bg-slate-800/50 p-6 rounded-[2.5rem] border border-white/5 shadow-inner">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Meeting Mode</span>
              <button onClick={() => setMeetingMode(!meetingMode)} className="transition-transform active:scale-90">
                {meetingMode ? <ToggleOn className="w-8 h-8 text-blue-400" /> : <Toggle className="w-8 h-8 text-slate-600" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed font-medium">Hides internal risk flags & raw metrics for clean client presentation.</p>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="no-print sticky top-0 z-30 bg-white/70 backdrop-blur-2xl border-b border-slate-200 px-12 py-7 flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">{activeTab.replace('analysis', 'Engine Result')}</h2>
          <div className="flex items-center gap-6">
            {meetingMode && <div className="text-blue-600 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 animate-pulse text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><EyeOff className="w-4 h-4" /> Meeting Mode Active</div>}
            <div className="h-10 w-px bg-slate-200"></div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{activeRecord?.month || 'New Dataset'}</div>
          </div>
        </header>

        <div className="p-10 lg:p-14 max-w-6xl mx-auto w-full pb-24">
          {activeTab === 'input' && <DataInputForm onSave={handleSaveData} />}
          {activeTab === 'analysis' && summary && dashboardData && (
            <div className="space-y-16">
              {!meetingMode && <Dashboard summary={summary} revenue={dashboardData.revenue} costs={dashboardData.costs} />}
              <AnalystConsole summary={summary} meetingMode={meetingMode} />
            </div>
          )}
          {activeTab === 'insights' && (
            <div className="space-y-16 animate-in fade-in slide-in-from-bottom-6 duration-700">
              <div className="bg-slate-900 rounded-[4rem] p-16 text-white shadow-2xl relative overflow-hidden">
                <div className="relative z-10 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-black uppercase tracking-[0.2em] mb-6"><Sparkles className="w-3 h-3" /> OBIS Insight Engine</div>
                  <h3 className="text-6xl font-black mb-6 leading-tight tracking-tighter">Strategic Drafting</h3>
                  <p className="text-slate-400 mb-10 text-xl font-medium leading-relaxed">Converting raw engine deltas into in-meeting narratives. History is considered for consistency.</p>
                  <div className="flex items-center gap-4">
                    <button onClick={handleFetchAiInsights} disabled={loadingInsights} className="px-12 py-5 bg-blue-600 hover:bg-blue-700 rounded-3xl font-black transition-all shadow-2xl disabled:opacity-50 active:scale-95 text-lg">
                      {loadingInsights ? 'Processing Rules...' : 'Generate New Draft'}
                    </button>
                    {insights.length > 0 && !isInsightCommitted && (
                      <button onClick={handleCommitInsights} className="px-12 py-5 bg-white text-slate-900 hover:bg-slate-100 rounded-3xl font-black transition-all active:scale-95 text-lg flex items-center gap-3">
                        <Archive className="w-5 h-5" /> Commit to History
                      </button>
                    )}
                    {isInsightCommitted && (
                      <div className="px-8 py-5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-3xl font-black flex items-center gap-3">
                        <CheckCircle className="w-5 h-5" /> Draft Archived
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {insights.length > 0 && (
                <div>
                  <h3 className="text-2xl font-black text-slate-900 mb-10 flex items-center gap-4"><Lightbulb className="w-6 h-6 text-blue-600" /> Current Analysis Draft</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {insights.map((insight, idx) => (
                      <div key={idx} className="bg-white p-12 rounded-[4rem] border border-slate-200 shadow-sm hover:shadow-2xl transition-all group flex flex-col">
                        <div className="flex justify-between items-center mb-10">
                          <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full uppercase tracking-widest">Observation #{idx + 1}</span>
                          <div className="text-emerald-600 font-black text-[10px] uppercase tracking-widest">{insight.impactPotential}</div>
                        </div>
                        <h4 className="text-3xl font-black text-slate-900 mb-6 leading-tight group-hover:text-blue-600 transition-colors">{insight.observation}</h4>
                        <p className="text-slate-500 mb-12 font-medium text-lg leading-relaxed">{insight.importance}</p>
                        <div className="mt-auto bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 group-hover:bg-blue-50/50 transition-colors">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Meeting Action</p>
                          <p className="text-lg font-black text-slate-800 leading-snug">{insight.recommendation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          {activeTab === 'export' && summary && (
            <div className="space-y-16 animate-in fade-in duration-700">
              <div className="no-print flex flex-col items-center justify-center py-40 bg-white rounded-[4rem] border-4 border-dashed border-slate-100">
                <div className="w-28 h-28 bg-blue-50 rounded-[2.5rem] flex items-center justify-center mb-10 shadow-2xl shadow-blue-100"><FileText className="w-12 h-12 text-blue-600" /></div>
                <h3 className="text-5xl font-black text-slate-900 mb-6 tracking-tighter">Package Ready</h3>
                <p className="text-slate-500 mb-14 max-w-sm text-center font-medium text-xl leading-relaxed">Generated executive narrative for {activeClient?.name}. Click below to initiate the PDF generation.</p>
                <button 
                  onClick={handleExportPdf}
                  className="px-16 py-6 bg-slate-900 text-white rounded-[2rem] font-black shadow-2xl hover:bg-black transition-all hover:scale-105 active:scale-95 text-xl flex items-center gap-3"
                >
                  <Download className="w-6 h-6" /> Download Meeting PDF
                </button>
              </div>

              {/* PDF CONTENT (Visible only during print or as preview) */}
              <div className="print-only bg-white p-20 border-slate-200 border-2 rounded-[3rem] space-y-20">
                <header className="flex justify-between items-start border-b-8 border-slate-900 pb-12">
                  <div className="space-y-4">
                    <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center text-white font-black text-4xl">O</div>
                    <h1 className="text-6xl font-black tracking-tighter">Executive Intelligence Report</h1>
                    <div className="flex items-center gap-6 text-slate-500 font-black uppercase tracking-widest text-[10px]">
                      <span className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {activeClient?.city}</span>
                      <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {activeRecord?.month} Cycle</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black text-slate-900 uppercase">{activeClient?.name}</p>
                    <p className="text-xs font-bold text-slate-400 tracking-widest uppercase">Proprietary OBIS Analysis</p>
                  </div>
                </header>

                <section className="print-break-inside-avoid space-y-10">
                  <h3 className="text-xs font-black uppercase tracking-[0.4em] text-slate-400">Section I: Performance Health Band</h3>
                  <div className="flex gap-16 items-center">
                    <div className={`text-9xl font-black tracking-tighter ${summary.performanceBand.level === 'Healthy' ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {summary.performanceBand.level}
                    </div>
                    <div className="space-y-4 max-w-xl">
                      <p className="text-4xl font-bold leading-tight">{summary.performanceBand.narrative.health}</p>
                      <div className="flex gap-8">
                        <div>
                          <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Net Margin</p>
                          <p className="text-3xl font-black">{summary.margin.toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Total Revenue</p>
                          <p className="text-3xl font-black">₹{(summary.revenue/100000).toFixed(2)}L</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="print-break-inside-avoid grid grid-cols-2 gap-16">
                  <div className="space-y-8">
                    <h3 className="text-xs font-black uppercase tracking-[0.4em] text-slate-400">Section II: Core Metrics</h3>
                    <div className="space-y-6">
                      {[
                        { label: 'Food Cost (COGS)', val: `${summary.foodCostPct.toFixed(1)}%`, target: '30%' },
                        { label: 'Staffing Efficiency', val: `${summary.staffCostPct.toFixed(1)}%`, target: '20%' },
                        { label: 'Online Dependency', val: `${summary.onlineDependencyPct.toFixed(1)}%`, target: '<40%' }
                      ].map((m, i) => (
                        <div key={i} className="flex justify-between items-center py-4 border-b border-slate-100">
                          <span className="font-bold text-lg">{m.label}</span>
                          <span className="font-black text-xl">{m.val} <span className="text-[10px] text-slate-300 ml-2">Target: {m.target}</span></span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-8">
                    <h3 className="text-xs font-black uppercase tracking-[0.4em] text-slate-400">Section III: Delta Shifts</h3>
                    <div className="bg-slate-50 p-10 rounded-[2.5rem] space-y-4">
                      <p className="text-2xl font-bold italic leading-relaxed text-slate-700">"{summary.performanceBand.narrative.change}"</p>
                    </div>
                  </div>
                </section>

                <section className="print-break-inside-avoid space-y-10">
                   <h3 className="text-xs font-black uppercase tracking-[0.4em] text-slate-400">Section IV: Strategic Roadmap</h3>
                   <div className="bg-slate-900 text-white p-16 rounded-[4rem] space-y-10">
                      <div className="space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Primary Recommendation</p>
                        <h4 className="text-5xl font-black leading-tight">{summary.performanceBand.narrative.action}</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-12 border-t border-white/10 pt-10">
                        <div className="space-y-2">
                          <p className="text-xl font-bold text-slate-400">Operational Tactic 01</p>
                          <p className="text-sm text-slate-300">Calibrate procurement cycles to match off-peak volume; aim for a 3% reduction in waste leakage.</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xl font-bold text-slate-400">Profit Growth 01</p>
                          <p className="text-sm text-slate-300">Relocate top 3 margin-positive items to "prime visual zones" on delivery aggregator menus.</p>
                        </div>
                      </div>
                   </div>
                </section>

                <footer className="pt-20 border-t border-slate-100 flex justify-between items-center">
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">OBIS Confidential • Analyst: Internal v1.4 • Hyderabad</p>
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Page 1 of 1</p>
                </footer>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;