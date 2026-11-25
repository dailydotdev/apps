import type { MouseEvent, ReactElement } from 'react';
import React from 'react';
import type { Squad } from '../../../../graphql/sources';
import { LogEvent, Origin } from '../../../../lib/log';
import { getCompanyPageReadinessPrompt } from '../../lib/companyPage';
import { getSquadId } from '../../lib/features';
import { getSquadPlanTitle } from '../../lib/plans';
import { useLogStartups } from '../../hooks/useLogStartups';
import type { ReadinessItem } from '../../lib/readiness';
import { CompanyPageReadiness } from './CompanyPageReadiness';

interface SquadPageReadinessProps {
  squad: Squad;
  /** The page's plan, unset without one */
  plan?: string | null;
  rows: ReadinessItem[];
  done: ReadinessItem[];
  onTrySkill: (id: string) => void;
  onDismiss: () => void;
  /** Opens a row in place instead of following its link */
  onEditRow?: (item: ReadinessItem) => boolean;
  origin?: Origin;
  className?: string;
}

export const getReadinessTitle = (plan?: string | null): string =>
  plan
    ? `Get the most out of ${getSquadPlanTitle(plan)}`
    : 'Level up your look and feel';

/** The readiness checklist on a company page, wired to settings and the agent */
export const SquadPageReadiness = ({
  squad,
  plan,
  rows,
  done,
  onTrySkill,
  onDismiss,
  onEditRow,
  origin = Origin.SquadPage,
  className,
}: SquadPageReadinessProps): ReactElement | null => {
  const logStartups = useLogStartups();
  const log = (event: LogEvent, targetId: string) =>
    logStartups(event, targetId, {
      origin,
      source_id: getSquadId(squad),
    });

  return (
    <CompanyPageReadiness
      className={className}
      title={getReadinessTitle(plan)}
      description={
        plan
          ? 'Everything your plan includes, and how to use it.'
          : 'Developers open your page and your profile from every post you write.'
      }
      rows={rows}
      done={done}
      onClickRow={(item, event: MouseEvent) => {
        log(LogEvent.ClickStartupsSetupStep, item.id);

        if (onEditRow?.(item)) {
          event.preventDefault();
        }
      }}
      onTrySkill={(item) => {
        onTrySkill(item.id);
        log(LogEvent.CopyStartupsSetup, `${item.id} skill`);
      }}
      getPrompt={() =>
        getCompanyPageReadinessPrompt({
          handle: squad.handle,
          plan: plan ? getSquadPlanTitle(plan) : undefined,
          steps: rows
            .filter(({ isDone, agentStep }) => !isDone && agentStep)
            .map(({ agentStep }) => agentStep as string),
        })
      }
      onCopyPrompt={() => log(LogEvent.CopyStartupsSetup, 'readiness prompt')}
      onDismiss={() => {
        onDismiss();
        log(LogEvent.DismissStartupsUpsell, 'readiness');
      }}
    />
  );
};
