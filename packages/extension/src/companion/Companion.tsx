import React, {
  ReactElement,
  ReactNode,
  useEffect,
  useRef,
  useState,
  LegacyRef,
  useCallback,
} from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import classNames from 'classnames';
import Modal from 'react-modal';
import { isTesting } from '@dailydotdev/shared/src/lib/constants';
import { REQUEST_PROTOCOL_KEY } from '@dailydotdev/shared/src/graphql/common';
import '@dailydotdev/shared/src/styles/globals.css';
import { AccessToken, PostBootData } from '@dailydotdev/shared/src/lib/boot';
import useLogPageView from '@dailydotdev/shared/src/hooks/log/useLogPageView';
import useDebounce from '@dailydotdev/shared/src/hooks/useDebounce';
import { usePopupSelector } from '@dailydotdev/shared/src/hooks/usePopupSelector';
import { useBackgroundRequest } from '@dailydotdev/shared/src/hooks/companion';
import {
  getPostByIdKey,
  updatePostCache,
} from '@dailydotdev/shared/src/hooks/usePostById';
import { getCompanionWrapper } from '@dailydotdev/shared/src/lib/extension';
import CompanionMenu from './CompanionMenu';
import CompanionContent from './CompanionContent';
import { companionRequest } from './companionRequest';
import { companionFetch } from './companionFetch';

if (!isTesting) {
  Modal.setAppElement('daily-companion-app');
}

interface CompanionProps {
  postData: PostBootData;
  companionHelper: boolean;
  companionExpanded: boolean;
  onOptOut: () => void;
  onUpdateToken: (token: AccessToken) => void;
}

interface ContainerProps {
  containerRef?: LegacyRef<HTMLDivElement>;
  companionExpanded: boolean;
  shouldLoad: boolean;
  children: ReactNode;
}

const Container = ({
  containerRef,
  companionExpanded,
  shouldLoad,
  children,
}: ContainerProps) => {
  return (
    <div
      ref={containerRef}
      data-testid="companion"
      className={classNames(
        'fixed right-0 top-[7.5rem] flex max-w-[26.5rem] flex-row items-stretch',
        shouldLoad && 'transition-transform',
        companionExpanded ? 'translate-x-0' : 'translate-x-[22.5rem]',
      )}
    >
      {shouldLoad ? children : null}
    </div>
  );
};

export const refreshTokenKey = ['refresh_token'];

export default function Companion({
  postData,
  companionHelper,
  companionExpanded,
  onOptOut,
  onUpdateToken,
}: CompanionProps): ReactElement {
  useBackgroundRequest(refreshTokenKey, {
    callback: ({ res }) => onUpdateToken(res.accessToken),
  });
  const containerRef = useRef<HTMLDivElement>();
  const [assetsLoaded, setAssetsLoaded] = useState(isTesting);
  usePopupSelector({ parentSelector: getCompanionWrapper });
  const client = useQueryClient();
  const { data: post } = useQuery(
    getPostByIdKey(postData.id),
    () => ({ post: postData }),
    {
      select: useCallback((data) => {
        return data.post;
      }, []),
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    },
  );
  const setPost = useCallback(
    (newPostData: PostBootData) => {
      updatePostCache(client, newPostData.id, newPostData);
    },
    [client],
  );
  const [companionState, setCompanionState] =
    useState<boolean>(companionExpanded);
  useQuery(REQUEST_PROTOCOL_KEY, () => ({
    requestMethod: companionRequest,
    fetchMethod: companionFetch,
    isCompanion: true,
  }));
  const [assetsLoadedDebounce] = useDebounce(() => setAssetsLoaded(true), 10);
  const routeChangedCallbackRef = useLogPageView();

  useEffect(() => {
    if (routeChangedCallbackRef.current) {
      routeChangedCallbackRef.current();
    }
  }, [routeChangedCallbackRef]);

  const [checkAssets, clearCheckAssets] = useDebounce(() => {
    if (containerRef?.current?.offsetLeft === 0) {
      checkAssets();
    }

    clearCheckAssets();
    assetsLoadedDebounce();
  }, 10);

  useEffect(() => {
    if (!containerRef?.current || assetsLoaded) {
      return;
    }

    checkAssets();
    routeChangedCallbackRef.current();
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef]);

  return (
    <Container
      containerRef={containerRef}
      companionExpanded={companionState}
      shouldLoad={assetsLoaded}
    >
      <CompanionMenu
        post={post}
        companionHelper={companionHelper}
        setPost={setPost}
        onOptOut={onOptOut}
        companionState={companionState}
        setCompanionState={setCompanionState}
      />
      <CompanionContent post={post} />
    </Container>
  );
}
