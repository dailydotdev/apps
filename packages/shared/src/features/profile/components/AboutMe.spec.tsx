import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { PublicProfile } from '../../../lib/user';
import { AboutMe } from './AboutMe';
import { getLogContextStatic } from '../../../contexts/LogContext';

const LogContext = getLogContextStatic();

const mockLogEvent = jest.fn();

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
  socialLinks: [
    { platform: 'twitter', url: 'https://twitter.com/testuser' },
    { platform: 'github', url: 'https://github.com/testuser' },
    { platform: 'linkedin', url: 'https://linkedin.com/in/testuser' },
    { platform: 'portfolio', url: 'https://testuser.com' },
    { platform: 'youtube', url: 'https://youtube.com/@testuser' },
    {
      platform: 'stackoverflow',
      url: 'https://stackoverflow.com/users/123456/testuser',
    },
    { platform: 'reddit', url: 'https://reddit.com/u/testuser' },
    { platform: 'roadmap', url: 'https://roadmap.sh/u/testuser' },
    { platform: 'codepen', url: 'https://codepen.io/testuser' },
    { platform: 'mastodon', url: 'https://mastodon.social/@testuser' },
    {
      platform: 'bluesky',
      url: 'https://bsky.app/profile/testuser.bsky.social',
    },
    { platform: 'threads', url: 'https://threads.net/@testuser' },
  ],
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
      expect(screen.getByText('About me')).toBeInTheDocument();
      expect(
        screen.getByText('This is my awesome bio with some **markdown**!'),
      ).toBeInTheDocument();
    });

    it('should render with social links when user has them', () => {
      renderComponent(userWithSocialLinks);
      expect(screen.getByTestId('social-link-github')).toBeInTheDocument();
      expect(screen.getByTestId('social-link-linkedin')).toBeInTheDocument();
      expect(screen.getByTestId('social-link-portfolio')).toBeInTheDocument();
    });
  });

  describe('Social Links', () => {
    it('should show all social links', () => {
      renderComponent(userWithSocialLinks);
      const allLinks = screen.getAllByTestId(/^social-link-/);
      expect(allLinks.length).toBe(12);
    });

    it('should render all social link types', () => {
      renderComponent(userWithSocialLinks);
      expect(screen.getByTestId('social-link-github')).toBeInTheDocument();
      expect(screen.getByTestId('social-link-linkedin')).toBeInTheDocument();
      expect(screen.getByTestId('social-link-portfolio')).toBeInTheDocument();
      expect(screen.getByTestId('social-link-twitter')).toBeInTheDocument();
      expect(screen.getByTestId('social-link-youtube')).toBeInTheDocument();
      expect(
        screen.getByTestId('social-link-stackoverflow'),
      ).toBeInTheDocument();
      expect(screen.getByTestId('social-link-reddit')).toBeInTheDocument();
      expect(screen.getByTestId('social-link-roadmap')).toBeInTheDocument();
      expect(screen.getByTestId('social-link-codepen')).toBeInTheDocument();
      expect(screen.getByTestId('social-link-mastodon')).toBeInTheDocument();
      expect(screen.getByTestId('social-link-bluesky')).toBeInTheDocument();
      expect(screen.getByTestId('social-link-threads')).toBeInTheDocument();
    });
  });

  describe('Analytics', () => {
    it('should log click event for social links', () => {
      renderComponent(userWithSocialLinks);
      const githubLink = screen.getByTestId('social-link-github');
      fireEvent.click(githubLink);

      expect(mockLogEvent).toHaveBeenCalledWith({
        event_name: 'click',
        target_type: 'social link',
        target_id: 'github',
      });
    });
  });
});
