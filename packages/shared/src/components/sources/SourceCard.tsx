import React, { ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import SquadMemberShortList from '../squads/SquadMemberShortList';
import { Card } from '../cards/Card';
import { Button } from '../buttons/Button';
import { Connection } from '../../graphql/common';
import { SourceMember } from '../../graphql/sources';

interface SourceCardProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  image?: string;
  description?: string;
  action?: {
    text: string;
    onClick: () => void;
  };
  members?: Connection<SourceMember>;
  membersCount?: number;
  clampDescription?: boolean;
}

export const SourceCard = ({
  title,
  subtitle,
  icon,
  image,
  description,
  action,
  members,
  membersCount,
  clampDescription = true,
  ...props
}: SourceCardProps): ReactElement => {
  const items =
    membersCount > 0 &&
    members?.edges?.reduce((acc, current) => {
      acc.push(current.node);
      return acc;
    }, []);

  return (
    <Card className="overflow-hidden p-0">
      <div className="px-4 h-24 rounded-t-2xl bg-theme-bg-onion" />
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
                name: title,
                description,
                members,
                membersCount,
                ...props,
              }}
              members={items}
              memberCount={membersCount}
            />
          )}
        </div>
        <div className="flex flex-col flex-1 justify-between">
          <div>
            <div className="font-bold typo-title3">{title}</div>
            <div className="mb-2 text-theme-label-secondary">{subtitle}</div>
            <div
              className={classNames(
                'mb-2 text-theme-label-secondary',
                clampDescription && 'multi-truncate line-clamp-3',
              )}
            >
              {description}
            </div>
          </div>

          {action && (
            <Button className="w-full btn-secondary" onClick={action?.onClick}>
              {action?.text}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
