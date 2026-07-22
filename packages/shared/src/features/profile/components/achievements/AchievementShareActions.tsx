import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import classNames from 'classnames';
import { useMutation } from '@tanstack/react-query';
import type { Achievement } from '../../../../graphql/user/achievements';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import { DownloadIcon } from '../../../../components/icons';
import { Tooltip } from '../../../../components/tooltip/Tooltip';
import { ShareActions } from '../../../../components/share/ShareActions';
import { useLogContext } from '../../../../contexts/LogContext';
import type { Origin } from '../../../../lib/log';
import { LogEvent, TargetType } from '../../../../lib/log';
import { downloadUrl } from '../../../../lib/blob';
import { ReferralCampaignKey } from '../../../../lib/referral';
import type { ShareProvider } from '../../../../lib/share';
import {
  getAchievementDownloadFilename,
  getAchievementShareLink,
  getAchievementShareText,
} from './achievementShare';

export interface AchievementShareActionsProps {
  achievement: Achievement;
  /** Profile the achievement belongs to — the share link points at it. */
  username?: string;
  name?: string;
  isOwner?: boolean;
  origin: Origin;
  /** Peak-end moments (unlock modal) get a labelled button, lists get icons. */
  withLabels?: boolean;
  buttonSize?: ButtonSize;
  className?: string;
}

export function AchievementShareActions({
  achievement,
  username,
  name,
  isOwner = false,
  origin,
  withLabels = false,
  buttonSize = ButtonSize.Small,
  className,
}: AchievementShareActionsProps): ReactElement {
  const { logEvent } = useLogContext();
  const { mutateAsync: download, isPending: isDownloading } = useMutation({
    mutationFn: downloadUrl,
  });

  const logShare = useCallback(
    (event_name: LogEvent, provider?: ShareProvider) =>
      logEvent({
        event_name,
        target_type: TargetType.AchievementCard,
        target_id: achievement.id,
        extra: JSON.stringify({ origin, ...(provider && { provider }) }),
      }),
    [achievement.id, logEvent, origin],
  );

  const onDownload = useCallback(async () => {
    await download({
      url: achievement.image,
      filename: getAchievementDownloadFilename(achievement),
    });
    logShare(LogEvent.DownloadAchievement);
  }, [achievement, download, logShare]);

  const downloadLabel = 'Download badge';

  return (
    <div className={classNames('flex items-center gap-1', className)}>
      <Tooltip content={downloadLabel}>
        <Button
          type="button"
          variant={
            withLabels ? ButtonVariant.Secondary : ButtonVariant.Tertiary
          }
          size={buttonSize}
          icon={<DownloadIcon secondary={isDownloading} />}
          aria-label={downloadLabel}
          loading={isDownloading}
          disabled={!achievement.image}
          onClick={() => onDownload()}
        >
          {withLabels ? downloadLabel : undefined}
        </Button>
      </Tooltip>
      {!!username && (
        <ShareActions
          link={getAchievementShareLink(username)}
          text={getAchievementShareText(achievement, isOwner, name)}
          cid={ReferralCampaignKey.ShareProfile}
          label="Share this achievement"
          emailTitle={achievement.name}
          emailSummary={achievement.description}
          buttonVariant={
            withLabels ? ButtonVariant.Secondary : ButtonVariant.Tertiary
          }
          buttonSize={buttonSize}
          onShare={(provider) => logShare(LogEvent.ShareAchievement, provider)}
        />
      )}
    </div>
  );
}
