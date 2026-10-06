import type { ReactElement, RefObject } from 'react';
import React, { useCallback, useMemo } from 'react';
import { Popover, PopoverAnchor } from '@radix-ui/react-popover';
import { PopoverContent } from '../popover/Popover';
import { Drawer } from '../drawers/Drawer';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { IconSize } from '../Icon';
import { DownloadIcon } from '../icons/Download';
import { SlackIcon } from '../icons/Slack';
import { VIcon } from '../icons/V';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import { useViewSize, ViewSize } from '../../hooks/useViewSize';
import useLogEventOnce from '../../hooks/log/useLogEventOnce';
import { useObjectUrl } from '../../hooks/useObjectUrl';
import { useSlackShare } from '../../hooks/integrations/slack/useSlackShare';
import type { SlackShareSnapshot } from '../../hooks/integrations/slack/slackShareSnapshot';
import { SlackCtaButton } from '../widgets/SlackCtaButton';
import type { ShareablePost } from '../../lib/feed';
import { postLogEvent } from '../../lib/feed';
import type { TargetType } from '../../lib/log';
import { LogEvent, Origin } from '../../lib/log';
import { ShareProvider } from '../../lib/share';
import { downloadShareImage } from '../../lib/imageShare/downloadShareImage';

/**
 * How the panel logs: the same event and target the placement's own shares
 * use, so a snapshot without a post still has a subject.
 */
export interface SnapshotShare {
  event: LogEvent;
  targetId: string;
  targetType?: TargetType;
  /** Logged beside the provider on every event. */
  extra?: Record<string, unknown>;
}

export const getPostSnapshotShare = (post: ShareablePost): SnapshotShare => ({
  event: LogEvent.SharePost,
  targetId: post.id,
});

/**
 * What a snapshot is of. A post adds the Slack row and logs as the post;
 * `share`, when set, is what the panel logs.
 */
export type SnapshotSubject =
  | { post: ShareablePost; share?: SnapshotShare }
  | { post?: undefined; share: SnapshotShare };

export const getSnapshotShare = (subject: SnapshotSubject): SnapshotShare =>
  subject.post
    ? subject.share ?? getPostSnapshotShare(subject.post)
    : subject.share;

/** The subject's share event, or `eventName`, for a subject that is not a post. */
export const getShareSubjectLogEvent = (
  {
    event,
    targetId,
    targetType,
  }: Pick<SnapshotShare, 'event' | 'targetId' | 'targetType'>,
  extra: Record<string, unknown>,
  eventName: LogEvent = event,
) => ({
  event_name: eventName,
  target_id: targetId,
  target_type: targetType,
  extra: JSON.stringify(extra),
});

export type SnapshotSharePanelProps = SnapshotSubject & {
  anchorRef: RefObject<HTMLElement>;
  /** Pointer and focus inside this element leave the panel open. */
  ignoreOutsideRef?: RefObject<HTMLElement>;
  image: Blob;
  filename: string;
  /** The snapshot placement the panel opened from. */
  placement?: Origin;
  onClose: () => void;
};

function SnapshotSlackRow({
  post,
  image,
  filename,
  placement,
  extra,
  isDrawer,
  onClose,
}: {
  post: ShareablePost;
  image: Blob;
  filename: string;
  placement?: Origin;
  extra?: Record<string, unknown>;
  isDrawer: boolean;
  onClose: () => void;
}): ReactElement {
  const { integration } = useSlackShare();
  const snapshot = useMemo<SlackShareSnapshot>(
    () => ({ image, filename }),
    [image, filename],
  );

  return (
    <div className="flex flex-col gap-3 rounded-14 bg-surface-float p-3">
      <div className="flex items-start gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-10 bg-background-default">
          <SlackIcon secondary />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="font-bold typo-callout">Send it to your team</span>
          <span className="text-text-tertiary typo-footnote">
            {integration
              ? 'Send the snapshot to a Slack channel.'
              : 'Connect once, then pick a channel.'}
          </span>
        </span>
      </div>
      <SlackCtaButton
        className="w-full"
        origin={Origin.SnapshotSharePanel}
        placement={placement}
        post={post}
        snapshot={snapshot}
        extra={extra}
        size={isDrawer ? ButtonSize.Medium : ButtonSize.Small}
        onAfterClick={onClose}
      />
    </div>
  );
}

type SnapshotShareContentProps = Pick<
  SnapshotSharePanelProps,
  'image' | 'filename' | 'placement' | 'onClose'
> & {
  share: SnapshotShare;
  post?: ShareablePost;
  isDrawer: boolean;
};

const getPanelLogEvent = (
  eventName: LogEvent,
  { share, post }: Pick<SnapshotShareContentProps, 'share' | 'post'>,
  extra: Record<string, unknown>,
) =>
  post
    ? postLogEvent(eventName, post, { extra })
    : getShareSubjectLogEvent(share, extra, eventName);

function SnapshotShareContent({
  image,
  filename,
  share,
  post,
  placement,
  isDrawer,
  onClose,
}: SnapshotShareContentProps): ReactElement {
  const { isLoggedIn } = useAuthContext();
  const { logEvent } = useLogContext();
  const thumbnail = useObjectUrl(image);
  const buttonSize = isDrawer ? ButtonSize.Medium : ButtonSize.Small;

  const logShare = useCallback(
    (provider: ShareProvider, extra?: Record<string, unknown>) =>
      logEvent(
        getPanelLogEvent(
          share.event,
          { share, post },
          {
            provider,
            origin: Origin.SnapshotSharePanel,
            placement,
            ...share.extra,
            ...extra,
          },
        ),
      ),
    [logEvent, placement, post, share],
  );

  const onSave = () => {
    logShare(ShareProvider.Snapshot, { result: 'download' });
    downloadShareImage(image, filename);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        {thumbnail && (
          <img
            alt=""
            className="size-16 shrink-0 rounded-8 object-cover"
            src={thumbnail}
          />
        )}
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="flex items-center gap-1 font-bold typo-callout">
            <VIcon
              size={IconSize.Size16}
              className="text-accent-avocado-default"
            />
            Copied
          </span>
          <span className="text-text-tertiary typo-caption1">
            Paste it anywhere, or send it:
          </span>
        </span>
      </div>
      {isLoggedIn && post && (
        <SnapshotSlackRow
          extra={share.extra}
          filename={filename}
          image={image}
          isDrawer={isDrawer}
          onClose={onClose}
          placement={placement}
          post={post}
        />
      )}
      <Button
        type="button"
        className="w-full"
        size={buttonSize}
        variant={ButtonVariant.Float}
        icon={<DownloadIcon />}
        onClick={onSave}
      >
        Save image
      </Button>
    </div>
  );
}

/**
 * Where to send a snapshot once it is on the clipboard: anchored to the button
 * on larger screens, a bottom drawer on phones.
 */
export function SnapshotSharePanel({
  anchorRef,
  ignoreOutsideRef,
  image,
  filename,
  placement,
  onClose,
  ...subject
}: SnapshotSharePanelProps): ReactElement {
  const isDrawer = useViewSize(ViewSize.MobileL);
  const share = getSnapshotShare(subject);
  const { post } = subject;

  useLogEventOnce(() =>
    getPanelLogEvent(
      LogEvent.OpenSnapshotSharePanel,
      { share, post },
      { placement, ...share.extra },
    ),
  );

  const content = (
    <SnapshotShareContent
      filename={filename}
      image={image}
      isDrawer={isDrawer}
      onClose={onClose}
      placement={placement}
      post={post}
      share={share}
    />
  );

  if (isDrawer) {
    return (
      <Drawer appendOnRoot isOpen onClose={onClose}>
        {content}
      </Drawer>
    );
  }

  return (
    <Popover open onOpenChange={(open) => !open && onClose()}>
      <PopoverAnchor virtualRef={anchorRef} />
      <PopoverContent
        align="center"
        avoidCollisions
        collisionPadding={16}
        side="bottom"
        sideOffset={4}
        className="w-80 rounded-16 border border-border-subtlest-tertiary bg-background-popover p-3 shadow-2"
        onInteractOutside={(event) => {
          if (ignoreOutsideRef?.current?.contains(event.target as Node)) {
            event.preventDefault();
          }
        }}
        // The panel is portaled, but React still bubbles its clicks to the
        // card or row the button sits in.
        onClick={(event) => event.stopPropagation()}
      >
        {content}
      </PopoverContent>
    </Popover>
  );
}
