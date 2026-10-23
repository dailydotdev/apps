import type { ReactElement } from 'react';
import React from 'react';
import { render, screen } from '@testing-library/react';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import type { AuthContextData } from '../../../contexts/AuthContext';
import AuthContext from '../../../contexts/AuthContext';
import { useViewSize } from '../../../hooks/useViewSize';
import { isIOSNative, isPWA } from '../../../lib/func';
import {
  MobileAppFooterProvider,
  useMobileAppFooterContext,
} from './MobileAppFooterContext';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));

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
const mockIsTablet = jest.mocked(useViewSize);
const mockIsIOSNative = jest.mocked(isIOSNative);
const mockIsPWA = jest.mocked(isPWA);

const RevealedTitle = (): ReactElement | null => {
  const { title } = useMobileAppFooterContext();

  return title ? <p>{title}</p> : null;
};

const page = (auth: Partial<AuthContextData> = {}): ReactElement => (
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
      <RevealedTitle />
    </MobileAppFooterProvider>
  </AuthContext.Provider>
);

const navigate = (pathname: string, asPath = pathname) =>
  mockRouter.mockReturnValue({ pathname, asPath, query: {} } as NextRouter);

beforeEach(() => {
  jest.clearAllMocks();
  mockIsTablet.mockReturnValue(false);
  mockIsIOSNative.mockReturnValue(false);
  mockIsPWA.mockReturnValue(false);
});

describe('MobileAppFooterContext', () => {
  it('should show the footer as soon as the page loads', () => {
    navigate('/posts/[id]', '/posts/abc');
    render(page());

    expect(screen.getByText('See all posts')).toBeInTheDocument();
  });

  it.each([
    ['/posts', 'See all posts'],
    ['/posts/[id]', 'See all posts'],
    ['/tags', 'See all tags'],
    ['/search/posts', 'See all posts'],
    ['/users', 'See full leaderboard'],
  ])('should show the footer on load on %s', (pathname, title) => {
    navigate(pathname);
    render(page());

    expect(screen.getByText(title)).toBeInTheDocument();
  });

  it('should not show the footer to logged-in readers', () => {
    navigate('/posts/[id]', '/posts/abc');
    render(page({ isLoggedIn: true }));

    expect(screen.queryByText('See all posts')).not.toBeInTheDocument();
  });

  it('should not show the footer inside an installed PWA', () => {
    mockIsPWA.mockReturnValue(true);
    navigate('/posts/[id]', '/posts/abc');
    render(page());

    expect(screen.queryByText('See all posts')).not.toBeInTheDocument();
  });

  it('should leave pages without a footer title alone', () => {
    navigate('/bookmarks');
    const { container } = render(page());

    expect(container).toBeEmptyDOMElement();
  });
});
