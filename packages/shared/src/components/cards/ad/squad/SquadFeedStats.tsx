import type { ReactElement } from 'react';
import React from 'react';
import type { Squad } from '../../../../graphql/sources';
import { IconSize } from '../../../Icon';
import { SourceIcon } from '../../../icons';
import {
  Typography,
  TypographyTag,
  TypographyType,
  TypographyColor,
} from '../../../typography/Typography';
import { SquadAdStat } from './SquadAdStat';
import { pluralize } from '../../../../lib/strings';
import { Separator } from '../../common/common';

interface SquadFeedStatsProps {
  source: Squad;
}

export function SquadFeedStats({ source }: SquadFeedStatsProps): ReactElement {
  return (
    <div className="flex flex-row flex-wrap items-center text-text-tertiary">
      {source.flags.featured && (
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Footnote}
          color={TypographyColor.Brand}
          className="flex flex-row items-center"
        >
          <SourceIcon size={IconSize.Size16} />
          Featured
        </Typography>
      )}
      {source.flags.featured && <Separator />}
      <SquadAdStat
        label={pluralize('Post', source.flags.totalPosts)}
        value={source.flags.totalPosts}
      />
      <Separator />
      <SquadAdStat
        label={pluralize('Upvote', source.flags.totalUpvotes)}
        value={source.flags.totalUpvotes}
      />
      {!!source.flags.totalAwards && <Separator />}
      {!!source.flags.totalAwards && (
        <SquadAdStat
          label={pluralize('Award', source.flags.totalAwards)}
          value={source.flags.totalAwards}
        />
      )}
    </div>
  );
}
