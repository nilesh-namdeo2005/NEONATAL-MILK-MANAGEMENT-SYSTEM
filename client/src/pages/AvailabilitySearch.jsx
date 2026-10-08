import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { FiSearch, FiMapPin, FiDroplet } from 'react-icons/fi';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const AvailabilitySearch = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [searchError, setSearchError] = useState('');

  const [filters, setFilters] = useState({
    city: '',
    bloodGroup: '',
    minQuantity: ''
  });

  // Debounced search effect
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (filters.city || filters.bloodGroup || filters.minQuantity) {
        handleSearch();
      } else {
        setResults([]);
        setSearched(false);
        setSearchError('');
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [filters]);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setSearched(true);
    setSearchError('');
    try {
      const params = new URLSearchParams();
      if (filters.city) params.append('city', filters.city);
      if (filters.bloodGroup) params.append('bloodGroup', filters.bloodGroup);
      if (filters.minQuantity) params.append('minQuantity', filters.minQuantity);

      const res = await axios.get(`/inventory/availability?${params.toString()}`);
      setResults(res.data.data || []);
    } catch (err) {
      setResults([]);
      setSearchError(err.response?.data?.message || 'Search failed. Check the API connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Find Pasteurized Milk</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Search our network of verified milk banks and hospitals for available pasteurized human milk.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-10 border border-gray-100">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City / Location</label>
              <div className="relative">
                <FiMapPin className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  name="city"
                  value={filters.city}
                  onChange={handleFilterChange}
                  placeholder="e.g. New York"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
              <select
                name="bloodGroup"
                value={filters.bloodGroup}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Any Blood Group</option>
                {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Quantity (ml)</label>
              <input
                type="number"
                name="minQuantity"
                value={filters.minQuantity}
                onChange={handleFilterChange}
                placeholder="e.g. 100"
                min="0"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white p-2 rounded-lg font-medium hover:bg-blue-700 transition flex justify-center items-center gap-2"
              >
                <FiSearch /> Search
              </button>
            </div>
          </form>
        </div>

        {/* Results Section */}
        {loading ? (
          <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
        ) : searchError ? (
          <p role="alert" className="text-center text-red-700 py-12">{searchError}</p>
        ) : searched && results.length === 0 ? (
          <EmptyState message="No milk currently available matching your criteria. Try adjusting filters or expanding search area." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((item, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-900">{item.hospital?.name}</h3>
                  <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-bold border border-blue-100">
                    {item.bloodGroup}
                  </span>
                </div>
                <div className="space-y-3 text-gray-600 mb-6">
                  <p className="flex items-center gap-2"><FiMapPin className="text-gray-400" /> {item.hospital?.city}</p>
                  <p className="flex items-center gap-2"><FiDroplet className="text-blue-400" /> <span className="font-semibold text-gray-900">{item.availableMl} ml</span> available</p>
                </div>
                <button
                  onClick={() => navigate('/recipient/request')}
                  className="w-full block text-center bg-gray-50 hover:bg-blue-50 text-blue-700 border border-gray-200 hover:border-blue-200 py-2 rounded-lg font-medium transition"
                >
                  Request from here
                </button>
              </div>
            ))}
          </div>
        )}
        
        {!searched && (
          <div className="text-center py-20 text-gray-500">
            <FiSearch className="text-4xl mx-auto mb-4 opacity-30" />
            <p>Enter search criteria to find available milk across hospitals.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailabilitySearch;
