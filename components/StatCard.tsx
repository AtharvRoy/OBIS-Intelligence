
import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  color?: string;
  icon?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, subValue, color = 'blue', icon }) => {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    red: 'bg-rose-50 text-rose-700 border-rose-100',
    orange: 'bg-amber-50 text-amber-700 border-amber-100',
  };

  return (
    <div className={`p-6 rounded-2xl border ${colorClasses[color] || colorClasses.blue} shadow-sm transition-all hover:shadow-md`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium opacity-80">{label}</span>
        {icon}
      </div>
      <div className="text-3xl font-bold">{value}</div>
      {subValue && <div className="text-sm mt-1 opacity-70 font-medium">{subValue}</div>}
    </div>
  );
};
