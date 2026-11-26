import type { ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import CloseButton from '../../../../components/CloseButton';
import { VIcon } from '../../../../components/icons';
import { IconSize } from '../../../../components/Icon';
import Link from '../../../../components/utilities/Link';
import usePersistentContext from '../../../../hooks/usePersistentContext';
import {
  mcpServerDocs,
  plusPublicApiDocs,
  webappUrl,
} from '../../../../lib/constants';
import { LogEvent, Origin } from '../../../../lib/log';
import {
  startupsLavender,
  startupsLavenderInk,
} from '../../../../styles/custom';
import { AgentMarks } from '../AgentPromptButton';
import { useSquadPageContext } from '../../SquadPageContext';
import { getSquadId, isCompanySquad } from '../../lib/features';
import { SquadViewer } from '../../lib/viewer';
import { AgentClient } from '../../lib/setup';
import { getSquadManageUrl, SquadManageSection } from '../../lib/routes';
import { useLogStartups } from '../../hooks/useLogStartups';
import { getSquadAgentWidgetDismissKey } from '../../hooks/useSquadStaffLayer';
import { AgentConnect } from '../setup/StartupsSetup';

const TARGET_ID = 'agent widget';

export const squadAgentBenefits = [
  'Post to the page as you',
  'Boost posts from the page wallet',
  'Pick and read your weekly intel',
];

/**
 * For the team of a company squad on any plan (daily.dev for Startups or
 * Enterprise): the page runs from their agent through the daily.dev MCP
 * server, or from their own code through the public API. Dismissable per squad.
 */
export const SquadAgentWidget = (): ReactElement | null => {
  const { squad, viewer, isViewerKnown } = useSquadPageContext();
  const sourceId = getSquadId(squad);
  const hasSeat = !!squad.currentMember?.seat;
  // Only seat holders get the plan's API access; admins can give themselves one
  const isCandidate =
    isViewerKnown &&
    isCompanySquad(squad) &&
    (viewer === SquadViewer.Admin ||
      (viewer === SquadViewer.Moderator && hasSeat));
  const [isDismissed, setDismissed, isDismissedFetched] = usePersistentContext(
    getSquadAgentWidgetDismissKey(sourceId),
    false,
  );
  const [isConnecting, setConnecting] = useState(false);
  const [client, setClient] = useState(AgentClient.ClaudeCode);
  const logStartups = useLogStartups();
  const log = (event: LogEvent, targetId: string, extra?: object) =>
    logStartups(event, targetId, {
      origin: Origin.SquadPage,
      source_id: sourceId,
      ...extra,
    });
  const isShown = isCandidate && isDismissedFetched && !isDismissed;
  const loggedRef = useRef(false);

  useEffect(() => {
    if (!isShown || loggedRef.current) {
      return;
    }

    loggedRef.current = true;
    logStartups(LogEvent.Impression, TARGET_ID, {
      origin: Origin.SquadPage,
      source_id: sourceId,
      seat: hasSeat,
    });
  }, [isShown, logStartups, sourceId, hasSeat]);

  if (!isShown) {
    return null;
  }

  return (
    <section
      aria-label="Run your page from your agent"
      className="relative flex w-full flex-col gap-3 rounded-16 border border-border-subtlest-tertiary p-4"
    >
      <CloseButton
        size={ButtonSize.XSmall}
        className="absolute right-2 top-2"
        aria-label="Dismiss"
        onClick={() => {
          setDismissed(true);
          log(LogEvent.DismissStartupsUpsell, TARGET_ID);
        }}
      />
      <AgentMarks className="size-7 rounded-8" glyphClassName="size-4" />
      <div className="flex flex-col gap-0.5">
        <h2 className="text-balance font-bold typo-callout">
          {`Run ${squad.name} from your agent`}
        </h2>
        <p className="text-pretty text-text-tertiary typo-footnote">
          Your plan includes the daily.dev MCP server and API.
        </p>
      </div>
      <ul className="flex flex-col gap-2">
        {squadAgentBenefits.map((benefit) => (
          <li key={benefit} className="flex items-center gap-2.5 typo-footnote">
            <span
              className="flex size-4 shrink-0 items-center justify-center rounded-full"
              style={{
                background: startupsLavender,
                color: startupsLavenderInk,
              }}
            >
              <VIcon size={IconSize.Size16} secondary />
            </span>
            <span className="min-w-0 flex-1 truncate">{benefit}</span>
          </li>
        ))}
      </ul>
      {!hasSeat && (
        <p className="text-pretty text-text-tertiary typo-footnote">
          Only paid seats can use it.{' '}
          <Link
            href={getSquadManageUrl(squad.handle, SquadManageSection.Plan)}
            passHref
          >
            <a className="font-bold text-text-primary underline">
              Give yourself a seat
            </a>
          </Link>
        </p>
      )}
      {isConnecting ? (
        <div className="flex flex-col gap-3">
          <AgentConnect client={client} onClientChange={setClient} log={log} />
        </div>
      ) : (
        <Button
          variant={ButtonVariant.Primary}
          size={ButtonSize.Small}
          className="w-full"
          onClick={() => {
            setConnecting(true);
            log(LogEvent.Click, 'connect agent');
          }}
        >
          Connect your agent
        </Button>
      )}
      <p className="flex flex-wrap gap-x-3 gap-y-1 text-text-tertiary typo-footnote">
        <a
          href={`${webappUrl}settings/api`}
          className="hover:text-text-primary"
          onClick={() => log(LogEvent.Click, 'api token')}
        >
          Get an API token
        </a>
        <a
          href={mcpServerDocs}
          target="_blank"
          rel="noopener"
          className="hover:text-text-primary"
        >
          MCP docs
        </a>
        <a
          href={plusPublicApiDocs}
          target="_blank"
          rel="noopener"
          className="hover:text-text-primary"
        >
          API docs
        </a>
      </p>
    </section>
  );
};
