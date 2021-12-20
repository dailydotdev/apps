import { AmplitudeClient, LogReturn } from 'amplitude-js';
import { IFlags } from 'flagsmith';

declare global {
  interface Window {
    GoogleAnalyticsObject: string;
    ga: UniversalAnalytics.ga;
    /* eslint-disable */
    fbq: any;
    _fbq: any;
    twq: any;
    /* eslint-enable */
  }
}

/* eslint-disable */
// const initFbPixel = (): void => {
//   (function (f, b, e, v, n, t, s) {
//     if (f.fbq) return;
//     n = f.fbq = function () {
//       n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
//     };
//     if (!f._fbq) f._fbq = n;
//     n.push = n;
//     n.loaded = !0;
//     n.version = '2.0';
//     n.queue = [];
//     t = b.createElement(e);
//     t.async = !0;
//     t.src = v;
//     s = b.getElementsByTagName(e)[0];
//     s.parentNode.insertBefore(t, s);
//   })(
//     window,
//     document,
//     'script',
//     'https://connect.facebook.net/en_US/fbevents.js',
//   );
//   window.fbq('init', process.env.NEXT_PUBLIC_FB_PIXEL);
//   window.fbq('track', 'PageView');
// };

const initTwPixel = (): void => {
  (function (e, t, n, s, u, a) {
    e.twq ||
      ((s = e.twq =
        function () {
          s.exe ? s.exe.apply(s, arguments) : s.queue.push(arguments);
        }),
      (s.version = '1.1'),
      (s.queue = []),
      (u = t.createElement(n)),
      (u.async = !0),
      (u.src = '//static.ads-twitter.com/uwt.js'),
      (a = t.getElementsByTagName(n)[0]),
      a.parentNode.insertBefore(u, a));
  })(window, document, 'script');
  window.twq('init', process.env.NEXT_PUBLIC_TW_PIXEL);
  window.twq('track', 'PageView');
};
/* eslint-enable */

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
        const { eventCategory, eventAction, eventLabel, nonInteraction } =
          args[0] as EventFields;
        let path = `${prefix}&t=event&ec=${encodeURIComponent(
          eventCategory,
        )}&ea=${encodeURIComponent(eventAction)}&el=${encodeURIComponent(
          eventLabel,
        )}`;
        if (nonInteraction) {
          path += '&ni=1';
        }
        return path;
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

  // if (process.env.NEXT_PUBLIC_FB_PIXEL) {
  //   initFbPixel();
  // }
  if (process.env.NEXT_PUBLIC_TW_PIXEL) {
    initTwPixel();
  }
};

export const trackPageView = (page: string): void => {
  window.ga?.('set', 'page', page);
  window.ga?.('send', 'pageview');
};

const getAmplitudeClientInternal = async (): Promise<AmplitudeClient> => {
  const amp = await import(/* webpackChunkName: "analytics" */ 'amplitude-js');
  return amp.getInstance();
};

type AmplitudeEvent = [string, unknown | undefined];

let ampInitialized = false;
const ampEventsQueue: AmplitudeEvent[] = [];
const ampRevenueQueue: [string, number][] = [];

export const getAmplitudeClient = async (): Promise<AmplitudeClient> => {
  if (!ampInitialized) {
    return {
      logEvent(event: string, data?: unknown): LogReturn {
        ampEventsQueue.push([event, data]);
        return undefined;
      },
    } as unknown as AmplitudeClient;
  }

  return getAmplitudeClientInternal();
};

export const logRevenue = async (
  productId: string,
  count: number,
): Promise<void> => {
  if (!ampInitialized) {
    ampRevenueQueue.push([productId, count]);
    return;
  }
  const amp = await import(/* webpackChunkName: "analytics" */ 'amplitude-js');
  const revenue = new amp.Revenue()
    .setProductId(productId)
    .setQuantity(count)
    .setPrice(1);
  amp.getInstance().logRevenueV2(revenue);
};

const logEvent = async (
  event: string,
  data?: Record<string, unknown>,
): Promise<void> => {
  const amp = await getAmplitudeClient();
  amp.logEvent(event, data);
};

export const logReadArticle = async (origin: string): Promise<void> =>
  logEvent('read article', { origin });

export const logSignupStart = async (trigger: string): Promise<void> =>
  logEvent('signup start', { trigger });

export const logSignupProviderClick = async (provider: string): Promise<void> =>
  logEvent('signup provider click', { provider });

export const logSignupFormStart = async (): Promise<void> =>
  logEvent('signup form start');

export const logSignupFormSubmit = async (
  optionalFields: boolean,
): Promise<void> =>
  logEvent('signup form submit', { 'optional fields': optionalFields });

export const logGoToDevCardImpression = async (origin: string): Promise<void> =>
  logEvent('go to devcard impression', { origin });

export const logGoToDevCardClick = async (origin: string): Promise<void> =>
  logEvent('go to devcard click', { origin });

export const logGenerateDevCard = async (): Promise<void> =>
  logEvent('generate devcard');

export const logDownloadDevCard = async (): Promise<void> =>
  logEvent('download devcard');

export const logDevCardPageView = async (): Promise<void> =>
  logEvent('devcard page view');

export const initAmplitude = async (
  userId: string,
  version: string,
  flags: IFlags,
): Promise<void> => {
  const amp = await getAmplitudeClientInternal();
  amp.init(process.env.NEXT_PUBLIC_AMPLITUDE, userId, {
    includeReferrer: true,
    includeUtm: true,
    includeGclid: true,
    includeFbclid: true,
    sameSiteCookie: 'Lax',
    domain: process.env.NEXT_PUBLIC_DOMAIN,
  });
  amp.setVersionName(version);
  // Sync flags to Amplitude
  if (flags && Object.keys(flags)?.length) {
    const userProps = Object.keys(flags).reduce((props, key) => {
      const flag = flags[key];
      return {
        ...props,
        [key]: flag.enabled ? flags[key].value || 'true' : 'false',
      };
    }, {});
    amp.setUserProperties(userProps);
  }
  ampInitialized = true;
  ampEventsQueue.forEach((args) => amp.logEvent(...args));
  ampRevenueQueue.forEach((args) => logRevenue(...args));
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

export const gaTrackEvent = ({
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
