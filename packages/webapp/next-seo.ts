import type { Source } from '@dailydotdev/shared/src/graphql/sources';
import { cloudinarySquadsImageFallback } from '@dailydotdev/shared/src/lib/image';
import type {
  DefaultSeoProps,
  NextSeoProps,
  OpenGraph,
} from 'next-seo/lib/types';

export const defaultOpenGraph: Partial<OpenGraph> = {
  images: [
    {
      url: 'https://media.daily.dev/image/upload/s--VAY5ToZt--/f_auto/v1724209435/public/daily.dev%20-%20open%20graph',
    },
  ],
};

const config: DefaultSeoProps = {
  openGraph: {
    ...defaultOpenGraph,
    type: 'website',
    site_name: 'daily.dev',
  },
  twitter: {
    site: '@dailydotdev',
    cardType: 'summary_large_image',
  },
};

export default config;

export const defaultSeo: Partial<NextSeoProps> = {
  description:
    'daily.dev is the easiest way to stay updated on the latest programming news. Get the best content from the top tech publications on any topic you want.',
  additionalMetaTags: [
    {
      name: 'robots',
      content:
        'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
    },
  ],
};

// Contextual share images rendered by the webapp and screenshotted by
// daily-api at /og/<type>/<id>.png (mirrors the devcard v2 image pipeline).
export type ShareImageType =
  | 'posts'
  | 'comments'
  | 'sources'
  | 'squads'
  | 'tags'
  | 'invite'
  | 'plus';

export const getShareImageUrl = (
  type: ShareImageType,
  id: string,
  params?: Record<string, string | undefined>,
): string => {
  const url = new URL(
    `/og/${type}/${encodeURIComponent(id)}.png`,
    process.env.NEXT_PUBLIC_API_URL,
  );
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    }
  });
  return url.toString();
};

export const getSquadOpenGraph = ({
  squad,
}: {
  squad?: Pick<Source, 'image'>;
}): Partial<OpenGraph> => ({
  images:
    squad?.image && squad.image !== cloudinarySquadsImageFallback
      ? [{ url: squad.image }]
      : defaultOpenGraph.images,
});

export const defaultSeoTitle = 'daily.dev | Where developers grow together';

export const recruiterSeo: NextSeoProps = {
  title: 'daily.dev Recruiter | Dashboard',
  description:
    'Your dashboard for the developer-first hiring platform. Manage roles, review matches, and track warm introductions.',
};
