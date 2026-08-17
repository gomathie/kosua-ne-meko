import React from 'react';
import { Egg, ArrowUp, Heart, Lock } from 'lucide-react';
import { EventDetails } from '../types';

interface FooterProps {
  eventDetails?: EventDetails;
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ eventDetails, onOpenAdmin }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const title = eventDetails?.title || 'KOSUA NE MEKO HANGOUT 2.0';
  const dateStr = eventDetails?.dateString || 'SAT. 5TH SEPT. 2026';
  const hashtag = eventDetails?.hashtag || '#KosuaNeMekoHangout';

  return (
    <footer className="bg-stone-950 text-stone-300 pt-16 pb-12 border-t-4 border-orange-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-stone-800">

          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center text-white">
                <Egg className="w-6 h-6 fill-amber-100" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-white font-display uppercase">
                {title}
              </span>
            </div>
            <p className="text-xs text-stone-400 max-w-sm leading-relaxed">
              Celebrating Ghana's favorite street food staple. Organically farmed boiled eggs, stone-ground meko pepper salsa, local music, board games, and community culture.
            </p>
            <div className="text-xs font-mono text-orange-400">
              {hashtag} • {dateStr}
            </div>
          </div>

          {/* Event Quick Links */}
          <div className="md:col-span-3 space-y-3 text-xs">
            <h4 className="font-black text-white uppercase tracking-wider text-xs">
              EVENT NAVIGATION
            </h4>
            <ul className="space-y-2">
              <li><a href="#highlights" className="hover:text-orange-400 transition-colors">Event Highlights</a></li>
              <li><a href="#pepper-meter" className="hover:text-orange-400 transition-colors">Meko Spice Scale</a></li>
              <li><a href="#schedule" className="hover:text-orange-400 transition-colors">Saturday Timeline</a></li>
              <li><a href="#vendors" className="hover:text-orange-400 transition-colors">Food & Drink Stalls</a></li>
              <li><a href="#location" className="hover:text-orange-400 transition-colors">Dzorwulu Location Map</a></li>
              <li><a href="#faq" className="hover:text-orange-400 transition-colors">Frequently Asked Questions</a></li>
            </ul>
          </div>

          {/* Host Info & Back to Top */}
          <div className="md:col-span-4 space-y-4 flex flex-col justify-between">
            <div className="bg-stone-900 p-4 rounded-2xl border border-stone-800 space-y-1 text-xs">
              <span className="text-amber-400 font-extrabold block text-[10px] uppercase">HOST & ORGANIZER</span>
              <h5 className="font-black text-white text-sm font-display">EKOW SAM FARMS</h5>
              <p className="text-stone-400">Cencor Venue, North Dzorwulu, Greater Accra, Ghana</p>
              <p className="text-stone-400">Email: events@ekowsamfarms.com</p>
            </div>

            <div className="bg-stone-900 p-4 rounded-2xl border border-orange-900/40 space-y-1 text-xs">
              <span className="text-orange-400 font-extrabold block text-[10px] uppercase">COLLABORATION PARTNER</span>
              <h5 className="font-black text-white text-sm font-display">PEBBLE</h5>
              <p className="text-stone-400">Your Home of Authentic Local Content</p>
              <a href="https://trypebble.com" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-300 font-bold transition-colors">trypebble.com →</a>
            </div>

            <button
              onClick={scrollToTop}
              className="w-fit self-end px-4 py-2 rounded-xl bg-stone-800 hover:bg-orange-600 text-white text-xs font-bold transition-colors flex items-center gap-2"
            >
              <span>Back to top</span>
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Copyright & Portal Link */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© 2026 {title}. Organized by {eventDetails?.organizer || 'Ekow Sam Farms'}.</p>
          <div className="flex items-center gap-4">
            {onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className="text-stone-400 hover:text-orange-400 flex items-center gap-1 font-bold transition-colors"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Portal</span>
              </button>
            )}
            <p className="flex items-center gap-1">
              <span>Made with</span>
              <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
              <span>v2.0</span> by <a href="https://trypebble.com" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-300 font-bold transition-colors">Pebble</a>
            </p>
          </div>
        </div>

      </div>
    </footer>
  );
};
