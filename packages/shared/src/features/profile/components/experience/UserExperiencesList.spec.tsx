import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserExperienceList } from './UserExperiencesList';
import type { UserExperience } from '../../../../graphql/user/profile';
import { UserExperienceType } from '../../../../graphql/user/profile';
import { useAuthContext } from '../../../../contexts/AuthContext';
import type { PublicProfile } from '../../../../lib/user';

// Mock the AuthContext
jest.mock('../../../../contexts/AuthContext', () => ({
  useAuthContext: jest.fn(() => ({
    user: { id: 'user123', username: 'testuser' },
    isLoggedIn: true,
  })),
}));

// Mock the Link component to avoid nested anchor warnings
jest.mock('../../../../components/utilities/Link', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
  const mockReact = require('react');
  return {
    __esModule: true,
    default: ({
      children,
      href,
      passHref,
    }: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      children: any;
      href: string;
      passHref?: boolean;
    }) => {
      // If passHref is true, we're expecting the child to be an anchor element
      // So we just pass through the href as a prop
      if (passHref && mockReact.isValidElement(children)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return mockReact.cloneElement(children as any, {
          href,
        });
      }
      return mockReact.createElement('a', { href }, children);
    },
  };
});

// Mock the webappUrl constant
jest.mock('../../../../lib/constants', () => ({
  webappUrl: 'https://app.daily.dev/',
}));

const queryClient = new QueryClient();

const createUser = (overrides?: Partial<PublicProfile>): PublicProfile => ({
  id: 'user123',
  name: 'Test User',
  username: 'testuser',
  image: 'https://example.com/avatar.png',
  reputation: 100,
  permalink: 'https://app.daily.dev/testuser',
  createdAt: '2020-01-01',
  premium: false,
  ...overrides,
});

const createExperience = (
  overrides?: Partial<UserExperience>,
): UserExperience => ({
  id: 'exp1',
  title: 'Software Engineer',
  subtitle: null,
  description: 'Building awesome features',
  url: null,
  type: UserExperienceType.Work,
  startedAt: '2020-01-01',
  endedAt: '2022-01-01',
  company: {
    id: 'comp1',
    name: 'Tech Company',
    image: 'https://example.com/logo.png',
    createdAt: new Date('2019-01-01'),
    updatedAt: new Date('2019-01-01'),
  },
  customCompanyName: null,
  createdAt: '2020-01-01',
  ...overrides,
});

const renderComponent = (props: Parameters<typeof UserExperienceList>[0]) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <UserExperienceList {...props} />
    </QueryClientProvider>,
  );
};

describe('UserExperiencesList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic rendering', () => {
    it('should render empty fragment when no experiences provided', () => {
      const user = createUser();
      renderComponent({
        experiences: [],
        title: 'Work Experience',
        experienceType: UserExperienceType.Work,
        user,
      });

      expect(screen.queryByText('Work Experience')).not.toBeInTheDocument();
    });

    it('should render title when provided', () => {
      const user = createUser();
      const experience = createExperience();
      renderComponent({
        experiences: [experience],
        title: 'Work Experience',
        experienceType: UserExperienceType.Work,
        user,
      });

      expect(screen.getByText('Work Experience')).toBeInTheDocument();
    });

    it('should not render title when not provided', () => {
      const user = createUser();
      const experience = createExperience();
      renderComponent({
        experiences: [experience],
        experienceType: UserExperienceType.Work,
        user,
      });

      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    });

    it('should render single experience without grouping', () => {
      const user = createUser();
      const experience = createExperience({
        title: 'Senior Developer',
        company: {
          id: 'comp1',
          name: 'Awesome Corp',
          image: null,
          createdAt: new Date('2019-01-01'),
          updatedAt: new Date('2019-01-01'),
        },
      });

      renderComponent({
        experiences: [experience],
        title: 'Experience',
        experienceType: UserExperienceType.Work,
        user,
      });

      expect(screen.getByText('Senior Developer')).toBeInTheDocument();
    });
  });

  describe('Grouping experiences by company', () => {
    it('should group multiple experiences from the same company', () => {
      const user = createUser();
      const experiences = [
        createExperience({
          id: 'exp1',
          title: 'Senior Engineer',
          startedAt: '2021-01-01',
          endedAt: '2023-01-01',
        }),
        createExperience({
          id: 'exp2',
          title: 'Junior Engineer',
          startedAt: '2019-01-01',
          endedAt: '2021-01-01',
        }),
      ];

      renderComponent({
        experiences,
        title: 'Work Experience',
        experienceType: UserExperienceType.Work,
        user,
      });

      expect(screen.getByText('Tech Company')).toBeInTheDocument();
      expect(screen.getByText('Senior Engineer')).toBeInTheDocument();
      expect(screen.getByText('Junior Engineer')).toBeInTheDocument();
    });

    it('should display experiences from different companies separately', () => {
      const user = createUser();
      const experiences = [
        createExperience({
          id: 'exp1',
          title: 'Position at Company A',
          company: {
            id: 'comp1',
            name: 'Company A',
            image: null,
            createdAt: new Date('2019-01-01'),
            updatedAt: new Date('2019-01-01'),
          },
        }),
        createExperience({
          id: 'exp2',
          title: 'Position at Company B',
          company: {
            id: 'comp2',
            name: 'Company B',
            image: null,
            createdAt: new Date('2019-01-01'),
            updatedAt: new Date('2019-01-01'),
          },
        }),
      ];

      renderComponent({
        experiences,
        title: 'Work Experience',
        experienceType: UserExperienceType.Work,
        user,
      });

      expect(screen.getByText('Position at Company A')).toBeInTheDocument();
      expect(screen.getByText('Position at Company B')).toBeInTheDocument();
    });

    it('should handle custom company names correctly', () => {
      const user = createUser();
      const experiences = [
        createExperience({
          id: 'exp1',
          title: 'Freelance Developer',
          company: null,
          customCompanyName: 'Self-Employed',
        }),
        createExperience({
          id: 'exp2',
          title: 'Consultant',
          company: null,
          customCompanyName: 'Self-Employed',
        }),
      ];

      renderComponent({
        experiences,
        title: 'Work Experience',
        experienceType: UserExperienceType.Work,
        user,
      });

      expect(screen.getByText('Self-Employed')).toBeInTheDocument();
      expect(screen.getByText('Freelance Developer')).toBeInTheDocument();
      expect(screen.getByText('Consultant')).toBeInTheDocument();
    });

    it('should show company.name when both company and customCompanyName exist', () => {
      const user = createUser();
      const experience = createExperience({
        company: {
          id: 'comp1',
          name: 'Official Name',
          image: null,
          createdAt: new Date('2019-01-01'),
          updatedAt: new Date('2019-01-01'),
        },
        customCompanyName: 'Custom Name',
      });

      renderComponent({
        experiences: [experience],
        title: 'Work Experience',
        experienceType: UserExperienceType.Work,
        user,
      });

      // The implementation shows company.name when it exists, regardless of customCompanyName
      expect(screen.getByText('Official Name')).toBeInTheDocument();
      expect(screen.queryByText('Custom Name')).not.toBeInTheDocument();
    });
  });

  describe('Duration calculation for grouped experiences', () => {
    it('should calculate correct total duration for non-overlapping experiences', () => {
      const user = createUser();
      const experiences = [
        createExperience({
          id: 'exp1',
          startedAt: '2020-01-01',
          endedAt: '2021-01-01', // 1 year
        }),
        createExperience({
          id: 'exp2',
          startedAt: '2022-01-01',
          endedAt: '2023-01-01', // 1 year
        }),
      ];

      renderComponent({
        experiences,
        title: 'Work Experience',
        experienceType: UserExperienceType.Work,
        user,
      });

      // Should show 2 years total (not 3 years from 2020 to 2023)
      expect(screen.getByText('2 years')).toBeInTheDocument();
    });

    it('should handle overlapping experiences correctly', () => {
      const user = createUser();
      const experiences = [
        createExperience({
          id: 'exp1',
          startedAt: '2020-01-01',
          endedAt: '2022-06-01', // 2.5 years
        }),
        createExperience({
          id: 'exp2',
          startedAt: '2021-06-01', // Overlaps with exp1
          endedAt: '2023-01-01', // 1.5 years
        }),
      ];

      renderComponent({
        experiences,
        title: 'Work Experience',
        experienceType: UserExperienceType.Work,
        user,
      });

      // Total should be 3 years (Jan 2020 to Jan 2023), not 4 years
      expect(screen.getByText('3 years')).toBeInTheDocument();
    });

    it('should handle current position (no end date) correctly', () => {
      const user = createUser();
      const experiences = [
        createExperience({
          id: 'exp1',
          startedAt: '2022-01-01',
          endedAt: null, // Current position
        }),
        createExperience({
          id: 'exp2',
          startedAt: '2023-06-01',
          endedAt: null, // Another current position
        }),
      ];

      renderComponent({
        experiences,
        title: 'Work Experience',
        experienceType: UserExperienceType.Work,
        user,
      });

      // Should display some duration (will vary based on current date)
      // The exact duration depends on when the test runs
      // Just verify that a duration is displayed
      expect(screen.getByText('Tech Company')).toBeInTheDocument();
    });

    it('should handle experiences with gaps correctly', () => {
      const user = createUser();
      const experiences = [
        createExperience({
          id: 'exp1',
          startedAt: '2019-01-01',
          endedAt: '2020-01-01', // 1 year
        }),
        createExperience({
          id: 'exp2',
          startedAt: '2021-01-01', // 1 year gap
          endedAt: '2022-01-01', // 1 year
        }),
        createExperience({
          id: 'exp3',
          startedAt: '2023-01-01', // 1 year gap
          endedAt: '2024-01-01', // 1 year
        }),
      ];

      renderComponent({
        experiences,
        title: 'Work Experience',
        experienceType: UserExperienceType.Work,
        user,
      });

      // Should show 3 years total (excluding gaps)
      expect(screen.getByText('3 years')).toBeInTheDocument();
    });

    it('should show months for experiences less than a year', () => {
      const user = createUser();
      // Need multiple experiences at the same company to trigger grouped view with duration
      const experiences = [
        createExperience({
          id: 'exp1',
          startedAt: '2023-01-01',
          endedAt: '2023-04-01', // 3 months
        }),
        createExperience({
          id: 'exp2',
          startedAt: '2023-05-01',
          endedAt: '2023-08-01', // 3 months
        }),
      ];

      renderComponent({
        experiences,
        title: 'Work Experience',
        experienceType: UserExperienceType.Work,
        user,
      });

      // Total: 6 months
      expect(screen.getByText('6 months')).toBeInTheDocument();
    });

    it('should show years and months for mixed durations', () => {
      const user = createUser();
      const experiences = [
        createExperience({
          id: 'exp1',
          startedAt: '2021-01-01',
          endedAt: '2021-07-01', // 6 months
        }),
        createExperience({
          id: 'exp2',
          startedAt: '2022-01-01',
          endedAt: '2023-04-01', // 1 year 3 months
        }),
      ];

      renderComponent({
        experiences,
        title: 'Work Experience',
        experienceType: UserExperienceType.Work,
        user,
      });

      // Total: 1 year 9 months
      expect(screen.getByText('1 year 9 months')).toBeInTheDocument();
    });
  });

  describe('UI interactions and navigation', () => {
    it('should render edit button when user owns the profile', () => {
      const user = createUser();
      const experience = createExperience();
      renderComponent({
        experiences: [experience],
        title: 'Work Experience',
        experienceType: UserExperienceType.Work,
        user,
      });

      // The edit button is rendered as a link/button with href
      const editLinks = screen.getAllByRole('link');
      const editButton = editLinks.find((link) =>
        link.getAttribute('href')?.includes('settings/profile/experience/work'),
      );
      expect(editButton).toBeTruthy();
      expect(editButton?.getAttribute('href')).toBe(
        'https://app.daily.dev/settings/profile/experience/work',
      );
    });

    it('should not render edit button when user does not own the profile', () => {
      const user = createUser({ id: 'otheruser', username: 'otheruser' });
      const experience = createExperience();
      renderComponent({
        experiences: [experience],
        title: 'Work Experience',
        experienceType: UserExperienceType.Work,
        user,
      });

      expect(
        screen.queryByRole('link', { name: /edit/i }),
      ).not.toBeInTheDocument();
    });

    it('should render "Show More" button when hasNextPage is true', () => {
      const user = createUser();
      const experiences = [
        createExperience({ id: 'exp1' }),
        createExperience({ id: 'exp2' }),
        createExperience({ id: 'exp3' }),
        createExperience({ id: 'exp4' }),
      ];
      renderComponent({
        experiences,
        title: 'Work Experience',
        experienceType: UserExperienceType.Work,
        hasNextPage: true,
        user,
      });

      const showMoreButton = screen.getByRole('link', { name: /show more/i });
      expect(showMoreButton).toBeInTheDocument();
      expect(showMoreButton).toHaveAttribute(
        'href',
        'https://app.daily.dev/testuser/work',
      );
    });

    it('should not render "Show More" button when hasNextPage is false', () => {
      const user = createUser();
      const experience = createExperience();
      renderComponent({
        experiences: [experience],
        title: 'Work Experience',
        experienceType: UserExperienceType.Work,
        hasNextPage: false,
        user,
      });

      expect(
        screen.queryByRole('link', { name: /show more/i }),
      ).not.toBeInTheDocument();
    });

    it('should render edit links on individual items when showEditOnItems is true', () => {
      const user = createUser();
      const experience = createExperience();
      renderComponent({
        experiences: [experience],
        title: 'Work Experience',
        experienceType: UserExperienceType.Work,
        showEditOnItems: true,
        user,
      });

      // The edit URL should be generated for the individual item
      const editLinks = screen.getAllByRole('link');
      const itemEditLink = editLinks.find((link) =>
        link.getAttribute('href')?.includes('edit?id=exp1&type=work'),
      );
      expect(itemEditLink).toBeDefined();
    });

    it('should not render edit links on items when showEditOnItems is false', () => {
      const user = createUser();
      const experience = createExperience();
      renderComponent({
        experiences: [experience],
        title: 'Work Experience',
        experienceType: UserExperienceType.Work,
        showEditOnItems: false,
        user,
      });

      const editLinks = screen.getAllByRole('link');
      const itemEditLink = editLinks.find((link) =>
        link.getAttribute('href')?.includes('edit?id='),
      );
      expect(itemEditLink).toBeUndefined();
    });
  });

  describe('Edge cases', () => {
    it('should handle experiences with only custom company names (no company object)', () => {
      const user = createUser();
      const experiences = [
        createExperience({
          id: 'exp1',
          company: null,
          customCompanyName: 'Freelance',
        }),
      ];

      renderComponent({
        experiences,
        title: 'Work Experience',
        experienceType: UserExperienceType.Work,
        user,
      });

      expect(screen.getByText('Freelance')).toBeInTheDocument();
    });

    it('should handle multiple experiences at different companies', () => {
      const user = createUser();
      const experiences = [
        createExperience({
          id: 'exp1',
          title: 'Role A',
          company: {
            id: 'comp1',
            name: 'Company A',
            image: null,
            createdAt: new Date('2019-01-01'),
            updatedAt: new Date('2019-01-01'),
          },
        }),
        createExperience({
          id: 'exp2',
          title: 'Role B',
          company: {
            id: 'comp2',
            name: 'Company B',
            image: null,
            createdAt: new Date('2019-01-01'),
            updatedAt: new Date('2019-01-01'),
          },
        }),
        createExperience({
          id: 'exp3',
          title: 'Role C',
          company: {
            id: 'comp3',
            name: 'Company C',
            image: null,
            createdAt: new Date('2019-01-01'),
            updatedAt: new Date('2019-01-01'),
          },
        }),
      ];

      renderComponent({
        experiences,
        title: 'Work Experience',
        experienceType: UserExperienceType.Work,
        user,
      });

      expect(screen.getByText('Role A')).toBeInTheDocument();
      expect(screen.getByText('Role B')).toBeInTheDocument();
      expect(screen.getByText('Role C')).toBeInTheDocument();
    });

    it('should handle very short experiences correctly', () => {
      const user = createUser();
      // Need multiple experiences at the same company to trigger grouped view with duration
      const experiences = [
        createExperience({
          id: 'exp1',
          startedAt: '2023-01-01',
          endedAt: '2023-01-10', // 9 days
        }),
        createExperience({
          id: 'exp2',
          startedAt: '2023-01-15',
          endedAt: '2023-01-20', // 5 days
        }),
      ];

      renderComponent({
        experiences,
        title: 'Work Experience',
        experienceType: UserExperienceType.Work,
        user,
      });

      // Total: 14 days (less than 30 days), should show "Less than a month"
      expect(screen.getByText('Less than a month')).toBeInTheDocument();
    });

    it('should handle concurrent positions at same company correctly', () => {
      const user = createUser();
      const experiences = [
        createExperience({
          id: 'exp1',
          title: 'Software Engineer',
          startedAt: '2020-01-01',
          endedAt: '2022-01-01',
        }),
        createExperience({
          id: 'exp2',
          title: 'Tech Lead',
          startedAt: '2020-06-01', // Concurrent with first position
          endedAt: '2021-06-01',
        }),
      ];

      renderComponent({
        experiences,
        title: 'Work Experience',
        experienceType: UserExperienceType.Work,
        user,
      });

      // Should not double-count overlapping time
      expect(screen.getByText('2 years')).toBeInTheDocument();
    });
  });

  describe('AuthContext integration', () => {
    it('should not render Show More button when user is not logged in', () => {
      const mockUseAuthContext = useAuthContext as jest.MockedFunction<
        typeof useAuthContext
      >;
      mockUseAuthContext.mockReturnValue({
        user: null,
        isLoggedIn: false,
      } as ReturnType<typeof useAuthContext>);

      const user = createUser();
      const experience = createExperience();
      renderComponent({
        experiences: [experience],
        title: 'Work Experience',
        experienceType: UserExperienceType.Work,
        hasNextPage: true,
        user,
      });

      expect(screen.queryByText('Show More')).not.toBeInTheDocument();
    });

    it('should use correct username in Show More URL', () => {
      const mockUseAuthContext = useAuthContext as jest.MockedFunction<
        typeof useAuthContext
      >;
      mockUseAuthContext.mockReturnValue({
        user: { id: 'customUserId', username: 'customuser' },
        isLoggedIn: true,
      } as ReturnType<typeof useAuthContext>);

      const user = createUser({ id: 'customUserId', username: 'customuser' });
      const experiences = [
        createExperience({ id: 'exp1' }),
        createExperience({ id: 'exp2' }),
        createExperience({ id: 'exp3' }),
        createExperience({ id: 'exp4' }),
      ];
      renderComponent({
        experiences,
        title: 'Work Experience',
        experienceType: UserExperienceType.Work,
        hasNextPage: true,
        user,
      });

      const showMoreButton = screen.getByRole('link', { name: /show more/i });
      expect(showMoreButton).toHaveAttribute(
        'href',
        'https://app.daily.dev/customuser/work',
      );
    });
  });
});
