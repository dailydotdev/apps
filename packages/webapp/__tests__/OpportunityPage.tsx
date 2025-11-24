import React from 'react';
import type { RenderResult } from '@testing-library/react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import nock from 'nock';
import { mocked } from 'ts-jest/utils';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import defaultUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import type { MockedGraphQLResponse } from '@dailydotdev/shared/__tests__/helpers/graphql';
import { mockGraphQL } from '@dailydotdev/shared/__tests__/helpers/graphql';
import { TestBootProvider } from '@dailydotdev/shared/__tests__/helpers/boot';
import type { Opportunity } from '@dailydotdev/shared/src/features/opportunity/types';
import { OpportunityMatchStatus } from '@dailydotdev/shared/src/features/opportunity/types';
import {
  OPPORTUNITY_BY_ID_QUERY,
  GET_OPPORTUNITY_MATCH_QUERY,
} from '@dailydotdev/shared/src/features/opportunity/graphql';
import { EmploymentType } from '@dailydotdev/shared/src/features/opportunity/protobuf/opportunity';
import { SocialMediaType } from '@dailydotdev/shared/src/features/organizations/types';
import { OpportunityEditProvider } from '@dailydotdev/shared/src/components/opportunity/OpportunityEditContext';
import { COMPLETED_USER_ACTIONS } from '@dailydotdev/shared/src/graphql/actions';
import JobPage from '../pages/jobs/[id]';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

const mockOpportunity: Opportunity = {
  id: 'test-jobs-id',
  title: 'Senior Software Engineer',
  keywords: ['react', 'typescript', 'node.js'].map((keyword) => ({ keyword })),
  employmentType: EmploymentType.FULL_TIME,
  location: [
    {
      city: 'San Francisco',
      subdivision: 'CA',
      country: 'USA',
      type: 0,
    },
  ],
  organization: {
    id: 'org-1',
    name: 'Test Company',
    image: 'https://example.com/logo.png',
    website: 'https://testcompany.com',
    socialMedia: [
      {
        type: SocialMediaType.LinkedIn,
        link: 'https://linkedin.com/company/test',
      },
      { type: SocialMediaType.GitHub, link: 'https://github.com/testcompany' },
    ],
  },
  status: OpportunityMatchStatus.Pending,
  tldr: 'Join our amazing team!',
  recruiters: [
    {
      id: 'recruiter-1',
      name: 'Jane Recruiter',
      image: 'https://example.com/recruiter.png',
    },
  ],
  meta: {
    salary: {
      min: 150000,
      max: 200000,
      period: 1,
    },
    employmentType: EmploymentType.FULL_TIME,
  },
  content: {
    overview: 'We are building amazing products',
    responsibilities: ['Write code', 'Review PRs'],
    requirements: ['5+ years experience', 'Strong JavaScript skills'],
  },
  applicationUrl: 'https://testcompany.com/apply',
} as Opportunity;

beforeEach(() => {
  nock.cleanAll();
  jest.clearAllMocks();
  mocked(useRouter).mockImplementation(
    () =>
      ({
        isFallback: false,
        pathname: '/jobs/[id]',
        isReady: true,
        query: { id: 'test-jobs-id' },
        push: jest.fn(),
      } as unknown as NextRouter),
  );
});

const createOpportunityMock = (
  data: Partial<Opportunity> = {},
): MockedGraphQLResponse => ({
  request: {
    query: OPPORTUNITY_BY_ID_QUERY,
    variables: { id: 'test-jobs-id' },
  },
  result: {
    data: {
      opportunityById: { ...mockOpportunity, ...data },
    },
  },
});

const createOpportunityMatchMock = (
  status = OpportunityMatchStatus.Pending,
): MockedGraphQLResponse => ({
  request: {
    query: GET_OPPORTUNITY_MATCH_QUERY,
    variables: { id: 'test-jobs-id' },
  },
  result: {
    data: {
      getOpportunityMatch: {
        status,
      },
    },
  },
});

const createCompletedActionsMock = (): MockedGraphQLResponse => ({
  request: {
    query: COMPLETED_USER_ACTIONS,
  },
  result: {
    data: {
      actions: [],
    },
  },
});

const renderOpportunityPage = (
  opportunityData: Partial<Opportunity> = {},
  matchStatus = OpportunityMatchStatus.Pending,
): RenderResult => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  // Pre-populate the cache with jobs data
  const opportunity = { ...mockOpportunity, ...opportunityData };
  queryClient.setQueryData(['opportunity', 'test-jobs-id'], opportunity);
  queryClient.setQueryData(['opportunity', 'test-jobs-id', 'match'], {
    status: matchStatus,
  });

  const mocks = [
    createOpportunityMock(opportunityData),
    createOpportunityMatchMock(matchStatus),
    createCompletedActionsMock(),
  ];

  mocks.forEach(mockGraphQL);

  return render(
    <TestBootProvider
      client={queryClient}
      auth={{
        user: defaultUser,
        shouldShowLogin: false,
        isAuthReady: true,
        isLoggedIn: true,
        logout: jest.fn(),
        updateUser: jest.fn(),
        tokenRefreshed: true,
        getRedirectUri: jest.fn(),
      }}
    >
      <OpportunityEditProvider opportunityId="test-opportunity-id">
        <JobPage />
      </OpportunityEditProvider>
    </TestBootProvider>,
  );
};

describe('OpportunityPage', () => {
  describe('Response buttons', () => {
    it('should render "Not for me" button with correct link', async () => {
      renderOpportunityPage();

      await waitFor(() => {
        const notForMeButtons = screen.getAllByRole('link', {
          name: /not for me/i,
        });
        expect(notForMeButtons.length).toBeGreaterThanOrEqual(1);
        expect(notForMeButtons[0]).toHaveAttribute(
          'href',
          '/jobs/test-jobs-id/decline',
        );
      });
    });

    it('should render "Interested" button with correct link', async () => {
      renderOpportunityPage();

      await waitFor(() => {
        const interestedButtons = screen.getAllByRole('link', {
          name: /interested/i,
        });
        expect(interestedButtons.length).toBeGreaterThanOrEqual(1);
        expect(interestedButtons[0]).toHaveAttribute(
          'href',
          '/jobs/test-jobs-id/questions',
        );
      });
    });

    it('should disable "Not for me" button when already rejected', async () => {
      renderOpportunityPage({}, OpportunityMatchStatus.CandidateRejected);

      await waitFor(() => {
        const notForMeButtons = screen.getAllByRole('link', {
          name: /not for me/i,
        });
        expect(notForMeButtons.length).toBeGreaterThanOrEqual(1);
        // Check that the link has the disabled attribute
        expect(notForMeButtons[0]).toHaveAttribute('disabled');
      });
    });

    it('should disable "Interested" button when already accepted', async () => {
      renderOpportunityPage({}, OpportunityMatchStatus.CandidateAccepted);

      await waitFor(() => {
        const interestedButtons = screen.getAllByRole('link', {
          name: /interested/i,
        });
        expect(interestedButtons.length).toBeGreaterThanOrEqual(1);
        // Check that the link has the disabled attribute
        expect(interestedButtons[0]).toHaveAttribute('disabled');
      });
    });
  });

  describe('How it works button', () => {
    it('should render "How it works" button with correct link', async () => {
      renderOpportunityPage();

      await waitFor(() => {
        const howItWorksButton = screen.getByRole('link', {
          name: /how it works/i,
        });
        expect(howItWorksButton).toBeInTheDocument();
        expect(howItWorksButton).toHaveAttribute('href', '/jobs/welcome');
      });
    });
  });

  describe('Page content', () => {
    it('should render jobs title', async () => {
      renderOpportunityPage();

      await waitFor(() => {
        expect(
          screen.getByText('Senior Software Engineer'),
        ).toBeInTheDocument();
      });
    });

    it('should render company name', async () => {
      renderOpportunityPage();

      await waitFor(
        () => {
          const companyNames = screen.getAllByText(/Test Company/i);
          expect(companyNames.length).toBeGreaterThanOrEqual(1);
        },
        { timeout: 3000 },
      );
    });

    it('should render keywords as chips', async () => {
      renderOpportunityPage();

      await waitFor(() => {
        expect(screen.getByText('react')).toBeInTheDocument();
        expect(screen.getByText('typescript')).toBeInTheDocument();
        expect(screen.getByText('node.js')).toBeInTheDocument();
      });
    });

    it('should render TLDR section when provided', async () => {
      renderOpportunityPage();

      await waitFor(() => {
        expect(screen.getByText('Join our amazing team!')).toBeInTheDocument();
      });
    });

    it('should render recruiter information when provided', async () => {
      renderOpportunityPage();

      await waitFor(
        () => {
          const recruiterNames = screen.getAllByText(/Jane Recruiter/i);
          expect(recruiterNames.length).toBeGreaterThanOrEqual(1);
        },
        { timeout: 3000 },
      );
    });
  });
});
