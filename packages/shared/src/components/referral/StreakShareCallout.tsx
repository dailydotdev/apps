import type { ReactElement } from 'react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import { useCopyLink } from '../../hooks/useCopy';
import { useGetShortUrl } from '../../hooks/utils/useGetShortUrl';
import { ReferralCampaignKey } from '../../lib/referral';
import { ShareProvider } from '../../lib/share';
import { Origin, LogEvent, TargetType } from '../../lib/log';
import { ReferralGrowthSurface } from '../../lib/referralGrowth';
import {
  CopyIcon,
  MailIcon,
  ReadingStreakIcon,
  TelegramIcon,
  TwitterIcon,
  VIcon,
  WhatsappIcon,
} from '../icons';
import { IconSize } from '../Icon';

type StreakShareCalloutProps = {
  /** Profile or share URL to invite friends to. */
  url: string;
  /** Streak count to celebrate. */
  currentStreak: number;
  className?: string;
};

type ChannelKey = 'whatsapp' | 'twitter' | 'telegram' | 'email' | 'copy';

type Channel = {
  key: ChannelKey;
  provider: ShareProvider;
  label: string;
  icon: ReactElement;
  className: string;
};

/**
 * Build a share URL that includes both the pre-written message AND the link
 * for providers that support text. This works around `getWhatsappShareLink`
 * encoding only the URL.
 */
const buildShareHref = (
  channel: ChannelKey,
  message: string,
  link: string,
): string => {
  const fullText = `${message}\n${link}`;

  if (channel === 'whatsapp') {
    return `https://wa.me/?text=${encodeURIComponent(fullText)}`;
  }

  if (channel === 'twitter') {
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      `${message} via @dailydotdev`,
    )}&url=${encodeURIComponent(link)}`;
  }

  if (channel === 'telegram') {
    return `https://t.me/share/url?url=${encodeURIComponent(
      link,
    )}&text=${encodeURIComponent(message)}`;
  }

  if (channel === 'email') {
    return `mailto:?subject=${encodeURIComponent(
      'Think you can beat my reading streak?',
    )}&body=${encodeURIComponent(`${message}\n\n${link}`)}`;
  }

  return link;
};

const buildMessage = (currentStreak: number): string => {
  const days = currentStreak === 1 ? 'day' : 'days';
  if (currentStreak >= 100) {
    return `🔥 ${currentStreak} ${days} of reading dev content every single day. Think you can hang?`;
  }
  if (currentStreak >= 30) {
    return `🔥 I'm on a ${currentStreak}-${
      days === 'days' ? 'day' : 'day'
    } reading streak on daily.dev. Bet you'd quit by day 5.`;
  }
  return `🔥 I just hit a ${currentStreak}-day reading streak on daily.dev. Think you can beat me?`;
};

export function StreakShareCallout({
  url,
  currentStreak,
  className,
}: StreakShareCalloutProps): ReactElement | null {
  const { user } = useAuthContext();
  const { logEvent } = useLogContext();
  const loggedImpression = useRef(false);
  const { getTrackedUrl, shareLink, isLoading } = useGetShortUrl({
    query: {
      url,
      cid: ReferralCampaignKey.ShareProfile,
      enabled: !!url && !!user?.id,
    },
  });
  const trackedUrl = getTrackedUrl(url, ReferralCampaignKey.ShareProfile);
  const link = shareLink || trackedUrl;
  const message = useMemo(() => buildMessage(currentStreak), [currentStreak]);
  const [copied, copy] = useCopyLink(() => `${message}\n${link}`);
  const [nativeShared, setNativeShared] = useState(false);

  const canNativeShare =
    typeof globalThis !== 'undefined' &&
    typeof globalThis.navigator?.share === 'function';

  useEffect(() => {
    if (!user?.id || !url || loggedImpression.current) {
      return;
    }

    logEvent({
      event_name: LogEvent.ReferralPromptImpression,
      target_type: TargetType.ReferralPrompt,
      target_id: ReferralGrowthSurface.StreakMilestone,
      extra: JSON.stringify({
        campaign: ReferralCampaignKey.ShareProfile,
        origin: Origin.PostContent,
        streak: currentStreak,
      }),
    });

    loggedImpression.current = true;
  }, [currentStreak, logEvent, url, user?.id]);

  if (!user?.id || !url) {
    return null;
  }

  const logShare = (provider: ShareProvider) => {
    logEvent({
      event_name: LogEvent.ReferralPromptClick,
      target_type: TargetType.ReferralPrompt,
      target_id: ReferralGrowthSurface.StreakMilestone,
      extra: JSON.stringify({
        campaign: ReferralCampaignKey.ShareProfile,
        origin: Origin.PostContent,
        provider,
        streak: currentStreak,
      }),
    });
  };

  const onCopy = () => {
    copy();
    logShare(ShareProvider.CopyLink);
  };

  const onNativeShare = async () => {
    try {
      await globalThis.navigator.share({
        title: 'Think you can beat my reading streak?',
        text: message,
        url: link,
      });
      setNativeShared(true);
      logShare(ShareProvider.Native);
    } catch {
      // User cancelled or share failed — no-op
    }
  };

  const channels: Channel[] = [
    {
      key: 'whatsapp',
      provider: ShareProvider.WhatsApp,
      label: 'WhatsApp',
      icon: <WhatsappIcon size={IconSize.Small} />,
      className: 'bg-[#25D366]/15 text-[#25D366] hover:bg-[#25D366]/25',
    },
    {
      key: 'twitter',
      provider: ShareProvider.Twitter,
      label: 'X',
      icon: <TwitterIcon size={IconSize.Small} />,
      className:
        'bg-text-primary/10 text-text-primary hover:bg-text-primary/20',
    },
    {
      key: 'telegram',
      provider: ShareProvider.Telegram,
      label: 'Telegram',
      icon: <TelegramIcon size={IconSize.Small} />,
      className: 'bg-[#229ED9]/15 text-[#229ED9] hover:bg-[#229ED9]/25',
    },
    {
      key: 'email',
      provider: ShareProvider.Email,
      label: 'Email',
      icon: <MailIcon size={IconSize.Small} />,
      className:
        'bg-text-tertiary/15 text-text-tertiary hover:bg-text-tertiary/25',
    },
  ];

  return (
    <div
      className={classNames(
        'border-accent-bacon-default/25 from-accent-bacon-default/10 to-accent-cheese-default/10 relative w-full overflow-hidden rounded-16 border bg-gradient-to-br via-surface-float p-4 text-left',
        className,
      )}
    >
      {/* Decorative glow */}
      <div className="bg-accent-bacon-default/20 pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl" />
      <div className="bg-accent-cheese-default/15 pointer-events-none absolute -bottom-12 -left-10 h-32 w-32 rounded-full blur-3xl" />

      <div className="relative flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-center gap-2.5">
          <span className="bg-accent-bacon-default/20 flex h-8 w-8 shrink-0 items-center justify-center rounded-10 text-accent-bacon-default">
            <ReadingStreakIcon secondary size={IconSize.XSmall} />
          </span>
          <div className="flex flex-col">
            <Typography bold type={TypographyType.Callout}>
              Challenge a friend
            </Typography>
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
            >
              Drop your streak — bet they can&apos;t keep up
            </Typography>
          </div>
        </div>

        {/* Chat-bubble preview of the actual outgoing message */}
        <div className="relative ml-1 rounded-16 rounded-bl-4 border border-border-subtlest-tertiary bg-surface-primary px-3.5 py-2.5">
          <Typography
            tag={TypographyTag.P}
            type={TypographyType.Footnote}
            className="whitespace-pre-line"
          >
            {message}
          </Typography>
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Caption1}
            color={TypographyColor.Link}
            className="mt-1 block truncate"
          >
            {isLoading ? 'Preparing your link…' : link}
          </Typography>
          {/* Tail of the chat bubble */}
          <span
            aria-hidden
            className="rounded-sm absolute -bottom-px -left-1.5 h-2.5 w-2.5 rotate-45 border-b border-l border-border-subtlest-tertiary bg-surface-primary"
          />
        </div>

        {/* Channel row */}
        <div className="mt-1 flex items-center justify-between gap-2">
          {channels.map((c) => (
            <a
              key={c.key}
              href={buildShareHref(c.key, message, link ?? url)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Share via ${c.label}`}
              onClick={() => logShare(c.provider)}
              className={classNames(
                'group flex flex-1 flex-col items-center gap-1.5',
                (isLoading || !link) && 'pointer-events-none opacity-50',
              )}
            >
              <span
                className={classNames(
                  'flex h-10 w-10 items-center justify-center rounded-12 transition-all duration-200 group-hover:-translate-y-0.5',
                  c.className,
                )}
              >
                {c.icon}
              </span>
              <Typography
                type={TypographyType.Caption2}
                color={TypographyColor.Tertiary}
              >
                {c.label}
              </Typography>
            </a>
          ))}

          {/* Copy is the always-available fallback */}
          <button
            type="button"
            onClick={onCopy}
            disabled={isLoading || !link}
            aria-label="Copy invite message"
            className={classNames(
              'group flex flex-1 flex-col items-center gap-1.5',
              (isLoading || !link) && 'pointer-events-none opacity-50',
            )}
          >
            <span
              className={classNames(
                'flex h-10 w-10 items-center justify-center rounded-12 transition-all duration-200 group-hover:-translate-y-0.5',
                copied
                  ? 'bg-accent-avocado-default/20 text-accent-avocado-default'
                  : 'bg-accent-cabbage-default/15 hover:bg-accent-cabbage-default/25 text-accent-cabbage-default',
              )}
            >
              {copied ? (
                <VIcon secondary size={IconSize.Small} />
              ) : (
                <CopyIcon size={IconSize.Small} />
              )}
            </span>
            <Typography
              type={TypographyType.Caption2}
              color={
                copied
                  ? TypographyColor.StatusSuccess
                  : TypographyColor.Tertiary
              }
            >
              {copied ? 'Copied!' : 'Copy'}
            </Typography>
          </button>
        </div>

        {/* Native share — surfaces on mobile only */}
        {canNativeShare && (
          <Button
            type="button"
            size={ButtonSize.Small}
            variant={ButtonVariant.Secondary}
            onClick={onNativeShare}
          >
            {nativeShared ? '✓ Shared' : 'More sharing options…'}
          </Button>
        )}
      </div>
    </div>
  );
}
