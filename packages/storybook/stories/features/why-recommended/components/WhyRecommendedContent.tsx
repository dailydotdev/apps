import type { ReactElement, ReactNode } from 'react';
import React, { useRef, useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { BlockIcon } from '@dailydotdev/shared/src/components/icons/Block';
import { EyeCancelIcon } from '@dailydotdev/shared/src/components/icons/EyeCancel';
import { HashtagIcon } from '@dailydotdev/shared/src/components/icons/Hashtag';
import { PlusIcon } from '@dailydotdev/shared/src/components/icons/Plus';
import { VIcon } from '@dailydotdev/shared/src/components/icons/V';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { SourceAvatar } from '@dailydotdev/shared/src/components/profile/source/SourceAvatar';
import {
  ProfileImageSize,
  ProfilePicture,
} from '@dailydotdev/shared/src/components/ProfilePicture';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import {
  isSourceUserSource,
  SourceType,
} from '@dailydotdev/shared/src/graphql/sources';
import {
  ContentPreferenceStatus,
  ContentPreferenceType,
} from '@dailydotdev/shared/src/graphql/contentPreference';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { usePostById } from '@dailydotdev/shared/src/hooks/usePostById';
import useFeedSettings from '@dailydotdev/shared/src/hooks/useFeedSettings';
import useTagAndSource from '@dailydotdev/shared/src/hooks/useTagAndSource';
import { useContentPreference } from '@dailydotdev/shared/src/hooks/contentPreference/useContentPreference';
import { isFollowingContent } from '@dailydotdev/shared/src/hooks/contentPreference/types';
import { Origin } from '@dailydotdev/shared/src/lib/log';
import { isSpecialUser } from '@dailydotdev/shared/src/lib/user';
import { settingsUrl, webappUrl } from '@dailydotdev/shared/src/lib/constants';
import type {
  RecommendationExplanation,
  RecommendationMatch,
} from './whyRecommended';
import {
  getFeedLabel,
  getMatchKindLabel,
  getMatchMeta,
  getMatchOriginPhrase,
  getRecommendationReason,
  getSignalMatches,
  isTrendingFeed,
  RecommendationMatchKind,
  RecommendationMatchRole,
  RecommendationReason,
  sortMatchesByPoints,
} from './whyRecommended';
import {
  RecommendationScoreMath,
  ScoreBreakdownToggle,
} from './RecommendationScoreMath';

export interface WhyRecommendedContentProps {
  post: Post;
  feedName: string;
  customFeedId?: string;
  explanation?: RecommendationExplanation;
  onShowFewer: () => unknown;
  onClose: () => void;
  className?: string;
}

const Strong = ({ children }: { children: ReactNode }): ReactElement => (
  <strong className="font-bold text-text-primary">{children}</strong>
);

const SectionTitle = ({ children }: { children: ReactNode }): ReactElement => (
  <h3 className="font-bold text-text-tertiary typo-footnote">{children}</h3>
);

const joinTags = (tags: string[]): ReactNode =>
  tags.map((tag, index) => (
    <React.Fragment key={tag}>
      {index > 0 && (index === tags.length - 1 ? ' and ' : ', ')}
      <Strong>#{tag}</Strong>
    </React.Fragment>
  ));

const getMatchName = (match: RecommendationMatch): string =>
  match.kind === RecommendationMatchKind.Topic
    ? `#${match.label}`
    : match.label;

const getMatchArticle = (match: RecommendationMatch): string =>
  match.role ? 'a' : 'the';

const getMatchKey = (kind: RecommendationMatchKind, id: string): string =>
  `${
    kind === RecommendationMatchKind.Squad
      ? RecommendationMatchKind.Source
      : kind
  }:${id}`;

const ExplainedReason = ({
  matches,
}: {
  matches: RecommendationMatch[];
}): ReactElement | null => {
  const sorted = sortMatchesByPoints(matches);
  const primary =
    sorted.find(
      (match) => !match.role || match.role === RecommendationMatchRole.Main,
    ) ?? sorted[0];

  if (!primary) {
    return null;
  }

  const secondary = sorted.find(
    (match) => match !== primary && match.role === RecommendationMatchRole.Main,
  );

  return (
    <>
      <Strong>{getMatchName(primary)}</Strong> is {getMatchArticle(primary)}{' '}
      {getMatchKindLabel(primary)}, and it is {getMatchOriginPhrase(primary)}.
      {secondary && (
        <>
          {' '}
          It also connects to <Strong>{getMatchName(secondary)}</Strong> as{' '}
          {getMatchArticle(secondary)} {getMatchKindLabel(secondary)}.
        </>
      )}
    </>
  );
};

interface EntityRow {
  key: string;
  title: string;
  meta: string;
  leading: ReactNode;
  isBlocked: boolean;
  isFollowing?: boolean;
  blockLabel: string;
  onToggleFollow?: () => unknown;
  onToggleBlock?: () => unknown;
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

const TopicGlyph = (): ReactElement => (
  <span className="flex size-6 items-center justify-center rounded-max bg-surface-float text-text-tertiary">
    <HashtagIcon size={IconSize.Size16} secondary />
  </span>
);

const EntityRowItem = ({
  row,
  match,
  maxPoints,
  isStacked,
}: {
  row: EntityRow;
  match?: RecommendationMatch;
  maxPoints: number;
  isStacked?: boolean;
}): ReactElement => (
  <li
    className={classNames(
      'flex items-center gap-3',
      isStacked ? 'py-2' : 'h-11',
    )}
  >
    <span
      className={classNames(
        'flex size-8 items-center justify-center',
        row.isBlocked && 'opacity-50',
      )}
    >
      {match && !row.isBlocked ? (
        <RelevanceRing
          ratio={match.points === undefined ? 1 : match.points / maxPoints}
        >
          {row.leading}
        </RelevanceRing>
      ) : (
        row.leading
      )}
    </span>
    <span
      className={classNames(
        'flex min-w-0 flex-1',
        isStacked ? 'flex-col gap-1' : 'items-baseline gap-2',
      )}
    >
      <span
        className={classNames(
          'max-w-full truncate typo-callout',
          row.isBlocked
            ? 'text-text-tertiary line-through'
            : 'text-text-primary',
        )}
      >
        {row.title}
      </span>
      {isStacked ? (
        <span className="flex min-w-0 items-center gap-2 text-text-quaternary typo-caption1">
          <span className="min-w-0 shrink truncate">
            {row.meta}
            {match?.points !== undefined && (
              <span className="tabular-nums"> · {match.points} pts</span>
            )}
          </span>
        </span>
      ) : (
        <span className="hidden min-w-0 shrink truncate text-text-quaternary typo-footnote tablet:block">
          {row.meta}
        </span>
      )}
    </span>
    <span className="flex items-center gap-1">
      {row.isBlocked && row.onToggleBlock && (
        <Button
          type="button"
          variant={ButtonVariant.Float}
          size={ButtonSize.Small}
          onClick={row.onToggleBlock}
        >
          Unblock
        </Button>
      )}
      {!row.isBlocked && !row.isFollowing && row.onToggleBlock && (
        <Button
          type="button"
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
          icon={<BlockIcon />}
          className="!text-text-tertiary"
          aria-label={row.blockLabel}
          title={row.blockLabel}
          onClick={row.onToggleBlock}
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

export function WhyRecommendedContent({
  post: initialPost,
  feedName,
  customFeedId,
  explanation,
  onShowFewer,
  onClose,
  className,
}: WhyRecommendedContentProps): ReactElement {
  const { user } = useAuthContext();
  const { post: loadedPost } = usePostById({ id: initialPost.id });
  const post = loadedPost ?? initialPost;
  const { source, author } = post;
  if (!source) {
    throw new Error('WhyRecommendedContent requires post.source');
  }
  const isCustomFeed = !!customFeedId;
  const { feedSettings, isLoading: isFeedSettingsLoading } = useFeedSettings({
    feedId: customFeedId,
  });
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
    origin: Origin.PostContextMenu,
    postId: post.id,
    shouldInvalidateQueries: false,
    feedId: customFeedId,
  });
  const { follow, unfollow, block, unblock } = useContentPreference();
  const [isScoreMathOpen, setIsScoreMathOpen] = useState(false);

  const postTags = (
    post.tags?.length ? post.tags : post.sharedPost?.tags ?? []
  ).filter((tag) => tag.length);
  const followedTags = postTags.filter((tag) =>
    feedSettings?.includeTags?.includes(tag),
  );
  const isSquad = source.type === SourceType.Squad;
  const isSquadMember = isSquad && !!source.currentMember;
  const authorName =
    author?.name || (author?.username ? `@${author.username}` : null);
  const isFollowingAuthor = isFollowingContent(author?.contentPreference);
  const isBlockedAuthor =
    author?.contentPreference?.status === ContentPreferenceStatus.Blocked;
  const isFollowingSource = !!feedSettings?.includeSources?.some(
    ({ id }) => id === source.id,
  );
  const isSourceBlocked = !!feedSettings?.excludeSources?.some(
    ({ id }) => id === source.id,
  );

  // Frozen once feed settings load so following something here doesn't
  // reshuffle the list.
  const buildSnapshot = () => ({
    reason: getRecommendationReason({
      feedName,
      isFollowingAuthor,
      isFollowingSource,
      isSquadMember,
      followedTags,
      isTrending: !!post.trending,
    }),
    followedTags,
    matches: explanation?.matches.length
      ? sortMatchesByPoints(explanation.matches)
      : getSignalMatches({
          author: author && { id: author.id, name: authorName },
          source,
          isFollowingAuthor,
          isFollowingSource,
          isSquadMember,
          followedTags,
        }),
  });
  const snapshotRef = useRef<ReturnType<typeof buildSnapshot>>();
  if (!snapshotRef.current && !isFeedSettingsLoading) {
    snapshotRef.current = buildSnapshot();
  }
  const snapshot = snapshotRef.current ?? buildSnapshot();

  const reasonCopy: Record<RecommendationReason, ReactNode> = {
    [RecommendationReason.FollowedAuthor]: (
      <>
        It was written by <Strong>{authorName}</Strong>, someone you follow.
      </>
    ),
    [RecommendationReason.FollowedSource]: (
      <>
        It&apos;s from <Strong>{source.name}</Strong>, a source you follow.
      </>
    ),
    [RecommendationReason.SquadMember]: (
      <>
        It was shared in <Strong>{source.name}</Strong>, a squad you&apos;re in.
      </>
    ),
    [RecommendationReason.FollowedTags]: (
      <>
        It&apos;s about {joinTags(snapshot.followedTags)},{' '}
        {snapshot.followedTags.length > 1 ? 'topics' : 'a topic'} you follow.
      </>
    ),
    [RecommendationReason.Trending]: (
      <>It&apos;s trending with developers on daily.dev right now.</>
    ),
    [RecommendationReason.Personalized]: (
      <>It&apos;s suggested for you based on your activity on daily.dev.</>
    ),
  };

  const getBlockLabel = (name: string) =>
    isCustomFeed ? `Remove ${name} from this feed` : `Block ${name}`;
  const blockedMeta = isCustomFeed ? 'Removed from this feed' : 'Blocked';
  const matchByKey = new Map(
    snapshot.matches.map((match) => [getMatchKey(match.kind, match.id), match]),
  );
  const getMeta = (key: string, fallback: string, isBlocked: boolean) => {
    if (isBlocked) {
      return blockedMeta;
    }
    const match = matchByKey.get(key);
    return match ? getMatchMeta(match) : fallback;
  };

  const rows: EntityRow[] = [];

  if (
    author &&
    authorName &&
    !isSpecialUser({ userId: author.id, loggedUserId: user?.id ?? null })
  ) {
    const params = {
      id: author.id,
      entity: ContentPreferenceType.User,
      entityName: authorName,
      ...(customFeedId && { feedId: customFeedId }),
      opts: { extra: { origin: Origin.PostContextMenu, post_id: post.id } },
    };
    const key = getMatchKey(RecommendationMatchKind.Author, author.id);
    rows.push({
      key,
      title: authorName,
      meta: getMeta(key, 'Author', isBlockedAuthor),
      leading: (
        <ProfilePicture
          user={author}
          size={ProfileImageSize.Small}
          rounded="full"
        />
      ),
      isBlocked: isBlockedAuthor,
      isFollowing: isFollowingAuthor,
      blockLabel: getBlockLabel(authorName),
      onToggleFollow: () =>
        isFollowingAuthor ? unfollow(params) : follow(params),
      onToggleBlock: () => (isBlockedAuthor ? unblock(params) : block(params)),
    });
  }

  if (source.id && source.name && !isSourceUserSource(source)) {
    const key = getMatchKey(RecommendationMatchKind.Source, source.id);
    rows.push({
      key,
      title: source.name,
      meta: getMeta(key, isSquad ? 'Squad' : 'Source', isSourceBlocked),
      leading: (
        <SourceAvatar
          source={source}
          size={ProfileImageSize.Small}
          className="!mr-0"
        />
      ),
      isBlocked: isSourceBlocked,
      isFollowing: isFollowingSource,
      blockLabel: getBlockLabel(source.name),
      onToggleFollow:
        source.type === SourceType.Machine
          ? () =>
              isFollowingSource
                ? onUnfollowSource({ source, requireLogin: true })
                : onFollowSource({ source, requireLogin: true })
          : undefined,
      onToggleBlock: () =>
        isSourceBlocked
          ? onUnblockSource({ source, requireLogin: true })
          : onBlockSource({ source, requireLogin: true }),
    });
  }

  const matchedTopics = snapshot.matches
    .filter(({ kind }) => kind === RecommendationMatchKind.Topic)
    .map(({ id }) => id);
  const tags = [...new Set([...matchedTopics, ...postTags])];

  tags.forEach((tag) => {
    const isFollowing = !!feedSettings?.includeTags?.includes(tag);
    const isBlocked = !!feedSettings?.blockedTags?.includes(tag);
    const key = getMatchKey(RecommendationMatchKind.Topic, tag);
    rows.push({
      key,
      title: tag,
      meta: getMeta(key, 'Topic', isBlocked),
      leading: <TopicGlyph />,
      isBlocked,
      isFollowing,
      blockLabel: getBlockLabel(`#${tag}`),
      onToggleFollow: () =>
        isFollowing
          ? onUnfollowTags({ tags: [tag], requireLogin: true })
          : onFollowTags({ tags: [tag], requireLogin: true }),
      onToggleBlock: () =>
        isBlocked
          ? onUnblockTags({ tags: [tag], requireLogin: true })
          : onBlockTags({ tags: [tag], requireLogin: true }),
    });
  });

  const rowByKey = new Map(rows.map((row) => [row.key, row]));
  const matchedRows = snapshot.matches.map(
    (match): EntityRow =>
      rowByKey.get(getMatchKey(match.kind, match.id)) ?? {
        key: getMatchKey(match.kind, match.id),
        title: match.label,
        meta: getMatchMeta(match),
        leading: <span className="size-6 rounded-max bg-surface-float" />,
        isBlocked: false,
        blockLabel: '',
      },
  );
  const otherRows = rows.filter((row) => !matchByKey.has(row.key));
  const maxPoints = Math.max(
    1,
    ...snapshot.matches.map(({ points }) => points ?? 0),
  );

  const scoreFactors = explanation?.factors ?? [];
  const hasScoreMath = scoreFactors.length > 0;

  const onShowFewerClick = () => {
    onShowFewer();
    onClose();
  };

  return (
    <div className={classNames('flex min-h-0 flex-1 flex-col', className)}>
      <div className="flex min-h-0 flex-1 flex-col overflow-auto">
        <header className="flex flex-col gap-3 border-b border-border-subtlest-tertiary p-4 tablet:p-6">
          <Typography
            tag={TypographyTag.H2}
            type={TypographyType.Title3}
            className="pr-8"
            bold
          >
            Why am I seeing this?
          </Typography>
          <p className="text-text-secondary typo-body">
            {explanation?.matches.length ? (
              <ExplainedReason matches={explanation.matches} />
            ) : (
              reasonCopy[snapshot.reason]
            )}
          </p>
          <p className="text-text-tertiary typo-footnote">
            Ranked for {getFeedLabel(feedName)}{' '}
            {isTrendingFeed(feedName)
              ? 'by what developers across daily.dev read and upvote.'
              : 'from what you follow, read, and upvote.'}{' '}
            <a
              className="text-text-link hover:underline"
              href={
                isCustomFeed
                  ? `${webappUrl}feeds/${customFeedId}/edit`
                  : `${settingsUrl}/feed/general`
              }
            >
              Feed settings
            </a>
          </p>
        </header>
        <div className="flex flex-col gap-6 p-4 tablet:p-6">
          {matchedRows.length > 0 && (
            <section className="flex flex-col gap-1">
              <div className="flex min-h-8 items-center justify-between gap-2">
                <SectionTitle>What matched you</SectionTitle>
                {hasScoreMath && (
                  <ScoreBreakdownToggle
                    isOpen={isScoreMathOpen}
                    onToggle={() => setIsScoreMathOpen((open) => !open)}
                  />
                )}
              </div>
              {isScoreMathOpen && (
                <RecommendationScoreMath
                  className="mb-2 mt-1 rounded-12 bg-surface-float p-3"
                  factors={scoreFactors}
                  finalScore={explanation?.finalScore}
                />
              )}
              <ul className="flex flex-col">
                {matchedRows.map((row) => (
                  <EntityRowItem
                    key={row.key}
                    row={row}
                    match={matchByKey.get(row.key)}
                    maxPoints={maxPoints}
                    isStacked
                  />
                ))}
              </ul>
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
          onClick={onShowFewerClick}
        >
          Show fewer like this
        </Button>
        <Button
          type="button"
          className="min-w-24"
          variant={ButtonVariant.Primary}
          size={ButtonSize.Small}
          onClick={onClose}
        >
          Got it
        </Button>
      </div>
    </div>
  );
}
