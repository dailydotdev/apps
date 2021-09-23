import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { ResponsiveModal } from './ResponsiveModal';
import { ModalProps } from './StyledModal';
import { Upvote } from '../../graphql/common';
import { ModalCloseButton } from './ModalCloseButton';
import { PlaceholderList } from '../cards/PlaceholderList';
import { LazyImage } from '../LazyImage';

interface UpvotedPopupModalProps extends ModalProps {
  upvotes?: Upvote[];
  placeholderAmount?: number;
}

const containerClassName = 'flex flex-row px-6 mb-3';
const contentClassName = 'flex flex-col flex-1 ml-4';
const imageClassName = 'w-12 h-12 rounded-10 bg-pepper-70';

export function UpvotedPopupModal({
  upvotes,
  placeholderAmount = 5,
  onRequestClose,
  ...modalProps
}: UpvotedPopupModalProps): ReactElement {
  const renderPlaceholder = () =>
    React.useMemo(
      () =>
        Array(placeholderAmount)
          .fill(0)
          .map(() => <PlaceholderList key={Math.random()} />),
      [placeholderAmount],
    );

  const renderUpvoterList = () =>
    React.useMemo(
      () =>
        upvotes?.map((upvote, i) => (
          <div
            key={upvote.user.username}
            className={classNames(containerClassName, i === 0 && 'mt-3')}
          >
            <LazyImage
              imgSrc={upvote.user.image}
              imgAlt={upvote.user.username}
              className={imageClassName}
            />
            <div className={contentClassName}>
              <span className="typo-callout font-bold">{upvote.user.name}</span>
              <span className="typo-callout text-theme-label-secondary">
                @{upvote.user.username}
              </span>
              {upvote.user.bio && (
                <span className="mt-1 typo-callout text-salt-90">
                  {upvote.user.bio}
                </span>
              )}
            </div>
          </div>
        )),
      [upvotes],
    );

  return (
    <ResponsiveModal
      {...modalProps}
      onRequestClose={onRequestClose}
      style={{
        content: { padding: 0 },
      }}
    >
      <span className="py-4 px-6 border-b border-salt-90 border-opacity-24">
        <span>Upvoted by</span>
        <ModalCloseButton onClick={onRequestClose} />
      </span>
      {upvotes?.length > 0 ? renderUpvoterList() : renderPlaceholder()}
    </ResponsiveModal>
  );
}

export default UpvotedPopupModal;
