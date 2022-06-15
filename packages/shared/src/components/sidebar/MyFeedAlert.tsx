import React, { ReactElement } from 'react';
import XIcon from '../icons/Close';
import { Alerts } from '../../graphql/alerts';
import { Button } from '../buttons/Button';
import { AlertContainer, AlertCopy } from './common';
import { Pointer, PointerColor } from '../Pointer';

const alertCopy = {
  migrated: `Psst, your feed has a new name! We've already applied your content filters to it.`,
  created: `🎉 Your feed is ready! Click here to manage your feed's settings`,
};

interface MyFeedAlertProps {
  alerts: Alerts;
  hideAlert: () => unknown;
}
export default function MyFeedAlert({
  alerts,
  hideAlert,
}: MyFeedAlertProps): ReactElement {
  return (
    <AlertContainer>
      <Pointer className="top-1 -right-7" color={PointerColor.Success} />
      <AlertCopy>
        {alertCopy[alerts.myFeed]}
        {alerts.myFeed === 'migrated' && (
          <a
            className="hover:underline text-theme-label-link"
            href="https://docs.daily.dev/docs/key-features/default-feeds#my-feed"
            target="_blank"
            rel="noopener"
          >
            {' '}
            Learn more.
          </a>
        )}
      </AlertCopy>
      <Button
        data-testid="alert-close"
        onClick={hideAlert}
        icon={<XIcon />}
        buttonSize="xsmall"
        iconOnly
        className="btn-tertiary"
      />
    </AlertContainer>
  );
}
