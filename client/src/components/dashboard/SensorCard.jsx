import React from 'react';

const getMoistureStatus = (val, min = 30, max = 70) => {
  if (val === null || val === undefined) return { label: 'No Data', color: 'gray', bg: 'bg-gray-100', text: 'text-gray-600', ring: 'ring-gray-200' };
  if (val < min) return { label: 'Low', color: 'red', bg: 'bg-red-50', text: 'text-red-700', ring: 'ring-red-200' };
  if (val <= 50) return { label: 'Moderate', color: 'amber', bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-200' };
  if (val <= max) return { label: 'Optimal', color: 'green', bg: 'bg-green-50', text: 'text-green-700', ring: 'ring-green-200' };
  return { label: 'High', color: 'blue', bg: 'bg-blue-50', text: 'text-blue-700', ring: 'ring-blue-200' };
};

const getTempStatus = (val, max = 35) => {
  if (val === null || val === undefined) return { label: 'No Data', bg: 'bg-gray-100', text: 'text-gray-600', ring: 'ring-gray-200' };
  if (val < 15) return { label: 'Cool', bg: 'bg-blue-50', text: 'text-blue-700', ring: 'ring-blue-200' };
  if (val <= 30) return { label: 'Optimal', bg: 'bg-green-50', text: 'text-green-700', ring: 'ring-green-200' };
  if (val <= max) return { label: 'Warm', bg: 'bg-orange-50', text: 'text-orange-700', ring: 'ring-orange-200' };
  return { label: 'Hot', bg: 'bg-red-50', text: 'text-red-700', ring: 'ring-red-200' };
};

export const SensorCard = ({ title, value, unit, icon: Icon, type = 'moisture', thresholds = {}, subtitle }) => {
  let status;
  if (type === 'temperature') {
    status = getTempStatus(value, thresholds.maxTemperature);
  } else {
    status = getMoistureStatus(value, thresholds.minMoisture, thresholds.maxMoisture);
  }

  const displayValue = value !== null && value !== undefined ? `${parseFloat(value).toFixed(1)}` : '—';

  return (
    <div className={`${status.bg} ring-1 ${status.ring} rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 group`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-xl ${status.bg} ring-1 ${status.ring}`}>
          {Icon && <Icon className={`h-6 w-6 ${status.text}`} />}
        </div>
        <span className={`text-[11px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${status.bg} ${status.text} ring-1 ${status.ring}`}>
          {status.label}
        </span>
      </div>

      <div className="mt-2">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{title}</p>
        <div className="flex items-baseline space-x-1">
          <span className={`text-4xl font-black ${status.text} font-outfit`}>{displayValue}</span>
          <span className={`text-lg font-bold ${status.text} opacity-70`}>{unit}</span>
        </div>
        {subtitle && <p className="text-[11px] text-gray-400 font-medium mt-1">{subtitle}</p>}
      </div>

      {/* Mini progress bar for % values */}
      {(type === 'moisture' || type === 'humidity') && value !== null && value !== undefined && (
        <div className="mt-4 bg-white/60 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              type === 'moisture' ? 'bg-emerald-500' : 'bg-blue-500'
            }`}
            style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default SensorCard;
