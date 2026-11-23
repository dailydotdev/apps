type Hotjar = ((...args: unknown[]) => void) & { q?: unknown[][] };

// The Startups funnel stages, sent to the "daily.dev for Startups" Hotjar
// site so recordings can be filtered by how far a founder got. Hotjar events
// take no properties, so the plan goes in the name.
export enum StartupsHotjarEvent {
  Signup = 'startups_signup',
  CompanyPageRequested = 'company_page_requested',
  CompanyPageForm = 'company_page_form',
  CompanyPageCreated = 'company_page_created',
  CompanyPageReady = 'company_page_ready',
  FirstPost = 'first_post',
  FreeBoost = 'free_boost',
  CheckoutOpened = 'checkout_opened',
}

export const getSubscribedHotjarEvent = (plan: string): string =>
  `subscribed_${plan}`;

// Calls before the script loads wait in the same queue the Hotjar snippet
// sets up, and run once it does. Without consent the script never loads, so
// nothing is sent.
const getHotjar = (): Hotjar => {
  const win = globalThis as typeof globalThis & { hj?: Hotjar };

  if (!win.hj) {
    const queue: unknown[][] = [];
    win.hj = Object.assign((...args: unknown[]) => queue.push(args), {
      q: queue,
    });
  }

  return win.hj;
};

// Identify only reaches Hotjar on its Business plan, so the user id also goes
// out as an event, which every plan can filter recordings by
export const getHotjarUserEvent = (userId: string): string => `uid_${userId}`;

export const identifyHotjarUser = (userId: string): void => {
  const hj = getHotjar();
  hj('identify', userId, {});
  hj('event', getHotjarUserEvent(userId));
};

export const trackHotjarEvent = (event: string): void =>
  getHotjar()('event', event);
