import React, {
  forwardRef,
  ForwardRefRenderFunction,
  ReactElement,
  useImperativeHandle,
} from 'react';
import { Button } from '../buttons/Button';
import { TextField } from '../fields/TextField';
import CopyIcon from '../icons/Copy';
import { useCopyLink } from '../../hooks/useCopyLink';
import { Squad } from '../../graphql/squads';

type InviteTextFieldProps = {
  squad?: Squad;
  isLoading?: boolean;
};

export type InviteTextFieldHandle = {
  copyLink: () => void;
};

const InviteText: ForwardRefRenderFunction<
  InviteTextFieldHandle,
  InviteTextFieldProps
> = ({ squad, isLoading }, ref): ReactElement => {
  const token = squad?.currentMember?.referralToken ?? '';
  const invitation = `${squad?.permalink}/${token}`;
  const [copying, copyLink] = useCopyLink(() => invitation);
  useImperativeHandle(ref, () => ({
    copyLink,
  }));
  return (
    <TextField
      aria-busy={isLoading}
      className={{ container: 'w-full mt-7' }}
      name="permalink"
      inputId="permalink"
      label={invitation}
      type="url"
      fieldType="tertiary"
      disabled
      actionButton={
        <Button
          icon={<CopyIcon />}
          onClick={() => copyLink()}
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
