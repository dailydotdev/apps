import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import {
  EarthIcon,
  LinkIcon,
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
import { plusPublicApiDocs, webappUrl } from '../../../../lib/constants';
import { LogEvent, Origin } from '../../../../lib/log';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { squadAutoPostingFeedsQueryOptions } from '../../../../graphql/squadAutoPosting';
import { ElementPlaceholder } from '../../../../components/ElementPlaceholder';
import { useSquadPageContext } from '../../SquadPageContext';
import {
  getSquadId,
  hasSquadFeature,
  isCompanySquad,
} from '../../lib/features';
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

const feedUrlLabel: Record<AutoPostingMethod, string> = {
  [AutoPostingMethod.Api]: '',
  [AutoPostingMethod.Rss]: 'feed',
  [AutoPostingMethod.Youtube]: 'channel',
  [AutoPostingMethod.WebPage]: 'page',
};

const isYoutubeUrl = (url: string): boolean => {
  try {
    return /(^|\.)youtube\.com$|(^|\.)youtu\.be$/.test(new URL(url).hostname);
  } catch {
    return false;
  }
};

const formatFeedUrl = (url: string): string =>
  url.replace(/^https?:\/\//, '').replace(/\/$/, '');

/** Where an Enterprise squad's posts come from: the feeds ops connected. */
const ConnectedSources = (): ReactElement => {
  const { squad } = useSquadPageContext();
  const { user } = useAuthContext();
  const {
    data: feeds,
    isPending,
    isError,
  } = useQuery(squadAutoPostingFeedsQueryOptions({ squad, user }));

  const getContent = (): ReactNode => {
    if (isPending) {
      return (
        <div className="flex flex-col gap-2" aria-busy>
          <ElementPlaceholder className="h-5 w-2/3 rounded-6" />
          <ElementPlaceholder className="h-5 w-1/2 rounded-6" />
        </div>
      );
    }

    if (isError) {
      return (
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          We couldn&apos;t load your sources. Nothing has changed with them.
        </Typography>
      );
    }

    if (!feeds?.length) {
      return (
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          Nothing is connected yet. Send your daily.dev account team a feed,
          channel or page URL below.
        </Typography>
      );
    }

    return (
      <ul className="flex flex-col gap-2">
        {feeds.map(({ url }) => (
          <li key={url} className="flex min-w-0 items-center gap-2">
            {isYoutubeUrl(url) ? (
              <YoutubeIcon size={IconSize.Size16} className="shrink-0" />
            ) : (
              <LinkIcon
                size={IconSize.Size16}
                className="shrink-0 text-text-tertiary"
              />
            )}
            <a
              href={url}
              target="_blank"
              rel="noopener"
              className="min-w-0 truncate text-text-secondary typo-footnote hover:text-text-primary"
            >
              {formatFeedUrl(url)}
            </a>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <section className="flex flex-col gap-3 rounded-16 bg-surface-float p-4">
      <div className="flex flex-col gap-1">
        <Typography tag={TypographyTag.H2} type={TypographyType.Callout} bold>
          Connected sources
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          New entries from these are posted to the Squad automatically.
        </Typography>
      </div>
      {getContent()}
    </section>
  );
};

/**
 * Whether the squad's plan includes an auto-posting method. The API comes with
 * every daily.dev for Startups plan; RSS and YouTube feeds are Enterprise only.
 */
export const isAutoPostingIncluded = (
  squad: Parameters<typeof isCompanySquad>[0],
  method: AutoPostingMethod,
): boolean =>
  method === AutoPostingMethod.Api
    ? isCompanySquad(squad)
    : hasSquadFeature(squad, 'verified');

const OptionCard = ({
  option,
  children,
  isLocked,
}: {
  option: AutoPostingOption;
  children: ReactNode;
  isLocked: boolean;
}): ReactElement => {
  const { squad } = useSquadPageContext();
  const planUrl = getSquadManageUrl(squad.handle, SquadManageSection.Plan);

  return (
    <section className="flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary p-4">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-12 bg-surface-float text-text-primary">
          {option.icon}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center gap-2">
            <Typography
              tag={TypographyTag.H2}
              type={TypographyType.Callout}
              bold
            >
              {option.title}
            </Typography>
            {isLocked && (
              <Link href={planUrl} passHref>
                <a
                  href={planUrl}
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
};

export const SquadManageAutoPosting = (): ReactElement => {
  const { squad } = useSquadPageContext();
  const sourceId = getSquadId(squad);
  const logStartups = useLogStartups();
  const log = (targetId: string) =>
    logStartups(LogEvent.Click, targetId, {
      origin: Origin.SquadManageAutoPosting,
      source_id: sourceId,
    });
  const planUrl = getSquadManageUrl(squad.handle, SquadManageSection.Plan);

  const getActions = (method: AutoPostingMethod): ReactNode => {
    if (!isAutoPostingIncluded(squad, method)) {
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
      const agentUrl = getSquadManageUrl(
        squad.handle,
        SquadManageSection.Agent,
      );

      return (
        <>
          <Button
            tag="a"
            href={`${webappUrl}settings/api`}
            variant={ButtonVariant.Secondary}
            size={ButtonSize.Small}
            onClick={() => log('api token')}
          >
            Get an API token
          </Button>
          <Link href={agentUrl} passHref>
            <a
              href={agentUrl}
              className="text-text-tertiary typo-footnote hover:text-text-primary"
            >
              Connect your agent
            </a>
          </Link>
          <a
            href={plusPublicApiDocs}
            target="_blank"
            rel="noopener"
            className="text-text-tertiary typo-footnote hover:text-text-primary"
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
        {hasSquadFeature(squad, 'verified') && <ConnectedSources />}
        {options.map((option) => (
          <OptionCard
            key={option.method}
            option={option}
            isLocked={!isAutoPostingIncluded(squad, option.method)}
          >
            {getActions(option.method)}
          </OptionCard>
        ))}
      </div>
    </SquadManageSectionPanel>
  );
};
