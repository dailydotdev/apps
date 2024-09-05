import React, { ReactElement } from 'react';

import { useSquadInvitation } from '../../hooks/useSquadInvitation';
import { ChecklistStepPropsWithSquad } from '../../lib/checklist';
import { Origin } from '../../lib/log';
import { Button, ButtonVariant } from '../buttons/Button';
import { TextField } from '../fields/TextField';
import { LinkIcon } from '../icons';
import { ChecklistStep } from './ChecklistStep';

const InviteMemberChecklistStep = ({
  squad,
  ...props
}: ChecklistStepPropsWithSquad): ReactElement => {
  const { invitation, logAndCopyLink } = useSquadInvitation({
    squad,
    origin: Origin.SquadPage,
  });

  return (
    <ChecklistStep {...props}>
      <TextField
        className={{
          container: 'mb-4',
        }}
        inputId="checklistCopyInviteLink"
        name="checklistCopyInviteLink"
        label={invitation}
        readOnly
      />
      <Button
        icon={<LinkIcon />}
        variant={ButtonVariant.Primary}
        onClick={() => {
          logAndCopyLink();
        }}
      >
        Invitation link
      </Button>
    </ChecklistStep>
  );
};

export { InviteMemberChecklistStep };
