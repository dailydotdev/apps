import type { ReactElement, ReactNode } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { NextSeo } from 'next-seo';
import Toast from '@dailydotdev/shared/src/components/notifications/Toast';
import {
  Button,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { HighlightTextSnapshotCard } from '@dailydotdev/shared/src/features/snapshot/HighlightTextSnapshotCard';
import { SelectionSnapshotBar } from '@dailydotdev/shared/src/features/snapshot/SelectionSnapshotBar';
import { SNAPSHOT_SIZE } from '@dailydotdev/shared/src/features/snapshot/snapshotGradient';
import { captureShareImage } from '@dailydotdev/shared/src/lib/imageShare/captureShareImage';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';

/**
 * /dev/snapshot — internal review surface for the post-page selection
 * snapshot: the floating bar, the 1080×1080 card it exports, and the real
 * capture output.
 *
 * The bar here is mounted unflagged so it can be reviewed without GrowthBook;
 * on the post page itself it sits behind `snapshot_selection_share`. Carries
 * `noindex`/`nofollow`; reachable on preview + local but blocked on the
 * canonical production hosts.
 */

const SOURCE = {
  name: 'XDA Developers',
  image:
    'https://res.cloudinary.com/daily-now/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
};

const POST = {
  id: 'dev-snapshot-post',
  title: 'Why iconic tech brands lost their dominance',
  domain: 'xda-developers.com',
  commentsPermalink: 'https://app.daily.dev/posts/dev-snapshot-post',
  source: { id: 'xda', ...SOURCE },
} as Post;

const QUOTE =
  'Nokia, BlackBerry and Kodak all led their categories and all missed the same turn: they optimised the product they had instead of the one their customers were moving to.';

/** One per size tier in HighlightTextSnapshotCard, so all four are reviewed. */
const TIERS = [
  { label: '≤70 chars · 72px', text: 'They optimised the product they had.' },
  {
    label: '≤140 chars · 60px',
    text: 'Every incumbent optimised the product it already had instead of the one its customers were moving to.',
  },
  { label: '≤240 chars · 48px', text: QUOTE },
  {
    label: '>280 chars · truncated at the last word',
    text: `${QUOTE} ${QUOTE}`,
  },
];

const useIsAllowedHost = () => {
  const [allowed, setAllowed] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const { hostname } = window.location;
    // Block the canonical production hosts only; allow localhost and the
    // *.preview.app.daily.dev preview deployments so reviewers can open it.
    setAllowed(hostname !== 'app.daily.dev' && hostname !== 'www.daily.dev');
  }, []);

  return allowed;
};

const Section = ({
  title,
  caption,
  children,
}: {
  title: string;
  caption: string;
  children: ReactNode;
}) => (
  <section className="flex flex-col gap-4 border-t border-border-subtlest-tertiary pt-8">
    <div className="flex flex-col gap-1">
      <h2 className="font-bold text-text-primary typo-title2">{title}</h2>
      <p className="max-w-[52rem] text-text-tertiary typo-callout">{caption}</p>
    </div>
    {children}
  </section>
);

const PREVIEW_SIZE = 300;

const ScaledCard = ({
  label,
  text,
}: {
  label: string;
  text: string;
}): ReactElement => (
  <figure className="flex flex-col gap-2">
    <figcaption className="font-bold uppercase text-text-quaternary typo-caption2">
      {label}
    </figcaption>
    <div
      className="overflow-hidden rounded-16 border border-border-subtlest-tertiary"
      style={{ width: PREVIEW_SIZE, height: PREVIEW_SIZE }}
    >
      <div
        style={{
          transform: `scale(${PREVIEW_SIZE / SNAPSHOT_SIZE})`,
          transformOrigin: 'top left',
        }}
      >
        <HighlightTextSnapshotCard
          domain={POST.domain}
          postTitle={POST.title}
          seed={label}
          source={SOURCE}
          text={text}
        />
      </div>
    </div>
  </figure>
);

const CaptureOutput = (): ReactElement => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [image, setImage] = useState<{ url: string; size: number } | null>(
    null,
  );
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onCapture = useCallback(async () => {
    setIsCapturing(true);
    setError(null);

    try {
      const blob = await captureShareImage(cardRef, {
        width: SNAPSHOT_SIZE,
        height: SNAPSHOT_SIZE,
        padding: 0,
        branded: false,
      });
      setImage({ url: URL.createObjectURL(blob), size: blob.size });
    } catch (e) {
      setError(String(e));
    } finally {
      setIsCapturing(false);
    }
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Button
          disabled={isCapturing}
          loading={isCapturing}
          onClick={onCapture}
          type="button"
          variant={ButtonVariant.Primary}
        >
          Capture the PNG
        </Button>
        {image && (
          <span className="text-text-tertiary typo-footnote">
            {SNAPSHOT_SIZE}×{SNAPSHOT_SIZE} · {Math.round(image.size / 1024)} KB
          </span>
        )}
        {error && (
          <span className="text-status-error typo-footnote">{error}</span>
        )}
      </div>

      {image ? (
        <img
          alt="The captured snapshot"
          className="w-full max-w-[26rem] rounded-16 border border-border-subtlest-tertiary"
          src={image.url}
        />
      ) : (
        <div className="flex aspect-square w-full max-w-[26rem] items-center justify-center rounded-16 border border-border-subtlest-tertiary bg-surface-float text-text-quaternary typo-footnote">
          Not captured yet
        </div>
      )}

      {/* The full-size card the capture reads from. */}
      <div
        aria-hidden
        className="pointer-events-none fixed left-[-300vw] top-0"
      >
        <HighlightTextSnapshotCard
          ref={cardRef}
          domain={POST.domain}
          postTitle={POST.title}
          seed={POST.id}
          source={SOURCE}
          text={QUOTE}
        />
      </div>
    </div>
  );
};

const LiveBar = (): ReactElement => {
  const containerRef = useRef<HTMLElement>(null);

  return (
    <main
      ref={containerRef}
      className="flex max-w-[40rem] flex-col gap-4 rounded-16 border border-border-subtlest-tertiary p-6"
    >
      <SelectionSnapshotBar containerRef={containerRef} post={POST} />
      <span className="text-text-tertiary typo-footnote">
        {SOURCE.name} · Aug 12, 2026 · 4 min read
      </span>
      <h3 className="break-words font-bold text-text-primary typo-large-title">
        {POST.title}
      </h3>
      <p className="select-text break-words text-text-secondary typo-markdown">
        The pattern repeats across decades. {QUOTE}
      </p>
      <p className="select-text break-words text-text-secondary typo-markdown">
        The org chart is the part nobody shares: every one of them had a team
        whose budget depended on the old product continuing to sell, and that
        team wrote the roadmap.
      </p>
    </main>
  );
};

const SnapshotDevPage = (): ReactElement => {
  const allowed = useIsAllowedHost();

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
      <NextSeo nofollow noindex title="Snapshot review · daily.dev" />
      <Toast autoDismissNotifications />
      <div className="min-h-screen bg-background-default">
        <div className="mx-auto flex max-w-[72rem] flex-col gap-8 p-8">
          <div className="flex flex-col gap-3">
            <h1 className="font-bold text-text-primary typo-mega3">
              Post page selection snapshot
            </h1>
            <p className="max-w-[52rem] text-text-secondary typo-body">
              A highlighted line has no OG image of its own, so the quote is the
              share and the link is only attribution. This is the one snapshot
              placement on the post page — everywhere else the post&apos;s own
              OG image already carries the payload.
            </p>
            <p className="max-w-[52rem] rounded-12 border border-border-subtlest-tertiary bg-surface-float p-4 text-text-secondary typo-callout">
              On the real post page this sits behind the{' '}
              <code>snapshot_selection_share</code> flag, which defaults to off.
              Here it is always on so it can be reviewed without GrowthBook.
            </p>
          </div>

          <Section
            caption="Select at least a few words of either paragraph. The bar follows the quote, and Snapshot copies the PNG to your clipboard — or downloads it where the clipboard refuses images."
            title="The live bar"
          >
            <LiveBar />
          </Section>

          <Section
            caption="The card steps its type down as the quote grows, and cuts at the last whole word past 280 characters rather than refusing the selection."
            title="Every quote length"
          >
            <div className="flex flex-wrap gap-6">
              {TIERS.map((tier) => (
                <ScaledCard key={tier.label} {...tier} />
              ))}
            </div>
          </Section>

          <Section
            caption="The real capture pipeline, not a preview: this rasterizes the card and hands back the PNG the button would put on your clipboard."
            title="The exported file"
          >
            <CaptureOutput />
          </Section>
        </div>
      </div>
    </>
  );
};

SnapshotDevPage.getLayout = (page: ReactNode): ReactNode => page;

export default SnapshotDevPage;
