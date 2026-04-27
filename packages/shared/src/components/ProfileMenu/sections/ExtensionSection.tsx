import React from 'react';
import type { ReactElement } from 'react';

import { ProfileSection } from '../ProfileSection';
import { MagicIcon } from '../../icons';
import { checkIsExtension } from '../../../lib/func';
import { useRequestCustomizerOpen } from '../../../features/customizeNewTab/store/customizerOpenRequest.store';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetType } from '../../../lib/log';

interface ExtensionSectionProps {
  /**
   * Called after the user picks any item in this section so the parent
   * `ProfileMenu` collapses the dropdown — without this the menu stays open
   * over the customize sidebar that's about to appear.
   */
  onClose?: () => void;
}

export const ExtensionSection = ({
  onClose,
}: ExtensionSectionProps): ReactElement | null => {
  const { logEvent } = useLogContext();
  const requestCustomizerOpen = useRequestCustomizerOpen();

  if (!checkIsExtension()) {
    return null;
  }

  // The extension dropdown previously surfaced three separate toggles
  // (Shortcuts, Pause new tab, Companion widget). All of them now live
  // inside the Customize sidebar, so this entry just routes the user there
  // — same idea as a "Settings" link in a menu, one tap to the destination.
  const onCustomize = () => {
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.CustomizeNewTab,
      target_id: 'profile_dropdown',
    });
    requestCustomizerOpen();
    onClose?.();
  };

  // Rendered immediately above `AccountSection` in the profile dropdown, so
  // the parent owns the surrounding separators and this component just emits
  // the row itself — keeps the visual grouping with "Settings" tight, with
  // no double-separator between them.
  return (
    <ProfileSection
      items={[
        {
          title: 'Customize new tab',
          icon: () => <MagicIcon secondary />,
          onClick: onCustomize,
        },
      ]}
    />
  );
};
