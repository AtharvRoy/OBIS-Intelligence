
import React, { useState, useEffect } from 'react';
import { Save, ShieldAlert, Sparkles, Info, HelpCircle, Plus, Trash2, UtensilsCrossed } from 'lucide-react';
import { MenuItem, MonthlyRecord } from '../types';

interface DataInputFormProps {
  onSave: (data: any) => void;
  initialData?: MonthlyRecord | null;
}

export const DataInputForm: React.FC<DataInputFormProps> = ({ onSave, initialData }) => {
  const [formData, setFormData] = useState({
    revenue: 0,
    online: 0,
    orders: 0,
    foodCost: 0,
    staff: 0,
    rent: 0,
    utilities: 0,
    marketing: 0,
    packaging: 0,
    discounts: 0
  });

  const [menuItems, setMenuItems] = useState<Partial<MenuItem>[]>([
    { name: 'Signature Item', price: 0, cost: 0, sold: 0 }
  ]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [qualityScore, setQualityScore] = useState(100);
  const [qualityReasons, setQualityReasons] = useState<string[]>([]);

  // Pre-fill data if editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        revenue: initialData.revenue.total,
        online: initialData.revenue.online,
        orders: initialData.revenue.orders,
        foodCost: initialData.costs.food,
        staff: initialData.costs.staff,
        rent: initialData.costs.rent,
        utilities: initialData.costs.utilities,
        marketing: initialData.costs.marketing,
        packaging: initialData.costs.packaging,
        discounts: initialData.costs.discounts
      });
      if (initialData.menuItems) {
        setMenuItems(initialData.menuItems);
      }
    }
  }, [initialData]);

  useEffect(() => {
    let score = 100;
    let reasons: string[] = [];

    if (formData.revenue === 0) {
      score = 0;
      reasons.push("Total Revenue is required to initiate analysis.");
    } else {
      if (formData.utilities === 0) { score -= 15; reasons.push("Missing Utilities (Power/Water) inflates your perceived profit."); }
      if (formData.staff === 0) { score -= 20; reasons.push("Labor costs are high-impact; analysis is incomplete without staffing data."); }
      if (menuItems.length < 3) { score -= 10; reasons.push("Low item granularity. Add at least 3 menu items for better profit/loss mapping."); }
    }
    
    setQualityScore(Math.max(0, score));
    setQualityReasons(reasons);
  }, [formData, menuItems]);

  const addMenuItem = () => {
    setMenuItems([...menuItems, { name: '', price: 0, cost: 0, sold: 0 }]);
  };

  const removeMenuItem = (index: number) => {
    setMenuItems(menuItems.filter((_, i) => i !== index));
  };

  const updateMenuItem = (index: number, field: keyof MenuItem, value: any) => {
    const newItems = [...menuItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setMenuItems(newItems);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (formData.revenue <= 0) e.revenue = "Required";
    if (formData.online > formData.revenue) e.online = "Exceeds Total";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCommit = () => {
    if (validate()) {
      const processedItems: MenuItem[] = menuItems.map((item, idx) => {
        const contribution = ((item.price || 0) - (item.cost || 0)) * (item.sold || 0);
        return {
          ...item,
          name: item.name || `Item ${idx + 1}`,
          price: item.price || 0,
          cost: item.cost || 0,
          sold: item.sold || 0,
          contribution,
          popularityRank: 0,
          profitRank: 0
        } as MenuItem;
      });

      onSave({ ...formData, menuItems: processedItems, dataQualityScore: qualityScore });
    }
  };

  const InputField = ({ label, value, fieldName, onChange, prefix = "₹", helper }: any) => (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
          {label}
          {helper && (
            <div className="relative group/help">
              <HelpCircle className="w-3 h-3 text-slate-300 cursor-help" />
              <div className="absolute bottom-full left-0 mb-2 w-48 p-3 bg-slate-900 text-white text-[9px] font-medium leading-relaxed rounded-xl opacity-0 group-hover/help:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl">
                {helper}
              </div>
            </div>
          )}
        </label>
        {errors[fieldName] && <span className="text-[9px] font-black text-rose-500 uppercase flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> {errors[fieldName]}</span>}
      </div>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">{prefix}</span>
        <input 
          type="number"
          value={value || ''}
          placeholder="0"
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-8 py-4 font-black focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm"
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-12 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center font-black text-2xl shadow-inner ${qualityScore > 80 ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
              {qualityScore}
            </div>
            <div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{initialData ? 'Refine Snapshot' : 'Data Integrity'}</h3>
              <p className="text-sm font-medium text-slate-500">{initialData ? 'Update existing costs or prices to re-calculate.' : 'Higher scores lead to sharper AI profit insights.'}</p>
            </div>
          </div>
          <div className="px-5 py-2.5 bg-blue-50 text-blue-600 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-blue-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Logic v1.4.3
          </div>
        </div>

        <div className="p-12 grid grid-cols-1 md:grid-cols-2 gap-16">
          <div className="space-y-8">
            <h4 className="text-[11px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4" /> Financial Aggregates
            </h4>
            <InputField label="Total Monthly Revenue" value={formData.revenue} fieldName="revenue" onChange={(v: any) => setFormData({...formData, revenue: v})} />
            <InputField label="Zomato/Swiggy Sales" value={formData.online} fieldName="online" onChange={(v: any) => setFormData({...formData, online: v})} />
            <div className="grid grid-cols-2 gap-6">
              <InputField label="Total Orders" value={formData.orders} fieldName="orders" prefix="#" onChange={(v: any) => setFormData({...formData, orders: v})} />
              <InputField label="Food Cost (COGS)" value={formData.foodCost} fieldName="foodCost" onChange={(v: any) => setFormData({...formData, foodCost: v})} />
            </div>
          </div>

          <div className="space-y-8">
            <h4 className="text-[11px] font-black text-rose-500 uppercase tracking-widest">Fixed & Variable Overheads</h4>
            <div className="grid grid-cols-2 gap-6">
              <InputField label="Salaries" value={formData.staff} fieldName="staff" onChange={(v: any) => setFormData({...formData, staff: v})} />
              <InputField label="Rent/Fixed" value={formData.rent} fieldName="rent" onChange={(v: any) => setFormData({...formData, rent: v})} />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <InputField label="Utilities" value={formData.utilities} fieldName="utilities" onChange={(v: any) => setFormData({...formData, utilities: v})} />
              <InputField label="Marketing" value={formData.marketing} fieldName="marketing" onChange={(v: any) => setFormData({...formData, marketing: v})} />
            </div>
            <InputField label="Packaging & Disposables" value={formData.packaging} fieldName="packaging" onChange={(v: any) => setFormData({...formData, packaging: v})} />
          </div>
        </div>

        <div className="p-12 bg-slate-50 border-t border-slate-100 space-y-8">
          <div className="flex items-center justify-between">
            <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-500" /> Menu Granularity (Profit/Loss Mapping)
            </h4>
            <button onClick={addMenuItem} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase hover:bg-black transition-all">
              <Plus className="w-3 h-3" /> Add Item
            </button>
          </div>
          
          <div className="space-y-4">
            {menuItems.map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-4 items-end bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-in zoom-in-95">
                <div className="col-span-4 space-y-2">
                  <label className="text-[9px] font-black uppercase text-slate-400">Item Name</label>
                  <input value={item.name} onChange={(e) => updateMenuItem(idx, 'name', e.target.value)} placeholder="e.g. Paneer Tikka" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-xs outline-none" />
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-[9px] font-black uppercase text-slate-400">Sell Price (₹)</label>
                  <input type="number" value={item.price || ''} onChange={(e) => updateMenuItem(idx, 'price', Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-xs outline-none" />
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-[9px] font-black uppercase text-slate-400">Prep Cost (₹)</label>
                  <input type="number" value={item.cost || ''} onChange={(e) => updateMenuItem(idx, 'cost', Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-xs outline-none" />
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-[9px] font-black uppercase text-slate-400">Units Sold</label>
                  <input type="number" value={item.sold || ''} onChange={(e) => updateMenuItem(idx, 'sold', Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-xs outline-none" />
                </div>
                <div className="col-span-2 flex justify-end">
                  <button onClick={() => removeMenuItem(idx)} className="p-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-12 bg-slate-900 flex justify-end">
          <button onClick={handleCommit} className="px-16 py-6 bg-blue-600 text-white rounded-[2rem] font-black shadow-2xl hover:bg-blue-700 transition-all flex items-center gap-3 active:scale-95 text-lg">
            <Save className="w-6 h-6" /> {initialData ? 'Apply Updates' : 'Push to Engine'}
          </button>
        </div>
      </div>
    </div>
  );
};
