import React, { useState, useEffect } from 'react';
import { Ticket, UserCheck, Flame, Calendar } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { EventHighlights } from './components/EventHighlights';
import { PepperMeter } from './components/PepperMeter';
import { Schedule } from './components/Schedule';
import { Vendors } from './components/Vendors';
import { GallerySection } from './components/GallerySection';
import { SponsorsSection } from './components/SponsorsSection';
import { UpcomingEventsSection } from './components/UpcomingEventsSection';
import { LocationMap } from './components/LocationMap';
import { OrganizerSection } from './components/OrganizerSection';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';
import { TicketModal } from './components/TicketModal';
import { MyTicketsModal } from './components/MyTicketsModal';
import { AdminPortal } from './components/AdminPortal';
import { UserTicket } from './types';
import { useEventData } from './utils/eventStore';
import { sanitizeUserTickets } from './utils/sanitize';

/**
 * Discreet entry points for the Admin Portal. The path form needs SPA history
 * fallback on the host; the hash form works on any static host, so both are
 * accepted.
 */
const ADMIN_PATH = '/adm';
const ADMIN_HASH = '#adm';

export default function App() {
  const {
    data,
    updateEventDetails,
    addEventItem,
    updateEventItem,
    setActiveEvent,
    deleteEventItem,
    addAdminUser,
    deleteAdminUser,
    addVendor,
    updateVendor,
    deleteVendor,
    addScheduleItem,
    updateScheduleItem,
    deleteScheduleItem,
    addCollaborator,
    updateCollaborator,
    deleteCollaborator,
    addSponsor,
    updateSponsor,
    deleteSponsor,
    addGalleryItem,
    deleteGalleryItem,
    addFaq,
    updateFaq,
    deleteFaq,
    restoreMissing,
    addCategory,
    deleteCategory,
    resetAll,
  } = useEventData();

  const [tickets, setTickets] = useState<UserTicket[]>([]);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [isMyTicketsOpen, setIsMyTicketsOpen] = useState(false);
  /** The portal is a route, not an overlay — when true it replaces the site. */
  const [isAdminRoute, setIsAdminRoute] = useState(false);

  // Load saved tickets & check for the admin entry point in the URL
  useEffect(() => {
    try {
      const saved = localStorage.getItem('kosua_tickets');
      if (saved) {
        setTickets(sanitizeUserTickets(JSON.parse(saved)));
      }
    } catch (err) {
      console.error('Failed to load tickets from storage', err);
    }

    // Re-evaluated on every navigation, so leaving the portal (or pressing Back)
    // returns to the site rather than leaving it stuck open.
    const checkAdminUrl = () => {
      // Trailing slashes are ignored; endsWith keeps this working when the site
      // is served from a subdirectory.
      const path = window.location.pathname.replace(/\/+$/, '');
      const onAdminRoute =
        path === ADMIN_PATH || path.endsWith(ADMIN_PATH) || window.location.hash === ADMIN_HASH;
      setIsAdminRoute(onAdminRoute);
    };
    checkAdminUrl();
    window.addEventListener('hashchange', checkAdminUrl);
    window.addEventListener('popstate', checkAdminUrl);
    return () => {
      window.removeEventListener('hashchange', checkAdminUrl);
      window.removeEventListener('popstate', checkAdminUrl);
    };
  }, []);

  /** Navigates to the portal without a reload, so it behaves like a real page. */
  const openAdminPortal = () => {
    window.history.pushState({}, '', ADMIN_PATH);
    setIsAdminRoute(true);
    window.scrollTo({ top: 0 });
  };

  const leaveAdminPortal = () => {
    // Clears the hash form too, otherwise #adm would re-open the portal.
    window.history.pushState({}, '', '/');
    setIsAdminRoute(false);
  };

  const handleTicketBooked = (newTicket: UserTicket) => {
    const updated = [newTicket, ...tickets];
    setTickets(updated);
    try {
      localStorage.setItem('kosua_tickets', JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to save ticket to storage', err);
    }
  };

  const handleClearTickets = () => {
    setTickets([]);
    try {
      localStorage.removeItem('kosua_tickets');
    } catch (err) {
      console.error('Failed to clear tickets from storage', err);
    }
  };

  // The portal is a page in its own right: it replaces the site rather than
  // floating over it, so none of the festival chrome renders behind it.
  if (isAdminRoute) {
    return (
      <div className="font-sans antialiased selection:bg-orange-500 selection:text-white">
        <AdminPortal
          onClose={leaveAdminPortal}
          eventDetails={data.eventDetails}
          eventsList={data.eventsList}
          adminUsers={data.adminUsers}
          vendors={data.vendors}
          schedule={data.schedule}
          collaborators={data.collaborators}
          sponsors={data.sponsors}
          gallery={data.gallery}
          onUpdateEventDetails={updateEventDetails}
          onAddEventItem={addEventItem}
          onUpdateEventItem={updateEventItem}
          onSetActiveEvent={setActiveEvent}
          onDeleteEventItem={deleteEventItem}
          onAddAdminUser={addAdminUser}
          onDeleteAdminUser={deleteAdminUser}
          onAddVendor={addVendor}
          onUpdateVendor={updateVendor}
          onDeleteVendor={deleteVendor}
          onAddScheduleItem={addScheduleItem}
          onUpdateScheduleItem={updateScheduleItem}
          onDeleteScheduleItem={deleteScheduleItem}
          onAddCollaborator={addCollaborator}
          onUpdateCollaborator={updateCollaborator}
          onDeleteCollaborator={deleteCollaborator}
          onAddSponsor={addSponsor}
          onUpdateSponsor={updateSponsor}
          onDeleteSponsor={deleteSponsor}
          onAddGalleryItem={addGalleryItem}
          onDeleteGalleryItem={deleteGalleryItem}
          faqs={data.faqs}
          onAddFaq={addFaq}
          onUpdateFaq={updateFaq}
          onDeleteFaq={deleteFaq}
          categories={data.categories}
          onAddCategory={addCategory}
          onDeleteCategory={deleteCategory}
          onRestoreMissing={restoreMissing}
          onResetAll={resetAll}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-stone-900 font-sans antialiased selection:bg-orange-500 selection:text-white relative">

      {/* Navigation Bar */}
      <Navbar
        eventDetails={data.eventDetails}
        onOpenTickets={() => setIsTicketModalOpen(true)}
        onOpenMyTickets={() => setIsMyTicketsOpen(true)}
        ticketCount={tickets.length}
      />

      {/* Main Sections */}
      <main className="pb-20 md:pb-0">
        <Hero eventDetails={data.eventDetails} onOpenTickets={() => setIsTicketModalOpen(true)} />
        <EventHighlights />
        <PepperMeter />
        <Schedule schedule={data.schedule} dateString={data.eventDetails.dateString} locationName={data.eventDetails.locationName} categories={data.categories.schedule} />
        <Vendors vendors={data.vendors} categories={data.categories.vendors} />
        <GallerySection gallery={data.gallery} categories={data.categories.gallery} />
        <UpcomingEventsSection events={data.eventsList} onOpenTickets={() => setIsTicketModalOpen(true)} />
        <SponsorsSection collaborators={data.collaborators} sponsors={data.sponsors} />
        <LocationMap eventDetails={data.eventDetails} />
        <OrganizerSection eventDetails={data.eventDetails} />
        <FaqSection eventDetails={data.eventDetails} faqs={data.faqs} />
      </main>

      {/* Footer */}
      <Footer eventDetails={data.eventDetails} onOpenAdmin={openAdminPortal} />

      {/* Floating Sticky Mobile Quick Action Bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-stone-900/95 backdrop-blur-lg border-t border-stone-800 p-3 shadow-2xl flex items-center justify-between gap-2 text-white">
        <div className="flex items-center gap-2 pl-1">
          <div className="w-8 h-8 rounded-xl bg-orange-600/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-black text-white block uppercase tracking-wide">{data.eventDetails.dateString}</span>
            <span className="text-[9px] font-semibold text-stone-400 block">{data.eventDetails.city}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {tickets.length > 0 && (
            <button
              id="btn-mobile-my-tickets"
              onClick={() => setIsMyTicketsOpen(true)}
              className="p-2.5 rounded-xl bg-stone-800 text-emerald-400 hover:bg-stone-700 transition-colors border border-stone-700 flex items-center gap-1.5"
              aria-label="View My Tickets"
            >
              <UserCheck className="w-4 h-4" />
              <span className="text-xs font-bold">{tickets.length}</span>
            </button>
          )}

          <button
            id="btn-mobile-get-ticket"
            onClick={() => setIsTicketModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-600/30 flex items-center gap-2 transition-transform active:scale-95"
          >
            <Ticket className="w-4 h-4" />
            <span>Get Free Ticket</span>
          </button>
        </div>
      </div>

      {/* Modals */}
      <TicketModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        onTicketBooked={handleTicketBooked}
        eventDetails={data.eventDetails}
      />

      <MyTicketsModal
        isOpen={isMyTicketsOpen}
        onClose={() => setIsMyTicketsOpen(false)}
        tickets={tickets}
        onClearTickets={handleClearTickets}
        eventDetails={data.eventDetails}
      />

    </div>
  );
}
