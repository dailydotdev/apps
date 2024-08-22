import React, { ReactElement } from 'react';
import classNames from 'classnames';
import SquadMemberShortList from '../../squads/SquadMemberShortList';
import { Card } from '../Card';
import { SourceType } from '../../../graphql/sources';
import { Image } from '../../image/Image';
import { cloudinary } from '../../../lib/image';
import { UnFeaturedSquadCardProps } from './common/types';
import { SquadImage } from './common/SquadImage';
import { SquadJoinButtonWrapper } from './common/SquadJoinButton';
import { ButtonVariant } from '../../buttons/common';

interface SourceCardProps extends UnFeaturedSquadCardProps {
  borderColor?: SourceCardBorderColor;
  banner?: string;
}
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
  title,
  subtitle,
  icon,
  action,
  description,
  borderColor = SourceCardBorderColor.Avocado,
  banner,
}: SourceCardProps): ReactElement => {
  return (
    <Card
      className={classNames(
        'overflow-hidden !p-0',
        borderColorToClassName[source?.borderColor || borderColor],
      )}
    >
      <div className="h-24 rounded-t-16 bg-accent-onion-bolder">
        <Image
          className="h-full w-full object-cover"
          src={
            source?.banner ||
            banner ||
            cloudinary.squads.directory.cardBannerDefault
          }
          alt="Banner image for source"
        />
      </div>
      <div className="-mt-12 flex flex-1 flex-col rounded-t-16 bg-background-subtle p-4">
        <div className="mb-3 flex items-end justify-between">
          <a href={source?.permalink}>
            <SquadImage
              image={source?.image}
              icon={icon}
              title={title}
              className="-mt-14"
            />
          </a>
          {source?.membersCount > 0 && (
            <SquadMemberShortList
              squad={{
                ...source,
                type: SourceType.Squad,
              }}
              members={source?.members?.edges?.reduce((acc, current) => {
                acc.push(current.node);
                return acc;
              }, [])}
            />
          )}
        </div>
        <div className="flex flex-1 flex-col justify-between">
          <div className="mb-5 flex-auto">
            <a href={source?.permalink}>
              <div className="font-bold typo-title3">{title}</div>
              {subtitle && (
                <div className="text-text-secondary">{subtitle}</div>
              )}
            </a>
            {description ||
              (source?.description && (
                <div className="multi-truncate mt-1 line-clamp-5 text-text-secondary">
                  {source?.description || description}
                </div>
              ))}
          </div>

          <SquadJoinButtonWrapper
            action={action}
            source={source}
            variant={ButtonVariant.Secondary}
            className={{
              squadJoinButton: '!btn-secondary w-full',
              simpleButton: 'w-full',
            }}
          />
        </div>
      </div>
    </Card>
  );
};
