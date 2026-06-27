import React, { useContext, useEffect, useState } from 'react';
import { FarmContext } from '../../context/FarmContext';
import { getThresholds, upsertThresholds } from '../../api/threshold.api';
import toast from 'react-hot-toast';
import { Sliders, RotateCcw, Save } from 'lucide-react';
import { formatRelativeTime } from '../../utils/formatters';

const DEFAULTS = { minMoisture: 30, maxMoisture: 70, maxTemperature: 35, minHumidity: 20 };

export const Thresholds = () => {
  const { activeFarmId, setThresholds: setContextThresholds } = useContext(FarmContext);
  const [form, setForm] = useState(DEFAULTS);
  const [thresholdRecord, setThresholdRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (activeFarmId) fetchThresholds();
  }, [activeFarmId]);

  const fetchThresholds = async () => {
    setLoading(true);
    try {
      const res = await getThresholds(activeFarmId);
      const t = res.data;
      setThresholdRecord(t);
      setForm({
        minMoisture: t.minMoisture ?? DEFAULTS.minMoisture,
        maxMoisture: t.maxMoisture ?? DEFAULTS.maxMoisture,
        maxTemperature: t.maxTemperature ?? DEFAULTS.maxTemperature,
        minHumidity: t.minHumidity ?? DEFAULTS.minHumidity
      });
    } catch (err) {
      toast.error('Failed to load thresholds');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (form.minMoisture >= form.maxMoisture) {
      toast.error('Min moisture must be less than max moisture');
      return;
    }
    setSaving(true);
    try {
      const res = await upsertThresholds({ farmId: activeFarmId, ...form });
      setThresholdRecord(res.data);
      setContextThresholds(res.data);
      toast.success('Thresholds updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update thresholds');
    } finally {
      setSaving(false);
    }
  };

  const ThresholdSlider = ({ label, field, min, max, unit, description, color }) => (
    <div className="space-y-3 pb-6 border-b border-gray-100 last:border-0">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-textPrimary">{label}</p>
          <p className="text-xs text-textMuted font-medium">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number" min={min} max={max} step="0.5"
            value={form[field]}
            onChange={e => setForm(p => ({ ...p, [field]: Number(e.target.value) }))}
            className="w-20 text-center font-bold border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50"
          />
          <span className="text-sm font-bold text-textMuted">{unit}</span>
        </div>
      </div>
      <input
        type="range" min={min} max={max} step="0.5"
        value={form[field]}
        onChange={e => setForm(p => ({ ...p, [field]: Number(e.target.value) }))}
        className={`w-full h-3 rounded-full appearance-none cursor-pointer ${color}`}
      />
      <div className="flex justify-between text-[10px] font-bold text-gray-400">
        <span>{min}{unit}</span>
        <span className="text-primary font-black">Current: {form[field]}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-black font-outfit text-textPrimary">Alert Thresholds</h1>
        <p className="text-sm text-textMuted font-medium mt-1">Configure when alerts fire and when the pump auto-activates</p>
        {thresholdRecord?.updatedBy && (
          <p className="text-xs text-textMuted font-medium mt-2">
            Last updated by {thresholdRecord.updatedBy.name} — {formatRelativeTime(thresholdRecord.updatedAt)}
          </p>
        )}
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl ring-1 ring-gray-100 p-16 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl ring-1 ring-gray-100 p-8 shadow-sm space-y-6">
          <div className="flex items-center space-x-2 mb-2">
            <Sliders className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider">Farm Threshold Settings</h3>
          </div>

          <ThresholdSlider
            label="Minimum Soil Moisture"
            field="minMoisture" min={0} max={100} unit="%"
            description="Pump auto-starts when moisture drops below this level"
            color="accent-emerald-500"
          />
          <ThresholdSlider
            label="Maximum Soil Moisture"
            field="maxMoisture" min={0} max={100} unit="%"
            description="Pump auto-stops when moisture reaches this level"
            color="accent-blue-500"
          />
          <ThresholdSlider
            label="Maximum Temperature"
            field="maxTemperature" min={0} max={60} unit="°C"
            description="Temperature alerts fire when this threshold is exceeded"
            color="accent-red-500"
          />
          <ThresholdSlider
            label="Minimum Air Humidity"
            field="minHumidity" min={0} max={100} unit="%"
            description="Low humidity info alert fires below this threshold"
            color="accent-blue-400"
          />

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={() => setForm(DEFAULTS)}
              className="flex items-center px-4 py-2.5 border border-gray-200 text-textMuted hover:bg-gray-50 font-bold rounded-xl text-sm transition-colors"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Restore Defaults
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 flex items-center justify-center px-6 py-3 bg-primary hover:bg-primary-light text-white font-bold rounded-xl shadow-md transition-all text-sm disabled:opacity-50"
            >
              {saving ? (
                <><span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />Saving...</>
              ) : (
                <><Save className="h-4 w-4 mr-2" />Save Thresholds</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Thresholds;
