import React, { useEffect, useState } from 'react';
import { getAnalytics } from '../../api/admin.api';
import StatCard from '../../components/dashboard/StatCard';
import { Sprout, Users, Activity, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import toast from 'react-hot-toast';

export const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await getAnalytics();
      setAnalytics(res.data);
    } catch (err) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const summary = analytics?.summary || {};

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black font-outfit text-textPrimary">System Overview</h1>
        <p className="text-sm text-textMuted font-medium mt-1">Real-time platform analytics and farm status</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard title="Active Farms" value={summary.totalFarms ?? 0} icon={Sprout} color="primary" subtitle="Registered active farms" />
        <StatCard title="Active Users" value={summary.totalUsers ?? 0} icon={Users} color="secondary" subtitle="Verified platform users" />
        <StatCard title="Readings Today" value={summary.readingsToday ?? 0} icon={Activity} color="accent" subtitle="Sensor readings submitted" />
        <StatCard title="Active Alerts" value={summary.activeAlerts ?? 0} icon={AlertTriangle} color="danger" subtitle="Unresolved system alerts" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Readings Over Time */}
        <div className="bg-white rounded-2xl ring-1 ring-gray-100 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider mb-4">Readings Per Day (Last 30 Days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics?.readingsChart || []} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                <Line type="monotone" dataKey="count" name="Readings" stroke="#1B4332" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alerts By Farm */}
        <div className="bg-white rounded-2xl ring-1 ring-gray-100 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider mb-4">Total Alerts by Farm</h3>
          <div className="h-64">
            {analytics?.alertsChart?.length === 0 ? (
              <div className="h-full flex items-center justify-center text-textMuted text-sm font-semibold">No alerts recorded yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics?.alertsChart || []} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="farmName" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                  <Bar dataKey="count" name="Alerts" fill="#52B788" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Pump Usage Chart */}
      {analytics?.pumpChart?.length > 0 && (
        <div className="bg-white rounded-2xl ring-1 ring-gray-100 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider mb-4">Pump Usage — Hours ON per Farm (Last 7 Days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.pumpChart} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="farmName" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} unit="h" />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                <Bar dataKey="hoursOn" name="Hours On" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
