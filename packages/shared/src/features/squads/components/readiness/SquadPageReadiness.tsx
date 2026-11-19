import type { ReactElement } from 'react';
import React from 'react';
import type { Squad } from '../../../../graphql/sources';
import { useCopyLink } from '../../../../hooks/useCopy';
import { LogEvent, Origin } from '../../../../lib/log';
import { getCompanyPageReadinessPrompt } from '../../lib/companyPage';
import { getSquadId } from '../../lib/features';
import { useLogStartups } from '../../hooks/useLogStartups';
import type { ReadinessItem } from '../../lib/readiness';
import { CompanyPageReadiness } from './CompanyPageReadiness';

interface SquadPageReadinessProps {
  squad: Squad;
  rows: ReadinessItem[];
  done: ReadinessItem[];
}

/** The readiness checklist on a company page, wired to settings and the agent */
export const SquadPageReadiness = ({
  squad,
  rows,
  done,
}: SquadPageReadinessProps): ReactElement | null => {
  const logStartups = useLogStartups();
  const log = (event: LogEvent, targetId: string) =>
    logStartups(event, targetId, {
      origin: Origin.SquadPage,
      source_id: getSquadId(squad),
    });
  const [isCopying, copy] = useCopyLink(() =>
    getCompanyPageReadinessPrompt({
      handle: squad.handle,
      steps: rows
        .filter(({ isDone }) => !isDone)
        .map(({ agentStep }) => agentStep),
    }),
  );

  return (
    <CompanyPageReadiness
      rows={rows}
      done={done}
      onClickRow={(item) => log(LogEvent.ClickStartupsSetupStep, item.id)}
      isPromptCopied={isCopying}
      onCopyPrompt={() => {
        copy();
        log(LogEvent.CopyStartupsSetup, 'readiness prompt');
      }}
    />
  );
};
