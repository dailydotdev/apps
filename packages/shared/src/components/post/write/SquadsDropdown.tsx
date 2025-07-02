import type { ReactElement } from 'react';
import React from 'react';
import { DropdownMenuItem } from '@radix-ui/react-dropdown-menu';
import { SourceAvatar, SourceShortInfo } from '../../profile/source';
import { ArrowIcon } from '../../icons';
import type { Squad } from '../../../graphql/sources';
import { SourceMemberRole, SourceType } from '../../../graphql/sources';
import { ButtonSize, ButtonVariant } from '../../buttons/common';
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
import { TruncateText } from '../../utilities';

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
  const { user } = useAuthContext();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={ButtonVariant.Float}
          className="mt-6 w-full !justify-start !font-normal laptop:w-70"
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
          <TruncateText>
            {selected !== -1 ? list[selected].name : 'Everyone'}
          </TruncateText>
          <ArrowIcon className="ml-auto rotate-90" secondary />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={10}
        className="flex max-h-96 w-[var(--radix-popper-anchor-width)] flex-col gap-1 overflow-y-auto overflow-x-hidden !p-0"
      >
        <Typography
          bold
          type={TypographyType.Caption1}
          color={TypographyColor.Quaternary}
          className="sticky top-0 z-1 flex h-8 items-center bg-background-popover px-4"
        >
          Public
        </Typography>

        <DropdownMenuItem
          className="flex h-12 w-full items-center px-4 hover:bg-surface-float"
          onClick={() => onSelect(-1)}
        >
          <ProfilePicture
            user={user}
            size={ProfileImageSize.Large}
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
          className="sticky top-0 z-2 flex h-8 items-center bg-background-popover px-4"
        >
          Squads you&apos;ve joined
        </Typography>

        {list.map((squad, index) => (
          <DropdownMenuItem
            key={squad.id}
            className="flex h-12 w-full items-center px-4 hover:bg-surface-float"
            onClick={() => onSelect(index)}
          >
            <SourceShortInfo source={squad} size={ProfileImageSize.Large} />
            <ArrowIcon className="ml-auto rotate-90" secondary />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
