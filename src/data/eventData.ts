import { TicketPass, Vendor, ScheduleItem, PepperLevel, FAQItem, Collaborator, Sponsor, EventDetails, GalleryItem, EventItem, AdminUser, EventCategories } from '../types';

export const EVENT_DETAILS: EventDetails = {
  title: 'KOSUA NE MEKO HANGOUT 2.0',
  shortTitle: 'Kosua Ne Meko 2.0',
  tagline: 'Accra’s Premier Street Food & Cultural Festival',
  dateString: 'SAT. 5TH SEPT. 2026',
  targetDateISO: '2026-09-05T10:00:00',
  time: '10:00 AM – 10:00 PM GMT',
  locationName: 'Cencor Venue, North Dzorwulu',
  city: 'Accra, Ghana',
  fullAddress: 'Cencor Venue, North Dzorwulu, Accra',
  organizer: 'Ekow Sam Farms',
  organizerTagline: 'Farm-Fresh Eggs & Sustainable Ghanaian Poultry',
  collaborator: 'Pebble',
  collaboratorUrl: 'https://trypebble.com',
  collaboratorTagline: 'Your Home of Authentic Local Content',
  hashtag: '#KosuaNeMekoHangout2 • #TryPebble',
  mapCoordinates: {
    lat: 5.612,
    lng: -0.198,
  },
  isBookingOpen: true,
};

export const INITIAL_EVENTS_LIST: EventItem[] = [
  {
    id: 'event-2',
    title: 'KOSUA NE MEKO HANGOUT 2.0',
    shortTitle: 'Kosua Ne Meko 2.0',
    tagline: 'Accra’s Premier Street Food & Cultural Festival',
    dateString: 'SAT. 5TH SEPT. 2026',
    targetDateISO: '2026-09-05T10:00:00',
    time: '10:00 AM – 10:00 PM GMT',
    locationName: 'Cencor Venue, North Dzorwulu',
    city: 'Accra, Ghana',
    fullAddress: 'Cencor Venue, North Dzorwulu, Accra',
    organizer: 'Ekow Sam Farms',
    hashtag: '#KosuaNeMekoHangout2',
    status: 'active',
    allowPrebooking: true,
  },
  {
    id: 'event-3',
    title: 'KOSUA NE MEKO HANGOUT 3.0 (DECEMBER EDITION)',
    shortTitle: 'Kosua Ne Meko 3.0',
    tagline: 'Grand End of Year Street Food & Music Extravaganza',
    dateString: 'SAT. 12TH DEC. 2026',
    targetDateISO: '2026-12-12T10:00:00',
    time: '10:00 AM – 11:30 PM GMT',
    locationName: 'Independence Square Lawn',
    city: 'Accra, Ghana',
    fullAddress: 'Independence Square, Osu, Accra',
    organizer: 'Ekow Sam Farms',
    hashtag: '#KosuaNeMeko3',
    status: 'upcoming',
    allowPrebooking: false,
  },
];

/**
 * Admin credentials come from .env (see .env.example), which is gitignored, so
 * they stay out of the repository.
 *
 * NOTE: Vite inlines VITE_* values into the production bundle at build time.
 * This keeps the password out of git — it does NOT hide it from visitors, who
 * can still read it from the shipped JavaScript. Real protection needs
 * server-side auth.
 */
/**
 * Deliberately empty, and deliberately not built from any VITE_ variable.
 *
 * A password the browser can verify is a password the browser must contain, and
 * Vite inlines every VITE_* value into the bundle — so any client-side admin
 * credential is readable by every visitor, hashed or not. Hashing it locally
 * would only obscure a secret that is printed in full a few lines away.
 *
 * The portal therefore authenticates solely through POST /api/admin/login,
 * which checks a PBKDF2 hash held in D1 and never leaves the server.
 *
 * Local development: `npm run dev` does not run Pages Functions, so the portal
 * cannot be signed into there. Use `npm run pages:dev`, which serves the API
 * and the real login alongside the site.
 */
export const INITIAL_ADMIN_USERS: AdminUser[] = [];

/**
 * Starting categories. Admins add to these through the portal, so nothing here
 * is a closed set — code must treat unknown categories as valid.
 */
export const INITIAL_CATEGORIES: EventCategories = {
  vendors: ['eggs-pepper', 'drinks', 'street-food', 'farm-fresh', 'entertainment', 'lifestyle'],
  schedule: ['food', 'competition', 'music', 'community', 'entertainment'],
  gallery: ['food', 'vibes', 'stage', 'community'],
};

export const INITIAL_COLLABORATORS: Collaborator[] = [
  {
    id: 'collab-1',
    name: 'Pebble',
    url: 'https://trypebble.com',
    tagline: 'Your Home of Authentic Local Content & Outdoor Cinema Partner',
    badge: 'Official Media & Cinema Partner',
    logoUrl: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=400&q=80',
  },
  // Industrial Coatings Africa and Hitrace Solutions are Silver sponsors —
  // see INITIAL_SPONSORS below, not here.
];

export const INITIAL_SPONSORS: Sponsor[] = [
  // Ekow Sam Farms is the host and Pebble is the collaborator, not sponsors —
  // both are credited in their own sections. Listing them here overstated the
  // sponsor roster and misrepresented who is backing the event.
  {
    id: 'spon-5',
    name: 'Industrial Coatings Africa',
    tier: 'Silver',
    // Real mark, self-hosted from public/logos rather than a stock photo.
    logoUrl: '/logos/industrial-coatings-africa.png',
    websiteUrl: 'https://industrialcoatingsafrica.com',
  },
  {
    id: 'spon-6',
    name: 'Hitrace Solutions',
    tier: 'Silver',
    logoUrl: '/logos/hitrace-solutions.png',
    websiteUrl: 'https://hitracesolutions.com',
  },
];

export const INITIAL_GALLERY: GalleryItem[] = [
  {
    id: 'gal-1',
    title: 'Fresh Farm Boiled Eggs & Meko',
    imageUrl: 'https://images.unsplash.com/photo-1582169505937-b9992bd01ed9?auto=format&fit=crop&w=800&q=80',
    category: 'food',
    caption: 'Organic farm-fresh eggs served with hand-crushed scotch bonnet salsa.',
  },
  {
    id: 'gal-2',
    title: 'Outdoor Pebble Cinema Lounge',
    imageUrl: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=800&q=80',
    category: 'stage',
    caption: 'Curated African short film screening under the stars at Hangout 1.0.',
  },
  {
    id: 'gal-3',
    title: 'Dzorwulu Street Food Market',
    imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
    category: 'food',
    caption: 'Hot kelewele, fried yam, and grilled tilapia at Auntie Muni stall.',
  },
  {
    id: 'gal-4',
    title: 'Live Afrobeats & Brass Band',
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
    category: 'stage',
    caption: 'Sunset Afrobeats performance and traditional dancers on the main stage.',
  },
  {
    id: 'gal-5',
    title: 'Ludo & Oware Championship',
    imageUrl: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=800&q=80',
    category: 'community',
    caption: 'Competitive board game finals at the games tent.',
  },
  {
    id: 'gal-6',
    title: 'Accra Street Vibes & Crowd',
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
    category: 'vibes',
    caption: 'Foodies and culture lovers enjoying the afternoon atmosphere.',
  },
];

export const TICKET_PASSES: TicketPass[] = [
  {
    id: 'standard-kosua',
    name: 'Standard Kosua Pass',
    priceGHS: 0,
    description: 'Free general entry to Hangout 2.0 — enjoy all stages, live music, cultural activities, and the full Accra street food atmosphere.',
    perks: [
      'Entry to full event area & all stages',
      'Live Afrobeats & DJ Vigos performances',
      'Entry to Ludo & Oware Tournament',
      'Access to Meko Pepper Eating Challenge (sign-up)',
      'Pebble Outdoor Cinema screenings',
    ],
  },
  {
    id: 'vip-meko',
    name: 'VIP Meko Deluxe Pass',
    priceGHS: 0,
    popular: true,
    description: 'Free VIP experience with priority lounge seating, exclusive activity access, and premium event perks.',
    perks: [
      'Fast-track VIP Lounge & Reserved Seating',
      'Priority access to all activities & workshops',
      'Early access to Pepper Challenge ',
      'Best viewing area for live performances',
    ],
  },
  {
    id: 'family-pass',
    name: 'Family Ticket',
    priceGHS: 0,
    // Party size is entered on the form rather than fixed here, so one
    // ticket covers a household of any size.
    description: 'One free ticket for the whole family — tell us how many are coming.',
    perks: [],
  },
];

export const PEPPER_LEVELS: PepperLevel[] = [
  {
    id: 'mild',
    name: 'Green Pepper Gentle Breeze',
    scoville: '1,000 – 5,000 SHU',
    color: '#16a34a',
    emoji: '🟢',
    description: 'Mild green chili with aromatic onions, tomatoes, and local spices. Easy on the tongue, full of fresh flavor.',
    pairings: 'Best enjoyed with soft 5-minute boiled farm eggs and warm bread.',
  },
  {
    id: 'classic',
    name: 'Accra Classic Red Meko',
    scoville: '15,000 – 30,000 SHU',
    color: '#ea580c',
    emoji: '🌶️',
    description: 'The authentic street food staple! Fresh red scotch bonnet, scotch bonnet seeds, ginger, garlic, and coarse sea salt.',
    pairings: 'Pairs effortlessly with hard-boiled eggs, fried plantains, and roasted corn.',
  },
  {
    id: 'fiery',
    name: 'North Dzorwulu Firestorm',
    scoville: '50,000 – 100,000 SHU',
    color: '#dc2626',
    emoji: '🔥',
    description: 'Double shot of roasted habanero and red bird eye peppers crushed fresh in a traditional asanka mortar.',
    pairings: 'For seasoned spicy lovers! Have a cold glass of fresh milk or palm wine ready.',
  },
  {
    id: 'inferno',
    name: 'Ekow Sam Pepper King Challenge',
    scoville: '150,000+ SHU',
    color: '#991b1b',
    emoji: '👑🌶️🔥',
    description: 'Pure adrenaline! Smoked ghost pepper blend infused with crushed black pepper and scotch bonnet essence.',
    pairings: 'Only for the brave! Win a special Pepper King Badge & Hall of Fame photo on stage.',
  },
];

export const SCHEDULE_ITEMS: ScheduleItem[] = [
  {
    time: '10:00 AM - 2:00 PM',
    title: 'Arrival, exhibitor setup, food sales, music and casual interactions',
    description: '',
    location: '',
    category: 'community',
  },
  {
    time: '2:00 PM',
    title: 'Official start and brief welcome',
    description: '',
    location: '',
    category: 'community',
  },
  {
    time: '2:15 PM - 3:30 PM',
    title: 'Free networking, shopping, food and music',
    description: '',
    location: '',
    category: 'food',
  },
  {
    time: '3:30 PM - 5:00 PM',
    title: 'Traditional and modern games',
    description: '',
    location: '',
    category: 'community',
  },
  {
    time: '5:00 PM - 6:00 PM',
    title: 'Kosua ne Meko experience, exhibitor spotlight and giveaways',
    description: '',
    location: '',
    category: 'food',
  },
  {
    time: '6:00 PM - 7:30 PM',
    title: 'More games, networking, food and entertainment',
    description: '',
    location: '',
    category: 'entertainment',
  },
  {
    time: '7:30 PM onwards',
    title: 'Music, dance and free hangout',
    description: 'Featuring the official event DJ, DJ Vigos.',
    location: '',
    category: 'music',
  },
];

export const VENDORS: Vendor[] = [
  {
    id: 'v1',
    name: 'Telonceri Foods',
    group: 'food-drinks',
    category: 'drinks',
    description:
      'Fresh fruit drinks and pastries. Juices include Pineapple & Mint, Coconut Milk, Chocolate, Tropical, Pinebeet, Pineapple Carrot and Pineorange, alongside spring rolls and banana bread.',
    specialty: 'Fruit Drinks, Spring Rolls & Banana Bread',
    imageUrl: '/logos/telonceri-foods.webp',
  },
  {
    id: 'v2',
    name: 'Hitrace Solutions',
    group: 'other',
    category: 'corporate',
    description: 'Telematics and IoT for fleets: GPS vehicle tracking, fuel monitoring and connected-device solutions that put you in control of your operations.',
    specialty: 'Digital & IoT Solutions',
    imageUrl: '/logos/hitrace-telematics.webp',
  },
  {
    id: 'v3',
    name: 'Industrial Coatings Africa',
    group: 'other',
    category: 'corporate',
    description: 'Supplying high-performance industrial maintenance, protective coatings, NoFiren Swamp Rider and coatings to protect infrastructure against severe environmental stressors.',
    specialty: 'Swamp Rider NoFire & Surface Protection',
    imageUrl: '/logos/industrial-oil-gas.webp',
  },
  {
    id: 'v4',
    name: 'We’ve Got It',
    group: 'other',
    category: 'lifestyle',
    description: 'Your go-to spot for beauty and wellness supplements, sports and fitness products, and premium lifestyle items.',
    specialty: 'Sports, Wellness & Fitness Supplements',
    imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'v5',
    name: 'Quench Juices GH',
    group: 'food-drinks',
    category: 'drinks',
    description: 'Refreshing natural fruit juices, smoothies, and healthy blends made from fresh local ingredients.',
    specialty: 'Fresh Natural Juices',
    imageUrl: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'v6',
    name: 'Nellma Foods',
    group: 'food-drinks',
    category: 'farm-fresh',
    description: 'Home of the authentic Kelewele Spice Mix and other premium Ghanaian spice blends.',
    specialty: 'Kelewele Spice Mix',
    imageUrl: '/logos/kelewele-dish.webp',
    badge: 'New Arrival',
  },
  {
    id: 'v7',
    name: 'Farm Fresh Eggs & Kosua ne Meko',
    group: 'food-drinks',
    category: 'eggs-pepper',
    description: 'Organically raised farm eggs served with signature stone-ground meko salsa in traditional clay bowls.',
    specialty: 'Specialty Deviled Kosua & Fresh Pepper Flight',
    imageUrl: '/logos/ekow-sam-eggs.webp',
    badge: 'Festival Favorite',
  },
  {
    id: 'v9',
    name: 'Pebble Entertainment',
    group: 'other',
    category: 'entertainment',
    description: 'Chill in the Pebble lounge with outdoor screenings of authentic African movies, short films, and documentaries — powered by trypebble.com.',
    specialty: 'Outdoor Cinema & Content Premieres',
    imageUrl: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=800&q=80',
    badge: 'Collaboration Partner',
  },
  {
    id: 'v10',
    name: 'Savory Delight',
    group: 'food-drinks',
    category: 'farm-fresh',
    description: 'Freshly smoked catfish and smoked tilapia prepared with unmatched quality, strict hygienic controls, and a unique smoking process that locks in flavour.',
    specialty: 'Smoked Catfish & Tilapia',
    imageUrl: '/logos/savory-delight.webp',
    badge: 'New Vendor',
  },
  {
    id: 'v11',
    name: 'R & M Vibes',
    group: 'food-drinks',
    category: 'street-food',
    description: 'Delicious fried yam, sweet potatoes with a variety of proteins including chicken wings, tsofi, gizzard, sausage, and pork.',
    specialty: 'Fried Yam & Assorted Proteins',
    imageUrl: '/logos/r-and-m-vibes.webp',
    badge: 'New Arrival',
  },
  {
    id: 'v12',
    name: 'The Bite Mogul',
    group: 'food-drinks',
    category: 'street-food',
    description: 'Serving delicious, authentic Jollof Rice.',
    specialty: 'Delicious Jollof Rice',
    imageUrl: '/logos/bite-mogul.webp',
    badge: 'New Arrival',
  },
  {
    id: 'v13',
    name: 'Waakye On The Go',
    group: 'food-drinks',
    category: 'street-food',
    description: 'Serving hot, classic, and authentic Ghanaian Waakye.',
    specialty: 'Classic Waakye',
    imageUrl: '/logos/waakye-on-the-go.webp',
    badge: 'New Arrival',
  },
  {
    id: 'v14',
    name: 'Baysas Ventures',
    group: 'other',
    category: 'lifestyle',
    description: 'Snow cone and woodcrafts',
    specialty: 'Snow Cone & Woodcrafts',
    imageUrl: '/logos/baysas.webp',
    badge: 'New Vendor',
  },
];

export const FAQS: FAQItem[] = [
  {
    question: 'Where exactly is the event located in Dzorwulu?',
    answer: 'The event takes place at {venue}, {city}. Look out for the Ekow Sam Farms banners and the giant Kosua pin near the venue entrance.',
  },
  {
    question: 'Is the event really free?',
    answer: 'Yes! Entry to Kosua Ne Meko Hangout 2.0 is completely FREE. Simply register for your RSVP pass and show up. Food, drinks, and other items are available for purchase from our amazing vendors on-site.',
  },
  {
    question: 'Is parking available at {venue}?',
    answer: 'Yes! Dedicated secure parking is available at {venue} with security personnel. We also recommend Uber / Bolt drop-offs right at the entrance gate.',
  },
  {
    question: 'Can I bring children or families?',
    answer: 'Absolutely! Kosua Ne Meko Hangout 2.0 is a family-friendly cultural celebration with games, bouncy castles, non-spicy egg options for kids, and seating areas.',
  },
  {
    question: 'Do I need to register in advance?',
    answer: 'The event is free, but we strongly recommend registering your RSVP pass online in advance to guarantee your spot — Hangout 1.0 reached full capacity early!',
  },
  {
    question: 'What is Pebble and why are they at the event?',
    answer: 'Pebble (trypebble.com) is an African streaming platform — your home of authentic local content including movies, documentaries, short films, and series. They\'re our official entertainment collaboration partner for Hangout 2.0, bringing an outdoor cinema lounge with curated African film screenings and exclusive content previews!',
  },
];
