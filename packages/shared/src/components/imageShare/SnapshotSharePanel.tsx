import type { ComponentType, ReactElement, RefObject } from 'react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Popover, PopoverAnchor } from '@radix-ui/react-popover';
import { PopoverContent } from '../popover/Popover';
import { Drawer } from '../drawers/Drawer';
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
import { useViewSize, ViewSize } from '../../hooks/useViewSize';
import useLogEventOnce from '../../hooks/log/useLogEventOnce';
import { useSlackShare } from '../../hooks/integrations/slack/useSlackShare';
import { useSlackShareButton } from '../../hooks/integrations/slack/useSlackShareButton';
import { postLogEvent } from '../../lib/feed';
import { LogEvent, Origin } from '../../lib/log';
import { ReferralCampaignKey } from '../../lib/referral';
import { getShareLink, ShareProvider } from '../../lib/share';
import { downloadShareImage } from '../../lib/imageShare/downloadShareImage';
import {
  getShareableImageFile,
  shareImageFile,
} from '../../lib/imageShare/shareImageFile';

export interface SnapshotSharePanelProps {
  anchorRef: RefObject<HTMLElement>;
  image: Blob;
  filename: string;
  /** Without a post there is nothing to link to or send to Slack. */
  post?: Post;
  /** The placement the snapshot was taken from. */
  origin?: Origin;
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

const tileProps = {
  type: 'button' as const,
  size: ButtonSize.Small,
  variant: ButtonVariant.Float,
};

function SnapshotSlackRow({
  post,
  isDrawer,
  onStart,
}: {
  post: Post;
  isDrawer: boolean;
  onStart: () => void;
}): ReactElement | null {
  const { integration, isLoading } = useSlackShare();
  const { onClick } = useSlackShareButton({
    post,
    origin: Origin.SnapshotSharePanel,
  });

  if (isLoading) {
    return null;
  }

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
              : 'Connect once, then one tap per share.'}
          </span>
        </span>
      </div>
      <Button
        type="button"
        className="w-full"
        size={isDrawer ? ButtonSize.Medium : ButtonSize.Small}
        variant={ButtonVariant.Primary}
        icon={<SlackIcon />}
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
  origin,
  isDrawer,
  onClose,
}: Omit<SnapshotSharePanelProps, 'anchorRef'> & {
  isDrawer: boolean;
}): ReactElement {
  const { isLoggedIn } = useAuthContext();
  const { logEvent } = useLogContext();
  const { getShortUrl, getTrackedUrl } = useGetShortUrl();
  const [linkCopied, copyLink] = useCopyLink();
  const [thumbnail, setThumbnail] = useState<string>();
  const file = useMemo(
    () => getShareableImageFile(image, filename),
    [image, filename],
  );
  const link = post?.commentsPermalink;

  useEffect(() => {
    const url = URL.createObjectURL(image);
    setThumbnail(url);

    return () => URL.revokeObjectURL(url);
  }, [image]);

  const logShare = useCallback(
    (provider: ShareProvider, extra?: Record<string, unknown>) => {
      const attribution = {
        provider,
        origin: Origin.SnapshotSharePanel,
        placement: origin,
        ...extra,
      };

      logEvent(
        post
          ? postLogEvent(LogEvent.SharePost, post, { extra: attribution })
          : {
              event_name: LogEvent.SharePost,
              extra: JSON.stringify(attribution),
            },
      );
    },
    [logEvent, origin, post],
  );

  const onCopyLink = () => {
    if (!link) {
      return;
    }

    logShare(ShareProvider.CopyLink);
    copyLink({
      link,
      shorten: true,
      cid: ReferralCampaignKey.SharePost,
      disableToast: true,
    });
  };

  const onSocial = async (provider: ShareProvider) => {
    if (!link) {
      return;
    }

    logShare(provider);
    const shortLink = await getShortUrl(link, ReferralCampaignKey.SharePost);
    window.open(
      getShareLink({ provider, link: shortLink, text: post?.title ?? '' }),
      '_blank',
    );
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
    shareImageFile(
      file,
      link ? getTrackedUrl(link, ReferralCampaignKey.SharePost) : undefined,
    );
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
          <span className="font-bold typo-callout">Copied</span>
          <span className="text-text-tertiary typo-caption1">
            Paste it anywhere, or send it:
          </span>
        </span>
      </div>
      {isLoggedIn && post && (
        <SnapshotSlackRow isDrawer={isDrawer} onStart={onClose} post={post} />
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
      <div className="flex items-center gap-1">
        {link && (
          <Button
            {...tileProps}
            className="min-w-0 flex-1"
            icon={
              linkCopied ? (
                <VIcon size={IconSize.Size16} />
              ) : (
                <LinkIcon size={IconSize.Size16} />
              )
            }
            onClick={onCopyLink}
          >
            {linkCopied ? 'Copied' : 'Copy link'}
          </Button>
        )}
        {link &&
          socials.map(({ provider, label, Icon }) => (
            <Tooltip key={provider} content={label}>
              <Button
                {...tileProps}
                aria-label={label}
                icon={<Icon size={IconSize.Size16} />}
                onClick={() => onSocial(provider)}
              />
            </Tooltip>
          ))}
        <Tooltip content="Save image">
          <Button
            {...tileProps}
            aria-label="Save image"
            icon={<DownloadIcon size={IconSize.Size16} />}
            onClick={onSave}
          />
        </Tooltip>
        {!isDrawer && file && (
          <Tooltip content="More">
            <Button
              {...tileProps}
              aria-label="More"
              icon={<MenuIcon size={IconSize.Size16} className="rotate-90" />}
              onClick={onNativeShare}
            />
          </Tooltip>
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
  const { post, origin } = props;

  useLogEventOnce(() => {
    const extra = { origin };

    return post
      ? postLogEvent(LogEvent.OpenSnapshotSharePanel, post, { extra })
      : {
          event_name: LogEvent.OpenSnapshotSharePanel,
          extra: JSON.stringify(extra),
        };
  });

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
