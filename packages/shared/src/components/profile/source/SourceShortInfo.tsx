import type { ReactElement } from 'react';
import React from 'react';
import type { Source } from '../../../graphql/sources';
import { FlexRow } from '../../utilities';
import { SourceAvatar } from './SourceAvatar';
import type { ProfileImageSize } from '../../ProfilePicture';

interface SourceShortInfoProps {
  source: Source;
  size?: ProfileImageSize;
}

export function SourceShortInfo({
  source,
  size,
}: SourceShortInfoProps): ReactElement {
  if (!source) {
    return null;
  }

  return (
    <FlexRow className="items-center">
      <SourceAvatar source={source} size={size} />
      <span className="flex flex-col items-start typo-callout">
        <h3 className="font-bold">{source.name}</h3>
        {source.handle && (
          <p className="text-text-quaternary">@{source.handle}</p>
        )}
      </span>
    </FlexRow>
  );
}
