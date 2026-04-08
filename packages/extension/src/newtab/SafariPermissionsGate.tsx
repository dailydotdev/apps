import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useState } from 'react';
import { apiUrl } from '@dailydotdev/shared/src/lib/config';

type Status = 'checking' | 'granted' | 'blocked';

function SafariPermissionsPrompt(): ReactElement {
  return (
    <div className="flex min-h-dvh w-full flex-col items-center justify-center gap-6 bg-background-default px-6 text-center">
      <img
        src="icons/128.png"
        alt="daily.dev"
        className="h-20 w-20"
        width={80}
        height={80}
      />
      <h1 className="typo-title1">One more step</h1>
      <p className="max-w-[28rem] text-text-secondary typo-body">
        daily.dev needs permission to connect to its servers. Please allow
        website access in Safari settings:
      </p>
      <ol className="max-w-[28rem] list-inside list-decimal text-left text-text-secondary typo-callout">
        <li className="py-1">
          Open <strong>Safari &gt; Settings &gt; Extensions</strong>
        </li>
        <li className="py-1">
          Click <strong>daily.dev</strong> in the sidebar
        </li>
        <li className="py-1">
          Under <strong>Website Access</strong>, select{' '}
          <strong>&quot;All Websites&quot;</strong> or add{' '}
          <strong>daily.dev</strong> to the allowed list
        </li>
      </ol>
      <button
        type="button"
        className="rounded-xl hover:opacity-90 mt-2 bg-accent-cabbage-default px-6 py-3 font-bold text-white typo-callout"
        onClick={() => window.location.reload()}
      >
        I&apos;ve updated the settings — reload
      </button>
    </div>
  );
}

export default function SafariPermissionsGate({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  const [status, setStatus] = useState<Status>('checking');

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    fetch(`${apiUrl}/boot?v=permission-check`, {
      method: 'HEAD',
      signal: controller.signal,
    })
      .then((res) => {
        setStatus(res.ok || res.status === 401 ? 'granted' : 'blocked');
      })
      .catch(() => {
        setStatus('blocked');
      })
      .finally(() => clearTimeout(timeout));
  }, []);

  if (status === 'checking') {
    return null;
  }

  if (status === 'blocked') {
    return <SafariPermissionsPrompt />;
  }

  return <>{children}</>;
}
