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
import { LogEvent, Origin } from '../../../lib/log';
import { Image, ImageType } from '../../image/Image';
import { ButtonSize, ButtonVariant } from '../../buttons/common';
import type { Ad } from '../../../graphql/posts';
import { useSquadsDirectoryLogging } from './common/useSquadsDirectoryLogging';
import { AdViewability } from '../ad/common/AdViewability';
import { useScrambler } from '../../../hooks/useScrambler';
import { CopyLinkButton } from '../../share/CopyLinkButton';
import { ReferralCampaignKey } from '../../../lib/referral';

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
  const { ref, onClickAd, onViewableAd } = useSquadsDirectoryLogging(ad);
  const promotedText = useScrambler('Promoted');
  const shareProps = {
    text: `Check out the ${name} squad on daily.dev`,
    link: permalink,
    cid: ReferralCampaignKey.ShareSource,
    logObject: () => ({
      event_name: LogEvent.ShareSource,
      target_id: squad.id,
    }),
  };

  return (
    <div
      {...attrs}
      className="group/squad-row relative flex flex-row items-center gap-4"
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
      <div className="flex min-w-0 flex-1 flex-col">
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
              {promotedText} <Separator />
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
      <div className="flex items-center gap-2">
        <CopyLinkButton
          className="relative z-0 laptop:mouse:opacity-0 laptop:mouse:group-focus-within/squad-row:opacity-100 laptop:mouse:group-hover/squad-row:opacity-100"
          origin={Origin.SquadDirectory}
          shareProps={shareProps}
          size={ButtonSize.Medium}
          variant={ButtonVariant.Tertiary}
        />
        <SquadActionButton
          className={{ button: 'z-0' }}
          squad={squad}
          origin={Origin.SquadDirectory}
          copy={{ join: 'Join', view: 'View' }}
          data-testid="squad-action"
          buttonVariants={[ButtonVariant.Secondary, ButtonVariant.Float]}
        />
      </div>
      {children}
      {!!ad && <AdViewability ad={ad} onViewable={onViewableAd} />}
    </div>
  );
};
