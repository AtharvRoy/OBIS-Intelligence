import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Plus, ArrowLeft, ShieldCheck, ArrowRight, Sparkles, Download, 
  RefreshCw, Trash2, FileText, CheckCircle2, XCircle, FileInput, BarChart3, Lightbulb, Monitor, Upload, History, Zap, Target, Star, HelpCircle, Activity, LayoutGrid, IndianRupee, ShieldAlert, Save
} from 'lucide-react';
import { AnalystConsole } from './components/AnalystConsole';
import { Dashboard } from './components/Dashboard';
import { DataInputForm } from './components/DataInputForm';
import { MenuIntelligence } from './components/MenuIntelligence';
import { Client, MonthlyRecord, BusinessSummary, DecisionStatus, DecisionLogEntry, AiInsight } from './types';
import { generateInsights } from './geminiService';
import { runAnalyticsEngine } from './services/analyticsEngine';
import { MOCK_CLIENTS, MOCK_RECORDS, BENCHMARKS } from './constants';

const App: React.FC = () => {
  // --- 1. HOOKS BLOCK ---
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
    if (selectedClientId) setActiveTab('analysis'); 
  }, [selectedClientId]);

  // Derived State
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

  // --- 2. HANDLERS ---
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

  const handleJsonUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.clients && data.records) {
          // Explicitly set state with new arrays/objects to trigger re-render
          setClients([...data.clients]);
          setRecords({...data.records});
          alert("Import Successful: Intelligence Feed Updated.");
        } else {
          alert("Error: The selected file does not contain valid OBIS intelligence data.");
        }
      } catch (err) { 
        alert("Invalid JSON format. Please ensure you are uploading a previously exported OBIS file."); 
      }
    };
    reader.readAsText(file);
    if(fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleExportData = () => {
    const data = { clients, records, timestamp: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `OBIS_DATA_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleFetchAiInsights = async () => {
    if (!summary || !activeRecord || !selectedClientId) return;
    setLoadingInsights(true);
    try {
      const results = await generateInsights(summary, activeRecord.topItems, activeClient?.insightHistory || []);
      if (results && results.length > 0) {
        setClients(prev => prev.map(c => c.id === selectedClientId ? { ...c, currentInsights: results } : c));
      } else {
        alert("AI Model returned no results. Check your API key or data quality.");
      }
    } catch (e: any) {
      console.error(e);
      const msg = e.message || "Unknown Error";
      alert(`AI Engine Failure: ${msg}\n\nThis usually means the API key is invalid or your region does not support Gemini 3.`);
    } finally { 
      setLoadingInsights(false); 
    }
  };

  const handleLogDecision = (rec: string, status: DecisionStatus, insightId: string) => {
    if (!selectedClientId) return;
    const entry: DecisionLogEntry = { id: Math.random().toString(36).substr(2, 9), recommendation: rec, status, notes: '', timestamp: new Date().toISOString(), targetMonth: activeRecord?.month || 'N/A' };
    setClients(prev => prev.map(c => c.id === selectedClientId ? { ...c, decisionLog: [entry, ...(c.decisionLog || [])] } : c));
    setLoggedDecisions(prev => new Set(prev).add(insightId));
  };

  // --- 3. UI RENDERING ---
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white rounded-[3rem] p-12 shadow-2xl animate-in zoom-in duration-300">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl mx-auto mb-8 flex items-center justify-center text-white font-black text-4xl shadow-xl italic">O</div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">OBIS Terminal</h1>
          <p className="text-slate-500 font-medium mb-10 text-sm">Business Intelligence Auth</p>
          <button onClick={() => setIsLoggedIn(true)} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-black transition-all shadow-xl">Unlock Console <ArrowRight className="w-5 h-5" /></button>
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
              <h1 className="text-5xl font-black text-slate-900 tracking-tighter">Portfolio</h1>
              <p className="text-slate-500 font-medium ml-1 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-blue-500" /> Strategic Monitor: {portfolioStats.length} Entities</p>
            </div>
            <div className="flex gap-4">
              <button onClick={handleExportData} className="bg-white text-slate-900 border border-slate-200 px-6 py-4 rounded-2xl font-black shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2">
                <Download className="w-5 h-5" /> Export All
              </button>
              <button onClick={() => fileInputRef.current?.click()} className="bg-white text-slate-900 border border-slate-200 px-6 py-4 rounded-2xl font-black shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2">
                <Upload className="w-5 h-5" /> Import JSON
              </button>
              <button onClick={() => setShowNewClientForm(true)} className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-black shadow-xl hover:scale-105 transition-all">
                <Plus className="w-5 h-5 inline mr-2" /> Add Client
              </button>
              <input ref={fileInputRef} type="file" accept=".json" onChange={handleJsonUpload} className="hidden" />
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {portfolioStats.map(({ client, score, status, risk }) => (
              <button key={client.id} onClick={() => setSelectedClientId(client.id)} className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm hover:shadow-2xl transition-all text-left group overflow-hidden relative">
                <div className="flex justify-between items-start mb-10">
                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${status === 'Healthy' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{status}</div>
                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${score > 60 ? 'bg-rose-600 text-white shadow-lg' : 'bg-slate-100 text-slate-500'}`}>Attention: {score.toFixed(0)}</div>
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-2 leading-tight">{client.name}</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-10">{client.cuisine} • {client.city}</p>
                <div className="grid grid-cols-2 gap-8 border-t border-slate-50 pt-8">
                  <div><p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Activity</p><p className="font-black text-slate-700">{client.decisionLog?.length || 0} Decisions</p></div>
                  <div><p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Risk Profile</p><p className={`font-black ${risk === 'High' ? 'text-rose-600' : 'text-slate-700'}`}>{risk}</p></div>
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {/* RE-DESIGNED ADD CLIENT MODAL */}
        {showNewClientForm && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="max-w-2xl w-full bg-white rounded-[4rem] p-16 relative shadow-2xl animate-in zoom-in duration-300">
               <div className="flex justify-between items-center mb-10">
                  <h2 className="text-5xl font-black text-slate-900 tracking-tighter">New Entity</h2>
                  <button onClick={() => setShowNewClientForm(false)} className="p-3 hover:bg-slate-100 rounded-full transition-colors"><XCircle className="w-8 h-8 text-slate-300" /></button>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Business Name</label>
                    <input id="new-name" placeholder="e.g. Urban Biryani Box" className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-2xl font-black text-lg focus:border-blue-500 outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">City Hub</label>
                    <input id="new-city" placeholder="e.g. Hyderabad" className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-2xl font-black text-lg focus:border-blue-500 outline-none transition-all" />
                  </div>
               </div>
               <div className="flex flex-col gap-4">
                  <button onClick={() => {
                     const n = (document.getElementById('new-name') as HTMLInputElement).value;
                     const c = (document.getElementById('new-city') as HTMLInputElement).value;
                     if(!n || !c) { alert("Please fill all fields."); return; }
                     const newClient: Client = { id: `c-${Date.now()}`, name: n, type: 'Hybrid', city: c, cuisine: 'General', pricingLevel: 'Mid', status: 'active', startMonth: 'Jan 2026', lastUpdatedAt: new Date().toISOString(), insightHistory: [], decisionLog: [] };
                     setClients([...clients, newClient]);
                     setShowNewClientForm(false);
                  }} className="w-full py-6 bg-blue-600 text-white rounded-3xl font-black text-xl shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3">
                     <Plus className="w-6 h-6" /> Create Portfolio Entry
                  </button>
               </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      <aside className="no-print hidden lg:flex w-80 bg-slate-900 flex-col p-8 transition-all h-screen sticky top-0">
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
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">{activeTab}</h2>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{activeRecord?.month} Reporting</div>
        </header>

        <div className="p-10 lg:p-14 max-w-6xl mx-auto w-full pb-24 no-print">
          {activeTab === 'input' && <DataInputForm onSave={handleSaveData} initialData={activeRecord} />}
          {activeTab === 'analysis' && summary && dashboardData && (
            <div className="space-y-16">
              {!meetingMode && <Dashboard summary={summary} revenue={dashboardData.revenue} costs={dashboardData.costs} />}
              <AnalystConsole summary={summary} meetingMode={meetingMode} />
              {summary.rankedMenuItems && <MenuIntelligence menu={summary.rankedMenuItems} />}
            </div>
          )}
          {activeTab === 'insights' && (
            <div className="space-y-12">
              <div className="bg-slate-900 rounded-[3.5rem] p-20 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-20 opacity-5"><Sparkles className="w-48 h-48" /></div>
                <div className="relative z-10 max-w-2xl">
                  <h3 className="text-7xl font-black mb-8 tracking-tighter leading-none">AI Intelligence</h3>
                  <button onClick={handleFetchAiInsights} disabled={loadingInsights} className="px-14 py-6 bg-blue-600 hover:bg-blue-700 rounded-[2rem] font-black text-lg transition-all flex items-center gap-4 active:scale-95 shadow-2xl disabled:opacity-50">
                    {loadingInsights ? <RefreshCw className="w-8 h-8 animate-spin" /> : <Sparkles className="w-8 h-8" />}
                    {loadingInsights ? 'Drafting Strategy...' : 'Start AI Analysis'}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {activeClient?.currentInsights?.map((ins, idx) => {
                   const insightId = `ins-${idx}`;
                   const hasBeenLogged = loggedDecisions.has(insightId);
                   return (
                    <div key={idx} className={`bg-white p-14 rounded-[4rem] border ${hasBeenLogged ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200 shadow-xl'} animate-in slide-in-from-bottom-6 duration-500`}>
                      <div className="flex justify-between items-start mb-10">
                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${ins.confidenceScore > 80 ? 'text-emerald-500' : 'text-amber-500'}`}>Confidence: {ins.confidenceScore}%</span>
                        {hasBeenLogged && <CheckCircle2 className="w-8 h-8 text-emerald-500" />}
                      </div>
                      <h4 className="text-4xl font-black mb-8 leading-tight text-slate-900">{ins.observation}</h4>
                      <p className="text-slate-500 mb-10 text-xl font-medium leading-relaxed">{ins.importance}</p>
                      <div className="p-10 bg-slate-950 rounded-[3rem] text-white">
                        <p className="text-2xl font-black leading-tight mb-10 italic">"{ins.recommendation}"</p>
                        {!hasBeenLogged && (
                          <div className="flex gap-4">
                            <button onClick={() => handleLogDecision(ins.recommendation, 'Accepted', insightId)} className="flex-1 py-5 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-600">Approve</button>
                            <button onClick={() => handleLogDecision(ins.recommendation, 'Rejected', insightId)} className="flex-1 py-5 bg-slate-800 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-700">Dismiss</button>
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
              <div className="w-32 h-32 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-10">
                <FileText className="w-16 h-16 text-blue-600" />
              </div>
              <h3 className="text-5xl font-black mb-6 tracking-tighter uppercase">Executive PDF</h3>
              <p className="text-slate-400 mb-12 font-medium max-w-sm mx-auto text-lg">Clear, spacious business roadmap for the restaurant owner.</p>
              <button onClick={() => window.print()} className="px-16 py-7 bg-slate-900 text-white rounded-[2rem] font-black text-xl shadow-2xl hover:scale-105 transition-all"><Download className="w-6 h-6 inline mr-3" /> Get Official Report</button>
            </div>
          )}
        </div>

        {/* --- SPACIOUS MULTI-PAGE OWNER REPORT --- */}
        {summary && activeClient && activeRecord && (
          <div className="print-only p-12 space-y-32">
            {/* PAGE 1: TITLE & CORE HEALTH */}
            <header className="flex justify-between items-end pb-16 border-b-[12px] border-slate-900 mb-32">
              <div className="space-y-6">
                <div className="text-[18px] font-black uppercase text-blue-600 tracking-[0.6em] mb-4">CONFIDENTIAL BUSINESS AUDIT</div>
                <h1 className="text-9xl font-black tracking-tighter uppercase leading-[0.8]">{activeClient.name}</h1>
                <p className="text-3xl font-bold text-slate-400 uppercase tracking-[0.4em] mt-10">FOR THE MONTH OF {activeRecord.month.toUpperCase()}</p>
              </div>
              <div className="text-[12rem] font-black italic text-slate-900 leading-none">O</div>
            </header>

            <section className="pdf-section">
               <h2 className="text-5xl font-black mb-20 uppercase border-l-[16px] border-blue-600 pl-12">Performance Summary</h2>
               <div className="grid grid-cols-2 gap-20">
                  <div className="pdf-card p-20 rounded-[5rem] bg-slate-950 text-white shadow-2xl">
                    <p className="text-[16px] font-black text-slate-500 uppercase tracking-widest mb-10">Your Total Sales</p>
                    <p className="text-[8rem] font-black tracking-tighter leading-none">₹{(summary.revenue / 100000).toFixed(1)}L</p>
                  </div>
                  <div className="pdf-card p-20 rounded-[5rem] bg-white border-4 border-slate-100 shadow-xl">
                    <p className="text-[16px] font-black text-slate-400 uppercase tracking-widest mb-10">Take-Home Profit</p>
                    <p className={`text-[8rem] font-black tracking-tighter leading-none ${summary.margin > 15 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {summary.margin.toFixed(0)}%
                    </p>
                    <p className="text-xl font-bold text-slate-400 mt-6 italic">Target should be 18-22%</p>
                  </div>
               </div>
               
               <div className="grid grid-cols-2 gap-20 mt-20">
                  <div className="pdf-card p-20 rounded-[5rem] bg-white border-4 border-slate-100 shadow-xl">
                    <p className="text-[16px] font-black text-slate-400 uppercase tracking-widest mb-10">Kitchen Expenses (Food)</p>
                    <p className="text-[6rem] font-black text-slate-900">{summary.foodCostPct.toFixed(0)}%</p>
                    <p className="text-xl font-bold text-slate-400 mt-6 uppercase">Target: Below 33%</p>
                  </div>
                  <div className="pdf-card p-20 rounded-[5rem] bg-white border-4 border-slate-100 shadow-xl">
                    <p className="text-[16px] font-black text-slate-400 uppercase tracking-widest mb-10">Business Strength</p>
                    <p className="text-[6rem] font-black text-slate-900">{summary.structuralResilience}</p>
                  </div>
               </div>
            </section>

            {/* PAGE 2: MENU ANALYSIS */}
            <div className="page-break"></div>

            <section className="pdf-section">
              <h2 className="text-5xl font-black mb-20 uppercase border-l-[16px] border-emerald-500 pl-12">Menu Strategy</h2>
              <p className="text-3xl font-medium text-slate-600 mb-20 leading-relaxed max-w-4xl">We analyzed your entire menu. These are the items that make you the most money and items that need attention.</p>
              
              <div className="grid grid-cols-1 gap-16">
                <div className="pdf-card p-16 bg-emerald-50 border-2 border-emerald-200 rounded-[5rem]">
                   <h4 className="font-black uppercase tracking-[0.4em] text-emerald-700 text-2xl mb-12 flex items-center gap-6"><Star className="w-12 h-12" /> Your Money Makers</h4>
                   <div className="grid grid-cols-2 gap-10">
                    {menuQuadrants.stars.slice(0, 6).map((it, i) => (
                      <div key={i} className="bg-white p-12 rounded-[3rem] shadow-sm flex justify-between items-center">
                        <span className="font-black text-3xl text-slate-800">{it.name}</span>
                        <span className="font-black text-2xl text-emerald-600">₹{it.contribution.toLocaleString()} Profit</span>
                      </div>
                    ))}
                   </div>
                </div>

                <div className="pdf-card p-16 bg-rose-50 border-2 border-rose-200 rounded-[5rem]">
                   <h4 className="font-black uppercase tracking-[0.4em] text-rose-700 text-2xl mb-12 flex items-center gap-6"><Trash2 className="w-12 h-12" /> Action Required</h4>
                   <div className="grid grid-cols-2 gap-10">
                    {menuQuadrants.dogs.slice(0, 6).map((it, i) => (
                      <div key={i} className="bg-white p-12 rounded-[3rem] shadow-sm flex justify-between items-center opacity-60">
                        <span className="font-black text-3xl text-slate-800">{it.name}</span>
                        <span className="font-black text-xl text-rose-600 uppercase italic">Re-evaluate Cost</span>
                      </div>
                    ))}
                   </div>
                </div>
              </div>
            </section>

            {/* PAGE 3: ACTION PLAN */}
            <div className="page-break"></div>

            <section className="pdf-section">
              <h2 className="text-5xl font-black mb-20 uppercase border-l-[16px] border-slate-900 pl-12">Action Roadmap</h2>
              <div className="space-y-24">
                {activeClient.currentInsights?.map((ins, i) => (
                  <div key={i} className="pdf-card p-24 bg-white border-l-[3rem] border-blue-600 rounded-r-[6rem] rounded-l-none shadow-2xl space-y-12">
                    <div className="flex items-center gap-10">
                        <div className="w-20 h-20 bg-slate-900 text-white rounded-3xl flex items-center justify-center font-black text-4xl">{i+1}</div>
                        <h4 className="text-6xl font-black tracking-tighter leading-[0.9] text-slate-900">{ins.observation}</h4>
                    </div>
                    <div className="grid grid-cols-1 gap-12 pt-12 border-t-4 border-slate-50">
                      <div className="space-y-6">
                        <p className="text-[14px] font-black text-slate-400 uppercase tracking-widest">Why it matters</p>
                        <p className="text-3xl font-medium text-slate-500 leading-relaxed">{ins.importance}</p>
                      </div>
                      <div className="p-16 bg-blue-50 rounded-[4rem] border-2 border-blue-100">
                        <p className="text-[14px] font-black text-blue-600 uppercase tracking-widest mb-6">Exactly what to do</p>
                        <p className="text-5xl font-black text-slate-900 leading-[1.1]">{ins.recommendation}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <footer className="pt-24 mt-32 border-t-[12px] border-slate-100 flex justify-between items-center text-xl font-black text-slate-300 uppercase tracking-[0.5em]">
              <p>© OBIS INTELLIGENCE 2026</p>
              <p>CONFIDENTIAL TERMINAL EXPORT</p>
            </footer>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;