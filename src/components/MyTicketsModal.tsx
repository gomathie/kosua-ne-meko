import React from 'react';
import { X, Ticket, QrCode, Trash2, MapPin, Calendar, Download } from 'lucide-react';
import { EventDetails, UserTicket } from '../types';
import { EVENT_DETAILS } from '../data/eventData';
import { downloadTicketImage } from '../utils/downloadTicket';
import { sanitizeImageUrl } from '../utils/sanitize';

interface MyTicketsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tickets: UserTicket[];
  eventDetails?: EventDetails;
  onClearTickets: () => void;
}

export const MyTicketsModal: React.FC<MyTicketsModalProps> = ({
  isOpen,
  onClose,
  tickets,
  onClearTickets,
  eventDetails,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8">
        
        {/* Header */}
        <div className="bg-stone-900 p-6 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-600 text-white font-black">
              <Ticket className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black font-display tracking-tight uppercase">
                MY RESERVED PASSES ({tickets.length})
              </h3>
              <p className="text-xs text-stone-400">
                Stored locally on your device
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {tickets.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-400 mx-auto flex items-center justify-center">
                <Ticket className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-stone-700">No Tickets Reserved Yet</h4>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                Click "Get Free Ticket" on the main page to reserve your tickets for Kosua Ne Meko Hangout 2.0.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map((t) => (
                <div
                  key={t.id}
                  className="bg-stone-900 text-white p-5 rounded-2xl border border-orange-500/40 shadow-md space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                    <div>
                      <span className="text-[10px] font-mono text-orange-400 font-bold">
                        PASS ID: {t.id}
                      </span>
                      <h4 className="text-lg font-black font-display uppercase text-white">
                        {t.passName}
                      </h4>
                    </div>
                    <span className="bg-emerald-800 text-emerald-100 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase">
                      Confirmed
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center text-xs">
                    <div className="sm:col-span-8 space-y-1.5">
                      <p className="text-stone-300">
                        <strong className="text-stone-400">Name:</strong> {t.customerName} ({t.quantity} Ticket{t.quantity > 1 ? 's' : ''})
                      </p>
                      <p className="text-amber-300 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{(eventDetails ?? EVENT_DETAILS).dateString}</span>
                      </p>
                      <p className="text-stone-300 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{(eventDetails ?? EVENT_DETAILS).locationName}</span>
                      </p>
                      <p className="text-orange-400 font-semibold">
                        Meko: {t.mekoLevel}
                      </p>
                    </div>

                    <div className="sm:col-span-4 bg-white p-2 rounded-xl flex flex-col items-center justify-center">
                      <img
                        src={sanitizeImageUrl(t.qrCodeUrl)}
                        alt="QR code"
                        referrerPolicy="no-referrer"
                        className="w-20 h-20 object-contain"
                      />
                      <span className="text-[8px] font-mono font-bold text-stone-800 mt-0.5">
                        ENTRY QR CODE
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => downloadTicketImage(t, eventDetails)}
                    className="mt-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-black text-xs transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    DOWNLOAD TICKET
                  </button>
                </div>
              ))}

              <div className="pt-2 flex justify-end">
                <button
                  onClick={onClearTickets}
                  className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Saved Passes</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-stone-50 border-t border-stone-200 text-center">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-stone-900 text-white font-extrabold text-xs hover:bg-stone-800 transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
