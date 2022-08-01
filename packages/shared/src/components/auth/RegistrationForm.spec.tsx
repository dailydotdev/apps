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
import { RegistrationForm, RegistrationFormProps } from './RegistrationForm';
import { authUrl, RegistrationParameters } from '../../lib/auth';
import { AuthContextProvider } from '../../contexts/AuthContext';
import { formToJson } from '../../lib/form';

beforeEach(() => {
  jest.clearAllMocks();
});

const mockRegistraitonFlow = (result = registrationFlowMockData) => {
  nock(authUrl, { reqheaders: { Accept: 'application/json' } })
    .get('/self-service/registration/browser')
    .reply(200, result);
};

const defaultToken = registrationFlowMockData.ui.nodes[0].attributes.value;
const defaultParams: Partial<RegistrationParameters> = {
  csrf_token: defaultToken,
  method: 'password',
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

const renderComponent = (
  props: RegistrationFormProps = { email: 'lee@daily.dev' },
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
        <RegistrationForm {...props} />
      </AuthContextProvider>
    </QueryClientProvider>,
  );
};

it('should get browser password registration flow token', async () => {
  renderComponent();
  await waitForNock();
  const input = (await screen.findByTestId('csrf_token')) as HTMLInputElement;
  const token = registrationFlowMockData.ui.nodes[0].attributes.value;
  expect(input).toBeInTheDocument();
  expect(input.value).toEqual(token);
});

it('should post registration including token', async () => {
  const email = 'sshanzel@yahoo.com';
  renderComponent({ email });
  await waitForNock();
  fireEvent.input(screen.getByPlaceholderText('Full name'), {
    target: { value: 'Lee Solevilla' },
  });
  fireEvent.input(screen.getByPlaceholderText('Create a password'), {
    target: { value: '#123xAbc' },
  });
  fireEvent.input(screen.getByPlaceholderText('Enter a username'), {
    target: { value: 'sshanzel' },
  });
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
  renderComponent({ email });
  await waitForNock();
  fireEvent.input(screen.getByPlaceholderText('Full name'), {
    target: { value: 'Lee Solevilla' },
  });
  fireEvent.input(screen.getByPlaceholderText('Create a password'), {
    target: { value: 'abc' },
  });
  fireEvent.input(screen.getByPlaceholderText('Enter a username'), {
    target: { value: 'sshanzel' },
  });
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
