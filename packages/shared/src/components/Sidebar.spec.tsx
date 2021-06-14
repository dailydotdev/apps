import React from 'react';
import { render, RenderResult, screen } from '@testing-library/react';
import OnboardingContext from '../contexts/OnboardingContext';
import AuthContext from '../contexts/AuthContext';
import Sidebar from './Sidebar';
import { QueryClient, QueryClientProvider } from 'react-query';

const incrementOnboardingStep = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

const renderComponent = (onboardingStep = -1): RenderResult => {
  const client = new QueryClient();
  return render(
    <QueryClientProvider client={client}>
      <AuthContext.Provider
        value={{
          user: null,
          shouldShowLogin: false,
          showLogin: jest.fn(),
          logout: jest.fn(),
          updateUser: jest.fn(),
          tokenRefreshed: true,
          getRedirectUri: jest.fn(),
        }}
      >
        <OnboardingContext.Provider
          value={{
            onboardingStep,
            onboardingReady: true,
            incrementOnboardingStep,
            trackEngagement: jest.fn(),
            closeReferral: jest.fn(),
            showReferral: false,
          }}
        >
          <Sidebar />
        </OnboardingContext.Provider>
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
};

it('should not increment onboarding step when it is done', async () => {
  renderComponent();
  const trigger = await screen.findByLabelText('Open sidebar');
  trigger.click();
  expect(incrementOnboardingStep).toBeCalledTimes(0);
});

it('should increment onboarding step on trigger click', async () => {
  renderComponent(2);
  const trigger = await screen.findByLabelText('Open sidebar');
  trigger.click();
  expect(incrementOnboardingStep).toBeCalledTimes(1);
});
