import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { squadSubscriptionQueryOptions } from '../../../../graphql/squadSubscription';
import { LogEvent, Origin } from '../../../../lib/log';
import {
  startupsLavender,
  startupsLavenderBorder,
  startupsLavenderTint,
} from '../../../../styles/custom';
import { useSquadPageContext } from '../../SquadPageContext';
import { getSquadId, hasSquadFeature } from '../../lib/features';
import { SquadViewer } from '../../lib/viewer';
import { isCompanyPage } from '../../lib/companyPage';
import { getSquadPlanTitle } from '../../lib/plans';
import {
  getSquadManageUrl,
  getStartupsCheckoutUrl,
  SquadManageSection,
} from '../../lib/routes';
import { useLogStartups } from '../../hooks/useLogStartups';

/**
 * Next to a company page's name, for its admins only: the plan the page is
 * on. On the free plan it opens the upgrade, on a plan it opens the plan.
 */
export const SquadPlanBadge = (): ReactElement | null => {
  const { squad, viewer, isViewerKnown } = useSquadPageContext();
  const { user } = useAuthContext();
  const sourceId = getSquadId(squad);
  const isShown =
    isViewerKnown && viewer === SquadViewer.Admin && isCompanyPage(squad);
  const { data: subscription, isPending } = useQuery({
    ...squadSubscriptionQueryOptions({ user, sourceId }),
    enabled: !!user && isShown,
  });
  const logStartups = useLogStartups();
  const plan = subscription?.plan;

  // A verified page without a plan of its own is on a contract, not on Free
  if (!isShown || isPending || (!plan && hasSquadFeature(squad, 'verified'))) {
    return null;
  }

  const className = 'flex h-6 items-center rounded-8 border typo-caption1';

  if (plan) {
    return (
      <a
        href={getSquadManageUrl(squad.handle, SquadManageSection.Plan)}
        className={classNames(className, 'px-2 font-bold')}
        style={{
          color: startupsLavender,
          borderColor: startupsLavenderBorder,
          background: startupsLavenderTint,
        }}
      >
        {`${getSquadPlanTitle(plan)} plan`}
      </a>
    );
  }

  return (
    <a
      href={getStartupsCheckoutUrl({ sourceId })}
      title="Upgrade to the Startup plan"
      className={classNames(
        className,
        'gap-1.5 border-border-subtlest-tertiary px-2 font-normal hover:bg-surface-hover',
      )}
      onClick={() =>
        logStartups(LogEvent.UpgradeSubscription, 'plan badge', {
          origin: Origin.SquadPage,
          source_id: sourceId,
        })
      }
    >
      <span className="text-text-tertiary">Free plan</span>
      <span className="h-3 border-l border-border-subtlest-secondary" />
      <span className="font-bold" style={{ color: startupsLavender }}>
        Upgrade
      </span>
    </a>
  );
};
