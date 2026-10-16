import type { Post } from '../graphql/posts';
import { isPlaceholderImage } from './image';

// Which cover a feed card paints when the post has no image of its own.
// `image` is the post's real image, `placeholder` is today's stock image,
// `hook` is the typographic cover with the enrichment one-liner, and `title`
// is the same cover with the title when no hook exists yet.
export type CoverVariant = 'image' | 'placeholder' | 'hook' | 'title';

export type CoverPost = Partial<Pick<Post, 'image' | 'hook' | 'title'>>;

export const getCoverVariant = (
  post: CoverPost | undefined,
  enabled: boolean | undefined,
): CoverVariant => {
  if (post?.image && !isPlaceholderImage(post.image)) {
    return 'image';
  }

  if (!enabled) {
    return 'placeholder';
  }

  if (post?.hook) {
    return 'hook';
  }

  return post?.title ? 'title' : 'placeholder';
};

// Accent families from the theme, minus salt (the neutral). The same tag always
// lands on the same family, so open-source posts share a look across the feed.
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

export const getCoverAccent = (seed?: string | null): CoverAccent => {
  if (!seed) {
    return coverAccents[0];
  }

  // Bounded by a prime so the running value never leaves safe-integer range.
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 1000003;
  }

  return coverAccents[hash % coverAccents.length];
};

// Logged on feed impressions and clicks so the variants can be compared.
// Posts with a real image stay unlabelled: they are the control either way.
export const coverLogExtra = (
  post: CoverPost | undefined,
  enabled: boolean | undefined,
): { cover?: CoverVariant } => {
  const variant = getCoverVariant(post, enabled);

  return variant === 'image' ? {} : { cover: variant };
};
