import React, { ReactElement, useContext } from 'react';
import AuthContext from '../../contexts/AuthContext';
import { getLayout as getMainLayout } from '../../components/layouts/MainLayout';
import { Roles } from '../../lib/user';
import { useQuery } from 'react-query';
import request from 'graphql-request';
import { apiUrl } from '../../lib/config';
import {
  CountPendingKeywordsData,
  KeywordData,
  RANDOM_PENDING_KEYWORD_QUERY,
} from '../../graphql/keywords';
import styled from '@emotion/styled';
import { typoTitle3 } from '../../styles/typography';
import { PageContainer } from '../../components/utilities';
import KeywordManagement from '../../components/KeywordManagement';
import useRequirePermissions from '../../hooks/useRequirePermissions';

const EmptyScreen = styled.div`
  font-weight: bold;
  ${typoTitle3}
`;

const PendingKeywords = (): ReactElement => {
  useRequirePermissions(Roles.Moderator);
  const { tokenRefreshed } = useContext(AuthContext);

  const {
    data: currentKeywordData,
    refetch: refetchCurrentKeyword,
    isLoading: isLoadingCurrentKeyword,
  } = useQuery<KeywordData & CountPendingKeywordsData>(
    'randomPendingKeyword',
    () => request(`${apiUrl}/graphql`, RANDOM_PENDING_KEYWORD_QUERY),
    {
      enabled: tokenRefreshed,
      refetchOnMount: false,
      refetchInterval: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      refetchIntervalInBackground: false,
    },
  );
  const currentKeyword = currentKeywordData?.keyword;
  const onOperationCompleted = async () => {
    await refetchCurrentKeyword();
  };

  if (isLoadingCurrentKeyword || !currentKeywordData) {
    return <></>;
  }

  if (!isLoadingCurrentKeyword && !currentKeyword) {
    return (
      <PageContainer>
        <EmptyScreen data-testid="empty">No more keywords! 🥳</EmptyScreen>
      </PageContainer>
    );
  }

  return (
    <KeywordManagement
      keyword={currentKeyword}
      subtitle={`Only ${currentKeywordData.countPendingKeywords} left!`}
      onOperationCompleted={onOperationCompleted}
    />
  );
};

PendingKeywords.getLayout = getMainLayout;

export default PendingKeywords;
