import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { BrowserGroupIcon } from '../icons/Browsers';
import { IconSize } from '../Icon';
import { downloadBrowserExtension } from '../../lib/constants';

type GetExtensionButtonProps = {
  className?: string;
};

export const GetExtensionButton = ({
  className,
}: GetExtensionButtonProps): ReactElement => {
  return (
    <a
      href={downloadBrowserExtension}
      className={classNames(
        `btn focus-outline btn-primary inline-flex min-w-fit max-w-64 flex-row items-center
        justify-center gap-3 rounded-14 border
        px-3 text-xl font-bold leading-5 no-underline shadow-none`,
        className,
      )}
    >
      <BrowserGroupIcon size={IconSize.XXLarge} className="text-white" />
      <span>Join 1M developers</span>
    </a>
  );
};
