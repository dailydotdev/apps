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
import { useScrambler } from '../../../../hooks/useScrambler';

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
  const promotedText = useScrambler(
    boostedBy ? `Promoted by @${boostedBy.username}` : null,
  );

  return (
    <div className={classNames('grid items-center', className)}>
      {topLabel && (
        <div className="truncate font-bold typo-footnote">{topLabel}</div>
      )}
      <div className="flex flex-row items-center truncate text-text-tertiary typo-footnote">
        {boostedBy && (
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
            bold
          >
            {promotedText}
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
