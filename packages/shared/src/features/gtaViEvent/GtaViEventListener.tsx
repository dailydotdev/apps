import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { ActionType } from '../../graphql/actions';
import { useActions } from '../../hooks/useActions';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';
import { useReadingStreak } from '../../hooks/streaks/useReadingStreak';
import { featureGtaViEvent } from '../../lib/featureManagement';
import { DEFAULT_TIMEZONE } from '../../lib/timezones';
import { isGtaViReleaseDay } from '../../components/streak/popup/GtaViDay';

const GtaViEventUnlocker = (): null => {
  const { user } = useAuthContext();
  const timezone = user?.timezone ?? DEFAULT_TIMEZONE;
  const { streak } = useReadingStreak();
  const { completeAction, isActionsFetched } = useActions();
  const hasReadToday =
    !!streak?.lastViewAt &&
    isGtaViReleaseDay(new Date(streak.lastViewAt), timezone);

  useEffect(() => {
    if (!isActionsFetched) {
      return;
    }

    completeAction(ActionType.GtaViVisit);
  }, [isActionsFetched, completeAction]);

  useEffect(() => {
    if (!isActionsFetched || !hasReadToday) {
      return;
    }

    completeAction(ActionType.GtaViRead);
  }, [isActionsFetched, hasReadToday, completeAction]);

  return null;
};

export function GtaViEventListener(): ReactElement | null {
  const { isAuthReady, isLoggedIn, user } = useAuthContext();
  const isEventDay =
    isAuthReady &&
    isLoggedIn &&
    isGtaViReleaseDay(new Date(), user?.timezone ?? DEFAULT_TIMEZONE);
  const { value: isEnabled } = useConditionalFeature({
    feature: featureGtaViEvent,
    shouldEvaluate: isEventDay,
  });

  if (!isEventDay || !isEnabled) {
    return null;
  }

  return <GtaViEventUnlocker />;
}
