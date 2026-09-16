/**
 * Google Preferred Sources — https://developers.google.com/search/docs/appearance/preferred-sources
 *
 * A reader can mark a site as "preferred" and Google then surfaces it more
 * often in Top Stories, AI Overviews and AI Mode. Two integration routes exist,
 * and the difference between them decides where we can put this:
 *
 * - The official JS API adds *the domain that hosts the script*. On daily.dev
 *   that is always daily.dev, never the publisher whose article is being read,
 *   so the ask is for us and never for the post's source.
 * - The deeplink names its domain in a `q` param instead. We use it only as the
 *   fallback for a reader whose content blocker ate the script.
 */

export const PREFERRED_SOURCE_SCRIPT_ID = 'google-preferred-source';
export const PREFERRED_SOURCE_SRC =
  'https://news.google.com/swg/js/v1/publisher.js';

/** How long to wait for Google's script before falling back to the deeplink. */
export const PREFERRED_SOURCE_TIMEOUT_MS = 4000;

export const DAILY_DEV_DOMAIN = 'daily.dev';

export const PREFERRED_SOURCE_DEEPLINK = `https://www.google.com/preferences/source?q=${encodeURIComponent(
  DAILY_DEV_DOMAIN,
)}`;

/**
 * Google exposes no way to read whether a reader already added us, so this is
 * the only "done" signal we will ever have: it is written optimistically on
 * click and silences the ask everywhere. The settings row ignores it on purpose.
 */
export const PREFERRED_SOURCE_ADDED_KEY = 'preferred_source_added';
