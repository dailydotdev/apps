import React from 'react';
import type { ReactElement } from 'react';

import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { MiniCloseIcon, VIcon } from '../../../components/icons';
import { webappUrl } from '../../../lib/constants';
import Link from '../../../components/utilities/Link';

export const ResponseButtons = ({
  className,
  size = ButtonSize.Small,
}: {
  className: { container?: string; buttons?: string };
  size?: ButtonSize;
}): ReactElement => {
  return (
    <div className={className?.container}>
      <Link href={`${webappUrl}jobs/job-123/decline`} passHref>
        <Button
          className={className?.buttons}
          size={size}
          icon={<MiniCloseIcon />}
          variant={ButtonVariant.Subtle}
          tag="a"
        >
          Not for me
        </Button>
      </Link>
      <Link href={`${webappUrl}jobs/job-123/questions`} passHref>
        <Button
          className={className?.buttons}
          size={size}
          icon={<VIcon />}
          variant={ButtonVariant.Primary}
          tag="a"
        >
          I&apos;m interested
        </Button>
      </Link>
    </div>
  );
};
