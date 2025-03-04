import type { ReactElement } from 'react';
import React from 'react';
import type { PixelsContextData } from '@dailydotdev/shared/src/contexts/PixelsContext';
import { PixelsContext } from '@dailydotdev/shared/src/contexts/PixelsContext';
import { EXPERIENCE_TO_SENIORITY, Pixels } from '../components/Pixels';

interface PixelsContextProviderProps {
  children: ReactElement;
}

function WebPixelsProvider({
  children,
}: PixelsContextProviderProps): ReactElement {
  const context: PixelsContextData = {
    trackSignup({ id, email, experienceLevel }) {
      const urlParams = new URLSearchParams(window.location.search);
      const isExtension = urlParams.get('ref') === 'install';

      const isEngineer =
        !!experienceLevel && experienceLevel !== 'NOT_ENGINEER';
      if (typeof globalThis.gtag === 'function') {
        globalThis.gtag('event', 'signup');
        if (isEngineer) {
          globalThis.gtag('event', 'engineer_signup');
        }
        if (isExtension) {
          globalThis.gtag('event', 'extension_signup');
        }
      }

      if (typeof globalThis.fbq === 'function') {
        globalThis.updateFbUserData(id, email);
        globalThis.fbq('track', 'signup');
        const seniority = EXPERIENCE_TO_SENIORITY[experienceLevel];
        if (seniority) {
          globalThis.fbq('track', `signup3_${seniority}`);
        }
        if (isEngineer) {
          globalThis.fbq('track', 'engineer signup');
        }
        if (isExtension) {
          globalThis.fbq('track', 'extension_signup');
        }
      }

      if (typeof globalThis.twq === 'function') {
        globalThis.twq('event', 'tw-o6izs-okoq6', {});
      }

      if (typeof globalThis.rdt === 'function') {
        globalThis.rdt('track', 'SignUp');
      }

      if (typeof globalThis.ttq?.track === 'function') {
        globalThis.ttq.track('CompletePayment', { value: 1 });
      }
    },
    trackPayment(value, currency, transactionId) {
      if (typeof globalThis.gtag === 'function') {
        globalThis.gtag('event', 'purchase', {
          transaction_id: transactionId,
          value,
          currency,
        });
      }

      if (typeof globalThis.fbq === 'function') {
        globalThis.fbq('track', 'Purchase', {
          value,
          currency,
        });
      }
    },
    trackEvent(eventName: string) {
      if (typeof globalThis.gtag === 'function') {
        globalThis.gtag('event', eventName.replace(/ /g, '_').toLowerCase());
      }
      if (typeof globalThis.fbq === 'function') {
        globalThis.fbq('track', eventName);
      }
    },
  };

  return (
    <PixelsContext.Provider value={context}>
      <Pixels />
      {children}
    </PixelsContext.Provider>
  );
}

function IOSPixelsProvider({
  children,
}: PixelsContextProviderProps): ReactElement {
  const context: PixelsContextData = {
    trackSignup({ id, email }) {
      globalThis.webkit.messageHandlers['track-event'].postMessage({
        eventName: 'signup',
        email,
        userId: id,
      });
    },
    trackPayment() {},
    trackEvent(eventName: string) {
      globalThis.webkit.messageHandlers['track-event'].postMessage({
        eventName,
      });
    },
  };

  return (
    <PixelsContext.Provider value={context}>
      <Pixels />
      {children}
    </PixelsContext.Provider>
  );
}

export function PixelsProvider(
  props: PixelsContextProviderProps,
): ReactElement {
  if (globalThis.webkit?.messageHandlers?.['track-event']) {
    return <IOSPixelsProvider {...props} />;
  }
  return <WebPixelsProvider {...props} />;
}
