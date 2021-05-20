import { AmplitudeClient } from 'amplitude-js';

declare global {
  interface Window {
    GoogleAnalyticsObject: string;
    ga: UniversalAnalytics.ga;
  }
}

export const initializeAnalyticsQueue = (clientId: string): void => {
  window.GoogleAnalyticsObject = 'ga';
  window.ga =
    window.ga ||
    (((...args) => {
      (window.ga.q = window.ga.q || []).push(args);
    }) as UniversalAnalytics.ga);
  window.ga.l = new Date().getTime();
  window.ga?.('create', process.env.NEXT_PUBLIC_GA, { clientId });
  if (process.env.TARGET_BROWSER) {
    window.ga?.('set', 'checkProtocolTask', () => {});
    window.ga?.('require', 'displayfeatures');
  }
};

export const loadAnalyticsScript = (): void => {
  const script = document.createElement('script');
  const existingScript = document.getElementsByTagName('script')[0];
  script.async = true;
  script.src = 'https://www.google-analytics.com/analytics.js';
  existingScript.parentNode.insertBefore(script, existingScript);
};

export const trackPageView = (page: string): void => {
  window.ga?.('set', 'page', page);
  window.ga?.('send', 'pageview');
};

export const getAmplitudeClient = async (): Promise<AmplitudeClient> => {
  const amp = await import('amplitude-js');
  return amp.getInstance();
};

export const logRevenue = async (productId: string): Promise<void> => {
  const amp = await import('amplitude-js');
  const revenue = new amp.Revenue().setProductId(productId).setPrice(1);
  amp.getInstance().logRevenueV2(revenue);
};

export const logReadArticle = async (origin: string): Promise<void> => {
  const amp = await getAmplitudeClient();
  amp.logEvent('read article', { origin });
};

export interface EventArgs {
  category: string;
  action: string;
  label?: string;
  value?: number;
  nonInteraction?: boolean;
}

interface EventFields {
  eventCategory: string;
  eventAction: string;
  eventLabel?: string;
  eventValue?: number;
  nonInteraction?: boolean;
}

export const trackEvent = ({
  category,
  action,
  label,
  value,
  nonInteraction,
}: EventArgs): void => {
  const fieldsObject: EventFields = {
    eventCategory: category,
    eventAction: action,
  };

  if (label) {
    fieldsObject.eventLabel = label;
  }
  if (value) {
    fieldsObject.eventValue = value;
  }
  if (nonInteraction) {
    fieldsObject.nonInteraction = nonInteraction;
  }

  window.ga?.('send', 'event', fieldsObject);
};
