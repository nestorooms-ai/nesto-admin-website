import React, { useEffect, useState } from 'react';
import api from '../api';
import { Check, X, Search, Loader2 } from 'lucide-react';

const Withdrawals = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const fetchRequests = async () => {
    try {
      const response = await api.get('/api/admin/withdrawals');
      setRequests(response.data.data);
    } catch (err) {
      setError('Failed to fetch withdrawal requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    if (!window.confirm(`Are you sure you want to mark this request as ${status}?`)) {
      return;
    }
    try {
      await api.put(`/api/admin/withdrawals/${id}/status`, { status });
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update request status.');
    }
  };

  const filteredRequests = requests.filter((r) => {
    const term = search.toLowerCase();
    const guestName = `${r.userId?.first_name || ''} ${r.userId?.last_name || ''}`.toLowerCase();
    return (
      guestName.includes(term) ||
      r.userId?.email?.toLowerCase().includes(term) ||
      r.holderName?.toLowerCase().includes(term)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SUCCESS':
        return 'bg-green-500/10 text-green-400 border border-green-500/20';
      case 'PENDING':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'REJECTED':
        return 'bg-red-500/10 text-red-400 border border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border border-gray-500/20';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">User Withdrawals Hub</h1>
          <p className="text-sm text-gray-400">Process user wallet withdrawal requests. Rejecting automatically refunds the amount to the user's wallet.</p>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by user name or holder..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#151c2c] border border-[#242f47] rounded-lg py-2 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-indigo-500 transition duration-200"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="glass-card rounded-xl border border-[#242f47] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-[#151c2c] text-white text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Withdraw Amount</th>
                <th className="px-6 py-4">Payment Method</th>
                <th className="px-6 py-4">Beneficiary Details</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#242f47]">
              {filteredRequests.length > 0 ? (
                filteredRequests.map((req) => (
                  <tr key={req._id} className="hover:bg-[#151c2c]/40 transition duration-150">
                    <td className="px-6 py-4 space-y-1">
                      <p className="text-white font-medium">{req.userId?.first_name} {req.userId?.last_name || ''}</p>
                      <p className="text-xs text-gray-500">{req.userId?.email}</p>
                    </td>
                    <td className="px-6 py-4 font-semibold text-white">₹{req.amount}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-[#242f47] text-gray-300">
                        {req.paymentMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4 space-y-1">
                      <p className="text-xs text-white">Holder: <strong>{req.holderName}</strong></p>
                      {req.paymentMethod === 'UPI' ? (
                        <p className="text-xs text-gray-400">UPI ID: <span className="font-mono">{req.upiId}</span></p>
                      ) : (
                        <div className="text-xs text-gray-400 space-y-0.5">
                          <p>A/C: <span className="font-mono">{req.bankDetails?.accountNumber}</span></p>
                          <p>IFSC: <span className="font-mono">{req.bankDetails?.ifscCode}</span></p>
                          <p>Bank: {req.bankDetails?.bankName}</p>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full w-fit ${getStatusBadge(req.status)}`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {req.status === 'PENDING' ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleUpdateStatus(req._id, 'SUCCESS')}
                            className="p-1.5 rounded-lg border bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20 transition duration-200"
                            title="Approve Payout"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(req._id, 'REJECTED')}
                            className="p-1.5 rounded-lg border bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 transition duration-200"
                            title="Reject & Refund User"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500">Processed</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No withdrawal requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Withdrawals;
