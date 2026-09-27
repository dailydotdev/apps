import { isSearchEngineLanding } from './mobileAppFooter';

describe('isSearchEngineLanding', () => {
  it('should hold only the page a search engine sent the reader to', () => {
    window.history.pushState({}, '', '/posts/abc');
    Object.defineProperty(document, 'referrer', {
      configurable: true,
      get: () => 'https://www.google.com/',
    });

    expect(isSearchEngineLanding()).toBe(true);

    window.history.pushState({}, '', '/posts/def');

    expect(isSearchEngineLanding()).toBe(false);
  });
});
