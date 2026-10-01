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
import { useSlackShareButton } from '../../hooks/integrations/slack/useSlackShareButton';
import { postLogEvent } from '../../lib/feed';
import { LogEvent, Origin } from '../../lib/log';
import { ReferralCampaignKey } from '../../lib/referral';
import { ShareProvider } from '../../lib/share';
import { downloadShareImage } from '../../lib/imageShare/downloadShareImage';
import {
  getShareableImageFile,
  shareImageFile,
} from '../../lib/imageShare/shareImageFile';

export interface SnapshotSharePanelProps {
  anchorRef: RefObject<HTMLElement>;
  image: Blob;
  filename: string;
  post: Post;
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
  onStart,
}: {
  post: Post;
  placement?: Origin;
  isDrawer: boolean;
  onStart: () => void;
}): ReactElement {
  const { integration, isLoading } = useSlackShare();
  const { onClick } = useSlackShareButton({
    post,
    origin: Origin.SnapshotSharePanel,
    placement,
  });

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
      <Button
        type="button"
        className="w-full"
        size={isDrawer ? ButtonSize.Medium : ButtonSize.Small}
        variant={ButtonVariant.Primary}
        icon={<SlackIcon />}
        loading={isLoading}
        disabled={isLoading}
        onClick={() => {
          onStart();
          onClick();
        }}
      >
        {integration ? 'Pick a channel' : 'Connect Slack'}
      </Button>
    </div>
  );
}

function SnapshotShareContent({
  image,
  filename,
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
  const link = post.commentsPermalink;
  const iconSize = isDrawer ? IconSize.Small : IconSize.Size16;

  useEffect(() => {
    const url = URL.createObjectURL(image);
    setThumbnail(url);

    return () => URL.revokeObjectURL(url);
  }, [image]);

  const logShare = useCallback(
    (provider: ShareProvider, extra?: Record<string, unknown>) =>
      logEvent(
        postLogEvent(LogEvent.SharePost, post, {
          extra: {
            provider,
            origin: Origin.SnapshotSharePanel,
            placement,
            ...extra,
          },
        }),
      ),
    [logEvent, placement, post],
  );

  const onCopyLink = () => {
    logShare(ShareProvider.CopyLink);
    copyLink({
      link,
      shorten: true,
      cid: ReferralCampaignKey.SharePost,
      disableToast: true,
    });
  };

  const onSocial = async (provider: ShareProvider) => {
    logShare(provider);
    await openShare({
      provider,
      link,
      text: post.title,
      cid: ReferralCampaignKey.SharePost,
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
    shareImageFile(file, getTrackedUrl(link, ReferralCampaignKey.SharePost));
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
      {isLoggedIn && (
        <SnapshotSlackRow
          isDrawer={isDrawer}
          onStart={onClose}
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
  const { post, placement } = props;

  useLogEventOnce(() =>
    postLogEvent(LogEvent.OpenSnapshotSharePanel, post, {
      extra: { placement },
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
