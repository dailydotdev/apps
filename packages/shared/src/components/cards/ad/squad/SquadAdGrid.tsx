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
  TypographyType,
} from '../../../typography/Typography';
import { Separator } from '../../common/common';
import { HorizontalSeparator } from '../../../utilities';
import { ProfileImageSize, ProfilePicture } from '../../../ProfilePicture';
import { AdPixel } from '../common/AdPixel';
import { Tooltip } from '../../../tooltip/Tooltip';
import Link from '../../../utilities/Link';
import { SquadOptionsButton } from '../../common/SquadOptionsButton';
import { SquadAdStat } from './SquadAdStat';
import { pluralize } from '../../../../lib/strings';
import { SquadFeedStats } from './SquadFeedStats';
import { CardLink } from '../../common/Card';
import { SquadAdAction } from './SquadAdAction';
import { useScrambler } from '../../../../hooks/useScrambler';

export function SquadAdGrid({
  item,
  onClickAd,
  onMount,
}: SquadAdFeedProps): ReactElement {
  const { source } = item.ad.data;
  const { squad, campaign, members, shouldShowAction, onJustJoined } =
    useSquadAd({
      item,
    });
  const { ref, inView } = useInView({ triggerOnce: true });
  const promotedText = useScrambler('Promoted');
  const promotedByTooltip = useScrambler(
    `Promoted by @${campaign?.user?.username}`,
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
      domProps={{ className: 'flex flex-col gap-3 group px-3 py-3' }}
      ref={ref}
    >
      <Link href={source.permalink} onClick={onClickAd}>
        <CardLink href={source.permalink} />
      </Link>
      {item.ad?.pixel && <AdPixel pixel={item.ad.pixel} />}
      <div className="flex flex-row justify-between">
        <Image src={source.image} className="h-8 w-8 rounded-max" />
        <SquadOptionsButton squad={source} />
      </div>
      <div className="flex flex-col gap-1">
        <Typography bold type={TypographyType.Title3}>
          {source.name}
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          <Tooltip content={promotedByTooltip}>
            <button
              type="button"
              disabled
              className="relative text-action-comment-default"
            >
              <strong>{promotedText}</strong>
            </button>
          </Tooltip>
          <Separator />@{source.handle}
        </Typography>
      </div>
      <Typography type={TypographyType.Callout} className="line-clamp-5">
        {source.description}
      </Typography>
      <HorizontalSeparator />
      <div className="flex flex-row items-center">
        {members?.slice(0, 3).map(({ user }, index) => (
          <ProfilePicture
            className={index > 0 && '-ml-2'}
            size={ProfileImageSize.Small}
            key={user.id}
            user={user}
          />
        ))}
        <SquadAdStat
          className="ml-2"
          label={pluralize('member', source.membersCount)}
          value={source.membersCount}
        />
      </div>
      <SquadFeedStats source={source} />
      <SquadAdAction
        squad={squad}
        onJustJoined={() => onJustJoined(true)}
        shouldShowAction={shouldShowAction}
      />
    </FeedItemContainer>
  );
}
