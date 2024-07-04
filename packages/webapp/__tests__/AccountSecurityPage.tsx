import React, { act } from 'react';
import { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import loggedUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import {
  loginVerificationMockData,
  mockApiVerificationFlow,
  mockKratosPost,
  mockListProviders,
  mockLoginReverifyFlow,
  mockSettingsFlow,
  mockSettingsValidation,
  mockVerificationFlow,
  mockVerificationValidation,
  mockWhoAmIFlow,
  requireVerificationSettingsMock,
  settingsFlowMockData,
  socialProviderRedirectMock,
  verifiedLoginData,
} from '@dailydotdev/shared/__tests__/fixture/auth';
import {
  fireEvent,
  render,
  RenderResult,
  screen,
} from '@testing-library/react';
import { waitForNock } from '@dailydotdev/shared/__tests__/helpers/utilities';
import { AuthContextProvider } from '@dailydotdev/shared/src/contexts/AuthContext';
import { getNodeValue } from '@dailydotdev/shared/src/lib/auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LazyModalElement } from '@dailydotdev/shared/src/components/modals/LazyModalElement';
import nock from 'nock';
import SecurityProfilePage from '../pages/account/security';

jest.mock('next/router', () => ({
  useRouter() {
    return {
      isFallback: false,
    };
  },
}));

const matchMedia = (value: string) => {
  Object.defineProperty(global, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: query.includes(value),
      addListener: jest.fn(),
      removeListener: jest.fn(),
    })),
  });
};

beforeEach(() => {
  jest.resetAllMocks();
  jest.restoreAllMocks();
  jest.clearAllMocks();
  nock.cleanAll();
  matchMedia('1020');
});

const defaultLoggedUser: LoggedUser = {
  ...loggedUser,
  twitter: 'dailydotdev',
  github: 'dailydotdev',
  hashnode: 'dailydotdev',
  portfolio: 'https://daily.dev/?key=vaue',
  acceptedMarketing: true,
};

const updateUser = jest.fn();
const refetchBoot = jest.fn();

const waitAllRenderMocks = async () => {
  await waitForNock();
  await act(() => new Promise((resolve) => setTimeout(resolve, 100)));
};

const renderComponent = (): RenderResult => {
  const client = new QueryClient();
  mockApiVerificationFlow();
  mockSettingsFlow();
  mockListProviders();
  mockVerificationFlow();
  mockWhoAmIFlow(defaultLoggedUser.email);

  return render(
    <QueryClientProvider client={client}>
      <AuthContextProvider
        refetchBoot={() => {
          refetchBoot();
          return { data: {} };
        }}
        user={defaultLoggedUser}
        updateUser={updateUser}
        getRedirectUri={jest.fn()}
        tokenRefreshed
      >
        <SecurityProfilePage />
        <LazyModalElement />
      </AuthContextProvider>
    </QueryClientProvider>,
  );
};

const verifySession = async (email = defaultLoggedUser.email) => {
  await act(() => new Promise((resolve) => setTimeout(resolve, 300)));
  const text = await screen.findByText("Verify it's you (security check)");
  expect(text).toBeInTheDocument();
  fireEvent.input(screen.getByTestId('login_email'), {
    target: { value: email },
  });
  fireEvent.input(screen.getByTestId('login_password'), {
    target: { value: '#123xAbc' },
  });
  const { action, nodes: loginNodes } = loginVerificationMockData.ui;
  const loginToken = getNodeValue('csrf_token', loginNodes);
  const params = {
    csrf_token: loginToken,
    identifier: email,
    password: '#123xAbc',
    method: 'password',
  };
  mockKratosPost({ action, params }, verifiedLoginData);
  const submitLogin = await screen.findByText('Verify');
  fireEvent.click(submitLogin);
  await waitForNock();
  expect(refetchBoot).toHaveBeenCalled();
  return true;
};

it('should show current email', async () => {
  renderComponent();
  await waitAllRenderMocks();
  const el = await screen.findByTestId('current_email');
  expect(el).toHaveValue(defaultLoggedUser.email);
});

it('should allow changing of email', async () => {
  renderComponent();
  await waitAllRenderMocks();
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
  mockWhoAmIFlow(email);
  mockSettingsValidation(params);
  const submitChanges = await screen.findByText('Send code');
  fireEvent.click(submitChanges);
  const codeField = await screen.findByPlaceholderText('Enter 6-digit code');
  fireEvent.input(codeField, {
    target: { value: '123456' },
  });
  const secondSubmit = await screen.findByTestId('change_email_btn');
  fireEvent.click(secondSubmit);
  mockVerificationValidation({
    code: '123456',
    method: 'code',
  });
  await waitForNock();
  await act(() => new Promise((resolve) => setTimeout(resolve, 300)));
  const sent = await screen.findByTestId('email_verification_sent');
  expect(sent).toBeInTheDocument();
});

it('should allow changing of email but require verification', async () => {
  renderComponent();
  await waitAllRenderMocks();
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
  const submitChanges = await screen.findByText('Send code');
  fireEvent.click(submitChanges);
  const codeField = await screen.findByPlaceholderText('Enter 6-digit code');
  fireEvent.input(codeField, {
    target: { value: '123456' },
  });
  const secondSubmit = await screen.findByTestId('change_email_btn');
  fireEvent.click(secondSubmit);
  mockVerificationValidation({
    code: '123456',
    method: 'code',
  });
  await waitForNock();
  mockSettingsValidation(params);
  await verifySession();
  await act(() => new Promise((resolve) => setTimeout(resolve, 300)));
  const sent = await screen.findByTestId('email_verification_sent');
  expect(sent).toBeInTheDocument();
});

it('should allow setting new password', async () => {
  renderComponent();
  await waitAllRenderMocks();
  const password = '#123xAbc';
  fireEvent.input(screen.getByPlaceholderText('Password'), {
    target: { value: password },
  });
  const { nodes } = settingsFlowMockData.ui;
  const token = getNodeValue('csrf_token', nodes);
  const params = {
    csrf_token: token,
    method: 'password',
    password,
  };
  mockSettingsValidation(params);
  const submitResetPassword = await screen.findByText('Set password');
  fireEvent.click(submitResetPassword);
  await waitForNock();
  const input = await screen.findByPlaceholderText('Password');
  expect(input).toHaveValue('');
});

it('should allow setting new password but require to verify session', async () => {
  renderComponent();
  await waitAllRenderMocks();
  const password = '#123xAbc';
  fireEvent.input(screen.getByPlaceholderText('Password'), {
    target: { value: password },
  });
  const el = await screen.findByPlaceholderText('Password');
  expect(el).toHaveValue('#123xAbc');
  const { nodes } = settingsFlowMockData.ui;
  const token = getNodeValue('csrf_token', nodes);
  const params = {
    csrf_token: token,
    method: 'password',
    password,
  };
  mockSettingsValidation(params, requireVerificationSettingsMock, 403);
  mockLoginReverifyFlow();
  const submitResetPassword = await screen.findByText('Set password');
  fireEvent.click(submitResetPassword);
  await waitForNock();
  const mock = mockSettingsValidation(params);
  await verifySession();
  await waitForNock();
  expect(mock.isDone()).toBeTruthy();
});

it('should allow linking social providers', async () => {
  renderComponent();
  await waitAllRenderMocks();
  const connect = await screen.findByText('Connect with Google');
  const { nodes } = settingsFlowMockData.ui;
  const token = getNodeValue('csrf_token', nodes);
  const params = { link: 'google', csrf_token: token };
  mockListProviders();
  mockSettingsValidation(params);
  fireEvent.click(connect);
  await waitForNock();
});

it('should allow linking social providers but require to verify session', async () => {
  renderComponent();
  await waitAllRenderMocks();
  const connect = await screen.findByText('Connect with Google');
  const { nodes } = settingsFlowMockData.ui;
  const token = getNodeValue('csrf_token', nodes);
  const params = { link: 'google', csrf_token: token };
  mockSettingsValidation(params, requireVerificationSettingsMock, 403);
  mockLoginReverifyFlow();
  fireEvent.click(connect);
  await waitForNock();
  mockSettingsValidation(params, socialProviderRedirectMock, 422);
  await verifySession();
  await waitForNock();
});
