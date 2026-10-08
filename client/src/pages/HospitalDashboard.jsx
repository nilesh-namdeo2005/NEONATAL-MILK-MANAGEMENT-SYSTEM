import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { toast } from 'react-hot-toast';
import { FiCheck, FiX, FiDroplet, FiAlertCircle, FiBox, FiUsers } from 'react-icons/fi';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const HospitalDashboard = () => {
  const [activeTab, setActiveTab] = useState('donations');
  const [stats, setStats] = useState({ pendingDonations: 0, pendingRequests: 0, pendingDonorScreenings: 0, totalStock: 0 });
  const [loading, setLoading] = useState(true);
  
  // Data states
  const [donations, setDonations] = useState([]);
  const [requests, setRequests] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [donors, setDonors] = useState([]);

  // Dialog states
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    type: null, // verify, reject_donation, collect, accept_req, reject_req, process_req, complete_req
    item: null
  });
  const [actionInput, setActionInput] = useState(''); // for reason or actual quantity

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [donRes, reqRes, invRes, donorRes] = await Promise.all([
        axios.get('/donations/hospital'),
        axios.get('/requests/hospital'),
        axios.get('/inventory/hospital'),
        axios.get('/donors?screeningStatus=pending&limit=100')
      ]);

      const dons = donRes.data.data || [];
      const reqs = reqRes.data.data || [];
      const inv = invRes.data.data || [];
      const pendingDonors = donorRes.data.data || [];

      setDonations(dons);
      setRequests(reqs);
      setInventory(inv);
      setDonors(pendingDonors);

      setStats({
        pendingDonations: dons.filter(d => d.status === 'pending').length,
        pendingRequests: reqs.filter(r => r.status === 'pending').length,
        pendingDonorScreenings: pendingDonors.length,
        totalStock: inv.reduce((acc, curr) => acc + curr.totalAvailableMl, 0)
      });
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const closeDialog = () => {
    setDialogState({ isOpen: false, type: null, item: null });
    setActionInput('');
  };

  const handleAction = async () => {
    const { type, item } = dialogState;
    try {
      if (type === 'verify_donation') {
        await axios.patch(`/donations/${item._id}/verify`);
        toast.success('Donation verified');
      } else if (type === 'reject_donation') {
        if (!actionInput) return toast.error('Reason is required');
        await axios.patch(`/donations/${item._id}/reject`, { rejectionReason: actionInput });
        toast.success('Donation rejected');
      } else if (type === 'collect_donation') {
        if (!actionInput || isNaN(actionInput)) return toast.error('Valid quantity is required');
        await axios.patch(`/donations/${item._id}/collect`, { quantityMl: Number(actionInput) });
        toast.success('Donation collected and inventory updated');
      } else if (type === 'accept_req') {
        await axios.patch(`/requests/${item._id}/accept`);
        toast.success('Request accepted');
      } else if (type === 'reject_req') {
        if (!actionInput) return toast.error('Reason is required');
        await axios.patch(`/requests/${item._id}/reject`, { rejectionReason: actionInput });
        toast.success('Request rejected');
      } else if (type === 'process_req') {
        await axios.patch(`/requests/${item._id}/process`);
        toast.success('Request marked as processing');
      } else if (type === 'complete_req') {
        await axios.patch(`/requests/${item._id}/complete`);
        toast.success('Request completed');
      } else if (type === 'approve_screening' || type === 'reject_screening') {
        const screeningStatus = type === 'approve_screening' ? 'approved' : 'rejected';
        if (screeningStatus === 'rejected' && !actionInput.trim()) {
          return toast.error('Reason is required');
        }
        await axios.patch(`/donors/${item._id}/screening`, {
          screeningStatus,
          screeningNote: actionInput
        });
        toast.success(`Donor screening ${screeningStatus}`);
      }
      
      closeDialog();
      fetchData(); // Refresh all data
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const renderDialogContent = () => {
    const { type } = dialogState;
    if (type === 'reject_donation' || type === 'reject_req' || type === 'reject_screening') {
      return (
        <input 
          type="text" 
          value={actionInput} 
          onChange={(e) => setActionInput(e.target.value)} 
          placeholder="Enter reason for rejection" 
          className="w-full mt-2 p-2 border rounded"
        />
      );
    }
    if (type === 'collect_donation') {
      return (
        <div>
          <p className="text-sm text-gray-600 mb-2">Estimated was: {dialogState.item?.quantityMl} ml</p>
          <input 
            type="number" 
            value={actionInput} 
            onChange={(e) => setActionInput(e.target.value)} 
            placeholder="Enter actual collected quantity (ml)" 
            className="w-full p-2 border rounded"
          />
        </div>
      );
    }
    return null;
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Hospital Operations</h1>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Pending Donations" value={stats.pendingDonations} icon={FiDroplet} color="blue" />
        <StatCard title="Pending Requests" value={stats.pendingRequests} icon={FiAlertCircle} color="yellow" />
        <StatCard title="Donor Screenings" value={stats.pendingDonorScreenings} icon={FiUsers} color="purple" />
        <StatCard title="Total Stock (ml)" value={stats.totalStock} icon={FiBox} color="green" />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="flex border-b border-gray-200">
          {['donations', 'requests', 'inventory', 'donors'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 text-sm font-medium capitalize transition-colors ${
                activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'donations' ? 'Donation Queue' : tab === 'requests' ? 'Request Queue' : tab === 'inventory' ? 'Inventory Stock' : 'Donor Screening'}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* DONATIONS TAB */}
          {activeTab === 'donations' && (
            <div>
              {donations.length === 0 ? <EmptyState message="No donations to process." /> : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Donor</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty (ml)</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {donations.map(d => (
                        <tr key={d._id}>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">{new Date(d.createdAt).toLocaleDateString()}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">{d.donor?.user?.name || 'Unknown'}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">{d.quantityMl}</td>
                          <td className="px-4 py-4 whitespace-nowrap"><StatusBadge status={d.status} /></td>
                          <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {d.status === 'pending' && (
                              <div className="flex justify-end gap-2">
                                {d.donor?.screeningStatus === 'approved' ? (
                                  <button onClick={() => setDialogState({ isOpen: true, type: 'verify_donation', item: d })} className="text-green-600 bg-green-50 px-2 py-1 rounded hover:bg-green-100"><FiCheck className="inline" /> Verify</button>
                                ) : (
                                  <span className="text-xs text-amber-700 self-center">Approve donor screening first</span>
                                )}
                                <button onClick={() => setDialogState({ isOpen: true, type: 'reject_donation', item: d })} className="text-red-600 bg-red-50 px-2 py-1 rounded hover:bg-red-100"><FiX className="inline" /> Reject</button>
                              </div>
                            )}
                            {d.status === 'verified' && (
                              <button onClick={() => setDialogState({ isOpen: true, type: 'collect_donation', item: d })} className="text-blue-600 bg-blue-50 px-3 py-1 rounded hover:bg-blue-100">Collect Milk</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* REQUESTS TAB */}
          {activeTab === 'requests' && (
            <div>
              {requests.length === 0 ? <EmptyState message="No milk requests to process." /> : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Baby</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Urgency</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {requests.map(r => (
                        <tr key={r._id}>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">{new Date(r.createdAt).toLocaleDateString()}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">{r.baby?.babyName || 'Unknown'} <span className="text-xs text-gray-500">({r.baby?.bloodGroup})</span></td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">{r.quantityMl} ml</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">
                            {r.urgency === 'emergency' ? <span className="text-red-600 font-bold">Emergency</span> : 'Normal'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap"><StatusBadge status={r.status} /></td>
                          <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {r.status === 'pending' && (
                              <div className="flex justify-end gap-2">
                                <button onClick={() => setDialogState({ isOpen: true, type: 'accept_req', item: r })} className="text-green-600 bg-green-50 px-2 py-1 rounded hover:bg-green-100">Accept</button>
                                <button onClick={() => setDialogState({ isOpen: true, type: 'reject_req', item: r })} className="text-red-600 bg-red-50 px-2 py-1 rounded hover:bg-red-100">Reject</button>
                              </div>
                            )}
                            {r.status === 'accepted' && (
                              <button onClick={() => setDialogState({ isOpen: true, type: 'process_req', item: r })} className="text-yellow-600 bg-yellow-50 px-3 py-1 rounded hover:bg-yellow-100">Process</button>
                            )}
                            {r.status === 'processing' && (
                              <button onClick={() => setDialogState({ isOpen: true, type: 'complete_req', item: r })} className="text-blue-600 bg-blue-50 px-3 py-1 rounded hover:bg-blue-100">Complete</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* INVENTORY TAB */}
          {activeTab === 'inventory' && (
            <div>
              {inventory.length === 0 ? <EmptyState message="Inventory is empty." /> : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {inventory.map(item => {
                    const availableMl = Math.max(0, item.totalAvailableMl - (item.reservedMl || 0));
                    const isLow = availableMl < 500 && availableMl > 0;
                    const isCritical = availableMl === 0;
                    return (
                      <div key={item._id} className={`p-6 rounded-xl border ${isCritical ? 'bg-red-50 border-red-200' : isLow ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'}`}>
                        <div className="text-xl font-bold mb-2">{item.bloodGroup}</div>
                        <div className="text-3xl font-black mb-1">{availableMl} <span className="text-sm font-medium text-gray-500">ml</span></div>
                        {item.reservedMl > 0 && <div className="text-xs text-gray-500 mb-1">{item.reservedMl} ml reserved for accepted requests</div>}
                        <div className="text-xs font-medium uppercase tracking-wider">
                          {isCritical ? <span className="text-red-600">Out of Stock</span> : isLow ? <span className="text-yellow-600">Low Stock</span> : <span className="text-green-600">Good Stock</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'donors' && (
            <div>
              {donors.length === 0 ? <EmptyState message="No donor screenings are waiting for review." /> : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Donor</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Age</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Blood Group</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Health History</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Review</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {donors.map((donor) => (
                        <tr key={donor._id}>
                          <td className="px-4 py-4 text-sm">{donor.user?.name || 'Unknown'}</td>
                          <td className="px-4 py-4 text-sm">{donor.age || 'N/A'}</td>
                          <td className="px-4 py-4 text-sm">{donor.bloodGroup || 'N/A'}</td>
                          <td className="px-4 py-4 text-sm">{donor.diseaseHistory || 'None reported'}</td>
                          <td className="px-4 py-4 text-right text-sm">
                            <div className="flex justify-end gap-2">
                              <button onClick={() => setDialogState({ isOpen: true, type: 'approve_screening', item: donor })} className="text-green-600 bg-green-50 px-2 py-1 rounded hover:bg-green-100">Approve</button>
                              <button onClick={() => setDialogState({ isOpen: true, type: 'reject_screening', item: donor })} className="text-red-600 bg-red-50 px-2 py-1 rounded hover:bg-red-100">Reject</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={dialogState.isOpen}
        title="Confirm Action"
        message={`Are you sure you want to proceed with this action?`}
        onConfirm={handleAction}
        onCancel={closeDialog}
      >
        {renderDialogContent()}
      </ConfirmDialog>
    </div>
  );
};

export default HospitalDashboard;
