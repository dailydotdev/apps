import type { ReactElement } from 'react';
import React from 'react';
import { ConnectHeader } from '@dailydotdev/shared/src/components/recruiter/ConnectHeader';
import { ConnectProgress } from '@dailydotdev/shared/src/components/recruiter/ConnectProgress';
import { ConnectSlack } from '@dailydotdev/shared/src/components/recruiter/ConnectSlack';
import { getLayout } from '../../components/layouts/RecruiterSelfServeLayout';

function RecruiterPage(): ReactElement {
  return (
    <div className="flex flex-1 flex-col">
      <ConnectHeader />
      <ConnectProgress />
      <div className="flex flex-1 justify-center bg-background-subtle p-6">
        <ConnectSlack />
      </div>
    </div>
  );
}

RecruiterPage.getLayout = getLayout;

export default RecruiterPage;
