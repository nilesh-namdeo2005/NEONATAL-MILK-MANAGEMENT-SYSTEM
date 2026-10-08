import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { toast } from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FiUsers, FiActivity, FiDownload, FiCheck, FiX } from 'react-icons/fi';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmDialog from '../components/ConfirmDialog';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  
  const [dialogState, setDialogState] = useState({ isOpen: false, action: null, id: null });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoadError('');
    try {
      const [statsRes, hospRes, usersRes] = await Promise.all([
        axios.get('/admin/stats'),
        axios.get('/hospitals/all?limit=100'),
        axios.get('/admin/users')
      ]);

      const data = statsRes.data.data;
      setStats({
        ...data,
        donationsByMonth: data.donationsByMonth.map(({ _id, totalMl }) => ({
          name: `${_id.year}-${String(_id.month).padStart(2, '0')}`,
          count: totalMl
        })),
        requestsByStatus: data.requestsByStatus.map(({ _id, count }) => ({
          name: _id,
          value: count
        }))
      });
      setHospitals(hospRes.data.data || []);
      setUsers(usersRes.data.data || []);
    } catch (err) {
      setLoadError(err.response?.data?.message || 'Failed to load admin data. Check the API connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleHospitalApproval = async (id, status) => {
    try {
      await axios.patch(`/hospitals/${id}/${status}`);
      toast.success(`Hospital ${status} successfully`);
      fetchData();
    } catch (err) {
      toast.error(`Failed to ${status} hospital`);
    } finally {
      setDialogState({ isOpen: false, action: null, id: null });
    }
  };

  const handleToggleUser = async (id) => {
    try {
      await axios.patch(`/admin/users/${id}/toggle`);
      toast.success('User status updated');
      fetchData();
    } catch (err) {
      toast.error('Failed to update user status');
    }
  };

  const handleExport = async () => {
    try {
      const res = await axios.get('/admin/reports/export?type=donations', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'donations_report.csv');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      toast.error('Failed to export report');
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen"><LoadingSpinner size="lg" /></div>;
  if (loadError || !stats) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-red-700 mb-4">{loadError || 'Admin data is unavailable.'}</p>
        <button onClick={fetchData} className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700">Retry</button>
      </div>
    );
  }

  const unapprovedHospitals = hospitals.filter(
    (hospital) => (hospital.approvalStatus || (hospital.isApproved ? 'approved' : 'pending')) === 'pending'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <button onClick={handleExport} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700">
          <FiDownload /> Export CSV
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <StatCard title="Donors" value={stats.totalDonors} color="blue" />
        <StatCard title="Recipients" value={stats.totalRecipients} color="purple" />
        <StatCard title="Hospitals" value={stats.totalHospitals} color="indigo" />
        <StatCard title="Pending Hosp" value={stats.pendingHospitals} color="red" />
        <StatCard title="Donations" value={stats.totalDonations} color="green" />
        <StatCard title="Requests" value={stats.totalRequests} color="yellow" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
          <h3 className="text-lg font-bold mb-4">Donations by Month (Last Year)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.donationsByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-4">Requests Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.requestsByStatus} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {stats.requestsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Hospital Approvals & User Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h3 className="text-lg font-bold">Pending Hospital Approvals</h3>
            <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded-full">{unapprovedHospitals.length} Pending</span>
          </div>
          <div className="p-0 max-h-96 overflow-y-auto">
            {unapprovedHospitals.length === 0 ? (
              <p className="p-6 text-center text-gray-500">No pending approvals.</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {unapprovedHospitals.map(hosp => (
                  <li key={hosp._id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                    <div>
                      <p className="font-bold text-gray-900">{hosp.name}</p>
                      <p className="text-sm text-gray-500">{hosp.city} | Reg: {hosp.registrationNo}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setDialogState({ isOpen: true, action: 'approve', id: hosp._id })} className="p-2 bg-green-50 text-green-600 rounded hover:bg-green-100" title="Approve"><FiCheck /></button>
                      <button onClick={() => setDialogState({ isOpen: true, action: 'reject', id: hosp._id })} className="p-2 bg-red-50 text-red-600 rounded hover:bg-red-100" title="Reject"><FiX /></button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-bold">User Management</h3>
          </div>
          <div className="p-0 max-h-96 overflow-y-auto overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-white">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.slice(0, 10).map(u => ( // show top 10 for layout
                  <tr key={u._id}>
                    <td className="px-4 py-3 text-sm font-medium">{u.name}</td>
                    <td className="px-4 py-3 text-sm capitalize">{u.role}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${u.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <button onClick={() => handleToggleUser(u._id)} className="text-blue-600 hover:text-blue-800 text-xs font-medium">Toggle</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={dialogState.isOpen}
        title={`Confirm ${dialogState.action === 'approve' ? 'Approval' : 'Rejection'}`}
        message={`Are you sure you want to ${dialogState.action} this hospital?`}
        onConfirm={() => handleHospitalApproval(dialogState.id, dialogState.action)}
        onCancel={() => setDialogState({ isOpen: false, action: null, id: null })}
      />
    </div>
  );
};

export default AdminDashboard;
