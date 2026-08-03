import { getIubendaConsent } from './iubenda';

const POLICY_ID = '14695236';
const COOKIE_NAME = `_iub_cs-${POLICY_ID}`;

const ticketFixture =
  '%7B%22timestamp%22%3A%222026-07-07T15%3A42%3A58.431Z%22%2C%22version%22%3A%221.101.0%22%2C%22purposes%22%3A%7B%221%22%3Atrue%2C%223%22%3Atrue%2C%224%22%3Atrue%2C%225%22%3Atrue%7D%2C%22id%22%3A14695236%2C%22cons%22%3A%7B%22rand%22%3A%22831c24%22%7D%7D';

const setCookieValue = (value: string): void => {
  Object.defineProperty(document, 'cookie', {
    writable: true,
    value: `${COOKIE_NAME}=${value}`,
  });
};

const encode = (purposes: Record<string, boolean>): string =>
  encodeURIComponent(JSON.stringify({ id: Number(POLICY_ID), purposes }));

describe('getIubendaConsent', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_IUBENDA_POLICY_ID = POLICY_ID;
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: '',
    });
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_IUBENDA_POLICY_ID;
  });

  it('should return undefined when policy id env var is missing', () => {
    delete process.env.NEXT_PUBLIC_IUBENDA_POLICY_ID;
    setCookieValue(ticketFixture);

    expect(getIubendaConsent()).toBeUndefined();
  });

  it('should return undefined when the iubenda cookie is absent', () => {
    expect(getIubendaConsent()).toBeUndefined();
  });

  it('should return undefined when the cookie value is malformed json', () => {
    setCookieValue(encodeURIComponent('not json'));

    expect(getIubendaConsent()).toBeUndefined();
  });

  it('should mark necessary and marketing granted when purposes 1 and 5 are true', () => {
    setCookieValue(encode({ '1': true, '4': true, '5': true }));

    expect(getIubendaConsent()).toEqual({ necessary: true, marketing: true });
  });

  it('should not grant marketing when purpose 5 is false', () => {
    setCookieValue(encode({ '1': true, '5': false }));

    expect(getIubendaConsent()).toEqual({ necessary: true, marketing: false });
  });

  it('should not grant marketing when purpose 5 is absent', () => {
    setCookieValue(encode({ '1': true, '3': true, '4': true }));

    expect(getIubendaConsent()).toEqual({ necessary: true, marketing: false });
  });

  it('should not grant necessary when purpose 1 is absent', () => {
    setCookieValue(encode({ '5': true }));

    expect(getIubendaConsent()).toEqual({ necessary: false, marketing: true });
  });

  it('should parse the url-encoded fixture from the ticket', () => {
    setCookieValue(ticketFixture);

    expect(getIubendaConsent()).toEqual({ necessary: true, marketing: true });
  });
});
