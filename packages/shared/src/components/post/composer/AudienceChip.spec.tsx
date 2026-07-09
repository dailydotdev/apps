import React, { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Squad } from '../../../graphql/sources';
import { SourceMemberRole, SourceType } from '../../../graphql/sources';
import { AudienceChip } from './AudienceChip';

jest.mock('../../dropdown/DropdownMenu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) =>
    children,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuItem: ({
    children,
    onSelect,
    ...props
  }: {
    children: React.ReactNode;
    onSelect?: (event: Event) => void;
  }) => (
    <div
      role="menuitem"
      tabIndex={0}
      onClick={(event) => onSelect?.(event.nativeEvent)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          onSelect?.(event.nativeEvent);
        }
      }}
      {...props}
    >
      {children}
    </div>
  ),
}));

const createAudience = (
  id: string,
  name: string,
  type: SourceType = SourceType.Squad,
): Squad =>
  ({
    id,
    name,
    type,
    handle: id,
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
  } as unknown as Squad);

const userAudience = createAudience('user-1', 'Chris', SourceType.User);
const frontendSquad = createAudience('squad-frontend', 'Frontend');
const backendSquad = createAudience('squad-backend', 'Backend');
const mobileSquad = createAudience('squad-mobile', 'Mobile');
const designSquad = createAudience('squad-design', 'Design');

const audiences = [
  userAudience,
  frontendSquad,
  backendSquad,
  mobileSquad,
  designSquad,
];

const StatefulHarness = ({
  initialSelectedIds,
  onChange,
}: {
  initialSelectedIds: string[];
  onChange: jest.Mock;
}) => {
  const [selectedIds, setSelectedIds] = useState(initialSelectedIds);
  return (
    <AudienceChip
      audiences={audiences}
      selectedIds={selectedIds}
      onChange={(ids) => {
        onChange(ids);
        setSelectedIds(ids);
      }}
      userAudienceId="user-1"
    />
  );
};

const renderComponent = ({
  selectedIds = ['user-1'],
  onChange = jest.fn(),
  stateful = false,
}: {
  selectedIds?: string[];
  onChange?: jest.Mock;
  stateful?: boolean;
} = {}) => {
  render(
    stateful ? (
      <StatefulHarness initialSelectedIds={selectedIds} onChange={onChange} />
    ) : (
      <AudienceChip
        audiences={audiences}
        selectedIds={selectedIds}
        onChange={onChange}
        userAudienceId="user-1"
      />
    ),
  );

  return { onChange };
};

describe('AudienceChip', () => {
  it('renders checkbox controls for audience options', () => {
    renderComponent();

    expect(
      screen.getByRole('checkbox', {
        name: 'Toggle Everyone for multi-audience posting',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', {
        name: 'Toggle Frontend for multi-audience posting',
      }),
    ).toBeInTheDocument();
  });

  it('adds squads additively on row clicks and keeps the menu open', async () => {
    const { onChange } = renderComponent({ stateful: true });

    await userEvent.click(screen.getByText('Frontend'));
    expect(onChange).toHaveBeenLastCalledWith(['user-1', 'squad-frontend']);

    await userEvent.click(screen.getByText('Backend'));
    expect(onChange).toHaveBeenLastCalledWith([
      'user-1',
      'squad-frontend',
      'squad-backend',
    ]);

    // menu options remain mounted and the trigger reflects the accumulated selection
    expect(screen.getByText('Frontend')).toBeInTheDocument();
    expect(screen.getByText('Backend')).toBeInTheDocument();
    expect(screen.getByText('3 audiences')).toBeInTheDocument();
  });

  it('deselects an already-selected squad on row click without closing', async () => {
    const { onChange } = renderComponent({
      selectedIds: ['user-1', 'squad-frontend'],
      stateful: true,
    });

    await userEvent.click(screen.getByText('Frontend'));

    expect(onChange).toHaveBeenLastCalledWith(['user-1']);
    expect(screen.getByText('Frontend')).toBeInTheDocument();
  });

  it('multi-selects an audience when clicking the checkbox exactly once', async () => {
    const { onChange } = renderComponent();

    await userEvent.click(
      screen.getByRole('checkbox', {
        name: 'Toggle Frontend for multi-audience posting',
      }),
    );

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(['user-1', 'squad-frontend']);
  });

  it('enforces the 3-squad cap on row clicks', async () => {
    const { onChange } = renderComponent({
      selectedIds: ['squad-frontend', 'squad-backend', 'squad-mobile'],
      stateful: true,
    });

    expect(
      screen.getByText('You can post to up to 3 squads'),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByText('Design'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('falls back to Everyone when the last squad is removed via row click', async () => {
    const { onChange } = renderComponent({
      selectedIds: ['squad-frontend'],
      stateful: true,
    });

    // 'Frontend' also renders as the trigger label, so target the menu option row
    const frontendOptions = screen.getAllByText('Frontend');
    await userEvent.click(frontendOptions[frontendOptions.length - 1]);

    expect(onChange).toHaveBeenLastCalledWith(['user-1']);
  });

  it('keeps Everyone selected when it is the sole audience', async () => {
    const { onChange } = renderComponent({
      selectedIds: ['user-1'],
      stateful: true,
    });

    const everyoneOptions = screen.getAllByText('Everyone');
    await userEvent.click(everyoneOptions[everyoneOptions.length - 1]);

    expect(onChange).not.toHaveBeenCalled();
  });
});
