import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type {
  ProfileCompletion as ProfileCompletionData,
  LoggedUser,
} from '../../../../lib/user';
import { ProfileCompletion } from './ProfileCompletion';
import { AuthContextProvider } from '../../../../contexts/AuthContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const createMockUser = (
  profileCompletion: ProfileCompletionData,
): LoggedUser => ({
  id: 'user-1',
  name: 'Test User',
  username: 'testuser',
  email: 'test@example.com',
  image: 'https://daily.dev/test.png',
  providers: ['google'],
  balance: { amount: 0 },
  premium: false,
  reputation: 20,
  bio: 'Test bio',
  createdAt: '2020-01-01T00:00:00.000Z',
  permalink: 'https://daily.dev/testuser',
  profileCompletion,
});

const renderWithAuth = (user: LoggedUser | null) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthContextProvider
        user={user}
        updateUser={jest.fn()}
        tokenRefreshed
        getRedirectUri={jest.fn()}
        closeLogin={jest.fn()}
        loadingUser={false}
        loadedUserFromCache
        refetchBoot={jest.fn()}
        firstLoad={false}
        isValidSession
      >
        <ProfileCompletion />
      </AuthContextProvider>
    </QueryClientProvider>,
  );
};

describe('ProfileCompletion', () => {
  describe('Rendering', () => {
    it('should not render when profile is 100% complete', () => {
      const user = createMockUser({
        percentage: 100,
        hasProfileImage: true,
        hasHeadline: true,
        hasExperienceLevel: true,
        hasWork: true,
        hasEducation: true,
      });

      renderWithAuth(user);
      expect(screen.queryByText('Profile Completion')).not.toBeInTheDocument();
    });

    it('should not render when user is not logged in', () => {
      renderWithAuth(null);
      expect(screen.queryByText('Profile Completion')).not.toBeInTheDocument();
    });

    it('should render when profile is incomplete', () => {
      const user = createMockUser({
        percentage: 0,
        hasProfileImage: false,
        hasHeadline: false,
        hasExperienceLevel: false,
        hasWork: false,
        hasEducation: false,
      });

      renderWithAuth(user);
      expect(screen.getByText('Profile Completion')).toBeInTheDocument();
    });

    it('should display correct percentage when partially complete', () => {
      const user = createMockUser({
        percentage: 20,
        hasProfileImage: true,
        hasHeadline: false,
        hasExperienceLevel: false,
        hasWork: false,
        hasEducation: false,
      });

      renderWithAuth(user);
      expect(screen.getByText('20%')).toBeInTheDocument();
    });

    it('should display correct description for single missing item', () => {
      const user = createMockUser({
        percentage: 80,
        hasProfileImage: true,
        hasHeadline: false,
        hasExperienceLevel: true,
        hasWork: true,
        hasEducation: true,
      });

      renderWithAuth(user);
      expect(screen.getByText('Add Headline.')).toBeInTheDocument();
    });

    it('should display correct description for multiple missing items', () => {
      const user = createMockUser({
        percentage: 60,
        hasProfileImage: true,
        hasHeadline: false,
        hasExperienceLevel: false,
        hasWork: true,
        hasEducation: true,
      });

      renderWithAuth(user);
      expect(
        screen.getByText('Add Headline and Experience level.'),
      ).toBeInTheDocument();
    });

    it('should display correct description for all missing items', () => {
      const user = createMockUser({
        percentage: 0,
        hasProfileImage: false,
        hasHeadline: false,
        hasExperienceLevel: false,
        hasWork: false,
        hasEducation: false,
      });

      renderWithAuth(user);
      expect(
        screen.getByText(
          'Add Profile image, Headline, Experience level, Work experience and Education.',
        ),
      ).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should have link to profile settings when profile image is missing', () => {
      const user = createMockUser({
        percentage: 80,
        hasProfileImage: false,
        hasHeadline: true,
        hasExperienceLevel: true,
        hasWork: true,
        hasEducation: true,
      });

      renderWithAuth(user);
      const component = screen.getByRole('link');

      expect(component).toHaveAttribute('href', '/settings/profile');
    });

    it('should have link to profile settings when headline is missing', () => {
      const user = createMockUser({
        percentage: 80,
        hasProfileImage: true,
        hasHeadline: false,
        hasExperienceLevel: true,
        hasWork: true,
        hasEducation: true,
      });

      renderWithAuth(user);
      const component = screen.getByRole('link');

      expect(component).toHaveAttribute('href', '/settings/profile?field=bio');
    });

    it('should have link to profile settings when experience level is missing', () => {
      const user = createMockUser({
        percentage: 80,
        hasProfileImage: true,
        hasHeadline: true,
        hasExperienceLevel: false,
        hasWork: true,
        hasEducation: true,
      });

      renderWithAuth(user);
      const component = screen.getByRole('link');

      expect(component).toHaveAttribute(
        'href',
        '/settings/profile?field=experienceLevel',
      );
    });

    it('should have link to work experience when work is missing', () => {
      const user = createMockUser({
        percentage: 80,
        hasProfileImage: true,
        hasHeadline: true,
        hasExperienceLevel: true,
        hasWork: false,
        hasEducation: true,
      });

      renderWithAuth(user);
      const component = screen.getByRole('link');

      expect(component).toHaveAttribute(
        'href',
        '/settings/profile/experience/work',
      );
    });

    it('should have link to first incomplete item in priority order', () => {
      const user = createMockUser({
        percentage: 80,
        hasProfileImage: true,
        hasHeadline: true,
        hasExperienceLevel: true,
        hasWork: true,
        hasEducation: false,
      });

      renderWithAuth(user);
      const component = screen.getByRole('link');

      expect(component).toHaveAttribute(
        'href',
        '/settings/profile/experience/education',
      );
    });
  });
});
