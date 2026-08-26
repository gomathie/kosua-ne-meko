import React, { useState, useEffect, useRef } from 'react';
import { X, Ticket, Check, Sparkles, Flame, User, Mail, Phone, ShoppingCart, QrCode, Download, Share2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { TICKET_PASSES, EVENT_DETAILS, PEPPER_LEVELS } from '../data/eventData';
import { EventDetails, TicketPass, UserTicket } from '../types';
import { downloadTicketImage } from '../utils/downloadTicket';
import { LIMITS, MAX_PARTY_SIZE, sanitizeText, sanitizeEmail, sanitizePhone, sanitizeInt, isValidEmail, isValidPhone } from '../utils/sanitize';

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
  const [errors, setErrors] = useState<{ name?: string; email?: string; phone?: string }>({});
  type ChannelResult = 'sent' | 'failed' | 'skipped';
  const [confirmStatus, setConfirmStatus] = useState<
    { state: 'idle' | 'sending' | 'error' } | { state: 'done'; sms: ChannelResult; email: ChannelResult }
  >({ state: 'idle' });

  // --- Turnstile -----------------------------------------------------------
  // The site key is public by design; the matching secret lives only on the
  // server, where /api/rsvp verifies the token before spending money on sends.
  const turnstileSiteKey = import.meta.env?.VITE_TURNSTILE_SITE_KEY ?? '';
  const turnstileRef = useRef<HTMLDivElement | null>(null);
  const turnstileWidgetId = useRef<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState('');

  // Render the widget once the modal is showing the form. The Turnstile script
  // loads async, so poll briefly for the global rather than assuming it is ready.
  useEffect(() => {
    if (!isOpen || bookedTicket || !turnstileSiteKey) return;

    let cancelled = false;
    let pollId: number | undefined;

    const mount = () => {
      if (cancelled || !turnstileRef.current || turnstileWidgetId.current) return;
      if (!window.turnstile) {
        pollId = window.setTimeout(mount, 200);
        return;
      }
      turnstileWidgetId.current = window.turnstile.render(turnstileRef.current, {
        sitekey: turnstileSiteKey,
        action: 'turnstile-spin-v1',
        callback: (token) => setTurnstileToken(token),
        'expired-callback': () => setTurnstileToken(''),
        'error-callback': () => setTurnstileToken(''),
      });
    };
    mount();

    return () => {
      cancelled = true;
      if (pollId) window.clearTimeout(pollId);
      if (turnstileWidgetId.current && window.turnstile) {
        window.turnstile.remove(turnstileWidgetId.current);
      }
      turnstileWidgetId.current = null;
    };
  }, [isOpen, bookedTicket, turnstileSiteKey]);

  if (!isOpen) return null;

  // Live event data when available, seed only as a last resort — reading the
  // static seed directly is what made admin edits fail to appear here.
  const ev = eventDetails ?? EVENT_DETAILS;
  const isBookingClosed = eventDetails?.isBookingOpen === false;
  // Only gate on Turnstile when it is actually configured, so a deployment
  // without a site key still works locally.
  const needsTurnstile = Boolean(turnstileSiteKey);

  const isFamilyPass = selectedPass.id === 'family-pass';
  const totalGHS = selectedPass.priceGHS * quantity;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Clean first, then validate what is left — a field of nothing but spaces or
    // zero-width characters must not count as "filled in".
    const cleanName = sanitizeText(customerName, LIMITS.name);
    const cleanEmail = sanitizeEmail(email);
    const cleanPhone = sanitizePhone(phone);
    const cleanQuantity = sanitizeInt(quantity, 1, MAX_PARTY_SIZE, 1);
    const cleanMeko = sanitizeText(mekoPreference, LIMITS.shortText);

    const nextErrors: typeof errors = {};
    if (cleanName.length < 2) nextErrors.name = 'Please enter your full name.';
    // Optional: only complain when something was typed and it is malformed.
    if (email.trim() && !isValidEmail(email)) nextErrors.email = 'That email address is not valid.';
    if (!isValidPhone(phone)) nextErrors.phone = 'Enter a valid Ghana number, e.g. 024 123 4567.';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    // Reflect the cleaned values back so the attendee sees exactly what was saved.
    setCustomerName(cleanName);
    setEmail(cleanEmail);
    setPhone(cleanPhone);

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
      customerName: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      quantity: cleanQuantity,
      totalGHS: selectedPass.priceGHS * cleanQuantity,
      mekoLevel: cleanMeko,
      purchaseDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(ticketId + '-' + cleanName)}`,
    };

    setBookedTicket(newTicket);
    onTicketBooked(newTicket);

    // The pass is already saved locally and valid — the confirmations are a
    // courtesy, so a failure here is reported but never blocks the RSVP.
    setConfirmStatus({ state: 'sending' });
    fetch('/api/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: cleanName,
        phone: cleanPhone,
        email: cleanEmail,
        ticketId,
        passName: selectedPass.name,
        quantity: cleanQuantity,
        mekoLevel: cleanMeko,
        eventTitle: eventDetails?.title ?? '',
        eventDate: eventDetails?.dateString ?? '',
        venue: eventDetails?.locationName ?? '',
        turnstileToken,
      }),
    })
      .then(async (res) => {
        const body = (await res.json().catch(() => null)) as
          | { sms?: ChannelResult; email?: ChannelResult }
          | null;
        if (!res.ok || !body) {
          setConfirmStatus({ state: 'error' });
          return;
        }
        setConfirmStatus({ state: 'done', sms: body.sms ?? 'skipped', email: body.email ?? 'skipped' });
      })
      .catch(() => setConfirmStatus({ state: 'error' }));
  };

  const handleReset = () => {
    setBookedTicket(null);
    setCustomerName('');
    setEmail('');
    setPhone('');
    setErrors({});
    setConfirmStatus({ state: 'idle' });
    onClose();
  };

  const fieldClasses = (hasError: boolean) =>
    `w-full pl-9 pr-3 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-2 ${
      hasError
        ? 'border-red-400 bg-red-50 focus:ring-red-500'
        : 'border-stone-300 focus:ring-orange-500'
    }`;

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
                {ev.title} • {ev.dateString}
              </p>
            </div>
          </div>
          <button
            id="btn-ticket-modal-close"
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
                      id={`btn-ticket-pass-${pass.id}`}
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
                      id="input-ticket-name"
                      type="text"
                      required
                      maxLength={LIMITS.name}
                      autoComplete="name"
                      aria-invalid={Boolean(errors.name)}
                      placeholder="e.g. Kwame Mensah"
                      value={customerName}
                      onChange={(e) => {
                        setCustomerName(e.target.value);
                        if (errors.name) setErrors({ ...errors, name: undefined });
                      }}
                      className={fieldClasses(Boolean(errors.name))}
                    />
                  </div>
                  {errors.name && <p className="text-[11px] font-bold text-red-600 mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Email Address <span className="font-normal text-stone-400">(optional)</span></label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                    <input
                      id="input-ticket-email"
                      type="email"
                      maxLength={LIMITS.email}
                      autoComplete="email"
                      aria-invalid={Boolean(errors.email)}
                      placeholder="kwame@example.com (optional)"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors({ ...errors, email: undefined });
                      }}
                      className={fieldClasses(Boolean(errors.email))}
                    />
                  </div>
                  {errors.email && <p className="text-[11px] font-bold text-red-600 mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Ghana Phone Number *</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                    <input
                      id="input-ticket-phone"
                      type="tel"
                      required
                      maxLength={LIMITS.phone}
                      autoComplete="tel"
                      inputMode="tel"
                      aria-invalid={Boolean(errors.phone)}
                      placeholder="+233 24 123 4567"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (errors.phone) setErrors({ ...errors, phone: undefined });
                      }}
                      className={fieldClasses(Boolean(errors.phone))}
                    />
                  </div>
                  {errors.phone && <p className="text-[11px] font-bold text-red-600 mt-1">{errors.phone}</p>}
                </div>

                <div>
                  {/*
                    The family ticket covers a household of any size, so the
                    count is typed rather than picked from a fixed list. Other
                    passes keep the simple dropdown.
                  */}
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    {isFamilyPass ? 'How many people? *' : 'Quantity'}
                  </label>
                  {isFamilyPass ? (
                    <input
                      id="input-ticket-quantity"
                      type="number"
                      required
                      min={1}
                      max={MAX_PARTY_SIZE}
                      inputMode="numeric"
                      value={quantity}
                      onChange={(e) => setQuantity(sanitizeInt(e.target.value, 1, MAX_PARTY_SIZE, 1))}
                      className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                    />
                  ) : (
                    <select
                      id="select-ticket-quantity"
                      value={quantity}
                      onChange={(e) => setQuantity(sanitizeInt(e.target.value, 1, MAX_PARTY_SIZE, 1))}
                      className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? 'Pass' : 'Passes'}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Preferred Meko Spice Level
                </label>
                <select
                  id="select-ticket-meko"
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

            {/* Bot check — sits directly above the submit button it gates. */}
            {needsTurnstile && !isBookingClosed && (
              <div className="space-y-2">
                <div ref={turnstileRef} />
                {!turnstileToken && (
                  <p className="text-[11px] font-semibold text-stone-500">
                    Complete the verification above to confirm your RSVP.
                  </p>
                )}
              </div>
            )}

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
                id="btn-ticket-modal-submit"
                type="submit"
                disabled={isBookingClosed || (needsTurnstile && !turnstileToken)}
                className={`px-8 py-3.5 rounded-xl font-black text-sm shadow-lg transition-all flex items-center gap-2 ${
                  isBookingClosed || (needsTurnstile && !turnstileToken)
                    ? 'bg-stone-300 text-stone-500 cursor-not-allowed shadow-none'
                    : 'bg-orange-600 hover:bg-orange-700 text-white shadow-orange-600/30'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                <span>{isBookingClosed ? 'PRE-BOOKING INACTIVE' : 'CONFIRM FREE TICKET'}</span>
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
                Your ticket for {ev.shortTitle || ev.title} is saved! Present this QR code pass at the entrance on {ev.dateString}.
              </p>

              {confirmStatus.state === 'sending' && (
                <p className="text-[11px] font-semibold text-stone-500">Sending your confirmation…</p>
              )}
              {confirmStatus.state === 'done' && (confirmStatus.sms === 'sent' || confirmStatus.email === 'sent') && (
                <p className="text-[11px] font-bold text-emerald-600">
                  Confirmation sent
                  {confirmStatus.sms === 'sent' && ` by SMS to ${bookedTicket.phone}`}
                  {confirmStatus.sms === 'sent' && confirmStatus.email === 'sent' && ' and'}
                  {confirmStatus.email === 'sent' && ` by email to ${bookedTicket.email}`}.
                </p>
              )}
              {/* A genuine send failure — distinct from confirmations simply being off. */}
              {(confirmStatus.state === 'error' ||
                (confirmStatus.state === 'done' &&
                  (confirmStatus.sms === 'failed' || confirmStatus.email === 'failed'))) && (
                <p className="text-[11px] font-semibold text-amber-700">
                  We couldn’t send your confirmation — your pass is still valid, so save or download it.
                </p>
              )}
              {/* Nothing was attempted because no channel is configured yet. */}
              {confirmStatus.state === 'done' &&
                confirmStatus.sms === 'skipped' &&
                confirmStatus.email === 'skipped' && (
                  <p className="text-[11px] font-semibold text-stone-500">
                    Save or download your pass — your ticket ID is your entry.
                  </p>
                )}
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
                  {bookedTicket.quantity} {bookedTicket.passId === 'family-pass' ? (bookedTicket.quantity === 1 ? 'person' : 'people') : 'x Pass'}
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
                      <span className="font-bold text-amber-300">{ev.dateString}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase font-bold">LOCATION</span>
                      <span className="font-bold text-stone-200">{ev.locationName}</span>
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
                id="btn-ticket-download"
                onClick={() => downloadTicketImage(bookedTicket, ev)}
                className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-black text-sm shadow-lg shadow-orange-600/30 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Download className="w-5 h-5" />
                DOWNLOAD TICKET
              </button>
              <button
                id="btn-ticket-modal-reset"
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
