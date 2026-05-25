import {
  appStoreReviewUrl,
  chromeWebStoreReviewUrl,
  edgeAddonsReviewUrl,
  firefoxAddonsReviewUrl,
  playStoreReviewUrl,
  twitterShareReviewUrl,
} from './constants';
import {
  BrowserName,
  getCurrentBrowserName,
  isAndroid,
  isChromeExtension,
  isExtension,
  isFirefoxExtension,
  isIOS,
} from './func';
import { askForReviewPlaceholderImage } from './image';

export type ReviewDestinationId =
  | 'chrome_web_store'
  | 'edge_addons'
  | 'firefox_addons'
  | 'app_store'
  | 'play_store'
  | 'twitter_share';

export interface ReviewDestination {
  id: ReviewDestinationId;
  label: string;
  href: string;
  // Per-store copy for the confirm modal. Each destination owns its own
  // headline / body / CTA wording so the prompt matches the store the user
  // will land on.
  headline: string;
  body: string;
  ctaText: string;
  // Placeholder hero image — engineering will swap per-store assets in later.
  image: string;
}

const CHROME_DEST: ReviewDestination = {
  id: 'chrome_web_store',
  label: 'Chrome Web Store',
  href: chromeWebStoreReviewUrl,
  headline: 'Help fellow devs find daily.dev 💜',
  body: "Take 10 seconds to rate daily.dev on the Chrome Web Store. Your review helps other developers trust it's worth installing.",
  ctaText: 'Rate on Chrome Web Store',
  image: askForReviewPlaceholderImage,
};
const EDGE_DEST: ReviewDestination = {
  id: 'edge_addons',
  label: 'Edge Add-ons',
  href: edgeAddonsReviewUrl,
  headline: 'Help fellow devs find daily.dev 💜',
  body: "Take 10 seconds to rate daily.dev on Microsoft Edge Add-ons. Your review helps other developers trust it's worth installing.",
  ctaText: 'Rate on Edge Add-ons',
  image: askForReviewPlaceholderImage,
};
const FIREFOX_DEST: ReviewDestination = {
  id: 'firefox_addons',
  label: 'Firefox Add-ons',
  href: firefoxAddonsReviewUrl,
  headline: 'Help fellow devs find daily.dev 💜',
  body: "Take 10 seconds to rate daily.dev on Firefox Add-ons. Your review helps other developers trust it's worth installing.",
  ctaText: 'Rate on Firefox Add-ons',
  image: askForReviewPlaceholderImage,
};
const APP_STORE_DEST: ReviewDestination = {
  id: 'app_store',
  label: 'App Store',
  href: appStoreReviewUrl,
  headline: 'Help fellow devs find daily.dev 💜',
  body: "Take 10 seconds to rate daily.dev on the App Store. Your review helps other developers trust it's worth the download.",
  ctaText: 'Rate on the App Store',
  image: askForReviewPlaceholderImage,
};
const PLAY_STORE_DEST: ReviewDestination = {
  id: 'play_store',
  label: 'Play Store',
  href: playStoreReviewUrl,
  headline: 'Help fellow devs find daily.dev 💜',
  body: "Take 10 seconds to rate daily.dev on Google Play. Your review helps other developers trust it's worth the download.",
  ctaText: 'Rate on Google Play',
  image: askForReviewPlaceholderImage,
};
const TWITTER_DEST: ReviewDestination = {
  id: 'twitter_share',
  label: 'X',
  href: twitterShareReviewUrl,
  headline: 'Spread the word 💜',
  body: "We can't send you to a review page from this browser, but a quick post on X helps other devs discover daily.dev.",
  ctaText: 'Share on X',
  image: askForReviewPlaceholderImage,
};

export const getReviewDestination = (): ReviewDestination | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  if (isExtension) {
    if (isChromeExtension) {
      return CHROME_DEST;
    }
    if (process.env.TARGET_BROWSER === 'edge') {
      return EDGE_DEST;
    }
    if (isFirefoxExtension) {
      return FIREFOX_DEST;
    }
    return null;
  }

  if (isIOS()) {
    return APP_STORE_DEST;
  }
  if (isAndroid()) {
    return PLAY_STORE_DEST;
  }

  const browser = getCurrentBrowserName();
  if (browser === BrowserName.Chrome || browser === BrowserName.Brave) {
    return CHROME_DEST;
  }
  if (browser === BrowserName.Edge) {
    return EDGE_DEST;
  }
  return TWITTER_DEST;
};

export const ASK_FOR_REVIEW_DISMISSED_KEY = 'askForReview:dismissedAt';

export const getDismissedAt = (): number | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(ASK_FOR_REVIEW_DISMISSED_KEY);
    if (!raw) {
      return null;
    }
    const value = Number(raw);
    return Number.isFinite(value) ? value : null;
  } catch {
    return null;
  }
};

export const setDismissedAt = (timestamp: number = Date.now()): void => {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(
      ASK_FOR_REVIEW_DISMISSED_KEY,
      String(timestamp),
    );
  } catch {
    // ignore: cookie/localStorage may be disabled
  }
};

export const isCooldownActive = (
  cooldownDays: number,
  now = Date.now(),
): boolean => {
  const dismissedAt = getDismissedAt();
  if (!dismissedAt) {
    return false;
  }
  const cooldownMs = cooldownDays * 24 * 60 * 60 * 1000;
  return now - dismissedAt < cooldownMs;
};

export const ASK_FOR_REVIEW_SESSION_KEY = 'askForReview:shownThisSession';

export const hasShownThisSession = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  try {
    return window.sessionStorage.getItem(ASK_FOR_REVIEW_SESSION_KEY) === '1';
  } catch {
    return false;
  }
};

export const markShownThisSession = (): void => {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.sessionStorage.setItem(ASK_FOR_REVIEW_SESSION_KEY, '1');
  } catch {
    // ignore
  }
};
