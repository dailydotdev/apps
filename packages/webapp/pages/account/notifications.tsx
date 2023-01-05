import { Checkbox } from '@dailydotdev/shared/src/components/fields/Checkbox';
import { Switch } from '@dailydotdev/shared/src/components/fields/Switch';
import React, { ReactElement, useContext } from 'react';
import classNames from 'classnames';
import { cloudinary } from '@dailydotdev/shared/src/lib/image';
import CloseButton from '@dailydotdev/shared/src/components/CloseButton';
import Pointer, {
  PointerColor,
} from '@dailydotdev/shared/src/components/alert/Pointer';
import NotificationsContext from '@dailydotdev/shared/src/contexts/NotificationsContext';
import useProfileForm from '@dailydotdev/shared/src/hooks/useProfileForm';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { useAnalyticsContext } from '@dailydotdev/shared/src/contexts/AnalyticsContext';
import {
  AnalyticsEvent,
  NotificationCategory,
  NotificationChannel,
} from '@dailydotdev/shared/src/lib/analytics';
import { getAccountLayout } from '../../components/layouts/AccountLayout';
import { AccountPageContainer } from '../../components/layouts/AccountLayout/AccountPageContainer';
import AccountContentSection from '../../components/layouts/AccountLayout/AccountContentSection';

const AccountNotificationsPage = (): ReactElement => {
  const {
    shouldShowSettingsAlert,
    onShouldShowSettingsAlert,
    onTogglePermission,
    isSubscribed,
    isInitialized,
    isNotificationSupported,
  } = useContext(NotificationsContext);
  const { updateUserProfile } = useProfileForm();
  const { trackEvent } = useAnalyticsContext();
  const { user } = useContext(AuthContext);
  const { acceptedMarketing, notificationEmail } = user ?? {};
  const emailNotification = acceptedMarketing || notificationEmail;
  const onToggleEmailSettings = () => {
    const value = !emailNotification;

    if (!value) {
      trackEvent({
        event_name: AnalyticsEvent.DisableNotification,
        extra: JSON.stringify({
          channel: NotificationChannel.Email,
          category: Object.values(NotificationCategory),
        }),
      });
    }

    updateUserProfile({
      acceptedMarketing: value,
      notificationEmail: value,
    });
  };

  const onTrackToggle = (
    isEnabled: boolean,
    channel: NotificationChannel,
    category: NotificationCategory,
  ) => {
    if (isEnabled) {
      return;
    }

    trackEvent({
      event_name: AnalyticsEvent.DisableNotification,
      extra: JSON.stringify({ channel, category }),
    });
  };

  const onTogglePush = () => {
    onTrackToggle(
      !isSubscribed,
      NotificationChannel.Web,
      NotificationCategory.Product,
    );
    onTogglePermission();
  };

  const onToggleEmailNotification = () => {
    const value = !notificationEmail;
    onTrackToggle(
      value,
      NotificationChannel.Email,
      NotificationCategory.Product,
    );
    updateUserProfile({ notificationEmail: value });
  };

  const onToggleEmailMarketing = () => {
    const value = !acceptedMarketing;
    onTrackToggle(
      value,
      NotificationChannel.Email,
      NotificationCategory.Marketing,
    );
    updateUserProfile({ acceptedMarketing: value });
  };

  return (
    <AccountPageContainer title="Notifications">
      {isNotificationSupported && (
        <div className="flex flex-row">
          <AccountContentSection
            className={{
              heading: 'mt-0',
              container: 'flex flex-col flex-1 w-full',
            }}
            title="Push notifications"
            description="The daily.dev notification system notifies you of important events such as replies, mentions, updates, etc."
          />
          <div className="mx-4 w-px h-full bg-theme-divider-tertiary" />
          <Switch
            data-testId="push_notification-switch"
            inputId="push_notification-switch"
            name="push_notification"
            className="w-20"
            compact={false}
            checked={isSubscribed}
            onToggle={onTogglePush}
            disabled={!isInitialized}
          >
            {isSubscribed ? 'On' : 'Off'}
          </Switch>
        </div>
      )}
      {isNotificationSupported && shouldShowSettingsAlert && isInitialized && (
        <div className="relative mt-6 w-full rounded-16 border border-theme-color-cabbage">
          <Pointer
            className="absolute -top-5 right-8"
            color={PointerColor.Cabbage}
          />
          <div className="flex overflow-hidden relative flex-row p-4">
            <p className="flex-1 break-words typo-subhead">
              Switch on push notifications so you never miss exciting
              discussions, upvotes, replies or mentions on daily.dev!
            </p>
            <img
              className="hidden laptopL:flex absolute top-4 right-14"
              src={cloudinary.notifications.browser}
              alt="A sample browser notification"
            />
            <CloseButton
              buttonSize="xsmall"
              className="ml-auto laptopL:ml-32"
              onClick={() => onShouldShowSettingsAlert(false)}
            />
          </div>
        </div>
      )}
      <div
        className={classNames(
          'flex flex-row',
          isNotificationSupported && 'mt-6',
        )}
      >
        <AccountContentSection
          className={{
            heading: 'mt-0',
            container: 'flex flex-col flex-1 w-full',
          }}
          title="Email notifications"
          description="Receive notifications via email so you never miss a mention, reply, upvote or comment on daily.dev"
        />
        <div className="mx-4 w-px h-full bg-theme-divider-tertiary" />
        <Switch
          data-testId="email_notification-switch"
          inputId="email_notification-switch"
          name="email_notification"
          className="w-20"
          compact={false}
          checked={emailNotification}
          onToggle={onToggleEmailSettings}
        >
          {emailNotification ? 'On' : 'Off'}
        </Switch>
      </div>
      <h3 className="mt-6 font-bold typo-callout">Send me emails for:</h3>
      <div className="grid grid-cols-1 gap-2 mt-6">
        <Checkbox
          name="new_activity"
          data-testId="new_activity-switch"
          checked={notificationEmail}
          onToggle={onToggleEmailNotification}
        >
          New activity notifications (mentions, replies, etc.)
        </Checkbox>
        <Checkbox
          name="marketing"
          data-testId="marketing-switch"
          checked={acceptedMarketing}
          onToggle={onToggleEmailMarketing}
        >
          Marketing updates
        </Checkbox>
        <Checkbox name="newsletter" checked disabled>
          Email me System notifications (security related, always on)
        </Checkbox>
      </div>
    </AccountPageContainer>
  );
};

AccountNotificationsPage.getLayout = getAccountLayout;

export default AccountNotificationsPage;
