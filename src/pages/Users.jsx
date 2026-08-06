import React, { useEffect, useState } from 'react';
import api from '../api';
import { Search, ShieldAlert, ShieldCheck, Loader2 } from 'lucide-react';

const getImageUrl = (imgUrl) => {
  const CDN_BASE_URL = import.meta.env.VITE_CDN_BASE_URL || 'https://d2g6n77yp3nhfw.cloudfront.net';
  if (!imgUrl) return '';
  if (imgUrl.startsWith('http://') || imgUrl.startsWith('https://')) {
    if (imgUrl.includes('.amazonaws.com/')) {
      try {
        const urlObj = new URL(imgUrl);
        const pathname = urlObj.pathname.startsWith('/') ? urlObj.pathname.substring(1) : urlObj.pathname;
        return `${CDN_BASE_URL}/${pathname}`;
      } catch (e) {
        console.error('Failed to parse S3 URL:', e);
      }
    }
    return imgUrl;
  }
  return `${CDN_BASE_URL}/${imgUrl}`;
};

const Users = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      const response = await api.get('/api/admin/users');
      setUsers(response.data.data);
    } catch (err) {
      setError('Failed to fetch users list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (id, currentDisabled, currentHolded, type) => {
    try {
      const payload = {};
      if (type === 'disable') payload.isDisabled = !currentDisabled;
      if (type === 'hold') payload.user_holded = !currentHolded;

      await api.put(`/api/admin/users/${id}/status`, payload);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user status.');
    }
  };

  const filteredUsers = users.filter((u) => {
    const term = search.toLowerCase();
    return (
      u.first_name?.toLowerCase().includes(term) ||
      u.last_name?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Users Management</h1>
          <p className="text-sm text-gray-400">View and moderate guests registered on the platform.</p>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by name or email..."
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
                <th className="px-6 py-4">Avatar</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Wallet Balance</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#242f47]">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-[#151c2c]/40 transition duration-150">
                    <td className="px-6 py-4">
                      <img
                        src={getImageUrl(user.profile_image) || `https://avatar.iran.liara.run/username?username=${user.first_name}+${user.last_name || ''}`}
                        alt="avatar"
                        className="w-10 h-10 rounded-full border border-[#242f47] object-cover"
                        onError={(e) => { e.target.src = "https://randomuser.me/api/portraits/women/67.jpg"; }}
                      />
                    </td>
                    <td className="px-6 py-4 text-white font-medium">
                      {user.first_name} {user.last_name || ''}
                    </td>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4 text-indigo-400 font-semibold">₹{user.walletBalance || 0}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full w-fit ${user.isDisabled ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                          {user.isDisabled ? 'Disabled' : 'Active'}
                        </span>
                        {user.user_holded && (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full w-fit bg-amber-500/10 text-amber-400">
                            On Hold
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleToggleStatus(user._id, user.isDisabled, user.user_holded, 'disable')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition duration-200 ${
                            user.isDisabled
                              ? 'bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20'
                              : 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                          }`}
                        >
                          {user.isDisabled ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                          {user.isDisabled ? 'Enable' : 'Disable'}
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user._id, user.isDisabled, user.user_holded, 'hold')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition duration-200 ${
                            user.user_holded
                              ? 'bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20'
                              : 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                          }`}
                        >
                          {user.user_holded ? 'Release Hold' : 'Put on Hold'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No users matching criteria.
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

export default Users;
