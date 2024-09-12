import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import SquadMemberShortList from '../../squads/SquadMemberShortList';
import { Card } from '../Card';
import { Image, ImageType } from '../../image/Image';
import { cloudinary } from '../../../lib/image';
import { UnFeaturedSquadCardProps } from './common/types';
import { SquadJoinButton } from '../../squads/SquadJoinButton';
import { Origin } from '../../../lib/log';
import { ButtonVariant } from '../../buttons/common';
import { useViewSize, ViewSize } from '../../../hooks';

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
}: UnFeaturedSquadCardProps): ReactElement => {
  const router = useRouter();
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
  const borderColor = color || SourceCardBorderColor.Avocado;
  const isMobile = useViewSize(ViewSize.MobileL);

  return (
    <Card
      className={classNames(
        'overflow-hidden !p-0',
        borderColorToClassName[borderColor],
        className,
      )}
    >
      <div className="h-24 rounded-t-16 bg-accent-onion-bolder">
        <Image
          className="h-full w-full object-cover"
          src={headerImage || cloudinary.squads.directory.cardBannerDefault}
          alt="Banner image for source"
        />
      </div>
      <div className="-mt-12 flex flex-1 flex-col rounded-t-16 bg-background-subtle p-4">
        <div className="-mt-14 mb-3 flex items-end justify-between">
          <a href={permalink}>
            <Image
              className="size-24 rounded-full"
              src={image}
              alt={`${name} source`}
              type={ImageType.Squad}
            />
          </a>
          {membersCount > 0 && (
            <SquadMemberShortList
              squad={source}
              members={source.members?.edges?.map(({ node }) => node)}
            />
          )}
        </div>
        <div className="flex flex-1 flex-col justify-between">
          <div className="mb-5 flex-auto">
            <a href={permalink}>
              <div className="font-bold typo-title3">{name}</div>
              {handle && <div className="text-text-secondary">{handle}</div>}
            </a>
            {description && (
              <div className="multi-truncate mt-1 line-clamp-5 text-text-secondary">
                {description}
              </div>
            )}
          </div>

          <SquadJoinButton
            showViewSquad
            className={{ button: 'z-0 w-full' }}
            squad={source}
            origin={Origin.SquadDirectory}
            onSuccess={() => router.push(source.permalink)}
            data-testid="squad-action"
            buttonVariants={[
              ButtonVariant.Secondary,
              isMobile ? ButtonVariant.Float : ButtonVariant.Secondary,
            ]}
          />
        </div>
      </div>
    </Card>
  );
};
