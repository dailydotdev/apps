import React, { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MultipleSourceSelect } from './MultipleSourceSelect';
import { defaultQueryClientTestingConfig } from '../../../../__tests__/helpers/tanstack-query';
import type { Squad } from '../../../graphql/sources';
import {
  SourceMemberRole,
  SourcePermissions,
  SourceType,
} from '../../../graphql/sources';

const mockUser = {
  id: 'user-1',
  name: 'Chris',
  username: 'chris',
  image: 'https://daily.dev/chris.jpg',
};

const createSquad = (id: string, name: string): Squad =>
  ({
    id,
    name,
    handle: id,
    type: SourceType.Squad,
    image: `https://daily.dev/${id}.jpg`,
    active: true,
    permalink: `/squads/${id}`,
    public: true,
    membersCount: 1,
    description: '',
    memberPostingRole: SourceMemberRole.Member,
    memberInviteRole: SourceMemberRole.Member,
    moderationRequired: false,
    moderationPostCount: 0,
    currentMember: {
      permissions: [SourcePermissions.Post],
    },
  } as unknown as Squad);

const mockSquads = [
  createSquad('squad-frontend', 'Frontend'),
  createSquad('squad-backend', 'Backend'),
  createSquad('squad-mobile', 'Mobile'),
  createSquad('squad-design', 'Design'),
];

jest.mock('../../../contexts/AuthContext', () => ({
  useAuthContext: () => ({ user: mockUser, squads: mockSquads }),
}));

// Render the popover body inline; the popover already stays open across
// selections, so the behavior under test is purely which ids get set.
jest.mock('../../../features/common/components/PopoverFormContainer', () => ({
  PopoverFormContainer: ({
    children,
    onReset,
  }: {
    children: React.ReactNode;
    onReset?: () => void;
  }) => (
    <div>
      <button type="button" onClick={() => onReset?.()}>
        Reset
      </button>
      {children}
    </div>
  ),
}));

// Owns selection state so each set feeds back in and re-renders, matching the
// real create-post form.
const Harness = ({
  initialSelectedIds,
  setSelectedSourceIds,
}: {
  initialSelectedIds: string[];
  setSelectedSourceIds: jest.Mock;
}) => {
  const [selectedIds, setSelectedIds] = useState(initialSelectedIds);
  return (
    <MultipleSourceSelect
      selectedSourceIds={selectedIds}
      setSelectedSourceIds={(ids) => {
        setSelectedSourceIds(ids);
        setSelectedIds(ids);
      }}
    />
  );
};

const renderComponent = ({
  selectedIds = ['user-1'],
  setSelectedSourceIds = jest.fn(),
}: {
  selectedIds?: string[];
  setSelectedSourceIds?: jest.Mock;
} = {}) => {
  render(
    <QueryClientProvider
      client={new QueryClient(defaultQueryClientTestingConfig)}
    >
      <Harness
        initialSelectedIds={selectedIds}
        setSelectedSourceIds={setSelectedSourceIds}
      />
    </QueryClientProvider>,
  );
  return { setSelectedSourceIds };
};

// A selected squad renders both a removable chip and its row, so target rows by
// their unique @handle text.
const clickRow = (handle: string) => userEvent.click(screen.getByText(handle));

describe('MultipleSourceSelect', () => {
  it('adds sources additively on row click without resetting the selection', async () => {
    const { setSelectedSourceIds } = renderComponent();

    await clickRow('@squad-frontend');
    expect(setSelectedSourceIds).toHaveBeenLastCalledWith([
      'user-1',
      'squad-frontend',
    ]);

    await clickRow('@squad-backend');
    expect(setSelectedSourceIds).toHaveBeenLastCalledWith([
      'user-1',
      'squad-frontend',
      'squad-backend',
    ]);
  });

  it('toggles a source exactly once per row click', async () => {
    const { setSelectedSourceIds } = renderComponent();

    await clickRow('@squad-frontend');

    expect(setSelectedSourceIds).toHaveBeenCalledTimes(1);
  });

  it('deselects an already-selected source on row click', async () => {
    const { setSelectedSourceIds } = renderComponent({
      selectedIds: ['user-1', 'squad-frontend'],
    });

    await clickRow('@squad-frontend');

    expect(setSelectedSourceIds).toHaveBeenLastCalledWith(['user-1']);
  });

  it('does not exceed the 3-squad cap on row click', async () => {
    const { setSelectedSourceIds } = renderComponent({
      selectedIds: ['squad-frontend', 'squad-backend', 'squad-mobile'],
    });

    await clickRow('@squad-design');

    expect(setSelectedSourceIds).not.toHaveBeenCalled();
  });
});
