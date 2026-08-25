import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Ticket, ChevronRight, Compass, Sparkles, Flame, Clock } from 'lucide-react';
import { EventDetails } from '../types';
import { sanitizeUrl } from '../utils/sanitize';

import chiliPepperSvg from '../assets/peppers/chili-pepper.svg';
import chiliPepperFancySvg from '../assets/peppers/chilipepper-svgrepo-com.svg';

interface HeroProps {
  eventDetails: EventDetails;
  onOpenTickets: () => void;
}

export const Hero: React.FC<HeroProps> = ({ eventDetails, onOpenTickets }) => {
  // Live Countdown Timer logic
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const targetIso = eventDetails.targetDateISO || '2026-12-12T10:00:00';
    const target = new Date(targetIso).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [eventDetails.targetDateISO]);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-sky-200 via-sky-100 to-emerald-900/10 pt-8 pb-16 lg:py-20">
      
      {/* Background Aerial Landscape Styling & Clouds */}
      <div className="absolute inset-0 z-0 opacity-40 mix-blend-multiply pointer-events-none bg-[radial-gradient(#059669_1px,transparent_1px)] [background-size:24px_24px]"></div>
      
      {/* Flying Birds & Floating Chili Decor */}
      <div className="absolute top-10 right-10 md:right-24 z-10 pointer-events-none opacity-90 animate-pulse">
        <img src={chiliPepperFancySvg} alt="Chili Pepper" className="w-12 h-12 sm:w-16 sm:h-16 transform rotate-12 drop-shadow-xl" />
      </div>
      <div className="absolute top-28 right-6 md:right-16 z-10 pointer-events-none opacity-90 animate-bounce duration-1000">
        <img src={chiliPepperSvg} alt="Chili Pepper" className="w-10 h-10 sm:w-14 sm:h-14 transform -rotate-12 drop-shadow-xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Banner Poster Canvas Frame */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-sky-400 via-sky-200 to-emerald-800 shadow-2xl border-4 border-white/80 p-6 sm:p-10 md:p-14 text-stone-900">
          
          {/*
            Backdrop is the flyer itself, blurred right down. It was a stock
            aerial photo chosen to *simulate* a flyer; with the real one now in
            the hero, that stood in for something already on screen and cost an
            extra cross-origin request on the critical path. Reusing the same
            file is free — the browser has already fetched it at high priority.
            scale-110 hides the soft edges blur leaves at the boundary.
          */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-cover bg-center opacity-25 blur-2xl scale-110"
            style={{
              backgroundImage: `url('/hero-flyer.jpg')`,
            }}
          />

          {/* Organizer Header Tag */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur border border-amber-200 shadow-sm text-stone-800 text-[10px] sm:text-xs font-extrabold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-orange-600 animate-ping" />
              <span>OFFICIAL EVENT LANDING PAGE</span>
              <span className="text-stone-300">|</span>
              <span className="text-orange-700 font-extrabold">ACCRA</span>
            </div>

            {/* Collaboration Badge */}
            {eventDetails.collaborator && (
              <a href={sanitizeUrl(eventDetails.collaboratorUrl, '#')} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-full bg-stone-900/85 backdrop-blur border border-stone-700 shadow-sm text-white text-[10px] sm:text-xs font-extrabold uppercase tracking-wider hover:bg-stone-800 transition-colors">
                <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-stone-300">In collaboration with</span>
                <span className="text-orange-400 font-black">{eventDetails.collaborator.toUpperCase()}</span>
              </a>
            )}

            {/* Countdown Box */}
            <div className="inline-flex items-center gap-2 sm:gap-3 px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl bg-stone-900/85 backdrop-blur text-white text-xs sm:text-sm font-mono border border-stone-700 shadow-lg">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-400" />
              <span className="text-stone-300 font-sans font-medium text-xs hidden sm:inline">COUNTDOWN:</span>
              <div className="flex items-center gap-1 font-black text-amber-400 text-xs sm:text-sm">
                <span>{timeLeft.days}d</span>:
                <span>{String(timeLeft.hours).padStart(2, '0')}h</span>:
                <span>{String(timeLeft.minutes).padStart(2, '0')}m</span>:
                <span>{String(timeLeft.seconds).padStart(2, '0')}s</span>
              </div>
            </div>
          </div>

          {/* Hero Content Grid */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Title & Date Details */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Event Main Typography */}
              <div className="space-y-1">
                <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-orange-600 font-display drop-shadow-[0_4px_12px_rgba(234,88,12,0.3)] uppercase leading-tight sm:leading-none">
                  {eventDetails.title || 'KOSUA NE MEKO HANGOUT'}
                </h1>
                <p className="text-stone-800 text-base sm:text-lg font-semibold max-w-xl leading-relaxed bg-white/70 backdrop-blur-sm p-3 rounded-xl border border-white/60">
                  {eventDetails.tagline || 'Accra’s Premier Street Food & Cultural Festival'}
                </p>
              </div>

              {/* Date Badge */}
              <div className="inline-block transform -rotate-1 hover:rotate-0 transition-transform">
                <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-2xl border-2 border-stone-200 text-emerald-800 max-w-xs">
                  <div className="flex items-center gap-2 text-xs font-black uppercase text-orange-600 tracking-widest mb-1">
                    <Calendar className="w-4 h-4 text-orange-600" />
                    <span>EVENT DATE</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black tracking-tight text-emerald-900 leading-tight uppercase">
                    {eventDetails.dateString}
                  </div>
                </div>
              </div>

              {/* Tagline */}
              <p className="text-stone-800 text-base sm:text-lg font-semibold max-w-xl leading-relaxed bg-white/70 backdrop-blur-sm p-4 rounded-2xl border border-white/60">
                Boiled farm eggs, freshly ground hot meko pepper salsa, live music, Ludo games & Accra street food culture! Join us for the most flavorful hangout of 2026.
              </p>

              {/* Call to Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <button
                  onClick={onOpenTickets}
                  className={`w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-black text-base sm:text-lg shadow-xl transition-all flex items-center justify-center gap-3 group ${
                    eventDetails.isBookingOpen === false
                      ? 'bg-stone-800 hover:bg-stone-700 text-stone-300 shadow-stone-900/40'
                      : 'bg-orange-600 hover:bg-orange-700 text-white shadow-orange-600/40 hover:shadow-orange-600/60 hover:-translate-y-0.5'
                  }`}
                >
                  <Ticket className="w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-12 transition-transform" />
                  <span>{eventDetails.isBookingOpen === false ? '🔴 RSVP COMING SOON' : 'GET FREE TICKET'}</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <a
                  href="#location"
                  className="w-full sm:w-auto px-6 py-3.5 sm:py-4 rounded-2xl bg-white/90 hover:bg-white text-emerald-900 font-extrabold text-sm sm:text-base border border-emerald-700/20 shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <MapPin className="w-5 h-5 text-emerald-700" />
                  <span>GET LOCATION MAP</span>
                </a>
              </div>

            </div>

            {/* Right Side: the official event flyer */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center relative">

              <button
                type="button"
                onClick={onOpenTickets}
                aria-label="Get your free ticket"
                className="relative group w-full max-w-sm focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-500 rounded-3xl"
              >
                {/* Warm glow behind the poster, echoing the page palette. */}
                <div className="absolute -inset-3 bg-amber-400/40 rounded-[2rem] blur-3xl group-hover:bg-orange-500/50 transition-all" />

                <img
                  src="/hero-flyer.jpg"
                  alt="Kosua Ne Meko Hangout 2.0 flyer: Saturday 5th September, 2:00 PM at Cencor Venue, North Dzorwulu, Accra. Presented by Ekow Sam Farms in collaboration with Pebble."
                  width={1024}
                  height={1280}
                  loading="eager"
                  /* fetchPriority tells the browser this is the largest paint
                     element, so it is fetched ahead of below-the-fold images. */
                  fetchPriority="high"
                  className="relative z-10 w-full h-auto rounded-3xl border-4 border-white shadow-2xl transform group-hover:scale-[1.02] transition-transform duration-300"
                />
              </button>

              {/* Location Badge */}
              <div className="w-full max-w-sm mt-4 transform hover:scale-102 transition-transform">
                <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-3xl p-5 shadow-xl border-2 border-white/80 text-center space-y-1">
                  <div className="flex items-center justify-center gap-1.5 text-amber-200 text-xs font-black uppercase tracking-widest">
                    <Compass className="w-4 h-4" />
                    <span>VENUE LOCATION</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black tracking-wide font-display uppercase leading-tight">
                    {eventDetails.locationName}
                  </h3>
                  <p className="text-sm sm:text-base font-extrabold text-amber-100 uppercase tracking-wider">
                    {eventDetails.city}
                  </p>
                </div>
              </div>

            </div>

          </div>

          {/* Footer Logo Badge */}
          <div className="relative z-10 mt-8 pt-6 border-t border-white/30 flex flex-wrap items-center justify-between gap-4">
            
            <div className="flex items-center gap-3">
              <div className="bg-stone-900 text-white px-4 py-2 rounded-full flex items-center gap-3 border border-stone-700 shadow-md">
                <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center text-stone-900 font-black text-xs">
                  🐔
                </div>
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider block text-amber-400">ORGANIZED BY</span>
                  <span className="text-sm font-black tracking-tight text-white uppercase font-display">{eventDetails.organizer}</span>
                </div>
              </div>
            </div>

            <div className="text-xs font-bold text-stone-800 bg-white/80 backdrop-blur px-3 py-1.5 rounded-lg border border-white">
              {eventDetails.hashtag} • #{eventDetails.organizer.replace(/\s+/g, '')}
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
