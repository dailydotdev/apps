import React, { ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import SquadMemberShortList from '../squads/SquadMemberShortList';
import { Card } from '../cards/Card';
import { Button } from '../buttons/Button';
import { Connection } from '../../graphql/common';
import {
  SourceMember,
  SourceMemberRole,
  SourceType,
} from '../../graphql/sources';
import { Image } from '../image/Image';
import { SquadDirectoryCardBannerDefault } from '../../lib/constants';
import { SquadJoinButton } from '../squads/SquadJoinButton';
import { Origin } from '../../lib/analytics';

interface SourceCardProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  image?: string;
  description?: string;
  action?: {
    text: string;
    onClick?: () => void;
  };
  link?: {
    text: string;
    href: string;
    target?: string;
  };
  members?: Connection<SourceMember>;
  membersCount?: number;
  permalink?: string;
  id?: string;
  banner?: string;
  borderColor?: string;
  type?: SourceType;
  handle?: string;
  memberInviteRole?: SourceMemberRole;
  memberPostingRole?: SourceMemberRole;
}

export const SourceCard = ({
  title,
  subtitle,
  icon,
  image,
  description,
  action,
  link,
  members,
  membersCount,
  permalink,
  id,
  banner,
  borderColor,
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
        borderColor
          ? `border-theme-color-${borderColor} hover:border-theme-color-${borderColor}`
          : 'border-theme-color-avocado hover:border-theme-color-avocado',
      )}
    >
      <div className="h-24 rounded-t-2xl bg-theme-bg-onion">
        <Image
          className="object-cover w-full h-full"
          src={banner || SquadDirectoryCardBannerDefault}
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
            <div className="flex justify-center items-center -mt-14 w-24 h-24 bg-pepper-40 rounded-full z-10">
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
            <div className="mb-2 text-theme-label-secondary">{subtitle}</div>
            <div className="mb-2 line-clamp-5 text-theme-label-secondary multi-truncate">
              {description}
            </div>
          </div>

          {!!action && type !== SourceType.Squad && (
            <Button
              className="w-full btn-secondary"
              onClick={action?.onClick}
              data-testid="source-action"
            >
              {action?.text}
            </Button>
          )}

          {!!action && type === SourceType.Squad && (
            <SquadJoinButton
              className="w-full !btn-secondary"
              squad={{
                ...squad,
                type,
              }}
              origin={Origin.SquadDirectory}
              onSuccess={() => router.push(permalink)}
              joinText={action?.text}
            />
          )}

          {!!link && (
            <Button
              className="w-full btn-secondary"
              onClick={action?.onClick}
              tag="a"
              href={link.href}
              target={link?.target ? link.target : '_self'}
              data-testid="source-link"
            >
              {link?.text}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
