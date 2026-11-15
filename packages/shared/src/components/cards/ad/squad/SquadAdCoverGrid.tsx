import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import FeedItemContainer from '../../common/FeedItemContainer';
import type { SquadAdFeedProps } from './common';
import { useSquadAd } from './common';
import { Image } from '../../../image/Image';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../typography/Typography';
import { Separator } from '../../common/common';
import { ProfileImageSize, ProfilePicture } from '../../../ProfilePicture';
import { AdPixel } from '../common/AdPixel';
import { AdViewability } from '../common/AdViewability';
import { Tooltip } from '../../../tooltip/Tooltip';
import Link from '../../../utilities/Link';
import { SquadOptionsButton } from '../../common/SquadOptionsButton';
import { largeNumberFormat } from '../../../../lib';
import { pluralize } from '../../../../lib/strings';
import { SquadFeedStats } from './SquadFeedStats';
import { CardLink } from '../../common/Card';
import { SquadActionButton } from '../../../squads/SquadActionButton';
import { SquadImage } from '../../../squads/SquadImage';
import { ButtonVariant } from '../../../buttons/common';
import { Origin } from '../../../../lib/log';
import { useScrambler } from '../../../../hooks/useScrambler';
import { storeSquadBoostClick } from '../../../../features/monetization/squadBoostClick';
import { getSquadBanner } from '../../../../features/squads/components/discover/common';

export function SquadAdCoverGrid({
  item,
  onClickAd,
  onMount,
  onViewable,
}: SquadAdFeedProps): ReactElement {
  const { source } = item.ad.data;
  const { squad, campaign, members, shouldShowAction, onJustJoined } =
    useSquadAd({ ad: item.ad });
  const { ref, inView } = useInView({ triggerOnce: true });
  const promotedText = useScrambler('Promoted');
  const promotedByTooltip = useScrambler(
    `Promoted by @${campaign?.user?.username}`,
  );
  const membersCount = largeNumberFormat(source.membersCount);
  const membersLabel = pluralize(
    shouldShowAction ? 'dev' : 'member',
    source.membersCount,
  );

  useEffect(() => {
    if (!inView) {
      return;
    }

    onMount?.();
  }, [inView, onMount]);

  return (
    <FeedItemContainer
      data-testid="adItem"
      domProps={{ className: 'flex flex-col group overflow-hidden' }}
      ref={ref}
    >
      <Link href={source.permalink}>
        <CardLink
          href={source.permalink}
          onClick={() => {
            onClickAd();
            storeSquadBoostClick(item.ad);
          }}
        />
      </Link>
      {item.ad?.pixel && (
        <span className="absolute bottom-0 left-0">
          <AdPixel pixel={item.ad.pixel} />
        </span>
      )}
      <AdViewability ad={item.ad} onViewable={(data) => onViewable?.(data)} />
      <div className="relative h-28 shrink-0">
        <Image
          src={getSquadBanner(squad ?? source)}
          alt=""
          className="size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background-subtle" />
      </div>
      <div className="absolute right-2 top-2">
        <SquadOptionsButton squad={source} />
      </div>
      <div className="flex flex-col items-center px-4 text-center">
        <SquadImage
          className="relative -mt-11 size-18 border-4 border-background-subtle"
          {...source}
        />
        <Typography
          bold
          type={TypographyType.Title3}
          className="mt-2 line-clamp-2"
        >
          {source.name}
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
          className="mt-1"
        >
          <Tooltip content={promotedByTooltip}>
            <button type="button" disabled className="relative">
              {promotedText}
            </button>
          </Tooltip>
          <Separator />@{source.handle}
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
          className="mt-2 line-clamp-2"
        >
          {source.description}
        </Typography>
        <div className="mt-4 flex flex-row items-center">
          {members?.slice(0, 4).map(({ user }, index) => (
            <ProfilePicture
              className={index > 0 ? '-ml-2' : undefined}
              size={ProfileImageSize.Small}
              key={user.id}
              user={user}
            />
          ))}
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
            className="ml-2"
          >
            {shouldShowAction && 'Join '}
            <strong className="text-text-primary">{membersCount}</strong>{' '}
            {membersLabel}
          </Typography>
        </div>
        <div className="mt-2 flex justify-center">
          <SquadFeedStats source={source} />
        </div>
      </div>
      {shouldShowAction && (
        <div className="mt-auto p-4">
          <SquadActionButton
            squad={squad}
            origin={Origin.Feed}
            alwaysShow
            buttonVariants={[ButtonVariant.Primary, ButtonVariant.Subtle]}
            onSuccess={() => onJustJoined(true)}
            className={{ button: 'w-full' }}
          />
        </div>
      )}
    </FeedItemContainer>
  );
}
