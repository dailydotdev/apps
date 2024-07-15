import React, { ReactElement, useContext } from 'react';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { Roles } from '@dailydotdev/shared/src/lib/user';
import { useQuery } from '@tanstack/react-query';
import {
  CountPendingKeywordsData,
  KeywordData,
  RANDOM_PENDING_KEYWORD_QUERY,
} from '@dailydotdev/shared/src/graphql/keywords';
import { ResponsivePageContainer } from '@dailydotdev/shared/src/components/utilities';
import useRequirePermissions from '@dailydotdev/shared/src/hooks/useRequirePermissions';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import KeywordManagement from '../../components/KeywordManagement';
import { getLayout as getMainLayout } from '../../components/layouts/MainLayout';

const PendingKeywords = (): ReactElement => {
  useRequirePermissions(Roles.Moderator);
  const { tokenRefreshed } = useContext(AuthContext);

  const {
    data: currentKeywordData,
    refetch: refetchCurrentKeyword,
    isLoading: isLoadingCurrentKeyword,
  } = useQuery<KeywordData & CountPendingKeywordsData>(
    ['randomPendingKeyword'],
    () => gqlClient.request(RANDOM_PENDING_KEYWORD_QUERY),
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
        <div className="font-bold typo-title3" data-testid="empty">
          No more keywords! 🥳
        </div>
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
