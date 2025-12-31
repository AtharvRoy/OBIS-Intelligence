
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  FileInput, 
  BarChart3, 
  Lightbulb, 
  FileText, 
  ChevronRight, 
  LayoutGrid,
  Search,
  Plus,
  ArrowLeft
} from 'lucide-react';
import { AnalystConsole } from './components/AnalystConsole';
import { DataInputForm } from './components/DataInputForm';
import { MenuIntelligence } from './components/MenuIntelligence';
import { Client, MonthlyRecord, BusinessSummary, AiInsight, RiskLevel } from './types';
import { generateInsights } from './geminiService';
import { MOCK_CLIENTS, MOCK_RECORDS } from './constants';

const App: React.FC = () => {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'input' | 'analysis' | 'insights' | 'export'>('analysis');
  const [insights, setInsights] = useState<AiInsight[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);

  // Active client data
  const activeClient = useMemo(() => 
    MOCK_CLIENTS.find(c => c.id === selectedClientId), 
    [selectedClientId]
  );
  
  const activeRecord = useMemo(() => 
    selectedClientId ? MOCK_RECORDS[selectedClientId] : null,
    [selectedClientId]
  );

  // Core Analytics Engine (Hard-coded logic)
  const summary: BusinessSummary | null = useMemo(() => {
    if (!activeRecord) return null;
    const { revenue, costs } = activeRecord;
    const totalCosts = Object.values(costs).reduce((a, b) => a + b, 0);
    const netProfit = revenue.total - totalCosts;
    const margin = (netProfit / revenue.total) * 100;
    const foodCostPct = (costs.food / revenue.total) * 100;
    const staffCostPct = (costs.staff / revenue.total) * 100;

    let riskLevel: RiskLevel = 'Low';
    if (foodCostPct > 35 || margin < 10) riskLevel = 'High';
    else if (foodCostPct > 32 || margin < 15) riskLevel = 'Medium';

    return {
      revenue: revenue.total,
      costs: totalCosts,
      netProfit,
      margin,
      riskLevel,
      foodCostPct,
      staffCostPct
    };
  }, [activeRecord]);

  const fetchAiInsights = async () => {
    if (!summary || !activeRecord) return;
    setLoadingInsights(true);
    // Adapting for current data structure
    const results = await generateInsights(
      summary as any,
      [{ channel: 'Total', gross: summary.revenue, net: summary.revenue - activeRecord.costs.discounts, commissions: 0, discounts: activeRecord.costs.discounts }],
      Object.entries(activeRecord.costs).map(([k, v]) => ({ name: k, value: v, benchmark: 0 })),
      activeRecord.topItems.map(name => ({ name, cost: 0, price: 0, sold: 0, contribution: 0, popularityRank: 0, profitRank: 0 }))
    );
    setInsights(results);
    setLoadingInsights(false);
  };

  if (!selectedClientId) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 lg:p-12">
        <div className="max-w-6xl mx-auto space-y-10">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded tracking-widest uppercase">Console v1.1</span>
                <span className="text-slate-400 text-xs font-medium">Internal Analyst View</span>
              </div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">OBIS Intelligence</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  placeholder="Search clients..." 
                  className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 w-64 font-medium"
                />
              </div>
              <button className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg hover:bg-black transition-all">
                <Plus className="w-4 h-4" />
                Add Restaurant
              </button>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_CLIENTS.map(client => (
              <button 
                key={client.id}
                onClick={() => setSelectedClientId(client.id)}
                className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-left group"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${client.status === 'Pilot' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {client.status}
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 transition-colors" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-1">{client.name}</h3>
                <p className="text-sm font-medium text-slate-400 uppercase tracking-tighter mb-6">{client.cuisine} • {client.pricingLevel} Tier</p>
                
                <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-6">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Revenue Mix</p>
                    <p className="font-bold text-slate-700">Healthy</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Last Sync</p>
                    <p className="font-bold text-slate-700">2h ago</p>
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
    <div className="min-h-screen flex bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-72 bg-slate-900 border-r border-slate-800 flex-col p-6">
        <button 
          onClick={() => setSelectedClientId(null)}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-10 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-bold">Back to Clients</span>
        </button>

        <div className="mb-8 px-2">
          <h2 className="text-xl font-bold text-white mb-1 leading-tight">{activeClient?.name}</h2>
          <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">{activeClient?.city} Analyst Console</p>
        </div>

        <nav className="space-y-2 flex-1">
          {[
            { id: 'input', label: 'Data Input', icon: FileInput },
            { id: 'analysis', label: 'Analytics', icon: BarChart3 },
            { id: 'insights', label: 'AI Strategy', icon: Lightbulb },
            { id: 'export', label: 'Report Builder', icon: FileText }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-bold text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto p-4 rounded-xl bg-slate-800 text-slate-300">
          <p className="text-[10px] font-bold uppercase mb-2">Internal Disclaimer</p>
          <p className="text-[11px] leading-relaxed">System metrics are logic-derived. Review all AI insights before client export.</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <LayoutGrid className="w-5 h-5 text-blue-600 lg:hidden" />
            <h2 className="text-lg font-bold text-slate-800 capitalize">
              {activeTab.replace('-', ' ')} Feed
            </h2>
          </div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            {activeRecord?.month} Data
          </div>
        </header>

        <div className="p-8 lg:p-12 max-w-5xl mx-auto w-full">
          {activeTab === 'input' && <DataInputForm initialData={activeRecord || undefined} onSave={() => {}} />}
          
          {activeTab === 'analysis' && summary && <AnalystConsole summary={summary} />}
          
          {activeTab === 'insights' && (
            <div className="space-y-6">
              <div className="bg-slate-900 rounded-3xl p-10 text-white mb-8 relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-3xl font-black mb-4">Strategic Reasoning</h3>
                  <p className="text-slate-400 mb-8 max-w-lg font-medium">The AI engine cross-references performance data with Hyderabad high-end restaurant benchmarks.</p>
                  <button 
                    onClick={fetchAiInsights}
                    disabled={loadingInsights}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold transition-all shadow-xl shadow-blue-900/40"
                  >
                    {loadingInsights ? 'Analyzing Metrics...' : 'Run Analysis Engine'}
                  </button>
                </div>
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Lightbulb className="w-48 h-48 text-blue-400" />
                </div>
              </div>

              {insights.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {insights.map((insight, idx) => (
                    <div key={idx} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:border-blue-200 transition-all">
                      <div className="flex justify-between items-center mb-6">
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase">Draft {idx + 1}</span>
                        <span className="text-xs font-bold text-emerald-600 uppercase">{insight.impactPotential}</span>
                      </div>
                      <h4 className="text-xl font-bold text-slate-800 mb-3">{insight.observation}</h4>
                      <p className="text-slate-500 mb-8 leading-relaxed text-sm font-medium">{insight.importance}</p>
                      
                      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                        <p className="text-xs font-bold text-slate-400 uppercase mb-2">Recommendation</p>
                        <p className="text-sm font-bold text-slate-700">{insight.recommendation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'export' && (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Ready for Monthly Meeting</h3>
              <p className="text-slate-500 mb-8 max-w-xs text-center font-medium">Export a simplified PDF summary designed for the restaurant owner.</p>
              <button className="px-10 py-3 bg-slate-900 text-white rounded-xl font-bold shadow-xl hover:bg-black transition-all">
                Download PDF Report
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
