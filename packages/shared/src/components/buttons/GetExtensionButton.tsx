import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { BrowserGroupIcon } from '../icons/Browsers';
import { IconSize } from '../Icon';
import { downloadBrowserExtension } from '../../lib/constants';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent } from '../../lib/log';

type GetExtensionButtonProps = {
  className?: string;
};

export const GetExtensionButton = ({
  className,
}: GetExtensionButtonProps): ReactElement => {
  const { logEvent } = useLogContext();
  return (
    <a
      href={downloadBrowserExtension}
      className={classNames(
        `btn focus-outline btn-primary inline-flex min-w-fit max-w-fit flex-row items-center
        justify-center gap-3 rounded-14 border
        px-3 text-xl font-bold leading-5 no-underline shadow-none`,
        className,
      )}
      target="_blank"
      onClick={() =>
        logEvent({
          event_name: LogEvent.DownloadExtension,
        })
      }
    >
      <BrowserGroupIcon size={IconSize.XXLarge} className="text-white" />
      <span>Join 1M developers</span>
    </a>
  );
};
