import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { FiUsers, FiFileText, FiClock, FiCheckCircle, FiPlusCircle, FiSearch, FiList } from 'react-icons/fi';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const RecipientDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ babies: 0, totalRequests: 0, pending: 0, completed: 0 });
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [babiesRes, requestsRes] = await Promise.all([
        axios.get('/babies'),
        axios.get('/requests/my')
      ]);

      const babies = babiesRes.data.data || [];
      const requests = requestsRes.data.data || [];

      setStats({
        babies: babies.length,
        totalRequests: requests.length,
        pending: requests.filter(r => r.status === 'pending').length,
        completed: requests.filter(r => r.status === 'completed').length,
      });

      setRecentRequests(requests.slice(0, 5));
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-[60vh]"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.name}</h1>
        <p className="text-gray-600 mt-1">Recipient Dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Registered Babies" value={stats.babies} icon={FiUsers} color="blue" />
        <StatCard title="Total Requests" value={stats.totalRequests} icon={FiFileText} color="purple" />
        <StatCard title="Pending Requests" value={stats.pending} icon={FiClock} color="yellow" />
        <StatCard title="Completed" value={stats.completed} icon={FiCheckCircle} color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Recent Milk Requests</h2>
              <Link to="/recipient/tracking" className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
                View All <FiList />
              </Link>
            </div>
            
            {recentRequests.length === 0 ? (
              <EmptyState message="No milk requests found." />
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Baby</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hospital</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentRequests.map((req) => (
                      <tr key={req._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(req.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {req.baby?.babyName || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {req.hospital?.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={req.status} />
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
                to="/recipient/babies" 
                className="w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-700 px-4 py-3 rounded-lg font-medium hover:bg-blue-100 transition border border-blue-200"
              >
                <FiUsers className="text-lg" /> Manage Babies
              </Link>
              <Link 
                to="/recipient/request" 
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                <FiPlusCircle className="text-lg" /> Request Milk
              </Link>
              <Link 
                to="/availability" 
                className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-200 transition"
              >
                <FiSearch className="text-lg" /> Check Milk Availability
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipientDashboard;
