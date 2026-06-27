import React, { useContext, useEffect, useState } from 'react';
import { FarmContext } from '../../context/FarmContext';
import { getReadings } from '../../api/sensor.api';
import SensorCard from '../../components/dashboard/SensorCard';
import CombinedChart from '../../components/charts/CombinedChart';
import { Droplets, Thermometer, Wind } from 'lucide-react';
import { formatRelativeTime } from '../../utils/formatters';

export const ViewerDashboard = () => {
  const { farm, thresholds, summary, loading, activeFarmId } = useContext(FarmContext);
  const [readings, setReadings] = useState([]);

  useEffect(() => {
    if (activeFarmId) fetchRecentReadings();
  }, [activeFarmId]);

  const fetchRecentReadings = async () => {
    try {
      const yesterday = new Date();
      yesterday.setHours(yesterday.getHours() - 24);
      const res = await getReadings(activeFarmId, { from: yesterday.toISOString(), limit: 50 });
      setReadings(res.data || []);
    } catch (err) {
      console.error(err);
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
      <div>
        <h1 className="text-3xl font-black font-outfit text-textPrimary">Farm Status Viewer</h1>
        <p className="text-sm text-textMuted font-medium mt-1">Read-only live monitoring for {farm?.name || 'the farm'}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <SensorCard
          title="Soil Moisture" value={latestReading?.soilMoisture} unit="%" icon={Droplets} type="moisture"
          thresholds={thresholds || {}} subtitle={latestReading ? `Updated ${formatRelativeTime(latestReading.timestamp)}` : 'No data'}
        />
        <SensorCard
          title="Temperature" value={latestReading?.temperature} unit="°C" icon={Thermometer} type="temperature"
          thresholds={thresholds || {}} subtitle={latestReading ? `Updated ${formatRelativeTime(latestReading.timestamp)}` : 'No data'}
        />
        <SensorCard
          title="Air Humidity" value={latestReading?.humidity} unit="%" icon={Wind} type="humidity"
          thresholds={thresholds || {}} subtitle={latestReading ? `Updated ${formatRelativeTime(latestReading.timestamp)}` : 'No data'}
        />
      </div>

      <div className="bg-white rounded-2xl ring-1 ring-gray-100 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider mb-4">24-Hour Trend</h3>
        <div className="h-80">
          <CombinedChart data={readings} />
        </div>
      </div>
    </div>
  );
};

export default ViewerDashboard;
