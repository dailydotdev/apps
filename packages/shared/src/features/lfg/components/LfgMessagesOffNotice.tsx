import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import Link from '../../../components/utilities/Link';
import { IconSize } from '../../../components/Icon';
import { ShieldWarningIcon } from '../../../components/icons/ShieldWarning';
import { useDmSettings } from '../../messages/hooks/useDmSettings';
import { messageSettingsUrl } from '../../messages/urls';

// Every reach-out turns into a chat, so with direct messages off each part of
// Looking for group dead-ends. It says so where the person is about to start.
export const LfgMessagesOffNotice = ({
  children,
}: {
  children: ReactNode;
}): ReactElement | null => {
  const { allowsMessages, isFetched } = useDmSettings();

  if (!isFetched || allowsMessages) {
    return null;
  }

  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-12 border border-status-warning px-3 py-2 text-text-primary typo-footnote"
    >
      <ShieldWarningIcon
        size={IconSize.Size16}
        className="mt-0.5 shrink-0 text-status-warning"
      />
      <span className="min-w-0 flex-1">
        {children}{' '}
        <Link href={messageSettingsUrl} passHref>
          <a className="text-text-link hover:underline">Turn on</a>
        </Link>
      </span>
    </div>
  );
};
