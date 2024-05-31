import React, { ReactElement, ReactNode } from 'react';
import { Source } from '../../../graphql/sources';
import { FlexRow } from '../../utilities';
import { SourceAvatar } from './SourceAvatar';
import { ProfileImageSize } from '../../ProfilePicture';

interface SourceShortInfoProps {
  source: Source;
  className?: string;
  children?: ReactNode;
  size?: ProfileImageSize;
}

export function SourceShortInfo({
  source,
  className,
  children,
  size,
}: SourceShortInfoProps): ReactElement {
  if (!source) {
    return null;
  }

  return (
    <FlexRow className={className}>
      <SourceAvatar source={source} size={size} />
      <span className="flex flex-col items-start typo-callout">
        <h3 className="font-bold">{source.name}</h3>
        {source.handle && (
          <p className="text-text-quaternary">@{source.handle}</p>
        )}
      </span>
      {children}
    </FlexRow>
  );
}
