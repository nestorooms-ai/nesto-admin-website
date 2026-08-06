import React, { useEffect, useState } from 'react';
import api from '../api';
import { Search, Loader2 } from 'lucide-react';

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

const Properties = () => {
  const [properties, setProperties] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProperties = async () => {
    try {
      const response = await api.get('/api/admin/properties');
      setProperties(response.data.data);
    } catch (err) {
      setError('Failed to fetch properties list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleToggleApproval = async (id, currentApproved) => {
    try {
      await api.put(`/api/admin/properties/${id}/status`, { isApproved: !currentApproved });
      fetchProperties();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update property approval status.');
    }
  };

  const handleToggleActive = async (id, currentActive) => {
    try {
      await api.put(`/api/admin/properties/${id}/status`, { isActive: !currentActive });
      fetchProperties();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update property active status.');
    }
  };

  const filteredProperties = properties.filter((p) => {
    const term = search.toLowerCase();
    return (
      p.title?.toLowerCase().includes(term) ||
      p.location?.city?.toLowerCase().includes(term) ||
      p.propertyType?.toLowerCase().includes(term)
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
          <h1 className="text-2xl font-bold text-white mb-2">Properties Listings</h1>
          <p className="text-sm text-gray-400">Moderate and approve property listings, manage active status.</p>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by title or city..."
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.length > 0 ? (
          filteredProperties.map((prop) => {
            const firstImg = prop.images && prop.images[0]
              ? getImageUrl(prop.images[0])
              : "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=400&q=80";

            return (
              <div key={prop._id} className="glass-card rounded-xl border border-[#242f47] overflow-hidden flex flex-col justify-between">
                <div>
                  <img
                    src={firstImg}
                    alt={prop.title}
                    className="w-full h-48 object-cover border-b border-[#242f47]"
                    onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=400&q=80"; }}
                  />
                  <div className="p-6 space-y-4">
                    <div>
                      <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">{prop.propertyType}</span>
                      <h3 className="text-lg font-bold text-white mt-1 line-clamp-1">{prop.title}</h3>
                      <p className="text-xs text-gray-400 mt-1">{prop.location?.address}, {prop.location?.city}</p>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-300">
                      <span>Rate: <strong className="text-white">₹{prop.pricePerNight}</strong> / night</span>
                      <span>Capacity: <strong className="text-white">{prop.guestCapacity} guests</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${prop.isApproved ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'}`}>
                        {prop.isApproved ? 'Approved' : 'Pending Approval'}
                      </span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${prop.isActive ? 'bg-indigo-500/10 text-indigo-400' : 'bg-red-500/10 text-red-400'}`}>
                        {prop.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-6 border-t border-[#242f47] bg-[#151c2c]/40 flex items-center justify-between gap-3">
                  <button
                    onClick={() => handleToggleApproval(prop._id, prop.isApproved)}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold border transition duration-200 ${
                      prop.isApproved
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                        : 'bg-green-505 border-green-600 text-white hover:bg-green-600 bg-green-500'
                    }`}
                  >
                    {prop.isApproved ? 'Revoke Approval' : 'Approve'}
                  </button>
                  <button
                    onClick={() => handleToggleActive(prop._id, prop.isActive)}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold border transition duration-200 ${
                      prop.isActive
                        ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                        : 'bg-indigo-505 border-indigo-600 text-white hover:bg-indigo-600 bg-indigo-500'
                    }`}
                  >
                    {prop.isActive ? 'Disable Listing' : 'Enable Listing'}
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-12 text-center text-gray-500">
            No properties found.
          </div>
        )}
      </div>
    </div>
  );
};

export default Properties;
