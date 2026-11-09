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
import { useSquadPageContext } from '../../SquadPageContext';
import { getSquadId, hasSquadFeature } from '../../lib/features';
import { SquadViewer } from '../../lib/viewer';
import { AgentClient } from '../../lib/setup';
import { getSquadManageUrl, SquadManageSection } from '../../lib/routes';
import { useLogStartups } from '../../hooks/useLogStartups';
import { AgentConnect } from '../setup/StartupsSetup';

const TARGET_ID = 'agent widget';

const benefits = [
  'Post to the page as you',
  'Boost posts from the page wallet',
  'Pick and read your weekly intel',
];

/**
 * For the team of a verified company squad (Enterprise): the page runs from
 * their agent through the daily.dev MCP server, or from their own code through
 * the public API. Dismissable per squad.
 */
export const SquadAgentWidget = (): ReactElement | null => {
  const { squad, viewer, isViewerKnown } = useSquadPageContext();
  const sourceId = getSquadId(squad);
  const hasSeat = !!squad.currentMember?.seat;
  // Only seat holders get the plan's API access; admins can give themselves one
  const isCandidate =
    isViewerKnown &&
    hasSquadFeature(squad, 'verified') &&
    (viewer === SquadViewer.Admin ||
      (viewer === SquadViewer.Moderator && hasSeat));
  const [isDismissed, setDismissed, isDismissedFetched] = usePersistentContext(
    `squad_agent_widget_dismissed_${sourceId}`,
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
      className="relative flex w-full flex-col gap-4 rounded-16 border border-border-subtlest-tertiary p-4"
      style={{
        background:
          'linear-gradient(180deg, color-mix(in srgb, var(--theme-accent-cabbage-default) 9%, transparent), transparent 120px)',
      }}
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
      <div className="flex flex-col gap-1 pr-6">
        <h2 className="text-balance font-bold typo-callout">
          {`Run ${squad.name} from your agent`}
        </h2>
        <p className="text-pretty text-text-secondary typo-footnote">
          Your plan includes the daily.dev MCP server and API. Use Claude Code,
          Cursor, Codex or your own scripts.
        </p>
      </div>
      <ul className="flex flex-col gap-2">
        {benefits.map((benefit) => (
          <li
            key={benefit}
            className="flex items-start gap-2 text-text-secondary typo-footnote"
          >
            <VIcon
              size={IconSize.Size16}
              className="shrink-0 text-accent-cabbage-default"
            />
            <span className="min-w-0 flex-1">{benefit}</span>
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
            <a className="font-bold text-text-link">Give yourself a seat</a>
          </Link>
        </p>
      )}
      {isConnecting ? (
        <div className="flex flex-col gap-3">
          <AgentConnect client={client} onClientChange={setClient} log={log} />
        </div>
      ) : (
        <div className="flex gap-2">
          <Button
            variant={ButtonVariant.Primary}
            size={ButtonSize.Small}
            className="min-w-0 flex-1"
            onClick={() => {
              setConnecting(true);
              log(LogEvent.Click, 'connect agent');
            }}
          >
            Connect your agent
          </Button>
          <Button
            tag="a"
            href={`${webappUrl}settings/api`}
            variant={ButtonVariant.Secondary}
            size={ButtonSize.Small}
            className="min-w-0 flex-1"
            onClick={() => log(LogEvent.Click, 'api token')}
          >
            Get an API token
          </Button>
        </div>
      )}
      <p className="flex gap-3 text-text-tertiary typo-footnote">
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
