import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { toast } from 'react-hot-toast';
import { FiAlertCircle } from 'react-icons/fi';
import LoadingSpinner from '../components/LoadingSpinner';

const RequestForm = () => {
  const [babies, setBabies] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    babyId: '',
    hospitalId: '',
    quantityMl: '',
    urgency: 'normal',
    notes: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchFormData();
  }, []);

  const fetchFormData = async () => {
    try {
      const [babiesRes, hospitalsRes] = await Promise.all([
        axios.get('/babies'),
        axios.get('/hospitals')
      ]);
      setBabies(babiesRes.data.data || []);
      setHospitals(hospitalsRes.data.data || []);
    } catch (err) {
      toast.error('Failed to load form requirements');
    } finally {
      setLoading(false);
    }
  };

  const handleBabyChange = (e) => {
    const selectedBabyId = e.target.value;
    const selectedBaby = babies.find(b => b._id === selectedBabyId);
    
    setFormData({
      ...formData,
      babyId: selectedBabyId,
      // Auto-fill hospital if baby is already assigned to one
      hospitalId: selectedBaby?.hospital?._id || ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.babyId || !formData.hospitalId || !formData.quantityMl) {
      toast.error('Please fill required fields');
      return;
    }

    setSubmitting(true);
    try {
      await axios.post('/requests', {
        baby: formData.babyId,
        hospital: formData.hospitalId,
        quantityMl: Number(formData.quantityMl),
        urgency: formData.urgency,
        notes: formData.notes
      });
      toast.success('Milk request submitted successfully!');
      navigate('/recipient/tracking');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-[60vh]"><LoadingSpinner size="lg" /></div>;

  if (babies.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl p-8 shadow-sm">
          <FiAlertCircle className="text-5xl mx-auto mb-4 text-yellow-500" />
          <h2 className="text-xl font-bold mb-2">No Registered Babies</h2>
          <p className="mb-6">You need to register a baby before you can request milk.</p>
          <button
            onClick={() => navigate('/recipient/babies')}
            className="bg-yellow-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-yellow-600 transition"
          >
            Register a Baby
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100 bg-gray-50">
          <h2 className="text-2xl font-bold text-gray-800">Request Pasteurized Milk</h2>
          <p className="text-gray-500 mt-1">Submit a requirement for your registered baby</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Baby <span className="text-red-500">*</span></label>
            <select
              required
              value={formData.babyId}
              onChange={handleBabyChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">-- Choose Baby --</option>
              {babies.map(b => (
                <option key={b._id} value={b._id}>{b.babyName} (Blood: {b.bloodGroup})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Target Hospital/Milk Bank <span className="text-red-500">*</span></label>
            <select
              required
              value={formData.hospitalId}
              onChange={(e) => setFormData({ ...formData, hospitalId: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">-- Choose Hospital --</option>
              {hospitals.map(h => (
                <option key={h._id} value={h._id}>{h.name} ({h.city})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Required Quantity (ml) <span className="text-red-500">*</span></label>
            <input
              type="number"
              required
              min="10"
              max="1000"
              value={formData.quantityMl}
              onChange={(e) => setFormData({ ...formData, quantityMl: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. 150"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Urgency Level <span className="text-red-500">*</span></label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="urgency"
                  value="normal"
                  checked={formData.urgency === 'normal'}
                  onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                  className="text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span className="text-gray-700">Normal</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="urgency"
                  value="emergency"
                  checked={formData.urgency === 'emergency'}
                  onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                  className="text-red-600 focus:ring-red-500 w-4 h-4"
                />
                <span className="text-red-600 font-medium">Emergency</span>
              </label>
            </div>
            {formData.urgency === 'emergency' && (
              <p className="text-xs text-red-500 mt-2 mt-1">Emergency requests are prioritized but depend on immediate stock availability.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes / Doctor's Prescription Ref</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows="3"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Any specific medical requirements or prescription details..."
            ></textarea>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-70 flex justify-center items-center"
            >
              {submitting ? <LoadingSpinner size="sm" color="white" /> : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestForm;
