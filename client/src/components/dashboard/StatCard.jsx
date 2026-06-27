import React from 'react';

export const StatCard = ({ title, value, icon: Icon, color = 'primary', subtitle, trend }) => {
  const colorMap = {
    primary: { bg: 'bg-primary/10', text: 'text-primary', iconBg: 'bg-primary', ring: 'ring-primary/20' },
    secondary: { bg: 'bg-secondary/10', text: 'text-secondary-dark', iconBg: 'bg-secondary', ring: 'ring-secondary/20' },
    accent: { bg: 'bg-accent/10', text: 'text-accent-dark', iconBg: 'bg-accent', ring: 'ring-accent/20' },
    danger: { bg: 'bg-danger/10', text: 'text-danger', iconBg: 'bg-danger', ring: 'ring-danger/20' },
  };

  const c = colorMap[color] || colorMap.primary;

  return (
    <div className={`bg-white rounded-2xl p-6 ring-1 ${c.ring} hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300`}>
      <div className="flex items-start justify-between">
        <div className={`${c.bg} p-3 rounded-xl`}>
          {Icon && <Icon className={`h-6 w-6 ${c.text}`} />}
        </div>
        {trend && (
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${
            trend > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-xs font-bold text-textMuted uppercase tracking-wider">{title}</p>
        <p className={`text-4xl font-black font-outfit mt-1 ${c.text}`}>{value}</p>
        {subtitle && <p className="text-xs text-textMuted font-medium mt-1">{subtitle}</p>}
      </div>
    </div>
  );
};

export default StatCard;
