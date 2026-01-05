
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Plus, ArrowLeft, ShieldCheck, ArrowRight, Sparkles, Download, 
  RefreshCw, Trash2, FileText, CheckCircle2, XCircle, FileInput, BarChart3, Lightbulb, Monitor, Upload, History, Zap, Target, Star, HelpCircle, Activity, LayoutGrid, IndianRupee, ShieldAlert, Save, Eye, Users, Utensils, TrendingUp, Filter, Calendar, AlertCircle, Info, Database, Link2Off, Key
} from 'lucide-react';
import { AnalystConsole } from './components/AnalystConsole';
import { Dashboard } from './components/Dashboard';
import { DataInputForm } from './components/DataInputForm';
import { MenuIntelligence } from './components/MenuIntelligence';
import { Client, MonthlyRecord, BusinessSummary, DecisionStatus, DecisionLogEntry, AiInsight, MenuItem, ClientStatus } from './types';
import { generateInsights } from './geminiService';
import { runAnalyticsEngine } from './services/analyticsEngine';
import { MOCK_CLIENTS, MOCK_RECORDS, BENCHMARKS } from './constants';

const App: React.FC = () => {
  // 1. STATE HOOKS
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
  const [lifecycleFilter, setLifecycleFilter] = useState<ClientStatus | 'all'>('all');
  const [isApiAuthError, setIsApiAuthError] = useState(false);

  // --- UNIFIED DATA PIPELINE ---
  const normalizeMonthlyRecord = (record: any): MonthlyRecord => {
    const revenue = record.revenue || {};
    const costs = record.costs || {};
    return {
      clientId: record.clientId || '',
      month: record.month || new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
      revenue: {
        total: Number(revenue.total || 0),
        online: Number(revenue.online || 0),
        offline: Number(revenue.offline || (Number(revenue.total || 0) - Number(revenue.online || 0))),
        orders: Number(revenue.orders || 0),
      },
      costs: {
        food: Number(costs.food || 0),
        staff: Number(costs.staff || 0),
        rent: Number(costs.rent || 0),
        utilities: Number(costs.utilities || 0),
        marketing: Number(costs.marketing || 0),
        packaging: Number(costs.packaging || 0),
        discounts: Number(costs.discounts || 0),
      },
      topItems: Array.isArray(record.topItems) ? record.topItems : [],
      menuItems: (record.menuItems || []).map((i: any) => ({
        name: i.name || 'Unnamed Item',
        price: Number(i.price || 0),
        cost: Number(i.cost || 0),
        sold: Number(i.sold || 0),
        contribution: (Number(i.price || 0) - Number(i.cost || 0)) * Number(i.sold || 0),
        popularityRank: i.popularityRank || 0,
        profitRank: i.profitRank || 0
      })),
      dataQualityScore: Number(record.dataQualityScore || 100)
    };
  };

  // 2. MEMO HOOKS
  const activeClient = useMemo(() => clients.find(c => c.id === selectedClientId), [selectedClientId, clients]);
  const clientRecords = useMemo(() => selectedClientId ? records[selectedClientId] || [] : [], [selectedClientId, records]);
  const activeRecord = clientRecords[0] || null;
  const previousRecord = clientRecords[1] || null;

  const summary = useMemo(() => {
    if (!activeRecord) return null;
    return runAnalyticsEngine(activeRecord, previousRecord);
  }, [activeRecord, previousRecord]);

  const portfolioStats = useMemo(() => {
    return clients
      .filter(c => lifecycleFilter === 'all' || c.status === lifecycleFilter)
      .map(client => {
        const recs = records[client.id] || [];
        let eng = null;
        try { eng = recs[0] ? runAnalyticsEngine(recs[0], recs[1]) : null; } catch (e) {}
        const lastUpdate = client.lastUpdatedAt || new Date().toISOString();
        const isStale = (Date.now() - new Date(lastUpdate).getTime()) > 1000 * 60 * 60 * 24 * 7;
        let baseScore = eng ? eng.attentionScore || 0 : 50;
        if (client.status === 'paused') baseScore *= 0.6;
        if (client.status === 'inactive') baseScore *= 0.1;
        const finalScore = baseScore + (isStale ? 15 : 0);
        return { client, score: Math.min(100, finalScore), health: eng?.performanceBand?.level || 'Healthy', risk: eng?.riskLevel || 'Low' };
      })
      .sort((a, b) => b.score - a.score);
  }, [clients, records, lifecycleFilter]);

  const menuQuadrants = useMemo(() => {
    if (!summary?.rankedMenuItems || summary.rankedMenuItems.length === 0) return { stars: [], puzzles: [], horses: [], dogs: [] };
    const items = summary.rankedMenuItems;
    const avgSold = items.reduce((acc, i) => acc + i.sold, 0) / items.length;
    const avgProfit = items.reduce((acc, i) => acc + (i.contribution / i.sold), 0) / items.length;
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

  // 3. EFFECT HOOKS
  useEffect(() => { localStorage.setItem('OBIS_CLIENTS', JSON.stringify(clients)); }, [clients]);
  useEffect(() => { localStorage.setItem('OBIS_RECORDS', JSON.stringify(records)); }, [records]);
  useEffect(() => { setLoggedDecisions(new Set()); if (selectedClientId) { setActiveTab('analysis'); setMeetingMode(false); setIsApiAuthError(false); } }, [selectedClientId]);

  // 4. HANDLERS
  const handleRepairApiKey = async () => {
    try {
      if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
        await window.aistudio.openSelectKey();
        setIsApiAuthError(false);
        setLoadingInsights(false);
      } else {
        alert("API Key selection interface is currently unavailable.");
      }
    } catch (e) { console.error("Failed to open key selector:", e); }
  };

  const handleExportBackup = () => {
    const data = { clients, records, version: '1.6.5', timestamp: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OBIS_Backup_${new Date().toLocaleDateString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.clients && data.records) {
          if (confirm("Merge/overwrite existing local data?")) {
            const normalizedRecords: Record<string, MonthlyRecord[]> = {};
            Object.keys(data.records).forEach(clientId => {
              normalizedRecords[clientId] = (data.records[clientId] || []).map((r: any) => normalizeMonthlyRecord(r));
            });
            setClients(data.clients);
            setRecords(normalizedRecords);
            alert("Backup Restored Successfully.");
          }
        }
      } catch (err) { alert("Invalid backup file."); }
    };
    reader.readAsText(file);
  };

  const handleSaveData = (data: any) => {
    if (!selectedClientId) return;
    const rawRecord = {
      clientId: selectedClientId,
      month: new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
      revenue: { total: Number(data.revenue), online: Number(data.online), orders: Number(data.orders) },
      costs: { food: Number(data.foodCost), staff: Number(data.staff), rent: Number(data.rent), utilities: Number(data.utilities), marketing: Number(data.marketing), packaging: Number(data.packaging), discounts: Number(data.discounts) },
      topItems: (data.menuItems || []).slice(0, 3).map((i: any) => i.name),
      menuItems: data.menuItems,
      dataQualityScore: Number(data.dataQualityScore)
    };
    const normalized = normalizeMonthlyRecord(rawRecord);
    setRecords(prev => ({ ...prev, [selectedClientId]: [normalized, ...(prev[selectedClientId] || [])].slice(0, 12) }));
    setClients(prev => prev.map(c => c.id === selectedClientId ? { ...c, lastUpdatedAt: new Date().toISOString() } : c));
    setActiveTab('analysis');
  };

  const handleDeleteClient = (id: string, e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!window.confirm("Permanently remove this restaurant?")) return;
    setClients(prev => prev.filter(c => c.id !== id));
    setRecords(prev => { const n = { ...prev }; delete n[id]; return n; });
    if (selectedClientId === id) setSelectedClientId(null);
  };

  const handleFetchAiInsights = async () => {
    if (!summary || !activeRecord || !selectedClientId) return;
    setLoadingInsights(true);
    setIsApiAuthError(false);
    try {
      const results = await generateInsights(summary, activeRecord.topItems ?? [], activeClient?.insightHistory ?? []);
      if (results && results.length > 0) {
        const hasAuthError = results.some(ins => ins.observation === "API Key Rejected");
        if (hasAuthError) {
          setIsApiAuthError(true);
        } else {
          setClients(prev => prev.map(c => c.id === selectedClientId ? { ...c, currentInsights: results } : c));
        }
      }
    } catch (e: any) {
      console.error(e);
      setIsApiAuthError(true);
    } finally { setLoadingInsights(false); }
  };

  const handleLogDecision = (insight: AiInsight, status: DecisionStatus, insightId: string) => {
    if (!selectedClientId || !activeClient) return;
    const entry: DecisionLogEntry = { id: Math.random().toString(36).substr(2, 9), recommendation: insight.recommendation, status, notes: '', timestamp: new Date().toISOString(), targetMonth: activeRecord?.month || 'N/A' };
    setClients(prev => prev.map(c => {
      if (c.id !== selectedClientId) return c;
      let updatedHistory = [...(c.insightHistory || [])];
      if (status === 'Accepted') {
        const currentMonth = activeRecord?.month || 'N/A';
        const existingHistoryIdx = updatedHistory.findIndex(h => h.month === currentMonth);
        if (existingHistoryIdx > -1) {
          updatedHistory[existingHistoryIdx].problems = Array.from(new Set([...updatedHistory[existingHistoryIdx].problems, insight.observation]));
          updatedHistory[existingHistoryIdx].actions = Array.from(new Set([...updatedHistory[existingHistoryIdx].actions, insight.recommendation]));
        } else {
          updatedHistory.push({ month: currentMonth, problems: [insight.observation], actions: [insight.recommendation], timestamp: new Date().toISOString() });
        }
      }
      return { ...c, decisionLog: [entry, ...(c.decisionLog || [])], insightHistory: updatedHistory };
    }));
    setLoggedDecisions(prev => new Set(prev).add(insightId));
  };

  const getStatusColor = (status: ClientStatus) => {
    switch (status) {
      case 'pilot': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'active': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'paused': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'inactive': return 'bg-slate-100 text-slate-500 border-slate-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'Healthy': return 'bg-emerald-100 text-emerald-700';
      case 'Weak': return 'bg-amber-100 text-amber-700';
      case 'Dangerous': return 'bg-rose-100 text-rose-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getPriorityColor = (score: number) => {
    if (score >= 75) return 'text-rose-600 bg-rose-50 border-rose-100';
    if (score >= 40) return 'text-amber-600 bg-amber-50 border-amber-100';
    return 'text-blue-600 bg-blue-50 border-blue-100';
  };

  const getConfidenceLevel = (rawScore: number) => {
    // Normalize score: Handle both 0-1 and 0-100 ranges
    const score = rawScore <= 1 ? rawScore * 100 : rawScore;
    if (score >= 85) return { label: 'High', color: 'text-emerald-500 bg-emerald-50 border-emerald-100', value: Math.round(score) };
    if (score >= 60) return { label: 'Medium', color: 'text-blue-500 bg-blue-50 border-blue-100', value: Math.round(score) };
    return { label: 'Low', color: 'text-rose-500 bg-rose-50 border-rose-100', value: Math.round(score) };
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
        <div className="max-w-7xl mx-auto space-y-12">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-4">
              <h1 className="text-6xl font-black text-slate-900 tracking-tighter">Portfolio</h1>
              <div className="flex flex-wrap items-center gap-2">
                {[{id:'all',label:'All Projects'},{id:'active',label:'Active'},{id:'pilot',label:'Pilot'},{id:'paused',label:'Paused'},{id:'inactive',label:'Archive'}].map(f => (
                  <button key={f.id} onClick={() => setLifecycleFilter(f.id as any)} className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${lifecycleFilter === f.id ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-400 hover:text-slate-600 border border-slate-200'}`}>{f.label}</button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <label className="cursor-pointer bg-white border border-slate-200 text-slate-600 px-6 py-4 rounded-2xl font-black text-xs shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2"><Database className="w-4 h-4" /> Restore JSON<input type="file" accept=".json" onChange={handleImportBackup} className="hidden" /></label>
              <button onClick={handleExportBackup} className="bg-white border border-slate-200 text-slate-600 px-6 py-4 rounded-2xl font-black text-xs shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2"><Download className="w-4 h-4" /> Backup JSON</button>
              <button onClick={() => setShowNewClientForm(true)} className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black shadow-xl hover:bg-blue-700 transition-all flex items-center gap-2"><Plus className="w-5 h-5" /> Add New Client</button>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {portfolioStats.map(({ client, score, health, risk }) => (
              <div key={client.id} onClick={() => setSelectedClientId(client.id)} className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm hover:shadow-2xl transition-all text-left relative group flex flex-col h-full overflow-hidden cursor-pointer">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600 opacity-[0.02] rounded-full blur-3xl group-hover:scale-150 transition-all"></div>
                <div className="flex justify-between items-start mb-10 relative z-10">
                  <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusColor(client.status)}`}>{client.status}</div>
                  <button onClick={(e) => handleDeleteClient(client.id, e)} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100 z-20"><Trash2 className="w-5 h-5" /></button>
                </div>
                <div className="flex-1 relative z-10">
                  <h3 className="text-3xl font-black text-slate-900 mb-2 leading-[1.1] tracking-tight">{client.name}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">{client.cuisine} • {client.city}</p>
                  <div className="space-y-3 mb-8">
                    <div className="flex justify-between items-end">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Attention Priority</p>
                      <p className={`text-xl font-black ${score >= 75 ? 'text-rose-600' : score >= 40 ? 'text-amber-600' : 'text-blue-600'}`}>{score.toFixed(0)}</p>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-1000 ${score >= 75 ? 'bg-rose-500' : score >= 40 ? 'bg-amber-500' : 'bg-blue-500'}`} style={{ width: `${score}%` }} />
                    </div>
                  </div>
                </div>
                <div className="pt-8 border-t border-slate-50 flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${getPriorityColor(score)}`}><Activity className="w-3 h-3" />{score >= 75 ? 'Critical' : score >= 40 ? 'Moderate' : 'Stable'}</div>
                    <div className={`px-3 py-1.5 rounded-full ${getHealthColor(health)}`}>{health}</div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 transition-all group-hover:translate-x-2" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {showNewClientForm && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="max-w-2xl w-full bg-white rounded-[4rem] p-16 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none"><Zap className="w-40 h-40 text-blue-600" /></div>
               <h2 className="text-5xl font-black mb-12 tracking-tight">Onboard Entity</h2>
               <div className="space-y-8 mb-12">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Restaurant Name</label><input id="new-name" placeholder="Grand Palace" className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-[2rem] font-bold text-sm outline-none focus:border-blue-500 transition-all" /></div>
                    <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">City</label><input id="new-city" placeholder="Hyderabad" className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-[2rem] font-bold text-sm outline-none focus:border-blue-500 transition-all" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Cuisine Type</label><input id="new-cuisine" placeholder="Mughlai / Continental" className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-[2rem] font-bold text-sm outline-none focus:border-blue-500 transition-all" /></div>
                    <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Establishment Type</label><select id="new-type" className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-[2rem] font-bold text-sm outline-none focus:border-blue-500 transition-all"><option value="Hybrid">Hybrid (Dine-in + Cloud)</option><option value="Dine-in">Dine-in Only</option><option value="Cloud">Cloud Kitchen</option></select></div>
                  </div>
               </div>
               <div className="flex gap-4">
                  <button onClick={() => setShowNewClientForm(false)} className="flex-1 py-5 bg-slate-100 text-slate-900 rounded-[2rem] font-black uppercase tracking-widest text-[10px]">Cancel</button>
                  <button onClick={() => {
                     const n = (document.getElementById('new-name') as HTMLInputElement).value;
                     const c = (document.getElementById('new-city') as HTMLInputElement).value;
                     const cuisine = (document.getElementById('new-cuisine') as HTMLInputElement).value;
                     const type = (document.getElementById('new-type') as HTMLSelectElement).value as any;
                     if(!n || !c) return;
                     const newClient: Client = { id: `c-${Date.now()}`, name: n, type: type || 'Hybrid', city: c, cuisine: cuisine || 'Multi-cuisine', pricingLevel: 'Mid', status: 'pilot', startMonth: new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }), lastUpdatedAt: new Date().toISOString(), insightHistory: [], decisionLog: [] };
                     setClients([...clients, newClient]);
                     setShowNewClientForm(false);
                  }} className="flex-1 py-5 bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-200">Initialize Client</button>
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
        <button onClick={() => setSelectedClientId(null)} className="flex items-center gap-3 text-slate-500 hover:text-white mb-14 transition-colors font-bold text-sm"><ArrowLeft className="w-5 h-5" /> Portfolio</button>
        <div className="mb-12 px-2 text-white">
          <div className={`inline-block px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest mb-4 border ${getStatusColor(activeClient?.status || 'active')}`}>{activeClient?.status}</div>
          <h2 className="text-3xl font-black mb-2 leading-tight tracking-tight">{activeClient?.name}</h2>
          <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2"><Monitor className="w-3 h-3" /> System Linked</p>
        </div>
        <nav className="space-y-3 flex-1">
          {[{id:'input',label:'Data Entry',icon:FileInput},{id:'analysis',label:'Health Check',icon:BarChart3},{id:'insights',label:'Strategy Drafts',icon:Lightbulb},{id:'export',label:'Report Builder',icon:FileText}].map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`w-full flex items-center gap-4 px-6 py-5 rounded-2xl transition-all ${activeTab === item.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}><item.icon className="w-5 h-5" /> <span className="font-bold text-sm">{item.label}</span></button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="no-print sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-slate-200 px-12 py-7 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">{activeTab}</h2>
            {activeTab === 'analysis' && <button onClick={() => setMeetingMode(!meetingMode)} className={`flex items-center gap-2 px-4 py-2 rounded-full font-black text-[10px] uppercase transition-all shadow-sm ${meetingMode ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-500'}`}>{meetingMode ? <Eye className="w-3 h-3" /> : <Monitor className="w-3 h-3" />} Meeting Mode</button>}
          </div>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{activeRecord?.month} Reporting</div>
        </header>

        <div className="p-10 lg:p-14 max-w-7xl mx-auto w-full pb-24 no-print">
          {activeTab === 'input' && <DataInputForm onSave={handleSaveData} initialData={activeRecord} />}
          {activeTab === 'analysis' && summary && dashboardData && (
            <div className="space-y-16">
              {!meetingMode && <Dashboard summary={summary} revenue={dashboardData.revenue} costs={dashboardData.costs} />}
              <AnalystConsole summary={summary} meetingMode={meetingMode} />
              {!meetingMode && summary.rankedMenuItems && <MenuIntelligence menu={summary.rankedMenuItems} />}
            </div>
          )}
          {activeTab === 'insights' && (
            <div className="space-y-20">
               <div className="bg-slate-900 rounded-[3.5rem] p-20 text-white shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-20 opacity-10"><Sparkles className="w-40 h-40" /></div>
                 <div className="relative z-10 max-w-2xl">
                   <h3 className="text-6xl font-black mb-8 tracking-tighter">AI Intelligence</h3>
                   <p className="text-slate-400 font-medium mb-10 text-xl leading-relaxed">The engine analyzes metrics vs. benchmarks and considers previous approved actions to ensure consistent growth advice.</p>
                   <button onClick={handleFetchAiInsights} disabled={loadingInsights} className="px-14 py-6 bg-blue-600 rounded-[2rem] font-black text-lg transition-all flex items-center gap-4 disabled:opacity-50 hover:bg-blue-700 shadow-2xl shadow-blue-900/40">
                      {loadingInsights ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />} {loadingInsights ? 'Drafting Mandates...' : 'Start Logic Analysis'}
                   </button>
                 </div>
               </div>

               {isApiAuthError && (
                 <div className="bg-rose-50 border-2 border-rose-100 rounded-[3rem] p-12 flex flex-col items-center text-center space-y-6 animate-in zoom-in-95 duration-300">
                    <div className="w-20 h-20 bg-rose-100 rounded-3xl flex items-center justify-center text-rose-600 shadow-sm"><Key className="w-10 h-10" /></div>
                    <div className="max-w-md">
                      <h3 className="text-3xl font-black text-slate-900 mb-2">AI Authentication Failed</h3>
                      <p className="text-slate-500 font-medium">Authentication required. Please repair your API connection to continue.</p>
                    </div>
                    <button onClick={handleRepairApiKey} className="px-12 py-5 bg-rose-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:bg-rose-700 shadow-xl shadow-rose-200 transition-all active:scale-95"><RefreshCw className="w-4 h-4" /> Initialize Official API Connection</button>
                 </div>
               )}

               {!isApiAuthError && (
                 <div className="space-y-8">
                   <h4 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.4em] ml-2">Active Recommendations</h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                     {activeClient?.currentInsights?.map((ins, idx) => {
                        const insightId = `ins-${idx}`;
                        const hasBeenLogged = loggedDecisions.has(insightId);
                        const confidence = getConfidenceLevel(ins.confidenceScore);
                        return (
                          <div key={idx} className={`bg-white p-12 rounded-[4rem] border transition-all ${hasBeenLogged ? 'border-emerald-200 bg-emerald-50/20 opacity-80' : 'border-slate-200 shadow-xl'}`}>
                            <div className="flex justify-between items-center mb-8"><div className="flex flex-col gap-1"><span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${confidence.color}`}>Confidence: {confidence.label} ({confidence.value}%)</span><p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter ml-1 leading-tight"><Info className="w-2 h-2 inline mr-1" /> {ins.confidenceReason}</p></div>{hasBeenLogged && <CheckCircle2 className="w-8 h-8 text-emerald-500" />}</div>
                            <h4 className="text-2xl font-black mb-6 leading-tight text-slate-900">{ins.observation}</h4>
                            <p className="text-slate-500 mb-10 text-sm font-medium leading-relaxed">{ins.importance}</p>
                            <div className="p-10 bg-slate-950 rounded-[3rem] text-white">
                              <p className="text-xl font-black italic leading-tight mb-8">"{ins.recommendation}"</p>
                              {!hasBeenLogged && <div className="flex gap-4"><button onClick={() => handleLogDecision(ins, 'Accepted', insightId)} className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-600">Approve</button><button onClick={() => handleLogDecision(ins, 'Rejected', insightId)} className="flex-1 py-4 bg-slate-800 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-700">Dismiss</button></div>}
                            </div>
                          </div>
                        );
                     })}
                   </div>
                 </div>
               )}
               {/* Previous context sections... */}
            </div>
          )}
          {activeTab === 'export' && (
            <div className="py-40 bg-white rounded-[5rem] border border-slate-200 text-center shadow-2xl">
              <div className="w-32 h-32 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-12"><FileText className="w-16 h-16 text-blue-600" /></div>
              <h3 className="text-5xl font-black mb-6 tracking-tighter uppercase">Executive PDF</h3>
              <p className="text-slate-400 mb-12 font-medium max-w-sm mx-auto text-lg">Download boardroom-ready strategic report.</p>
              <button onClick={() => window.print()} className="px-16 py-7 bg-slate-900 text-white rounded-[2rem] font-black text-xl shadow-2xl hover:scale-105 transition-all"><Download className="w-6 h-6 inline mr-3" /> Generate Official Report</button>
            </div>
          )}
        </div>

        {summary && activeClient && activeRecord && (
          <div className="print-only">
            <div className="pdf-page">
              <header className="flex justify-between items-end pb-12 border-b-[6px] border-slate-900 mb-16"><div className="space-y-3"><div className="text-[12px] font-black uppercase text-blue-600 tracking-[0.5em]">STRATEGIC AUDIT</div><h1 className="text-6xl font-black tracking-tighter uppercase leading-[0.9] print-text-huge">{activeClient.name}</h1><p className="text-lg font-bold text-slate-400 uppercase tracking-[0.3em]">{activeRecord.month.toUpperCase()} PERFORMANCE CYCLE</p></div><div className="text-[6rem] font-black italic text-slate-900 leading-none">O</div></header>
              <div className="pdf-section"><h2 className="text-3xl font-black mb-10 uppercase border-l-[1rem] border-blue-600 pl-8 print-text-large">Profitability Matrix</h2><div className="grid grid-cols-2 gap-10"><div className="pdf-card"><p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Gross Revenue</p><p className="text-5xl font-black print-text-huge">₹{(summary.revenue / 100000).toFixed(1)}L</p>{summary.deltas && (<div className={`flex items-center gap-2 mt-4 font-black ${summary.deltas.revenue >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{summary.deltas.revenue >= 0 ? <TrendingUp className="w-4 h-4" /> : <Activity className="w-4 h-4" />}{summary.deltas.revenue >= 0 ? '+' : ''}{summary.deltas.revenue.toFixed(1)}% vs. Prev</div>)}</div><div className="pdf-card"><p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Net Efficiency</p><p className={`text-5xl font-black print-text-huge ${summary.margin > 15 ? 'text-emerald-600' : 'text-rose-600'}`}>{summary.margin.toFixed(0)}%</p><p className="text-sm font-black text-slate-400 mt-4 tracking-widest uppercase opacity-60">Operating Margin</p></div></div></div>
              <div className="pdf-section flex-1 mt-10"><h2 className="text-3xl font-black mb-10 uppercase border-l-[1rem] border-emerald-500 pl-8 print-text-large">AI Strategic Roadmap</h2><div className="space-y-8">{(activeClient.currentInsights || []).slice(0, 3).map((ins, i) => { const confidence = getConfidenceLevel(ins.confidenceScore); return (<div key={i} className="pdf-card border-l-[1.5rem] border-blue-600 bg-white rounded-r-[3rem] rounded-l-none shadow-sm"><div className="flex items-start gap-6 mb-4"><div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-2xl shrink-0">{i+1}</div><div className="flex-1 space-y-2"><div className="flex justify-between items-center mb-2"><h4 className="text-2xl font-black text-slate-900 leading-tight">{ins.observation}</h4><div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${confidence.color}`}>{confidence.label} Confidence ({confidence.value}%)</div></div><div className="p-8 bg-blue-50/70 rounded-[2.5rem] border border-blue-100/50 mt-4"><p className="text-xl font-black text-slate-900 leading-snug print-text-med italic">"{ins.recommendation}"</p><p className="text-[10px] font-bold text-slate-400 mt-4 uppercase tracking-tighter">Logic Validation: {ins.confidenceReason}</p></div></div></div></div>); })}</div></div>
              <footer className="pt-10 border-t border-slate-200 flex justify-between items-center text-[11px] font-black text-slate-400 uppercase tracking-widest"><span>OBIS Intelligence System v1.6.5</span><span>Page 01 // Executive Snapshot</span></footer>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
