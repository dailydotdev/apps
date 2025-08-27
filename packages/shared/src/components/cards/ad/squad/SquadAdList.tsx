import type { ReactElement } from 'react';
import React from 'react';
import FeedItemContainer from '../../common/list/FeedItemContainer';
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
import { HorizontalSeparator } from '../../../utilities';
import { ProfileImageSize, ProfilePicture } from '../../../ProfilePicture';
import { Button, ButtonVariant } from '../../../buttons/Button';
import { AdPixel } from '../common/AdPixel';
import { Tooltip } from '../../../tooltip/Tooltip';
import { Origin } from '../../../../lib/log';
import { SquadActionButton } from '../../../squads/SquadActionButton';
import { CardLink } from '../../common/Card';
import Link from '../../../utilities/Link';
import { SquadOptionsButton } from '../../common/SquadOptionsButton';
import { SquadAdStat } from './SquadAdStat';
import { SourceIcon } from '../../../icons';
import { IconSize } from '../../../Icon';

export function SquadAdList({ item }: SquadAdFeedProps): ReactElement {
  const { source } = item.ad.data;
  const { campaign, members, shouldShowAction, onJustJoined } = useSquadAd({
    item,
  });

  return (
    <FeedItemContainer
      data-testid="adItem"
      domProps={{ className: 'flex flex-col gap-4 group' }}
    >
      <Link href={source.permalink}>
        <CardLink href={source.permalink} />
      </Link>
      {item.ad?.pixel && <AdPixel pixel={item.ad.pixel} />}
      <div className="mb-2 flex w-full flex-row gap-2">
        <Image src={source.image} className="h-10 w-10 rounded-max" />
        <div className="flex flex-col gap-1">
          <Typography bold type={TypographyType.Footnote}>
            {source.name}
          </Typography>
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            <Tooltip content={`Boosted by ${campaign?.user?.username}`}>
              <button type="button" disabled>
                <strong>Boosted</strong>
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
          <SquadAdStat label="Posts" value={source.flags.totalPosts} />
          <Separator />
          <SquadAdStat label="Upvotes" value={source.flags.totalUpvotes} />
          <Separator />
          <SquadAdStat label="Awards" value={source.flags.totalAwards} />
        </div>
      </div>
      {shouldShowAction ? (
        <SquadActionButton
          squad={source}
          origin={Origin.Feed}
          alwaysShow
          buttonVariants={[ButtonVariant.Secondary, ButtonVariant.Subtle]}
          onSuccess={() => onJustJoined(true)}
          className={{ button: 'mt-auto w-full max-w-52' }}
        />
      ) : (
        <Link href={source.permalink} onClick={(e) => e.stopPropagation()}>
          <Button
            tag="a"
            href={source.permalink}
            variant={ButtonVariant.Subtle}
            className="z-1 mt-auto w-full max-w-52"
          >
            View Squad
          </Button>
        </Link>
      )}
    </FeedItemContainer>
  );
}
