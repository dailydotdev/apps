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
import type { AuthOptionsProps } from './common';

const user = null;

beforeEach(() => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
  nock.cleanAll();
  jest.clearAllMocks();
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


it('should show login if email exists', async () => {
  const email = 'sshanzel@yahoo.com';
  await renderLogin(email);

  const text = screen.queryByText('Facebook');
  expect(text).toBeInTheDocument();
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
