import React from 'react';
import { Award, Sparkles, ExternalLink, ShieldCheck } from 'lucide-react';
import { Collaborator, Sponsor } from '../types';

interface SponsorsSectionProps {
  collaborators: Collaborator[];
  sponsors: Sponsor[];
}

export const SponsorsSection: React.FC<SponsorsSectionProps> = ({ collaborators, sponsors }) => {
  const headlineSponsors = sponsors.filter((s) => s.tier === 'Headline');
  const goldSponsors = sponsors.filter((s) => s.tier === 'Gold');
  const otherSponsors = sponsors.filter((s) => s.tier === 'Silver' || s.tier === 'Partner');

  return (
    <section id="sponsors" className="py-16 bg-gradient-to-b from-stone-900 via-stone-850 to-stone-900 text-white relative overflow-hidden border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-black uppercase tracking-wider">
            <Award className="w-4 h-4 text-orange-500" />
            <span>PARTNERS & SPONSORS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-white uppercase">
            POWERED BY OUR <span className="text-orange-500">COLLABORATORS</span>
          </h2>
          <p className="text-stone-300 text-sm sm:text-base">
            Special thanks to the authentic brands, media partners, and local champions bringing Kosua Ne Meko to life.
          </p>
        </div>

        {/* Collaborators Showcase */}
        {collaborators.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-amber-400 text-center flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>OFFICIAL EVENT COLLABORATORS</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {collaborators.map((c) => (
                <a
                  key={c.id}
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-stone-800/90 p-6 rounded-3xl border-2 border-orange-500/40 hover:border-orange-500 transition-all hover:-translate-y-1 shadow-xl flex items-center gap-4 group"
                >
                  {c.logoUrl && (
                    <img
                      src={c.logoUrl}
                      alt={c.name}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-2xl object-cover border border-stone-700 shrink-0"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-black text-white group-hover:text-orange-400 transition-colors uppercase">
                        {c.name}
                      </h4>
                      <ExternalLink className="w-4 h-4 text-stone-400 group-hover:text-orange-400 transition-colors" />
                    </div>
                    {c.badge && (
                      <span className="inline-block text-[10px] font-black uppercase px-2 py-0.5 bg-orange-600/30 text-orange-300 border border-orange-500/30 rounded-md mt-1">
                        {c.badge}
                      </span>
                    )}
                    <p className="text-xs text-stone-400 mt-1 line-clamp-2">
                      {c.tagline}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Sponsors Grid */}
        {sponsors.length > 0 && (
          <div className="space-y-6 pt-4 border-t border-stone-800">
            {headlineSponsors.length > 0 && (
              <div className="space-y-3 text-center">
                <span className="text-[11px] font-black uppercase tracking-widest text-orange-400">
                  HEADLINE SPONSORS
                </span>
                <div className="flex flex-wrap items-center justify-center gap-6">
                  {headlineSponsors.map((s) => (
                    <a
                      key={s.id}
                      href={s.websiteUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-4 rounded-2xl bg-stone-800 border border-stone-700 hover:border-orange-500 flex items-center gap-3 transition-all hover:scale-105 shadow-md"
                    >
                      {s.logoUrl && (
                        <img src={s.logoUrl} alt={s.name} referrerPolicy="no-referrer" className="w-10 h-10 rounded-xl object-cover" />
                      )}
                      <span className="text-base font-black text-white uppercase">{s.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {(goldSponsors.length > 0 || otherSponsors.length > 0) && (
              <div className="space-y-3 text-center pt-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">
                  SUPPORTING SPONSORS & PARTNERS
                </span>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  {[...goldSponsors, ...otherSponsors].map((s) => (
                    <a
                      key={s.id}
                      href={s.websiteUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 rounded-xl bg-stone-800/60 border border-stone-700/80 hover:border-stone-500 flex items-center gap-2 transition-all hover:bg-stone-800"
                    >
                      {s.logoUrl && (
                        <img src={s.logoUrl} alt={s.name} referrerPolicy="no-referrer" className="w-6 h-6 rounded-md object-cover" />
                      )}
                      <span className="text-xs font-bold text-stone-300">{s.name}</span>
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 bg-stone-700 text-stone-300 rounded">
                        {s.tier}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </section>
  );
};
