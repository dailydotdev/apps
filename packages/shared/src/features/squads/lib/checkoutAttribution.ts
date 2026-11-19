import { storageWrapper } from '../../../lib/storageWrapper';
import { getCookies } from '../../../lib/cookie';

// Where a startups checkout visitor came from, carried into the Paddle
// custom data so the payment can be attributed to the ad or email
export const CHECKOUT_ATTRIBUTION_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'fbclid',
  'twclid',
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

// The /startups landing (daily.dev) saves the same keys in a cookie on
// .daily.dev, for visitors who never follow a link into the app with them,
// such as one who copies the agent prompt
export const LANDING_ATTRIBUTION_COOKIE = 'startups_attribution';

type SavedAttribution = CheckoutAttribution & { savedAt?: unknown };

const parseSaved = (value?: string | null): SavedAttribution | null => {
  try {
    const saved = JSON.parse(value ?? 'null');

    return saved && typeof saved === 'object' ? saved : null;
  } catch {
    return null;
  }
};

export const getSavedCheckoutAttribution = (
  now = Date.now(),
): CheckoutAttribution => {
  let stored: string | null = null;

  try {
    stored = storageWrapper.getItem(CHECKOUT_ATTRIBUTION_STORAGE_KEY);
  } catch {
    // Storage blocked: the landing cookie may still have it
  }

  const [latest] = [
    parseSaved(stored),
    parseSaved(
      getCookies([LANDING_ATTRIBUTION_COOKIE])?.[LANDING_ATTRIBUTION_COOKIE],
    ),
  ]
    .filter(
      (saved): saved is SavedAttribution & { savedAt: number } =>
        typeof saved?.savedAt === 'number' &&
        now - saved.savedAt <= CHECKOUT_ATTRIBUTION_TTL_MS,
    )
    .sort((a, b) => b.savedAt - a.savedAt);

  return latest ? getCheckoutAttribution(latest) : {};
};
