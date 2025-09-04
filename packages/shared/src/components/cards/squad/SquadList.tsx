import type { ComponentProps, ReactElement, ReactNode } from 'react';
import React from 'react';
import Link from '../../utilities/Link';
import type { Squad } from '../../../graphql/sources';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import { Separator } from '../common/common';
import { largeNumberFormat } from '../../../lib';
import { CardLink } from '../common/Card';
import { SquadActionButton } from '../../squads/SquadActionButton';
import { Origin } from '../../../lib/log';
import { Image, ImageType } from '../../image/Image';
import { ButtonVariant } from '../../buttons/common';
import type { Ad } from '../../../graphql/posts';
import { useSquadsDirectoryLogging } from './common/useSquadsDirectoryLogging';

interface SquadListProps extends ComponentProps<'div'> {
  squad: Squad;
  shouldShowCount?: boolean;
  children?: ReactNode;
  ad?: Ad;
}

export const SquadList = ({
  squad,
  shouldShowCount = true,
  children,
  ad,
  ...attrs
}: SquadListProps): ReactElement => {
  const { image, name, permalink } = squad;
  const campaignId = ad?.data?.source?.flags?.campaignId;
  const { ref, onClickAd } = useSquadsDirectoryLogging(ad);

  return (
    <div
      {...attrs}
      className="relative flex flex-row items-center gap-4"
      ref={ad ? ref : undefined}
    >
      <Link
        href={permalink}
        legacyBehavior
        onClick={ad ? onClickAd : undefined}
      >
        <CardLink href={permalink} rel="noopener" title={name} />
      </Link>
      <Image
        className="size-14 rounded-full"
        src={image}
        alt={`${name} source`}
        type={ImageType.Squad}
      />
      <div className="flex max-w-[calc(100%-10rem)] flex-1 flex-col">
        <Typography type={TypographyType.Callout} bold truncate>
          {name}
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
          truncate
        >
          {campaignId && (
            <strong>
              Boosted <Separator />
            </strong>
          )}
          @{squad.handle}
          {shouldShowCount && <Separator />}
          {shouldShowCount && (
            <strong data-testid="squad-members-count">
              {largeNumberFormat(squad.membersCount)} members
            </strong>
          )}
        </Typography>
      </div>
      <SquadActionButton
        className={{ button: 'z-0' }}
        squad={squad}
        origin={Origin.SquadDirectory}
        copy={{ join: 'Join', view: 'View' }}
        data-testid="squad-action"
        buttonVariants={[ButtonVariant.Secondary, ButtonVariant.Float]}
      />
      {children}
    </div>
  );
};
