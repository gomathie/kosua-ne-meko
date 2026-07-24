import React, { useState } from 'react';
import { Egg, MapPin, Calendar, Ticket, Menu, X, Flame, UserCheck } from 'lucide-react';
import { EVENT_DETAILS } from '../data/eventData';

interface NavbarProps {
  onOpenTickets: () => void;
  onOpenMyTickets: () => void;
  ticketCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenTickets, onOpenMyTickets, ticketCount }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-orange-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="relative w-12 h-12 bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 rounded-2xl flex items-center justify-center shadow-md shadow-orange-500/20 border-2 border-white transform hover:scale-105 transition-transform">
              <Egg className="w-7 h-7 text-white fill-amber-100" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-600 border border-white text-[9px] font-black text-white items-center justify-center">2.0</span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-stone-900 font-display">
                  KOSUA <span className="text-orange-600">NE MEKO</span>
                </span>
                <span className="bg-emerald-800 text-emerald-100 text-[10px] font-extrabold px-2 py-0.5 rounded-md tracking-wider uppercase">
                  2.0
                </span>
              </div>
              <p className="text-xs text-stone-500 font-medium flex items-center gap-1">
                <span>By {EVENT_DETAILS.organizer}</span>
                <span className="inline-block w-1 h-1 bg-orange-400 rounded-full"></span>
                <span className="text-emerald-700 font-semibold">{EVENT_DETAILS.dateString}</span>
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection('highlights')}
              className="text-stone-700 hover:text-orange-600 font-semibold text-sm transition-colors"
            >
              Highlights
            </button>
            <button
              onClick={() => scrollToSection('pepper-meter')}
              className="text-stone-700 hover:text-orange-600 font-semibold text-sm transition-colors flex items-center gap-1"
            >
              <Flame className="w-4 h-4 text-orange-600" />
              Meko Scale
            </button>
            <button
              onClick={() => scrollToSection('schedule')}
              className="text-stone-700 hover:text-orange-600 font-semibold text-sm transition-colors"
            >
              Schedule
            </button>
            <button
              onClick={() => scrollToSection('vendors')}
              className="text-stone-700 hover:text-orange-600 font-semibold text-sm transition-colors"
            >
              Vendors
            </button>
            <button
              onClick={() => scrollToSection('location')}
              className="text-stone-700 hover:text-orange-600 font-semibold text-sm transition-colors flex items-center gap-1"
            >
              <MapPin className="w-4 h-4 text-emerald-700" />
              Accra Map
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="text-stone-700 hover:text-orange-600 font-semibold text-sm transition-colors"
            >
              FAQs
            </button>
          </div>

          {/* Action CTAs */}
          <div className="hidden md:flex items-center gap-3">
            {ticketCount > 0 && (
              <button
                onClick={onOpenMyTickets}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs transition-all border border-stone-200"
              >
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>My Tickets</span>
                <span className="bg-emerald-600 text-white rounded-full w-5 h-5 text-[11px] flex items-center justify-center font-bold">
                  {ticketCount}
                </span>
              </button>
            )}

            <button
              onClick={onOpenTickets}
              className="relative inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-sm text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 shadow-md shadow-orange-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Ticket className="w-4 h-4" />
              <span>Get RSVP Pass</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            {ticketCount > 0 && (
              <button
                onClick={onOpenMyTickets}
                className="p-2 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center gap-1 border border-emerald-200"
              >
                <Ticket className="w-4 h-4" />
                <span>{ticketCount}</span>
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-stone-200 px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top duration-200">
          <button
            onClick={() => scrollToSection('highlights')}
            className="w-full text-left px-3 py-2.5 rounded-lg text-stone-800 font-semibold hover:bg-stone-100 flex items-center gap-3"
          >
            <Egg className="w-5 h-5 text-amber-500" />
            <span>Event Highlights</span>
          </button>
          <button
            onClick={() => scrollToSection('pepper-meter')}
            className="w-full text-left px-3 py-2.5 rounded-lg text-stone-800 font-semibold hover:bg-stone-100 flex items-center gap-3"
          >
            <Flame className="w-5 h-5 text-orange-600" />
            <span>Meko Spice Meter</span>
          </button>
          <button
            onClick={() => scrollToSection('schedule')}
            className="w-full text-left px-3 py-2.5 rounded-lg text-stone-800 font-semibold hover:bg-stone-100 flex items-center gap-3"
          >
            <Calendar className="w-5 h-5 text-emerald-700" />
            <span>Full Schedule</span>
          </button>
          <button
            onClick={() => scrollToSection('vendors')}
            className="w-full text-left px-3 py-2.5 rounded-lg text-stone-800 font-semibold hover:bg-stone-100 flex items-center gap-3"
          >
            <Egg className="w-5 h-5 text-amber-600" />
            <span>Food & Drinks Lineup</span>
          </button>
          <button
            onClick={() => scrollToSection('location')}
            className="w-full text-left px-3 py-2.5 rounded-lg text-stone-800 font-semibold hover:bg-stone-100 flex items-center gap-3"
          >
            <MapPin className="w-5 h-5 text-red-600" />
            <span>Location & Map (Accra)</span>
          </button>
          <button
            onClick={() => scrollToSection('faq')}
            className="w-full text-left px-3 py-2.5 rounded-lg text-stone-800 font-semibold hover:bg-stone-100 flex items-center gap-3"
          >
            <span className="w-5 h-5 rounded-full bg-stone-200 text-stone-700 flex items-center justify-center font-bold text-xs">?</span>
            <span>FAQs</span>
          </button>

          <div className="pt-2 border-t border-stone-100 space-y-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenTickets();
              }}
              className="w-full py-3 rounded-xl bg-orange-600 text-white font-extrabold flex items-center justify-center gap-2 shadow-md shadow-orange-600/30"
            >
              <Ticket className="w-5 h-5" />
              <span>Get Your Pass Now</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
