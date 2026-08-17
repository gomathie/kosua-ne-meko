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

export interface Vendor {
  id: string;
  name: string;
  category: 'eggs-pepper' | 'drinks' | 'street-food' | 'farm-fresh' | 'entertainment';
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
  category: 'food' | 'competition' | 'music' | 'community' | 'entertainment';
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
  category: 'food' | 'vibes' | 'stage' | 'community';
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

export interface FullEventData {
  eventDetails: EventDetails;
  eventsList: EventItem[];
  adminUsers: AdminUser[];
  vendors: Vendor[];
  schedule: ScheduleItem[];
  collaborators: Collaborator[];
  sponsors: Sponsor[];
  gallery: GalleryItem[];
  faqs?: FAQItem[];
}




