import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import LoginButton from '../LoginButton';
import NotificationsBell from '../notifications/NotificationsBell';
import ProfileButton from '../profile/ProfileButton';
import { useAuthContext } from '../../contexts/AuthContext';
import classed from '../../lib/classed';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { OpportunityEntryButton } from '../opportunity/OpportunityEntryButton';

interface HeaderButtonsProps {
  additionalButtons?: ReactNode;
}

const Container = classed('div', 'ml-auto flex justify-end gap-3');

export function HeaderButtons({
  additionalButtons,
}: HeaderButtonsProps): ReactElement {
  const { isLoggedIn, isAuthReady } = useAuthContext();
  const { loadedSettings } = useSettingsContext();

  if (!isAuthReady || !loadedSettings) {
    return <Container />;
  }

  if (!isLoggedIn) {
    return (
      <Container>
        <LoginButton
          className={{
            container: 'gap-4',
            button: 'hidden laptop:block',
          }}
        />
      </Container>
    );
  }

  return (
    <Container>
      <OpportunityEntryButton />
      {additionalButtons}
      <NotificationsBell />
      <ProfileButton className="hidden laptop:flex" />
    </Container>
  );
}

export default HeaderButtons;
