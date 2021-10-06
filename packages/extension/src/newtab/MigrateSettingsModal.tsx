import React, { ReactElement, useContext } from 'react';
import { ModalProps } from '@dailydotdev/shared/src/components/modals/StyledModal';
import {
  ConfirmationButtons,
  ConfirmationDescription,
  ConfirmationHeading,
  ConfirmationModal,
} from '@dailydotdev/shared/src/components/modals/ConfirmationModal';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import Icon from '@dailydotdev/shared/icons/sync.svg';
import { Styles } from 'react-modal';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';

export interface MigrateSettingsModalProps extends ModalProps {
  onLater: () => unknown;
  onMerge: () => unknown;
  onSignIn: () => unknown;
  loading: boolean;
}

const style: Styles = {
  content: { maxWidth: '26.25rem', paddingTop: '1rem', paddingBottom: '2rem' },
};

export default function MigrateSettingsModal({
  onLater,
  onMerge,
  onSignIn,
  loading,
  ...props
}: MigrateSettingsModalProps): ReactElement {
  const { user } = useContext(AuthContext);

  return (
    <ConfirmationModal {...props} style={style}>
      <Icon style={{ fontSize: '4rem' }} />
      <ConfirmationHeading>Sync your settings</ConfirmationHeading>
      <ConfirmationDescription>
        Version 3.0 is finally here! We now have one codebase for both the
        browser extension and the new mobile-friendly web app!
        <br />
        <br />
        {user
          ? `We noticed that your settings are stored locally (filters or bookmarks). Please click ‘Sync now’ and we'll sync your account across all platforms.`
          : `We noticed that your settings are stored locally (filters or bookmarks). Please sign up and we'll sync your account across all platforms.`}
      </ConfirmationDescription>
      <ConfirmationButtons>
        <Button className="btn-secondary" onClick={onLater} disabled={loading}>
          Do it later
        </Button>
        <Button
          className="btn-primary"
          onClick={user ? onMerge : onSignIn}
          loading={loading}
        >
          {user ? 'Sync now' : 'Sign in'}
        </Button>
      </ConfirmationButtons>
      <p className="mt-6 text-center typo-caption1 text-theme-label-quaternary">
        {user
          ? `p.s. Doing it later is fine. Your settings are saved locally and will be synced to your account next time you sign in.`
          : `P.S. Doing it later is fine. Your settings are saved locally and will be applied again once you sign up.`}
      </p>
    </ConfirmationModal>
  );
}
