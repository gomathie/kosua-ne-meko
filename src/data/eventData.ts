import { TicketPass, Vendor, ScheduleItem, PepperLevel, FAQItem } from '../types';

export const EVENT_DETAILS = {
  title: 'KOSUA NE MEKO HANGOUT 2.0',
  shortTitle: 'Kosua Ne Meko 2.0',
  tagline: 'Accra’s Premier Street Food & Cultural Festival',
  dateString: 'SAT. 5TH SEPT. 2026',
  targetDateISO: '2026-09-05T10:00:00',
  time: '10:00 AM – 10:00 PM GMT',
  locationName: 'Cencor Avenue, North Dzorwulu',
  city: 'Accra, Ghana',
  fullAddress: 'Cencor Avenue, North Dzorwulu, Accra',
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
};

export const TICKET_PASSES: TicketPass[] = [
  {
    id: 'standard-kosua',
    name: 'Standard Kosua Pass',
    priceGHS: 50,
    description: 'General entry pass to Hangout 2.0 with complimentary boiled eggs & fresh meko sampler.',
    perks: [
      'Entry to full event area',
      '2x Fresh Ekow Sam Farm Boiled Eggs',
      'Access to Fresh Meko Pepper Station',
      'Entry to Ludo & Oware Tournament',
      'Live Music & DJ performances',
    ],
  },
  {
    id: 'vip-meko',
    name: 'VIP Meko Deluxe Pass',
    priceGHS: 120,
    popular: true,
    description: 'Ultimate pepper lover pass with VIP lounge access, unlimited eggs & artisan meko flight.',
    perks: [
      'Fast-track VIP Lounge & Seating',
      'Unlimited Boiled & Deviled Farm Eggs',
      'Exclusive 4-Pepper Artisanal Meko Tasting Flight',
      '1x Complimentary Palm Wine or Craft Beverage',
      'Official Kosua Ne Meko 2.0 Souvenir Apron & Sticker Pack',
      'VIP Photo Booth Priority Access',
    ],
  },
  {
    id: 'squad-pack',
    name: 'Squad Hangout Pack (5 Passes)',
    priceGHS: 220,
    description: 'Bring the squad! Discounted group admission for 5 people with a shared food & drink bucket.',
    perks: [
      'Entry for 5 Friends',
      '10x Ekow Sam Farm Fresh Eggs',
      'Family-sized Meko Mortar & Pestle Bowl',
      '5x Chilled Drinks of Choice',
      'Reserved Squad Table Zone (first-come basis)',
    ],
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
    time: '10:00 AM',
    title: 'Gates Open & Farm Fresh Welcome',
    description: 'Arrival, registration, and complimentary fresh boiled egg tasting at the Ekow Sam Farm booth.',
    location: 'Main Entrance & Lawn',
    category: 'food',
  },
  {
    time: '11:30 AM',
    title: 'Asanka Meko Grinding Workshop',
    description: 'Learn traditional Ghanaian pepper grinding techniques from master street food chefs using earthenware asanka bowls.',
    location: 'Meko Master Station',
    category: 'food',
  },
  {
    time: '01:30 PM',
    title: 'Board Game Championships (Ludo & Oware)',
    description: 'Open registration tournament for Ludo, Oware, and Draft. Win cash prizes and farm egg vouchers!',
    location: 'Games Tent',
    category: 'community',
  },
  {
    time: '03:30 PM',
    title: 'Great Meko Pepper Eating Challenge',
    description: 'The iconic showdown! Participants race to consume 5 hard-boiled eggs with escalating pepper levels.',
    location: 'Main Stage',
    category: 'competition',
  },
  {
    time: '05:30 PM',
    title: 'Live Afrobeats & Cultural Music Showcase',
    description: 'Performances by top Accra DJs, live brass band, and traditional dancers as the sunset approaches over Dzorwulu.',
    location: 'Main Stage',
    category: 'music',
  },
  {
    time: '07:00 PM',
    title: 'Pebble Outdoor Cinema – African Short Film Screenings',
    description: 'Grab a seat under the stars as Pebble presents a curated showcase of the best African short films, documentaries, and series premieres on the big screen.',
    location: 'Pebble Lounge & Screen',
    category: 'entertainment',
  },
  {
    time: '08:00 PM – 10:00 PM',
    title: 'Night Hangout & After-Party',
    description: 'Bonfire vibes, night market bites, chilled craft beers, and dancing under the stars.',
    location: 'Chill Out Courtyard',
    category: 'music',
  },
];

export const VENDORS: Vendor[] = [
  {
    id: 'v1',
    name: 'Ekow Sam Eggs & Meko Hub',
    category: 'eggs-pepper',
    description: 'Organically raised farm eggs served with signature stone-ground meko salsa in traditional clay bowls.',
    specialty: 'Specialty Deviled Kosua & Fresh Pepper Flight',
    imageUrl: 'https://images.unsplash.com/photo-1582169505937-b9992bd01ed9?auto=format&fit=crop&w=800&q=80',
    badge: 'Official Host',
  },
  {
    id: 'v2',
    name: 'Auntie Muni Street Bites',
    category: 'street-food',
    description: 'Famous Accra street eats including spicy waakye, kelewele, hot fried yam with turkey tail and fresh pepper.',
    specialty: 'Kelewele & Spicy Egg Kebabs',
    imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
    badge: 'Local Legend',
  },
  {
    id: 'v3',
    name: 'Akwaaba Palm Wine & Juice Bar',
    category: 'drinks',
    description: 'Freshly tapped natural palm wine, chilled hibiscus (sobolo), ginger brew, and coconut water served in shell calabashes.',
    specialty: 'Iced Sobolo & Ginger Punch',
    imageUrl: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=800&q=80',
    badge: 'Crowd Favorite',
  },
  {
    id: 'v4',
    name: 'Dzorwulu Suya & Tilapia Grill',
    category: 'street-food',
    description: 'Charcoal grilled spicy tilapia fish, suya steak skewers, and grilled boiled eggs wrapped in smoked banana leaf.',
    specialty: 'Grilled Pepper Eggs & Beef Suya',
    imageUrl: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'v5',
    name: 'Ekow Sam Organic Poultry Market',
    category: 'farm-fresh',
    description: 'Take home fresh crate farm eggs, local spice blends, organic peppers, and artisan earthenware asanka bowls.',
    specialty: 'Farm Fresh Egg Crates & Asanka Kits',
    imageUrl: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'v6',
    name: 'Pebble Entertainment Lounge',
    category: 'entertainment',
    description: 'Chill in the Pebble lounge with outdoor screenings of authentic African movies, short films, and documentaries — powered by trypebble.com.',
    specialty: 'Outdoor Cinema & Content Premieres',
    imageUrl: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=800&q=80',
    badge: 'Collaboration Partner',
  },
];

export const FAQS: FAQItem[] = [
  {
    question: 'Where exactly is the event located in Dzorwulu?',
    answer: 'The event takes place at Cencor Avenue, North Dzorwulu, Accra. Look out for the Ekow Sam Farms banners and the giant Kosua pin near the Dzorwulu traffic light junction.',
  },
  {
    question: 'What is included in the Kosua Ne Meko ticket?',
    answer: 'Every standard ticket includes admission to all stages and activity zones, plus 2 complimentary farm-fresh boiled eggs with fresh meko pepper salsa. VIP passes include unlimited eggs, VIP lounge, and free drinks!',
  },
  {
    question: 'Is parking available at Cencor Avenue?',
    answer: 'Yes! Dedicated secure parking is available on Cencor Avenue with security personnel. We also recommend Uber / Bolt drop-offs right at the entrance gate.',
  },
  {
    question: 'Can I bring children or families?',
    answer: 'Absolutely! Kosua Ne Meko Hangout 2.0 is a family-friendly cultural celebration with games, bouncy castles, non-spicy egg options for kids, and seating areas.',
  },
  {
    question: 'Can I buy tickets at the gate on Sept 5?',
    answer: 'Limited gate passes will be sold, but we strongly advise booking your RSVP pass online in advance as tickets for Hangout 1.0 sold out early.',
  },
  {
    question: 'What is Pebble and why are they at the event?',
    answer: 'Pebble (trypebble.com) is an African streaming platform — your home of authentic local content including movies, documentaries, short films, and series. They\'re our official entertainment collaboration partner for Hangout 2.0, bringing an outdoor cinema lounge with curated African film screenings and exclusive content previews!',
  },
];
