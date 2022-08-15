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
  registrationFlowMockData,
  successfulRegistrationMockData,
} from '../../../__tests__/fixture/auth';
import {
  authUrl,
  getNodeByKey,
  getNodeValue,
  RegistrationParameters,
} from '../../lib/auth';
import { AuthContextProvider } from '../../contexts/AuthContext';
import { formToJson } from '../../lib/form';
import AuthOptions, { AuthOptionsProps } from './AuthOptions';

beforeEach(() => {
  jest.clearAllMocks();
});

const mockRegistraitonFlow = (result = registrationFlowMockData) => {
  nock(authUrl, { reqheaders: { Accept: 'application/json' } })
    .get('/self-service/registration/browser')
    .reply(200, result);
};

const defaultToken = getNodeValue(
  'csrf_token',
  registrationFlowMockData.ui.nodes,
);
const defaultParams: Partial<RegistrationParameters> = {
  csrf_token: defaultToken,
  provider: undefined,
  method: 'password',
  'traits.image':
    'https://daily-now-res.cloudinary.com/image/upload/t_logo,f_auto/v1635938111/logos/placeholder2',
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
      >
        <AuthOptions {...props} />
      </AuthContextProvider>
    </QueryClientProvider>,
  );
};

const renderRegistration = async (email: string) => {
  renderComponent();
  await waitForNock();
  fireEvent.input(screen.getByPlaceholderText('Email'), {
    target: { value: email },
  });
  const submit = await screen.findByTestId('email_signup_submit');
  fireEvent.click(submit);
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

it('should get browser password registration flow token', async () => {
  renderComponent();
  await waitForNock();
  fireEvent.input(screen.getByPlaceholderText('Email'), {
    target: { value: 'lee@daily.dev' },
  });
  const submit = await screen.findByTestId('email_signup_submit');
  fireEvent.click(submit);
  const input = (await screen.findByTestId('csrf_token')) as HTMLInputElement;
  const token = getNodeByKey('csrf_token', registrationFlowMockData.ui.nodes);
  expect(input).toBeInTheDocument();
  expect(input.value).toEqual(token.attributes.value);
});

it('should post registration including token', async () => {
  const email = 'sshanzel@yahoo.com';
  renderRegistration(email);
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
  renderRegistration(email);
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
