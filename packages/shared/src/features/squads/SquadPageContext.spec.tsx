import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import defaultUser from '../../../__tests__/fixture/loggedUser';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import type { Squad } from '../../graphql/sources';
import { SourceMemberRole } from '../../graphql/sources';
import {
  SquadPageContextProvider,
  useSquadPageContext,
} from './SquadPageContext';
import { useSquadStaffLayerPending } from './hooks/useSquadStaffLayer';

jest.mock('./hooks/useSquadStaffLayer', () => ({
  ...jest.requireActual('./hooks/useSquadStaffLayer'),
  useSquadStaffLayerPending: jest.fn(),
}));

const makeSquad = (role?: SourceMemberRole): Squad =>
  ({
    id: 'squad1',
    handle: 'acme',
    name: 'Acme',
    features: {},
    flags: { company: true },
    currentMember: role ? { role, permissions: [] } : undefined,
  }) as unknown as Squad;

const ViewerKnown = () => {
  const { isViewerKnown } = useSquadPageContext();

  return <span>{isViewerKnown ? 'known' : 'unknown'}</span>;
};

const renderPage = ({
  squad,
  isViewerReady = true,
}: {
  squad: Squad;
  isViewerReady?: boolean;
}) =>
  render(
    <TestBootProvider client={new QueryClient()} auth={{ user: defaultUser }}>
      <SquadPageContextProvider
        squad={squad}
        isViewerReady={isViewerReady}
        hasStaffLayer
      >
        <ViewerKnown />
      </SquadPageContextProvider>
    </TestBootProvider>,
  );

beforeEach(() => {
  jest.mocked(useSquadStaffLayerPending).mockReturnValue(false);
});

it('should hold staff blocks while their data loads', () => {
  jest.mocked(useSquadStaffLayerPending).mockReturnValue(true);
  renderPage({ squad: makeSquad(SourceMemberRole.Admin) });

  expect(screen.getByText('unknown')).toBeInTheDocument();
});

it('should hold staff blocks until the viewer has their own copy of the squad', () => {
  renderPage({
    squad: makeSquad(SourceMemberRole.Admin),
    isViewerReady: false,
  });

  expect(screen.getByText('unknown')).toBeInTheDocument();
});

it('should show staff blocks once everything is in', () => {
  renderPage({ squad: makeSquad(SourceMemberRole.Moderator) });

  expect(screen.getByText('known')).toBeInTheDocument();
});

it('should not hold a member', () => {
  jest.mocked(useSquadStaffLayerPending).mockReturnValue(true);
  renderPage({ squad: makeSquad(SourceMemberRole.Member) });

  expect(screen.getByText('known')).toBeInTheDocument();
});
