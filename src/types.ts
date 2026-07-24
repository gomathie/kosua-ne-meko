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
  category: 'eggs-pepper' | 'drinks' | 'street-food' | 'farm-fresh';
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
  category: 'food' | 'competition' | 'music' | 'community';
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

export interface FAQItem {
  question: string;
  answer: string;
}
