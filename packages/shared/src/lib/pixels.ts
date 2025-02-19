import { EXPERIENCE_TO_SENIORITY } from '../components/Pixels';
import type { UserExperienceLevel } from './user';

interface LogSignUpProps {
  userId: string;
  email: string;
  experienceLevel: keyof typeof UserExperienceLevel;
}

export const logPixelSignUp = ({
  experienceLevel,
  userId,
  email,
}: LogSignUpProps): void => {
  const urlParams = new URLSearchParams(window.location.search);
  const isExtension = urlParams.get('ref') === 'install';

  const isEngineer = !!experienceLevel && experienceLevel !== 'NOT_ENGINEER';
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
    // globalThis.initFbPixel(userId, email);
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
};

export const logPixelPayment = (
  value: number,
  currency: string,
  transactionId: string,
): void => {
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
};
