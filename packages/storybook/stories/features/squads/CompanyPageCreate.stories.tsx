import React from 'react';
import type { ReactElement } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { graphql, http, HttpResponse } from 'msw';
import NewSquadModal from '@dailydotdev/shared/src/components/modals/squads/NewSquadModal';
import { CompanyPageCreate } from '@dailydotdev/shared/src/features/squads/components/companyPage/CompanyPageCreate';
import { ManageSquadPageContainer } from '@dailydotdev/shared/src/components/squads/utils';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import defaultUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import { featureCompanyPageCreation } from '@dailydotdev/shared/src/lib/featureManagement';
import { defaultBootData, getBootMock } from '../../../mock/boot';
import { FeatureOverrides } from '../../../mock/GrowthBookProvider';
import ExtensionProviders, {
  bootAsAnonymous,
} from '../../extension/_providers';

// The free company page path: the new squad modal's company page card, and the
// company page form at /squads/new?company=1, signed in and signed out.

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
  title: 'Features/Squads/Company page creation',
  parameters: { layout: 'fullscreen', msw: { handlers } },
  globals: { theme: 'dark' },
  beforeEach: bootAsUser,
  decorators: [
    (Story) => (
      <ExtensionProviders>
        <div id="__next" className="min-h-screen bg-background-default">
          <FeatureOverrides values={{ [featureCompanyPageCreation.id]: true }}>
            <WhenBooted>
              <Story />
            </WhenBooted>
          </FeatureOverrides>
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

export const Modal: Story = {
  name: '1. New squad modal',
  render: () => <NewSquadModal isOpen onRequestClose={noop} />,
};

export const ModalPhone: Story = {
  ...Modal,
  name: '1. New squad modal, phone',
  globals: phone,
};

const Form = () => (
  <ManageSquadPageContainer>
    <CompanyPageCreate />
  </ManageSquadPageContainer>
);

export const CompanyForm: Story = {
  name: '2. Company page form',
  render: () => <Form />,
};

export const CompanyFormPhone: Story = {
  ...CompanyForm,
  name: '2. Company page form, phone',
  globals: phone,
};

export const SignUp: Story = {
  name: '3. Company page form, signed out',
  beforeEach: bootAsAnonymous,
  render: () => <Form />,
};
