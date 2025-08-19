import type { ReactElement } from 'react';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import FeedItemContainer from '../../common/FeedItemContainer';
import type { SquadAdFeedProps } from './common';
import { Image } from '../../../image/Image';
import { dummySquad, getSquadMembers } from '../../../../graphql/squads';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../typography/Typography';
import { Separator, separatorCharacter } from '../../common/common';
import type { WithClassNameProps } from '../../../utilities';
import { HorizontalSeparator } from '../../../utilities';
import type { BasicSourceMember } from '../../../../graphql/sources';
import { generateQueryKey, RequestKey, StaleTime } from '../../../../lib/query';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { ProfileImageSize, ProfilePicture } from '../../../ProfilePicture';
import { largeNumberFormat } from '../../../../lib';
import { Button, ButtonVariant } from '../../../buttons/Button';
import { AdPixel } from '../common/AdPixel';
import { Tooltip } from '../../../tooltip/Tooltip';
import { getCampaignById } from '../../../../graphql/campaigns';
import { Origin } from '../../../../lib/log';
import { SquadActionButton } from '../../../squads/SquadActionButton';
import { CardLink } from '../../common/Card';
import Link from '../../../utilities/Link';
import { SquadOptionsButton } from '../../common/SquadOptionsButton';

const Stat = ({
  label,
  value,
  className,
}: { label: string; value: number } & WithClassNameProps) => (
  <Typography
    className={className}
    tag={TypographyTag.Span}
    type={TypographyType.Footnote}
    color={TypographyColor.Primary}
  >
    <strong className="mr-1">{largeNumberFormat(value)}</strong>
    <span className="text-text-tertiary">{label}</span>
  </Typography>
);

export function SquadAdGrid({ item }: SquadAdFeedProps): ReactElement {
  const source = dummySquad;
  const { user: loggedUser } = useAuthContext();
  const campaignId = item.ad?.data?.source?.flags?.campaignId;
  const { data: campaign } = useQuery({
    queryKey: generateQueryKey(RequestKey.Campaigns, loggedUser, campaignId),
    queryFn: () => getCampaignById(campaignId),
    enabled: !!campaignId,
    staleTime: StaleTime.Default,
  });
  const { data: members } = useQuery<BasicSourceMember[]>({
    queryKey: generateQueryKey(RequestKey.SquadMembers, loggedUser, source.id),
    queryFn: () => getSquadMembers(source.id),
    staleTime: StaleTime.OneHour,
  });
  const isMember = !!source.currentMember;
  const [justJoined, setJustJoined] = useState(false);

  const shouldShowAction = !isMember || justJoined;

  return (
    <FeedItemContainer
      data-testid="adItem"
      domProps={{ className: 'flex flex-col gap-3 group' }}
      flagProps={{}}
    >
      <CardLink href={source.permalink} />
      {item.ad?.pixel && <AdPixel pixel={item.ad.pixel} />}
      <div className="flex flex-row justify-between">
        <Image src={source.image} className="h-8 w-8 rounded-max" />
        <SquadOptionsButton />
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
        <Stat className="ml-2" label="members" value={source.membersCount} />
      </div>
      <div className="flex flex-row flex-wrap items-center text-text-tertiary">
        <Stat label="Posts" value={source.flags.totalPosts} />
        <Separator />
        <Stat label="Upvotes" value={source.flags.totalUpvotes} />
        <Separator />
        <Stat label="Awards" value={source.flags.totalAwards} />
      </div>
      {shouldShowAction ? (
        <SquadActionButton
          squad={source}
          origin={Origin.Feed}
          alwaysShow
          buttonVariants={[ButtonVariant.Secondary, ButtonVariant.Subtle]}
          onSuccess={() => setJustJoined(true)}
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
