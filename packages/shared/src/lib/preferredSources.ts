/**
 * Google Preferred Sources — https://developers.google.com/search/docs/appearance/preferred-sources
 *
 * A reader can mark a site as "preferred" and Google then surfaces it more often
 * in Top Stories, AI Overviews and AI Mode. Two integration routes exist, and the
 * difference between them decides everything about where we can put this:
 *
 * - The official JS button adds *the domain that hosts the button*. On daily.dev
 *   that is always daily.dev, never the publisher whose article the reader is on.
 * - The deeplink takes a `q` param, so it can target *any* domain — including the
 *   source of the post being read.
 *
 * Only domain and subdomain level sites are eligible; a path like example.com/blog
 * is not, which is why `normalizePreferredSourceDomain` rejects anything with one.
 */

export const PREFERRED_SOURCE_SCRIPT_ID = 'google-preferred-source';
export const PREFERRED_SOURCE_SRC =
  'https://news.google.com/swg/js/v1/publisher.js';

/** How long to wait for Google's script before falling back to the deeplink. */
export const PREFERRED_SOURCE_TIMEOUT_MS = 4000;
export const PREFERRED_SOURCE_DEEPLINK =
  'https://www.google.com/preferences/source';

export const DAILY_DEV_DOMAIN = 'daily.dev';

/**
 * Reduces whatever the API handed us — a bare host, a full URL, a host with
 * `www.` — to the host Google expects, or null when the value can never be
 * eligible (empty, path-bearing, or not a hostname at all).
 */
export const normalizePreferredSourceDomain = (
  value?: string,
): string | null => {
  if (!value) {
    return null;
  }

  const trimmed = value.trim().toLowerCase();

  if (!trimmed) {
    return null;
  }

  let host = trimmed;

  if (host.includes('://')) {
    try {
      host = new URL(host).hostname;
    } catch {
      return null;
    }
  } else if (host.includes('/')) {
    // A bare host with a path is a subdirectory, which Google does not accept.
    return null;
  }

  host = host.replace(/^www\./, '');

  // Hostname, not an IP or a single label: at least one dot, no spaces, and a
  // TLD of two or more letters.
  if (!/^[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/.test(host)) {
    return null;
  }

  return host;
};

export const getPreferredSourceUrl = (domain: string): string =>
  `${PREFERRED_SOURCE_DEEPLINK}?q=${encodeURIComponent(domain)}`;

/**
 * One key for every surface. Google exposes no way to read whether a reader
 * already added us, so this is the only "done" signal we will ever have: it is
 * written optimistically on click, and it silences every prompt at once.
 */
export const PREFERRED_SOURCE_STATE_KEY = 'preferred_source_state';

/** REVIEW AFFORDANCE — remove before merge. See usePreferredSource. */
export const PREFERRED_SOURCE_FORCE_KEY = 'preferred_source_force';

export type PreferredSourceState = 'added' | 'dismissed';

/** Identifies our own notification / quest so the frontend can decorate it. */
export const PREFERRED_SOURCE_REFERENCE_ID = 'google_preferred_source';
