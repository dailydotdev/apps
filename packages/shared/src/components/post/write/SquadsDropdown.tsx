import React, { ReactElement } from 'react';
import { SourceAvatar, SourceShortInfo } from '../../profile/source';
import { ArrowIcon, SquadIcon } from '../../icons';
import { Dropdown } from '../../fields/Dropdown';
import { SourceMemberRole, SourceType, Squad } from '../../../graphql/sources';
import { ButtonSize } from '../../buttons/common';
import { useViewSize, ViewSize } from '../../../hooks';
import { ProfileImageSize } from '../../ProfilePicture';
import { cloudinary } from '../../../lib/image';

interface SquadsDropdownProps {
  onSelect: (index: number) => void;
  selected: number;
  list: Squad[];
}

const defaultSquad = {
  image: cloudinary.squads.imageFallback,
  permalink: null,
  active: true,
  public: false,
  membersCount: 1,
  description: null,
  memberPostingRole: SourceMemberRole.Admin,
  memberInviteRole: SourceMemberRole.Admin,
};

export const generateDefaultSquad = (username: string): Squad => ({
  ...defaultSquad,
  id: username,
  handle: username,
  name: `${username}'s private squad`,
  type: SourceType.Squad,
});

export function SquadsDropdown({
  onSelect,
  selected,
  list,
}: SquadsDropdownProps): ReactElement {
  const isLaptop = useViewSize(ViewSize.Laptop);
  const names = list?.map((squad) => squad.name) ?? [];

  const renderDropdownItem = (value: string, index: number) => {
    const source = list[index];

    return (
      <SourceShortInfo
        source={source}
        size={!isLaptop ? ProfileImageSize.XXLarge : undefined}
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
          <SourceAvatar source={list[selected]} size={ProfileImageSize.Small} />
        ) : (
          <SquadIcon className="mr-2" />
        )
      }
      placeholder="Select Squad"
      buttonSize={ButtonSize.Large}
      className={{
        container: 'mt-6 laptop:w-70',
        menu: 'menu-secondary',
        item: 'h-auto',
      }}
      shouldIndicateSelected={false}
      selectedIndex={selected}
      onChange={(_, index) => onSelect(index)}
      options={names}
      scrollable
      data-testid="timezone_dropdown"
      renderItem={renderDropdownItem}
      drawerProps={{
        isFullScreen: true,
        title: 'Choose a Squad',
        className: { drawer: 'p-0 pr-2 gap-3', title: 'mb-4' },
      }}
      openFullScreen={!isLaptop}
    />
  );
}
