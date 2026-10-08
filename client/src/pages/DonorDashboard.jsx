import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiDroplet, FiClock, FiCheckCircle, FiArchive, FiPlusCircle, FiList } from 'react-icons/fi';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import toast from 'react-hot-toast';

const DonorDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, pending: 0, verified: 0, collected: 0 });
  const [recentDonations, setRecentDonations] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [donationsRes, profileRes] = await Promise.all([
        axios.get('/donations/my'),
        axios.get('/donors/profile')
      ]);

      const donations = donationsRes.data.data || [];
      
      const counts = {
        total: donations.length,
        pending: donations.filter(d => d.status === 'pending').length,
        verified: donations.filter(d => d.status === 'verified').length,
        collected: donations.filter(d => d.status === 'collected').length,
      };

      setStats(counts);
      setRecentDonations(donations.slice(0, 5));
      setProfile(profileRes.data.data);
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.name}</h1>
          <p className="text-gray-600 mt-1">Donor Dashboard</p>
        </div>
        {profile && (
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
            <span className="text-sm text-gray-500">Screening Status:</span>
            <StatusBadge status={profile.screeningStatus || 'pending'} />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Donations" value={stats.total} icon={FiDroplet} color="blue" />
        <StatCard title="Pending Review" value={stats.pending} icon={FiClock} color="yellow" />
        <StatCard title="Verified" value={stats.verified} icon={FiCheckCircle} color="green" />
        <StatCard title="Collected" value={stats.collected} icon={FiArchive} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Recent Donations</h2>
              <Link to="/donor/donations" className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
                View All <FiList />
              </Link>
            </div>
            
            {recentDonations.length === 0 ? (
              <EmptyState message="You haven't made any donations yet." />
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hospital</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty (ml)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentDonations.map((donation) => (
                      <tr key={donation._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(donation.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {donation.hospital?.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {donation.quantityMl}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={donation.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Quick Actions</h2>
            <div className="space-y-4">
              <Link 
                to="/donor/donate" 
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                <FiPlusCircle className="text-lg" /> Donate Milk
              </Link>
              <Link 
                to="/profile" 
                className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-200 transition"
              >
                Update Profile
              </Link>
            </div>
          </div>
          
          {profile && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">My Info</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">Blood Group</span>
                  <span className="font-medium text-red-600">{profile.bloodGroup}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">Age</span>
                  <span className="font-medium text-gray-900">{profile.age} yrs</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Registered</span>
                  <span className="font-medium text-gray-900">{new Date(profile.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DonorDashboard;
