import React, { ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import SquadMemberShortList from '../squads/SquadMemberShortList';
import { Card } from '../cards/Card';
import { SourceType, Squad } from '../../graphql/sources';
import { Image } from '../image/Image';
import { SquadJoinButton } from '../squads/SquadJoinButton';
import { Origin } from '../../lib/analytics';
import { cloudinary } from '../../lib/image';
import { Button, ButtonVariant } from '../buttons/ButtonV2';

type SourceCardActionType = 'link' | 'action';

interface SourceCardAction {
  type: SourceCardActionType;
  text: string;
  href?: string;
  target?: string;
  onClick?: () => void;
}

interface SourceCardProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: SourceCardAction;
  description?: string;
  borderColor?: SourceCardBorderColor;
  banner?: string;
  source?: Squad;
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
  [SourceCardBorderColor.Avocado]: '!border-theme-color-avocado',
  [SourceCardBorderColor.Burger]: '!border-theme-color-burger',
  [SourceCardBorderColor.BlueCheese]: '!border-theme-color-blueCheese',
  [SourceCardBorderColor.Lettuce]: '!border-theme-color-lettuce',
  [SourceCardBorderColor.Cheese]: '!border-theme-color-cheese',
  [SourceCardBorderColor.Bun]: '!border-theme-color-bun',
  [SourceCardBorderColor.Ketchup]: '!border-theme-color-ketchup',
  [SourceCardBorderColor.Bacon]: '!border-theme-color-bacon',
  [SourceCardBorderColor.Cabbage]: '!border-theme-color-cabbage',
  [SourceCardBorderColor.Onion]: '!border-theme-color-onion',
  [SourceCardBorderColor.Water]: '!border-theme-color-water',
  [SourceCardBorderColor.Salt]: '!border-theme-color-salt',
  [SourceCardBorderColor.Pepper]: '!border-theme-color-pepper',
};

export const SourceCard = ({
  source,
  title,
  subtitle,
  icon,
  action,
  description,
  borderColor = SourceCardBorderColor.Avocado,
  banner,
}: SourceCardProps): ReactElement => {
  const router = useRouter();

  return (
    <Card
      className={classNames(
        'overflow-hidden !p-0',
        borderColorToClassName[source?.borderColor || borderColor],
      )}
    >
      <div className="h-24 rounded-t-2xl bg-theme-bg-onion">
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
      <div className="-mt-12 flex flex-1 flex-col rounded-t-2xl bg-theme-bg-secondary p-4">
        <div className="mb-3 flex items-end justify-between">
          <a href={source?.permalink}>
            {source?.image ? (
              <img
                className="z-10 -mt-14 h-24 w-24 rounded-full"
                src={source?.image}
                alt={`${title} source`}
              />
            ) : (
              <div className="z-10 -mt-14 flex h-24 w-24 items-center justify-center rounded-full bg-theme-bg-pepper40">
                {icon}
              </div>
            )}
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
                <div className="text-theme-label-secondary">{subtitle}</div>
              )}
            </a>
            {description ||
              (source?.description && (
                <div className="multi-truncate mt-1 line-clamp-5 text-theme-label-secondary">
                  {source?.description || description}
                </div>
              ))}
          </div>

          {!!action &&
          action?.type === 'action' &&
          source?.type === SourceType.Squad ? (
            <SquadJoinButton
              className="!btn-secondary w-full"
              squad={source}
              origin={Origin.SquadDirectory}
              onSuccess={() => router.push(source?.permalink)}
              joinText={action?.text}
              data-testid="squad-action"
            />
          ) : (
            <Button
              variant={ButtonVariant.Secondary}
              className="w-full"
              onClick={action?.type === 'action' ? action?.onClick : undefined}
              tag={action?.type === 'link' ? 'a' : undefined}
              href={action?.type === 'link' && action.href}
              target={action?.target ? action.target : '_self'}
              rel="noopener"
              data-testid="source-action"
            >
              {action?.text}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
