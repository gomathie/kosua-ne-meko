import { Vendor, VendorGroup, ScheduleItem, Collaborator, Sponsor, GalleryItem, EventDetails, EventItem, AdminUser, UserTicket, FAQItem, FullEventData } from '../types';

/**
 * Central input sanitization for every untrusted string that enters the app:
 * the public RSVP form, every Admin Portal form, and anything replayed out of
 * localStorage (which the user — or anything else running on this origin — can
 * edit by hand).
 *
 * React escapes text nodes for us, so the jobs here are:
 *  1. strip control / invisible / bidi characters that let text lie about itself,
 *  2. cap lengths so one field can't blow out the layout or the storage quota,
 *  3. keep `javascript:` & friends out of every href/src we render,
 *  4. pin closed-set fields ("tier", "status", "role") to their allowed values,
 *     while normalising open-ended ones ("category") to a safe slug instead.
 */

type Range = readonly [number, number];

/** Control characters — they stand in for a break, so they become whitespace. */
const BREAKING_RANGES: ReadonlyArray<Range> = [
  [0x0000, 0x001f], // C0 controls (NUL, tab, CR, LF...)
  [0x007f, 0x009f], // DEL + C1 controls
  [0x2028, 0x2029], // line / paragraph separator
];

/**
 * Characters with no width at all — zero-width spaces/joiners and the bidi
 * controls that let stored text render in a different order than it reads.
 * These are deleted rather than spaced out, since they exist to hide seams.
 */
const ZERO_WIDTH_RANGES: ReadonlyArray<Range> = [
  [0x200b, 0x200f], // zero-width space/joiners, LRM/RLM
  [0x202a, 0x202e], // bidi embedding + overrides
  [0x2066, 0x2069], // bidi isolates
  [0xfeff, 0xfeff], // byte order mark
];

const inRanges = (code: number, ranges: ReadonlyArray<Range>): boolean =>
  ranges.some(([lo, hi]) => code >= lo && code <= hi);

/** Deletes zero-width/bidi characters; swaps control characters for `breakWith`. */
function stripInvisible(value: string, breakWith: string): string {
  return Array.from(value)
    .map((char) => {
      const code = char.codePointAt(0) ?? 0;
      if (inRanges(code, ZERO_WIDTH_RANGES)) return '';
      if (inRanges(code, BREAKING_RANGES)) return breakWith;
      return char;
    })
    .join('');
}

/** Schemes we are willing to put in an `href`. Everything else is dropped. */
const SAFE_LINK_PROTOCOLS = ['http:', 'https:', 'mailto:', 'tel:'];

/** Inline image types allowed in `src`. SVG is excluded — it can carry script. */
const SAFE_DATA_IMAGE = /^data:image\/(png|jpe?g|gif|webp|avif);base64,[A-Za-z0-9+/=\s]+$/i;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

export const LIMITS = {
  id: 64,
  name: 80,
  email: 254,
  phone: 24,
  passcode: 64,
  title: 120,
  shortText: 140,
  description: 400,
  url: 2048,
  isoDate: 40,
} as const;

/**
 * Single-line free text: drop invisible characters, collapse runs of whitespace,
 * trim, and cap the length. Non-strings become ''.
 */
export function sanitizeText(value: unknown, maxLength: number = LIMITS.shortText): string {
  if (typeof value !== 'string') return '';
  return stripInvisible(value, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength)
    .trim();
}

/**
 * Passcodes keep their exact characters (case, punctuation, inner spaces) —
 * only invisible characters and surrounding whitespace are removed. Both the
 * "create admin" and "log in" paths must use this so the two sides always agree.
 */
export function sanitizePasscode(value: unknown): string {
  if (typeof value !== 'string') return '';
  return stripInvisible(value, '').trim().slice(0, LIMITS.passcode);
}

/** Lowercased address, or '' when it isn't shaped like an email at all. */
export function sanitizeEmail(value: unknown): string {
  const cleaned = sanitizeText(value, LIMITS.email).replace(/\s/g, '').toLowerCase();
  return EMAIL_PATTERN.test(cleaned) ? cleaned : '';
}

export function isValidEmail(value: unknown): boolean {
  return sanitizeEmail(value) !== '';
}

/**
 * Normalizes a phone number to an optional leading '+' plus digits, dropping the
 * spaces, dashes and brackets people type. Caps at the E.164 maximum of 15 digits.
 */
export function sanitizePhone(value: unknown): string {
  const raw = sanitizeText(value, LIMITS.phone * 2);
  if (!raw) return '';
  const prefix = raw.startsWith('+') ? '+' : '';
  const digits = raw.replace(/\D/g, '').slice(0, 15);
  return digits ? prefix + digits : '';
}

/** Ghana numbers are 10 local / 12 international digits; allow the range around it. */
export function isValidPhone(value: unknown): boolean {
  const digits = sanitizePhone(value).replace(/\D/g, '');
  return digits.length >= 9 && digits.length <= 15;
}

/**
 * Returns a URL that is safe to hand to `href`, or `fallback` if it isn't.
 * Bare domains ("trypebble.com") are upgraded to https. Root-relative paths
 * pass through untouched.
 */
export function sanitizeUrl(value: unknown, fallback: string = ''): string {
  if (typeof value !== 'string') return fallback;

  const cleaned = stripInvisible(value, '').trim().slice(0, LIMITS.url);
  if (!cleaned) return fallback;

  // Root-relative asset path — no scheme to police.
  if (cleaned.startsWith('/') && !cleaned.startsWith('//')) return cleaned;

  const hasScheme = /^[a-z][a-z0-9+.-]*:/i.test(cleaned);
  const candidate = hasScheme || cleaned.startsWith('//') ? cleaned : `https://${cleaned}`;

  try {
    const parsed = new URL(candidate, 'https://kosuanemeko.local');
    return SAFE_LINK_PROTOCOLS.includes(parsed.protocol) ? parsed.href : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Same as {@link sanitizeUrl} but for `src`: http(s) and inline raster data URIs
 * only — no mailto:/tel:, no `data:image/svg+xml`.
 */
export function sanitizeImageUrl(value: unknown, fallback: string = ''): string {
  if (typeof value !== 'string') return fallback;

  const cleaned = stripInvisible(value, '').trim();
  if (!cleaned) return fallback;

  if (/^data:/i.test(cleaned)) {
    return SAFE_DATA_IMAGE.test(cleaned) ? cleaned : fallback;
  }

  const url = sanitizeUrl(cleaned, '');
  if (!url) return fallback;
  return /^https?:/i.test(url) || url.startsWith('/') ? url : fallback;
}

/**
 * Categories are admin-defined, so they cannot be pinned to a fixed list the way
 * `tier` or `status` are — doing so would silently discard every category an
 * admin adds. Instead the value is normalised to a slug: lowercase, spaces and
 * separators collapsed to single hyphens, and anything outside [a-z0-9-] dropped.
 * That keeps it safe to use in class names, URLs and comparisons.
 */
export function sanitizeCategory(value: unknown, fallback: string = ''): string {
  const slug = sanitizeText(value, 48)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || fallback;
}

/** Turns a slug back into a display label: `street-food` -> `Street Food`. */
export function formatCategoryLabel(value: string): string {
  return value
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/** Normalises a list of categories: slugged, de-duplicated, order preserved. */
export function sanitizeCategoryList(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) return fallback;
  const seen = new Set<string>();
  for (const entry of value) {
    const slug = sanitizeCategory(entry);
    if (slug) seen.add(slug);
  }
  // An empty result is a deliberate empty list, not a missing one — the
  // `!Array.isArray` check above already covers genuinely absent data.
  return [...seen];
}

/** Pins a value to one of `allowed`, falling back when it is anything else. */
export function sanitizeEnum<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

export function sanitizeInt(value: unknown, min: number, max: number, fallback: number): number {
  const parsed = typeof value === 'number' ? value : parseInt(String(value ?? ''), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.trunc(parsed)));
}

export function sanitizeNumber(value: unknown, min: number, max: number, fallback: number): number {
  const parsed = typeof value === 'number' ? value : parseFloat(String(value ?? ''));
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

/**
 * Keeps the caller's own date text (the app stores local-time strings like
 * `2026-09-05T10:00:00`, which must not be shifted into UTC) but only if it
 * actually parses as a date.
 */
export function sanitizeIsoDate(value: unknown, fallback: string = ''): string {
  const text = sanitizeText(value, LIMITS.isoDate).replace(/\s/g, '');
  if (!text) return fallback;
  return Number.isNaN(Date.parse(text)) ? fallback : text;
}

const VENDOR_GROUPS: readonly VendorGroup[] = ['food-drinks', 'other'];
const SPONSOR_TIERS: readonly Sponsor['tier'][] = ['Headline', 'Gold', 'Silver', 'Partner'];
const EVENT_STATUSES: readonly EventItem['status'][] = ['active', 'upcoming', 'past'];
const ADMIN_ROLES: readonly AdminUser['role'][] = ['Super Admin', 'Event Manager', 'Staff'];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

// ---------------------------------------------------------------------------
// Record-level sanitizers — shared by the Admin Portal forms and the localStorage
// loader so both ends of the round trip enforce identical rules.
// ---------------------------------------------------------------------------

export function sanitizeVendorInput(input: Omit<Vendor, 'id'>, fallbackImage = ''): Omit<Vendor, 'id'> {
  return {
    name: sanitizeText(input.name, LIMITS.name),
    // Stored vendors predate this field, so fall back to inferring it once:
    // only 'entertainment' was ever a non-food category in the seed data.
    group: sanitizeEnum(
      input.group,
      VENDOR_GROUPS,
      sanitizeCategory(input.category) === 'entertainment' ? 'other' : 'food-drinks',
    ),
    category: sanitizeCategory(input.category, 'street-food'),
    description: sanitizeText(input.description, LIMITS.description),
    specialty: sanitizeText(input.specialty, LIMITS.shortText),
    imageUrl: sanitizeImageUrl(input.imageUrl, fallbackImage),
    badge: sanitizeText(input.badge, LIMITS.shortText) || undefined,
  };
}

export function sanitizeVendor(input: Vendor, fallbackImage = ''): Vendor {
  return { ...sanitizeVendorInput(input, fallbackImage), id: sanitizeText(input.id, LIMITS.id) };
}

export function sanitizeScheduleItem(input: ScheduleItem): ScheduleItem {
  return {
    time: sanitizeText(input.time, 40),
    title: sanitizeText(input.title, LIMITS.title),
    description: sanitizeText(input.description, LIMITS.description),
    location: sanitizeText(input.location, LIMITS.shortText),
    category: sanitizeCategory(input.category, 'food'),
  };
}

export function sanitizeCollaboratorInput(input: Omit<Collaborator, 'id'>, fallbackLogo = ''): Omit<Collaborator, 'id'> {
  return {
    name: sanitizeText(input.name, LIMITS.name),
    url: sanitizeUrl(input.url, ''),
    tagline: sanitizeText(input.tagline, LIMITS.description),
    badge: sanitizeText(input.badge, LIMITS.shortText) || undefined,
    logoUrl: sanitizeImageUrl(input.logoUrl, fallbackLogo) || undefined,
  };
}

export function sanitizeCollaborator(input: Collaborator, fallbackLogo = ''): Collaborator {
  return { ...sanitizeCollaboratorInput(input, fallbackLogo), id: sanitizeText(input.id, LIMITS.id) };
}

export function sanitizeSponsorInput(input: Omit<Sponsor, 'id'>, fallbackLogo = ''): Omit<Sponsor, 'id'> {
  return {
    name: sanitizeText(input.name, LIMITS.name),
    tier: sanitizeEnum(input.tier, SPONSOR_TIERS, 'Gold'),
    logoUrl: sanitizeImageUrl(input.logoUrl, fallbackLogo),
    websiteUrl: sanitizeUrl(input.websiteUrl, '') || undefined,
  };
}

export function sanitizeSponsor(input: Sponsor, fallbackLogo = ''): Sponsor {
  return { ...sanitizeSponsorInput(input, fallbackLogo), id: sanitizeText(input.id, LIMITS.id) };
}

export function sanitizeGalleryInput(input: Omit<GalleryItem, 'id'>, fallbackImage = ''): Omit<GalleryItem, 'id'> {
  return {
    title: sanitizeText(input.title, LIMITS.title),
    imageUrl: sanitizeImageUrl(input.imageUrl, fallbackImage),
    category: sanitizeCategory(input.category, 'food'),
    caption: sanitizeText(input.caption, LIMITS.description) || undefined,
  };
}

export function sanitizeGalleryItem(input: GalleryItem, fallbackImage = ''): GalleryItem {
  return { ...sanitizeGalleryInput(input, fallbackImage), id: sanitizeText(input.id, LIMITS.id) };
}

export function sanitizeAdminUserInput(input: Omit<AdminUser, 'id' | 'createdDate'>): Omit<AdminUser, 'id' | 'createdDate'> {
  return {
    name: sanitizeText(input.name, LIMITS.name),
    // Empty when the address is malformed — an account with no email cannot sign in.
    email: sanitizeEmail(input.email),
    passcode: sanitizePasscode(input.passcode),
    role: sanitizeEnum(input.role, ADMIN_ROLES, 'Staff'),
  };
}

export function sanitizeAdminUser(input: AdminUser): AdminUser {
  return {
    ...sanitizeAdminUserInput(input),
    id: sanitizeText(input.id, LIMITS.id),
    createdDate: sanitizeText(input.createdDate, 40),
  };
}

/** FAQ copy is admin-editable, so it gets the same treatment as every other field. */
export function sanitizeFaqItem(input: FAQItem): FAQItem {
  return {
    question: sanitizeText(input.question, LIMITS.title),
    answer: sanitizeText(input.answer, LIMITS.description * 2),
    category: sanitizeCategory(input.category) || undefined,
  };
}

export function sanitizeEventDetails(input: EventDetails): EventDetails {
  return {
    title: sanitizeText(input.title, LIMITS.title),
    shortTitle: sanitizeText(input.shortTitle, LIMITS.title),
    tagline: sanitizeText(input.tagline, LIMITS.description),
    dateString: sanitizeText(input.dateString, 60),
    targetDateISO: sanitizeIsoDate(input.targetDateISO, new Date().toISOString()),
    time: sanitizeText(input.time, 60),
    locationName: sanitizeText(input.locationName, LIMITS.shortText),
    city: sanitizeText(input.city, LIMITS.shortText),
    fullAddress: sanitizeText(input.fullAddress, LIMITS.description),
    organizer: sanitizeText(input.organizer, LIMITS.name),
    organizerTagline: sanitizeText(input.organizerTagline, LIMITS.description),
    collaborator: sanitizeText(input.collaborator, LIMITS.name),
    collaboratorUrl: sanitizeUrl(input.collaboratorUrl, ''),
    collaboratorTagline: sanitizeText(input.collaboratorTagline, LIMITS.description),
    hashtag: sanitizeText(input.hashtag, LIMITS.shortText),
    mapCoordinates: {
      lat: sanitizeNumber(input.mapCoordinates?.lat, -90, 90, 0),
      lng: sanitizeNumber(input.mapCoordinates?.lng, -180, 180, 0),
    },
    isBookingOpen: input.isBookingOpen !== false,
  };
}

export function sanitizeEventItemInput(input: Omit<EventItem, 'id'>): Omit<EventItem, 'id'> {
  return {
    title: sanitizeText(input.title, LIMITS.title),
    shortTitle: sanitizeText(input.shortTitle, LIMITS.title),
    tagline: sanitizeText(input.tagline, LIMITS.description),
    dateString: sanitizeText(input.dateString, 60),
    targetDateISO: sanitizeIsoDate(input.targetDateISO, new Date().toISOString()),
    time: sanitizeText(input.time, 60),
    locationName: sanitizeText(input.locationName, LIMITS.shortText),
    city: sanitizeText(input.city, LIMITS.shortText),
    fullAddress: sanitizeText(input.fullAddress, LIMITS.description),
    organizer: sanitizeText(input.organizer, LIMITS.name),
    hashtag: sanitizeText(input.hashtag, LIMITS.shortText),
    status: sanitizeEnum(input.status, EVENT_STATUSES, 'upcoming'),
    allowPrebooking: input.allowPrebooking === true,
  };
}

export function sanitizeEventItem(input: EventItem): EventItem {
  return { ...sanitizeEventItemInput(input), id: sanitizeText(input.id, LIMITS.id) };
}

/**
 * Tickets live in localStorage on the attendee's own device, so they get the
 * same treatment as event data before being rendered back onto a pass.
 */
export function sanitizeUserTicket(input: UserTicket): UserTicket {
  return {
    id: sanitizeText(input.id, LIMITS.id),
    passId: sanitizeText(input.passId, LIMITS.id),
    passName: sanitizeText(input.passName, LIMITS.title),
    customerName: sanitizeText(input.customerName, LIMITS.name),
    email: sanitizeEmail(input.email),
    phone: sanitizePhone(input.phone),
    quantity: sanitizeInt(input.quantity, 1, 10, 1),
    totalGHS: sanitizeNumber(input.totalGHS, 0, 1_000_000, 0),
    mekoLevel: sanitizeText(input.mekoLevel, LIMITS.shortText),
    purchaseDate: sanitizeText(input.purchaseDate, 40),
    qrCodeUrl: sanitizeImageUrl(input.qrCodeUrl, ''),
  };
}

export function sanitizeUserTickets(parsed: unknown): UserTicket[] {
  if (!Array.isArray(parsed)) return [];
  return parsed.filter(isRecord).map((item) => sanitizeUserTicket(item as unknown as UserTicket));
}

/**
 * Scrubs a whole stored blob. Anything that isn't the right shape is replaced
 * with the matching slice of `fallback`, so a hand-edited or half-written
 * localStorage entry can never take the site down or inject a link.
 */
export function sanitizeFullEventData(parsed: unknown, fallback: FullEventData): FullEventData {
  if (!isRecord(parsed)) return fallback;

  const list = <T,>(value: unknown, sanitizer: (item: T) => T, fallbackList: T[]): T[] =>
    Array.isArray(value) ? value.filter(isRecord).map((item) => sanitizer(item as T)) : fallbackList;

  // Bookkeeping for seed reconciliation (see mergeNewSeedEntries). Dropping
  // this would make every load look like a first run, so nothing would merge.
  const knownSeedKeys = Array.isArray(parsed.knownSeedKeys)
    ? parsed.knownSeedKeys.filter((k): k is string => typeof k === 'string').slice(0, 2000)
    : undefined;
  const storedCategories = isRecord(parsed.categories) ? parsed.categories : {};

  return {
    knownSeedKeys,
    categories: {
      vendors: sanitizeCategoryList(storedCategories.vendors, fallback.categories.vendors),
      schedule: sanitizeCategoryList(storedCategories.schedule, fallback.categories.schedule),
      gallery: sanitizeCategoryList(storedCategories.gallery, fallback.categories.gallery),
    },
    faqs: Array.isArray(parsed.faqs)
      ? parsed.faqs.filter(isRecord).map((f) => sanitizeFaqItem(f as unknown as FAQItem))
      : fallback.faqs,
    eventDetails: sanitizeEventDetails({
      ...fallback.eventDetails,
      ...(isRecord(parsed.eventDetails) ? (parsed.eventDetails as Partial<EventDetails>) : {}),
    }),
    eventsList: list<EventItem>(parsed.eventsList, sanitizeEventItem, fallback.eventsList),
    adminUsers: list<AdminUser>(parsed.adminUsers, sanitizeAdminUser, fallback.adminUsers),
    vendors: list<Vendor>(parsed.vendors, (v) => sanitizeVendor(v), fallback.vendors),
    schedule: list<ScheduleItem>(parsed.schedule, sanitizeScheduleItem, fallback.schedule),
    collaborators: list<Collaborator>(parsed.collaborators, (c) => sanitizeCollaborator(c), fallback.collaborators),
    sponsors: list<Sponsor>(parsed.sponsors, (s) => sanitizeSponsor(s), fallback.sponsors),
    gallery: list<GalleryItem>(parsed.gallery, (g) => sanitizeGalleryItem(g), fallback.gallery),
  };
}
