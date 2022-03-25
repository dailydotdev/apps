import React, { ReactElement, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import Modal from 'react-modal';
import { isTesting } from '@dailydotdev/shared/src/lib/constants';
import '@dailydotdev/shared/src/styles/globals.css';
import { PostBootData } from '@dailydotdev/shared/src/lib/boot';
import CompanionMenu from './CompanionMenu';
import CompanionContent from './CompanionContent';

if (!isTesting) {
  Modal.setAppElement('daily-companion-app');
}

interface CompanionProps {
  postData: PostBootData;
  onOptOut: () => void;
}
export default function Companion({
  postData,
  onOptOut,
}: CompanionProps): ReactElement {
  const [post, setPost] = useState<PostBootData>(postData);
  const [companionState, setCompanionState] = useState<boolean>(false);

  const firstLoad = useRef(false);
  useEffect(() => {
    firstLoad.current = true;
  }, []);

  return (
    <div
      data-testId="companion"
      className={classNames(
        'flex fixed flex-row top-[7.5rem] items-stretch right-0 z-[999999]',
        firstLoad.current && 'transition-transform',
        companionState ? 'translate-x-0' : 'translate-x-[22.5rem]',
      )}
    >
      <CompanionMenu
        post={post}
        setPost={setPost}
        onOptOut={onOptOut}
        companionState={companionState}
        setCompanionState={setCompanionState}
      />
      <CompanionContent post={post} />
    </div>
  );
}
