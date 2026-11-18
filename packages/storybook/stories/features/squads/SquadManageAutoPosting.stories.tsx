import type { ReactElement } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { graphql, HttpResponse } from 'msw';
import type {
  SourceMember,
  Squad,
} from '@dailydotdev/shared/src/graphql/sources';
import {
  SourceMemberRole,
  SourcePermissions,
} from '@dailydotdev/shared/src/graphql/sources';
import { SquadPageContextProvider } from '@dailydotdev/shared/src/features/squads/SquadPageContext';
import { SquadManagePage } from '@dailydotdev/shared/src/features/squads/components/manage/SquadManagePage';
import { SquadManageSection } from '@dailydotdev/shared/src/features/squads/lib/routes';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import defaultUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import { defaultBootData, getBootMock } from '../../../mock/boot';
import ExtensionProviders from '../../extension/_providers';
import { squad as data } from './data';

// Manage › Auto-posting per tier: the API comes with every daily.dev for
// Startups plan; RSS, YouTube and web pages are Enterprise, which also lists
// the sources connected to the squad.

const makeSquad = (id: string, features: Partial<Squad['features']>): Squad =>
  ({
    id: `manage-auto-posting-${id}`,
    handle: data.handle,
    name: data.name,
    image: data.image,
    type: 'squad',
    public: true,
    features,
    moderationPostCount: 0,
    currentMember: {
      role: SourceMemberRole.Admin,
      seat: Object.keys(features ?? {}).length > 0,
      permissions: Object.values(SourcePermissions),
    } as unknown as SourceMember,
  }) as unknown as Squad;

const Page = ({
  id,
  features,
  section = SquadManageSection.AutoPosting,
}: {
  id: string;
  features: Partial<Squad['features']>;
  section?: SquadManageSection;
}): ReactElement => (
  <SquadPageContextProvider squad={makeSquad(id, features)} isViewerReady>
    <SquadManagePage section={section} />
  </SquadPageContextProvider>
);

const feedsHandler = (urls: string[]) =>
  graphql.query('SquadAutoPostingFeeds', () =>
    HttpResponse.json({
      data: { squadAutoPostingFeeds: urls.map((url) => ({ url })) },
    }),
  );

const WhenUser = ({ children }: { children: ReactElement }) => {
  const { user } = useAuthContext();

  return user ? children : null;
};

const meta: Meta = {
  title: 'Features/Squads/Manage auto-posting per tier',
  parameters: { layout: 'fullscreen' },
  beforeEach: () => {
    getBootMock.mockReturnValue({
      ...defaultBootData,
      user: defaultUser,
      squads: [],
      accessToken: { token: '1', expiresIn: '1' },
      visit: { sessionId: '1', visitId: '1' },
      feeds: [],
    } as ReturnType<typeof getBootMock>);
  },
  decorators: [
    (Story) => (
      <ExtensionProviders>
        <WhenUser>
          <Story />
        </WhenUser>
      </ExtensionProviders>
    ),
  ],
};

export default meta;

type Story = StoryObj;

// What every daily.dev for Startups plan turns on that the app reads
const base = { links: true, products: true };

// No plan: the section is locked in the menu and leads to Subscription
export const Free: Story = {
  render: () => (
    <Page id="free" features={{}} section={SquadManageSection.Details} />
  ),
};

export const StartupsStarter: Story = {
  render: () => <Page id="starter" features={base} />,
};

const enterprise = {
  ...base,
  cta: true,
  verified: true,
  adFree: true,
  jobs: true,
};

export const Enterprise: Story = {
  parameters: {
    msw: {
      handlers: [
        feedsHandler([
          'https://www.coderabbit.ai/blog/rss.xml',
          'https://www.youtube.com/@coderabbitai',
          'https://www.coderabbit.ai/changelog',
        ]),
      ],
    },
  },
  render: () => <Page id="enterprise" features={enterprise} />,
};

export const EnterpriseNothingConnected: Story = {
  parameters: { msw: { handlers: [feedsHandler([])] } },
  render: () => <Page id="enterprise-empty" features={enterprise} />,
};
