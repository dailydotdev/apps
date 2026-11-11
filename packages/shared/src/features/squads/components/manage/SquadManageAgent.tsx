import type { ReactElement } from 'react';
import React, { useState } from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import { VIcon } from '../../../../components/icons';
import { IconSize } from '../../../../components/Icon';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../../components/typography/Typography';
import { HorizontalSeparator } from '../../../../components/utilities/common';
import Link from '../../../../components/utilities/Link';
import {
  mcpServerDocs,
  plusPublicApiDocs,
  webappUrl,
} from '../../../../lib/constants';
import { LogEvent, Origin } from '../../../../lib/log';
import { useSquadPageContext } from '../../SquadPageContext';
import { getSquadId } from '../../lib/features';
import { AgentClient } from '../../lib/setup';
import { getSquadManageUrl, SquadManageSection } from '../../lib/routes';
import { useLogStartups } from '../../hooks/useLogStartups';
import { AgentConnect } from '../setup/StartupsSetup';
import { squadAgentBenefits } from '../widgets/SquadAgentWidget';
import { SquadManageSectionPanel } from './SquadManageLayout';

const SectionTitle = ({
  title,
  description,
}: {
  title: string;
  description: string;
}): ReactElement => (
  <div className="flex flex-col gap-1">
    <Typography tag={TypographyTag.H2} type={TypographyType.Callout} bold>
      {title}
    </Typography>
    <Typography type={TypographyType.Footnote} color={TypographyColor.Tertiary}>
      {description}
    </Typography>
  </div>
);

/**
 * The page's agent card as a settings section, for the team of a verified
 * company squad: always here, unlike the card, which can be dismissed.
 */
export const SquadManageAgent = (): ReactElement => {
  const { squad } = useSquadPageContext();
  const sourceId = getSquadId(squad);
  const hasSeat = !!squad.currentMember?.seat;
  const [client, setClient] = useState(AgentClient.ClaudeCode);
  const logStartups = useLogStartups();
  const log = (event: LogEvent, targetId: string, extra?: object) =>
    logStartups(event, targetId, {
      origin: Origin.SquadManageAgent,
      source_id: sourceId,
      ...extra,
    });

  return (
    <SquadManageSectionPanel section={SquadManageSection.Agent}>
      <div className="flex flex-col gap-6 px-4 py-6 tablet:px-6">
        <div className="flex flex-col gap-4">
          <SectionTitle
            title={`Run ${squad.name} from your agent`}
            description="Your plan includes the daily.dev MCP server and API. Use Claude Code, Cursor, Codex or your own scripts."
          />
          <ul className="flex flex-col gap-2">
            {squadAgentBenefits.map((benefit) => (
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
            <p className="text-pretty rounded-12 bg-surface-float p-3 text-text-tertiary typo-footnote">
              Only paid seats can use it.{' '}
              <Link
                href={getSquadManageUrl(squad.handle, SquadManageSection.Plan)}
                passHref
              >
                <a className="font-bold text-text-link">Give yourself a seat</a>
              </Link>
            </p>
          )}
        </div>
        <HorizontalSeparator />
        <div className="flex flex-col gap-3">
          <SectionTitle
            title="Connect your agent"
            description="Add the daily.dev MCP server to the agent you use."
          />
          <AgentConnect client={client} onClientChange={setClient} log={log} />
        </div>
        <HorizontalSeparator />
        <div className="flex flex-col gap-3">
          <SectionTitle
            title="Use the API"
            description="Call the public API from your own code with a personal token."
          />
          <div className="flex flex-wrap items-center gap-3">
            <Button
              tag="a"
              href={`${webappUrl}settings/api`}
              variant={ButtonVariant.Secondary}
              size={ButtonSize.Small}
              onClick={() => log(LogEvent.Click, 'api token')}
            >
              Get an API token
            </Button>
            <a
              href={mcpServerDocs}
              target="_blank"
              rel="noopener"
              className="text-text-tertiary typo-footnote hover:text-text-primary"
            >
              MCP docs
            </a>
            <a
              href={plusPublicApiDocs}
              target="_blank"
              rel="noopener"
              className="text-text-tertiary typo-footnote hover:text-text-primary"
            >
              API docs
            </a>
          </div>
        </div>
      </div>
    </SquadManageSectionPanel>
  );
};
