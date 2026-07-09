import React, { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Squad } from '../../../graphql/sources';
import { SourceMemberRole, SourceType } from '../../../graphql/sources';
import { AudienceChip } from './AudienceChip';

// Mirror the Radix contract we rely on: content renders only while open, the
// trigger opens it, and selecting an item closes the menu UNLESS onSelect calls
// preventDefault(). This lets the tests actually assert the menu stays open.
jest.mock('../../dropdown/DropdownMenu', () => {
  const { createContext, useContext, cloneElement } =
    jest.requireActual<typeof React>('react');
  const MenuContext = createContext<{
    open: boolean;
    setOpen: (v: boolean) => void;
  }>({
    open: false,
    setOpen: () => {},
  });
  const select = (
    onSelect: ((event: Event) => void) | undefined,
    nativeEvent: Event,
    setOpen: (v: boolean) => void,
  ) => {
    onSelect?.(nativeEvent);
    if (!nativeEvent.defaultPrevented) {
      setOpen(false);
    }
  };
  return {
    DropdownMenu: ({
      children,
      open,
      onOpenChange,
    }: {
      children: React.ReactNode;
      open: boolean;
      onOpenChange: (v: boolean) => void;
    }) => (
      <MenuContext.Provider value={{ open, setOpen: onOpenChange }}>
        {children}
      </MenuContext.Provider>
    ),
    DropdownMenuTrigger: ({ children }: { children: React.ReactElement }) => {
      const { setOpen } = useContext(MenuContext);
      return cloneElement(children, { onClick: () => setOpen(true) });
    },
    DropdownMenuContent: ({ children }: { children: React.ReactNode }) => {
      const { open } = useContext(MenuContext);
      return open ? <div>{children}</div> : null;
    },
    DropdownMenuItem: ({
      children,
      onSelect,
      ...props
    }: {
      children: React.ReactNode;
      onSelect?: (event: Event) => void;
    }) => {
      const { setOpen } = useContext(MenuContext);
      return (
        <div
          role="menuitem"
          tabIndex={0}
          onClick={(event) => select(onSelect, event.nativeEvent, setOpen)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              select(onSelect, event.nativeEvent, setOpen);
            }
          }}
          {...props}
        >
          {children}
        </div>
      );
    },
  };
});

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

// Owns selection state so the component behaves like the real controlled
// composer: each onChange feeds back into selectedIds and re-renders.
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

// Renders the chip and opens the menu (the menu is closed until the trigger is
// clicked, matching Radix), returning the onChange spy and the open menu.
const openMenu = async ({
  selectedIds = ['user-1'],
  onChange = jest.fn(),
}: {
  selectedIds?: string[];
  onChange?: jest.Mock;
} = {}) => {
  render(
    <StatefulHarness initialSelectedIds={selectedIds} onChange={onChange} />,
  );
  await userEvent.click(screen.getByRole('button', { name: /Posting to/ }));
  return { onChange };
};

// The option row and the trigger can share a label (e.g. "Everyone"); the menu
// content renders after the trigger, so the option is the last match.
const clickOption = (label: string) => {
  const matches = screen.getAllByText(label);
  return userEvent.click(matches[matches.length - 1]);
};

describe('AudienceChip', () => {
  it('renders checkbox controls for audience options', async () => {
    await openMenu();

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
    const { onChange } = await openMenu();

    await clickOption('Frontend');
    expect(onChange).toHaveBeenLastCalledWith(['user-1', 'squad-frontend']);

    await clickOption('Backend');
    expect(onChange).toHaveBeenLastCalledWith([
      'user-1',
      'squad-frontend',
      'squad-backend',
    ]);

    // options are still mounted, so the menu stayed open across both clicks
    expect(screen.getByText('Backend')).toBeInTheDocument();
    expect(screen.getByText('3 audiences')).toBeInTheDocument();
  });

  it('deselects an already-selected squad on row click without closing', async () => {
    const { onChange } = await openMenu({
      selectedIds: ['user-1', 'squad-frontend'],
    });

    await clickOption('Frontend');

    expect(onChange).toHaveBeenLastCalledWith(['user-1']);
    expect(screen.getByText('Frontend')).toBeInTheDocument();
  });

  it('multi-selects an audience when clicking the checkbox exactly once', async () => {
    const { onChange } = await openMenu();

    await userEvent.click(
      screen.getByRole('checkbox', {
        name: 'Toggle Frontend for multi-audience posting',
      }),
    );

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(['user-1', 'squad-frontend']);
    expect(screen.getByText('Frontend')).toBeInTheDocument();
  });

  it('enforces the 3-squad cap on row clicks', async () => {
    const { onChange } = await openMenu({
      selectedIds: ['squad-frontend', 'squad-backend', 'squad-mobile'],
    });

    expect(
      screen.getByText('You can post to up to 3 squads'),
    ).toBeInTheDocument();

    await clickOption('Design');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('falls back to Everyone when the last squad is removed via row click', async () => {
    const { onChange } = await openMenu({ selectedIds: ['squad-frontend'] });

    await clickOption('Frontend');

    expect(onChange).toHaveBeenLastCalledWith(['user-1']);
  });

  it('keeps Everyone selected when it is the sole audience', async () => {
    const { onChange } = await openMenu({ selectedIds: ['user-1'] });

    await clickOption('Everyone');

    expect(onChange).not.toHaveBeenCalled();
  });
});
