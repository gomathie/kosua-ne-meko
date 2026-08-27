/**
 * Structured data and sitemap, derived from the event data rather than written
 * by hand.
 *
 * index.html used to carry a hand-copied JSON-LD block with a comment asking
 * whoever changed the venue to remember to change it here too. Nobody would.
 * The venue was already wrong once. So the schema is generated from
 * src/data/eventData.ts at build time by the Vite plugin below, and the FAQ
 * answers go through the same {venue}/{city}/{date} substitution the page uses,
 * so what a crawler reads is what a visitor reads.
 */
import type { Plugin } from 'vite';
import { writeFileSync } from 'node:fs';
import {
  EVENT_DETAILS,
  FAQS,
  SCHEDULE_ITEMS,
  INITIAL_SPONSORS,
  INITIAL_COLLABORATORS,
  VENDORS,
} from '../src/data/eventData';

export const SITE_URL = 'https://kosuanemeko.com';
const OG_IMAGE = SITE_URL + '/hero-flyer.jpg';

/** Ghana keeps GMT year-round, so the seed's naive timestamps are already UTC. */
const TZ = '+00:00';

/** Mirrors FaqSection: seed copy holds placeholders, not a hardcoded venue. */
function fill(text: string): string {
  return text
    .replace(/{venue}/g, EVENT_DETAILS.locationName)
    .replace(/{city}/g, EVENT_DETAILS.city)
    .replace(/{date}/g, EVENT_DETAILS.dateString);
}

/**
 * '2:15 PM' -> '14:15'. Reads the clock at the start and ignores whatever
 * follows, so '10:00 PM GMT' and the open-ended '7:30 PM onwards' both work.
 * Returns null on anything unrecognised so a reworded line-up degrades to no
 * subEvent time rather than to an invalid date, which Google rejects for the
 * whole item.
 */
function to24Hour(clock: string): string | null {
  const m = clock.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i);
  if (!m) return null;
  let hour = Number(m[1]);
  const minute = m[2] ?? '00';
  const meridiem = m[3].toUpperCase();
  if (hour === 12) hour = 0;
  if (meridiem === 'PM') hour += 12;
  return String(hour).padStart(2, '0') + ':' + minute;
}

/** The calendar day the event runs on, e.g. '2026-09-05'. */
const EVENT_DAY = EVENT_DETAILS.targetDateISO.slice(0, 10);

const startDate = EVENT_DETAILS.targetDateISO + TZ;

/**
 * End of the festival, read from '10:00 AM – 10:00 PM GMT'. Both a hyphen and
 * an en dash appear in this copy. Falls back to 22:00 rather than omitting
 * endDate, which Google warns about.
 */
const endDate = (() => {
  const parts = EVENT_DETAILS.time.split(/[–—-]/);
  const end = parts.length > 1 ? to24Hour(parts[1].replace(/GMT/i, '')) : null;
  return `${EVENT_DAY}T${end ?? '22:00'}:00${TZ}`;
})();

const place = {
  '@type': 'Place',
  name: EVENT_DETAILS.locationName,
  address: {
    '@type': 'PostalAddress',
    streetAddress: EVENT_DETAILS.fullAddress,
    addressLocality: 'Accra',
    addressRegion: 'Greater Accra',
    addressCountry: 'GH',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: EVENT_DETAILS.mapCoordinates.lat,
    longitude: EVENT_DETAILS.mapCoordinates.lng,
  },
};

/**
 * Each line-up entry as a subEvent. Only the ones whose time parses are
 * included — a subEvent without a startDate is invalid, and one bad entry
 * would otherwise invalidate the festival item that contains it.
 */
function subEvents() {
  return SCHEDULE_ITEMS.map((item) => {
    const [from, to] = item.time.split(/[–—-]/);
    const start = to24Hour(from ?? '');
    if (!start) return null;
    const finish = to ? to24Hour(to) : null;
    return {
      '@type': 'Event',
      name: item.title,
      ...(item.description ? { description: item.description } : {}),
      startDate: `${EVENT_DAY}T${start}:00${TZ}`,
      ...(finish ? { endDate: `${EVENT_DAY}T${finish}:00${TZ}` } : {}),
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      location: { '@id': SITE_URL + '/#venue' },
      organizer: { '@id': SITE_URL + '/#organizer' },
    };
  }).filter(Boolean);
}

/** Sponsors and collaborators, so the partner brands are attached to the event. */
function partners() {
  return [
    ...INITIAL_SPONSORS.map((s) => ({
      '@type': 'Organization',
      name: s.name,
      ...(s.websiteUrl ? { url: s.websiteUrl } : {}),
      ...(s.logoUrl?.startsWith('/') ? { logo: SITE_URL + s.logoUrl } : {}),
    })),
    ...INITIAL_COLLABORATORS.map((c) => ({
      '@type': 'Organization',
      name: c.name,
      url: c.url,
      ...(c.logoUrl?.startsWith('/') ? { logo: SITE_URL + c.logoUrl } : {}),
    })),
  ];
}

export function buildJsonLd(): string {
  const graph = [
    {
      '@type': 'WebSite',
      '@id': SITE_URL + '/#website',
      url: SITE_URL + '/',
      name: EVENT_DETAILS.shortTitle,
      description: EVENT_DETAILS.tagline,
      inLanguage: 'en-GH',
      publisher: { '@id': SITE_URL + '/#organizer' },
    },
    {
      '@type': 'Organization',
      '@id': SITE_URL + '/#organizer',
      name: EVENT_DETAILS.organizer,
      description: EVENT_DETAILS.organizerTagline,
      url: 'https://ekowsamfarms.com',
      logo: SITE_URL + '/logos/ekow-sam-farms.webp',
      areaServed: { '@type': 'Country', name: 'Ghana' },
    },
    { ...place, '@id': SITE_URL + '/#venue' },
    {
      '@type': 'Festival',
      '@id': SITE_URL + '/#event',
      name: 'Kosua Ne Meko Hangout 2.0',
      alternateName: EVENT_DETAILS.shortTitle,
      description:
        "Accra's premier street food and cultural festival: farm-fresh boiled eggs with " +
        'stone-ground meko pepper salsa, live Afrobeats, board game tournaments and ' +
        'African outdoor cinema. Free entry with an RSVP pass.',
      startDate,
      endDate,
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      url: SITE_URL + '/',
      image: [OG_IMAGE, SITE_URL + '/hero-flyer.webp'],
      inLanguage: 'en-GH',
      location: { '@id': SITE_URL + '/#venue' },
      organizer: { '@id': SITE_URL + '/#organizer' },
      sponsor: partners(),
      isAccessibleForFree: true,
      typicalAgeRange: '0-99',
      keywords: [
        'street food festival Accra',
        'Kosua Ne Meko',
        'Ghana food festival',
        'North Dzorwulu events',
        'free events Accra',
      ].join(', '),
      offers: {
        '@type': 'Offer',
        name: 'Free RSVP Pass',
        price: '0',
        priceCurrency: 'GHS',
        availability: EVENT_DETAILS.isBookingOpen
          ? 'https://schema.org/InStock'
          : 'https://schema.org/SoldOut',
        url: SITE_URL + '/',
        validFrom: '2026-01-01T00:00:00' + TZ,
      },
      subEvent: subEvents(),
    },
    {
      '@type': 'FAQPage',
      '@id': SITE_URL + '/#faq',
      mainEntity: FAQS.map((faq) => ({
        '@type': 'Question',
        name: fill(faq.question),
        acceptedAnswer: { '@type': 'Answer', text: fill(faq.answer) },
      })),
    },
  ];

  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2);
}

/**
 * The sitemap carries the flyer as an image entry, and a lastmod taken from the
 * build rather than from whenever someone last remembered to edit the file.
 */
export function buildSitemap(): string {
  const lastmod = new Date().toISOString().slice(0, 10);
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
    <image:image>
      <image:loc>${OG_IMAGE}</image:loc>
      <image:title>Kosua Ne Meko Hangout 2.0 event flyer</image:title>
    </image:image>
  </url>
</urlset>
`;
}

/**
 * Injects the schema into index.html for both dev and build, so it cannot be
 * left out of a deploy by forgetting a separate step, and rewrites the sitemap
 * once the bundle is on disk.
 */
export function seoPlugin(): Plugin {
  const MARKER = '<!--seo:jsonld-->';
  return {
    name: 'kosua-seo',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        if (!html.includes(MARKER)) {
          throw new Error(`index.html is missing the ${MARKER} placeholder — structured data cannot be injected.`);
        }
        const block = `<script type="application/ld+json">\n${buildJsonLd()}\n    </script>`;
        return html.replace(MARKER, block);
      },
    },
    closeBundle() {
      writeFileSync('dist/sitemap.xml', buildSitemap());
      // Vendor names are the long tail people actually search for ("Telonceri
      // Foods Accra"), so keep a count visible in the build log as a reminder
      // that they are only in the page body, not the schema.
      this.info?.(`seo: sitemap written, ${VENDORS.length} stalls on the page`);
    },
  };
}
