import React, { useContext, useEffect, useState } from 'react';
import { FarmContext } from '../../context/FarmContext';
import { controlPump, getPumpLogs } from '../../api/pump.api';
import toast from 'react-hot-toast';
import { Power, Clock, Activity } from 'lucide-react';
import { formatDate, formatRelativeTime } from '../../utils/formatters';

export const PumpControl = () => {
  const { activeFarmId, summary } = useContext(FarmContext);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [duration, setDuration] = useState('');

  const currentStatus = summary?.pumpStatus || 'OFF';
  const isOn = currentStatus === 'ON';

  useEffect(() => {
    if (activeFarmId) fetchLogs();
  }, [activeFarmId]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await getPumpLogs(activeFarmId, { limit: 20 });
      setLogs(res.data || []);
    } catch (err) {
      toast.error('Failed to load pump logs');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async () => {
    if (!activeFarmId) return;
    const action = isOn ? 'OFF' : 'ON';
    setToggling(true);
    try {
      await controlPump({
        farmId: activeFarmId,
        action,
        duration: action === 'ON' && duration ? parseInt(duration) : null,
        notes: `Manual ${action} via Pump Control panel`
      });
      toast.success(`Pump turned ${action}`);
      fetchLogs();
    } catch (err) {
      toast.error(err.response?.data?.error || `Failed to turn pump ${action}`);
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black font-outfit text-textPrimary">Pump Control</h1>
        <p className="text-sm text-textMuted font-medium mt-1">Manually control the water pump and review operation history</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Control Panel */}
        <div className="lg:col-span-1 bg-white rounded-2xl ring-1 ring-gray-100 p-8 shadow-sm flex flex-col items-center text-center space-y-6">
          {/* Large status indicator */}
          <div className={`h-32 w-32 rounded-full flex items-center justify-center shadow-lg transition-all duration-500 ${
            isOn
              ? 'bg-emerald-500 shadow-emerald-200 animate-pulse'
              : 'bg-gray-200 shadow-gray-100'
          }`}>
            <Power className={`h-14 w-14 ${isOn ? 'text-white' : 'text-gray-400'}`} />
          </div>

          <div>
            <p className="text-xs font-bold text-textMuted uppercase tracking-widest mb-1">Current Pump Status</p>
            <p className={`text-4xl font-black font-outfit ${isOn ? 'text-emerald-600' : 'text-gray-400'}`}>
              {isOn ? 'RUNNING' : 'STOPPED'}
            </p>
            {summary?.latestPumpLog && (
              <p className="text-xs text-textMuted font-medium mt-1">
                Last change: {formatRelativeTime(summary.latestPumpLog.timestamp)}
              </p>
            )}
          </div>

          {/* Duration selector (only for turning ON) */}
          {!isOn && (
            <div className="w-full space-y-1.5">
              <label className="text-xs font-bold text-textMuted uppercase tracking-wider">Auto-Off After (optional)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1" max="480"
                  value={duration}
                  onChange={e => setDuration(e.target.value)}
                  placeholder="—"
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-center focus:outline-none focus:ring-2 focus:ring-secondary/50"
                />
                <span className="text-sm font-semibold text-textMuted">min</span>
              </div>
            </div>
          )}

          {/* Toggle Button */}
          <button
            onClick={handleToggle}
            disabled={toggling}
            className={`w-full py-4 rounded-2xl font-black text-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 ${
              isOn
                ? 'bg-danger hover:bg-danger-dark text-white shadow-danger/20'
                : 'bg-primary hover:bg-primary-light text-white shadow-primary/20'
            }`}
          >
            {toggling ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                Switching...
              </span>
            ) : isOn ? '⏹ Turn Pump OFF' : '▶ Turn Pump ON'}
          </button>
        </div>

        {/* Pump Log Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl ring-1 ring-gray-100 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider">Pump Activity Log</h3>
            </div>
            <button onClick={fetchLogs} className="text-xs font-bold text-secondary hover:text-primary transition-colors">
              Refresh
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-textMuted font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3 text-left">Timestamp</th>
                  <th className="px-5 py-3 text-left">Action</th>
                  <th className="px-5 py-3 text-left">Triggered By</th>
                  <th className="px-5 py-3 text-left">Type</th>
                  <th className="px-5 py-3 text-left">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan={5} className="px-5 py-10 text-center text-textMuted">Loading logs...</td></tr>
                ) : logs.length === 0 ? (
                  <tr><td colSpan={5} className="px-5 py-12 text-center text-textMuted font-medium">No pump activity recorded yet.</td></tr>
                ) : logs.map(log => (
                  <tr key={log._id} className="hover:bg-mintBg transition-colors">
                    <td className="px-5 py-3 text-textMuted whitespace-nowrap font-medium text-xs">{formatDate(log.timestamp)}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-black ${
                        log.action === 'ON' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-textMuted font-medium text-xs">{log.triggeredBy?.name || 'System'}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                        log.triggerType === 'auto' ? 'bg-amber-50 text-amber-700' :
                        log.triggerType === 'schedule' ? 'bg-blue-50 text-blue-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {log.triggerType}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-textMuted text-xs font-medium">
                      {log.duration ? `${log.duration} min` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PumpControl;
