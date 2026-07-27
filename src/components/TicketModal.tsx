import React, { useState } from 'react';
import { X, Ticket, Check, Sparkles, Flame, User, Mail, Phone, ShoppingCart, QrCode, Download, Share2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { TICKET_PASSES, EVENT_DETAILS, PEPPER_LEVELS } from '../data/eventData';
import { EventDetails, TicketPass, UserTicket } from '../types';
import { downloadTicketImage } from '../utils/downloadTicket';

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTicketBooked: (newTicket: UserTicket) => void;
  eventDetails?: EventDetails;
}

export const TicketModal: React.FC<TicketModalProps> = ({ isOpen, onClose, onTicketBooked, eventDetails }) => {
  const [selectedPass, setSelectedPass] = useState<TicketPass>(TICKET_PASSES[1]); // Default VIP
  const [quantity, setQuantity] = useState<number>(1);
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [mekoPreference, setMekoPreference] = useState('Classic Accra Red Meko');
  const [bookedTicket, setBookedTicket] = useState<UserTicket | null>(null);

  if (!isOpen) return null;

  const isBookingClosed = eventDetails?.isBookingOpen === false;

  const totalGHS = selectedPass.priceGHS * quantity;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !email || !phone) return;

    // Trigger celebratory confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ea580c', '#f59e0b', '#10b981', '#ffffff'],
    });

    const ticketId = 'KNM2-' + Math.floor(100000 + Math.random() * 900000);
    const newTicket: UserTicket = {
      id: ticketId,
      passId: selectedPass.id,
      passName: selectedPass.name,
      customerName,
      email,
      phone,
      quantity,
      totalGHS,
      mekoLevel: mekoPreference,
      purchaseDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(ticketId + '-' + customerName)}`,
    };

    setBookedTicket(newTicket);
    onTicketBooked(newTicket);
  };

  const handleReset = () => {
    setBookedTicket(null);
    setCustomerName('');
    setEmail('');
    setPhone('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-orange-950 p-6 text-white flex items-center justify-between border-b border-stone-700">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-orange-600 text-white font-black">
              <Ticket className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black font-display tracking-tight uppercase">
                RSVP — FREE ENTRY
              </h3>
              <p className="text-xs text-amber-400 font-semibold">
                {EVENT_DETAILS.title} • {EVENT_DETAILS.dateString}
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

        {/* Content Body */}
        {!bookedTicket ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            
            {/* Step 1: Pass Selection */}
            <div className="space-y-3">
              <label className="text-xs font-black uppercase text-stone-500 tracking-wider block">
                1. SELECT YOUR EVENT PASS
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {TICKET_PASSES.map((pass) => {
                  const isSelected = selectedPass.id === pass.id;
                  return (
                    <div
                      key={pass.id}
                      onClick={() => setSelectedPass(pass)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between relative ${
                        isSelected
                          ? 'border-orange-600 bg-orange-50/50 shadow-md scale-[1.02]'
                          : 'border-stone-200 hover:border-stone-300 bg-white'
                      }`}
                    >
                      {pass.popular && (
                        <span className="absolute -top-2.5 right-3 bg-orange-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-sm">
                          POPULAR
                        </span>
                      )}
                      <div>
                        <h4 className="font-extrabold text-sm text-stone-900 leading-snug">
                          {pass.name}
                        </h4>
                        <div className="text-lg font-black text-orange-600 font-display mt-1">
                          {pass.priceGHS === 0 ? 'FREE' : `GHS ${pass.priceGHS}`}
                        </div>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-2 line-clamp-2">
                        {pass.description}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Selected Pass Perks */}
              <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 text-xs space-y-1">
                <span className="font-black text-stone-700 uppercase block text-[10px]">
                  INCLUDED WITH {selectedPass.name}:
                </span>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-stone-600">
                  {selectedPass.perks.map((perk, i) => (
                    <li key={i} className="flex items-center gap-1.5 font-medium">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Step 2: Contact Details */}
            <div className="space-y-3 pt-2 border-t border-stone-100">
              <label className="text-xs font-black uppercase text-stone-500 tracking-wider block">
                2. ATTENDEE INFORMATION
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Full Name *</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kwame Mensah"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Email Address *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="kwame@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Ghana Phone Number *</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      required
                      placeholder="+233 24 123 4567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Quantity</label>
                  <select
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'Pass' : 'Passes'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Preferred Meko Spice Level
                </label>
                <select
                  value={mekoPreference}
                  onChange={(e) => setMekoPreference(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                >
                  {PEPPER_LEVELS.map((lvl) => (
                    <option key={lvl.id} value={lvl.name}>
                      {lvl.emoji} {lvl.name} ({lvl.scoville})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {isBookingClosed && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 text-center space-y-1">
                <p className="text-xs font-black uppercase">🔴 PRE-BOOKING CURRENTLY INACTIVE</p>
                <p className="text-[11px] font-semibold text-stone-700">RSVP & pre-booking for this event edition is not active yet. Check back soon!</p>
              </div>
            )}

            {/* Total Footer */}
            <div className="pt-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-stone-500 block uppercase">ADMISSION</span>
                <span className="text-2xl font-black text-emerald-600 font-display">
                  🎉 FREE
                </span>
              </div>

              <button
                type="submit"
                disabled={isBookingClosed}
                className={`px-8 py-3.5 rounded-xl font-black text-sm shadow-lg transition-all flex items-center gap-2 ${
                  isBookingClosed
                    ? 'bg-stone-300 text-stone-500 cursor-not-allowed shadow-none'
                    : 'bg-orange-600 hover:bg-orange-700 text-white shadow-orange-600/30'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                <span>{isBookingClosed ? 'PRE-BOOKING INACTIVE' : 'CONFIRM FREE RSVP'}</span>
              </button>
            </div>

          </form>
        ) : (
          /* Booked Ticket Success Ticket Card Display */
          <div className="p-6 sm:p-8 space-y-6 text-stone-900 animate-in zoom-in-95 duration-200">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center font-bold text-2xl shadow-inner">
                ✓
              </div>
              <h3 className="text-2xl font-black font-display uppercase text-stone-900">
                PASS CONFIRMED!
              </h3>
              <p className="text-xs text-stone-600 max-w-sm mx-auto">
                Your ticket for Kosua Ne Meko Hangout 2.0 is saved! Present this QR code pass at the entrance on Sept 5.
              </p>
            </div>

            {/* Digital Ticket Pass Card */}
            <div className="bg-gradient-to-br from-stone-900 to-orange-950 text-white rounded-3xl p-6 border-2 border-orange-500 shadow-2xl relative overflow-hidden space-y-4">
              
              <div className="flex items-center justify-between border-b border-stone-700 pb-3">
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                    DIGITAL PASS • ID: {bookedTicket.id}
                  </span>
                  <h4 className="text-xl font-black font-display uppercase text-white">
                    {bookedTicket.passName}
                  </h4>
                </div>
                <div className="bg-orange-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase">
                  {bookedTicket.quantity} x Pass
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                
                <div className="sm:col-span-8 space-y-2 text-xs">
                  <div>
                    <span className="text-stone-400 block text-[10px] uppercase font-bold">ATTENDEE NAME</span>
                    <span className="font-extrabold text-sm text-white">{bookedTicket.customerName}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase font-bold">DATE & TIME</span>
                      <span className="font-bold text-amber-300">{EVENT_DETAILS.dateString}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase font-bold">LOCATION</span>
                      <span className="font-bold text-stone-200">North Dzorwulu</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-stone-400 block text-[10px] uppercase font-bold">MEKO CHOICE</span>
                    <span className="font-bold text-orange-400">{bookedTicket.mekoLevel}</span>
                  </div>
                </div>

                {/* QR Code */}
                <div className="sm:col-span-4 bg-white p-3 rounded-2xl flex flex-col items-center justify-center">
                  <img
                    src={bookedTicket.qrCodeUrl}
                    alt="Ticket QR Code"
                    referrerPolicy="no-referrer"
                    className="w-28 h-28 object-contain"
                  />
                  <span className="text-[9px] font-mono font-bold text-stone-700 mt-1">
                    SCAN AT GATE
                  </span>
                </div>

              </div>

              <div className="pt-2 border-t border-stone-800 text-[10px] text-stone-400 flex justify-between">
                <span>Organized by Ekow Sam Farms</span>
                <span>FREE ENTRY</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => downloadTicketImage(bookedTicket)}
                className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-black text-sm shadow-lg shadow-orange-600/30 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Download className="w-5 h-5" />
                DOWNLOAD TICKET
              </button>
              <button
                onClick={handleReset}
                className="flex-1 py-3.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-extrabold text-sm transition-colors"
              >
                CLOSE & RETURN
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
