import type { ReactElement } from 'react';
import React from 'react';
import type { Source } from '../../../graphql/sources';
import { SourceAvatar } from './SourceAvatar';
import type { ProfileImageSize } from '../../ProfilePicture';
import {
  Typography,
  TypographyColor,
  TypographyTag,
} from '../../typography/Typography';

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
    <div className="flex flex-1 flex-row items-center truncate">
      <SourceAvatar source={source} size={size} />
      <span className="flex flex-1 flex-col items-start truncate typo-callout">
        <Typography bold truncate tag={TypographyTag.H3} className="max-w-full">
          {source.name}
        </Typography>
        {source.handle && (
          <Typography color={TypographyColor.Quaternary} tag={TypographyTag.P}>
            @{source.handle}
          </Typography>
        )}
      </span>
    </div>
  );
}
