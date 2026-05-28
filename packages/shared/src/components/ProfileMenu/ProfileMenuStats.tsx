import type { ReactElement } from 'react';
import React from 'react';
import { ReputationUserBadge } from '../ReputationUserBadge';
import { CoreIcon } from '../icons';
import { IconSize } from '../Icon';
import { useAuthContext } from '../../contexts/AuthContext';
import { useHasAccessToCores } from '../../hooks/useCoresFeature';
import Link from '../utilities/Link';
import { walletUrl } from '../../lib/constants';
import { largeNumberFormat } from '../../lib';

export const ProfileMenuStats = (): ReactElement | null => {
  const { user } = useAuthContext();
  const hasCoresAccess = useHasAccessToCores();

  if (!user) {
    return null;
  }

  if (!hasCoresAccess && !user.reputation) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <ReputationUserBadge
        className="h-8 rounded-8 px-2 hover:bg-surface-hover"
        user={{ reputation: user.reputation }}
        iconProps={{ size: IconSize.XSmall }}
      />
      {hasCoresAccess && (
        <Link href={walletUrl} passHref>
          <a className="focus-outline flex h-8 items-center gap-1 rounded-8 px-2 font-bold text-text-primary typo-footnote hover:bg-surface-hover">
            <CoreIcon size={IconSize.XSmall} aria-hidden />
            {largeNumberFormat(user.balance?.amount ?? 0)}
          </a>
        </Link>
      )}
    </div>
  );
};
