import classNames from 'classnames';
import React, { ReactElement } from 'react';
import { Source } from '../../graphql/sources';
import { Separator } from '../cards/common';
import SourceButton from '../cards/SourceButton';
import { ProfileImageSize } from '../ProfilePicture';

interface SourceInfoProps {
  source: Source;
  date?: string;
  size?: ProfileImageSize;
  className?: string;
}

function PostSourceInfo({
  date,
  source,
  size = ProfileImageSize.Medium,
  className,
}: SourceInfoProps): ReactElement {
  const isUnknown = source.id === 'unknown';
  return (
    <span
      className={classNames(
        'flex flex-row items-center text-text-tertiary typo-footnote',
        className,
      )}
    >
      {!isUnknown && (
        <>
          <SourceButton source={source} size={size} />
          <h3 className="ml-3">{source.handle}</h3>
        </>
      )}
      {!!date && (
        <>
          {!isUnknown && <Separator />}
          <time dateTime={date}>{date}</time>
        </>
      )}
    </span>
  );
}

export default PostSourceInfo;
