import React, { useEffect, useState } from 'react';
import { getAlerts, resolveAlert } from '../../api/alert.api';
import toast from 'react-hot-toast';
import { CheckCircle, AlertTriangle, Info, Search } from 'lucide-react';
import { formatRelativeTime, formatDate } from '../../utils/formatters';

export const AdminAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('active'); // active, resolved, all

  useEffect(() => {
    fetchAlerts();
  }, [filter]);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await getAlerts(null, { status: filter === 'all' ? undefined : filter });
      setAlerts(res.data || []);
    } catch (err) {
      toast.error('Failed to fetch alerts');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id) => {
    try {
      await resolveAlert(id);
      toast.success('Alert resolved');
      fetchAlerts();
    } catch (err) {
      toast.error('Failed to resolve alert');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black font-outfit text-textPrimary">System Alerts</h1>
          <p className="text-sm text-textMuted font-medium mt-1">Global view of all farm alerts</p>
        </div>
        <button onClick={fetchAlerts} className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-textMuted hover:text-primary transition-colors">
          Refresh
        </button>
      </div>

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

      <div className="bg-white rounded-2xl ring-1 ring-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-textMuted font-bold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3 text-left">Farm</th>
                <th className="px-5 py-3 text-left">Severity</th>
                <th className="px-5 py-3 text-left">Message</th>
                <th className="px-5 py-3 text-left">Triggered</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-textMuted">Loading...</td></tr>
              ) : alerts.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-textMuted font-medium">No alerts found.</td></tr>
              ) : alerts.map(alert => (
                <tr key={alert._id} className={`transition-colors ${!alert.isResolved && alert.severity === 'critical' ? 'bg-red-50/30 hover:bg-red-50/50' : 'hover:bg-mintBg'}`}>
                  <td className="px-5 py-3 font-bold text-textPrimary text-xs">{alert.farmId?.name || 'System'}</td>
                  <td className="px-5 py-3">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                      alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                      alert.severity === 'warning' ? 'bg-amber-100 text-amber-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {alert.severity}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-medium text-xs max-w-xs truncate" title={alert.message}>{alert.message}</td>
                  <td className="px-5 py-3 text-textMuted text-xs font-medium">{formatRelativeTime(alert.createdAt)}</td>
                  <td className="px-5 py-3">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${alert.isResolved ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {alert.isResolved ? 'Resolved' : 'Active'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    {!alert.isResolved && (
                      <button onClick={() => handleResolve(alert._id)} className="inline-flex items-center px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-[11px] rounded-lg transition-colors">
                        <CheckCircle className="h-3 w-3 mr-1" /> Resolve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminAlerts;
