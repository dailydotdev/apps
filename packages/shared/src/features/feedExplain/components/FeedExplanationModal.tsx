import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Modal } from '../../../components/modals/common/Modal';
import type { LazyModalCommonProps } from '../../../components/modals/common/Modal';
import { ModalClose } from '../../../components/modals/common/ModalClose';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { BlockIcon } from '../../../components/icons/Block';
import { EyeCancelIcon } from '../../../components/icons/EyeCancel';
import { HashtagIcon } from '../../../components/icons/Hashtag';
import { MinusIcon } from '../../../components/icons/Minus';
import { PlusIcon } from '../../../components/icons/Plus';
import { SettingsIcon } from '../../../components/icons/Settings';
import { MagicIcon } from '../../../components/icons/Magic';
import { VIcon } from '../../../components/icons/V';
import { IconSize } from '../../../components/Icon';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { SourceAvatar } from '../../../components/profile/source/SourceAvatar';
import {
  ProfileImageSize,
  ProfilePicture,
} from '../../../components/ProfilePicture';
import { ElementPlaceholder } from '../../../components/ElementPlaceholder';
import type { Post } from '../../../graphql/posts';
import { isSourceUserSource, SourceType } from '../../../graphql/sources';
import {
  ContentPreferenceStatus,
  ContentPreferenceType,
} from '../../../graphql/contentPreference';
import { useAuthContext } from '../../../contexts/AuthContext';
import { usePostById } from '../../../hooks/usePostById';
import type { FeedPostExplanationRequest } from '../graphql';
import {
  FeedPostExplanationStatus,
  useFeedPostExplanation,
} from '../useFeedPostExplanation';
import useFeedSettings from '../../../hooks/useFeedSettings';
import useTagAndSource from '../../../hooks/useTagAndSource';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { useContentPreference } from '../../../hooks/contentPreference/useContentPreference';
import { isFollowingContent } from '../../../hooks/contentPreference/types';
import { Origin } from '../../../lib/log';
import { isSpecialUser } from '../../../lib/user';
import { FeedSettingsMenu } from '../../../components/feeds/FeedSettings/types';
import { getForYouSettingsUrl } from '../../../components/feeds/FeedSettings/forYouSettingsPages';
import { feature } from '../../../lib/featureManagement';
import type { FeedItemExplain } from '../types';
import { useDropIdleForYouFeeds } from '../useDropIdleForYouFeeds';
import { useFeedControls } from '../useFeedControls';
import { useOpenFeedTune } from '../useOpenFeedTune';
import { usePlusSubscription } from '../../../hooks/usePlusSubscription';
import { FeedAuthorMode, FeedSourceMode, isRankedExplain } from '../types';
import { feedProfileQueryKey, feedProfileQueryOptions } from '../queries';
import type { ExplanationMatch, SignalMeta } from '../describe';
import {
  ExplanationMatchKind,
  followModeMeta,
  getAuthorFactor,
  getAuthorLabel,
  getExplanationMatches,
  getMatchKey,
  getPostTags,
  getControlMeta,
  getReason,
  getScoreBreakdown,
  getSourceFactor,
  getTopicLevel,
  getTopicWeight,
  isSourceFollowed,
  topicModeMeta,
} from '../describe';
import { ScoreBreakdown } from './ScoreBreakdown';
import { TopicLevelPicker } from './TopicLevelPicker';
import { SourceLevelPicker } from './SourceLevelPicker';
import { AuthorLevelPicker } from './AuthorLevelPicker';

export interface FeedExplanationModalProps extends LazyModalCommonProps {
  post: Post;
  /** Left out when the feed didn't load it: the modal asks with `request`. */
  explain?: FeedItemExplain | null;
  request?: FeedPostExplanationRequest;
  onHide: () => unknown;
}

const unavailableReason: Partial<Record<FeedPostExplanationStatus, string>> = {
  [FeedPostExplanationStatus.Expired]:
    "Your feed has changed since this post was shown, so we can't explain it anymore. Refresh your feed to see why its posts are there.",
  [FeedPostExplanationStatus.Failed]:
    "We couldn't load why this post is here. Try again in a moment.",
};

const Strong = ({ children }: { children: ReactNode }): ReactElement => (
  <strong className="font-bold text-text-primary">{children}</strong>
);

const SectionTitle = ({ children }: { children: ReactNode }): ReactElement => (
  <h3 className="font-bold text-text-tertiary typo-footnote">{children}</h3>
);

const matchKindLabel: Record<ExplanationMatchKind, string> = {
  [ExplanationMatchKind.Topic]: 'topic',
  [ExplanationMatchKind.Source]: 'source',
  [ExplanationMatchKind.Squad]: 'squad',
  [ExplanationMatchKind.Author]: 'author',
};

const getMatchMeta = (match: ExplanationMatch): string => {
  if (match.kind !== ExplanationMatchKind.Topic) {
    return matchKindLabel[match.kind];
  }
  return match.isMain ? 'main topic' : 'supporting topic';
};

interface EntityRow {
  key: string;
  title: string;
  meta: string;
  /** Colors the meta when it names a level the reader set. */
  metaClassName?: string;
  leading: ReactNode;
  /** A topic's, source's or author's level picker, beside its title. */
  level?: ReactNode;
  isBlocked: boolean;
  isFollowing?: boolean;
  isShowingLess?: boolean;
  onToggleFollow?: () => unknown;
  onToggleShowLess?: () => unknown;
  onToggleBlock: () => unknown;
}

const ringRadius = 15;
const ringCircumference = 2 * Math.PI * ringRadius;

const RelevanceRing = ({
  ratio,
  children,
}: {
  ratio: number;
  children: ReactNode;
}): ReactElement => (
  <span className="relative flex size-8 items-center justify-center">
    <svg
      className="absolute inset-0 -rotate-90"
      viewBox="0 0 32 32"
      aria-hidden
    >
      <circle
        cx="16"
        cy="16"
        r={ringRadius}
        fill="none"
        strokeWidth="2"
        stroke="currentColor"
        className="text-border-subtlest-tertiary"
      />
      <circle
        cx="16"
        cy="16"
        r={ringRadius}
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        stroke="currentColor"
        strokeDasharray={ringCircumference}
        strokeDashoffset={ringCircumference * (1 - ratio)}
        className="text-accent-avocado-default"
      />
    </svg>
    {children}
  </span>
);

const EntityRowItem = ({
  row,
  match,
  maxPoints,
}: {
  row: EntityRow;
  match?: ExplanationMatch;
  maxPoints: number;
}): ReactElement => (
  <li className="flex items-center gap-3 py-2">
    <span
      className={classNames(
        'flex size-8 items-center justify-center',
        row.isBlocked && 'opacity-50',
      )}
    >
      {match && !row.isBlocked ? (
        <RelevanceRing ratio={Math.max(0, match.points) / maxPoints}>
          {row.leading}
        </RelevanceRing>
      ) : (
        row.leading
      )}
    </span>
    <span className="flex min-w-0 flex-1 flex-col gap-1">
      <span className="flex max-w-full items-center gap-1.5">
        <span
          className={classNames(
            'min-w-0 shrink truncate typo-callout',
            row.isBlocked
              ? 'text-text-tertiary line-through'
              : 'text-text-primary',
          )}
        >
          {row.title}
        </span>
        {!row.isBlocked && row.level}
      </span>
      <span className="truncate text-text-quaternary typo-caption1">
        <span className={row.metaClassName}>{row.meta}</span>
        {match && <span className="tabular-nums"> · {match.points} pts</span>}
      </span>
    </span>
    <span className="flex items-center gap-1">
      {row.isBlocked && (
        <Button
          type="button"
          variant={ButtonVariant.Float}
          size={ButtonSize.Small}
          onClick={row.onToggleBlock}
        >
          Unblock
        </Button>
      )}
      {!row.isBlocked && !row.isFollowing && (
        <Button
          type="button"
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
          icon={<BlockIcon />}
          className="!text-text-tertiary"
          aria-label={`Block ${row.title}`}
          title={`Block ${row.title}`}
          onClick={row.onToggleBlock}
        />
      )}
      {!row.isBlocked && row.onToggleShowLess && (
        <Button
          type="button"
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
          icon={<MinusIcon />}
          className={
            row.isShowingLess
              ? '!text-accent-bun-default'
              : '!text-text-tertiary'
          }
          aria-pressed={row.isShowingLess}
          aria-label={`Show less from ${row.title}`}
          title={
            row.isShowingLess
              ? `Set ${row.title} back to Auto.`
              : `Show less from ${row.title}. Their posts rank lower, but the best ones still show.`
          }
          onClick={row.onToggleShowLess}
        />
      )}
      {!row.isBlocked && row.onToggleFollow && (
        <Button
          type="button"
          variant={ButtonVariant.Tertiary}
          className={
            row.isFollowing
              ? '!text-accent-cabbage-default'
              : '!text-text-secondary'
          }
          size={ButtonSize.Small}
          icon={row.isFollowing ? <VIcon /> : <PlusIcon />}
          aria-pressed={row.isFollowing}
          aria-label={`${row.isFollowing ? 'Unfollow' : 'Follow'} ${row.title}`}
          title={row.isFollowing ? 'Unfollow' : 'Follow'}
          onClick={row.onToggleFollow}
        />
      )}
    </span>
  </li>
);

const TopicGlyph = (): ReactElement => (
  <span className="flex size-6 items-center justify-center rounded-max bg-surface-float text-text-tertiary">
    <HashtagIcon size={IconSize.Size16} secondary />
  </span>
);

/**
 * "Why am I seeing this?" for a For You card: what matched the reader, then
 * the score breakdown, and the controls for everything the post is about:
 * follow, block, and the levels of its topics, source and author.
 */
function FeedExplanationModal({
  post: feedPost,
  explain: cardExplain,
  request,
  onHide,
  ...props
}: FeedExplanationModalProps): ReactElement {
  const { onRequestClose } = props;
  const { user } = useAuthContext();
  const client = useQueryClient();
  const { post: loadedPost } = usePostById({ id: feedPost.id });
  const post = loadedPost ?? feedPost;
  const { source, author } = post;
  const { explain, status } = useFeedPostExplanation({
    postId: feedPost.id,
    explain: cardExplain,
    request,
  });
  const isLoading = status === FeedPostExplanationStatus.Loading;
  const { feedSettings } = useFeedSettings();
  // A lazy modal renders outside the feed, where `useFeedExplainMode` can't
  // tell For You apart, so the version comes from the flag itself.
  const { value: version } = useConditionalFeature({
    feature: feature.feedVersion,
    shouldEvaluate: !!user,
  });
  const { data: profile } = useQuery(feedProfileQueryOptions(user, version));
  const feedControls = useFeedControls({ origin: Origin.FeedExplain });
  const { isPlus } = usePlusSubscription();
  const openTune = useOpenFeedTune(Origin.FeedExplain);
  const {
    onFollowTags,
    onUnfollowTags,
    onBlockTags,
    onUnblockTags,
    onBlockSource,
    onUnblockSource,
    onFollowSource,
    onUnfollowSource,
  } = useTagAndSource({
    origin: Origin.FeedExplain,
    postId: post.id,
    shouldInvalidateQueries: false,
  });
  const { follow, unfollow, block, unblock } = useContentPreference();
  const dropIdleFeeds = useDropIdleForYouFeeds();
  const isRanked = isRankedExplain(explain);
  const matches = isRanked ? getExplanationMatches(post, explain) : [];
  const breakdown = isRanked ? getScoreBreakdown(explain) : undefined;
  const reason = getReason(post, explain);
  const matchByKey = new Map(matches.map((match) => [match.key, match]));
  const getMeta = (
    key: string,
    fallback: string,
    isBlocked: boolean,
    level?: SignalMeta,
  ): Pick<EntityRow, 'meta' | 'metaClassName'> => {
    if (isBlocked) {
      return { meta: 'Blocked' };
    }
    if (level) {
      return { meta: level.text, metaClassName: level.className };
    }
    const match = matchByKey.get(key);
    return { meta: match ? getMatchMeta(match) : fallback };
  };

  const rows: EntityRow[] = [];
  const authorName =
    author && (author.name || author.username) ? getAuthorLabel(author) : null;
  if (
    author &&
    authorName &&
    !isSpecialUser({ userId: author.id, loggedUserId: user?.id ?? null })
  ) {
    const params = {
      id: author.id,
      entity: ContentPreferenceType.User,
      entityName: authorName,
      opts: { extra: { origin: Origin.FeedExplain, post_id: post.id } },
    };
    const isFollowing = isFollowingContent(author.contentPreference);
    const isBlocked =
      author.contentPreference?.status === ContentPreferenceStatus.Blocked;
    const authorId = author.id;
    const authorControl = feedControls.getAuthorControl(authorId);
    const isShowingLess = authorControl?.mode === FeedAuthorMode.Demote;
    const key = getMatchKey(ExplanationMatchKind.Author, authorId);
    rows.push({
      key,
      title: authorName,
      ...getMeta(
        key,
        'author',
        isBlocked,
        getControlMeta(authorControl, isPlus, followModeMeta),
      ),
      level: (
        <AuthorLevelPicker
          name={authorName}
          factor={getAuthorFactor(explain)}
          isFollowed={isFollowing}
          control={authorControl}
          onChange={(value) => feedControls.setAuthor(authorId, value)}
        />
      ),
      leading: <ProfilePicture user={author} size={ProfileImageSize.Small} />,
      isBlocked,
      isFollowing,
      isShowingLess,
      onToggleShowLess: () =>
        feedControls.setAuthor(authorId, {
          mode: isShowingLess ? null : FeedAuthorMode.Demote,
        }),
      onToggleFollow: () => (isFollowing ? unfollow(params) : follow(params)),
      onToggleBlock: () => (isBlocked ? unblock(params) : block(params)),
    });
  }

  if (source?.id && source.name && !isSourceUserSource(source)) {
    const isSquad = source.type === SourceType.Squad;
    const isFollowing = !!feedSettings?.includeSources?.some(
      ({ id }) => id === source.id,
    );
    const isBlocked = !!feedSettings?.excludeSources?.some(
      ({ id }) => id === source.id,
    );
    const sourceId = source.id;
    const isShowingLess = feedControls.isSourceDemoted(sourceId);
    const sourceControl = feedControls.getSourceControl(sourceId);
    const key = getMatchKey(ExplanationMatchKind.Source, sourceId);
    rows.push({
      key,
      title: source.name,
      ...getMeta(
        key,
        isSquad ? 'squad' : 'source',
        isBlocked,
        getControlMeta(sourceControl, isPlus, followModeMeta),
      ),
      level: (
        <SourceLevelPicker
          name={source.name}
          factor={getSourceFactor(explain)}
          isFollowed={isFollowing || isSourceFollowed(explain)}
          control={sourceControl}
          onChange={(value) => feedControls.setSource(sourceId, value)}
        />
      ),
      leading: (
        <SourceAvatar
          source={source}
          size={ProfileImageSize.Small}
          className="!mr-0"
        />
      ),
      isBlocked,
      isFollowing,
      isShowingLess,
      onToggleShowLess: () =>
        feedControls.setSourceMode(
          sourceId,
          isShowingLess ? null : FeedSourceMode.Demote,
        ),
      onToggleFollow:
        source.type === SourceType.Machine
          ? () =>
              isFollowing
                ? onUnfollowSource({ source })
                : onFollowSource({ source })
          : undefined,
      onToggleBlock: () =>
        isBlocked ? onUnblockSource({ source }) : onBlockSource({ source }),
    });
  }

  const matchedTopics = matches
    .filter(({ kind }) => kind === ExplanationMatchKind.Topic)
    .map(({ label }) => label);
  [...new Set([...matchedTopics, ...getPostTags(post)])].forEach((tag) => {
    const isFollowing = !!feedSettings?.includeTags?.includes(tag);
    const isBlocked = !!feedSettings?.blockedTags?.includes(tag);
    const key = getMatchKey(ExplanationMatchKind.Topic, tag);
    const tags = [tag];
    const weight = getTopicWeight(tag, explain, profile);
    const control = feedControls.getTopicControl(tag);
    const level = getTopicLevel(tag, feedControls.controls, profile);
    rows.push({
      key,
      title: `#${tag}`,
      ...getMeta(
        key,
        'topic',
        isBlocked,
        getControlMeta(control, isPlus) ?? (level && topicModeMeta[level]),
      ),
      leading: <TopicGlyph />,
      level: weight && (
        <TopicLevelPicker
          tag={tag}
          weight={weight.weight}
          computedWeight={weight.computedWeight}
          isSet={weight.isSet || !!control}
          control={control}
          onChange={(value) => feedControls.setTopic(tag, value)}
        />
      ),
      isBlocked,
      isFollowing,
      // A follow changes the weights the profile shows; a block only hides.
      onToggleFollow: async () => {
        await (isFollowing ? onUnfollowTags({ tags }) : onFollowTags({ tags }));
        await client.invalidateQueries({
          queryKey: feedProfileQueryKey(user, version),
        });
      },
      onToggleBlock: () =>
        isBlocked ? onUnblockTags({ tags }) : onBlockTags({ tags }),
    });
  });

  const afterChange = (action: () => unknown) => async () => {
    await action();
    dropIdleFeeds();
  };
  // The rows wait for the explanation, which sorts them into what matched.
  const actionRows = (isLoading ? [] : rows).map((row) => ({
    ...row,
    onToggleFollow: row.onToggleFollow && afterChange(row.onToggleFollow),
    onToggleBlock: afterChange(row.onToggleBlock),
  }));
  const matchedRows = actionRows.filter(({ key }) => matchByKey.has(key));
  const otherRows = actionRows.filter(({ key }) => !matchByKey.has(key));
  const maxPoints = Math.max(1, ...matches.map(({ points }) => points));

  return (
    <Modal
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.Small}
      isDrawerOnMobile
      drawerProps={{
        displayCloseButton: false,
        className: { wrapper: '!px-0 !pt-0' },
      }}
      {...props}
    >
      <Modal.Body className="!p-0">
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex min-h-0 flex-1 flex-col overflow-auto">
            <header className="flex flex-col gap-2 border-b border-border-subtlest-tertiary p-4 tablet:p-6">
              <div className="flex items-center gap-1">
                <Typography
                  tag={TypographyTag.H2}
                  type={TypographyType.Title3}
                  className="min-w-0 flex-1"
                  bold
                >
                  Why am I seeing this?
                </Typography>
                <Button
                  type="button"
                  variant={ButtonVariant.Tertiary}
                  size={ButtonSize.Small}
                  icon={<MagicIcon />}
                  aria-label="Tune your feed"
                  title="Tune your feed"
                  onClick={() => {
                    openTune();
                    onRequestClose();
                  }}
                />
                <Button
                  tag="a"
                  href={getForYouSettingsUrl(FeedSettingsMenu.Overview)}
                  variant={ButtonVariant.Tertiary}
                  size={ButtonSize.Small}
                  icon={<SettingsIcon />}
                  aria-label="Feed settings"
                  title="Feed settings"
                />
                <ModalClose
                  position="static"
                  size={ButtonSize.Small}
                  onClick={onRequestClose}
                />
              </div>
              {isLoading ? (
                <div className="flex flex-col gap-2 py-1" aria-busy>
                  <ElementPlaceholder className="h-4 w-full rounded-8" />
                  <ElementPlaceholder className="h-4 w-2/3 rounded-8" />
                </div>
              ) : (
                <p className="text-text-secondary typo-body">
                  {unavailableReason[status] ?? (
                    <>
                      {reason.lead}
                      {reason.name && <Strong>{reason.name}</Strong>}
                      {reason.tail}
                    </>
                  )}
                </p>
              )}
            </header>
            <div className="flex flex-col gap-6 p-4 tablet:p-6">
              {matchedRows.length > 0 && (
                <section className="flex flex-col gap-1">
                  <SectionTitle>What matched you</SectionTitle>
                  <ul className="flex flex-col">
                    {matchedRows.map((row) => (
                      <EntityRowItem
                        key={row.key}
                        row={row}
                        match={matchByKey.get(row.key)}
                        maxPoints={maxPoints}
                      />
                    ))}
                  </ul>
                </section>
              )}
              {breakdown && (
                <section className="flex flex-col gap-2">
                  <SectionTitle>Score breakdown</SectionTitle>
                  <ScoreBreakdown
                    className="rounded-12 bg-surface-float p-3"
                    {...breakdown}
                  />
                </section>
              )}
              {otherRows.length > 0 && (
                <section className="flex flex-col gap-1">
                  <SectionTitle>
                    {matchedRows.length ? 'Also in this post' : 'In this post'}
                  </SectionTitle>
                  <ul className="flex flex-col">
                    {otherRows.map((row) => (
                      <EntityRowItem
                        key={row.key}
                        row={row}
                        maxPoints={maxPoints}
                      />
                    ))}
                  </ul>
                </section>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between gap-2 border-t border-border-subtlest-tertiary px-4 py-3 tablet:px-6">
            <Button
              type="button"
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.Small}
              icon={<EyeCancelIcon />}
              onClick={() => {
                onHide();
                onRequestClose();
              }}
            >
              Hide post
            </Button>
            <Button
              type="button"
              className="min-w-24"
              variant={ButtonVariant.Primary}
              size={ButtonSize.Small}
              onClick={onRequestClose}
            >
              Got it
            </Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}

export default FeedExplanationModal;
