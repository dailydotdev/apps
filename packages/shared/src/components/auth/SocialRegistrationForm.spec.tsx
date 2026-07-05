import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import AuthContext from '../../contexts/AuthContext';
import type { AuthContextData } from '../../contexts/AuthContext';
import type { LoggedUser } from '../../lib/user';
import { SocialProvider } from './common';
import { SocialRegistrationForm } from './SocialRegistrationForm';
import { useGenerateUsername } from '../../hooks';

const mockOnUpdateSignBack = jest.fn();

jest.mock('../../hooks', () => ({
  useGenerateUsername: jest.fn(),
}));

jest.mock('../../hooks/auth/useSignBack', () => ({
  useSignBack: () => ({
    onUpdateSignBack: mockOnUpdateSignBack,
  }),
}));

jest.mock('../profile/ExperienceLevelDropdown', () => {
  const actualReact = jest.requireActual('react');

  return {
    __esModule: true,
    default: ({ name }: { name: string }) =>
      actualReact.createElement('input', {
        'aria-label': 'Experience level',
        name,
        defaultValue: 'LESS_THAN_1_YEAR',
      }),
  };
});

const user = {
  id: 'user-id',
  email: 'apple@example.com',
  name: 'Apple User',
  image: 'https://daily.dev/avatar.png',
  username: 'apple_user',
  providers: ['apple'],
  createdAt: '2026-01-01T00:00:00.000Z',
  permalink: 'https://daily.dev/apple_user',
} as LoggedUser;

const renderForm = (component: ReactElement, authUser = user) =>
  render(
    <AuthContext.Provider
      value={
        {
          user: authUser,
          isLoggedIn: true,
          isAuthReady: true,
          updateUser: jest.fn(),
        } as unknown as AuthContextData
      }
    >
      {component}
    </AuthContext.Provider>,
  );

beforeEach(() => {
  mockOnUpdateSignBack.mockReset();
  jest.mocked(useGenerateUsername).mockReturnValue({
    username: 'daily_apple',
    setUsername: jest.fn(),
    isLoading: false,
  });
});

describe('SocialRegistrationForm', () => {
  it('hides Apple identity fields while submitting the internal profile name', () => {
    const onSignup = jest.fn();
    renderForm(
      <SocialRegistrationForm
        provider={SocialProvider.Apple}
        hints={{}}
        onSignup={onSignup}
      />,
    );
    const hiddenNameInput = screen.getByDisplayValue('Apple User');
    const hiddenEmailInput = screen.getByDisplayValue('apple@example.com');

    expect(screen.queryByText('Email')).not.toBeInTheDocument();
    expect(screen.queryByText('Name')).not.toBeInTheDocument();
    expect(hiddenNameInput).toHaveAttribute('type', 'hidden');
    expect(hiddenNameInput).toHaveAttribute('name', 'name');
    expect(hiddenEmailInput).toHaveAttribute('type', 'hidden');
    expect(hiddenEmailInput).toHaveAttribute('name', 'email');
    expect(screen.getByDisplayValue('daily_apple')).toBeInTheDocument();
    expect(screen.getByLabelText('Experience level')).toBeInTheDocument();

    fireEvent.submit(screen.getByTestId('registration_form'));

    expect(onSignup).toHaveBeenCalledWith({
      email: 'apple@example.com',
      name: 'Apple User',
      username: 'daily_apple',
      experienceLevel: 'LESS_THAN_1_YEAR',
      acceptedMarketing: true,
    });
    expect(mockOnUpdateSignBack).toHaveBeenCalledWith(
      {
        name: 'Apple User',
        email: 'apple@example.com',
        image: 'https://daily.dev/avatar.png',
      },
      SocialProvider.Apple,
    );
  });

  it('generates an Apple profile name when the provider only returned email', () => {
    const onSignup = jest.fn();
    renderForm(
      <SocialRegistrationForm
        provider={SocialProvider.Apple}
        hints={{}}
        onSignup={onSignup}
      />,
      {
        ...user,
        name: undefined,
      } as unknown as LoggedUser,
    );

    expect(screen.queryByText('Email')).not.toBeInTheDocument();
    expect(screen.queryByText('Name')).not.toBeInTheDocument();

    fireEvent.submit(screen.getByTestId('registration_form'));

    expect(onSignup).toHaveBeenCalledWith({
      email: 'apple@example.com',
      name: 'Apple',
      username: 'daily_apple',
      experienceLevel: 'LESS_THAN_1_YEAR',
      acceptedMarketing: true,
    });
  });

  it('shows Apple email when missing and generates the profile name from it', () => {
    const onSignup = jest.fn();
    renderForm(
      <SocialRegistrationForm
        provider={SocialProvider.Apple}
        hints={{}}
        onSignup={onSignup}
      />,
      {
        ...user,
        email: undefined,
        name: undefined,
      } as unknown as LoggedUser,
    );

    const emailInput = screen.getByPlaceholderText('Email');

    expect(screen.queryByText('Name')).not.toBeInTheDocument();
    fireEvent.input(emailInput, {
      target: { value: 'missing@example.com' },
    });
    fireEvent.blur(emailInput);
    fireEvent.submit(screen.getByTestId('registration_form'));

    expect(onSignup).toHaveBeenCalledWith({
      email: 'missing@example.com',
      name: 'Missing',
      username: 'daily_apple',
      experienceLevel: 'LESS_THAN_1_YEAR',
      acceptedMarketing: true,
    });
  });
});
