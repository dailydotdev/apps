import { useEffect, useRef } from 'react';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent } from '../../lib/log';
import { GSI_SCRIPT_ID, GSI_SRC } from '../../types';

type CredentialResponse = { credential?: string };

type GoogleId = {
  initialize: (config: {
    client_id: string;
    callback: (response: CredentialResponse) => void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
    context?: 'signin' | 'signup' | 'use';
    ux_mode?: 'popup' | 'redirect';
    itp_support?: boolean;
  }) => void;
  prompt: () => void;
  cancel: () => void;
};

const getGoogleId = (): GoogleId | undefined =>
  (globalThis as unknown as { google?: { accounts?: { id?: GoogleId } } })
    .google?.accounts?.id;

const loadGsiScript = (): Promise<void> =>
  new Promise((resolve, reject) => {
    if (getGoogleId()) {
      resolve();
      return;
    }

    const existing = document.getElementById(
      GSI_SCRIPT_ID,
    ) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () =>
        reject(new Error('Failed to load Google Identity Services')),
      );
      return;
    }

    const script = document.createElement('script');
    script.id = GSI_SCRIPT_ID;
    script.src = GSI_SRC;
    script.async = true;
    script.defer = true;
    script.addEventListener('load', () => resolve());
    script.addEventListener('error', () =>
      reject(new Error('Failed to load Google Identity Services')),
    );
    document.head.appendChild(script);
  });

type UseGoogleOneTapProps = {
  enabled: boolean;
  clientId?: string;
  onCredential: (idToken: string) => void | Promise<void>;
};

export const useGoogleOneTap = ({
  enabled,
  clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  onCredential,
}: UseGoogleOneTapProps): void => {
  const { logEvent } = useLogContext();
  const onCredentialRef = useRef(onCredential);
  onCredentialRef.current = onCredential;
  const logEventRef = useRef(logEvent);
  logEventRef.current = logEvent;

  useEffect(() => {
    if (!enabled || !clientId) {
      return undefined;
    }

    let cancelled = false;

    const init = async () => {
      try {
        await loadGsiScript();
      } catch (error) {
        logEventRef.current({
          event_name: LogEvent.GlobalError,
          extra: JSON.stringify({
            msg: error instanceof Error ? error.message : 'unknown',
            url: window.location.href,
            error,
            stack: error instanceof Error ? error.stack : undefined,
            feature: 'google one tap',
          }),
        });
        return;
      }

      const googleId = getGoogleId();
      if (cancelled || !googleId) {
        return;
      }

      googleId.initialize({
        client_id: clientId,
        context: 'signin',
        auto_select: false,
        cancel_on_tap_outside: false,
        ux_mode: 'popup',
        itp_support: true,
        callback: ({ credential }) => {
          if (credential) {
            onCredentialRef.current(credential);
          }
        },
      });
      googleId.prompt();
    };

    init();

    return () => {
      cancelled = true;
      getGoogleId()?.cancel();
    };
  }, [enabled, clientId]);
};
