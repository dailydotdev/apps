import type { ReactElement } from 'react';
import React from 'react';
import { ConnectHeader } from '@dailydotdev/shared/src/components/recruiter/ConnectHeader';
import { ConnectProgress } from '@dailydotdev/shared/src/components/recruiter/ConnectProgress';
import { getLayout } from '../../components/layouts/RecruiterSelfServeLayout';

function RecruiterPage(): ReactElement {
  return (
    <div className="flex flex-1 flex-col">
      <ConnectHeader />
      <ConnectProgress />
      <div className="flex flex-1 bg-background-subtle p-6">
        <p>Copy here</p>
      </div>
    </div>
  );
}

RecruiterPage.getLayout = getLayout;

export default RecruiterPage;
