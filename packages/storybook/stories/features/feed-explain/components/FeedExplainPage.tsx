import type { MouseEvent, ReactElement } from 'react';
import React, { useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import { fn } from 'storybook/test';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import {
  generateQueryKey,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { Switch } from '@dailydotdev/shared/src/components/fields/Switch';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons/Arrow';
import { FilterIcon } from '@dailydotdev/shared/src/components/icons/Filter';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { ArticleGrid } from '@dailydotdev/shared/src/components/cards/article/ArticleGrid';
import { ArticleList } from '@dailydotdev/shared/src/components/cards/article/ArticleList';
import { SourceAvatar } from '@dailydotdev/shared/src/components/profile/source/SourceAvatar';
import { AuthorSourceStack } from '@dailydotdev/shared/src/components/cards/common/AuthorSourceStack';
import { TypeLabel } from '@dailydotdev/shared/src/components/cards/common/list/TypeLabel';
import { ProfileImageSize } from '@dailydotdev/shared/src/components/ProfilePicture';
import type { Decision, PersonalizationState } from '../policy/rank';
import { getExclusion, Lane } from '../policy/rank';
import {
  PersonalizationProvider,
  usePersonalization,
} from './PersonalizationContext';
import type { ControlSection } from './FeedScreenContext';
import { FeedScreenContext, useFeedScreen } from './FeedScreenContext';
import { ExplainPanel, ExplainVariant } from './ExplainPanel';
import { ExplainDetailsModal } from './ExplainDetails';
import { FeedSettingsScreen } from './settings/FeedSettingsScreen';
import type { FeedSettingsPage } from './settings/pages';
import { sectionPage } from './settings/pages';
import { rankingControls, tuneTabs } from './settings/sections';
import { TunePanel } from './TunePanel';
import { ComplaintDock } from './ComplaintDock';
import { DownvoteFix } from './DownvoteFix';

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
export const preventNavigation = (event: MouseEvent): void => {
  if ((event.target as HTMLElement).closest('a')) {
    event.preventDefault();
  }
};

/**
 * In Explain mode a card keeps only where the post is from and its title,
 * drawn at the exact offsets the real card uses so nothing on it moves.
 */
const MovementBadge = ({
  movement,
}: {
  movement?: CardMovement;
}): ReactElement | null => {
  if (movement === 'new') {
    return (
      <span className="flex h-5 shrink-0 items-center rounded-6 bg-accent-avocado-flat px-1.5 font-bold text-accent-avocado-default typo-caption2">
        New
      </span>
    );
  }
  if (!movement) {
    return null;
  }
  const isUp = movement > 0;
  return (
    <span
      className={classNames(
        'flex shrink-0 items-center tabular-nums typo-footnote',
        isUp ? 'text-accent-avocado-default' : 'text-accent-bun-default',
      )}
      title={`Moved ${isUp ? 'up' : 'down'} ${Math.abs(movement)}`}
    >
      <ArrowIcon
        size={IconSize.Size16}
        className={isUp ? undefined : 'rotate-180'}
      />
      {Math.abs(movement)}
    </span>
  );
};

const CardHead = ({
  decision,
  layout,
  isLeaving,
  movement,
}: {
  decision: Decision;
  layout: FeedLayout;
  isLeaving: boolean;
  movement?: CardMovement;
}): ReactElement => {
  const isGrid = layout === FeedLayout.Grid;
  const { post } = decision;
  const position = (
    <span className="ml-auto flex shrink-0 items-center gap-2">
      <MovementBadge movement={movement} />
      <span
        className="tabular-nums text-text-quaternary typo-footnote"
        title={
          decision.lane === Lane.Popular
            ? 'Place on the page, from the popular lane'
            : 'Place on the page'
        }
      >
        #{decision.position}
      </span>
    </span>
  );

  return (
    <div
      className={classNames(
        'flex flex-col transition-opacity',
        isGrid ? 'mx-4 mt-4' : 'px-4 pt-6',
        isLeaving && 'opacity-40',
      )}
    >
      {isGrid ? (
        <span className="mb-1 flex h-8 items-center gap-2">
          <AuthorSourceStack author={post.author} source={post.source} />
          <span className="min-w-0 shrink truncate text-text-tertiary typo-footnote">
            {post.source?.name}
          </span>
          {position}
        </span>
      ) : (
        <span
          className={classNames(
            'mb-2 flex items-center gap-4',
            post.author ? 'h-9' : 'h-10',
          )}
        >
          {post.author ? (
            <AuthorSourceStack author={post.author} source={post.source} />
          ) : (
            <SourceAvatar
              source={post.source}
              size={ProfileImageSize.Large}
              className="!mr-0"
            />
          )}
          <span
            className={classNames(
              'min-w-0 shrink self-start truncate font-bold text-text-primary typo-footnote',
              !post.author && 'mt-0.5',
            )}
          >
            {post.source?.name}
          </span>
          {position}
        </span>
      )}
      <h3
        className={classNames(
          'line-clamp-3 break-words font-bold text-text-primary typo-title3',
          isGrid ? 'mt-2' : 'mr-4 mt-4',
        )}
      >
        {post.title}
      </h3>
    </div>
  );
};

/** Where Tune moved a card: new on the page, or places up (+) or down (-). */
type CardMovement = 'new' | number;

interface CardFrameProps {
  decision: Decision;
  leaving?: Decision;
  movement?: CardMovement;
  index: number;
  layout: FeedLayout;
  isExplain: boolean;
}

export const CardFrame = ({
  decision,
  leaving,
  movement,
  index,
  layout,
  isExplain,
}: CardFrameProps): ReactElement => {
  const { onStopAskingAfterDownvote } = useFeedScreen();
  const client = useQueryClient();
  const { user } = useAuthContext();
  const [isDownvoted, setIsDownvoted] = useState(false);
  const [isFixOpen, setIsFixOpen] = useState(false);
  const isLeaving = isExplain && !!leaving;
  const isGrid = layout === FeedLayout.Grid;
  const isFixing = isFixOpen && !isExplain;
  const { post } = decision;
  const handlers = {
    ...cardHandlers,
    // The fix card replaces the card's "Don't show me posts from..." panel,
    // which the card opens on its own before this runs.
    onDownvoteClick: () => {
      client.setQueryData(
        generateQueryKey(RequestKey.Post, user, `block:${post.id}`),
        (current: object) => ({ ...current, showTagsPanel: undefined }),
      );
      setIsDownvoted(!isDownvoted);
      setIsFixOpen(!isDownvoted && !!onStopAskingAfterDownvote);
    },
  };

  // The real card stays underneath so the feed keeps every size and gap; the
  // overlay covers it with the explanation, or with the fixes after a
  // downvote.
  return (
    <div
      data-explain-card={post.id}
      className={classNames(
        'relative rounded-16',
        isGrid && 'h-full max-h-cardLarge',
      )}
    >
      <div
        className={isGrid ? 'h-full' : undefined}
        aria-hidden={isExplain || isFixing}
      >
        {isGrid ? (
          <ArticleGrid post={post} {...handlers} />
        ) : (
          <ArticleList post={post} {...handlers} />
        )}
      </div>
      <div
        className={classNames(
          'absolute inset-0 z-2 flex flex-col rounded-16 border-border-subtlest-tertiary transition-[opacity,visibility] duration-300 ease-out',
          isGrid
            ? 'overflow-hidden border bg-background-subtle'
            : 'border-t bg-background-default',
          isExplain || isFixing ? 'visible opacity-100' : 'invisible opacity-0',
        )}
        style={{ transitionDelay: isExplain ? `${(index % 8) * 30}ms` : '0ms' }}
      >
        {isFixing && (
          <DownvoteFix
            decision={decision}
            isGrid={isGrid}
            onClose={() => setIsFixOpen(false)}
          />
        )}
        {isExplain && (
          <>
            {!isGrid && (
              <TypeLabel type={post.type} className="absolute left-3" />
            )}
            <CardHead
              decision={decision}
              layout={layout}
              isLeaving={isLeaving}
              movement={movement}
            />
            <ExplainPanel
              decision={decision}
              leaving={leaving}
              variant={isGrid ? ExplainVariant.Grid : ExplainVariant.List}
              className={classNames(
                'border-t border-border-subtlest-tertiary',
                isGrid ? 'mt-3' : 'mx-4 mt-4',
              )}
            />
          </>
        )}
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

const FeedHeader = ({
  layout,
  isExplain,
  onToggleExplain,
}: {
  layout: FeedLayout;
  isExplain: boolean;
  onToggleExplain: () => void;
}): ReactElement => {
  const { onOpenControls } = useFeedScreen();
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
          onClick={() => onOpenControls?.()}
        >
          {isList ? undefined : 'Feed settings'}
        </Button>
      </div>
    </header>
  );
};

interface TuneProps {
  tab: string;
  onTabChange: (tab: string) => void;
  onDone: () => void;
  onOpenSettings: (page: FeedSettingsPage) => void;
}

const FeedExplainScreen = ({
  layout,
  isExplain,
  onToggleExplain,
  onTune,
  tune,
}: {
  layout: FeedLayout;
  isExplain: boolean;
  onToggleExplain: () => void;
  onTune: () => void;
  /** Set while Tune is open: the page ranks live beside its controls. */
  tune?: TuneProps;
}): ReactElement => {
  const { served, next, pool, state, now, pendingCount, refresh } =
    usePersonalization();
  const isList = layout === FeedLayout.List;
  let refreshLabel = 'Done';
  if (pendingCount) {
    refreshLabel = isList ? 'Refresh' : 'Refresh feed';
  }
  const leaving = useMemo(
    () =>
      new Map(
        served.map((decision) => [
          decision.post.id,
          getExclusion(decision, pool, state, now),
        ]),
      ),
    [served, pool, state, now],
  );
  const positionBefore = useMemo(
    () => new Map(served.map(({ post, position }) => [post.id, position])),
    [served],
  );
  const decisions = tune ? next.served : served;
  const getMovement = ({ post, position }: Decision): CardMovement => {
    if (!positionBefore.has(post.id)) {
      return 'new';
    }
    return (positionBefore.get(post.id) ?? 0) - (position ?? 0);
  };

  return (
    <div className="flex min-h-screen bg-background-default">
      <div
        className={classNames(
          'flex min-w-0 flex-1 flex-col',
          isList ? 'gap-4 px-4 py-4' : 'gap-6 px-6 py-6 laptop:px-10',
          tune && (isList ? 'pb-[60vh]' : '@container'),
        )}
      >
        <FeedHeader
          layout={layout}
          isExplain={isExplain}
          onToggleExplain={onToggleExplain}
        />
        <div
          className={classNames(
            'grid',
            isList && 'grid-cols-1 gap-2',
            !isList &&
              (tune
                ? 'grid-cols-1 gap-8 @2xl:grid-cols-2 @4xl:grid-cols-3'
                : 'grid-cols-1 gap-8 tablet:grid-cols-2 laptop:grid-cols-3 laptopL:grid-cols-4'),
          )}
        >
          {decisions.map((decision, index) => (
            <CardFrame
              key={decision.post.id}
              decision={decision}
              leaving={tune ? undefined : leaving.get(decision.post.id)}
              movement={tune ? getMovement(decision) : undefined}
              index={index}
              layout={layout}
              isExplain={isExplain}
            />
          ))}
        </div>
        {isExplain && !tune && (
          <ComplaintDock
            primaryLabel={refreshLabel}
            onPrimary={pendingCount ? refresh : onToggleExplain}
            onTune={onTune}
            isCompact={isList}
          />
        )}
      </div>
      {tune && !isList && (
        <aside className="sticky top-0 h-screen w-[24rem] shrink-0 border-l border-border-subtlest-tertiary">
          <TunePanel {...tune} />
        </aside>
      )}
      {tune && isList && (
        <div className="fixed inset-x-0 bottom-0 z-3 h-[55vh] overflow-hidden rounded-t-16 border-t border-border-subtlest-tertiary shadow-2">
          <TunePanel {...tune} isSheet />
        </div>
      )}
    </div>
  );
};

export enum AppView {
  Feed = 'feed',
  Controls = 'controls',
}

interface AppProps {
  layout: FeedLayout;
  initialExplain?: boolean;
  initialView?: AppView;
  initialSection?: ControlSection;
  initialDetailsId?: string;
  /** Opens with Tune on this tab. */
  initialTune?: string;
}

const App = ({
  layout,
  initialExplain = false,
  initialView = AppView.Feed,
  initialSection,
  initialDetailsId,
  initialTune,
}: AppProps): ReactElement => {
  const store = usePersonalization();
  const storeRef = useRef(store);
  storeRef.current = store;
  const [view, setView] = useState(initialView);
  const [settingsPage, setSettingsPage] = useState(
    initialSection && sectionPage[initialSection],
  );
  const [isExplain, setIsExplain] = useState(initialExplain || !!initialTune);
  const [isAskingAfterDownvote, setIsAskingAfterDownvote] = useState(true);
  const [tuneTab, setTuneTab] = useState(initialTune);
  const tuneRef = useRef(tuneTab);
  tuneRef.current = tuneTab;
  const [details, setDetails] = useState<Decision | null>(
    () => store.served.find(({ post }) => post.id === initialDetailsId) ?? null,
  );
  // The page Tune compares against is the one served when it opens or closes.
  const refreshIfPending = () => {
    if (storeRef.current.pendingCount) {
      storeRef.current.refresh();
    }
  };
  const openSettings = (page?: FeedSettingsPage) => {
    setTuneTab(undefined);
    setSettingsPage(page);
    setView(AppView.Controls);
    window.scrollTo({ top: 0 });
  };
  const openTune = (tab: string) => {
    refreshIfPending();
    setTuneTab(tab);
    setIsExplain(true);
    setView(AppView.Feed);
    window.scrollTo({ top: 0 });
  };
  const closeTune = () => {
    refreshIfPending();
    setTuneTab(undefined);
  };
  const screen = useMemo(
    () => ({
      onOpenDetails: setDetails,
      // In Tune, a card's link to its controls opens their tab instead.
      onOpenControls: (nextSection?: ControlSection) => {
        const control = rankingControls.find(
          ({ section }) => section === nextSection,
        );
        if (tuneRef.current && control) {
          setTuneTab(control.tab);
          return;
        }
        openSettings(nextSection && sectionPage[nextSection]);
      },
      onExplainCard: (postId: string) => {
        setIsExplain(true);
        setTimeout(() =>
          document
            .querySelector(`[data-explain-card="${postId}"]`)
            ?.scrollIntoView({ block: 'center' }),
        );
      },
      onStopAskingAfterDownvote: isAskingAfterDownvote
        ? () => setIsAskingAfterDownvote(false)
        : undefined,
    }),
    // The setters and refs it uses never change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isAskingAfterDownvote],
  );

  const onToggleExplain = () => {
    if (isExplain) {
      refreshIfPending();
      setTuneTab(undefined);
    }
    setIsExplain(!isExplain);
  };

  const onBack = () => {
    refreshIfPending();
    setView(AppView.Feed);
    setIsExplain(true);
    window.scrollTo({ top: 0 });
  };

  return (
    <FeedScreenContext.Provider value={screen}>
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div onClickCapture={preventNavigation}>
        {view === AppView.Feed ? (
          <FeedExplainScreen
            layout={layout}
            isExplain={isExplain}
            onToggleExplain={onToggleExplain}
            onTune={() => openTune(tuneTabs[0])}
            tune={
              tuneTab
                ? {
                    tab: tuneTab,
                    onTabChange: setTuneTab,
                    onDone: closeTune,
                    onOpenSettings: openSettings,
                  }
                : undefined
            }
          />
        ) : (
          <FeedSettingsScreen
            initialPage={settingsPage}
            onBack={onBack}
            onTune={(page) =>
              openTune(
                rankingControls.find((control) => control.page === page)?.tab ??
                  tuneTabs[0],
              )
            }
          />
        )}
      </div>
      {details && (
        <ExplainDetailsModal
          key={details.post.id}
          decision={details}
          onClose={() => setDetails(null)}
        />
      )}
    </FeedScreenContext.Provider>
  );
};

export interface FeedExplainPageProps extends AppProps {
  pool: Post[];
  initialState: PersonalizationState;
}

export const FeedExplainPage = ({
  pool,
  initialState,
  ...props
}: FeedExplainPageProps): ReactElement => (
  <PersonalizationProvider pool={pool} initialState={initialState}>
    <App {...props} />
  </PersonalizationProvider>
);
