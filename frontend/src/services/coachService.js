import api from '../api/axios';

/**
 * Coach Service
 * File: src/services/coachService.js
 *
 * SERVICE LAYER CONCEPT:
 * Services centralize API calls in one place.
 * Components shouldn't know API endpoint URLs — they call service functions.
 *
 * Benefits:
 * 1. If the API URL changes, update it in ONE service file, not 10 components
 * 2. Services can be unit tested without rendering React components
 * 3. Components stay focused on UI, services handle data fetching
 *
 * Each function returns the response.data (unwrapped from Axios response),
 * so callers get the actual data, not the HTTP response object.
 */

/**
 * Fetch paginated list of coaches with optional filters.
 *
 * @param {Object} params - Filter/search parameters
 * @param {string} params.search - Search by name or summoner name
 * @param {string} params.rank - Filter by rank (Diamond, Master, etc.)
 * @param {number} params.max_price - Maximum hourly rate
 * @param {string} params.region - Filter by region (EUW, NA, etc.)
 * @param {string} params.sort - Sort order (rating, price_asc, sessions)
 * @param {number} params.page - Page number
 * @returns {Promise<{data: Coach[], meta: PaginationMeta}>}
 */
export const getCoaches = async (params = {}) => {
  // Axios automatically serializes params object into query string:
  // { search: 'Faker', rank: 'Diamond' } → ?search=Faker&rank=Diamond
  const response = await api.get('/coaches', { params });
  return response.data;
};

/**
 * Get a single coach's detailed profile with reviews.
 *
 * @param {number} id - Coach's user ID
 * @returns {Promise<{data: Coach, reviews: Review[]}>}
 */
export const getCoach = async (id) => {
  const response = await api.get(`/coaches/${id}`);
  return response.data;
};

/**
 * Update the authenticated coach's own profile.
 * Only available to users with role='coach'.
 *
 * @param {number} id - Coach's user ID (must match authenticated user)
 * @param {Object} profileData - Updated profile fields
 * @returns {Promise<{data: Coach}>}
 */
export const updateCoachProfile = async (id, profileData) => {
  const response = await api.put(`/coaches/${id}/profile`, profileData);
  return response.data;
};
