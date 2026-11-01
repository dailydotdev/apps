import React from 'react';
import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import type { AuthContextData } from '@dailydotdev/shared/src/contexts/AuthContext';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { useLaptopLayout } from '@dailydotdev/shared/src/hooks/layout/useLaptopLayout';
import { useFeedWidgetShortcuts } from '@dailydotdev/shared/src/features/feedWidgets/feedState';
import loggedUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import MainFeedPage from './MainFeedPage';
import { loginHref, onboardingHref } from './onboardingHref';

jest.mock('next/dynamic', () => () => () => null);

jest.mock('@dailydotdev/shared/src/components/MainLayout', () => ({
  __esModule: true,
  default: ({
    topBanner,
    children,
  }: {
    topBanner: ReactNode;
    children: ReactNode;
  }) => (
    <div>
      <div data-testid="top-banner">{topBanner}</div>
      {children}
    </div>
  ),
}));

jest.mock('@dailydotdev/shared/src/components/MainFeedLayout', () => ({
  __esModule: true,
  default: ({
    pageHeaderContent,
    shortcuts,
  }: {
    pageHeaderContent: ReactNode;
    shortcuts: ReactNode;
  }) => (
    <div>
      <div data-testid="page-header">{pageHeaderContent}</div>
      <div data-testid="shortcuts">{shortcuts}</div>
    </div>
  ),
}));

jest.mock('@dailydotdev/shared/src/components/ScrollToTopButton', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@dailydotdev/shared/src/hooks/layout/useLaptopLayout', () => ({
  useLaptopLayout: jest.fn(),
}));

jest.mock('@dailydotdev/shared/src/hooks', () => ({
  ...jest.requireActual('@dailydotdev/shared/src/hooks'),
  useFeedLayout: () => ({ shouldUseListFeedLayout: false }),
}));

jest.mock('@dailydotdev/shared/src/contexts/LogContext', () => ({
  useLogContext: () => ({ logEvent: jest.fn() }),
}));

jest.mock('@dailydotdev/shared/src/components/GrowthBookProvider', () => ({
  useFeaturesReadyContext: () => ({ getFeatureValue: jest.fn() }),
}));

jest.mock('@dailydotdev/shared/src/contexts/SettingsContext', () => ({
  useSettingsContext: () => ({ showTopSites: false }),
}));

jest.mock(
  '@dailydotdev/shared/src/features/shortcuts/hooks/useShortcutLinks',
  () => ({
    useShortcutLinks: () => ({ shortcutLinks: [] }),
  }),
);

jest.mock('@dailydotdev/shared/src/features/feedWidgets/feedState', () => ({
  useFeedWidgetShortcuts: jest.fn(),
}));

jest.mock('@dailydotdev/shared/src/contexts/DndContext', () => ({
  useDndContext: () => ({
    isActive: false,
    showDnd: false,
    setShowDnd: jest.fn(),
  }),
}));

jest.mock('@dailydotdev/shared/src/contexts/FeedContext', () => ({
  FeedLayoutProvider: ({ children }: { children: ReactNode }) => children,
}));

jest.mock('@dailydotdev/shared/src/hooks/feed/useCustomDefaultFeed', () => ({
  __esModule: true,
  default: () => ({ isCustomDefaultFeed: false }),
}));

jest.mock('./ShortcutLinks/ShortcutLinks', () => ({
  __esModule: true,
  default: () => <div data-testid="shortcut-links" />,
}));

jest.mock('./ExtensionTopBanners', () => ({
  ExtensionTopBanners: () => null,
}));

jest.mock('../companion/useCompanionSettings', () => ({
  useCompanionSettings: jest.fn(),
}));

const mockUseLaptopLayout = useLaptopLayout as jest.MockedFunction<
  typeof useLaptopLayout
>;
const mockUseFeedWidgetShortcuts =
  useFeedWidgetShortcuts as jest.MockedFunction<typeof useFeedWidgetShortcuts>;

beforeEach(() => {
  mockUseFeedWidgetShortcuts.mockReturnValue({
    hasShortcuts: false,
    isPending: false,
  });
});

const loggedOut = {
  user: undefined,
  isLoggedIn: false,
  isAuthReady: true,
  loadingUser: false,
} as unknown as AuthContextData;

const loggedIn = {
  user: loggedUser,
  isLoggedIn: true,
  isAuthReady: true,
  loadingUser: false,
} as unknown as AuthContextData;

const renderPage = ({
  auth,
  isLaptop,
  loginStrip,
}: {
  auth: AuthContextData;
  isLaptop: boolean;
  loginStrip?: ReactNode;
}) => {
  mockUseLaptopLayout.mockReturnValue(isLaptop);

  return render(
    <AuthContext.Provider value={auth}>
      <MainFeedPage onPageChanged={jest.fn()} loginStrip={loginStrip} />
    </AuthContext.Provider>,
  );
};

const loginStrip = <div data-testid="login-strip" />;

describe('MainFeedPage login strip', () => {
  it('renders the strip above the feed and the sign-in CTAs in the page header on laptop', () => {
    renderPage({ auth: loggedOut, isLaptop: true, loginStrip });

    expect(screen.getByTestId('top-banner')).toContainElement(
      screen.getByTestId('login-strip'),
    );
    expect(screen.getByTestId('shortcuts')).toBeEmptyDOMElement();

    const header = screen.getByTestId('page-header');
    expect(header).toHaveTextContent('Sign in to personalize your feed');
    expect(screen.getByRole('link', { name: 'Log in' })).toHaveAttribute(
      'href',
      loginHref,
    );
    expect(screen.getByRole('link', { name: 'Sign up' })).toHaveAttribute(
      'href',
      onboardingHref,
    );
  });

  it('renders the strip in the feed shortcuts slot below laptop', () => {
    renderPage({ auth: loggedOut, isLaptop: false, loginStrip });

    expect(screen.getByTestId('shortcuts')).toContainElement(
      screen.getByTestId('login-strip'),
    );
    expect(screen.getByTestId('top-banner')).toBeEmptyDOMElement();
  });

  it('keeps the sign-in CTAs out of the header for a logged-in user', () => {
    renderPage({ auth: loggedIn, isLaptop: true, loginStrip });

    expect(screen.getByTestId('top-banner')).toContainElement(
      screen.getByTestId('login-strip'),
    );
    expect(screen.getByTestId('page-header')).toBeEmptyDOMElement();
  });

  it('renders the shortcuts row and no sign-in UI on the regular new tab', () => {
    renderPage({ auth: loggedIn, isLaptop: false });

    expect(screen.queryByTestId('login-strip')).not.toBeInTheDocument();
    expect(screen.getByTestId('shortcut-links')).toBeInTheDocument();
    expect(screen.getByTestId('page-header')).toBeEmptyDOMElement();
    expect(
      screen.queryByText('Sign in to personalize your feed'),
    ).not.toBeInTheDocument();
  });

  it('leaves shortcuts to the rail where its Shortcuts widget shows them', () => {
    mockUseFeedWidgetShortcuts.mockReturnValue({
      hasShortcuts: true,
      isPending: false,
    });
    renderPage({ auth: loggedIn, isLaptop: false });

    expect(screen.queryByTestId('shortcut-links')).not.toBeInTheDocument();
    expect(screen.getByTestId('shortcuts')).toBeEmptyDOMElement();
  });

  it('holds the row while the rail is still unknown', () => {
    mockUseFeedWidgetShortcuts.mockReturnValue({
      hasShortcuts: false,
      isPending: true,
    });
    renderPage({ auth: loggedIn, isLaptop: false });

    expect(screen.queryByTestId('shortcut-links')).not.toBeInTheDocument();
  });
});
