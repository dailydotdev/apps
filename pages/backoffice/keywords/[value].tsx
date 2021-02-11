import React, { ReactElement, useContext } from 'react';
import { getLayout as getMainLayout } from '../../../components/layouts/MainLayout';
import {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
import request from 'graphql-request';
import { apiUrl } from '../../../lib/config';
import { ParsedUrlQuery } from 'querystring';
import { KEYWORD_QUERY, KeywordData } from '../../../graphql/keywords';
import Custom404 from '../../404';
import { useQuery } from 'react-query';
import useRequirePermissions from '../../../hooks/useRequirePermissions';
import { Roles } from '../../../lib/user';
import AuthContext from '../../../contexts/AuthContext';
import KeywordManagement from '../../../components/KeywordManagement';

export type KeywordPageProps = { keyword: string };

const KeywordPage = ({
  keyword: keywordValue,
}: KeywordPageProps): ReactElement => {
  useRequirePermissions(Roles.Moderator);
  const { tokenRefreshed } = useContext(AuthContext);

  const {
    data: keywordData,
    isLoading: isLoadingKeyword,
  } = useQuery<KeywordData>(
    ['keyword', keywordValue],
    () => request(`${apiUrl}/graphql`, KEYWORD_QUERY, { value: keywordValue }),
    {
      enabled: tokenRefreshed && !!keywordValue,
    },
  );

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
