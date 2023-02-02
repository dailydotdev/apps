import React, { ReactElement } from 'react';
import Link from 'next/link';
import ArrowIcon from '../icons/Arrow';

interface SquadPostPageNavigationProps {
  squadLink: string;
}

const NOTIFICATIONS_LINK = 'https://app.daily.dev/notifications';
const NOTIFICATIONS_PATH = '/notifications';

const checkIsFromNavigation = (): boolean => {
  try {
    const url = new URL(globalThis?.document.referrer);

    if (url?.origin !== globalThis?.window.location.origin) return false;

    return url.pathname === NOTIFICATIONS_PATH;
  } catch (err) {
    return false;
  }
};

function SquadPostPageNavigation({
  squadLink,
}: SquadPostPageNavigationProps): ReactElement {
  const isFromNavigation = checkIsFromNavigation();
  const link = isFromNavigation ? NOTIFICATIONS_LINK : squadLink;

  return (
    <Link href={link}>
      <a className="flex -left-4 flex-row items-center mb-6 font-bold text-theme-label-tertiary typo-callout">
        <ArrowIcon size="large" className="mr-2 -rotate-90" />
        {isFromNavigation ? 'Notifications center' : "Back to Squad's page"}
      </a>
    </Link>
  );
}

export default SquadPostPageNavigation;
