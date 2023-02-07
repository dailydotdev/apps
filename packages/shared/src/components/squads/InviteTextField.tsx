import React, {
  forwardRef,
  ForwardRefRenderFunction,
  ReactElement,
  useContext,
  useImperativeHandle,
} from 'react';
import { Button } from '../buttons/Button';
import { TextField } from '../fields/TextField';
import CopyIcon from '../icons/Copy';
import { useCopyLink } from '../../hooks/useCopyLink';
import { Squad } from '../../graphql/squads';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { AnalyticsEvent, Origin } from '../../lib/analytics';

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
  const { trackEvent } = useContext(AnalyticsContext);
  const token = squad?.currentMember?.referralToken ?? '';
  const invitation = `${squad?.permalink}/${token}`;
  const [copying, copyLink] = useCopyLink(() => invitation);

  const trackAndCopyLink = () => {
    trackEvent({
      event_name: AnalyticsEvent.ShareSquadInvitation,
      extra: JSON.stringify({ origin }),
    });
    return copyLink();
  };

  useImperativeHandle(ref, () => ({
    copyLink: trackAndCopyLink,
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
          onClick={trackAndCopyLink}
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
