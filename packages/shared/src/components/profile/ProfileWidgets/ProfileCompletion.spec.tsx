import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/router';
import type {
  LoggedUser,
  PublicProfile,
  UserExperienceLevel,
} from '../../../lib/user';
import { ProfileCompletion } from './ProfileCompletion';
import { useToastNotification, useActions } from '../../../hooks';

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

// Mock hooks
jest.mock('../../../hooks', () => ({
  useToastNotification: jest.fn(),
  useActions: jest.fn(),
}));

const mockPush = jest.fn();
const mockDisplayToast = jest.fn();
const mockCompleteAction = jest.fn();
const mockCheckHasCompleted = jest.fn();
const mockUseRouter = useRouter as jest.Mock;
const mockUseToastNotification = useToastNotification as jest.Mock;
const mockUseActions = useActions as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockUseRouter.mockReturnValue({
    push: mockPush,
    pathname: '/',
    query: {},
    asPath: '/',
  });
  mockUseToastNotification.mockReturnValue({
    displayToast: mockDisplayToast,
  });
  mockUseActions.mockReturnValue({
    completeAction: mockCompleteAction,
    checkHasCompleted: mockCheckHasCompleted,
    actions: [],
    isActionsFetched: true,
  });
  mockCheckHasCompleted.mockReturnValue(false);
});

const baseUser: PublicProfile = {
  id: 'user-1',
  name: 'Test User',
  username: 'testuser',
  premium: false,
  reputation: 20,
  image: 'https://daily.dev/test.png',
  bio: 'Test bio',
  createdAt: '2020-01-01T00:00:00.000Z',
  twitter: 'testuser',
  github: 'testuser',
  hashnode: 'testuser',
  portfolio: 'https://test.com',
  permalink: 'https://daily.dev/testuser',
  roadmap: 'testuser',
  threads: 'testuser',
  codepen: 'testuser',
  reddit: 'testuser',
  stackoverflow: '123456/testuser',
  youtube: 'testuser',
  linkedin: 'testuser',
  mastodon: 'https://mastodon.social/@testuser',
  bluesky: 'testuser.bsky.social',
  experienceLevel: 'MORE_THAN_4_YEARS' as keyof typeof UserExperienceLevel,
  companies: [{ name: 'Test Company', image: 'https://daily.dev/company.png' }],
};

describe('ProfileCompletion', () => {
  describe('Rendering', () => {
    it('should not render when profile is 100% complete', () => {
      const completeUser: LoggedUser = {
        ...baseUser,
        email: 'test@example.com',
        providers: ['google'],
      };

      render(<ProfileCompletion user={completeUser} />);
      expect(screen.queryByText('Profile Completion')).not.toBeInTheDocument();
    });

    it('should display toast when profile reaches 100% completion', () => {
      const completeUser: LoggedUser = {
        ...baseUser,
        email: 'test@example.com',
        providers: ['google'],
      };

      render(<ProfileCompletion user={completeUser} />);
      expect(mockDisplayToast).toHaveBeenCalledWith(
        'Your profile has been completed successfully. All your details are now up to date 🎉',
      );
    });

    it('should complete ProfileCompleted action when profile reaches 100%', () => {
      const completeUser: LoggedUser = {
        ...baseUser,
        email: 'test@example.com',
        providers: ['google'],
      };

      render(<ProfileCompletion user={completeUser} />);
      expect(mockCompleteAction).toHaveBeenCalledWith('profile_completed');
    });

    it('should not render if ProfileCompleted action was already completed', () => {
      mockCheckHasCompleted.mockReturnValue(true);

      const incompleteUser: PublicProfile = {
        ...baseUser,
        bio: '',
      };

      render(<ProfileCompletion user={incompleteUser} />);
      expect(screen.queryByText('Profile Completion')).not.toBeInTheDocument();
    });

    it('should render when profile is incomplete', () => {
      const incompleteUser: PublicProfile = {
        ...baseUser,
        image: '',
        bio: '',
        experienceLevel: undefined,
        companies: undefined,
      };

      render(<ProfileCompletion user={incompleteUser} />);
      expect(screen.getByText('Profile Completion')).toBeInTheDocument();
    });

    it('should display correct percentage when partially complete', () => {
      const partialUser: PublicProfile = {
        ...baseUser,
        bio: '', // Missing headline
        experienceLevel: undefined, // Missing experience level
        companies: undefined, // Missing work experience and education
      };

      render(<ProfileCompletion user={partialUser} />);
      // Only profile image is complete (1/5 = 20%)
      expect(screen.getByText('20%')).toBeInTheDocument();
    });

    it('should display correct description for single missing item', () => {
      const user: PublicProfile = {
        ...baseUser,
        bio: '', // Only missing headline
      };

      render(<ProfileCompletion user={user} />);
      expect(screen.getByText('Add Headline.')).toBeInTheDocument();
    });

    it('should display correct description for multiple missing items', () => {
      const user: PublicProfile = {
        ...baseUser,
        bio: '',
        experienceLevel: undefined,
      };

      render(<ProfileCompletion user={user} />);
      expect(
        screen.getByText('Add Headline and Experience level.'),
      ).toBeInTheDocument();
    });

    it('should display correct description for all missing items', () => {
      const user: PublicProfile = {
        ...baseUser,
        image: '',
        bio: '',
        experienceLevel: undefined,
        companies: undefined,
      };

      render(<ProfileCompletion user={user} />);
      expect(
        screen.getByText(
          'Add Profile image, Headline, Experience level, Work experience and Education.',
        ),
      ).toBeInTheDocument();
    });
  });

  describe('Completion Items Detection', () => {
    it('should detect missing profile image', () => {
      const user: PublicProfile = {
        ...baseUser,
        image: '',
      };

      render(<ProfileCompletion user={user} />);
      expect(screen.getByText(/Profile image/)).toBeInTheDocument();
    });

    it('should detect missing headline (bio)', () => {
      const user: PublicProfile = {
        ...baseUser,
        bio: '',
      };

      render(<ProfileCompletion user={user} />);
      expect(screen.getByText('Add Headline.')).toBeInTheDocument();
    });

    it('should detect missing experience level', () => {
      const user: PublicProfile = {
        ...baseUser,
        experienceLevel: undefined,
      };

      render(<ProfileCompletion user={user} />);
      expect(screen.getByText('Add Experience level.')).toBeInTheDocument();
    });

    it('should detect missing work experience (companies)', () => {
      const user: PublicProfile = {
        ...baseUser,
        companies: undefined,
      };

      render(<ProfileCompletion user={user} />);
      expect(screen.getByText(/Work experience/)).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should redirect to profile settings when profile image is missing', () => {
      const user: PublicProfile = {
        ...baseUser,
        image: '',
      };

      render(<ProfileCompletion user={user} />);
      const component = screen.getByRole('button');
      fireEvent.click(component);

      expect(mockPush).toHaveBeenCalledWith('//settings/profile');
    });

    it('should redirect to profile settings when headline is missing', () => {
      const user: PublicProfile = {
        ...baseUser,
        bio: '',
      };

      render(<ProfileCompletion user={user} />);
      const component = screen.getByRole('button');
      fireEvent.click(component);

      expect(mockPush).toHaveBeenCalledWith('//settings/profile');
    });

    it('should redirect to profile settings when experience level is missing', () => {
      const user: PublicProfile = {
        ...baseUser,
        experienceLevel: undefined,
      };

      render(<ProfileCompletion user={user} />);
      const component = screen.getByRole('button');
      fireEvent.click(component);

      expect(mockPush).toHaveBeenCalledWith('//settings/profile');
    });

    it('should redirect to first incomplete item in priority order', () => {
      const user: PublicProfile = {
        ...baseUser,
        companies: undefined, // Missing work experience (last priority)
      };

      render(<ProfileCompletion user={user} />);
      const component = screen.getByRole('button');
      fireEvent.click(component);

      // Should redirect to work experience even though it's last in priority
      expect(mockPush).toHaveBeenCalledWith('//settings/profile');
    });
  });
});
