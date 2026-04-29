import type { ReactElement } from 'react';
import React from 'react';
import Head from 'next/head';
import type { NextSeoProps } from 'next-seo';
import { FlexCol } from '@dailydotdev/shared/src/components/utilities';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { fromCDN } from '@dailydotdev/shared/src/lib/links';
import { HackathonHero } from '@dailydotdev/shared/src/features/hackathon/components/HackathonHero';
import { HackathonTracks } from '@dailydotdev/shared/src/features/hackathon/components/HackathonTracks';
import { HackathonHowItWorks } from '@dailydotdev/shared/src/features/hackathon/components/HackathonHowItWorks';
import { HackathonFAQ } from '@dailydotdev/shared/src/features/hackathon/components/HackathonFAQ';
import { HackathonClosingCTA } from '@dailydotdev/shared/src/features/hackathon/components/HackathonClosingCTA';
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';
import { getLayout } from '../../components/layouts/MainLayout';
import { defaultOpenGraph, defaultSeo } from '../../next-seo';
import { getPageSeoTitles } from '../../components/layouts/utils';

const HACKATHON_URL = 'https://app.daily.dev/hackathon';
const HACKATHON_TITLE = 'Hackathon';
const HACKATHON_DESCRIPTION =
  '72 hours, the daily.dev Public API, and three open tracks. Build something for developers, from developers.';

// TODO move to cloudinary
const HACKATHON_OG_IMAGE = fromCDN('/assets/hackathon-og.png');

const seoTitles = getPageSeoTitles(HACKATHON_TITLE);
const seo: NextSeoProps = {
  title: seoTitles.title,
  openGraph: {
    ...defaultOpenGraph,
    ...seoTitles.openGraph,
    images: [{ url: HACKATHON_OG_IMAGE }],
  },
  ...defaultSeo,
  description: HACKATHON_DESCRIPTION,
};

const getHackathonJsonLd = (): string =>
  JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: HACKATHON_TITLE,
    description: HACKATHON_DESCRIPTION,
    url: HACKATHON_URL,
    eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
    organizer: {
      '@type': 'Organization',
      name: 'daily.dev',
      url: 'https://app.daily.dev',
    },
  });

const HackathonPage = (): ReactElement => {
  return (
    <div className="mx-auto w-full border-border-subtlest-tertiary laptop:max-w-[64rem] laptop:border-x">
      <Head>
        <script
          key="hackathon-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: getHackathonJsonLd() }}
        />
      </Head>
      <FlexCol className="mx-auto min-h-[calc(100vh-3.5rem)] max-w-xl items-center gap-12 px-4 py-10 laptop:max-w-5xl">
        <HackathonHero />
        <HackathonTracks />
        <HackathonHowItWorks />
        <HackathonFAQ />
        <HackathonClosingCTA />
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Quaternary}
          center
          className="max-w-md"
        >
          daily.dev reserves the right to modify any of the above conditions and
          dates, or to not hold the hackathon, at its own discretion.
        </Typography>
      </FlexCol>
    </div>
  );
};

const getHackathonLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

HackathonPage.getLayout = getHackathonLayout;
HackathonPage.layoutProps = { screenCentered: false, seo };

export default HackathonPage;
