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
  EyeIcon,
  MailIcon,
  ReadingStreakIcon,
  TelegramIcon,
  TwitterIcon,
  VIcon,
  WhatsappIcon,
} from '../icons';
import { IconSize } from '../Icon';

type StreakShareCalloutProps = {
  /** Profile or share URL the recipient will land on. */
  url: string;
  currentStreak: number;
  className?: string;
};

type ChannelKey = 'whatsapp' | 'twitter' | 'telegram' | 'email';

type Channel = {
  key: ChannelKey;
  provider: ShareProvider;
  label: string;
  icon: ReactElement;
  /**
   * Pill background uses the design system Button color tokens
   * (`btn-primary-*` classes) so dark/light mode are handled by the theme.
   */
  pillClassName: string;
};

/**
 * Build provider URLs that include both the message AND the link.
 * Works around `getWhatsappShareLink` only encoding the URL.
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
      'I read with daily.dev — you should too',
    )}&body=${encodeURIComponent(`${message}\n\n${link}`)}`;
  }
  return link;
};

/**
 * Pre-written, honest message: it tells the friend what they'll see when they
 * tap the link (the inviter's profile + streak), not a misleading "challenge"
 * that doesn't exist.
 */
const buildMessage = (currentStreak: number, name?: string): string => {
  const who = name ? `${name}` : 'I';
  if (currentStreak >= 100) {
    return `🔥 ${who} read dev content every day for ${currentStreak} days straight on daily.dev. Worth a look:`;
  }
  if (currentStreak >= 30) {
    return `🔥 ${currentStreak} days reading dev news on daily.dev — no skips. Want to give it a try?`;
  }
  return `🔥 ${currentStreak}-day reading streak on daily.dev. Read with me:`;
};

const milestoneLabel = (streak: number): string => {
  if (streak >= 100) {
    return 'Streak royalty';
  }
  if (streak >= 60) {
    return 'Unstoppable';
  }
  if (streak >= 30) {
    return 'On fire';
  }
  if (streak >= 14) {
    return 'Two weeks strong';
  }
  if (streak >= 7) {
    return 'Week strong';
  }
  return 'Building the habit';
};

const channels: Channel[] = [
  {
    key: 'whatsapp',
    provider: ShareProvider.WhatsApp,
    label: 'WhatsApp',
    icon: <WhatsappIcon size={IconSize.Small} />,
    pillClassName: 'btn-primary-whatsapp',
  },
  {
    key: 'twitter',
    provider: ShareProvider.Twitter,
    label: 'X',
    icon: <TwitterIcon size={IconSize.Small} />,
    pillClassName: 'btn-primary-twitter',
  },
  {
    key: 'telegram',
    provider: ShareProvider.Telegram,
    label: 'Telegram',
    icon: <TelegramIcon size={IconSize.Small} />,
    pillClassName: 'btn-primary-telegram',
  },
  {
    key: 'email',
    provider: ShareProvider.Email,
    label: 'Email',
    icon: <MailIcon size={IconSize.Small} />,
    pillClassName: 'btn-primary-bacon',
  },
];

export function StreakShareCallout({
  url,
  currentStreak,
  className,
}: StreakShareCalloutProps): ReactElement | null {
  const { user } = useAuthContext();
  const { logEvent } = useLogContext();
  const loggedImpression = useRef(false);
  const [showPreview, setShowPreview] = useState(false);
  const { getTrackedUrl, shareLink, isLoading } = useGetShortUrl({
    query: {
      url,
      cid: ReferralCampaignKey.ShareProfile,
      enabled: !!url && !!user?.id,
    },
  });
  const trackedUrl = getTrackedUrl(url, ReferralCampaignKey.ShareProfile);
  const link = shareLink || trackedUrl;
  const message = useMemo(
    () => buildMessage(currentStreak, user?.name?.split(' ')[0]),
    [currentStreak, user?.name],
  );
  const fullText = `${message}\n${link}`;
  const [copied, copy] = useCopyLink(() => fullText);

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
        title: `${user?.name ?? 'I'} read with daily.dev`,
        text: message,
        url: link,
      });
      logShare(ShareProvider.Native);
    } catch {
      // user cancelled
    }
  };

  const username = user.username || 'you';
  const milestone = milestoneLabel(currentStreak);

  return (
    <div className={classNames('flex w-full flex-col gap-3', className)}>
      {/* The "Trophy Card" — designed shareable visual */}
      <div className="relative overflow-hidden rounded-16 bg-gradient-to-br from-accent-bacon-default to-accent-cheese-default p-5 text-white shadow-2">
        {/* Decorative blobs */}
        <div
          aria-hidden
          className="bg-white/15 pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl"
        />
        <div
          aria-hidden
          className="bg-white/10 pointer-events-none absolute -bottom-10 -left-10 h-28 w-28 rounded-full blur-2xl"
        />

        <div className="relative flex items-start justify-between">
          <span className="bg-white/20 flex h-9 w-9 items-center justify-center rounded-10 backdrop-blur-sm">
            <ReadingStreakIcon
              secondary
              size={IconSize.XSmall}
              className="text-white"
            />
          </span>
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Caption2}
            className="!text-white/80"
          >
            daily.dev
          </Typography>
        </div>

        <div className="relative mt-4 flex items-baseline gap-2">
          <span className="font-bold leading-none text-white typo-mega3">
            {currentStreak}
          </span>
          <span className="!text-white/90 font-bold typo-callout">
            day streak
          </span>
        </div>

        <div className="relative mt-4 flex items-center justify-between">
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Caption1}
            className="!text-white/85"
          >
            @{username}
          </Typography>
          <span className="bg-white/20 rounded-full px-2 py-0.5 text-white typo-caption2">
            {milestone}
          </span>
        </div>
      </div>

      {/* Share row */}
      <div className="flex flex-col gap-2">
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          Send your streak to a friend
        </Typography>
        <div className="flex items-center justify-between gap-1.5">
          {channels.map((c) => (
            <a
              key={c.key}
              href={buildShareHref(c.key, message, link ?? url)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Share via ${c.label}`}
              onClick={() => logShare(c.provider)}
              className={classNames(
                'group flex flex-1 flex-col items-center gap-1',
                (isLoading || !link) && 'pointer-events-none opacity-50',
              )}
            >
              <span
                className={classNames(
                  'flex h-10 w-10 items-center justify-center rounded-12 transition-transform duration-200 group-hover:-translate-y-0.5',
                  c.pillClassName,
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

          <button
            type="button"
            onClick={onCopy}
            disabled={isLoading || !link}
            aria-label="Copy invite message"
            className={classNames(
              'group flex flex-1 flex-col items-center gap-1',
              (isLoading || !link) && 'pointer-events-none opacity-50',
            )}
          >
            <span
              className={classNames(
                'flex h-10 w-10 items-center justify-center rounded-12 transition-transform duration-200 group-hover:-translate-y-0.5',
                copied ? 'btn-primary-avocado' : 'btn-primary-cabbage',
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
      </div>

      {/* Preview disclosure — shows the actual outgoing message */}
      <button
        type="button"
        className="flex items-center justify-center gap-1.5 text-text-tertiary transition-colors typo-caption1 hover:text-text-primary"
        onClick={() => setShowPreview((v) => !v)}
      >
        <EyeIcon size={IconSize.XSmall} />
        {showPreview ? 'Hide message preview' : 'Preview the message'}
      </button>

      {showPreview && (
        <div className="rounded-12 rounded-bl-4 border border-border-subtlest-tertiary bg-surface-float p-3">
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
        </div>
      )}

      {canNativeShare && (
        <Button
          type="button"
          size={ButtonSize.Small}
          variant={ButtonVariant.Secondary}
          onClick={onNativeShare}
        >
          More sharing options…
        </Button>
      )}
    </div>
  );
}
