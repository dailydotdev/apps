import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SquadPlan } from '@dailydotdev/shared/src/features/squads/lib/plans';
import { AgentClient } from '@dailydotdev/shared/src/features/squads/lib/setup';
import { bootAsAnonymous } from '../extension/_providers';
import { Providers } from './providers';
import {
  AccountScreen,
  AccountView,
  everythingDone,
  ActivatingScreen,
  CompanyScreen,
  PaddleState,
  PlanScreen,
  SetupPath,
  SetupScreen,
} from './screens';

const meta: Meta = {
  title: 'Startups Onboarding/2. Screens',
  tags: ['!dev'],
  parameters: { layout: 'fullscreen' },
  globals: { theme: 'dark' },
  decorators: [
    (Story) => (
      <Providers>
        <Story />
      </Providers>
    ),
  ],
};

export default meta;

type Story = StoryObj;

const anonymous = { beforeEach: bootAsAnonymous };

export const Account: Story = {
  ...anonymous,
  name: '1a. Account, options',
  render: () => <AccountScreen />,
};

export const AccountEmail: Story = {
  ...anonymous,
  name: '1b. Account, email',
  render: () => <AccountScreen initialView={AccountView.Email} />,
};

export const AccountCode: Story = {
  ...anonymous,
  name: '1c. Account, email code',
  render: () => <AccountScreen initialView={AccountView.Code} />,
};

export const LogIn: Story = {
  ...anonymous,
  name: '1d. Log in',
  render: () => <AccountScreen initialView={AccountView.LogIn} />,
};

export const LogInEmail: Story = {
  ...anonymous,
  name: '1n. Log in with email',
  render: () => <AccountScreen initialView={AccountView.LogInEmail} />,
};

export const AccountEmailTaken: Story = {
  ...anonymous,
  name: '1e. Email already has an account',
  render: () => (
    <AccountScreen
      initialView={AccountView.Email}
      emailError="You already have an account with this email. Log in instead."
    />
  ),
};

export const AccountCodeWrong: Story = {
  ...anonymous,
  name: '1f. Wrong code',
  render: () => (
    <AccountScreen
      initialView={AccountView.Code}
      codeError="That code didn't match. Check it and try again."
    />
  ),
};

export const LogInWrong: Story = {
  ...anonymous,
  name: '1g. Wrong password',
  render: () => (
    <AccountScreen
      initialView={AccountView.LogInEmail}
      logInError="That email and password don't match."
    />
  ),
};

export const Reset: Story = {
  ...anonymous,
  name: '1h. Reset password',
  render: () => <AccountScreen initialView={AccountView.Reset} />,
};

export const ResetSent: Story = {
  ...anonymous,
  name: '1i. Reset link sent',
  render: () => <AccountScreen initialView={AccountView.ResetSent} />,
};

export const AccountTeam: Story = {
  ...anonymous,
  name: '1m. Came from the Team plan card',
  render: () => <AccountScreen />,
};

export const SocialBusy: Story = {
  ...anonymous,
  name: '1j. Social sign-up in progress',
  render: () => <AccountScreen socialBusy />,
};

export const SocialFailed: Story = {
  ...anonymous,
  name: '1k. Social sign-up failed',
  render: () => (
    <AccountScreen socialError="GitHub didn't finish signing you in. Try again, or use another option." />
  ),
};

export const AccountMissing: Story = {
  ...anonymous,
  name: '1l. Missing fields',
  render: () => (
    <AccountScreen
      initialView={AccountView.Email}
      nameError="Add your name so your team recognises you."
    />
  ),
};

export const Company: Story = {
  name: '2a. Company page, new',
  render: () => <CompanyScreen initialName="Acme" />,
};

export const CompanyPick: Story = {
  name: '2b. Company page, pick one',
  render: () => (
    <CompanyScreen
      existing={[
        { name: 'Acme', handle: 'acme', image: '/squad-page/acme-logo.svg' },
        {
          name: 'Acme Labs',
          handle: 'acme_labs',
          image: '/startups-onboarding/acme-labs-logo.svg',
        },
      ]}
    />
  ),
};

export const CompanyPickNew: Story = {
  name: '2f. Company page, creating a new one',
  render: () => (
    <CompanyScreen
      isCreatingNew
      initialName="Acme Cloud"
      existing={[
        { name: 'Acme', handle: 'acme', image: '/squad-page/acme-logo.svg' },
        {
          name: 'Acme Labs',
          handle: 'acme_labs',
          image: '/startups-onboarding/acme-labs-logo.svg',
        },
      ]}
    />
  ),
};

export const CompanyChecking: Story = {
  name: '2c. Checking the selected page',
  render: () => (
    <CompanyScreen
      isChecking
      existing={[
        { name: 'Acme', handle: 'acme', image: '/squad-page/acme-logo.svg' },
      ]}
    />
  ),
};

const LONG_NAME = 'Acme Developer Infrastructure Platform International';

export const CompanyMixed: Story = {
  name: '2e. Several pages, one already on a plan',
  render: () => (
    <CompanyScreen
      existing={[
        { name: 'Acme', handle: 'acme', image: '/squad-page/acme-logo.svg' },
        {
          name: 'Acme Labs',
          handle: 'acme_labs',
          planTitle: 'Starter',
          image: '/startups-onboarding/acme-labs-logo.svg',
        },
      ]}
    />
  ),
};

export const CompanyLong: Story = {
  name: '2d. Long company name',
  render: () => <CompanyScreen initialName={LONG_NAME} />,
};

export const PlanDiscount: Story = {
  name: '3e. Discount applied',
  render: () => <PlanScreen discount />,
};

export const PlanLong: Story = {
  name: '3d. Long company name',
  render: () => <PlanScreen company={LONG_NAME} />,
};

export const PlanPayLoading: Story = {
  name: '3f. Payment form loading',
  render: () => <PlanScreen paddleState={PaddleState.Loading} />,
};

export const Plan: Story = {
  name: '3a. Plan and payment',
  render: () => <PlanScreen />,
};

export const PlanTeam: Story = {
  name: '3b. Plan and payment, Team',
  render: () => <PlanScreen initialPlan={SquadPlan.Team} />,
};

export const PlanPhonePay: Story = {
  name: '3c. Payment, the second phone screen',
  render: () => <PlanScreen isPhonePaying />,
};

export const Activating: Story = {
  name: '4a. Setting up',
  render: () => <ActivatingScreen isStill />,
};

const half = { details: true, links: true };

export const SetupCursor: Story = {
  name: '4g. Agent path, Cursor',
  render: () => <SetupScreen initialClient={AgentClient.Cursor} />,
};

export const SetupCodex: Story = {
  name: '4h. Agent path, Codex',
  render: () => <SetupScreen initialClient={AgentClient.Codex} />,
};

export const SetupVsCode: Story = {
  name: '4i. Agent path, VS Code',
  render: () => <SetupScreen initialClient={AgentClient.VSCode} />,
};

export const SetupOther: Story = {
  name: '4j. Agent path, any other client',
  render: () => <SetupScreen initialClient={AgentClient.Other} />,
};

export const SetupManualTeam: Story = {
  name: '4k. Do it yourself, Team, half done',
  render: () => (
    <SetupScreen
      plan={SquadPlan.Team}
      initialPath={SetupPath.Manual}
      done={half}
    />
  ),
};

export const SetupManualDone: Story = {
  name: '4l. Do it yourself, all done',
  render: () => (
    <SetupScreen
      plan={SquadPlan.Team}
      initialPath={SetupPath.Manual}
      done={everythingDone}
    />
  ),
};

export const SetupLoading: Story = {
  name: '4f. Plan on, page still loading',
  render: () => <SetupScreen isLoading />,
};

export const Setup: Story = {
  name: '4b. Set up with your agent',
  render: () => <SetupScreen />,
};

export const SetupTeam: Story = {
  name: '4c. Set up with your agent, Team',
  render: () => <SetupScreen plan={SquadPlan.Team} />,
};

export const SetupManual: Story = {
  name: '4d. Set it up yourself',
  render: () => <SetupScreen initialPath={SetupPath.Manual} />,
};

export const SetupChecking: Story = {
  name: '4m. Do it yourself, checking what is done',
  render: () => (
    <SetupScreen
      plan={SquadPlan.Team}
      initialPath={SetupPath.Manual}
      isChecking
    />
  ),
};

export const SetupFinished: Story = {
  name: '4e. Finished',
  render: () => <SetupScreen isFinished />,
};
