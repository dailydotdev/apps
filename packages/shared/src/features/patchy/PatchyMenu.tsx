import type { ReactElement, ReactNode } from 'react';
import React, { useContext, useState } from 'react';
import { useRouter } from 'next/router';
import { useQueryClient } from '@tanstack/react-query';
import classNames from 'classnames';
import {
  ArrowIcon,
  BookmarkIcon,
  HashtagIcon,
  SearchIcon,
  SparkleIcon,
  TrendingIcon,
} from '../../components/icons';
import { IconSize } from '../../components/Icon';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../components/typography/Typography';
import Link from '../../components/utilities/Link';
import { SpotlightContext } from '../../components/spotlight/SpotlightContext';
import { useLogContext } from '../../contexts/LogContext';
import type { Post } from '../../graphql/posts';
import { getSearchUrl, SearchProviderEnum } from '../../graphql/search';
import { useBookmarkPost } from '../../hooks/useBookmarkPost';
import useFeedSettings from '../../hooks/useFeedSettings';
import useTagAndSource from '../../hooks/useTagAndSource';
import { webappUrl } from '../../lib/constants';
import { LogEvent, Origin, TargetType } from '../../lib/log';
import { useOpenFeedTune } from '../feedExplain/useOpenFeedTune';
import { useSetFeedExplain } from '../feedExplain/useSetFeedExplain';
import type { PatchyQuickRead } from './patchyAssistant';
import { getPatchyQuickReads, getPatchyReadingPost } from './patchyAssistant';
import type { PatchyContext } from './patchyContext';
import { getPatchyContext } from './patchyContext';

const rowClassName =
  'flex w-full items-center gap-2 rounded-10 px-2 py-1.5 text-left typo-callout hover:bg-surface-hover focus-outline disabled:cursor-default disabled:text-text-tertiary disabled:hover:bg-transparent';

type PicksKind = 'feed' | 'tag' | 'bookmarks';

interface MenuItem {
  id: string;
  label: string;
  icon: ReactNode;
  href?: string;
  isExternal?: boolean;
  onClick?: () => void;
  // Expands a short list of posts under the row instead of navigating.
  picks?: PicksKind;
  isDone?: boolean;
}

const Row = ({ icon, children }: { icon: ReactNode; children: ReactNode }) => (
  <span className="flex min-w-0 flex-1 items-center gap-2">
    <span className="flex size-5 shrink-0 items-center justify-center text-text-tertiary">
      {icon}
    </span>
    <span className="min-w-0 flex-1 truncate">{children}</span>
  </span>
);

const icon = {
  read: <SparkleIcon size={IconSize.Size16} />,
  trending: <TrendingIcon size={IconSize.Size16} />,
  search: <SearchIcon size={IconSize.Size16} />,
  tag: <HashtagIcon size={IconSize.Size16} />,
  bookmark: <BookmarkIcon size={IconSize.Size16} />,
  arrow: <ArrowIcon size={IconSize.Size16} className="rotate-90" />,
};

export const usePatchyContext = (): PatchyContext => {
  const router = useRouter();
  return getPatchyContext({
    path: router?.asPath ?? '/',
    query: router?.query ?? {},
    post: getPatchyReadingPost(),
  });
};

// What you can ask Patchy for, in his corner of the Streak panel. It depends
// on where you are: a post, your feed, a tag, a source, your bookmarks or a
// search each get a few things that make sense there; anywhere else he
// offers something to read, what's trending and search.
export const PatchyMenu = ({
  context,
  onNavigate,
}: {
  context: PatchyContext;
  onNavigate?: () => void;
}): ReactElement => {
  const client = useQueryClient();
  const { logEvent } = useLogContext();
  const spotlight = useContext(SpotlightContext);
  const { feedSettings } = useFeedSettings();
  const { onFollowTags } = useTagAndSource({ origin: Origin.Patchy });
  const { toggleBookmark } = useBookmarkPost();
  const openTune = useOpenFeedTune(Origin.Patchy);
  const setExplain = useSetFeedExplain(Origin.Patchy);
  const [picks, setPicks] = useState<{
    kind: PicksKind;
    posts: PatchyQuickRead[];
  } | null>(null);
  const [done, setDone] = useState<string[]>([]);

  const followed = feedSettings?.includeTags ?? [];
  const isFollowing = (tag: string) =>
    followed.some((value) => value.toLowerCase() === tag.toLowerCase());

  const getItems = (): MenuItem[] => {
    const read: MenuItem = {
      id: 'read',
      label: 'What to read?',
      icon: icon.read,
      picks: 'feed',
    };
    const trending: MenuItem = {
      id: 'trending',
      label: 'What’s trending?',
      icon: icon.trending,
      href: `${webappUrl}highlights`,
    };
    const search: MenuItem = {
      id: 'search',
      label: 'Search daily.dev',
      icon: icon.search,
      onClick: spotlight?.open,
    };
    const followTag = (tag: string): MenuItem => ({
      id: 'follow',
      label: done.includes('follow') ? `Following #${tag}` : `Follow #${tag}`,
      icon: icon.tag,
      isDone: done.includes('follow'),
      onClick: () =>
        onFollowTags({ tags: [tag] }).then(({ successful }) => {
          if (successful) {
            setDone((current) => [...current, 'follow']);
          }
        }),
    });
    const bestOfTag = (tag: string): MenuItem => ({
      id: 'best_of',
      label: `Best of #${tag}`,
      icon: icon.trending,
      href: `${webappUrl}tags/${encodeURIComponent(tag)}/best-of`,
    });

    switch (context.kind) {
      case 'post': {
        const { post, tag } = context;
        const list: MenuItem[] = [];
        if (!post.bookmarked || done.includes('save')) {
          list.push({
            id: 'save',
            label: done.includes('save') ? 'Saved for later' : 'Save for later',
            icon: icon.bookmark,
            isDone: done.includes('save'),
            onClick: () => {
              toggleBookmark({ post: post as Post, origin: Origin.Patchy });
              setDone((current) => [...current, 'save']);
            },
          });
        }
        if (tag && (!isFollowing(tag) || done.includes('follow'))) {
          list.push(followTag(tag));
        }
        if (tag) {
          list.push(bestOfTag(tag));
        }
        if (post.source?.handle && post.source.type !== 'user') {
          list.push({
            id: 'source',
            label: `More from ${post.source.name ?? post.source.handle}`,
            icon: icon.arrow,
            href: `${webappUrl}sources/${post.source.handle}`,
          });
        }
        return list.slice(0, 4);
      }
      case 'forYou':
        return [
          read,
          {
            id: 'why',
            label: 'Why am I seeing these?',
            icon: icon.search,
            onClick: () => setExplain(true),
          },
          {
            id: 'tune',
            label: 'Tune my feed',
            icon: icon.tag,
            onClick: () => openTune(),
          },
        ];
      case 'feed':
        return [
          read,
          trending,
          {
            id: 'tune',
            label: 'Tune my feed',
            icon: icon.tag,
            onClick: () => openTune({ goToFeed: true }),
          },
        ];
      case 'tag': {
        const { tag } = context;
        return [
          ...(!isFollowing(tag) || done.includes('follow')
            ? [followTag(tag)]
            : []),
          { ...read, label: `Something short on #${tag}`, picks: 'tag' },
          bestOfTag(tag),
        ];
      }
      case 'source':
        return [
          {
            id: 'best_of',
            label: 'Their best posts',
            icon: icon.trending,
            href: `${webappUrl}sources/${encodeURIComponent(
              context.source,
            )}/best-of`,
          },
          read,
          trending,
        ];
      case 'bookmarks':
        return [
          {
            id: 'pick',
            label: 'Pick one for me',
            icon: icon.bookmark,
            picks: 'bookmarks',
          },
          read,
          trending,
        ];
      case 'search': {
        const { query } = context;
        if (!query) {
          return spotlight ? [read, trending, search] : [read, trending];
        }
        return [
          {
            id: 'tags',
            label: `Look for #${query.replace(/\s+/g, '-').toLowerCase()}`,
            icon: icon.tag,
            href: getSearchUrl({ provider: SearchProviderEnum.Tags, query }),
          },
          {
            id: 'people',
            label: 'Find people',
            icon: icon.search,
            href: getSearchUrl({ provider: SearchProviderEnum.Users, query }),
          },
          {
            id: 'web',
            label: 'Search the web',
            icon: icon.arrow,
            href: getSearchUrl({ provider: SearchProviderEnum.Google, query }),
            isExternal: true,
          },
        ];
      }
      default:
        return spotlight ? [read, trending, search] : [read, trending];
    }
  };
  const items = getItems();

  const log = (item: MenuItem) =>
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.PatchyMenu,
      target_id: item.id,
      extra: JSON.stringify({ context: context.kind }),
    });

  const togglePicks = (item: MenuItem) => {
    if (!item.picks) {
      return;
    }
    if (picks?.kind === item.picks) {
      setPicks(null);
      return;
    }
    log(item);
    const excludeId = context.kind === 'post' ? context.post.id : undefined;
    setPicks({
      kind: item.picks,
      posts: getPatchyQuickReads(client, {
        limit: 3,
        excludeId,
        tag:
          item.picks === 'tag' && context.kind === 'tag'
            ? context.tag
            : undefined,
        isBookmarked: item.picks === 'bookmarks',
      }),
    });
  };

  return (
    <nav aria-label="Ask Patchy" className="flex flex-col">
      {items.map((item) => {
        if (item.picks) {
          const isOpen = picks?.kind === item.picks;
          return (
            <React.Fragment key={item.id}>
              <button
                type="button"
                className={rowClassName}
                aria-expanded={isOpen}
                onClick={() => togglePicks(item)}
              >
                <Row icon={item.icon}>{item.label}</Row>
                <ArrowIcon
                  size={IconSize.Size16}
                  className={classNames(
                    'text-text-tertiary transition-transform',
                    isOpen ? 'rotate-180' : 'rotate-90',
                  )}
                />
              </button>
              {isOpen && (
                <div className="flex flex-col gap-1 py-1 pl-9 pr-1">
                  {picks.posts.length ? (
                    picks.posts.map((post) => (
                      <Link
                        key={post.id}
                        href={post.commentsPermalink}
                        passHref
                      >
                        <a
                          href={post.commentsPermalink}
                          className="flex items-center gap-2 rounded-8 px-2 py-1 hover:bg-surface-hover"
                          onClick={onNavigate}
                        >
                          <span className="min-w-0 flex-1 truncate typo-footnote">
                            {post.title}
                          </span>
                          <Typography
                            tag={TypographyTag.Span}
                            type={TypographyType.Caption1}
                            color={TypographyColor.Tertiary}
                          >
                            {post.readTime}m
                          </Typography>
                        </a>
                      </Link>
                    ))
                  ) : (
                    <Typography
                      type={TypographyType.Footnote}
                      color={TypographyColor.Tertiary}
                      className="px-2 py-1"
                    >
                      Nothing short here right now. Scroll a bit and ask me
                      again.
                    </Typography>
                  )}
                </div>
              )}
            </React.Fragment>
          );
        }
        if (item.href) {
          return (
            <Link key={item.id} href={item.href} passHref>
              <a
                href={item.href}
                className={rowClassName}
                {...(item.isExternal && {
                  target: '_blank',
                  rel: 'noopener noreferrer',
                })}
                onClick={() => {
                  log(item);
                  onNavigate?.();
                }}
              >
                <Row icon={item.icon}>{item.label}</Row>
              </a>
            </Link>
          );
        }
        return (
          <button
            key={item.id}
            type="button"
            className={rowClassName}
            disabled={item.isDone}
            onClick={() => {
              log(item);
              item.onClick?.();
              if (
                item.id === 'why' ||
                item.id === 'tune' ||
                item.id === 'search'
              ) {
                onNavigate?.();
              }
            }}
          >
            <Row icon={item.icon}>{item.label}</Row>
          </button>
        );
      })}
    </nav>
  );
};
