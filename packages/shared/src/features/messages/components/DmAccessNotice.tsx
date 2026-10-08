import type { ReactElement } from 'react';
import React from 'react';
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
import Link from '../../../components/utilities/Link';
import { settingsUrl } from '../../../lib/constants';
import { DmAccess } from '../access';

export type DmNoticeAccess = Exclude<
  DmAccess,
  DmAccess.Allowed | DmAccess.RequestReceived | DmAccess.RequestRequired
>;

const copy: Record<DmNoticeAccess, string> = {
  [DmAccess.BlockedByMe]:
    "You blocked this user. They can't message you and you can't message them.",
  [DmAccess.SelfDisabled]:
    'You turned off direct messages. Turn them back on to reply.',
  [DmAccess.PeerUnavailable]: "This user isn't accepting messages right now.",
  [DmAccess.RequestPending]:
    'Your message request was sent. You can chat once they accept.',
};

export const DmAccessNotice = ({
  access,
  onUnblock,
}: {
  access: DmNoticeAccess;
  onUnblock: () => void;
}): ReactElement => (
  <div className="mx-4 mb-4 flex shrink-0 flex-col items-center gap-3 rounded-16 border border-border-subtlest-tertiary px-4 py-4 text-center tablet:mx-6">
    <Typography type={TypographyType.Callout} color={TypographyColor.Tertiary}>
      {copy[access]}
    </Typography>
    {access === DmAccess.BlockedByMe && (
      <Button
        variant={ButtonVariant.Secondary}
        size={ButtonSize.Small}
        onClick={onUnblock}
      >
        Unblock
      </Button>
    )}
    {access === DmAccess.SelfDisabled && (
      <Link href={`${settingsUrl}/privacy`} passHref>
        <Button
          tag="a"
          variant={ButtonVariant.Secondary}
          size={ButtonSize.Small}
        >
          Message settings
        </Button>
      </Link>
    )}
  </div>
);
