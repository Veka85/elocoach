import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateCoachProfile } from '../services/coachService';
import api from '../api/axios';
import StarRating from '../components/common/StarRating';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { getRankColor, getRankEmoji, formatDate } from '../utils/helpers';

/**
 * Profile Page — User profile management
 * File: src/pages/Profile.jsx
 *
 * Shows user info and allows coaches to update their profile.
 * Also includes Riot API summoner lookup.
 *
 * OPTIMISTIC UPDATES:
 * After saving, we update the local state immediately
 * rather than re-fetching from the API. This makes the UI
 * feel instant. If the save fails, we show an error.
 */
export default function Profile() {
  const { user, isCoach, updateUser } = useAuth();
  const [editing, setEditing]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState(null);
  const [success, setSuccess]   = useState(false);

  // Riot API lookup
  const [summonerSearch, setSummonerSearch] = useState('');
  const [summonerData, setSummonerData]     = useState(null);
  const [summonerLoading, setSummonerLoading] = useState(false);
  const [summonerError, setSummonerError]   = useState(null);

  const [formData, setFormData] = useState({
    bio:             user?.coach_profile?.bio || '',
    hourly_rate:     user?.coach_profile?.hourly_rate || '',
    rank:            user?.coach_profile?.rank || 'Unranked',
    peak_rank:       user?.coach_profile?.peak_rank || '',
    specializations: user?.coach_profile?.specializations?.join(', ') || '',
    champions:       user?.coach_profile?.champions?.join(', ') || '',
    languages:       user?.coach_profile?.languages?.join(', ') || '',
    is_available:    user?.coach_profile?.is_available ?? true,
    youtube_url:     user?.coach_profile?.youtube_url || '',
    twitch_url:      user?.coach_profile?.twitch_url || '',
    summoner_name:   user?.summoner_name || '',
    region:          user?.region || 'EUW',
  });

  const ranks = ['Unranked', 'Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Emerald', 'Diamond', 'Master', 'Grandmaster', 'Challenger'];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // Convert comma-separated strings back to arrays
      const payload = {
        ...formData,
        specializations: formData.specializations.split(',').map(s => s.trim()).filter(Boolean),
        champions:       formData.champions.split(',').map(s => s.trim()).filter(Boolean),
        languages:       formData.languages.split(',').map(s => s.trim()).filter(Boolean),
        hourly_rate:     parseFloat(formData.hourly_rate) || 0,
      };

      const result = await updateCoachProfile(user.id, payload);

      // Update context with new user data (optimistic update)
      updateUser({ ...result.data });
      setEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleRiotLookup = async () => {
    if (!summonerSearch.trim()) return;
    setSummonerLoading(true);
    setSummonerError(null);
    setSummonerData(null);

    try {
      const region = user?.region || 'EUW';
      const response = await api.get(`/riot/summoner/${region}/${encodeURIComponent(summonerSearch)}`);
      setSummonerData(response.data.data);
    } catch (err) {
      setSummonerError(err.response?.data?.message || 'Summoner not found.');
    } finally {
      setSummonerLoading(false);
    }
  };

  const coachProfile = user?.coach_profile;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">My Profile</h1>

      {error   && <div className="mb-6"><ErrorMessage message={error} onDismiss={() => setError(null)} /></div>}
      {success && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm">
          ✅ Profile updated successfully!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT: User info */}
        <div className="space-y-4">
          {/* Avatar card */}
          <div className="card text-center">
            <div className="w-20 h-20 rounded-2xl bg-primary-500/20 border border-primary-500/30
                            flex items-center justify-center text-primary-400 text-4xl font-bold mx-auto mb-4">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <h2 className="text-xl font-bold text-white">{user?.name}</h2>
            <p className="text-gray-400 text-sm mt-1">{user?.email}</p>
            <span className={`badge mt-2 inline-flex ${
              user?.role === 'admin' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
              user?.role === 'coach' ? 'bg-primary-500/10 text-primary-400 border-primary-500/20' :
              'bg-blue-500/10 text-blue-400 border-blue-500/20'
            } border`}>
              {user?.role}
            </span>
          </div>

          {/* Coach stats */}
          {isCoach && coachProfile && (
            <div className="card">
              <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wide">Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Total Sessions</span>
                  <span className="text-white font-medium">{coachProfile.total_sessions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Rating</span>
                  <div className="flex items-center gap-1">
                    <StarRating rating={coachProfile.rating_avg} size="sm" />
                    <span className="text-white text-sm">{Number(coachProfile.rating_avg || 0).toFixed(1)}</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Status</span>
                  <span className={`text-sm ${coachProfile.is_verified ? 'text-green-400' : 'text-yellow-400'}`}>
                    {coachProfile.is_verified ? '✓ Verified' : '⏳ Pending'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Availability</span>
                  <span className={`text-sm ${coachProfile.is_available ? 'text-green-400' : 'text-gray-400'}`}>
                    {coachProfile.is_available ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Riot Lookup */}
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wide">Riot Summoner Lookup</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={summonerSearch}
                onChange={(e) => setSummonerSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRiotLookup()}
                placeholder="Summoner name..."
                className="form-input flex-1 text-sm py-2"
              />
              <button onClick={handleRiotLookup} disabled={summonerLoading} className="btn-secondary px-3">
                {summonerLoading ? <LoadingSpinner size="sm" /> : '🔍'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Region: {user?.region || 'EUW'}</p>
            {summonerError && <p className="text-red-400 text-xs mt-2">{summonerError}</p>}
            {summonerData && (
              <div className="mt-3 p-3 bg-dark-800 rounded-lg text-sm">
                <p className="font-medium text-white">{summonerData.summoner_name}</p>
                <p className="text-primary-400">{summonerData.rank}</p>
                <p className="text-gray-500 text-xs mt-1">
                  Level {summonerData.summoner_level} ·
                  {summonerData.wins}W {summonerData.losses}L
                  ({summonerData.win_rate}% WR)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Coach profile editing */}
        <div className="lg:col-span-2">
          {isCoach ? (
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Coach Profile</h2>
                {!editing && (
                  <button onClick={() => setEditing(true)} className="btn-secondary text-sm">
                    Edit Profile
                  </button>
                )}
              </div>

              {editing ? (
                <form onSubmit={handleSave} className="space-y-5">
                  {/* Bio */}
                  <div>
                    <label className="form-label">Bio</label>
                    <textarea name="bio" value={formData.bio} onChange={handleChange}
                      placeholder="Tell students about your experience and coaching style..."
                      rows={4} className="form-input resize-none" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Rank */}
                    <div>
                      <label className="form-label">Current Rank</label>
                      <select name="rank" value={formData.rank} onChange={handleChange} className="form-input">
                        {ranks.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                    {/* Peak Rank */}
                    <div>
                      <label className="form-label">Peak Rank</label>
                      <select name="peak_rank" value={formData.peak_rank} onChange={handleChange} className="form-input">
                        <option value="">Same as current</option>
                        {ranks.filter(r => r !== 'Unranked').map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Hourly Rate ($)</label>
                      <input type="number" name="hourly_rate" value={formData.hourly_rate} onChange={handleChange}
                        min="5" max="500" step="0.5" className="form-input" />
                    </div>
                    <div className="flex items-center gap-3 mt-6">
                      <input type="checkbox" id="is_available" name="is_available" checked={formData.is_available} onChange={handleChange}
                        className="w-4 h-4 rounded accent-primary-500" />
                      <label htmlFor="is_available" className="text-sm text-gray-300">Available for bookings</label>
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Specializations <span className="text-gray-500 font-normal">(comma separated)</span></label>
                    <input type="text" name="specializations" value={formData.specializations} onChange={handleChange}
                      placeholder="Mid Lane, Wave Management, Mechanics" className="form-input" />
                  </div>
                  <div>
                    <label className="form-label">Champion Pool <span className="text-gray-500 font-normal">(comma separated)</span></label>
                    <input type="text" name="champions" value={formData.champions} onChange={handleChange}
                      placeholder="Ahri, Syndra, Viktor" className="form-input" />
                  </div>
                  <div>
                    <label className="form-label">Languages <span className="text-gray-500 font-normal">(comma separated)</span></label>
                    <input type="text" name="languages" value={formData.languages} onChange={handleChange}
                      placeholder="English, Spanish" className="form-input" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">YouTube URL</label>
                      <input type="url" name="youtube_url" value={formData.youtube_url} onChange={handleChange}
                        placeholder="https://youtube.com/@you" className="form-input" />
                    </div>
                    <div>
                      <label className="form-label">Twitch URL</label>
                      <input type="url" name="twitch_url" value={formData.twitch_url} onChange={handleChange}
                        placeholder="https://twitch.tv/you" className="form-input" />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button type="submit" disabled={saving} className="btn-primary">
                      {saving ? <span className="flex items-center gap-2"><LoadingSpinner size="sm" /> Saving...</span> : 'Save Changes'}
                    </button>
                    <button type="button" onClick={() => setEditing(false)} className="btn-secondary">Cancel</button>
                  </div>
                </form>
              ) : (
                /* READ-ONLY VIEW */
                <div className="space-y-5">
                  {coachProfile?.bio ? (
                    <p className="text-gray-300 leading-relaxed">{coachProfile.bio}</p>
                  ) : (
                    <p className="text-gray-500 italic text-sm">No bio added yet. Click Edit Profile to add one.</p>
                  )}

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-dark-600">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Rank</p>
                      <div className="flex items-center gap-1">
                        <span>{getRankEmoji(coachProfile?.rank)}</span>
                        <span className={`font-medium ${getRankColor(coachProfile?.rank)}`}>{coachProfile?.rank || 'Unranked'}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Rate</p>
                      <p className="text-white font-medium">${coachProfile?.hourly_rate}/hr</p>
                    </div>
                  </div>

                  {coachProfile?.specializations?.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-2">Specializations</p>
                      <div className="flex flex-wrap gap-2">
                        {coachProfile.specializations.map(s => (
                          <span key={s} className="badge bg-primary-500/10 text-primary-400 border border-primary-500/20">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="card">
              <h2 className="text-xl font-semibold text-white mb-4">Account Info</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Member Since</p>
                    <p className="text-gray-200">{formatDate(user?.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Region</p>
                    <p className="text-gray-200">{user?.region || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Summoner Name</p>
                    <p className="text-gray-200 font-mono">{user?.summoner_name || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Discord</p>
                    <p className="text-gray-200">{user?.discord_username || 'Not set'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
