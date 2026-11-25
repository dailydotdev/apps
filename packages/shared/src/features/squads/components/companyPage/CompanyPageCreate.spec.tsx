import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { TestBootProvider } from '../../../../../__tests__/helpers/boot';
import { useSquadCreate } from '../../../../hooks/squads/useSquadCreate';
import { checkExistingHandle } from '../../../../graphql/squads';
import { SourceMemberRole } from '../../../../graphql/sources';
import defaultUser from '../../../../../__tests__/fixture/loggedUser';
import { getStartupsCheckoutUrl } from '../../lib/routes';
import { CompanyPageCreate } from './CompanyPageCreate';

jest.mock('../../../../hooks/squads/useSquadCreate', () => ({
  useSquadCreate: jest.fn(),
}));

jest.mock('../../../../graphql/squads', () => ({
  ...jest.requireActual('../../../../graphql/squads'),
  checkExistingHandle: jest.fn(),
}));

jest.mock('@marsidev/react-turnstile', () => ({
  Turnstile: () => null,
}));

const onCreateSquad = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (useSquadCreate as jest.Mock).mockReturnValue({
    onCreateSquad,
    isLoading: false,
  });
});

const renderComponent = (isLoggedIn = true) =>
  render(
    <TestBootProvider
      client={new QueryClient()}
      auth={
        isLoggedIn
          ? { isLoggedIn: true, user: defaultUser }
          : { isLoggedIn: false, user: undefined }
      }
    >
      <CompanyPageCreate />
    </TestBootProvider>,
  );

const fillIn = () => {
  fireEvent.input(
    document.querySelector('input[name="name"]') as HTMLInputElement,
    {
      target: { value: 'Acme Deploy' },
    },
  );
  fireEvent.input(
    document.querySelector(
      'textarea[name="description"]',
    ) as HTMLTextAreaElement,
    {
      target: { value: 'Preview environments for every pull request.' },
    },
  );
};

const submit = () =>
  fireEvent.submit(document.getElementById('company-page-form') as HTMLElement);

it('creates a public company page that only its team posts to', async () => {
  (checkExistingHandle as jest.Mock).mockResolvedValue(false);
  renderComponent();
  fillIn();
  submit();

  await waitFor(() =>
    expect(onCreateSquad).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Acme Deploy',
        handle: 'acme_deploy',
        description: 'Preview environments for every pull request.',
        company: true,
        memberPostingRole: SourceMemberRole.Moderator,
        moderationRequired: false,
      }),
    ),
  );
});

it('asks for another handle when the suggested one is taken', async () => {
  (checkExistingHandle as jest.Mock).mockResolvedValue(true);
  renderComponent();
  fillIn();
  submit();

  expect(
    await screen.findByText('This handle is taken. Try another one.'),
  ).toBeInTheDocument();
  expect(onCreateSquad).not.toHaveBeenCalled();
});

it('asks a visitor with no account to sign up first', async () => {
  renderComponent(false);

  expect(
    await screen.findByText('Create your free company page'),
  ).toBeInTheDocument();
  expect(document.querySelector('input[name="name"]')).toBeNull();
});

it('opens the checkout for the new page when the founder came to pay', async () => {
  const push = jest.fn();
  (useRouter as jest.Mock).mockReturnValue({
    query: { checkout: '1', plan: 'team' },
    push,
  });
  (useSquadCreate as jest.Mock).mockImplementation(({ onSuccess }) => ({
    onCreateSquad: () => onSuccess({ id: 'acme', permalink: '/squads/acme' }),
    isLoading: false,
  }));
  (checkExistingHandle as jest.Mock).mockResolvedValue(false);
  renderComponent();
  fillIn();
  submit();

  await waitFor(() =>
    expect(push).toHaveBeenCalledWith(
      getStartupsCheckoutUrl({ plan: 'team', sourceId: 'acme' }),
    ),
  );
});
