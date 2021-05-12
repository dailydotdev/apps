import React, { ReactElement, useContext } from 'react';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { getLayout as getMainLayout } from '../../components/layouts/MainLayout';
import { Roles } from '@dailydotdev/shared/src/lib/user';
import { useQuery } from 'react-query';
import request from 'graphql-request';
import { apiUrl } from '@dailydotdev/shared/src/lib/config';
import {
  CountPendingKeywordsData,
  KeywordData,
  RANDOM_PENDING_KEYWORD_QUERY,
} from '../../graphql/keywords';
import styled from '@emotion/styled';
import { typoTitle3 } from '../../styles/typography';
import { ResponsivePageContainer } from '@dailydotdev/shared/src/components/utilities';
import KeywordManagement from '../../components/KeywordManagement';
import useRequirePermissions from '@dailydotdev/shared/src/hooks/useRequirePermissions';

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
      <ResponsivePageContainer>
        <EmptyScreen data-testid="empty">No more keywords! 🥳</EmptyScreen>
      </ResponsivePageContainer>
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
