import type { ReactElement } from 'react';
import React from 'react';
import { AuthDataProvider } from '../../contexts/AuthDataContext';
import AuthOptionsInner from './AuthOptionsInner';
import type { AuthOptionsProps } from './common';

function AuthOptions({
  initialEmail = '',
  ...props
}: AuthOptionsProps): ReactElement {
  return (
    <AuthDataProvider initialEmail={initialEmail}>
      <AuthOptionsInner {...props} />
    </AuthDataProvider>
  );
}

export default AuthOptions;
