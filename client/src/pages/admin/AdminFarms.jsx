import React, { useEffect, useState } from 'react';
import { getFarms, createFarm, updateFarm, deleteFarm, getUsers } from '../../api/admin.api';
import toast from 'react-hot-toast';
import { Plus, Edit, XCircle, Sprout } from 'lucide-react';

export const AdminFarms = () => {
  const [farms, setFarms] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editFarm, setEditFarm] = useState(null);
  const [form, setForm] = useState({ name: '', location: '', owner: '', area: '', cropType: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchFarms(); fetchFarmers(); }, []);

  const fetchFarms = async () => {
    setLoading(true);
    try {
      const res = await getFarms();
      setFarms(res.data || []);
    } catch (err) {
      toast.error('Failed to load farms');
    } finally {
      setLoading(false);
    }
  };

  const fetchFarmers = async () => {
    try {
      const res = await getUsers(1, 100, 'farmer');
      setFarmers(res.data || []);
    } catch (err) {}
  };

  const openCreate = () => {
    setEditFarm(null);
    setForm({ name: '', location: '', owner: '', area: '', cropType: '' });
    setShowForm(true);
  };

  const openEdit = (farm) => {
    setEditFarm(farm);
    setForm({ name: farm.name, location: farm.location, owner: farm.owner?._id || '', area: farm.area, cropType: farm.cropType });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.location || !form.owner || !form.area || !form.cropType) {
      toast.error('All fields are required'); return;
    }
    setSaving(true);
    try {
      if (editFarm) {
        await updateFarm(editFarm._id, form);
        toast.success('Farm updated');
      } else {
        await createFarm(form);
        toast.success('Farm created');
      }
      setShowForm(false);
      fetchFarms();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save farm');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (farm) => {
    try {
      await deleteFarm(farm._id);
      toast.success(`${farm.name} deactivated`);
      fetchFarms();
    } catch (err) {
      toast.error('Failed to deactivate farm');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black font-outfit text-textPrimary">Farm Management</h1>
          <p className="text-sm text-textMuted font-medium mt-1">Register and manage irrigation farm sites</p>
        </div>
        <button onClick={openCreate} className="flex items-center px-5 py-2.5 bg-primary hover:bg-primary-light text-white font-bold rounded-xl shadow-md text-sm transition-all">
          <Plus className="h-4 w-4 mr-2" /> Add Farm
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl ring-1 ring-secondary/20 p-6 shadow-lg">
          <h3 className="text-base font-bold text-textPrimary mb-5">{editFarm ? 'Edit Farm' : 'Register New Farm'}</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Farm Name', field: 'name', placeholder: 'e.g. Melekai Farm' },
              { label: 'Location', field: 'location', placeholder: 'e.g. Nairobi, Kenya' },
              { label: 'Area (Acres)', field: 'area', placeholder: '2.5', type: 'number' },
              { label: 'Crop Type', field: 'cropType', placeholder: 'e.g. Maize' },
            ].map(({ label, field, placeholder, type }) => (
              <div key={field} className="space-y-1.5">
                <label className="text-xs font-bold text-textMuted uppercase tracking-wider">{label}</label>
                <input type={type || 'text'} value={form[field]} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-secondary/50" />
              </div>
            ))}
            <div className="space-y-1.5 col-span-2">
              <label className="text-xs font-bold text-textMuted uppercase tracking-wider">Farm Owner (Farmer)</label>
              <select value={form.owner} onChange={e => setForm(p => ({ ...p, owner: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-secondary/50">
                <option value="">— Select Farmer —</option>
                {farmers.map(f => <option key={f._id} value={f._id}>{f.name} ({f.email})</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 mt-5 pt-4 border-t border-gray-100">
            <button onClick={() => setShowForm(false)} className="px-5 py-2.5 border border-gray-200 text-textMuted font-bold rounded-xl text-sm hover:bg-gray-50">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="flex-1 bg-primary hover:bg-primary-light text-white font-bold rounded-xl py-2.5 text-sm shadow-md disabled:opacity-50">
              {saving ? 'Saving...' : editFarm ? 'Update Farm' : 'Register Farm'}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-3 bg-white rounded-xl p-16 flex items-center justify-center ring-1 ring-gray-100">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : farms.length === 0 ? (
          <div className="col-span-3 bg-white rounded-2xl ring-1 ring-gray-100 p-16 text-center">
            <Sprout className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-lg font-bold text-textPrimary">No farms registered yet</p>
          </div>
        ) : farms.map(farm => (
          <div key={farm._id} className={`bg-white rounded-2xl ring-1 p-6 shadow-sm transition-all hover:shadow-md ${farm.isActive ? 'ring-secondary/20' : 'ring-gray-100 opacity-60'}`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2.5 rounded-xl ${farm.isActive ? 'bg-primary/10' : 'bg-gray-100'}`}>
                  <Sprout className={`h-5 w-5 ${farm.isActive ? 'text-primary' : 'text-gray-400'}`} />
                </div>
                <div>
                  <p className="font-bold text-textPrimary">{farm.name}</p>
                  <p className="text-xs text-textMuted font-medium">{farm.location}</p>
                </div>
              </div>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${farm.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'}`}>
                {farm.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="space-y-1 mb-4">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-textMuted">Owner:</span>
                <span className="text-textPrimary font-bold">{farm.owner?.name || '—'}</span>
              </div>
              <div className="flex justify-between text-xs font-medium">
                <span className="text-textMuted">Crop:</span>
                <span className="text-textPrimary font-bold">{farm.cropType}</span>
              </div>
              <div className="flex justify-between text-xs font-medium">
                <span className="text-textMuted">Area:</span>
                <span className="text-textPrimary font-bold">{farm.area} acres</span>
              </div>
            </div>
            <div className="flex gap-2 pt-3 border-t border-gray-100">
              <button onClick={() => openEdit(farm)} className="flex-1 flex items-center justify-center py-2 text-xs font-bold text-primary border border-primary/20 rounded-xl hover:bg-primary/5 transition-colors">
                <Edit className="h-3.5 w-3.5 mr-1.5" /> Edit
              </button>
              {farm.isActive && (
                <button onClick={() => handleDeactivate(farm)} className="flex-1 flex items-center justify-center py-2 text-xs font-bold text-danger border border-danger/20 rounded-xl hover:bg-danger/5 transition-colors">
                  <XCircle className="h-3.5 w-3.5 mr-1.5" /> Deactivate
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminFarms;
