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
};

// Robots directives must flow through next-seo's first-class robots handling
// (noindex/nofollow/robotsProps) so exactly one key="robots" tag is emitted per
// page and page-level noindex always wins. Do NOT reintroduce robots via
// additionalMetaTags — those are keyed by meta name, escape next-seo's dedupe,
// and silently override every page's noindex.
export const robotsProps: NextSeoProps['robotsProps'] = {
  maxSnippet: -1,
  maxImagePreview: 'large',
  maxVideoPreview: -1,
};

// Spread into a page's `seo` when it is auth-gated / crawler-inaccessible.
export const noindexSeoProps: Pick<NextSeoProps, 'nofollow' | 'noindex'> = {
  nofollow: true,
  noindex: true,
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

// Canonical marketing tagline. Static surfaces that can't import this TS
// constant keep their own copy — the extension locale JSON
// (`packages/extension/public/_locales/en/messages.json`) and `public/llms.txt`
// — so update those too when the tagline changes.
export const TAGLINE = "Where developers discover what's next";

export const defaultSeoTitle = `daily.dev | ${TAGLINE}`;

export const recruiterSeo: NextSeoProps = {
  title: 'daily.dev Recruiter | Dashboard',
  description:
    'Your dashboard for the developer-first hiring platform. Manage roles, review matches, and track warm introductions.',
};
