import React, { useState } from 'react';
import { X, Lock, KeyRound, Save, Plus, Trash2, Edit2, RotateCcw, Calendar, MapPin, Building2, Store, Users, Award, Clock, Camera } from 'lucide-react';
import { EventDetails, Vendor, ScheduleItem, Collaborator, Sponsor, GalleryItem } from '../types';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventDetails: EventDetails;
  vendors: Vendor[];
  schedule: ScheduleItem[];
  collaborators: Collaborator[];
  sponsors: Sponsor[];
  gallery: GalleryItem[];
  onUpdateEventDetails: (details: Partial<EventDetails>) => void;
  onAddVendor: (vendor: Omit<Vendor, 'id'>) => void;
  onDeleteVendor: (id: string) => void;
  onAddScheduleItem: (item: ScheduleItem) => void;
  onDeleteScheduleItem: (index: number) => void;
  onAddCollaborator: (collaborator: Omit<Collaborator, 'id'>) => void;
  onDeleteCollaborator: (id: string) => void;
  onAddSponsor: (sponsor: Omit<Sponsor, 'id'>) => void;
  onDeleteSponsor: (id: string) => void;
  onAddGalleryItem: (item: Omit<GalleryItem, 'id'>) => void;
  onDeleteGalleryItem: (id: string) => void;
  onResetAll: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  eventDetails,
  vendors,
  schedule,
  collaborators,
  gallery,
  onUpdateEventDetails,
  onAddVendor,
  onDeleteVendor,
  onAddScheduleItem,
  onDeleteScheduleItem,
  onAddCollaborator,
  onDeleteCollaborator,
  onAddSponsor,
  onDeleteSponsor,
  onAddGalleryItem,
  onDeleteGalleryItem,
  onResetAll,
}) => {
  const [passcode, setPasscode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState<'event' | 'vendors' | 'partners' | 'schedule' | 'gallery'>('event');

  // Event Form State
  const [formData, setFormData] = useState<EventDetails>(eventDetails);

  // New Vendor Form State
  const [newVendor, setNewVendor] = useState({
    name: '',
    category: 'street-food' as Vendor['category'],
    description: '',
    specialty: '',
    imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
    badge: '',
  });

  // New Schedule Form State
  const [newItem, setNewItem] = useState<ScheduleItem>({
    time: '12:00 PM',
    title: '',
    description: '',
    location: 'Main Stage',
    category: 'food',
  });

  // New Collaborator Form State
  const [newCollab, setNewCollab] = useState({
    name: '',
    url: 'https://',
    tagline: '',
    badge: 'Official Media Partner',
    logoUrl: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=400&q=80',
  });

  // New Sponsor Form State
  const [newSponsor, setNewSponsor] = useState({
    name: '',
    tier: 'Gold' as Sponsor['tier'],
    logoUrl: '',
    websiteUrl: '',
  });

  // New Gallery Photo Form State
  const [newGallery, setNewGallery] = useState({
    title: '',
    imageUrl: 'https://images.unsplash.com/photo-1582169505937-b9992bd01ed9?auto=format&fit=crop&w=800&q=80',
    category: 'food' as GalleryItem['category'],
    caption: '',
  });

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === 'admin123' || passcode === 'admin') {
      setIsAuthenticated(true);
      setAuthError('');
      setFormData(eventDetails);
    } else {
      setAuthError('Incorrect passcode. Please try "admin123"');
    }
  };

  const handleSaveEventDetails = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateEventDetails(formData);
    alert('Event & Venue details saved successfully!');
  };

  const handleCreateVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVendor.name || !newVendor.description) return;
    onAddVendor(newVendor);
    setNewVendor({
      name: '',
      category: 'street-food',
      description: '',
      specialty: '',
      imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
      badge: '',
    });
  };

  const handleCreateScheduleItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.title || !newItem.time) return;
    onAddScheduleItem(newItem);
    setNewItem({
      time: '12:00 PM',
      title: '',
      description: '',
      location: 'Main Stage',
      category: 'food',
    });
  };

  const handleCreateCollaborator = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollab.name) return;
    onAddCollaborator(newCollab);
    setNewCollab({
      name: '',
      url: 'https://',
      tagline: '',
      badge: 'Official Media Partner',
      logoUrl: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=400&q=80',
    });
  };

  const handleCreateSponsor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSponsor.name.trim()) return;
    onAddSponsor({
      name: newSponsor.name.trim(),
      tier: newSponsor.tier,
      logoUrl: newSponsor.logoUrl.trim() || 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=400&q=80',
      websiteUrl: newSponsor.websiteUrl.trim() || undefined,
    });
    setNewSponsor({
      name: '',
      tier: 'Gold',
      logoUrl: '',
      websiteUrl: '',
    });
  };

  const handleCreateGallery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGallery.title || !newGallery.imageUrl) return;
    onAddGalleryItem(newGallery);
    setNewGallery({
      title: '',
      imageUrl: 'https://images.unsplash.com/photo-1582169505937-b9992bd01ed9?auto=format&fit=crop&w=800&q=80',
      category: 'food',
      caption: '',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-stone-900 text-white rounded-3xl shadow-2xl border border-stone-800 overflow-hidden my-8">

        {/* Header */}
        <div className="bg-stone-950 p-6 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-orange-600 text-white font-black">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black font-display tracking-tight uppercase">
                EVENT ADMIN PORTAL
              </h3>
              <p className="text-xs text-orange-400 font-semibold">
                Manage Events, Venues, Vendors, Collaborators & Schedule
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {!isAuthenticated ? (
          /* Login Screen */
          <form onSubmit={handleLogin} className="p-8 sm:p-12 max-w-md mx-auto space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-orange-600/20 border border-orange-500/30 text-orange-400 mx-auto flex items-center justify-center">
              <KeyRound className="w-8 h-8" />
            </div>

            <div>
              <h4 className="text-2xl font-black font-display uppercase">ADMIN LOGIN</h4>
              <p className="text-xs text-stone-400 mt-1">
                Enter admin passcode to configure event 3.0, vendors, sponsors, and activities.
              </p>
            </div>

            <div className="space-y-2 text-left">
              <label className="text-xs font-bold text-stone-300 block">Passcode</label>
              <input
                type="password"
                required
                placeholder="Enter passcode (example: abenkwan123)"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-stone-800 border border-stone-700 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              {authError && <p className="text-xs font-bold text-red-400 mt-1">{authError}</p>}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black text-sm shadow-lg shadow-orange-600/30 transition-all"
            >
              LOG IN TO PORTAL
            </button>
          </form>
        ) : (
          /* Admin Dashboard */
          <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">

            {/* Top Navigation Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 pb-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                <button
                  onClick={() => setActiveTab('event')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'event' ? 'bg-orange-600 text-white' : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                    }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>Event & Venue</span>
                </button>

                <button
                  onClick={() => setActiveTab('vendors')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'vendors' ? 'bg-orange-600 text-white' : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                    }`}
                >
                  <Store className="w-4 h-4" />
                  <span>Vendors ({vendors.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('partners')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'partners' ? 'bg-orange-600 text-white' : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                    }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Sponsors ({collaborators.length + sponsors.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('schedule')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'schedule' ? 'bg-orange-600 text-white' : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                    }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>Activities ({schedule.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('gallery')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'gallery' ? 'bg-orange-600 text-white' : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                    }`}
                >
                  <Camera className="w-4 h-4" />
                  <span>Gallery Photos ({gallery.length})</span>
                </button>
              </div>

              <button
                onClick={() => {
                  if (confirm('Reset all event data to original defaults?')) {
                    onResetAll();
                    setFormData(eventDetails);
                  }
                }}
                className="px-3 py-2 rounded-xl bg-red-900/40 text-red-300 hover:bg-red-800/50 border border-red-700/50 text-xs font-extrabold flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Defaults</span>
              </button>
            </div>

            {/* TAB 1: Event & Venue Details */}
            {activeTab === 'event' && (
              <form onSubmit={handleSaveEventDetails} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-stone-300 block mb-1">Event Title *</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. KOSUA NE MEKO HANGOUT 3.0"
                      className="w-full px-3 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-300 block mb-1">Short Title / Edition *</label>
                    <input
                      type="text"
                      required
                      value={formData.shortTitle}
                      onChange={(e) => setFormData({ ...formData, shortTitle: e.target.value })}
                      placeholder="e.g. Kosua Ne Meko 3.0"
                      className="w-full px-3 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-300 block mb-1">Event Tagline</label>
                    <input
                      type="text"
                      value={formData.tagline}
                      onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                      placeholder="Accra’s Premier Street Food Festival"
                      className="w-full px-3 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-300 block mb-1">Event Date Display *</label>
                    <input
                      type="text"
                      required
                      value={formData.dateString}
                      onChange={(e) => setFormData({ ...formData, dateString: e.target.value })}
                      placeholder="SAT. 12TH DEC. 2026"
                      className="w-full px-3 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-300 block mb-1">Target Date ISO (for Countdown)</label>
                    <input
                      type="text"
                      value={formData.targetDateISO}
                      onChange={(e) => setFormData({ ...formData, targetDateISO: e.target.value })}
                      placeholder="2026-12-12T10:00:00"
                      className="w-full px-3 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-300 block mb-1">Event Time</label>
                    <input
                      type="text"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      placeholder="10:00 AM – 10:00 PM GMT"
                      className="w-full px-3 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-300 block mb-1">Venue / Location Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.locationName}
                      onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                      placeholder="Cencor Avenue, North Dzorwulu"
                      className="w-full px-3 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-300 block mb-1">City / Region *</label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Accra, Ghana"
                      className="w-full px-3 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-stone-300 block mb-1">Organizer Name</label>
                    <input
                      type="text"
                      value={formData.organizer}
                      onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                      placeholder="Ekow Sam Farms"
                      className="w-full px-3 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-300 block mb-1">Event Hashtag</label>
                    <input
                      type="text"
                      value={formData.hashtag}
                      onChange={(e) => setFormData({ ...formData, hashtag: e.target.value })}
                      placeholder="#KosuaNeMekoHangout3"
                      className="w-full px-3 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black text-xs uppercase flex items-center gap-2 shadow-lg shadow-orange-600/30"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Event & Venue Details</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: Vendors Management */}
            {activeTab === 'vendors' && (
              <div className="space-y-6">
                {/* Form to Add Vendor */}
                <form onSubmit={handleCreateVendor} className="bg-stone-800 p-5 rounded-2xl border border-stone-700 space-y-4">
                  <h4 className="text-xs font-black uppercase text-orange-400 tracking-wider">ADD NEW VENDOR STALL</h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-stone-300 block mb-1">Vendor Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Mama Joe Pepper Kitchen"
                        value={newVendor.name}
                        onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-stone-300 block mb-1">Category</label>
                      <select
                        value={newVendor.category}
                        onChange={(e) => setNewVendor({ ...newVendor, category: e.target.value as Vendor['category'] })}
                        className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-white"
                      >
                        <option value="eggs-pepper">Eggs & Pepper</option>
                        <option value="street-food">Street Eats</option>
                        <option value="drinks">Drinks & Palm Wine</option>
                        <option value="farm-fresh">Farm Fresh</option>
                        <option value="entertainment">Entertainment</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-stone-300 block mb-1">Specialty Dish</label>
                      <input
                        type="text"
                        placeholder="Specialty deviled eggs & meko"
                        value={newVendor.specialty}
                        onChange={(e) => setNewVendor({ ...newVendor, specialty: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-stone-300 block mb-1">Badge (Optional)</label>
                      <input
                        type="text"
                        placeholder="Official Host / Local Legend"
                        value={newVendor.badge}
                        onChange={(e) => setNewVendor({ ...newVendor, badge: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-stone-300 block mb-1">Description *</label>
                    <input
                      type="text"
                      required
                      placeholder="Organically raised farm eggs served with signature salsa..."
                      value={newVendor.description}
                      onChange={(e) => setNewVendor({ ...newVendor, description: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-white"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black text-xs uppercase flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Vendor Stall</span>
                    </button>
                  </div>
                </form>

                {/* List of Vendors */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase text-stone-400 tracking-wider">ACTIVE VENDORS ({vendors.length})</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {vendors.map((v) => (
                      <div key={v.id} className="p-3 bg-stone-800 rounded-xl border border-stone-700 flex items-center justify-between gap-3">
                        <div>
                          <span className="text-xs font-extrabold text-white block">{v.name}</span>
                          <span className="text-[10px] text-amber-400 font-semibold">{v.specialty}</span>
                        </div>
                        <button
                          onClick={() => onDeleteVendor(v.id)}
                          className="p-2 rounded-lg bg-red-900/40 hover:bg-red-800 text-red-300 transition-colors"
                          title="Delete Vendor"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Collaborators & Sponsors */}
            {activeTab === 'partners' && (
              <div className="space-y-6">
                {/* Form: Add Collaborator */}
                <form onSubmit={handleCreateCollaborator} className="bg-stone-800 p-5 rounded-2xl border border-stone-700 space-y-3">
                  <h4 className="text-xs font-black uppercase text-orange-400 tracking-wider">ADD COLLABORATOR (e.g. PEBBLE)</h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-stone-300 block mb-1">Collaborator Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Pebble"
                        value={newCollab.name}
                        onChange={(e) => setNewCollab({ ...newCollab, name: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-stone-300 block mb-1">Website URL</label>
                      <input
                        type="url"
                        value={newCollab.url}
                        onChange={(e) => setNewCollab({ ...newCollab, url: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-stone-300 block mb-1">Tagline</label>
                    <input
                      type="text"
                      placeholder="Your Home of Authentic Local Content"
                      value={newCollab.tagline}
                      onChange={(e) => setNewCollab({ ...newCollab, tagline: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-white"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button type="submit" className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black text-xs uppercase flex items-center gap-1">
                      <Plus className="w-4 h-4" /> Add Collaborator
                    </button>
                  </div>
                </form>

                {/* Form: Add Sponsor */}
                <form onSubmit={handleCreateSponsor} className="bg-stone-800 p-5 rounded-2xl border border-stone-700 space-y-3">
                  <h4 className="text-xs font-black uppercase text-amber-400 tracking-wider">ADD EVENT SPONSOR</h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-stone-300 block mb-1">Sponsor Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Industrial Coatings Africa"
                        value={newSponsor.name}
                        onChange={(e) => setNewSponsor({ ...newSponsor, name: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-stone-300 block mb-1">Sponsorship Tier *</label>
                      <select
                        value={newSponsor.tier}
                        onChange={(e) => setNewSponsor({ ...newSponsor, tier: e.target.value as Sponsor['tier'] })}
                        className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-white font-bold"
                      >
                        <option value="Headline">Headline Sponsor</option>
                        <option value="Gold">Gold Sponsor</option>
                        <option value="Silver">Silver Sponsor</option>
                        <option value="Partner">Official Partner</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-stone-300 block mb-1">Logo URL (Optional)</label>
                      <input
                        type="url"
                        placeholder="https://..."
                        value={newSponsor.logoUrl}
                        onChange={(e) => setNewSponsor({ ...newSponsor, logoUrl: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-stone-300 block mb-1">Website URL (Optional)</label>
                      <input
                        type="url"
                        placeholder="https://..."
                        value={newSponsor.websiteUrl}
                        onChange={(e) => setNewSponsor({ ...newSponsor, websiteUrl: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button type="submit" className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs uppercase flex items-center gap-1.5 shadow-md">
                      <Plus className="w-4 h-4" /> Add Sponsor
                    </button>
                  </div>
                </form>

                {/* List Collaborators & Sponsors */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h5 className="text-xs font-black text-stone-400 uppercase">COLLABORATORS ({collaborators.length})</h5>
                    {collaborators.map((c) => (
                      <div key={c.id} className="p-3 bg-stone-800 rounded-xl border border-stone-700 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          {c.logoUrl && <img src={c.logoUrl} alt={c.name} className="w-8 h-8 rounded-lg object-cover" />}
                          <div>
                            <span className="text-xs font-bold text-white block">{c.name}</span>
                            <span className="text-[10px] text-stone-400">{c.tagline}</span>
                          </div>
                        </div>
                        <button onClick={() => onDeleteCollaborator(c.id)} className="p-1.5 bg-red-900/40 hover:bg-red-800 text-red-300 rounded">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <h5 className="text-xs font-black text-stone-400 uppercase">ACTIVE SPONSORS ({sponsors.length})</h5>
                    {sponsors.map((s) => (
                      <div key={s.id} className="p-3 bg-stone-800 rounded-xl border border-stone-700 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          {s.logoUrl && <img src={s.logoUrl} alt={s.name} className="w-8 h-8 rounded-lg object-cover" />}
                          <div>
                            <span className="text-xs font-bold text-white block">{s.name}</span>
                            <span className="text-[10px] text-amber-400 font-extrabold uppercase">{s.tier} Sponsor</span>
                          </div>
                        </div>
                        <button onClick={() => onDeleteSponsor(s.id)} className="p-1.5 bg-red-900/40 hover:bg-red-800 text-red-300 rounded">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: Day Activities / Schedule */}
            {activeTab === 'schedule' && (
              <div className="space-y-6">
                {/* Form to Add Schedule Activity */}
                <form onSubmit={handleCreateScheduleItem} className="bg-stone-800 p-5 rounded-2xl border border-stone-700 space-y-3">
                  <h4 className="text-xs font-black uppercase text-orange-400 tracking-wider">ADD EVENT ACTIVITY</h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-stone-300 block mb-1">Time *</label>
                      <input
                        type="text"
                        required
                        placeholder="11:30 AM"
                        value={newItem.time}
                        onChange={(e) => setNewItem({ ...newItem, time: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-stone-300 block mb-1">Title *</label>
                      <input
                        type="text"
                        required
                        placeholder="Asanka Grinding Workshop"
                        value={newItem.title}
                        onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-stone-300 block mb-1">Location</label>
                      <input
                        type="text"
                        placeholder="Main Stage"
                        value={newItem.location}
                        onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-stone-300 block mb-1">Description</label>
                    <input
                      type="text"
                      placeholder="Learn traditional Ghanaian pepper grinding techniques..."
                      value={newItem.description}
                      onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-white"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button type="submit" className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black text-xs uppercase flex items-center gap-1">
                      <Plus className="w-4 h-4" /> Add Activity
                    </button>
                  </div>
                </form>

                {/* List Schedule */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase text-stone-400 tracking-wider">DAY TIMELINE ACTIVITIES ({schedule.length})</h4>
                  <div className="space-y-2">
                    {schedule.map((item, idx) => (
                      <div key={idx} className="p-3 bg-stone-800 rounded-xl border border-stone-700 flex items-center justify-between">
                        <div>
                          <span className="text-xs font-black text-amber-400 mr-2">{item.time}</span>
                          <span className="text-xs font-bold text-white">{item.title}</span>
                          <span className="text-[10px] text-stone-400 block">{item.location} • {item.description}</span>
                        </div>
                        <button onClick={() => onDeleteScheduleItem(idx)} className="p-1.5 bg-red-900/40 hover:bg-red-800 text-red-300 rounded">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: Gallery & Photos */}
            {activeTab === 'gallery' && (
              <div className="space-y-6">
                {/* Form to Add Gallery Photo */}
                <form onSubmit={handleCreateGallery} className="bg-stone-800 p-5 rounded-2xl border border-stone-700 space-y-3">
                  <h4 className="text-xs font-black uppercase text-amber-400 tracking-wider">ADD EVENT GALLERY PHOTO</h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-stone-300 block mb-1">Photo Title *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Asanka Meko Grinding Live"
                        value={newGallery.title}
                        onChange={(e) => setNewGallery({ ...newGallery, title: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-stone-300 block mb-1">Category</label>
                      <select
                        value={newGallery.category}
                        onChange={(e) => setNewGallery({ ...newGallery, category: e.target.value as GalleryItem['category'] })}
                        className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-white"
                      >
                        <option value="food">Kosua & Meko</option>
                        <option value="vibes">Crowd & Vibes</option>
                        <option value="stage">Stage & Cinema</option>
                        <option value="community">Games & Tournaments</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-stone-300 block mb-1">Image URL *</label>
                    <input
                      type="url"
                      required
                      placeholder="https://images.unsplash.com/..."
                      value={newGallery.imageUrl}
                      onChange={(e) => setNewGallery({ ...newGallery, imageUrl: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-stone-300 block mb-1">Caption / Description</label>
                    <input
                      type="text"
                      placeholder="Moments from the live street food market..."
                      value={newGallery.caption}
                      onChange={(e) => setNewGallery({ ...newGallery, caption: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-white"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button type="submit" className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black text-xs uppercase flex items-center gap-1">
                      <Plus className="w-4 h-4" /> Add Photo to Gallery
                    </button>
                  </div>
                </form>

                {/* List Gallery Photos */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase text-stone-400 tracking-wider">GALLERY PHOTOS ({gallery.length})</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {gallery.map((g) => (
                      <div key={g.id} className="bg-stone-800 rounded-xl overflow-hidden border border-stone-700 p-2 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <img src={g.imageUrl} alt={g.title} referrerPolicy="no-referrer" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                          <div className="overflow-hidden">
                            <span className="text-xs font-bold text-white block truncate">{g.title}</span>
                            <span className="text-[9px] font-black uppercase text-orange-400">{g.category}</span>
                          </div>
                        </div>
                        <button onClick={() => onDeleteGalleryItem(g.id)} className="p-2 bg-red-900/40 hover:bg-red-800 text-red-300 rounded-lg shrink-0">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
