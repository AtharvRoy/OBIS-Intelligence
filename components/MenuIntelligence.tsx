
import React, { useMemo } from 'react';
import { MenuItem } from '../types';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label } from 'recharts';
// Added Target to imports
import { Star, Zap, Trash2, HelpCircle, Target } from 'lucide-react';

interface MenuIntelligenceProps {
  menu: MenuItem[];
}

export const MenuIntelligence: React.FC<MenuIntelligenceProps> = ({ menu }) => {
  const chartData = useMemo(() => {
    return (menu || []).map(item => {
      const sold = Math.max(1, item.sold);
      return {
        name: item.name || 'Unknown Item',
        popularity: item.sold || 0,
        profit: (item.contribution || 0) / sold,
        size: Math.abs(item.contribution || 10)
      };
    });
  }, [menu]);

  const quadrants = useMemo(() => {
    if (!menu || menu.length === 0) return { stars: [], puzzles: [], horses: [], dogs: [] };
    
    const avgSold = menu.reduce((acc, i) => acc + (i.sold || 0), 0) / menu.length;
    const avgProfit = menu.reduce((acc, i) => acc + ((i.contribution || 0) / Math.max(1, i.sold || 0)), 0) / menu.length;

    return {
      stars: menu.filter(i => (i.sold || 0) >= avgSold && ((i.contribution || 0) / Math.max(1, i.sold || 0)) >= avgProfit),
      puzzles: menu.filter(i => (i.sold || 0) < avgSold && ((i.contribution || 0) / Math.max(1, i.sold || 0)) >= avgProfit),
      horses: menu.filter(i => (i.sold || 0) >= avgSold && ((i.contribution || 0) / Math.max(1, i.sold || 0)) < avgProfit),
      dogs: menu.filter(i => (i.sold || 0) < avgSold && ((i.contribution || 0) / Math.max(1, i.sold || 0)) < avgProfit)
    };
  }, [menu]);

  const QuadrantItem = ({ title, icon: Icon, color, desc, count }: { title: string, icon: any, color: string, desc: string, count: number }) => (
    <div className={`p-4 rounded-xl border ${color} bg-white shadow-sm flex items-start gap-4 transition-all hover:scale-[1.02]`}>
      <div className={`p-2 rounded-lg ${color.replace('border-', 'bg-').replace('-200', '-100')} shrink-0`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <h4 className="font-bold text-sm">{title}</h4>
          <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded-full font-black">{count}</span>
        </div>
        <p className="text-[10px] text-slate-500 mt-0.5 leading-tight font-medium">{desc}</p>
      </div>
    </div>
  );

  if (!menu || menu.length === 0) {
    return (
      <div className="bg-white p-12 rounded-[3rem] border border-slate-200 text-center space-y-4">
        <div className="w-16 h-16 bg-slate-50 rounded-2xl mx-auto flex items-center justify-center text-slate-300">
          <HelpCircle className="w-8 h-8" />
        </div>
        <p className="font-black text-slate-400 uppercase tracking-widest text-xs">No menu data available for this cycle</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-8">
           <h3 className="text-xl font-black flex items-center gap-3">
            <Target className="w-6 h-6 text-rose-500" />
            Profitability vs. Popularity Matrix
          </h3>
        </div>
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis type="number" dataKey="popularity" name="Orders" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}}>
                <Label value="Volume of Sales (Orders)" offset={-10} position="insideBottom" style={{fontSize: 10, fontWeight: 800, fill: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em'}} />
              </XAxis>
              <YAxis type="number" dataKey="profit" name="Profit" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}}>
                <Label value="Unit Profit (₹)" angle={-90} position="insideLeft" style={{fontSize: 10, fontWeight: 800, fill: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em'}} />
              </YAxis>
              <ZAxis type="number" dataKey="size" range={[100, 1000]} />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3', stroke: '#3b82f6' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 p-4 rounded-2xl shadow-2xl border border-white/10 text-white">
                        <p className="font-black text-sm border-b border-white/10 pb-2 mb-2">{data.name}</p>
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Orders: <span className="text-white">{data.popularity}</span></p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Unit Profit: <span className="text-emerald-400">₹{data.profit.toFixed(0)}</span></p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Contribution: <span className="text-blue-400">₹{data.size.toLocaleString()}</span></p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter name="Menu Items" data={chartData} fill="#3b82f6" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <QuadrantItem 
          title="Stars" 
          icon={Star} 
          color="border-emerald-200 text-emerald-600" 
          desc="High Profit, High Popularity. Promote aggressively."
          count={quadrants.stars.length}
        />
        <QuadrantItem 
          title="Puzzles" 
          icon={HelpCircle} 
          color="border-amber-200 text-amber-600" 
          desc="High Profit, Low Popularity. Investigate low volume."
          count={quadrants.puzzles.length}
        />
        <QuadrantItem 
          title="Horses" 
          icon={Zap} 
          color="border-blue-200 text-blue-600" 
          desc="Low Profit, High Popularity. Optimize costs/prices." 
          count={quadrants.horses.length}
        />
        <QuadrantItem 
          title="Dogs" 
          icon={Trash2} 
          color="border-rose-200 text-rose-600" 
          desc="Low Profit, Low Popularity. Consider deletion."
          count={quadrants.dogs.length}
        />
      </div>

      <div className="overflow-hidden bg-white border border-slate-200 rounded-[3rem] shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Menu Item</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Price</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sold</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Contribution</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Pop Rank</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Profit Rank</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {menu.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-8 py-5 font-black text-slate-900 group-hover:text-blue-600 transition-colors">{item.name}</td>
                <td className="px-8 py-5 text-xs font-bold text-slate-500">₹{item.price}</td>
                <td className="px-8 py-5 font-black text-slate-700">{item.sold}</td>
                <td className="px-8 py-5 font-black text-emerald-600">₹{item.contribution.toLocaleString()}</td>
                <td className="px-8 py-5">
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${item.popularityRank <= 2 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    #{item.popularityRank}
                  </span>
                </td>
                <td className="px-8 py-5">
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${item.profitRank <= 2 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                    #{item.profitRank}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
