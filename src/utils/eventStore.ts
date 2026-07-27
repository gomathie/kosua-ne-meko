import { useState, useEffect } from 'react';
import { FullEventData, EventDetails, Vendor, ScheduleItem, Collaborator, Sponsor, GalleryItem } from '../types';
import { EVENT_DETAILS, VENDORS, SCHEDULE_ITEMS, INITIAL_COLLABORATORS, INITIAL_SPONSORS, INITIAL_GALLERY } from '../data/eventData';

const STORAGE_KEY = 'kosua_event_data_v2';
const EVENT_CHANGE_NOTIFICATION = 'kosua_event_data_changed';

const defaultData: FullEventData = {
  eventDetails: EVENT_DETAILS,
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
  addVendor: (vendor: Omit<Vendor, 'id'>) => void;
  updateVendor: (vendor: Vendor) => void;
  deleteVendor: (id: string) => void;
  addScheduleItem: (item: ScheduleItem) => void;
  deleteScheduleItem: (index: number) => void;
  addCollaborator: (collaborator: Omit<Collaborator, 'id'>) => void;
  deleteCollaborator: (id: string) => void;
  addSponsor: (sponsor: Omit<Sponsor, 'id'>) => void;
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
    const updated: FullEventData = {
      ...data,
      eventDetails: { ...data.eventDetails, ...newDetails },
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
    addVendor,
    updateVendor,
    deleteVendor,
    addScheduleItem,
    deleteScheduleItem,
    addCollaborator,
    deleteCollaborator,
    addSponsor,
    deleteSponsor,
    addGalleryItem,
    deleteGalleryItem,
    resetAll,
  };
}

