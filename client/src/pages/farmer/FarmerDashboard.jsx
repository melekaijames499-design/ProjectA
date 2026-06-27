import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FarmContext } from '../../context/FarmContext';
import { getReadings } from '../../api/sensor.api';
import { useAlerts } from '../../hooks/useAlerts';
import SensorCard from '../../components/dashboard/SensorCard';
import PumpStatusBadge from '../../components/dashboard/PumpStatusBadge';
import AlertBanner from '../../components/dashboard/AlertBanner';
import CombinedChart from '../../components/charts/CombinedChart';
import { Droplets, Thermometer, Wind, FileInput, RefreshCw } from 'lucide-react';
import { formatRelativeTime, formatDate } from '../../utils/formatters';

export const FarmerDashboard = () => {
  const { farm, thresholds, summary, loading, refetchFarmData, activeFarmId } = useContext(FarmContext);
  const { alerts } = useAlerts(activeFarmId);
  const navigate = useNavigate();
  const [readings, setReadings] = useState([]);
  const [readingsLoading, setReadingsLoading] = useState(false);

  useEffect(() => {
    if (activeFarmId) {
      fetchRecentReadings();
    }
  }, [activeFarmId]);

  const fetchRecentReadings = async () => {
    if (!activeFarmId) return;
    setReadingsLoading(true);
    try {
      const yesterday = new Date();
      yesterday.setHours(yesterday.getHours() - 24);
      const res = await getReadings(activeFarmId, { from: yesterday.toISOString(), limit: 50 });
      setReadings(res.data || []);
    } catch (err) {
      console.error('Failed to load recent readings:', err.message);
    } finally {
      setReadingsLoading(false);
    }
  };

  const latestReading = summary?.latestReading;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black font-outfit text-textPrimary">Farm Dashboard</h1>
          <p className="text-sm text-textMuted font-medium mt-1">
            Live monitoring for {farm?.name || 'your farm'} — Real-time sensor analytics
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={refetchFarmData}
            className="flex items-center px-4 py-2 bg-white border border-gray-200 text-textMuted rounded-xl hover:bg-mintBg hover:text-primary font-semibold text-sm transition-all shadow-sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={() => navigate('/farmer/input')}
            className="flex items-center px-5 py-2.5 bg-primary hover:bg-primary-light text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all text-sm"
          >
            <FileInput className="h-4 w-4 mr-2" />
            Enter Reading
          </button>
        </div>
      </div>

      {/* Critical Alert Banner */}
      <AlertBanner alerts={alerts} />

      {/* Sensor Summary Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <SensorCard
          title="Soil Moisture"
          value={latestReading?.soilMoisture}
          unit="%"
          icon={Droplets}
          type="moisture"
          thresholds={thresholds || {}}
          subtitle={latestReading ? `Updated ${formatRelativeTime(latestReading.timestamp)}` : 'No data yet'}
        />
        <SensorCard
          title="Temperature"
          value={latestReading?.temperature}
          unit="°C"
          icon={Thermometer}
          type="temperature"
          thresholds={thresholds || {}}
          subtitle={latestReading ? `Updated ${formatRelativeTime(latestReading.timestamp)}` : 'No data yet'}
        />
        <SensorCard
          title="Air Humidity"
          value={latestReading?.humidity}
          unit="%"
          icon={Wind}
          type="humidity"
          thresholds={thresholds || {}}
          subtitle={latestReading ? `Updated ${formatRelativeTime(latestReading.timestamp)}` : 'No data yet'}
        />
        <PumpStatusBadge
          status={summary?.pumpStatus || 'OFF'}
          lastChanged={summary?.latestPumpLog?.timestamp}
          triggerType={summary?.latestPumpLog?.triggerType}
        />
      </div>

      {/* Chart + Active Alerts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* 24h Combined Chart */}
        <div className="xl:col-span-2">
          {readingsLoading ? (
            <div className="bg-white rounded-xl h-96 flex items-center justify-center ring-1 ring-gray-100">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-secondary"></div>
            </div>
          ) : (
            <CombinedChart data={readings} />
          )}
        </div>

        {/* Active Alerts Panel */}
        <div className="bg-white rounded-xl ring-1 ring-gray-100 p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider">Active Alerts</h3>
            <span className="text-xs font-bold px-2 py-0.5 bg-danger/10 text-danger rounded-full">
              {alerts.filter(a => !a.isResolved).length} Unresolved
            </span>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto">
            {alerts.filter(a => !a.isResolved).length === 0 ? (
              <div className="h-full flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="text-4xl mb-2">✅</div>
                  <p className="text-sm font-bold text-textMuted">All Clear</p>
                  <p className="text-xs text-textMuted/70">No active warnings</p>
                </div>
              </div>
            ) : (
              alerts.filter(a => !a.isResolved).slice(0, 8).map(alert => (
                <div key={alert._id} className={`p-3 rounded-lg border text-xs font-medium ${
                  alert.severity === 'critical' ? 'bg-red-50 border-red-200 text-red-800' :
                  alert.severity === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800' :
                  'bg-blue-50 border-blue-200 text-blue-800'
                }`}>
                  <span className="font-bold uppercase">[{alert.severity}]</span> {alert.message}
                  <p className="text-[10px] opacity-70 mt-1">{formatRelativeTime(alert.createdAt)}</p>
                </div>
              ))
            )}
          </div>
          <button
            onClick={() => navigate('/farmer/alerts')}
            className="mt-4 text-xs font-bold text-primary hover:underline text-center"
          >
            View All Alerts →
          </button>
        </div>
      </div>

      {/* Recent Readings Table */}
      <div className="bg-white rounded-xl ring-1 ring-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider">Recent Readings</h3>
          <button onClick={() => navigate('/farmer/history')} className="text-xs font-bold text-primary hover:underline">
            Full History →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-textMuted font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 text-left">Timestamp</th>
                <th className="px-6 py-3 text-left">Moisture %</th>
                <th className="px-6 py-3 text-left">Temp °C</th>
                <th className="px-6 py-3 text-left">Humidity %</th>
                <th className="px-6 py-3 text-left">Input By</th>
                <th className="px-6 py-3 text-left">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {readings.slice(0, 10).map((r, idx) => (
                <tr key={r._id} className={`hover:bg-mintBg transition-colors ${idx % 2 === 0 ? '' : 'bg-gray-50/40'}`}>
                  <td className="px-6 py-3 text-textMuted font-medium whitespace-nowrap">{formatDate(r.timestamp)}</td>
                  <td className="px-6 py-3 font-bold text-emerald-700">{r.soilMoisture}%</td>
                  <td className="px-6 py-3 font-bold text-red-600">{r.temperature}°C</td>
                  <td className="px-6 py-3 font-bold text-blue-600">{r.humidity}%</td>
                  <td className="px-6 py-3 text-textMuted">{r.enteredBy?.name || 'System'}</td>
                  <td className="px-6 py-3 text-textMuted truncate max-w-[180px]">{r.notes || '—'}</td>
                </tr>
              ))}
              {readings.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-textMuted font-medium">
                    No readings in the last 24 hours. Use "Enter Reading" to add data.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;
