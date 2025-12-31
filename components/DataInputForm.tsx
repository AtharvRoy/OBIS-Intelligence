
import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, CheckCircle2, ShieldAlert, Sparkles, Info, HelpCircle } from 'lucide-react';

interface DataInputFormProps {
  onSave: (data: any) => void;
}

export const DataInputForm: React.FC<DataInputFormProps> = ({ onSave }) => {
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

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [qualityScore, setQualityScore] = useState(100);
  const [qualityReasons, setQualityReasons] = useState<string[]>([]);

  useEffect(() => {
    // Dynamic Quality Score with Educational Feedback
    let score = 100;
    let reasons: string[] = [];

    if (formData.revenue === 0) {
      score = 0;
      reasons.push("Total Revenue is required to initiate analysis.");
    } else {
      if (formData.utilities === 0) {
        score -= 15;
        reasons.push("Score reduced due to missing Utilities cost. Utilities (Power/Water) are critical variable overheads; omitting them inflates your perceived profit.");
      }
      if (formData.packaging === 0) {
        score -= 10;
        reasons.push("Score reduced due to missing Packaging cost. Without this, we cannot accurately calculate the true contribution of delivery orders.");
      }
      if (formData.marketing === 0) {
        score -= 10;
        reasons.push("Score reduced due to missing Marketing data. Even minor ad spend or promo costs must be tracked to determine real Customer Acquisition Cost.");
      }
      if (formData.orders === 0) {
        score -= 15;
        reasons.push("Score reduced due to missing Order count. Without the number of orders, we cannot calculate the Average Order Value—a vital growth metric.");
      }
      if (formData.staff === 0) {
        score -= 20;
        reasons.push("Score reduced due to missing Staffing data. Labor is usually the second-highest expense; profit analysis is incomplete without it.");
      }
      if (formData.rent === 0) {
        score -= 10;
        reasons.push("Score reduced due to missing Rent cost. Fixed costs are necessary to determine your Break-even Point—the minimum revenue needed to survive.");
      }
    }
    
    setQualityScore(Math.max(0, score));
    setQualityReasons(reasons);
  }, [formData]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (formData.revenue <= 0) e.revenue = "Required";
    if (formData.online > formData.revenue) e.online = "Exceeds Revenue";
    if (formData.discounts > formData.revenue * 0.3) e.discounts = "Suspect (>30%)";
    if (formData.foodCost > formData.revenue * 0.7) e.foodCost = "Critical (>70%)";
    if (formData.staff > formData.revenue * 0.5) e.staff = "Critical (>50%)";
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCommit = () => {
    if (validate()) {
      onSave({ ...formData, dataQualityScore: qualityScore });
    }
  };

  const InputField = ({ label, value, fieldName, onChange, prefix = "₹", type = "number", helper }: any) => (
    <div className="group space-y-1.5">
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
          type={type}
          value={value || ''}
          placeholder="0"
          onChange={(e) => onChange(Number(e.target.value))}
          className={`w-full bg-slate-50 border ${errors[fieldName] ? 'border-rose-300 ring-4 ring-rose-50' : 'border-slate-200'} rounded-2xl px-8 py-4 font-black focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm group-hover:border-slate-300`}
        />
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-300">
      <div className="p-12 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-8">
            <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center font-black text-2xl shadow-inner transition-all duration-500 ${qualityScore > 80 ? 'bg-emerald-100 text-emerald-600' : qualityScore > 50 ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600'}`}>
              {qualityScore}
            </div>
            <div className="space-y-1">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">Data Integrity Level</h3>
              <p className="text-sm font-medium text-slate-500">How complete is the business logic you are feeding the engine?</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-5 py-2.5 bg-blue-50 text-blue-600 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-blue-100">
            <Sparkles className="w-4 h-4" /> Logic Engine v1.4.2
          </div>
        </div>

        {qualityReasons.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm animate-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
              <Info className="w-4 h-4 text-blue-500" /> Educational Feedback: Quality Score Adjustments
            </div>
            <ul className="space-y-3">
              {qualityReasons.map((reason, idx) => (
                <li key={idx} className="text-xs font-bold text-slate-600 flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1 shrink-0 ${qualityScore > 80 ? 'bg-emerald-400' : qualityScore > 50 ? 'bg-amber-400' : 'bg-rose-400'}`} />
                  <span className="leading-relaxed">{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="p-12 grid grid-cols-1 md:grid-cols-2 gap-16">
        <div className="space-y-10">
          <h4 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.2em] border-l-4 border-blue-600 pl-4">Revenue & Channel Tracking</h4>
          <InputField 
            label="Total Monthly Sales" 
            value={formData.revenue} 
            fieldName="revenue" 
            onChange={(v: any) => setFormData({...formData, revenue: v})} 
            helper="Gross billing before platform commissions and taxes."
          />
          <InputField 
            label="Aggregator Sales (Online)" 
            value={formData.online} 
            fieldName="online" 
            onChange={(v: any) => setFormData({...formData, online: v})} 
            helper="Total sales from Zomato, Swiggy, etc."
          />
          <InputField 
            label="Total Order Count" 
            value={formData.orders} 
            prefix="#" 
            fieldName="orders" 
            onChange={(v: any) => setFormData({...formData, orders: v})} 
            helper="Essential for calculating Average Transaction Value (ATV)."
          />
          <InputField 
            label="Discounts / Comps" 
            value={formData.discounts} 
            fieldName="discounts" 
            onChange={(v: any) => setFormData({...formData, discounts: v})} 
            helper="Track leakage from freebies and promotional codes."
          />
        </div>

        <div className="space-y-10">
          <h4 className="text-[11px] font-black text-rose-500 uppercase tracking-[0.2em] border-l-4 border-rose-500 pl-4">Operational Cost Centers</h4>
          <InputField 
            label="Raw Materials (Food Cost)" 
            value={formData.foodCost} 
            fieldName="foodCost" 
            onChange={(v: any) => setFormData({...formData, foodCost: v})} 
            helper="COGS: Ingredients and raw materials used."
          />
          <InputField 
            label="Staffing & Salaries" 
            value={formData.staff} 
            fieldName="staff" 
            onChange={(v: any) => setFormData({...formData, staff: v})} 
            helper="Include kitchen staff, servers, and management."
          />
          <InputField 
            label="Utilities & Rent" 
            value={formData.utilities} 
            fieldName="utilities" 
            onChange={(v: any) => setFormData({...formData, utilities: v})} 
            helper="Fixed overheads including power, water, and property rent."
          />
          <InputField 
            label="Marketing & Packaging" 
            value={formData.marketing} 
            fieldName="marketing" 
            onChange={(v: any) => setFormData({...formData, marketing: v})} 
            helper="Ad spend plus disposable material costs for delivery."
          />
        </div>
      </div>

      <div className="p-12 bg-slate-900 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-500" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Confidential Internal Data Processing • OBIS Restricted Access</p>
        </div>
        <button onClick={handleCommit} className="w-full md:w-auto px-16 py-6 bg-blue-600 text-white rounded-[2rem] font-black shadow-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3 active:scale-95 text-lg">
          <Save className="w-6 h-6" /> Push to OBIS Engine
        </button>
      </div>
    </div>
  );
};
