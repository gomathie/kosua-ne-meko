import React, { useState, useEffect } from 'react';
import { Ticket, UserCheck, Flame, Calendar } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { EventHighlights } from './components/EventHighlights';
import { PepperMeter } from './components/PepperMeter';
import { Schedule } from './components/Schedule';
import { Vendors } from './components/Vendors';
import { LocationMap } from './components/LocationMap';
import { OrganizerSection } from './components/OrganizerSection';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';
import { TicketModal } from './components/TicketModal';
import { MyTicketsModal } from './components/MyTicketsModal';
import { UserTicket } from './types';
import { EVENT_DETAILS } from './data/eventData';

export default function App() {
  const [tickets, setTickets] = useState<UserTicket[]>([]);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [isMyTicketsOpen, setIsMyTicketsOpen] = useState(false);

  // Load saved tickets from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('kosua_tickets');
      if (saved) {
        setTickets(JSON.parse(saved));
      }
    } catch (err) {
      console.error('Failed to load tickets from storage', err);
    }
  }, []);

  const handleTicketBooked = (newTicket: UserTicket) => {
    const updated = [newTicket, ...tickets];
    setTickets(updated);
    try {
      localStorage.setItem('kosua_tickets', JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to save ticket to storage', err);
    }
  };

  const handleClearTickets = () => {
    setTickets([]);
    try {
      localStorage.removeItem('kosua_tickets');
    } catch (err) {
      console.error('Failed to clear tickets from storage', err);
    }
  };

  return (
    <div className="min-h-screen bg-white text-stone-900 font-sans antialiased selection:bg-orange-500 selection:text-white relative">
      
      {/* Navigation Bar */}
      <Navbar
        onOpenTickets={() => setIsTicketModalOpen(true)}
        onOpenMyTickets={() => setIsMyTicketsOpen(true)}
        ticketCount={tickets.length}
      />

      {/* Main Sections */}
      <main className="pb-20 md:pb-0">
        <Hero onOpenTickets={() => setIsTicketModalOpen(true)} />
        <EventHighlights />
        <PepperMeter />
        <Schedule />
        <Vendors />
        <LocationMap />
        <OrganizerSection />
        <FaqSection />
      </main>

      {/* Footer */}
      <Footer />

      {/* Floating Sticky Mobile Quick Action Bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-stone-900/95 backdrop-blur-lg border-t border-stone-800 p-3 shadow-2xl flex items-center justify-between gap-2 text-white">
        <div className="flex items-center gap-2 pl-1">
          <div className="w-8 h-8 rounded-xl bg-orange-600/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-black text-white block uppercase tracking-wide">SAT. 5TH SEPT.</span>
            <span className="text-[9px] font-semibold text-stone-400 block">Dzorwulu, Accra</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {tickets.length > 0 && (
            <button
              onClick={() => setIsMyTicketsOpen(true)}
              className="p-2.5 rounded-xl bg-stone-800 text-emerald-400 hover:bg-stone-700 transition-colors border border-stone-700 flex items-center gap-1.5"
              aria-label="View My Tickets"
            >
              <UserCheck className="w-4 h-4" />
              <span className="text-xs font-bold">{tickets.length}</span>
            </button>
          )}

          <button
            onClick={() => setIsTicketModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-600/30 flex items-center gap-2 transition-transform active:scale-95"
          >
            <Ticket className="w-4 h-4" />
            <span>Get Pass</span>
          </button>
        </div>
      </div>

      {/* Modals */}
      <TicketModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        onTicketBooked={handleTicketBooked}
      />

      <MyTicketsModal
        isOpen={isMyTicketsOpen}
        onClose={() => setIsMyTicketsOpen(false)}
        tickets={tickets}
        onClearTickets={handleClearTickets}
      />

    </div>
  );
}

