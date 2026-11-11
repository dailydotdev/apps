import type { ReactElement } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { delay, http, HttpResponse } from 'msw';
import { useQueryClient } from '@tanstack/react-query';
import { userEvent, waitFor, within } from 'storybook/test';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import Toast from '@dailydotdev/shared/src/components/notifications/Toast';
import { SquadPageContextProvider } from '@dailydotdev/shared/src/features/squads/SquadPageContext';
import { SquadManageLayout } from '@dailydotdev/shared/src/features/squads/components/manage/SquadManageLayout';
import { SquadManagePlan } from '@dailydotdev/shared/src/features/squads/components/manage/SquadManagePlan';
import {
  StartupsCheckout,
  StartupsCheckoutStep,
} from '@dailydotdev/shared/src/features/squads/components/checkout/StartupsCheckout';
import {
  StartupsSetup,
  StartupsSetupPath,
} from '@dailydotdev/shared/src/features/squads/components/setup/StartupsSetup';
import { squadProductsQueryOptions } from '@dailydotdev/shared/src/graphql/squadProducts';
import { squadBrandingQueryOptions } from '@dailydotdev/shared/src/graphql/squadBranding';
import type {
  SquadSeatMember,
  SquadSubscription,
} from '@dailydotdev/shared/src/graphql/squadSubscription';
import type { Squad } from '@dailydotdev/shared/src/graphql/sources';
import { SourceMemberRole } from '@dailydotdev/shared/src/graphql/sources';
import { SquadManageSection } from '@dailydotdev/shared/src/features/squads/lib/routes';
import { SquadPlan } from '@dailydotdev/shared/src/features/squads/lib/plans';
import { Origin } from '@dailydotdev/shared/src/lib/log';
import { defaultBootData, getBootMock } from '../../mock/boot';
import ExtensionProviders from '../extension/_providers';
import {
  acme,
  acmeTeam,
  asModerator,
  noPlan,
  owner,
  person,
  Seeded,
  starter,
  team,
  teamPlan,
} from './seed';

// The states of today's checkout that had no story, from the map in this folder.
// They render the real components as merged. Only the API is mocked.

import { UpsellOnPage } from '../startups-onboarding/upsellPage';

const meta: Meta = {
  title: 'Startups Playgrounds/Today, remaining states',
  tags: ['!dev'],
  parameters: { layout: 'fullscreen' },
  globals: { theme: 'dark' },
  decorators: [
    (Story) => (
      <ExtensionProviders>
        <div className="min-h-screen bg-background-default">
          <Story />
          <Toast autoDismissNotifications={false} />
        </div>
      </ExtensionProviders>
    ),
  ],
};

export default meta;

type Story = StoryObj;
type Canvas = ReturnType<typeof within>;

const bootWithSquad = (): void => {
  getBootMock.mockReturnValue({
    ...defaultBootData,
    squads: [acme],
    accessToken: { token: '1', expiresIn: '1' },
    visit: { sessionId: '1', visitId: '1' },
    feeds: [],
  });
};

const typeName = async (): Promise<void> => {
  const input = await waitFor(() => {
    const field =
      document.querySelector<HTMLInputElement>('input[name="name"]');

    if (!field) {
      throw new Error('No name field yet');
    }

    return field;
  });

  await userEvent.type(input, 'Acme');
};

const submitName = async (canvas: Canvas): Promise<void> => {
  await typeName();
  await userEvent.click(
    await canvas.findByRole('button', { name: /create and continue/i }),
  );
};

export const UpsellFull: Story = {
  name: 'H1b. Upsell, the entire squad page',
  render: () => <UpsellOnPage isToday />,
};

export const CompanyTyped: Story = {
  name: 'B2. Name typed',
  render: () => <StartupsCheckout />,
  play: typeName,
};

export const CompanyBusy: Story = {
  name: 'B2. Creating the page',
  parameters: {
    msw: {
      handlers: [
        http.post('*/graphql', async () => {
          await delay('infinite');
          return HttpResponse.json({});
        }),
      ],
    },
  },
  render: () => <StartupsCheckout />,
  play: ({ canvasElement }) => submitName(within(canvasElement)),
};

export const CompanyFailed: Story = {
  name: 'B6. Creating the page failed',
  parameters: {
    msw: {
      handlers: [
        http.post('*/graphql', async ({ request }) => {
          const { query } = (await request.clone().json()) as { query: string };

          return query.includes('mutation')
            ? HttpResponse.json({ errors: [{ message: 'Failed' }] })
            : HttpResponse.json({ data: { sourceHandleExists: false } });
        }),
      ],
    },
  },
  render: () => <StartupsCheckout />,
  play: ({ canvasElement }) => submitName(within(canvasElement)),
};

const hangingApi = {
  msw: {
    handlers: [
      http.post('*/graphql', async () => {
        await delay('infinite');
        return HttpResponse.json({});
      }),
    ],
  },
};

const failingApi = {
  msw: {
    handlers: [
      http.post('*/graphql', () =>
        HttpResponse.json({ errors: [{ message: 'Failed' }] }),
      ),
    ],
  },
};

export const CheckingSquad: Story = {
  name: 'B3. Checking the selected squad',
  beforeEach: bootWithSquad,
  parameters: hangingApi,
  render: () => <StartupsCheckout initialSquadId={acme.id} />,
};

const LONG_NAME = 'Acme Developer Infrastructure Platform International';

export const CompanyLongName: Story = {
  name: 'B2. Long company name',
  render: () => <StartupsCheckout />,
  play: async () => {
    await typeName();
    const field =
      document.querySelector<HTMLInputElement>('input[name="name"]');

    if (field) {
      await userEvent.type(field, ` ${LONG_NAME}`);
    }
  },
};

export const PlanLongName: Story = {
  name: 'C3. Long company name',
  render: () => (
    <StartupsCheckout
      initialStep={StartupsCheckoutStep.Plan}
      initialCompany={{ ...acme, name: LONG_NAME } as never}
      initialPlan={SquadPlan.Starter}
    />
  ),
};

export const PaymentTeam: Story = {
  name: 'D1. Payment on Team',
  render: () => (
    <StartupsCheckout
      initialStep={StartupsCheckoutStep.Checkout}
      initialCompany={acme as never}
      initialPlan={SquadPlan.Team}
    />
  ),
};

export const PlanActivePageLoading: Story = {
  name: 'E5. Plan active, page still loading',
  parameters: hangingApi,
  render: () => (
    <Seeded squad={acme} subscription={starter}>
      <StartupsCheckout
        initialStep={StartupsCheckoutStep.Done}
        initialCompany={{ ...acme, handle: 'not_seeded' } as never}
        initialPlan={SquadPlan.Starter}
      />
    </Seeded>
  ),
};

export const CreateNewSelected: Story = {
  name: 'B4. Squad list, Create new selected',
  beforeEach: bootWithSquad,
  render: () => (
    <Seeded squad={acme} subscription={noPlan}>
      <StartupsCheckout initialSquadId={acme.id} />
    </Seeded>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(
      await within(canvasElement).findByRole('radio', {
        name: /create a new company page/i,
      }),
    );
  },
};

export const AlreadyOnPlan: Story = {
  name: 'B5. Selected squad already on a plan',
  beforeEach: bootWithSquad,
  render: () => (
    <Seeded squad={acme} subscription={starter}>
      <StartupsCheckout initialSquadId={acme.id} />
    </Seeded>
  ),
};

export const PlanStarter: Story = {
  name: 'C2. Starter preselected',
  render: () => (
    <StartupsCheckout
      initialStep={StartupsCheckoutStep.Plan}
      initialCompany={acme as never}
      initialPlan={SquadPlan.Starter}
    />
  ),
};

export const Slow: Story = {
  name: 'E2. Payment received, taking longer',
  // The real wait is 60 seconds, so the story shortens it.
  beforeEach: () => {
    const original = window.setTimeout;

    window.setTimeout = ((handler: TimerHandler, ms?: number) =>
      original(
        handler,
        ms && ms > 30000 ? 500 : ms,
      )) as typeof window.setTimeout;

    return () => {
      window.setTimeout = original;
    };
  },
  render: () => (
    <Seeded squad={acme} subscription={noPlan}>
      <StartupsCheckout
        initialStep={StartupsCheckoutStep.Done}
        initialCompany={acme as never}
        initialPlan={SquadPlan.Starter}
      />
    </Seeded>
  ),
};

const SetupPreview = ({
  squad,
  plan,
  subscription,
  path,
  hasEverything,
}: {
  squad: Squad;
  plan: SquadPlan;
  subscription: SquadSubscription;
  path: StartupsSetupPath;
  hasEverything?: boolean;
}): ReactElement => {
  const client = useQueryClient();
  const { user } = useAuthContext();

  [undefined, user].forEach((who) => {
    [
      [
        squadProductsQueryOptions({ squad, user: who }).queryKey,
        hasEverything ? [{ id: 'product' }] : [],
      ],
      [
        squadBrandingQueryOptions({ squad, user: who }).queryKey,
        { color: null, button: hasEverything ? { enabled: true } : null },
      ],
    ].forEach(([queryKey, data]) => {
      client.setQueryData(queryKey as readonly unknown[], data);
      client.setQueryDefaults(queryKey as readonly unknown[], {
        staleTime: Infinity,
      });
    });
  });

  return (
    <Seeded squad={squad} subscription={subscription}>
      <div className="mx-auto flex max-w-[40rem] flex-col p-4 tablet:p-6">
        <StartupsSetup
          squad={squad}
          plan={plan}
          origin={Origin.StartupsCheckout}
          initialPath={path}
        />
      </div>
    </Seeded>
  );
};

export const SetupAgent: Story = {
  name: 'F1. Agent path',
  render: () => (
    <SetupPreview
      squad={acmeTeam}
      plan={SquadPlan.Team}
      subscription={teamPlan}
      path={StartupsSetupPath.Agent}
    />
  ),
};

export const SetupStarter: Story = {
  name: 'F3. Checklist on Starter',
  render: () => (
    <SetupPreview
      squad={acme}
      plan={SquadPlan.Starter}
      subscription={starter}
      path={StartupsSetupPath.Manual}
    />
  ),
};

export const SetupDone: Story = {
  name: 'F4. Checklist fully done',
  render: () => (
    <SetupPreview
      squad={acmeTeam}
      plan={SquadPlan.Team}
      subscription={teamPlan}
      path={StartupsSetupPath.Manual}
      hasEverything
    />
  ),
};

const pickClient =
  (name: RegExp) =>
  async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    await userEvent.click(
      await within(canvasElement).findByRole('tab', { name }),
    );
  };

const agentOnTeam = (
  <SetupPreview
    squad={acmeTeam}
    plan={SquadPlan.Team}
    subscription={teamPlan}
    path={StartupsSetupPath.Agent}
  />
);

export const SetupCursor: Story = {
  name: 'F1. Agent path, Cursor',
  render: () => agentOnTeam,
  play: pickClient(/^cursor$/i),
};

export const SetupCodex: Story = {
  name: 'F1. Agent path, Codex',
  render: () => agentOnTeam,
  play: pickClient(/^codex$/i),
};

export const SetupOther: Story = {
  name: 'F1. Agent path, any other client',
  render: () => agentOnTeam,
  play: pickClient(/^other$/i),
};

export const SetupAgentStarter: Story = {
  name: 'F1. Agent path, Starter prompt',
  render: () => (
    <SetupPreview
      squad={acme}
      plan={SquadPlan.Starter}
      subscription={starter}
      path={StartupsSetupPath.Agent}
    />
  ),
};

const ManagePlan = ({
  squad = acme,
  subscription,
  members,
}: {
  squad?: Squad;
  subscription: SquadSubscription;
  members?: SquadSeatMember[];
}): ReactElement => (
  <Seeded squad={squad} subscription={subscription} members={members}>
    <SquadManageLayout section={SquadManageSection.Plan}>
      <SquadManagePlan />
    </SquadManageLayout>
  </Seeded>
);

const paidByMaya: SquadSubscription = { ...teamPlan, ownerId: 'maya' };

const ManageUnseeded = (): ReactElement => (
  <SquadPageContextProvider squad={acme} isViewerReady>
    <SquadManageLayout section={SquadManageSection.Plan}>
      <SquadManagePlan />
    </SquadManageLayout>
  </SquadPageContextProvider>
);

export const ManageLoading: Story = {
  name: 'G0. Plan still loading',
  parameters: hangingApi,
  render: () => <ManageUnseeded />,
};

export const ManageLookupFailed: Story = {
  name: 'G0. Plan lookup failed',
  parameters: failingApi,
  render: () => <ManageUnseeded />,
};

export const ManageStarterOtherAdmin: Story = {
  name: 'G3. Starter, another admin',
  render: () => <ManagePlan subscription={{ ...starter, ownerId: 'maya' }} />,
};

export const ManageStarterModerator: Story = {
  name: 'G3. Starter, moderator',
  render: () => (
    <ManagePlan
      squad={asModerator(acme)}
      subscription={{ ...starter, ownerId: 'maya' }}
    />
  ),
};

export const ManageTeamAlone: Story = {
  name: 'G4. Team, no teammates yet',
  render: () => (
    <ManagePlan
      squad={acmeTeam}
      subscription={{ ...teamPlan, seatsUsed: 1 }}
      members={[owner]}
    />
  ),
};

export const ManageZeroWallet: Story = {
  name: 'G3. Just bought, no cashback yet',
  render: () => (
    <Seeded squad={acme} subscription={starter} balance={0}>
      <SquadManageLayout section={SquadManageSection.Plan}>
        <SquadManagePlan />
      </SquadManageLayout>
    </Seeded>
  ),
};

export const ManageOtherAdmin: Story = {
  name: 'G5. Team, another admin',
  render: () => <ManagePlan squad={acmeTeam} subscription={paidByMaya} />,
};

export const ManageModerator: Story = {
  name: 'G6. Team, moderator',
  render: () => (
    <ManagePlan squad={asModerator(acmeTeam)} subscription={paidByMaya} />
  ),
};

const fullTeam: SquadSeatMember[] = [
  owner,
  person('maya', 'Maya Levi', SourceMemberRole.Admin, true),
  person('jonas', 'Jonas Berg', SourceMemberRole.Moderator, true),
  person('priya', 'Priya Nair', SourceMemberRole.Moderator, true),
  person('sam', 'Sam Ortiz', SourceMemberRole.Moderator, true),
  person('lee', 'Lee Park', SourceMemberRole.Moderator, false),
];

export const ManageFull: Story = {
  name: 'G7. Team full, Give seat disabled',
  render: () => (
    <ManagePlan
      squad={acmeTeam}
      subscription={{ ...teamPlan, seatsUsed: 5 }}
      members={fullTeam}
    />
  ),
};

const giveSeat = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const [button] = await within(canvasElement).findAllByRole('button', {
    name: /give seat/i,
  });

  await userEvent.click(button);
};

export const SeatChanging: Story = {
  name: 'G8. Seat change in progress',
  parameters: {
    msw: {
      handlers: [
        http.post('*/graphql', async () => {
          await delay('infinite');
          return HttpResponse.json({});
        }),
      ],
    },
  },
  render: () => (
    <ManagePlan squad={acmeTeam} subscription={teamPlan} members={team} />
  ),
  play: giveSeat,
};

export const SeatFailed: Story = {
  name: 'G8. Seat change failed',
  parameters: {
    msw: {
      handlers: [
        http.post('*/graphql', () =>
          HttpResponse.json({
            errors: [{ message: 'All seats of the plan are taken' }],
          }),
        ),
      ],
    },
  },
  render: () => (
    <ManagePlan squad={acmeTeam} subscription={teamPlan} members={team} />
  ),
  play: giveSeat,
};
