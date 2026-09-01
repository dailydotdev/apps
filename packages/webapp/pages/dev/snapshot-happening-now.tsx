import type { ReactElement, ReactNode, RefObject } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { NextSeo } from 'next-seo';
import classNames from 'classnames';
import Toast from '@dailydotdev/shared/src/components/notifications/Toast';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  ArrowIcon,
  LinkIcon,
  MenuIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { HighlightSnapshotButton } from '@dailydotdev/shared/src/features/snapshot/HighlightSnapshotButton';
import { HighlightSnapshotCard } from '@dailydotdev/shared/src/features/snapshot/HighlightSnapshotCard';
import { HighlightsPageSnapshotButton } from '@dailydotdev/shared/src/features/snapshot/HighlightsPageSnapshotButton';
import { HighlightsPageSnapshotCard } from '@dailydotdev/shared/src/features/snapshot/HighlightsPageSnapshotCard';
import { SNAPSHOT_SIZE } from '@dailydotdev/shared/src/features/snapshot/snapshotGradient';
import { captureShareImage } from '@dailydotdev/shared/src/lib/imageShare/captureShareImage';
import { useCopyText } from '@dailydotdev/shared/src/hooks/useCopy';
import {
  ToastType,
  useToastNotification,
} from '@dailydotdev/shared/src/hooks/useToastNotification';
import type { AuthContextData } from '@dailydotdev/shared/src/contexts/AuthContext';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { getLogContextStatic } from '@dailydotdev/shared/src/contexts/LogContext';
import type { LogContextData } from '@dailydotdev/shared/src/hooks/log/useLogContextData';

/**
 * /dev/snapshot-happening-now — the four Happening Now placements from the
 * Storybook surface page, rebuilt with working controls: every Snapshot below
 * really rasterizes the card it would share.
 *
 * On /highlights itself each level sits behind its own flag —
 * `snapshot_highlight_row`, `snapshot_highlight_expanded` and
 * `snapshot_highlights_page` — all defaulting to off, and all forced on for
 * branch previews. Carries `noindex`/`nofollow` and is blocked on the
 * canonical production hosts.
 */

const LINK = 'https://app.daily.dev/highlights';

const HIGHLIGHTS = [
  {
    id: 'dev-highlight-openai',
    headline: 'OpenAI ships a cheaper model tier',
    tldr: 'Priced at a third of the previous tier with the same context window. The cut lands first on the API, with the assistant products following next quarter.',
    meta: '2h ago',
  },
  {
    id: 'dev-highlight-react',
    headline: 'React 20 drops the legacy render path',
    tldr: 'The codemod covers most applications; class components with legacy context are the exception and will need a manual pass.',
    meta: '4h ago',
  },
  {
    id: 'dev-highlight-postgres',
    headline: 'Postgres 19 lands async I/O by default',
    tldr: 'Early benchmarks show double-digit gains on write-heavy workloads, with the largest wins on NVMe and the smallest on network storage.',
    meta: '6h ago',
  },
];

const CHANNEL = 'Headlines';

const CAPTURE_OPTIONS = {
  width: SNAPSHOT_SIZE,
  height: SNAPSHOT_SIZE,
  padding: 0,
  branded: false,
};

const useIsAllowedHost = () => {
  const [allowed, setAllowed] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const { hostname } = window.location;
    setAllowed(hostname !== 'app.daily.dev' && hostname !== 'www.daily.dev');
  }, []);

  return allowed;
};

const LogContext = getLogContextStatic();

/**
 * `/dev/*` short-circuits to a QueryClient-only tree in _app — no boot, no
 * auth — which is what makes these pages load without the API.
 */
const AUTH_STUB = {
  isLoggedIn: false,
  isAuthReady: true,
  tokenRefreshed: true,
  shouldShowLogin: false,
  squads: [],
  showLogin: () => {},
  closeLogin: () => {},
  logout: async () => {},
  updateUser: async () => {},
  getRedirectUri: () => '',
} as unknown as AuthContextData;

const LOG_STUB = {
  logEvent: () => {},
  logEventStart: () => {},
  logEventEnd: () => {},
} as unknown as LogContextData;

const DevProviders = ({ children }: { children: ReactNode }) => (
  <AuthContext.Provider value={AUTH_STUB}>
    <LogContext.Provider value={LOG_STUB}>{children}</LogContext.Provider>
  </AuthContext.Provider>
);

/* ----------------------------------------------------------- page furniture */

const Placement = ({
  step,
  headline,
  note,
  children,
}: {
  step: string;
  headline: string;
  note: string;
  children: ReactNode;
}) => (
  <div className="flex flex-col gap-3">
    <div className="flex flex-col gap-1">
      <span className="font-bold uppercase text-text-quaternary typo-caption2">
        {step}
      </span>
      <span className="font-bold text-text-primary typo-callout">
        {headline}
      </span>
      <span className="max-w-[46rem] text-text-tertiary typo-footnote">
        {note}
      </span>
    </div>
    <div className="w-full max-w-[34rem] rounded-16 border border-border-subtlest-tertiary bg-background-default py-2">
      {children}
    </div>
  </div>
);

const Inert = ({ icon, label }: { icon: ReactElement; label: string }) => (
  <Button
    aria-label={label}
    disabled
    icon={icon}
    size={ButtonSize.Small}
    type="button"
    variant={ButtonVariant.Tertiary}
  />
);

const CopyLink = ({ label }: { label?: boolean }) => {
  const [, copy] = useCopyText(LINK);
  const { displayToast } = useToastNotification();
  // The clipboard rejects outright when the document is not focused, and a
  // press that reports nothing at all reads as a dead button.
  const onCopy = async () => {
    try {
      await copy({ message: '✅ Copied link' });
    } catch {
      displayToast('❌ Your browser blocked the clipboard', {
        variant: ToastType.Error,
      });
    }
  };

  return (
    <Button
      aria-label="Copy link"
      icon={<LinkIcon />}
      onClick={onCopy}
      size={ButtonSize.Small}
      type="button"
      variant={ButtonVariant.Tertiary}
    >
      {label ? 'Copy link' : undefined}
    </Button>
  );
};

/* --------------------------------------------------------------- the mocks */

type Spot = 'menu' | 'row' | 'expanded' | 'page';

const PageHeader = ({ spot }: { spot: Spot }) => (
  <header className="flex items-center gap-3 px-3 py-2">
    <h2 className="feed-highlights-title-gradient flex-1 font-bold typo-title2">
      Happening Now
    </h2>
    {spot === 'page' ? (
      <HighlightsPageSnapshotButton
        channel={CHANNEL}
        headlines={HIGHLIGHTS.map(({ headline }) => headline)}
        link={LINK}
        meta="Updated 4 minutes ago"
        seed="dev-happening-now"
        size={ButtonSize.Small}
        variant={ButtonVariant.Secondary}
      />
    ) : (
      <Inert icon={<MenuIcon />} label="Options" />
    )}
  </header>
);

const HighlightRow = ({
  highlight,
  spot,
  expanded,
}: {
  highlight: (typeof HIGHLIGHTS)[number];
  spot: Spot;
  expanded: boolean;
}) => {
  const snapshotProps = {
    channel: CHANNEL,
    headline: highlight.headline,
    id: highlight.id,
    link: LINK,
    meta: highlight.meta,
    tldr: highlight.tldr,
  };

  return (
    <article>
      <div className="flex items-center pr-2 transition-colors hover:bg-surface-hover">
        <div className="flex min-w-0 flex-1 items-center gap-2 px-4 py-3">
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="font-bold text-text-primary typo-body">
              {highlight.headline}
            </span>
            <span className="mt-0.5 text-text-quaternary typo-footnote">
              {highlight.meta}
            </span>
          </div>
          <ArrowIcon
            size={IconSize.Small}
            className={classNames(
              'shrink-0 text-text-tertiary',
              expanded ? 'rotate-180' : 'rotate-90',
            )}
          />
        </div>
        {spot === 'row' && (
          <HighlightSnapshotButton
            {...snapshotProps}
            showLabel={false}
            size={ButtonSize.Small}
            variant={ButtonVariant.Tertiary}
          />
        )}
      </div>
      {expanded && (
        <div className="flex flex-col gap-3 px-4 pb-3">
          <p className="text-text-secondary typo-markdown">{highlight.tldr}</p>
          <div className="flex items-center gap-3">
            <span className="flex-1 font-bold text-text-link typo-footnote">
              Read more
            </span>
            <CopyLink />
            <HighlightSnapshotButton
              {...snapshotProps}
              size={ButtonSize.Small}
              variant={ButtonVariant.Primary}
            />
          </div>
        </div>
      )}
    </article>
  );
};

const HappeningScreen = ({ spot }: { spot: Spot }) => (
  <div className="flex flex-col">
    <PageHeader spot={spot} />
    {HIGHLIGHTS.map((highlight, index) => (
      <HighlightRow
        key={highlight.id}
        expanded={spot === 'expanded' && index === 0}
        highlight={highlight}
        spot={spot}
      />
    ))}
  </div>
);

/* ---------------------------------------------------- capture + its output */

const ScaledCard = ({
  label,
  children,
  size = 260,
}: {
  label: string;
  children: ReactNode;
  size?: number;
}) => (
  <figure className="flex flex-col gap-2">
    <figcaption className="font-bold uppercase text-text-quaternary typo-caption2">
      {label}
    </figcaption>
    <div
      className="overflow-hidden rounded-16 border border-border-subtlest-tertiary"
      style={{ width: size, height: size }}
    >
      <div
        style={{
          transform: `scale(${size / SNAPSHOT_SIZE})`,
          transformOrigin: 'top left',
        }}
      >
        {children}
      </div>
    </div>
  </figure>
);

const CaptureOutput = ({
  target,
  label,
}: {
  target: RefObject<HTMLDivElement>;
  label: string;
}): ReactElement => {
  const [image, setImage] = useState<{ url: string; size: number } | null>(
    null,
  );
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onCapture = useCallback(async () => {
    setIsCapturing(true);
    setError(null);

    try {
      const blob = await captureShareImage(target, CAPTURE_OPTIONS);
      setImage({ url: URL.createObjectURL(blob), size: blob.size });
    } catch (e) {
      setError(String(e));
    } finally {
      setIsCapturing(false);
    }
  }, [target]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Button
          disabled={isCapturing}
          loading={isCapturing}
          onClick={onCapture}
          type="button"
          variant={ButtonVariant.Primary}
        >
          {label}
        </Button>
        {image && (
          <span className="text-text-tertiary typo-footnote">
            {SNAPSHOT_SIZE}x{SNAPSHOT_SIZE} · {Math.round(image.size / 1024)} KB
          </span>
        )}
        {error && (
          <span className="text-status-error typo-footnote">{error}</span>
        )}
      </div>
      {image && (
        <img
          alt="The captured snapshot"
          className="w-full max-w-[22rem] rounded-16 border border-border-subtlest-tertiary"
          src={image.url}
        />
      )}
    </div>
  );
};

/* ------------------------------------------------------------------- page */

const HappeningNowSnapshotDevPage = (): ReactElement => {
  const allowed = useIsAllowedHost();
  const highlightRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  if (!allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-default p-12">
        <p className="text-text-secondary typo-callout">
          The snapshot review page is not available on production.
        </p>
      </div>
    );
  }

  return (
    <>
      <NextSeo nofollow noindex title="Snapshot · Happening now · daily.dev" />
      <Toast autoDismissNotifications />
      <DevProviders>
        <div className="min-h-screen bg-background-default">
          <div className="mx-auto flex max-w-[72rem] flex-col gap-8 p-8">
            <div className="flex flex-col gap-3">
              <h1 className="font-bold text-text-primary typo-mega3">
                Happening now share placements
              </h1>
              <p className="max-w-[52rem] text-text-secondary typo-body">
                Three levels can be shared here — the whole page, a topic and a
                single highlight — and today none of them can. The page also has
                the shortest shelf life in the product, which is exactly why the
                image matters: a link sends someone to a page that has already
                moved on.
              </p>
              <p className="max-w-[52rem] rounded-12 border border-border-subtlest-tertiary bg-surface-float p-4 text-text-secondary typo-callout">
                Every Snapshot below is the production component and really
                rasterizes its card. On <code>/highlights</code> each level sits
                behind its own flag — <code>snapshot_highlight_row</code>,{' '}
                <code>snapshot_highlight_expanded</code> and{' '}
                <code>snapshot_highlights_page</code> — all defaulting to off.
                On a branch preview all three are forced on, so open{' '}
                <code>/highlights</code> on this deployment to see them in the
                real feed.
              </p>
            </div>

            <section className="flex flex-col gap-6 border-t border-border-subtlest-tertiary pt-8">
              <div className="flex flex-col gap-1">
                <h2 className="font-bold text-text-primary typo-title2">
                  Where the control goes
                </h2>
                <p className="max-w-[52rem] text-text-tertiary typo-callout">
                  Snapshot leads at every level — the payload is effectively the
                  whole page, and news travels through chat apps where an image
                  renders inline and a link collapses to a grey card. The open
                  question is per-highlight versus page-level, not which action
                  wins.
                </p>
              </div>

              <div className="flex flex-wrap gap-8">
                <Placement
                  headline="Nothing to share, at any level"
                  note="The fastest-moving page we publish, and nothing can be lifted out of it. The ⋯ menu is inert here — it is what ships today."
                  step="Today"
                >
                  <HappeningScreen spot="menu" />
                </Placement>

                <Placement
                  headline="Snapshot on every highlight"
                  note="Recommended. Each highlight is already a self-contained claim with sources behind it — exactly the shape a snapshot card wants. Press any icon: the PNG lands on your clipboard."
                  step="Recommended · working"
                >
                  <HappeningScreen spot="row" />
                </Placement>

                <Placement
                  headline="Expanded highlight, snapshot leading"
                  note="Expansion is the intent signal, and there is finally room for a label without crowding the row. Copy link works too, so the two offers can be judged side by side."
                  step="Expanded · working"
                >
                  <HappeningScreen spot="expanded" />
                </Placement>

                <Placement
                  headline="One control on the page header"
                  note="Cheapest to build and the weakest offer: a snapshot of the whole page is a wall of headlines nobody reads at thumbnail size. Press it and judge the result."
                  step="Alternative · working"
                >
                  <HappeningScreen spot="page" />
                </Placement>
              </div>
            </section>

            <section className="flex flex-col gap-6 border-t border-border-subtlest-tertiary pt-8">
              <div className="flex flex-col gap-1">
                <h2 className="font-bold text-text-primary typo-title2">
                  What each level exports
                </h2>
                <p className="max-w-[52rem] text-text-tertiary typo-callout">
                  The single highlight carries a headline and its TLDR; the page
                  card carries five headlines and nothing else. This is the
                  argument for the row placement, drawn rather than asserted.
                </p>
              </div>

              <div className="flex flex-wrap items-start gap-8">
                <div className="flex flex-col gap-4">
                  <ScaledCard label="One highlight · 1080 square">
                    <HighlightSnapshotCard
                      channel={CHANNEL}
                      headline={HIGHLIGHTS[0].headline}
                      meta={HIGHLIGHTS[0].meta}
                      seed={HIGHLIGHTS[0].id}
                      tldr={HIGHLIGHTS[0].tldr}
                    />
                  </ScaledCard>
                  <CaptureOutput
                    label="Capture the highlight PNG"
                    target={highlightRef}
                  />
                </div>

                <div className="flex flex-col gap-4">
                  <ScaledCard label="Whole page · 1080 square">
                    <HighlightsPageSnapshotCard
                      channel={CHANNEL}
                      headlines={HIGHLIGHTS.map(({ headline }) => headline)}
                      meta="Updated 4 minutes ago"
                      seed="dev-happening-now"
                    />
                  </ScaledCard>
                  <CaptureOutput
                    label="Capture the page PNG"
                    target={pageRef}
                  />
                </div>
              </div>
            </section>
          </div>
        </div>
      </DevProviders>

      {/* The full-size cards every capture on the page reads from. */}
      <div
        aria-hidden
        className="pointer-events-none fixed left-[-300vw] top-0"
      >
        <HighlightSnapshotCard
          ref={highlightRef}
          channel={CHANNEL}
          headline={HIGHLIGHTS[0].headline}
          meta={HIGHLIGHTS[0].meta}
          seed={HIGHLIGHTS[0].id}
          tldr={HIGHLIGHTS[0].tldr}
        />
        <HighlightsPageSnapshotCard
          ref={pageRef}
          channel={CHANNEL}
          headlines={HIGHLIGHTS.map(({ headline }) => headline)}
          meta="Updated 4 minutes ago"
          seed="dev-happening-now"
        />
      </div>
    </>
  );
};

HappeningNowSnapshotDevPage.getLayout = (page: ReactNode): ReactNode => page;

export default HappeningNowSnapshotDevPage;
