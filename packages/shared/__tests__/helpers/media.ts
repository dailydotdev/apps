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

/**
 * A desktop pointer on a laptop-sized window.
 *
 * Every width breakpoint at or below laptop matches, because a 1020px window is
 * also wider than tablet. Answering only the laptop query made a desktop that
 * was somehow not a tablet, and any component asking for the smaller breakpoint
 * was told it was on a phone.
 */
export const mockDesktop = (): void =>
  mockMatchMedia((query) => {
    const [, min] = /min-width:\s*(\d+)px/.exec(query) ?? [];

    return !!min && Number(min) <= 1020;
  });

/** A phone: no hover, and below every width breakpoint. */
export const mockTouchPhone = (): void =>
  mockMatchMedia((query) => query === noHoverQuery);
