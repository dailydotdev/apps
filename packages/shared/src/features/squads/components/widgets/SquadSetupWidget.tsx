import type { ReactElement } from 'react';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { squadSubscriptionQueryOptions } from '../../../../graphql/squadSubscription';
import { useSquadPageContext } from '../../SquadPageContext';
import { getSquadId } from '../../lib/features';
import { isStaffViewer } from '../../lib/viewer';
import { isCompanyPage } from '../../lib/companyPage';
import { FREE_BOOST_SETUP_ROWS } from '../../lib/readiness';
import { useCompanyPageReadiness } from '../readiness/useCompanyPageReadiness';
import { SquadPageReadiness } from '../readiness/SquadPageReadiness';
import { useSquadFreeBoost } from '../freeBoost/useSquadFreeBoost';

/**
 * The readiness checklist in the side column of a company page, for its
 * admins and moderators. The feed column leads with the page's next post.
 */
export const SquadSetupWidget = (): ReactElement | null => {
  const { squad, viewer, isViewerKnown } = useSquadPageContext();
  const { user } = useAuthContext();
  const isShown =
    isViewerKnown && isStaffViewer(viewer) && isCompanyPage(squad);
  const { data: subscription, isPending: isSubscriptionPending } = useQuery({
    ...squadSubscriptionQueryOptions({ user, sourceId: getSquadId(squad) }),
    enabled: !!user && isShown,
  });
  const readiness = useCompanyPageReadiness(
    squad,
    isShown && !isSubscriptionPending,
    subscription?.plan,
  );
  const boost = useSquadFreeBoost(squad);

  if (!isShown || isSubscriptionPending || readiness.isPending) {
    return null;
  }

  if (readiness.isDismissed) {
    return null;
  }

  return (
    <SquadPageReadiness
      variant="widget"
      squad={squad}
      plan={subscription?.plan}
      rows={readiness.rows}
      done={readiness.done}
      boostRowIds={boost?.state === 'setup' ? FREE_BOOST_SETUP_ROWS : []}
      onTrySkill={readiness.onTrySkill}
      onDismiss={readiness.onDismiss}
    />
  );
};
