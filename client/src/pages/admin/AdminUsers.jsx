import React, { useEffect, useState } from 'react';
import { getUsers, createUser, updateUser, deleteUser } from '../../api/admin.api';
import { getFarms } from '../../api/admin.api';
import toast from 'react-hot-toast';
import { Plus, Edit, UserX, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatRelativeTime } from '../../utils/formatters';

const ROLES = ['admin', 'farmer', 'viewer'];

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'farmer', farmId: '', isActive: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchUsers(); fetchFarms(); }, [page, roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getUsers(page, 10, roleFilter);
      setUsers(res.data || []);
      setPagination(res.pagination || {});
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchFarms = async () => {
    try {
      const res = await getFarms();
      setFarms(res.data || []);
    } catch (err) {}
  };

  const openCreate = () => {
    setEditUser(null);
    setForm({ name: '', email: '', password: '', role: 'farmer', farmId: '', isActive: true });
    setShowForm(true);
  };

  const openEdit = (user) => {
    setEditUser(user);
    setForm({ name: user.name, email: user.email, password: '', role: user.role, farmId: user.farmId?._id || user.farmId || '', isActive: user.isActive });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.email) { toast.error('Name and email are required'); return; }
    if (!editUser && !form.password) { toast.error('Password is required for new users'); return; }
    setSaving(true);
    try {
      if (editUser) {
        const payload = { name: form.name, email: form.email, role: form.role, farmId: form.farmId || null, isActive: form.isActive };
        if (form.password) payload.password = form.password;
        await updateUser(editUser._id, payload);
        toast.success('User updated successfully');
      } else {
        await createUser({ name: form.name, email: form.email, password: form.password, role: form.role, farmId: form.farmId || null });
        toast.success('User created successfully');
      }
      setShowForm(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (user) => {
    try {
      await deleteUser(user._id);
      toast.success(`${user.name} deactivated`);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to deactivate user');
    }
  };

  const filtered = users.filter(u => !searchTerm || u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()));

  const roleBadge = (role) => ({
    admin: 'bg-purple-100 text-purple-800',
    farmer: 'bg-green-100 text-green-800',
    viewer: 'bg-blue-100 text-blue-800'
  }[role] || 'bg-gray-100 text-gray-600');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black font-outfit text-textPrimary">User Management</h1>
          <p className="text-sm text-textMuted font-medium mt-1">Manage platform users, roles and farm assignments</p>
        </div>
        <button onClick={openCreate} className="flex items-center px-5 py-2.5 bg-primary hover:bg-primary-light text-white font-bold rounded-xl shadow-md text-sm transition-all">
          <Plus className="h-4 w-4 mr-2" /> Add User
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="bg-white rounded-2xl ring-1 ring-secondary/20 p-6 shadow-lg">
          <h3 className="text-base font-bold text-textPrimary mb-5">{editUser ? 'Edit User' : 'Create New User'}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-textMuted uppercase tracking-wider">Full Name</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-secondary/50" placeholder="Full Name" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-textMuted uppercase tracking-wider">Email Address</label>
              <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-secondary/50" placeholder="name@farm.com" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-textMuted uppercase tracking-wider">Password {editUser && '(leave blank to keep)'}</label>
              <input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-secondary/50" placeholder="••••••••" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-textMuted uppercase tracking-wider">Role</label>
              <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-secondary/50">
                {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-textMuted uppercase tracking-wider">Assign Farm</label>
              <select value={form.farmId} onChange={e => setForm(p => ({ ...p, farmId: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-secondary/50">
                <option value="">— None —</option>
                {farms.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
              </select>
            </div>
            {editUser && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-textMuted uppercase tracking-wider">Account Status</label>
                <select value={form.isActive ? 'active' : 'inactive'} onChange={e => setForm(p => ({ ...p, isActive: e.target.value === 'active' }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-secondary/50">
                  <option value="active">Active</option>
                  <option value="inactive">Deactivated</option>
                </select>
              </div>
            )}
          </div>
          <div className="flex gap-3 mt-5 pt-4 border-t border-gray-100">
            <button onClick={() => setShowForm(false)} className="px-5 py-2.5 border border-gray-200 text-textMuted font-bold rounded-xl text-sm hover:bg-gray-50">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="flex-1 bg-primary hover:bg-primary-light text-white font-bold rounded-xl py-2.5 text-sm shadow-md disabled:opacity-50">
              {saving ? 'Saving...' : editUser ? 'Update User' : 'Create User'}
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search users..." className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-secondary/50 bg-white" />
        </div>
        {['all', ...ROLES].map(r => (
          <button key={r} onClick={() => { setRoleFilter(r); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-colors ${roleFilter === r ? 'bg-primary text-white shadow-md' : 'bg-white border border-gray-200 text-textMuted hover:bg-mintBg'}`}>
            {r}
          </button>
        ))}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl ring-1 ring-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-textMuted font-bold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3 text-left">Name</th>
                <th className="px-5 py-3 text-left">Email</th>
                <th className="px-5 py-3 text-left">Role</th>
                <th className="px-5 py-3 text-left">Farm</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-left">Last Login</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={7} className="px-5 py-10 text-center text-textMuted">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-textMuted font-medium">No users found.</td></tr>
              ) : filtered.map(u => (
                <tr key={u._id} className="hover:bg-mintBg transition-colors">
                  <td className="px-5 py-3 font-bold text-textPrimary">{u.name}</td>
                  <td className="px-5 py-3 text-textMuted font-medium text-xs">{u.email}</td>
                  <td className="px-5 py-3"><span className={`text-xs font-bold px-2.5 py-1 rounded-full ${roleBadge(u.role)}`}>{u.role}</span></td>
                  <td className="px-5 py-3 text-textMuted text-xs font-medium">{u.farmId?.name || '—'}</td>
                  <td className="px-5 py-3">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${u.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-textMuted text-xs font-medium">{u.lastLogin ? formatRelativeTime(u.lastLogin) : 'Never'}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button onClick={() => openEdit(u)} className="p-1.5 text-primary/70 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors">
                        <Edit className="h-4 w-4" />
                      </button>
                      {u.isActive && (
                        <button onClick={() => handleDeactivate(u)} className="p-1.5 text-danger/60 hover:text-danger hover:bg-red-50 rounded-lg transition-colors">
                          <UserX className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-textMuted font-medium">Page {pagination.page} of {pagination.pages} — {pagination.total} users</span>
            <div className="flex space-x-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 border border-gray-200 rounded-lg text-textMuted disabled:opacity-40 hover:bg-gray-50">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages} className="p-1.5 border border-gray-200 rounded-lg text-textMuted disabled:opacity-40 hover:bg-gray-50">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
