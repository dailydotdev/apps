import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/router';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import useCustomDefaultFeed from '../../hooks/feed/useCustomDefaultFeed';
import { ExploreChipsBar } from './ExploreChipsBar';
import type { ExploreCategory } from './exploreCategories';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../utilities/Link', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('../../contexts/AuthContext', () => ({
  useAuthContext: jest.fn(),
}));

jest.mock('../../contexts/LogContext', () => ({
  useLogContext: jest.fn(),
}));

jest.mock('../../hooks/feed/useCustomDefaultFeed', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('./NewStripCta', () => ({
  NewStripCta: ({ className }: { className?: string }) => (
    <a href="/new" className={className}>
      New
    </a>
  ),
}));

jest.mock('../../lib/constants', () => ({
  webappUrl: '/',
}));

const mockUseRouter = useRouter as jest.Mock;
const mockUseAuthContext = useAuthContext as jest.Mock;
const mockUseLogContext = useLogContext as jest.Mock;
const mockUseCustomDefaultFeed = useCustomDefaultFeed as jest.Mock;

const scrollIntoView = jest.fn();

const createCategories = (): ExploreCategory[] => [
  { id: 'javascript', label: 'JavaScript', path: '/tags/javascript' },
  { id: 'react', label: 'React', path: '/tags/react' },
];

const mockRouterPath = (asPath: string) => {
  mockUseRouter.mockReturnValue({
    asPath,
    pathname: asPath,
    query: {},
  });
};

describe('ExploreChipsBar', () => {
  beforeAll(() => {
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoView,
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    scrollIntoView.mockClear();
    mockRouterPath('/tags/javascript');
    mockUseAuthContext.mockReturnValue({ isLoggedIn: true });
    mockUseLogContext.mockReturnValue({ logEvent: jest.fn() });
    mockUseCustomDefaultFeed.mockReturnValue({ isCustomDefaultFeed: false });
  });

  it('renders the For you category ahead of the given categories', () => {
    mockRouterPath('/');

    render(<ExploreChipsBar categories={createCategories()} />);

    expect(screen.getByRole('link', { name: 'For you' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('centers only when the active category identity changes', async () => {
    const { rerender } = render(
      <ExploreChipsBar categories={createCategories()} />,
    );

    await waitFor(() => {
      expect(scrollIntoView).toHaveBeenCalledTimes(1);
    });

    rerender(<ExploreChipsBar categories={createCategories()} />);

    expect(scrollIntoView).toHaveBeenCalledTimes(1);

    mockRouterPath('/tags/react');
    rerender(<ExploreChipsBar categories={createCategories()} />);

    await waitFor(() => {
      expect(scrollIntoView).toHaveBeenCalledTimes(2);
    });
  });
});
