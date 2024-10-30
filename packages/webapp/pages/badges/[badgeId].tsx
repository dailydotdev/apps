import React, { ReactElement } from 'react';
import {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
import { graphqlUrl } from '@dailydotdev/shared/src/lib/config';
import { TopReaderBadge } from '@dailydotdev/shared/src/components/badges/TopReaderBadge';
import type { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import type { Keyword } from '@dailydotdev/shared/src/graphql/keywords';
import { TOP_READER_BADGE_BY_ID } from '@dailydotdev/shared/src/graphql/users';

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  return { paths: [], fallback: 'blocking' };
}

interface PageProps {
  topReaderBadge: {
    id: string;
    user: LoggedUser;
    issuedAt: Date;
    keyword: Pick<Keyword, 'value' | 'flags'>;
    image: string;
  };
}

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

  const badgeRes = await fetch(graphqlUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: TOP_READER_BADGE_BY_ID,
      variables: {
        id: badgeId,
      },
    }),
    credentials: 'include',
  });

  const response = await badgeRes.json();

  if (!response?.data?.topReaderBadge) {
    return {
      notFound: true,
      revalidate: false,
    };
  }

  return {
    props: { topReaderBadge: response.data.topReaderBadge },
    revalidate: 60,
  };
}

const DevCardPage = ({ topReaderBadge }: PageProps): ReactElement => {
  return (
    <div id="screenshot_wrapper" className="w-fit">
      <TopReaderBadge topReader={topReaderBadge} />
    </div>
  );
};

export default DevCardPage;
