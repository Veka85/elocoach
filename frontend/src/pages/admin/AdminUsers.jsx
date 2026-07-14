import { useState, useEffect } from 'react';
import { getAdminUsers, updateAdminUser, deleteAdminUser } from '../../services/adminService';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { formatDate } from '../../utils/helpers';

/**
 * AdminUsers Page — User management table
 * File: src/pages/admin/AdminUsers.jsx
 *
 * Full CRUD-like management of users.
 * Demonstrates:
 * - Search and filtering on admin side
 * - Inline actions (verify, delete)
 * - Confirmation dialogs before destructive actions
 */
export default function AdminUsers() {
  const [users, setUsers]   = useState([]);
  const [meta, setMeta]     = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);
  const [filters, setFilters] = useState({ search: '', role: '', page: 1 });
  const [actionUserId, setActionUserId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));
      const data = await getAdminUsers(params);
      setUsers(data.data);
      setMeta(data.meta);
    } catch (err) {
      setError('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (userId, verify) => {
    setActionUserId(userId);
    try {
      await updateAdminUser(userId, { is_verified: verify });
      await fetchUsers();
    } catch (err) {
      setError('Failed to update user.');
    } finally {
      setActionUserId(null);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete ${user.name}? This cannot be undone.`)) return;
    setActionUserId(user.id);
    try {
      await deleteAdminUser(user.id);
      await fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user.');
    } finally {
      setActionUserId(null);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">User Management</h1>
          <p className="text-gray-400 mt-1">{meta.total} total users</p>
        </div>
      </div>

      {error && <div className="mb-6"><ErrorMessage message={error} onDismiss={() => setError(null)} /></div>}

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-48">
            <input
              type="text"
              placeholder="Search by name, email, summoner..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="form-input"
            />
          </div>
          <div>
            <select
              value={filters.role}
              onChange={(e) => handleFilterChange('role', e.target.value)}
              className="form-input"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="coach">Coach</option>
              <option value="student">Student</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="py-16"><LoadingSpinner size="lg" /></div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 card">
          <p className="text-gray-400">No users found matching your filters.</p>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-800 border-b border-dark-600">
                <tr>
                  <th className="text-left text-xs text-gray-400 font-medium uppercase tracking-wider px-6 py-4">User</th>
                  <th className="text-left text-xs text-gray-400 font-medium uppercase tracking-wider px-6 py-4">Role</th>
                  <th className="text-left text-xs text-gray-400 font-medium uppercase tracking-wider px-6 py-4">Summoner</th>
                  <th className="text-left text-xs text-gray-400 font-medium uppercase tracking-wider px-6 py-4">Status</th>
                  <th className="text-left text-xs text-gray-400 font-medium uppercase tracking-wider px-6 py-4">Joined</th>
                  <th className="text-right text-xs text-gray-400 font-medium uppercase tracking-wider px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-dark-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-dark-600 flex items-center justify-center text-sm font-bold text-gray-300 flex-shrink-0">
                          {user.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-white text-sm">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${
                        user.role === 'admin' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        user.role === 'coach' ? 'bg-primary-500/10 text-primary-400 border-primary-500/20' :
                        'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      } border text-xs`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm text-gray-300 font-mono">{user.summoner_name || '—'}</p>
                        {user.region && <p className="text-xs text-gray-500">{user.region}</p>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.role === 'coach' ? (
                        user.coach_profile?.is_verified ? (
                          <span className="badge bg-green-500/10 text-green-400 border border-green-500/20 text-xs">✓ Verified</span>
                        ) : (
                          <span className="badge bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 text-xs">⏳ Pending</span>
                        )
                      ) : (
                        <span className="text-gray-500 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-400">{formatDate(user.created_at)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {user.role === 'coach' && !user.coach_profile?.is_verified && (
                          <button
                            onClick={() => handleVerify(user.id, true)}
                            disabled={actionUserId === user.id}
                            className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded transition-colors disabled:opacity-50"
                          >
                            Verify
                          </button>
                        )}
                        {user.role === 'coach' && user.coach_profile?.is_verified && (
                          <button
                            onClick={() => handleVerify(user.id, false)}
                            disabled={actionUserId === user.id}
                            className="text-xs bg-dark-600 hover:bg-dark-500 text-gray-300 px-2 py-1 rounded transition-colors"
                          >
                            Unverify
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(user)}
                          disabled={actionUserId === user.id}
                          className="text-xs bg-red-600/20 hover:bg-red-600/40 text-red-400 px-2 py-1 rounded transition-colors disabled:opacity-50"
                        >
                          {actionUserId === user.id ? '...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 pb-6">
            <Pagination
              currentPage={meta.current_page}
              lastPage={meta.last_page}
              onPageChange={(p) => setFilters(prev => ({ ...prev, page: p }))}
              total={meta.total}
            />
          </div>
        </div>
      )}
    </div>
  );
}
