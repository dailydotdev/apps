import type { ReactElement } from 'react';
import React from 'react';
import FeedItemContainer from '../../common/FeedItemContainer';
import type { SquadAdFeedProps } from './common';
import { useSquadAd } from './common';
import { Image } from '../../../image/Image';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../typography/Typography';
import { Separator, separatorCharacter } from '../../common/common';
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

export function SquadAdGrid({ item }: SquadAdFeedProps): ReactElement {
  const { source } = item.ad.data;
  const { campaign, members, shouldShowAction, onJustJoined } = useSquadAd({
    item,
  });

  return (
    <FeedItemContainer
      data-testid="adItem"
      domProps={{ className: 'flex flex-col gap-3 group' }}
      flagProps={{}}
    >
      <Link href={source.permalink}>
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
          <Tooltip content={`Boosted by ${campaign?.user?.username}`}>
            <button type="button" disabled>
              <strong>Boosted</strong>
            </button>
          </Tooltip>
          {separatorCharacter} @{source.handle}
        </Typography>
      </div>
      <Typography type={TypographyType.Callout}>
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
          label="members"
          value={source.membersCount}
        />
      </div>
      <div className="flex flex-row flex-wrap items-center text-text-tertiary">
        <SquadAdStat label="Posts" value={source.flags.totalPosts} />
        <Separator />
        <SquadAdStat label="Upvotes" value={source.flags.totalUpvotes} />
        <Separator />
        <SquadAdStat label="Awards" value={source.flags.totalAwards} />
      </div>
      {shouldShowAction ? (
        <SquadActionButton
          squad={source}
          origin={Origin.Feed}
          alwaysShow
          buttonVariants={[ButtonVariant.Secondary, ButtonVariant.Subtle]}
          onSuccess={() => onJustJoined(true)}
        />
      ) : (
        <Link href={source.permalink}>
          <Button
            tag="a"
            href={source.permalink}
            variant={ButtonVariant.Subtle}
            className="mt-auto w-full"
          >
            View Squad
          </Button>
        </Link>
      )}
    </FeedItemContainer>
  );
}
