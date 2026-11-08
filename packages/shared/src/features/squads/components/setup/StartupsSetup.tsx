import type { CSSProperties, ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import { ElementPlaceholder } from '../../../../components/ElementPlaceholder';
import { CopyIcon, OpenLinkIcon, VIcon } from '../../../../components/icons';
import { IconSize } from '../../../../components/Icon';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { useCopyLink } from '../../../../hooks/useCopy';
import type { Squad } from '../../../../graphql/sources';
import { squadProductsQueryOptions } from '../../../../graphql/squadProducts';
import { squadBrandingQueryOptions } from '../../../../graphql/squadBranding';
import { squadSubscriptionQueryOptions } from '../../../../graphql/squadSubscription';
import { squadIntelSettingsQueryOptions } from '../../../../graphql/squadIntel';
import { oauthConsentsQueryOptions } from '../../../../lib/oauthApps';
import { personalAccessTokensQueryOptions } from '../../../../hooks/api/usePersonalAccessTokens';
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
import { agentMarks } from '../checkout/agentMarks';
import type { SquadProduct } from '../../../../graphql/squadProducts';
import type { StartupsSetupRow } from './StartupsSetupEditor';

export enum StartupsSetupPath {
  Agent = 'agent',
  Manual = 'manual',
}

export type { StartupsSetupRow };

const DONE_COLOR = '#D8B4FE';

const pathLabel: Record<StartupsSetupPath, string> = {
  [StartupsSetupPath.Agent]: 'Use your agent',
  [StartupsSetupPath.Manual]: 'Do it yourself',
};

interface SetupItem {
  id: string;
  title: string;
  description: string;
  isDone?: boolean;
  /** Counts towards "2 of 5": the agent and cashback rows don't. */
  isCounted?: boolean;
  /** Shown in place of the button, for features still on the way. */
  badge?: string;
  href?: string;
  onClick?: () => void;
  cta?: string;
}

const SETUP_BOX_HEIGHT = 96;
const PROMPT_BOX_HEIGHT = 136;
const PROMPT_FADE = 'linear-gradient(180deg, #000 55%, transparent)';

/**
 * The code in its box, and what to do with it below the box. A fixed height keeps
 * every client the same size, and long text fades out at the cut.
 */
export const CopyBlock = ({
  text,
  label,
  height,
  isFaded,
  secondary,
  onCopy,
}: {
  text: string;
  label: string;
  height?: number;
  isFaded?: boolean;
  secondary?: ReactNode;
  onCopy: () => void;
}): ReactElement => {
  const [isCopying, copy] = useCopyLink(() => text);

  return (
    <div className="flex flex-col gap-2">
      <div className="rounded-16 border border-border-subtlest-tertiary bg-surface-float">
        <pre
          className={classNames(
            'whitespace-pre-wrap break-words p-4 font-mono text-text-secondary typo-footnote',
            isFaded ? 'overflow-hidden' : 'overflow-y-auto',
          )}
          style={{
            height,
            maskImage: isFaded ? PROMPT_FADE : undefined,
            WebkitMaskImage: isFaded ? PROMPT_FADE : undefined,
          }}
        >
          {text}
        </pre>
      </div>
      <div className="flex gap-2">
        <Button
          className="min-w-0 flex-1"
          variant={ButtonVariant.Primary}
          icon={isCopying ? <VIcon /> : <CopyIcon />}
          onClick={() => {
            copy();
            onCopy();
          }}
        >
          {isCopying ? 'Copied' : label}
        </Button>
        {secondary}
      </div>
    </div>
  );
};

const agentClientMarks: Partial<
  Record<AgentClient, (typeof agentMarks)[keyof typeof agentMarks]>
> = {
  [AgentClient.ClaudeCode]: agentMarks['claude-code'],
  [AgentClient.Cursor]: agentMarks.cursor,
  [AgentClient.Codex]: agentMarks.codex,
};

const AgentClientMark = ({
  client,
}: {
  client: AgentClient;
}): ReactElement | null => {
  const mark = agentClientMarks[client];

  if (!mark) {
    return null;
  }

  return (
    <span
      className="flex size-6 items-center justify-center rounded-6"
      style={{ background: mark.tile, color: '#fff' }}
    >
      <svg
        viewBox={mark.glyph.viewBox}
        className="size-4"
        fill="currentColor"
        aria-hidden
      >
        {mark.glyph.paths.map((d) => (
          <path key={d} d={d} fillRule="evenodd" />
        ))}
      </svg>
    </span>
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
}): ReactElement => (
  <>
    <div
      role="tablist"
      aria-label="Your agent"
      className="flex flex-wrap gap-1.5"
    >
      {agentClients.map((option) => (
        <button
          key={option}
          type="button"
          role="tab"
          aria-selected={option === client}
          onClick={() => onClientChange(option)}
          className={classNames(
            'flex h-10 items-center gap-2 rounded-12 border px-3 font-bold typo-footnote',
            option === client
              ? 'border-accent-cabbage-default bg-surface-float text-text-primary'
              : 'border-border-subtlest-tertiary text-text-tertiary hover:text-text-primary',
          )}
        >
          <AgentClientMark client={option} />
          {agentClientSetup[option].label}
        </button>
      ))}
    </div>
    {/* Every client is laid out at once, so switching moves nothing below. */}
    <div className="grid">
      {agentClients.map((option) => {
        const setup = agentClientSetup[option];

        return (
          <div
            key={option}
            aria-hidden={option !== client}
            style={{
              gridArea: '1 / 1',
              visibility: option === client ? 'visible' : 'hidden',
            }}
          >
            <CopyBlock
              text={setup.snippet}
              label="Copy setup"
              height={SETUP_BOX_HEIGHT}
              onCopy={() =>
                log(LogEvent.CopyStartupsSetup, 'mcp', { client: option })
              }
              secondary={
                setup.installUrl && (
                  <Button
                    tag="a"
                    href={setup.installUrl}
                    target="_blank"
                    rel="noopener"
                    variant={ButtonVariant.Secondary}
                    className="min-w-0 flex-1 whitespace-nowrap"
                    icon={<OpenLinkIcon />}
                    onClick={() =>
                      log(LogEvent.CopyStartupsSetup, 'install', {
                        client: option,
                      })
                    }
                  >
                    {`Add to ${setup.label}`}
                  </Button>
                )
              }
            />
          </div>
        );
      })}
    </div>
    <p
      className="text-pretty text-text-tertiary typo-footnote"
      style={{ minHeight: 36 }}
    >
      {agentClientSetup[client].note}
    </p>
  </>
);

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
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <p className="font-bold typo-callout">
          1. Connect daily.dev to your agent
        </p>
        <AgentConnect client={client} onClientChange={setClient} log={log} />
      </div>
      <div className="flex flex-col gap-3">
        <p className="font-bold typo-callout">2. Paste this prompt</p>
        <p className="text-text-tertiary typo-footnote">
          Your agent reads your project, drafts the page and asks you before it
          saves anything.
        </p>
        <CopyBlock
          text={prompt}
          label="Copy prompt"
          height={PROMPT_BOX_HEIGHT}
          isFaded
          onCopy={() => log(LogEvent.CopyStartupsSetup, 'prompt', { client })}
        />
      </div>
      <p className="text-text-tertiary typo-footnote">
        Prefer clicking? Everything here is in your page settings too.
      </p>
    </div>
  );
};

const SetupSkeleton = ({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}): ReactElement => (
  <ElementPlaceholder
    aria-hidden
    className={classNames('shrink-0 animate-pulse', className)}
    style={style}
  />
);

const ManualSetup = ({
  items,
  log,
  onEditRow,
  isChecking,
}: {
  items: SetupItem[];
  log: (event: LogEvent, targetId: string, extra?: object) => void;
  onEditRow?: (row: StartupsSetupRow) => void;
  /** The words are known, but not yet which rows are done. */
  isChecking?: boolean;
}): ReactElement => {
  const counted = items.filter(({ isCounted }) => isCounted);
  const done = counted.filter(({ isDone }) => isDone).length;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <p className="flex justify-between typo-footnote">
          <span className="font-bold">Your page</span>
          {isChecking ? (
            <SetupSkeleton className="h-4 w-16 rounded-6" />
          ) : (
            <span className="tabular-nums text-text-tertiary">
              {`${done} of ${counted.length} done`}
            </span>
          )}
        </p>
        <div className="h-1 w-full overflow-hidden rounded-50 bg-border-subtlest-tertiary">
          <div
            className="h-full rounded-50"
            style={{
              background: DONE_COLOR,
              width: `${isChecking ? 0 : (done / counted.length) * 100}%`,
              transition: 'width .4s ease',
            }}
          />
        </div>
      </div>
      <ul className="flex flex-col">
        {items.map((item) => {
          const isEditable = !!onEditRow && !!item.isCounted;

          return (
            <li
              key={item.id}
              className="flex items-center gap-3 border-t border-border-subtlest-tertiary py-3 first:border-t-0"
            >
              {isChecking ? (
                <SetupSkeleton className="size-6 rounded-full" />
              ) : (
                <span
                  className="flex size-6 shrink-0 items-center justify-center rounded-full"
                  style={
                    item.isDone
                      ? { background: DONE_COLOR, color: '#111827' }
                      : {
                          boxShadow:
                            'inset 0 0 0 1.5px var(--theme-border-subtlest-secondary)',
                        }
                  }
                >
                  {item.isDone && <VIcon size={IconSize.Size16} secondary />}
                </span>
              )}
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="font-bold typo-callout">{item.title}</span>
                <span className="text-pretty text-text-tertiary typo-footnote">
                  {item.description}
                </span>
              </span>
              {item.badge && (
                <span className="shrink-0 rounded-8 bg-surface-float px-2 py-0.5 font-bold text-text-tertiary typo-caption1">
                  {item.badge}
                </span>
              )}
              {item.cta && isChecking && (
                <SetupSkeleton
                  className="h-8 rounded-10"
                  style={{ width: 104 }}
                />
              )}
              {item.cta && !isChecking && (
                <Button
                  {...(item.href && !isEditable
                    ? { tag: 'a' as const, href: item.href }
                    : {})}
                  variant={
                    item.isDone ? ButtonVariant.Tertiary : ButtonVariant.Float
                  }
                  size={ButtonSize.Small}
                  className="shrink-0"
                  style={{ minWidth: 104 }}
                  onClick={() => {
                    log(LogEvent.ClickStartupsSetupStep, item.id);
                    if (isEditable) {
                      onEditRow?.(item.id as StartupsSetupRow);
                    }
                    item.onClick?.();
                  }}
                >
                  {item.isDone && !item.onClick ? 'Edit' : item.cta}
                </Button>
              )}
            </li>
          );
        })}
      </ul>
      <p className="text-text-tertiary typo-footnote">
        Your agent can do all of this through the daily.dev MCP server.
      </p>
    </div>
  );
};

export const startupsSetupRowTitles: Record<StartupsSetupRow, string> = {
  details: 'Logo, cover and description',
  links: 'Website and links',
  product: 'Your product',
  intel: 'Weekly intel',
  cta: 'A CTA on your page header',
  seats: 'Give your team seats',
};

/** What's been set up so far, from the page's own data. */
export const useStartupsSetupProgress = (
  squad: Squad,
  plan: SquadPlan,
): {
  done: Record<StartupsSetupRow, boolean>;
  /** Only paid seats can pick the intel's topics, so it counts only for them. */
  hasIntel: boolean;
  isComplete: boolean;
  /** Still finding out which rows are done. */
  isChecking: boolean;
  /** The founder signed an agent in to daily.dev, or used an API token */
  isAgentConnected: boolean;
  product?: SquadProduct;
  cta?: string;
} => {
  const { user } = useAuthContext();
  const isTeam = plan === SquadPlan.Team;
  const hasIntel = !!squad.currentMember?.seat;
  const { data: products, isLoading: isLoadingProducts } = useQuery(
    squadProductsQueryOptions({ squad, user }),
  );
  const { data: branding, isLoading: isLoadingBranding } = useQuery(
    squadBrandingQueryOptions({ squad, user }),
  );
  const { data: subscription, isLoading: isLoadingSubscription } = useQuery({
    ...squadSubscriptionQueryOptions({ user, sourceId: getSquadId(squad) }),
    enabled: !!user && isTeam,
  });
  const { data: intelSettings, isLoading: isLoadingIntel } = useQuery(
    squadIntelSettingsQueryOptions({
      user,
      sourceId: getSquadId(squad),
      enabled: hasIntel,
    }),
  );
  const { data: consents } = useQuery({
    ...oauthConsentsQueryOptions(),
    enabled: !!user,
  });
  const { data: tokens } = useQuery({
    ...personalAccessTokensQueryOptions(),
    enabled: !!user,
  });
  const done = {
    // Boosting the page needs a cover and a description
    details: !!squad.description && !!squad.headerImage,
    links: !!squad.website || !!squad.links?.length,
    product: !!products?.length,
    intel: !!intelSettings?.selection,
    cta: !!branding?.button?.enabled,
    seats: (subscription?.seatsUsed ?? 0) > 1,
  };

  return {
    done,
    hasIntel,
    isComplete:
      done.details &&
      done.links &&
      done.product &&
      (!hasIntel || done.intel) &&
      (!isTeam || done.cta),
    isChecking:
      isLoadingProducts ||
      isLoadingBranding ||
      isLoadingSubscription ||
      isLoadingIntel,
    isAgentConnected:
      !!consents?.length || !!tokens?.some((token) => token.lastUsedAt),
    product: products?.[0],
    cta: branding?.button?.enabled ? branding.button.label : undefined,
  };
};

interface StartupsSetupProps {
  squad: Squad;
  plan: SquadPlan;
  origin: Origin;
  /** Pins the path, for stories */
  initialPath?: StartupsSetupPath;
  /** Opens a row in place, in the onboarding, instead of going to settings. */
  onEditRow?: (row: StartupsSetupRow) => void;
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
  onEditRow,
}: StartupsSetupProps): ReactElement => {
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
  const { done, hasIntel, isChecking, isAgentConnected } =
    useStartupsSetupProgress(squad, plan);
  const manageUrl = (section: SquadManageSection) =>
    getSquadManageUrl(squad.handle, section);
  const selectPath = (option: StartupsSetupPath) => {
    setPath(option);
    log(LogEvent.SelectStartupsSetupPath, option);
  };

  const candidates: Array<SetupItem | false> = [
    {
      id: 'details',
      title: 'Logo, cover and description',
      description:
        'Say what you build and for which developers. Boosting the page needs the cover too.',
      isDone: done.details,
      isCounted: true,
      href: manageUrl(SquadManageSection.Details),
      cta: 'Edit page',
    },
    {
      id: 'links',
      title: 'Website and links',
      description: 'Your site, docs, GitHub and changelog on the page.',
      isDone: done.links,
      isCounted: true,
      href: manageUrl(SquadManageSection.Links),
      cta: 'Add links',
    },
    {
      id: 'product',
      title: 'Your product',
      description: 'A card with its tagline, pricing and link.',
      isDone: done.product,
      isCounted: true,
      href: manageUrl(SquadManageSection.Products),
      cta: 'Add product',
    },
    {
      id: 'intel',
      title: `Weekly intel on up to ${SQUAD_PLAN_INTEL_TOPICS[plan]} topics`,
      description: hasIntel
        ? `What developers read in your topics, every Monday${
            isTeam ? ', with a seniority filter' : ''
          }.`
        : 'What developers read in your topics. Only paid seats can set it up.',
      isDone: done.intel,
      isCounted: hasIntel,
      href: manageUrl(SquadManageSection.Intel),
      cta: hasIntel ? 'Pick topics' : undefined,
    },
    isTeam && {
      id: 'cta',
      title: 'A CTA on your page header',
      description: 'Send developers to sign up, your docs or a demo.',
      isDone: done.cta,
      isCounted: true,
      href: manageUrl(SquadManageSection.Branding),
      cta: 'Add CTA',
    },
    isTeam && {
      id: 'seats',
      title: 'Give your team seats',
      description: `${SQUAD_PLAN_SEATS[plan]} seats, each can post and boost through the API.`,
      isDone: done.seats,
      href: manageUrl(SquadManageSection.Plan),
      cta: 'Give seats',
    },
    {
      id: 'agent',
      title: 'Connect your agent',
      description: 'Post and boost from Claude Code, Cursor or Codex.',
      isDone: isAgentConnected,
      onClick: () => selectPath(StartupsSetupPath.Agent),
      cta: 'Show me',
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
    <section className="flex flex-col gap-5">
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
              'whitespace-nowrap rounded-10 px-3 py-2 font-bold typo-callout',
              option === path
                ? 'bg-background-default text-text-primary'
                : 'text-text-tertiary hover:text-text-secondary',
            )}
          >
            {pathLabel[option]}
          </button>
        ))}
      </div>
      {path === StartupsSetupPath.Agent ? (
        <AgentSetup squad={squad} plan={plan} log={log} />
      ) : (
        <ManualSetup
          items={items}
          log={log}
          onEditRow={onEditRow}
          isChecking={isChecking}
        />
      )}
    </section>
  );
};
