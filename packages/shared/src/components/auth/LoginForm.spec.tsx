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
  errorRegistrationMockData,
  mockEmailCheck,
  mockLoginFlow,
  mockRegistrationFlow,
  passwordLoginFlowMockData,
  successfulRegistrationMockData,
} from '../../../__tests__/fixture/auth';
import {
  AuthTriggers,
  getNodeByKey,
  LoginPasswordParameters,
} from '../../lib/auth';
import { AuthContextProvider } from '../../contexts/AuthContext';
import { formToJson } from '../../lib/form';
import AuthOptions, { AuthOptionsProps } from './AuthOptions';
import SettingsContext from '../../contexts/SettingsContext';

let user = null;

beforeEach(() => {
  nock.cleanAll();
  jest.clearAllMocks();
});

const defaultToken = getNodeByKey(
  'csrf_token',
  passwordLoginFlowMockData.ui.nodes,
);
const defaultParams: Partial<LoginPasswordParameters> & { method: string } = {
  method: 'password',
  csrf_token: defaultToken.attributes.value,
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

const onSuccessfulLogin = jest.fn();
const renderComponent = (
  props: AuthOptionsProps = {
    onSuccessfulLogin,
    formRef: null,
    trigger: AuthTriggers.Author,
  },
): RenderResult => {
  const client = new QueryClient();
  mockLoginFlow();
  mockRegistrationFlow();
  return render(
    <QueryClientProvider client={client}>
      <AuthContextProvider
        user={user}
        updateUser={jest.fn()}
        tokenRefreshed
        getRedirectUri={jest.fn()}
        loadingUser={false}
        loadedUserFromCache
        refetchBoot={() => {
          onSuccessfulLogin();
          return { data: {} };
        }}
      >
        <SettingsContext.Provider value={{ syncSettings: jest.fn() }}>
          <AuthOptions {...props} onSuccessfulLogin={onSuccessfulLogin} />
        </SettingsContext.Provider>
      </AuthContextProvider>
    </QueryClientProvider>,
  );
};

const renderLogin = async (email: string) => {
  renderComponent();
  await waitForNock();
  mockEmailCheck(email, true);
  fireEvent.input(screen.getByPlaceholderText('Email'), {
    target: { value: email },
  });
  const submit = await screen.findByTestId('email_signup_submit');
  fireEvent.click(submit);
  await waitForNock();

  await waitFor(async () => {
    const login = screen.queryByTestId('login_form');
    expect(login).toBeInTheDocument();
  });
  fireEvent.input(screen.getByTestId('login_email'), {
    target: { value: email },
  });
};

it('should post login including token', async () => {
  const email = 'sshanzel@yahoo.com';
  await renderLogin(email);
  fireEvent.input(screen.getByLabelText('Password'), {
    target: { value: '#123xAbc' },
  });
  const form = await screen.findByTestId('login_form');
  const params = formToJson(form as HTMLFormElement);
  mockLoginValidationFlow(params);
  fireEvent.submit(form);
  await waitForNock();
  await waitFor(() => {
    expect(onSuccessfulLogin).toBeCalled();
  });
});

it('should display error messages', async () => {
  const email = 'sshanzel@yahoo.com';
  user = null;
  await renderLogin(email);

  fireEvent.input(screen.getByLabelText('Password'), {
    target: { value: '#123xAbc' },
  });
  const form = await screen.findByTestId('login_form');
  const params = formToJson(form as HTMLFormElement);
  mockLoginValidationFlow(params, 400, errorRegistrationMockData);
  fireEvent.submit(form);
  await waitFor(() => {
    const errorMessage =
      "The email or password you entered doesn't match our records. Please try again or";
    const text = screen.queryByText(errorMessage);
    expect(text).toBeInTheDocument();
  });
});
