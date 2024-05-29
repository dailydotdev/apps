import React, { ReactElement } from 'react';
import Link from 'next/link';
import Alert, { AlertProps, AlertType } from '../widgets/Alert';
import { webappUrl } from '../../lib/constants';

export type ReputationAlertProps = Omit<AlertProps, 'type' | 'title'>;

export const ReputationAlert = (props: ReputationAlertProps): ReactElement => {
  return (
    <Alert
      {...props}
      type={AlertType.Error}
      title={
        <div className="block flex-1" data-testid="reputationAlert">
          You do not have enough reputation to use this feature yet. However,
          you can{' '}
          <Link href={`${webappUrl}squads/new`}>
            <a className="font-bold underline">create a Squad</a>
          </Link>{' '}
          instead where you can share your favorite content , invite your
          friends and colleagues and a lot more!
        </div>
      }
    />
  );
};
