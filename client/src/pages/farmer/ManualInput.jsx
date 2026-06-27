import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FarmContext } from '../../context/FarmContext';
import { submitReading } from '../../api/sensor.api';
import toast from 'react-hot-toast';
import { Droplets, Thermometer, Wind, Send, RotateCcw, Zap } from 'lucide-react';

// Presets panel data
const PRESETS = [
  {
    name: 'Dry Field', emoji: '🏜️',
    description: 'Critically low moisture — Pump will auto-start',
    values: { soilMoisture: 15, temperature: 32, humidity: 25 },
    colorClass: 'border-red-300 bg-red-50 hover:bg-red-100 text-red-800'
  },
  {
    name: 'Optimal Field', emoji: '🌿',
    description: 'Ideal conditions — No action needed',
    values: { soilMoisture: 55, temperature: 22, humidity: 60 },
    colorClass: 'border-green-300 bg-green-50 hover:bg-green-100 text-green-800'
  },
  {
    name: 'Waterlogged', emoji: '🌊',
    description: 'Excessive moisture — Pump will auto-stop',
    values: { soilMoisture: 90, temperature: 20, humidity: 80 },
    colorClass: 'border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-800'
  },
  {
    name: 'Hot & Dry', emoji: '🔥',
    description: 'Critical heat + drought — Dual alert',
    values: { soilMoisture: 10, temperature: 40, humidity: 15 },
    colorClass: 'border-orange-300 bg-orange-50 hover:bg-orange-100 text-orange-800'
  },
];

const getMoistureColor = (val, min = 30, max = 70) => {
  if (val < min - 10) return { bg: 'bg-red-500', label: 'Critical Low', textClass: 'text-red-700' };
  if (val < min) return { bg: 'bg-amber-500', label: 'Warning Low', textClass: 'text-amber-700' };
  if (val <= max) return { bg: 'bg-green-500', label: 'Optimal', textClass: 'text-green-700' };
  return { bg: 'bg-blue-500', label: 'Saturated', textClass: 'text-blue-700' };
};

const getTempColor = (val, max = 35) => {
  if (val < 15) return { bg: 'bg-blue-400', label: 'Cool', textClass: 'text-blue-700' };
  if (val <= 30) return { bg: 'bg-green-500', label: 'Optimal', textClass: 'text-green-700' };
  if (val <= max) return { bg: 'bg-orange-500', label: 'Warm', textClass: 'text-orange-700' };
  return { bg: 'bg-red-600', label: 'Critical Hot', textClass: 'text-red-700' };
};

// Prediction helper to show what will happen on submit
const getPreviewMessages = (values, thresholds) => {
  const msgs = [];
  const min = thresholds?.minMoisture || 30;
  const max = thresholds?.maxMoisture || 70;
  const maxTemp = thresholds?.maxTemperature || 35;
  const minHum = thresholds?.minHumidity || 20;

  if (values.soilMoisture < min - 10) {
    msgs.push({ type: 'critical', text: '🚨 CRITICAL alert will be triggered (moisture < min - 10%)' });
    msgs.push({ type: 'action', text: '💧 Pump will AUTO-START immediately' });
  } else if (values.soilMoisture < min) {
    msgs.push({ type: 'warning', text: '⚠️ WARNING alert will be triggered (moisture below minimum)' });
    msgs.push({ type: 'action', text: '💧 Pump will AUTO-START' });
  } else if (values.soilMoisture >= max) {
    msgs.push({ type: 'info', text: 'ℹ️ High moisture info alert may be triggered' });
    msgs.push({ type: 'action', text: '✅ Pump will AUTO-STOP if currently running' });
  } else {
    msgs.push({ type: 'ok', text: '✅ Moisture within optimal range — No pump action' });
  }

  if (values.temperature > maxTemp + 5) {
    msgs.push({ type: 'critical', text: '🌡️ CRITICAL temperature alert (>5°C above maximum)' });
  } else if (values.temperature > maxTemp) {
    msgs.push({ type: 'warning', text: `⚠️ High temperature warning (above ${maxTemp}°C threshold)` });
  }

  if (values.humidity < minHum) {
    msgs.push({ type: 'info', text: `ℹ️ Low humidity info alert (below ${minHum}% threshold)` });
  }

  if (msgs.length === 1 && msgs[0].type === 'ok') {
    msgs.push({ type: 'ok', text: '🌿 System will remain in optimal state — All clear' });
  }

  return msgs;
};

export const ManualInput = () => {
  const { activeFarmId, thresholds, refetchFarmData } = useContext(FarmContext);
  const navigate = useNavigate();

  const defaultTimestamp = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

  const [form, setForm] = useState({
    soilMoisture: 45,
    temperature: 24,
    humidity: 55,
    timestamp: defaultTimestamp(),
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const moistureStatus = getMoistureColor(form.soilMoisture, thresholds?.minMoisture, thresholds?.maxMoisture);
  const tempStatus = getTempColor(form.temperature, thresholds?.maxTemperature);
  const previewMessages = getPreviewMessages(form, thresholds);

  const handleChange = (field, val) => {
    setForm(prev => ({ ...prev, [field]: val }));
  };

  const applyPreset = (preset) => {
    setForm(prev => ({
      ...prev,
      soilMoisture: preset.values.soilMoisture,
      temperature: preset.values.temperature,
      humidity: preset.values.humidity
    }));
    toast(`Preset applied: ${preset.name}`, { icon: preset.emoji });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activeFarmId) {
      toast.error('No farm selected. Please contact your administrator.');
      return;
    }

    setSubmitting(true);
    try {
      await submitReading({
        farmId: activeFarmId,
        soilMoisture: parseFloat(form.soilMoisture),
        temperature: parseFloat(form.temperature),
        humidity: parseFloat(form.humidity),
        timestamp: new Date(form.timestamp).toISOString(),
        notes: form.notes,
        inputMethod: 'manual'
      });

      toast.success(`Reading submitted: 💧${form.soilMoisture}% | 🌡️${form.temperature}°C | 💨${form.humidity}%`);
      setSubmitted(true);
      refetchFarmData();
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to submit reading. Try again.';
      toast.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto mt-16 bg-white rounded-2xl p-10 ring-1 ring-secondary/20 text-center shadow-xl">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-black font-outfit text-primary">Reading Submitted!</h2>
        <p className="text-textMuted font-medium mt-2 mb-8">
          Your sensor data has been recorded and the system is checking thresholds.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => { setSubmitted(false); setForm(prev => ({ ...prev, timestamp: defaultTimestamp(), notes: '' })); }}
            className="px-5 py-2.5 bg-white border border-gray-200 text-textPrimary font-bold rounded-xl hover:bg-mintBg transition-colors text-sm"
          >
            Submit Another
          </button>
          <button
            onClick={() => navigate('/farmer/dashboard')}
            className="px-5 py-2.5 bg-primary hover:bg-primary-light text-white font-bold rounded-xl shadow-md transition-colors text-sm"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black font-outfit text-textPrimary">Manual Sensor Input</h1>
        <p className="text-sm text-textMuted font-medium mt-1">
          Simulate sensor readings to drive automated irrigation responses
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Input Form */}
        <div className="xl:col-span-2 space-y-5">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl ring-1 ring-gray-100 p-8 shadow-sm space-y-8">

            {/* Soil Moisture */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 text-sm font-bold text-textPrimary">
                  <Droplets className="h-4 w-4 text-emerald-600" />
                  <span>Soil Moisture</span>
                </label>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  moistureStatus.textClass
                } bg-current/10`} style={{ backgroundColor: 'transparent' }}>
                  {moistureStatus.label} — {form.soilMoisture}%
                </span>
              </div>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0" max="100" step="1"
                  value={form.soilMoisture}
                  onChange={e => handleChange('soilMoisture', Number(e.target.value))}
                  className="flex-1 h-3 rounded-full appearance-none cursor-pointer accent-emerald-500"
                />
                <input
                  type="number"
                  min="0" max="100" step="0.1"
                  value={form.soilMoisture}
                  onChange={e => handleChange('soilMoisture', Math.min(100, Math.max(0, Number(e.target.value))))}
                  className="w-20 text-center font-bold border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
                <span className="text-xs text-textMuted font-semibold w-4">%</span>
              </div>
              {/* Threshold markers */}
              <div className="flex justify-between text-[10px] font-bold text-gray-400 px-1">
                <span className="text-red-400">0% (dry)</span>
                <span className="text-amber-500">min: {thresholds?.minMoisture || 30}%</span>
                <span className="text-blue-500">max: {thresholds?.maxMoisture || 70}%</span>
                <span className="text-blue-400">100% (wet)</span>
              </div>
              {/* Visual bar */}
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden relative">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${moistureStatus.bg}`}
                  style={{ width: `${form.soilMoisture}%` }}
                />
                {/* Min threshold marker */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-red-400 opacity-70"
                  style={{ left: `${thresholds?.minMoisture || 30}%` }}
                />
                {/* Max threshold marker */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-blue-400 opacity-70"
                  style={{ left: `${thresholds?.maxMoisture || 70}%` }}
                />
              </div>
            </div>

            {/* Temperature */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 text-sm font-bold text-textPrimary">
                  <Thermometer className="h-4 w-4 text-red-500" />
                  <span>Temperature</span>
                </label>
                <span className={`text-xs font-bold ${tempStatus.textClass}`}>
                  {tempStatus.label} — {form.temperature}°C
                </span>
              </div>
              <div className="flex items-center gap-4">
                <button type="button" onClick={() => handleChange('temperature', Math.max(0, form.temperature - 1))}
                  className="w-9 h-9 rounded-lg border border-gray-200 text-textMuted hover:bg-gray-100 flex items-center justify-center font-bold text-lg transition-colors">
                  −
                </button>
                <input
                  type="range"
                  min="0" max="60" step="0.5"
                  value={form.temperature}
                  onChange={e => handleChange('temperature', Number(e.target.value))}
                  className="flex-1 h-3 rounded-full appearance-none cursor-pointer accent-red-500"
                />
                <button type="button" onClick={() => handleChange('temperature', Math.min(60, form.temperature + 1))}
                  className="w-9 h-9 rounded-lg border border-gray-200 text-textMuted hover:bg-gray-100 flex items-center justify-center font-bold text-lg transition-colors">
                  +
                </button>
                <input
                  type="number"
                  min="0" max="60" step="0.1"
                  value={form.temperature}
                  onChange={e => handleChange('temperature', Math.min(60, Math.max(0, Number(e.target.value))))}
                  className="w-20 text-center font-bold border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
                />
                <span className="text-xs text-textMuted font-semibold">°C</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold text-gray-400 px-1">
                <span className="text-blue-400">0°C</span>
                <span className="text-green-500">15–30°C (optimal)</span>
                <span className="text-red-400">max: {thresholds?.maxTemperature || 35}°C</span>
                <span className="text-red-600">60°C</span>
              </div>
            </div>

            {/* Humidity */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 text-sm font-bold text-textPrimary">
                  <Wind className="h-4 w-4 text-blue-500" />
                  <span>Air Humidity</span>
                </label>
                <span className="text-xs font-bold text-blue-700">{form.humidity}%</span>
              </div>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0" max="100" step="1"
                  value={form.humidity}
                  onChange={e => handleChange('humidity', Number(e.target.value))}
                  className="flex-1 h-3 rounded-full appearance-none cursor-pointer accent-blue-500"
                />
                <input
                  type="number"
                  min="0" max="100" step="0.1"
                  value={form.humidity}
                  onChange={e => handleChange('humidity', Math.min(100, Math.max(0, Number(e.target.value))))}
                  className="w-20 text-center font-bold border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
                <span className="text-xs text-textMuted font-semibold w-4">%</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold text-gray-400 px-1">
                <span>0%</span>
                <span className="text-amber-500">min: {thresholds?.minHumidity || 20}%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Timestamp */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-textPrimary">Reading Timestamp</label>
              <input
                type="datetime-local"
                value={form.timestamp}
                onChange={e => handleChange('timestamp', e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
              />
              <p className="text-[11px] text-textMuted font-medium">You can backdate readings to record past observations.</p>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-textPrimary">Field Observations (Optional)</label>
              <textarea
                value={form.notes}
                onChange={e => handleChange('notes', e.target.value)}
                placeholder="e.g. North field section, soil appears cracked..."
                rows={3}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm font-medium resize-none focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
              />
            </div>

            {/* Submit Actions */}
            <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setForm({ soilMoisture: 45, temperature: 24, humidity: 55, timestamp: defaultTimestamp(), notes: '' });
                  toast('Form reset to defaults', { icon: '🔄' });
                }}
                className="flex items-center px-4 py-2.5 border border-gray-200 text-textMuted hover:bg-gray-50 font-bold rounded-xl text-sm transition-colors"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </button>
              <button
                type="submit"
                disabled={submitting || !activeFarmId}
                className="flex-1 flex items-center justify-center px-6 py-3 bg-primary hover:bg-primary-light disabled:bg-gray-300 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all text-sm"
              >
                {submitting ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Reading
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Panel: Presets + Preview */}
        <div className="space-y-5">
          {/* Quick Presets */}
          <div className="bg-white rounded-2xl ring-1 ring-gray-100 p-6 shadow-sm">
            <div className="flex items-center space-x-2 mb-4">
              <Zap className="h-4 w-4 text-accent" />
              <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider">Quick Presets</h3>
            </div>
            <div className="space-y-3">
              {PRESETS.map(preset => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className={`w-full text-left p-3.5 rounded-xl border-2 transition-all duration-150 ${preset.colorClass}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">{preset.emoji} {preset.name}</span>
                    <span className="text-[10px] font-bold opacity-60 ml-1">→</span>
                  </div>
                  <p className="text-[11px] font-medium opacity-70 mt-0.5">{preset.description}</p>
                  <p className="text-[10px] font-bold mt-1.5 opacity-80">
                    💧{preset.values.soilMoisture}% · 🌡️{preset.values.temperature}°C · 💨{preset.values.humidity}%
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Live Preview / Impact Assessment */}
          <div className="bg-white rounded-2xl ring-1 ring-gray-100 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider mb-4">
              Predicted System Response
            </h3>
            <div className="space-y-2.5">
              {previewMessages.map((msg, i) => (
                <div key={i} className={`flex items-start space-x-2 p-2.5 rounded-lg text-xs font-semibold ${
                  msg.type === 'critical' ? 'bg-red-50 text-red-700 border border-red-200' :
                  msg.type === 'warning' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                  msg.type === 'action' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                  msg.type === 'info' ? 'bg-sky-50 text-sky-700 border border-sky-200' :
                  'bg-green-50 text-green-700 border border-green-200'
                }`}>
                  <span>{msg.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Current Thresholds Reference */}
          <div className="bg-primary/5 border border-primary/15 rounded-2xl p-5">
            <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-3">
              Active Thresholds (Farm Config)
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between font-semibold text-textPrimary">
                <span className="text-textMuted">Min Moisture:</span>
                <span>{thresholds?.minMoisture ?? 30}%</span>
              </div>
              <div className="flex justify-between font-semibold text-textPrimary">
                <span className="text-textMuted">Max Moisture:</span>
                <span>{thresholds?.maxMoisture ?? 70}%</span>
              </div>
              <div className="flex justify-between font-semibold text-textPrimary">
                <span className="text-textMuted">Max Temperature:</span>
                <span>{thresholds?.maxTemperature ?? 35}°C</span>
              </div>
              <div className="flex justify-between font-semibold text-textPrimary">
                <span className="text-textMuted">Min Humidity:</span>
                <span>{thresholds?.minHumidity ?? 20}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualInput;
