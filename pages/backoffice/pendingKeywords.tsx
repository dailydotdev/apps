import React, { ReactElement, useContext, useEffect, useState } from 'react';
import AuthContext from '../../components/AuthContext';
import { getLayout as getMainLayout } from '../../components/layouts/MainLayout';
import { useRouter } from 'next/router';
import { Roles } from '../../lib/user';
import { useMutation, useQuery } from 'react-query';
import request from 'graphql-request';
import { apiUrl } from '../../lib/config';
import {
  ALLOW_KEYWORD_MUTATION,
  DENY_KEYWORD_MUTATION,
  KeywordData,
  RANDOM_PENDING_KEYWORD_QUERY,
} from '../../graphql/keywords';
import styled from 'styled-components';
import {
  typoDouble,
  typoLil2,
  typoMicro1,
  typoTriple,
} from '../../styles/typography';
import { ButtonLoader, PageContainer } from '../../components/utilities';
import { size1, size2, size3, size4 } from '../../styles/sizes';
import { colorKetchup40 } from '../../styles/colors';
import {
  BaseButton,
  ColorButton,
  HollowButton,
  InvertButton,
} from '../../components/Buttons';

const EmptyScreen = styled.div`
  ${typoTriple}
`;

const Keyword = styled.h1`
  margin: 0;
  ${typoDouble}
`;

const Occurrences = styled.div`
  color: var(--theme-secondary);
  margin: ${size1} 0;
  ${typoMicro1};
`;

const DenyButton = styled(ColorButton)`
  color: var(--theme-primary);
`;

const Buttons = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: ${size3} 0;

  ${BaseButton} {
    padding: ${size2} ${size4};
    border-radius: ${size2};
    ${typoLil2}
  }
`;

const PendingKeywords = (): ReactElement => {
  const router = useRouter();
  const { user, tokenRefreshed } = useContext(AuthContext);
  const [currentAction, setCurrentAction] = useState<string | null>(null);

  const {
    data: currentKeywordData,
    refetch: refetchCurrentKeyword,
    isLoading: isLoadingCurrentKeyword,
  } = useQuery<KeywordData>(
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

  const nextKeyword = async () => {
    await refetchCurrentKeyword();
    setCurrentAction(null);
  };

  const { mutateAsync: allowKeyword } = useMutation(
    () =>
      request(`${apiUrl}/graphql`, ALLOW_KEYWORD_MUTATION, {
        keyword: currentKeyword?.value,
      }),
    {
      onSuccess: () => nextKeyword(),
    },
  );

  const { mutateAsync: denyKeyword } = useMutation(
    () =>
      request(`${apiUrl}/graphql`, DENY_KEYWORD_MUTATION, {
        keyword: currentKeyword?.value,
      }),
    {
      onSuccess: () => nextKeyword(),
    },
  );

  const onAllow = () => {
    setCurrentAction('allow');
    return allowKeyword();
  };

  const onDeny = () => {
    setCurrentAction('deny');
    return denyKeyword();
  };

  useEffect(() => {
    if (tokenRefreshed) {
      if (!(user?.roles.indexOf(Roles.Moderator) >= 0)) {
        router.replace('/');
      }
    }
  }, [tokenRefreshed, user]);

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
    <PageContainer>
      <Keyword>{currentKeyword.value}</Keyword>
      <Occurrences>Occurrences: {currentKeyword.occurrences}</Occurrences>
      <Buttons>
        <InvertButton
          waiting={currentAction === 'allow'}
          onClick={onAllow}
          disabled={!!currentAction}
        >
          <span>Allow</span>
          <ButtonLoader />
        </InvertButton>
        <HollowButton disabled={!!currentAction}>Synonym</HollowButton>
        <DenyButton
          background={colorKetchup40}
          waiting={currentAction === 'deny'}
          onClick={onDeny}
          disabled={!!currentAction}
        >
          <span>Deny</span>
          <ButtonLoader />
        </DenyButton>
      </Buttons>
    </PageContainer>
  );
};

PendingKeywords.getLayout = getMainLayout;

export default PendingKeywords;
