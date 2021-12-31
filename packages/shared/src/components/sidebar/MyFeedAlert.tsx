import React, { ReactElement } from 'react';
import XIcon from '@dailydotdev/shared/icons/x.svg';
import { Alerts } from '../../graphql/alerts';
import { Button } from '../buttons/Button';
import { AlertContainer, AlertCopy, Pointer } from './common';

const alertCopy = {
  default: `Psst, your feed has a new name! We've already applied your content filters to it.`,
  manual: `🎉 Your feed is ready! Click here to manage your feed's settings`,
};

export default function MyFeedAlert({
  alerts,
  hideAlert,
}: {
  alerts: Alerts;
  hideAlert: () => unknown;
}): ReactElement {
  if (alerts?.filter || (!alerts?.filter && alerts?.myFeed === null)) {
    return <></>;
  }

  return (
    <AlertContainer>
      <Pointer />
      <AlertCopy>{alertCopy[alerts.myFeed]}</AlertCopy>
      <Button
        onClick={hideAlert}
        icon={<XIcon />}
        buttonSize="xsmall"
        iconOnly
      />
    </AlertContainer>
  );
}
