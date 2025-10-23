import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Share } from './Share';
import AuthContext from '../../../../contexts/AuthContext';
import { getLogContextStatic } from '../../../../contexts/LogContext';
import { useGetShortUrl } from '../../../../hooks/utils/useGetShortUrl';
import { useShareOrCopyLink } from '../../../../hooks/useShareOrCopyLink';
import { ShareProvider } from '../../../../lib/share';

jest.mock('../../../../hooks/utils/useGetShortUrl');
jest.mock('../../../../hooks/useShareOrCopyLink');

const mockGetShortUrl = useGetShortUrl as jest.MockedFunction<
  typeof useGetShortUrl
>;
const mockUseShareOrCopyLink = useShareOrCopyLink as jest.MockedFunction<
  typeof useShareOrCopyLink
>;

describe('Share', () => {
  const mockUser = {
    id: '1',
    name: 'Test User',
    username: 'testuser',
    email: 'test@example.com',
    image: 'https://daily-now-res.cloudinary.com/image/upload/placeholder.jpg',
    providers: ['google'],
  };

  let queryClient: QueryClient;
  let mockLogEvent: jest.Mock;
  let mockGetShortUrlFn: jest.Mock;
  let mockOnShareOrCopy: jest.Mock;

  const renderComponent = (username = 'thecoverliker') => {
    const LogContext = getLogContextStatic();

    return render(
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider
          value={{
            user: mockUser,
            shouldShowLogin: false,
            showLogin: jest.fn(),
            logout: jest.fn(),
            updateUser: jest.fn(),
            tokenRefreshed: true,
            getRedirectUri: jest.fn(),
            loadingUser: false,
            loadedUserFromCache: true,
            refetchBoot: jest.fn(),
            squads: [],
            isAndroidApp: false,
          }}
        >
          <LogContext.Provider
            value={{
              logEvent: mockLogEvent,
              logEventStart: jest.fn(),
              logEventEnd: jest.fn(),
              sendBeacon: jest.fn(),
            }}
          >
            <Share username={username} />
          </LogContext.Provider>
        </AuthContext.Provider>
      </QueryClientProvider>,
    );
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    mockLogEvent = jest.fn();
    mockGetShortUrlFn = jest.fn().mockResolvedValue('https://dly.to/abc123');
    mockOnShareOrCopy = jest.fn();

    mockGetShortUrl.mockReturnValue({
      getShortUrl: mockGetShortUrlFn,
    });

    mockUseShareOrCopyLink.mockReturnValue([false, mockOnShareOrCopy]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the component', async () => {
      renderComponent();

      expect(screen.getByText('Public profile & URL')).toBeInTheDocument();

      // Wait for async updates to complete
      await waitFor(() => {
        expect(mockGetShortUrlFn).toHaveBeenCalled();
      });
    });
  });

  describe('Short URL functionality', () => {
    it('should call getShortUrl on mount', async () => {
      renderComponent('testuser');

      await waitFor(() => {
        expect(mockGetShortUrlFn).toHaveBeenCalledWith('//testuser');
      });
    });
  });

  describe('Copy functionality', () => {
    it('should call onShareOrCopy when copy button is clicked', async () => {
      renderComponent();

      const copyButton = screen.getByLabelText('Copy link');
      fireEvent.click(copyButton);

      expect(mockOnShareOrCopy).toHaveBeenCalledTimes(1);

      await waitFor(() => {
        expect(mockGetShortUrlFn).toHaveBeenCalled();
      });
    });

    it('should pass correct props to useShareOrCopyLink', async () => {
      renderComponent('testuser');

      expect(mockUseShareOrCopyLink).toHaveBeenCalledWith({
        link: '//testuser',
        text: 'Check out my profile on daily.dev!',
        logObject: expect.any(Function),
      });

      await waitFor(() => {
        expect(mockGetShortUrlFn).toHaveBeenCalled();
      });
    });
  });

  describe('Social share buttons', () => {
    it('should have correct href for Twitter share button', async () => {
      renderComponent('testuser');

      const twitterButton = screen.getByLabelText('Share on X');
      expect(twitterButton).toHaveAttribute('href');
      expect(twitterButton).toHaveAttribute(
        'href',
        expect.stringContaining('twitter.com'),
      );

      await waitFor(() => {
        expect(mockGetShortUrlFn).toHaveBeenCalled();
      });
    });

    it('should log event when social share button is clicked', async () => {
      renderComponent('testuser');

      const twitterButton = screen.getByLabelText('Share on X');
      fireEvent.click(twitterButton);

      expect(mockLogEvent).toHaveBeenCalledWith({
        event_name: 'share profile',
        target_type: 'profile page',
        extra: JSON.stringify({ provider: ShareProvider.Twitter }),
      });

      await waitFor(() => {
        expect(mockGetShortUrlFn).toHaveBeenCalled();
      });
    });

    it('should open links in new tab with correct rel attribute', async () => {
      renderComponent();

      const twitterButton = screen.getByLabelText('Share on X');
      expect(twitterButton).toHaveAttribute('target', '_blank');
      expect(twitterButton).toHaveAttribute('rel', 'noopener noreferrer');

      await waitFor(() => {
        expect(mockGetShortUrlFn).toHaveBeenCalled();
      });
    });
  });

  describe('Native share', () => {
    let mockNavigatorShare: jest.Mock;

    beforeEach(() => {
      mockNavigatorShare = jest.fn().mockResolvedValue(undefined);
      Object.defineProperty(globalThis, 'navigator', {
        value: {
          share: mockNavigatorShare,
        },
        writable: true,
        configurable: true,
      });
    });

    afterEach(() => {
      delete (globalThis as Record<string, unknown>).navigator;
    });

    it('should render native share button when navigator.share is available', () => {
      renderComponent();

      expect(screen.getByLabelText('Share via...')).toBeInTheDocument();
    });

    it('should call navigator.share with correct data when native share button is clicked', async () => {
      renderComponent('testuser');

      // Wait for short URL to be fetched
      await waitFor(() => {
        expect(mockGetShortUrlFn).toHaveBeenCalled();
      });

      const nativeShareButton = screen.getByLabelText('Share via...');
      fireEvent.click(nativeShareButton);

      await waitFor(() => {
        expect(mockNavigatorShare).toHaveBeenCalledWith({
          title: 'My daily.dev profile',
          text: 'Check out my profile on daily.dev!',
          url: 'https://dly.to/abc123',
        });
      });
    });

    it('should log event when native share is successful', async () => {
      renderComponent('testuser');

      await waitFor(() => {
        expect(mockGetShortUrlFn).toHaveBeenCalled();
      });

      const nativeShareButton = screen.getByLabelText('Share via...');
      fireEvent.click(nativeShareButton);

      await waitFor(() => {
        expect(mockLogEvent).toHaveBeenCalledWith({
          event_name: 'share profile',
          target_type: 'profile page',
          extra: JSON.stringify({ provider: ShareProvider.Native }),
        });
      });
    });
  });
});
