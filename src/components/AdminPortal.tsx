import React, { useState } from 'react';
import { HelpCircle, X, Lock, KeyRound, Save, Plus, Trash2, Edit2, RotateCcw, Calendar, MapPin, Building2, Store, Users, Award, Clock, Camera, UserPlus, CheckCircle, Sparkles, Ticket, Download, RefreshCw } from 'lucide-react';
import { EventDetails, Vendor, VendorGroup, ScheduleItem, Collaborator, Sponsor, GalleryItem, EventItem, AdminUser, EventCategories, CategoryKind, FAQItem } from '../types';
import {
  LIMITS,
  sanitizeEmail,
  sanitizePasscode,
  sanitizeEventDetails,
  sanitizeEventItemInput,
  sanitizeEventItem,
  sanitizeAdminUserInput,
  sanitizeVendorInput,
  sanitizeVendor,
  sanitizeScheduleItem,
  sanitizeCollaboratorInput,
  sanitizeCollaborator,
  sanitizeSponsorInput,
  sanitizeSponsor,
  sanitizeGalleryInput,
  sanitizeImageUrl,
  sanitizeFaqItem,
  formatCategoryLabel,
} from '../utils/sanitize';

/** One row of the D1 `rsvps` table, as returned by GET /api/rsvps. */
interface RsvpRow {
  ticket_id: string;
  customer_name: string;
  phone: string;
  email: string;
  pass_name: string;
  quantity: number;
  sms_status: string;
  email_status: string;
  created_at: string;
}

/** Stand-in artwork used when an admin leaves an image field blank. */
const FALLBACK_VENDOR_IMAGE = 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80';
const FALLBACK_LOGO_IMAGE = 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=400&q=80';
const FALLBACK_SPONSOR_LOGO = 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=400&q=80';
const FALLBACK_GALLERY_IMAGE = 'https://images.unsplash.com/photo-1582169505937-b9992bd01ed9?auto=format&fit=crop&w=800&q=80';

interface AdminPortalProps {
  onClose: () => void;
  eventDetails: EventDetails;
  eventsList: EventItem[];
  adminUsers: AdminUser[];
  vendors: Vendor[];
  schedule: ScheduleItem[];
  collaborators: Collaborator[];
  sponsors: Sponsor[];
  gallery: GalleryItem[];
  onUpdateEventDetails: (details: Partial<EventDetails>) => void;
  onAddEventItem: (event: Omit<EventItem, 'id'>) => void;
  onUpdateEventItem: (eventItem: EventItem) => void;
  onSetActiveEvent: (id: string) => void;
  onDeleteEventItem: (id: string) => void;
  onAddAdminUser: (user: Omit<AdminUser, 'id' | 'createdDate'>) => void;
  onDeleteAdminUser: (id: string) => void;
  onAddVendor: (vendor: Omit<Vendor, 'id'>) => void;
  onUpdateVendor: (vendor: Vendor) => void;
  onDeleteVendor: (id: string) => void;
  onAddScheduleItem: (item: ScheduleItem) => void;
  onUpdateScheduleItem: (index: number, item: ScheduleItem) => void;
  onDeleteScheduleItem: (index: number) => void;
  onAddCollaborator: (collaborator: Omit<Collaborator, 'id'>) => void;
  onUpdateCollaborator: (collaborator: Collaborator) => void;
  onDeleteCollaborator: (id: string) => void;
  onAddSponsor: (sponsor: Omit<Sponsor, 'id'>) => void;
  onUpdateSponsor: (sponsor: Sponsor) => void;
  onDeleteSponsor: (id: string) => void;
  onAddGalleryItem: (item: Omit<GalleryItem, 'id'>) => void;
  onDeleteGalleryItem: (id: string) => void;
  faqs: FAQItem[];
  onAddFaq: (faq: FAQItem) => void;
  onUpdateFaq: (index: number, faq: FAQItem) => void;
  onDeleteFaq: (index: number) => void;
  categories: EventCategories;
  onAddCategory: (kind: CategoryKind, label: string) => string | null;
  onDeleteCategory: (kind: CategoryKind, category: string) => void;
  onResetAll: () => void;
}

/**
 * Add/remove control for one category list, reused by the Vendors, Activities
 * and Gallery tabs so the three stay consistent.
 */
const CategoryManager: React.FC<{
  kind: CategoryKind;
  categories: string[];
  onAdd: (kind: CategoryKind, label: string) => string | null;
  onDelete: (kind: CategoryKind, category: string) => void;
  inUse: string[];
}> = ({ kind, categories, onAdd, onDelete, inUse }) => {
  const [draft, setDraft] = useState('');

  const submit = () => {
    const label = draft.trim();
    if (!label) return;
    if (onAdd(kind, label) === null) {
      alert(`"${label}" is either empty or already a category.`);
      return;
    }
    setDraft('');
  };

  return (
    <div className="bg-stone-800/60 p-4 rounded-2xl border border-stone-700 space-y-3">
      <h5 className="text-[11px] font-black uppercase text-stone-300 tracking-wider">
        Categories ({categories.length})
      </h5>

      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          // A category still attached to records cannot be removed without
          // orphaning them, so the button explains itself instead of vanishing.
          const used = inUse.filter((value) => value === category).length;
          return (
            <span
              key={category}
              className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-lg bg-stone-900 border border-stone-700 text-[11px] font-bold text-stone-200"
            >
              {formatCategoryLabel(category)}
              {used > 0 && <span className="text-[9px] text-stone-500">({used})</span>}
              <button
                type="button"
                title={used > 0 ? `${used} item(s) still use this` : 'Remove category'}
                onClick={() => {
                  if (used > 0) {
                    alert(
                      `"${formatCategoryLabel(category)}" is still used by ${used} item(s). ` +
                        'Move them to another category first.',
                    );
                    return;
                  }
                  onDelete(kind, category);
                }}
                className="p-0.5 rounded text-stone-500 hover:text-red-400 hover:bg-red-950/50"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          );
        })}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          maxLength={48}
          placeholder="New category, e.g. Vegan Corner"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            // Enter must not submit the surrounding form.
            if (e.key === 'Enter') {
              e.preventDefault();
              submit();
            }
          }}
          className="flex-1 px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-white"
        />
        <button
          type="button"
          onClick={submit}
          className="px-3 py-2 rounded-xl bg-stone-700 hover:bg-stone-600 text-white text-xs font-black flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
      </div>
    </div>
  );
};

export const AdminPortal: React.FC<AdminPortalProps> = ({
  onClose,
  eventDetails,
  eventsList,
  adminUsers,
  vendors,
  schedule,
  collaborators,
  sponsors,
  gallery,
  onUpdateEventDetails,
  onAddEventItem,
  onUpdateEventItem,
  onSetActiveEvent,
  onDeleteEventItem,
  onAddAdminUser,
  onDeleteAdminUser,
  onAddVendor,
  onUpdateVendor,
  onDeleteVendor,
  onAddScheduleItem,
  onUpdateScheduleItem,
  onDeleteScheduleItem,
  onAddCollaborator,
  onUpdateCollaborator,
  onDeleteCollaborator,
  onAddSponsor,
  onUpdateSponsor,
  onDeleteSponsor,
  onAddGalleryItem,
  onDeleteGalleryItem,
  faqs,
  onAddFaq,
  onUpdateFaq,
  onDeleteFaq,
  categories,
  onAddCategory,
  onDeleteCategory,
  onResetAll,
}) => {
  const [newFaq, setNewFaq] = useState<FAQItem>({ question: '', answer: '' });
  const [editingFaqIndex, setEditingFaqIndex] = useState<number | null>(null);
  const [editingFaq, setEditingFaq] = useState<FAQItem | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [passcode, setPasscode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  /**
   * Server-issued session token. Only present when POST /api/admin/login
   * succeeded — it is what unlocks the RSVP list, since the portal's own
   * password ships in the JS bundle and cannot protect data.
   */
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [rsvps, setRsvps] = useState<RsvpRow[]>([]);
  const [rsvpState, setRsvpState] = useState<'idle' | 'loading' | 'error'>('idle');
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState<'event' | 'eventsList' | 'admins' | 'vendors' | 'partners' | 'schedule' | 'gallery' | 'faqs' | 'rsvps'>('event');

  // Event Form State
  const [formData, setFormData] = useState<EventDetails>(eventDetails);

  // New Event Form State
  const [newEvent, setNewEvent] = useState<Omit<EventItem, 'id'>>({
    title: 'KOSUA NE MEKO HANGOUT 3.0',
    shortTitle: 'Kosua Ne Meko 3.0',
    tagline: 'Ghana’s Biggest Street Food & Music Carnival',
    dateString: 'SAT. 12TH DEC. 2026',
    targetDateISO: '2026-12-12T10:00:00',
    time: '10:00 AM – 11:30 PM GMT',
    locationName: 'Independence Square Lawn',
    city: 'Accra, Ghana',
    fullAddress: 'Independence Square, Osu, Accra',
    organizer: 'Ekow Sam Farms',
    hashtag: '#KosuaNeMeko3',
    status: 'upcoming',
  });

  // New Admin User Form State
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    passcode: '',
    role: 'Event Manager' as AdminUser['role'],
  });

  // New Vendor Form State
  const [newVendor, setNewVendor] = useState({
    name: '',
    group: 'food-drinks' as VendorGroup,
    category: 'street-food' as Vendor['category'],
    description: '',
    specialty: '',
    imageUrl: FALLBACK_VENDOR_IMAGE,
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
    url: '',
    tagline: '',
    badge: 'Official Partner',
    logoUrl: '',
  });

  // New Sponsor Form State
  const [newSponsor, setNewSponsor] = useState({
    name: '',
    tier: 'Gold' as Sponsor['tier'],
    logoUrl: '',
    websiteUrl: '',
  });

  // Editing States
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [editingScheduleIndex, setEditingScheduleIndex] = useState<number | null>(null);
  const [editingScheduleItem, setEditingScheduleItem] = useState<ScheduleItem | null>(null);
  const [editingCollaborator, setEditingCollaborator] = useState<Collaborator | null>(null);
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);

  // New Gallery Photo Form State
  const [newGallery, setNewGallery] = useState({
    title: '',
    imageUrl: FALLBACK_GALLERY_IMAGE,
    category: 'food' as GalleryItem['category'],
    caption: '',
  });

  // Rendered only when the route matches, so there is no open/closed state here.

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // Must use the same normalization the "add admin" form uses, or a credential
    // created with stray whitespace could never be typed back in.
    const cleanEmail = sanitizeEmail(loginEmail);
    const cleanPass = sanitizePasscode(passcode);

    if (!cleanEmail || !cleanPass) {
      setAuthError('Enter your admin email and password.');
      return;
    }

    // Try the server first. When it is configured it is the real authority, and
    // only it can hand back the token needed to read attendee data.
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: cleanPass }),
      });

      if (response.ok) {
        const body = (await response.json()) as { token?: string };
        setSessionToken(body.token ?? null);
        setIsAuthenticated(true);
        setAuthError('');
        setPasscode('');
        setFormData(eventDetails);
        return;
      }

      if (response.status === 401) {
        setAuthError('Incorrect email or password.');
        return;
      }
      if (response.status === 503) {
        setAuthError('Sign-in is not configured on this deployment.');
        return;
      }
      setAuthError('Sign-in failed. Please try again.');
    } catch {
      // Offline, or Functions are not running (plain `npm run dev`).
      setAuthError('Cannot reach the sign-in service. Run `npm run pages:dev` locally.');
    }
  };

  const loadRsvps = async () => {
    if (!sessionToken) return;
    setRsvpState('loading');
    try {
      const response = await fetch('/api/rsvps?limit=200', {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      if (!response.ok) {
        setRsvpState('error');
        return;
      }
      const body = (await response.json()) as { rsvps?: RsvpRow[] };
      setRsvps(body.rsvps ?? []);
      setRsvpState('idle');
    } catch {
      setRsvpState('error');
    }
  };

  /** CSV is fetched with the auth header, then handed to the browser as a blob. */
  const downloadRsvpCsv = async () => {
    if (!sessionToken) return;
    try {
      const response = await fetch('/api/rsvps?format=csv&limit=500', {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      if (!response.ok) return;
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement('a');
      link.href = url;
      link.download = 'kosua-ne-meko-rsvps.csv';
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      /* nothing actionable — the list stays on screen */
    }
  };

  const handleSaveEventDetails = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = sanitizeEventDetails(formData);
    if (!clean.title || !clean.shortTitle || !clean.dateString || !clean.locationName || !clean.city) {
      alert('Title, short title, date, venue and city are all required.');
      return;
    }
    setFormData(clean);
    onUpdateEventDetails(clean);
    alert('Event & Venue details saved successfully!');
  };

  const handleCreateEventItem = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = sanitizeEventItemInput(newEvent);
    if (!clean.title || !clean.dateString) {
      alert('An event needs at least a title and a display date.');
      return;
    }
    onAddEventItem(clean);
    alert(`New event "${clean.shortTitle || clean.title}" created successfully!`);
    setNewEvent({
      title: '',
      shortTitle: '',
      tagline: '',
      dateString: '',
      targetDateISO: new Date().toISOString(),
      time: '10:00 AM – 10:00 PM GMT',
      locationName: 'Accra Event Grounds',
      city: 'Accra, Ghana',
      fullAddress: 'Accra, Ghana',
      organizer: 'Ekow Sam Farms',
      hashtag: '#KosuaNeMeko',
      status: 'upcoming',
    });
  };

  const handleCreateAdminUser = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = sanitizeAdminUserInput(newAdmin);
    if (!clean.name || !clean.passcode) {
      alert('An admin needs a name and a password.');
      return;
    }
    // Email is the login identifier now, so it is no longer optional.
    if (!clean.email) {
      alert('Enter a valid email address — it is the admin login.');
      return;
    }
    if (clean.passcode.length < 8) {
      alert('Passwords must be at least 8 characters.');
      return;
    }
    if (adminUsers.some((u) => sanitizeEmail(u.email) === clean.email)) {
      alert('An admin with that email already exists.');
      return;
    }
    onAddAdminUser(clean);
    alert(`Admin "${clean.name}" added. They sign in with ${clean.email}.`);
    setNewAdmin({
      name: '',
      email: '',
      passcode: '',
      role: 'Event Manager',
    });
  };

  /**
   * The admin list is now the only way in, so the last account must survive —
   * deleting it would lock everyone out of the portal permanently.
   */
  const handleDeleteAdminUser = (user: AdminUser) => {
    if (adminUsers.length <= 1) {
      alert('You cannot remove the only admin account — you would be locked out of the portal.');
      return;
    }
    if (confirm(`Remove admin "${user.name}"? Their passcode will stop working immediately.`)) {
      onDeleteAdminUser(user.id);
    }
  };

  const handleCreateFaq = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = sanitizeFaqItem(newFaq);
    if (!clean.question || !clean.answer) {
      alert('A FAQ needs both a question and an answer.');
      return;
    }
    onAddFaq(clean);
    setNewFaq({ question: '', answer: '' });
  };

  const handleCreateVendor = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = sanitizeVendorInput(newVendor, FALLBACK_VENDOR_IMAGE);
    if (!clean.name || !clean.description) {
      alert('A vendor needs a name and a description.');
      return;
    }
    onAddVendor(clean);
    setNewVendor({
      name: '',
      group: 'food-drinks',
      category: 'street-food',
      description: '',
      specialty: '',
      imageUrl: FALLBACK_VENDOR_IMAGE,
      badge: '',
    });
  };

  const handleCreateScheduleItem = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = sanitizeScheduleItem(newItem);
    if (!clean.title || !clean.time) {
      alert('An activity needs a title and a time.');
      return;
    }
    onAddScheduleItem(clean);
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
    const clean = sanitizeCollaboratorInput(newCollab, FALLBACK_LOGO_IMAGE);
    if (!clean.name) {
      alert('A collaborator needs a name.');
      return;
    }
    if (newCollab.url.trim() && !clean.url) {
      alert('That website link is not a valid http(s) URL.');
      return;
    }
    onAddCollaborator({
      ...clean,
      url: clean.url || 'https://trypebble.com',
      tagline: clean.tagline || 'Official Event Partner',
      badge: clean.badge || 'Official Partner',
    });
    setNewCollab({
      name: '',
      url: '',
      tagline: '',
      badge: 'Official Media Partner',
      logoUrl: '',
    });
  };

  const handleCreateSponsor = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = sanitizeSponsorInput(newSponsor, FALLBACK_SPONSOR_LOGO);
    if (!clean.name) {
      alert('A sponsor needs a name.');
      return;
    }
    if (newSponsor.websiteUrl.trim() && !clean.websiteUrl) {
      alert('That website link is not a valid http(s) URL.');
      return;
    }
    if (newSponsor.logoUrl.trim() && clean.logoUrl === FALLBACK_SPONSOR_LOGO) {
      alert('That logo link is not a valid image URL.');
      return;
    }
    onAddSponsor(clean);
    setNewSponsor({
      name: '',
      tier: 'Gold',
      logoUrl: '',
      websiteUrl: '',
    });
  };

  const handleCreateGallery = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = sanitizeGalleryInput(newGallery, '');
    if (!clean.title) {
      alert('A gallery photo needs a title.');
      return;
    }
    if (!clean.imageUrl) {
      alert('That image link is not a valid http(s) or inline image URL.');
      return;
    }
    onAddGalleryItem(clean);
    setNewGallery({
      title: '',
      imageUrl: FALLBACK_GALLERY_IMAGE,
      category: 'food',
      caption: '',
    });
  };

  return (
    /* A full page, not an overlay: it owns the viewport and scrolls normally. */
    <div className="min-h-screen bg-stone-900 text-white flex flex-col">

      {/* Header — sticky so the tab bar and exit stay reachable on long tabs. */}
      <header className="sticky top-0 z-20 bg-stone-950/95 backdrop-blur border-b border-stone-800">
        {/* Full viewport width — an admin console should use the screen it has.
            The cap only stops line lengths becoming absurd on ultrawide displays. */}
        <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-2xl bg-orange-600 text-white font-black shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-black font-display tracking-tight uppercase truncate">
                EVENT ADMIN PORTAL
              </h1>
              <p className="text-xs text-orange-400 font-semibold truncate">
                Manage Events, Venues, Vendors, Collaborators &amp; Schedule
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-extrabold flex items-center gap-1.5 shrink-0"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Back to site</span>
          </button>
        </div>
      </header>

      <div className="flex-1 w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10 py-8">

        {/* Content Body */}
        {!isAuthenticated ? (
          /* Login Screen */
          /* Centred card, so the form does not float in the middle of a wide page. */
          <form
            onSubmit={handleLogin}
            className="w-full max-w-md mx-auto mt-8 sm:mt-16 p-8 sm:p-10 space-y-6 text-center bg-stone-950/60 border border-stone-800 rounded-3xl shadow-xl"
          >
            <div className="w-16 h-16 rounded-full bg-orange-600/20 border border-orange-500/30 text-orange-400 mx-auto flex items-center justify-center">
              <KeyRound className="w-8 h-8" />
            </div>

            <div>
              <h4 className="text-2xl font-black font-display uppercase">ADMIN LOGIN</h4>
              <p className="text-xs text-stone-400 mt-1">
                Sign in to configure events, vendors, sponsors, and activities.
              </p>
            </div>

            {/*
              No "not configured" banner here on purpose. This screen is public —
              anyone can open /adm — so it must not describe how the deployment is
              wired. It would also be wrong: an empty client-side admin list does
              not mean sign-in is unavailable, because the server checks the
              admin_users table. Misconfiguration is reported to the console
              instead, where the operator will see it and a visitor will not.
            */}

            <div className="space-y-4 text-left">
              <div className="space-y-2">
                <label htmlFor="admin-email" className="text-xs font-bold text-stone-300 block">Email</label>
                <input
                  id="admin-email"
                  type="email"
                  required
                  autoComplete="username"
                  placeholder="you@ekowsamfarms.com"
                  maxLength={LIMITS.email}
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-stone-800 border border-stone-700 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="admin-password" className="text-xs font-bold text-stone-300 block">Password</label>
                <input
                  id="admin-password"
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="Enter your admin password"
                  maxLength={LIMITS.passcode}
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-stone-800 border border-stone-700 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {authError && <p className="text-xs font-bold text-red-400" role="alert">{authError}</p>}
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
          /* No inner scroll container — the page itself scrolls now. */
          <div className="space-y-6">

            {/* Top Navigation Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 pb-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                <button
                  onClick={() => setActiveTab('event')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'event' ? 'bg-orange-600 text-white' : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                    }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>Current Event Details</span>
                </button>

                <button
                  onClick={() => setActiveTab('eventsList')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'eventsList' ? 'bg-orange-600 text-white' : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                    }`}
                >
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>Multi-Event Manager ({eventsList.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('admins')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'admins' ? 'bg-orange-600 text-white' : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                    }`}
                >
                  <UserPlus className="w-4 h-4 text-emerald-400" />
                  <span>Admin Users ({adminUsers.length})</span>
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

                <button
                  onClick={() => setActiveTab('faqs')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'faqs' ? 'bg-orange-600 text-white' : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                    }`}
                >
                  <HelpCircle className="w-4 h-4 text-sky-400" />
                  <span>FAQs ({faqs.length})</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('rsvps');
                    if (sessionToken && rsvps.length === 0) loadRsvps();
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'rsvps' ? 'bg-orange-600 text-white' : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                    }`}
                >
                  <Ticket className="w-4 h-4 text-emerald-400" />
                  <span>RSVPs</span>
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
                      maxLength={LIMITS.title}
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
                      maxLength={LIMITS.title}
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
                      maxLength={LIMITS.description}
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
                      maxLength={60}
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
                      maxLength={LIMITS.isoDate}
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
                      maxLength={60}
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
                      maxLength={LIMITS.shortText}
                      value={formData.locationName}
                      onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                      placeholder="Cencor Venue, North Dzorwulu"
                      className="w-full px-3 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-300 block mb-1">City / Region *</label>
                    <input
                      type="text"
                      required
                      maxLength={LIMITS.shortText}
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
                      maxLength={LIMITS.name}
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
                      maxLength={LIMITS.shortText}
                      value={formData.hashtag}
                      onChange={(e) => setFormData({ ...formData, hashtag: e.target.value })}
                      placeholder="#KosuaNeMekoHangout3"
                      className="w-full px-3 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div className="p-4 bg-stone-800/80 rounded-2xl border border-stone-700 space-y-2">
                  <label className="text-xs font-black text-amber-400 uppercase tracking-wider block">
                    RSVP & PRE-BOOKING STATUS FOR THIS EVENT
                  </label>
                  <select
                    value={formData.isBookingOpen !== false ? 'open' : 'closed'}
                    onChange={(e) => setFormData({ ...formData, isBookingOpen: e.target.value === 'open' })}
                    className="w-full px-3 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-xs font-extrabold text-white"
                  >
                    <option value="open">🟢 PRE-BOOKING OPEN (Visitors can register RSVP & download passes)</option>
                    <option value="closed">🔴 PRE-BOOKING INACTIVE / COMING SOON (Pre-booking disabled / Tickets inactive)</option>
                  </select>
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

            {/* TAB 1.5: Multi-Event Manager & Upcoming Events */}
            {activeTab === 'eventsList' && (
              <div className="space-y-6">
                {/* Form to Create New / Upcoming Event */}
                <form onSubmit={handleCreateEventItem} className="bg-stone-800 p-5 rounded-2xl border border-stone-700 space-y-4">
                  <h4 className="text-xs font-black uppercase text-amber-400 tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span>CREATE NEW EVENT / UPCOMING EDITION</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-stone-300 block mb-1">Full Event Title *</label>
                      <input
                        type="text"
                        required
                        placeholder="KOSUA NE MEKO HANGOUT 3.0"
                        maxLength={LIMITS.title}
                        value={newEvent.title}
                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-xs font-bold text-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-stone-300 block mb-1">Short Title *</label>
                      <input
                        type="text"
                        required
                        placeholder="Kosua Ne Meko 3.0"
                        maxLength={LIMITS.title}
                        value={newEvent.shortTitle}
                        onChange={(e) => setNewEvent({ ...newEvent, shortTitle: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-xs font-bold text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-bold text-stone-300 block mb-1">Date Display String *</label>
                      <input
                        type="text"
                        required
                        placeholder="SAT. 12TH DEC. 2026"
                        maxLength={60}
                        value={newEvent.dateString}
                        onChange={(e) => setNewEvent({ ...newEvent, dateString: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-xs font-bold text-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-stone-300 block mb-1">Target ISO Date (Countdown)</label>
                      <input
                        type="datetime-local"
                        value={newEvent.targetDateISO ? newEvent.targetDateISO.slice(0, 16) : ''}
                        onChange={(e) => setNewEvent({ ...newEvent, targetDateISO: e.target.value ? new Date(e.target.value).toISOString() : newEvent.targetDateISO })}
                        className="w-full px-3 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-stone-300 block mb-1">Event Status</label>
                      <select
                        value={newEvent.status}
                        onChange={(e) => setNewEvent({ ...newEvent, status: e.target.value as EventItem['status'] })}
                        className="w-full px-3 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-xs font-bold text-white"
                      >
                        <option value="upcoming">Upcoming Event</option>
                        <option value="active">Active Current Event</option>
                        <option value="past">Past Edition</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-stone-300 block mb-1">Venue / Location Name</label>
                      <input
                        type="text"
                        placeholder="Independence Square Lawn"
                        maxLength={LIMITS.shortText}
                        value={newEvent.locationName}
                        onChange={(e) => setNewEvent({ ...newEvent, locationName: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-stone-300 block mb-1">Pre-Booking RSVP Status</label>
                      <select
                        value={newEvent.allowPrebooking ? 'yes' : 'no'}
                        onChange={(e) => setNewEvent({ ...newEvent, allowPrebooking: e.target.value === 'yes' })}
                        className="w-full px-3 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-xs font-bold text-white"
                      >
                        <option value="no">🔴 RSVP Disabled / Coming Soon (Inactive)</option>
                        <option value="yes">🟢 RSVP Pre-Booking Open (Ready)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button type="submit" className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs uppercase flex items-center gap-1.5 shadow-md">
                      <Plus className="w-4 h-4" /> Add Event Edition
                    </button>
                  </div>
                </form>

                {/* List All Events */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase text-stone-400 tracking-wider">ALL CREATED EVENTS ({eventsList.length})</h4>
                  <div className="space-y-3">
                    {eventsList.map((ev) => (
                      <div key={ev.id} className="p-4 bg-stone-800 rounded-2xl border border-stone-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-white">{ev.title}</span>
                            {ev.status === 'active' ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase border border-emerald-500/30 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> ACTIVE LIVE EVENT
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-black uppercase border border-amber-500/30">
                                UPCOMING
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-stone-400 font-semibold">{ev.dateString} • {ev.locationName}</p>
                          <div className="flex items-center gap-2 pt-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${ev.allowPrebooking ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-red-950 text-red-300 border border-red-800'}`}>
                              {ev.allowPrebooking ? '🟢 RSVP Open' : '🔴 RSVP Closed / Coming Soon'}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          <button
                            onClick={() => onUpdateEventItem(sanitizeEventItem({ ...ev, allowPrebooking: !ev.allowPrebooking }))}
                            className="px-2.5 py-1.5 rounded-xl bg-stone-700 hover:bg-stone-600 text-white font-bold text-[11px]"
                            title="Toggle RSVP Pre-booking status"
                          >
                            {ev.allowPrebooking ? 'Disable RSVP' : 'Enable RSVP'}
                          </button>

                          {ev.status !== 'active' && (
                            <button
                              onClick={() => onSetActiveEvent(ev.id)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-1 shadow"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Set Active</span>
                            </button>
                          )}
                          <button
                            onClick={() => onDeleteEventItem(ev.id)}
                            className="p-2 rounded-xl bg-red-900/40 hover:bg-red-800 text-red-300"
                            title="Delete Event"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 1.8: Admin Users & Passcodes */}
            {activeTab === 'admins' && (
              <div className="space-y-6">
                {/* Form to Add Admin User */}
                <form onSubmit={handleCreateAdminUser} className="bg-stone-800 p-5 rounded-2xl border border-stone-700 space-y-4">
                  <h4 className="text-xs font-black uppercase text-emerald-400 tracking-wider flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    <span>ADD ANOTHER ADMIN USER / PASSCODE</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-stone-300 block mb-1">Admin Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Kwame Mensah"
                        maxLength={LIMITS.name}
                        value={newAdmin.name}
                        onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-xs font-bold text-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-stone-300 block mb-1">Admin Email * (their login)</label>
                      <input
                        type="email"
                        required
                        placeholder="kwame@ekowsamfarms.com"
                        maxLength={LIMITS.email}
                        value={newAdmin.email}
                        onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-stone-300 block mb-1">Password * (min 8 characters)</label>
                      <input
                        type="text"
                        required
                        placeholder="At least 8 characters"
                        maxLength={LIMITS.passcode}
                        value={newAdmin.passcode}
                        onChange={(e) => setNewAdmin({ ...newAdmin, passcode: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-xs font-mono font-bold text-amber-400"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-stone-300 block mb-1">Admin Role</label>
                      <select
                        value={newAdmin.role}
                        onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value as AdminUser['role'] })}
                        className="w-full px-3 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-xs font-bold text-white"
                      >
                        <option value="Event Manager">Event Manager</option>
                        <option value="Super Admin">Super Admin</option>
                        <option value="Staff">Staff Member</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button type="submit" className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase flex items-center gap-1.5 shadow-md">
                      <UserPlus className="w-4 h-4" /> Add Admin User
                    </button>
                  </div>
                </form>

                {/* List Active Admin Users */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase text-stone-400 tracking-wider">AUTHORIZED ADMIN USERS ({adminUsers.length})</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {adminUsers.map((user) => (
                      <div key={user.id} className="p-4 bg-stone-800 rounded-2xl border border-stone-700 flex items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-white">{user.name}</span>
                            <span className="px-2 py-0.5 rounded-md bg-stone-900 text-emerald-400 text-[9px] font-black uppercase">{user.role}</span>
                          </div>
                          <span className="text-[10px] text-stone-400 block">{user.email}</span>
                          {/*
                            Never render the password, not even behind a toggle.
                            The real credential is the PBKDF2 hash in D1, which
                            this screen has no access to and no reason to show.
                          */}
                          <span className="text-[10px] font-mono text-stone-500 font-bold mt-1 block">
                            Password set — change it in .env or the admin_users table
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteAdminUser(user)}
                          disabled={adminUsers.length <= 1}
                          className="p-2 rounded-xl bg-red-900/40 hover:bg-red-800 text-red-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-red-900/40"
                          title={adminUsers.length <= 1 ? 'Cannot remove the only admin' : 'Remove Admin'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Vendors Management */}
            {activeTab === 'vendors' && (
              <div className="space-y-6">
                {/* Form to Add Vendor */}
                <CategoryManager
                  kind="vendors"
                  categories={categories.vendors}
                  onAdd={onAddCategory}
                  onDelete={onDeleteCategory}
                  inUse={vendors.map((v) => v.category)}
                />
                <form onSubmit={handleCreateVendor} className="bg-stone-800 p-5 rounded-2xl border border-stone-700 space-y-4">
                  <h4 className="text-xs font-black uppercase text-orange-400 tracking-wider">ADD NEW VENDOR STALL</h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-stone-300 block mb-1">Vendor Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Mama Joe Pepper Kitchen"
                        maxLength={LIMITS.name}
                        value={newVendor.name}
                        onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-white"
                      />
                    </div>

                    <div>
                      {/* Not every stall sells food; this drives the split on the public page. */}
                      <label className="text-[11px] font-bold text-stone-300 block mb-1">Stall Type *</label>
                      <select
                        value={newVendor.group}
                        onChange={(e) => setNewVendor({ ...newVendor, group: e.target.value as VendorGroup })}
                        className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-white"
                      >
                        <option value="food-drinks">Food &amp; Drinks</option>
                        <option value="other">Other (does not sell food)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-stone-300 block mb-1">Category</label>
                      <select
                        value={newVendor.category}
                        onChange={(e) => setNewVendor({ ...newVendor, category: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-white"
                      >
                        {categories.vendors.map((c) => (
                          <option key={c} value={c}>{formatCategoryLabel(c)}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-stone-300 block mb-1">Specialty Dish</label>
                      <input
                        type="text"
                        placeholder="Specialty deviled eggs & meko"
                        maxLength={LIMITS.shortText}
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
                        maxLength={LIMITS.shortText}
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
                      maxLength={LIMITS.description}
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
                      <div key={v.id} className="p-3 bg-stone-800 rounded-xl border border-stone-700 space-y-2">
                        {editingVendor?.id === v.id ? (
                          <div className="space-y-2 p-2 bg-stone-900 rounded-lg border border-orange-500/40">
                            <h5 className="text-[11px] font-black uppercase text-orange-400">EDIT VENDOR</h5>
                            <input
                              type="text"
                              maxLength={LIMITS.name}
                              value={editingVendor.name}
                              onChange={(e) => setEditingVendor({ ...editingVendor, name: e.target.value })}
                              className="w-full px-2 py-1 bg-stone-800 border border-stone-700 text-xs text-white rounded font-bold"
                              placeholder="Vendor Name"
                            />
                            <select
                              value={editingVendor.group}
                              onChange={(e) => setEditingVendor({ ...editingVendor, group: e.target.value as VendorGroup })}
                              className="w-full px-2 py-1 bg-stone-800 border border-stone-700 text-xs text-white rounded font-bold"
                            >
                              <option value="food-drinks">Food &amp; Drinks</option>
                              <option value="other">Other (does not sell food)</option>
                            </select>
                            <input
                              type="text"
                              maxLength={LIMITS.shortText}
                              value={editingVendor.specialty}
                              onChange={(e) => setEditingVendor({ ...editingVendor, specialty: e.target.value })}
                              className="w-full px-2 py-1 bg-stone-800 border border-stone-700 text-xs text-amber-400 rounded font-semibold"
                              placeholder="Specialty (e.g. Asanka Meko & Fried Eggs)"
                            />
                            <input
                              type="text"
                              maxLength={LIMITS.description}
                              value={editingVendor.description}
                              onChange={(e) => setEditingVendor({ ...editingVendor, description: e.target.value })}
                              className="w-full px-2 py-1 bg-stone-800 border border-stone-700 text-xs text-white rounded"
                              placeholder="Description"
                            />
                            <div className="flex justify-end gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => setEditingVendor(null)}
                                className="px-2 py-1 rounded bg-stone-700 text-[10px] font-bold text-stone-300"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  onUpdateVendor(sanitizeVendor(editingVendor, FALLBACK_VENDOR_IMAGE));
                                  setEditingVendor(null);
                                }}
                                className="px-3 py-1 rounded bg-orange-600 hover:bg-orange-700 text-[10px] font-black text-white uppercase"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 overflow-hidden">
                              {v.imageUrl && <img src={sanitizeImageUrl(v.imageUrl)} alt={v.name} className="w-9 h-9 rounded-lg object-cover shrink-0" />}
                              <div className="overflow-hidden">
                                <span className="text-xs font-extrabold text-white block truncate">{v.name}</span>
                                <span className="text-[10px] text-amber-400 font-semibold truncate block">{v.specialty}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => setEditingVendor(v)}
                                className="p-1.5 rounded-lg bg-stone-700 hover:bg-stone-600 text-stone-200"
                                title="Edit Vendor"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onDeleteVendor(v.id)}
                                className="p-1.5 rounded-lg bg-red-900/40 hover:bg-red-800 text-red-300"
                                title="Delete Vendor"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
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
                        maxLength={LIMITS.name}
                        value={newCollab.name}
                        onChange={(e) => setNewCollab({ ...newCollab, name: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-stone-300 block mb-1">Website URL</label>
                      <input
                        type="url"
                        maxLength={LIMITS.url}
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
                      maxLength={LIMITS.description}
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
                        maxLength={LIMITS.name}
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
                        maxLength={LIMITS.url}
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
                        maxLength={LIMITS.url}
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
                      <div key={c.id} className="p-3 bg-stone-800 rounded-xl border border-stone-700">
                        {editingCollaborator?.id === c.id ? (
                          <div className="space-y-2 p-2 bg-stone-900 rounded-lg border border-orange-500/40">
                            <h5 className="text-[11px] font-black uppercase text-orange-400">EDIT COLLABORATOR</h5>
                            <input
                              type="text"
                              maxLength={LIMITS.name}
                              value={editingCollaborator.name}
                              onChange={(e) => setEditingCollaborator({ ...editingCollaborator, name: e.target.value })}
                              className="w-full px-2 py-1 bg-stone-800 border border-stone-700 text-xs text-white rounded font-bold"
                              placeholder="Name"
                            />
                            <input
                              type="text"
                              maxLength={LIMITS.description}
                              value={editingCollaborator.tagline}
                              onChange={(e) => setEditingCollaborator({ ...editingCollaborator, tagline: e.target.value })}
                              className="w-full px-2 py-1 bg-stone-800 border border-stone-700 text-xs text-stone-300 rounded"
                              placeholder="Tagline"
                            />
                            <div className="flex justify-end gap-2 pt-1">
                              <button onClick={() => setEditingCollaborator(null)} className="px-2 py-1 bg-stone-700 text-[10px] text-stone-300 rounded">Cancel</button>
                              <button onClick={() => { onUpdateCollaborator(sanitizeCollaborator(editingCollaborator, FALLBACK_LOGO_IMAGE)); setEditingCollaborator(null); }} className="px-3 py-1 bg-orange-600 text-[10px] text-white font-bold rounded">Save</button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              {c.logoUrl && <img src={sanitizeImageUrl(c.logoUrl)} alt={c.name} className="w-8 h-8 rounded-lg object-cover" />}
                              <div>
                                <span className="text-xs font-bold text-white block">{c.name}</span>
                                <span className="text-[10px] text-stone-400">{c.tagline}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button onClick={() => setEditingCollaborator(c)} className="p-1.5 bg-stone-700 hover:bg-stone-600 text-stone-200 rounded" title="Edit">
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => onDeleteCollaborator(c.id)} className="p-1.5 bg-red-900/40 hover:bg-red-800 text-red-300 rounded" title="Delete">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <h5 className="text-xs font-black text-stone-400 uppercase">ACTIVE SPONSORS ({sponsors.length})</h5>
                    {sponsors.map((s) => (
                      <div key={s.id} className="p-3 bg-stone-800 rounded-xl border border-stone-700">
                        {editingSponsor?.id === s.id ? (
                          <div className="space-y-2 p-2 bg-stone-900 rounded-lg border border-amber-500/40">
                            <h5 className="text-[11px] font-black uppercase text-amber-400">EDIT SPONSOR</h5>
                            <input
                              type="text"
                              maxLength={LIMITS.name}
                              value={editingSponsor.name}
                              onChange={(e) => setEditingSponsor({ ...editingSponsor, name: e.target.value })}
                              className="w-full px-2 py-1 bg-stone-800 border border-stone-700 text-xs text-white rounded font-bold"
                              placeholder="Sponsor Name"
                            />
                            <select
                              value={editingSponsor.tier}
                              onChange={(e) => setEditingSponsor({ ...editingSponsor, tier: e.target.value as Sponsor['tier'] })}
                              className="w-full px-2 py-1 bg-stone-800 border border-stone-700 text-xs text-amber-400 font-bold rounded"
                            >
                              <option value="Headline">Headline Sponsor</option>
                              <option value="Gold">Gold Sponsor</option>
                              <option value="Silver">Silver Sponsor</option>
                              <option value="Partner">Official Partner</option>
                            </select>
                            <div className="flex justify-end gap-2 pt-1">
                              <button onClick={() => setEditingSponsor(null)} className="px-2 py-1 bg-stone-700 text-[10px] text-stone-300 rounded">Cancel</button>
                              <button onClick={() => { onUpdateSponsor(sanitizeSponsor(editingSponsor, FALLBACK_SPONSOR_LOGO)); setEditingSponsor(null); }} className="px-3 py-1 bg-amber-600 text-[10px] text-white font-bold rounded">Save</button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              {s.logoUrl && <img src={sanitizeImageUrl(s.logoUrl)} alt={s.name} className="w-8 h-8 rounded-lg object-cover" />}
                              <div>
                                <span className="text-xs font-bold text-white block">{s.name}</span>
                                <span className="text-[10px] text-amber-400 font-extrabold uppercase">{s.tier} Sponsor</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button onClick={() => setEditingSponsor(s)} className="p-1.5 bg-stone-700 hover:bg-stone-600 text-stone-200 rounded" title="Edit">
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => onDeleteSponsor(s.id)} className="p-1.5 bg-red-900/40 hover:bg-red-800 text-red-300 rounded" title="Delete">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
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
                <CategoryManager
                  kind="schedule"
                  categories={categories.schedule}
                  onAdd={onAddCategory}
                  onDelete={onDeleteCategory}
                  inUse={schedule.map((i) => i.category)}
                />
                <form onSubmit={handleCreateScheduleItem} className="bg-stone-800 p-5 rounded-2xl border border-stone-700 space-y-3">
                  <h4 className="text-xs font-black uppercase text-orange-400 tracking-wider">ADD EVENT ACTIVITY</h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-stone-300 block mb-1">Time *</label>
                      <input
                        type="text"
                        required
                        placeholder="11:30 AM"
                        maxLength={40}
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
                        maxLength={LIMITS.title}
                        value={newItem.title}
                        onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-white"
                      />
                    </div>

                    <div>
                      {/* Activities had no category control at all, so every one
                          was silently filed under "food". */}
                      <label className="text-[11px] font-bold text-stone-300 block mb-1">Category</label>
                      <select
                        value={newItem.category}
                        onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-white"
                      >
                        {categories.schedule.map((c) => (
                          <option key={c} value={c}>{formatCategoryLabel(c)}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-stone-300 block mb-1">Location</label>
                      <input
                        type="text"
                        placeholder="Main Stage"
                        maxLength={LIMITS.shortText}
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
                      maxLength={LIMITS.description}
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
                      <div key={idx} className="p-3 bg-stone-800 rounded-xl border border-stone-700">
                        {editingScheduleIndex === idx && editingScheduleItem ? (
                          <div className="space-y-2 p-2 bg-stone-900 rounded-lg border border-orange-500/40">
                            <h5 className="text-[11px] font-black uppercase text-orange-400">EDIT ACTIVITY</h5>
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="text"
                                maxLength={40}
                                value={editingScheduleItem.time}
                                onChange={(e) => setEditingScheduleItem({ ...editingScheduleItem, time: e.target.value })}
                                className="px-2 py-1 bg-stone-800 border border-stone-700 text-xs text-amber-400 font-bold rounded"
                                placeholder="Time"
                              />
                              <input
                                type="text"
                                maxLength={LIMITS.title}
                                value={editingScheduleItem.title}
                                onChange={(e) => setEditingScheduleItem({ ...editingScheduleItem, title: e.target.value })}
                                className="px-2 py-1 bg-stone-800 border border-stone-700 text-xs text-white font-bold rounded"
                                placeholder="Activity Title"
                              />
                            </div>
                            <input
                              type="text"
                              maxLength={LIMITS.description}
                              value={editingScheduleItem.description}
                              onChange={(e) => setEditingScheduleItem({ ...editingScheduleItem, description: e.target.value })}
                              className="w-full px-2 py-1 bg-stone-800 border border-stone-700 text-xs text-stone-300 rounded"
                              placeholder="Description"
                            />
                            <div className="flex justify-end gap-2 pt-1">
                              <button onClick={() => { setEditingScheduleIndex(null); setEditingScheduleItem(null); }} className="px-2 py-1 bg-stone-700 text-[10px] text-stone-300 rounded">Cancel</button>
                              <button onClick={() => { onUpdateScheduleItem(idx, sanitizeScheduleItem(editingScheduleItem)); setEditingScheduleIndex(null); setEditingScheduleItem(null); }} className="px-3 py-1 bg-orange-600 text-[10px] text-white font-bold rounded">Save</button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-xs font-black text-amber-400 mr-2">{item.time}</span>
                              <span className="text-xs font-bold text-white">{item.title}</span>
                              <span className="text-[10px] text-stone-400 block">{item.location} • {item.description}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <button onClick={() => { setEditingScheduleIndex(idx); setEditingScheduleItem(item); }} className="p-1.5 bg-stone-700 hover:bg-stone-600 text-stone-200 rounded" title="Edit">
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => onDeleteScheduleItem(idx)} className="p-1.5 bg-red-900/40 hover:bg-red-800 text-red-300 rounded" title="Delete">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
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
                <CategoryManager
                  kind="gallery"
                  categories={categories.gallery}
                  onAdd={onAddCategory}
                  onDelete={onDeleteCategory}
                  inUse={gallery.map((g) => g.category)}
                />
                <form onSubmit={handleCreateGallery} className="bg-stone-800 p-5 rounded-2xl border border-stone-700 space-y-3">
                  <h4 className="text-xs font-black uppercase text-amber-400 tracking-wider">ADD EVENT GALLERY PHOTO</h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-stone-300 block mb-1">Photo Title *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Asanka Meko Grinding Live"
                        maxLength={LIMITS.title}
                        value={newGallery.title}
                        onChange={(e) => setNewGallery({ ...newGallery, title: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-stone-300 block mb-1">Category</label>
                      <select
                        value={newGallery.category}
                        onChange={(e) => setNewGallery({ ...newGallery, category: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-white"
                      >
                        {categories.gallery.map((c) => (
                          <option key={c} value={c}>{formatCategoryLabel(c)}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-stone-300 block mb-1">Image URL *</label>
                    <input
                      type="url"
                      required
                      placeholder="https://images.unsplash.com/..."
                      maxLength={LIMITS.url}
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
                      maxLength={LIMITS.description}
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
                          <img src={sanitizeImageUrl(g.imageUrl)} alt={g.title} referrerPolicy="no-referrer" className="w-12 h-12 rounded-lg object-cover shrink-0" />
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

            {/* TAB 6: RSVPs from D1 */}
            {activeTab === 'faqs' && (
              <div className="space-y-6">
                <form onSubmit={handleCreateFaq} className="bg-stone-800 p-5 rounded-2xl border border-stone-700 space-y-3">
                  <h4 className="text-xs font-black uppercase text-sky-400 tracking-wider">ADD A FAQ</h4>
                  <div>
                    <label className="text-[11px] font-bold text-stone-300 block mb-1">Question *</label>
                    <input
                      type="text"
                      required
                      maxLength={LIMITS.title}
                      placeholder="e.g. Is there parking at the venue?"
                      value={newFaq.question}
                      onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-stone-300 block mb-1">Answer *</label>
                    <textarea
                      required
                      rows={3}
                      maxLength={LIMITS.description * 2}
                      placeholder="Yes — dedicated secure parking is available."
                      value={newFaq.answer}
                      onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-white"
                    />
                    <p className="text-[10px] text-stone-500 mt-1">
                      Tip: the tokens <span className="font-mono text-sky-300">{'{venue}'}</span>,{' '}
                      <span className="font-mono text-sky-300">{'{city}'}</span> and{' '}
                      <span className="font-mono text-sky-300">{'{date}'}</span> are replaced with the
                      live event details, so answers stay correct when the event moves.
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-black text-xs uppercase flex items-center gap-1">
                      <Plus className="w-4 h-4" /> Add FAQ
                    </button>
                  </div>
                </form>

                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase text-stone-400 tracking-wider">PUBLISHED FAQS ({faqs.length})</h4>
                  {faqs.map((faq, idx) => (
                    <div key={idx} className="p-3 bg-stone-800 rounded-xl border border-stone-700">
                      {editingFaqIndex === idx && editingFaq ? (
                        <div className="space-y-2 p-2 bg-stone-900 rounded-lg border border-sky-500/40">
                          <input
                            type="text"
                            maxLength={LIMITS.title}
                            value={editingFaq.question}
                            onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                            className="w-full px-2 py-1 bg-stone-800 border border-stone-700 text-xs text-white rounded font-bold"
                          />
                          <textarea
                            rows={3}
                            maxLength={LIMITS.description * 2}
                            value={editingFaq.answer}
                            onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                            className="w-full px-2 py-1 bg-stone-800 border border-stone-700 text-xs text-stone-300 rounded"
                          />
                          <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => { setEditingFaqIndex(null); setEditingFaq(null); }} className="px-2 py-1 bg-stone-700 text-[10px] text-stone-300 rounded">Cancel</button>
                            <button
                              type="button"
                              onClick={() => {
                                const clean = sanitizeFaqItem(editingFaq);
                                if (!clean.question || !clean.answer) { alert('A FAQ needs both a question and an answer.'); return; }
                                onUpdateFaq(idx, clean);
                                setEditingFaqIndex(null);
                                setEditingFaq(null);
                              }}
                              className="px-3 py-1 bg-sky-600 text-[10px] text-white font-bold rounded"
                            >Save</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-white block">{faq.question}</span>
                            <span className="text-[11px] text-stone-400 line-clamp-2">{faq.answer}</span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button onClick={() => { setEditingFaqIndex(idx); setEditingFaq(faq); }} className="p-1.5 bg-stone-700 hover:bg-stone-600 text-stone-200 rounded" title="Edit">
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => { if (confirm('Delete this FAQ? ' + faq.question)) onDeleteFaq(idx); }} className="p-1.5 bg-red-900/40 hover:bg-red-800 text-red-300 rounded" title="Delete">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'rsvps' && (
              <div className="space-y-4">
                {!sessionToken ? (
                  <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                    <p className="text-xs font-black uppercase text-amber-400">Signed in locally only</p>
                    <p className="text-[11px] text-stone-300 font-semibold leading-relaxed">
                      Attendee records live on the server and need a server session, which this sign-in did not
                      get — either the deployment has no admin credentials configured, or you are running{' '}
                      <span className="font-mono text-amber-300">npm run dev</span>, which does not run the API.
                      Use <span className="font-mono text-amber-300">npm run pages:dev</span> locally. See the
                      Admin API section of the README for the setup.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h4 className="text-xs font-black uppercase text-stone-400 tracking-wider">
                        ATTENDEE RSVPS ({rsvps.length})
                      </h4>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={loadRsvps}
                          disabled={rsvpState === 'loading'}
                          className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-extrabold flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${rsvpState === 'loading' ? 'animate-spin' : ''}`} />
                          <span>{rsvpState === 'loading' ? 'Loading…' : 'Refresh'}</span>
                        </button>
                        <button
                          onClick={downloadRsvpCsv}
                          className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Export CSV</span>
                        </button>
                      </div>
                    </div>

                    {rsvpState === 'error' && (
                      <p className="text-xs font-bold text-red-400">
                        Could not load RSVPs. Your session may have expired — close the portal and sign in again.
                      </p>
                    )}

                    {rsvpState !== 'error' && rsvps.length === 0 && (
                      <p className="text-xs text-stone-400 font-semibold">
                        No RSVPs recorded yet. They appear here once attendees book on the deployed site.
                      </p>
                    )}

                    {rsvps.length > 0 && (
                      <div className="overflow-x-auto rounded-2xl border border-stone-700">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-stone-800 text-stone-300">
                            <tr>
                              <th className="px-3 py-2 font-black uppercase text-[10px]">Attendee</th>
                              <th className="px-3 py-2 font-black uppercase text-[10px]">Contact</th>
                              <th className="px-3 py-2 font-black uppercase text-[10px]">Pass</th>
                              <th className="px-3 py-2 font-black uppercase text-[10px]">Sent</th>
                              <th className="px-3 py-2 font-black uppercase text-[10px]">Booked</th>
                            </tr>
                          </thead>
                          <tbody>
                            {rsvps.map((row) => (
                              <tr key={row.ticket_id} className="border-t border-stone-800 align-top">
                                <td className="px-3 py-2">
                                  <span className="font-bold text-white block">{row.customer_name}</span>
                                  <span className="font-mono text-[10px] text-amber-400">{row.ticket_id}</span>
                                </td>
                                <td className="px-3 py-2 text-stone-300">
                                  <span className="block">{row.phone}</span>
                                  <span className="block text-[10px] text-stone-400">{row.email}</span>
                                </td>
                                <td className="px-3 py-2 text-stone-300">
                                  {row.pass_name} &times; {row.quantity}
                                </td>
                                <td className="px-3 py-2">
                                  <span className={row.sms_status === 'sent' ? 'text-emerald-400' : 'text-stone-500'}>
                                    SMS
                                  </span>{' '}
                                  <span className={row.email_status === 'sent' ? 'text-emerald-400' : 'text-stone-500'}>
                                    Email
                                  </span>
                                </td>
                                <td className="px-3 py-2 text-stone-400 whitespace-nowrap">{row.created_at}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
