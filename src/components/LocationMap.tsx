import React, { useState } from 'react';
import { MapPin, Navigation, Car, ShieldCheck, ExternalLink, Copy, Check } from 'lucide-react';
import { EventDetails } from '../types';
import { EVENT_DETAILS as DEFAULT_EVENT_DETAILS } from '../data/eventData';

interface LocationMapProps {
  eventDetails?: EventDetails;
}

export const LocationMap: React.FC<LocationMapProps> = ({ eventDetails = DEFAULT_EVENT_DETAILS }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(eventDetails.fullAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(eventDetails.fullAddress)}`;

  return (
    <section id="location" className="py-16 bg-white border-t border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider border border-emerald-200">
            <MapPin className="w-4 h-4 text-emerald-700" />
            <span>ACCRA VENUE GUIDE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-display text-stone-900 tracking-tight uppercase">
            FIND US AT <span className="text-emerald-800">NORTH DZORWULU</span>
          </h2>
          <p className="text-stone-600 text-sm sm:text-base">
            Easily accessible from anywhere in Accra. Located right on Cencor Avenue with secure parking and ride-hailing drop-offs.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Details Card */}
          <div className="lg:col-span-5 bg-stone-900 text-white p-6 sm:p-8 rounded-3xl space-y-6 flex flex-col justify-between shadow-xl">
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-black text-orange-400 uppercase tracking-widest">
                  VENUE ADDRESS
                </span>
                <h3 className="text-2xl sm:text-3xl font-black font-display text-white">
                  {eventDetails.locationName}
                </h3>
                <p className="text-emerald-400 font-extrabold text-sm sm:text-base">
                  {eventDetails.city}
                </p>
              </div>

              {/* Copyable Address box */}
              <div className="bg-stone-800 p-4 rounded-2xl border border-stone-700 flex items-center justify-between gap-3">
                <div className="text-xs font-mono text-stone-300">
                  {eventDetails.fullAddress}
                </div>
                <button
                  onClick={handleCopyAddress}
                  className="p-2 rounded-xl bg-stone-700 hover:bg-stone-600 text-white transition-colors"
                  title="Copy Address"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Landmarks */}
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-900/60 text-emerald-400 border border-emerald-700/50">
                    <Navigation className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-stone-200 uppercase">Landmarks</h4>
                    <p className="text-xs text-stone-400">Near Dzorwulu Traffic Light Junction, opposite the Cencor Plaza.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-amber-900/60 text-amber-400 border border-amber-700/50">
                    <Car className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-stone-200 uppercase">Uber & Bolt Drop-off</h4>
                    <p className="text-xs text-stone-400">Set destination to "Cencor Avenue, Dzorwulu". Dedicated drop-off zone at Main Gate 1.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-indigo-900/60 text-indigo-400 border border-indigo-700/50">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-stone-200 uppercase">Parking & Security</h4>
                    <p className="text-xs text-stone-400">Gated secure parking available with uniformed security stewards.</p>
                  </div>
                </div>
              </div>
            </div>

            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/50 transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              <span>OPEN IN GOOGLE MAPS</span>
            </a>
          </div>

          {/* Right Visual Map Simulation */}
          <div className="lg:col-span-7 bg-stone-100 rounded-3xl overflow-hidden border-2 border-stone-200 relative min-h-[360px] flex flex-col justify-end p-6">
            
            {/* Styled Map Background Representation */}
            <div 
              className="absolute inset-0 bg-cover bg-center filter saturate-150 opacity-90"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1200&q=80')`,
              }}
            />
            
            {/* Map Overlay Tint */}
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-900/20 to-transparent" />

            {/* Pin Marker Callout */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center animate-bounce duration-1000">
              <div className="bg-orange-600 text-white font-extrabold text-xs px-3 py-1.5 rounded-full shadow-2xl border-2 border-white flex items-center gap-1.5 whitespace-nowrap">
                <span>🥚 Kosua Ne Meko 2.0</span>
              </div>
              <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[12px] border-t-orange-600 -mt-0.5" />
            </div>

            {/* Map Card Footer */}
            <div className="relative z-10 bg-white/95 backdrop-blur p-4 rounded-2xl border border-white shadow-xl flex flex-wrap items-center justify-between gap-3 text-stone-900">
              <div>
                <span className="text-[10px] font-black uppercase text-orange-600 tracking-wider block">
                  ACCRA EVENT HUB
                </span>
                <span className="text-sm font-extrabold">
                  Cencor Avenue, North Dzorwulu
                </span>
              </div>
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-orange-600 text-white text-xs font-black hover:bg-orange-700 transition-colors"
              >
                Get Directions
              </a>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
