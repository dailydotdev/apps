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
import { LogEvent, Origin } from '../../../lib/log';
import { SquadActionButton } from '../../squads/SquadActionButton';
import { ButtonVariant } from '../../buttons/common';
import { Image, ImageType } from '../../image/Image';
import { CopyLinkButton } from '../../share/CopyLinkButton';
import { ReferralCampaignKey } from '../../../lib/referral';

export const UnfeaturedSquadGrid = ({
  source,
  className,
}: UnFeaturedSquadCardProps): ReactElement => {
  const title = source.name;
  const shareProps = {
    text: `Check out the ${title} squad on daily.dev`,
    link: source.permalink,
    cid: ReferralCampaignKey.ShareSource,
    logObject: () => ({
      event_name: LogEvent.ShareSource,
      target_id: source.id,
    }),
  };

  return (
    <Card
      className={classNames(
        'group/squad overflow-hidden border-0 p-4',
        className,
      )}
    >
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
        <div className="flex items-center gap-2">
          <CopyLinkButton
            className="relative z-0 laptop:opacity-0 laptop:group-focus-within/squad:opacity-100 laptop:group-hover/squad:opacity-100"
            shareProps={shareProps}
            variant={ButtonVariant.Float}
          />
          <SquadActionButton
            className={{ button: 'z-0' }}
            squad={source}
            origin={Origin.SquadDirectory}
            data-testid="squad-action"
            buttonVariants={[ButtonVariant.Secondary, ButtonVariant.Float]}
          />
        </div>
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
