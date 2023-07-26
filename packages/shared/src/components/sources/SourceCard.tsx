import React, { ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import SquadMemberShortList from '../squads/SquadMemberShortList';
import { Card } from '../cards/Card';
import { Button } from '../buttons/Button';
import { Connection } from '../../graphql/common';
import {
  Source,
  SourceMember,
  SourceMemberRole,
  SourceType,
} from '../../graphql/sources';
import { Image } from '../image/Image';
import { SquadJoinButton } from '../squads/SquadJoinButton';
import { Origin } from '../../lib/analytics';
import { cloudinary } from '../../lib/image';

type SourceCardActionType = 'link' | 'action';

interface SourceCardAction {
  type: SourceCardActionType;
  text: string;
  href?: string;
  target?: string;
  onClick?: () => void;
}

interface SourceCardProps extends Partial<Source> {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  description?: string;
  action?: SourceCardAction;
  members?: Connection<SourceMember>;
  membersCount?: number;
  banner?: string;
  borderColor?: string;
  memberInviteRole?: SourceMemberRole;
  memberPostingRole?: SourceMemberRole;
}

export enum BorderColor {
  Avocado = 'avocado',
  Bacon = 'bacon',
  Cabbage = 'cabbage',
  Onion = 'onion',
}

const borderColorToClassName: Record<BorderColor, string> = {
  [BorderColor.Avocado]:
    'border-theme-squads-avocado hover:border-theme-squads-avocado',
  [BorderColor.Bacon]:
    'border-theme-squads-bacon hover:border-theme-squads-bacon',
  [BorderColor.Cabbage]:
    'border-theme-squads-cabbage hover:border-theme-squads-cabbage',
  [BorderColor.Onion]:
    'border-theme-squads-onion hover:border-theme-squads-onion',
};

export const SourceCard = ({
  title,
  subtitle,
  icon,
  image,
  description,
  action,
  members,
  membersCount,
  permalink,
  id,
  banner,
  borderColor = BorderColor.Avocado,
  type,
  handle,
  memberInviteRole,
  memberPostingRole,
}: SourceCardProps): ReactElement => {
  const router = useRouter();

  const squad = {
    name: title,
    description,
    members,
    membersCount,
    permalink,
    id,
    active: true,
    public: true,
    image,
    handle,
    memberInviteRole,
    memberPostingRole,
  };

  return (
    <Card
      className={classNames(
        'overflow-hidden p-0',
        borderColorToClassName[borderColor],
      )}
    >
      <div className="h-24 rounded-t-2xl bg-theme-bg-onion">
        <Image
          className="object-cover w-full h-full"
          src={banner || cloudinary.squads.directory.cardBannerDefault}
          alt="Banner image for source, showing abstract colors."
        />
      </div>
      <div className="flex flex-col flex-1 p-4 -mt-12 rounded-t-2xl bg-theme-bg-secondary">
        <div className="flex justify-between items-end mb-3">
          {!!image && (
            <img
              className="-mt-14 w-24 h-24 rounded-full z-10"
              src={image}
              alt={`${title} source`}
            />
          )}
          {!image && (
            <div className="flex justify-center items-center -mt-14 w-24 h-24 rounded-full bg-theme-bg-pepper40 z-10">
              {icon}
            </div>
          )}
          {membersCount > 0 && (
            <SquadMemberShortList
              squad={{
                ...squad,
                type: SourceType.Squad,
              }}
              members={members?.edges?.reduce((acc, current) => {
                acc.push(current.node);
                return acc;
              }, [])}
            />
          )}
        </div>
        <div className="flex flex-col flex-1 justify-between">
          <div className="flex-auto">
            <div className="font-bold typo-title3">{title}</div>
            {subtitle && (
              <div className="mb-2 text-theme-label-secondary">{subtitle}</div>
            )}
            {description && (
              <div className="mb-2 line-clamp-5 text-theme-label-secondary multi-truncate">
                {description}
              </div>
            )}
          </div>

          {!!action &&
          action?.type === 'action' &&
          type === SourceType.Squad ? (
            <SquadJoinButton
              className="w-full !btn-secondary"
              squad={{
                ...squad,
                type,
              }}
              origin={Origin.SquadDirectory}
              onSuccess={() => router.push(permalink)}
              joinText={action?.text}
              data-testid="squad-action"
            />
          ) : (
            <Button
              className="w-full btn-secondary"
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

          {/* {!!action && action?.type === 'link' && (
            <Button
              className="w-full btn-secondary"
              onClick={action?.onClick}
              tag="a"
              href={link.href}
              target={link?.target ? link.target : '_self'}
              data-testid="source-link"
              rel='noopener'
            >
              {link?.text}
            </Button>
          )} */}
        </div>
      </div>
    </Card>
  );
};
