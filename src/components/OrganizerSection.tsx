import React from 'react';
import { Egg, HeartHandshake, Sparkles, CheckCircle2 } from 'lucide-react';
import { EVENT_DETAILS } from '../data/eventData';

export const OrganizerSection: React.FC = () => {
  return (
    <section className="py-16 bg-gradient-to-br from-amber-900 via-stone-900 to-emerald-950 text-white relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Visual Image */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden border-4 border-amber-500/30 shadow-2xl group">
              <img
                src="https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=1000&q=80"
                alt="Ekow Sam Farms Free-Range Chickens"
                referrerPolicy="no-referrer"
                className="w-full h-80 sm:h-96 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent" />
              
              {/* Badge */}
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-stone-900/90 backdrop-blur border border-amber-500/40">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-black text-lg">
                    🐔
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-amber-300 font-display">
                      EKOW SAM FARMS
                    </h4>
                    <p className="text-xs text-stone-300">
                      Sustainable Poultry & Fresh Organic Eggs
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Text Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-amber-400 px-3 py-1 rounded-md bg-amber-500/20 border border-amber-500/30">
                THE HEART BEHIND THE FESTIVAL
              </span>
              <h2 className="text-3xl sm:text-4xl font-black font-display text-white uppercase tracking-tight">
                BROUGHT TO YOU BY <span className="text-amber-400">EKOW SAM FARMS</span>
              </h2>
            </div>

            <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
              At Ekow Sam Farms, we believe that the humble boiled egg with freshly ground hot pepper is one of Ghana's greatest cultural treasures. Founded with a passion for sustainable local agriculture, we supply fresh organic eggs to thousands of households, vendors, and food lovers across Greater Accra every day.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {[
                '100% Farm-Fresh Quality Eggs',
                'Supporting Local Ghanaian Farmers',
                'Zero Artificial Hormones or Additives',
                'Community Food Festival Host',
              ].map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2.5 bg-stone-800/60 p-3 rounded-xl border border-stone-700/60">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-xs sm:text-sm font-bold text-stone-200">{feat}</span>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-amber-950/60 border border-amber-500/30 text-amber-200 text-xs sm:text-sm italic">
              "Kosua Ne Meko Hangout is our way of giving back to the community, bringing families together, and honoring the hard-working street food vendors of Ghana."
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
