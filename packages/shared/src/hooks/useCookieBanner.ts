export enum GdprConsentKey {
  Necessary = 'ilikecookies',
  Marketing = 'ilikecookies_marketing',
}

interface ConsentSettings {
  title: string;
  description: string;
  isAlwaysOn?: boolean;
}

export const otherGdprConsents = [GdprConsentKey.Marketing];
export const gdprConsentSettings: Record<GdprConsentKey, ConsentSettings> = {
  [GdprConsentKey.Necessary]: {
    title: 'Strictly necessary cookies',
    description:
      'These cookies are used for activities that are strictly necessary to operate or deliver the service you requested from us and, therefore, do not require you to consent.',
    isAlwaysOn: true,
  },
  [GdprConsentKey.Marketing]: {
    title: 'Marketing cookies',
    description:
      'Marketing cookies are used to deliver content and advertisements that are more relevant to you and your interests. These cookies track your online activity across websites and devices to create a profile of your preferences, enabling personalized experience.',
  },
};
