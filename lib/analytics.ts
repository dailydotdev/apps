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
};

export const loadAnalyticsScript = (): void => {
  const script = document.createElement('script');
  const existingScript = document.getElementsByTagName('script')[0];
  script.async = true;
  script.src = 'https://www.google-analytics.com/analytics.js';
  existingScript.parentNode.insertBefore(script, existingScript);
};

export const trackPageView = (url: string): void => {
  const page = `/web${url}`;
  window.ga?.('set', 'page', page);
  window.ga?.('send', 'pageview');
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
