import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { Separator } from '../common';
import { DateFormat } from '../../../utilities';
import { TimeFormatType } from '../../../../lib/dateFormat';

import { useFeedCardContext } from '../../../../features/posts/FeedCardContext';
import {
  Typography,
  TypographyType,
  TypographyColor,
} from '../../../typography/Typography';

export interface PostMetadataProps {
  className?: string;
  topLabel?: ReactElement | string;
  bottomLabel?: ReactElement | string;
  createdAt?: string;
}

export default function PostMetadata({
  className,
  createdAt,
  topLabel,
  bottomLabel,
}: PostMetadataProps): ReactElement {
  const { boostedBy } = useFeedCardContext();

  return (
    <div className={classNames('grid items-center', className)}>
      {topLabel && (
        <div className="typo-footnote truncate font-bold">{topLabel}</div>
      )}
      <div className="text-text-tertiary typo-footnote flex flex-row items-center truncate">
        {boostedBy && (
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
            bold
          >
            Ad by @{boostedBy.username}
          </Typography>
        )}
        {!!boostedBy && !!bottomLabel && <Separator />}
        {bottomLabel}
        {(!!bottomLabel || !!boostedBy) && !!createdAt && <Separator />}
        {!!createdAt && (
          <DateFormat date={createdAt} type={TimeFormatType.Post} />
        )}
      </div>
    </div>
  );
}
