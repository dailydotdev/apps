import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { PublicProfile } from '../../../../lib/user';
import { AboutMe } from './AboutMe';
import { getLogContextStatic } from '../../../../contexts/LogContext';

const LogContext = getLogContextStatic();

const mockCopyLink = jest.fn();
const mockLogEvent = jest.fn();

// Mock useCopyLink hook
jest.mock('../../../../hooks/useCopy', () => ({
  useCopyLink: () => [jest.fn(), mockCopyLink],
}));

beforeEach(() => {
  jest.clearAllMocks();
  // Mock window for client-side check
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: 1024,
  });
});

const baseUser: PublicProfile = {
  id: 'u1',
  name: 'Test User',
  username: 'testuser',
  image: 'https://daily.dev/user.png',
  permalink: 'https://daily.dev/testuser',
  reputation: 100,
  createdAt: '2020-01-01T00:00:00.000Z',
  premium: false,
};

const userWithReadme: PublicProfile = {
  ...baseUser,
  readmeHtml: 'This is my awesome bio with some **markdown**!',
};

const userWithSocialLinks: PublicProfile = {
  ...userWithReadme,
  twitter: 'testuser',
  github: 'testuser',
  linkedin: 'https://linkedin.com/in/testuser',
  portfolio: 'https://testuser.com',
  youtube: 'testuser',
  stackoverflow: '123456/testuser',
  reddit: 'testuser',
  roadmap: 'testuser',
  codepen: 'testuser',
  mastodon: 'https://mastodon.social/@testuser',
  bluesky: 'testuser.bsky.social',
  threads: 'testuser',
};

const renderComponent = (user: Partial<PublicProfile> = {}) => {
  const mergedUser = { ...baseUser, ...user };
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <LogContext.Provider
        value={{
          logEvent: mockLogEvent,
          logEventStart: jest.fn(),
          logEventEnd: jest.fn(),
          sendBeacon: jest.fn(),
        }}
      >
        <AboutMe user={mergedUser} />
      </LogContext.Provider>
    </QueryClientProvider>,
  );
};

describe('AboutMe', () => {
  describe('Rendering', () => {
    it('should not render when both readme and social links are not present', () => {
      const { container } = renderComponent();
      expect(container).toBeEmptyDOMElement();
    });

    it('should render when readme is present', () => {
      renderComponent(userWithReadme);
      expect(screen.getAllByText('About me')[0]).toBeInTheDocument();
      expect(
        screen.getAllByText(
          'This is my awesome bio with some **markdown**!',
        )[0],
      ).toBeInTheDocument();
    });

    it('should render with social links when user has them', () => {
      renderComponent(userWithSocialLinks);
      expect(
        screen.getAllByTestId('social-link-github')[0],
      ).toBeInTheDocument();
      expect(
        screen.getAllByTestId('social-link-linkedin')[0],
      ).toBeInTheDocument();
      expect(
        screen.getAllByTestId('social-link-portfolio')[0],
      ).toBeInTheDocument();
    });
  });

  describe('Social Links', () => {
    it('should show only first 3 social links initially', () => {
      renderComponent(userWithSocialLinks);
      // Each link appears twice (measurement + visible), so we check the first half
      const allLinks = screen.getAllByTestId(/^social-link-/);
      const visibleLinks = allLinks.slice(0, allLinks.length / 2);
      expect(visibleLinks.length).toBe(3);
    });

    it('should show "+N" button when more than 3 links', () => {
      renderComponent(userWithSocialLinks);
      const showAllButtons = screen.getAllByTestId('show-all-links');
      expect(showAllButtons[0]).toBeInTheDocument();
      // 12 total links - 3 visible = 9 more
      expect(showAllButtons[0]).toHaveTextContent('+9');
    });

    it('should show all links when "+N" button is clicked', async () => {
      renderComponent(userWithSocialLinks);
      const showAllButton = screen.getAllByTestId('show-all-links')[0];
      fireEvent.click(showAllButton);

      await waitFor(() => {
        const allLinks = screen.getAllByTestId(/^social-link-/);
        const visibleLinks = allLinks.slice(0, allLinks.length / 2);
        expect(visibleLinks.length).toBe(12); // All 12 social links
      });
    });

    it('should hide "+N" button after showing all links', async () => {
      renderComponent(userWithSocialLinks);
      const showAllButton = screen.getAllByTestId('show-all-links')[0];
      fireEvent.click(showAllButton);

      await waitFor(() => {
        expect(screen.queryByTestId('show-all-links')).not.toBeInTheDocument();
      });
    });
  });

  describe('Analytics', () => {
    it('should log click event for social links', () => {
      renderComponent(userWithSocialLinks);
      const githubLink = screen.getAllByTestId('social-link-github')[0];
      fireEvent.click(githubLink);

      expect(mockLogEvent).toHaveBeenCalledWith({
        event_name: 'click',
        target_type: 'social link',
        target_id: 'github',
      });
    });
  });
});
