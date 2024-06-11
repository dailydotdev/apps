import React, { ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import SquadMemberShortList from '../squads/SquadMemberShortList';
import { Card } from '../cards/Card';
import { SourceType, Squad } from '../../graphql/sources';
import { Image } from '../image/Image';
import { SquadJoinButton } from '../squads/SquadJoinButton';
import { Origin } from '../../lib/log';
import { cloudinary } from '../../lib/image';
import { Button, ButtonVariant } from '../buttons/Button';

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
            {source?.image ? (
              <img
                className="-mt-14 h-24 w-24 rounded-full"
                src={source?.image}
                alt={`${title} source`}
              />
            ) : (
              <div className="-mt-14 flex h-24 w-24 items-center justify-center rounded-full bg-accent-pepper-subtle">
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

          {!!action &&
          action?.type === 'action' &&
          source?.type === SourceType.Squad ? (
            <SquadJoinButton
              className={{ button: '!btn-secondary w-full' }}
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
