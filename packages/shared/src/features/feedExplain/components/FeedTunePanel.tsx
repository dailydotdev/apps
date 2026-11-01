import type { ReactElement, ReactNode } from 'react';
import React, { Fragment, useMemo } from 'react';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import CloseButton from '../../../components/CloseButton';
import { Switch } from '../../../components/fields/Switch';
import TabList from '../../../components/tabs/TabList';
import { UndoIcon } from '../../../components/icons/Undo';
import { DevPlusIcon } from '../../../components/icons/DevPlus';
import { IconSize } from '../../../components/Icon';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { Divider } from '../../../components/utilities/Divider';
import {
  ProfileImageSize,
  ProfilePicture,
} from '../../../components/ProfilePicture';
import { SourceAvatar } from '../../../components/profile/source/SourceAvatar';
import { useAuthContext } from '../../../contexts/AuthContext';
import { usePlusSubscription } from '../../../hooks/usePlusSubscription';
import { FeedSettingsMenu } from '../../../components/feeds/FeedSettings/types';
import type { ForYouSettingsPageId } from '../../../components/feeds/FeedSettings/forYouSettingsPages';
import { getForYouSettingsUrl } from '../../../components/feeds/FeedSettings/forYouSettingsPages';
import { isSpecialUser } from '../../../lib/user';
import type { Post } from '../../../graphql/posts';
import { isSourceUserSource } from '../../../graphql/sources';
import { ExplainOrigin, FeedTuneTab } from '../types';
import { feedProfileQueryOptions } from '../queries';
import {
  followModeMeta,
  getAuthorFactor,
  getAuthorLabel,
  getControlMeta,
  getSourceFactor,
  isAuthorFollowed,
  isSourceFollowed,
} from '../describe';
import { rankingGroups, rankingSettings } from '../ranking';
import type { UseFeedTune } from '../useFeedTune';
import { useFeedTune } from '../useFeedTune';
import { useFeedTuneContext } from '../FeedTuneContext';
import { TopicLevelPicker } from './TopicLevelPicker';
import { SourceLevelPicker } from './SourceLevelPicker';
import { AuthorLevelPicker } from './AuthorLevelPicker';
import { RankingSlider } from './ForYouRankingSettings';
import { PlusBanner, PlusUpsellFeature } from './PlusUpsell';

const tuneTabs = Object.values(FeedTuneTab).map((label) => ({
  label,
  hint: label === FeedTuneTab.Ranking && (
    <DevPlusIcon className="text-action-plus-default" size={IconSize.Size16} />
  ),
}));

// Enough rows to steer by without a wall of sliders; the rest are in Feed
// settings.
const maxTopics = 25;

const originMeta: Record<ExplainOrigin, string> = {
  [ExplainOrigin.Declared]: 'You follow it',
  [ExplainOrigin.Inferred]: 'From your reading',
  [ExplainOrigin.Set]: 'You set its boost',
};

const ControlRow = ({
  title,
  meta,
  metaClassName,
  avatar,
  children,
}: {
  title: string;
  meta?: string;
  metaClassName?: string;
  avatar?: ReactNode;
  children: ReactNode;
}): ReactElement => (
  <li className="flex min-h-11 items-center gap-3">
    {avatar && <span className="flex">{avatar}</span>}
    <span className="flex min-w-0 flex-1 flex-col">
      <span className="truncate font-bold text-text-primary typo-footnote">
        {title}
      </span>
      {meta && (
        <span
          className={classNames(
            'truncate typo-caption1',
            metaClassName ?? 'text-text-quaternary',
          )}
        >
          {meta}
        </span>
      )}
    </span>
    {children}
  </li>
);

const TopicsTab = ({
  tune,
  version,
}: {
  tune: UseFeedTune;
  version: number;
}): ReactElement => {
  const { user } = useAuthContext();
  const { isPlus } = usePlusSubscription();
  const { data: profile } = useQuery(feedProfileQueryOptions(user, version));
  const interests: {
    tag: string;
    weight: number;
    computedWeight?: number;
    origin?: ExplainOrigin;
  }[] = (profile?.interests ?? [])
    .filter(({ weight }) => weight > 0)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, maxTopics);
  // Topics turned off are no interest, but listed so they can come back.
  (profile?.muted ?? []).forEach((tag) => interests.push({ tag, weight: 0 }));

  return (
    <div className="flex flex-col gap-4">
      <Switch
        inputId="feed-tune-learning"
        name="feed-tune-learning"
        compact={false}
        checked={tune.learning}
        onToggle={() => tune.setLearning(!tune.learning)}
      >
        Learn from my reading
      </Switch>
      <ul className="flex flex-col">
        {interests.map(({ tag, weight, computedWeight, origin }) => {
          const control = tune.getTopicControl(tag);
          const meta = getControlMeta(control, isPlus);
          return (
            <ControlRow
              key={tag}
              title={`#${tag}`}
              meta={meta?.text ?? (origin && originMeta[origin])}
              metaClassName={meta?.className}
            >
              <TopicLevelPicker
                tag={tag}
                weight={weight}
                computedWeight={computedWeight}
                isSet={!!control}
                control={control}
                onChange={(value) => tune.setTopic(tag, value)}
              />
            </ControlRow>
          );
        })}
      </ul>
    </div>
  );
};

interface PageEntity {
  id: string;
  name: string;
  image: string;
  /** What a follow or level gives its posts now, 1 without one. */
  factor: number;
  /** A card on the page was ranked with the reader following it. */
  isFollowed: boolean;
}

interface PageSource extends PageEntity {
  handle: string;
}

/** An author on the page, keyed by user id. */
interface PageAuthor extends PageEntity {
  username?: string;
}

// The sources and authors on the page Tune compares against, for the reader
// to steer.
const getPageSources = (posts: Post[]): PageSource[] => {
  const byId = new Map<string, PageSource>();
  posts.forEach(({ source, explain }) => {
    if (source?.id && source.name && !isSourceUserSource(source)) {
      byId.set(source.id, {
        id: source.id,
        name: source.name,
        image: source.image,
        handle: source.handle,
        factor: getSourceFactor(explain),
        isFollowed:
          !!byId.get(source.id)?.isFollowed || isSourceFollowed(explain),
      });
    }
  });
  return [...byId.values()];
};

const getPageAuthors = (posts: Post[]): PageAuthor[] => {
  const byId = new Map<string, PageAuthor>();
  posts.forEach(({ author, explain }) => {
    if (author?.id && (author.name || author.username)) {
      byId.set(author.id, {
        id: author.id,
        name: getAuthorLabel(author),
        image: author.image,
        username: author.username,
        factor: getAuthorFactor(explain),
        isFollowed:
          !!byId.get(author.id)?.isFollowed || isAuthorFollowed(explain),
      });
    }
  });
  return [...byId.values()];
};

const SourcesTab = ({ tune }: { tune: UseFeedTune }): ReactElement => {
  const { user } = useAuthContext();
  const { isPlus } = usePlusSubscription();
  const { posts } = useFeedTuneContext();
  const sources = useMemo(() => getPageSources(posts), [posts]);
  const authors = useMemo(
    () =>
      getPageAuthors(posts).filter(
        ({ id }) =>
          !isSpecialUser({ userId: id, loggedUserId: user?.id ?? null }),
      ),
    [posts, user?.id],
  );

  return (
    <div className="flex flex-col gap-4">
      <Typography bold type={TypographyType.Callout}>
        Sources
      </Typography>
      <ul className="flex flex-col">
        {sources.map((source) => {
          const { id, name, factor, isFollowed } = source;
          const control = tune.getSourceControl(id);
          const meta = getControlMeta(control, isPlus, followModeMeta);
          return (
            <ControlRow
              key={id}
              title={name}
              meta={meta?.text ?? (isFollowed ? 'You follow it' : undefined)}
              metaClassName={meta?.className}
              avatar={
                <SourceAvatar
                  source={source}
                  size={ProfileImageSize.Small}
                  className="!mr-0"
                />
              }
            >
              <SourceLevelPicker
                name={name}
                factor={factor}
                isFollowed={isFollowed}
                control={control}
                onChange={(value) => tune.setSource(id, value)}
              />
            </ControlRow>
          );
        })}
      </ul>
      {authors.length > 0 && (
        <>
          <Divider className="bg-border-subtlest-tertiary" />
          <Typography bold type={TypographyType.Callout}>
            Creators
          </Typography>
          <ul className="flex flex-col">
            {authors.map((author) => {
              const { id, name, factor, isFollowed } = author;
              const control = tune.getAuthorControl(id);
              const meta = getControlMeta(control, isPlus, followModeMeta);
              return (
                <ControlRow
                  key={id}
                  title={name}
                  meta={
                    meta?.text ?? (isFollowed ? 'You follow them' : undefined)
                  }
                  metaClassName={meta?.className}
                  avatar={
                    <ProfilePicture
                      user={author}
                      size={ProfileImageSize.Small}
                    />
                  }
                >
                  <AuthorLevelPicker
                    name={name}
                    factor={factor}
                    isFollowed={isFollowed}
                    control={control}
                    onChange={(value) => tune.setAuthor(id, value)}
                  />
                </ControlRow>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
};

const RankingTab = ({
  tune,
  version,
}: {
  tune: UseFeedTune;
  version: number;
}): ReactElement => {
  const { user } = useAuthContext();
  const { isPlus } = usePlusSubscription();
  const { data: profile } = useQuery(feedProfileQueryOptions(user, version));
  const settings = new Map(
    (profile?.ranking ?? []).map((item) => [item.key, item]),
  );

  return (
    <div className="flex flex-col gap-4">
      <PlusBanner feature={PlusUpsellFeature.Ranking}>
        Change how For You ranks every post with Plus.
      </PlusBanner>
      {rankingGroups.map(({ group, title }, index) => {
        const rows = rankingSettings.flatMap((meta) => {
          const setting = settings.get(meta.key);
          return meta.group === group && !meta.isAdvanced && setting
            ? [{ meta, setting }]
            : [];
        });
        if (!rows.length) {
          return null;
        }
        return (
          <Fragment key={group}>
            {index > 0 && <Divider className="bg-border-subtlest-tertiary" />}
            <Typography bold type={TypographyType.Callout}>
              {title}
            </Typography>
            {rows.map(({ meta, setting }) => (
              <RankingSlider
                key={meta.key}
                meta={meta}
                setting={setting}
                value={isPlus ? tune.getRankingValue(meta.key) : undefined}
                isLocked={!isPlus}
                onChange={(value) => tune.setRanking(meta.key, value)}
              />
            ))}
          </Fragment>
        );
      })}
    </div>
  );
};

// The Feed settings page that holds each tab's controls.
const tabSettingsPage: Record<FeedTuneTab, ForYouSettingsPageId> = {
  [FeedTuneTab.Topics]: FeedSettingsMenu.Tags,
  [FeedTuneTab.Sources]: FeedSettingsMenu.ContentSources,
  [FeedTuneTab.Ranking]: FeedSettingsMenu.Ranking,
};

const getPreviewLabel = (count: number): string =>
  count ? `Preview ${count} ${count === 1 ? 'change' : 'changes'}` : 'Preview';

interface FeedTunePanelProps {
  /** The For You version the controls are for. */
  version: number;
  /** A phone's bottom sheet, with the feed above it. */
  isSheet?: boolean;
}

/**
 * Tune: the For You controls beside the live feed, which ranks with the
 * draft when the reader previews it. Nothing is saved until Save; closing
 * drops the draft.
 */
export const FeedTunePanel = ({
  version,
  isSheet,
}: FeedTunePanelProps): ReactElement => {
  const tune = useFeedTune();
  const { summary, isLoading, isError, isOutdated, retry } =
    useFeedTuneContext();
  const tab = tune.tab ?? FeedTuneTab.Topics;
  const getStatus = (): string => {
    if (isLoading) {
      return 'Updating your feed.';
    }
    if (isError && !tune.pendingCount) {
      return 'Couldn’t update your feed. Try again.';
    }
    if (isOutdated) {
      return 'Out of date. Your feed shows the last preview.';
    }
    if (summary) {
      return summary;
    }
    return tune.pendingCount
      ? 'Preview to see these changes in your feed.'
      : 'Change anything, then preview it in your feed.';
  };

  return (
    <section
      aria-label="Tune your feed"
      className={classNames(
        'fixed z-header flex flex-col bg-background-default',
        isSheet
          ? 'inset-x-0 bottom-0 h-[55vh] overflow-hidden rounded-t-16 border-t border-border-subtlest-tertiary shadow-2'
          : 'inset-y-0 right-0 w-[28rem] border-l border-border-subtlest-tertiary',
      )}
    >
      <header
        className={classNames(
          'flex flex-col gap-3 border-b border-border-subtlest-tertiary',
          isSheet ? 'px-4 pt-3' : 'px-6 pt-6',
        )}
      >
        <div className="flex items-center gap-3">
          <Typography
            tag={TypographyTag.H2}
            type={TypographyType.Title3}
            className="min-w-0 flex-1"
            bold
          >
            Tune your feed
          </Typography>
          <Button
            tag="a"
            href={getForYouSettingsUrl(tabSettingsPage[tab])}
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
          >
            All settings
          </Button>
          <CloseButton
            size={ButtonSize.Small}
            aria-label="Close Tune"
            onClick={tune.close}
          />
        </div>
        <TabList<FeedTuneTab>
          items={tuneTabs}
          active={tab}
          onClick={(label) => tune.setTab(label)}
        />
      </header>
      <div
        className={classNames(
          'flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto',
          isSheet ? 'p-4' : 'p-6',
        )}
      >
        {tab === FeedTuneTab.Topics && (
          <TopicsTab tune={tune} version={version} />
        )}
        {tab === FeedTuneTab.Sources && <SourcesTab tune={tune} />}
        {tab === FeedTuneTab.Ranking && (
          <RankingTab tune={tune} version={version} />
        )}
      </div>
      <footer
        className={classNames(
          'flex flex-col gap-2 border-t border-border-subtlest-tertiary',
          isSheet ? 'px-4 py-2' : 'px-6 py-3',
        )}
      >
        <Typography
          type={TypographyType.Footnote}
          color={
            isOutdated ? TypographyColor.Secondary : TypographyColor.Tertiary
          }
          aria-live="polite"
        >
          {getStatus()}
        </Typography>
        <div className="flex items-center gap-2">
          {tune.changeCount > 0 && (
            <Button
              type="button"
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.Small}
              icon={<UndoIcon />}
              onClick={tune.undo}
            >
              Undo
            </Button>
          )}
          <span className="ml-auto flex gap-2">
            {isError && !tune.pendingCount && (
              <Button
                type="button"
                variant={ButtonVariant.Secondary}
                size={ButtonSize.Small}
                onClick={retry}
              >
                Try again
              </Button>
            )}
            {(tune.pendingCount > 0 || isLoading) && (
              <Button
                type="button"
                variant={ButtonVariant.Secondary}
                size={ButtonSize.Small}
                loading={isLoading && !tune.pendingCount}
                onClick={tune.preview}
              >
                {getPreviewLabel(tune.pendingCount)}
              </Button>
            )}
            <Button
              type="button"
              variant={ButtonVariant.Primary}
              size={ButtonSize.Small}
              onClick={tune.changeCount ? tune.save : tune.close}
            >
              {tune.changeCount ? 'Save' : 'Done'}
            </Button>
          </span>
        </div>
      </footer>
    </section>
  );
};
