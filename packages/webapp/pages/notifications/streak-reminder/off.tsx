import type { ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import type { NextSeoProps } from 'next-seo';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import { useStreakReminder } from '@dailydotdev/shared/src/hooks/streaks/useStreakReminder';
import { useToastNotification } from '@dailydotdev/shared/src/hooks/useToastNotification';
import { LogEvent, TargetType } from '@dailydotdev/shared/src/lib/log';
import ProtectedPage from '../../../components/ProtectedPage';
import { getLayout } from '../../../components/layouts/MainLayout';
import { noindexSeoProps } from '../../../next-seo';

export const streakReminderOffToast =
  'Streak reminders are off. You can turn them back on in Settings.';
export const streakReminderOffFailedToast =
  'Could not turn off streak reminders. You can turn them off in Settings.';
export const streakReminderSettingsPath = '/settings/notifications';

const seo: NextSeoProps = { ...noindexSeoProps, title: 'Streak reminders' };

// Target of the "Turn off streak reminders" button on the streak pushes. One
// tap mutes the reminder for a signed-in reader and lands on the settings
// row that turns it back on.
const StreakReminderOffPage = (): ReactElement => {
  const router = useRouter();
  const { user } = useAuthContext();
  const { logEvent } = useLogContext();
  const { displayToast } = useToastNotification();
  const { isReady, turnOffStreakReminder } = useStreakReminder();
  const started = useRef(false);

  useEffect(() => {
    if (!user || !isReady || started.current) {
      return;
    }

    started.current = true;
    turnOffStreakReminder()
      .then(() => {
        logEvent({
          event_name: LogEvent.Click,
          target_type: TargetType.StreakReminderOptOut,
          extra: JSON.stringify({ origin: 'push' }),
        });
        displayToast(streakReminderOffToast);
      })
      .catch(() => displayToast(streakReminderOffFailedToast))
      .finally(() => router.replace(streakReminderSettingsPath));
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isReady]);

  return <ProtectedPage>{null}</ProtectedPage>;
};

StreakReminderOffPage.getLayout = getLayout;
StreakReminderOffPage.layoutProps = { seo };

export default StreakReminderOffPage;
