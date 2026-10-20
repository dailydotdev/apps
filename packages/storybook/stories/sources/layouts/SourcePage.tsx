import type { ReactElement, ReactNode } from 'react';
import React, { useContext, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  ArrowIcon,
  DiscussIcon,
  HashtagIcon,
  HomeIcon,
  LinkIcon,
  MenuIcon as DotsIcon,
  ShareIcon,
  UpvoteIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { PageInfoHeader } from '@dailydotdev/shared/src/components/utilities/common';
import { EntitySectionHeading } from '@dailydotdev/shared/src/components/entity/EntitySectionHeading';
import { EntityRailWithFade } from '@dailydotdev/shared/src/components/entity/EntityRailWithFade';
import SourceActionsFollow from '@dailydotdev/shared/src/components/sources/SourceActions/SourceActionsFollow';
import SourceActionsNotify from '@dailydotdev/shared/src/components/sources/SourceActions/SourceActionsNotify';
import SourceActionsBlock from '@dailydotdev/shared/src/components/sources/SourceActions/SourceActionsBlock';
import {
  ShellPrimaryPill,
  ShellSquare,
} from '@dailydotdev/shared/src/components/shell/ShellSquare';
import { ArticleGrid } from '@dailydotdev/shared/src/components/cards/article/ArticleGrid';
import { ArticleList } from '@dailydotdev/shared/src/components/cards/article/ArticleList';
import type { Post as FeedPost } from '@dailydotdev/shared/src/graphql/posts';
import { PostType, UserVote } from '@dailydotdev/shared/src/graphql/posts';
import type { Post, Source } from '../data';
import { categories, publications, sourcesForCategory } from '../data';
import { OpenSourceContext, PageHeader, useSources } from '../kit';

// Production's /sources/[source], as it ships today, nothing added: the
// v2 page header with the name (laptop), the breadcrumbs (tablet up), the
// hero card (logo, name, Follow, Block or the bell, Copy link, ⋯, the
// description, related tags), "Sources similar to …", the Most upvoted and
// Best discussed rails, and "All posts from …". Phones get
// SourceShellPage's row: back, the name fading in once the hero's name
// scrolls past, and the Follow pill once the hero has gone. The real
// SourceActions buttons and feed cards render here with the source's real
// latest posts. "Best of …" (ArchiveEntryCard) is left out: it renders
// nothing without the archive index, which the story has no data for.

const pageSectionClassName = 'mx-4';
const SIMILAR_SIZE = 6;

/** SIMILAR_SOURCES_QUERY's stand-in: the category sharing the most tags. */
export const similarSources = (source: Source): Source[] => {
  const best = categories
    .map((category) => ({
      category,
      overlap: category.tags.filter((tag) => source.tags.includes(tag)).length,
    }))
    .sort((a, b) => b.overlap - a.overlap)[0];
  const pool = best?.overlap
    ? sourcesForCategory(best.category.slug)
    : [...publications].sort((a, b) => b.followers - a.followers);
  return pool.filter(({ id }) => id !== source.id).slice(0, SIMILAR_SIZE);
};

const toFeedPost = (post: Post, source: Source): FeedPost =>
  ({
    id: post.id,
    title: post.title,
    image: post.image,
    createdAt: post.createdAt.toISOString(),
    readTime: post.readTime ?? undefined,
    numUpvotes: post.upvotes,
    numComments: post.comments,
    tags: post.tags,
    permalink: `https://api.daily.dev/r/${post.id}`,
    commentsPermalink: `https://app.daily.dev/posts/${post.id}`,
    type:
      post.type === 'video:youtube' ? PostType.VideoYouTube : PostType.Article,
    bookmarked: false,
    read: false,
    upvoted: false,
    commented: false,
    userState: { vote: UserVote.None, flags: { feedbackDismiss: false } },
    source: {
      id: source.id,
      handle: source.handle,
      name: source.name,
      image: source.image,
      permalink: source.permalink,
      type: 'machine',
      active: true,
    },
  } as unknown as FeedPost);

/** Posts with the reader's upvotes and bookmarks applied, as the feed does. */
const usePostState = () => {
  const [state, setState] = useState<
    Record<string, { vote?: UserVote; bookmarked?: boolean }>
  >({});
  const apply = (post: FeedPost): FeedPost => {
    const own = state[post.id];
    if (!own) {
      return post;
    }
    const vote = own.vote ?? UserVote.None;
    return {
      ...post,
      bookmarked: !!own.bookmarked,
      numUpvotes: post.numUpvotes + (vote === UserVote.Up ? 1 : 0),
      userState: { ...post.userState, vote },
    } as FeedPost;
  };
  const toggleUpvote = (post: FeedPost) =>
    setState((current) => ({
      ...current,
      [post.id]: {
        ...current[post.id],
        vote:
          current[post.id]?.vote === UserVote.Up ? UserVote.None : UserVote.Up,
      },
    }));
  const toggleBookmark = (post: FeedPost) =>
    setState((current) => ({
      ...current,
      [post.id]: {
        ...current[post.id],
        bookmarked: !current[post.id]?.bookmarked,
      },
    }));
  return { apply, toggleUpvote, toggleBookmark };
};

type CardHandlers = Record<string, (...args: unknown[]) => void>;

const useCardHandlers = (
  postState: ReturnType<typeof usePostState>,
): CardHandlers => {
  const { goTo, loggedIn, notify } = useSources();
  const open = (post: FeedPost) => goTo(`/posts/${post.id}`);
  const signedIn =
    (action: (post: FeedPost) => void) =>
    (post: FeedPost): void =>
      loggedIn ? action(post) : goTo('/onboarding');
  return {
    onPostClick: open,
    onPostAuxClick: open,
    onReadArticleClick: open,
    onCommentClick: open,
    onUpvoteClick: signedIn(postState.toggleUpvote),
    onDownvoteClick: signedIn(() => undefined),
    onBookmarkClick: signedIn(postState.toggleBookmark),
    onCopyLinkClick: () => notify('✅ Copied link to clipboard'),
    onShare: () => notify('✅ Copied link to clipboard'),
  } as CardHandlers;
};

/** The phone check the page's own useIsPhone makes, on the device's window. */
const useIsPhone = (ref: React.RefObject<HTMLElement>): boolean => {
  const [isPhone, setIsPhone] = useState(false);
  useEffect(() => {
    const view = ref.current?.ownerDocument.defaultView;
    if (!view) {
      return undefined;
    }
    const query = view.matchMedia('(max-width: 655.98px)');
    const update = () => setIsPhone(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, [ref]);
  return isPhone;
};

/** usePassedBlock: true once the element has scrolled under the top. */
const usePassed = (ref: React.RefObject<HTMLElement>): boolean => {
  const [passed, setPassed] = useState(false);
  useEffect(() => {
    const element = ref.current;
    const view = element?.ownerDocument.defaultView;
    if (!element || !view) {
      return undefined;
    }
    const update = () => setPassed(element.getBoundingClientRect().bottom < 52);
    update();
    view.addEventListener('scroll', update, { passive: true });
    return () => view.removeEventListener('scroll', update);
  }, [ref]);
  return passed;
};

/** SourceActions: Follow, the bell or Block, Copy link, and ⋯. */
const SourceActions = ({
  source,
  showCopyLink,
  showMenu = true,
}: {
  source: Source;
  showCopyLink: boolean;
  showMenu?: boolean;
}): ReactElement => {
  const actions = useSourceActions(source);
  return (
    <div className="inline-flex flex-row gap-2">
      {!actions.isBlocked && (
        <SourceActionsFollow
          isFetching={false}
          isSubscribed={actions.isFollowing}
          onClick={actions.toggleFollow}
          variant={ButtonVariant.Primary}
        />
      )}
      {actions.isFollowing && (
        <SourceActionsNotify
          haveNotificationsOn={actions.haveNotificationsOn}
          onClick={actions.toggleNotify}
        />
      )}
      {!actions.isFollowing && (
        <SourceActionsBlock
          isBlocked={actions.isBlocked}
          onClick={actions.toggleBlock}
        />
      )}
      {showCopyLink && (
        <Button
          aria-label="Copy link"
          icon={<LinkIcon />}
          onClick={actions.copyLink}
          size={ButtonSize.Small}
          type="button"
          variant={ButtonVariant.Float}
        />
      )}
      {showMenu && <OptionsMenu />}
    </div>
  );
};

/** CustomFeedOptionsMenu: Share, Add to custom feed. */
const OptionsMenu = ({
  inBlock = false,
}: {
  inBlock?: boolean;
}): ReactElement => {
  const { goTo, notify } = useSources();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) {
      return undefined;
    }
    const doc = ref.current?.ownerDocument ?? document;
    const close = (event: MouseEvent) =>
      !ref.current?.contains(event.target as Node) && setOpen(false);
    doc.addEventListener('mousedown', close);
    return () => doc.removeEventListener('mousedown', close);
  }, [open]);
  const item = (icon: ReactNode, label: string, action: () => void) => (
    <button
      type="button"
      onClick={() => {
        setOpen(false);
        action();
      }}
      className="flex h-8 w-full items-center gap-2 rounded-10 px-2 text-left text-text-tertiary typo-footnote hover:bg-surface-float hover:text-text-primary"
    >
      {icon}
      {label}
    </button>
  );
  return (
    <div ref={ref} className="relative">
      <Button
        type="button"
        aria-label="Options"
        className={classNames(
          'justify-center',
          inBlock && 'shell-material !size-[2.375rem] !rounded-14 !p-0',
        )}
        size={ButtonSize.Small}
        variant={inBlock ? ButtonVariant.Tertiary : ButtonVariant.Float}
        icon={<DotsIcon />}
        pressed={open}
        onClick={() => setOpen(!open)}
      />
      {open && (
        <div className="absolute right-0 top-10 z-3 flex w-48 flex-col rounded-16 border border-border-subtlest-tertiary bg-background-popover p-1 shadow-2 tablet:left-0 tablet:right-auto">
          {item(<ShareIcon size={IconSize.Small} />, 'Share', () =>
            notify('✅ Copied link to clipboard'),
          )}
          {item(
            <HashtagIcon size={IconSize.Small} />,
            'Add to custom feed',
            () => goTo('/feeds/new'),
          )}
        </div>
      )}
    </div>
  );
};

/** useSourceActions, on the story's follow state, with production's toasts. */
const useSourceActions = (source: Source) => {
  const {
    isFollowing,
    blocked,
    setFollowing,
    setBlocked,
    notify,
    loggedIn,
    requireSignUp,
  } = useSources();
  const [haveNotificationsOn, setNotifications] = useState(false);
  const following = isFollowing(source.id);
  const isBlocked = blocked.has(source.id);
  return {
    isFollowing: following,
    isBlocked,
    haveNotificationsOn,
    toggleFollow: () => {
      if (!loggedIn) {
        requireSignUp(`follow ${source.name}`);
        return;
      }
      setFollowing(source, !following);
      if (following) {
        setNotifications(false);
      }
      notify(
        following
          ? `⛔️ You are no longer following ${source.name}`
          : `✅ You are now following ${source.name}`,
      );
    },
    toggleNotify: () => {
      setNotifications(!haveNotificationsOn);
      notify(
        haveNotificationsOn
          ? `⛔️ You'll no longer get notified about ${source.name} posts`
          : `✅ You'll get notified every time ${source.name} posts`,
      );
    },
    toggleBlock: () => {
      if (!loggedIn) {
        requireSignUp(`block ${source.name}`);
        return;
      }
      setBlocked(source, !isBlocked);
      notify(
        isBlocked
          ? `✅ ${source.name} unblocked`
          : `⛔️ ${source.name} is now blocked`,
      );
    },
    copyLink: () => notify('✅ Copied link to clipboard'),
  };
};

/** EntityFeedRailSection: hidden when the rail has no posts. */
const RailSection = ({
  icon,
  heading,
  posts,
  handlers,
}: {
  icon: ReactNode;
  heading: ReactNode;
  posts: FeedPost[];
  handlers: CardHandlers;
}): ReactElement | null => {
  if (!posts.length) {
    return null;
  }
  return (
    <div className={`${pageSectionClassName} self-stretch`}>
      <EntitySectionHeading icon={icon}>{heading}</EntitySectionHeading>
      <EntityRailWithFade>
        <div className="no-scrollbar grid snap-x snap-mandatory auto-cols-[85%] grid-flow-col gap-4 overflow-x-scroll scroll-smooth py-2 pt-5 tablet:auto-cols-[calc(50%-1rem)] laptop:auto-cols-[calc((100%/3)-1.5rem)] laptopL:auto-cols-[calc(25%-1.5rem)] laptopL:gap-8">
          {posts.map((post) => (
            <ArticleGrid key={post.id} post={post} {...handlers} />
          ))}
        </div>
      </EntityRailWithFade>
    </div>
  );
};

export const SourcePage = ({
  source,
  onBack,
}: {
  source: Source;
  /** Back to where the source was opened from: the hub or another source. */
  onBack: () => void;
}): ReactElement => {
  const { goTo, loggedIn, isFollowing, blocked } = useSources();
  const openSource = useContext(OpenSourceContext);
  const root = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const isPhone = useIsPhone(root);
  const hasNamePassed = usePassed(nameRef);
  const hasHeroPassed = usePassed(heroRef);
  const postState = usePostState();
  const handlers = useCardHandlers(postState);
  const actions = useSourceActions(source);
  const posts = source.latest.map((post) =>
    postState.apply(toFeedPost(post, source)),
  );
  const byUpvotes = [...posts].sort((a, b) => b.numUpvotes - a.numUpvotes);
  const byComments = posts
    .filter((post) => post.numComments > 0)
    .sort((a, b) => b.numComments - a.numComments);
  const similar = similarSources(source);

  return (
    <div ref={root} className="flex flex-col overflow-x-hidden">
      {/* Phones: SourceShellPage. */}
      <header className="fixed inset-x-0 top-0 z-header bg-background-default tablet:hidden">
        <div
          className="flex items-center"
          style={{ height: 52, paddingInline: 16, gap: 8 }}
        >
          <ShellSquare aria-label="Go back" onClick={onBack}>
            <ArrowIcon size={IconSize.Small} className="-rotate-90" />
          </ShellSquare>
          {hasNamePassed ? (
            <h1 className="shell-title-in min-w-0 flex-1 truncate px-1 font-bold typo-callout">
              {source.name}
            </h1>
          ) : (
            <span className="min-w-0 flex-1" />
          )}
          <div className="flex shrink-0 items-center" style={{ gap: 8 }}>
            {hasHeroPassed &&
              loggedIn &&
              !isFollowing(source.id) &&
              !blocked.has(source.id) && (
                <ShellPrimaryPill onClick={actions.toggleFollow}>
                  Follow
                </ShellPrimaryPill>
              )}
            {isPhone && <OptionsMenu inBlock />}
          </div>
        </div>
      </header>
      <div aria-hidden className="h-[3.25rem] tablet:hidden" />

      {/* Laptop: the v2 page-header strip. */}
      <PageHeader
        title={source.name}
        suggest={false}
        className="!hidden laptop:!flex"
      />

      <div className="flex flex-col pt-4 laptop:pt-0">
        <nav
          aria-label="breadcrumbs"
          className={classNames(
            'hidden h-10 items-center gap-0.5 px-1.5 tablet:flex',
            pageSectionClassName,
          )}
        >
          <ol className="flex flex-1 items-center gap-0.5">
            <li className="flex flex-row items-center gap-0.5">
              <Button
                variant={ButtonVariant.Tertiary}
                icon={<HomeIcon secondary />}
                size={ButtonSize.XSmall}
                aria-label="Home"
                onClick={() => goTo('/')}
              />
              <span className="text-text-quaternary" aria-hidden>
                /
              </span>
            </li>
            <li className="flex flex-row items-center gap-0.5">
              <button
                type="button"
                onClick={onBack}
                className="px-2 text-text-tertiary transition-colors typo-callout hover:text-text-primary"
              >
                Sources
              </button>
              <span className="text-text-quaternary" aria-hidden>
                /
              </span>
            </li>
            <li
              aria-current="page"
              className="flex flex-row items-center gap-0.5"
            >
              <span className="px-2 font-bold text-text-primary typo-callout">
                {source.name}
              </span>
            </li>
          </ol>
        </nav>

        <PageInfoHeader
          ref={heroRef}
          className={`${pageSectionClassName} !w-auto`}
        >
          <div className="flex items-center font-bold">
            <img
              src={source.image}
              alt={`${source.name} logo`}
              className="size-10 rounded-full"
            />
            <h1 ref={nameRef} className="ml-2 w-fit typo-title2">
              {source.name}
            </h1>
          </div>
          <div className="flex flex-row gap-3">
            <SourceActions
              source={source}
              showCopyLink={!isPhone}
              showMenu={!isPhone}
            />
          </div>
          {source.description && (
            <p className="typo-body">{source.description}</p>
          )}
          {source.tags.length > 0 && (
            <div>
              <p className="mb-3 text-text-tertiary typo-caption1">
                Related tags:
              </p>
              <div className="no-scrollbar flex gap-2 overflow-x-auto">
                {source.tags.map((tag) => (
                  <Button
                    key={tag}
                    type="button"
                    size={ButtonSize.XSmall}
                    variant={ButtonVariant.Float}
                    className="relative"
                    translate="no"
                    onClick={() => goTo(`/tags/${tag}`)}
                  >
                    #{tag}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </PageInfoHeader>

        {similar.length > 0 && (
          <div className={classNames('mb-10 w-auto', pageSectionClassName)}>
            <EntitySectionHeading className="mb-3">
              Sources similar to {source.name}
            </EntitySectionHeading>
            <div className="no-scrollbar flex gap-2 overflow-x-auto">
              {similar.map((item) => (
                <a
                  key={item.id}
                  href={item.permalink}
                  onClick={(event) => {
                    event.preventDefault();
                    openSource?.(item);
                  }}
                  className="flex shrink-0 flex-col rounded-16 border border-border-subtlest-tertiary px-4 py-3 text-center"
                >
                  <img
                    src={item.image}
                    alt={`${item.name} logo`}
                    className="mx-auto size-10 rounded-full object-cover"
                  />
                  <p className="mt-1.5 whitespace-nowrap font-bold typo-callout">
                    {item.name}
                  </p>
                </a>
              ))}
            </div>
          </div>
        )}

        <RailSection
          icon={<UpvoteIcon size={IconSize.Medium} className="shrink-0" />}
          heading={<>Most upvoted posts from {source.name}</>}
          posts={byUpvotes}
          handlers={handlers}
        />
        <RailSection
          icon={<DiscussIcon size={IconSize.Medium} className="shrink-0" />}
          heading={<>Best discussed posts from {source.name}</>}
          posts={byComments}
          handlers={handlers}
        />

        <div className={`${pageSectionClassName} self-stretch`}>
          <EntitySectionHeading>
            All posts from {source.name}
          </EntitySectionHeading>
          {isPhone ? (
            <div className="-mx-4 flex flex-col">
              {posts.map((post) => (
                <ArticleList key={post.id} post={post} {...handlers} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 pb-10 laptop:grid-cols-3 laptopL:grid-cols-4 laptopL:gap-8">
              {posts.map((post) => (
                <ArticleGrid key={post.id} post={post} {...handlers} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
