import { Checkbox } from '@dailydotdev/shared/src/components/fields/Checkbox';
import { Switch } from '@dailydotdev/shared/src/components/fields/Switch';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import useProfileForm from '@dailydotdev/shared/src/hooks/useProfileForm';
import React, { ReactElement, useContext, useState } from 'react';
import { getAccountLayout } from '../../components/layouts/AccountLayout';
import { AccountPageContainer } from '../../components/layouts/AccountLayout/AccountPageContainer';
import AccountContentSection from '../../components/layouts/AccountLayout/AccountContentSection';

const AccountNotificationsPage = (): ReactElement => {
  const { user } = useContext(AuthContext);
  const { updateUserProfile } = useProfileForm();
  const { pushNotification, acceptedMarketing, newActivityEmail } = user ?? {};
  const [emailNotification, setEmailNotification] = useState(
    acceptedMarketing || newActivityEmail,
  );
  const onToggleEmailNotification = () => {
    const value = !emailNotification;
    updateUserProfile({ acceptedMarketing: value, newActivityEmail: value });
    setEmailNotification(value);
  };

  return (
    <AccountPageContainer title="Other Settings">
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
          inputId="push_notification-switch"
          name="push_notification"
          className="w-20"
          compact={false}
          checked={pushNotification}
          onToggle={() =>
            updateUserProfile({ pushNotification: !pushNotification })
          }
        >
          {pushNotification ? 'On' : 'Off'}
        </Switch>
      </div>
      <div className="my-6">Pointer</div>
      <div className="flex flex-row">
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
          inputId="email_notification-switch"
          name="email_notification"
          className="w-20"
          compact={false}
          checked={emailNotification}
          onToggle={onToggleEmailNotification}
        >
          {emailNotification ? 'On' : 'Off'}
        </Switch>
      </div>
      <h3 className="mt-6 font-bold typo-callout">Send me emails for:</h3>
      <div className="grid grid-cols-1 gap-2 mt-6">
        <Checkbox
          name="new_activity"
          checked={newActivityEmail}
          onToggle={() =>
            updateUserProfile({ newActivityEmail: !newActivityEmail })
          }
        >
          New activity notifications (mentions, replies, etc.)
        </Checkbox>
        <Checkbox
          name="marketing"
          checked={acceptedMarketing}
          onToggle={() =>
            updateUserProfile({ acceptedMarketing: !acceptedMarketing })
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
