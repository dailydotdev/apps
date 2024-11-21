import React, { ReactElement } from 'react';
import {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
import {
  TopReaderBadge,
  type TopReader,
} from '@dailydotdev/shared/src/components/badges/TopReaderBadge';
import { fetchTopReaderById } from '@dailydotdev/shared/src/lib/topReader';

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  return { paths: [], fallback: 'blocking' };
}

interface PageProps {
  topReaderBadge: TopReader;
}

export const runtime = 'experimental-edge';

export async function getStaticProps({
  params,
}: GetStaticPropsContext): Promise<GetStaticPropsResult<PageProps>> {
  const { badgeId } = params;

  if (!badgeId) {
    return {
      notFound: true,
      revalidate: false,
    };
  }

  const topReaderBadge = await fetchTopReaderById(badgeId as string);

  if (!topReaderBadge) {
    return {
      notFound: true,
      revalidate: false,
    };
  }

  return {
    props: { topReaderBadge },
    revalidate: 60,
  };
}

const BadgePage = ({ topReaderBadge }: PageProps): ReactElement => {
  const { user, keyword, issuedAt } = topReaderBadge;
  return (
    <div id="screenshot_wrapper" className="w-fit">
      <TopReaderBadge user={user} keyword={keyword} issuedAt={issuedAt} />
    </div>
  );
};

export default BadgePage;
