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
  NotificationPromptSource,
} from '@dailydotdev/shared/src/lib/analytics';
import { ButtonSize } from '@dailydotdev/shared/src/components/buttons/Button';
import { usePersonalizedDigest } from '@dailydotdev/shared/src/hooks';
import usePersistentContext from '@dailydotdev/shared/src/hooks/usePersistentContext';
import { Loader } from '@dailydotdev/shared/src/components/Loader';
import { getAccountLayout } from '../../components/layouts/AccountLayout';
import { AccountPageContainer } from '../../components/layouts/AccountLayout/AccountPageContainer';
import AccountContentSection from '../../components/layouts/AccountLayout/AccountContentSection';

const ALERT_PUSH_KEY = 'alert_push_key';

const AccountNotificationsPage = (): ReactElement => {
  const {
    push: {
      onTogglePermission,
      isLoading,
      isSubscribed,
      isInitialized,
      isPushSupported,
    },
  } = useContext(NotificationsContext);
  const [isAlertShown, setIsAlertShown] = usePersistentContext(
    ALERT_PUSH_KEY,
    true,
  );
  const { updateUserProfile } = useProfileForm();
  const { trackEvent } = useAnalyticsContext();
  const { user } = useContext(AuthContext);
  const {
    personalizedDigest,
    isLoading: isPersonalizedDigestLoading,
    subscribePersonalizedDigest,
    unsubscribePersonalizedDigest,
  } = usePersonalizedDigest();

  const { acceptedMarketing, notificationEmail } = user ?? {};
  const emailNotification =
    acceptedMarketing || notificationEmail || !!personalizedDigest;

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

    if (value) {
      subscribePersonalizedDigest();
    } else {
      unsubscribePersonalizedDigest();
    }
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

  const onTogglePush = async () => {
    onTrackToggle(
      !isSubscribed,
      NotificationChannel.Web,
      NotificationCategory.Product,
    );
    return onTogglePermission(NotificationPromptSource.NotificationsPage);
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

  const onTogglePersonalizedDigest = async () => {
    onTrackToggle(
      !personalizedDigest,
      NotificationChannel.Email,
      NotificationCategory.Digest,
    );

    if (!personalizedDigest) {
      await subscribePersonalizedDigest();
    } else {
      await unsubscribePersonalizedDigest();
    }
  };

  const label = isSubscribed ? 'On' : 'Off';

  return (
    <AccountPageContainer title="Notifications">
      <div className="flex flex-row">
        <AccountContentSection
          className={{
            heading: 'mt-0',
            container: 'flex w-full flex-1 flex-col',
          }}
          title="Push notifications"
          description="The daily.dev notification system notifies you of important events such as replies, mentions, updates, etc."
        />
        <div className="mx-4 h-full w-px bg-theme-divider-tertiary" />
        <Switch
          data-testid="push_notification-switch"
          inputId="push_notification-switch"
          name="push_notification"
          className="w-20"
          compact={false}
          checked={isSubscribed}
          onToggle={onTogglePush}
          disabled={!isInitialized}
        >
          {isLoading ? <Loader /> : label}
        </Switch>
      </div>
      {isPushSupported && isAlertShown && isInitialized && (
        <div className="relative mt-6 w-full rounded-16 border border-theme-color-cabbage">
          <Pointer
            className="absolute -top-5 right-8"
            color={PointerColor.Cabbage}
          />
          <div className="relative flex flex-row overflow-hidden p-4">
            <p className="flex-1 break-words typo-subhead">
              Switch on push notifications so you never miss exciting
              discussions, upvotes, replies or mentions on daily.dev!
            </p>
            <img
              className="absolute right-14 top-4 hidden laptopL:flex"
              src={cloudinary.notifications.browser}
              alt="A sample browser notification"
            />
            <CloseButton
              size={ButtonSize.XSmall}
              className="ml-auto laptopL:ml-32"
              onClick={() => setIsAlertShown(false)}
            />
          </div>
        </div>
      )}
      <div className="mt-6 flex flex-row">
        <AccountContentSection
          className={{
            heading: 'mt-0',
            container: 'flex w-full flex-1 flex-col',
          }}
          title="Email notifications"
          description="Tailor your email notifications by selecting the types of emails that are important to you."
        />
        <div className="mx-4 h-full w-px bg-theme-divider-tertiary" />
        <Switch
          data-testid="email_notification-switch"
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
      <div className="mt-6 grid grid-cols-1 gap-2">
        <Checkbox
          name="new_activity"
          data-testid="new_activity-switch"
          checked={notificationEmail}
          onToggle={onToggleEmailNotification}
        >
          Activity (mentions, replies, upvotes, etc.)
        </Checkbox>
        <Checkbox
          name="marketing"
          data-testid="marketing-switch"
          checked={acceptedMarketing}
          onToggle={onToggleEmailMarketing}
        >
          Community updates
        </Checkbox>
        <Checkbox
          name="personalizedDigest"
          data-testid="personalized-digest-switch"
          checked={!!personalizedDigest}
          onToggle={onTogglePersonalizedDigest}
          disabled={isPersonalizedDigestLoading}
        >
          Personalized Weekly Digest
        </Checkbox>
        <Checkbox name="newsletter" checked disabled>
          System alerts (security, privacy, etc.)
        </Checkbox>
      </div>
    </AccountPageContainer>
  );
};

AccountNotificationsPage.getLayout = getAccountLayout;

export default AccountNotificationsPage;
