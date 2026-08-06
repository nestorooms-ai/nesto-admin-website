import React, { useEffect, useState } from 'react';
import api from '../api';
import { Search, Ban, Loader2 } from 'lucide-react';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchBookings = async () => {
    try {
      const response = await api.get('/api/admin/bookings');
      setBookings(response.data.data);
    } catch (err) {
      setError('Failed to fetch bookings list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking? This will credit the refunded amount to the guest\'s wallet according to policy.')) {
      return;
    }
    try {
      await api.post('/api/admin/bookings/cancel', { bookingId: id });
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking.');
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const term = search.toLowerCase();
    const matchesSearch =
      b._id?.toLowerCase().includes(term) ||
      b.hostId?.toLowerCase().includes(term) ||
      b.userId?.toLowerCase().includes(term);

    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  const getStatusStyle = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-500/10 text-green-400 border border-green-500/20';
      case 'UPCOMING':
        return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20';
      case 'CANCELLED':
        return 'bg-red-500/10 text-red-400 border border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border border-gray-500/20';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Bookings Control</h1>
          <p className="text-sm text-gray-400">Monitor all transactions, room check-ins/outs, and handle cancellations.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#151c2c] border border-[#242f47] rounded-lg py-2 px-4 text-white text-sm focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="UPCOMING">Upcoming</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search by ID or Host ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#151c2c] border border-[#242f47] rounded-lg py-2 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-indigo-500 transition duration-200"
            />
          </div>
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
                <th className="px-6 py-4">Booking ID</th>
                <th className="px-6 py-4">Guest ID / Host ID</th>
                <th className="px-6 py-4">Check-In / Out</th>
                <th className="px-6 py-4">Guests</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#242f47]">
              {filteredBookings.length > 0 ? (
                filteredBookings.map((b) => (
                  <tr key={b._id} className="hover:bg-[#151c2c]/40 transition duration-150">
                    <td className="px-6 py-4 text-white font-mono text-xs">{b._id}</td>
                    <td className="px-6 py-4 space-y-1">
                      <p className="text-xs text-gray-500">Guest: <span className="font-mono">{b.userId}</span></p>
                      <p className="text-xs text-gray-500">Host: <span className="font-mono">{b.hostId}</span></p>
                    </td>
                    <td className="px-6 py-4 space-y-1">
                      <p className="text-xs text-white">In: {new Date(b.checkIn).toLocaleDateString()}</p>
                      <p className="text-xs text-gray-400">Out: {new Date(b.checkOut).toLocaleDateString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      {b.adult || 0}A, {b.child || 0}C
                    </td>
                    <td className="px-6 py-4 font-semibold text-white">₹{b.totalAmount || b.amount}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full w-fit ${getStatusStyle(b.status)}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {b.status !== 'CANCELLED' && b.status !== 'COMPLETED' ? (
                        <button
                          onClick={() => handleCancelBooking(b._id)}
                          className="flex items-center justify-center gap-1 mx-auto px-2.5 py-1.5 rounded-lg text-xs font-medium border bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 transition duration-200"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          Cancel
                        </button>
                      ) : (
                        <span className="text-xs text-gray-500">-</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    No bookings found.
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

export default Bookings;
