import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { toast } from 'react-hot-toast';
import { FiPlus, FiTrash2, FiActivity } from 'react-icons/fi';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const BabyRegistration = () => {
  const [babies, setBabies] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [deleteId, setDeleteId] = useState(null);

  const [formData, setFormData] = useState({
    babyName: '',
    ageInMonths: '',
    weightKg: '',
    bloodGroup: '',
    medicalCondition: '',
    hospitalId: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [babiesRes, hospitalsRes] = await Promise.all([
        axios.get('/babies'),
        axios.get('/hospitals')
      ]);
      setBabies(babiesRes.data.data || []);
      setHospitals(hospitalsRes.data.data || []);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        babyName: formData.babyName,
        ageInMonths: Number(formData.ageInMonths),
        weightKg: Number(formData.weightKg),
        bloodGroup: formData.bloodGroup,
        medicalCondition: formData.medicalCondition,
        hospital: formData.hospitalId || undefined
      };
      await axios.post('/babies', payload);
      toast.success('Baby registered successfully');
      setShowForm(false);
      setFormData({ babyName: '', ageInMonths: '', weightKg: '', bloodGroup: '', medicalCondition: '', hospitalId: '' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register baby');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await axios.delete(`/babies/${deleteId}`);
      toast.success('Record deleted successfully');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete record');
    } finally {
      setDeleteId(null);
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-[60vh]"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Registered Babies</h1>
          <p className="text-gray-600 mt-1">Manage your babies' profiles</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2 shadow-sm"
        >
          <FiPlus /> {showForm ? 'Cancel' : 'Register New Baby'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-8 animate-fade-in-down">
          <h2 className="text-lg font-bold text-gray-800 mb-6 border-b pb-2">New Baby Registration</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Baby Name</label>
              <input type="text" name="babyName" required value={formData.babyName} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age (Months)</label>
              <input type="number" name="ageInMonths" required min="0" max="12" step="0.1" value={formData.ageInMonths} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weight (Kg)</label>
              <input type="number" name="weightKg" required min="0.5" max="15" step="0.01" value={formData.weightKg} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
              <select name="bloodGroup" required value={formData.bloodGroup} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value="">Select</option>
                {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Admitted Hospital (if any)</label>
              <select name="hospitalId" value={formData.hospitalId} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value="">None / Not Admitted</option>
                {hospitals.map(h => <option key={h._id} value={h._id}>{h.name} ({h.city})</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Medical Condition / Notes</label>
              <textarea name="medicalCondition" value={formData.medicalCondition} onChange={handleInputChange} rows="2" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="e.g. Premature birth, lactose intolerance..."></textarea>
            </div>
            <div className="md:col-span-2 flex justify-end">
              <button type="submit" disabled={submitting} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-70 flex items-center gap-2">
                {submitting ? <LoadingSpinner size="sm" color="white" /> : 'Save Registration'}
              </button>
            </div>
          </form>
        </div>
      )}

      {babies.length === 0 ? (
        <EmptyState message="No babies registered yet. Register your baby to request milk." icon={FiActivity} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {babies.map((baby) => (
            <div key={baby._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative group">
              <button 
                onClick={() => setDeleteId(baby._id)}
                className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
                title="Delete Record"
              >
                <FiTrash2 className="text-xl" />
              </button>
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 text-xl font-bold">
                {baby.babyName.charAt(0).toUpperCase()}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{baby.babyName}</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p><span className="font-medium text-gray-800">Age:</span> {baby.ageInMonths} months</p>
                <p><span className="font-medium text-gray-800">Weight:</span> {baby.weightKg} kg</p>
                <p><span className="font-medium text-gray-800">Blood Group:</span> <span className="text-red-500 font-medium">{baby.bloodGroup}</span></p>
                {baby.hospital && <p><span className="font-medium text-gray-800">Hospital:</span> {baby.hospital.name}</p>}
                {baby.medicalCondition && (
                  <p className="mt-2 pt-2 border-t border-gray-50"><span className="font-medium text-gray-800">Condition:</span> {baby.medicalCondition}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Record"
        message="Are you sure you want to delete this baby's record? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default BabyRegistration;
