import type { ReactElement } from 'react';
import React from 'react';
import { FlexCol } from '../../../components/utilities';
import Link from '../../../components/utilities/Link';
import {
  ProfileImageSize,
  ProfilePicture,
} from '../../../components/ProfilePicture';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import type { DmPeer } from '../types';

// Opens a conversation that has no messages yet, so the first screen after
// "Message" shows who's on the other side instead of an empty pane.
export const ConversationIntro = ({ peer }: { peer: DmPeer }): ReactElement => (
  <FlexCol className="items-center gap-1 pb-6 pt-4 text-center">
    <ProfilePicture
      user={peer}
      size={ProfileImageSize.XXXLarge}
      className="mb-2"
    />
    <Typography type={TypographyType.Title3} bold>
      {peer.name}
    </Typography>
    <Typography type={TypographyType.Callout} color={TypographyColor.Tertiary}>
      @{peer.username}
    </Typography>
    {peer.bio && (
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Secondary}
        className="mt-1 line-clamp-3 max-w-[30rem] break-words"
      >
        {peer.bio}
      </Typography>
    )}
    <Link href={peer.permalink} passHref>
      <Button
        tag="a"
        variant={ButtonVariant.Secondary}
        size={ButtonSize.Small}
        className="mt-3"
      >
        View profile
      </Button>
    </Link>
    <Typography
      type={TypographyType.Footnote}
      color={TypographyColor.Tertiary}
      className="mt-4"
    >
      This is the start of your conversation with {peer.name}.
    </Typography>
  </FlexCol>
);
