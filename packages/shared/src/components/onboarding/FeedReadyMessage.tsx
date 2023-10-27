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
        'flex items-center w-full max-w-xl laptop:flex-row flex-col laptop:text-left text-center laptop:mx-0 mx-auto',
        className,
      )}
    >
      <ProfilePicture
        className="laptop:mr-6 mb-5 laptop:mb-0"
        user={user}
        size="xxxlarge"
      />
      <div className="flex flex-col w-full">
        <p className="mb-2 laptop:mb-1 font-bold typo-large-title">
          Your feed is ready
        </p>
        <p className="flex typo-callout text-theme-label-tertiary">
          Now that the recommendations system is up and running, consider
          reading more articles over the first week to help the feed improve.
        </p>
      </div>
    </div>
  );
};
