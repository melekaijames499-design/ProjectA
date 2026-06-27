import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { ALERT_LABELS } from '../../utils/constants';

export const AlertBanner = ({ alerts, onDismiss }) => {
  const criticalAlerts = alerts.filter(a => a.severity === 'critical' && !a.isResolved);
  if (criticalAlerts.length === 0) return null;

  return (
    <div className="bg-danger/10 border border-danger/30 rounded-xl px-5 py-4 mb-6 flex items-start justify-between animate-pulse-once">
      <div className="flex items-start space-x-3">
        <AlertTriangle className="h-5 w-5 text-danger shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-danger">
            {criticalAlerts.length} Critical Alert{criticalAlerts.length > 1 ? 's' : ''} Require Attention
          </p>
          <ul className="mt-1 space-y-1">
            {criticalAlerts.slice(0, 3).map(alert => (
              <li key={alert._id} className="text-xs text-danger/80 font-medium">
                • [{ALERT_LABELS[alert.type] || alert.type}] {alert.message}
              </li>
            ))}
            {criticalAlerts.length > 3 && (
              <li className="text-xs text-danger/60 font-medium">
                ...and {criticalAlerts.length - 3} more
              </li>
            )}
          </ul>
        </div>
      </div>
      {onDismiss && (
        <button onClick={onDismiss} className="text-danger/60 hover:text-danger transition-colors ml-4">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default AlertBanner;
