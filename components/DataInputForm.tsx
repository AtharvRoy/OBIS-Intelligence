
import React, { useState, useEffect } from 'react';
import { Save, Trash2, ShieldCheck, IndianRupee, LayoutGrid, Tag, PieChart, Users, Home, Activity, Plus } from 'lucide-react';
import { MenuItem, MonthlyRecord } from '../types';

interface DataInputFormProps {
  onSave: (data: any) => void;
  initialData: MonthlyRecord | null;
}

const formatIndianNumber = (val: number | string) => {
  if (val === 0 || val === '0' || val === '') return '';
  const num = typeof val === 'string' ? parseFloat(val.replace(/,/g, '')) : val;
  if (isNaN(num)) return '';
  return num.toLocaleString('en-IN');
};

const FormattedInputField = ({ label, value, onChange, prefix = "₹", icon: Icon }: any) => {
  const [localValue, setLocalValue] = useState(formatIndianNumber(value));
  useEffect(() => { setLocalValue(formatIndianNumber(value)); }, [value]);

  return (
    <div className="space-y-2 group">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
        {Icon && <Icon className="w-3 h-3 text-blue-500 opacity-60 group-hover:opacity-100" />}
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">{prefix}</span>
        <input 
          type="text"
          value={localValue}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^0-9.]/g, '');
            const num = raw === '' ? 0 : parseFloat(raw);
            setLocalValue(formatIndianNumber(num));
            onChange(num);
          }}
          className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-8 py-4 font-black outline-none focus:border-blue-500/30 focus:bg-white transition-all text-xs"
        />
      </div>
    </div>
  );
};

export const DataInputForm: React.FC<DataInputFormProps> = ({ onSave, initialData }) => {
  const [formData, setFormData] = useState({
    revenue: 0, online: 0, orders: 0, foodCost: 0, staff: 0, rent: 0, utilities: 0, marketing: 0, packaging: 0, discounts: 0
  });

  const [menuItems, setMenuItems] = useState<Partial<MenuItem>[]>([{ name: '', price: 0, cost: 0, sold: 0 }]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        revenue: initialData.revenue.total, online: initialData.revenue.online, orders: initialData.revenue.orders,
        foodCost: initialData.costs.food, staff: initialData.costs.staff, rent: initialData.costs.rent,
        utilities: initialData.costs.utilities, marketing: initialData.costs.marketing,
        packaging: initialData.costs.packaging, discounts: initialData.costs.discounts
      });
      if (initialData.menuItems) setMenuItems([...initialData.menuItems]);
    }
  }, [initialData]);

  return (
    <div className="bg-white rounded-[4rem] border border-slate-200 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
      <div className="p-12 border-b bg-slate-50/50 flex justify-between items-center">
          <div>
            <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Snapshot Entry</h3>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">January 2026 Reporting Cycle</p>
          </div>
          <div className="bg-emerald-50 text-emerald-600 px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest border border-emerald-100">Pipeline v1.6.2 Normalization Active</div>
      </div>

      <div className="flex-1 overflow-y-auto p-12 space-y-12">
        {/* ROW 1: CORE REVENUE */}
        <section className="space-y-6">
          <h4 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.3em]">1. Top Line Figures</h4>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <FormattedInputField label="Total Monthly Revenue" icon={IndianRupee} value={formData.revenue} onChange={(v:any) => setFormData({...formData, revenue: v})} />
            <FormattedInputField label="Online Sales Volume" icon={LayoutGrid} value={formData.online} onChange={(v:any) => setFormData({...formData, online: v})} />
            <FormattedInputField label="Total Order Count" icon={Activity} value={formData.orders} prefix="#" onChange={(v:any) => setFormData({...formData, orders: v})} />
            <FormattedInputField label="Food Cost (COGS)" icon={PieChart} value={formData.foodCost} onChange={(v:any) => setFormData({...formData, foodCost: v})} />
          </div>
        </section>

        {/* ROW 2: OPEX BURNS */}
        <section className="space-y-6">
          <h4 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.3em]">2. Operational Overheads</h4>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-8">
            <FormattedInputField label="Staff Salaries" icon={Users} value={formData.staff} onChange={(v:any) => setFormData({...formData, staff: v})} />
            <FormattedInputField label="Rent / Fixed Costs" icon={Home} value={formData.rent} onChange={(v:any) => setFormData({...formData, rent: v})} />
            <FormattedInputField label="Utilities & Power" icon={ShieldCheck} value={formData.utilities} onChange={(v:any) => setFormData({...formData, utilities: v})} />
            <FormattedInputField label="Marketing & Growth" icon={Tag} value={formData.marketing} onChange={(v:any) => setFormData({...formData, marketing: v})} />
            {/* Fix: Added missing Plus icon import to resolve 'Cannot find name Plus' error */}
            <FormattedInputField label="Packaging / Logistics" icon={Plus} value={formData.packaging} onChange={(v:any) => setFormData({...formData, packaging: v})} />
            <FormattedInputField label="Discounts / Promo Burn" icon={Trash2} value={formData.discounts} onChange={(v:any) => setFormData({...formData, discounts: v})} />
          </div>
        </section>

        {/* MENU GRANULARITY */}
        <section className="space-y-8">
          <div className="flex justify-between items-center">
            <h4 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.3em]">3. High-Resolution Menu Data</h4>
            <button onClick={() => setMenuItems([...menuItems, {name:'', price:0, cost:0, sold:0}])} className="px-6 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">Add Item Row</button>
          </div>
          <div className="space-y-4">
            {menuItems.map((item, idx) => (
              <div key={idx} className="flex gap-4 items-end p-6 bg-slate-50 rounded-3xl border-2 border-slate-100 hover:border-blue-100 transition-all">
                <div className="flex-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Menu Item Name</label>
                  <input value={item.name} onChange={(e) => { const n = [...menuItems]; n[idx].name = e.target.value; setMenuItems(n); }} placeholder="e.g. Special Biryani" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-black outline-none focus:border-blue-500" />
                </div>
                <div className="w-28">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Sell Price</label>
                  <input type="number" value={item.price} onChange={(e) => { const n = [...menuItems]; n[idx].price = Number(e.target.value); setMenuItems(n); }} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-black outline-none" />
                </div>
                <div className="w-28">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Kitchen Cost</label>
                  <input type="number" value={item.cost} onChange={(e) => { const n = [...menuItems]; n[idx].cost = Number(e.target.value); setMenuItems(n); }} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-black outline-none" />
                </div>
                <div className="w-24">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Total Sold</label>
                  <input type="number" value={item.sold} onChange={(e) => { const n = [...menuItems]; n[idx].sold = Number(e.target.value); setMenuItems(n); }} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-black outline-none" />
                </div>
                <button onClick={() => setMenuItems(menuItems.filter((_, i) => i !== idx))} className="p-3 text-rose-500 hover:bg-rose-50 rounded-xl mb-1 transition-all"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="p-12 bg-slate-900 flex gap-6">
        <button onClick={() => onSave({...formData, menuItems, dataQualityScore: 100})} className="flex-1 py-6 bg-blue-600 text-white rounded-[2rem] font-black text-lg shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-4">
          <Save className="w-6 h-6" /> Commit to Intelligence Engine
        </button>
      </div>
    </div>
  );
};
