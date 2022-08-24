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
  registrationFlowMockData,
  successfulRegistrationMockData,
} from '../../../__tests__/fixture/auth';
import { getNodeValue, RegistrationParameters } from '../../lib/auth';
import { AuthContextProvider } from '../../contexts/AuthContext';
import { formToJson } from '../../lib/form';
import AuthOptions, { AuthOptionsProps } from './AuthOptions';

beforeEach(() => {
  jest.clearAllMocks();
});

const defaultToken = getNodeValue(
  'csrf_token',
  registrationFlowMockData.ui.nodes,
);
const defaultParams: Partial<RegistrationParameters> = {
  csrf_token: defaultToken,
  provider: undefined,
  method: 'password',
  'traits.image': undefined,
};
const mockRegistraitonValidationFlow = (
  result: unknown,
  params: Partial<RegistrationParameters> = {},
  responseCode = 200,
) => {
  const url = new URL(registrationFlowMockData.ui.action);
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

const onSelectedProvider = jest.fn();
const renderComponent = (
  props: AuthOptionsProps = {
    onSelectedProvider,
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
        <AuthOptions {...props} />
      </AuthContextProvider>
    </QueryClientProvider>,
  );
};

const renderRegistration = async (email: string, existing = false) => {
  renderComponent();
  mockEmailCheck(email, existing);
  fireEvent.input(screen.getByPlaceholderText('Email'), {
    target: { value: email },
  });
  await act(async () => {
    const submit = await screen.findByTestId('email_signup_submit');
    fireEvent.click(submit);
    await waitForNock();
  });
  await waitFor(() => expect(screen.getByText('Sign up to daily.dev')));
  fireEvent.input(screen.getByPlaceholderText('Full name'), {
    target: { value: 'Lee Solevilla' },
  });
  fireEvent.input(screen.getByPlaceholderText('Create a password'), {
    target: { value: '#123xAbc' },
  });
  fireEvent.input(screen.getByPlaceholderText('Enter a username'), {
    target: { value: 'sshanzel' },
  });
};

it('should post registration', async () => {
  const email = 'sshanzel@yahoo.com';
  await renderRegistration(email);
  const form = await screen.findByTestId('registration_form');
  const params = formToJson(form as HTMLFormElement);
  mockRegistraitonValidationFlow(successfulRegistrationMockData, params);
  fireEvent.submit(form);
  await waitFor(() => {
    const sentText = screen.queryByText('We just sent an email to:');
    expect(sentText).toBeInTheDocument();
    const emailText = screen.queryByText(email);
    expect(emailText).toBeInTheDocument();
  });
});

it('should display error messages', async () => {
  const email = 'sshanzel@yahoo.com';
  await renderRegistration(email);
  const form = await screen.findByTestId('registration_form');
  const params = formToJson(form as HTMLFormElement);
  mockRegistraitonValidationFlow(errorRegistrationMockData, params, 400);
  fireEvent.submit(form);
  await waitFor(() => {
    const errorMessage =
      'The password can not be used because password length must be at least 8 characters but only got 3.';
    const text = screen.queryByText(errorMessage);
    expect(text).toBeInTheDocument();
  });
});

it('should show login if email exists', async () => {
  const email = 'sshanzel@yahoo.com';
  renderComponent();
  fireEvent.input(screen.getByPlaceholderText('Email'), {
    target: { value: email },
  });
  const submit = await screen.findByTestId('email_signup_submit');
  fireEvent.click(submit);
  mockEmailCheck(email, true);
  await waitForNock();

  await waitFor(() => {
    const text = screen.queryByText('Enter your password to login');
    expect(text).toBeInTheDocument();
  });
});
