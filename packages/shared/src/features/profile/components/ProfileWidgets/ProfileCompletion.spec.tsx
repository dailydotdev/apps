import React from 'react';
import { render, screen } from '@testing-library/react';
import type {
  LoggedUser,
  PublicProfile,
  UserExperienceLevel,
} from '../../../../lib/user';
import { ProfileCompletion } from './ProfileCompletion';
import { useActions } from '../../../../hooks';
import { useProfileExperiences } from '../../hooks/useProfileExperiences';

// Mock hooks
jest.mock('../../../../hooks', () => ({
  useActions: jest.fn(),
}));

jest.mock('../../hooks/useProfileExperiences', () => ({
  useProfileExperiences: jest.fn(),
}));

const mockCheckHasCompleted = jest.fn();
const mockUseActions = useActions as jest.Mock;
const mockUseProfileExperiences = useProfileExperiences as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockUseActions.mockReturnValue({
    checkHasCompleted: mockCheckHasCompleted,
    actions: [],
    isActionsFetched: true,
  });
  mockCheckHasCompleted.mockReturnValue(false);
  mockUseProfileExperiences.mockReturnValue({
    work: [],
    education: [],
    isLoading: false,
  });
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
  companies: [
    {
      id: '1',
      name: 'Test Company',
      image: 'https://daily.dev/company.png',
      createdAt: new Date('2020-01-01'),
      updatedAt: new Date('2020-01-01'),
    },
  ],
};

describe('ProfileCompletion', () => {
  describe('Rendering', () => {
    it('should not render when profile is 100% complete', () => {
      mockUseProfileExperiences.mockReturnValue({
        work: [{ id: '1' }],
        education: [{ id: '1' }],
        isLoading: false,
      });

      const completeUser: LoggedUser = {
        ...baseUser,
        username: baseUser.username || 'testuser',
        email: 'test@example.com',
        providers: ['google'],
        balance: { amount: 0 },
      };

      render(<ProfileCompletion user={completeUser} />);
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
      mockUseProfileExperiences.mockReturnValue({
        work: [{ id: '1' }],
        education: [{ id: '1' }],
        isLoading: false,
      });

      const user: PublicProfile = {
        ...baseUser,
        bio: '', // Only missing headline
      };

      render(<ProfileCompletion user={user} />);
      expect(screen.getByText('Add Headline.')).toBeInTheDocument();
    });

    it('should display correct description for multiple missing items', () => {
      mockUseProfileExperiences.mockReturnValue({
        work: [{ id: '1' }],
        education: [{ id: '1' }],
        isLoading: false,
      });

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
      mockUseProfileExperiences.mockReturnValue({
        work: [{ id: '1' }],
        education: [{ id: '1' }],
        isLoading: false,
      });

      const user: PublicProfile = {
        ...baseUser,
        bio: '',
      };

      render(<ProfileCompletion user={user} />);
      expect(screen.getByText('Add Headline.')).toBeInTheDocument();
    });

    it('should detect missing experience level', () => {
      mockUseProfileExperiences.mockReturnValue({
        work: [{ id: '1' }],
        education: [{ id: '1' }],
        isLoading: false,
      });

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
    it('should have link to profile settings when profile image is missing', () => {
      const user: PublicProfile = {
        ...baseUser,
        image: '',
      };

      render(<ProfileCompletion user={user} />);
      const component = screen.getByRole('link');

      expect(component).toHaveAttribute('href', '/settings/profile');
    });

    it('should have link to profile settings when headline is missing', () => {
      mockUseProfileExperiences.mockReturnValue({
        work: [{ id: '1' }],
        education: [{ id: '1' }],
        isLoading: false,
      });

      const user: PublicProfile = {
        ...baseUser,
        bio: '',
      };

      render(<ProfileCompletion user={user} />);
      const component = screen.getByRole('link');

      expect(component).toHaveAttribute('href', '/settings/profile?field=bio');
    });

    it('should have link to profile settings when experience level is missing', () => {
      mockUseProfileExperiences.mockReturnValue({
        work: [{ id: '1' }],
        education: [{ id: '1' }],
        isLoading: false,
      });

      const user: PublicProfile = {
        ...baseUser,
        experienceLevel: undefined,
      };

      render(<ProfileCompletion user={user} />);
      const component = screen.getByRole('link');

      expect(component).toHaveAttribute(
        'href',
        '/settings/profile?field=experienceLevel',
      );
    });

    it('should have link to first incomplete item in priority order', () => {
      const user: PublicProfile = {
        ...baseUser,
        companies: undefined, // Missing work experience (last priority)
      };

      render(<ProfileCompletion user={user} />);
      const component = screen.getByRole('link');

      expect(component).toHaveAttribute(
        'href',
        '/settings/profile/experience/work',
      );
    });
  });
});
