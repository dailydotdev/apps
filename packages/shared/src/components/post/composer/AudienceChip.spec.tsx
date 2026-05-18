import React from 'react';
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

const renderComponent = ({
  selectedIds = ['user-1'],
  onChange = jest.fn(),
}: {
  selectedIds?: string[];
  onChange?: jest.Mock;
} = {}) => {
  render(
    <AudienceChip
      audiences={audiences}
      selectedIds={selectedIds}
      onChange={onChange}
      userAudienceId="user-1"
    />,
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

  it('single-selects an audience when clicking the row', async () => {
    const { onChange } = renderComponent({
      selectedIds: ['user-1', 'squad-backend'],
    });

    await userEvent.click(screen.getByText('Frontend'));

    expect(onChange).toHaveBeenCalledWith(['squad-frontend']);
  });

  it('multi-selects an audience when clicking the checkbox', async () => {
    const { onChange } = renderComponent();

    await userEvent.click(
      screen.getByRole('checkbox', {
        name: 'Toggle Frontend for multi-audience posting',
      }),
    );

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(['user-1', 'squad-frontend']);
  });

  it('keeps row single-select available when the multi-select checkbox is disabled', async () => {
    const { onChange } = renderComponent({
      selectedIds: ['squad-frontend', 'squad-backend', 'squad-mobile'],
    });
    const designCheckbox = screen.getByRole('checkbox', {
      name: 'Toggle Design for multi-audience posting',
    });

    expect(designCheckbox).toBeDisabled();

    await userEvent.click(designCheckbox);
    expect(onChange).not.toHaveBeenCalled();

    await userEvent.click(screen.getByText('Design'));
    expect(onChange).toHaveBeenCalledWith(['squad-design']);
  });
});
