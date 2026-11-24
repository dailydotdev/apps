import type { ReactElement } from 'react';
import React from 'react';
import { FlexCol } from '../../../components/utilities';
import {
  ProfileImageSize,
  ProfilePicture,
} from '../../../components/ProfilePicture';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import type { DmPeer } from '../types';
import { SupportChatMembers } from './SupportChatMembers';

// Opens a support chat that has no messages yet: who's in it, and what it's
// for.
export const SupportChatIntro = ({ peer }: { peer: DmPeer }): ReactElement => (
  <FlexCol className="items-center gap-1 pb-6 pt-4 text-center">
    <ProfilePicture
      user={peer}
      size={ProfileImageSize.XXXLarge}
      className="mb-2"
    />
    <Typography type={TypographyType.Title3} bold>
      {peer.name} support
    </Typography>
    {peer.group && (
      <SupportChatMembers members={peer.group.members} className="mt-2" />
    )}
    <Typography
      type={TypographyType.Callout}
      color={TypographyColor.Tertiary}
      className="mt-4 max-w-[30rem]"
    >
      A private chat between your company page&apos;s admins and the daily.dev
      founders. Ask anything about your page, posts or boosts.
    </Typography>
  </FlexCol>
);
