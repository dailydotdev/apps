import {
  CHECKOUT_ATTRIBUTION_MAX_LENGTH,
  CHECKOUT_ATTRIBUTION_STORAGE_KEY,
  CHECKOUT_ATTRIBUTION_TTL_MS,
  getCheckoutAttribution,
  getSavedCheckoutAttribution,
  saveCheckoutAttribution,
} from './checkoutAttribution';

describe('checkout attribution', () => {
  beforeEach(() => localStorage.clear());

  it('keeps only the attribution keys, trimmed and capped', () => {
    expect(
      getCheckoutAttribution({
        plan: 'starter',
        utm_source: ' fb ',
        utm_medium: ['paid_social', 'other'],
        utm_campaign: '',
        fbclid: 'x'.repeat(300),
      }),
    ).toEqual({
      utm_source: 'fb',
      utm_medium: 'paid_social',
      fbclid: 'x'.repeat(CHECKOUT_ATTRIBUTION_MAX_LENGTH),
    });
  });

  it('keeps the saved visit when a later one has no attribution', () => {
    saveCheckoutAttribution({ utm_source: 'fb', utm_campaign: 'launch' }, 1000);
    saveCheckoutAttribution({ plan: 'team' }, 2000);

    expect(getSavedCheckoutAttribution(3000)).toEqual({
      utm_source: 'fb',
      utm_campaign: 'launch',
    });
  });

  it('replaces the saved visit with the latest one that has attribution', () => {
    saveCheckoutAttribution({ utm_source: 'fb', utm_campaign: 'launch' }, 1000);
    saveCheckoutAttribution({ utm_source: 'customerio' }, 2000);

    expect(getSavedCheckoutAttribution(3000)).toEqual({
      utm_source: 'customerio',
    });
  });

  it('drops attribution older than 30 days', () => {
    saveCheckoutAttribution({ utm_source: 'fb' }, 0);

    expect(
      getSavedCheckoutAttribution(CHECKOUT_ATTRIBUTION_TTL_MS + 1),
    ).toEqual({});
  });

  it('ignores a corrupt saved value', () => {
    localStorage.setItem(CHECKOUT_ATTRIBUTION_STORAGE_KEY, '{nope');

    expect(getSavedCheckoutAttribution()).toEqual({});
  });
});
