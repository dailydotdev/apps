import React, { ReactElement, useContext } from 'react';
import { ProgressBar } from '../fields/ProgressBar';
import { PUBLIC_SQUAD_ADMIN_REPUTATION_REQUIREMENT } from '../../lib/config';
import AuthContext from '../../contexts/AuthContext';
import { ReputationLightningIcon } from '../icons';
import { ProfileImageSize, ProfilePicture } from '../ProfilePicture';

const GOAL = PUBLIC_SQUAD_ADMIN_REPUTATION_REQUIREMENT;

export const SquadAdminReputationProgressBar = (): ReactElement => {
  const { user } = useContext(AuthContext);
  const currentReputation = user?.reputation ?? 0;
  const effectiveReputationCount = Math.min(currentReputation, GOAL);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between typo-footnote">
        <span className="flex gap-1 text-text-secondary">
          <ProfilePicture user={user} size={ProfileImageSize.Size16} />{' '}
          Admin&apos;s reputation
        </span>
        <span className="flex gap-1 font-bold">
          <ReputationLightningIcon
            className="text-accent-onion-default"
            secondary
          />{' '}
          {effectiveReputationCount}/{GOAL}
        </span>
      </div>
      <ProgressBar
        shouldShowBg
        percentage={Math.ceil((effectiveReputationCount / GOAL) * 100)}
        className={{
          bar: 'static left-1 h-2.5 rounded-10 align-top',
          barColor: 'bg-accent-onion-default',
          wrapper: 'rounded-10 bg-background-subtle',
        }}
      />
    </div>
  );
};
