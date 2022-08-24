import React from 'react';
import {
  fireEvent,
  render,
  RenderResult,
  screen,
  waitFor,
} from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import nock from 'nock';
import { QueryClient, QueryClientProvider } from 'react-query';
import { waitForNock } from '../../../__tests__/helpers/utilities';
import {
  errorRegistrationMockData,
  mockEmailCheck,
  mockLoginFlow,
  mockRegistraitonFlow,
  passwordLoginFlowMockData,
  successfulRegistrationMockData,
} from '../../../__tests__/fixture/auth';
import { getNodeByKey, LoginPasswordParameters } from '../../lib/auth';
import { AuthContextProvider } from '../../contexts/AuthContext';
import { formToJson } from '../../lib/form';
import AuthOptions, { AuthOptionsProps } from './AuthOptions';

beforeEach(() => {
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
  },
): RenderResult => {
  const client = new QueryClient();
  mockLoginFlow();
  mockRegistraitonFlow();
  return render(
    <QueryClientProvider client={client}>
      <AuthContextProvider
        user={null}
        updateUser={jest.fn()}
        tokenRefreshed
        getRedirectUri={jest.fn()}
        loadingUser={false}
        loadedUserFromCache
        refetchBoot={jest.fn()}
      >
        <AuthOptions {...props} onSuccessfulLogin={onSuccessfulLogin} />
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
  await act(async () => {
    const submit = await screen.findByTestId('email_signup_submit');
    fireEvent.click(submit);
    await waitForNock();
  });
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
  await renderLogin(email);

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
