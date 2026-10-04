import type { ReactElement, RefObject } from 'react';
import React, { useCallback, useRef } from 'react';
import { CopyHighlightsLink } from '../../components/highlights/CopyHighlightsLink';
import type { SnapshotResult } from '../../components/imageShare/SnapshotButton';
import { SnapshotButton } from '../../components/imageShare/SnapshotButton';
import type { SnapshotShare } from '../../components/imageShare/SnapshotSharePanel';
import type { PostHighlightFeed } from '../../graphql/highlights';
import { LogEvent, Origin, TargetType } from '../../lib/log';
import { ReferralCampaignKey } from '../../lib/referral';
import { ShareProvider } from '../../lib/share';
import colors from '../../styles/colors';
import { HighlightTextSnapshotCard } from './HighlightTextSnapshotCard';
import { SelectionShareBar } from './SelectionSnapshotBar';
import { SnapshotEyebrow } from './SnapshotEyebrow';
import { getSnapshotCaptureOptions } from './snapshotCapture';
import { useArmedCard } from './useArmedCard';
import { useLogHighlightShare } from './useLogHighlightShare';

/**
 * The production "Happening Now" wordmark animates across
 * blueCheese -> cheese -> avocado. A still frame has to pick a position, and
 * the yellow-to-green end is the one the brand shots use.
 */
const HIGHLIGHTS_EYEBROW_GRADIENT = `linear-gradient(120deg, ${colors.cheese['40']} 0%, ${colors.avocado['10']} 52%, ${colors.avocado['40']} 100%)`;

const HappeningNowEyebrow = (): ReactElement => (
  <SnapshotEyebrow
    gradient={HIGHLIGHTS_EYEBROW_GRADIENT}
    label="Happening now"
  />
);

/**
 * Copy link and Snapshot for an expanded highlight, plus the quote bar over
 * its TLDR. Mounts only once a row expands, so collapsed rows run none of it.
 */
export function HighlightShareActions({
  highlight,
  tldr,
  tldrRef,
  title,
  source,
}: {
  highlight: PostHighlightFeed;
  tldr: string;
  tldrRef: RefObject<HTMLElement>;
  /** The article the TLDR summarizes, credited on both cards. */
  title?: string;
  /** Who wrote the TLDR, credited on both cards. */
  source?: { name: string; image?: string };
}): ReactElement {
  const cardRef = useRef<HTMLDivElement>(null);
  const { isArmed, armProps } = useArmedCard();
  const logShare = useLogHighlightShare(
    Origin.HappeningNowHighlight,
    highlight,
  );
  const logSelectionShare = useLogHighlightShare(
    Origin.HappeningNowSelection,
    highlight,
  );

  const share: SnapshotShare = {
    link: highlight.post.commentsPermalink,
    text: title,
    cid: ReferralCampaignKey.SharePost,
    event: LogEvent.SharePost,
    targetId: highlight.post.id,
    targetType: TargetType.Post,
    extra: { highlight_id: highlight.id },
  };

  const onSnapshot = useCallback(
    (result: SnapshotResult) => logShare(ShareProvider.Snapshot, result),
    [logShare],
  );

  return (
    <>
      <CopyHighlightsLink
        highlight={highlight}
        origin={Origin.HappeningNowHighlight}
      />
      <span className="contents" {...armProps}>
        <SnapshotButton
          captureOptions={() => getSnapshotCaptureOptions(cardRef.current)}
          filename={`daily-highlight-${highlight.id}`}
          onResult={onSnapshot}
          origin={Origin.HappeningNowHighlight}
          post={highlight.post}
          share={share}
          showLabel={false}
          target={cardRef}
        />
      </span>
      {isArmed && (
        <div
          aria-hidden
          className="pointer-events-none fixed left-[-300vw] top-0"
        >
          <HighlightTextSnapshotCard
            label={<HappeningNowEyebrow />}
            passage={tldr}
            ref={cardRef}
            seed={highlight.id}
            source={source}
            title={title}
          />
        </div>
      )}
      <SelectionShareBar
        containerRef={tldrRef}
        label={<HappeningNowEyebrow />}
        link={highlight.post.commentsPermalink}
        onShare={logSelectionShare}
        origin={Origin.HappeningNowSelection}
        post={highlight.post}
        seed={highlight.id}
        share={share}
        source={source}
        title={title}
      />
    </>
  );
}
