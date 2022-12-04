import classNames from 'classnames';
import React, { ReactElement } from 'react';
import usePersistentContext from '../../hooks/usePersistentContext';
import useNotification from '../../hooks/useNotification';
import { getFadedBackground } from '../../lib/styling';
import { Button } from '../buttons/Button';

const DISMISS_BROWSER_PERMISSION = 'dismissBrowserPermission';

function EnableNotification(): ReactElement {
  const { hasPermission, requestPermission } = useNotification();
  const [dismissed, setDismissed, isLoaded] = usePersistentContext(
    DISMISS_BROWSER_PERMISSION,
    false,
  );

  if (!isLoaded || dismissed || hasPermission) {
    return null;
  }

  return (
    <div
      className={classNames(
        getFadedBackground('before:bg-theme-overlay-cabbage'),
        'relative w-full py-4 px-6 typo-callout border-l border-l-theme-color-cabbage',
      )}
    >
      <span className="font-bold">Push notifications</span>
      <p className="mt-2 w-3/5 text-theme-label-tertiary">
        Stay in the loop whenever you get a mention, reply and other important
        updates.
      </p>
      <span className="flex flex-row gap-4 mt-4">
        <Button
          buttonSize="small"
          className="w-28 btn-primary-cabbage"
          onClick={requestPermission}
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
        className="absolute top-2 right-0"
        src="/browser_notification.png"
        alt="A sample browser notification"
      />
    </div>
  );
}

export default EnableNotification;
