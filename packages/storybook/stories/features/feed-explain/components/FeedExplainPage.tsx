import type { MouseEvent, ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
import classNames from 'classnames';
import { fn } from 'storybook/test';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { Switch } from '@dailydotdev/shared/src/components/fields/Switch';
import { FilterIcon } from '@dailydotdev/shared/src/components/icons/Filter';
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
import { PersonalizationPanel } from './PersonalizationPanel';
import { ChangesDock } from './ChangesDock';

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
const CardHead = ({
  decision,
  layout,
  isLeaving,
}: {
  decision: Decision;
  layout: FeedLayout;
  isLeaving: boolean;
}): ReactElement => {
  const isGrid = layout === FeedLayout.Grid;
  const { post } = decision;
  const position = (
    <span
      className="ml-auto shrink-0 tabular-nums text-text-quaternary typo-footnote"
      title={
        decision.lane === Lane.Popular
          ? 'Place on the page, from the popular lane'
          : 'Place on the page'
      }
    >
      #{decision.position}
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

interface CardFrameProps {
  decision: Decision;
  leaving?: Decision;
  index: number;
  layout: FeedLayout;
  isExplain: boolean;
}

export const CardFrame = ({
  decision,
  leaving,
  index,
  layout,
  isExplain,
}: CardFrameProps): ReactElement => {
  const isLeaving = isExplain && !!leaving;
  const isGrid = layout === FeedLayout.Grid;
  const { post } = decision;

  // The real card stays underneath so the feed keeps every size and gap; the
  // overlay covers it with the explanation.
  return (
    <div
      className={classNames(
        'relative rounded-16',
        isGrid && 'h-full max-h-cardLarge',
      )}
    >
      <div className={isGrid ? 'h-full' : undefined} aria-hidden={isExplain}>
        {isGrid ? (
          <ArticleGrid post={post} {...cardHandlers} />
        ) : (
          <ArticleList post={post} {...cardHandlers} />
        )}
      </div>
      <div
        className={classNames(
          'absolute inset-0 z-2 flex flex-col rounded-16 border-border-subtlest-tertiary transition-[opacity,visibility] duration-300 ease-out',
          isGrid
            ? 'overflow-hidden border bg-background-subtle'
            : 'border-t bg-background-default',
          isExplain ? 'visible opacity-100' : 'invisible opacity-0',
        )}
        style={{ transitionDelay: isExplain ? `${(index % 8) * 30}ms` : '0ms' }}
      >
        {isExplain && (
          <>
            {!isGrid && (
              <TypeLabel type={post.type} className="absolute left-3" />
            )}
            <CardHead
              decision={decision}
              layout={layout}
              isLeaving={isLeaving}
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

const FeedExplainScreen = ({
  layout,
  isExplain,
  onToggleExplain,
}: {
  layout: FeedLayout;
  isExplain: boolean;
  onToggleExplain: () => void;
}): ReactElement => {
  const { served, pool, state, pendingCount, refresh } = usePersonalization();
  const { onOpenControls } = useFeedScreen();
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
          getExclusion(decision, pool, state),
        ]),
      ),
    [served, pool, state],
  );

  return (
    <div
      className={classNames(
        'flex min-h-screen flex-col bg-background-default',
        isList ? 'gap-4 px-4 py-4' : 'gap-6 px-6 py-6 laptop:px-10',
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
          isList
            ? 'grid-cols-1 gap-2'
            : 'grid-cols-1 gap-8 tablet:grid-cols-2 laptop:grid-cols-3 laptopL:grid-cols-4',
        )}
      >
        {served.map((decision, index) => (
          <CardFrame
            key={decision.post.id}
            decision={decision}
            leaving={leaving.get(decision.post.id)}
            index={index}
            layout={layout}
            isExplain={isExplain}
          />
        ))}
      </div>
      {isExplain && (
        <ChangesDock
          defaultMessage="Follow, block, or tune any topic."
          primaryLabel={refreshLabel}
          onPrimary={pendingCount ? refresh : onToggleExplain}
          onOpenControls={onOpenControls && (() => onOpenControls())}
          isCompact={isList}
        />
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
}

const App = ({
  layout,
  initialExplain = false,
  initialView = AppView.Feed,
  initialSection,
  initialDetailsId,
}: AppProps): ReactElement => {
  const store = usePersonalization();
  const [view, setView] = useState(initialView);
  const [section, setSection] = useState(initialSection);
  const [isExplain, setIsExplain] = useState(initialExplain);
  const [details, setDetails] = useState<Decision | null>(
    () => store.served.find(({ post }) => post.id === initialDetailsId) ?? null,
  );
  const screen = useMemo(
    () => ({
      onOpenDetails: setDetails,
      onOpenControls: (nextSection?: ControlSection) => {
        setSection(nextSection);
        setView(AppView.Controls);
        window.scrollTo({ top: 0 });
      },
    }),
    [],
  );

  const onToggleExplain = () => {
    if (isExplain && store.pendingCount) {
      store.refresh();
    }
    setIsExplain(!isExplain);
  };

  const onBack = () => {
    if (store.pendingCount) {
      store.refresh();
    }
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
          />
        ) : (
          <PersonalizationPanel
            key={section}
            section={section}
            isCompact={layout === FeedLayout.List}
            onBack={onBack}
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
