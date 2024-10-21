import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import Link from 'next/link';
import SquadMemberShortList from '../../squads/SquadMemberShortList';
import { Card, CardLink } from '../common/Card';
import { Image, ImageType } from '../../image/Image';
import { cloudinarySquadsDirectoryCardBannerDefault } from '../../../lib/image';
import { UnFeaturedSquadCardProps } from './common/types';
import { SquadActionButton } from '../../squads/SquadActionButton';
import { Origin } from '../../../lib/log';
import { ButtonVariant } from '../../buttons/common';
import { useViewSize, ViewSize } from '../../../hooks';
import { anchorDefaultRel } from '../../../lib/strings';

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
        'relative overflow-hidden !p-0',
        borderColorToClassName[borderColor],
        className,
      )}
    >
      <Link href={permalink} legacyBehavior>
        <CardLink
          href={permalink}
          rel={anchorDefaultRel}
          title={source.description}
        />
      </Link>
      <Image
        className="absolute left-0 right-0 top-0 h-24 w-full rounded-t-16 bg-accent-onion-bolder object-cover"
        src={headerImage || cloudinarySquadsDirectoryCardBannerDefault}
        alt="Banner image for source"
      />
      <div className="z-1 mt-12 flex flex-1 flex-col rounded-t-16 bg-background-subtle p-4">
        <div className="-mt-14 mb-3 flex items-end justify-between">
          <Image
            className="size-24 rounded-full"
            src={image}
            alt={`${name} source`}
            type={ImageType.Squad}
          />
          {membersCount > 0 && (
            <SquadMemberShortList
              squad={source}
              members={source.members?.edges?.map(({ node }) => node)}
            />
          )}
        </div>
        <div className="flex flex-1 flex-col justify-between">
          <div className="mb-5 flex-auto">
            <div className="font-bold typo-title3">{name}</div>
            {handle && <div className="text-text-secondary">{handle}</div>}
            {description && (
              <div className="multi-truncate mt-1 line-clamp-5 text-text-secondary">
                {description}
              </div>
            )}
          </div>

          <SquadActionButton
            showViewSquadIfMember
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
