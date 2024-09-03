import type { Meta, StoryObj } from '@storybook/react';
import { SquadDirectoryLayout } from '@dailydotdev/shared/src/components/squads/layout/SquadDirectoryLayout';
import ExtensionProviders from '../extension/_providers';
import { useRouter } from '../../mock/next-router';
import { http, HttpResponse } from 'msw';
import loggedUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import { generateTestSquad } from '@dailydotdev/shared/__tests__/fixture/squads';
import { settingsContext } from '@dailydotdev/shared/__tests__/helpers/boot';
import { Boot } from '@dailydotdev/shared/src/lib/boot';
import settings from '@dailydotdev/shared/__tests__/fixture/settings';

const meta: Meta<typeof SquadDirectoryLayout> = {
  title: 'Pages/SquadDirectoryLayout',
  component: SquadDirectoryLayout,
  parameters: {
    controls: {
      expanded: true,
    },
    msw: {
      handlers: [
        http.get('/undefined/boot', () => {
          return HttpResponse.json<Partial<Boot>>({
            accessToken: {
              expiresIn: new Date().toString(),
              token: 'string',
            },
            user: loggedUser,
            squads: Array.from({ length: 10 }, () => generateTestSquad()),
            alerts: {
              filter: false,
              rankLastSeen: new Date(),
              companionHelper: true,
              squadTour: true,
              showGenericReferral: false,
              lastChangelog: '2023-12-27T09:21:13.659Z',
              lastBanner: '2023-08-21T13:55:07.126Z',
              showStreakMilestone: true,
              showRecoverStreak: false,
              changelog: false,
              banner: false,
              bootPopup: true,
              shouldShowFeedFeedback: true,
            },
            exp: {
              a: [],
              e: [],
              f: '{}',
            },
          });
        }),
      ],
    },
  },
  beforeEach: async () => {
    useRouter.mockReturnValue({
      pathname: '/squads',
    });
  },
  render: (args) => (
    <ExtensionProviders>
      <SquadDirectoryLayout {...args}>
        <div>Content</div>
      </SquadDirectoryLayout>
    </ExtensionProviders>
  ),
};

export default meta;

type Story = StoryObj<typeof SquadDirectoryLayout>;

export const Default: Story = {
  args: {},
};
