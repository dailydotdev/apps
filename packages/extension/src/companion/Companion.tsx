import React, {
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
  LegacyRef,
} from 'react';
import { useQueryClient } from 'react-query';
import classNames from 'classnames';
import Modal from 'react-modal';
import { isTesting } from '@dailydotdev/shared/src/lib/constants';
import { REQUEST_PROTOCOL_KEY } from '@dailydotdev/shared/src/graphql/common';
import '@dailydotdev/shared/src/styles/globals.css';
import { PostBootData } from '@dailydotdev/shared/src/lib/boot';
import LoginModal from '@dailydotdev/shared/src/components/modals/LoginModal';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import useTrackPageView from '@dailydotdev/shared/src/hooks/analytics/useTrackPageView';
import CompanionMenu from './CompanionMenu';
import CompanionContent from './CompanionContent';
import { getCompanionWrapper } from './common';
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
        'flex fixed flex-row top-[7.5rem] items-stretch right-0 z-10 max-w-[26.5rem] transition-transform',
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
  const client = useQueryClient();
  const containerRef = useRef<HTMLDivElement>();
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [assetsLoaded, setAssetsLoaded] = useState(isTesting);
  const [post, setPost] = useState<PostBootData>(postData);
  const [companionState, setCompanionState] =
    useState<boolean>(companionExpanded);
  const { user, closeLogin, loadingUser, shouldShowLogin, loginState } =
    useContext(AuthContext);

  const routeChangedCallbackRef = useTrackPageView();

  useEffect(() => {
    if (!assetsLoaded) {
      return;
    }

    client.setQueryData(REQUEST_PROTOCOL_KEY, {
      requestMethod: companionRequest,
      fetchMethod: companionFetch,
    });
  }, [assetsLoaded]);

  useEffect(() => {
    if (routeChangedCallbackRef.current) {
      routeChangedCallbackRef.current();
    }
  }, [routeChangedCallbackRef]);

  useEffect(() => {
    if (!containerRef?.current || assetsLoaded) {
      return;
    }

    const checkAssets = () => {
      if (containerRef?.current?.offsetLeft === 0) {
        return setTimeout(checkAssets, 10);
      }

      return setTimeout(() => setAssetsLoaded(true), 10);
    };

    checkAssets();
    routeChangedCallbackRef.current();
  }, [containerRef]);

  return (
    <Container
      containerRef={containerRef}
      companionExpanded={companionState}
      shouldLoad={assetsLoaded}
    >
      {!user && !loadingUser && shouldShowLogin && (
        <LoginModal
          parentSelector={getCompanionWrapper}
          isOpen
          onRequestClose={closeLogin}
          contentLabel="Login Modal"
          {...loginState}
        />
      )}

      <CompanionMenu
        post={post}
        companionHelper={companionHelper}
        setPost={setPost}
        onOptOut={onOptOut}
        companionState={companionState}
        setCompanionState={setCompanionState}
        onOpenComments={() => setIsCommentsOpen(true)}
      />
      <CompanionContent
        post={post}
        viewComments={isCommentsOpen}
        onViewComments={setIsCommentsOpen}
      />
    </Container>
  );
}
