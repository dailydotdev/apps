import { Source } from '@dailydotdev/shared/src/graphql/sources';
import { cloudinary } from '@dailydotdev/shared/src/lib/image';
import { DefaultSeoProps, NextSeoProps, OpenGraph } from 'next-seo/lib/types';

const config: DefaultSeoProps = {
  openGraph: {
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

export const defaultOpenGraph: Partial<OpenGraph> = {
  images: [
    {
      url: 'https://daily-now-res.cloudinary.com/image/upload/v1680599225/opengraph/Open_Graph_3.png',
    },
  ],
};

export const getSquadOpenGraph = ({
  squad,
}: {
  squad?: Pick<Source, 'image'>;
}): Partial<OpenGraph> => ({
  images:
    squad?.image && squad.image !== cloudinary.squads.imageFallback
      ? [{ url: squad.image }]
      : defaultOpenGraph.images,
});

export const defaultSeoTitle = 'daily.dev | Where developers grow together';
