import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSessions } from '../services/sessionService';
import { useAuth } from '../context/AuthContext';
import SessionCard from '../components/sessions/SessionCard';
import Pagination from '../components/common/Pagination';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

/**
 * Sessions Page — List all sessions for the authenticated user
 * File: src/pages/Sessions.jsx
 *
 * Both coaches and students see their sessions here.
 * Tab-based filtering lets users switch between session statuses.
 *
 * TAB PATTERN:
 * - Active tab is stored in state
 * - Clicking a tab updates state → triggers useEffect → fetches filtered data
 */
export default function Sessions() {
  const { isCoach } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [meta, setMeta]         = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [page, setPage]           = useState(1);

  const tabs = [
    { key: 'all',       label: 'All' },
    { key: 'pending',   label: 'Pending' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = { page };
        if (activeTab !== 'all') params.status = activeTab;

        const data = await getSessions(params);
        setSessions(data.data);
        setMeta(data.meta);
      } catch (err) {
        setError('Failed to load sessions.');
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [activeTab, page]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1); // Reset pagination when changing tabs
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">My Sessions</h1>
          <p className="text-gray-400 mt-1">
            {isCoach ? 'Manage your coaching sessions' : 'Your booking history'}
          </p>
        </div>
        {!isCoach && (
          <Link to="/coaches" className="btn-primary">Book New Session</Link>
        )}
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 mb-6 bg-dark-900 p-1 rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-dark-700 text-white shadow'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-16"><LoadingSpinner size="lg" text="Loading sessions..." /></div>
      ) : error ? (
        <ErrorMessage message={error} />
      ) : sessions.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">📅</p>
          <h3 className="text-xl font-semibold text-white mb-2">
            {activeTab === 'all' ? 'No sessions yet' : `No ${activeTab} sessions`}
          </h3>
          <p className="text-gray-400 mb-4">
            {!isCoach ? 'Book your first coaching session to get started.' : 'Sessions will appear here once students book with you.'}
          </p>
          {!isCoach && (
            <Link to="/coaches" className="btn-primary inline-block">Find a Coach</Link>
          )}
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">{meta.total} session{meta.total !== 1 ? 's' : ''} found</p>
          <div className="space-y-4">
            {sessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                viewAs={isCoach ? 'coach' : 'student'}
              />
            ))}
          </div>
          <Pagination
            currentPage={meta.current_page}
            lastPage={meta.last_page}
            onPageChange={setPage}
            total={meta.total}
          />
        </>
      )}
    </div>
  );
}
