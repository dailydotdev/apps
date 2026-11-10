import { storageWrapper } from '../../../lib/storageWrapper';

// Where a startups checkout visitor came from, carried into the Paddle
// custom data so the payment can be attributed to the ad or email
export const CHECKOUT_ATTRIBUTION_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'fbclid',
] as const;

export type CheckoutAttribution = Partial<
  Record<(typeof CHECKOUT_ATTRIBUTION_KEYS)[number], string>
>;

export const CHECKOUT_ATTRIBUTION_STORAGE_KEY = 'startups_checkout_attribution';
export const CHECKOUT_ATTRIBUTION_MAX_LENGTH = 200;
export const CHECKOUT_ATTRIBUTION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

const firstString = (value: unknown): string | undefined => {
  if (Array.isArray(value)) {
    return firstString(value[0]);
  }

  return typeof value === 'string' ? value : undefined;
};

export const getCheckoutAttribution = (
  params: Record<string, unknown>,
): CheckoutAttribution =>
  CHECKOUT_ATTRIBUTION_KEYS.reduce<CheckoutAttribution>((acc, key) => {
    const value = firstString(params[key])
      ?.trim()
      .slice(0, CHECKOUT_ATTRIBUTION_MAX_LENGTH);

    if (value) {
      acc[key] = value;
    }

    return acc;
  }, {});

// The latest visit with any of the keys wins; a visit without them keeps the
// saved one, so the signup redirect that drops the query loses nothing
export const saveCheckoutAttribution = (
  params: Record<string, unknown>,
  now = Date.now(),
): void => {
  const attribution = getCheckoutAttribution(params);

  if (!Object.keys(attribution).length) {
    return;
  }

  try {
    storageWrapper.setItem(
      CHECKOUT_ATTRIBUTION_STORAGE_KEY,
      JSON.stringify({ ...attribution, savedAt: now }),
    );
  } catch {
    // Storage full or blocked: the payment goes out without attribution
  }
};

export const getSavedCheckoutAttribution = (
  now = Date.now(),
): CheckoutAttribution => {
  try {
    const saved = JSON.parse(
      storageWrapper.getItem(CHECKOUT_ATTRIBUTION_STORAGE_KEY) ?? 'null',
    );

    if (
      typeof saved?.savedAt !== 'number' ||
      now - saved.savedAt > CHECKOUT_ATTRIBUTION_TTL_MS
    ) {
      return {};
    }

    return getCheckoutAttribution(saved);
  } catch {
    return {};
  }
};
