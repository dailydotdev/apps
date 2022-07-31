import React from 'react';
import {
  fireEvent,
  render,
  RenderResult,
  screen,
  waitFor,
} from '@testing-library/react';
import nock from 'nock';
import { QueryClient, QueryClientProvider } from 'react-query';
import { waitForNock } from '../../../__tests__/helpers/utilities';
import {
  errorRegistrationMockData,
  passwordLoginFlowMockData,
  successfulRegistrationMockData,
} from '../../../__tests__/fixture/auth';
import { authUrl, LoginPasswordParameters } from '../../lib/auth';
import { AuthContextProvider } from '../../contexts/AuthContext';
import { formToJson } from '../../lib/form';
import LoginForm from './LoginForm';

beforeEach(() => {
  jest.clearAllMocks();
});

const onSuccessfulLogin = jest.fn();

const mockLoginFlow = (result = passwordLoginFlowMockData) => {
  nock(authUrl, { reqheaders: { Accept: 'application/json' } })
    .get('/self-service/login/browser')
    .reply(200, result);
};

const defaultToken = passwordLoginFlowMockData.ui.nodes[0].attributes.value;
const defaultParams: Partial<LoginPasswordParameters> & { method: string } = {
  csrf_token: defaultToken,
  method: 'password',
};
const mockLoginValidationFlow = (
  params: Partial<LoginPasswordParameters> = {},
  responseCode = 200,
  result: unknown = successfulRegistrationMockData.session,
) => {
  const url = new URL(passwordLoginFlowMockData.ui.action);
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
  mockLoginFlow();
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
        <LoginForm onSuccessfulLogin={onSuccessfulLogin} />
      </AuthContextProvider>
    </QueryClientProvider>,
  );
};

it('should get browser password login flow token', async () => {
  renderComponent();
  await waitForNock();
  const input = (await screen.findByTestId('csrf_token')) as HTMLInputElement;
  const token = passwordLoginFlowMockData.ui.nodes[0].attributes.value;
  expect(input).toBeInTheDocument();
  expect(input.value).toEqual(token);
});

it('should post registration including token', async () => {
  const email = 'sshanzel@yahoo.com';
  renderComponent();
  await waitForNock();
  fireEvent.input(screen.getByPlaceholderText('Email'), {
    target: { value: email },
  });
  fireEvent.input(screen.getByPlaceholderText('Password'), {
    target: { value: '#123xAbc' },
  });
  const form = await screen.findByTestId('login_form');
  const params = formToJson(form as HTMLFormElement);
  mockLoginValidationFlow(params);
  fireEvent.submit(form);
  await waitFor(() => {
    expect(onSuccessfulLogin).toBeCalled();
  });
});

it('should display error messages', async () => {
  const email = 'sshanzel@yahoo.com';
  renderComponent();
  await waitForNock();
  fireEvent.input(screen.getByPlaceholderText('Email'), {
    target: { value: email },
  });
  fireEvent.input(screen.getByPlaceholderText('Password'), {
    target: { value: '#123xAbc' },
  });
  const form = await screen.findByTestId('login_form');
  const params = formToJson(form as HTMLFormElement);
  mockLoginValidationFlow(params, 400, errorRegistrationMockData);
  fireEvent.submit(form);
  await waitFor(() => {
    const errorMessage = 'Invalid username or password';
    const text = screen.queryByText(errorMessage);
    expect(text).toBeInTheDocument();
  });
});
