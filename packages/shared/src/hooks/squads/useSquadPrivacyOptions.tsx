import React, { ReactNode, useMemo } from 'react';
import classNames from 'classnames';
import { RadioItemProps } from '../../components/fields/RadioItem';
import { BlockIcon, LockIcon, TimerIcon } from '../../components/icons';
import { IconSize } from '../../components/Icon';
import { isNullOrUndefined } from '../../lib/func';
import { StatusDescription } from '../../components/squads/settings/common';
import {
  PublicStatusPanel,
  SquadStatus,
} from '../../components/squads/settings';
import { submitPublicSquads } from '../../lib/constants';

interface UseSquadPrivacyOptionsProps {
  totalPosts: number;
  status: SquadStatus;
}

const badge: Record<SquadStatus, ReactNode> = {
  [SquadStatus.InProgress]: <LockIcon size={IconSize.Small} />,
  [SquadStatus.Pending]: <TimerIcon size={IconSize.Small} />,
  [SquadStatus.Rejected]: <BlockIcon size={IconSize.Small} />,
  [SquadStatus.Approved]: null,
};

const classes = {
  wrapper: 'border border-border-subtlest-tertiary rounded-16 p-4 pt-1 w-full',
  content: 'w-fit',
};

const PUBLIC_SQUAD_REQUIRED_POSTS = 3;

export const useSquadPrivacyOptions = ({
  totalPosts,
  status,
}: UseSquadPrivacyOptionsProps): RadioItemProps[] => {
  const isInProgress = status === SquadStatus.InProgress;
  const isPending = status === SquadStatus.Pending;

  return useMemo(() => {
    if (isNullOrUndefined(totalPosts)) {
      return [];
    }

    return [
      {
        label: 'Private',
        value: 'private',
        className: classes,
        afterElement: (
          <StatusDescription className="ml-9">
            Only people who join the squad can see the content.
          </StatusDescription>
        ),
      },
      {
        label: 'Public',
        value: 'public',
        disabled: status !== SquadStatus.Approved,
        className: classes,
        afterElement: (
          <div
            className={classNames(
              'relative grid w-full grid-cols-1 gap-5',
              isInProgress && 'tablet:grid-cols-2',
            )}
          >
            <span
              className={classNames(
                'absolute -top-1 right-0 flex -translate-y-full flex-row items-center',
                isPending ? 'text-text-tertiary' : 'text-text-disabled',
              )}
            >
              {badge[status]}
              {isPending && (
                <span className="ml-1 font-bold typo-callout">Pending</span>
              )}
            </span>
            <StatusDescription className="ml-9 mt-2">
              Everyone can see the content, and the posts may appear on the main
              feed.
              <a
                href={submitPublicSquads}
                rel="noopener noreferrer"
                target="_blank"
                className="link mt-1 block"
              >
                Read more about Public Squads
              </a>
            </StatusDescription>
            {/* it seems to be a bit unusual to show 50/3, hence we max the count at 3 so the progress will always be 3/3 */}
            {isInProgress && (
              <PublicStatusPanel
                count={Math.min(totalPosts, PUBLIC_SQUAD_REQUIRED_POSTS)}
                required={PUBLIC_SQUAD_REQUIRED_POSTS}
              />
            )}
          </div>
        ),
      },
    ];
  }, [isInProgress, status, totalPosts]);
};
