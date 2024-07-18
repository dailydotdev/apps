import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { badge, SquadStatus, StatusDescription } from './common';
import { Anchor } from '../../text';
import { squadsPublicGuide } from '../../../lib/constants';
import { PublicStatusPanel } from './PublicStatusPanel';
import { PUBLIC_SQUAD_REQUEST_REQUIREMENT } from '../../../lib/config';
import PublicSquadSubmissionActions from '../PublicSquadSubmissionActions';

export interface SettingsPublicSectionProps {
  totalPosts: number;
  status: string;
  squadId: string;
}

export function SettingsPublicSection({
  squadId,
  status,
  totalPosts,
}: SettingsPublicSectionProps): ReactElement {
  const isInProgress = status === SquadStatus.InProgress;
  const isPending = status === SquadStatus.Pending;

  return (
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
        Everyone can see the content, and the posts may appear on the main feed.
        <Anchor
          href={squadsPublicGuide}
          rel="noopener noreferrer"
          target="_blank"
          className="mt-1 block"
        >
          Read more about Public Squads
        </Anchor>
      </StatusDescription>
      {/* it seems to be a bit unusual to show 50/3, hence we max the count at 3 so the progress will always be 3/3 */}
      {isInProgress && (
        <PublicStatusPanel
          count={Math.min(totalPosts, PUBLIC_SQUAD_REQUEST_REQUIREMENT)}
        >
          <PublicSquadSubmissionActions
            isDetailsVisible={false}
            squad={{
              id: squadId,
              flags: {
                totalPosts,
              },
            }}
          />
        </PublicStatusPanel>
      )}
    </div>
  );
}
