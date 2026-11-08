import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { CopyIcon, SettingsIcon } from '../../../components/icons';
import Link from '../../../components/utilities/Link';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { RenderMarkdown } from '../../../components/RenderMarkdown';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useCopyText } from '../../../hooks/useCopy';
import type { ApiErrorResult } from '../../../graphql/common';
import { DEFAULT_ERROR } from '../../../graphql/common';
import { squadIntelQueryOptions } from '../../../graphql/squadIntel';
import { LogEvent, Origin } from '../../../lib/log';
import { mcpServerDocs, settingsUrl } from '../../../lib/constants';
import { useSquadPageContext } from '../SquadPageContext';
import { getSquadId } from '../lib/features';
import { getIntelWeekLabel } from '../lib/intel';
import {
  getSquadManageUrl,
  getSquadUrl,
  SquadManageSection,
} from '../lib/routes';
import { useLogStartups } from '../hooks/useLogStartups';
import { SquadPageLayout } from './SquadPageLayout';
import { SquadSubPageHeader } from './SquadSubPageHeader';
import { AgentConnect, CopyBlock, StepNumber } from './setup/StartupsSetup';
import { AgentClient, getIntelApiUrl, getIntelPrompt } from '../lib/setup';

// The intel is wide tables: they scroll sideways on their own instead of
// squeezing their cells, and the headings drop a size for the page's column.
const intelMarkdownClassName = classNames(
  '[&_h1]:!typo-title2 [&_h2]:!mt-8 [&_h2]:!typo-title3',
  '[&_table]:my-4 [&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto [&_table]:typo-subhead',
  '[&_td]:whitespace-nowrap [&_th]:whitespace-nowrap',
  '[&_td]:px-3 [&_td]:py-2 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:align-bottom',
  '[&_tr]:border-b [&_tr]:border-border-subtlest-tertiary',
  '[&_td:first-child]:pl-0 [&_th:first-child]:pl-0',
);

const EmptyState = ({
  title,
  description,
}: {
  title: string;
  description: string;
}): ReactElement => (
  <div className="flex flex-col gap-1 p-6">
    <Typography type={TypographyType.Callout} bold>
      {title}
    </Typography>
    <Typography type={TypographyType.Footnote} color={TypographyColor.Tertiary}>
      {description}
    </Typography>
  </div>
);

/** How the founder's agent reads the same intel, over MCP or the API. */
const IntelForAgents = ({ handle }: { handle: string }): ReactElement => {
  const { squad } = useSquadPageContext();
  const logStartups = useLogStartups();
  const [client, setClient] = useState(AgentClient.ClaudeCode);
  const log = (event: LogEvent, targetId: string, extra?: object) =>
    logStartups(event, targetId, {
      origin: Origin.SquadIntel,
      source_id: getSquadId(squad),
      ...extra,
    });

  return (
    <section
      id="intel-for-agents"
      className="flex scroll-mt-20 flex-col gap-4 rounded-16 border border-border-subtlest-tertiary p-4 tablet:p-5"
    >
      <div className="flex flex-col gap-1">
        <Typography type={TypographyType.Body} bold>
          Use it with your agent
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          The intel is also in the daily.dev MCP server and API, so Claude Code,
          Cursor or Codex can turn it into post ideas or review a draft against
          it.{' '}
          <a
            href={mcpServerDocs}
            target="_blank"
            rel="noopener"
            className="text-text-link"
          >
            MCP server docs
          </a>
        </Typography>
      </div>
      <ol className="flex flex-col gap-5">
        <li className="flex flex-col gap-3">
          <span className="flex items-center gap-2">
            <StepNumber>1</StepNumber>
            <Typography type={TypographyType.Callout} bold>
              Connect daily.dev to your agent
            </Typography>
          </span>
          <AgentConnect client={client} onClientChange={setClient} log={log} />
        </li>
        <li className="flex flex-col gap-3">
          <span className="flex items-center gap-2">
            <StepNumber>2</StepNumber>
            <Typography type={TypographyType.Callout} bold>
              Ask it to use the intel
            </Typography>
          </span>
          <CopyBlock
            text={getIntelPrompt(handle)}
            label="Copy the prompt"
            onCopy={() => log(LogEvent.CopyStartupsSetup, 'intel prompt')}
          />
        </li>
      </ol>
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
      >
        Calling the API yourself? Send{' '}
        <code className="font-mono">GET {getIntelApiUrl(handle)}</code> with an
        API token from{' '}
        <a href={`${settingsUrl}/api`} className="text-text-link">
          Settings › API
        </a>{' '}
        as a Bearer header. It returns the same Markdown plus the numbers behind
        it.
      </Typography>
    </section>
  );
};

/** The squad's latest weekly intel, for its paid seats. */
export const SquadIntelPage = (): ReactElement => {
  const { squad, isViewerReady } = useSquadPageContext();
  const { user } = useAuthContext();
  const sourceId = getSquadId(squad);
  const logStartups = useLogStartups();
  const [copying, copy] = useCopyText();
  const isSeat = !!squad.currentMember?.seat;
  const {
    data: intel,
    error,
    isPending,
  } = useQuery(squadIntelQueryOptions({ user, sourceId, enabled: isSeat }));
  const errorMessage = (error as unknown as ApiErrorResult | null)?.response
    ?.errors?.[0]?.message;
  const intelSettingsUrl = getSquadManageUrl(
    squad.handle,
    SquadManageSection.Intel,
  );

  const renderContent = (): ReactElement | null => {
    if (!isViewerReady) {
      return null;
    }

    if (!isSeat) {
      return (
        <EmptyState
          title="The weekly intel is for paid seats"
          description={`Ask an admin of ${squad.name} for a seat in Manage › Plan.`}
        />
      );
    }

    if (error && !intel) {
      return (
        <EmptyState
          title="Couldn't load the intel"
          description={errorMessage ?? DEFAULT_ERROR}
        />
      );
    }

    if (isPending) {
      return null;
    }

    if (!intel) {
      return (
        <EmptyState
          title="No intel yet"
          description="Pick your topics in the intel settings. Your first intel is ready a few minutes after you save them."
        />
      );
    }

    return (
      <div className="flex flex-col gap-4 px-4 py-6 tablet:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
            className="min-w-0 flex-1"
          >
            {intel.broadened ? (
              'Your target readers read too few posts in your topics this week, so this intel covers every reader.'
            ) : (
              <>
                Your agent can read this intel too, through the daily.dev MCP
                server and API.{' '}
                <a href="#intel-for-agents" className="text-text-link">
                  Set it up
                </a>
              </>
            )}
          </Typography>
          <Button
            type="button"
            variant={ButtonVariant.Float}
            size={ButtonSize.Small}
            icon={<CopyIcon />}
            disabled={copying}
            onClick={() => {
              copy({
                textToCopy: intel.markdown,
                message: 'Copied the intel as Markdown',
              });
              logStartups(LogEvent.CopySquadIntel, sourceId, {
                week: getIntelWeekLabel(intel),
              });
            }}
          >
            Copy Markdown
          </Button>
        </div>
        <RenderMarkdown
          content={intel.markdown}
          className={intelMarkdownClassName}
        />
        <IntelForAgents handle={squad.handle} />
      </div>
    );
  };

  return (
    <SquadPageLayout
      header={
        <SquadSubPageHeader
          title="Weekly intel"
          backUrl={getSquadUrl(squad.handle)}
          backLabel={`Back to ${squad.name}`}
          action={
            isSeat && (
              <Link href={intelSettingsUrl} passHref>
                <Button
                  tag="a"
                  variant={ButtonVariant.Subtle}
                  size={ButtonSize.Small}
                  icon={<SettingsIcon />}
                >
                  Settings
                </Button>
              </Link>
            )
          }
        />
      }
    >
      {renderContent()}
    </SquadPageLayout>
  );
};
