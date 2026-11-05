import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import {
  Button,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import {
  CopyIcon,
  MagicIcon,
  OpenLinkIcon,
  VIcon,
} from '../../../../components/icons';
import { IconSize } from '../../../../components/Icon';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../../components/typography/Typography';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { useCopyLink } from '../../../../hooks/useCopy';
import type { Squad } from '../../../../graphql/sources';
import { squadProductsQueryOptions } from '../../../../graphql/squadProducts';
import { squadBrandingQueryOptions } from '../../../../graphql/squadBranding';
import { squadSubscriptionQueryOptions } from '../../../../graphql/squadSubscription';
import { squadIntelSettingsQueryOptions } from '../../../../graphql/squadIntel';
import type { Origin } from '../../../../lib/log';
import { LogEvent } from '../../../../lib/log';
import { getSquadManageUrl, SquadManageSection } from '../../lib/routes';
import {
  SQUAD_PLAN_INTEL_TOPICS,
  SQUAD_PLAN_CASHBACK_PERCENTAGE,
  SQUAD_PLAN_SEATS,
  SquadPlan,
} from '../../lib/plans';
import {
  AgentClient,
  agentClients,
  agentClientSetup,
  getStartupsSetupPrompt,
} from '../../lib/setup';
import { getSquadId } from '../../lib/features';
import { useLogStartups } from '../../hooks/useLogStartups';

export enum StartupsSetupPath {
  Agent = 'agent',
  Manual = 'manual',
}

const pathLabel: Record<StartupsSetupPath, string> = {
  [StartupsSetupPath.Agent]: 'Use your agent',
  [StartupsSetupPath.Manual]: 'Do it yourself',
};

interface SetupItem {
  id: string;
  title: string;
  description: string;
  isDone?: boolean;
  /** Shown in place of the button, for features still on the way. */
  badge?: string;
  href?: string;
  onClick?: () => void;
  cta?: string;
}

export const CopyBlock = ({
  text,
  label,
  onCopy,
  className,
}: {
  text: string;
  label: string;
  onCopy: () => void;
  className?: string;
}): ReactElement => {
  const [isCopying, copy] = useCopyLink(() => text);

  return (
    <div className="relative">
      <pre
        className={classNames(
          'overflow-auto whitespace-pre-wrap break-words rounded-12 bg-surface-float p-3 pr-12 font-mono text-text-secondary typo-footnote',
          className,
        )}
      >
        {text}
      </pre>
      <Button
        className="absolute right-2 top-2"
        variant={ButtonVariant.Tertiary}
        size={ButtonSize.Small}
        icon={isCopying ? <VIcon /> : <CopyIcon />}
        aria-label={label}
        onClick={() => {
          copy();
          onCopy();
        }}
      />
    </div>
  );
};

export const StepNumber = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => (
  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-float font-bold typo-footnote">
    {children}
  </span>
);

/** The daily.dev MCP server's setup for the agent the founder uses. */
export const AgentConnect = ({
  client,
  onClientChange,
  log,
}: {
  client: AgentClient;
  onClientChange: (client: AgentClient) => void;
  log: (event: LogEvent, targetId: string, extra?: object) => void;
}): ReactElement => {
  const setup = agentClientSetup[client];

  return (
    <>
      <div
        role="tablist"
        aria-label="Your agent"
        className="flex flex-wrap gap-1"
      >
        {agentClients.map((option) => (
          <Button
            key={option}
            role="tab"
            aria-selected={option === client}
            variant={
              option === client ? ButtonVariant.Float : ButtonVariant.Tertiary
            }
            size={ButtonSize.Small}
            onClick={() => onClientChange(option)}
          >
            {agentClientSetup[option].label}
          </Button>
        ))}
      </div>
      {setup.installUrl && (
        <Button
          tag="a"
          href={setup.installUrl}
          target="_blank"
          rel="noopener"
          variant={ButtonVariant.Secondary}
          size={ButtonSize.Small}
          className="self-start"
          icon={<OpenLinkIcon />}
          iconPosition={ButtonIconPosition.Right}
          onClick={() => log(LogEvent.CopyStartupsSetup, 'install', { client })}
        >
          {`Add to ${setup.label}`}
        </Button>
      )}
      <CopyBlock
        text={setup.snippet}
        label={`Copy the ${setup.label} setup`}
        onCopy={() => log(LogEvent.CopyStartupsSetup, 'mcp', { client })}
      />
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
      >
        {setup.note}
      </Typography>
    </>
  );
};

const AgentSetup = ({
  squad,
  plan,
  log,
}: {
  squad: Pick<Squad, 'name' | 'handle'>;
  plan: SquadPlan;
  log: (event: LogEvent, targetId: string, extra?: object) => void;
}): ReactElement => {
  const [client, setClient] = useState(AgentClient.ClaudeCode);
  const prompt = getStartupsSetupPrompt({
    name: squad.name,
    handle: squad.handle,
    plan,
  });

  return (
    <ol className="flex flex-col gap-6">
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
            Paste this prompt
          </Typography>
        </span>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          Your agent reads your project, drafts the page and asks you before it
          saves anything.
        </Typography>
        <CopyBlock
          text={prompt}
          label="Copy the prompt"
          className="max-h-64"
          onCopy={() => log(LogEvent.CopyStartupsSetup, 'prompt', { client })}
        />
      </li>
    </ol>
  );
};

const ManualSetup = ({
  items,
  log,
}: {
  items: SetupItem[];
  log: (event: LogEvent, targetId: string, extra?: object) => void;
}): ReactElement => (
  <ul className="flex flex-col gap-2">
    {items.map((item) => (
      <li
        key={item.id}
        className="flex items-center gap-3 rounded-12 border border-border-subtlest-tertiary p-3"
      >
        <span
          className={classNames(
            'flex size-6 shrink-0 items-center justify-center rounded-full',
            item.isDone
              ? 'bg-accent-avocado-flat text-accent-avocado-default'
              : 'border border-border-subtlest-secondary',
          )}
        >
          {item.isDone && <VIcon size={IconSize.Size16} />}
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <Typography type={TypographyType.Callout} bold>
            {item.title}
          </Typography>
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            {item.description}
          </Typography>
        </span>
        {item.badge && (
          <span className="shrink-0 rounded-8 bg-surface-float px-2 py-0.5 font-bold text-text-tertiary typo-caption1">
            {item.badge}
          </span>
        )}
        {item.cta && (
          <Button
            {...(item.href ? { tag: 'a' as const, href: item.href } : {})}
            variant={item.isDone ? ButtonVariant.Tertiary : ButtonVariant.Float}
            size={ButtonSize.Small}
            className="shrink-0"
            onClick={() => {
              log(LogEvent.ClickStartupsSetupStep, item.id);
              item.onClick?.();
            }}
          >
            {item.isDone ? 'Edit' : item.cta}
          </Button>
        )}
      </li>
    ))}
  </ul>
);

interface StartupsSetupProps {
  squad: Squad;
  plan: SquadPlan;
  origin: Origin;
  /** Pins the path, for stories */
  initialPath?: StartupsSetupPath;
}

/**
 * What a daily.dev for Startups plan unlocked, with two ways to set it up:
 * the agent path (the MCP server and a prompt) or the app's own settings.
 */
export const StartupsSetup = ({
  squad,
  plan,
  origin,
  initialPath = StartupsSetupPath.Agent,
}: StartupsSetupProps): ReactElement => {
  const { user } = useAuthContext();
  const sourceId = getSquadId(squad);
  const [path, setPath] = useState(initialPath);
  const logStartups = useLogStartups();
  const log = (event: LogEvent, targetId: string, extra?: object) =>
    logStartups(event, targetId, {
      origin,
      plan,
      source_id: sourceId,
      ...extra,
    });
  const isTeam = plan === SquadPlan.Team;
  const { data: products } = useQuery(
    squadProductsQueryOptions({ squad, user }),
  );
  const { data: branding } = useQuery(
    squadBrandingQueryOptions({ squad, user }),
  );
  const { data: subscription } = useQuery({
    ...squadSubscriptionQueryOptions({ user, sourceId }),
    enabled: !!user && isTeam,
  });
  // Only paid seats can read it; anyone else just sees the step as open
  const { data: intelSettings } = useQuery(
    squadIntelSettingsQueryOptions({
      user,
      sourceId,
      enabled: !!squad.currentMember?.seat,
    }),
  );
  const manageUrl = (section: SquadManageSection) =>
    getSquadManageUrl(squad.handle, section);
  const selectPath = (option: StartupsSetupPath) => {
    setPath(option);
    log(LogEvent.SelectStartupsSetupPath, option);
  };

  const candidates: Array<SetupItem | false> = [
    {
      id: 'details',
      title: 'Logo and description',
      description: 'Say what you build and for which developers.',
      isDone: !!squad.description,
      href: manageUrl(SquadManageSection.Details),
      cta: 'Edit page',
    },
    {
      id: 'links',
      title: 'Website and links',
      description: 'Your site, docs, GitHub and changelog on the page.',
      isDone: !!squad.website || !!squad.links?.length,
      href: manageUrl(SquadManageSection.Links),
      cta: 'Add links',
    },
    {
      id: 'product',
      title: 'Your product',
      description: 'A card with its tagline, pricing and link.',
      isDone: !!products?.length,
      href: manageUrl(SquadManageSection.Products),
      cta: 'Add product',
    },
    isTeam && {
      id: 'cta',
      title: 'A CTA on your page header',
      description: 'Send developers to sign up, your docs or a demo.',
      isDone: !!branding?.button?.enabled,
      href: manageUrl(SquadManageSection.Branding),
      cta: 'Add CTA',
    },
    isTeam && {
      id: 'seats',
      title: 'Give your team seats',
      description: `${SQUAD_PLAN_SEATS[plan]} seats, each can post and boost through the API.`,
      isDone: (subscription?.seatsUsed ?? 0) > 1,
      href: manageUrl(SquadManageSection.Plan),
      cta: 'Give seats',
    },
    {
      id: 'agent',
      title: 'Connect your agent',
      description: 'Post and boost from Claude Code, Cursor or Codex.',
      onClick: () => selectPath(StartupsSetupPath.Agent),
      cta: 'Show me',
    },
    {
      id: 'intel',
      title: `Weekly intel on up to ${SQUAD_PLAN_INTEL_TOPICS[plan]} topics`,
      description: 'What developers read and discuss in your space.',
      isDone: !!intelSettings?.selection,
      href: manageUrl(SquadManageSection.Intel),
      cta: 'Pick topics',
    },
    {
      id: 'cashback',
      title: `${SQUAD_PLAN_CASHBACK_PERCENTAGE[plan]}% cashback`,
      description:
        'Lands in your page wallet every month, to boost your posts.',
      isDone: true,
    },
  ];
  const items = candidates.filter((item): item is SetupItem => !!item);

  return (
    <section className="flex flex-col gap-4">
      <div
        role="tablist"
        aria-label="How to set it up"
        className="grid grid-cols-2 gap-1 rounded-14 bg-surface-float p-1"
      >
        {Object.values(StartupsSetupPath).map((option) => (
          <button
            key={option}
            type="button"
            role="tab"
            aria-selected={option === path}
            onClick={() => selectPath(option)}
            className={classNames(
              'flex items-center justify-center gap-2 whitespace-nowrap rounded-10 px-3 py-2 typo-callout',
              option === path
                ? 'bg-background-default font-bold text-text-primary'
                : 'text-text-tertiary hover:text-text-secondary',
            )}
          >
            {option === StartupsSetupPath.Agent && (
              <MagicIcon size={IconSize.Size16} />
            )}
            {pathLabel[option]}
          </button>
        ))}
      </div>
      {path === StartupsSetupPath.Agent ? (
        <AgentSetup squad={squad} plan={plan} log={log} />
      ) : (
        <ManualSetup items={items} log={log} />
      )}
      <Typography
        tag={TypographyTag.P}
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
      >
        {path === StartupsSetupPath.Agent
          ? 'Prefer clicking? Everything here is in your page settings too.'
          : 'Your agent can do all of this through the daily.dev MCP server.'}
      </Typography>
    </section>
  );
};
