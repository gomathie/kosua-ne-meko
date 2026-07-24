import React, { useState, useEffect } from 'react';
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
    <div className="min-h-screen bg-white text-stone-900 font-sans antialiased selection:bg-orange-500 selection:text-white">
      
      {/* Navigation Bar */}
      <Navbar
        onOpenTickets={() => setIsTicketModalOpen(true)}
        onOpenMyTickets={() => setIsMyTicketsOpen(true)}
        ticketCount={tickets.length}
      />

      {/* Main Sections */}
      <main>
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
