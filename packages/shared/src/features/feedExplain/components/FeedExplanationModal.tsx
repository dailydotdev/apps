import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
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
import { PlusIcon } from '../../../components/icons/Plus';
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
import type { Post } from '../../../graphql/posts';
import { isSourceUserSource, SourceType } from '../../../graphql/sources';
import {
  ContentPreferenceStatus,
  ContentPreferenceType,
} from '../../../graphql/contentPreference';
import { useAuthContext } from '../../../contexts/AuthContext';
import { usePostById } from '../../../hooks/usePostById';
import useFeedSettings from '../../../hooks/useFeedSettings';
import useTagAndSource from '../../../hooks/useTagAndSource';
import { useContentPreference } from '../../../hooks/contentPreference/useContentPreference';
import { isFollowingContent } from '../../../hooks/contentPreference/types';
import { Origin } from '../../../lib/log';
import { isSpecialUser } from '../../../lib/user';
import { settingsUrl } from '../../../lib/constants';
import type { FeedItemExplain } from '../types';
import { isRankedExplain } from '../types';
import type { ExplanationMatch } from '../describe';
import {
  ExplanationMatchKind,
  getExplanationMatches,
  getMatchKey,
  getPostTags,
  getReason,
  getScoreBreakdown,
} from '../describe';
import { ScoreBreakdown, ScoreBreakdownToggle } from './ScoreBreakdown';

export interface FeedExplanationModalProps extends LazyModalCommonProps {
  post: Post;
  explain: FeedItemExplain | null;
  onShowFewer: () => unknown;
}

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

const MatchedReason = ({
  match,
}: {
  match: ExplanationMatch;
}): ReactElement => {
  const isTopic = match.kind === ExplanationMatchKind.Topic;

  return (
    <>
      <Strong>{isTopic ? `#${match.label}` : match.label}</Strong> is{' '}
      {isTopic ? 'a' : 'the'} {getMatchMeta(match)}, and it is {match.origin}.
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
  onToggleFollow?: () => unknown;
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
  <li
    className={classNames('flex items-center gap-3', match ? 'py-2' : 'h-11')}
  >
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
    <span
      className={classNames(
        'flex min-w-0 flex-1',
        match ? 'flex-col gap-1' : 'items-baseline gap-2',
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
      <span
        className={classNames(
          'min-w-0 shrink truncate text-text-quaternary',
          match ? 'typo-caption1' : 'hidden typo-footnote tablet:block',
        )}
      >
        {row.meta}
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
 * "Why am I seeing this?" for a card in Explain mode: what matched the
 * reader, the score breakdown, and follow and block for everything the post
 * is about.
 */
function FeedExplanationModal({
  post: feedPost,
  explain,
  onShowFewer,
  ...props
}: FeedExplanationModalProps): ReactElement {
  const { onRequestClose } = props;
  const { user } = useAuthContext();
  const { post: loadedPost } = usePostById({ id: feedPost.id });
  const post = loadedPost ?? feedPost;
  const { source, author } = post;
  const { feedSettings } = useFeedSettings();
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
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);
  const isRanked = isRankedExplain(explain);
  const matches = isRanked ? getExplanationMatches(post, explain) : [];
  const breakdown = isRanked ? getScoreBreakdown(explain) : undefined;
  const reason = getReason(post, explain);
  const matchByKey = new Map(matches.map((match) => [match.key, match]));
  const getMeta = (key: string, fallback: string, isBlocked: boolean) => {
    if (isBlocked) {
      return 'Blocked';
    }
    const match = matchByKey.get(key);
    return match ? getMatchMeta(match) : fallback;
  };

  const rows: EntityRow[] = [];
  const authorName =
    author?.name || (author?.username ? `@${author.username}` : null);
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
    const key = getMatchKey(ExplanationMatchKind.Author, author.id);
    rows.push({
      key,
      title: authorName,
      meta: getMeta(key, 'author', isBlocked),
      leading: (
        <ProfilePicture
          user={author}
          size={ProfileImageSize.Small}
          rounded="full"
        />
      ),
      isBlocked,
      isFollowing,
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
    const key = getMatchKey(ExplanationMatchKind.Source, source.id);
    rows.push({
      key,
      title: source.name,
      meta: getMeta(key, isSquad ? 'squad' : 'source', isBlocked),
      leading: (
        <SourceAvatar
          source={source}
          size={ProfileImageSize.Small}
          className="!mr-0"
        />
      ),
      isBlocked,
      isFollowing,
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
    rows.push({
      key,
      title: `#${tag}`,
      meta: getMeta(key, 'topic', isBlocked),
      leading: <TopicGlyph />,
      isBlocked,
      isFollowing,
      onToggleFollow: () =>
        isFollowing ? onUnfollowTags({ tags }) : onFollowTags({ tags }),
      onToggleBlock: () =>
        isBlocked ? onUnblockTags({ tags }) : onBlockTags({ tags }),
    });
  });

  const matchedRows = rows.filter(({ key }) => matchByKey.has(key));
  const otherRows = rows.filter(({ key }) => !matchByKey.has(key));
  const maxPoints = Math.max(1, ...matches.map(({ points }) => points));
  const [primary] = matches;

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
      <ModalClose top="2" right="2" onClick={onRequestClose} />
      <Modal.Body className="!p-0">
        <div className="flex min-h-0 flex-1 flex-col">
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
                {primary ? (
                  <MatchedReason match={primary} />
                ) : (
                  <>
                    {reason.lead}
                    {reason.name && <Strong>{reason.name}</Strong>}
                    {reason.tail}
                  </>
                )}
              </p>
              <p className="text-text-tertiary typo-footnote">
                Ranked for For You from what you follow, read, and upvote.{' '}
                <a
                  className="text-text-link hover:underline"
                  href={`${settingsUrl}/feed/general`}
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
                    {breakdown && (
                      <ScoreBreakdownToggle
                        isOpen={isBreakdownOpen}
                        onToggle={() => setIsBreakdownOpen((open) => !open)}
                      />
                    )}
                  </div>
                  {breakdown && isBreakdownOpen && (
                    <ScoreBreakdown
                      className="mb-2 mt-1 rounded-12 bg-surface-float p-3"
                      {...breakdown}
                    />
                  )}
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
                onShowFewer();
                onRequestClose();
              }}
            >
              Show fewer like this
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
