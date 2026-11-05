import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '../../../../../__tests__/helpers/boot';
import { betterAuthSignIn } from '../../../../lib/betterAuth';
import { LogEvent, TargetType } from '../../../../lib/log';
import { squadSubscriptionQueryOptions } from '../../../../graphql/squadSubscription';
import type { LoggedUser } from '../../../../lib/user';
import { SourceMemberRole } from '../../../../graphql/sources';
import type { Squad } from '../../../../graphql/sources';
import { StartupsCheckout, StartupsCheckoutStep } from './StartupsCheckout';

jest.mock('../../../../lib/betterAuth', () => ({
  ...jest.requireActual('../../../../lib/betterAuth'),
  betterAuthSignIn: jest.fn(),
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

  const renderCompanyStep = ({
    user,
    client = new QueryClient(),
  }: { user?: LoggedUser; client?: QueryClient } = {}) => {
    const logEvent = jest.fn();

    render(
      <TestBootProvider
        client={client}
        auth={{ isLoggedIn: true, user, squads: [acme] }}
        log={{ logEvent }}
      >
        <StartupsCheckout initialSquadId={acme.id} />
      </TestBootProvider>,
    );

    return { logEvent };
  };

  const chooseGoal = (name: string) =>
    fireEvent.click(screen.getByRole('checkbox', { name }));

  const goalEvent = (
    eventName: LogEvent,
    targetId?: string,
    text?: string,
  ) => ({
    event_name: eventName,
    target_type: TargetType.Startups,
    target_id: targetId,
    extra: JSON.stringify({
      source_id: acme.id,
      new_company: false,
      ...(text && { text }),
    }),
  });

  it('logs each goal they picked when they continue', async () => {
    const { logEvent } = renderCompanyStep();

    chooseGoal('Show up in AI answers');
    chooseGoal('Get developers to try my product');
    expect(logEvent).not.toHaveBeenCalledWith(
      expect.objectContaining({ event_name: LogEvent.SelectStartupsGoal }),
    );
    await click(/^continue$/i);

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
    await click(/^continue$/i);

    expect(logEvent).toHaveBeenCalledWith(
      goalEvent(LogEvent.SelectStartupsGoal, 'users'),
    );
    expect(logEvent).not.toHaveBeenCalledWith(
      goalEvent(LogEvent.SelectStartupsGoal, 'ai_answers'),
    );
  });

  it('logs a skip when they continue without answering', async () => {
    const { logEvent } = renderCompanyStep();

    await click(/^continue$/i);

    expect(logEvent).toHaveBeenCalledWith(goalEvent(LogEvent.SkipStartupsGoal));
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
    await click(/^continue$/i);

    expect(logEvent).toHaveBeenCalledWith(
      goalEvent(LogEvent.SelectStartupsGoal, 'other', 'Hire developers'),
    );
  });

  it('counts something else with nothing typed as a skip', async () => {
    const { logEvent } = renderCompanyStep();

    chooseGoal('Something else');
    await click(/^continue$/i);

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
    await click(/^continue$/i);

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

  it("doesn't ask about a page that's already on a plan", async () => {
    const user = { id: '1' } as LoggedUser;
    const client = new QueryClient({
      defaultOptions: { queries: { staleTime: Infinity } },
    });
    client.setQueryData(
      squadSubscriptionQueryOptions({ user, sourceId: acme.id }).queryKey,
      { plan: 'starter' },
    );

    renderCompanyStep({ user, client });

    expect(
      await screen.findByRole('link', { name: /manage subscription/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/what do you want to achieve/i),
    ).not.toBeInTheDocument();
  });
});
