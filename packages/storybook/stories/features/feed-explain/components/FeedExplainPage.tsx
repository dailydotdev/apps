import type { MouseEvent, ReactElement } from 'react';
import React, { useContext, useMemo, useState } from 'react';
import classNames from 'classnames';
import { fn } from 'storybook/test';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { Switch } from '@dailydotdev/shared/src/components/fields/Switch';
import { FilterIcon } from '@dailydotdev/shared/src/components/icons/Filter';
import { UndoIcon } from '@dailydotdev/shared/src/components/icons/Undo';
import { ArticleGrid } from '@dailydotdev/shared/src/components/cards/article/ArticleGrid';
import { ArticleList } from '@dailydotdev/shared/src/components/cards/article/ArticleList';
import { SourceAvatar } from '@dailydotdev/shared/src/components/profile/source/SourceAvatar';
import { ProfileImageSize } from '@dailydotdev/shared/src/components/ProfilePicture';
import type { ExplainedPost } from './feedExplain';
import { FeedReason, TuneLevel } from './feedExplain';
import type { TuningSeed } from './FeedTuningContext';
import {
  describeChange,
  FeedTuningProvider,
  useFeedTuning,
} from './FeedTuningContext';
import { ExplainPanel, ExplainVariant, SignalCountsContext } from './ExplainPanel';
import { ExplainBar } from './ExplainBar';

export enum FeedLayout {
  Grid = 'grid',
  List = 'list',
}

const cardHandlers = {
  onPostClick: fn(),
  onPostAuxClick: fn(),
  onUpvoteClick: fn(),
  onDownvoteClick: fn(),
  onCommentClick: fn(),
  onBookmarkClick: fn(),
  onShare: fn(),
  onCopyLinkClick: fn(),
  onReadArticleClick: fn(),
};

/** Card links point at app.daily.dev; keep the canvas on the story. */
const preventNavigation = (event: MouseEvent) => {
  if ((event.target as HTMLElement).closest('a')) {
    event.preventDefault();
  }
};

interface CardFrameProps {
  item: ExplainedPost;
  index: number;
  layout: FeedLayout;
  isExplain: boolean;
  initialExpanded?: boolean;
}

export const CardFrame = ({
  item,
  index,
  layout,
  isExplain,
  initialExpanded = false,
}: CardFrameProps): ReactElement => {
  const { focus, hoverKey, getLeaveReason } = useFeedTuning();
  const counts = useContext(SignalCountsContext);
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const isLeaving = isExplain && !!getLeaveReason(item);
  const isDimmed =
    isExplain && focus?.type === 'reason' && focus.reason !== item.reason;
  // Only worth pointing at when the signal is on more than this card.
  const isHighlighted =
    isExplain &&
    !!hoverKey &&
    (counts[hoverKey] ?? 0) > 1 &&
    item.signals.some(({ key }) => key === hoverKey);
  const frameClassName = classNames(
    'relative rounded-16 transition-[opacity,box-shadow] duration-200',
    isDimmed && 'opacity-30',
    isHighlighted &&
      'ring-2 ring-accent-cabbage-default ring-offset-2 ring-offset-background-default',
  );

  // A phone fits one list card per screen, so Explain trades the cover and
  // action bar for the reason, letting you triage a few posts per screen.
  if (layout === FeedLayout.List) {
    return (
      <div className={frameClassName}>
        {isExplain ? (
          <article className="flex flex-col rounded-16 border border-border-subtlest-tertiary bg-background-subtle px-4 pt-3">
            <div
              className={classNames(
                'flex flex-col gap-1 transition-opacity',
                isLeaving && 'opacity-40',
              )}
            >
              <span className="flex items-center gap-2 text-text-tertiary typo-footnote">
                <SourceAvatar
                  source={item.post.source}
                  size={ProfileImageSize.Small}
                  className="!mr-0"
                />
                <span className="min-w-0 shrink truncate">
                  {item.post.source?.name}
                </span>
              </span>
              <h3 className="line-clamp-2 font-bold text-text-primary typo-body">
                {item.post.title}
              </h3>
            </div>
            <ExplainPanel
              item={item}
              variant={ExplainVariant.List}
              isExpanded={isExpanded}
              onToggleExpanded={() => setIsExpanded((value) => !value)}
            />
          </article>
        ) : (
          <ArticleList post={item.post} {...cardHandlers} />
        )}
      </div>
    );
  }

  return (
    <div className={classNames(frameClassName, 'h-full max-h-cardLarge')}>
      <div
        className={classNames('h-full transition-opacity', isLeaving && 'opacity-40')}
        aria-hidden={isExplain}
      >
        <ArticleGrid post={item.post} {...cardHandlers} />
      </div>
      <div
        className={classNames(
          'absolute inset-x-px bottom-px z-2 overflow-hidden border-border-subtlest-tertiary bg-background-subtle ease-out [transition-property:top,opacity,transform,visibility] duration-300',
          // Covers the cover image and action bar, which keep a fixed height
          // at the bottom of every grid card.
          isExpanded && !isLeaving
            ? 'top-px rounded-16'
            : 'top-[calc(100%-12.75rem)] rounded-b-16 border-t',
          isExplain
            ? 'visible translate-y-0 opacity-100'
            : 'invisible translate-y-3 opacity-0',
        )}
        style={{ transitionDelay: isExplain ? `${(index % 8) * 30}ms` : '0ms' }}
      >
        <ExplainPanel
          item={item}
          variant={ExplainVariant.Grid}
          isExpanded={isExpanded}
          onToggleExpanded={() => setIsExpanded((value) => !value)}
        />
      </div>
    </div>
  );
};

const FeedTab = ({
  label,
  isActive,
}: {
  label: string;
  isActive?: boolean;
}): ReactElement => (
  <span
    className={classNames(
      'flex h-10 items-center rounded-12 px-3 font-bold typo-callout',
      isActive ? 'bg-surface-float text-text-primary' : 'text-text-tertiary',
    )}
  >
    {label}
  </span>
);

interface FeedHeaderProps {
  layout: FeedLayout;
  isExplain: boolean;
  onToggleExplain: () => void;
}

const FeedHeader = ({
  layout,
  isExplain,
  onToggleExplain,
}: FeedHeaderProps): ReactElement => {
  const isList = layout === FeedLayout.List;

  return (
    <header className="flex items-center justify-between gap-3">
      {isList ? (
        <h1 className="font-bold text-text-primary typo-title2">For You</h1>
      ) : (
        <nav className="flex items-center gap-1" aria-label="Feeds">
          <FeedTab label="For You" isActive />
          <FeedTab label="Following" />
          <FeedTab label="Popular" />
          <FeedTab label="Explore" />
        </nav>
      )}
      <div className="flex items-center gap-3">
        <Switch
          inputId="feed-explain"
          name="feed-explain"
          checked={isExplain}
          onToggle={onToggleExplain}
          compact={false}
          title="See why each post is here and fix what's off"
        >
          Explain
        </Switch>
        <Button
          type="button"
          variant={ButtonVariant.Float}
          size={ButtonSize.Medium}
          icon={<FilterIcon />}
          aria-label="Feed settings"
        >
          {isList ? undefined : 'Feed settings'}
        </Button>
      </div>
    </header>
  );
};

interface DockProps {
  message: string;
  canUndo: boolean;
  hasChanges: boolean;
  onUndo: () => void;
  onRefresh: () => void;
  onDone: () => void;
}

const ExplainDock = ({
  message,
  canUndo,
  hasChanges,
  onUndo,
  onRefresh,
  onDone,
}: DockProps): ReactElement => (
  <div className="pointer-events-none sticky bottom-4 z-3 mt-8 flex justify-center tablet:bottom-6">
    <div
      role="status"
      className="pointer-events-auto flex w-full max-w-[36rem] items-center gap-2 rounded-16 border border-border-subtlest-tertiary bg-background-popover p-2 pl-4 shadow-2"
    >
      <span className="min-w-0 flex-1 text-text-primary typo-callout">
        {message}
      </span>
      {canUndo && (
        <Button
          type="button"
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
          icon={<UndoIcon />}
          onClick={onUndo}
        >
          Undo
        </Button>
      )}
      <Button
        type="button"
        variant={ButtonVariant.Primary}
        size={ButtonSize.Small}
        onClick={hasChanges ? onRefresh : onDone}
      >
        {hasChanges ? 'Refresh feed' : 'Done'}
      </Button>
    </div>
  </div>
);

interface FeedExplainScreenProps {
  items: ExplainedPost[];
  reserve: ExplainedPost[];
  layout: FeedLayout;
  initialExplain?: boolean;
}

const FeedExplainScreen = ({
  items: initialItems,
  reserve: initialReserve,
  layout,
  initialExplain = false,
}: FeedExplainScreenProps): ReactElement => {
  const tuning = useFeedTuning();
  const { changes, getLeaveReason, getBoost } = tuning;
  const [isExplain, setIsExplain] = useState(initialExplain);
  const [items, setItems] = useState(initialItems);
  const [reserve, setReserve] = useState(initialReserve);
  const [notice, setNotice] = useState<string | null>(null);
  const isList = layout === FeedLayout.List;

  const rank = useMemo(
    () =>
      new Map(
        [...initialItems, ...initialReserve].map((item, index) => [
          item.post.id,
          index,
        ]),
      ),
    [initialItems, initialReserve],
  );
  const counts = useMemo(() => {
    const byKey: Record<string, number> = {};
    items.forEach(({ signals }) =>
      signals.forEach(({ key }) => {
        byKey[key] = (byKey[key] ?? 0) + 1;
      }),
    );
    return byKey;
  }, [items]);

  const refresh = () => {
    const score = (item: ExplainedPost) =>
      getBoost(item) * 4 - (rank.get(item.post.id) ?? 0);
    const byScore = (a: ExplainedPost, b: ExplainedPost) => score(b) - score(a);
    const staying = items.filter((item) => !getLeaveReason(item));
    const candidates = reserve
      .filter((item) => !getLeaveReason(item))
      .sort(byScore);
    const boosted = candidates.filter((item) => getBoost(item) > 0);
    // Posts you asked for more of take the popular picks' slots first.
    const replaceable = staying
      .filter(
        (item) => item.reason === FeedReason.Popular && getBoost(item) <= 0,
      )
      .reverse()
      .slice(0, boosted.length);
    const kept = staying.filter((item) => !replaceable.includes(item));
    const incoming = candidates.slice(0, items.length - kept.length);

    setItems([...kept, ...incoming].sort(byScore));
    setReserve(reserve.filter((item) => !incoming.includes(item)));
    tuning.commit();
    tuning.setFocus(null);
    const outCount = items.length - kept.length;
    setNotice(
      outCount
        ? `Feed refreshed: ${outCount} ${
            outCount === 1 ? 'post' : 'posts'
          } out, ${incoming.length} new in.`
        : 'Feed refreshed with your changes.',
    );
  };

  const onToggleExplain = () => {
    if (isExplain && changes.length) {
      refresh();
    }
    tuning.setFocus(null);
    tuning.setHoverKey(null);
    setNotice(null);
    setIsExplain(!isExplain);
  };

  const lastChange = changes[changes.length - 1];
  const getDockMessage = (): string => {
    if (!lastChange) {
      return notice ?? 'Tune anything that looks off. Changes save as you go.';
    }
    const message = describeChange(lastChange);
    if (lastChange.type === 'level' && lastChange.to === TuneLevel.Blocked) {
      const leaving = items.filter((item) => {
        const reason = getLeaveReason(item);
        return (
          reason?.type === 'blocked' &&
          reason.signal.key === lastChange.signal.key
        );
      }).length;
      return leaving
        ? `${message} ${leaving} ${
            leaving === 1 ? 'post leaves' : 'posts leave'
          } on refresh.`
        : message;
    }
    return message;
  };

  return (
    <SignalCountsContext.Provider value={counts}>
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div
        className={classNames(
          'flex min-h-screen flex-col bg-background-default',
          isList ? 'gap-4 px-4 py-4' : 'gap-6 px-6 py-6 laptop:px-10',
        )}
        onClickCapture={preventNavigation}
      >
        <FeedHeader
          layout={layout}
          isExplain={isExplain}
          onToggleExplain={onToggleExplain}
        />
        {isExplain && (
          <ExplainBar items={items} isCompact={isList} onPickTopics={fn()} />
        )}
        <div
          className={classNames(
            'grid',
            isList
              ? 'grid-cols-1 gap-2'
              : 'grid-cols-1 gap-8 tablet:grid-cols-2 laptop:grid-cols-3 laptopL:grid-cols-4',
          )}
        >
          {items.map((item, index) => (
            <CardFrame
              key={item.post.id}
              item={item}
              index={index}
              layout={layout}
              isExplain={isExplain}
            />
          ))}
        </div>
        {isExplain && (
          <ExplainDock
            message={getDockMessage()}
            canUndo={changes.length > 0}
            hasChanges={changes.length > 0}
            onUndo={tuning.undo}
            onRefresh={refresh}
            onDone={onToggleExplain}
          />
        )}
      </div>
    </SignalCountsContext.Provider>
  );
};

export interface FeedExplainPageProps extends FeedExplainScreenProps {
  seed?: TuningSeed;
}

export const FeedExplainPage = ({
  seed,
  ...props
}: FeedExplainPageProps): ReactElement => (
  <FeedTuningProvider seed={seed}>
    <FeedExplainScreen {...props} />
  </FeedTuningProvider>
);
