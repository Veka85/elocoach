import { useState, useEffect } from 'react';
import { getAdminSessions } from '../../services/adminService';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { formatDateTime, formatCurrency, getStatusColor, capitalize } from '../../utils/helpers';
import { Link } from 'react-router-dom';

/**
 * AdminSessions Page — All platform sessions with filtering
 * File: src/pages/admin/AdminSessions.jsx
 *
 * Allows admin to monitor all sessions across the platform.
 * Can filter by status and view session details.
 */
export default function AdminSessions() {
  const [sessions, setSessions] = useState([]);
  const [meta, setMeta]         = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage]           = useState(1);

  const statuses = ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'];

  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      try {
        const params = { page };
        if (statusFilter) params.status = statusFilter;
        const data = await getAdminSessions(params);
        setSessions(data.data);
        setMeta(data.meta);
      } catch (err) {
        setError('Failed to load sessions.');
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, [statusFilter, page]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">All Sessions</h1>
          <p className="text-gray-400 mt-1">{meta.total} total sessions</p>
        </div>
        <Link to="/admin" className="btn-secondary text-sm">← Dashboard</Link>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Status filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => { setStatusFilter(''); setPage(1); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            !statusFilter ? 'bg-primary-500 text-dark-950' : 'bg-dark-700 text-gray-400 hover:text-white'
          }`}
        >
          All
        </button>
        {statuses.map((status) => (
          <button
            key={status}
            onClick={() => { setStatusFilter(status); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === status ? 'bg-primary-500 text-dark-950' : 'bg-dark-700 text-gray-400 hover:text-white'
            }`}
          >
            {capitalize(status)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-16"><LoadingSpinner size="lg" /></div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-12 card">
          <p className="text-gray-400">No sessions found.</p>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-800 border-b border-dark-600">
                <tr>
                  <th className="text-left text-xs text-gray-400 font-medium uppercase tracking-wider px-6 py-4">ID</th>
                  <th className="text-left text-xs text-gray-400 font-medium uppercase tracking-wider px-6 py-4">Coach</th>
                  <th className="text-left text-xs text-gray-400 font-medium uppercase tracking-wider px-6 py-4">Student</th>
                  <th className="text-left text-xs text-gray-400 font-medium uppercase tracking-wider px-6 py-4">Scheduled</th>
                  <th className="text-left text-xs text-gray-400 font-medium uppercase tracking-wider px-6 py-4">Price</th>
                  <th className="text-left text-xs text-gray-400 font-medium uppercase tracking-wider px-6 py-4">Status</th>
                  <th className="text-right text-xs text-gray-400 font-medium uppercase tracking-wider px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700">
                {sessions.map((session) => (
                  <tr key={session.id} className="hover:bg-dark-700/50 transition-colors">
                    <td className="px-6 py-4 text-gray-500 text-sm">#{session.id}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-200">{session.coach?.name || '—'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-200">{session.student?.name || '—'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-300">{formatDateTime(session.scheduled_at)}</p>
                      <p className="text-xs text-gray-500">{session.duration_minutes}min</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-200">{formatCurrency(session.price)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${getStatusColor(session.status)} text-xs`}>
                        {capitalize(session.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/sessions/${session.id}`} className="text-xs text-primary-400 hover:underline">
                        View →
                      </Link>
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
              onPageChange={setPage}
              total={meta.total}
            />
          </div>
        </div>
      )}
    </div>
  );
}
