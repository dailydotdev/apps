import type { ReactElement } from 'react';
import React from 'react';
import { DropdownMenuItem } from '@radix-ui/react-dropdown-menu';
import { SourceAvatar, SourceShortInfo } from '../../profile/source';
import { ArrowIcon } from '../../icons';
import type { Squad } from '../../../graphql/sources';
import { SourceMemberRole, SourceType } from '../../../graphql/sources';
import { ButtonSize, ButtonVariant } from '../../buttons/common';
import { useViewSize, ViewSize } from '../../../hooks';
import { ProfileImageSize, ProfilePicture } from '../../ProfilePicture';
import { cloudinarySquadsImageFallback } from '../../../lib/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../../dropdown/DropdownMenu';
import { Button } from '../../buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import { useAuthContext } from '../../../contexts/AuthContext';

interface SquadsDropdownProps {
  onSelect: (index: number) => void;
  selected: number;
  list: Squad[];
}

const defaultSquad = {
  image: cloudinarySquadsImageFallback,
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
  name: `${username}'s public Squad`,
  type: SourceType.Squad,
  memberPostingRole: SourceMemberRole.Moderator,
  memberInviteRole: SourceMemberRole.Member,
  moderationPostCount: 0,
  moderationRequired: false,
});

export function SquadsDropdown({
  onSelect,
  selected,
  list,
}: SquadsDropdownProps): ReactElement {
  const isLaptop = useViewSize(ViewSize.Laptop);
  const { user } = useAuthContext();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={ButtonVariant.Float}
          className="mt-6 !justify-start !font-normal laptop:w-70"
          icon={
            selected !== -1 ? (
              <SourceAvatar
                source={list[selected]}
                size={ProfileImageSize.Small}
              />
            ) : (
              <ProfilePicture
                user={user}
                size={ProfileImageSize.Small}
                className="mr-2"
                nativeLazyLoading
              />
            )
          }
          size={ButtonSize.Large}
        >
          {selected !== -1 ? list[selected].name : 'Everyone'}
          <ArrowIcon className="ml-auto rotate-90" secondary />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={10}
        className="flex flex-col gap-1 laptop:w-70"
      >
        <Typography
          bold
          type={TypographyType.Caption1}
          color={TypographyColor.Quaternary}
          className="flex h-8 items-center px-4"
        >
          Public
        </Typography>

        <DropdownMenuItem
          className="flex h-12 w-full items-center px-4 hover:bg-surface-float"
          onClick={() => onSelect(-1)}
        >
          <ProfilePicture
            user={user}
            size={!isLaptop ? ProfileImageSize.XXLarge : ProfileImageSize.Large}
            className="mr-2"
            nativeLazyLoading
          />
          <Typography bold type={TypographyType.Callout}>
            Everyone
          </Typography>
        </DropdownMenuItem>

        <Typography
          bold
          type={TypographyType.Caption1}
          color={TypographyColor.Quaternary}
          className="flex h-8 items-center px-4"
        >
          Squads you&apos;ve joined
        </Typography>

        {list.map((squad, index) => (
          <DropdownMenuItem
            key={squad.id}
            className="flex h-12 w-full items-center px-4 hover:bg-surface-float"
            onClick={() => onSelect(index)}
          >
            <SourceShortInfo
              source={squad}
              size={!isLaptop ? ProfileImageSize.XXLarge : undefined}
            />
            <ArrowIcon className="ml-auto rotate-90" secondary />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
