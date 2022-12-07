import React, { ReactElement, useContext, useState } from 'react';
import usePersistentContext from '../../hooks/usePersistentContext';
import { Button } from '../buttons/Button';
import NotificationsContext from '../../contexts/NotificationsContext';
import { cloudinary } from '../../lib/image';
import VIcon from '../icons/V';
import { webappUrl } from '../../lib/constants';

const DISMISS_BROWSER_PERMISSION = 'dismissBrowserPermission';

function EnableNotification(): ReactElement {
  const [isEnabled, setIsEnabled] = useState(false);
  const { hasPermission, requestPermission } = useContext(NotificationsContext);
  const [dismissed, setDismissed, isLoaded] = usePersistentContext(
    DISMISS_BROWSER_PERMISSION,
    false,
  );

  const onEnable = async () => {
    const permission = await requestPermission();

    setIsEnabled(permission === 'granted');
  };

  if (!isLoaded || dismissed || (hasPermission && !isEnabled)) {
    return null;
  }

  return (
    <div className="relative py-4 px-6 w-full bg-theme-float border-l typo-callout border-l-theme-color-cabbage">
      <span className="flex flex-row font-bold">
        {isEnabled && <VIcon className="mr-2" />}
        {`Push notifications${isEnabled ? ' successfully enabled' : ''}`}
      </span>
      {isEnabled ? (
        <p>
          Changing your{' '}
          <a href={`${webappUrl}account/notifications`}>
            notification settings
          </a>{' '}
          can be done anytime through your account details
        </p>
      ) : (
        <p className="mt-2 w-full tablet:w-3/5 text-theme-label-tertiary">
          Stay in the loop whenever you get a mention, reply and other important
          updates.
        </p>
      )}
      <span className="flex flex-row gap-4 mt-4">
        <Button
          buttonSize="small"
          className="w-28 btn-primary-cabbage"
          onClick={onEnable}
        >
          Enable
        </Button>
        <Button
          buttonSize="small"
          className="w-28 btn-tertiary"
          onClick={() => setDismissed(true)}
        >
          Dismiss
        </Button>
      </span>
      <img
        className="hidden tablet:flex absolute top-2 right-0"
        src={cloudinary.notifications.browser}
        alt="A sample browser notification"
      />
    </div>
  );
}

export default EnableNotification;
