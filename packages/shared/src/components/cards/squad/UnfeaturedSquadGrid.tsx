import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { Card, CardLink } from '../common/Card';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../typography/Typography';
import { largeNumberFormat } from '../../../lib';
import { Separator } from '../common/common';
import type { UnFeaturedSquadCardProps } from './common/types';
import { Origin } from '../../../lib/log';
import { SquadActionButton } from '../../squads/SquadActionButton';
import { ButtonVariant } from '../../buttons/common';
import { Image, ImageType } from '../../image/Image';
import { useSquadDirectoryShareEnabled } from '../../../hooks/squads/useSquadDirectoryShareEnabled';
import { SquadDirectoryShareButton } from './SquadDirectoryShareButton';

export const UnfeaturedSquadGrid = ({
  source,
  className,
}: UnFeaturedSquadCardProps): ReactElement => {
  const title = source.name;
  const canShare = useSquadDirectoryShareEnabled();

  // Flag-off must keep the exact original DOM (Join alone in the header row);
  // the share control and its wrapper only exist when the sharing flags are on.
  const joinButton = (
    <SquadActionButton
      className={{ button: 'z-0' }}
      squad={source}
      origin={Origin.SquadDirectory}
      data-testid="squad-action"
      buttonVariants={[ButtonVariant.Secondary, ButtonVariant.Float]}
    />
  );

  return (
    <Card className={classNames('overflow-hidden border-0 p-4', className)}>
      <CardLink
        href={source.permalink}
        rel="noopener"
        title={source.description}
      />
      <div className="mb-3 flex items-center justify-between">
        <Image
          src={source.image}
          alt={`${title} source`}
          className="size-16 rounded-full"
          type={ImageType.Squad}
        />
        {canShare ? (
          <div className="z-0 flex flex-row items-center gap-2">
            {joinButton}
            <SquadDirectoryShareButton squad={source} />
          </div>
        ) : (
          joinButton
        )}
      </div>
      <Typography
        tag={TypographyTag.H1}
        type={TypographyType.Body}
        bold
        truncate
      >
        {title}
      </Typography>
      <Typography
        tag={TypographyTag.P}
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
        className="multi-truncate line-clamp-2"
      >
        {source?.description}
      </Typography>

      <Typography
        color={TypographyColor.Tertiary}
        type={TypographyType.Footnote}
        className="mt-2"
        truncate
      >
        @{source.handle} <Separator />
        <strong data-testid="squad-members-count">
          {largeNumberFormat(source.membersCount)} members
        </strong>
      </Typography>
    </Card>
  );
};
