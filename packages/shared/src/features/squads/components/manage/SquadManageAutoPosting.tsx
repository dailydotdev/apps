import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import {
  EarthIcon,
  LockIcon,
  SourceIcon,
  TerminalIcon,
  YoutubeIcon,
} from '../../../../components/icons';
import { IconSize } from '../../../../components/Icon';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../../components/typography/Typography';
import Link from '../../../../components/utilities/Link';
import type { Squad } from '../../../../graphql/sources';
import { plusPublicApiDocs, webappUrl } from '../../../../lib/constants';
import { LogEvent, Origin } from '../../../../lib/log';
import { useSquadPageContext } from '../../SquadPageContext';
import { useSquadManageGroups } from '../../hooks/useSquadManageGroups';
import { getSquadId, hasSquadFeature } from '../../lib/features';
import { getSquadManageUrl, SquadManageSection } from '../../lib/routes';
import { useLogStartups } from '../../hooks/useLogStartups';
import { SquadManageSectionPanel } from './SquadManageLayout';

export enum AutoPostingMethod {
  Api = 'api',
  Rss = 'rss',
  Youtube = 'youtube',
  WebPage = 'web-page',
}

interface AutoPostingOption {
  method: AutoPostingMethod;
  title: string;
  description: string;
  icon: ReactElement;
}

const options: AutoPostingOption[] = [
  {
    method: AutoPostingMethod.Api,
    title: 'API',
    description:
      'Publish from your own code, CI or agent. Posts go out as you, the moment you send them.',
    icon: <TerminalIcon size={IconSize.Small} />,
  },
  {
    method: AutoPostingMethod.Rss,
    title: 'RSS',
    description:
      'Connect your blog or changelog feed. Every new entry is posted to the Squad on its own.',
    icon: <SourceIcon size={IconSize.Small} />,
  },
  {
    method: AutoPostingMethod.Youtube,
    title: 'YouTube',
    description:
      'Connect your YouTube channel. Every new video is posted to the Squad on its own.',
    icon: <YoutubeIcon size={IconSize.Small} />,
  },
  {
    method: AutoPostingMethod.WebPage,
    title: 'Web page',
    description:
      'No feed? We follow a page on your site, like your blog index, and post every new article.',
    icon: <EarthIcon size={IconSize.Small} />,
  },
];

// What the account team needs for each feed our team connects
const feedUrlLabel: Partial<Record<AutoPostingMethod, string>> = {
  [AutoPostingMethod.Rss]: 'feed',
  [AutoPostingMethod.Youtube]: 'channel',
  [AutoPostingMethod.WebPage]: 'page',
};

/**
 * Whether the squad's plan includes an auto-posting method, mirroring the API:
 * posting through the API needs `apiPosting`, on every daily.dev for Startups
 * plan and Enterprise; RSS, YouTube and web page feeds are Enterprise only.
 */
export const isAutoPostingIncluded = (
  squad: Pick<Squad, 'features'>,
  method: AutoPostingMethod,
): boolean =>
  method === AutoPostingMethod.Api
    ? hasSquadFeature(squad, 'apiPosting')
    : hasSquadFeature(squad, 'verified');

const linkClassName =
  'text-text-tertiary typo-footnote hover:text-text-primary';

const OptionCard = ({
  option,
  isLocked,
  planUrl,
  onUpgrade,
  children,
}: {
  option: AutoPostingOption;
  isLocked: boolean;
  planUrl: string;
  onUpgrade: () => void;
  children: ReactNode;
}): ReactElement => (
  <section className="flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary p-4">
    <div className="flex items-start gap-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-12 bg-surface-float text-text-primary">
        {option.icon}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          <Typography tag={TypographyTag.H2} type={TypographyType.Callout} bold>
            {option.title}
          </Typography>
          {isLocked && (
            <Link href={planUrl} passHref>
              <a
                href={planUrl}
                onClick={onUpgrade}
                className="ml-auto inline-flex shrink-0 items-center gap-0.5 self-center rounded-4 bg-overlay-float-cabbage px-1 font-bold text-accent-cabbage-default typo-caption2"
              >
                <LockIcon size={IconSize.Size16} />
                Upgrade
              </a>
            </Link>
          )}
        </div>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          {option.description}
        </Typography>
      </div>
    </div>
    <div className="flex flex-wrap items-center gap-3">{children}</div>
  </section>
);

export const SquadManageAutoPosting = (): ReactElement => {
  const { squad } = useSquadPageContext();
  const groups = useSquadManageGroups();
  const sourceId = getSquadId(squad);
  const hasSeat = !!squad.currentMember?.seat;
  const logStartups = useLogStartups();
  const log = (targetId: string) =>
    logStartups(LogEvent.Click, targetId, {
      origin: Origin.SquadManageAutoPosting,
      source_id: sourceId,
    });
  const planUrl = getSquadManageUrl(squad.handle, SquadManageSection.Plan);
  const agentUrl = getSquadManageUrl(squad.handle, SquadManageSection.Agent);
  // Agent and API is for admins and seated moderators, so only link to it
  // when this viewer can open it
  const canOpenAgent = groups.some(({ items }) =>
    items.some(
      ({ id, lockedPlan }) => id === SquadManageSection.Agent && !lockedPlan,
    ),
  );

  const getActions = (
    method: AutoPostingMethod,
    isLocked: boolean,
  ): ReactNode => {
    if (isLocked) {
      return (
        <Button
          tag="a"
          href={planUrl}
          variant={ButtonVariant.Float}
          size={ButtonSize.Small}
          onClick={() => log(`upgrade ${method}`)}
        >
          See plans
        </Button>
      );
    }

    if (method === AutoPostingMethod.Api) {
      return (
        <>
          {!hasSeat && (
            <p className="w-full text-pretty rounded-12 bg-surface-float p-3 text-text-tertiary typo-footnote">
              Only paid seats can post through the API.
            </p>
          )}
          <Button
            tag="a"
            href={`${webappUrl}settings/api`}
            variant={ButtonVariant.Secondary}
            size={ButtonSize.Small}
            onClick={() => log('api token')}
          >
            Get an API token
          </Button>
          {canOpenAgent && (
            <Link href={agentUrl} passHref>
              <a href={agentUrl} className={linkClassName}>
                Connect your agent
              </a>
            </Link>
          )}
          <a
            href={plusPublicApiDocs}
            target="_blank"
            rel="noopener"
            className={linkClassName}
          >
            API docs
          </a>
        </>
      );
    }

    // Feeds are connected by our team for now
    return (
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Secondary}
      >
        {`Send the ${feedUrlLabel[method]} URL to your daily.dev account team and we'll connect it.`}
      </Typography>
    );
  };

  return (
    <SquadManageSectionPanel section={SquadManageSection.AutoPosting}>
      <div className="flex flex-col gap-4 px-4 py-6 tablet:px-6">
        <div className="flex flex-col gap-1">
          <Typography type={TypographyType.Body} bold>
            Post to {squad.name} automatically
          </Typography>
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            Keep the Squad fresh without posting by hand.
          </Typography>
        </div>
        {options.map((option) => {
          const isLocked = !isAutoPostingIncluded(squad, option.method);

          return (
            <OptionCard
              key={option.method}
              option={option}
              isLocked={isLocked}
              planUrl={planUrl}
              onUpgrade={() => log(`upgrade ${option.method}`)}
            >
              {getActions(option.method, isLocked)}
            </OptionCard>
          );
        })}
      </div>
    </SquadManageSectionPanel>
  );
};
