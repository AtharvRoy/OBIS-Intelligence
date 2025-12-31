
import React, { useState } from 'react';
import { Save, AlertCircle } from 'lucide-react';
import { MonthlyRecord } from '../types';

interface DataInputFormProps {
  initialData?: MonthlyRecord;
  onSave: (data: Partial<MonthlyRecord>) => void;
}

export const DataInputForm: React.FC<DataInputFormProps> = ({ initialData, onSave }) => {
  const [formData, setFormData] = useState({
    revenue: initialData?.revenue.total || 0,
    online: initialData?.revenue.online || 0,
    foodCost: initialData?.costs.food || 0,
    staff: initialData?.costs.staff || 0,
    rent: initialData?.costs.rent || 0
  });

  const InputField = ({ label, value, onChange, prefix = "₹" }: any) => (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">{prefix}</span>
        <input 
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-7 py-3 font-bold focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
        />
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-300">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold">Monthly Data Feed</h3>
          <p className="text-xs text-slate-500">Updating March 2024 Records</p>
        </div>
        <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
          <AlertCircle className="w-4 h-4" />
          <span className="text-[11px] font-bold uppercase">Excel Sync Ready</span>
        </div>
      </div>

      <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h4 className="text-sm font-bold text-slate-800 border-l-4 border-blue-600 pl-3">Revenue Streams</h4>
          <InputField 
            label="Total Gross Revenue" 
            value={formData.revenue} 
            onChange={(val: number) => setFormData({...formData, revenue: val})} 
          />
          <InputField 
            label="Online Channel Revenue" 
            value={formData.online} 
            onChange={(val: number) => setFormData({...formData, online: val})} 
          />
        </div>

        <div className="space-y-6">
          <h4 className="text-sm font-bold text-slate-800 border-l-4 border-rose-500 pl-3">Operating Costs</h4>
          <InputField 
            label="Food Cost (COGS)" 
            value={formData.foodCost} 
            onChange={(val: number) => setFormData({...formData, foodCost: val})} 
          />
          <InputField 
            label="Staffing Costs" 
            value={formData.staff} 
            onChange={(val: number) => setFormData({...formData, staff: val})} 
          />
          <InputField 
            label="Rent / Fixed" 
            value={formData.rent} 
            onChange={(val: number) => setFormData({...formData, rent: val})} 
          />
        </div>
      </div>

      <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
        <button className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-800">Clear Form</button>
        <button 
          onClick={() => onSave(formData as any)}
          className="flex items-center gap-2 px-8 py-2.5 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:bg-black transition-all"
        >
          <Save className="w-4 h-4" />
          Commit Data
        </button>
      </div>
    </div>
  );
};
