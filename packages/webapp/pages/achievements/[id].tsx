import type { ReactElement } from 'react';
import React from 'react';
import type {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
import type { ParsedUrlQuery } from 'querystring';
import type { NextSeoProps } from 'next-seo/lib/types';
import { useQuery } from '@tanstack/react-query';
import type { ClientError } from 'graphql-request';
import { ApiError } from '@dailydotdev/shared/src/graphql/common';
import type { SharedCreatorAchievement } from '@dailydotdev/shared/src/graphql/creatorAchievements';
import {
  getCreatorAchievementCardUrl,
  sharedCreatorAchievementQueryOptions,
} from '@dailydotdev/shared/src/graphql/creatorAchievements';
import { PageWrapperLayout } from '@dailydotdev/shared/src/components/layout/PageWrapperLayout';
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';
import { getLayout } from '../../components/layouts/MainLayout';
import { defaultOpenGraph, defaultSeo } from '../../next-seo';
import { getPageSeoTitles } from '../../components/layouts/utils';
import {
  achievementCardData,
  achievementTitle,
} from '../../components/analytics/creator/achievements';
import {
  SharedAchievementEvidence,
  SharedAchievementUnavailable,
} from '../../components/achievements/SharedAchievementEvidence';

interface SharedAchievementPageProps {
  id: string;
  achievement: SharedCreatorAchievement | null;
  seo: NextSeoProps;
}

interface SharedAchievementParams extends ParsedUrlQuery {
  id: string;
}

const SharedAchievementPage = ({
  id,
  achievement: initialAchievement,
}: SharedAchievementPageProps): ReactElement => {
  // The static render can be up to a revalidation old, so the page re-reads
  // the award on load: an award unshared or retracted in the meantime must
  // drop to the unavailable state rather than keep making its claim.
  const { data } = useQuery({
    ...sharedCreatorAchievementQueryOptions(id),
    initialData: { sharedCreatorAchievement: initialAchievement },
    initialDataUpdatedAt: 0,
  });
  const achievement = data?.sharedCreatorAchievement ?? null;
  const isDescribable = !!achievement && !!achievementTitle(achievement);

  return (
    <PageWrapperLayout className="mx-auto flex w-full max-w-[40rem] flex-col py-6">
      {isDescribable ? (
        <SharedAchievementEvidence achievement={achievement} />
      ) : (
        <SharedAchievementUnavailable />
      )}
    </PageWrapperLayout>
  );
};

const getPageLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

SharedAchievementPage.getLayout = getPageLayout;
SharedAchievementPage.layoutProps = { screenCentered: false };

export default SharedAchievementPage;

export function getStaticPaths(): GetStaticPathsResult {
  return { paths: [], fallback: 'blocking' };
}

// Short, because the page is the evidence: a retraction or an unshare has to
// reach crawlers and link previews quickly, not on an hourly cycle.
const revalidate = 60;

export async function getStaticProps({
  params,
}: GetStaticPropsContext<SharedAchievementParams>): Promise<
  GetStaticPropsResult<SharedAchievementPageProps>
> {
  const id = params?.id;

  if (!id) {
    return { notFound: true, revalidate };
  }

  // A creator shares a link with people, not with search engines, so none of
  // these pages are indexed — available or not.
  const noindexSeo: NextSeoProps = { ...defaultSeo, noindex: true };

  let achievement: SharedCreatorAchievement | null = null;

  try {
    ({ sharedCreatorAchievement: achievement } =
      await sharedCreatorAchievementQueryOptions(id).queryFn());
  } catch (err) {
    // The API answers a missing or unshared award with null, so only a
    // genuine absence code may render the unavailable state. Anything else
    // (5xx, network, unknown GraphQL error) must throw: ISR would otherwise
    // cache "not available" and its OG preview for a live award.
    const errorCode = (err as ClientError)?.response?.errors?.[0]?.extensions
      ?.code;

    if (errorCode !== ApiError.NotFound && errorCode !== ApiError.Forbidden) {
      throw err;
    }
  }

  const card = achievement ? achievementCardData(achievement) : null;

  if (!achievement || !card) {
    const seoTitles = getPageSeoTitles('Achievement not available');

    return {
      props: {
        id,
        achievement: null,
        seo: {
          ...noindexSeo,
          ...seoTitles,
          openGraph: { ...defaultOpenGraph, ...seoTitles.openGraph },
        },
      },
      revalidate,
    };
  }

  const seoTitles = getPageSeoTitles(`${card.creator.name}: ${card.headline}`);
  const description = [card.context, card.detail].filter(Boolean).join(' · ');

  return {
    props: {
      id,
      achievement,
      seo: {
        ...noindexSeo,
        ...seoTitles,
        description: `${card.creator.name} earned ${
          card.headline
        } on daily.dev${description ? ` — ${description}` : ''}.`,
        openGraph: {
          ...defaultOpenGraph,
          ...seoTitles.openGraph,
          images: [
            {
              url: getCreatorAchievementCardUrl(achievement.id),
              width: 1200,
              height: 630,
              alt: `${card.creator.name}: ${card.headline}`,
            },
          ],
        },
      },
    },
    revalidate,
  };
}
