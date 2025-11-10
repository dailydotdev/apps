import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import FeedItemContainer from '../../common/list/FeedItemContainer';
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
import { CardLink } from '../../common/Card';
import Link from '../../../utilities/Link';
import { SquadOptionsButton } from '../../common/SquadOptionsButton';
import { SquadAdStat } from './SquadAdStat';
import { SquadFeedStats } from './SquadFeedStats';
import { SquadAdAction } from './SquadAdAction';

export function SquadAdList({
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

  useEffect(() => {
    if (!inView) {
      return;
    }

    onMount?.();
  }, [inView, onMount]);

  return (
    <FeedItemContainer
      data-testid="adItem"
      domProps={{ className: 'flex flex-col gap-4 group' }}
      ref={ref}
    >
      <Link href={source.permalink} onClick={onClickAd}>
        <CardLink href={source.permalink} />
      </Link>
      {item.ad?.pixel && <AdPixel pixel={item.ad.pixel} />}
      <div className="mb-2 flex w-full flex-row gap-2">
        <Image src={source.image} className="rounded-max h-10 w-10" />
        <div className="flex flex-col gap-1">
          <Typography bold type={TypographyType.Footnote}>
            {source.name}
          </Typography>
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            <Tooltip content={`Promoted by @${campaign?.user?.username}`}>
              <button
                type="button"
                disabled
                className="text-action-comment-default relative"
              >
                <strong>Promoted</strong>
              </button>
            </Tooltip>
            <Separator />@{source.handle}
          </Typography>
        </div>
        <SquadOptionsButton squad={source} className="ml-auto" />
      </div>
      <Typography type={TypographyType.Callout} className="line-clamp-5">
        {source.description}
      </Typography>
      <HorizontalSeparator />
      <div className="flex flex-col gap-1">
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
            label="members"
            value={source.membersCount}
          />
        </div>
        <SquadFeedStats source={source} />
      </div>
      <SquadAdAction
        squad={squad}
        onJustJoined={() => onJustJoined(true)}
        shouldShowAction={shouldShowAction}
        className="relative w-full max-w-52"
      />
    </FeedItemContainer>
  );
}
