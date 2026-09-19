import React, { useEffect, useState } from 'react';
import api from '../api';
import {
  Compass,
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Sparkles,
  Loader2,
  X,
  PlusCircle,
  Star,
  Car,
  UtensilsCrossed,
  Image as ImageIcon,
  ShieldCheck,
  Navigation,
} from 'lucide-react';

const IDEAL_FOR_OPTIONS = [
  'couples',
  'solo',
  'friends',
  'family',
  'budget',
  'luxury',
  'adventure',
  'workation',
];

const CATEGORY_OPTIONS = [
  'sightseeing',
  'food',
  'adventure',
  'culture',
  'relaxation',
  'nightlife',
  'shopping',
  'hidden_gem',
  'other',
];

const FOOD_TAG_OPTIONS = [
  'Street Food',
  'Must-Try Cafe',
  'Authentic Dhaba',
  'Fine Dining',
  'Local Delicacy',
  'Bakery & Desserts',
  'Rooftop Lounge',
  'Iconic Sweet Shop',
  'Chai & Breakfast Spot',
];

const SERVICE_TYPE_OPTIONS = [
  { value: 'cab', label: '🚖 Cab / Taxi Driver' },
  { value: 'scooty', label: '🛵 Scooty & Bike Rental' },
  { value: 'rental', label: '🚗 Car Rental' },
  { value: 'guide', label: '🧭 Certified Tour Guide' },
  { value: 'emergency', label: '🚨 24/7 Helpline' },
  { value: 'doctor', label: '🩺 Medical / Doctor on Call' },
  { value: 'other', label: 'ℹ️ Other Travel Support' },
];

const INITIAL_FORM_STATE = {
  title: '',
  slug: '',
  city: '',
  state: '',
  country: 'India',
  heroImage: '',
  gallery: [],
  durationDays: 3,
  idealFor: ['couples', 'friends'],
  bestTimeToVisit: 'October to May',
  estimatedBudget: {
    budgetPerPerson: 5000,
    luxuryPerPerson: 12000,
    stayCostPerNight: 1800,
    foodCostPerDay: 600,
    transportCostPerDay: 500,
    currency: 'INR',
  },
  overview: '',
  highlights: ['Explore local cafes', 'Scenic sunset points', 'Stay at verified Nesto homestays'],
  localServices: [
    {
      serviceType: 'cab',
      title: 'Verified Sightseeing Cab & Taxi Partner',
      contactPerson: 'Local Verified Driver',
      phone: '+91 98765 43210',
      priceInfo: '₹2,200/day Sedan',
      notes: 'Punctual, English/Hindi speaking, AC cab available for airport & local transfers.',
      rating: 4.9,
    },
    {
      serviceType: 'scooty',
      title: 'Self-Drive Scooty & Bike Rentals',
      contactPerson: 'City Bike Rentals',
      phone: '+91 98765 43211',
      priceInfo: '₹500/day for Activa',
      notes: 'Helmets provided, minimal security deposit, well-maintained vehicles.',
      rating: 4.8,
    },
  ],
  days: [
    {
      dayNumber: 1,
      title: 'Arrival & Local Sightseeing',
      summary: 'Settle in and explore the historic town center and famous cafes.',
      activities: [
        {
          timeSlot: '09:00 AM - 12:00 PM',
          title: 'Morning Exploration & Heritage Walk',
          category: 'sightseeing',
          description: 'Visit prime cultural spots and take scenic photography.',
          approxCostPerPerson: 200,
          timeRequiredMinutes: 120,
          insiderTip: 'Visit early in the morning to beat the crowd.',
          location: { name: 'Main City Center' },
        },
      ],
      recommendedStays: [],
    },
  ],
  faqs: [
    {
      question: 'What is the best way to travel around?',
      answer: 'Local cabs, auto-rickshaws, and self-drive scooties are readily available.',
    },
  ],
  metaTitle: '',
  metaDescription: '',
  keywords: [],
  isFeatured: false,
  isPublished: true,
};

const Itineraries = () => {
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [activeModal, setActiveModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic'); // 'basic' | 'days' | 'seo_faqs'

  const fetchItineraries = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/itineraries/admin/all', {
        params: {
          search: search || undefined,
          city: cityFilter || undefined,
          limit: 50,
        },
      });
      setItineraries(res.data?.data?.itineraries || []);
    } catch (err) {
      console.error('Failed to fetch itineraries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItineraries();
  }, [cityFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchItineraries();
  };

  const handleTogglePublish = async (id) => {
    try {
      await api.patch(`/api/itineraries/admin/${id}/toggle-publish`);
      fetchItineraries();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle publish status');
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await api.delete(`/api/itineraries/admin/${id}`);
      fetchItineraries();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete itinerary');
    }
  };

  const openCreateModal = () => {
    setFormData(INITIAL_FORM_STATE);
    setIsEditing(false);
    setEditingId(null);
    setActiveTab('basic');
    setActiveModal(true);
  };

  const openEditModal = async (itinerary) => {
    try {
      const res = await api.get(`/api/itineraries/admin/${itinerary._id}`);
      const data = res.data?.data || itinerary;
      setFormData({
        ...INITIAL_FORM_STATE,
        ...data,
        localServices:
          Array.isArray(data.localServices) && data.localServices.length > 0
            ? data.localServices
            : INITIAL_FORM_STATE.localServices || [],
      });
      setIsEditing(true);
      setEditingId(itinerary._id);
      setActiveTab('basic');
      setActiveModal(true);
    } catch (err) {
      alert('Failed to load itinerary details for editing');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.city || !formData.heroImage || !formData.durationDays) {
      alert('Title, City, Hero Image, and Duration are required.');
      return;
    }

    try {
      setSaving(true);
      if (isEditing && editingId) {
        await api.put(`/api/itineraries/admin/${editingId}`, formData);
      } else {
        await api.post('/api/itineraries/admin', formData);
      }
      setActiveModal(false);
      fetchItineraries();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save itinerary');
    } finally {
      setSaving(false);
    }
  };

  // Helper methods for Day builder
  const addDay = () => {
    const nextDayNum = (formData.days?.length || 0) + 1;
    setFormData({
      ...formData,
      days: [
        ...(formData.days || []),
        {
          dayNumber: nextDayNum,
          title: `Day ${nextDayNum}: Sightseeing`,
          summary: '',
          activities: [],
          recommendedStays: [],
        },
      ],
    });
  };

  const removeDay = (index) => {
    const updated = formData.days.filter((_, i) => i !== index);
    // Re-index days
    const reindexed = updated.map((d, i) => ({ ...d, dayNumber: i + 1 }));
    setFormData({ ...formData, days: reindexed });
  };

  const addActivity = (dayIndex) => {
    const updatedDays = [...formData.days];
    if (!updatedDays[dayIndex].activities) updatedDays[dayIndex].activities = [];
    updatedDays[dayIndex].activities.push({
      timeSlot: 'Morning',
      title: 'New Activity / Spot',
      category: 'sightseeing',
      foodType: '',
      rating: 4.8,
      description: '',
      approxCostPerPerson: 0,
      timeRequiredMinutes: 60,
      insiderTip: '',
      images: [],
      location: { name: '', mapUrl: '' },
    });
    setFormData({ ...formData, days: updatedDays });
  };

  const removeActivity = (dayIndex, actIndex) => {
    const updatedDays = [...formData.days];
    updatedDays[dayIndex].activities = updatedDays[dayIndex].activities.filter((_, i) => i !== actIndex);
    setFormData({ ...formData, days: updatedDays });
  };

  const addActivityImage = (dayIndex, actIndex, url) => {
    if (!url || !url.trim()) return;
    const updatedDays = [...formData.days];
    const act = updatedDays[dayIndex].activities[actIndex];
    act.images = [...(act.images || []), url.trim()];
    setFormData({ ...formData, days: updatedDays });
  };

  const removeActivityImage = (dayIndex, actIndex, imgIdx) => {
    const updatedDays = [...formData.days];
    const act = updatedDays[dayIndex].activities[actIndex];
    act.images = (act.images || []).filter((_, i) => i !== imgIdx);
    setFormData({ ...formData, days: updatedDays });
  };

  // Helper methods for Local Services
  const addLocalService = (presetType = 'cab') => {
    const presets = {
      cab: {
        serviceType: 'cab',
        title: 'Verified Sightseeing Cab & Airport Taxi',
        contactPerson: 'Local Driver Partner',
        phone: '+91 98765 43210',
        priceInfo: '₹2,200/day Sedan',
        notes: 'Punctual, English/Hindi speaking, AC cab available 24/7.',
        rating: 4.9,
      },
      scooty: {
        serviceType: 'scooty',
        title: 'Self-Drive Scooty & Bike Rentals',
        contactPerson: 'City Bike Rentals',
        phone: '+91 98765 43211',
        priceInfo: '₹500/day Activa',
        notes: 'Helmets provided, minimal security deposit.',
        rating: 4.8,
      },
      guide: {
        serviceType: 'guide',
        title: 'Certified Local Tour Guide',
        contactPerson: 'Local Guide',
        phone: '+91 98765 43212',
        priceInfo: '₹1,500/day',
        notes: 'Government authorized, deep knowledge of local history & culture.',
        rating: 4.9,
      },
      rental: {
        serviceType: 'rental',
        title: 'Self-Drive Car & SUV Rentals',
        contactPerson: 'City Self-Drive Cars',
        phone: '+91 98765 43214',
        priceInfo: '₹2,500/day for Swift / Thar',
        notes: 'Doorstep delivery, unlimited km options, clean sanitized cars.',
        rating: 4.8,
      },
      doctor: {
        serviceType: 'doctor',
        title: 'On-Call Doctor & Medical Help',
        contactPerson: 'City Clinic on Call',
        phone: '+91 98765 43215',
        priceInfo: 'On Call Fee: ₹500',
        notes: 'General physician on call, nearest pharmacy delivery support.',
        rating: 4.9,
      },
      emergency: {
        serviceType: 'emergency',
        title: '24/7 Local Traveler Helpline',
        contactPerson: 'Tourist Helpline',
        phone: '+91 98765 43213',
        priceInfo: 'Free Support',
        notes: 'Emergency medical, route assistance, and local police coordination.',
        rating: 5.0,
      },
    };

    const newService = presets[presetType] || {
      serviceType: 'cab',
      title: 'Local Service Partner',
      contactPerson: '',
      phone: '',
      priceInfo: '',
      notes: '',
      rating: 4.8,
    };

    setFormData({
      ...formData,
      localServices: [...(formData.localServices || []), newService],
    });
  };

  const removeLocalService = (index) => {
    setFormData({
      ...formData,
      localServices: (formData.localServices || []).filter((_, i) => i !== index),
    });
  };

  const updateLocalService = (index, field, value) => {
    const updated = [...(formData.localServices || [])];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, localServices: updated });
  };

  // Helper methods for FAQs
  const addFaq = () => {
    setFormData({
      ...formData,
      faqs: [...(formData.faqs || []), { question: '', answer: '' }],
    });
  };

  const removeFaq = (index) => {
    setFormData({
      ...formData,
      faqs: formData.faqs.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#151c2c] p-6 rounded-xl border border-[#242f47]">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Compass className="w-6 h-6 text-indigo-400" />
            Itinerary & Travel Guide Manager
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Create and publish SEO-optimized day-by-day itineraries and link Nesto stays.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-sm transition-all shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create Itinerary
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <input
            type="text"
            placeholder="Search by title, city, or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#151c2c] border border-[#242f47] text-white pl-10 pr-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
        </form>

        <div className="sm:w-60">
          <input
            type="text"
            placeholder="Filter by city (e.g. Manali)..."
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="w-full bg-[#151c2c] border border-[#242f47] text-white px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Itineraries List Table */}
      <div className="bg-[#151c2c] border border-[#242f47] rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin mr-2 text-indigo-400" />
            Loading itineraries...
          </div>
        ) : itineraries.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Compass className="w-12 h-12 mx-auto mb-3 opacity-40 text-indigo-400" />
            <p className="text-base font-semibold">No Itineraries Found</p>
            <p className="text-xs text-gray-500 mt-1">
              Click &quot;Create Itinerary&quot; above to create your first trip guide.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-[#0b0f19] text-xs uppercase text-gray-400 border-b border-[#242f47]">
                <tr>
                  <th className="px-6 py-4">Itinerary</th>
                  <th className="px-6 py-4">City</th>
                  <th className="px-6 py-4">Duration</th>
                  <th className="px-6 py-4">Est. Budget</th>
                  <th className="px-6 py-4">Local Contacts</th>
                  <th className="px-6 py-4">Views</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#242f47]">
                {itineraries.map((item) => (
                  <tr key={item._id} className="hover:bg-[#1a233a] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.heroImage || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb'}
                          alt={item.title}
                          className="w-12 h-12 rounded-lg object-cover bg-gray-800"
                        />
                        <div>
                          <p className="font-bold text-white line-clamp-1">{item.title}</p>
                          <p className="text-xs text-gray-400 font-mono">/itinerary/{item.city?.toLowerCase()}/{item.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-200">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                        {item.city}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1 text-xs bg-[#242f47] px-2.5 py-1 rounded-md text-gray-200 w-fit">
                        <Clock className="w-3 h-3 text-indigo-400" />
                        {item.durationDays} Days
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-emerald-400">
                      {item.estimatedBudget?.budgetPerPerson
                        ? `₹${item.estimatedBudget.budgetPerPerson.toLocaleString('en-IN')}`
                        : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 text-xs bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2.5 py-1 rounded-md font-medium">
                        <Car className="w-3.5 h-3.5 text-amber-400" />
                        {item.localServices?.length || 0} Contacts
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      <span className="flex items-center gap-1 text-xs">
                        <Eye className="w-3.5 h-3.5 text-gray-400" />
                        {item.viewCount || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleTogglePublish(item._id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer ${
                          item.isPublished
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                        }`}
                      >
                        {item.isPublished ? (
                          <>
                            <CheckCircle className="w-3 h-3" /> Published
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" /> Draft
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 rounded-lg bg-[#242f47] text-indigo-400 hover:text-white hover:bg-indigo-600 transition cursor-pointer"
                          title="Edit Itinerary"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id, item.title)}
                          className="p-1.5 rounded-lg bg-[#242f47] text-red-400 hover:text-white hover:bg-red-600 transition cursor-pointer"
                          title="Delete Itinerary"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Itinerary Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
          <div className="bg-[#151c2c] border border-[#242f47] rounded-2xl max-w-4xl w-full h-[92vh] max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative">
            {/* 1. Fixed Modal Header (Never shrinks or scrolls away) */}
            <div className="shrink-0 p-4 sm:p-5 border-b border-[#242f47] flex items-center justify-between bg-[#0b0f19]">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <Compass className="w-5 h-5 text-indigo-400" />
                  <span>{isEditing ? 'Edit Itinerary' : 'Create New Itinerary'}</span>
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Fill in trip details, day schedules, food spots, local contacts, and SEO.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#242f47] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 2. Fixed Modal Navigation Tabs (Pinned firmly at top with pill styling) */}
            <div className="shrink-0 bg-[#0d1322] border-b border-[#242f47] px-4 sm:px-6 py-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar z-20">
              {[
                { id: 'basic', label: '1. Basic Info & Budget', count: null },
                {
                  id: 'days',
                  label: '2. Day Plans & Food Sights',
                  count: formData.days?.length || 0,
                },
                {
                  id: 'services',
                  label: '3. 🚖 Local Cabs & Guides',
                  count: formData.localServices?.length || 0,
                },
                {
                  id: 'seo_faqs',
                  label: '4. SEO & FAQs',
                  count: formData.faqs?.length || 0,
                },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'bg-[#151c2c] text-gray-300 hover:text-white hover:bg-[#202b40] border border-[#242f47]'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {tab.count !== null && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-md font-extrabold ${
                          isActive
                            ? 'bg-white/25 text-white'
                            : 'bg-[#0b0f19] text-gray-400'
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* 3. Scrollable Modal Body Form */}
            <form onSubmit={handleSubmit} id="itinerary-admin-form" className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {/* TAB 1: BASIC INFO */}
              {activeTab === 'basic' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-300 block mb-1">
                        Itinerary Title *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 3 Days Ultimate Manali Itinerary"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full bg-[#0b0f19] border border-[#242f47] text-white px-3.5 py-2 rounded-lg text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-300 block mb-1">
                        URL Slug (Optional - Auto generated)
                      </label>
                      <input
                        type="text"
                        placeholder="3-days-ultimate-manali-itinerary"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        className="w-full bg-[#0b0f19] border border-[#242f47] text-white px-3.5 py-2 rounded-lg text-sm font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-300 block mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Manali"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full bg-[#0b0f19] border border-[#242f47] text-white px-3.5 py-2 rounded-lg text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-300 block mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Himachal Pradesh"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="w-full bg-[#0b0f19] border border-[#242f47] text-white px-3.5 py-2 rounded-lg text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-300 block mb-1">
                        Duration (Days) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="30"
                        required
                        value={formData.durationDays}
                        onChange={(e) =>
                          setFormData({ ...formData, durationDays: parseInt(e.target.value, 10) || 1 })
                        }
                        className="w-full bg-[#0b0f19] border border-[#242f47] text-white px-3.5 py-2 rounded-lg text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-300 block mb-1">
                      Hero Banner Image URL *
                    </label>
                    <input
                      type="url"
                      required
                      placeholder="https://images.unsplash.com/photo-..."
                      value={formData.heroImage}
                      onChange={(e) => setFormData({ ...formData, heroImage: e.target.value })}
                      className="w-full bg-[#0b0f19] border border-[#242f47] text-white px-3.5 py-2 rounded-lg text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-300 block mb-1">
                        Est. Overall Budget Per Person (INR)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.estimatedBudget?.budgetPerPerson || 0}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            estimatedBudget: {
                              ...formData.estimatedBudget,
                              budgetPerPerson: parseInt(e.target.value, 10) || 0,
                            },
                          })
                        }
                        className="w-full bg-[#0b0f19] border border-[#242f47] text-white px-3.5 py-2 rounded-lg text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-300 block mb-1">
                        Best Time To Visit
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. October to May"
                        value={formData.bestTimeToVisit}
                        onChange={(e) => setFormData({ ...formData, bestTimeToVisit: e.target.value })}
                        className="w-full bg-[#0b0f19] border border-[#242f47] text-white px-3.5 py-2 rounded-lg text-sm"
                      />
                    </div>
                  </div>

                  {/* Real Cost Parameters for Live Calculator */}
                  <div className="bg-[#0b0f19] p-4 rounded-xl border border-[#242f47] space-y-3">
                    <p className="text-xs font-bold text-indigo-400">
                      💰 Real Cost Estimation Parameters (For Live Budget Planner)
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-gray-300 block mb-1">
                          Avg Stay Cost / Night (₹)
                        </label>
                        <input
                          type="number"
                          min="0"
                          placeholder="1800"
                          value={formData.estimatedBudget?.stayCostPerNight ?? 1800}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              estimatedBudget: {
                                ...formData.estimatedBudget,
                                stayCostPerNight: parseInt(e.target.value, 10) || 0,
                              },
                            })
                          }
                          className="w-full bg-[#151c2c] border border-[#242f47] text-white px-3 py-1.5 rounded-lg text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-gray-300 block mb-1">
                          Food & Dining / Person / Day (₹)
                        </label>
                        <input
                          type="number"
                          min="0"
                          placeholder="600"
                          value={formData.estimatedBudget?.foodCostPerDay ?? 600}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              estimatedBudget: {
                                ...formData.estimatedBudget,
                                foodCostPerDay: parseInt(e.target.value, 10) || 0,
                              },
                            })
                          }
                          className="w-full bg-[#151c2c] border border-[#242f47] text-white px-3 py-1.5 rounded-lg text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-gray-300 block mb-1">
                          Local Transit / Scooty / Day (₹)
                        </label>
                        <input
                          type="number"
                          min="0"
                          placeholder="500"
                          value={formData.estimatedBudget?.transportCostPerDay ?? 500}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              estimatedBudget: {
                                ...formData.estimatedBudget,
                                transportCostPerDay: parseInt(e.target.value, 10) || 0,
                              },
                            })
                          }
                          className="w-full bg-[#151c2c] border border-[#242f47] text-white px-3 py-1.5 rounded-lg text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-300 block mb-1">
                      Ideal For
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {IDEAL_FOR_OPTIONS.map((tag) => {
                        const isSelected = formData.idealFor?.includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => {
                              const updated = isSelected
                                ? formData.idealFor.filter((t) => t !== tag)
                                : [...(formData.idealFor || []), tag];
                              setFormData({ ...formData, idealFor: updated });
                            }}
                            className={`px-3 py-1 rounded-md text-xs font-semibold capitalize cursor-pointer transition ${
                              isSelected
                                ? 'bg-indigo-600 text-white'
                                : 'bg-[#0b0f19] border border-[#242f47] text-gray-400 hover:text-white'
                            }`}
                          >
                            {tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-300 block mb-1">
                      Trip Overview
                    </label>
                    <textarea
                      rows="3"
                      placeholder="Write an engaging 2-3 paragraph summary of the trip..."
                      value={formData.overview}
                      onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
                      className="w-full bg-[#0b0f19] border border-[#242f47] text-white p-3 rounded-lg text-sm"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: DAY-BY-DAY PLANS */}
              {activeTab === 'days' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">
                      Day Schedules ({formData.days?.length || 0} Days configured)
                    </h4>
                    <button
                      type="button"
                      onClick={addDay}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Day
                    </button>
                  </div>

                  {formData.days?.map((day, dIdx) => (
                    <div
                      key={dIdx}
                      className="bg-[#0b0f19] border border-[#242f47] rounded-xl p-5 space-y-4"
                    >
                      <div className="flex items-center justify-between border-b border-[#242f47] pb-3">
                        <div className="flex items-center gap-3 flex-1">
                          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                            {day.dayNumber}
                          </span>
                          <input
                            type="text"
                            placeholder="Day Title (e.g. Old Manali & Hadimba Temple)"
                            value={day.title}
                            onChange={(e) => {
                              const updated = [...formData.days];
                              updated[dIdx].title = e.target.value;
                              setFormData({ ...formData, days: updated });
                            }}
                            className="bg-[#151c2c] border border-[#242f47] text-white px-3 py-1.5 rounded-lg text-sm font-semibold flex-1"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeDay(dIdx)}
                          className="text-red-400 hover:text-red-300 text-xs ml-3 cursor-pointer"
                        >
                          Remove Day
                        </button>
                      </div>

                      {/* Day Summary */}
                      <input
                        type="text"
                        placeholder="Short summary of the day's theme..."
                        value={day.summary || ''}
                        onChange={(e) => {
                          const updated = [...formData.days];
                          updated[dIdx].summary = e.target.value;
                          setFormData({ ...formData, days: updated });
                        }}
                        className="w-full bg-[#151c2c] border border-[#242f47] text-gray-300 px-3 py-1.5 rounded-lg text-xs"
                      />

                      {/* Activities for this Day */}
                      <div className="space-y-3 pl-3 sm:pl-4 border-l-2 border-indigo-500/50">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-gray-400">
                            Activities & Sights ({day.activities?.length || 0})
                          </span>
                          <button
                            type="button"
                            onClick={() => addActivity(dIdx)}
                            className="text-indigo-400 hover:text-indigo-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <PlusCircle className="w-3.5 h-3.5" />
                            Add Activity / Spot
                          </button>
                        </div>

                        {day.activities?.map((act, aIdx) => {
                          const isFoodCat = act.category === 'food';
                          return (
                            <div
                              key={aIdx}
                              className={`border rounded-xl p-4 space-y-3 text-xs transition-all ${
                                isFoodCat
                                  ? 'bg-[#18131d] border-amber-500/40'
                                  : 'bg-[#151c2c] border-[#242f47]'
                              }`}
                            >
                              {/* Row 1: Time Slot, Title & Category */}
                              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                                <div className="sm:col-span-3">
                                  <label className="text-[10px] text-gray-400 block mb-0.5">Time Slot</label>
                                  <input
                                    type="text"
                                    placeholder="e.g. 09:00 AM - 11:30 AM"
                                    value={act.timeSlot || ''}
                                    onChange={(e) => {
                                      const updated = [...formData.days];
                                      updated[dIdx].activities[aIdx].timeSlot = e.target.value;
                                      setFormData({ ...formData, days: updated });
                                    }}
                                    className="w-full bg-[#0b0f19] border border-[#242f47] text-white p-2 rounded"
                                  />
                                </div>

                                <div className="sm:col-span-6">
                                  <label className="text-[10px] text-gray-400 block mb-0.5">Activity / Place Title *</label>
                                  <input
                                    type="text"
                                    placeholder="e.g. Hadimba Temple & Cedar Forest"
                                    required
                                    value={act.title}
                                    onChange={(e) => {
                                      const updated = [...formData.days];
                                      updated[dIdx].activities[aIdx].title = e.target.value;
                                      setFormData({ ...formData, days: updated });
                                    }}
                                    className="w-full bg-[#0b0f19] border border-[#242f47] text-white p-2 rounded font-semibold"
                                  />
                                </div>

                                <div className="sm:col-span-3">
                                  <label className="text-[10px] text-gray-400 block mb-0.5">Category</label>
                                  <select
                                    value={act.category || 'sightseeing'}
                                    onChange={(e) => {
                                      const updated = [...formData.days];
                                      updated[dIdx].activities[aIdx].category = e.target.value;
                                      setFormData({ ...formData, days: updated });
                                    }}
                                    className="w-full bg-[#0b0f19] border border-[#242f47] text-white p-2 rounded capitalize"
                                  >
                                    {CATEGORY_OPTIONS.map((c) => (
                                      <option key={c} value={c}>
                                        {c === 'food' ? '🍲 Food & Dining' : c}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>

                              {/* Row 2: Food Tag (if food or chosen), Rating, Approx Cost */}
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-[#0b0f19]/60 p-2.5 rounded-lg border border-[#242f47]/60">
                                <div>
                                  <label className="text-[10px] font-bold text-amber-400 flex items-center gap-1 mb-0.5">
                                    <UtensilsCrossed className="w-3 h-3" />
                                    Food / Dining Tag
                                  </label>
                                  <input
                                    type="text"
                                    list={`food-tags-${dIdx}-${aIdx}`}
                                    placeholder="e.g. Street Food, Must-Try Cafe..."
                                    value={act.foodType || ''}
                                    onChange={(e) => {
                                      const updated = [...formData.days];
                                      updated[dIdx].activities[aIdx].foodType = e.target.value;
                                      setFormData({ ...formData, days: updated });
                                    }}
                                    className="w-full bg-[#151c2c] border border-amber-500/30 text-amber-200 p-1.5 rounded text-xs"
                                  />
                                  <datalist id={`food-tags-${dIdx}-${aIdx}`}>
                                    {FOOD_TAG_OPTIONS.map((ft) => (
                                      <option key={ft} value={ft} />
                                    ))}
                                  </datalist>
                                </div>

                                <div>
                                  <label className="text-[10px] font-bold text-amber-400 flex items-center gap-1 mb-0.5">
                                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                    Rating (Leave blank for "No Rated")
                                  </label>
                                  <input
                                    type="number"
                                    min="1"
                                    max="5"
                                    step="0.1"
                                    placeholder="e.g. 4.8 or blank"
                                    value={act.rating !== undefined && act.rating !== null ? act.rating : ''}
                                    onChange={(e) => {
                                      const updated = [...formData.days];
                                      updated[dIdx].activities[aIdx].rating =
                                        e.target.value === '' ? null : parseFloat(e.target.value);
                                      setFormData({ ...formData, days: updated });
                                    }}
                                    className="w-full bg-[#151c2c] border border-[#242f47] text-white p-1.5 rounded text-xs"
                                  />
                                </div>


                                <div>
                                  <label className="text-[10px] text-gray-400 block mb-0.5">Entry / Ticket Cost (₹)</label>
                                  <input
                                    type="number"
                                    placeholder="0 for Free"
                                    value={act.approxCostPerPerson || 0}
                                    onChange={(e) => {
                                      const updated = [...formData.days];
                                      updated[dIdx].activities[aIdx].approxCostPerPerson =
                                        parseInt(e.target.value, 10) || 0;
                                      setFormData({ ...formData, days: updated });
                                    }}
                                    className="w-full bg-[#151c2c] border border-[#242f47] text-white p-1.5 rounded text-xs"
                                  />
                                </div>
                              </div>

                              {/* Row 3: Location Name & Directions Map URL */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div>
                                  <label className="text-[10px] text-gray-400 block mb-0.5">Location / Landmark Name</label>
                                  <input
                                    type="text"
                                    placeholder="e.g. Old Manali Village"
                                    value={act.location?.name || ''}
                                    onChange={(e) => {
                                      const updated = [...formData.days];
                                      updated[dIdx].activities[aIdx].location = {
                                        ...updated[dIdx].activities[aIdx].location,
                                        name: e.target.value,
                                      };
                                      setFormData({ ...formData, days: updated });
                                    }}
                                    className="w-full bg-[#0b0f19] border border-[#242f47] text-white p-2 rounded"
                                  />
                                </div>

                                <div>
                                  <label className="text-[10px] text-gray-400 flex items-center gap-1 mb-0.5">
                                    <Navigation className="w-3 h-3 text-blue-400" />
                                    Google Maps / Directions URL
                                  </label>
                                  <input
                                    type="url"
                                    placeholder="https://maps.google.com/?q=..."
                                    value={act.location?.mapUrl || ''}
                                    onChange={(e) => {
                                      const updated = [...formData.days];
                                      updated[dIdx].activities[aIdx].location = {
                                        ...updated[dIdx].activities[aIdx].location,
                                        mapUrl: e.target.value,
                                      };
                                      setFormData({ ...formData, days: updated });
                                    }}
                                    className="w-full bg-[#0b0f19] border border-[#242f47] text-white p-2 rounded text-xs font-mono"
                                  />
                                </div>
                              </div>

                              {/* Description & Tip */}
                              <textarea
                                rows="2"
                                placeholder="Activity description & highlights..."
                                value={act.description || ''}
                                onChange={(e) => {
                                  const updated = [...formData.days];
                                  updated[dIdx].activities[aIdx].description = e.target.value;
                                  setFormData({ ...formData, days: updated });
                                }}
                                className="w-full bg-[#0b0f19] border border-[#242f47] text-white p-2 rounded"
                              />

                              <input
                                type="text"
                                placeholder="🌟 Insider Tip (e.g. Visit before 10 AM to avoid crowds)"
                                value={act.insiderTip || ''}
                                onChange={(e) => {
                                  const updated = [...formData.days];
                                  updated[dIdx].activities[aIdx].insiderTip = e.target.value;
                                  setFormData({ ...formData, days: updated });
                                }}
                                className="w-full bg-[#0b0f19] border border-amber-500/30 text-amber-200 p-2 rounded"
                              />

                              {/* Multi-Picture URL Manager */}
                              <div className="bg-[#0b0f19] p-3 rounded-lg border border-[#242f47] space-y-2">
                                <div className="flex items-center justify-between">
                                  <label className="text-[10px] font-bold text-gray-300 flex items-center gap-1">
                                    <ImageIcon className="w-3 h-3 text-indigo-400" />
                                    Activity Pictures ({act.images?.length || 0})
                                  </label>
                                </div>

                                <div className="flex gap-2">
                                  <input
                                    type="url"
                                    id={`new-img-input-${dIdx}-${aIdx}`}
                                    placeholder="Paste Image URL (e.g. https://images.unsplash.com/...)"
                                    className="flex-1 bg-[#151c2c] border border-[#242f47] text-white px-2.5 py-1.5 rounded text-xs font-mono"
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addActivityImage(dIdx, aIdx, e.currentTarget.value);
                                        e.currentTarget.value = '';
                                      }
                                    }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const inputEl = document.getElementById(
                                        `new-img-input-${dIdx}-${aIdx}`
                                      );
                                      if (inputEl && inputEl.value) {
                                        addActivityImage(dIdx, aIdx, inputEl.value);
                                        inputEl.value = '';
                                      }
                                    }}
                                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-semibold cursor-pointer"
                                  >
                                    Add Image
                                  </button>
                                </div>

                                {act.images && act.images.length > 0 && (
                                  <div className="flex flex-wrap gap-2 pt-1">
                                    {act.images.map((imgUrl, imgIdx) => (
                                      <div
                                        key={imgIdx}
                                        className="relative group/thumb w-16 h-12 rounded-md overflow-hidden bg-black/40 border border-[#242f47]"
                                      >
                                        <img
                                          src={imgUrl}
                                          alt="thumb"
                                          className="w-full h-full object-cover"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => removeActivityImage(dIdx, aIdx, imgIdx)}
                                          className="absolute inset-0 bg-red-600/80 text-white opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                                          title="Remove photo"
                                        >
                                          <X className="w-4 h-4" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              <div className="flex justify-end pt-1">
                                <button
                                  type="button"
                                  onClick={() => removeActivity(dIdx, aIdx)}
                                  className="text-red-400 hover:text-red-300 text-[11px] cursor-pointer"
                                >
                                  Delete Activity
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 3: LOCAL SERVICES & CONTACTS */}
              {activeTab === 'services' && (
                <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0b0f19] p-4 rounded-xl border border-[#242f47]">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        Verified Local Contacts & Services ({formData.localServices?.length || 0})
                      </h4>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Provide trusted Cab driver, Scooty rental, and Tour Guide phone numbers for travelers.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => addLocalService('cab')}
                        className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        + 🚖 Cab Partner
                      </button>
                      <button
                        type="button"
                        onClick={() => addLocalService('scooty')}
                        className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        + 🛵 Scooty Rental
                      </button>
                      <button
                        type="button"
                        onClick={() => addLocalService('rental')}
                        className="px-2.5 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        + 🚗 Car Rental
                      </button>
                      <button
                        type="button"
                        onClick={() => addLocalService('guide')}
                        className="px-2.5 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        + 🧭 Local Guide
                      </button>
                      <button
                        type="button"
                        onClick={() => addLocalService('doctor')}
                        className="px-2.5 py-1 bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        + 🩺 Doctor
                      </button>
                      <button
                        type="button"
                        onClick={() => addLocalService('emergency')}
                        className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        + 🚨 Helpline
                      </button>
                    </div>
                  </div>

                  {(!formData.localServices || formData.localServices.length === 0) && (
                    <div className="p-8 text-center bg-[#0b0f19] rounded-xl border border-[#242f47] text-gray-400 text-xs">
                      No local services added yet. Click one of the quick template buttons above to add trusted driver or rental contacts.
                    </div>
                  )}

                  {formData.localServices?.map((service, sIdx) => (
                    <div
                      key={sIdx}
                      className="bg-[#0b0f19] border border-[#242f47] rounded-xl p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-[#242f47] pb-2.5">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          #{sIdx + 1} {service.title || 'Local Service'}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeLocalService(sIdx)}
                          className="text-red-400 hover:text-red-300 text-xs cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[11px] font-semibold text-gray-300 block mb-1">
                            Service Type
                          </label>
                          <select
                            value={service.serviceType || 'cab'}
                            onChange={(e) => updateLocalService(sIdx, 'serviceType', e.target.value)}
                            className="w-full bg-[#151c2c] border border-[#242f47] text-white p-2 rounded-lg text-xs"
                          >
                            {SERVICE_TYPE_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-gray-300 block mb-1">
                            Service Title / Name *
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Verified Sightseeing Cab Partner"
                            value={service.title}
                            onChange={(e) => updateLocalService(sIdx, 'title', e.target.value)}
                            className="w-full bg-[#151c2c] border border-[#242f47] text-white p-2 rounded-lg text-xs font-semibold"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-gray-300 block mb-1">
                            Contact Person Name
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Vikram Sharma"
                            value={service.contactPerson || ''}
                            onChange={(e) => updateLocalService(sIdx, 'contactPerson', e.target.value)}
                            className="w-full bg-[#151c2c] border border-[#242f47] text-white p-2 rounded-lg text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[11px] font-semibold text-gray-300 block mb-1">
                            Phone Number * (for Call & WhatsApp)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. +91 98765 43210"
                            value={service.phone}
                            onChange={(e) => updateLocalService(sIdx, 'phone', e.target.value)}
                            className="w-full bg-[#151c2c] border border-[#242f47] text-white p-2 rounded-lg text-xs font-mono"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-gray-300 block mb-1">
                            Price / Rate Info
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. ₹2,200/day Sedan or ₹500/day Activa"
                            value={service.priceInfo || ''}
                            onChange={(e) => updateLocalService(sIdx, 'priceInfo', e.target.value)}
                            className="w-full bg-[#151c2c] border border-[#242f47] text-white p-2 rounded-lg text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-amber-400 flex items-center gap-1 mb-1">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            Rating (1.0 to 5.0)
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="5"
                            step="0.1"
                            placeholder="4.9"
                            value={service.rating ?? 4.9}
                            onChange={(e) =>
                              updateLocalService(sIdx, 'rating', parseFloat(e.target.value) || 4.9)
                            }
                            className="w-full bg-[#151c2c] border border-[#242f47] text-white p-2 rounded-lg text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-gray-300 block mb-1">
                          Notes / Partner Info
                        </label>
                        <textarea
                          rows="2"
                          placeholder="e.g. Punctual driver, AC cab, English/Hindi speaking, reliable airport drop."
                          value={service.notes || ''}
                          onChange={(e) => updateLocalService(sIdx, 'notes', e.target.value)}
                          className="w-full bg-[#151c2c] border border-[#242f47] text-white p-2 rounded-lg text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 4: SEO & FAQS */}
              {activeTab === 'seo_faqs' && (
                <div className="space-y-5">
                  <div className="space-y-4 bg-[#0b0f19] p-5 rounded-xl border border-[#242f47]">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      Google SEO Meta Tags
                    </h4>

                    <div>
                      <label className="text-xs font-semibold text-gray-300 block mb-1">
                        Meta Title (Google SERP)
                      </label>
                      <input
                        type="text"
                        placeholder="3 Days Ultimate Manali Itinerary (2026 Guide) | Nesto Rooms"
                        value={formData.metaTitle || ''}
                        onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                        className="w-full bg-[#151c2c] border border-[#242f47] text-white px-3.5 py-2 rounded-lg text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-300 block mb-1">
                        Meta Description
                      </label>
                      <textarea
                        rows="2"
                        placeholder="Detailed 3 days Manali trip plan with hidden cafes, budget breakdown, and Nesto stays..."
                        value={formData.metaDescription || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, metaDescription: e.target.value })
                        }
                        className="w-full bg-[#151c2c] border border-[#242f47] text-white p-3 rounded-lg text-sm"
                      />
                    </div>
                  </div>

                  {/* FAQs Builder */}
                  <div className="space-y-4 bg-[#0b0f19] p-5 rounded-xl border border-[#242f47]">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white">
                        Frequently Asked Questions (Rich Snippets)
                      </h4>
                      <button
                        type="button"
                        onClick={addFaq}
                        className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        Add FAQ
                      </button>
                    </div>

                    {formData.faqs?.map((faq, fIdx) => (
                      <div
                        key={fIdx}
                        className="bg-[#151c2c] border border-[#242f47] p-3 rounded-lg space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-400">FAQ #{fIdx + 1}</span>
                          <button
                            type="button"
                            onClick={() => removeFaq(fIdx)}
                            className="text-red-400 hover:text-red-300 cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder="Question..."
                          value={faq.question}
                          onChange={(e) => {
                            const updated = [...formData.faqs];
                            updated[fIdx].question = e.target.value;
                            setFormData({ ...formData, faqs: updated });
                          }}
                          className="w-full bg-[#0b0f19] border border-[#242f47] text-white p-2 rounded font-semibold"
                        />
                        <textarea
                          rows="2"
                          placeholder="Answer..."
                          value={faq.answer}
                          onChange={(e) => {
                            const updated = [...formData.faqs];
                            updated[fIdx].answer = e.target.value;
                            setFormData({ ...formData, faqs: updated });
                          }}
                          className="w-full bg-[#0b0f19] border border-[#242f47] text-white p-2 rounded"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Publish & Featured Controls */}
                  <div className="flex items-center gap-6 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-200">
                      <input
                        type="checkbox"
                        checked={formData.isPublished}
                        onChange={(e) =>
                          setFormData({ ...formData, isPublished: e.target.checked })
                        }
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-0"
                      />
                      <span>Publish on Website (Publicly visible)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-200">
                      <input
                        type="checkbox"
                        checked={formData.isFeatured}
                        onChange={(e) =>
                          setFormData({ ...formData, isFeatured: e.target.checked })
                        }
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-0"
                      />
                      <span>Featured Itinerary (Shown in Top Showcases)</span>
                    </label>
                  </div>
                </div>
              )}
            </form>

            {/* 4. Fixed Modal Footer Controls (Always visible at bottom) */}
            <div className="shrink-0 p-4 sm:p-5 border-t border-[#242f47] flex items-center justify-between bg-[#0b0f19] z-20">
              <button
                type="button"
                onClick={() => setActiveModal(false)}
                className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white transition cursor-pointer"
              >
                Cancel
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  form="itinerary-admin-form"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition disabled:opacity-50 cursor-pointer"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isEditing ? 'Save Changes' : 'Create & Publish'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Itineraries;
