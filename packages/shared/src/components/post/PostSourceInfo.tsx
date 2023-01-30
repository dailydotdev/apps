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
  typo?: string;
}

function PostSourceInfo({
  date,
  source,
  size = 'medium',
  typo = 'typo-callout',
}: SourceInfoProps): ReactElement {
  return (
    <span
      className={classNames(
        'flex flex-row items-center text-theme-label-tertiary',
        typo,
      )}
    >
      <SourceButton source={source} size={size} />
      <h3 className="ml-3">{source.handle}</h3>
      <Separator />
      <time dateTime={date}>{date}</time>
    </span>
  );
}

export default PostSourceInfo;
