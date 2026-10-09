import React from 'react';
import nock from 'nock';
import { QueryClient } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestBootProvider } from '../../../../../__tests__/helpers/boot';
import {
  completeActionMock,
  mockGraphQL,
} from '../../../../../__tests__/helpers/graphql';
import loggedUser from '../../../../../__tests__/fixture/loggedUser';
import { generateTestSquad } from '../../../../../__tests__/fixture/squads';
import { ActionType } from '../../../../graphql/actions';
import type { Squad } from '../../../../graphql/sources';
import { SourceMemberRole } from '../../../../graphql/sources';
import {
  LEAVE_SQUAD_MUTATION,
  SQUAD_JOIN_MUTATION,
} from '../../../../graphql/squads';
import {
  getFlatteredSources,
  useSources,
} from '../../../../hooks/source/useSources';
import type { ToastNotification } from '../../../../hooks/useToastNotification';
import { TOAST_NOTIF_KEY } from '../../../../hooks/useToastNotification';
import { generateQueryKey, RequestKey } from '../../../../lib/query';
import { popularSquadsQuery } from './common';
import { SquadJoinButton } from './SquadJoinButton';

const squad = generateTestSquad({ currentMember: undefined, membersCount: 80 });
const showLogin = jest.fn();

// The button reads membership from the directory list it sits in.
const Directory = () => {
  const { result } = useSources<Squad>({ query: popularSquadsQuery });

  return (
    <>
      {getFlatteredSources(result).map((item) => (
        <div key={item.id}>
          <span>{item.membersCount} members</span>
          <SquadJoinButton squad={item} />
        </div>
      ))}
    </>
  );
};

const renderDirectory = ({
  client = new QueryClient(),
  source = squad,
  user = loggedUser,
}: {
  client?: QueryClient;
  source?: Squad;
  user?: typeof loggedUser | null;
} = {}) => {
  client.setQueryData(
    generateQueryKey(
      RequestKey.Sources,
      undefined,
      popularSquadsQuery.featured,
      popularSquadsQuery.isPublic,
      popularSquadsQuery.categoryId,
      popularSquadsQuery.first,
    ),
    {
      pages: [
        {
          sources: {
            edges: [{ node: source }],
            pageInfo: { hasNextPage: false, endCursor: '' },
          },
        },
      ],
      pageParams: [''],
    },
  );
  render(
    <TestBootProvider
      client={client}
      auth={{ user: user ?? undefined, squads: [], showLogin }}
    >
      <Directory />
    </TestBootProvider>,
  );
};

const getToast = (client: QueryClient) =>
  client.getQueryData<ToastNotification>(TOAST_NOTIF_KEY);

beforeEach(() => {
  nock.cleanAll();
  jest.clearAllMocks();
});

it('should join instantly and offer to undo', async () => {
  let joined = false;
  let left = false;
  mockGraphQL({
    request: { query: SQUAD_JOIN_MUTATION, variables: { sourceId: squad.id } },
    result: () => {
      joined = true;
      return { data: { source: generateTestSquad() } };
    },
  });
  mockGraphQL(completeActionMock({ action: ActionType.JoinSquad }));
  mockGraphQL({
    request: { query: LEAVE_SQUAD_MUTATION, variables: { sourceId: squad.id } },
    result: () => {
      left = true;
      return { data: { _: true } };
    },
  });
  const queryClient = new QueryClient();
  renderDirectory({ client: queryClient });

  await userEvent.click(screen.getByRole('button', { name: 'Join Web team' }));

  expect(await screen.findByText('81 members')).toBeInTheDocument();
  expect(
    screen.queryByRole('button', { name: 'Join Web team' }),
  ).not.toBeInTheDocument();
  expect(getToast(queryClient)?.message).toEqual('Joined Web team');
  await waitFor(() => expect(joined).toBe(true));

  await act(async () => {
    getToast(queryClient)?.action?.onClick();
  });

  expect(
    await screen.findByRole('button', { name: 'Join Web team' }),
  ).toBeInTheDocument();
  expect(screen.getByText('80 members')).toBeInTheDocument();
  await waitFor(() => expect(left).toBe(true));
});

it('should show no button for a squad the reader is in', () => {
  renderDirectory({ source: generateTestSquad() });

  expect(screen.queryByRole('button')).not.toBeInTheDocument();
});

it('should disable Join for a reader the squad blocked', () => {
  const member = generateTestSquad().currentMember;
  renderDirectory({
    source: generateTestSquad({
      currentMember: member && { ...member, role: SourceMemberRole.Blocked },
    }),
  });

  expect(
    screen.getByRole('button', {
      name: 'You are not allowed to join the Squad',
    }),
  ).toBeDisabled();
});

it('should ask a logged out reader to sign up before joining', async () => {
  renderDirectory({ user: null });

  await userEvent.click(screen.getByRole('button', { name: 'Join Web team' }));

  expect(showLogin).toHaveBeenCalled();
  expect(
    screen.getByRole('button', { name: 'Join Web team' }),
  ).toBeInTheDocument();
});
