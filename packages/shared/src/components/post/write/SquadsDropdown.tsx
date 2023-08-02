import React, { ReactElement } from 'react';
import { SourceAvatar, SourceShortInfo } from '../../profile/source';
import SquadIcon from '../../icons/Squad';
import { ButtonSize } from '../../buttons/Button';
import { Dropdown } from '../../fields/Dropdown';
import { useAuthContext } from '../../../contexts/AuthContext';

interface SquadsDropdownProps {
  onSelect: (index: number) => void;
  selected: number;
}

export function SquadsDropdown({
  onSelect,
  selected,
}: SquadsDropdownProps): ReactElement {
  const { squads } = useAuthContext();
  const squadsList = squads?.map(({ name }) => name) ?? [];

  const renderDropdownItem = (value: string, index: number) => {
    const source = squads[index];

    return <SourceShortInfo source={source} className="pl-1" />;
  };

  return (
    <Dropdown
      icon={
        selected !== -1 ? (
          <SourceAvatar source={squads[selected]} size="small" />
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
