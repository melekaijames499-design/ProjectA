import React, { useContext } from 'react';
import { FarmContext } from '../../context/FarmContext';
import { useAlerts } from '../../hooks/useAlerts';
import { CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { ALERT_LABELS, SEVERITIES } from '../../utils/constants';
import { formatRelativeTime, formatDate } from '../../utils/formatters';

const SeverityIcon = ({ severity }) => {
  if (severity === 'critical') return <AlertTriangle className="h-4 w-4 text-danger shrink-0" />;
  if (severity === 'warning') return <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />;
  return <Info className="h-4 w-4 text-blue-500 shrink-0" />;
};

export const AlertsPage = () => {
  const { activeFarmId } = useContext(FarmContext);
  const { alerts, loading, resolve, refresh } = useAlerts(activeFarmId);
  const [filter, setFilter] = React.useState('all');

  const filtered = alerts.filter(a => {
    if (filter === 'active') return !a.isResolved;
    if (filter === 'resolved') return a.isResolved;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black font-outfit text-textPrimary">Farm Alerts</h1>
          <p className="text-sm text-textMuted font-medium mt-1">
            {alerts.filter(a => !a.isResolved).length} active · {alerts.filter(a => a.isResolved).length} resolved
          </p>
        </div>
        <button onClick={refresh} className="text-sm font-bold text-primary border border-primary/20 px-4 py-2 rounded-xl hover:bg-primary/5 transition-colors">
          Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2">
        {['all', 'active', 'resolved'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-colors ${
              filter === f
                ? 'bg-primary text-white shadow-md'
                : 'bg-white border border-gray-200 text-textMuted hover:bg-mintBg'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Alert List */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white rounded-xl p-12 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl ring-1 ring-gray-100 p-16 text-center">
            <div className="text-5xl mb-3">✅</div>
            <p className="text-lg font-bold text-textPrimary">No Alerts Found</p>
            <p className="text-sm text-textMuted font-medium mt-1">Your farm is operating within normal parameters.</p>
          </div>
        ) : filtered.map(alert => (
          <div key={alert._id} className={`bg-white rounded-xl ring-1 p-5 transition-all ${
            !alert.isResolved && alert.severity === 'critical' ? 'ring-danger/40 bg-red-50/40' :
            !alert.isResolved && alert.severity === 'warning' ? 'ring-amber-300/50 bg-amber-50/30' :
            'ring-gray-100'
          }`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start space-x-3 flex-1">
                <div className="mt-0.5">
                  <SeverityIcon severity={alert.severity} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center flex-wrap gap-2 mb-1">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                      alert.severity === 'warning' ? 'bg-amber-100 text-amber-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {alert.severity}
                    </span>
                    <span className="text-xs font-bold text-textMuted">{ALERT_LABELS[alert.type] || alert.type}</span>
                    {alert.isResolved && (
                      <span className="text-[10px] font-black px-2 py-0.5 bg-green-100 text-green-700 rounded-full">RESOLVED</span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-textPrimary">{alert.message}</p>
                  <div className="flex items-center space-x-3 mt-2 text-[11px] text-textMuted font-medium">
                    <span>Triggered: {formatRelativeTime(alert.createdAt)}</span>
                    {alert.isResolved && alert.resolvedBy && (
                      <span>Resolved by: {alert.resolvedBy.name}</span>
                    )}
                  </div>
                </div>
              </div>
              {!alert.isResolved && (
                <button
                  onClick={() => resolve(alert._id)}
                  className="shrink-0 flex items-center px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl font-bold text-xs transition-colors"
                >
                  <CheckCircle className="h-4 w-4 mr-1.5" />
                  Resolve
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertsPage;
