import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement, ReactNode, RefObject } from 'react';
import React, { useCallback, useEffect, useRef } from 'react';
import classNames from 'classnames';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SelectionShareBar } from '@dailydotdev/shared/src/components/post/SelectionShareBar';
import { getLogContextStatic } from '@dailydotdev/shared/src/contexts/LogContext';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import {
  FeaturesReadyContext,
  GrowthBookProvider,
} from '@dailydotdev/shared/src/components/GrowthBookProvider';
import { BootApp } from '@dailydotdev/shared/src/lib/boot';
import type { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { fn } from 'storybook/test';

const mockUser = {
  id: '1',
  name: 'Test User',
  username: 'testuser',
  email: 'test@example.com',
  image: 'https://daily-now-res.cloudinary.com/image/upload/placeholder.jpg',
  providers: ['google'],
  createdAt: '2024-01-01T00:00:00.000Z',
  permalink: 'https://daily.dev/testuser',
} as unknown as LoggedUser;

const post = {
  id: 'post-1',
  title: 'How to ship fast without breaking everything',
  commentsPermalink: 'https://daily.dev/posts/how-to-ship-fast',
  permalink: 'https://daily.dev/r/how-to-ship-fast',
  source: { id: 'daily', name: 'daily.dev', handle: 'daily' },
  author: { id: '1', name: 'Ido Shamun' },
} as unknown as Post;

const paragraph =
  'Shipping fast is not about typing faster. It is about shrinking the distance between a decision and the moment a real developer feels its effect.';

const secondParagraph =
  'Every layer between those two points is either helping or in the way, and most of them are in the way. Removing one is worth more than speeding up all of them.';

// ---------------------------------------------------------------------------
// Selection harness
// ---------------------------------------------------------------------------

// The bar only exists while the browser reports a live selection, so every
// story fakes one instead of asking the reviewer to drag a cursor. The element
// carrying this attribute is the one whose contents get selected.
const AUTO_SELECT = 'data-autoselect';
const autoSelect = { [AUTO_SELECT]: true };

const raiseBar = (root: ParentNode | null): void => {
  const target = root?.querySelector<HTMLElement>(`[${AUTO_SELECT}]`);

  if (!target) {
    return;
  }

  const doc = target.ownerDocument;
  const win = doc.defaultView;

  if (!win) {
    return;
  }

  const range = doc.createRange();
  range.selectNodeContents(target);

  const selection = win.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);

  // The hook listens for selection *end*, not `selectionchange`, so replay the
  // event a real mouse release would have produced.
  target.dispatchEvent(new win.MouseEvent('mouseup', { bubbles: true }));
};

// Raise the bar once the story has mounted. An effect is used rather than a
// `play` function because it also fires in the docs view and does not depend on
// Storybook's instrumentation timing.
const useAutoRaise = (root: RefObject<HTMLElement>, enabled = true): void => {
  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    // One tick for the bar to attach its document listeners.
    const timeout = setTimeout(() => raiseBar(root.current), 120);

    return () => clearTimeout(timeout);
  }, [enabled, root]);
};

interface StageProps {
  /** What to look at in this story. */
  hint?: ReactNode;
  /** Post body — the container the bar is bound to. */
  children: ReactNode;
  /** Rendered outside the body. Selecting it must never raise the bar. */
  outside?: ReactNode;
  className?: string;
  bodyClassName?: string;
  showRaiseButton?: boolean;
  /** Off when an enclosing story owns the selection. */
  autoRaise?: boolean;
  /** Intercepts the quote action instead of writing it to the URL. */
  onQuote?: (markdownQuote: string) => void;
}

const Stage = ({
  hint,
  children,
  outside,
  className,
  bodyClassName,
  showRaiseButton = true,
  autoRaise = true,
  onQuote,
}: StageProps): ReactElement => {
  const stageRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useAutoRaise(stageRef, autoRaise);

  const onRaise = useCallback(() => {
    // The bar's own outside-click handler runs on this very click and clears
    // the selection, so re-select on the next tick.
    setTimeout(() => raiseBar(stageRef.current), 0);
  }, []);

  return (
    <div
      ref={stageRef}
      className={classNames('flex flex-col gap-3', className)}
    >
      {!!hint && <p className="text-text-tertiary typo-footnote">{hint}</p>}
      <div
        ref={containerRef}
        className={classNames(
          'select-text rounded-16 border border-border-subtlest-tertiary bg-surface-float p-6 text-text-primary typo-body',
          bodyClassName,
        )}
      >
        {children}
      </div>
      {outside}
      {showRaiseButton && (
        <button
          type="button"
          onClick={onRaise}
          className="self-start rounded-10 border border-border-subtlest-tertiary px-3 py-1 text-text-secondary typo-footnote"
        >
          Raise the bar again
        </button>
      )}
      <SelectionShareBar
        containerRef={containerRef}
        onQuote={onQuote}
        post={post}
      />
    </div>
  );
};

// ---------------------------------------------------------------------------
// Bodies — stand-ins for the three surfaces the bar is wired into. They carry
// the same typography as the real bodies; the real components (PostContent,
// SquadPostContent, PostFocusCard) pull in routing, feed queries and lazy
// modals that do not belong in a story.
// ---------------------------------------------------------------------------

/**
 * `selectable={false}` moves the auto-selection target out of the body, so a
 * story can prove that selecting something *outside* raises nothing. Leaving it
 * on would select the body instead and the story would silently pass.
 */
const ArticleBody = ({
  selectable = true,
}: {
  selectable?: boolean;
}): ReactElement => (
  <>
    <h1 className="mb-3 font-bold typo-title2">{post.title}</h1>
    <p className="mb-4 text-text-tertiary typo-footnote">
      Ido Shamun · daily.dev · 6 min read
    </p>
    {/* eslint-disable-next-line react/jsx-props-no-spreading */}
    <p className="mb-4" {...(selectable ? autoSelect : {})}>
      {paragraph}
    </p>
    <p>{secondParagraph}</p>
  </>
);

const SquadBody = (): ReactElement => (
  <>
    <div className="mb-4 flex items-center gap-2">
      <span className="flex size-8 items-center justify-center rounded-10 bg-surface-secondary typo-footnote">
        🥑
      </span>
      <div className="flex flex-col">
        <span className="font-bold typo-callout">Ido Shamun</span>
        <span className="text-text-tertiary typo-footnote">
          Frontend Squad · 2h
        </span>
      </div>
    </div>
    <h2 className="mb-3 font-bold typo-title3">
      A rule of thumb for shipping under pressure
    </h2>
    {/* eslint-disable-next-line react/jsx-props-no-spreading */}
    <p className="mb-4" {...autoSelect}>
      {paragraph}
    </p>
    <p>{secondParagraph}</p>
  </>
);

const FocusCardBody = (): ReactElement => (
  <>
    <div className="mb-4 h-32 rounded-12 bg-surface-secondary" />
    <h2 className="mb-3 font-bold typo-title2">{post.title}</h2>
    {/* eslint-disable-next-line react/jsx-props-no-spreading */}
    <p className="mb-4" {...autoSelect}>
      {paragraph}
    </p>
    <div className="flex gap-2 text-text-tertiary typo-footnote">
      <span>#webdev</span>
      <span>#productivity</span>
    </div>
  </>
);

const CollectionBody = (): ReactElement => (
  <>
    <h2 className="mb-2 font-bold typo-title2">
      What changed in frontend tooling this month
    </h2>
    <p className="mb-4 text-text-tertiary typo-footnote">
      Last updated today · 6 sources
    </p>
    {/* eslint-disable-next-line react/jsx-props-no-spreading */}
    <p className="mb-4" {...autoSelect}>
      {paragraph}
    </p>
    <p>{secondParagraph}</p>
  </>
);

const PollBody = (): ReactElement => (
  <>
    {/* eslint-disable-next-line react/jsx-props-no-spreading */}
    <h2 className="mb-4 font-bold typo-large-title" {...autoSelect}>
      Do you write tests before or after the implementation?
    </h2>
    <div className="flex flex-col gap-2">
      {['Before, always', 'After, usually', 'Depends on the change'].map(
        (option) => (
          <div
            className="rounded-12 border border-border-subtlest-tertiary px-4 py-3 typo-callout"
            key={option}
          >
            {option}
          </div>
        ),
      )}
    </div>
  </>
);

const BriefBody = (): ReactElement => (
  <>
    <p className="text-text-tertiary typo-footnote">Today</p>
    <h2 className="mb-2 font-bold typo-title2">Your presidential briefing</h2>
    <p className="mb-4 text-text-tertiary typo-footnote">
      3m read · 12 Sources
    </p>
    {/* eslint-disable-next-line react/jsx-props-no-spreading */}
    <div {...autoSelect}>
      <h3 className="mb-2 font-bold typo-title3">What matters today</h3>
      <p className="mb-4">{paragraph}</p>
      <p>{secondParagraph}</p>
    </div>
  </>
);

const SocialBody = (): ReactElement => (
  <>
    <div className="mb-4 flex items-center gap-2">
      <span className="size-8 rounded-full bg-surface-secondary" />
      <span className="font-bold typo-callout">@idoshamun</span>
    </div>
    {/* eslint-disable-next-line react/jsx-props-no-spreading */}
    <h1
      className="mb-4 whitespace-pre-line break-words typo-markdown"
      {...autoSelect}
    >
      {paragraph}
    </h1>
    <p className="text-text-secondary typo-markdown">{secondParagraph}</p>
  </>
);

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------

// Storybook aliases `@growthbook/growthbook` to a mock whose `getFeatureValue`
// coerces every falsy default to the truthy string `'control'`, so a flag can't
// be evaluated as `false` here. Flag-off is therefore simulated by holding the
// features context as "not ready", which is the exact path
// `useConditionalFeature` takes to fall back to the (false) default value.
const withProviders =
  (enabled: boolean) =>
  (Story: React.ComponentType): React.ReactElement => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, staleTime: Infinity } },
    });
    // Mock the short-URL resolution so copy/share actions don't hit network.
    queryClient.setQueryData(['shortUrl'], 'https://dly.to/abc123');

    const LogContext = getLogContextStatic();

    return (
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider
          value={
            {
              user: mockUser,
              shouldShowLogin: false,
              isLoggedIn: true,
              isAuthReady: true,
              showLogin: fn(),
              closeLogin: fn(),
              logout: fn(),
              updateUser: fn(),
              tokenRefreshed: true,
              getRedirectUri: fn(),
              loadingUser: false,
              loadedUserFromCache: true,
              refetchBoot: fn(),
              squads: [],
              isAndroidApp: false,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any
          }
        >
          <GrowthBookProvider
            app={BootApp.Webapp}
            user={mockUser}
            deviceId="storybook"
          >
            <FeaturesReadyContext.Provider
              value={{
                ready: enabled,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                getFeatureValue: (feature) => feature.defaultValue as any,
              }}
            >
              <LogContext.Provider
                value={{
                  logEvent: fn(),
                  logEventStart: fn(),
                  logEventEnd: fn(),
                  sendBeacon: () => false,
                }}
              >
                <Story />
              </LogContext.Provider>
            </FeaturesReadyContext.Provider>
          </GrowthBookProvider>
        </AuthContext.Provider>
      </QueryClientProvider>
    );
  };

const meta: Meta<typeof SelectionShareBar> = {
  title: 'Components/Share/SelectionShareBar',
  component: SelectionShareBar,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: [
          'Floating share bar anchored to a text selection inside a post body.',
          'Behind the `share_text_selection` flag **and** the `sharing_visibility` master gate.',
          '',
          'Every story fakes a selection on load, so the bar is visible without dragging a cursor.',
          'Clicking anywhere dismisses it — hit **Raise the bar again** to bring it back.',
          'Use the Storybook theme toggle to check dark and light; both are supported.',
        ].join('\n'),
      },
    },
  },
  decorators: [withProviders(true)],
};

export default meta;

type Story = StoryObj<typeof SelectionShareBar>;

// -- Placement --------------------------------------------------------------

/** Default: the bar floats centred above the selection, 8px clear of it. */
export const AboveSelection: Story = {
  render: () => (
    <Stage
      className="mx-auto max-w-2xl p-6"
      hint="Four actions: copy link · copy text · quote in a comment · share."
    >
      <ArticleBody />
    </Stage>
  ),
};

/**
 * Under 64px from the top of the viewport there is no room above the
 * selection, so the bar flips underneath it.
 */
export const FlippedBelow: Story = {
  render: () => (
    <Stage
      className="mx-auto max-w-2xl"
      bodyClassName="rounded-none border-0 border-b p-4"
      showRaiseButton={false}
    >
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <p {...autoSelect}>{paragraph}</p>
    </Stage>
  ),
};

/**
 * A short selection hard against the left edge would centre the bar partly
 * off-screen, so the position is clamped to 8px inside the viewport.
 */
export const ClampedToLeftEdge: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  render: () => (
    <Stage
      className="p-0 pt-12"
      bodyClassName="rounded-none border-0 p-0"
      hint={
        <span className="px-2">
          The bar sits 8px from the edge, not centred over the word.
        </span>
      }
    >
      <p className="w-16">
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <span {...autoSelect}>shipping</span>
      </p>
    </Stage>
  ),
};

/** The same clamp on the other side. */
export const ClampedToRightEdge: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  render: () => (
    <Stage className="p-0 pt-12" bodyClassName="rounded-none border-0 p-0">
      <p className="ml-auto w-16 text-right">
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <span {...autoSelect}>shipping</span>
      </p>
    </Stage>
  ),
};

/**
 * The rect is recomputed on scroll (capture phase, so inner scrollers count),
 * so the bar tracks the selection instead of hanging in place.
 */
export const FollowsWhileScrolling: Story = {
  render: () => (
    <Stage
      className="mx-auto max-w-2xl p-6"
      hint="Scroll the canvas — the bar follows the highlighted paragraph."
      outside={
        <div className="flex flex-col gap-4 py-6 text-text-tertiary typo-body">
          <p>{secondParagraph}</p>
          <p>{paragraph}</p>
          <p>{secondParagraph}</p>
          <p>{paragraph}</p>
          <p>{secondParagraph}</p>
          <p>{paragraph}</p>
        </div>
      }
    >
      <ArticleBody />
    </Stage>
  ),
};

// -- Actions ----------------------------------------------------------------

/**
 * The share button opens the full social row — the same `ShareActions` popover
 * used elsewhere in the app, with the selection riding along as the share text.
 * An open popover holds the bar open: it portals out of the bar, so without
 * that guard clicking a network would read as a click away and dismiss it.
 */
export const ShareNetworks: Story = {
  render: () => (
    <Stage
      className="mx-auto max-w-2xl p-6 pt-40"
      hint="The popover opens on load. Click a network — the bar must stay put."
    >
      <ArticleBody />
    </Stage>
  ),
  play: async () => {
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 400);
    });

    const trigger = globalThis.document.querySelector<HTMLButtonElement>(
      '[data-testid="selectionShareBar"] [aria-label="Share"]',
    );

    trigger?.click();
  },
};

/**
 * Tooltip copy. One or two words each — the bar sits directly over the text the
 * reader just selected, so a full sentence in a tooltip hides what they are
 * looking at. Screen readers still get the long form from `aria-label`.
 */
export const Tooltips: Story = {
  render: () => (
    <Stage
      className="mx-auto max-w-2xl p-6 pt-32"
      hint="Hover each button: Copy link · Copy text · Quote · Share."
    >
      <ArticleBody />
    </Stage>
  ),
  play: async () => {
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 400);
    });

    const quote = globalThis.document.querySelector(
      '[data-testid="selectionShareBar"] [aria-label="Quote in a comment"]',
    );

    quote?.dispatchEvent(
      new MouseEvent('mouseover', { bubbles: true, cancelable: true }),
    );
  },
};

/**
 * Quote sends the selection to the comment composer as a markdown blockquote,
 * via `?comment=`. Storybook stubs the router, so nothing navigates here — the
 * payload below is what the composer receives.
 */
export const QuoteInComment: Story = {
  render: () => {
    const [quote, setQuote] = React.useState<string | null>(null);

    return (
      <Stage
        className="mx-auto max-w-2xl p-6"
        hint="Click the speech-bubble button to see what the composer is handed."
        outside={
          <pre className="min-h-16 whitespace-pre-wrap rounded-12 border border-border-subtlest-tertiary bg-surface-float p-4 text-text-secondary typo-footnote">
            {quote ?? 'Nothing quoted yet.'}
          </pre>
        }
        onQuote={setQuote}
      >
        <ArticleBody />
      </Stage>
    );
  },
};

// -- Devices ----------------------------------------------------------------

/**
 * Mobile: identical bar, but "Copy link" hands off to the native share sheet
 * when the device exposes `navigator.share`, and the position clamps to the
 * *visual* viewport so pinch-zoom cannot push it off screen.
 */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  render: () => (
    <Stage className="p-4">
      <ArticleBody />
    </Stage>
  ),
};

// -- Selection shapes -------------------------------------------------------

/** A couple of words — the shortest selection the hook accepts. */
export const ShortSelection: Story = {
  render: () => (
    <Stage className="mx-auto max-w-2xl p-6">
      <p>
        Shipping fast is not about{' '}
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <span {...autoSelect}>typing faster</span>. It is about shrinking the
        distance between a decision and the moment a real developer feels its
        effect.
      </p>
    </Stage>
  ),
};

/** A selection spanning several paragraphs still gets one bar. */
export const MultiParagraphSelection: Story = {
  render: () => (
    <Stage
      className="mx-auto max-w-2xl p-6"
      hint="The bar anchors to the bounding rect of the whole selection."
    >
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <div className="flex flex-col gap-4" {...autoSelect}>
        <p>{paragraph}</p>
        <p>{secondParagraph}</p>
        <p>{paragraph}</p>
      </div>
    </Stage>
  ),
};

/** Selections inside code blocks behave the same — copy text keeps the code. */
export const CodeBlockSelection: Story = {
  render: () => (
    <Stage className="mx-auto max-w-2xl p-6">
      <p className="mb-4">{paragraph}</p>
      <pre className="overflow-x-auto rounded-10 bg-surface-secondary p-4 typo-footnote">
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <code {...autoSelect}>
          {`const [, copyText] = useCopyText();\ncopyText({ textToCopy: selection });`}
        </code>
      </pre>
    </Stage>
  ),
};

// -- Nothing should happen --------------------------------------------------

/** Under two characters is treated as an accidental tap: no bar. */
export const IgnoredTinySelection: Story = {
  render: () => (
    <Stage
      className="mx-auto max-w-2xl p-6"
      hint="Expected: no bar. One character is a double-click, not a quote."
    >
      <p>
        Shipping fast is not about typing faster
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <span {...autoSelect}>.</span> It is about shrinking the distance
        between a decision and its effect.
      </p>
    </Stage>
  ),
};

/** Selections outside the post body are ignored entirely. */
export const IgnoredOutsideBody: Story = {
  render: () => (
    <Stage
      className="mx-auto max-w-2xl p-6"
      hint="Expected: no bar. The selection below sits outside the bound container."
      outside={
        // eslint-disable-next-line react/jsx-props-no-spreading
        <p className="text-text-secondary typo-body" {...autoSelect}>
          {secondParagraph}
        </p>
      }
    >
      <p>{paragraph}</p>
    </Stage>
  ),
};

/**
 * A drag that starts inside the body and ends outside it is ignored too — both
 * the anchor and the focus node have to be inside.
 */
const CrossingBoundary = (): ReactElement => {
  const rootRef = useRef<HTMLDivElement>(null);

  useAutoRaise(rootRef);

  return (
    <div ref={rootRef} className="mx-auto flex max-w-2xl flex-col gap-3 p-6">
      <p className="text-text-tertiary typo-footnote">
        Expected: no bar. The selection starts in the body and ends in the
        comment below it.
      </p>
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <div className="flex flex-col gap-3" {...autoSelect}>
        <Stage showRaiseButton={false} autoRaise={false}>
          <p>{paragraph}</p>
        </Stage>
        <p className="text-text-secondary typo-body">
          Great post — bookmarking this one.
        </p>
      </div>
    </div>
  );
};

export const IgnoredCrossingBoundary: Story = {
  render: () => <CrossingBoundary />,
};

/**
 * The comment section sits inside the same column as the body on every surface
 * (`BasePostContent` renders it), so binding the bar to that column armed it
 * over replies — quoting one would have credited a commenter's words to the
 * post. `PostSelectionArea` scopes the bar to title, TL;DR and body only.
 */
export const IgnoredComments: Story = {
  render: () => (
    <Stage
      className="mx-auto max-w-2xl p-6"
      hint="Expected: no bar. This is the scoping fix — comments are out of bounds."
      outside={
        <div className="flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary p-4">
          <p className="text-text-tertiary typo-footnote">3 comments</p>
          <div className="flex gap-2">
            <span className="size-8 shrink-0 rounded-10 bg-surface-secondary" />
            {/* eslint-disable-next-line react/jsx-props-no-spreading */}
            <p className="text-text-primary typo-callout" {...autoSelect}>
              Completely agree — the second point is the one people miss.
            </p>
          </div>
        </div>
      }
    >
      <ArticleBody selectable={false} />
    </Stage>
  ),
};

/**
 * Post chrome — navigation, source strip, tags, metadata, action bars — is
 * outside the selection area too. Only readable content raises the bar.
 */
export const IgnoredPostChrome: Story = {
  render: () => (
    <Stage
      className="mx-auto max-w-2xl p-6"
      hint="Expected: no bar. Tags and metadata are chrome, not content."
      outside={
        <div className="flex items-center gap-3 text-text-tertiary typo-footnote">
          {/* eslint-disable-next-line react/jsx-props-no-spreading */}
          <span {...autoSelect}>#webdev · 6 min read · From daily.dev</span>
        </div>
      }
    >
      <ArticleBody selectable={false} />
    </Stage>
  ),
};

/**
 * Digest posts are deliberately excluded. A digest has no prose of its own —
 * it is a header plus an embedded feed of *other* posts, so a selection there
 * would quote a different post's headline and attribute it to the digest.
 */
export const IgnoredDigestPost: Story = {
  render: () => (
    <Stage
      className="mx-auto max-w-2xl p-6"
      hint="Expected: no bar. DigestPostContent is intentionally not wired."
      bodyClassName="rounded-16 border border-border-subtlest-tertiary bg-surface-float p-6"
      outside={
        <div className="flex flex-col gap-2">
          {/* eslint-disable-next-line react/jsx-props-no-spreading */}
          <p className="font-bold typo-callout" {...autoSelect}>
            Another post’s headline, listed inside the digest feed
          </p>
          <p className="text-text-tertiary typo-footnote">
            daily.dev · 4 min read
          </p>
        </div>
      }
    >
      <p className="text-text-tertiary typo-footnote">Today</p>
      <h2 className="font-bold typo-title2">Your personalized digest</h2>
      <p className="text-text-tertiary typo-footnote">12 posts · 6 sources</p>
    </Stage>
  ),
};

// -- Surfaces ---------------------------------------------------------------

/** Article & video posts — `PostContent`. Page and modal. */
export const SurfaceArticlePost: Story = {
  render: () => (
    <Stage
      className="mx-auto max-w-2xl p-6"
      hint="Surface 1 of 7 — PostContent (article, video, live room). Title + TL;DR."
    >
      <ArticleBody />
    </Stage>
  ),
};

/** Freeform / welcome / share squad posts — `SquadPostContent`. */
export const SurfaceSquadPost: Story = {
  render: () => (
    <Stage
      className="mx-auto max-w-2xl p-6"
      hint="Surface 2 of 7 — SquadPostContent (freeform, welcome, share, YouTube)."
    >
      <SquadBody />
    </Stage>
  ),
};

/** Redesigned post page and modal — `PostFocusCard`. */
export const SurfaceFocusCard: Story = {
  render: () => (
    <Stage
      className="mx-auto max-w-2xl p-6"
      hint="Surface 3 of 7 — PostFocusCard (post redesign, page and modal)."
    >
      <FocusCardBody />
    </Stage>
  ),
};

/** Collections — `CollectionPostContent`. Newly covered. */
export const SurfaceCollectionPost: Story = {
  render: () => (
    <Stage
      className="mx-auto max-w-2xl p-6"
      hint="Surface 4 of 7 — CollectionPostContent. Had no bar before this change."
    >
      <CollectionBody />
    </Stage>
  ),
};

/** Polls — `PollPostContent`. The question and options are quotable. */
export const SurfacePollPost: Story = {
  render: () => (
    <Stage
      className="mx-auto max-w-2xl p-6"
      hint="Surface 5 of 7 — PollPostContent. Had no bar before this change."
    >
      <PollBody />
    </Stage>
  ),
};

/** Briefs — `BriefPostContent`. Long generated prose, the best quote source. */
export const SurfaceBriefPost: Story = {
  render: () => (
    <Stage
      className="mx-auto max-w-2xl p-6"
      hint="Surface 6 of 7 — BriefPostContent. Had no bar before this change."
    >
      <BriefBody />
    </Stage>
  ),
};

/** Social / Twitter posts — `SocialTwitterPostContent`. */
export const SurfaceSocialPost: Story = {
  render: () => (
    <Stage
      className="mx-auto max-w-2xl p-6"
      hint="Surface 7 of 7 — SocialTwitterPostContent. Had no bar before this change."
    >
      <SocialBody />
    </Stage>
  ),
};

// -- Dismissal --------------------------------------------------------------

/** Click away, press Escape, or collapse the selection — all drop the bar. */
export const Dismissal: Story = {
  render: () => (
    <Stage
      className="mx-auto max-w-2xl p-6"
      hint="Try: press Escape · click outside the body · click inside the text."
    >
      <ArticleBody />
    </Stage>
  ),
};

// -- Flag off ---------------------------------------------------------------

/**
 * Control. Nothing renders and none of the inner hooks mount, so no selection
 * or viewport listeners are attached at all.
 */
export const FlagOff: Story = {
  decorators: [withProviders(false)],
  render: () => (
    <Stage
      className="mx-auto max-w-2xl p-6"
      hint="Expected: no bar, and no listeners attached."
    >
      <ArticleBody />
    </Stage>
  ),
};
