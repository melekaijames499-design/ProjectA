import React, { useContext, useEffect, useState } from 'react';
import { FarmContext } from '../../context/FarmContext';
import { getReadings, getReadingStats } from '../../api/sensor.api';
import CombinedChart from '../../components/charts/CombinedChart';
import { formatDate } from '../../utils/formatters';
import { Download, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export const History = () => {
  const { activeFarmId } = useContext(FarmContext);
  const [readings, setReadings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [from, setFrom] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [to, setTo] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (activeFarmId) fetchData();
  }, [activeFarmId]);

  const fetchData = async () => {
    if (!activeFarmId) return;
    setLoading(true);
    try {
      const [readingsRes, statsRes] = await Promise.all([
        getReadings(activeFarmId, { from: `${from}T00:00:00`, to: `${to}T23:59:59`, limit: 500 }),
        getReadingStats(activeFarmId, `${from}T00:00:00`, `${to}T23:59:59`)
      ]);
      setReadings(readingsRes.data || []);
      setStats(statsRes.data || null);
    } catch (err) {
      toast.error('Failed to load history data');
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (!readings.length) { toast.error('No data to export'); return; }
    const headers = ['Timestamp', 'Soil Moisture (%)', 'Temperature (°C)', 'Humidity (%)', 'Input Method', 'Entered By', 'Notes'];
    const rows = readings.map(r => [
      formatDate(r.timestamp), r.soilMoisture, r.temperature, r.humidity,
      r.inputMethod, r.enteredBy?.name || 'System', r.notes || ''
    ]);
    const csv = [headers, ...rows].map(row => row.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `irrigation_history_${from}_to_${to}.csv`;
    a.click(); URL.revokeObjectURL(url);
    toast.success('CSV exported');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black font-outfit text-textPrimary">Sensor History</h1>
          <p className="text-sm text-textMuted font-medium mt-1">{readings.length} records found for selected range</p>
        </div>
        <button onClick={exportCSV} className="flex items-center px-4 py-2.5 bg-white border border-gray-200 text-textMuted hover:text-primary hover:bg-mintBg font-bold rounded-xl text-sm transition-all shadow-sm">
          <Download className="h-4 w-4 mr-2" /> Export CSV
        </button>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-2xl ring-1 ring-gray-100 p-5 flex flex-wrap items-end gap-4 shadow-sm">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-textMuted uppercase tracking-wider">From Date</label>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-secondary/50" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-textMuted uppercase tracking-wider">To Date</label>
          <input type="date" value={to} onChange={e => setTo(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-secondary/50" />
        </div>
        <button onClick={fetchData} disabled={loading}
          className="flex items-center px-5 py-2.5 bg-primary hover:bg-primary-light text-white font-bold rounded-xl shadow-md text-sm transition-all disabled:opacity-50">
          <Search className="h-4 w-4 mr-2" /> {loading ? 'Loading...' : 'Apply Filter'}
        </button>
      </div>

      {/* Stats Summary */}
      {stats && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Avg Moisture', val: `${stats.avgMoisture}%`, sub: `${stats.minMoisture}% – ${stats.maxMoisture}%`, color: 'text-emerald-700' },
            { label: 'Avg Temperature', val: `${stats.avgTemp}°C`, sub: `${stats.minTemp}°C – ${stats.maxTemp}°C`, color: 'text-red-600' },
            { label: 'Avg Humidity', val: `${stats.avgHumidity}%`, sub: `${stats.minHumidity}% – ${stats.maxHumidity}%`, color: 'text-blue-600' },
          ].map(item => (
            <div key={item.label} className="bg-white rounded-xl ring-1 ring-gray-100 p-5">
              <p className="text-xs font-bold text-textMuted uppercase tracking-wider">{item.label}</p>
              <p className={`text-3xl font-black font-outfit mt-1 ${item.color}`}>{item.val}</p>
              <p className="text-xs text-textMuted font-medium mt-1">Range: {item.sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* Chart */}
      {loading ? (
        <div className="bg-white rounded-xl h-96 flex items-center justify-center ring-1 ring-gray-100">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-secondary"></div>
        </div>
      ) : (
        <CombinedChart data={readings} />
      )}

      {/* Data Table */}
      <div className="bg-white rounded-2xl ring-1 ring-gray-100 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider">Reading Records</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-textMuted font-bold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3 text-left">Timestamp</th>
                <th className="px-5 py-3 text-left">Moisture</th>
                <th className="px-5 py-3 text-left">Temp</th>
                <th className="px-5 py-3 text-left">Humidity</th>
                <th className="px-5 py-3 text-left">By</th>
                <th className="px-5 py-3 text-left">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {readings.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-textMuted font-medium">No readings found for the selected date range.</td></tr>
              ) : readings.map((r, i) => (
                <tr key={r._id} className={`hover:bg-mintBg transition-colors ${i % 2 === 0 ? '' : 'bg-gray-50/40'}`}>
                  <td className="px-5 py-3 text-textMuted font-medium text-xs whitespace-nowrap">{formatDate(r.timestamp)}</td>
                  <td className="px-5 py-3 font-bold text-emerald-700">{r.soilMoisture}%</td>
                  <td className="px-5 py-3 font-bold text-red-600">{r.temperature}°C</td>
                  <td className="px-5 py-3 font-bold text-blue-600">{r.humidity}%</td>
                  <td className="px-5 py-3 text-textMuted text-xs">{r.enteredBy?.name || 'System'}</td>
                  <td className="px-5 py-3 text-textMuted text-xs truncate max-w-[160px]">{r.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default History;
