import React, { ReactElement, useContext } from 'react';
import classNames from 'classnames';
import { ProfilePicture } from '../ProfilePicture';
import AuthContext from '../../contexts/AuthContext';

export type FeedReadyMessageProps = {
  className?: {
    main?: string;
    textContainer?: string;
    header?: string;
  };
};

export const FeedReadyMessage = ({
  className,
}: FeedReadyMessageProps): ReactElement => {
  const { user } = useContext(AuthContext);

  return (
    <div
      className={classNames(
        'mx-auto flex w-full flex-col items-center gap-5 text-center laptop:mx-0 laptop:flex-row laptop:text-left',
        className.main,
      )}
    >
      <ProfilePicture user={user} size="xxxlarge" />
      <div className={classNames('w-full', className.textContainer)}>
        <p
          className={classNames('font-bold typo-large-title', className.header)}
        >
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
