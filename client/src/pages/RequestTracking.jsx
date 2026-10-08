import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { toast } from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import { FiMaximize2, FiX, FiAlertTriangle } from 'react-icons/fi';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import Pagination from '../components/Pagination';
import EmptyState from '../components/EmptyState';

const RequestTracking = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedToken, setSelectedToken] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, [page]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/requests/my?page=${page}&limit=10`);
      setRequests(res.data.data || []);
      setTotalPages(res.data.pagination?.pages || res.data.pagination?.totalPages || 1);
    } catch (err) {
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Track Milk Requests</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center"><LoadingSpinner size="lg" /></div>
        ) : requests.length === 0 ? (
          <EmptyState message="You haven't made any milk requests yet." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Baby</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hospital</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty (ml)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Urgency</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Token</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requests.map((r) => (
                    <tr key={r._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {r.baby?.babyName || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {r.hospital?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {r.quantityMl}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {r.urgency === 'emergency' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <FiAlertTriangle /> Emergency
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Normal
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                        {r.tokenId ? (
                          <button
                            onClick={() => setSelectedToken(r.tokenId)}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition"
                            title="View Collection QR"
                          >
                            {r.tokenId.substring(0, 8)}... <FiMaximize2 />
                          </button>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            )}
          </>
        )}
      </div>

      {/* QR Code Modal for Collection */}
      {selectedToken && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 relative">
            <button
              onClick={() => setSelectedToken(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
            >
              <FiX className="text-2xl" />
            </button>
            <h3 className="text-lg font-bold text-center text-gray-900 mb-6">Collection Token</h3>
            <div className="flex justify-center bg-white p-4 border-2 border-green-100 rounded-lg mb-4">
              <QRCodeSVG value={selectedToken} size={200} level="H" fgColor="#166534" />
            </div>
            <p className="text-center text-sm font-mono text-gray-600 bg-gray-50 py-2 rounded break-all px-2">
              {selectedToken}
            </p>
            <p className="text-center text-sm font-medium text-green-700 mt-4">
              Show this QR code at the hospital to collect the milk.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestTracking;
