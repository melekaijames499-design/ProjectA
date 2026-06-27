import React, { useState } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { formatShortDate } from '../../utils/formatters';

export const CombinedChart = ({ data }) => {
  const [showMoisture, setShowMoisture] = useState(true);
  const [showTemp, setShowTemp] = useState(true);
  const [showHumidity, setShowHumidity] = useState(true);

  const sortedData = [...data].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  const chartData = sortedData.map(item => ({
    name: formatShortDate(item.timestamp),
    moisture: item.soilMoisture,
    temp: item.temperature,
    humidity: item.humidity
  }));

  return (
    <div className="w-full h-96 bg-white p-6 rounded-xl border border-gray-150 shadow-sm flex flex-col">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
        <div>
          <h4 className="text-sm font-bold text-textPrimary uppercase tracking-wider">Multi-Sensor Combined Analysis</h4>
          <p className="text-xs text-textMuted font-medium mt-0.5">Toggle datasets to compare metrics over time</p>
        </div>
        
        {/* Dataset Toggles */}
        <div className="flex flex-wrap gap-2 text-xs">
          <button
            onClick={() => setShowMoisture(!showMoisture)}
            className={`px-3 py-1.5 rounded-full font-bold transition-all border ${
              showMoisture 
                ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm' 
                : 'bg-gray-50 border-gray-200 text-textMuted hover:bg-gray-100'
            }`}
          >
            🌱 Soil Moisture
          </button>
          <button
            onClick={() => setShowTemp(!showTemp)}
            className={`px-3 py-1.5 rounded-full font-bold transition-all border ${
              showTemp 
                ? 'bg-red-50 border-red-500 text-red-800 shadow-sm' 
                : 'bg-gray-50 border-gray-200 text-textMuted hover:bg-gray-100'
            }`}
          >
            🌡️ Temperature
          </button>
          <button
            onClick={() => setShowHumidity(!showHumidity)}
            className={`px-3 py-1.5 rounded-full font-bold transition-all border ${
              showHumidity 
                ? 'bg-blue-50 border-blue-500 text-blue-800 shadow-sm' 
                : 'bg-gray-50 border-gray-200 text-textMuted hover:bg-gray-100'
            }`}
          >
            💧 Humidity
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-textMuted text-sm font-semibold">
            No readings recorded for the current range.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
              
              {/* Primary Y Axis for percentages */}
              <YAxis yAxisId="percent" stroke="#94a3b8" fontSize={10} domain={[0, 100]} tickLine={false} />
              
              {/* Secondary Y Axis for Temperature */}
              <YAxis yAxisId="temp" orientation="right" stroke="#ef4444" fontSize={10} domain={[0, 50]} tickLine={false} />
              
              <Tooltip 
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }} 
                labelStyle={{ fontWeight: 'bold', color: '#1f2937', fontSize: '11px' }}
                itemStyle={{ fontSize: '12px' }}
              />
              
              {showMoisture && (
                <Line 
                  yAxisId="percent"
                  type="monotone" 
                  dataKey="moisture" 
                  name="Soil Moisture (%)" 
                  stroke="#10b981" 
                  strokeWidth={2.5} 
                  dot={{ r: 1.5 }}
                  activeDot={{ r: 5 }} 
                />
              )}
              
              {showHumidity && (
                <Line 
                  yAxisId="percent"
                  type="monotone" 
                  dataKey="humidity" 
                  name="Humidity (%)" 
                  stroke="#3b82f6" 
                  strokeWidth={2} 
                  dot={{ r: 1.5 }}
                  activeDot={{ r: 5 }} 
                />
              )}
              
              {showTemp && (
                <Line 
                  yAxisId="temp"
                  type="monotone" 
                  dataKey="temp" 
                  name="Temperature (°C)" 
                  stroke="#ef4444" 
                  strokeWidth={2} 
                  dot={{ r: 1.5 }}
                  activeDot={{ r: 5 }} 
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default CombinedChart;
