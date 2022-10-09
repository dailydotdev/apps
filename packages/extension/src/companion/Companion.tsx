import React, {
  ReactElement,
  ReactNode,
  useEffect,
  useRef,
  useState,
  LegacyRef,
} from 'react';
import { useQuery } from 'react-query';
import classNames from 'classnames';
import Modal from 'react-modal';
import { isTesting } from '@dailydotdev/shared/src/lib/constants';
import { REQUEST_PROTOCOL_KEY } from '@dailydotdev/shared/src/graphql/common';
import '@dailydotdev/shared/src/styles/globals.css';
import { PostBootData } from '@dailydotdev/shared/src/lib/boot';
import useTrackPageView from '@dailydotdev/shared/src/hooks/analytics/useTrackPageView';
import useDebounce from '@dailydotdev/shared/src/hooks/useDebounce';
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
      data-testId="companion"
      className={classNames(
        'flex fixed flex-row top-[7.5rem] items-stretch right-0 z-10 max-w-[26.5rem]',
        shouldLoad && 'transition-transform',
        companionExpanded ? 'translate-x-0' : 'translate-x-[22.5rem]',
      )}
    >
      {shouldLoad ? children : null}
    </div>
  );
};

export default function Companion({
  postData,
  companionHelper,
  companionExpanded,
  onOptOut,
}: CompanionProps): ReactElement {
  const containerRef = useRef<HTMLDivElement>();
  const [assetsLoaded, setAssetsLoaded] = useState(isTesting);
  const [post, setPost] = useState<PostBootData>(postData);
  const [companionState, setCompanionState] =
    useState<boolean>(companionExpanded);
  useQuery(REQUEST_PROTOCOL_KEY, () => ({
    requestMethod: companionRequest,
    fetchMethod: companionFetch,
  }));
  const [assetsLoadedDebounce] = useDebounce(() => setAssetsLoaded(true), 10);
  const routeChangedCallbackRef = useTrackPageView();

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
