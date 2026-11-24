import React from 'react';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { TestBootProvider } from '../../../../../__tests__/helpers/boot';
import defaultUser from '../../../../../__tests__/fixture/loggedUser';
import {
  claimCompanyPageRequest,
  CompanyPageRequestStatus,
  getCompanyPageRequest,
  requestCompanyPage,
} from '../../../../graphql/squads';
import {
  BUILDING_TIMEOUT_MS,
  COMPANY_PAGE_REQUEST_KEY,
  CompanyPageFromWebsite,
} from './CompanyPageFromWebsite';

jest.mock('../../../../graphql/squads', () => ({
  ...jest.requireActual('../../../../graphql/squads'),
  requestCompanyPage: jest.fn(),
  claimCompanyPageRequest: jest.fn(),
  getCompanyPageRequest: jest.fn(),
}));

jest.mock('@marsidev/react-turnstile', () => ({
  Turnstile: () => null,
}));

const replace = jest.fn();
const pending = {
  id: 'req1',
  website: 'https://acme.dev',
  status: CompanyPageRequestStatus.Pending,
};

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  (useRouter as jest.Mock).mockReturnValue({ query: {}, replace });
  (requestCompanyPage as jest.Mock).mockResolvedValue(pending);
  (claimCompanyPageRequest as jest.Mock).mockResolvedValue(pending);
});

const renderComponent = (isLoggedIn = true, user = defaultUser) =>
  render(
    <TestBootProvider
      client={new QueryClient()}
      auth={
        isLoggedIn
          ? { isLoggedIn: true, user }
          : { isLoggedIn: false, user: undefined }
      }
    >
      <CompanyPageFromWebsite />
    </TestBootProvider>,
  );

it('starts reading the website the landing page sent and asks a visitor to sign up', async () => {
  (useRouter as jest.Mock).mockReturnValue({
    query: { website: 'acme.dev' },
    replace,
  });
  renderComponent(false);

  expect(
    await screen.findByText('Your page is on its way'),
  ).toBeInTheDocument();
  expect(requestCompanyPage).toHaveBeenCalledWith('https://acme.dev/');
  expect(JSON.parse(localStorage.getItem(COMPANY_PAGE_REQUEST_KEY)!)).toEqual({
    id: 'req1',
    website: 'https://acme.dev',
  });
  expect(replace).toHaveBeenCalledWith(
    expect.objectContaining({
      query: { website: 'https://acme.dev', request: 'req1' },
    }),
    undefined,
    { shallow: true },
  );
});

it('claims the request in the URL when sign-in moved to another browser', async () => {
  (useRouter as jest.Mock).mockReturnValue({
    query: { website: 'https://acme.dev', request: 'req1' },
    replace,
  });
  (getCompanyPageRequest as jest.Mock).mockResolvedValue(pending);
  renderComponent();

  expect(
    await screen.findByText('Building your company page'),
  ).toBeInTheDocument();
  expect(requestCompanyPage).not.toHaveBeenCalled();
  expect(claimCompanyPageRequest).toHaveBeenCalledWith('req1');
});

it('keeps a new account on the sign-up step until its profile is complete', async () => {
  localStorage.setItem(COMPANY_PAGE_REQUEST_KEY, JSON.stringify(pending));
  renderComponent(true, { ...defaultUser, infoConfirmed: false });

  expect(
    await screen.findByText('Your page is on its way'),
  ).toBeInTheDocument();
  expect(claimCompanyPageRequest).not.toHaveBeenCalled();
});

it('keeps the request made before the sign-up when the founder comes back', async () => {
  localStorage.setItem(COMPANY_PAGE_REQUEST_KEY, JSON.stringify(pending));
  (useRouter as jest.Mock).mockReturnValue({
    query: { website: 'acme.dev' },
    replace,
  });
  (getCompanyPageRequest as jest.Mock).mockResolvedValue(pending);
  renderComponent();

  expect(
    await screen.findByText('Building your company page'),
  ).toBeInTheDocument();
  expect(requestCompanyPage).not.toHaveBeenCalled();
  expect(claimCompanyPageRequest).toHaveBeenCalledWith('req1');
});

it('reads the landing page site again when the request kept in this browser is gone', async () => {
  localStorage.setItem(COMPANY_PAGE_REQUEST_KEY, JSON.stringify(pending));
  (useRouter as jest.Mock).mockReturnValue({
    query: { website: 'acme.dev' },
    replace,
  });
  (claimCompanyPageRequest as jest.Mock).mockRejectedValueOnce(
    new Error('not found'),
  );
  (requestCompanyPage as jest.Mock).mockResolvedValue({
    ...pending,
    id: 'req2',
  });
  (getCompanyPageRequest as jest.Mock).mockResolvedValue(pending);
  renderComponent();

  await waitFor(() =>
    expect(requestCompanyPage).toHaveBeenCalledWith('https://acme.dev/'),
  );
  await waitFor(() =>
    expect(claimCompanyPageRequest).toHaveBeenCalledWith('req2'),
  );
  expect(screen.getByText('Building your company page')).toBeInTheDocument();
});

it('opens the company page once it is created', async () => {
  localStorage.setItem(COMPANY_PAGE_REQUEST_KEY, JSON.stringify(pending));
  (getCompanyPageRequest as jest.Mock).mockResolvedValue({
    ...pending,
    status: CompanyPageRequestStatus.Created,
    source: { id: 'acme', handle: 'acme', permalink: '/squads/acme' },
  });
  renderComponent();

  await waitFor(() => expect(replace).toHaveBeenCalledWith('/squads/acme'));
  expect(localStorage.getItem(COMPANY_PAGE_REQUEST_KEY)).toBeNull();
  expect(screen.getByText('Building your company page')).toBeInTheDocument();
});

it('opens the page a slow request creates after the form took over', async () => {
  jest.useFakeTimers();
  localStorage.setItem(COMPANY_PAGE_REQUEST_KEY, JSON.stringify(pending));
  (getCompanyPageRequest as jest.Mock).mockResolvedValue(pending);
  renderComponent();
  await waitFor(() => expect(getCompanyPageRequest).toHaveBeenCalled());

  await act(async () => {
    jest.advanceTimersByTime(BUILDING_TIMEOUT_MS);
  });
  expect(
    await screen.findByText('Set up your company page'),
  ).toBeInTheDocument();
  expect(localStorage.getItem(COMPANY_PAGE_REQUEST_KEY)).toBeNull();

  (getCompanyPageRequest as jest.Mock).mockResolvedValue({
    ...pending,
    status: CompanyPageRequestStatus.Created,
    source: { id: 'acme', handle: 'acme', permalink: '/squads/acme' },
  });
  await act(async () => {
    jest.advanceTimersByTime(2000);
  });
  await waitFor(() => expect(replace).toHaveBeenCalledWith('/squads/acme'));
  jest.useRealTimers();
});

it('falls back to the form with what was found when the site could not be read', async () => {
  localStorage.setItem(COMPANY_PAGE_REQUEST_KEY, JSON.stringify(pending));
  (getCompanyPageRequest as jest.Mock).mockResolvedValue({
    ...pending,
    status: CompanyPageRequestStatus.Failed,
  });
  renderComponent();

  expect(
    await screen.findByText('Finish your company page'),
  ).toBeInTheDocument();
  expect(
    (document.querySelector('input[name="website"]') as HTMLInputElement).value,
  ).toBe('https://acme.dev');
});

it('shows why a website was refused', async () => {
  (requestCompanyPage as jest.Mock).mockRejectedValue({
    response: { errors: [{ message: 'You can have up to 3 company pages' }] },
  });
  renderComponent();

  fireEvent.input(document.querySelector('input[name="website"]')!, {
    target: { value: 'acme.dev' },
  });
  fireEvent.submit(document.getElementById('company-page-website-form')!);

  expect(
    await screen.findByText('You can have up to 3 company pages'),
  ).toBeInTheDocument();
});
