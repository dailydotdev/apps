import type { ReactElement } from 'react';
import React from 'react';
import type { GetServerSideProps } from 'next';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import type { Picks } from '@dailydotdev/shared/src/graphql/picks';
import { PICKS_QUERY } from '@dailydotdev/shared/src/graphql/picks';
import { getIsoWeekNumber } from '@dailydotdev/shared/src/lib/picks';
import { PicksShareCard } from '../../../../components/image-generator/ShareCard';
import type { PicksCardData } from '../../../../components/image-generator/ShareCard';

// A static sibling route (not a case in share/[type]/[id]) on purpose: it is
// server-rendered so the scraper screenshot never waits on a client query, same
// as share/stack.
// Renders anonymously and is screenshotted by daily-api at #screenshot_wrapper,
// so it only uses the public `picks` query: no auth hooks, no boot wait.

interface PicksSharePageProps {
  data: PicksCardData;
}

export const getServerSideProps: GetServerSideProps<
  PicksSharePageProps,
  { id: string }
> = async ({ params }) => {
  const id = params?.id;

  if (!id) {
    return { notFound: true };
  }

  const { picks } = await gqlClient.request<{ picks: Picks | null }>(
    PICKS_QUERY,
    { id },
  );

  if (!picks) {
    return { notFound: true };
  }

  const posts = [...picks.items]
    .sort((a, b) => a.position - b.position)
    .map(({ post }) => post)
    .filter((post): post is typeof post & { title: string } => !!post.title);

  return {
    props: {
      data: {
        author: {
          name: picks.author.name,
          image: picks.author.image || undefined,
        },
        week: getIsoWeekNumber(picks.weekStart),
        titles: posts.map(({ title }) => title),
        ids: posts.map(({ id: postId }) => postId),
      },
    },
  };
};

const PicksSharePage = ({ data }: PicksSharePageProps): ReactElement => (
  <div id="screenshot_wrapper" className="h-[630px] w-[1200px]">
    <PicksShareCard data={data} />
  </div>
);

export default PicksSharePage;
