import React from 'react';
import classNames from 'classnames';
import { ResponsiveModal } from './ResponsiveModal';
import { ModalProps } from './StyledModal';

interface Upvoter {
  fullName: string;
  handle: string;
  img: string;
  bio?: string;
}

interface UpvotedPopupModalProps extends ModalProps {
  upvoters: Upvoter[];
  placeholderAmount?: number;
}

const containerClassName = 'flex flex-row px-6 mb-3';
const contentClassName = 'flex flex-col flex-1 ml-4';
const imageClassName = 'w-12 h-12 rounded-10 bg-pepper-70';

const UpvotedPopupModal: React.FC<UpvotedPopupModalProps> = ({
  upvoters,
  placeholderAmount = 5,
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
        upvoters.map((user, i) => (
          <div
            key={user.handle}
            className={classNames(containerClassName, i === 0 && 'mt-3')}
          >
            <img src={user.img} alt={user.handle} className={imageClassName} />
            <div className={contentClassName}>
              <span className="typo-callout font-bold">{user.fullName}</span>
              <span className="typo-callout text-theme-label-secondary">
                @{user.handle}
              </span>
              {user.bio && (
                <span className="mt-1 typo-callout text-salt-90">
                  {user.bio}
                </span>
              )}
            </div>
          </div>
        )),
      [upvoters],
    );

  return (
    <ResponsiveModal {...modalProps} noPadding>
      <span className="py-4 px-6 border-b border-salt-90 border-opacity-24">
        Upvoted by
      </span>
      {upvoters.length === 0 ? renderPlaceholder() : renderUpvoterList()}
    </ResponsiveModal>
  );
};

export default UpvotedPopupModal;
