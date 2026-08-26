import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { FAQS, EVENT_DETAILS } from '../data/eventData';
import { EventDetails, FAQItem } from '../types';

interface FaqSectionProps {
  eventDetails?: EventDetails;
  faqs?: FAQItem[];
}

export const FaqSection: React.FC<FaqSectionProps> = ({ eventDetails, faqs }) => {
  // `faqs ?? FAQS`, not a truthiness check on length: an empty array means the
  // admin deleted them all, and must not be mistaken for "none supplied".
  const items = faqs ?? FAQS;
  const ev = eventDetails ?? EVENT_DETAILS;

  /**
   * FAQ copy is seed content, so it cannot hardcode the venue — a venue change
   * in the portal would leave the answers contradicting the rest of the page.
   */
  const fill = (text: string) =>
    text.replace(/{venue}/g, ev.locationName).replace(/{city}/g, ev.city).replace(/{date}/g, ev.dateString);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  // With every FAQ deleted there is nothing to introduce, so the whole
  // section is dropped rather than rendering a heading over an empty list.
  if (items.length === 0) return null;
  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-16 bg-stone-50 border-t border-stone-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-200 text-stone-800 text-xs font-black uppercase tracking-wider">
            <HelpCircle className="w-4 h-4 text-orange-600" />
            <span>GOT QUESTIONS?</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black font-display text-stone-900 tracking-tight uppercase">
            FREQUENTLY ASKED <span className="text-orange-600">QUESTIONS</span>
          </h2>
          <p className="text-stone-600 text-sm sm:text-base">
            Everything you need to know about {ev.shortTitle || ev.title} at {ev.locationName}.
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-4">
          {items.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden transition-all"
              >
                <button
                  id={`btn-faq-toggle-${index}`}
                  onClick={() => toggleFaq(index)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-extrabold text-stone-900 text-base sm:text-lg hover:text-orange-600 transition-colors"
                >
                  <span>{fill(faq.question)}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-stone-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-orange-600' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-stone-600 leading-relaxed border-t border-stone-100">
                    {fill(faq.answer)}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
