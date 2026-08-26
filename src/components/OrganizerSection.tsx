import React from 'react';
import { Egg, HeartHandshake, Sparkles, CheckCircle2, Play, Film, ExternalLink } from 'lucide-react';
import { EVENT_DETAILS } from '../data/eventData';
import { EventDetails } from '../types';

interface OrganizerSectionProps {
  eventDetails?: EventDetails;
}

export const OrganizerSection: React.FC<OrganizerSectionProps> = ({ eventDetails }) => {
  const ev = eventDetails ?? EVENT_DETAILS;
  return (
    <section className="py-16 bg-gradient-to-br from-amber-900 via-stone-900 to-emerald-950 text-white relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Section Header */}
        <div className="text-center space-y-2 mb-12">
          <span className="text-xs font-black uppercase tracking-widest text-amber-400 px-3 py-1 rounded-md bg-amber-500/20 border border-amber-500/30">
            THE HEART BEHIND THE FESTIVAL
          </span>
          <h2 className="text-3xl sm:text-4xl font-black font-display text-white uppercase tracking-tight">
            BROUGHT TO YOU BY <span className="text-amber-400">EKOW SAM FARMS</span> × <span className="text-orange-400">PEBBLE</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Ekow Sam Farms Card */}
          <div className="relative rounded-3xl overflow-hidden border-2 border-amber-500/30 shadow-2xl bg-stone-900/60">
            <div className="relative group">
              <img
                src="https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=1000&q=80"
                alt="Ekow Sam Farms Free-Range Chickens"
                referrerPolicy="no-referrer"
                className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent" />
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-black text-lg">
                  🐔
                </div>
                <div>
                  <h4 className="text-lg font-black text-amber-300 font-display">
                    EKOW SAM FARMS
                  </h4>
                  <p className="text-xs text-stone-400">{ev.organizerTagline}</p>
                </div>
              </div>

              <p className="text-stone-300 text-sm leading-relaxed">
                At Ekow Sam Farms, we believe that the humble boiled egg with freshly ground hot pepper is one of Ghana's greatest cultural treasures. Founded with a passion for sustainable local agriculture, we supply fresh organic eggs to thousands of households, vendors, and food lovers across Greater Accra every day.
              </p>

              <div className="grid grid-cols-2 gap-3">
                {[
                  '100% Farm-Fresh Quality Eggs',
                  'Supporting Local Ghanaian Farmers',
                  'Zero Artificial Hormones',
                  'Community Festival Host',
                ].map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-stone-800/60 p-2.5 rounded-xl border border-stone-700/60">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="text-xs font-bold text-stone-200">{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pebble Partner Card */}
          <div className="relative rounded-3xl overflow-hidden border-2 border-orange-500/30 shadow-2xl bg-stone-900/60">
            <div className="relative group">
              <div className="w-full h-56 bg-gradient-to-br from-stone-950 via-stone-900 to-orange-950 flex items-center justify-center">
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
                    <Play className="w-8 h-8 text-orange-400" />
                  </div>
                  <p className="text-orange-400/60 text-xs font-bold tracking-widest uppercase">Stream Authentic African Content</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center">
                    <Film className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-orange-400 font-display">
                      PEBBLE
                    </h4>
                    <p className="text-xs text-stone-400">{ev.collaboratorTagline}</p>
                  </div>
                </div>
                <a
                  id="link-organizer-pebble-icon"
                  href={ev.collaboratorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-orange-500/20 border border-orange-500/30 text-orange-400 hover:bg-orange-500/30 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              <p className="text-stone-300 text-sm leading-relaxed">
                Pebble is your go-to platform for amazing African content — from movies and series to documentaries and short films. Real stories made by Africans, for Africans and the world. Ad-free streaming with offline downloads, all at zero subscription cost during early access.
              </p>

              <div className="grid grid-cols-2 gap-3">
                {[
                  'Ad-Free Streaming',
                  'African Movies & Series',
                  'Offline Downloads',
                  'Free Early Access',
                ].map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-stone-800/60 p-2.5 rounded-xl border border-orange-900/40">
                    <CheckCircle2 className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                    <span className="text-xs font-bold text-stone-200">{feat}</span>
                  </div>
                ))}
              </div>

              <a
                id="link-organizer-pebble-cta"
                href={ev.collaboratorUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center py-3 rounded-xl bg-orange-500/20 border border-orange-500/30 text-orange-400 font-extrabold text-sm hover:bg-orange-500/30 transition-colors"
              >
                Start Watching on Pebble →
              </a>
            </div>
          </div>

        </div>

        {/* Collaboration Quote */}
        <div className="mt-8 p-4 rounded-2xl bg-amber-950/60 border border-amber-500/30 text-amber-200 text-xs sm:text-sm italic text-center">
          "Kosua Ne Meko Hangout is our way of giving back to the community, bringing families together, honoring street food culture, and celebrating authentic African stories — on the plate and on the screen."
        </div>

      </div>
    </section>
  );
};
