import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Plus, ArrowLeft, ShieldCheck, ArrowRight, Sparkles, Download, 
  RefreshCw, Trash2, FileText, CheckCircle2, XCircle, FileInput, BarChart3, Lightbulb, Monitor, Upload, History, Zap, Target, Star, HelpCircle, Activity, LayoutGrid, IndianRupee, ShieldAlert, Save, Eye, Users, Utensils, TrendingUp
} from 'lucide-react';
import { AnalystConsole } from './components/AnalystConsole';
import { Dashboard } from './components/Dashboard';
import { DataInputForm } from './components/DataInputForm';
import { MenuIntelligence } from './components/MenuIntelligence';
import { Client, MonthlyRecord, BusinessSummary, DecisionStatus, DecisionLogEntry, AiInsight, InsightHistoryItem } from './types';
import { generateInsights } from './geminiService';
import { runAnalyticsEngine } from './services/analyticsEngine';
import { MOCK_CLIENTS, MOCK_RECORDS, BENCHMARKS } from './constants';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('OBIS_CLIENTS');
    if (saved) { try { return JSON.parse(saved); } catch (e) { return MOCK_CLIENTS; } }
    return MOCK_CLIENTS;
  });
  const [records, setRecords] = useState<Record<string, MonthlyRecord[]>>(() => {
    const saved = localStorage.getItem('OBIS_RECORDS');
    if (saved) { try { return JSON.parse(saved); } catch (e) { return MOCK_RECORDS; } }
    return MOCK_RECORDS;
  });
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'input' | 'analysis' | 'insights' | 'export'>('analysis');
  const [meetingMode, setMeetingMode] = useState(false);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [loggedDecisions, setLoggedDecisions] = useState<Set<string>>(new Set());

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { localStorage.setItem('OBIS_CLIENTS', JSON.stringify(clients)); }, [clients]);
  useEffect(() => { localStorage.setItem('OBIS_RECORDS', JSON.stringify(records)); }, [records]);
  
  useEffect(() => { 
    setLoggedDecisions(new Set()); 
    if (selectedClientId) {
      setActiveTab('analysis');
      setMeetingMode(false);
    }
  }, [selectedClientId]);

  const activeClient = useMemo(() => clients.find(c => c.id === selectedClientId), [selectedClientId, clients]);
  const clientRecords = useMemo(() => selectedClientId ? records[selectedClientId] || [] : [], [selectedClientId, records]);
  const activeRecord = clientRecords[0] || null;
  const previousRecord = clientRecords[1] || null;

  const summary = useMemo(() => {
    if (!activeRecord) return null;
    return runAnalyticsEngine(activeRecord, previousRecord);
  }, [activeRecord, previousRecord]);

  const portfolioStats = useMemo(() => {
    return clients.map(client => {
      const recs = records[client.id] || [];
      let eng = null;
      try { eng = recs[0] ? runAnalyticsEngine(recs[0], recs[1]) : null; } catch (e) {}
      const lastUpdate = client.lastUpdatedAt || new Date().toISOString();
      const isStale = (Date.now() - new Date(lastUpdate).getTime()) > 1000 * 60 * 60 * 24 * 7;
      const score = eng ? (eng.attentionScore || 0) + (isStale ? 20 : 0) : 100;
      return { client, score, status: eng?.performanceBand?.level || 'Healthy', risk: eng?.riskLevel || 'Low' };
    }).sort((a, b) => b.score - a.score);
  }, [clients, records]);

  const menuQuadrants = useMemo(() => {
    if (!summary?.rankedMenuItems) return { stars: [], puzzles: [], horses: [], dogs: [] };
    const items = summary.rankedMenuItems;
    const avgSold = items.reduce((a, i) => a + i.sold, 0) / items.length;
    const avgProfit = items.reduce((a, i) => a + (i.contribution / i.sold), 0) / items.length;
    return {
      stars: items.filter(i => i.sold >= avgSold && (i.contribution / i.sold) >= avgProfit),
      puzzles: items.filter(i => i.sold < avgSold && (i.contribution / i.sold) >= avgProfit),
      horses: items.filter(i => i.sold >= avgSold && (i.contribution / i.sold) < avgProfit),
      dogs: items.filter(i => i.sold < avgSold && (i.contribution / i.sold) < avgProfit)
    };
  }, [summary]);

  const dashboardData = useMemo(() => {
    if (!activeRecord) return null;
    return {
      revenue: [
        { channel: 'Online', gross: Number(activeRecord.revenue?.online) || 0, net: (Number(activeRecord.revenue?.online) || 0) * 0.72 },
        { channel: 'Offline', gross: Number(activeRecord.revenue?.offline) || 0, net: (Number(activeRecord.revenue?.offline) || 0) * 0.95 }
      ],
      costs: [
        { name: 'Food', value: Number(activeRecord.costs?.food) || 0 },
        { name: 'Staff', value: Number(activeRecord.costs?.staff) || 0 },
        { name: 'Rent', value: Number(activeRecord.costs?.rent) || 0 },
        { name: 'Marketing', value: Number(activeRecord.costs?.marketing) || 0 },
        { name: 'Packaging', value: Number(activeRecord.costs?.packaging) || 0 },
        { name: 'Utilities', value: Number(activeRecord.costs?.utilities) || 0 },
        { name: 'Discounts', value: Number(activeRecord.costs?.discounts) || 0 }
      ]
    };
  }, [activeRecord]);

  const handleSaveData = (data: any) => {
    if (!selectedClientId) return;
    const newRecord: MonthlyRecord = {
      clientId: selectedClientId,
      month: new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
      revenue: { total: Number(data.revenue), online: Number(data.online), offline: Number(data.revenue) - Number(data.online), orders: Number(data.orders) },
      costs: { food: Number(data.foodCost), staff: Number(data.staff), rent: Number(data.rent), utilities: Number(data.utilities), marketing: Number(data.marketing), packaging: Number(data.packaging), discounts: Number(data.discounts) },
      topItems: data.menuItems?.slice(0, 3).map((i: any) => i.name) || [],
      menuItems: data.menuItems || [],
      dataQualityScore: Number(data.dataQualityScore)
    };
    setRecords(prev => ({ ...prev, [selectedClientId]: [newRecord, ...(prev[selectedClientId] || [])].slice(0, 12) }));
    setClients(prev => prev.map(c => c.id === selectedClientId ? { ...c, lastUpdatedAt: new Date().toISOString() } : c));
    setActiveTab('analysis');
  };

  const handleDeleteClient = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Remove this client?")) return;
    setClients(prev => prev.filter(c => c.id !== id));
    if (selectedClientId === id) setSelectedClientId(null);
  };

  const handleFetchAiInsights = async () => {
    if (!summary || !activeRecord || !selectedClientId) return;
    setLoadingInsights(true);
    try {
      const results = await generateInsights(summary, activeRecord.topItems, activeClient?.insightHistory || []);
      if (results && results.length > 0) {
        setClients(prev => prev.map(c => c.id === selectedClientId ? { ...c, currentInsights: results } : c));
      }
    } catch (e: any) {
      alert(`AI Engine Failure: Check terminal. Ensure process.env.API_KEY is active.`);
    } finally { 
      setLoadingInsights(false); 
    }
  };

  const handleLogDecision = (insight: AiInsight, status: DecisionStatus, insightId: string) => {
    if (!selectedClientId || !activeClient) return;
    
    // 1. Log to Decision Log
    const entry: DecisionLogEntry = { 
      id: Math.random().toString(36).substr(2, 9), 
      recommendation: insight.recommendation, 
      status, 
      notes: '', 
      timestamp: new Date().toISOString(), 
      targetMonth: activeRecord?.month || 'N/A' 
    };

    setClients(prev => prev.map(c => {
      if (c.id !== selectedClientId) return c;
      
      let updatedHistory = [...(c.insightHistory || [])];
      
      // 2. If Approved, update insightHistory for AI consistency
      if (status === 'Accepted') {
        const currentMonth = activeRecord?.month || 'N/A';
        const existingHistoryIdx = updatedHistory.findIndex(h => h.month === currentMonth);
        
        if (existingHistoryIdx > -1) {
          updatedHistory[existingHistoryIdx].problems = Array.from(new Set([...updatedHistory[existingHistoryIdx].problems, insight.observation]));
          updatedHistory[existingHistoryIdx].actions = Array.from(new Set([...updatedHistory[existingHistoryIdx].actions, insight.recommendation]));
        } else {
          updatedHistory.push({
            month: currentMonth,
            problems: [insight.observation],
            actions: [insight.recommendation],
            timestamp: new Date().toISOString()
          });
        }
      }

      return { 
        ...c, 
        decisionLog: [entry, ...(c.decisionLog || [])],
        insightHistory: updatedHistory
      };
    }));
    
    setLoggedDecisions(prev => new Set(prev).add(insightId));
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white rounded-[3rem] p-12 shadow-2xl">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl mx-auto mb-8 flex items-center justify-center text-white font-black text-4xl shadow-xl italic">O</div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">OBIS Terminal</h1>
          <button onClick={() => setIsLoggedIn(true)} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black flex items-center justify-center gap-2 mt-8 hover:bg-black transition-all">Unlock Console <ArrowRight className="w-5 h-5" /></button>
        </div>
      </div>
    );
  }

  if (!selectedClientId) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 lg:p-12">
        <div className="max-w-6xl mx-auto space-y-12">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-2">
              <h1 className="text-5xl font-black text-slate-900 tracking-tighter">Portfolio</h1>
              <p className="text-slate-500 font-medium ml-1 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-blue-500" /> Strategic Monitor: {portfolioStats.length} Entities</p>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setShowNewClientForm(true)} className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-black shadow-xl">
                <Plus className="w-5 h-5 inline mr-2" /> Add Client
              </button>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {portfolioStats.map(({ client, score, status, risk }) => (
              <button key={client.id} onClick={() => setSelectedClientId(client.id)} className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm hover:shadow-2xl transition-all text-left relative group">
                <div className="flex justify-between items-start mb-10">
                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${status === 'Healthy' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{status}</div>
                  <Trash2 onClick={(e) => handleDeleteClient(client.id, e)} className="w-5 h-5 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100" />
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-2 leading-tight">{client.name}</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-10">{client.cuisine} • {client.city}</p>
                <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                   <Activity className="w-3 h-3" /> Score: {score.toFixed(0)}
                   <TrendingUp className="w-3 h-3" /> {risk} Risk
                </div>
              </button>
            ))}
          </div>
        </div>
        {showNewClientForm && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md z-50 flex items-center justify-center p-6">
            <div className="max-w-2xl w-full bg-white rounded-[3rem] p-12">
               <h2 className="text-4xl font-black mb-10 tracking-tight">New Client</h2>
               <div className="space-y-6 mb-10">
                  <input id="new-name" placeholder="Restaurant Name" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-bold" />
                  <input id="new-city" placeholder="City" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-bold" />
                  <input id="new-cuisine" placeholder="Cuisine (e.g. Italian)" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-bold" />
               </div>
               <div className="flex gap-4">
                  <button onClick={() => setShowNewClientForm(false)} className="flex-1 py-4 bg-slate-100 text-slate-900 rounded-xl font-black">Cancel</button>
                  <button onClick={() => {
                     const n = (document.getElementById('new-name') as HTMLInputElement).value;
                     const c = (document.getElementById('new-city') as HTMLInputElement).value;
                     const cu = (document.getElementById('new-cuisine') as HTMLInputElement).value;
                     if(!n || !c) return;
                     const newClient: Client = { id: `c-${Date.now()}`, name: n, type: 'Hybrid', city: c, cuisine: cu || 'General', pricingLevel: 'Mid', status: 'active', startMonth: 'Jan 2026', lastUpdatedAt: new Date().toISOString(), insightHistory: [], decisionLog: [] };
                     setClients([...clients, newClient]);
                     setShowNewClientForm(false);
                  }} className="flex-1 py-4 bg-blue-600 text-white rounded-xl font-black">Create</button>
               </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      <aside className="no-print hidden lg:flex w-80 bg-slate-900 flex-col p-8 h-screen sticky top-0">
        <button onClick={() => setSelectedClientId(null)} className="flex items-center gap-3 text-slate-500 hover:text-white mb-14 transition-colors font-bold text-sm">
          <ArrowLeft className="w-5 h-5" /> Portfolio
        </button>
        <div className="mb-12 px-2 text-white">
          <h2 className="text-2xl font-black mb-2 leading-tight">{activeClient?.name}</h2>
          <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2"><Monitor className="w-3 h-3" /> Terminal Active</p>
        </div>
        <nav className="space-y-3 flex-1">
          {[
            { id: 'input', label: 'Data Entry', icon: FileInput },
            { id: 'analysis', label: 'Health Check', icon: BarChart3 },
            { id: 'insights', label: 'Strategy Drafts', icon: Lightbulb },
            { id: 'export', label: 'Report Builder', icon: FileText }
          ].map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`w-full flex items-center gap-4 px-6 py-5 rounded-2xl transition-all ${activeTab === item.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
              <item.icon className="w-5 h-5" /> <span className="font-bold text-sm">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="no-print sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-slate-200 px-12 py-7 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">{activeTab}</h2>
            {activeTab === 'analysis' && (
              <button onClick={() => setMeetingMode(!meetingMode)} className={`flex items-center gap-2 px-4 py-2 rounded-full font-black text-[10px] uppercase transition-all shadow-sm ${meetingMode ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-500'}`}>
                {meetingMode ? <Eye className="w-3 h-3" /> : <Monitor className="w-3 h-3" />} Meeting Mode
              </button>
            )}
          </div>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{activeRecord?.month} Reporting</div>
        </header>

        <div className="p-10 lg:p-14 max-w-6xl mx-auto w-full pb-24 no-print">
          {activeTab === 'input' && <DataInputForm onSave={handleSaveData} initialData={activeRecord} />}
          {activeTab === 'analysis' && summary && dashboardData && (
            <div className="space-y-16">
              {!meetingMode && <Dashboard summary={summary} revenue={dashboardData.revenue} costs={dashboardData.costs} />}
              <AnalystConsole summary={summary} meetingMode={meetingMode} />
              {!meetingMode && summary.rankedMenuItems && <MenuIntelligence menu={summary.rankedMenuItems} />}
            </div>
          )}
          {activeTab === 'insights' && (
            <div className="space-y-12">
               <div className="bg-slate-900 rounded-[3.5rem] p-20 text-white shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-20 opacity-10"><Sparkles className="w-40 h-40" /></div>
                 <div className="relative z-10 max-w-2xl">
                   <h3 className="text-6xl font-black mb-8 tracking-tighter">AI Intelligence</h3>
                   <p className="text-slate-400 font-medium mb-10 text-xl leading-relaxed">The engine analyzes metrics vs. benchmarks and considers your previous approved actions to ensure consistent growth advice.</p>
                   <button onClick={handleFetchAiInsights} disabled={loadingInsights} className="px-14 py-6 bg-blue-600 rounded-[2rem] font-black text-lg transition-all flex items-center gap-4 disabled:opacity-50 hover:bg-blue-700 shadow-2xl shadow-blue-900/40">
                      {loadingInsights ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />} {loadingInsights ? 'Drafting Mandates...' : 'Start Logic Analysis'}
                   </button>
                 </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 {activeClient?.currentInsights?.map((ins, idx) => {
                    const insightId = `ins-${idx}`;
                    const hasBeenLogged = loggedDecisions.has(insightId);
                    return (
                      <div key={idx} className={`bg-white p-14 rounded-[4rem] border transition-all ${hasBeenLogged ? 'border-emerald-200 bg-emerald-50/20 opacity-80' : 'border-slate-200 shadow-xl'}`}>
                        <div className="flex justify-between items-center mb-8">
                          <span className={`text-[10px] font-black uppercase tracking-widest ${ins.confidenceScore > 85 ? 'text-emerald-500' : 'text-blue-500'}`}>Confidence: {ins.confidenceScore}%</span>
                          {hasBeenLogged && <CheckCircle2 className="w-8 h-8 text-emerald-500" />}
                        </div>
                        <h4 className="text-3xl font-black mb-6 leading-tight text-slate-900">{ins.observation}</h4>
                        <p className="text-slate-500 mb-10 text-xl font-medium leading-relaxed">{ins.importance}</p>
                        <div className="p-10 bg-slate-950 rounded-[3rem] text-white">
                          <p className="text-2xl font-black italic leading-tight mb-8">"{ins.recommendation}"</p>
                          {!hasBeenLogged && (
                            <div className="flex gap-4">
                              <button onClick={() => handleLogDecision(ins, 'Accepted', insightId)} className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-600">Approve</button>
                              <button onClick={() => handleLogDecision(ins, 'Rejected', insightId)} className="flex-1 py-4 bg-slate-800 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-700">Dismiss</button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                 })}
               </div>
            </div>
          )}
          {activeTab === 'export' && (
            <div className="py-40 bg-white rounded-[5rem] border border-slate-200 text-center shadow-2xl">
              <div className="w-32 h-32 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-12">
                <FileText className="w-16 h-16 text-blue-600" />
              </div>
              <h3 className="text-5xl font-black mb-6 tracking-tighter uppercase">Executive PDF</h3>
              <p className="text-slate-400 mb-12 font-medium max-w-sm mx-auto text-lg">Download the multi-page boardroom-ready strategic report.</p>
              <button onClick={() => window.print()} className="px-16 py-7 bg-slate-900 text-white rounded-[2rem] font-black text-xl shadow-2xl hover:scale-105 transition-all">
                <Download className="w-6 h-6 inline mr-3" /> Generate Official Report
              </button>
            </div>
          )}
        </div>

        {/* --- SPACIOUS MULTI-PAGE OWNER REPORT --- */}
        {summary && activeClient && activeRecord && (
          <div className="print-only">
            {/* PAGE 1: EXECUTIVE KPIs & MANDATES */}
            <div className="pdf-page">
              <header className="flex justify-between items-end pb-12 border-b-[6px] border-slate-900 mb-16">
                <div className="space-y-3">
                  <div className="text-[12px] font-black uppercase text-blue-600 tracking-[0.5em]">STRATEGIC AUDIT</div>
                  <h1 className="text-6xl font-black tracking-tighter uppercase leading-[0.9] print-text-huge">{activeClient.name}</h1>
                  <p className="text-lg font-bold text-slate-400 uppercase tracking-[0.3em]">{activeRecord.month.toUpperCase()} PERFORMANCE CYCLE</p>
                </div>
                <div className="text-[6rem] font-black italic text-slate-900 leading-none">O</div>
              </header>

              <div className="pdf-section">
                <h2 className="text-3xl font-black mb-10 uppercase border-l-[1rem] border-blue-600 pl-8 print-text-large">Profitability Matrix</h2>
                <div className="grid grid-cols-2 gap-10">
                  <div className="pdf-card">
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Gross Revenue</p>
                    <p className="text-5xl font-black print-text-huge">₹{(summary.revenue / 100000).toFixed(1)}L</p>
                    {summary.deltas && (
                       <div className={`flex items-center gap-2 mt-4 font-black ${summary.deltas.revenue >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                         {summary.deltas.revenue >= 0 ? <TrendingUp className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                         {summary.deltas.revenue >= 0 ? '+' : ''}{summary.deltas.revenue.toFixed(1)}% vs. Prev
                       </div>
                    )}
                  </div>
                  <div className="pdf-card">
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Net Efficiency</p>
                    <p className={`text-5xl font-black print-text-huge ${summary.margin > 15 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {summary.margin.toFixed(0)}%
                    </p>
                    <p className="text-sm font-black text-slate-400 mt-4 tracking-widest uppercase opacity-60">Operating Margin</p>
                  </div>
                </div>
              </div>

              <div className="pdf-section flex-1 mt-10">
                <h2 className="text-3xl font-black mb-10 uppercase border-l-[1rem] border-emerald-500 pl-8 print-text-large">AI Strategic Roadmap</h2>
                <div className="space-y-8">
                  {(activeClient.currentInsights || []).slice(0, 3).map((ins, i) => (
                    <div key={i} className="pdf-card border-l-[1.5rem] border-blue-600 bg-white rounded-r-[3rem] rounded-l-none shadow-sm">
                      <div className="flex items-start gap-6 mb-4">
                        <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-2xl shrink-0">{i+1}</div>
                        <div className="space-y-2">
                           <h4 className="text-2xl font-black text-slate-900 leading-tight">{ins.observation}</h4>
                           <div className="p-8 bg-blue-50/70 rounded-[2.5rem] border border-blue-100/50 mt-4">
                             <p className="text-xl font-black text-slate-900 leading-snug print-text-med italic">"{ins.recommendation}"</p>
                           </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <footer className="pt-10 border-t border-slate-200 flex justify-between items-center text-[11px] font-black text-slate-400 uppercase tracking-widest">
                <span>OBIS Business Intelligence System v1.6.5</span>
                <span>Page 01 // Executive Snapshot</span>
              </footer>
            </div>

            {/* PAGE 2: BENCHMARK ANALYSIS */}
            <div className="pdf-page">
              <header className="mb-16">
                 <h2 className="text-3xl font-black uppercase border-l-[1rem] border-blue-600 pl-8 print-text-large">Boardroom Benchmarks</h2>
                 <p className="text-slate-400 font-bold ml-12 mt-2 uppercase tracking-widest">Efficiency vs. Industry Standards</p>
              </header>
              
              <div className="pdf-section grid grid-cols-1 gap-14">
                {[
                  { label: BENCHMARKS.foodCostPct.label, val: summary.foodCostPct, range: BENCHMARKS.foodCostPct.healthy, invert: true },
                  { label: BENCHMARKS.staffCostPct.label, val: summary.staffCostPct, range: BENCHMARKS.staffCostPct.healthy, invert: true },
                  { label: BENCHMARKS.netMargin.label, val: summary.margin, range: BENCHMARKS.netMargin.healthy }
                ].map((b, i) => {
                  const isSafe = b.invert ? b.val <= b.range[1] : b.val >= b.range[0];
                  return (
                    <div key={i} className="pdf-card bg-white p-12 space-y-8 shadow-sm">
                      <div className="flex justify-between items-center">
                        <h4 className="text-2xl font-black uppercase tracking-wider text-slate-900">{b.label}</h4>
                        <div className={`px-6 py-2 rounded-full text-[11px] font-black uppercase tracking-widest shadow-inner ${isSafe ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                          {isSafe ? 'Target Status: Met' : 'Target Status: Action Required'}
                        </div>
                      </div>
                      <div className="h-12 bg-slate-100 rounded-full relative overflow-hidden border-2 border-slate-200 shadow-inner">
                        <div className={`h-full transition-all ${isSafe ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: `${Math.min(100, (b.val/50)*100)}%` }} />
                        <div className="absolute inset-y-0 border-x-[3px] border-slate-900/10" style={{ left: `${(b.range[0]/50)*100}%`, width: `${((b.range[1]-b.range[0])/50)*100}%`, background: 'rgba(0,0,0,0.05)' }}></div>
                      </div>
                      <div className="flex justify-between items-center">
                         <p className="text-2xl font-black text-slate-900">Current Performance: {b.val.toFixed(1)}%</p>
                         <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Ideal Health Band: {b.range[0]}-{b.range[1]}%</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pdf-section flex-1 mt-10">
                <h2 className="text-3xl font-black mb-10 uppercase border-l-[1rem] border-amber-500 pl-8 print-text-large">Dependency Matrix</h2>
                <div className="grid grid-cols-2 gap-10">
                  <div className="pdf-card p-12">
                    <div className="flex items-center gap-4 mb-6">
                      <Monitor className="w-8 h-8 text-blue-600" />
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Aggregator Drift</p>
                    </div>
                    <p className="text-5xl font-black print-text-huge">{summary.onlineDependencyPct.toFixed(0)}%</p>
                    <p className="text-sm font-bold text-slate-400 mt-6 uppercase tracking-wider">{summary.onlineDependencyPct > 55 ? 'High Digital Reliance' : 'Strong Offline Base'}</p>
                  </div>
                  <div className="pdf-card p-12">
                    <div className="flex items-center gap-4 mb-6">
                      <Users className="w-8 h-8 text-emerald-600" />
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Direct Channel Mix</p>
                    </div>
                    <p className="text-5xl font-black print-text-huge">{(100 - summary.onlineDependencyPct).toFixed(0)}%</p>
                    <p className="text-sm font-bold text-slate-400 mt-6 uppercase tracking-wider">Organic In-store Volume</p>
                  </div>
                </div>
              </div>

              <footer className="pt-10 border-t border-slate-200 flex justify-between items-center text-[11px] font-black text-slate-400 uppercase tracking-widest">
                <span>Audit Context: Confidential</span>
                <span>Page 02 // Operational Deep-Dive</span>
              </footer>
            </div>

            {/* PAGE 3: MENU MATRIX */}
            <div className="pdf-page">
              <header className="mb-16">
                 <h2 className="text-3xl font-black uppercase border-l-[1rem] border-slate-900 pl-8 print-text-large">Menu Intelligence Analysis</h2>
                 <p className="text-slate-400 font-bold ml-12 mt-2 uppercase tracking-widest">Item Popularity vs. Margin Contribution</p>
              </header>
              
              <div className="pdf-section grid grid-cols-2 gap-10 mb-12">
                 {[
                   { title: 'Stars', data: menuQuadrants.stars, icon: Star, color: 'emerald' },
                   { title: 'Puzzles', data: menuQuadrants.puzzles, icon: HelpCircle, color: 'blue' },
                   { title: 'Horses', data: menuQuadrants.horses, icon: TrendingUp, color: 'amber' },
                   { title: 'Dogs', data: menuQuadrants.dogs, icon: Trash2, color: 'rose' }
                 ].map((q, idx) => (
                    <div key={idx} className={`pdf-card border-${q.color}-200 bg-${q.color}-50/20 p-10 min-h-[200px]`}>
                      <div className="flex items-center gap-4 mb-8">
                        <q.icon className={`w-8 h-8 text-${q.color}-600`} />
                        <h4 className={`text-2xl font-black uppercase text-${q.color}-800 tracking-tight`}>{q.title}</h4>
                      </div>
                      <ul className="space-y-4">
                         {q.data.slice(0, 5).map((m, i) => (
                           <li key={i} className="text-lg font-black text-slate-800 flex justify-between items-center border-b border-white/40 pb-2">
                             <span>{m.name}</span> 
                             <span className="text-sm opacity-50 uppercase tracking-widest">₹{(m.price - m.cost).toFixed(0)} Marg</span>
                           </li>
                         ))}
                         {q.data.length === 0 && <li className="text-sm text-slate-400 italic">No items categorized in this band.</li>}
                      </ul>
                    </div>
                 ))}
              </div>

              <div className="pdf-section flex-1 mt-10">
                <h2 className="text-3xl font-black mb-10 uppercase border-l-[1rem] border-slate-400 pl-8 print-text-large">Revenue Contribution Pipeline</h2>
                <div className="overflow-hidden border-2 border-slate-200 rounded-[3rem] shadow-sm">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="px-10 py-6 text-[11px] font-black uppercase text-slate-500 tracking-widest">Item Identifier</th>
                        <th className="px-10 py-6 text-[11px] font-black uppercase text-slate-500 tracking-widest">Unit Margin</th>
                        <th className="px-10 py-6 text-[11px] font-black uppercase text-slate-500 tracking-widest">Units Sold</th>
                        <th className="px-10 py-6 text-[11px] font-black uppercase text-slate-500 tracking-widest text-right">Total Profit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-slate-100 bg-white">
                      {summary.rankedMenuItems.slice(0, 10).map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-10 py-6 text-xl font-black text-slate-900">{item.name}</td>
                          <td className="px-10 py-6 text-lg font-bold text-slate-500">₹{(item.price - item.cost).toFixed(0)}</td>
                          <td className="px-10 py-6 text-lg font-bold text-slate-500">{item.sold}</td>
                          <td className="px-10 py-6 text-2xl font-black text-emerald-600 text-right">₹{item.contribution.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <footer className="pt-10 border-t border-slate-200 flex justify-between items-center text-[11px] font-black text-slate-400 uppercase tracking-widest">
                <span>Report Finalized: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                <span>Page 03 // Menu Intelligence</span>
              </footer>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;