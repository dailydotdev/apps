import type { ComponentType, ReactElement, RefObject } from 'react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Popover, PopoverAnchor } from '@radix-ui/react-popover';
import { PopoverContent } from '../popover/Popover';
import { Drawer } from '../drawers/Drawer';
import type { IconType } from '../buttons/Button';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { Tooltip } from '../tooltip/Tooltip';
import type { IconProps } from '../Icon';
import { IconSize } from '../Icon';
import { DownloadIcon } from '../icons/Download';
import { LinkIcon } from '../icons/Link';
import { LinkedInIcon } from '../icons/LinkedIn';
import { MenuIcon } from '../icons/Menu';
import { ShareIcon } from '../icons/Share';
import { SlackIcon } from '../icons/Slack';
import { TwitterIcon } from '../icons/Twitter';
import { VIcon } from '../icons/V';
import { WhatsappIcon } from '../icons/Whatsapp';
import type { Post } from '../../graphql/posts';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import { useCopyLink } from '../../hooks/useCopy';
import { useGetShortUrl } from '../../hooks/utils/useGetShortUrl';
import { useOpenShareLink } from '../../hooks/useOpenShareLink';
import { useViewSize, ViewSize } from '../../hooks/useViewSize';
import useLogEventOnce from '../../hooks/log/useLogEventOnce';
import { useSlackShare } from '../../hooks/integrations/slack/useSlackShare';
import type { SlackSharePost } from '../../hooks/integrations/slack/useSlackShareButton';
import { SlackCtaButton } from '../widgets/SlackCtaButton';
import { postLogEvent } from '../../lib/feed';
import type { TargetType } from '../../lib/log';
import { LogEvent, Origin } from '../../lib/log';
import { ReferralCampaignKey } from '../../lib/referral';
import { ShareProvider } from '../../lib/share';
import { downloadShareImage } from '../../lib/imageShare/downloadShareImage';
import {
  getShareableImageFile,
  shareImageFile,
} from '../../lib/imageShare/shareImageFile';

/**
 * What the panel links to and how it logs: the same event and target the
 * placement's own shares use, so a snapshot without a post still has a subject.
 */
export interface SnapshotShare {
  link: string;
  /** Prefilled on the networks that take a message. */
  text?: string;
  cid: ReferralCampaignKey;
  event: LogEvent;
  targetId: string;
  targetType?: TargetType;
  /** Logged beside the provider on every event. */
  extra?: Record<string, unknown>;
}

/** A post as the panel uses it, so a partial one like a highlight's fits. */
export type SnapshotSharePost = SlackSharePost &
  Pick<Post, 'commentsPermalink'>;

export const getPostSnapshotShare = (
  post: SnapshotSharePost,
): SnapshotShare => ({
  link: post.commentsPermalink,
  text: post.title,
  cid: ReferralCampaignKey.SharePost,
  event: LogEvent.SharePost,
  targetId: post.id,
});

export interface SnapshotSharePanelProps {
  anchorRef: RefObject<HTMLElement>;
  image: Blob;
  filename: string;
  share: SnapshotShare;
  /** The post the snapshot is from, which adds the Slack row. */
  post?: SnapshotSharePost;
  /** The snapshot placement the panel opened from. */
  placement?: Origin;
  onClose: () => void;
}

const socials: {
  provider: ShareProvider;
  label: string;
  Icon: ComponentType<IconProps>;
}[] = [
  { provider: ShareProvider.Twitter, label: 'X', Icon: TwitterIcon },
  { provider: ShareProvider.LinkedIn, label: 'LinkedIn', Icon: LinkedInIcon },
  { provider: ShareProvider.WhatsApp, label: 'WhatsApp', Icon: WhatsappIcon },
];

/**
 * Icon-only with a tooltip on larger screens. Tooltips never open on touch, so
 * the drawer captions each tile instead.
 */
function ShareTile({
  label,
  icon,
  isDrawer,
  onClick,
}: {
  label: string;
  icon: IconType;
  isDrawer: boolean;
  onClick: () => void;
}): ReactElement {
  const button = (
    <Button
      type="button"
      aria-label={label}
      icon={icon}
      size={isDrawer ? ButtonSize.Medium : ButtonSize.Small}
      variant={ButtonVariant.Float}
      onClick={onClick}
    />
  );

  if (!isDrawer) {
    return <Tooltip content={label}>{button}</Tooltip>;
  }

  return (
    <span className="flex flex-1 flex-col items-center gap-1">
      {button}
      <span aria-hidden className="text-text-tertiary typo-caption2">
        {label}
      </span>
    </span>
  );
}

function SnapshotSlackRow({
  post,
  placement,
  isDrawer,
  onClose,
}: {
  post: SlackSharePost;
  placement?: Origin;
  isDrawer: boolean;
  onClose: () => void;
}): ReactElement {
  const { integration } = useSlackShare();

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
              ? 'Share the post to a Slack channel.'
              : 'Connect once, then pick a channel.'}
          </span>
        </span>
      </div>
      <SlackCtaButton
        className="w-full"
        origin={Origin.SnapshotSharePanel}
        placement={placement}
        post={post}
        size={isDrawer ? ButtonSize.Medium : ButtonSize.Small}
        onAfterClick={onClose}
      />
    </div>
  );
}

const getPanelLogEvent = (
  eventName: LogEvent,
  { share, post }: Pick<SnapshotSharePanelProps, 'share' | 'post'>,
  extra: Record<string, unknown>,
) =>
  post
    ? postLogEvent(eventName, post, { extra })
    : {
        event_name: eventName,
        target_id: share.targetId,
        target_type: share.targetType,
        extra: JSON.stringify(extra),
      };

function SnapshotShareContent({
  image,
  filename,
  share,
  post,
  placement,
  isDrawer,
  onClose,
}: Omit<SnapshotSharePanelProps, 'anchorRef'> & {
  isDrawer: boolean;
}): ReactElement {
  const { isLoggedIn } = useAuthContext();
  const { logEvent } = useLogContext();
  const { getTrackedUrl } = useGetShortUrl();
  const openShare = useOpenShareLink();
  const [linkCopied, copyLink] = useCopyLink();
  const [thumbnail, setThumbnail] = useState<string>();
  const file = useMemo(
    () => getShareableImageFile(image, filename),
    [image, filename],
  );
  const { link, text, cid } = share;
  const iconSize = isDrawer ? IconSize.Small : IconSize.Size16;

  useEffect(() => {
    const url = URL.createObjectURL(image);
    setThumbnail(url);

    return () => URL.revokeObjectURL(url);
  }, [image]);

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

  const onCopyLink = () => {
    logShare(ShareProvider.CopyLink);
    copyLink({
      link,
      shorten: true,
      cid,
      disableToast: true,
    });
  };

  const onSocial = async (provider: ShareProvider) => {
    logShare(provider);
    await openShare({
      provider,
      link,
      text,
      cid,
    });
  };

  const onSave = () => {
    logShare(ShareProvider.Snapshot, { result: 'download' });
    downloadShareImage(image, filename);
  };

  const onNativeShare = () => {
    if (!file) {
      return;
    }

    logShare(ShareProvider.Native);
    shareImageFile(file, getTrackedUrl(link, cid));
  };

  const copyLinkIcon = linkCopied ? (
    <VIcon size={iconSize} />
  ) : (
    <LinkIcon size={iconSize} />
  );
  const copyLinkLabel = linkCopied ? 'Copied' : 'Copy link';

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
          <span className="font-bold typo-callout">Copied</span>
          <span className="text-text-tertiary typo-caption1">
            Paste it anywhere, or send it:
          </span>
        </span>
      </div>
      {isLoggedIn && post && (
        <SnapshotSlackRow
          isDrawer={isDrawer}
          onClose={onClose}
          placement={placement}
          post={post}
        />
      )}
      {isDrawer && file && (
        <Button
          type="button"
          className="w-full"
          size={ButtonSize.Medium}
          variant={ButtonVariant.Float}
          icon={<ShareIcon />}
          onClick={onNativeShare}
        >
          Share to apps
        </Button>
      )}
      <div className="flex items-start gap-1">
        {isDrawer ? (
          <ShareTile
            isDrawer
            icon={copyLinkIcon}
            label={copyLinkLabel}
            onClick={onCopyLink}
          />
        ) : (
          <Button
            type="button"
            className="min-w-0 flex-1"
            size={ButtonSize.Small}
            variant={ButtonVariant.Float}
            icon={copyLinkIcon}
            onClick={onCopyLink}
          >
            {copyLinkLabel}
          </Button>
        )}
        {socials.map(({ provider, label, Icon }) => (
          <ShareTile
            key={provider}
            icon={<Icon size={iconSize} />}
            isDrawer={isDrawer}
            label={label}
            onClick={() => onSocial(provider)}
          />
        ))}
        <ShareTile
          icon={<DownloadIcon size={iconSize} />}
          isDrawer={isDrawer}
          label="Save image"
          onClick={onSave}
        />
        {!isDrawer && file && (
          <ShareTile
            icon={<MenuIcon size={iconSize} className="rotate-90" />}
            isDrawer={false}
            label="More"
            onClick={onNativeShare}
          />
        )}
      </div>
    </div>
  );
}

/**
 * Where to send a snapshot once it is on the clipboard: anchored to the button
 * on larger screens, a bottom drawer on phones.
 */
export function SnapshotSharePanel({
  anchorRef,
  onClose,
  ...props
}: SnapshotSharePanelProps): ReactElement {
  const isDrawer = useViewSize(ViewSize.MobileL);
  const { placement, share } = props;

  useLogEventOnce(() =>
    getPanelLogEvent(LogEvent.OpenSnapshotSharePanel, props, {
      placement,
      ...share.extra,
    }),
  );

  const content = (
    <SnapshotShareContent {...props} isDrawer={isDrawer} onClose={onClose} />
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
        // The panel is portaled, but React still bubbles its clicks to the
        // card or row the button sits in.
        onClick={(event) => event.stopPropagation()}
      >
        {content}
      </PopoverContent>
    </Popover>
  );
}
