import React, { ReactElement } from 'react';
import { SourceAvatar, SourceShortInfo } from '../../profile/source';
import { ArrowIcon, SquadIcon } from '../../icons';
import { Dropdown } from '../../fields/Dropdown';
import { useAuthContext } from '../../../contexts/AuthContext';
import { verifyPermission } from '../../../graphql/squads';
import { SourcePermissions } from '../../../graphql/sources';
import { ButtonSize } from '../../buttons/common';
import { useViewSize, ViewSize } from '../../../hooks';

interface SquadsDropdownProps {
  onSelect: (index: number) => void;
  selected: number;
}

export function SquadsDropdown({
  onSelect,
  selected,
}: SquadsDropdownProps): ReactElement {
  const { squads } = useAuthContext();
  const isMobile = useViewSize(ViewSize.MobileL);
  const activeSquads = squads?.filter(
    (squad) => squad?.active && verifyPermission(squad, SourcePermissions.Post),
  );
  const squadsList = activeSquads?.map((squad) => squad.name) ?? [];

  const renderDropdownItem = (value: string, index: number) => {
    const source = activeSquads[index];

    return (
      <SourceShortInfo
        source={source}
        size={isMobile ? 'xxlarge' : undefined}
        className="w-full items-center pl-1 tablet:w-auto tablet:py-3"
      >
        <ArrowIcon className="ml-auto rotate-90" secondary />
      </SourceShortInfo>
    );
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
      shouldIndicateSelected={false}
      selectedIndex={selected}
      onChange={(_, index) => onSelect(index)}
      options={squadsList}
      scrollable
      data-testid="timezone_dropdown"
      renderItem={renderDropdownItem}
      drawerProps={{
        isFullScreen: true,
        title: 'Choose a Squad',
        className: { drawer: 'p-0 pr-2 gap-3', title: 'mb-4' },
      }}
    />
  );
}
