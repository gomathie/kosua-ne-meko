import { useState, useEffect } from 'react';
import { FullEventData, EventDetails, Vendor, ScheduleItem, Collaborator, Sponsor, GalleryItem, EventItem, AdminUser } from '../types';
import { EVENT_DETAILS, VENDORS, SCHEDULE_ITEMS, INITIAL_COLLABORATORS, INITIAL_SPONSORS, INITIAL_GALLERY, INITIAL_EVENTS_LIST, INITIAL_ADMIN_USERS } from '../data/eventData';

const STORAGE_KEY = 'kosua_event_data_v3';
const EVENT_CHANGE_NOTIFICATION = 'kosua_event_data_changed';

const defaultData: FullEventData = {
  eventDetails: EVENT_DETAILS,
  eventsList: INITIAL_EVENTS_LIST,
  adminUsers: INITIAL_ADMIN_USERS,
  vendors: VENDORS,
  schedule: SCHEDULE_ITEMS,
  collaborators: INITIAL_COLLABORATORS,
  sponsors: INITIAL_SPONSORS,
  gallery: INITIAL_GALLERY,
};

export function getStoredEventData(): FullEventData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData;
    const parsed = JSON.parse(raw);
    
    // Merge initial sponsors missing from stored array
    const storedSponsors: Sponsor[] = parsed.sponsors || [];
    const missingInitialSponsors = INITIAL_SPONSORS.filter(
      (initSpon) => !storedSponsors.some((s) => s.id === initSpon.id || s.name === initSpon.name)
    );

    return {
      eventDetails: { ...defaultData.eventDetails, ...(parsed.eventDetails || {}) },
      eventsList: parsed.eventsList || defaultData.eventsList,
      adminUsers: parsed.adminUsers || defaultData.adminUsers,
      vendors: parsed.vendors || defaultData.vendors,
      schedule: parsed.schedule || defaultData.schedule,
      collaborators: parsed.collaborators || defaultData.collaborators,
      sponsors: [...storedSponsors, ...missingInitialSponsors],
      gallery: parsed.gallery || defaultData.gallery,
    };
  } catch (err) {
    console.error('Failed to load event data from storage', err);
    return defaultData;
  }
}

export function saveStoredEventData(data: FullEventData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event(EVENT_CHANGE_NOTIFICATION));
  } catch (err) {
    console.error('Failed to save event data to storage', err);
  }
}

export function resetEventDataToDefault(): FullEventData {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event(EVENT_CHANGE_NOTIFICATION));
  } catch (err) {
    console.error('Failed to reset event data', err);
  }
  return defaultData;
}

export function useEventData(): {
  data: FullEventData;
  updateEventDetails: (details: Partial<EventDetails>) => void;
  addEventItem: (event: Omit<EventItem, 'id'>) => void;
  updateEventItem: (eventItem: EventItem) => void;
  setActiveEvent: (id: string) => void;
  deleteEventItem: (id: string) => void;
  addAdminUser: (user: Omit<AdminUser, 'id' | 'createdDate'>) => void;
  deleteAdminUser: (id: string) => void;
  addVendor: (vendor: Omit<Vendor, 'id'>) => void;
  updateVendor: (vendor: Vendor) => void;
  deleteVendor: (id: string) => void;
  addScheduleItem: (item: ScheduleItem) => void;
  updateScheduleItem: (index: number, item: ScheduleItem) => void;
  deleteScheduleItem: (index: number) => void;
  addCollaborator: (collaborator: Omit<Collaborator, 'id'>) => void;
  updateCollaborator: (collaborator: Collaborator) => void;
  deleteCollaborator: (id: string) => void;
  addSponsor: (sponsor: Omit<Sponsor, 'id'>) => void;
  updateSponsor: (sponsor: Sponsor) => void;
  deleteSponsor: (id: string) => void;
  addGalleryItem: (item: Omit<GalleryItem, 'id'>) => void;
  deleteGalleryItem: (id: string) => void;
  resetAll: () => void;
} {
  const [data, setData] = useState<FullEventData>(getStoredEventData());

  useEffect(() => {
    const handleStorageChange = () => {
      setData(getStoredEventData());
    };
    window.addEventListener(EVENT_CHANGE_NOTIFICATION, handleStorageChange);
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener(EVENT_CHANGE_NOTIFICATION, handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const updateEventDetails = (newDetails: Partial<EventDetails>) => {
    const updatedDetails = { ...data.eventDetails, ...newDetails };
    // also sync active event in eventsList
    const updatedList = data.eventsList.map((e) => {
      if (e.status === 'active') {
        return {
          ...e,
          title: updatedDetails.title,
          shortTitle: updatedDetails.shortTitle,
          tagline: updatedDetails.tagline,
          dateString: updatedDetails.dateString,
          targetDateISO: updatedDetails.targetDateISO,
          time: updatedDetails.time,
          locationName: updatedDetails.locationName,
          city: updatedDetails.city,
          fullAddress: updatedDetails.fullAddress,
          organizer: updatedDetails.organizer,
          hashtag: updatedDetails.hashtag,
        };
      }
      return e;
    });

    const updated: FullEventData = {
      ...data,
      eventDetails: updatedDetails,
      eventsList: updatedList,
    };
    saveStoredEventData(updated);
  };

  const addEventItem = (event: Omit<EventItem, 'id'>) => {
    const newId = 'event-' + Date.now();
    const newEventItem: EventItem = { ...event, id: newId };
    
    let updatedList = [...data.eventsList];
    let updatedDetails = { ...data.eventDetails };

    if (event.status === 'active') {
      // mark others as upcoming
      updatedList = updatedList.map((e) => ({ ...e, status: 'upcoming' as const }));
      updatedDetails = {
        ...updatedDetails,
        title: event.title,
        shortTitle: event.shortTitle,
        tagline: event.tagline,
        dateString: event.dateString,
        targetDateISO: event.targetDateISO,
        time: event.time,
        locationName: event.locationName,
        city: event.city,
        fullAddress: event.fullAddress,
        organizer: event.organizer,
        hashtag: event.hashtag,
      };
    }

    updatedList.unshift(newEventItem);

    const updated: FullEventData = {
      ...data,
      eventDetails: updatedDetails,
      eventsList: updatedList,
    };
    saveStoredEventData(updated);
  };

  const setActiveEvent = (id: string) => {
    const targetEvent = data.eventsList.find((e) => e.id === id);
    if (!targetEvent) return;

    const updatedList = data.eventsList.map((e) => ({
      ...e,
      status: (e.id === id ? 'active' : 'upcoming') as 'active' | 'upcoming',
    }));

    const updatedDetails: EventDetails = {
      ...data.eventDetails,
      title: targetEvent.title,
      shortTitle: targetEvent.shortTitle,
      tagline: targetEvent.tagline,
      dateString: targetEvent.dateString,
      targetDateISO: targetEvent.targetDateISO,
      time: targetEvent.time,
      locationName: targetEvent.locationName,
      city: targetEvent.city,
      fullAddress: targetEvent.fullAddress,
      organizer: targetEvent.organizer,
      hashtag: targetEvent.hashtag,
    };

    const updated: FullEventData = {
      ...data,
      eventDetails: updatedDetails,
      eventsList: updatedList,
    };
    saveStoredEventData(updated);
  };

  const deleteEventItem = (id: string) => {
    const updatedList = data.eventsList.filter((e) => e.id !== id);
    const updated: FullEventData = {
      ...data,
      eventsList: updatedList,
    };
    saveStoredEventData(updated);
  };

  const addAdminUser = (user: Omit<AdminUser, 'id' | 'createdDate'>) => {
    const newUser: AdminUser = {
      ...user,
      id: 'admin-' + Date.now(),
      createdDate: new Date().toISOString().split('T')[0],
    };
    const updated: FullEventData = {
      ...data,
      adminUsers: [newUser, ...data.adminUsers],
    };
    saveStoredEventData(updated);
  };

  const deleteAdminUser = (id: string) => {
    const updated: FullEventData = {
      ...data,
      adminUsers: data.adminUsers.filter((u) => u.id !== id),
    };
    saveStoredEventData(updated);
  };

  const addVendor = (vendor: Omit<Vendor, 'id'>) => {
    const newVendor: Vendor = {
      ...vendor,
      id: 'v-' + Date.now(),
    };
    const updated: FullEventData = {
      ...data,
      vendors: [newVendor, ...data.vendors],
    };
    saveStoredEventData(updated);
  };

  const updateVendor = (vendor: Vendor) => {
    const updated: FullEventData = {
      ...data,
      vendors: data.vendors.map((v) => (v.id === vendor.id ? vendor : v)),
    };
    saveStoredEventData(updated);
  };

  const updateEventItem = (eventItem: EventItem) => {
    const updatedList = data.eventsList.map((e) => (e.id === eventItem.id ? eventItem : e));
    let updatedDetails = { ...data.eventDetails };
    if (eventItem.status === 'active') {
      updatedDetails = {
        ...updatedDetails,
        title: eventItem.title,
        shortTitle: eventItem.shortTitle,
        tagline: eventItem.tagline,
        dateString: eventItem.dateString,
        targetDateISO: eventItem.targetDateISO,
        time: eventItem.time,
        locationName: eventItem.locationName,
        city: eventItem.city,
        fullAddress: eventItem.fullAddress,
        organizer: eventItem.organizer,
        hashtag: eventItem.hashtag,
      };
    }
    const updated: FullEventData = {
      ...data,
      eventsList: updatedList,
      eventDetails: updatedDetails,
    };
    saveStoredEventData(updated);
  };

  const updateScheduleItem = (index: number, item: ScheduleItem) => {
    const updatedSchedule = [...data.schedule];
    updatedSchedule[index] = item;
    const updated: FullEventData = {
      ...data,
      schedule: updatedSchedule,
    };
    saveStoredEventData(updated);
  };

  const updateCollaborator = (collaborator: Collaborator) => {
    const updated: FullEventData = {
      ...data,
      collaborators: data.collaborators.map((c) => (c.id === collaborator.id ? collaborator : c)),
    };
    saveStoredEventData(updated);
  };

  const updateSponsor = (sponsor: Sponsor) => {
    const updated: FullEventData = {
      ...data,
      sponsors: data.sponsors.map((s) => (s.id === sponsor.id ? sponsor : s)),
    };
    saveStoredEventData(updated);
  };

  const deleteVendor = (id: string) => {
    const updated: FullEventData = {
      ...data,
      vendors: data.vendors.filter((v) => v.id !== id),
    };
    saveStoredEventData(updated);
  };

  const addScheduleItem = (item: ScheduleItem) => {
    const updated: FullEventData = {
      ...data,
      schedule: [...data.schedule, item],
    };
    saveStoredEventData(updated);
  };

  const deleteScheduleItem = (index: number) => {
    const updated: FullEventData = {
      ...data,
      schedule: data.schedule.filter((_, i) => i !== index),
    };
    saveStoredEventData(updated);
  };

  const addCollaborator = (collaborator: Omit<Collaborator, 'id'>) => {
    const newCollab: Collaborator = {
      ...collaborator,
      id: 'collab-' + Date.now(),
    };
    const updated: FullEventData = {
      ...data,
      collaborators: [...data.collaborators, newCollab],
    };
    saveStoredEventData(updated);
  };

  const deleteCollaborator = (id: string) => {
    const updated: FullEventData = {
      ...data,
      collaborators: data.collaborators.filter((c) => c.id !== id),
    };
    saveStoredEventData(updated);
  };

  const addSponsor = (sponsor: Omit<Sponsor, 'id'>) => {
    const newSponsor: Sponsor = {
      ...sponsor,
      id: 'spon-' + Date.now(),
    };
    const updated: FullEventData = {
      ...data,
      sponsors: [...data.sponsors, newSponsor],
    };
    saveStoredEventData(updated);
  };

  const deleteSponsor = (id: string) => {
    const updated: FullEventData = {
      ...data,
      sponsors: data.sponsors.filter((s) => s.id !== id),
    };
    saveStoredEventData(updated);
  };

  const addGalleryItem = (item: Omit<GalleryItem, 'id'>) => {
    const newItem: GalleryItem = {
      ...item,
      id: 'gal-' + Date.now(),
    };
    const updated: FullEventData = {
      ...data,
      gallery: [newItem, ...data.gallery],
    };
    saveStoredEventData(updated);
  };

  const deleteGalleryItem = (id: string) => {
    const updated: FullEventData = {
      ...data,
      gallery: data.gallery.filter((g) => g.id !== id),
    };
    saveStoredEventData(updated);
  };

  const resetAll = () => {
    resetEventDataToDefault();
  };

  return {
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
    resetAll,
  };
}
