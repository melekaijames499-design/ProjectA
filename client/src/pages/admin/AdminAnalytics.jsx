import React, { useEffect, useState } from 'react';
import { getAnalytics, getAllAlerts } from '../../api/admin.api';
import toast from 'react-hot-toast';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, RadarChart,
  PolarGrid, PolarAngleAxis, Radar
} from 'recharts';
import { TrendingUp, Droplets, Thermometer, AlertTriangle, Activity, Zap } from 'lucide-react';

const COLORS = ['#1B4332', '#52B788', '#F59E0B', '#DC2626', '#3B82F6', '#8B5CF6'];

const MetricCard = ({ title, value, subtitle, icon: Icon, color }) => {
  const colorMap = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary/10 text-secondary-dark',
    accent: 'bg-accent/10 text-accent-dark',
    danger: 'bg-danger/10 text-danger',
    blue: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
  };
  return (
    <div className="bg-white rounded-2xl ring-1 ring-gray-100 p-5 shadow-sm flex items-start gap-4">
      <div className={`p-3 rounded-xl ${colorMap[color] || colorMap.primary}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-black text-textPrimary font-outfit">{value ?? '—'}</p>
        <p className="text-xs font-bold text-textPrimary mt-0.5">{title}</p>
        {subtitle && <p className="text-xs text-textMuted mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
};

export const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [analyticsRes, alertsRes] = await Promise.all([
        getAnalytics(),
        getAllAlerts({ isResolved: 'all' }),
      ]);
      setAnalytics(analyticsRes.data);
      setAlerts(alertsRes.data || []);
    } catch (err) {
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        <p className="text-sm text-textMuted font-semibold">Crunching platform data...</p>
      </div>
    );
  }

  const summary = analytics?.summary || {};
  const readingsChart = analytics?.readingsChart || [];
  const alertsChart = analytics?.alertsChart || [];
  const pumpChart = analytics?.pumpChart || [];

  // Build severity breakdown from raw alerts
  const severityCounts = alerts.reduce((acc, a) => {
    acc[a.severity] = (acc[a.severity] || 0) + 1;
    return acc;
  }, {});
  const severityData = Object.entries(severityCounts).map(([name, value]) => ({ name, value }));

  // Build resolved vs unresolved
  const resolvedCount = alerts.filter(a => a.isResolved).length;
  const unresolvedCount = alerts.length - resolvedCount;
  const resolutionData = [
    { name: 'Resolved', value: resolvedCount },
    { name: 'Active', value: unresolvedCount },
  ];

  // Build type breakdown from raw alerts
  const typeCounts = alerts.reduce((acc, a) => {
    const label = a.type || 'Unknown';
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});
  const typeData = Object.entries(typeCounts).map(([subject, count]) => ({ subject, count }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black font-outfit text-textPrimary">Platform Analytics</h1>
        <p className="text-sm text-textMuted font-medium mt-1">Comprehensive system-wide performance metrics and trends</p>
      </div>

      {/* Top KPI Row */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
        <MetricCard title="Total Farms" value={summary.totalFarms ?? 0} subtitle="Registered active sites" icon={Activity} color="primary" />
        <MetricCard title="Total Users" value={summary.totalUsers ?? 0} subtitle="Platform users" icon={TrendingUp} color="secondary" />
        <MetricCard title="Readings Today" value={summary.readingsToday ?? 0} subtitle="Sensor data points" icon={Thermometer} color="accent" />
        <MetricCard title="Active Alerts" value={summary.activeAlerts ?? 0} subtitle="Unresolved issues" icon={AlertTriangle} color="danger" />
        <MetricCard title="Total Alerts" value={alerts.length} subtitle="All-time" icon={Zap} color="purple" />
        <MetricCard title="Resolved Alerts" value={resolvedCount} subtitle={`${alerts.length > 0 ? Math.round((resolvedCount / alerts.length) * 100) : 0}% resolution rate`} icon={Droplets} color="blue" />
      </div>

      {/* Readings Over Time — full width */}
      <div className="bg-white rounded-2xl ring-1 ring-gray-100 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider mb-5">Sensor Readings — Last 30 Days</h3>
        {readingsChart.length === 0 ? (
          <div className="h-56 flex items-center justify-center text-textMuted text-sm font-semibold">No readings data available</div>
        ) : (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={readingsChart} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="readingsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1B4332" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#1B4332" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                <Area type="monotone" dataKey="count" name="Readings" stroke="#1B4332" strokeWidth={2.5} fill="url(#readingsGrad)" dot={{ r: 3, fill: '#1B4332' }} activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Middle Row: Alerts by Farm + Pump Usage */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Alerts by Farm */}
        <div className="bg-white rounded-2xl ring-1 ring-gray-100 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider mb-5">Alert Count by Farm</h3>
          {alertsChart.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-textMuted text-sm font-semibold">No alert data available</div>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={alertsChart} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="farmName" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                  <Bar dataKey="count" name="Alerts" fill="#DC2626" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Pump Usage */}
        <div className="bg-white rounded-2xl ring-1 ring-gray-100 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider mb-5">Pump Hours ON — Last 7 Days</h3>
          {pumpChart.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-textMuted text-sm font-semibold">No pump usage data available</div>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pumpChart} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="farmName" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} unit="h" />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                  <Bar dataKey="hoursOn" name="Hours On" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row: Pie charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Alert Resolution Pie */}
        <div className="bg-white rounded-2xl ring-1 ring-gray-100 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider mb-5">Alert Resolution Status</h3>
          {alerts.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-textMuted text-sm font-semibold">No alert records</div>
          ) : (
            <div className="flex items-center gap-6">
              <div className="h-48 flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={resolutionData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                      {resolutionData.map((_, i) => (
                        <Cell key={i} fill={i === 0 ? '#52B788' : '#DC2626'} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                {resolutionData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: i === 0 ? '#52B788' : '#DC2626' }} />
                    <span className="text-xs font-bold text-textPrimary">{d.name}</span>
                    <span className="text-xs text-textMuted">({d.value})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Severity Breakdown Pie */}
        <div className="bg-white rounded-2xl ring-1 ring-gray-100 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider mb-5">Alert Severity Breakdown</h3>
          {severityData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-textMuted text-sm font-semibold">No severity data</div>
          ) : (
            <div className="flex items-center gap-6">
              <div className="h-48 flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={severityData} cx="50%" cy="50%" outerRadius={80} paddingAngle={3} dataKey="value">
                      {severityData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {severityData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-xs font-bold text-textPrimary capitalize">{d.name}</span>
                    <span className="text-xs text-textMuted">({d.value})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Alert Type Radar */}
      {typeData.length > 0 && (
        <div className="bg-white rounded-2xl ring-1 ring-gray-100 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider mb-5">Alert Type Distribution (Radar)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={typeData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#6B7280', fontWeight: 600 }} />
                <Radar name="Alerts" dataKey="count" stroke="#1B4332" fill="#52B788" fillOpacity={0.35} strokeWidth={2} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAnalytics;
