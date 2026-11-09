import type { ReactElement } from 'react';
import React from 'react';
import type { PixelsContextData } from '@dailydotdev/shared/src/contexts/PixelsContext';
import { PixelsContext } from '@dailydotdev/shared/src/contexts/PixelsContext';
import {
  messageHandlerExists,
  postWebKitMessage,
  WebKitMessageHandlers,
} from '@dailydotdev/shared/src/lib/ios';
import { EXPERIENCE_TO_SENIORITY, Pixels } from '../components/Pixels';

type Tracker = (...args: unknown[]) => void;

const pixels = globalThis as typeof globalThis & {
  gtag?: Tracker;
  fbq?: Tracker;
  updateFbUserData?: (userId: string, email?: string) => void;
  twq?: Tracker;
  rdt?: Tracker;
  ttq?: { track?: Tracker };
};

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
      if (typeof pixels.gtag === 'function') {
        pixels.gtag('event', 'signup');
        if (isEngineer) {
          pixels.gtag('event', 'engineer_signup');
        }
        if (isExtension) {
          pixels.gtag('event', 'extension_signup');
        }
      }

      if (typeof pixels.fbq === 'function') {
        pixels.updateFbUserData?.(id, email);
        pixels.fbq('track', 'signup');
        const seniority =
          experienceLevel && EXPERIENCE_TO_SENIORITY[experienceLevel];
        if (seniority) {
          pixels.fbq('track', `signup3_${seniority}`);
        }
        if (isEngineer) {
          pixels.fbq('track', 'engineer signup');
        }
        if (isExtension) {
          pixels.fbq('track', 'extension_signup');
        }
      }

      if (typeof pixels.twq === 'function') {
        pixels.twq('event', 'tw-o6izs-okoq6', {});
      }

      if (typeof pixels.rdt === 'function') {
        pixels.rdt('track', 'SignUp');
      }

      if (typeof pixels.ttq?.track === 'function') {
        pixels.ttq.track('CompletePayment', { value: 1 });
      }
    },
    trackPayment() {
      // if (typeof pixels.gtag === 'function') {
      //   pixels.gtag('event', 'purchase', {
      //     transaction_id: transactionId,
      //     value,
      //     currency,
      //   });
      // }
      //
      // if (typeof pixels.fbq === 'function') {
      //   pixels.fbq('track', 'Purchase', {
      //     value,
      //     currency,
      //   });
      // }
    },
    trackEvent(eventName, params, options) {
      if (typeof pixels.gtag === 'function') {
        pixels.gtag('event', eventName.replace(/ /g, '_').toLowerCase());
      }
      if (typeof pixels.fbq === 'function') {
        pixels.fbq(
          'track',
          eventName,
          params,
          options?.eventId ? { eventID: options.eventId } : undefined,
        );
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
      postWebKitMessage(WebKitMessageHandlers.TrackEvent, {
        eventName: 'signup',
        email,
        userId: id,
      });
    },
    trackPayment() {},
    trackEvent(eventName: string) {
      postWebKitMessage(WebKitMessageHandlers.TrackEvent, {
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
  if (messageHandlerExists(WebKitMessageHandlers.TrackEvent)) {
    return <IOSPixelsProvider {...props} />;
  }
  return <WebPixelsProvider {...props} />;
}
