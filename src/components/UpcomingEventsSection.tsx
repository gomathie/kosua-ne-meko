import React from 'react';
import { Calendar, MapPin, Sparkles, ArrowRight } from 'lucide-react';
import { EventItem } from '../types';

interface UpcomingEventsSectionProps {
  events: EventItem[];
  onOpenTickets: () => void;
}

export const UpcomingEventsSection: React.FC<UpcomingEventsSectionProps> = ({ events, onOpenTickets }) => {
  const upcomingEvents = events.filter((e) => e.status === 'upcoming');

  if (upcomingEvents.length === 0) return null;

  return (
    <section className="py-16 bg-stone-900 text-white relative overflow-hidden border-t border-b border-stone-800">
      {/* Glow Effects */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="px-3.5 py-1.5 rounded-full bg-amber-500/20 text-amber-400 font-extrabold text-xs uppercase tracking-widest border border-amber-500/30 inline-flex items-center gap-1.5 mb-3">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Mark Your Calendar</span>
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-white uppercase">
            UPCOMING EDITIONS & DATES
          </h2>
          <p className="mt-3 text-stone-400 text-sm sm:text-base font-medium">
            Discover future editions of Kosua Ne Meko Hangout across Ghana.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcomingEvents.map((event) => (
            <div
              key={event.id}
              className="bg-stone-950/80 rounded-3xl p-6 border border-stone-800 hover:border-amber-500/50 transition-all duration-300 shadow-xl flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="px-3 py-1 rounded-xl bg-orange-600/20 text-orange-400 text-xs font-black uppercase border border-orange-500/30 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{event.dateString}</span>
                  </span>
                  <span className="text-[10px] font-black uppercase text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-800/40">
                    UPCOMING
                  </span>
                </div>

                <h3 className="text-xl font-black text-white group-hover:text-amber-400 transition-colors">
                  {event.title}
                </h3>
                <p className="text-xs text-stone-400 font-medium mt-2 leading-relaxed">
                  {event.tagline}
                </p>

                <div className="mt-4 pt-4 border-t border-stone-800 space-y-2 text-xs text-stone-300">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-semibold">{event.locationName}, {event.city}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-stone-800/80">
                <button
                  onClick={onOpenTickets}
                  className="w-full py-3 rounded-2xl bg-stone-800 hover:bg-orange-600 text-white font-extrabold text-xs uppercase transition-all flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-orange-600/20"
                >
                  <span>Pre-Register / Get Pass</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
