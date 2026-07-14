/**
 * CoachFilters Component
 * File: src/components/coaches/CoachFilters.jsx
 *
 * Filter panel for the coaches listing page.
 *
 * CONTROLLED INPUTS CONCEPT:
 * Each input is "controlled" — its value comes from state, not the DOM.
 * React is the "single source of truth" for all form values.
 * value={filters.rank} + onChange={...} = controlled input
 *
 * @param {Object} filters - Current filter state from parent
 * @param {Function} onFilterChange - Called when any filter changes
 */
export default function CoachFilters({ filters, onFilterChange }) {
  const ranks = ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Emerald', 'Diamond', 'Master', 'Grandmaster', 'Challenger'];
  const regions = ['EUW', 'EUNE', 'NA', 'KR', 'JP', 'BR', 'LAN', 'LAS', 'OCE', 'TR', 'RU'];
  const sortOptions = [
    { value: 'rating', label: 'Highest Rated' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'sessions', label: 'Most Sessions' },
  ];

  const handleChange = (key, value) => {
    // Spread the existing filters and update only the changed key
    // This is the "immutable update" pattern — don't mutate the original object
    onFilterChange({ ...filters, [key]: value, page: 1 }); // Reset to page 1 on filter change
  };

  const clearFilters = () => {
    onFilterChange({ search: '', rank: '', region: '', max_price: '', sort: 'rating', page: 1 });
  };

  const hasActiveFilters = filters.rank || filters.region || filters.max_price;

  return (
    <div className="card mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white">Filters</h3>
        {hasActiveFilters && (
          <button onClick={clearFilters} className="text-xs text-gray-400 hover:text-primary-400 transition-colors">
            Clear all
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* SEARCH */}
        <div>
          <label className="form-label">Search</label>
          <input
            type="text"
            placeholder="Name or summoner..."
            value={filters.search || ''}
            onChange={(e) => handleChange('search', e.target.value)}
            className="form-input"
          />
        </div>

        {/* RANK */}
        <div>
          <label className="form-label">Minimum Rank</label>
          <select
            value={filters.rank || ''}
            onChange={(e) => handleChange('rank', e.target.value)}
            className="form-input"
          >
            <option value="">Any Rank</option>
            {ranks.map((rank) => (
              <option key={rank} value={rank}>{rank}</option>
            ))}
          </select>
        </div>

        {/* REGION */}
        <div>
          <label className="form-label">Region</label>
          <select
            value={filters.region || ''}
            onChange={(e) => handleChange('region', e.target.value)}
            className="form-input"
          >
            <option value="">All Regions</option>
            {regions.map((region) => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
        </div>

        {/* MAX PRICE */}
        <div>
          <label className="form-label">Max Price/Hour</label>
          <input
            type="number"
            placeholder="e.g. 50"
            min="0"
            value={filters.max_price || ''}
            onChange={(e) => handleChange('max_price', e.target.value)}
            className="form-input"
          />
        </div>
      </div>

      {/* SORT */}
      <div className="mt-4 flex items-center gap-4">
        <span className="text-sm text-gray-400">Sort by:</span>
        <div className="flex flex-wrap gap-2">
          {sortOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleChange('sort', opt.value)}
              className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                filters.sort === opt.value
                  ? 'bg-primary-500 text-dark-950 font-medium'
                  : 'bg-dark-600 text-gray-400 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
