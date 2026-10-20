import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import AuthOptions from './AuthOptions';
import { AuthDisplay } from './common';
import { AuthTriggers } from '../../lib/auth';
import { TestBootProvider } from '../../../__tests__/helpers/boot';

jest.mock('./RegistrationForm', () => ({
  __esModule: true,
  default: () => <div data-testid="registration-form" />,
}));

jest.mock('./OnboardingRegistrationForm', () => {
  const ProviderChoice = () => <div data-testid="provider-choice" />;
  ProviderChoice.default = ProviderChoice;
  return { OnboardingRegistrationForm: ProviderChoice };
});

jest.mock('./AuthDefault', () => ({
  __esModule: true,
  default: () => <div data-testid="auth-default" />,
}));

const renderOptions = (defaultDisplay: AuthDisplay) => {
  const client = new QueryClient();
  const formRef = { current: document.createElement('form') };
  const options = (display: AuthDisplay) => (
    <TestBootProvider client={client} auth={{ isLoggedIn: false }}>
      <AuthOptions
        simplified
        isOnboardingFunnel
        formRef={formRef}
        trigger={AuthTriggers.Onboarding}
        defaultDisplay={display}
      />
    </TestBootProvider>
  );
  const view = render(options(defaultDisplay));

  return {
    rerenderWith: (display: AuthDisplay) => view.rerender(options(display)),
  };
};

describe('AuthOptions', () => {
  it('follows the parent when it moves the default display', async () => {
    const { rerenderWith } = renderOptions(AuthDisplay.Registration);
    expect(await screen.findByTestId('registration-form')).toBeInTheDocument();

    rerenderWith(AuthDisplay.OnboardingSignup);

    expect(await screen.findByTestId('provider-choice')).toBeInTheDocument();
    expect(screen.queryByTestId('registration-form')).not.toBeInTheDocument();
  });
});
