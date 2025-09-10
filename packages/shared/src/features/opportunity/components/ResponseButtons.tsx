import React from 'react';
import type { ReactElement } from 'react';

import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { MiniCloseIcon, VIcon } from '../../../components/icons';
import { jobsUrl } from '../../../lib/constants';
import Link from '../../../components/utilities/Link';

export const ResponseButtons = ({
  id,
  className,
  size = ButtonSize.Small,
}: {
  id: string;
  className: { container?: string; buttons?: string };
  size?: ButtonSize;
}): ReactElement => {
  return (
    <div className={className?.container}>
      <Link href={`${jobsUrl}/${id}/decline`} passHref>
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
      <Link href={`${jobsUrl}/${id}/questions`} passHref>
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
