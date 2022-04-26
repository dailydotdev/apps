import React, {
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import Modal from 'react-modal';
import { isTesting } from '@dailydotdev/shared/src/lib/constants';
import '@dailydotdev/shared/src/styles/globals.css';
import { PostBootData } from '@dailydotdev/shared/src/lib/boot';
import LoginModal from '@dailydotdev/shared/src/components/modals/LoginModal';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import useTrackPageView from '@dailydotdev/shared/src/hooks/analytics/useTrackPageView';
import CompanionMenu from './CompanionMenu';
import CompanionContent from './CompanionContent';
import { getCompanionWrapper } from './common';

if (!isTesting) {
  Modal.setAppElement('daily-companion-app');
}

interface CompanionProps {
  postData: PostBootData;
  companionHelper: boolean;
  companionExpanded: boolean;
  onOptOut: () => void;
}
export default function Companion({
  postData,
  companionHelper,
  companionExpanded,
  onOptOut,
}: CompanionProps): ReactElement {
  const firstLoad = useRef(false);
  const containerRef = useRef<HTMLDivElement>();
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

    firstLoad.current = true;
  }, [assetsLoaded]);

  useEffect(() => {
    if (routeChangedCallbackRef.current) {
      routeChangedCallbackRef.current();
    }
  }, [routeChangedCallbackRef]);

  const Container = ({ children }: { children: ReactNode }) => (
    <div
      ref={containerRef}
      data-testId="companion"
      className={classNames(
        'flex fixed flex-row top-[7.5rem] items-stretch right-0 z-10',
        firstLoad.current && 'transition-transform',
        companionState ? 'translate-x-0' : 'translate-x-[22.5rem]',
      )}
      style={{ maxWidth: '26.5rem' }}
    >
      {assetsLoaded ? children : null}
    </div>
  );

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
    <Container>
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
      />
      <CompanionContent post={post} />
    </Container>
  );
}
