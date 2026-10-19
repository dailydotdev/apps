import type { Post } from '../graphql/posts';
import type { Source } from '../graphql/sources';
import type { CoverSettings } from '../hooks/useCoverSettings';
import { isPlaceholderImage } from './image';

// Which cover a feed card paints when the post has no image of its own.
// `image` is the post's real image, `placeholder` is today's stock image,
// `pattern` is the generated cover in the source's colours, and `hook` is the
// same cover with the enrichment one-liner painted on it.
export type CoverVariant = 'image' | 'placeholder' | 'pattern' | 'hook';

export type CoverPost = Partial<Pick<Post, 'image' | 'hook'>>;

export const getCoverVariant = (
  post: CoverPost | undefined,
  settings: CoverSettings,
): CoverVariant => {
  if (post?.image && !isPlaceholderImage(post.image)) {
    return 'image';
  }

  if (!settings.enabled) {
    return 'placeholder';
  }

  return settings.hook && post?.hook ? 'hook' : 'pattern';
};

// Accent families from the theme, minus salt (the neutral). A source without
// logo colours always lands on the same family, so its covers share a look.
export const coverAccents = [
  'cabbage',
  'bacon',
  'avocado',
  'onion',
  'water',
  'pepper',
  'lettuce',
  'bun',
  'ketchup',
  'blueCheese',
  'cheese',
  'burger',
] as const;

export type CoverAccent = (typeof coverAccents)[number];

// The slice of a source the cover needs; a real Source satisfies it.
export interface CoverSource {
  handle?: string;
  name?: string;
  flags?: Pick<NonNullable<Source['flags']>, 'logoColors'> | null;
}

export const hashSeed = (seed: string): number => {
  // Bounded by a prime so the running value never leaves safe-integer range.
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 1000003;
  }

  return hash;
};

export const getCoverAccent = (source?: CoverSource | null): CoverAccent => {
  const seed = source?.handle ?? source?.name;
  if (!seed) {
    return coverAccents[0];
  }

  return coverAccents[hashSeed(seed) % coverAccents.length];
};

const isHexColor = (value?: string): value is string =>
  /^#[0-9a-f]{6}$/i.test(value ?? '');

// The colour the cover is painted in: the source's strongest logo colour when
// the API has one, otherwise a theme accent keyed on the source so the fallback
// is at least consistent per source. Returns a CSS colour value.
export const getCoverBrand = (source?: CoverSource | null): string => {
  const brand = source?.flags?.logoColors?.find(isHexColor);

  return brand ?? `var(--theme-accent-${getCoverAccent(source)}-default)`;
};

// Logged on feed impressions and clicks so the variants can be compared.
// Posts with a real image stay unlabelled: they are the control either way.
export const coverLogExtra = (
  post: CoverPost | undefined,
  settings: CoverSettings,
): { cover?: CoverVariant } => {
  const variant = getCoverVariant(post, settings);

  return variant === 'image' ? {} : { cover: variant };
};
