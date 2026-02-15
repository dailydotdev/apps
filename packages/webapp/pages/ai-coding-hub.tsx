import type { ReactElement } from 'react';
import React, { useState, useMemo, useEffect, useRef, useCallback, useContext } from 'react';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';
import classNames from 'classnames';
import dynamic from 'next/dynamic';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  UpvoteIcon,
  DiscussIcon,
  BookmarkIcon,
  ShareIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import ProgressiveEnhancementContext from '@dailydotdev/shared/src/contexts/ProgressiveEnhancementContext';
import { useViewSize, ViewSize } from '@dailydotdev/shared/src/hooks';
import { MobileFeedActions } from '@dailydotdev/shared/src/components/feeds/MobileFeedActions';
import { getLayout } from '../components/layouts/MainLayout';
import {
  feedItems,
  categoryLabels,
  getMentionsLabel,
  getRelativeDate,
  isViralFeedItem,
} from '../data/aiCodingHubData';
import type { FeedItem } from '../data/aiCodingHubData';

const MobileFooterNavbar = dynamic(
  () => import(/* webpackChunkName: "mobileFooterNavbar" */ '../components/footer/MobileFooterNavbar'),
);

const SignalCard = ({
  item,
  showJustIn = false,
}: {
  item: FeedItem;
  showJustIn?: boolean;
}): ReactElement => {
  const router = useRouter();
  const detailUrl = `/ai-coding-hub/${item.id}`;
  const isViral = isViralFeedItem(item);

  return (
    <article
      className="group cursor-pointer border-b border-border-subtlest-quaternary bg-background-default transition-all hover:bg-surface-hover"
      role="button"
      tabIndex={0}
      onClick={() => router.push(detailUrl)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          router.push(detailUrl);
        }
      }}
    >
      <div className="flex flex-col gap-1 px-8 py-3">
        <div className="flex items-center gap-1 text-text-quaternary" style={{ fontSize: '15px' }}>
          {showJustIn && (
            <>
              <span className="rounded-4 bg-white px-1.5 py-0.5 text-[10px] font-bold uppercase leading-none text-black">
                Just in
              </span>
            </>
          )}
          {isViral && (
            <>
              <span className="viral-gradient-badge rounded-4 px-1.5 py-0.5 text-[10px] font-bold uppercase leading-none text-text-primary">
                Viral
              </span>
              <span>·</span>
            </>
          )}
          <span>{categoryLabels[item.category]}</span>
          <span>{getMentionsLabel(item)}</span>
          <span>·</span>
          <span>{getRelativeDate(item.date)}</span>
        </div>

        <Link href={detailUrl} passHref>
          <a className="block">
            <p className="line-clamp-2 font-bold leading-snug" style={{ fontSize: '15px', color: '#EAEAEA' }}>
              {item.headline}
            </p>
          </a>
        </Link>

        {item.summary && (
          <p className="leading-normal" style={{ fontSize: '15px', lineHeight: '20px', color: '#EAEAEA' }}>
            {item.summary}
          </p>
        )}

        <div className="mt-2 flex items-center justify-between text-text-quaternary">
          <button
            type="button"
            className="flex items-center gap-1 transition-colors hover:text-text-secondary"
            onClick={(e) => e.stopPropagation()}
          >
            <UpvoteIcon size={IconSize.XSmall} />
            {item.upvotes > 0 && <span className="text-xs">{item.upvotes}</span>}
          </button>
          <button
            type="button"
            className="flex items-center gap-1 transition-colors hover:text-text-secondary"
            onClick={(e) => e.stopPropagation()}
          >
            <DiscussIcon size={IconSize.XSmall} />
            {item.comments > 0 && <span className="text-xs">{item.comments}</span>}
          </button>
          <button
            type="button"
            className="flex items-center gap-1 transition-colors hover:text-text-secondary"
            onClick={(e) => e.stopPropagation()}
          >
            <BookmarkIcon size={IconSize.XSmall} />
          </button>
          <button
            type="button"
            className="flex items-center gap-1 transition-colors hover:text-text-secondary"
            onClick={(e) => e.stopPropagation()}
          >
            <ShareIcon size={IconSize.XSmall} />
          </button>
        </div>
      </div>
    </article>
  );
};

const SmartStatusBar = (): ReactElement | null => {
  const tickerItems = useMemo((): string[] => {
    const groupedByCategory = new Map<string, string[]>();

    feedItems.slice(0, 10).forEach((item) => {
      const category = categoryLabels[item.category];
      if (!groupedByCategory.has(category)) {
        groupedByCategory.set(category, []);
      }
      groupedByCategory.get(category)?.push(item.headline);
    });

    return Array.from(groupedByCategory.entries()).map(
      ([category, headlines]) => `${category}: ${headlines.join(' | ')}`,
    );
  }, []);

  if (tickerItems.length === 0) {
    return null;
  }

  const tickerText = tickerItems.join('            |            ');

  return (
    <>
      <div className="sentinel-ticker-container">
        <div className="sentinel-ticker-track">
          <span className="sentinel-ticker-item">{tickerText}</span>
          <span className="sentinel-ticker-item" aria-hidden>
            {tickerText}
          </span>
        </div>
      </div>
      <style jsx>{`
        .sentinel-ticker-container {
          width: 100%;
          max-width: 340px;
          overflow: hidden;
          mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent);
        }

        .sentinel-ticker-track {
          display: flex;
          width: max-content;
          animation: sentinelTicker 22s linear infinite;
          will-change: transform;
        }

        .sentinel-ticker-item {
          white-space: nowrap;
          padding-right: 6rem;
          font-size: 15px;
          line-height: 20px;
          font-weight: 500;
          color: var(--theme-label-secondary);
        }

        @keyframes sentinelTicker {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </>
  );
};

type FilterCategory =
  | 'ALL'
  | 'product_launch'
  | 'feature'
  | 'tips'
  | 'announcement'
  | 'drama'
  | 'hot_take';

const filterTabs: { key: FilterCategory; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'product_launch', label: 'Launches' },
  { key: 'feature', label: 'Features' },
  { key: 'tips', label: 'Tips' },
  { key: 'announcement', label: 'News' },
  { key: 'drama', label: 'Drama' },
  { key: 'hot_take', label: 'Hot Takes' },
];

const SWIPE_THRESHOLD = 50;
const PULL_THRESHOLD = 60;
const SCROLL_DIRECTION_THRESHOLD = 2;

const tabEmojis: Record<FilterCategory, string[]> = {
  ALL: ['🚀', '⚡', '🔥', '💡', '🤖', '🧠', '💻', '🎯', '⭐', '🔮'],
  product_launch: ['🚀', '🎉', '🆕', '📦', '🏗️', '🛠️', '✨', '🎁'],
  feature: ['⚙️', '🔧', '💎', '🧩', '🔌', '📐', '🎨', '✨'],
  tips: ['💡', '📝', '🎓', '🧪', '📖', '🔑', '✅', '🏆'],
  announcement: ['📢', '📰', '🗞️', '🔔', '📣', '🌐', '📡', '🏷️'],
  drama: ['🔥', '💥', '🍿', '😱', '⚠️', '🌪️', '💣', '👀'],
  hot_take: ['🌶️', '♨️', '💬', '🗣️', '🤔', '😤', '🎤', '💭'],
};

interface EmojiParticle {
  id: number;
  emoji: string;
  x: number;
  y: number;
}

const AiCodingHubPage = (): ReactElement => {
  const router = useRouter();
  const { windowLoaded } = useContext(ProgressiveEnhancementContext);
  const isMobile = useViewSize(ViewSize.MobileL);
  const showNav = windowLoaded && isMobile;
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('ALL');
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [emojiParticles, setEmojiParticles] = useState<EmojiParticle[]>([]);
  const [showFlash, setShowFlash] = useState(false);
  const [logoGlow, setLogoGlow] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [showNewPostsBar, setShowNewPostsBar] = useState(false);
  const lastScrollY = useRef(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const touchStartY = useRef(0);
  const isPulling = useRef(false);
  const emojiIdCounter = useRef(0);
  const lastEmojiSpawn = useRef(0);
  const pullStartTime = useRef(0);
  const pullCommitted = useRef(false);

  const activeIndex = filterTabs.findIndex((t) => t.key === activeCategory);

  const switchTab = useCallback((direction: 'left' | 'right') => {
    const nextIndex = direction === 'left'
      ? Math.min(activeIndex + 1, filterTabs.length - 1)
      : Math.max(activeIndex - 1, 0);

    if (nextIndex === activeIndex) {
      return;
    }

    setSlideDirection(direction);
    setTimeout(() => {
      setActiveCategory(filterTabs[nextIndex].key);
      setSlideDirection(null);
    }, 200);
  }, [activeIndex]);

  const spawnEmoji = useCallback(() => {
    const emojis = tabEmojis[activeCategory];
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];
    const angle = Math.random() * Math.PI * 2;
    const radius = 120 + Math.random() * 100;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    emojiIdCounter.current += 1;
    const particle: EmojiParticle = {
      id: emojiIdCounter.current,
      emoji,
      x,
      y,
    };

    setEmojiParticles((prev) => [...prev, particle]);
    setTimeout(() => {
      setEmojiParticles((prev) => prev.filter((p) => p.id !== particle.id));
    }, 1000);
  }, [activeCategory]);

  const scrollToTop = useCallback(() => {
    setHeaderVisible(true);
    setShowNewPostsBar(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // All touch handlers as passive listeners so they don't block mobile scrolling
  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
      touchEndX.current = e.touches[0].clientX;
      if (window.scrollY === 0 && !isRefreshing) {
        isPulling.current = true;
        pullCommitted.current = false;
        pullStartTime.current = Date.now();
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      touchEndX.current = e.touches[0].clientX;

      if (!isPulling.current || isRefreshing) {
        return;
      }

      const deltaY = e.touches[0].clientY - touchStartY.current;

      if (!pullCommitted.current) {
        if (deltaY > 15 && window.scrollY === 0) {
          pullCommitted.current = true;
        } else {
          return;
        }
      }

      if (deltaY > 0 && window.scrollY === 0) {
        const dist = Math.min((deltaY - 15) * 0.4, 120);
        setPullDistance(Math.max(0, dist));

        const now = Date.now();
        const elapsed = now - pullStartTime.current;
        if (elapsed > 800) {
          const spawnInterval = Math.max(60, 300 - dist * 2);
          if (now - lastEmojiSpawn.current > spawnInterval) {
            lastEmojiSpawn.current = now;
            spawnEmoji();
          }
        }
      }
    };

    const onTouchEnd = () => {
      const diffX = touchStartX.current - touchEndX.current;
      if (Math.abs(diffX) >= SWIPE_THRESHOLD) {
        switchTab(diffX > 0 ? 'left' : 'right');
      }

      if (pullDistance >= PULL_THRESHOLD && !isRefreshing) {
        setIsRefreshing(true);
        setPullDistance(PULL_THRESHOLD);
        setTimeout(() => {
          setIsRefreshing(false);
          setPullDistance(0);
          setEmojiParticles([]);
          setShowFlash(true);
          setLogoGlow(true);
          setTimeout(() => setShowFlash(false), 400);
          setTimeout(() => setLogoGlow(false), 800);
        }, 1000);
      } else {
        setPullDistance(0);
        setEmojiParticles([]);
      }
      isPulling.current = false;
    };

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [isRefreshing, spawnEmoji, switchTab, pullDistance]);

  // Hide header/tabs on scroll down, show on scroll up
  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;
      const deltaY = currentY - lastScrollY.current;

      if (currentY < 120) {
        setShowNewPostsBar(false);
      } else if (deltaY > SCROLL_DIRECTION_THRESHOLD) {
        setShowNewPostsBar(true);
      }

      if (Math.abs(deltaY) < SCROLL_DIRECTION_THRESHOLD) {
        return;
      }

      if (deltaY < 0) {
        setHeaderVisible(true);
        lastScrollY.current = currentY;
        return;
      }

      if (currentY > 50) {
        setHeaderVisible(false);
        lastScrollY.current = currentY;
        return;
      }

      setHeaderVisible(true);
      lastScrollY.current = currentY;
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Disable native overscroll bounce for this page
  useEffect(() => {
    const html = document.documentElement;
    const { body } = document;
    html.style.overscrollBehavior = 'none';
    body.style.overscrollBehavior = 'none';

    return () => {
      html.style.overscrollBehavior = '';
      body.style.overscrollBehavior = '';
    };
  }, []);

  // Hide browser scrollbar UI while keeping scroll behavior.
  useEffect(() => {
    const html = document.documentElement;
    const { body } = document;
    const pageClass = 'ai-hub-hide-scrollbar';
    const style = document.createElement('style');
    style.setAttribute('data-ai-hub-hide-scrollbar', 'true');
    style.textContent = `
      html.${pageClass},
      body.${pageClass} {
        scrollbar-width: none;
        -ms-overflow-style: none;
      }
      html.${pageClass}::-webkit-scrollbar,
      body.${pageClass}::-webkit-scrollbar {
        display: none;
        width: 0;
        height: 0;
      }
    `;

    html.classList.add(pageClass);
    body.classList.add(pageClass);
    document.head.append(style);

    return () => {
      html.classList.remove(pageClass);
      body.classList.remove(pageClass);
      style.remove();
    };
  }, []);

  // Hide third-party floating feedback bubble on this page.
  useEffect(() => {
    const style = document.createElement('style');
    style.setAttribute('data-ai-hub-hide-qd-widget', 'true');
    style.textContent = `
      .t.qd-parent-container,
      .qd-parent-container,
      .t.qd-transition-container,
      .t.qd-open-btn-container {
        display: none !important;
        visibility: hidden !important;
        pointer-events: none !important;
      }
    `;
    document.head.append(style);

    return () => {
      style.remove();
    };
  }, []);

  const filteredFeedItems = useMemo(() => {
    if (activeCategory === 'ALL') {
      return feedItems;
    }
    return feedItems.filter((item) => item.category === activeCategory);
  }, [activeCategory]);

  return (
    <div className="flex w-full justify-center">
    <div className="relative min-h-page w-full max-w-[540px] bg-background-default" style={{ overscrollBehavior: 'none' }}>
      <NextSeo
        title="Sentinel // daily.dev"
        description="Don't fall behind. The AI coding signals that matter."
      />

      {/* Header + Tabs (sticky block) */}
      <div
        className={classNames(
          'sticky top-0 z-[74] isolate w-full border-x border-b border-border-subtlest-tertiary bg-background-default backdrop-blur-sm transition-transform duration-300 laptop:top-16',
          !headerVisible && '-translate-y-full',
        )}
      >
        {/* Mobile + Tablet: daily.dev logo + streaks row (laptop+ uses global header) */}
        <div className="border-b border-border-subtlest-tertiary laptop:hidden">
          <MobileFeedActions />
        </div>

        <header>
          <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3">
            <Typography
              type={TypographyType.Title3}
              bold
              className={classNames(
                'flex-shrink-0 transition-all duration-500',
                logoGlow && 'logo-glow-pulse',
              )}
            >
              Sentinel
            </Typography>
            <div className="min-w-0 flex-1 overflow-hidden text-xs flex justify-end">
              <SmartStatusBar />
            </div>
          </div>
        </header>

        {/* Category Filters */}
        <div className="relative bg-background-default">
          <div className="no-scrollbar mx-auto flex max-w-4xl gap-5 overflow-x-auto px-4 py-2">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveCategory(tab.key)}
                className={classNames(
                  'relative flex-shrink-0 pb-2 transition-colors duration-200',
                  activeCategory === tab.key
                    ? 'text-text-primary'
                    : 'text-text-quaternary hover:text-text-tertiary',
                )}
                style={{ fontSize: '15px' }}
              >
                {tab.label}
                {activeCategory === tab.key && (
                  <span className="absolute bottom-0 left-0 right-0 h-px bg-text-primary" />
                )}
              </button>
            ))}
          </div>
          {showFlash && (
            <div className="tab-glow-explosion pointer-events-none absolute bottom-0 left-0 right-0 h-8" />
          )}
        </div>
      </div>

      {showNewPostsBar && !headerVisible && (
        <button
          type="button"
          className="fixed left-1/2 top-3 z-[85] -translate-x-1/2 rounded-8 bg-accent-cabbage-default px-3 py-1.5 text-sm font-bold text-text-primary shadow-2 transition-all hover:bg-accent-cabbage-default"
          onClick={scrollToTop}
        >
          2 new posts ↑
        </button>
      )}


      <div className="mx-auto max-w-4xl">
        {/* Feed */}
        <div className="mx-auto max-w-[540px] overflow-x-hidden border-x border-border-subtlest-tertiary">
          {/* Black hole pull-to-refresh */}
          <div
            className="relative z-0 flex items-center justify-center overflow-visible transition-all duration-200"
            style={{ height: pullDistance > 0 ? `${pullDistance}px` : 0 }}
          >
            {/* Black hole core */}
            <div
              className={classNames(
                'relative rounded-full bg-black',
                isRefreshing && 'blackhole-core',
              )}
              style={{
                width: `${Math.max(12, Math.min(pullDistance * 0.35, 36))}px`,
                height: `${Math.max(12, Math.min(pullDistance * 0.35, 36))}px`,
                opacity: Math.min(pullDistance / PULL_THRESHOLD, 1),
                boxShadow: `0 0 ${Math.min(pullDistance * 0.2, 16)}px ${Math.min(pullDistance * 0.1, 6)}px rgba(255,255,255,0.2), inset 0 0 ${Math.min(pullDistance * 0.1, 8)}px rgba(255,255,255,0.1)`,
                transition: isRefreshing ? 'all 0.3s ease' : 'none',
              }}
            />
            {/* Emoji particles spiraling into the black hole */}
            {emojiParticles.map((p) => (
              <span
                key={p.id}
                className="emoji-particle"
                style={{
                  '--start-x': `${p.x}px`,
                  '--start-y': `${p.y}px`,
                  fontSize: '28px',
                  left: '50%',
                  top: '50%',
                  marginLeft: '-14px',
                  marginTop: '-14px',
                } as React.CSSProperties}
              >
                {p.emoji}
              </span>
            ))}
          </div>
          {/* Flash on complete */}
          {showFlash && (
            <div className="refresh-flash-overlay pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-b from-white/30 to-transparent" />
          )}
          <div
            className={classNames(
              'relative z-0 flex flex-col transition-all duration-200',
              slideDirection === 'left' && '-translate-x-4 opacity-0',
              slideDirection === 'right' && 'translate-x-4 opacity-0',
              !slideDirection && 'translate-x-0 opacity-100',
            )}
          >
            {filteredFeedItems.length > 0 ? (
              filteredFeedItems.map((item, index) => (
                <SignalCard
                  key={item.id}
                  item={item}
                  showJustIn={activeCategory === 'ALL' && index < 2}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 py-16">
                <Typography color={TypographyColor.Quaternary}>
                  No signals in this category yet
                </Typography>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border-subtlest-tertiary px-4 py-4">
          <Typography
            type={TypographyType.Caption2}
            color={TypographyColor.Quaternary}
          >
            Curated from Twitter, GitHub, and the dev community. Updated daily.
          </Typography>
        </div>
      </div>

      {/* Bottom spacer for navbar */}
      {showNav && <div className="h-16" />}

      {/* Bottom navbar */}
      {showNav && (
        <div
          className={classNames(
            'fixed bottom-0 left-0 z-30 w-full bg-gradient-to-t from-background-subtle from-70% to-transparent px-2 pt-2 transition-transform duration-300',
            !headerVisible && 'translate-y-full',
          )}
        >
          <MobileFooterNavbar />
        </div>
      )}
    </div>
    </div>
  );
};

AiCodingHubPage.getLayout = getLayout;
AiCodingHubPage.layoutProps = {
  screenCentered: true,
};

export default AiCodingHubPage;
