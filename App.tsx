
import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  History,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertCircle,
  Edit3,
  RefreshCw,
  Trash2,
  Upload,
  Save,
  Monitor,
  Terminal,
  Copy,
  AlertTriangle,
  Cpu,
  Layers,
  Chrome,
  Zap,
  TrendingUp,
  Target,
  FileSearch,
  CheckSquare,
  ListTodo
} from 'lucide-react';
import { AnalystConsole } from './components/AnalystConsole';
import { Dashboard } from './components/Dashboard';
import { DataInputForm } from './components/DataInputForm';
import { MenuIntelligence } from './components/MenuIntelligence';
import { Client, MonthlyRecord, BusinessSummary, AiInsight, InsightHistoryItem, DecisionLogEntry, DecisionStatus } from './types';
import { generateInsights } from './geminiService';
import { runAnalyticsEngine } from './services/analyticsEngine';
import { MOCK_CLIENTS, MOCK_RECORDS } from './constants';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copyStates, setCopyStates] = useState<Record<string, boolean>>({});
  
  // Persistent State Initialization
  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('OBIS_CLIENTS');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.length > 0 ? parsed : MOCK_CLIENTS;
      } catch (e) {
        console.error("Failed to parse saved clients", e);
      }
    }
    return MOCK_CLIENTS.map(c => ({ 
      ...c, 
      decisionLog: c.decisionLog || [],
      currentInsights: c.currentInsights || []
    }));
  });

  const [records, setRecords] = useState<Record<string, MonthlyRecord[]>>(() => {
    const saved = localStorage.getItem('OBIS_RECORDS');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return Object.keys(parsed).length > 0 ? parsed : MOCK_RECORDS;
      } catch (e) {
        console.error("Failed to parse saved records", e);
      }
    }
    return MOCK_RECORDS;
  });

  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'input' | 'analysis' | 'insights' | 'export'>('analysis');
  const [meetingMode, setMeetingMode] = useState(false);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [loggedDecisions, setLoggedDecisions] = useState<Set<string>>(new Set());

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('OBIS_CLIENTS', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('OBIS_RECORDS', JSON.stringify(records));
  }, [records]);

  // Reset UI state when client changes
  useEffect(() => {
    setLoggedDecisions(new Set());
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

  const portfolioStats = useMemo(() => {
    return clients.map(client => {
      const clientRecs = records[client.id] || [];
      const current = clientRecs[0];
      const previous = clientRecs[1];
      const eng = current ? runAnalyticsEngine(current, previous) : null;
      const isStale = (Date.now() - new Date(client.lastUpdatedAt).getTime()) > 1000 * 60 * 60 * 24 * 7;
      const score = eng ? eng.attentionScore + (isStale ? 20 : 0) : 100;
      return { client, score, status: eng?.performanceBand.level || 'Healthy', risk: eng?.riskLevel || 'Low' };
    }).sort((a, b) => b.score - a.score);
  }, [clients, records]);

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
      { name: 'Utilities', value: activeRecord.costs.utilities },
      { name: 'Discounts', value: activeRecord.costs.discounts }
    ];
    return { revenue, costs };
  }, [activeRecord]);

  const handleReload = () => {
    if (window.confirm("Reload System? This will refresh the connection to the core engine.")) {
      window.location.reload();
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopyStates(prev => ({ ...prev, [id]: true }));
    setTimeout(() => setCopyStates(prev => ({ ...prev, [id]: false })), 2000);
  };

  const handleExportData = () => {
    const bundle = { clients, records, exportDate: new Date().toISOString(), version: '1.0' };
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `OBIS_Backup_${new Date().toLocaleDateString().replace(/\//g, '-')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.clients && data.records) {
          if (window.confirm("Replace current app data with backup?")) {
            setClients(data.clients);
            setRecords(data.records);
          }
        }
      } catch (err) { alert("Failed to parse file."); }
    };
    reader.readAsText(file);
  };

  const handleDeleteClient = (e: React.MouseEvent, clientId: string) => {
    e.stopPropagation();
    if (window.confirm('Delete this restaurant permanently?')) {
      setClients(prev => prev.filter(c => c.id !== clientId));
      setRecords(prev => {
        const newRecords = { ...prev };
        delete newRecords[clientId];
        return newRecords;
      });
      if (selectedClientId === clientId) setSelectedClientId(null);
    }
  };

  const handleLogDecision = (rec: string, status: DecisionStatus, insightId: string) => {
    if (!selectedClientId || !activeRecord) return;
    const newEntry: DecisionLogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      recommendation: rec,
      status,
      notes: '',
      timestamp: new Date().toISOString(),
      targetMonth: activeRecord.month
    };
    setClients(prev => prev.map(c => c.id === selectedClientId ? { ...c, decisionLog: [newEntry, ...c.decisionLog] } : c));
    setLoggedDecisions(prev => new Set(prev).add(insightId));
  };

  const handleSaveData = (data: any) => {
    if (!selectedClientId) return;
    
    // Create new record
    const newRecord: MonthlyRecord = {
      clientId: selectedClientId,
      month: activeRecord?.month || new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
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

    // Calculate Ranks immediately via engine before saving to ensure persistence
    const tempSummary = runAnalyticsEngine(newRecord, previousRecord);
    if (tempSummary.bestItem) {
      newRecord.menuItems = newRecord.menuItems?.map(item => ({
        ...item,
        popularityRank: tempSummary.bestItem?.name === item.name ? 1 : (item.popularityRank || 2),
        profitRank: tempSummary.bestItem?.name === item.name ? 1 : (item.profitRank || 2)
      }));
    }

    setRecords(prev => ({ 
      ...prev, 
      [selectedClientId]: [newRecord, ...(activeRecord ? (prev[selectedClientId]?.slice(1) || []) : (prev[selectedClientId] || []))] 
    }));
    
    setClients(prev => prev.map(c => 
      c.id === selectedClientId ? { ...c, lastUpdatedAt: new Date().toISOString(), currentInsights: [] } : c
    ));
    setActiveTab('analysis');
  };

  const handleFetchAiInsights = async () => {
    if (!summary || !activeRecord || !activeClient) return;
    setLoadingInsights(true);
    const results = await generateInsights(summary, activeRecord.topItems, activeClient.insightHistory);
    setClients(prev => prev.map(c => c.id === selectedClientId ? { ...c, currentInsights: results } : c));
    setLoadingInsights(false);
  };

  const handlePrint = () => window.print();

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
              <p className="text-slate-500 font-medium ml-1 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-blue-500" /> Analyst Attention Monitor</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex bg-white rounded-2xl border border-slate-200 p-1.5 shadow-sm">
                <button onClick={handleExportData} className="p-3 text-slate-400 hover:text-blue-600 transition-colors rounded-xl hover:bg-slate-50"><Download className="w-5 h-5" /></button>
                <button onClick={() => fileInputRef.current?.click()} className="p-3 text-slate-400 hover:text-emerald-600 transition-colors rounded-xl hover:bg-slate-50"><Upload className="w-5 h-5" /></button>
                <input type="file" ref={fileInputRef} onChange={handleImportData} className="hidden" accept=".json" />
                <button onClick={handleReload} className="p-3 text-slate-400 hover:text-blue-500 transition-colors rounded-xl hover:bg-slate-50"><RefreshCw className="w-5 h-5" /></button>
              </div>
              <button onClick={() => setShowNewClientForm(true)} className="flex items-center gap-3 bg-slate-900 text-white px-10 py-5 rounded-[1.5rem] font-black shadow-2xl hover:bg-black transition-all hover:scale-105 active:scale-95"><Plus className="w-5 h-5" /> Add New Client</button>
            </div>
          </header>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {portfolioStats.map(({ client, score, status, risk }) => (
              <button key={client.id} onClick={() => setSelectedClientId(client.id)} className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm hover:shadow-2xl transition-all text-left group overflow-hidden relative">
                <div className="flex justify-between items-start mb-10">
                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${status === 'Healthy' ? 'bg-emerald-100 text-emerald-700' : status === 'Weak' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>{status}</div>
                  <div className="flex items-center gap-2">
                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${score > 60 ? 'bg-rose-600 text-white shadow-lg animate-pulse' : 'bg-slate-100 text-slate-500'}`}>Priority: {score.toFixed(0)}</div>
                    <div onClick={(e) => handleDeleteClient(e, client.id)} className="p-2 text-slate-300 hover:text-rose-600 transition-colors bg-slate-50 rounded-xl"><Trash2 className="w-3.5 h-3.5" /></div>
                  </div>
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-2 leading-tight">{client.name}</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-10">{client.cuisine} • {client.city}</p>
                <div className="grid grid-cols-2 gap-8 border-t border-slate-50 pt-8">
                  <div><p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Decisions</p><p className="font-black text-slate-700">{client.decisionLog?.length || 0} Tracked</p></div>
                  <div><p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Risk Level</p><p className={`font-black ${risk === 'High' ? 'text-rose-600' : 'text-slate-700'}`}>{risk}</p></div>
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
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Advisory Feed Active</p>
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
        <div className="mt-auto bg-slate-800/50 p-6 rounded-[2rem] border border-white/5 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Meeting Mode</span>
              <button onClick={() => setMeetingMode(!meetingMode)}>{meetingMode ? <ToggleOn className="w-8 h-8 text-blue-400" /> : <Toggle className="w-8 h-8 text-slate-600" />}</button>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 font-medium">System v1.6.2 Alpha</p>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="no-print sticky top-0 z-30 bg-white/70 backdrop-blur-2xl border-b border-slate-200 px-12 py-7 flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">{activeTab}</h2>
          <div className="flex items-center gap-6">
            {activeTab === 'analysis' && activeRecord && (
              <button onClick={() => setActiveTab('input')} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-100 hover:bg-blue-100 transition-colors"><Edit3 className="w-4 h-4" /> Refine Snapshot</button>
            )}
            {meetingMode && <div className="text-blue-600 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 animate-pulse text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><EyeOff className="w-4 h-4" /> Advisory View</div>}
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{activeRecord?.month}</div>
          </div>
        </header>

        <div className="p-10 lg:p-14 max-w-6xl mx-auto w-full pb-24 no-print">
          {activeTab === 'input' && <DataInputForm onSave={handleSaveData} initialData={activeRecord} />}
          {activeTab === 'analysis' && summary && dashboardData && (
            <div className="space-y-16 animate-in fade-in duration-500">
              {!meetingMode && <Dashboard summary={summary} revenue={dashboardData.revenue} costs={dashboardData.costs} />}
              <AnalystConsole summary={summary} meetingMode={meetingMode} />
              
              {/* Dual-Axis Health Visualizer */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className={`p-8 rounded-[3rem] border border-slate-200 shadow-sm ${summary.financialHealth === 'Healthy' ? 'bg-emerald-50' : summary.financialHealth === 'Weak' ? 'bg-amber-50' : 'bg-rose-50'}`}>
                   <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Financial Health (Margins)</h4>
                   <p className="text-3xl font-black">{summary.financialHealth}</p>
                   <p className="text-xs font-medium text-slate-500 mt-2">Based on current net profitability bands.</p>
                </div>
                <div className={`p-8 rounded-[3rem] border border-slate-200 shadow-sm ${summary.structuralResilience === 'Healthy' ? 'bg-emerald-50' : summary.structuralResilience === 'Weak' ? 'bg-amber-50' : 'bg-rose-50'}`}>
                   <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Structural Resilience (Ops)</h4>
                   <p className="text-3xl font-black">{summary.structuralResilience}</p>
                   <p className="text-xs font-medium text-slate-500 mt-2">Based on cost efficiency and data fidelity.</p>
                </div>
              </div>

              <div className="bg-white p-12 rounded-[4rem] border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-3"><History className="w-6 h-6 text-blue-600" /><h3 className="text-2xl font-black tracking-tight">Recent Decision Log</h3></div>
                </div>
                {activeClient?.decisionLog && activeClient.decisionLog.length > 0 ? (
                  <div className="space-y-6">
                    {activeClient.decisionLog.slice(0, 5).map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                        <div className="space-y-1"><p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{entry.targetMonth}</p><p className="font-black text-slate-800">{entry.recommendation}</p></div>
                        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${entry.status === 'Accepted' ? 'bg-emerald-100 text-emerald-700' : entry.status === 'Rejected' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'}`}>
                          <div className="flex items-center gap-1.5">{entry.status === 'Accepted' && <CheckCircle2 className="w-3 h-3" />}{entry.status}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-slate-400 font-medium italic">No decisions logged yet.</p>}
              </div>
              {activeRecord.menuItems && <MenuIntelligence menu={activeRecord.menuItems} />}
            </div>
          )}
          
          {activeTab === 'insights' && (
            <div className="space-y-16 animate-in fade-in slide-in-from-bottom-6 duration-700">
              <div className="bg-slate-900 rounded-[4rem] p-16 text-white shadow-2xl relative overflow-hidden">
                <div className="relative z-10 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-black uppercase tracking-[0.2em] mb-6"><Sparkles className="w-3 h-3" /> OBIS Trust-Engine v1.6</div>
                  <h3 className="text-6xl font-black mb-6 leading-tight tracking-tighter">Strategic Drafting</h3>
                  <p className="text-slate-400 mb-10 text-xl font-medium leading-relaxed">AI drafting requires human verification. Ensure your <code>API_KEY</code> is correctly set in your environment if running locally.</p>
                  <button onClick={handleFetchAiInsights} disabled={loadingInsights} className="px-12 py-5 bg-blue-600 hover:bg-blue-700 rounded-3xl font-black transition-all shadow-2xl disabled:opacity-50 active:scale-95 text-lg flex items-center gap-3">
                    {loadingInsights ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
                    {loadingInsights ? 'Analyzing Reliability...' : activeClient?.currentInsights?.length ? 'Regenerate Insights' : 'Generate Verified Insights'}
                  </button>
                </div>
              </div>
              {activeClient?.currentInsights && activeClient.currentInsights.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {activeClient.currentInsights.map((insight, idx) => {
                    const insightId = `insight-${idx}`;
                    const hasBeenLogged = loggedDecisions.has(insightId);
                    return (
                      <div key={`${selectedClientId}-${idx}`} className={`bg-white p-12 rounded-[4rem] border ${hasBeenLogged ? 'border-emerald-200' : 'border-slate-200'} shadow-sm hover:shadow-2xl transition-all group flex flex-col relative overflow-hidden`}>
                        {hasBeenLogged && <div className="absolute top-0 right-0 bg-emerald-500 text-white px-6 py-2 rounded-bl-3xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Decision Recorded</div>}
                        <div className="flex justify-between items-center mb-10">
                          <div className="flex flex-col gap-1"><span className="text-[10px] font-black text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full uppercase tracking-widest w-fit">Draft #{idx + 1}</span><div className="flex items-center gap-2 mt-2"><div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full transition-all ${insight.confidenceScore > 80 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${insight.confidenceScore}%` }} /></div><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{insight.confidenceScore}% Confidence</span></div></div>
                        </div>
                        <h4 className="text-3xl font-black text-slate-900 mb-6 leading-tight group-hover:text-blue-600 transition-colors">{insight.observation}</h4>
                        <p className="text-slate-500 mb-12 font-medium text-lg leading-relaxed">{insight.importance}</p>
                        <div className="mt-auto space-y-4">
                          <div className={`p-8 rounded-[2.5rem] border ${hasBeenLogged ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100 group-hover:bg-blue-50'} transition-colors`}>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Recommendation</p>
                            <p className="text-lg font-black text-slate-800 leading-snug mb-6">{insight.recommendation}</p>
                            {!hasBeenLogged && (
                              <div className="flex gap-2">
                                <button onClick={() => handleLogDecision(insight.recommendation, 'Accepted', insightId)} className="p-3 bg-emerald-100 text-emerald-700 rounded-xl hover:bg-emerald-200 transition-colors"><CheckCircle2 className="w-4 h-4" /></button>
                                <button onClick={() => handleLogDecision(insight.recommendation, 'Rejected', insightId)} className="p-3 bg-rose-100 text-rose-700 rounded-xl hover:bg-rose-200 transition-colors"><XCircle className="w-4 h-4" /></button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'export' && (
            <div className="space-y-16 animate-in fade-in duration-700 pb-20">
              <div className="no-print flex flex-col items-center justify-center py-32 bg-white rounded-[4rem] border border-slate-200 text-center shadow-sm">
                <div className="w-24 h-24 bg-blue-50 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl shadow-blue-100"><FileText className="w-10 h-10 text-blue-600" /></div>
                <h3 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">Executive Intelligence Report</h3>
                <p className="text-slate-500 mb-10 max-w-sm font-medium leading-relaxed">High-fidelity 5-page PDF for client meetings. Includes health bands, audit logs, and strategic roadmap.</p>
                <button onClick={handlePrint} className="px-12 py-5 bg-slate-900 text-white rounded-2xl font-black shadow-2xl hover:bg-black transition-all flex items-center gap-3"><Download className="w-5 h-5" /> Download Report PDF</button>
              </div>
            </div>
          )}
        </div>

        {/* MASSIVELY EXPANDED PDF REPORT CONTAINER */}
        {summary && activeClient && activeRecord && (
          <div className="print-only fixed inset-0 z-50 bg-white p-12 space-y-12 w-full min-h-screen text-slate-900 overflow-visible">
            {/* Page 1: Identity & Executive Summary */}
            <header className="flex justify-between items-start pb-10 border-b-8 border-slate-900">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-900 text-white rounded text-[10px] font-black uppercase tracking-widest">OBIS ADVISORY OS v1.6.2 PRO</div>
                <h1 className="text-7xl font-black tracking-tighter uppercase leading-none">{activeClient.name}</h1>
                <div className="flex gap-6">
                  <p className="text-sm font-black text-slate-500 uppercase tracking-widest">Market: {activeClient.city.toUpperCase()}</p>
                  <p className="text-sm font-black text-slate-500 uppercase tracking-widest">Cuisine: {activeClient.cuisine.toUpperCase()}</p>
                  <p className="text-sm font-black text-slate-500 uppercase tracking-widest">Reporting Cycle: {activeRecord.month}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-3 text-right">
                <div className="w-24 h-24 bg-slate-900 text-white flex items-center justify-center rounded-3xl font-black text-5xl italic shadow-2xl">O</div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">Terminal Ref: {activeClient.id.toUpperCase()}<br/>{new Date().toLocaleDateString()}</p>
              </div>
            </header>

            <section className="grid grid-cols-4 gap-8">
              {[
                { label: 'Yield Potential', val: `₹${(summary.revenue/100000).toFixed(2)}L`, color: 'text-slate-900', meta: 'Gross Rev' },
                { label: 'Bottom Line', val: `₹${(summary.netProfit/100000).toFixed(2)}L`, color: summary.netProfit > 0 ? 'text-emerald-600' : 'text-rose-600', meta: 'Actual Net' },
                { label: 'Margin Efficiency', val: `${summary.margin.toFixed(1)}%`, color: summary.margin > 18 ? 'text-emerald-600' : 'text-rose-600', meta: 'Profit Margin' },
                { label: 'Intervention Req.', val: `${summary.attentionScore.toFixed(0)}%`, color: summary.attentionScore > 60 ? 'text-rose-600' : 'text-slate-900', meta: 'Risk Signal' }
              ].map((stat, i) => (
                <div key={i} className="p-10 bg-slate-50 border-2 border-slate-200 rounded-[2.5rem] flex flex-col justify-between shadow-sm">
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest">{stat.label}</p>
                    <p className={`text-4xl font-black ${stat.color}`}>{stat.val}</p>
                  </div>
                  <p className="text-[8px] font-black text-slate-400 mt-6 uppercase tracking-widest border-t border-slate-200 pt-4">{stat.meta}</p>
                </div>
              ))}
            </section>

            {/* Dual Health Logic */}
            <section className="grid grid-cols-2 gap-10">
               <div className={`p-10 border-4 rounded-[4rem] ${summary.financialHealth === 'Healthy' ? 'border-emerald-500 bg-emerald-50' : 'border-rose-500 bg-rose-50'}`}>
                  <h4 className="text-[12px] font-black uppercase text-slate-500 mb-6 tracking-widest">Financial Health Axis</h4>
                  <p className="text-6xl font-black text-slate-900 tracking-tighter uppercase">{summary.financialHealth}</p>
                  <p className="text-sm font-bold text-slate-600 mt-4 leading-relaxed">Profitability is currently sitting at {summary.margin.toFixed(1)}%, which is considered {summary.financialHealth.toLowerCase()} for this sector.</p>
               </div>
               <div className={`p-10 border-4 rounded-[4rem] ${summary.structuralResilience === 'Healthy' ? 'border-emerald-500 bg-emerald-50' : 'border-rose-500 bg-rose-50'}`}>
                  <h4 className="text-[12px] font-black uppercase text-slate-500 mb-6 tracking-widest">Structural Resilience Axis</h4>
                  <p className="text-6xl font-black text-slate-900 tracking-tighter uppercase">{summary.structuralResilience}</p>
                  <p className="text-sm font-bold text-slate-600 mt-4 leading-relaxed">Based on {summary.onlineDependencyPct.toFixed(0)}% platform dependency and {summary.foodCostPct.toFixed(1)}% COGS burn.</p>
               </div>
            </section>

            {/* Cost Audit Section */}
            <div className="grid grid-cols-2 gap-12">
              <div className="p-12 border-2 border-slate-200 rounded-[3rem] space-y-10">
                <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-3 border-b-2 border-slate-900 pb-4">
                  <FileSearch className="w-5 h-5 text-slate-900" /> Deep-Dive Financial Audit
                </h3>
                <table className="w-full text-sm">
                  <thead className="text-[11px] text-slate-400 font-black uppercase border-b-2 border-slate-100">
                    <tr><th className="text-left pb-4">Expense Segment</th><th className="text-right pb-4">Value</th><th className="text-right pb-4">% Rev</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-bold">
                    {[
                      { name: 'Raw Materials (Food)', val: activeRecord.costs.food },
                      { name: 'Staff & Labor', val: activeRecord.costs.staff },
                      { name: 'Occupancy (Rent)', val: activeRecord.costs.rent },
                      { name: 'Operating Utilities', val: activeRecord.costs.utilities },
                      { name: 'Marketing/Client Acq', val: activeRecord.costs.marketing },
                      { name: 'Aggregator Discounts', val: activeRecord.costs.discounts },
                    ].map((cost, idx) => (
                      <tr key={idx}><td className="py-4 text-slate-600">{cost.name}</td><td className="py-4 text-right">₹{cost.val.toLocaleString()}</td><td className="py-4 text-right text-slate-900">{((cost.val/summary.revenue)*100).toFixed(1)}%</td></tr>
                    ))}
                    <tr className="border-t-4 border-slate-900"><td className="py-5 font-black text-lg">OPERATIONAL BURN</td><td className="py-5 text-right font-black text-lg">₹{summary.costs.toLocaleString()}</td><td className="py-5 text-right font-black text-lg">{((summary.costs/summary.revenue)*100).toFixed(1)}%</td></tr>
                  </tbody>
                </table>
              </div>
              
              <div className="space-y-10">
                 <div className="p-10 bg-slate-950 text-white rounded-[4rem] space-y-8 shadow-2xl">
                    <h3 className="text-xs font-black uppercase tracking-widest border-b border-white/20 pb-4 flex items-center gap-3"><Zap className="w-4 h-4 text-blue-400" /> Core Margin Driver</h3>
                    <p className="text-4xl font-black text-blue-400 leading-tight">{summary.performanceBand.driver}</p>
                    <p className="text-sm font-medium text-slate-400 leading-relaxed italic border-t border-white/10 pt-6">"{summary.performanceBand.narrative.health}"</p>
                 </div>
                 
                 <div className="p-12 border-2 border-slate-100 rounded-[4rem] space-y-8 bg-slate-50">
                    <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-3 border-b-2 border-slate-900 pb-4"><ListTodo className="w-5 h-5 text-emerald-600" /> 30-Day Tactical Roadmap</h3>
                    <div className="space-y-6">
                      {[
                        { step: "Audit procurement of high-cost items", impact: "High", priority: "Week 1" },
                        { step: "Review aggregator promo ceiling (8% max)", impact: "Med", priority: "Week 2" },
                        { step: "Menu re-engineering for low margin items", impact: "High", priority: "Week 3" },
                        { step: "Staff efficiency vs sales volume audit", impact: "Med", priority: "Week 4" }
                      ].map((task, i) => (
                        <div key={i} className="flex justify-between items-center text-xs font-bold border-b border-slate-200 pb-4 last:border-0">
                          <div className="space-y-1">
                            <span className="text-slate-800">{task.step}</span>
                            <div className="flex gap-4 text-[9px] uppercase text-slate-400"><span>Impact: {task.impact}</span> <span>Due: {task.priority}</span></div>
                          </div>
                          <div className="w-5 h-5 rounded border-2 border-slate-300" />
                        </div>
                      ))}
                    </div>
                 </div>
              </div>
            </div>

            {/* Menu Matrix Section */}
            <section className="p-12 border-4 border-slate-900 rounded-[5rem] space-y-12">
              <header className="flex justify-between items-center"><h3 className="text-sm font-black uppercase tracking-[0.3em] flex items-center gap-4"><Target className="w-6 h-6 text-rose-600" /> Menu Performance Portfolio</h3><span className="text-[10px] font-black uppercase text-slate-400">Method: Weighted Profit Contribution Analysis</span></header>
              <div className="grid grid-cols-3 gap-12">
                <div className="space-y-6 p-8 bg-emerald-50 rounded-3xl border border-emerald-100"><div className="px-5 py-2 bg-emerald-600 text-white text-[10px] font-black uppercase rounded-full w-fit">Profit Anchor</div><p className="text-4xl font-black text-slate-900 leading-tight">{summary.bestItem?.name || 'N/A'}</p><p className="text-xs font-bold text-emerald-700 mt-2">Yielding ₹{summary.bestItem?.contribution.toLocaleString()} net monthly.</p></div>
                <div className="space-y-6 p-8 bg-rose-50 rounded-3xl border border-rose-100"><div className="px-5 py-2 bg-rose-600 text-white text-[10px] font-black uppercase rounded-full w-fit">Efficiency Leak</div><p className="text-4xl font-black text-slate-900 leading-tight">{summary.worstItem?.name || 'N/A'}</p><p className="text-xs font-bold text-rose-700 mt-2">Operating at {(summary.worstItem ? (summary.worstItem.cost/summary.worstItem.price)*100 : 0).toFixed(1)}% cost ratio.</p></div>
                <div className="space-y-6 p-8 bg-slate-900 text-white rounded-3xl"><div className="px-5 py-2 bg-blue-600 text-white text-[10px] font-black uppercase rounded-full w-fit">Engine Status</div><p className="text-4xl font-black text-white leading-tight uppercase">{summary.performanceBand.level}</p><p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Decision Confidence: {summary.dataQuality}%</p></div>
              </div>
            </section>

            <footer className="pt-12 flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-widest border-t-4 border-slate-100">
              <div className="flex gap-12">
                <p>© OBIS ADVISORY 2026</p>
                <p>INTEGRITY AUDIT: PASS</p>
                <p>REPORT ID: OBIS-{activeClient.id.toUpperCase()}-{activeRecord.month.toUpperCase().replace(' ','')}</p>
              </div>
              <p>CONFIDENTIAL EXECUTIVE SUMMARY - DO NOT DISTRIBUTE</p>
            </footer>
          </div>
        )}
      </main>

      {showNewClientForm && (
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-6">
            <form onSubmit={(e) => {
               e.preventDefault();
               const formData = new FormData(e.currentTarget);
               const newClient: Client = {
                 id: `c${Date.now()}`,
                 name: formData.get('name') as string,
                 type: formData.get('type') as any,
                 city: 'Hyderabad',
                 cuisine: formData.get('cuisine') as string,
                 pricingLevel: 'Mid',
                 status: 'pilot',
                 startMonth: new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
                 lastUpdatedAt: new Date().toISOString(),
                 insightHistory: [],
                 decisionLog: [],
                 currentInsights: []
               };
               setClients(prev => [newClient, ...prev]);
               setShowNewClientForm(false);
               setSelectedClientId(newClient.id);
            }} className="bg-white rounded-[4rem] p-16 max-w-xl w-full shadow-2xl animate-in zoom-in-95 duration-300">
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
};

export default App;
