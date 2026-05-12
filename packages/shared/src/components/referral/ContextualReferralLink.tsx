import type { ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import { useCopyLink } from '../../hooks/useCopy';
import { useGetShortUrl } from '../../hooks/utils/useGetShortUrl';
import type { ReferralCampaignKey } from '../../lib/referral';
import { ShareProvider } from '../../lib/share';
import type { Origin } from '../../lib/log';
import { LogEvent, TargetType } from '../../lib/log';
import type { ReferralGrowthSurface } from '../../lib/referralGrowth';
import { UserShareIcon, VIcon } from '../icons';
import { IconSize } from '../Icon';

type ContextualReferralLinkProps = {
  url: string;
  campaignKey: ReferralCampaignKey;
  surface: ReferralGrowthSurface;
  title: string;
  description: string;
  origin: Origin | string;
  className?: string;
  buttonText?: string;
};

export function ContextualReferralLink({
  url,
  campaignKey,
  surface,
  title,
  description,
  origin,
  className,
  buttonText = 'Copy link',
}: ContextualReferralLinkProps): ReactElement | null {
  const { user } = useAuthContext();
  const { logEvent } = useLogContext();
  const loggedImpression = useRef(false);
  const { getTrackedUrl, shareLink, isLoading } = useGetShortUrl({
    query: {
      url,
      cid: campaignKey,
      enabled: !!url && !!user?.id,
    },
  });
  const trackedUrl = getTrackedUrl(url, campaignKey);
  const link = shareLink || trackedUrl;
  const [copied, copyLink] = useCopyLink(() => link);

  useEffect(() => {
    if (!user?.id || !url || loggedImpression.current) {
      return;
    }

    logEvent({
      event_name: LogEvent.ReferralPromptImpression,
      target_type: TargetType.ReferralPrompt,
      target_id: surface,
      extra: JSON.stringify({
        campaign: campaignKey,
        origin,
      }),
    });

    loggedImpression.current = true;
  }, [campaignKey, logEvent, origin, surface, url, user?.id]);

  if (!user?.id || !url) {
    return null;
  }

  const onCopy = () => {
    copyLink();
    logEvent({
      event_name: LogEvent.ReferralPromptClick,
      target_type: TargetType.ReferralPrompt,
      target_id: surface,
      extra: JSON.stringify({
        campaign: campaignKey,
        origin,
        provider: ShareProvider.CopyLink,
      }),
    });
  };

  return (
    <div
      className={classNames(
        'border-accent-cabbage-default/20 from-accent-onion-default/5 to-accent-cabbage-default/10 relative overflow-hidden rounded-16 border bg-gradient-to-br via-surface-float p-4 text-left',
        className,
      )}
    >
      {/* Background glow */}
      <div className="bg-accent-cabbage-default/15 pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl" />

      <div className="relative flex flex-col gap-3">
        {/* Icon + copy */}
        <div className="flex items-start gap-3">
          <span className="bg-accent-cabbage-default/15 flex h-9 w-9 shrink-0 items-center justify-center rounded-12 text-accent-cabbage-default">
            <UserShareIcon size={IconSize.Small} />
          </span>
          <div className="flex flex-col gap-0.5">
            <Typography bold type={TypographyType.Callout}>
              {title}
            </Typography>
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              {description}
            </Typography>
          </div>
        </div>

        {/* URL display + inline copy button */}
        <div className="flex items-center gap-2 rounded-10 border border-border-subtlest-tertiary bg-surface-primary py-1.5 pl-3 pr-1.5">
          <span className="min-w-0 flex-1 truncate text-text-tertiary typo-caption1">
            {isLoading ? 'Preparing your link…' : link ?? url}
          </span>
          <Button
            size={ButtonSize.XSmall}
            type="button"
            variant={copied ? ButtonVariant.Primary : ButtonVariant.Secondary}
            icon={
              copied ? <VIcon secondary size={IconSize.XSmall} /> : undefined
            }
            onClick={onCopy}
            disabled={isLoading || !link}
          >
            {copied ? 'Copied!' : buttonText}
          </Button>
        </div>
      </div>
    </div>
  );
}
