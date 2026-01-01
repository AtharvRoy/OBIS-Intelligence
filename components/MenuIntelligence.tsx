
import React from 'react';
import { MenuItem } from '../types';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label } from 'recharts';
import { Star, Zap, Trash2, HelpCircle } from 'lucide-react';

interface MenuIntelligenceProps {
  menu: MenuItem[];
}

export const MenuIntelligence: React.FC<MenuIntelligenceProps> = ({ menu }) => {
  const chartData = menu.map(item => ({
    name: item.name,
    popularity: item.sold,
    profit: item.contribution / item.sold,
    size: item.contribution
  }));

  const QuadrantItem = ({ title, icon: Icon, color, desc }: { title: string, icon: any, color: string, desc: string }) => (
    <div className={`p-4 rounded-xl border ${color} bg-white shadow-sm flex items-start gap-4`}>
      <div className={`p-2 rounded-lg ${color.replace('border-', 'bg-').replace('-200', '-100')} shrink-0`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h4 className="font-semibold text-sm">{title}</h4>
        <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-semibold mb-6">Menu Matrix: Profitability vs. Popularity</h3>
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid />
              <XAxis type="number" dataKey="popularity" name="Popularity (Orders)">
                <Label value="Volume of Sales" offset={-10} position="insideBottom" />
              </XAxis>
              <YAxis type="number" dataKey="profit" name="Profit (Per Unit)">
                <Label value="Profit Margin (Per Unit)" angle={-90} position="insideLeft" />
              </YAxis>
              <ZAxis type="number" dataKey="size" range={[100, 1000]} />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-100">
                        <p className="font-bold text-slate-900">{data.name}</p>
                        <p className="text-sm text-slate-500">Units: {data.popularity}</p>
                        <p className="text-sm text-slate-500 font-medium text-emerald-600">Avg Profit: ₹{data.profit.toFixed(0)}</p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuadrantItem 
          title="Stars" 
          icon={Star} 
          color="border-emerald-200 text-emerald-600" 
          desc="High Profit, High Popularity. Maintain quality & promote!" 
        />
        <QuadrantItem 
          title="Puzzles" 
          icon={HelpCircle} 
          color="border-amber-200 text-amber-600" 
          desc="High Profit, Low Popularity. Needs marketing push." 
        />
        <QuadrantItem 
          title="Plough-horses" 
          icon={Zap} 
          color="border-blue-200 text-blue-600" 
          desc="Low Profit, High Popularity. Revise pricing/costs." 
        />
        <QuadrantItem 
          title="Dogs" 
          icon={Trash2} 
          color="border-rose-200 text-rose-600" 
          desc="Low Profit, Low Popularity. Consider removing." 
        />
      </div>

      <div className="overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Menu Item</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Unit Price</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Sold</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Total Contribution</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Pop. Rank</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Profit Rank</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {menu.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium">{item.name}</td>
                <td className="px-6 py-4 text-slate-500">₹{item.price}</td>
                <td className="px-6 py-4 font-semibold">{item.sold}</td>
                <td className="px-6 py-4 font-semibold text-emerald-600">₹{item.contribution.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.popularityRank <= 2 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                    #{item.popularityRank}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.profitRank <= 2 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>
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
