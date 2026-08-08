/**
 * A media-query stub that answers a predicate.
 *
 * The global one in `setup.ts` reports no match and carries only the legacy
 * `addListener`, which is enough for `useMedia` but not for libraries that call
 * `addEventListener` without checking. Anything rendering a component tree deep
 * enough to include one of those needs this.
 */
export const mockMatchMedia = (
  matches: (query: string) => boolean = () => false,
): void => {
  (global.matchMedia as jest.Mock).mockImplementation((query: string) => ({
    media: query,
    matches: matches(query),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    dispatchEvent: jest.fn(),
    onchange: null,
  }));
};

export const laptopQuery = '(min-width: 1020px)';
export const noHoverQuery = '(hover: none)';

/** A desktop pointer on a laptop-sized window. */
export const mockDesktop = (): void =>
  mockMatchMedia((query) => query === laptopQuery);

/** A phone: no hover, and below every width breakpoint. */
export const mockTouchPhone = (): void =>
  mockMatchMedia((query) => query === noHoverQuery);
