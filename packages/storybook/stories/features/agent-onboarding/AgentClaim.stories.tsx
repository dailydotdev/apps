import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AgentClaim } from '@dailydotdev/shared/src/features/agentOnboarding/components/AgentClaim';
import ExtensionProviders, {
  bootAsAnonymous,
} from '../../extension/_providers';

// The claim page reads the claim from the API by its code. Stub that one call
// so each story shows a fixed claim.
const stubClaim = (claim: Record<string, unknown>) => () => {
  const realFetch = window.fetch;
  window.fetch = ((input: RequestInfo | URL, init?: RequestInit) =>
    String(input).includes('/agents/v1/claim')
      ? Promise.resolve(
          new Response(JSON.stringify(claim), {
            headers: { 'Content-Type': 'application/json' },
          }),
        )
      : realFetch(input, init)) as typeof window.fetch;

  return () => {
    window.fetch = realFetch;
  };
};

const meta: Meta<typeof AgentClaim> = {
  title: 'Features/Agent onboarding/Claim page',
  component: AgentClaim,
  args: { code: 'abc' },
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <ExtensionProviders>
        <Story />
      </ExtensionProviders>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof AgentClaim>;

const pending = {
  status: 'pending',
  userCode: 'K7Q-2MX',
  client: 'claude-code',
};

export const SignUp: Story = {
  beforeEach: () => {
    bootAsAnonymous();
    return stubClaim(pending)();
  },
};

export const CompanyPageSignUp: Story = {
  beforeEach: () => {
    bootAsAnonymous();
    return stubClaim({ ...pending, intent: 'company' })();
  },
};

export const CompanyPageClaimed: Story = {
  beforeEach: stubClaim({ status: 'claimed', intent: 'company' }),
};
