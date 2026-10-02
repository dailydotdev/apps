import type { ReactElement } from 'react';
import React, { useState } from 'react';
import type { SlackChannel, SlackDigest } from '../../graphql/integrations';
import { Checkbox } from '../fields/Checkbox';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { VIcon } from '../icons';
import { IconSize } from '../Icon';
import { useSlackDigests } from '../../hooks/integrations/slack/useSlackDigests';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import { useToastNotification } from '../../hooks/useToastNotification';
import { getUserInitialTimezone } from '../../lib/timezones';
import {
  defaultSlackDigestSchedule,
  getSlackChannelLabel,
  slackDigestWeekdays,
} from '../../lib/integrations';
import { LogEvent, Origin } from '../../lib/log';

export type SlackDigestOptInProps = {
  integrationId: string;
  channel: SlackChannel;
};

const { weekday, hour } = defaultSlackDigestSchedule;

export const SlackDigestOptIn = ({
  integrationId,
  channel,
}: SlackDigestOptInProps): ReactElement => {
  const { user } = useAuthContext();
  const { logEvent } = useLogContext();
  const { displayToast } = useToastNotification();
  const { digests, isSuccess, upsertDigest, deleteDigest, isSaving } =
    useSlackDigests({ integrationId });
  const [digest, setDigest] = useState<SlackDigest>();
  const hasOtherDigest = digests?.some(
    ({ id, channelId }) => channelId === channel.id && id !== digest?.id,
  );

  const onToggle = async (checked: boolean) => {
    try {
      if (!checked) {
        if (digest) {
          await deleteDigest(digest.id);
          logEvent({
            event_name: LogEvent.DeleteSlackDigest,
            target_id: digest.id,
            extra: JSON.stringify({ origin: Origin.Share }),
          });
        }
        setDigest(undefined);
        return;
      }

      const created = await upsertDigest({
        integrationId,
        channelId: channel.id,
        weekday,
        hour,
        timezone: getUserInitialTimezone({ userTimezone: user?.timezone }),
        tags: [],
        includeTeamStats: true,
      });
      setDigest(created);
      logEvent({
        event_name: LogEvent.CreateSlackDigest,
        target_id: created.id,
        extra: JSON.stringify({ origin: Origin.Share }),
      });
    } catch {
      displayToast('Could not update the digest, please try again');
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <Typography
        className="flex items-center gap-2"
        type={TypographyType.Callout}
        color={TypographyColor.StatusSuccess}
      >
        <VIcon size={IconSize.Size16} />
        Sent. Your team will see it now.
      </Typography>
      {isSuccess && !hasOtherDigest && (
        <>
          <Checkbox
            name="slack-digest"
            className="!items-start !p-0"
            checked={!!digest}
            disabled={isSaving}
            onToggleCallback={onToggle}
          >
            <span className="flex flex-col gap-1">
              <Typography
                tag={TypographyTag.Span}
                type={TypographyType.Callout}
                color={TypographyColor.Primary}
                bold
              >
                Also post a weekly digest in{' '}
                {getSlackChannelLabel(channel.name)}
              </Typography>
              <Typography
                tag={TypographyTag.Span}
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
              >
                Mondays at 9:00: the three posts your team read and shared most.
                Counts only, nobody is named for what they read.
              </Typography>
            </span>
          </Checkbox>
          {!!digest && (
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Secondary}
            >
              First digest: {slackDigestWeekdays[weekday]} {hour}:00 · Change it
              in Settings → Integrations
            </Typography>
          )}
        </>
      )}
    </div>
  );
};
