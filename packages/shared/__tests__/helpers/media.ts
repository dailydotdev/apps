// The global stub in `setup.ts` never matches and carries only the legacy
// `addListener`, which libraries calling `addEventListener` blow up on.
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

// A 1020px window matches every width breakpoint at or below laptop, so
// answering only the laptop query reports a desktop that is not a tablet.
export const mockDesktop = (): void =>
  mockMatchMedia((query) => {
    const [, min] = /min-width:\s*(\d+)px/.exec(query) ?? [];

    return !!min && Number(min) <= 1020;
  });
