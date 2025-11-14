import React from 'react';
import type { RenderResult } from '@testing-library/react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import nock from 'nock';
import { mocked } from 'ts-jest/utils';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import defaultUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import { mockGraphQL } from '@dailydotdev/shared/__tests__/helpers/graphql';
import { TestBootProvider } from '@dailydotdev/shared/__tests__/helpers/boot';
import type { ActionType } from '@dailydotdev/shared/src/graphql/actions';
import type {
  Opportunity,
  OpportunityMatch,
} from '@dailydotdev/shared/src/features/opportunity/types';
import { OpportunityMatchStatus } from '@dailydotdev/shared/src/features/opportunity/types';
import JobPage from '../pages/opportunity/[id]/index';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

beforeEach(() => {
  nock.cleanAll();
  jest.clearAllMocks();
  mocked(useRouter).mockImplementation(
    () =>
      ({
        isFallback: false,
        pathname: '/opportunity/[id]',
        isReady: true,
        query: { id: 'opp-123' },
      } as unknown as NextRouter),
  );
});

const mockOpportunity: Opportunity = {
  id: 'opp-123',
  title: 'Senior Software Engineer',
  tldr: 'Join our team to build amazing products',
  keywords: [
    { keyword: 'React' },
    { keyword: 'TypeScript' },
    { keyword: 'Node.js' },
  ],
  location: [
    {
      city: 'San Francisco',
      subdivision: 'CA',
      country: 'USA',
      continent: 'North America',
      type: 1, // Remote
    },
  ],
  meta: {
    salary: {
      min: 120000,
      max: 180000,
      period: 1, // Annual
    },
    equity: true,
    seniorityLevel: 4, // Senior
    employmentType: 1, // Full-time
    roleType: 0,
    teamSize: 10,
  },
  recruiters: [
    {
      id: 'recruiter-1',
      name: 'John Doe',
      title: 'Senior Technical Recruiter',
      image: 'https://example.com/john.jpg',
      permalink: 'https://example.com/john',
      bio: 'Experienced technical recruiter',
    },
  ],
  organization: {
    name: 'Example Inc',
    image: 'https://example.com/logo.png',
    website: 'https://example.com',
    description: 'We build amazing products',
    founded: '2015',
    location: 'San Francisco, CA',
    stage: 3, // Series A
    category: 'Technology',
    size: 3, // 51-200
    perks: ['Health Insurance', 'Remote Work', '401k'],
    socialLinks: [
      { link: 'https://linkedin.com/company/example', socialType: 'LinkedIn' },
      { link: 'https://twitter.com/example', socialType: 'X' },
      { link: 'https://github.com/example', socialType: 'GitHub' },
    ],
    customLinks: [{ link: 'https://example.com/blog', title: 'Company Blog' }],
    pressLinks: [
      { link: 'https://techcrunch.com/example', title: 'TechCrunch Article' },
    ],
  },
  content: {
    overview: { html: '<p>Overview content</p>' },
    responsibilities: { html: '<p>Responsibilities content</p>' },
    requirements: { html: '<p>Requirements content</p>' },
  },
};

const mockMatch: OpportunityMatch = {
  status: OpportunityMatchStatus.Pending,
  description: {
    reasoning: 'This role matches your skills in React and TypeScript',
  },
};

const renderComponent = async (
  match?: OpportunityMatch,
  actions: ActionType[] = [],
): Promise<void> => {
  const queryClient = new QueryClient();

  mockGraphQL({
    request: {
      query: expect.stringContaining('opportunityById'),
    },
    result: {
      data: {
        opportunity: mockOpportunity,
      },
    },
  });

  if (match) {
    mockGraphQL({
      request: {
        query: expect.stringContaining('opportunityMatch'),
      },
      result: {
        data: {
          opportunityMatch: match,
        },
      },
    });
  }

  mockGraphQL({
    request: {
      query: expect.stringContaining('actions'),
    },
    result: {
      data: {
        actions: actions.map((type) => ({
          type,
          completedAt: new Date(),
        })),
      },
    },
  });

  render(
    <TestBootProvider
      client={queryClient}
      auth={{
        user: defaultUser,
        isLoggedIn: true,
        shouldShowLogin: false,
        showLogin: jest.fn(),
        logout: jest.fn(),
        updateUser: jest.fn(),
        tokenRefreshed: true,
        getRedirectUri: jest.fn(),
        closeLogin: jest.fn(),
        isAuthReady: true,
      }}
    >
      <JobPage />
    </TestBootProvider>,
  );

  await waitFor(() => {
    expect(screen.queryByText('Senior Software Engineer')).toBeInTheDocument();
  });
};

describe('OpportunityPage', () => {
  describe('Response Buttons', () => {
    it('should render both response buttons when match status is pending', async () => {
      await renderComponent(mockMatch);

      await waitFor(() => {
        expect(screen.getAllByText('Not for me').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Interested').length).toBeGreaterThan(0);
      });
    });

    it('should render "Not for me" button with correct link', async () => {
      await renderComponent(mockMatch);

      await waitFor(() => {
        const links = screen.getAllByRole('link', { name: /Not for me/i });
        expect(links[0]).toHaveAttribute('href', '/opportunity/opp-123/decline');
      });
    });

    it('should render "Interested" button with correct link', async () => {
      await renderComponent(mockMatch);

      await waitFor(() => {
        const links = screen.getAllByRole('link', { name: /Interested/i });
        expect(links[0]).toHaveAttribute('href', '/opportunity/opp-123/questions');
      });
    });

    it('should not render response buttons when no match exists', async () => {
      await renderComponent();

      await waitFor(() => {
        expect(screen.queryByText('Not for me')).not.toBeInTheDocument();
        expect(screen.queryByText('Interested')).not.toBeInTheDocument();
      });
    });
  });

  describe('How it works button', () => {
    it('should render "How it works" button', async () => {
      await renderComponent(mockMatch);

      await waitFor(() => {
        const button = screen.getByText('How it works');
        expect(button).toBeInTheDocument();
      });
    });

    it('should have correct link to welcome page', async () => {
      await renderComponent(mockMatch);

      await waitFor(() => {
        const link = screen.getByRole('link', { name: /How it works/i });
        expect(link).toHaveAttribute('href', '/opportunity/welcome');
      });
    });
  });

  describe('Company section', () => {
    it('should render company website button when website exists', async () => {
      await renderComponent(mockMatch);

      await waitFor(() => {
        const websiteButton = screen.getByText('Website');
        expect(websiteButton).toBeInTheDocument();
      });
    });

    it('should render company website button with correct link', async () => {
      await renderComponent(mockMatch);

      await waitFor(() => {
        const link = screen.getByRole('link', { name: /Website/i });
        expect(link).toHaveAttribute('href', 'https://example.com');
        expect(link).toHaveAttribute('target', '_blank');
      });
    });

    it('should render social media buttons', async () => {
      await renderComponent(mockMatch);

      await waitFor(() => {
        const socialLinks = screen.getAllByRole('link').filter((link) => {
          const href = link.getAttribute('href');
          return (
            href?.includes('linkedin.com') ||
            href?.includes('twitter.com') ||
            href?.includes('github.com')
          );
        });
        expect(socialLinks.length).toBeGreaterThanOrEqual(3);
      });
    });
  });

  describe('See more/See less button', () => {
    it('should render "See more" button when links exist', async () => {
      await renderComponent(mockMatch);

      await waitFor(() => {
        const seeMoreButton = screen.getByText('See more');
        expect(seeMoreButton).toBeInTheDocument();
      });
    });

    it('should not render see more button when no links exist', async () => {
      const opportunityWithoutLinks = {
        ...mockOpportunity,
        organization: {
          ...mockOpportunity.organization,
          customLinks: [],
          pressLinks: [],
        },
      };

      mockGraphQL({
        request: {
          query: expect.stringContaining('opportunityById'),
        },
        result: {
          data: {
            opportunity: opportunityWithoutLinks,
          },
        },
      });

      mockGraphQL({
        request: {
          query: expect.stringContaining('opportunityMatch'),
        },
        result: {
          data: {
            opportunityMatch: mockMatch,
          },
        },
      });

      mockGraphQL({
        request: {
          query: expect.stringContaining('actions'),
        },
        result: {
          data: {
            actions: [],
          },
        },
      });

      const queryClient = new QueryClient();
      render(
        <TestBootProvider
          client={queryClient}
          auth={{
            user: defaultUser,
            isLoggedIn: true,
            shouldShowLogin: false,
            showLogin: jest.fn(),
            logout: jest.fn(),
            updateUser: jest.fn(),
            tokenRefreshed: true,
            getRedirectUri: jest.fn(),
            closeLogin: jest.fn(),
            isAuthReady: true,
          }}
        >
          <JobPage />
        </TestBootProvider>,
      );

      await waitFor(() => {
        expect(
          screen.queryByText('Senior Software Engineer'),
        ).toBeInTheDocument();
      });

      expect(screen.queryByText('See more')).not.toBeInTheDocument();
    });
  });

  describe('Page content', () => {
    it('should render job title', async () => {
      await renderComponent(mockMatch);

      await waitFor(() => {
        expect(
          screen.getByText('Senior Software Engineer'),
        ).toBeInTheDocument();
      });
    });

    it('should render company name', async () => {
      await renderComponent(mockMatch);

      await waitFor(() => {
        expect(screen.getByText(/Example Inc/)).toBeInTheDocument();
      });
    });

    it('should render job keywords as chips', async () => {
      await renderComponent(mockMatch);

      await waitFor(() => {
        expect(screen.getByText('React')).toBeInTheDocument();
        expect(screen.getByText('TypeScript')).toBeInTheDocument();
        expect(screen.getByText('Node.js')).toBeInTheDocument();
      });
    });

    it('should render TLDR section', async () => {
      await renderComponent(mockMatch);

      await waitFor(() => {
        expect(
          screen.getByText('Join our team to build amazing products'),
        ).toBeInTheDocument();
      });
    });

    it('should render recruiter information', async () => {
      await renderComponent(mockMatch);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(
          screen.getByText('Senior Technical Recruiter'),
        ).toBeInTheDocument();
      });
    });
  });
});
