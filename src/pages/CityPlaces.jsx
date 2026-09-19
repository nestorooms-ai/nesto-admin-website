import React, { useEffect, useState } from 'react';
import api from '../api';
import {
  MapPin,
  Search,
  Plus,
  Edit2,
  Trash2,
  Sparkles,
  Loader2,
  X,
  Star,
  Image as ImageIcon,
  Clock,
  IndianRupee,
  Compass,
  CheckCircle,
  XCircle,
  BookOpen,
  Eye,
  RefreshCw,
} from 'lucide-react';

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'All Categories' },
  { value: 'attractions', label: '📍 Attractions / Sightseeing' },
  { value: 'restaurants', label: '🍽️ Restaurants' },
  { value: 'cafes', label: '☕ Cafes' },
  { value: 'photo_spots', label: '📸 Photo Spots & Sunset' },
  { value: 'museums', label: '🏛️ Museums & Art' },
  { value: 'shopping', label: '🛍️ Shopping & Bazaars' },
  { value: 'beach', label: '🏖️ Beach & Coastal' },
  { value: 'adventure', label: '⛷️ Adventure & Outdoor' },
  { value: 'nightlife', label: '🍹 Nightlife & Pubs' },
  { value: 'relaxation', label: '🌿 Relaxation & Nature' },
  { value: 'other', label: '✨ Other Places' },
];

const INITIAL_PLACE_STATE = {
  city: 'jaipur',
  title: '',
  category: 'attractions',
  categoryLabel: 'Attraction',
  foodType: '',
  rating: 4.8,
  reviewsCount: 150,
  description: '',
  images: [''],
  location: {
    name: '',
    address: '',
    coordinates: {
      lat: '',
      lng: '',
    },
    mapUrl: '',
  },
  approxCostPerPerson: 0,
  timeRequiredMinutes: 60,
  openingHours: '09:00 AM - 06:00 PM',
  insiderTip: '',
  isPopular: false,
  isActive: true,
  order: 0,
};

const INITIAL_GUIDE_STATE = {
  city: 'jaipur',
  displayName: 'Jaipur',
  tagline: '',
  heroImage: '',
  about: '',
  bestTimeToVisit: '',
  gettingAround: [
    { mode: 'Autos & Cabs', icon: '🛺', tip: 'Convenient for local city commute' }
  ],
  quickCategories: [
    { id: 'all', name: 'All Places', icon: '🧭' },
    { id: 'attractions', name: 'Attractions', icon: '📍' },
    { id: 'restaurants', name: 'Restaurants', icon: '🍽️' },
    { id: 'cafes', name: 'Cafes', icon: '☕' },
  ],
};

const CityPlaces = () => {
  const [places, setPlaces] = useState([]);
  const [citiesList, setCitiesList] = useState([]);
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [seedLoading, setSeedLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Modal States
  const [isPlaceModalOpen, setIsPlaceModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [editingPlaceId, setEditingPlaceId] = useState(null);
  const [formData, setFormData] = useState(INITIAL_PLACE_STATE);
  const [guideFormData, setGuideFormData] = useState(INITIAL_GUIDE_STATE);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch distinct cities
  const fetchCities = async () => {
    try {
      const res = await api.get('/api/itineraries/admin/places/cities');
      if (res.data?.success) {
        setCitiesList(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching admin cities:', err);
    }
  };

  // Fetch places with filters
  const fetchPlaces = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCity && selectedCity !== 'all') params.append('city', selectedCity);
      if (selectedCategory && selectedCategory !== 'all') params.append('category', selectedCategory);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      params.append('limit', '100');

      const res = await api.get(`/api/itineraries/admin/places?${params.toString()}`);
      if (res.data?.success) {
        setPlaces(res.data.data?.places || []);
      }
    } catch (err) {
      console.error('Error fetching admin places:', err);
      showToast('Failed to load places. Please check backend connection.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCities();
  }, []);

  useEffect(() => {
    fetchPlaces();
  }, [selectedCity, selectedCategory, searchQuery]);

  // Handle Place Add / Edit
  const handleOpenAddPlace = () => {
    setEditingPlaceId(null);
    setFormData({
      ...INITIAL_PLACE_STATE,
      city: selectedCity !== 'all' ? selectedCity : 'jaipur',
    });
    setIsPlaceModalOpen(true);
  };

  const handleOpenEditPlace = (place) => {
    setEditingPlaceId(place.id || place._id);
    setFormData({
      city: place.city || 'jaipur',
      title: place.title || '',
      category: place.category || 'attractions',
      categoryLabel: place.categoryLabel || '',
      foodType: place.foodType || '',
      rating: place.rating || 4.8,
      reviewsCount: place.reviewsCount || 100,
      description: place.description || '',
      images: place.images && place.images.length > 0 ? place.images : [''],
      location: {
        name: place.location?.name || '',
        address: place.location?.address || '',
        coordinates: {
          lat: place.location?.coordinates?.lat || '',
          lng: place.location?.coordinates?.lng || '',
        },
        mapUrl: place.location?.mapUrl || '',
      },
      approxCostPerPerson: place.approxCostPerPerson || 0,
      timeRequiredMinutes: place.timeRequiredMinutes || 60,
      openingHours: place.openingHours || '09:00 AM - 06:00 PM',
      insiderTip: place.insiderTip || '',
      isPopular: place.isPopular || false,
      isActive: place.isActive !== undefined ? place.isActive : true,
      order: place.order || 0,
    });
    setIsPlaceModalOpen(true);
  };

  const handleSavePlace = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.city.trim()) {
      showToast('City and Title are mandatory fields.', 'error');
      return;
    }

    try {
      setActionLoading(true);
      const payload = {
        ...formData,
        city: formData.city.trim().toLowerCase(),
        images: formData.images.filter((img) => img && img.trim() !== ''),
        location: {
          ...formData.location,
          coordinates: {
            lat: formData.location?.coordinates?.lat ? Number(formData.location.coordinates.lat) : undefined,
            lng: formData.location?.coordinates?.lng ? Number(formData.location.coordinates.lng) : undefined,
          },
        },
        approxCostPerPerson: Number(formData.approxCostPerPerson) || 0,
        timeRequiredMinutes: Number(formData.timeRequiredMinutes) || 60,
        rating: Number(formData.rating) || 4.8,
        reviewsCount: Number(formData.reviewsCount) || 100,
        order: Number(formData.order) || 0,
      };

      if (editingPlaceId) {
        const res = await api.put(`/api/itineraries/admin/places/${editingPlaceId}`, payload);
        if (res.data?.success) {
          showToast('Place updated successfully!');
          setIsPlaceModalOpen(false);
          fetchPlaces();
          fetchCities();
        }
      } else {
        const res = await api.post('/api/itineraries/admin/places', payload);
        if (res.data?.success) {
          showToast('New place added successfully!');
          setIsPlaceModalOpen(false);
          fetchPlaces();
          fetchCities();
        }
      }
    } catch (err) {
      console.error('Error saving place:', err);
      showToast(err.response?.data?.message || 'Failed to save place.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeletePlace = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const res = await api.delete(`/api/itineraries/admin/places/${id}`);
      if (res.data?.success) {
        showToast('Place deleted successfully.');
        setPlaces((prev) => prev.filter((p) => (p.id || p._id) !== id));
        fetchCities();
      }
    } catch (err) {
      console.error('Error deleting place:', err);
      showToast('Failed to delete place.', 'error');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await api.patch(`/api/itineraries/admin/places/${id}/toggle-status`);
      if (res.data?.success) {
        setPlaces((prev) =>
          prev.map((p) =>
            (p.id || p._id) === id ? { ...p, isActive: res.data.data.isActive } : p
          )
        );
        showToast(res.data.message || 'Status updated');
      }
    } catch (err) {
      console.error('Error toggling status:', err);
      showToast('Failed to update status', 'error');
    }
  };

  // Handle Seeding Catalog
  const handleSeedCatalog = async () => {
    if (!window.confirm('This will seed the initial catalog of verified places for Jaipur, Goa, Manali, and Udaipur. Existing entries won\'t be duplicated. Continue?')) {
      return;
    }

    try {
      setSeedLoading(true);
      const res = await api.post('/api/itineraries/admin/places/seed');
      if (res.data?.success) {
        showToast(res.data.message || 'Seeding completed!');
        fetchPlaces();
        fetchCities();
      }
    } catch (err) {
      console.error('Error seeding places:', err);
      showToast('Failed to seed catalog data.', 'error');
    } finally {
      setSeedLoading(false);
    }
  };

  // Handle City Guide Info Modal
  const handleOpenCityGuide = async (cityToFetch) => {
    const targetCity = cityToFetch && cityToFetch !== 'all' ? cityToFetch : (selectedCity !== 'all' ? selectedCity : 'jaipur');
    try {
      setActionLoading(true);
      const res = await api.get(`/api/itineraries/admin/city-guide/${targetCity}`);
      if (res.data?.success && res.data.data) {
        setGuideFormData({
          ...INITIAL_GUIDE_STATE,
          ...res.data.data,
          city: targetCity,
          gettingAround: res.data.data.gettingAround?.length > 0 ? res.data.data.gettingAround : INITIAL_GUIDE_STATE.gettingAround,
          quickCategories: res.data.data.quickCategories?.length > 0 ? res.data.data.quickCategories : INITIAL_GUIDE_STATE.quickCategories,
        });
      } else {
        setGuideFormData({
          ...INITIAL_GUIDE_STATE,
          city: targetCity,
          displayName: targetCity.charAt(0).toUpperCase() + targetCity.slice(1),
        });
      }
      setIsGuideModalOpen(true);
    } catch (err) {
      console.error('Error fetching city guide:', err);
      setGuideFormData({
        ...INITIAL_GUIDE_STATE,
        city: targetCity,
        displayName: targetCity.charAt(0).toUpperCase() + targetCity.slice(1),
      });
      setIsGuideModalOpen(true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveCityGuide = async (e) => {
    e.preventDefault();
    if (!guideFormData.city.trim()) {
      showToast('City slug is required', 'error');
      return;
    }

    try {
      setActionLoading(true);
      const cleanCity = guideFormData.city.trim().toLowerCase();
      const res = await api.put(`/api/itineraries/admin/city-guide/${cleanCity}`, guideFormData);
      if (res.data?.success) {
        showToast('City guide information saved successfully!');
        setIsGuideModalOpen(false);
      }
    } catch (err) {
      console.error('Error saving city guide:', err);
      showToast('Failed to save city guide.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Image Helper for Places Modal
  const handleAddImageField = () => {
    setFormData((prev) => ({ ...prev, images: [...prev.images, ''] }));
  };

  const handleUpdateImage = (index, value) => {
    setFormData((prev) => {
      const newImages = [...prev.images];
      newImages[index] = value;
      return { ...prev, images: newImages };
    });
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-xl shadow-2xl text-sm font-semibold flex items-center gap-3 transition-all animate-bounce ${
            toastMessage.type === 'error'
              ? 'bg-red-600 text-white'
              : 'bg-emerald-600 text-white'
          }`}
        >
          {toastMessage.type === 'error' ? (
            <XCircle className="w-5 h-5" />
          ) : (
            <CheckCircle className="w-5 h-5" />
          )}
          {toastMessage.message}
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-[#151c2c] border border-[#242f47] rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              City Places &amp; Attractions Catalog
              <span className="text-xs bg-indigo-500/20 text-indigo-300 font-semibold px-2.5 py-0.5 rounded-full border border-indigo-500/30">
                100% Dynamic
              </span>
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Manage verified attractions, cafes, restaurants, photo spots, and city guide data for user itinerary planners.
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={() => handleOpenCityGuide(selectedCity !== 'all' ? selectedCity : 'jaipur')}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#1e293b] hover:bg-[#27354f] text-gray-200 border border-gray-700 transition shadow-sm"
          >
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>Edit City Guide</span>
          </button>

          <button
            onClick={handleOpenAddPlace}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Place</span>
          </button>
        </div>

      </div>

      {/* City Tabs & Quick Filters Bar */}
      <div className="bg-[#151c2c] border border-[#242f47] rounded-2xl p-4 space-y-4 shadow-lg">
        {/* City Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2">
            City:
          </span>
          <button
            onClick={() => setSelectedCity('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              selectedCity === 'all'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-[#1e293b] text-gray-300 hover:bg-[#27354f]'
            }`}
          >
            All Cities
          </button>

          {citiesList.map((c) => (
            <button
              key={c.city}
              onClick={() => setSelectedCity(c.city)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                selectedCity === c.city
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-[#1e293b] text-gray-300 hover:bg-[#27354f]'
              }`}
            >
              <span className="capitalize">{c.city}</span>
              {c.placesCount > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  selectedCity === c.city ? 'bg-indigo-700 text-white' : 'bg-[#2d3a54] text-indigo-300'
                }`}>
                  {c.placesCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search & Category Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#242f47]">
          {/* Search Bar */}
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by place name, description, category tag..."
              className="w-full pl-10 pr-4 py-2 bg-[#0b0f19] border border-[#242f47] rounded-xl text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-[#0b0f19] border border-[#242f47] rounded-xl text-xs text-gray-200 focus:outline-none focus:border-indigo-500 transition"
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Places List / Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-3" />
          <p className="text-sm">Loading dynamic places from database...</p>
        </div>
      ) : places.length === 0 ? (
        <div className="bg-[#151c2c] border border-[#242f47] rounded-2xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
            <MapPin className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No places found</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
              No places currently match your filters in this city. You can add places manually or seed initial verified places.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={handleSeedCatalog}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#1e293b] hover:bg-[#27354f] text-indigo-300 border border-indigo-500/30"
            >
              Seed Default Places
            </button>
            <button
              onClick={handleOpenAddPlace}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              + Add First Place
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {places.map((place) => {
            const placeId = place.id || place._id;
            const primaryImg = place.images?.[0] || 'https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=600&auto=format&fit=crop';

            return (
              <div
                key={placeId}
                className={`bg-[#151c2c] border rounded-2xl overflow-hidden transition-all duration-200 flex flex-col justify-between shadow-lg hover:border-indigo-500/40 ${
                  place.isActive ? 'border-[#242f47]' : 'border-red-900/40 opacity-70'
                }`}
              >
                {/* Top Image Preview & Badges */}
                <div className="relative h-44 w-full bg-slate-900 overflow-hidden group">
                  <img
                    src={primaryImg}
                    alt={place.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#151c2c] via-black/20 to-transparent" />

                  {/* City Badge & Category Badge */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-white border border-white/10">
                      {place.city}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-indigo-600/80 backdrop-blur-md text-white">
                      {place.categoryLabel || place.category}
                    </span>
                  </div>

                  {/* Status Indicator */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    {place.isPopular && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500 text-black shadow-md flex items-center gap-1">
                        <Star className="w-3 h-3 fill-black" /> Popular
                      </span>
                    )}
                    <button
                      onClick={() => handleToggleStatus(placeId)}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition ${
                        place.isActive
                          ? 'bg-emerald-500/90 text-white'
                          : 'bg-red-500/90 text-white'
                      }`}
                      title="Click to toggle status"
                    >
                      {place.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </div>

                  {/* Rating & Cost in bottom overlay */}
                  <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-xs text-white">
                    <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-md">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="font-bold">{place.rating || 4.8}</span>
                      <span className="text-gray-400 text-[10px]">({place.reviewsCount || 100})</span>
                    </div>

                    <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-md text-emerald-400 font-bold text-xs">
                      {place.approxCostPerPerson > 0 ? `₹${place.approxCostPerPerson}` : 'Free Entry'}
                    </div>
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white line-clamp-1">
                      {place.title}
                    </h3>
                    {place.foodType && (
                      <span className="inline-block mt-1 text-[11px] text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 font-medium">
                        🍴 {place.foodType}
                      </span>
                    )}
                    <p className="text-xs text-gray-400 line-clamp-2 mt-1.5 leading-relaxed">
                      {place.description || 'No description provided.'}
                    </p>
                  </div>

                  {/* Metadata tags */}
                  <div className="pt-2 border-t border-[#242f47] text-[11px] text-gray-400 space-y-1">
                    <div className="flex items-center gap-1.5 truncate">
                      <Clock className="w-3 h-3 text-indigo-400 shrink-0" />
                      <span className="truncate">{place.openingHours || 'Open daily'} · {place.timeRequiredMinutes || 60} mins</span>
                    </div>
                    {place.location?.address && (
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span className="truncate">{place.location.address}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 border-t border-[#242f47] flex items-center justify-between gap-2">
                    <div className="text-[10px] text-gray-500">
                      Order: #{place.order || 0}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditPlace(place)}
                        className="p-1.5 rounded-lg bg-[#1e293b] hover:bg-[#27354f] text-indigo-400 transition"
                        title="Edit Place"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeletePlace(placeId, place.title)}
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition"
                        title="Delete Place"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* ADD / EDIT PLACE MODAL */}
      {/* ========================================================= */}
      {isPlaceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#151c2c] border border-[#242f47] rounded-2xl w-full max-w-3xl my-8 overflow-hidden shadow-2xl animate-fadeIn text-gray-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#242f47] flex items-center justify-between bg-[#111726]">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-5 h-5 text-indigo-400" />
                <h2 className="text-base font-bold text-white">
                  {editingPlaceId ? 'Edit City Place' : 'Add New City Place'}
                </h2>
              </div>
              <button
                onClick={() => setIsPlaceModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#1e293b]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSavePlace} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* City */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    City Name (lowercase) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="jaipur, goa, manali..."
                    className="w-full px-3 py-2 bg-[#0b0f19] border border-[#242f47] rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Title */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Place Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Amber Palace, Curlies Beach Shack..."
                    className="w-full px-3 py-2 bg-[#0b0f19] border border-[#242f47] rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Category Type */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Primary Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0b0f19] border border-[#242f47] rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    {CATEGORY_OPTIONS.filter((c) => c.value !== 'all').map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category Label */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Category Tag / Subtitle
                  </label>
                  <input
                    type="text"
                    value={formData.categoryLabel}
                    onChange={(e) => setFormData({ ...formData, categoryLabel: e.target.value })}
                    placeholder="e.g. Castle, Rooftop Cafe, Beach Shack"
                    className="w-full px-3 py-2 bg-[#0b0f19] border border-[#242f47] rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Food Type Tag */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Food Type / Cuisine (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.foodType}
                    onChange={(e) => setFormData({ ...formData, foodType: e.target.value })}
                    placeholder="e.g. Street Food, Seafood & Cocktails"
                    className="w-full px-3 py-2 bg-[#0b0f19] border border-[#242f47] rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed description of what makes this place special..."
                  className="w-full px-3 py-2 bg-[#0b0f19] border border-[#242f47] rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Images Array */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-gray-300">
                    Place Images (URLs)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddImageField}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    + Add More Image
                  </button>
                </div>
                {formData.images.map((imgUrl, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="url"
                      value={imgUrl}
                      onChange={(e) => handleUpdateImage(idx, e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="flex-1 px-3 py-2 bg-[#0b0f19] border border-[#242f47] rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                    {formData.images.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Timing, Cost, Rating */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Rating (1-5)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0b0f19] border border-[#242f47] rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Reviews Count
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.reviewsCount}
                    onChange={(e) => setFormData({ ...formData, reviewsCount: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0b0f19] border border-[#242f47] rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Cost Per Person (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.approxCostPerPerson}
                    onChange={(e) => setFormData({ ...formData, approxCostPerPerson: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0b0f19] border border-[#242f47] rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Time Req. (Mins)
                  </label>
                  <input
                    type="number"
                    min="10"
                    value={formData.timeRequiredMinutes}
                    onChange={(e) => setFormData({ ...formData, timeRequiredMinutes: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0b0f19] border border-[#242f47] rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Opening Hours & Insider Tip */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Opening Hours
                  </label>
                  <input
                    type="text"
                    value={formData.openingHours}
                    onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
                    placeholder="e.g. Open daily · 8:00 AM – 5:30 PM"
                    className="w-full px-3 py-2 bg-[#0b0f19] border border-[#242f47] rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Insider / Local Secret Tip
                  </label>
                  <input
                    type="text"
                    value={formData.insiderTip}
                    onChange={(e) => setFormData({ ...formData, insiderTip: e.target.value })}
                    placeholder="e.g. Visit at sunset for golden hour shots..."
                    className="w-full px-3 py-2 bg-[#0b0f19] border border-[#242f47] rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Location Address & Coordinates */}
              <div className="p-4 bg-[#0b0f19] rounded-xl border border-[#242f47] space-y-3">
                <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400" /> Location Details
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Full Address</label>
                    <input
                      type="text"
                      value={formData.location.address}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          location: { ...formData.location, address: e.target.value },
                        })
                      }
                      placeholder="e.g. Devisinghpura, Amer, Jaipur 302001"
                      className="w-full px-3 py-1.5 bg-[#151c2c] border border-[#242f47] rounded-lg text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Google Maps URL</label>
                    <input
                      type="url"
                      value={formData.location.mapUrl}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          location: { ...formData.location, mapUrl: e.target.value },
                        })
                      }
                      placeholder="https://maps.google.com/?q=..."
                      className="w-full px-3 py-1.5 bg-[#151c2c] border border-[#242f47] rounded-lg text-xs text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Latitude</label>
                    <input
                      type="text"
                      value={formData.location?.coordinates?.lat || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          location: {
                            ...formData.location,
                            coordinates: {
                              ...formData.location?.coordinates,
                              lat: e.target.value,
                            },
                          },
                        })
                      }
                      placeholder="e.g. 26.9855"
                      className="w-full px-3 py-1.5 bg-[#151c2c] border border-[#242f47] rounded-lg text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Longitude</label>
                    <input
                      type="text"
                      value={formData.location?.coordinates?.lng || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          location: {
                            ...formData.location,
                            coordinates: {
                              ...formData.location?.coordinates,
                              lng: e.target.value,
                            },
                          },
                        })
                      }
                      placeholder="e.g. 75.8513"
                      className="w-full px-3 py-1.5 bg-[#151c2c] border border-[#242f47] rounded-lg text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                  <input
                    type="checkbox"
                    checked={formData.isPopular}
                    onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 bg-[#0b0f19] border-[#242f47]"
                  />
                  <span>Mark as Popular Spot ⭐</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 bg-[#0b0f19] border-[#242f47]"
                  />
                  <span>Active &amp; Visible to Users</span>
                </label>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-400">Display Order:</span>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                    className="w-16 px-2 py-1 bg-[#0b0f19] border border-[#242f47] rounded-lg text-xs text-white text-center"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-[#242f47] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsPlaceModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#1e293b] hover:bg-[#27354f] text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg disabled:opacity-50"
                >
                  {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingPlaceId ? 'Save Changes' : 'Create Place'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* CITY GUIDE INFO MODAL */}
      {/* ========================================================= */}
      {isGuideModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#151c2c] border border-[#242f47] rounded-2xl w-full max-w-2xl my-8 overflow-hidden shadow-2xl animate-fadeIn text-gray-200">
            <div className="p-5 border-b border-[#242f47] flex items-center justify-between bg-[#111726]">
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-bold text-white">
                  City Guide Metadata: <span className="capitalize text-indigo-400">{guideFormData.city}</span>
                </h2>
              </div>
              <button
                onClick={() => setIsGuideModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#1e293b]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCityGuide} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">City Slug</label>
                  <input
                    type="text"
                    required
                    value={guideFormData.city}
                    onChange={(e) => setGuideFormData({ ...guideFormData, city: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0b0f19] border border-[#242f47] rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Display Name</label>
                  <input
                    type="text"
                    value={guideFormData.displayName}
                    onChange={(e) => setGuideFormData({ ...guideFormData, displayName: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0b0f19] border border-[#242f47] rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Hero Image URL</label>
                <input
                  type="url"
                  value={guideFormData.heroImage}
                  onChange={(e) => setGuideFormData({ ...guideFormData, heroImage: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3 py-2 bg-[#0b0f19] border border-[#242f47] rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Tagline</label>
                <input
                  type="text"
                  value={guideFormData.tagline}
                  onChange={(e) => setGuideFormData({ ...guideFormData, tagline: e.target.value })}
                  placeholder="The Pink City of royalty, grand forts, and savory treats..."
                  className="w-full px-3 py-2 bg-[#0b0f19] border border-[#242f47] rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">About / Overview</label>
                <textarea
                  rows={3}
                  value={guideFormData.about}
                  onChange={(e) => setGuideFormData({ ...guideFormData, about: e.target.value })}
                  placeholder="Brief history, cultural vibe, and landscape..."
                  className="w-full px-3 py-2 bg-[#0b0f19] border border-[#242f47] rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Best Time to Visit</label>
                <input
                  type="text"
                  value={guideFormData.bestTimeToVisit}
                  onChange={(e) => setGuideFormData({ ...guideFormData, bestTimeToVisit: e.target.value })}
                  placeholder="October to March (Pleasant winter weather: 12°C - 25°C)"
                  className="w-full px-3 py-2 bg-[#0b0f19] border border-[#242f47] rounded-xl text-xs text-white"
                />
              </div>

              <div className="pt-4 border-t border-[#242f47] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsGuideModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#1e293b] text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg"
                >
                  {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save City Guide</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CityPlaces;
