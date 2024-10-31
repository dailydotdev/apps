import React, { ReactElement } from 'react';
import {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
import { TopReaderBadge } from '@dailydotdev/shared/src/components/badges/TopReaderBadge';
import type { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import type { Keyword } from '@dailydotdev/shared/src/graphql/keywords';
import { TOP_READER_BADGE_BY_ID } from '@dailydotdev/shared/src/graphql/users';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';

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

  const { topReaderBadge } = await gqlClient.request<PageProps>(
    TOP_READER_BADGE_BY_ID,
    {
      id: badgeId,
    },
  );

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
  return (
    <div id="screenshot_wrapper" className="w-fit">
      <TopReaderBadge topReader={topReaderBadge} />
    </div>
  );
};

export default BadgePage;
