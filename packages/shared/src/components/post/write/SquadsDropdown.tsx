import React, { ReactElement } from 'react';
import { SourceAvatar, SourceShortInfo } from '../../profile/source';
import { SquadIcon } from '../../icons';
import { Dropdown } from '../../fields/Dropdown';
import { useAuthContext } from '../../../contexts/AuthContext';
import { verifyPermission } from '../../../graphql/squads';
import { SourcePermissions } from '../../../graphql/sources';
import { ButtonSize } from '../../buttons/common';

interface SquadsDropdownProps {
  onSelect: (index: number) => void;
  selected: number;
}

export function SquadsDropdown({
  onSelect,
  selected,
}: SquadsDropdownProps): ReactElement {
  const { squads } = useAuthContext();
  const activeSquads = squads?.filter(
    (squad) => squad?.active && verifyPermission(squad, SourcePermissions.Post),
  );
  const squadsList = activeSquads?.map((squad) => squad.name) ?? [];

  const renderDropdownItem = (value: string, index: number) => {
    const source = activeSquads[index];

    return <SourceShortInfo source={source} className="pl-1" />;
  };

  return (
    <Dropdown
      icon={
        selected !== -1 ? (
          <SourceAvatar source={activeSquads[selected]} size="small" />
        ) : (
          <SquadIcon className="mr-2" />
        )
      }
      placeholder="Select Squad"
      buttonSize={ButtonSize.Large}
      className={{
        container: 'mt-6 w-70',
        menu: 'menu-secondary',
        item: 'h-auto',
      }}
      selectedIndex={selected}
      onChange={(_, index) => onSelect(index)}
      options={squadsList}
      scrollable
      data-testid="timezone_dropdown"
      renderItem={renderDropdownItem}
    />
  );
}
