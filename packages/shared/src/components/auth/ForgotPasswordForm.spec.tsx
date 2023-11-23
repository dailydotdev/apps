import React from 'react';
import {
  fireEvent,
  render,
  RenderResult,
  screen,
  waitFor,
} from '@testing-library/react';
import nock from 'nock';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { waitForNock } from '../../../__tests__/helpers/utilities';
import {
  emailSentRecoveryMockData,
  passwordRecoveryFlowMockData,
} from '../../../__tests__/fixture/auth';
import { AccountRecoveryParameters } from '../../lib/auth';
import { AuthContextProvider } from '../../contexts/AuthContext';
import { formToJson } from '../../lib/form';
import ForgotPasswordForm from './ForgotPasswordForm';
import { authUrl } from '../../lib/constants';

beforeEach(() => {
  jest.clearAllMocks();
});

const onSubmit = jest.fn();

const mockRecoveryFlow = (result = passwordRecoveryFlowMockData) => {
  nock(authUrl, { reqheaders: { Accept: 'application/json' } })
    .get('/self-service/recovery/browser?')
    .reply(200, result);
};

const defaultToken = passwordRecoveryFlowMockData.ui.nodes[0].attributes.value;
const defaultParams: Partial<AccountRecoveryParameters> & { method: string } = {
  csrf_token: defaultToken,
  method: 'code',
};
const mockRecoveryValidationFlow = (
  params: Partial<AccountRecoveryParameters> = {},
  responseCode = 200,
  result: unknown = emailSentRecoveryMockData,
) => {
  const url = new URL(passwordRecoveryFlowMockData.ui.action);
  const vars = { ...defaultParams, ...params };
  nock(url.origin, {
    reqheaders: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': vars.csrf_token,
      Accept: 'application/json',
    },
  })
    .post(url.pathname + url.search, vars)
    .reply(responseCode, result);
};

const renderComponent = (): RenderResult => {
  const client = new QueryClient();
  mockRecoveryFlow();
  return render(
    <QueryClientProvider client={client}>
      <AuthContextProvider
        user={null}
        updateUser={jest.fn()}
        tokenRefreshed
        getRedirectUri={jest.fn()}
        loadingUser={false}
        loadedUserFromCache
      >
        <ForgotPasswordForm onSubmit={onSubmit} />
      </AuthContextProvider>
    </QueryClientProvider>,
  );
};

it('should get browser password recovery flow token', async () => {
  renderComponent();
  await waitForNock();
  const input = (await screen.findByTestId('csrf_token')) as HTMLInputElement;
  const token = passwordRecoveryFlowMockData.ui.nodes[0].attributes.value;
  expect(input).toBeInTheDocument();
  expect(input.value).toEqual(token);
});

it('should post sending email recovery including token', async () => {
  const email = 'sshanzel@yahoo.com';
  renderComponent();
  await waitForNock();
  fireEvent.input(screen.getByPlaceholderText('Email'), {
    target: { value: email },
  });
  const form = await screen.findByTestId('recovery_form');
  const params = formToJson(form as HTMLFormElement);
  mockRecoveryValidationFlow(params);
  fireEvent.submit(form);
  await waitFor(() => {
    expect(onSubmit).toBeCalled();
  });
});
