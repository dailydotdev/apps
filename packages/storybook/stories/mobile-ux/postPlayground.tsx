import type { ReactElement, ReactNode, UIEvent } from 'react';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { ShareIcon } from '@dailydotdev/shared/src/components/icons/Share';
import { MenuIcon } from '@dailydotdev/shared/src/components/icons/Menu';
import { LinkIcon } from '@dailydotdev/shared/src/components/icons/Link';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { BrowserChrome, Phone } from './kit';
import { CommentList, FeedList, PostArticle, ProposedHomeHeader } from './mocks';
import { CommentComposer } from './create';
import { BarMaterial } from './floating';
import { Circle, LeafTop, PostCluster, RootCluster, chromeSpec } from './chrome';
import { PostActionSheet, Sheet, SheetGroup, SheetRow } from './sheets';
import { useBlockProgress } from './scrollPages';
import { hideSpec } from './hide';
import { posts } from './data';

// An interactive post page: scroll it, tap every control, and read what
// happened. Every state a member can reach from the post page is here.
// The top block (back, share, menu) and the bottom cluster move on the one
// scroll progress every page uses (chapter 4e).

export enum PostState {
  Rest = 'rest',
  Reading = 'reading',
  Comment = 'comment',
  Share = 'share',
  Menu = 'menu',
  Home = 'home',
}

const post = posts[0];
const topBlock = chromeSpec.topButton + 14 + 12;

const explain: Record<PostState, { title: string; body: string }> = {
  [PostState.Rest]: {
    title: 'At rest',
    body: 'Page just opened or you scrolled up. The top block (back, share, menu) is shown, the engagement bar sits above the tab cluster. Scroll down to read.',
  },
  [PostState.Reading]: {
    title: 'Reading',
    body: 'Past the dead zone and 24px of downward travel, everything moves on one progress: the top block rides out as one solid piece, the tab bar slides down out of the screen and the action bar takes its slot, 44px tall and pulled in. Any 8px of upward scroll brings it all back, continuously; a stop snaps to the nearer end.',
  },
  [PostState.Comment]: {
    title: 'Comment composer',
    body: 'You tapped the comment icon. The full-page composer opens with the post as a compact card. Post or close returns you here and the new comment scrolls into view.',
  },
  [PostState.Share]: {
    title: 'Share sheet',
    body: 'You tapped share. One sheet with copy link, the system share sheet, and the social row. Same sheet from the top-right share button.',
  },
  [PostState.Menu]: {
    title: 'Options sheet',
    body: 'You tapped the top-right menu. The grouped action sheet from chapter 4b: seven rows visible, owner rows, then More.',
  },
  [PostState.Home]: {
    title: 'Back on Home',
    body: 'You tapped the back button top-left, or the Home tab after scrolling up to reveal the tab bar. Either way: back to the feed, scrolled where you left it, full cluster.',
  },
};

const ShareSheet = (): ReactElement => (
  <Sheet title="Share">
    <SheetGroup>
      <SheetRow icon={<LinkIcon size={IconSize.Medium} />} label="Copy link" />
      <SheetRow icon={<ShareIcon size={IconSize.Medium} />} label="Share via…" />
    </SheetGroup>
    <div className="flex gap-3 px-5 pt-2">
      {['X', 'LinkedIn', 'WhatsApp', 'Slack', 'Email'].map((name) => (
        <span key={name} className="flex w-14 flex-col items-center gap-1">
          <span className="flex size-12 items-center justify-center rounded-12 bg-surface-float font-bold typo-caption1">
            {name.slice(0, 2)}
          </span>
          <span className="text-text-tertiary typo-caption2">{name}</span>
        </span>
      ))}
    </div>
  </Sheet>
);

const PostScreen = ({
  material,
  forced,
  onProgress,
  onScrolled,
  overlay,
  onClose,
  onBack,
  onShare,
  onMenu,
  onComment,
  upvoted,
  bookmarked,
  onUpvote,
  onBookmark,
}: {
  material: BarMaterial;
  forced: number | null;
  onProgress: (p: number) => void;
  onScrolled: () => void;
  overlay?: ReactNode;
  onClose: () => void;
  onBack: () => void;
  onShare: () => void;
  onMenu: () => void;
  onComment: () => void;
  upvoted: boolean;
  bookmarked: boolean;
  onUpvote: () => void;
  onBookmark: () => void;
}): ReactElement => {
  const { p: scrolled, snapping, onScroll } = useBlockProgress(() => hideSpec.deadZone);
  const p = forced ?? scrolled;
  useEffect(() => onProgress(p), [p, onProgress]);
  const snapStyle = snapping
    ? 'transform 220ms cubic-bezier(0.2, 0, 0, 1)'
    : 'transform 140ms cubic-bezier(0.2, 0, 0, 1)';

  const handleScroll = (event: UIEvent<HTMLDivElement>): void => {
    onScrolled();
    onScroll(event);
  };

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div
        className="absolute inset-x-0 top-0 z-2"
        style={{ transform: `translateY(${-topBlock * p}px)`, transition: snapStyle }}
      >
        <div className="absolute inset-0 bg-background-default" />
        <div className="relative pt-2" style={{ height: topBlock }}>
          <LeafTop
            material={material}
            actions={
              <>
                <Circle material={material} fixed onClick={onShare}>
                  <ShareIcon size={IconSize.Medium} />
                </Circle>
                <Circle material={material} fixed onClick={onMenu}>
                  <MenuIcon size={IconSize.Small} />
                </Circle>
              </>
            }
          />
          <button type="button" aria-label="Back" onClick={onBack} className="absolute left-4 top-2 z-3 size-10 opacity-0" />
        </div>
      </div>
      <div onScroll={handleScroll} className="map-scroll-none min-h-0 flex-1 overflow-y-auto pb-36" style={{ paddingTop: topBlock }}>
        <PostArticle post={post} showReadCta />
        <CommentList />
        <CommentList />
      </div>
      <div className="absolute inset-x-0 bottom-2 z-2" style={{ transition: snapStyle }}>
        <PostCluster
          material={material}
          p={p}
          post={post}
          upvoted={upvoted}
          bookmarked={bookmarked}
          onUpvote={onUpvote}
          onBookmark={onBookmark}
          onComment={onComment}
          onShare={onShare}
        />
      </div>
      {overlay && (
        <div className="absolute inset-0 z-3">
          <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 h-1/3 w-full opacity-0" />
          {overlay}
        </div>
      )}
    </div>
  );
};

export const PostPlayground = ({
  material = BarMaterial.Glass,
}: {
  material?: BarMaterial;
}): ReactElement => {
  const [state, setState] = useState<PostState>(PostState.Rest);
  const [p, setP] = useState(0);
  const [forced, setForced] = useState<number | null>(null);
  const [epoch, setEpoch] = useState(0);
  const [upvoted, setUpvoted] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    setState((current) =>
      current === PostState.Rest || current === PostState.Reading ? (p > 0.5 ? PostState.Reading : PostState.Rest) : current,
    );
  }, [p]);

  const settle = (): PostState => (p > 0.5 ? PostState.Reading : PostState.Rest);

  const overlay = {
    [PostState.Comment]: <CommentComposer onClose={() => setState(settle())} />,
    [PostState.Share]: <ShareSheet />,
    [PostState.Menu]: <PostActionSheet />,
  }[state as PostState.Comment | PostState.Share | PostState.Menu];

  return (
    <div className="flex flex-wrap items-start gap-8">
      <Phone browser={BrowserChrome.None}>
        {state === PostState.Home ? (
          <div className="relative flex min-h-0 flex-1 flex-col">
            <div className="relative z-2 shrink-0">
              <ProposedHomeHeader />
            </div>
            <div className="map-scroll-none min-h-0 flex-1 overflow-hidden">
              <FeedList />
            </div>
            <div className="absolute inset-x-0 bottom-2 z-2">
              <RootCluster material={material} />
            </div>
            <button
              type="button"
              onClick={() => {
                setState(PostState.Rest);
                setForced(0);
                setEpoch((count) => count + 1);
              }}
              className="absolute inset-x-16 top-40 z-3 rounded-12 bg-text-primary px-4 py-3 text-center font-bold text-surface-invert typo-callout"
            >
              Open the post again
            </button>
          </div>
        ) : (
          <PostScreen
            key={epoch}
            material={material}
            forced={forced}
            onProgress={setP}
            onScrolled={() => setForced(null)}
            overlay={overlay}
            onClose={() => setState(settle())}
            onBack={() => setState(PostState.Home)}
            onShare={() => setState(PostState.Share)}
            onMenu={() => setState(PostState.Menu)}
            onComment={() => setState(PostState.Comment)}
            upvoted={upvoted}
            bookmarked={bookmarked}
            onUpvote={() => setUpvoted((value) => !value)}
            onBookmark={() => setBookmarked((value) => !value)}
          />
        )}
      </Phone>

      <div className="flex w-[22rem] flex-col gap-4">
        <div className="flex flex-col gap-1 rounded-16 border border-border-subtlest-tertiary p-4">
          <span className="uppercase tracking-[0.16em] text-text-quaternary typo-caption2">
            Current state
          </span>
          <span className="font-bold typo-title3">{explain[state].title}</span>
          <p className="text-text-secondary typo-footnote">{explain[state].body}</p>
          <span className="mt-2 text-text-quaternary typo-caption1">
            scroll progress p = {p.toFixed(2)} · upvoted {upvoted ? 'yes' : 'no'} · bookmarked{' '}
            {bookmarked ? 'yes' : 'no'}
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-text-tertiary typo-caption1">Jump to a state</span>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(explain) as PostState[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  if (key === PostState.Rest || key === PostState.Reading) {
                    setForced(key === PostState.Reading ? 1 : 0);
                  }
                  setState(key);
                }}
                className={classNames(
                  'rounded-10 border px-3 py-1.5 font-bold typo-footnote',
                  key === state
                    ? 'border-text-primary bg-text-primary text-surface-invert'
                    : 'border-border-subtlest-tertiary text-text-tertiary',
                )}
              >
                {explain[key].title}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2 rounded-16 bg-surface-float p-4 text-text-secondary typo-footnote">
          <span className="font-bold text-text-primary">What each control does</span>
          <span>Upvote: toggles, light haptic, count updates in place.</span>
          <span>Downvote: toggles; long-press opens Not interested.</span>
          <span>Comment: opens the full-page composer; tapping the count instead scrolls to the thread.</span>
          <span>Bookmark: toggles; long-press opens Move to folder.</span>
          <span>Share: the Share sheet (copy link inside).</span>
          <span>Scroll down: the top block rides out, the tab bar slides away and the action bar takes its place and shrinks, all on one progress.</span>
          <span>Scroll up any amount: everything returns, continuously.</span>
          <span>Back (top-left): the feed you came from, or the previous leaf if you arrived from one.</span>
        </div>
      </div>
    </div>
  );
};
