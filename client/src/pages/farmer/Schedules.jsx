import React, { useContext, useEffect, useState } from 'react';
import { FarmContext } from '../../context/FarmContext';
import { getSchedules, createSchedule, updateSchedule, deleteSchedule, toggleSchedule } from '../../api/schedule.api';
import toast from 'react-hot-toast';
import { Plus, Trash2, ToggleLeft, ToggleRight, Clock, Calendar } from 'lucide-react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const Schedules = () => {
  const { activeFarmId } = useContext(FarmContext);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editSchedule, setEditSchedule] = useState(null);
  const [form, setForm] = useState({ startTime: '06:00', duration: 30, daysOfWeek: [1, 3, 5] });

  useEffect(() => {
    if (activeFarmId) fetchSchedules();
  }, [activeFarmId]);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const res = await getSchedules(activeFarmId);
      setSchedules(res.data || []);
    } catch (err) {
      toast.error('Failed to load schedules');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.startTime || !form.duration || form.daysOfWeek.length === 0) {
      toast.error('Please fill all required fields and select at least one day.');
      return;
    }
    try {
      if (editSchedule) {
        await updateSchedule(editSchedule._id, { ...form, farmId: activeFarmId });
        toast.success('Schedule updated');
      } else {
        await createSchedule({ ...form, farmId: activeFarmId });
        toast.success('Schedule created');
      }
      setShowForm(false);
      setEditSchedule(null);
      setForm({ startTime: '06:00', duration: 30, daysOfWeek: [1, 3, 5] });
      fetchSchedules();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save schedule');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteSchedule(id);
      toast.success('Schedule deleted');
      fetchSchedules();
    } catch (err) {
      toast.error('Failed to delete schedule');
    }
  };

  const handleToggle = async (id) => {
    try {
      await toggleSchedule(id);
      fetchSchedules();
    } catch (err) {
      toast.error('Failed to toggle schedule');
    }
  };

  const toggleDay = (day) => {
    setForm(prev => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter(d => d !== day)
        : [...prev.daysOfWeek, day].sort()
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black font-outfit text-textPrimary">Irrigation Schedules</h1>
          <p className="text-sm text-textMuted font-medium mt-1">Automate irrigation with time-based pump schedules</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditSchedule(null); setForm({ startTime: '06:00', duration: 30, daysOfWeek: [1, 3, 5] }); }}
          className="flex items-center px-5 py-2.5 bg-primary hover:bg-primary-light text-white font-bold rounded-xl shadow-md transition-all text-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Schedule
        </button>
      </div>

      {/* Schedule Form Modal */}
      {showForm && (
        <div className="bg-white rounded-2xl ring-1 ring-secondary/20 p-6 shadow-lg space-y-5">
          <h3 className="text-base font-bold text-textPrimary">{editSchedule ? 'Edit Schedule' : 'Create Schedule'}</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-textMuted uppercase tracking-wider">Start Time</label>
              <input type="time" value={form.startTime} onChange={e => setForm(p => ({ ...p, startTime: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-textMuted uppercase tracking-wider">Duration (minutes)</label>
              <input type="number" min="1" max="480" value={form.duration} onChange={e => setForm(p => ({ ...p, duration: parseInt(e.target.value) }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-textMuted uppercase tracking-wider">Days of Week</label>
            <div className="flex gap-2 flex-wrap">
              {DAYS.map((day, i) => (
                <button key={i} type="button" onClick={() => toggleDay(i)}
                  className={`px-3 py-2 rounded-xl font-bold text-xs transition-all ${
                    form.daysOfWeek.includes(i)
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-gray-100 text-textMuted hover:bg-gray-200'
                  }`}>
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <button onClick={() => setShowForm(false)} className="px-5 py-2.5 border border-gray-200 text-textMuted font-bold rounded-xl text-sm hover:bg-gray-50">Cancel</button>
            <button onClick={handleSave} className="flex-1 bg-primary hover:bg-primary-light text-white font-bold rounded-xl py-2.5 text-sm shadow-md transition-all">Save Schedule</button>
          </div>
        </div>
      )}

      {/* Schedules List */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white rounded-xl p-12 flex items-center justify-center ring-1 ring-gray-100">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : schedules.length === 0 ? (
          <div className="bg-white rounded-2xl ring-1 ring-gray-100 p-16 text-center">
            <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-lg font-bold text-textPrimary">No Schedules Configured</p>
            <p className="text-sm text-textMuted font-medium mt-1">Create an automated irrigation schedule to save water.</p>
          </div>
        ) : schedules.map(s => (
          <div key={s._id} className={`bg-white rounded-xl ring-1 p-5 flex items-center justify-between transition-all ${s.isActive ? 'ring-secondary/30' : 'ring-gray-100 opacity-60'}`}>
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-xl ${s.isActive ? 'bg-primary/10' : 'bg-gray-100'}`}>
                <Clock className={`h-5 w-5 ${s.isActive ? 'text-primary' : 'text-gray-400'}`} />
              </div>
              <div>
                <p className="text-sm font-bold text-textPrimary">{s.startTime} • {s.duration} minutes</p>
                <p className="text-xs text-textMuted font-medium mt-0.5">
                  {s.daysOfWeek.map(d => DAYS[d]).join(', ')}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button onClick={() => handleToggle(s._id)} className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1 ${s.isActive ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                {s.isActive ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                <span>{s.isActive ? 'Active' : 'Paused'}</span>
              </button>
              <button onClick={() => handleDelete(s._id)} className="p-2 text-danger/60 hover:text-danger hover:bg-red-50 rounded-lg transition-colors">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Schedules;
