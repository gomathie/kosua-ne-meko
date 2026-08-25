export interface TicketPass {
  id: string;
  name: string;
  priceGHS: number;
  popular?: boolean;
  description: string;
  perks: string[];
}

export interface UserTicket {
  id: string;
  passId: string;
  passName: string;
  customerName: string;
  email: string;
  phone: string;
  quantity: number;
  totalGHS: number;
  mekoLevel: string;
  purchaseDate: string;
  qrCodeUrl: string;
}

/** Top-level split on the stalls listing. Not every stall sells food. */
export type VendorGroup = 'food-drinks' | 'other';

export interface Vendor {
  id: string;
  name: string;
  group: VendorGroup;
  /** Category slug. Free-form so admins can add their own — see EventCategories. */
  category: string;
  description: string;
  specialty: string;
  imageUrl: string;
  badge?: string;
}

export interface ScheduleItem {
  time: string;
  title: string;
  description: string;
  location: string;
  category: string;
}

export interface PepperLevel {
  id: string;
  name: string;
  scoville: string;
  color: string;
  description: string;
  pairings: string;
  emoji: string;
}

export interface Sponsor {
  id: string;
  name: string;
  tier: 'Headline' | 'Gold' | 'Silver' | 'Partner';
  logoUrl: string;
  websiteUrl?: string;
}

export interface Collaborator {
  id: string;
  name: string;
  url: string;
  tagline: string;
  badge?: string;
  logoUrl?: string;
}

export interface EventDetails {
  title: string;
  shortTitle: string;
  tagline: string;
  dateString: string;
  targetDateISO: string;
  time: string;
  locationName: string;
  city: string;
  fullAddress: string;
  organizer: string;
  organizerTagline: string;
  collaborator: string;
  collaboratorUrl: string;
  collaboratorTagline: string;
  hashtag: string;
  mapCoordinates: {
    lat: number;
    lng: number;
  };
  isBookingOpen?: boolean;
}

export interface GalleryItem {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
  caption?: string;
}

export interface EventItem {
  id: string;
  title: string;
  shortTitle: string;
  tagline: string;
  dateString: string;
  targetDateISO: string;
  time: string;
  locationName: string;
  city: string;
  fullAddress: string;
  organizer: string;
  hashtag: string;
  status: 'active' | 'upcoming' | 'past';
  allowPrebooking?: boolean;
}

export interface AdminUser {
  id: string;
  name: string;
  /** Login identifier — required, since sign-in is email + password. */
  email: string;
  /** The account password. Stored in plain text; see README security note. */
  passcode: string;
  role: 'Super Admin' | 'Event Manager' | 'Staff';
  createdDate: string;
}

export interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}

/**
 * Admin-managed category lists. Stored as slugs (`street-food`) and rendered as
 * titles (`Street Food`), so new ones need no code change.
 */
export interface EventCategories {
  vendors: string[];
  schedule: string[];
  gallery: string[];
}

/** The three things categories can be attached to. */
export type CategoryKind = keyof EventCategories;

export interface FullEventData {
  /**
   * Seed entries this browser has already been shown. Anything in the seed
   * but absent here is genuinely new and gets merged in; anything listed here
   * but missing from the lists was deleted on purpose and stays deleted.
   */
  knownSeedKeys?: string[];
  categories: EventCategories;
  faqs: FAQItem[];
  eventDetails: EventDetails;
  eventsList: EventItem[];
  adminUsers: AdminUser[];
  vendors: Vendor[];
  schedule: ScheduleItem[];
  collaborators: Collaborator[];
  sponsors: Sponsor[];
  gallery: GalleryItem[];
}




