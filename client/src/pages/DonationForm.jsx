import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { FiDroplet, FiMapPin } from 'react-icons/fi';

const DonationForm = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    hospital: '',
    quantityMl: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      const res = await axios.get('/hospitals');
      setHospitals(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load hospitals list');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.hospital || !formData.quantityMl) {
      toast.error('Please fill all fields');
      return;
    }

    setSubmitting(true);
    try {
      await axios.post('/donations', {
        hospital: formData.hospital,
        quantityMl: Number(formData.quantityMl)
      });
      toast.success('Donation submitted successfully!');
      navigate('/donor/donations');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit donation');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-[60vh]"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-blue-600 px-6 py-8 text-white text-center">
          <FiDroplet className="text-4xl mx-auto mb-3 opacity-90" />
          <h2 className="text-2xl font-bold">Donate Milk</h2>
          <p className="text-blue-100 mt-2">Your generous donation can save a life</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Target Hospital
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiMapPin className="text-gray-400" />
              </div>
              <select
                required
                value={formData.hospital}
                onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
              >
                <option value="">-- Choose a hospital --</option>
                {hospitals.map(h => (
                  <option key={h._id} value={h._id}>
                    {h.name} ({h.city})
                  </option>
                ))}
              </select>
            </div>
            {hospitals.length === 0 && (
              <p className="text-sm text-red-500 mt-1">No approved hospitals found.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estimated Quantity (in ml)
            </label>
            <div className="relative">
              <input
                type="number"
                required
                min="50"
                max="2000"
                value={formData.quantityMl}
                onChange={(e) => setFormData({ ...formData, quantityMl: e.target.value })}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g. 150"
              />
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <span className="text-gray-500 font-medium">ml</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Minimum 50ml required. Exact quantity will be verified by the hospital upon collection.</p>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting || hospitals.length === 0}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 transition"
            >
              {submitting ? <LoadingSpinner size="sm" color="white" /> : 'Submit Donation Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DonationForm;
