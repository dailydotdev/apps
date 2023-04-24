import React, {
  forwardRef,
  ForwardRefRenderFunction,
  ReactElement,
  useImperativeHandle,
} from 'react';
import { Button } from '../buttons/Button';
import { TextField } from '../fields/TextField';
import CopyIcon from '../icons/Copy';
import { Squad } from '../../graphql/sources';
import { Origin } from '../../lib/analytics';
import { useSquadInvitation } from '../../hooks/useSquadInvitation';

type InviteTextFieldProps = {
  squad?: Squad;
  isLoading?: boolean;
  origin?: Origin;
};

export type InviteTextFieldHandle = {
  copyLink: () => void;
};

const InviteText: ForwardRefRenderFunction<
  InviteTextFieldHandle,
  InviteTextFieldProps
> = ({ squad, isLoading, origin }, ref): ReactElement => {
  const { invitation, copying, trackAndCopyLink } = useSquadInvitation({
    squad,
    origin,
  });

  useImperativeHandle(ref, () => ({
    copyLink: trackAndCopyLink,
  }));

  return (
    <TextField
      aria-busy={isLoading}
      className={{ container: 'w-full mt-7' }}
      name="permalink"
      inputId="permalink"
      data-testid="permalink"
      label={invitation}
      type="url"
      autoComplete="off"
      fieldType="tertiary"
      disabled
      actionButton={
        <Button
          icon={<CopyIcon />}
          onClick={() => trackAndCopyLink()}
          disabled={copying}
          className="btn-tertiary"
          data-testid="textfield-action-icon"
        />
      }
      value={invitation}
      readOnly
    />
  );
};

export const InviteTextField = forwardRef(InviteText);
