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
  buttonText = 'Copy invite link',
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
        'flex w-full flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4 text-left',
        className,
      )}
    >
      <div className="flex flex-col gap-1">
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
      <Button
        className="w-full"
        disabled={isLoading || !link}
        size={ButtonSize.Small}
        type="button"
        variant={ButtonVariant.Secondary}
        onClick={onCopy}
      >
        {copied ? 'Copied' : buttonText}
      </Button>
    </div>
  );
}
