import { useState, useEffect } from 'react';
import { FullEventData, EventDetails, Vendor, ScheduleItem, Collaborator, Sponsor, GalleryItem, EventItem, AdminUser, CategoryKind, FAQItem } from '../types';
import { EVENT_DETAILS, VENDORS, SCHEDULE_ITEMS, INITIAL_COLLABORATORS, INITIAL_SPONSORS, INITIAL_GALLERY, INITIAL_EVENTS_LIST, INITIAL_ADMIN_USERS, INITIAL_CATEGORIES, FAQS } from '../data/eventData';
import { sanitizeFullEventData, sanitizeCategory } from './sanitize';

/**
 * DO NOT BUMP THIS TO PUBLISH CONTENT CHANGES.
 *
 * Bumping abandons every browser's stored blob and restores the seed — which
 * silently undoes everything an admin has done, deletions included. That is why
 * items "deleted by the admin" kept reappearing after a deploy: each bump below
 * reset them.
 *
 * New fields do not need a bump. sanitizeFullEventData falls back per key, so a
 * blob written before a field existed simply picks that field up from the seed
 * while keeping the admin's own lists intact.
 *
 * Bump only for a genuinely incompatible shape change that the sanitizer cannot
 * migrate, and treat it as destroying admin data — because it does.
 *
 * History: v4 retired the seeded passcodes; v5 moved sign-in to email+password;
 * v6 removed the second admin; v7-v8 partner changes; v9 vendor groups and
 * editable FAQs; v10 the flexible line-up; v11 partner roles.
 */
const STORAGE_KEY = 'kosua_event_data_v11';
const EVENT_CHANGE_NOTIFICATION = 'kosua_event_data_changed';

const defaultData: FullEventData = {
  categories: INITIAL_CATEGORIES,
  faqs: FAQS,
  eventDetails: EVENT_DETAILS,
  eventsList: INITIAL_EVENTS_LIST,
  adminUsers: INITIAL_ADMIN_USERS,
  vendors: VENDORS,
  schedule: SCHEDULE_ITEMS,
  collaborators: INITIAL_COLLABORATORS,
  sponsors: INITIAL_SPONSORS,
  gallery: INITIAL_GALLERY,
};

/**
 * Reconciles new seed content with what a browser already has stored.
 *
 * The two obvious approaches are both wrong. Bumping STORAGE_KEY publishes new
 * seed content but wipes every admin edit and deletion. Never merging keeps
 * admin work safe but means new seed entries never reach anyone who has
 * visited before — which is why vendors added to eventData.ts appeared only
 * for first-time visitors.
 *
 * So each browser records which seed entries it has already been offered. A
 * seed entry missing from that record is genuinely new and gets merged in; one
 * that is recorded but absent from the list was deleted on purpose and stays
 * deleted. Admin-created entries are untouched either way.
 */
/**
 * Bumped when the record itself must be rebuilt rather than trusted.
 *
 * An earlier build wrote a complete record while merging nothing, so every
 * browser that loaded it believes it has already been offered the entire
 * seed and will never receive those entries. Raising this forces those
 * browsers to re-derive the record from what they actually hold.
 */
const SEED_RECORD_VERSION = 2;

type SeedSource = { kind: string; items: readonly unknown[]; keyOf: (item: never) => string };

const byId = (item: { id: string }) => item.id;

const SEED_SOURCES: SeedSource[] = [
  { kind: 'vendor', items: VENDORS, keyOf: byId as never },
  { kind: 'sponsor', items: INITIAL_SPONSORS, keyOf: byId as never },
  { kind: 'collaborator', items: INITIAL_COLLABORATORS, keyOf: byId as never },
  { kind: 'gallery', items: INITIAL_GALLERY, keyOf: byId as never },
  { kind: 'event', items: INITIAL_EVENTS_LIST, keyOf: byId as never },
  // These two have no ids, so identity comes from their content.
  { kind: 'faq', items: FAQS, keyOf: ((f: FAQItem) => f.question) as never },
  { kind: 'activity', items: SCHEDULE_ITEMS, keyOf: ((s: ScheduleItem) => s.time + '|' + s.title) as never },
];

const LIST_FOR: Record<string, keyof FullEventData> = {
  vendor: 'vendors',
  sponsor: 'sponsors',
  collaborator: 'collaborators',
  gallery: 'gallery',
  event: 'eventsList',
  faq: 'faqs',
  activity: 'schedule',
};

function mergeNewSeedEntries(data: FullEventData): FullEventData {
  const noRecord = data.knownSeedKeys === undefined;
  const staleRecord = data.seedRecordVersion !== SEED_RECORD_VERSION;
  // Either case means the record cannot be trusted and must be rebuilt.
  const rebuild = noRecord || staleRecord;
  const known = new Set(rebuild ? [] : data.knownSeedKeys ?? []);

  if (rebuild) {
    // A blob written before this record existed. Deriving the record from what
    // the browser actually holds — rather than from the whole seed — is what
    // lets genuinely new entries still arrive. The cost is that a seed entry
    // deleted before this record existed is indistinguishable from one never
    // seen, so it returns once; deleting it now is permanent.
    for (const { kind, items, keyOf } of SEED_SOURCES) {
      const stored = (data[LIST_FOR[kind]] ?? []) as unknown[];
      const storedKeys = new Set(stored.map((i) => (keyOf as (x: unknown) => string)(i)));
      for (const item of items) {
        const key = (keyOf as (x: unknown) => string)(item);
        if (storedKeys.has(key)) known.add(kind + ':' + key);
      }
    }
  }

  const merged: FullEventData = { ...data };
  const nextKnown = new Set(known);
  let changed = false;

  for (const { kind, items, keyOf } of SEED_SOURCES) {
    const listName = LIST_FOR[kind];
    for (const item of items) {
      const key = kind + ':' + (keyOf as (i: unknown) => string)(item);
      nextKnown.add(key);
      if (known.has(key)) continue;

      (merged[listName] as unknown[]) = [...((merged[listName] ?? []) as unknown[]), item];
      changed = true;
    }
  }

  merged.knownSeedKeys = [...nextKnown];
  merged.seedRecordVersion = SEED_RECORD_VERSION;
  if (changed || rebuild) {
    // Persist so the same entries are not offered again next load.
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    } catch {
      /* storage unavailable — the merge still applies for this session */
    }
  }
  return merged;
}

/**
 * The .env-configured admin is authoritative: its stored copy is replaced on
 * every read, so rotating VITE_ADMIN_PASSWORD takes effect as soon as the new
 * build loads. Without this, a browser would keep authenticating against the
 * admin list frozen in its localStorage and the new password would be rejected.
 *
 * Admins added through the portal are kept alongside it.
 */
function applyEnvAdmins(data: FullEventData): FullEventData {
  if (INITIAL_ADMIN_USERS.length === 0) return data;
  const envIds = new Set(INITIAL_ADMIN_USERS.map((admin) => admin.id));
  return {
    ...data,
    adminUsers: [...INITIAL_ADMIN_USERS, ...data.adminUsers.filter((user) => !envIds.has(user.id))],
  };
}

/**
 * Anything in localStorage is untrusted — it survives across deploys and can be
 * hand-edited from the console — so everything read back gets re-sanitized
 * before it reaches a component.
 */
export function getStoredEventData(): FullEventData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData;
    return applyEnvAdmins(mergeNewSeedEntries(sanitizeFullEventData(JSON.parse(raw), defaultData)));
  } catch (err) {
    console.error('Failed to load event data from storage', err);
    return defaultData;
  }
}

/** Every mutation funnels through here, so this is where writes get scrubbed. */
export function saveStoredEventData(data: FullEventData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitizeFullEventData(data, defaultData)));
    window.dispatchEvent(new Event(EVENT_CHANGE_NOTIFICATION));
  } catch (err) {
    console.error('Failed to save event data to storage', err);
  }
}

/**
 * Forces a re-reconciliation against the seed.
 *
 * Unlike resetEventDataToDefault this keeps everything the admin has added or
 * edited — it only clears the record of which seed entries have been offered,
 * so anything from the seed that is currently missing comes back on the next
 * read. The one cost is that deliberately deleted seed entries return too,
 * which is the point: it is the escape hatch for 'something is missing'.
 */
export function restoreMissingSeedItems(): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);

    // Drop every entry that came from the seed, then clear the record. The
    // merge on the next read puts them back at their current values, which is
    // what refreshes a stale one — an entry whose image or text changed in the
    // seed is already present, so merging alone would never update it.
    // Admin-created entries have keys the seed does not know, so they survive.
    for (const { kind, items, keyOf } of SEED_SOURCES) {
      const listName = LIST_FOR[kind];
      const seedKeys = new Set(items.map((i) => (keyOf as (x: unknown) => string)(i)));
      const list = parsed[listName];
      if (!Array.isArray(list)) continue;
      parsed[listName] = list.filter(
        (entry: unknown) => !seedKeys.has((keyOf as (x: unknown) => string)(entry)),
      );
    }

    delete parsed.knownSeedKeys;
    delete parsed.seedRecordVersion;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    window.dispatchEvent(new Event(EVENT_CHANGE_NOTIFICATION));
  } catch (err) {
    console.error('Failed to restore built-in content', err);
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
  addFaq: (faq: FAQItem) => void;
  updateFaq: (index: number, faq: FAQItem) => void;
  deleteFaq: (index: number) => void;
  addCategory: (kind: CategoryKind, label: string) => string | null;
  deleteCategory: (kind: CategoryKind, category: string) => void;
  restoreMissing: () => void;
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

  /**
   * Adds a category. Returns the stored slug, or null when it is empty or a
   * duplicate — the caller uses that to tell the admin what happened.
   */
  const addCategory = (kind: CategoryKind, label: string): string | null => {
    const slug = sanitizeCategory(label);
    if (!slug || data.categories[kind].includes(slug)) return null;

    const updated: FullEventData = {
      ...data,
      categories: { ...data.categories, [kind]: [...data.categories[kind], slug] },
    };
    saveStoredEventData(updated);
    return slug;
  };

  /**
   * Removes a category from the list. Records already tagged with it keep their
   * value rather than being silently retagged — the admin decides where those go.
   */
  const deleteCategory = (kind: CategoryKind, category: string) => {
    const updated: FullEventData = {
      ...data,
      categories: {
        ...data.categories,
        [kind]: data.categories[kind].filter((entry) => entry !== category),
      },
    };
    saveStoredEventData(updated);
  };

  const addFaq = (faq: FAQItem) => {
    saveStoredEventData({ ...data, faqs: [...data.faqs, faq] });
  };

  const updateFaq = (index: number, faq: FAQItem) => {
    const faqs = [...data.faqs];
    faqs[index] = faq;
    saveStoredEventData({ ...data, faqs });
  };

  const deleteFaq = (index: number) => {
    saveStoredEventData({ ...data, faqs: data.faqs.filter((_, i) => i !== index) });
  };

  const restoreMissing = () => {
    restoreMissingSeedItems();
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
    addFaq,
    updateFaq,
    deleteFaq,
    addCategory,
    deleteCategory,
    restoreMissing,
    resetAll,
  };
}
