import type { PropsWithChildren, ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import Link from '../../utilities/Link';
import SquadMemberShortList from '../../squads/SquadMemberShortList';
import { Card, CardLink } from '../common/Card';
import { Image, ImageType } from '../../image/Image';
import { cloudinarySquadsDirectoryCardBannerDefault } from '../../../lib/image';
import type { UnFeaturedSquadCardProps } from './common/types';
import { SquadActionButton } from '../../squads/SquadActionButton';
import { Origin } from '../../../lib/log';
import { ButtonVariant } from '../../buttons/common';
import { anchorDefaultRel } from '../../../lib/strings';
import { useCampaignById } from '../../../graphql/campaigns';
import { Tooltip } from '../../tooltip/Tooltip';
import { Separator } from '../common/common';
import type { BasicSourceMember } from '../../../graphql/sources';
import { getSquadMembers } from '../../../graphql/squads';
import { generateQueryKey, RequestKey, StaleTime } from '../../../lib/query';
import { useAuthContext } from '../../../contexts/AuthContext';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import { useSquadsDirectoryLogging } from './common/useSquadsDirectoryLogging';

export enum SourceCardBorderColor {
  Avocado = 'avocado',
  Burger = 'burger',
  BlueCheese = 'blueCheese',
  Lettuce = 'lettuce',
  Cheese = 'cheese',
  Bun = 'bun',
  Ketchup = 'ketchup',
  Bacon = 'bacon',
  Cabbage = 'cabbage',
  Onion = 'onion',
  Water = 'water',
  Salt = 'salt',
  Pepper = 'pepper',
}

const borderColorToClassName: Record<SourceCardBorderColor, string> = {
  [SourceCardBorderColor.Avocado]: '!border-accent-avocado-default',
  [SourceCardBorderColor.Burger]: '!border-accent-burger-default',
  [SourceCardBorderColor.BlueCheese]: '!border-accent-blueCheese-default',
  [SourceCardBorderColor.Lettuce]: '!border-accent-lettuce-default',
  [SourceCardBorderColor.Cheese]: '!border-accent-cheese-default',
  [SourceCardBorderColor.Bun]: '!border-accent-bun-default',
  [SourceCardBorderColor.Ketchup]: '!border-accent-ketchup-default',
  [SourceCardBorderColor.Bacon]: '!border-accent-bacon-default',
  [SourceCardBorderColor.Cabbage]: '!border-accent-cabbage-default',
  [SourceCardBorderColor.Onion]: '!border-accent-onion-default',
  [SourceCardBorderColor.Water]: '!border-accent-water-default',
  [SourceCardBorderColor.Salt]: '!border-accent-salt-default',
  [SourceCardBorderColor.Pepper]: '!border-accent-pepper-default',
};

export const SquadGrid = ({
  source,
  className,
  border,
  children,
  ad,
}: PropsWithChildren<UnFeaturedSquadCardProps>): ReactElement => {
  const { user } = useAuthContext();
  const campaignId = ad?.data?.source?.flags?.campaignId;
  const { data: campaign } = useCampaignById(campaignId);
  const {
    headerImage,
    image,
    color,
    name,
    handle,
    description,
    permalink,
    membersCount,
  } = source;
  const { data: members } = useQuery<BasicSourceMember[]>({
    queryKey: generateQueryKey(RequestKey.SquadMembers, user, source.id),
    queryFn: () => getSquadMembers(source.id),
    staleTime: StaleTime.OneHour,
  });
  const borderColor = border || color || SourceCardBorderColor.Avocado;
  const { ref, onClickAd } = useSquadsDirectoryLogging(ad);

  return (
    <Card
      className={classNames(
        'relative overflow-hidden !p-0',
        borderColorToClassName[borderColor],
        className,
      )}
      ref={ad ? ref : undefined}
    >
      <Link
        href={permalink}
        legacyBehavior
        onClick={ad ? onClickAd : undefined}
      >
        <CardLink
          href={permalink}
          rel={anchorDefaultRel}
          title={source.description}
        />
      </Link>
      <Image
        className="rounded-t-16 bg-accent-onion-bolder absolute left-0 right-0 top-0 h-24 w-full object-cover"
        src={headerImage || cloudinarySquadsDirectoryCardBannerDefault}
        alt="Banner image for source"
      />
      <div className="z-1 rounded-t-16 bg-background-subtle mt-12 flex flex-1 flex-col p-4">
        <div className="-mt-14 mb-3 flex items-end justify-between">
          <Image
            className="size-24 rounded-full"
            src={image}
            alt={`${name} source`}
            type={ImageType.Squad}
          />
          {membersCount > 0 && (
            <SquadMemberShortList squad={source} members={members} />
          )}
        </div>
        <div className="flex flex-1 flex-col justify-between">
          <div className="mb-5 flex-auto">
            <div className="typo-title3 font-bold">{name}</div>
            <Typography
              className="flex flex-row items-center"
              type={TypographyType.Callout}
              color={TypographyColor.Secondary}
            >
              {campaign && (
                <Tooltip content={`Ad by @${campaign.user.username}`}>
                  <button
                    type="button"
                    disabled
                    className="text-action-comment-default relative"
                  >
                    <strong>Ad</strong>
                  </button>
                </Tooltip>
              )}
              {campaign && <Separator />}
              {handle}
            </Typography>
            {description && (
              <div className="multi-truncate text-text-secondary mt-1 line-clamp-5">
                {description}
              </div>
            )}
          </div>

          <SquadActionButton
            className={{ button: 'z-0 w-full' }}
            squad={source}
            origin={Origin.SquadDirectory}
            data-testid="squad-action"
            buttonVariants={[ButtonVariant.Secondary, ButtonVariant.Float]}
          />
        </div>
      </div>
      {children}
    </Card>
  );
};
