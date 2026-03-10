import React from 'react';
import { renderHook } from '@testing-library/react';
import { useFeedLayout } from './useFeedLayout';
import { FeedPage, FeedPageLayoutMobile } from '../components/utilities';
import SettingsContext from '../contexts/SettingsContext';
import { ActiveFeedNameContext } from '../contexts/ActiveFeedNameContext';
import { OtherFeedPage } from '../lib/query';

const mockUseMedia = jest.fn();
const mockUseSearchResultsLayout = jest.fn();

jest.mock('./useMedia', () => ({
  useMedia: (...args) => mockUseMedia(...args),
}));

jest.mock('./search/useSearchResultsLayout', () => ({
  useSearchResultsLayout: () => mockUseSearchResultsLayout(),
}));

const createWrapper = (feedName = OtherFeedPage.Explore) => {
  const Wrapper = ({ children }) => (
    <SettingsContext.Provider value={{ insaneMode: false } as never}>
      <ActiveFeedNameContext.Provider value={{ feedName }}>
        {children}
      </ActiveFeedNameContext.Provider>
    </SettingsContext.Provider>
  );

  return Wrapper;
};

describe('useFeedLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSearchResultsLayout.mockReturnValue({ isSearchPageLaptop: false });
  });

  it('uses the desktop feed layout while laptop size is unknown', () => {
    mockUseMedia.mockReturnValue(undefined);

    const { result } = renderHook(() => useFeedLayout(), {
      wrapper: createWrapper(),
    });

    expect(result.current.FeedPageLayoutComponent).toBe(FeedPage);
    expect(result.current.shouldUseListFeedLayout).toBe(false);
  });

  it('uses the mobile feed layout on mobile and tablet screens', () => {
    mockUseMedia.mockReturnValue(false);

    const { result } = renderHook(() => useFeedLayout(), {
      wrapper: createWrapper(),
    });

    expect(result.current.FeedPageLayoutComponent).toBe(FeedPageLayoutMobile);
    expect(result.current.shouldUseListFeedLayout).toBe(true);
  });

  it('uses the desktop feed layout on laptop screens', () => {
    mockUseMedia.mockReturnValue(true);

    const { result } = renderHook(() => useFeedLayout(), {
      wrapper: createWrapper(),
    });

    expect(result.current.FeedPageLayoutComponent).toBe(FeedPage);
    expect(result.current.shouldUseListFeedLayout).toBe(false);
  });

  it('uses an unknown SSR laptop state when querying the desktop breakpoint', () => {
    mockUseMedia.mockReturnValue(undefined);

    renderHook(() => useFeedLayout(), {
      wrapper: createWrapper(),
    });

    expect(mockUseMedia).toHaveBeenCalledWith(
      ['(min-width: 1020px)'],
      [true],
      false,
      undefined,
    );
  });
});
