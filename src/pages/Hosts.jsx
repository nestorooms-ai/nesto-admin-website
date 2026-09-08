import React, { useEffect, useState } from 'react';
import api from '../api';
import { Search, ShieldAlert, ShieldCheck, Eye, Percent, Coins, Loader2, FileText, ChevronDown, ChevronUp } from 'lucide-react';

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

const Hosts = () => {
  const [hosts, setHosts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState('');

  // Modals state
  const [kycModalHost, setKycModalHost] = useState(null);
  const [commissionModalHost, setCommissionModalHost] = useState(null);
  const [commissionVal, setCommissionVal] = useState(2);
  const [payoutModalHost, setPayoutModalHost] = useState(null);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [securityAmount, setSecurityAmount] = useState('');

  const [financialModalHost, setFinancialModalHost] = useState(null);
  const [financialsLoading, setFinancialsLoading] = useState(false);
  const [earningsHistory, setEarningsHistory] = useState([]);
  const [withdrawalsHistory, setWithdrawalsHistory] = useState([]);
  const [financialTab, setFinancialTab] = useState('earnings');
  const [expandedEarningId, setExpandedEarningId] = useState(null);

  const fetchHostFinancials = async (hostId) => {
    setFinancialsLoading(true);
    try {
      const [earningsRes, withdrawalsRes] = await Promise.all([
        api.get(`/api/admin/hosts/${hostId}/earnings`),
        api.get(`/api/admin/hosts/${hostId}/withdrawals`)
      ]);
      setEarningsHistory(earningsRes.data.data || []);
      setWithdrawalsHistory(withdrawalsRes.data.data || []);
    } catch (err) {
      alert('Failed to fetch host financial history.');
    } finally {
      setFinancialsLoading(false);
    }
  };

  const fetchHosts = async () => {
    try {
      const response = await api.get('/api/admin/hosts');
      setHosts(response.data.data);
    } catch (err) {
      setError('Failed to fetch hosts list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHosts();
  }, []);

  const handleToggleStatus = async (id, currentDisabled) => {
    try {
      await api.put(`/api/admin/hosts/${id}/status`, { isDisabled: !currentDisabled });
      fetchHosts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update host status.');
    }
  };

  const handleVerifyKyc = async (id, isKycVerified) => {
    try {
      await api.put(`/api/admin/hosts/${id}/kyc`, { isKycVerified });
      setKycModalHost(null);
      fetchHosts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to verify KYC.');
    }
  };

  const handleSaveCommission = async () => {
    try {
      await api.put(`/api/admin/hosts/${commissionModalHost._id}/commission`, { commission: Number(commissionVal) });
      setCommissionModalHost(null);
      fetchHosts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update commission.');
    }
  };

  const handleProcessPayout = async () => {
    try {
      await api.post(`/api/admin/hosts/payout`, {
        hostId: payoutModalHost._id,
        payoutAmount: Number(payoutAmount),
        newSecurityAmount: Number(securityAmount)
      });
      setPayoutModalHost(null);
      setPayoutAmount('');
      setSecurityAmount('');
      fetchHosts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to process payout.');
    }
  };

  const filteredHosts = hosts.filter((h) => {
    const term = search.toLowerCase();
    return (
      h.firstName?.toLowerCase().includes(term) ||
      h.lastName?.toLowerCase().includes(term) ||
      h.email?.toLowerCase().includes(term)
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
          <h1 className="text-2xl font-bold text-white mb-2">Hosts Management</h1>
          <p className="text-sm text-gray-400">Manage hosts, adjust commissions, review KYC, and trigger payouts.</p>
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
                <th className="px-6 py-4">Commission</th>
                <th className="px-6 py-4">Available Earnings</th>
                <th className="px-6 py-4">KYC Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#242f47]">
              {filteredHosts.length > 0 ? (
                filteredHosts.map((host) => {
                  const availableToWithdraw = host.earning?.earning || 0;
                  return (
                    <tr key={host._id} className="hover:bg-[#151c2c]/40 transition duration-150">
                      <td className="px-6 py-4">
                        <img
                          src={getImageUrl(host.profilePic) || `https://avatar.iran.liara.run/username?username=${host.firstName}+${host.lastName}`}
                          alt="avatar"
                          className="w-10 h-10 rounded-full border border-[#242f47] object-cover"
                          onError={(e) => { e.target.src = "https://randomuser.me/api/portraits/women/67.jpg"; }}
                        />
                      </td>
                      <td className="px-6 py-4 text-white font-medium">
                        {host.firstName} {host.lastName}
                      </td>
                      <td className="px-6 py-4">{host.email}</td>
                      <td className="px-6 py-4 text-white">{host.commission || 2}%</td>
                      <td className="px-6 py-4 text-emerald-400 font-semibold">₹{availableToWithdraw?.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full w-fit ${host.isKycVerified ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'}`}>
                          {host.isKycVerified ? 'Verified' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleToggleStatus(host._id, host.isDisabled)}
                            className={`flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition duration-200 ${
                              host.isDisabled
                                ? 'bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20'
                                : 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                            }`}
                          >
                            {host.isDisabled ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                            {host.isDisabled ? 'Enable' : 'Disable'}
                          </button>
                          <button
                            onClick={() => { setKycModalHost(host); }}
                            className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border bg-indigo-500/10 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20 transition duration-200"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            KYC
                          </button>
                          <button
                            onClick={() => { setCommissionModalHost(host); setCommissionVal(host.commission || 2); }}
                            className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border bg-purple-500/10 border-purple-500/30 text-purple-400 hover:bg-purple-500/20 transition duration-200"
                          >
                            <Percent className="w-3.5 h-3.5" />
                            Commission
                          </button>
                          <button
                            onClick={() => { setPayoutModalHost(host); }}
                            className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition duration-200"
                          >
                            <Coins className="w-3.5 h-3.5" />
                            Payout
                          </button>
                          <button
                            onClick={() => { setFinancialModalHost(host); fetchHostFinancials(host._id); setFinancialTab('earnings'); setExpandedEarningId(null); }}
                            className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20 transition duration-200"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            History
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    No hosts matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* KYC Modal */}
      {kycModalHost && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass-card rounded-2xl border border-[#242f47] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6">
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-bold text-white">KYC Details: {kycModalHost.firstName} {kycModalHost.lastName}</h2>
              <button onClick={() => setKycModalHost(null)} className="text-gray-400 hover:text-white font-bold">✕</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-300">Aadhar Front</p>
                {kycModalHost.aadharFront ? (
                  <img src={getImageUrl(kycModalHost.aadharFront)} alt="Aadhar Front" className="w-full h-40 object-cover rounded-lg border border-[#242f47]" />
                ) : (
                  <div className="w-full h-40 bg-[#151c2c] rounded-lg border border-[#242f47] flex items-center justify-center text-gray-500 text-sm">Not Uploaded</div>
                )}
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-300">Aadhar Back</p>
                {kycModalHost.aadharBack ? (
                  <img src={getImageUrl(kycModalHost.aadharBack)} alt="Aadhar Back" className="w-full h-40 object-cover rounded-lg border border-[#242f47]" />
                ) : (
                  <div className="w-full h-40 bg-[#151c2c] rounded-lg border border-[#242f47] flex items-center justify-center text-gray-500 text-sm">Not Uploaded</div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-300">Selfie</p>
              {kycModalHost.selfie ? (
                <img src={getImageUrl(kycModalHost.selfie)} alt="Selfie" className="w-40 h-40 object-cover rounded-full mx-auto border-2 border-indigo-500/40" />
              ) : (
                <div className="w-40 h-40 bg-[#151c2c] rounded-full mx-auto border border-[#242f47] flex items-center justify-center text-gray-500 text-sm">Not Uploaded</div>
              )}
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-[#242f47]">
              <button
                onClick={() => handleVerifyKyc(kycModalHost._id, false)}
                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold rounded-lg text-sm transition duration-200"
              >
                Reject KYC
              </button>
              <button
                onClick={() => handleVerifyKyc(kycModalHost._id, true)}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg text-sm transition duration-200"
              >
                Approve KYC
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Commission Modal */}
      {commissionModalHost && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-card rounded-xl border border-[#242f47] w-full max-w-md p-6 space-y-6">
            <div className="flex justify-between items-start">
              <h2 className="text-lg font-bold text-white">Adjust Commission: {commissionModalHost.firstName}</h2>
              <button onClick={() => setCommissionModalHost(null)} className="text-gray-400 hover:text-white font-bold">✕</button>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-300">Commission Rate (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={commissionVal}
                onChange={(e) => setCommissionVal(e.target.value)}
                className="w-full bg-[#151c2c] border border-[#242f47] rounded-lg py-2.5 px-4 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-[#242f47]">
              <button onClick={() => setCommissionModalHost(null)} className="px-4 py-2 bg-gray-500/10 text-gray-400 rounded-lg text-sm">Cancel</button>
              <button onClick={handleSaveCommission} className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-lg text-sm">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Payout Modal */}
      {payoutModalHost && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-card rounded-xl border border-[#242f47] w-full max-w-md p-6 space-y-6">
            <div className="flex justify-between items-start">
              <h2 className="text-lg font-bold text-white">Trigger Host Payout: {payoutModalHost.firstName}</h2>
              <button onClick={() => setPayoutModalHost(null)} className="text-gray-400 hover:text-white font-bold">✕</button>
            </div>
            <div className="p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-sm text-indigo-300">
              Host Balance: <strong>₹{(payoutModalHost.earning?.earning || 0)?.toLocaleString()}</strong>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-300">Payout Amount (₹)</label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 5000"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  className="w-full bg-[#151c2c] border border-[#242f47] rounded-lg py-2.5 px-4 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-300">New Security Deposit Amount (₹)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 1000"
                  value={securityAmount}
                  onChange={(e) => setSecurityAmount(e.target.value)}
                  className="w-full bg-[#151c2c] border border-[#242f47] rounded-lg py-2.5 px-4 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-[#242f47]">
              <button onClick={() => setPayoutModalHost(null)} className="px-4 py-2 bg-gray-500/10 text-gray-400 rounded-lg text-sm">Cancel</button>
              <button onClick={handleProcessPayout} className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg text-sm">Process Payout</button>
            </div>
          </div>
        </div>
      )}

      {/* Financial History Modal */}
      {financialModalHost && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass-card rounded-2xl border border-[#242f47] w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-white">Financial History</h2>
                <p className="text-sm text-gray-400 mt-1">{financialModalHost.firstName} {financialModalHost.lastName} ({financialModalHost.email})</p>
              </div>
              <button onClick={() => setFinancialModalHost(null)} className="text-gray-400 hover:text-white font-bold text-lg">✕</button>
            </div>

            {/* Tabs */}
            <div className="flex bg-[#151c2c] border border-[#242f47] p-1 rounded-xl max-w-md">
              <button
                onClick={() => setFinancialTab('earnings')}
                className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition duration-200 ${
                  financialTab === 'earnings'
                    ? 'bg-indigo-500 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Earning Credits
              </button>
              <button
                onClick={() => setFinancialTab('withdrawals')}
                className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition duration-200 ${
                  financialTab === 'withdrawals'
                    ? 'bg-indigo-500 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Withdrawals / Payouts
              </button>
            </div>

            {financialsLoading ? (
              <div className="py-20 flex flex-col justify-center items-center gap-3">
                <Loader2 className="animate-spin text-indigo-500 w-8 h-8" />
                <span className="text-gray-400 text-xs font-semibold">Loading history...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {financialTab === 'earnings' ? (
                  earningsHistory.length === 0 ? (
                    <div className="bg-[#151c2c]/40 rounded-xl p-8 border border-[#242f47] text-center text-gray-500 text-sm">
                      No earning records found for this host.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {earningsHistory.map((item) => {
                        const isExpanded = expandedEarningId === item._id;
                        return (
                          <div
                            key={item._id}
                            className="bg-[#151c2c]/40 border border-[#242f47] rounded-xl p-4 transition-all duration-200 flex flex-col gap-3"
                          >
                            {/* Summary row */}
                            <div
                              onClick={() => setExpandedEarningId(isExpanded ? null : item._id)}
                              className="flex items-center justify-between gap-3 cursor-pointer select-none"
                            >
                              <div className="min-w-0 flex-1">
                                <h4 className="font-semibold text-white text-sm sm:text-base leading-snug">
                                  {item.propertyName}
                                </h4>
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500 mt-1">
                                  <span>
                                    {item.createdAt ? new Date(item.createdAt).toLocaleString() : 'N/A'}
                                  </span>
                                  <span>•</span>
                                  {item.hasGstNumber ? (
                                    <span className="bg-green-500/10 text-green-400 text-[10px] px-2 py-0.5 rounded-full border border-green-500/20">
                                      GST Registered
                                    </span>
                                  ) : (
                                    <span className="bg-gray-500/10 text-gray-400 text-[10px] px-2 py-0.5 rounded-full border border-gray-500/20">
                                      GST Unregistered
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-3 shrink-0">
                                <div className="text-right">
                                  <p className="text-sm sm:text-base font-bold text-emerald-400">
                                    ₹{item.earning?.toLocaleString()}
                                  </p>
                                  <span className="text-[10px] text-gray-500 block uppercase font-bold">
                                    Net Credited
                                  </span>
                                </div>
                                <div className="text-gray-400">
                                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </div>
                              </div>
                            </div>

                            {/* Detailed breakdown */}
                            {isExpanded && (
                              <div className="pt-4 border-t border-[#242f47] grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-gray-300 animate-slideDown">
                                
                                {/* Nesto Overview and Guest Payment Details */}
                                <div className="col-span-1 md:col-span-2 bg-[#151c2c] border border-[#242f47] rounded-xl p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                                  <div>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Total Guest Paid</p>
                                    <p className="text-base font-extrabold text-white mt-1">₹{item.guestPaidAmount?.toLocaleString()}</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Platform Fee</p>
                                    <p className="text-base font-extrabold text-indigo-400 mt-1">₹{item.platformFee?.toLocaleString()}</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Total GST Paid</p>
                                    <p className="text-base font-extrabold text-amber-400 mt-1">₹{item.totalGstPaidByGuest?.toLocaleString()}</p>
                                    <span className="text-[9px] text-gray-500 block leading-none">
                                      ({item.hasGstNumber ? `Host: ₹${item.gstWithHost}` : `Nesto: ₹${item.gstWithNesto}`})
                                    </span>
                                  </div>
                                  <div className="border-l border-[#242f47] pl-4">
                                    <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Nesto Net Saving</p>
                                    <p className="text-base font-black text-emerald-400 mt-1">
                                      ₹{(item.platformFee + item.commissionAmount + (item.serviceCommissionAmount || 0))?.toLocaleString()}
                                    </p>
                                    <span className="text-[9px] text-gray-500 block leading-none">
                                      (Fee + Commissions)
                                    </span>
                                  </div>
                                </div>

                                <div className="space-y-2.5">
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Gross Price:</span>
                                    <span className="font-semibold text-white">₹{item.roomAmount?.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between text-indigo-400">
                                    <span>Nesto Commission ({item.currentCommission || 2}%):</span>
                                    <span className="font-semibold">-₹{item.commissionAmount?.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between font-bold text-white pt-2 border-t border-dashed border-[#242f47]">
                                    <span>Amount After Commission:</span>
                                    <span>₹{item.amountAfterCommissionDeduction?.toLocaleString()}</span>
                                  </div>
                                </div>

                                <div className="space-y-2.5 border-t md:border-t-0 md:border-l border-[#242f47] pt-3 md:pt-0 md:pl-4 flex flex-col justify-between">
                                  <div>
                                    {item.hasGstNumber ? (
                                      <>
                                        <div className="flex justify-between text-green-400 font-medium">
                                          <span>Host GST Credit (Received):</span>
                                          <span className="font-bold">+₹{item.gstWithHost?.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-amber-400 font-medium mt-1">
                                          <span>TCS Deduction (0.5%):</span>
                                          <span className="font-bold">-₹{item.tcsDeduction?.toLocaleString()}</span>
                                        </div>
                                      </>
                                    ) : (
                                      <>
                                        <div className="flex justify-between text-gray-500">
                                          <span>Host GST Credit:</span>
                                          <span>₹0 (Unregistered)</span>
                                        </div>
                                        <div className="flex justify-between text-gray-500 font-medium mt-1">
                                          <span>TCS Deduction:</span>
                                          <span>₹0</span>
                                        </div>
                                      </>
                                    )}
                                  </div>

                                  <div className="bg-[#151c2c] p-2.5 rounded-xl border border-[#242f47] mt-2 text-[11px] text-gray-400 leading-relaxed space-y-0.5">
                                    {item.hasGstNumber ? (
                                      <>
                                        <p className="font-semibold text-gray-300 uppercase">
                                          GSTIN: {item.hostGstNumber}
                                        </p>
                                        <p>• GST amount is credited to host for payment to authorities.</p>
                                        <p>• 0.5% TCS is deducted at source under Sec 52 of GST Act.</p>
                                      </>
                                    ) : (
                                      <>
                                        <p className="font-semibold text-gray-300">GST Unregistered</p>
                                        <p>• GST is directly deposited by Nesto Rooms under Section 9(5).</p>
                                        <p>• No GST is credited and no TCS is deducted.</p>
                                      </>
                                    )}
                                  </div>
                                </div>

                                {/* Services and Rentals */}
                                {((item.servicesAmount || 0) > 0 || (item.rentalsAmount || 0) > 0) && (
                                  <div className="col-span-1 md:col-span-2 pt-2 border-t border-dashed border-[#242f47] space-y-2">
                                    <div className="flex justify-between text-gray-300">
                                      <span>Services & Rentals Gross Amount:</span>
                                      <span className="font-semibold text-white">₹{((item.servicesAmount || 0) + (item.rentalsAmount || 0))?.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-indigo-400">
                                      <span>Service Commission:</span>
                                      <span className="font-semibold">-₹{item.serviceCommissionAmount?.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-green-400 font-medium">
                                      <span>Net Service Earnings:</span>
                                      <span className="font-bold">₹{item.netServiceEarnings?.toLocaleString()}</span>
                                    </div>
                                  </div>
                                )}

                                {/* Total Net Credit */}
                                <div className="col-span-1 md:col-span-2 pt-3 border-t border-[#242f47] flex justify-between items-center bg-green-500/5 px-3 py-2 rounded-xl">
                                  <span className="font-bold text-white">Total Net Credited to Host:</span>
                                  <span className="font-extrabold text-green-400 text-sm sm:text-base">
                                    ₹{item.earning?.toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )
                ) : (
                  withdrawalsHistory.length === 0 ? (
                    <div className="bg-[#151c2c]/40 rounded-xl p-8 border border-[#242f47] text-center text-gray-500 text-sm">
                      No withdrawal records found for this host.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {withdrawalsHistory.map((item) => (
                        <div
                          key={item._id}
                          className="bg-[#151c2c]/40 border border-[#242f47] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="space-y-1">
                            <p className="text-base font-bold text-white">₹{item.withdrawAmount?.toLocaleString()}</p>
                            <span className="text-xs text-gray-500">
                              {item.withdrawDate ? new Date(item.withdrawDate).toLocaleString() : 'N/A'}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-full font-semibold">
                              Retained Security: ₹{item.totalSecurityAmount?.toLocaleString() || 0}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-[#242f47]">
              <button onClick={() => setFinancialModalHost(null)} className="px-5 py-2.5 bg-gray-500/10 hover:bg-gray-500/20 text-gray-400 font-semibold rounded-lg text-sm transition duration-200">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Hosts;
