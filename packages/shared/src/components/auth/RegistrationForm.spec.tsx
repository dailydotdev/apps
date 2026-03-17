import React from 'react';
import type { RenderResult } from '@testing-library/react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { waitForNock } from '../../../__tests__/helpers/utilities';
import {
  mockEmailCheck,
  mockLoginFlow,
  mockRegistrationFlow,
} from '../../../__tests__/fixture/auth';
import { AuthContextProvider } from '../../contexts/AuthContext';
import AuthOptions from './AuthOptions';
import SettingsContext from '../../contexts/SettingsContext';
import { mockGraphQL } from '../../../__tests__/helpers/graphql';
import { GET_USERNAME_SUGGESTION } from '../../graphql/users';
import { AuthTriggers } from '../../lib/auth';
import * as betterAuthHook from '../../hooks/useIsBetterAuth';
import type { AuthOptionsProps } from './common';

jest.mock('@marsidev/react-turnstile', () => {
  // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
  const react = require('react');
  return {
    Turnstile: react.forwardRef(function MockTurnstile(
      props: { onWidgetLoad?: () => void },
      ref: unknown,
    ) {
      react.useImperativeHandle(ref, () => ({
        getResponse: () => 'mock-turnstile-token',
        reset: () => undefined,
      }));
      react.useEffect(() => {
        props.onWidgetLoad?.();
      }, [props]);
      return react.createElement('div', { 'data-testid': 'turnstile' });
    }),
  };
});

const user = null;

beforeEach(() => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
  nock.cleanAll();
  jest.clearAllMocks();
  jest.spyOn(betterAuthHook, 'useIsBetterAuth').mockReturnValue(false);
});

const onSuccessfulLogin = jest.fn();

const renderComponent = (
  props: AuthOptionsProps = {
    onSuccessfulLogin,
    onAuthStateUpdate: jest.fn(),
    formRef: null,
    trigger: AuthTriggers.Verification,
  },
): RenderResult => {
  const client = new QueryClient();
  mockRegistrationFlow();
  mockLoginFlow();
  return render(
    <QueryClientProvider client={client}>
      <AuthContextProvider
        user={user}
        updateUser={jest.fn()}
        tokenRefreshed
        getRedirectUri={jest.fn()}
        loadingUser={false}
        loadedUserFromCache
        refetchBoot={onSuccessfulLogin}
      >
        <SettingsContext.Provider value={{ syncSettings: jest.fn() }}>
          <AuthOptions {...props} onSuccessfulLogin={onSuccessfulLogin} />
        </SettingsContext.Provider>
      </AuthContextProvider>
    </QueryClientProvider>,
  );
};

const simulateTextboxInput = (el: HTMLTextAreaElement, key: string) => {
  el.focus();
  el.blur();
  // eslint-disable-next-line no-param-reassign
  el.value += key;
};

const renderRegistration = async (
  email = 'sshanzel@yahoo.com',
  existing = false,
  name = 'Lee Solevilla',
  username = 'leesolevilla',
) => {
  renderComponent();
  await waitForNock();
  mockEmailCheck(email, existing);
  fireEvent.input(screen.getByPlaceholderText('Email'), {
    target: { value: email },
  });
  const submit = await screen.findByTestId('email_signup_submit');
  fireEvent.click(submit);
  await waitForNock();
  let queryCalled = false;
  mockGraphQL({
    request: {
      query: GET_USERNAME_SUGGESTION,
      variables: { name },
    },
    result: () => {
      queryCalled = true;
      return { data: { generateUniqueUsername: username } };
    },
  });
  await screen.findByTestId('registration_form');
  const nameInput = screen.getByPlaceholderText('Name');
  fireEvent.input(screen.getByPlaceholderText('Enter a username'), {
    target: { value: username },
  });
  fireEvent.input(screen.getByPlaceholderText('Name'), {
    target: { value: name },
  });
  simulateTextboxInput(nameInput as HTMLTextAreaElement, name);
  fireEvent.input(screen.getByPlaceholderText('Create a password'), {
    target: { value: '#123xAbc' },
  });

  await waitForNock();
  await waitFor(() => expect(queryCalled).toBeTruthy());
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

const renderBetterAuthRegistration = async (
  email = 'sshanzel@yahoo.com',
  name = 'Lee Solevilla',
  username = 'leesolevilla',
) => {
  jest.spyOn(betterAuthHook, 'useIsBetterAuth').mockReturnValue(true);
  renderComponent();
  // Clean pending Kratos nocks that won't be consumed when betterAuth is enabled
  nock.cleanAll();

  fireEvent.input(screen.getByPlaceholderText('Email'), {
    target: { value: email },
  });
  fireEvent.click(await screen.findByTestId('email_signup_submit'));
  await waitForNock();

  let queryCalled = false;
  mockGraphQL({
    request: {
      query: GET_USERNAME_SUGGESTION,
      variables: { name },
    },
    result: () => {
      queryCalled = true;
      return { data: { generateUniqueUsername: username } };
    },
  });

  await screen.findByTestId('registration_form');
  const nameInput = screen.getByPlaceholderText('Name');
  fireEvent.input(screen.getByPlaceholderText('Enter a username'), {
    target: { value: username },
  });
  fireEvent.input(screen.getByPlaceholderText('Name'), {
    target: { value: name },
  });
  simulateTextboxInput(nameInput as HTMLTextAreaElement, name);
  fireEvent.input(screen.getByPlaceholderText('Create a password'), {
    target: { value: '#123xAbc' },
  });

  // Select experience level
  const expDropdown = screen.getByRole('button', {
    name: /experience level/i,
  });
  fireEvent.click(expDropdown);
  const expOption = await screen.findByText('Entry-level (1 year)');
  fireEvent.click(expOption);

  await waitForNock();
  await waitFor(() => expect(queryCalled).toBeTruthy());
};

// NOTE: Chris turned this off needs a good re-look at
// it('should post registration', async () => {
//   const email = 'sshanzel@yahoo.com';
//   await renderRegistration(email);
//   const form = await screen.findByTestId('registration_form');
//   const params = formToJson(form as HTMLFormElement);
//   mockRegistrationValidationFlow(successfulRegistrationMockData, params);
//   fireEvent.submit(form);
//   await waitForNock();
//   await waitFor(() => {
//     const sentText = screen.queryByText('We just sent an email to:');
//     expect(sentText).toBeInTheDocument();
//     const emailText = screen.queryByText(email);
//     expect(emailText).toBeInTheDocument();
//   });
// });

// NOTE: Chris turned this off needs a good re-look at
// it('should display error messages', async () => {
//   const email = 'sshanzel@yahoo.com';
//   const errorMessage =
//     'The password can not be used because password length must be at least 8 characters but only got 3.';
//   await renderRegistration(email);
//   const form = await screen.findByTestId('registration_form');
//   const params = formToJson(form as HTMLFormElement);
//   mockRegistrationValidationFlow(errorRegistrationMockData, params, 400);
//   fireEvent.submit(form);
//   await waitForNock();
//   await waitFor(() => {
//     const text = screen.queryByText(errorMessage);
//     expect(text).toBeInTheDocument();
//   });
// });

it('should show login if email exists', async () => {
  const email = 'sshanzel@yahoo.com';
  await renderLogin(email);

  const text = screen.queryByText('Facebook');
  expect(text).toBeInTheDocument();
});

it('should show a generic sign up error when Better Auth sign up is privacy-protected', async () => {
  const email = 'sshanzel@yahoo.com';
  await renderBetterAuthRegistration(email);

  nock(process.env.NEXT_PUBLIC_API_URL as string)
    .post('/auth/sign-up/email', (body) => {
      return (
        body.name === 'Lee Solevilla' &&
        body.email === email &&
        body.password === '#123xAbc' &&
        body.username === 'leesolevilla' &&
        body.experienceLevel === 'MORE_THAN_1_YEAR'
      );
    })
    .reply(200, { status: true });

  const form = await screen.findByTestId('registration_form');

  // Inject experience level value into the form since the custom dropdown
  // hidden input may not render properly in JSDOM
  const expInput = document.createElement('input');
  expInput.type = 'hidden';
  expInput.name = 'traits.experienceLevel';
  expInput.value = 'MORE_THAN_1_YEAR';
  form.appendChild(expInput);

  fireEvent.submit(form);
  await waitForNock();

  await waitFor(() => {
    expect(
      screen.getByText(
        "We couldn't complete sign up. If you already have an account, try signing in instead.",
      ),
    ).toBeInTheDocument();
  });
});

describe('testing username auto generation', () => {
  it('should suggest a valid option', async () => {
    const email = 'sshanzel@yahoo.com';
    const name = 'John Doe';
    const username = 'johndoe';

    await renderRegistration(email, false, name, username);

    const usernameEl = screen.getByPlaceholderText('Enter a username');
    expect(usernameEl).toBeInTheDocument();
    expect(usernameEl).toHaveValue(username);
  });
});
