import type { ReactElement } from 'react';
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  DownloadIcon,
  LinkIcon,
} from '@dailydotdev/shared/src/components/icons';
import type { CreatorAchievement } from '@dailydotdev/shared/src/graphql/creatorAchievements';
import {
  getCreatorAchievementCardUrl,
  shareCreatorAchievement,
  unshareCreatorAchievement,
} from '@dailydotdev/shared/src/graphql/creatorAchievements';
import {
  ToastType,
  useToastNotification,
} from '@dailydotdev/shared/src/hooks/useToastNotification';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import { LogEvent } from '@dailydotdev/shared/src/lib/log';
import { ShareProvider } from '@dailydotdev/shared/src/lib/share';
import { downloadUrl } from '@dailydotdev/shared/src/lib/blob';
import { apiUrl } from '@dailydotdev/shared/src/lib/config';
import { RequestKey } from '@dailydotdev/shared/src/lib/query';
import { ClientError } from 'graphql-request';
import { achievementTitle } from './achievements';

const notShareableMessage = '❌ This achievement can no longer be shared';

// The share mutation fails as not found for an award that stopped standing or
// is about an article that is not public; everything else is the browser.
const isShareRefused = (error: unknown): boolean =>
  error instanceof ClientError;

/**
 * Put text on the clipboard that is only known once a request resolves.
 *
 * Safari refuses a clipboard write that happens after the click's task has
 * ended, so where it is supported the write is started synchronously with a
 * promise for its content, and only falls back to awaiting first elsewhere.
 */
const copyPendingText = async (text: Promise<string>): Promise<void> => {
  if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
    await navigator.clipboard.write([
      new ClipboardItem({
        'text/plain': text.then(
          (value) => new Blob([value], { type: 'text/plain' }),
        ),
      }),
    ]);

    return;
  }

  await navigator.clipboard.writeText(await text);
};

interface CreatorAchievementShareActionsProps {
  achievement: CreatorAchievement;
}

/**
 * Copy link / Download card for one achievement.
 *
 * Both actions are the creator's explicit decision to make the award public:
 * the first one shares it, and the page and card only ever show the public
 * record — a milestone's threshold, never the analytics behind it. The logged
 * events say an action was taken, not that anything was posted anywhere.
 */
export const CreatorAchievementShareActions = ({
  achievement,
}: CreatorAchievementShareActionsProps): ReactElement => {
  const queryClient = useQueryClient();
  const { displayToast } = useToastNotification();
  const { logEvent } = useLogContext();
  const [shareUrl, setShareUrl] = useState(achievement.shareUrl);

  const logShare = (provider: ShareProvider) =>
    logEvent({
      event_name: LogEvent.ShareCreatorAchievement,
      target_id: achievement.id,
      extra: JSON.stringify({ provider, type: achievement.type }),
    });

  const onShared = (url: string) => {
    setShareUrl(url);
    queryClient.invalidateQueries({
      queryKey: [RequestKey.CreatorAchievements],
    });
  };

  // Resolves the public link, sharing the award first if this is the first
  // time. Kept as a promise so a copy can start before it settles.
  const ensureShared = (): Promise<string> => {
    if (shareUrl) {
      return Promise.resolve(shareUrl);
    }

    return shareCreatorAchievement(achievement.id).then((url) => {
      onShared(url);

      return url;
    });
  };

  const { mutate: copyLink, isPending: isCopying } = useMutation({
    mutationFn: () => copyPendingText(ensureShared()),
    onSuccess: () => {
      displayToast('✅ Copied link to clipboard');
      logShare(ShareProvider.CopyLink);
    },
    onError: (error) => {
      displayToast(
        isShareRefused(error)
          ? notShareableMessage
          : '❌ Your browser blocked the clipboard',
        { variant: ToastType.Error },
      );
    },
  });

  const { mutate: downloadCard, isPending: isDownloading } = useMutation({
    mutationFn: async () => {
      await ensureShared();
      await downloadUrl({
        url: getCreatorAchievementCardUrl(achievement.id, apiUrl),
        filename: `daily.dev - ${
          achievementTitle(achievement) ?? 'achievement'
        }.png`,
      });
    },
    onSuccess: () => {
      displayToast('✅ Card downloaded');
      logShare(ShareProvider.DownloadCard);
    },
    onError: (error) => {
      displayToast(
        isShareRefused(error)
          ? notShareableMessage
          : '❌ Could not download the card',
        { variant: ToastType.Error },
      );
    },
  });

  const { mutate: stopSharing, isPending: isUnsharing } = useMutation({
    mutationFn: () => unshareCreatorAchievement(achievement.id),
    onSuccess: () => {
      setShareUrl(null);
      queryClient.invalidateQueries({
        queryKey: [RequestKey.CreatorAchievements],
      });
      displayToast('Achievement is private again');
      logEvent({
        event_name: LogEvent.UnshareCreatorAchievement,
        target_id: achievement.id,
        extra: JSON.stringify({ type: achievement.type }),
      });
    },
    onError: () => {
      displayToast('❌ Could not stop sharing', { variant: ToastType.Error });
    },
  });

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row flex-wrap items-center gap-2">
        <Button
          type="button"
          variant={ButtonVariant.Float}
          size={ButtonSize.Small}
          icon={<LinkIcon />}
          onClick={() => copyLink()}
          loading={isCopying}
        >
          Copy link
        </Button>
        <Button
          type="button"
          variant={ButtonVariant.Float}
          size={ButtonSize.Small}
          icon={<DownloadIcon />}
          onClick={() => downloadCard()}
          loading={isDownloading}
        >
          Download card
        </Button>
        {!!shareUrl && (
          <Button
            type="button"
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            onClick={() => stopSharing()}
            loading={isUnsharing}
          >
            Stop sharing
          </Button>
        )}
      </div>
      <Typography
        type={TypographyType.Caption1}
        color={TypographyColor.Tertiary}
      >
        {shareUrl
          ? 'Anyone with the link can see this achievement.'
          : 'Sharing makes this achievement visible to anyone with the link. Your analytics stay private.'}
      </Typography>
    </div>
  );
};
