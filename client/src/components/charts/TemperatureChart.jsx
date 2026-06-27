import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { formatShortDate } from '../../utils/formatters';

export const TemperatureChart = ({ data, maxThreshold }) => {
  const sortedData = [...data].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  const chartData = sortedData.map(item => ({
    name: formatShortDate(item.timestamp),
    temp: item.temperature
  }));

  return (
    <div className="w-full h-80 bg-white p-4 rounded-xl border border-gray-150 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h4 className="text-sm font-bold text-textPrimary uppercase tracking-wider">Temperature Trend (°C)</h4>
        <span className="text-xs text-textMuted font-medium">Last {data.length} readings</span>
      </div>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
          <YAxis stroke="#94a3b8" fontSize={10} domain={['auto', 'auto']} tickLine={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }} 
            labelStyle={{ fontWeight: 'bold', color: '#1f2937', fontSize: '11px' }}
            itemStyle={{ fontSize: '12px' }}
          />
          {maxThreshold && (
            <ReferenceLine y={maxThreshold} stroke="#dc2626" strokeDasharray="3 3" label={{ value: `max: ${maxThreshold}°C`, fill: '#dc2626', fontSize: 10, position: 'insideTopLeft' }} />
          )}
          <Line 
            type="monotone" 
            dataKey="temp" 
            stroke="#ef4444" 
            strokeWidth={3} 
            dot={{ r: 2 }}
            activeDot={{ r: 6 }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TemperatureChart;
