import React from 'react';
import type { ReactElement } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { graphql, http, HttpResponse } from 'msw';
import { CompanyPageCreate } from '@dailydotdev/shared/src/features/squads/components/companyPage/CompanyPageCreate';
import { CompanyPageWebsiteStep } from '@dailydotdev/shared/src/features/squads/components/companyPage/CompanyPageWebsiteStep';
import { CompanyPageBuilding } from '@dailydotdev/shared/src/features/squads/components/companyPage/CompanyPageBuilding';
import { AccountStep } from '@dailydotdev/shared/src/features/squads/components/checkout/StartupsCheckout';
import { AuthTriggers } from '@dailydotdev/shared/src/lib/auth';
import { useState } from 'react';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import defaultUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import { defaultBootData, getBootMock } from '../../../mock/boot';
import ExtensionProviders, {
  bootAsAnonymous,
} from '../../extension/_providers';

// Mocks of the website-first company page funnel: one box for the website,
// sign-up while the site is read, a wait screen, and the form as a fallback.

const categories = ['DevTools', 'AI', 'Web', 'DevOps', 'Data'].map(
  (title, index) => ({
    node: { id: `category-${index}`, title, enabled: true, sources: 0 },
  }),
);

const handlers = [
  graphql.query('SourceCategories', () =>
    HttpResponse.json({
      data: {
        categories: {
          edges: categories,
          pageInfo: { hasNextPage: false, endCursor: null },
        },
      },
    }),
  ),
  // The session can't reach the CDN, so images get a plain stand-in
  http.get('https://media.daily.dev/*', () =>
    HttpResponse.text(
      '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" fill="#2d323b"/></svg>',
      { headers: { 'Content-Type': 'image/svg+xml' } },
    ),
  ),
  graphql.query('CompletedUserActions', () =>
    HttpResponse.json({ data: { actions: [] } }),
  ),
];

const bootAsUser = (): void => {
  getBootMock.mockReturnValue({
    ...defaultBootData,
    user: defaultUser,
    squads: [],
    accessToken: { token: '1', expiresIn: '1' },
    visit: { sessionId: '1', visitId: '1' },
    feeds: [],
  } as ReturnType<typeof getBootMock>);
};

const WhenBooted = ({ children }: { children: ReactElement }) => {
  const { isAuthReady } = useAuthContext();

  return isAuthReady ? children : null;
};

const noop = () => undefined;

const meta: Meta = {
  title: 'Features/Squads/Company page from website',
  parameters: { layout: 'fullscreen', msw: { handlers } },
  globals: { theme: 'dark' },
  beforeEach: bootAsAnonymous,
  decorators: [
    (Story) => (
      <ExtensionProviders>
        <div id="__next" className="min-h-screen bg-background-default">
          <WhenBooted>
            <Story />
          </WhenBooted>
        </div>
      </ExtensionProviders>
    ),
  ],
};

export default meta;

type Story = StoryObj;

const phone = {
  theme: 'dark',
  viewport: { value: 'mobile2', isRotated: false },
};

const WebsiteStep = ({ initial = '' }: { initial?: string }) => {
  const [website, setWebsite] = useState(initial);

  return (
    <CompanyPageWebsiteStep
      website={website}
      onWebsiteChange={setWebsite}
      onSubmit={noop}
      onFillManually={noop}
    />
  );
};

export const Website: Story = {
  name: '1. Website box',
  render: () => <WebsiteStep />,
};

export const WebsiteTyped: Story = {
  name: '1. Website box, typed',
  render: () => <WebsiteStep initial="acme.dev" />,
};

export const WebsitePhone: Story = {
  ...WebsiteTyped,
  name: '1. Website box, phone',
  globals: phone,
};

export const SignUp: Story = {
  name: '2. Sign up while we read the site',
  render: () => (
    <AccountStep
      trigger={AuthTriggers.CompanyPage}
      signUpTitle="Your page is on its way"
      signUpDescription="Sign up while we pull your logo and description from acme.dev."
      logInDescription="Log in while we pull your logo and description from acme.dev."
    />
  ),
};

export const SignUpPhone: Story = {
  ...SignUp,
  name: '2. Sign up, phone',
  globals: phone,
};

export const Building: Story = {
  name: '3. Building the page',
  beforeEach: bootAsUser,
  render: () => <CompanyPageBuilding website="https://acme.dev" />,
};

export const BuildingPhone: Story = {
  ...Building,
  name: '3. Building the page, phone',
  globals: phone,
};

export const Fallback: Story = {
  name: '4. Form fallback',
  beforeEach: bootAsUser,
  render: () => (
    <CompanyPageCreate
      prefill={{ name: 'Acme', handle: 'acme', website: 'https://acme.dev' }}
    />
  ),
};

export const FallbackPhone: Story = {
  ...Fallback,
  name: '4. Form fallback, phone',
  globals: phone,
};
