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
    <div className={classNames('flex items-center w-full max-w-xl', className)}>
      <ProfilePicture className="mr-6" user={user} size="xxxlarge" />
      <div className="flex flex-col w-full">
        <p className="mb-1 font-bold typo-large-title">Your feed is ready</p>
        <p className="flex typo-callout text-theme-label-tertiary">
          Now that the recommendations system is up and running, consider
          reading more articles over the first week to help the feed improve.
        </p>
      </div>
    </div>
  );
};
