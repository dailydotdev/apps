import type { ReactElement } from 'react';
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { mockAllIsIntersecting } from 'react-intersection-observer/test-utils';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import type { AuthContextData } from '../../../contexts/AuthContext';
import AuthContext from '../../../contexts/AuthContext';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { useViewSize } from '../../../hooks/useViewSize';
import { isIOSNative, isPWA } from '../../../lib/func';
import { MobileAppFooterAnchor } from '../components/MobileAppFooterAnchor';
import { MobileAppFooterAnchorPlace } from '../mobileAppFooter';
import {
  MobileAppFooterProvider,
  useMobileAppFooterContext,
} from './MobileAppFooterContext';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));

jest.mock('../../../hooks/useConditionalFeature', () => ({
  useConditionalFeature: jest.fn(),
}));

jest.mock('../../../hooks/useViewSize', () => ({
  ...jest.requireActual('../../../hooks/useViewSize'),
  useViewSize: jest.fn(),
}));

jest.mock('../../../lib/func', () => ({
  ...jest.requireActual('../../../lib/func'),
  isIOSNative: jest.fn(),
  isPWA: jest.fn(),
}));

const mockRouter = jest.mocked(useRouter);
const mockFeature = jest.mocked(useConditionalFeature);
const mockIsTablet = jest.mocked(useViewSize);
const mockIsIOSNative = jest.mocked(isIOSNative);
const mockIsPWA = jest.mocked(isPWA);

const RevealedTitle = (): ReactElement | null => {
  const { moment, isRevealed } = useMobileAppFooterContext();

  return isRevealed ? <p>{moment?.title}</p> : null;
};

interface Page {
  pathname: string;
  asPath?: string;
  query?: Record<string, string>;
}

const page = (
  auth: Partial<AuthContextData> = {},
  anchorAt = MobileAppFooterAnchorPlace.Comments,
): ReactElement => (
  <AuthContext.Provider
    value={
      {
        isAuthReady: true,
        isLoggedIn: false,
        isAndroidApp: false,
        ...auth,
      } as unknown as AuthContextData
    }
  >
    <MobileAppFooterProvider>
      <MobileAppFooterAnchor at={anchorAt} />
      <RevealedTitle />
    </MobileAppFooterProvider>
  </AuthContext.Provider>
);

const navigate = ({ pathname, asPath = pathname, query = {} }: Page) =>
  mockRouter.mockReturnValue({ pathname, asPath, query } as NextRouter);

const scrollTo = (y: number) => {
  window.scrollY = y;
  fireEvent.scroll(window);
};

beforeEach(() => {
  jest.clearAllMocks();
  sessionStorage.clear();
  window.scrollY = 0;
  mockFeature.mockReturnValue({ value: true, isLoading: false });
  mockIsTablet.mockReturnValue(false);
  mockIsIOSNative.mockReturnValue(false);
  mockIsPWA.mockReturnValue(false);
});

describe('MobileAppFooterContext', () => {
  it('should reveal the footer once the reader reaches the anchor', () => {
    navigate({ pathname: '/posts/[id]', asPath: '/posts/abc' });
    render(page());
    mockAllIsIntersecting(false);

    expect(screen.queryByText('See all comments')).not.toBeInTheDocument();

    mockAllIsIntersecting(true);

    expect(screen.getByText('See all comments')).toBeInTheDocument();
  });

  it('should not enroll logged-in readers', () => {
    navigate({ pathname: '/posts/[id]', asPath: '/posts/abc' });
    render(page({ isLoggedIn: true }));
    mockAllIsIntersecting(true);

    expect(screen.queryByText('See all comments')).not.toBeInTheDocument();
    expect(mockFeature).toHaveBeenCalledWith(
      expect.objectContaining({ shouldEvaluate: false }),
    );
  });

  it('should not enroll readers inside an installed PWA', () => {
    mockIsPWA.mockReturnValue(true);
    navigate({ pathname: '/posts/[id]', asPath: '/posts/abc' });
    render(page());
    mockAllIsIntersecting(true);

    expect(screen.queryByText('See all comments')).not.toBeInTheDocument();
    expect(mockFeature).toHaveBeenCalledWith(
      expect.objectContaining({ shouldEvaluate: false }),
    );
  });

  it('should ignore anchors that belong to another page', () => {
    navigate({ pathname: '/posts' });
    render(page({}, MobileAppFooterAnchorPlace.Comments));
    mockAllIsIntersecting(true);

    expect(screen.queryByText('See all posts')).not.toBeInTheDocument();
  });

  it('should leave pages without a footer moment alone', () => {
    navigate({ pathname: '/bookmarks' });
    render(page());

    expect(mockFeature).toHaveBeenCalledWith(
      expect.objectContaining({ shouldEvaluate: false }),
    );
  });

  it('should reveal on a directory once the reader scrolls back up', () => {
    navigate({ pathname: '/tags' });
    render(page());

    act(() => scrollTo(window.innerHeight + 400));
    expect(screen.queryByText('See all tags')).not.toBeInTheDocument();

    act(() => scrollTo(window.innerHeight + 200));
    expect(screen.getByText('See all tags')).toBeInTheDocument();
  });

  it('should reveal on search from the third distinct query', () => {
    const search = (q: string): Page => ({
      pathname: '/search/posts',
      asPath: `/search/posts?q=${q}`,
      query: { q },
    });
    navigate(search('react'));
    const { rerender } = render(page());
    navigate(search('React'));
    rerender(page());
    navigate(search('vue'));
    rerender(page());

    expect(screen.queryByText('See all posts')).not.toBeInTheDocument();

    navigate(search('rust'));
    rerender(page());

    expect(screen.getByText('See all posts')).toBeInTheDocument();
  });
});
