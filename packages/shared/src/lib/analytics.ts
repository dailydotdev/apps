import { AmplitudeClient } from 'amplitude-js';
import { LoggedUser } from './user';

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
  if (process.env.TARGET_BROWSER && process.env.TARGET_BROWSER !== 'firefox') {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    window.ga?.('set', 'checkProtocolTask', () => {});
    window.ga?.('require', 'displayfeatures');
  }
};

export const loadAnalyticsScript = (): void => {
  if (process.env.TARGET_BROWSER !== 'firefox') {
    const script = document.createElement('script');
    const existingScript = document.getElementsByTagName('script')[0];
    script.async = true;
    script.src = 'https://www.google-analytics.com/analytics.js';
    existingScript.parentNode.insertBefore(script, existingScript);
  } else {
    let page;
    let clientId;

    const getMessage = (action, type, ...args) => {
      if (action !== 'send') return null;

      const prefix = `v=1&tid=${process.env.NEXT_PUBLIC_GA}&cid=${clientId}&aip=1&dp=${page}`;
      if (type === 'event') {
        return `${prefix}&t=event&ec=${encodeURIComponent(
          args[0],
        )}&ea=${encodeURIComponent(args[1])}&el=${encodeURIComponent(args[2])}`;
      }
      if (type === 'pageview') {
        return `${prefix}&t=pageview`;
      }
      if (type === 'timing') {
        return `${prefix}&t=timing&utc=${encodeURIComponent(
          args[0],
        )}&utv=${encodeURIComponent(args[1])}&utt=${encodeURIComponent(
          args[2],
        )}`;
      }
      if (type === 'exception') {
        return `${prefix}&t=exception&exd=${encodeURIComponent(
          args[0].exDescription,
        )}&exf=${args[0].exFatal ? 1 : 0}`;
      }

      return null;
    };

    const queue = window.ga.q;
    window.ga = ((action, type, ...args) => {
      if (action === 'create') {
        clientId = args[0]?.clientId;
      } else if (action === 'set') {
        if (type === 'page') {
          page = encodeURIComponent(args[0]);
        }
        return;
      }

      const request = new XMLHttpRequest();
      const message = getMessage(action, type, ...args);
      if (message) {
        request.withCredentials = true;
        request.open('POST', 'https://www.google-analytics.com/collect', true);
        request.send(message);
      }
    }) as UniversalAnalytics.ga;

    queue.forEach((args) => window.ga(...(args as [string, ...unknown[]])));
  }
};

export const trackPageView = (page: string): void => {
  window.ga?.('set', 'page', page);
  window.ga?.('send', 'pageview');
};

export const getAmplitudeClient = async (): Promise<AmplitudeClient> => {
  const amp = await import('amplitude-js');
  return amp.getInstance();
};

type LogRevenueEvent = { event: 'revenue'; args: [string, number] };
type ReadArticleEvent = { event: 'read article'; args: [string] };
type AmplitudeEvent = LogRevenueEvent | ReadArticleEvent;

let ampInitialized = false;
const ampQueue: AmplitudeEvent[] = [];

export const logRevenue = async (
  productId: string,
  count: number,
): Promise<void> => {
  if (!ampInitialized) {
    ampQueue.push({ event: 'revenue', args: [productId, count] });
    return;
  }
  const amp = await import('amplitude-js');
  const revenue = new amp.Revenue()
    .setProductId(productId)
    .setQuantity(count)
    .setPrice(1);
  amp.getInstance().logRevenueV2(revenue);
};

export const logReadArticle = async (origin: string): Promise<void> => {
  if (!ampInitialized) {
    ampQueue.push({ event: 'read article', args: [origin] });
    return;
  }
  const amp = await getAmplitudeClient();
  amp.logEvent('read article', { origin });
};

export const initAmplitude = async (
  user: LoggedUser | undefined,
  version: string,
): Promise<void> => {
  const amp = await getAmplitudeClient();
  amp.init(process.env.NEXT_PUBLIC_AMPLITUDE, user?.id, {
    includeReferrer: true,
    includeUtm: true,
    sameSiteCookie: 'Lax',
    domain: process.env.NEXT_PUBLIC_DOMAIN,
  });
  amp.setVersionName(version);
  ampInitialized = true;
  ampQueue.forEach(({ event, args }) => {
    switch (event) {
      case 'revenue':
        logRevenue(...(args as [string, number]));
        break;
      case 'read article':
        logReadArticle(...(args as [string]));
        break;
    }
  });
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
