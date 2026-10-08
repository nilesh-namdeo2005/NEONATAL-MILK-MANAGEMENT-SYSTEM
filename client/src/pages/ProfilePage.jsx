import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { FiSave, FiUser } from 'react-icons/fi';

const ProfilePage = () => {
  const { user, login } = useAuth(); // Assuming login updates user context
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    // Donor fields
    age: '',
    bloodGroup: '',
    address: '',
    diseaseHistory: '',
    // Hospital fields
    hospitalName: '',
    city: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      let endpoint = '/auth/profile';
      if (user.role === 'donor') endpoint = '/donors/profile';
      else if (user.role === 'hospital') endpoint = '/hospitals/profile';

      const res = await axios.get(endpoint);
      const data = res.data.data;
      
      setProfileData({
        ...data,
        name: user.name || data.user?.name || data.name || '',
        phone: data.user?.phone || data.phone || user.phone || '',
        hospitalName: data.name || ''
      });
    } catch (err) {
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let endpoint = '/auth/profile';
      if (user.role === 'donor') endpoint = '/donors/profile';
      else if (user.role === 'hospital') endpoint = '/hospitals/profile';

      const payload = user.role === 'hospital'
        ? {
            name: profileData.hospitalName,
            address: profileData.address,
            city: profileData.city,
            phone: profileData.phone
          }
        : profileData;
      await axios.put(endpoint, payload);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-[60vh]"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-blue-600 px-6 py-8 text-white flex items-center gap-4">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-4xl">
            <FiUser />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-blue-100 capitalize">{user.role} Account</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 text-lg font-semibold text-gray-800 border-b pb-2">Basic Information</div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email (Cannot be changed)</label>
              <input type="email" disabled value={user.email} className="w-full p-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="tel" name="phone" value={profileData.phone} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>

            {user.role === 'donor' && (
              <>
                <div className="md:col-span-2 text-lg font-semibold text-gray-800 border-b pb-2 mt-4">Medical & Address Info</div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                  <input type="number" name="age" value={profileData.age || ''} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                  <input type="text" disabled value={profileData.bloodGroup || ''} className="w-full p-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500" title="Contact admin to change blood group" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea name="address" value={profileData.address || ''} onChange={handleChange} rows="2" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"></textarea>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Disease History</label>
                  <textarea name="diseaseHistory" value={profileData.diseaseHistory || ''} onChange={handleChange} rows="2" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"></textarea>
                </div>
              </>
            )}

            {user.role === 'hospital' && (
              <>
                <div className="md:col-span-2 text-lg font-semibold text-gray-800 border-b pb-2 mt-4">Hospital Details</div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Name</label>
                  <input type="text" name="hospitalName" value={profileData.hospitalName || ''} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input type="text" name="city" value={profileData.city || ''} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea name="address" value={profileData.address || ''} onChange={handleChange} rows="2" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"></textarea>
                </div>
              </>
            )}
          </div>

          <div className="pt-6 border-t mt-6 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 text-white px-8 py-2 rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-70"
            >
              {saving ? <LoadingSpinner size="sm" color="white" /> : <><FiSave /> Save Changes</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
