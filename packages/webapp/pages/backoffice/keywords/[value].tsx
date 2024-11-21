import React, { ReactElement, useContext } from 'react';
import {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
import { ParsedUrlQuery } from 'querystring';
import { KEYWORD_QUERY } from '@dailydotdev/shared/src/graphql/keywords';
import { useQuery } from '@tanstack/react-query';
import useRequirePermissions from '@dailydotdev/shared/src/hooks/useRequirePermissions';
import { Roles } from '@dailydotdev/shared/src/lib/user';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import Custom404 from '../../404';
import { getLayout as getMainLayout } from '../../../components/layouts/MainLayout';
import KeywordManagement from '../../../components/KeywordManagement';

export type KeywordPageProps = { keyword: string };

const KeywordPage = ({
  keyword: keywordValue,
}: KeywordPageProps): ReactElement => {
  useRequirePermissions(Roles.Moderator);
  const { tokenRefreshed } = useContext(AuthContext);

  const { data: keywordData, isPending: isLoadingKeyword } = useQuery({
    queryKey: ['keyword', keywordValue],
    queryFn: () => gqlClient.request(KEYWORD_QUERY, { value: keywordValue }),
    enabled: tokenRefreshed && !!keywordValue,
  });

  if (isLoadingKeyword || !keywordData) {
    return <></>;
  }

  const { keyword } = keywordData;
  if (!keyword) {
    return <Custom404 />;
  }

  return (
    <KeywordManagement
      keyword={keyword}
      subtitle={`Status: ${keyword.status}`}
    />
  );
};

KeywordPage.getLayout = getMainLayout;

export default KeywordPage;

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  return { paths: [], fallback: true };
}

interface KeywordParams extends ParsedUrlQuery {
  value: string;
}

export const runtime = 'experimental-edge';

export async function getStaticProps({
  params,
}: GetStaticPropsContext<KeywordParams>): Promise<
  GetStaticPropsResult<KeywordPageProps>
> {
  const { value } = params;
  return {
    props: {
      keyword: value,
    },
    revalidate: 60,
  };
}
