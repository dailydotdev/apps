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
  dateFirst?: boolean;
  dateLabel?: string;
  numSources?: number;
}

export default function PostMetadata({
  className,
  createdAt,
  topLabel,
  bottomLabel,
  dateFirst,
  dateLabel,
  numSources,
}: PostMetadataProps): ReactElement {
  const { boostedBy } = useFeedCardContext();
  const promotedText = useScrambler(
    boostedBy ? `Promoted by @${boostedBy.username}` : undefined,
  );
  const hasSources = !!numSources && numSources > 0;
  const dateNode = !!createdAt && (
    <DateFormat
      date={createdAt}
      type={TimeFormatType.Post}
      prefix={dateLabel ? `${dateLabel} ` : undefined}
    />
  );
  const sourcesNode = hasSources && (
    <span data-testid="numSources">
      {numSources} {numSources === 1 ? 'source' : 'sources'}
    </span>
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
        {dateFirst ? (
          <>
            {dateNode}
            {!!createdAt && !!bottomLabel && <Separator />}
            {bottomLabel}
          </>
        ) : (
          <>
            {bottomLabel}
            {(!!bottomLabel || !!boostedBy) && !!createdAt && <Separator />}
            {dateNode}
          </>
        )}
        {(!!createdAt || !!bottomLabel || !!boostedBy) && sourcesNode && (
          <Separator />
        )}
        {sourcesNode}
      </div>
    </div>
  );
}
