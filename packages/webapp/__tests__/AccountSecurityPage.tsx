import React from 'react';
import { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import {
  mockListProviders,
  mockLoginReverifyFlow,
  mockSettingsFlow,
  mockSettingsValidation,
  mockWhoAmIFlow,
  requireVerificationSettingsMock,
  settingsFlowMockData,
} from '@dailydotdev/shared/__tests__/fixture/auth';
import {
  fireEvent,
  render,
  RenderResult,
  screen,
} from '@testing-library/preact';
import { waitForNock } from '@dailydotdev/shared/__tests__/helpers/utilities';
import { AuthContextProvider } from '@dailydotdev/shared/src/contexts/AuthContext';
import { getNodeValue } from '@dailydotdev/shared/src/lib/auth';
import { QueryClient, QueryClientProvider } from 'react-query';
import SecurityProfilePage from '../pages/account/security';

jest.mock('next/router', () => ({
  useRouter() {
    return {
      isFallback: false,
    };
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
});

const defaultLoggedUser: LoggedUser = {
  id: 'u1',
  username: 'lee',
  name: 'Lee Solevilla',
  providers: ['github'],
  email: 'lee@daily.dev',
  image: 'https://daily.dev/lee.png',
  infoConfirmed: true,
  premium: false,
  createdAt: '2020-07-26T13:04:35.000Z',
  bio: 'The best company!',
  twitter: 'dailydotdev',
  github: 'dailydotdev',
  hashnode: 'dailydotdev',
  portfolio: 'https://daily.dev/?key=vaue',
  permalink: '/sample',
  company: 'dailydev',
  title: 'Test',
  acceptedMarketing: true,
};

const updateUser = jest.fn();

const renderComponent = (): RenderResult => {
  const client = new QueryClient();
  mockSettingsFlow();
  mockListProviders();
  mockWhoAmIFlow();

  return render(
    <QueryClientProvider client={client}>
      <AuthContextProvider
        user={defaultLoggedUser}
        updateUser={updateUser}
        getRedirectUri={jest.fn()}
        tokenRefreshed
      >
        <SecurityProfilePage />
      </AuthContextProvider>
    </QueryClientProvider>,
  );
};

it('should show current email', async () => {
  renderComponent();
  const el = await screen.findByTestId('current_email');
  expect(el).toHaveValue(defaultLoggedUser.email);
});

it('should allow changing of email', async () => {
  renderComponent();
  await waitForNock();
  const el = await screen.findByTestId('current_email');
  expect(el).toHaveValue(defaultLoggedUser.email);
  const displayForm = await screen.findByText('Change email');
  fireEvent.click(displayForm);
  const email = 'sample@email.com';
  fireEvent.input(screen.getByPlaceholderText('Email'), {
    target: { value: email },
  });
  const { nodes } = settingsFlowMockData.ui;
  const token = getNodeValue('csrf_token', nodes);
  const params = {
    csrf_token: token,
    method: 'profile',
    'traits.email': email,
    'traits.name': getNodeValue('traits.name', nodes),
    'traits.username': getNodeValue('traits.username', nodes),
    'traits.image': getNodeValue('traits.image', nodes),
  };
  mockSettingsValidation(params);
  const submitChanges = await screen.findByText('Save changes');
  fireEvent.click(submitChanges);
  await waitForNock();
  const sent = await screen.findByTestId('email_verification_sent');
  expect(sent).toBeInTheDocument();
});

it('should allow changing of email but require verification', async () => {
  renderComponent();
  await waitForNock();
  const el = await screen.findByTestId('current_email');
  expect(el).toHaveValue(defaultLoggedUser.email);
  const displayForm = await screen.findByText('Change email');
  fireEvent.click(displayForm);
  const email = 'sample@email.com';
  fireEvent.input(screen.getByPlaceholderText('Email'), {
    target: { value: email },
  });
  const { nodes } = settingsFlowMockData.ui;
  const token = getNodeValue('csrf_token', nodes);
  const params = {
    csrf_token: token,
    method: 'profile',
    'traits.email': email,
    'traits.name': getNodeValue('traits.name', nodes),
    'traits.username': getNodeValue('traits.username', nodes),
    'traits.image': getNodeValue('traits.image', nodes),
  };
  mockSettingsValidation(params, requireVerificationSettingsMock, 403);
  mockLoginReverifyFlow();
  const submitChanges = await screen.findByText('Save changes');
  fireEvent.click(submitChanges);
  const text = await screen.findByText("Verify it's you (security check)");
  expect(text).toBeInTheDocument();
});
