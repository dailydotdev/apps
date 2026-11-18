import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { TestBootProvider } from '../../../../../__tests__/helpers/boot';
import { betterAuthSignIn } from '../../../../lib/betterAuth';
import { LogEvent } from '../../../../lib/log';
import { SourceMemberRole } from '../../../../graphql/sources';
import type { Squad } from '../../../../graphql/sources';
import { SQUAD_SUBSCRIPTION_QUERY } from '../../../../graphql/squadSubscription';
import { mockGraphQL } from '../../../../../__tests__/helpers/graphql';
import { PixelsContext } from '../../../../contexts/PixelsContext';
import { STARTUPS_X_EVENTS } from '../../lib/startupsXEvents';
import defaultUser from '../../../../../__tests__/fixture/loggedUser';
import { getCompanyPageCreateUrl } from '../../lib/routes';
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

describe('StartupsCheckout company step', () => {
  const acme = {
    id: 'acme',
    name: 'Acme',
    handle: 'acme',
    flags: { company: true },
    currentMember: { role: SourceMemberRole.Admin },
  } as Squad;
  const community = {
    id: 'community',
    name: 'React friends',
    handle: 'reactfriends',
    currentMember: { role: SourceMemberRole.Admin },
  } as Squad;

  const renderCompanyStep = (squads: Squad[], initialPlan?: string) => {
    const replace = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ query: {}, replace });

    render(
      <TestBootProvider
        client={new QueryClient()}
        auth={{ isLoggedIn: true, user: defaultUser, squads }}
      >
        <StartupsCheckout initialPlan={initialPlan} />
      </TestBootProvider>,
    );

    return { replace };
  };

  it('lists only company pages and upgrades the one picked', async () => {
    mockGraphQL({
      request: {
        query: SQUAD_SUBSCRIPTION_QUERY,
        variables: { sourceId: acme.id },
      },
      result: { data: { squadSubscription: { plan: null } } },
    });
    const { replace } = renderCompanyStep([acme, community]);

    expect(
      await screen.findByText('Which page are you upgrading?'),
    ).toBeInTheDocument();
    expect(screen.queryByText('React friends')).not.toBeInTheDocument();

    const next = screen.getByRole('button', { name: /^continue$/i });
    await waitFor(() => expect(next).toBeEnabled());
    fireEvent.click(next);

    expect(await screen.findByText('Upgrade Acme')).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it('sends a founder without a company page to the free page form', () => {
    const { replace } = renderCompanyStep([community], 'team');

    expect(replace).toHaveBeenCalledWith(
      getCompanyPageCreateUrl({ plan: 'team' }),
    );
    expect(
      screen.queryByText('Which page are you upgrading?'),
    ).not.toBeInTheDocument();
  });
});

describe('StartupsCheckout linked from a squad', () => {
  const acme = {
    id: 'acme',
    name: 'Acme',
    handle: 'acme',
    flags: { company: true },
    currentMember: { role: SourceMemberRole.Admin },
  } as Squad;
  const globexId = 'globex';
  const globex = {
    id: globexId,
    name: 'Globex',
    handle: 'globex',
    flags: { company: true },
    currentMember: { role: SourceMemberRole.Admin },
  } as Squad;

  const mockSubscription = (plan: string | null) =>
    mockGraphQL({
      request: {
        query: SQUAD_SUBSCRIPTION_QUERY,
        variables: { sourceId: globexId },
      },
      result: {
        data: {
          squadSubscription: {
            plan,
            status: null,
            seatLimit: null,
            seatsUsed: 1,
            ownerId: null,
            cashbackPercentage: null,
            cashbackPromoEndsAt: null,
          },
        },
      },
    });

  const renderLinked = (initialSquadId: string, initialPlan?: string) => {
    const logEvent = jest.fn();

    render(
      <TestBootProvider
        client={new QueryClient()}
        auth={{ isLoggedIn: true, user: defaultUser, squads: [acme, globex] }}
        log={{ logEvent }}
      >
        <StartupsCheckout
          initialSquadId={initialSquadId}
          initialPlan={initialPlan}
        />
      </TestBootProvider>,
    );

    return { logEvent };
  };

  const viewedSteps = (logEvent: jest.Mock) =>
    logEvent.mock.calls
      .map(([event]) => event)
      .filter(
        ({ event_name: eventName }) =>
          eventName === LogEvent.ViewStartupsCheckout,
      )
      .map(({ target_id: targetId }) => targetId);

  it('goes straight to the plans for a page without a plan', async () => {
    mockSubscription(null);
    const { logEvent } = renderLinked(globexId);

    expect(await screen.findByText('Upgrade Globex')).toBeInTheDocument();
    expect(
      screen.queryByText('Which page are you upgrading?'),
    ).not.toBeInTheDocument();
    expect(viewedSteps(logEvent)).toEqual([StartupsCheckoutStep.Plan]);
  });

  it('keeps the plan the link picked', async () => {
    mockSubscription(null);
    renderLinked(globexId, 'team');

    await screen.findByText('Upgrade Globex');

    expect(
      screen.getByRole('radio', { name: /team/i, checked: true }),
    ).toBeInTheDocument();
  });

  it('asks which page when the page is already on a plan', async () => {
    mockSubscription('starter');
    renderLinked(globexId);

    expect(
      await screen.findByText('Which page are you upgrading?'),
    ).toBeInTheDocument();
    expect(screen.queryByText('Upgrade Globex')).not.toBeInTheDocument();
  });

  it('asks which page when the link is for a page they do not admin', async () => {
    renderLinked('someone-elses-squad');

    expect(
      await screen.findByText('Which page are you upgrading?'),
    ).toBeInTheDocument();
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
      {
        eventId: `startups-signup-${defaultUser.id}`,
        xEventId: STARTUPS_X_EVENTS.signup,
        email: defaultUser.email,
      },
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
