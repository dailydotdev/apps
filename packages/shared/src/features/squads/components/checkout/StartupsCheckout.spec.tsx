import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '../../../../../__tests__/helpers/boot';
import { betterAuthSignIn } from '../../../../lib/betterAuth';
import { useSquadCreate } from '../../../../hooks/squads/useSquadCreate';
import { LogEvent, TargetType } from '../../../../lib/log';
import { SourceMemberRole } from '../../../../graphql/sources';
import type { Squad } from '../../../../graphql/sources';
import { saveStartupsGoals } from '../../../../graphql/squadSubscription';
import { PixelsContext } from '../../../../contexts/PixelsContext';
import defaultUser from '../../../../../__tests__/fixture/loggedUser';
import { StartupsCheckout, StartupsCheckoutStep } from './StartupsCheckout';

jest.mock('../../../../graphql/squadSubscription', () => ({
  ...jest.requireActual('../../../../graphql/squadSubscription'),
  saveStartupsGoals: jest.fn().mockResolvedValue({ _: true }),
}));

jest.mock('../../../../lib/betterAuth', () => ({
  ...jest.requireActual('../../../../lib/betterAuth'),
  betterAuthSignIn: jest.fn(),
}));

jest.mock('../../../../hooks/squads/useSquadCreate', () => ({
  useSquadCreate: jest.fn(),
}));

jest.mock('../../lib/handle', () => ({
  ...jest.requireActual('../../lib/handle'),
  findFreeSquadHandle: jest.fn().mockResolvedValue('acme'),
}));

jest.mock('@marsidev/react-turnstile', () => ({
  Turnstile: () => null,
}));

const renderAccountStep = (refetchBoot = jest.fn()) =>
  render(
    <TestBootProvider
      client={new QueryClient()}
      auth={{ isLoggedIn: false, user: undefined, refetchBoot }}
    >
      <StartupsCheckout initialStep={StartupsCheckoutStep.Account} />
    </TestBootProvider>,
  );

const click = async (name: RegExp) =>
  fireEvent.click(await screen.findByRole('button', { name }));

const openEmailLogIn = async () => {
  await click(/^log in$/i);
  await click(/continue with email/i);
};

describe('StartupsCheckout account step', () => {
  it('opens the log-in screen from the sign-up options', async () => {
    renderAccountStep();
    expect(await screen.findByText('Create your account')).toBeInTheDocument();

    await click(/^log in$/i);

    expect(await screen.findByText('Welcome back')).toBeInTheDocument();
    expect(screen.queryByText('Create your account')).not.toBeInTheDocument();
  });

  it('opens forgot password from log in, and goes back', async () => {
    renderAccountStep();
    await openEmailLogIn();

    await click(/forgot password/i);
    expect(await screen.findByText('Reset your password')).toBeInTheDocument();

    fireEvent.click(screen.getByText(/back to log in/i));
    expect(await screen.findByText('Forgot password?')).toBeInTheDocument();
  });

  it('asks an unverified account for the email code after log in', async () => {
    (betterAuthSignIn as jest.Mock).mockResolvedValue({});
    const refetchBoot = jest.fn().mockResolvedValue({
      data: { user: { shouldVerify: true, email: 'founder@acme.dev' } },
    });
    renderAccountStep(refetchBoot);
    await openEmailLogIn();

    const email = await screen.findByPlaceholderText('Email');
    fireEvent.input(email, { target: { value: 'founder@acme.dev' } });
    const password = document.querySelector(
      'input[name="password"]',
    ) as HTMLInputElement;
    fireEvent.input(password, { target: { value: 'not-my-password' } });
    fireEvent.submit(screen.getByTestId('login_form'));

    expect(await screen.findByText('Check your email')).toBeInTheDocument();
  });

  it('opens the email form from log in, then back to the sign-up options', async () => {
    renderAccountStep();
    await click(/^log in$/i);
    await click(/^sign up$/i);
    await click(/continue with email/i);

    fireEvent.click(
      screen.getAllByRole('button', { name: /^other options$/i })[0],
    );

    expect(await screen.findByText('Create your account')).toBeInTheDocument();
  });
});

describe('StartupsCheckout goal question', () => {
  const acme = {
    id: 'acme',
    name: 'Acme',
    handle: 'acme',
    currentMember: { role: SourceMemberRole.Admin },
  } as Squad;

  const renderCompanyStep = (squads: Squad[] = []) => {
    const logEvent = jest.fn();

    render(
      <TestBootProvider
        client={new QueryClient()}
        auth={{ isLoggedIn: true, squads }}
        log={{ logEvent }}
      >
        <StartupsCheckout />
      </TestBootProvider>,
    );

    return { logEvent };
  };

  const chooseGoal = (name: string) =>
    fireEvent.click(screen.getByRole('checkbox', { name }));

  const companyField = () =>
    document.querySelector('input[name="name"]') as HTMLInputElement;

  const createCompany = async () => {
    fireEvent.input(companyField(), {
      target: { value: 'Acme' },
    });
    await click(/^continue$/i);
    await screen.findByText('Choose a plan for Acme');
  };

  const goalEvent = (
    eventName: LogEvent,
    targetId?: string,
    text?: string,
  ) => ({
    event_name: eventName,
    target_type: TargetType.Startups,
    target_id: targetId,
    extra: JSON.stringify({ source_id: acme.id, ...(text && { text }) }),
  });

  const isGoalEvent = ({ event_name: eventName }: { event_name: LogEvent }) =>
    eventName === LogEvent.SelectStartupsGoal ||
    eventName === LogEvent.SkipStartupsGoal;

  beforeEach(() => {
    (saveStartupsGoals as jest.Mock).mockClear();
    (useSquadCreate as jest.Mock).mockImplementation(({ onSuccess }) => ({
      isLoading: false,
      onCreateSquad: async () => onSuccess(acme),
    }));
  });

  it('logs each goal they picked once the company is created', async () => {
    const { logEvent } = renderCompanyStep();

    chooseGoal('Show up in AI answers');
    chooseGoal('Get developers to try my product');
    expect(logEvent).not.toHaveBeenCalledWith(
      expect.objectContaining({ event_name: LogEvent.SelectStartupsGoal }),
    );
    await createCompany();

    expect(logEvent).toHaveBeenCalledWith(
      goalEvent(LogEvent.SelectStartupsGoal, 'ai_answers'),
    );
    expect(logEvent).toHaveBeenCalledWith(
      goalEvent(LogEvent.SelectStartupsGoal, 'users'),
    );
    expect(logEvent).not.toHaveBeenCalledWith(
      expect.objectContaining({ event_name: LogEvent.SkipStartupsGoal }),
    );
  });

  it("doesn't log a goal they picked and then took back", async () => {
    const { logEvent } = renderCompanyStep();

    chooseGoal('Show up in AI answers');
    chooseGoal('Get developers to try my product');
    chooseGoal('Show up in AI answers');
    await createCompany();

    expect(logEvent).toHaveBeenCalledWith(
      goalEvent(LogEvent.SelectStartupsGoal, 'users'),
    );
    expect(logEvent).not.toHaveBeenCalledWith(
      goalEvent(LogEvent.SelectStartupsGoal, 'ai_answers'),
    );
  });

  it('logs a skip when they continue without answering', async () => {
    const { logEvent } = renderCompanyStep();

    await createCompany();

    expect(logEvent).toHaveBeenCalledWith(goalEvent(LogEvent.SkipStartupsGoal));
    expect(saveStartupsGoals).not.toHaveBeenCalled();
  });

  it('saves the answers on the buyer once the company is created', async () => {
    renderCompanyStep();

    chooseGoal('Get developers to try my product');
    chooseGoal('Something else');
    fireEvent.input(
      screen.getByRole('textbox', { name: /in your own words/i }),
      { target: { value: 'Hire developers' } },
    );
    await createCompany();

    expect(saveStartupsGoals).toHaveBeenCalledWith({
      sourceId: acme.id,
      goals: ['users', 'other'],
      other: 'Hire developers',
    });
  });

  it('logs what they typed for something else', async () => {
    const { logEvent } = renderCompanyStep();

    chooseGoal('Something else');
    fireEvent.input(
      screen.getByRole('textbox', { name: /in your own words/i }),
      {
        target: { value: '  Hire developers ' },
      },
    );
    await createCompany();

    expect(logEvent).toHaveBeenCalledWith(
      goalEvent(LogEvent.SelectStartupsGoal, 'other', 'Hire developers'),
    );
  });

  it('counts something else with nothing typed as a skip', async () => {
    const { logEvent } = renderCompanyStep();

    chooseGoal('Something else');
    await createCompany();

    expect(logEvent).toHaveBeenCalledWith(goalEvent(LogEvent.SkipStartupsGoal));
  });

  it('keeps the other answers when they add something else', async () => {
    const { logEvent } = renderCompanyStep();

    chooseGoal('Get developers to try my product');
    chooseGoal('Something else');
    fireEvent.input(
      screen.getByRole('textbox', { name: /in your own words/i }),
      {
        target: { value: 'Hire developers' },
      },
    );

    expect(
      screen.getByRole('checkbox', {
        name: 'Get developers to try my product',
      }),
    ).toBeChecked();
    await createCompany();

    expect(logEvent).toHaveBeenCalledWith(
      goalEvent(LogEvent.SelectStartupsGoal, 'users'),
    );
    expect(logEvent).toHaveBeenCalledWith(
      goalEvent(LogEvent.SelectStartupsGoal, 'other', 'Hire developers'),
    );
  });

  it('removes the text box when they take back something else', () => {
    renderCompanyStep();

    chooseGoal('Something else');
    chooseGoal('Something else');

    expect(
      screen.queryByRole('textbox', { name: /in your own words/i }),
    ).not.toBeInTheDocument();
  });

  it("doesn't ask or log anything when they pick a page they already have", async () => {
    const { logEvent } = renderCompanyStep([acme]);

    expect(
      await screen.findByText('Which page is this for?'),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/what do you want to achieve/i),
    ).not.toBeInTheDocument();

    await click(/^continue$/i);
    await screen.findByText('Choose a plan for Acme');

    expect(
      logEvent.mock.calls.map(([event]) => event).filter(isGoalEvent),
    ).toEqual([]);
  });

  it("doesn't log anything when they create another page from the same screen", async () => {
    const { logEvent } = renderCompanyStep([acme]);

    fireEvent.focus(companyField());
    fireEvent.input(companyField(), {
      target: { value: 'Acme' },
    });
    expect(
      screen.queryByText(/what do you want to achieve/i),
    ).not.toBeInTheDocument();
    await click(/^continue$/i);
    await screen.findByText('Choose a plan for Acme');

    expect(
      logEvent.mock.calls.map(([event]) => event).filter(isGoalEvent),
    ).toEqual([]);
  });
});

describe('StartupsCheckout signup pixel', () => {
  const renderCompanyStep = () => {
    const trackEvent = jest.fn();

    render(
      <TestBootProvider
        client={new QueryClient()}
        auth={{ isLoggedIn: true, user: defaultUser, squads: [] }}
      >
        <PixelsContext.Provider
          value={{
            trackSignup: jest.fn(),
            trackPayment: jest.fn(),
            trackEvent,
          }}
        >
          <StartupsCheckout initialPlan="team" />
        </PixelsContext.Provider>
      </TestBootProvider>,
    );

    return trackEvent;
  };

  beforeEach(() => localStorage.clear());

  it('fires CompleteRegistration once per founder on the company step', () => {
    expect(renderCompanyStep()).toHaveBeenCalledWith(
      'CompleteRegistration',
      { content_name: 'startups', content_category: 'team' },
      { eventId: `startups-signup-${defaultUser.id}` },
    );

    // A second visit in the same browser
    expect(renderCompanyStep()).not.toHaveBeenCalledWith(
      'CompleteRegistration',
      expect.anything(),
      expect.anything(),
    );
  });

  it("doesn't fire before the founder has an account", () => {
    const trackEvent = jest.fn();

    render(
      <TestBootProvider
        client={new QueryClient()}
        auth={{ isLoggedIn: false, user: undefined }}
      >
        <PixelsContext.Provider
          value={{
            trackSignup: jest.fn(),
            trackPayment: jest.fn(),
            trackEvent,
          }}
        >
          <StartupsCheckout initialStep={StartupsCheckoutStep.Account} />
        </PixelsContext.Provider>
      </TestBootProvider>,
    );

    expect(trackEvent).not.toHaveBeenCalled();
  });
});
