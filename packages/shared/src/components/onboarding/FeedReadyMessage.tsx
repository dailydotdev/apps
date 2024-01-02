import React, { ReactElement, useContext } from 'react';
import classNames from 'classnames';
import { ProfilePicture } from '../ProfilePicture';
import AuthContext from '../../contexts/AuthContext';

export type FeedReadyMessageProps = {
  className?: string;
};

export const FeedReadyMessage = ({
  className,
}: FeedReadyMessageProps): ReactElement => {
  const { user } = useContext(AuthContext);

  return (
    <div
      className={classNames(
        'mx-auto flex w-full max-w-xl flex-col items-center text-center laptop:mx-0 laptop:flex-row laptop:text-left',
        className,
      )}
    >
      <ProfilePicture
        className="mb-5 laptop:mb-0 laptop:mr-6"
        user={user}
        size="xxxlarge"
      />
      <div className="flex w-full flex-col">
        <p className="mb-2 font-bold typo-large-title laptop:mb-1">
          Your feed is ready
        </p>
        <p className="flex text-theme-label-tertiary typo-callout">
          Now that the recommendations system is up and running, consider
          reading more articles over the first week to help the feed improve.
        </p>
      </div>
    </div>
  );
};
