import type { ReactElement, RefObject } from 'react';
import React, { useCallback, useRef } from 'react';
import { Button } from '../../components/buttons/Button';
import { ButtonSize, ButtonVariant } from '../../components/buttons/common';
import { LinkIcon } from '../../components/icons/Link';
import type { SnapshotResult } from '../../components/imageShare/SnapshotButton';
import { SnapshotButton } from '../../components/imageShare/SnapshotButton';
import { CopyStateIcon } from '../../components/share/CopyStateIcon';
import { Tooltip } from '../../components/tooltip/Tooltip';
import type { PostHighlightFeed } from '../../graphql/highlights';
import { useCopyPostLink } from '../../hooks/useCopyPostLink';
import { Origin } from '../../lib/log';
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

/**
 * Copy link and Snapshot for an expanded highlight, plus the quote bar over
 * its TLDR. Kept out of HighlightItem so the row itself needs no query client
 * or log context for a placement that is off by default.
 */
export function HighlightShareActions({
  highlight,
  tldr,
  tldrRef,
}: {
  highlight: PostHighlightFeed;
  tldr: string;
  tldrRef: RefObject<HTMLElement>;
}): ReactElement {
  const cardRef = useRef<HTMLDivElement>(null);
  const { isArmed, armProps } = useArmedCard();
  const [copied, copyLink] = useCopyPostLink();
  const logShare = useLogHighlightShare(
    Origin.HappeningNowHighlight,
    highlight,
  );
  const logSelectionShare = useLogHighlightShare(
    Origin.HappeningNowSelection,
    highlight,
  );
  const link = highlight.post.commentsPermalink;

  const onCopyLink = () => {
    logShare(ShareProvider.CopyLink);
    copyLink({ link, shorten: true, cid: ReferralCampaignKey.SharePost });
  };

  const onSnapshot = useCallback(
    (result: SnapshotResult) => logShare(ShareProvider.Snapshot, result),
    [logShare],
  );

  return (
    <>
      <Tooltip content="Copy link">
        <Button
          aria-label="Copy link"
          icon={<CopyStateIcon copied={copied} icon={LinkIcon} />}
          onClick={onCopyLink}
          size={ButtonSize.Small}
          type="button"
          variant={ButtonVariant.Tertiary}
        />
      </Tooltip>
      <span className="contents" {...armProps}>
        <SnapshotButton
          captureOptions={() => getSnapshotCaptureOptions(cardRef.current)}
          filename={`daily-highlight-${highlight.id}`}
          onResult={onSnapshot}
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
            label={
              <SnapshotEyebrow
                gradient={HIGHLIGHTS_EYEBROW_GRADIENT}
                label="Happening now"
              />
            }
            passage={tldr}
            ref={cardRef}
            seed={highlight.id}
          />
        </div>
      )}
      <SelectionShareBar
        containerRef={tldrRef}
        link={link}
        onShare={logSelectionShare}
        seed={highlight.id}
      />
    </>
  );
}
