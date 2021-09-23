import React from 'react';
import classNames from 'classnames';
import { ResponsiveModal } from './ResponsiveModal';
import { ModalProps } from './StyledModal';
import { Upvote } from '../../graphql/common';
import { ModalCloseButton } from './ModalCloseButton';

interface UpvotedPopupModalProps extends ModalProps {
  upvotes?: Upvote[];
  placeholderAmount?: number;
}

const containerClassName = 'flex flex-row px-6 mb-3';
const contentClassName = 'flex flex-col flex-1 ml-4';
const imageClassName = 'w-12 h-12 rounded-10 bg-pepper-70';

const UpvotedPopupModal: React.FC<UpvotedPopupModalProps> = ({
  upvotes,
  placeholderAmount = 5,
  onRequestClose,
  ...modalProps
}) => {
  const renderPlaceholder = () =>
    React.useMemo(
      () =>
        Array(placeholderAmount)
          .fill(0)
          .map(() => (
            <div
              key={Math.random()}
              className={classNames(containerClassName, 'mt-3')}
            >
              <span className={imageClassName} />
              <div className={contentClassName}>
                <span className="rounded-10 bg-pepper-70 w-2/3 h-4" />
                <span className="rounded-10 bg-pepper-70 w-1/3 h-4 mt-2" />
              </div>
            </div>
          )),
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
            <img
              src={upvote.user.image}
              alt={upvote.user.username}
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
};

export default UpvotedPopupModal;
