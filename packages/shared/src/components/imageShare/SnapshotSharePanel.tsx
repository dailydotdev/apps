import type { ComponentType, ReactElement, RefObject } from 'react';
import React, { useCallback, useMemo, useState } from 'react';
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
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import { useCopyLink } from '../../hooks/useCopy';
import { useToastNotification } from '../../hooks/useToastNotification';
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
import { ReferralCampaignKey } from '../../lib/referral';
import { getImagePostComposerLink, ShareProvider } from '../../lib/share';
import { isAppleDevice, isMobile } from '../../lib/func';
import { copyShareImage } from '../../lib/imageShare/copyShareImage';
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
  cid: ReferralCampaignKey;
  event: LogEvent;
  targetId: string;
  targetType?: TargetType;
  /** Logged beside the provider on every event. */
  extra?: Record<string, unknown>;
}

export const getPostSnapshotShare = (post: ShareablePost): SnapshotShare => ({
  link: post.commentsPermalink,
  cid: ReferralCampaignKey.SharePost,
  event: LogEvent.SharePost,
  targetId: post.id,
});

/**
 * What a snapshot is of. A post adds the Slack row and logs as the post;
 * `share`, when set, is what gets linked.
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

type ImageSocialProvider =
  | ShareProvider.Twitter
  | ShareProvider.LinkedIn
  | ShareProvider.WhatsApp;

const socials: {
  provider: ImageSocialProvider;
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
  const { displayToast } = useToastNotification();
  const [linkCopied, copyLink] = useCopyLink();
  const thumbnail = useObjectUrl(image);
  const file = useMemo(
    () => getShareableImageFile(image, filename),
    [image, filename],
  );
  const { link, cid } = share;
  const iconSize = isDrawer ? IconSize.Small : IconSize.Size16;
  const [pasteTarget, setPasteTarget] = useState<{
    provider: ImageSocialProvider;
    isCopied: boolean;
  }>();
  const pasteKeys = isAppleDevice() ? '⌘V' : 'Ctrl+V';
  const pasteTargetLabel = socials.find(
    ({ provider }) => provider === pasteTarget?.provider,
  )?.label;

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

  // The image alone is the share. Share pages only take a link, so it goes
  // the way that carries a file: on phones the system sheet, which lists the
  // apps; on desktop the clipboard and the network's empty composer, since a
  // desktop sheet (Safari on macOS) offers AirDrop and Mail, not the network.
  const onSocial = async (provider: ImageSocialProvider) => {
    if (file && isMobile()) {
      logShare(provider, { method: 'share_sheet' });
      await shareImageFile(file);

      return;
    }

    // The write finishes before the composer takes focus: Safari drops a
    // clipboard write whose page has already lost it.
    const isCopied = await copyShareImage(Promise.resolve(image));
    logShare(provider, { method: isCopied ? 'paste' : 'download' });

    if (!isCopied) {
      downloadShareImage(image, filename);
    }

    setPasteTarget({ provider, isCopied });
    const composer = getImagePostComposerLink(provider);
    const tab = globalThis.window?.open(composer, '_blank');
    const label = socials.find((social) => social.provider === provider)?.label;
    displayToast(
      isCopied
        ? `Image copied. Press ${pasteKeys} to add it to your post.`
        : 'Image saved. Attach it to your post.',
      // Safari can block a tab opened after the copy finished; one more tap
      // from the toast is a fresh gesture it allows.
      !tab
        ? {
            action: {
              copy: `Open ${label}`,
              onClick: () => globalThis.window?.open(composer, '_blank'),
            },
          }
        : undefined,
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
    shareImageFile(file);
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
          <span className="flex items-center gap-1 font-bold typo-callout">
            <VIcon
              size={IconSize.Size16}
              className="text-accent-avocado-default"
            />
            Copied
          </span>
          {pasteTarget ? (
            <span className="font-bold text-accent-avocado-default typo-caption1">
              {pasteTarget.isCopied
                ? `Image copied. Press ${pasteKeys} in ${pasteTargetLabel} to add it.`
                : `Image saved. Attach it in ${pasteTargetLabel}.`}
            </span>
          ) : (
            <span className="text-text-tertiary typo-caption1">
              Paste it anywhere, or send it:
            </span>
          )}
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
            icon={
              pasteTarget?.provider === provider ? (
                <VIcon
                  size={iconSize}
                  className="text-accent-avocado-default"
                />
              ) : (
                <Icon size={iconSize} />
              )
            }
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
