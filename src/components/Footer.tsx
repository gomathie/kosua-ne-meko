import React from 'react';
import { Egg, ArrowUp, Heart } from 'lucide-react';
import { EVENT_DETAILS } from '../data/eventData';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
              <span className="font-extrabold text-2xl tracking-tight text-white font-display">
                KOSUA <span className="text-orange-500">NE MEKO</span> HANGOUT 2.0
              </span>
            </div>
            <p className="text-xs text-stone-400 max-w-sm leading-relaxed">
              Celebrating Ghana's favorite street food staple. Organically farmed boiled eggs, stone-ground meko pepper salsa, local music, board games, and community culture in Accra.
            </p>
            <div className="text-xs font-mono text-orange-400">
              {EVENT_DETAILS.hashtag} • {EVENT_DETAILS.dateString}
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
              <span className="text-amber-400 font-extrabold block text-[10px] uppercase">HOST & SPONSOR</span>
              <h5 className="font-black text-white text-sm font-display">EKOW SAM FARMS</h5>
              <p className="text-stone-400">Cencor Avenue, North Dzorwulu, Greater Accra, Ghana</p>
              <p className="text-stone-400">Email: events@ekowsamfarms.com</p>
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

        {/* Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© 2026 Kosua Ne Meko Hangout 2.0. Organized by Ekow Sam Farms.</p>
          <p className="flex items-center gap-1">
            <span>Made with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            <span>for Accra Street Food Culture</span>
          </p>
        </div>

      </div>
    </footer>
  );
};
