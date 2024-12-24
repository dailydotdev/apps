import classNames from 'classnames';
import type { ReactElement } from 'react';
import React from 'react';
import Link from 'next/link';
import type { Source } from '../../graphql/sources';
import { Separator } from '../cards/common/common';
import SourceButton from '../cards/common/SourceButton';
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
          <Link href={source.permalink} className="ml-2 typo-callout">
            {source.handle}
          </Link>
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
