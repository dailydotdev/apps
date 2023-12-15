import React, { ReactElement, useEffect, useState } from 'react';
import EmailCodeVerification from '@dailydotdev/shared/src/components/auth/EmailCodeVerification';
import { useRouter } from 'next/router';
import AuthHeader from '@dailydotdev/shared/src/components/auth/AuthHeader';
import HeaderLogo from '@dailydotdev/shared/src/components/layout/HeaderLogo';

const Verification = (): ReactElement => {
  const [email, setEmail] = useState<string>();
  const [flowId, setFlowId] = useState<string>();
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    const { flow, email: emailQuery } = router.query;

    if (flow && typeof flow === 'string') {
      setFlowId(flow);
    }

    if (emailQuery && typeof emailQuery === 'string') {
      setEmail(emailQuery);
    }
  }, [router]);

  if (!router.isReady) {
    return null;
  }

  return (
    <div className="p-4 w-full">
      <HeaderLogo onLogoClick={() => router.push('/')} />
      <AuthHeader title="Verify your email" simplified />
      <EmailCodeVerification
        email={email}
        flowId={flowId}
        code={router?.query?.code as string}
        className="mx-auto max-w-[30rem]"
      />
    </div>
  );
};

export default Verification;
