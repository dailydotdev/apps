import { Checkbox } from '@dailydotdev/shared/src/components/fields/Checkbox';
import { Switch } from '@dailydotdev/shared/src/components/fields/Switch';
import React, { ReactElement, useState } from 'react';
import { cloudinary } from '@dailydotdev/shared/src/lib/image';
import CloseButton from '@dailydotdev/shared/src/components/CloseButton';
import { useNotificationPreferences } from '@dailydotdev/shared/src/hooks/useNotificationPreferences';
import Pointer, {
  PointerColor,
} from '@dailydotdev/shared/src/components/alert/Pointer';
import usePersistentContext from '@dailydotdev/shared/src/hooks/usePersistentContext';
import { getAccountLayout } from '../../components/layouts/AccountLayout';
import { AccountPageContainer } from '../../components/layouts/AccountLayout/AccountPageContainer';
import AccountContentSection from '../../components/layouts/AccountLayout/AccountContentSection';

const ALERT_PUSH_KEY = 'alert_push_key';

const AccountNotificationsPage = (): ReactElement => {
  const [isAlertShown, setIsAlertShown] = usePersistentContext(
    ALERT_PUSH_KEY,
    true,
  );
  const {
    generalPreference,
    devicePreference,
    updateGeneralPreference,
    updateDevicePreference,
  } = useNotificationPreferences();
  const { marketingEmail, notificationEmail } = generalPreference;
  const { pushNotification } = devicePreference;
  const [emailNotification, setEmailNotification] = useState(
    marketingEmail || notificationEmail,
  );
  const onToggleEmailNotification = () => {
    const value = !emailNotification;
    updateGeneralPreference({
      marketingEmail: value,
      notificationEmail: value,
    });
    setEmailNotification(value);
  };

  return (
    <AccountPageContainer title="Notifications">
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
          data-testValue={pushNotification}
          inputId="push_notification-switch"
          name="push_notification"
          className="w-20"
          compact={false}
          checked={pushNotification}
          onToggle={() =>
            updateDevicePreference({ pushNotification: !pushNotification })
          }
        >
          {pushNotification ? 'On' : 'Off'}
        </Switch>
      </div>
      {isAlertShown && (
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
              className="absolute top-0 right-10"
              src={cloudinary.notifications.browser}
              alt="Preview"
            />
            <CloseButton
              buttonSize="xsmall"
              className="ml-32"
              onClick={() => setIsAlertShown(false)}
            />
          </div>
        </div>
      )}
      <div className="flex flex-row mt-6">
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
          data-testValue={emailNotification}
          onToggle={onToggleEmailNotification}
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
          data-testValue={notificationEmail}
          onToggle={() =>
            updateGeneralPreference({ notificationEmail: !notificationEmail })
          }
        >
          New activity notifications (mentions, replies, etc.)
        </Checkbox>
        <Checkbox
          name="marketing"
          data-testId="marketing-switch"
          checked={marketingEmail}
          data-testValue={marketingEmail}
          onToggle={() =>
            updateGeneralPreference({ marketingEmail: !marketingEmail })
          }
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
