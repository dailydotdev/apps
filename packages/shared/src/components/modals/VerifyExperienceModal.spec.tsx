import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AuthContext from '../../contexts/AuthContext';
import { mockGraphQL } from '../../../__tests__/helpers/graphql';
import user from '../../../__tests__/fixture/loggedUser';
import {
  ADD_USER_COMPANY_MUTATION,
  VERIFY_USER_COMPANY_CODE_MUTATION,
} from '../../graphql/users';
import type { Connection } from '../../graphql/common';
import type { UserExperience } from '../../graphql/user/profile';
import { UserExperienceType } from '../../graphql/user/profile';
import type { Company } from '../../lib/userCompany';
import { generateQueryKey, RequestKey } from '../../lib/query';
import VerifyExperienceModal from './VerifyExperienceModal';

const email = 'maya@acme.com';
const code = '123456';

const google = {
  id: 'google',
  name: 'Google',
  image: 'https://daily.dev/google.png',
} as Company;

const job = (company: Company | null): UserExperience => ({
  id: 'exp1',
  type: UserExperienceType.Work,
  title: 'Senior Engineer',
  createdAt: '2023-03-01T00:00:00Z',
  company,
  customCompanyName: company ? null : 'Acme',
  verified: false,
});

const experiencesKey = generateQueryKey(
  RequestKey.UserExperience,
  user,
  UserExperienceType.Work,
  'settings',
);

const openModal = (
  experience: UserExperience,
  verifiedCompany: Company | null,
): QueryClient => {
  const client = new QueryClient();
  client.setQueryData<Connection<UserExperience>>(experiencesKey, {
    edges: [{ node: experience }],
    pageInfo: { hasNextPage: false, endCursor: null },
  });

  mockGraphQL({
    request: { query: ADD_USER_COMPANY_MUTATION, variables: { email } },
    result: { data: { addUserCompany: { _: null } } },
  });
  mockGraphQL({
    request: {
      query: VERIFY_USER_COMPANY_CODE_MUTATION,
      variables: { email, code },
    },
    result: {
      data: { verifyUserCompanyCode: { email, company: verifiedCompany } },
    },
  });

  render(
    <QueryClientProvider client={client}>
      <AuthContext.Provider
        value={{
          user,
          shouldShowLogin: false,
          showLogin: jest.fn(),
          logout: jest.fn(),
          updateUser: jest.fn(),
          tokenRefreshed: true,
          isTokenValid: true,
          closeLogin: jest.fn(),
          getRedirectUri: jest.fn(),
          isAuthReady: true,
          isAuthReadyOrCached: true,
          isLoggedIn: true,
        }}
      >
        <VerifyExperienceModal isOpen onRequestClose={jest.fn()} />
      </AuthContext.Provider>
    </QueryClientProvider>,
  );

  return client;
};

const verify = async (): Promise<void> => {
  fireEvent.input(screen.getByPlaceholderText('Email'), {
    target: { value: email },
  });
  fireEvent.click(await screen.findByRole('button', { name: 'Send code' }));
  fireEvent.input(await screen.findByPlaceholderText('Enter 6-digit code'), {
    target: { value: code },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Verify email' }));
  await waitFor(() => expect(nock.isDone()).toBe(true));
};

const isJobVerified = (client: QueryClient): boolean | null | undefined =>
  client.getQueryData<Connection<UserExperience>>(experiencesKey)?.edges[0].node
    .verified;

beforeEach(() => {
  nock.cleanAll();
  jest.clearAllMocks();
});

it('should mark the job with the verified company as verified', async () => {
  const client = openModal(job(google), google);
  await verify();

  await waitFor(() => expect(isJobVerified(client)).toBe(true));
});

it('should not mark a typed-in job verified while the company is reviewed', async () => {
  const client = openModal(job(null), null);
  await verify();

  await waitFor(() =>
    expect(
      client.getQueryData(generateQueryKey(RequestKey.UserCompanies, user)),
    ).toHaveLength(1),
  );
  expect(isJobVerified(client)).toBe(false);
});
