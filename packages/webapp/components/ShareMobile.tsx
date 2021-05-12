import React, { ReactElement } from 'react';
import CopyIcon from '@dailydotdev/shared/icons/copy.svg';
import ShareIcon from '@dailydotdev/shared/icons/share.svg';
import { useCopyPostLink } from '@dailydotdev/shared/src/hooks/useCopyPostLink';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';

export interface Props {
  share: () => Promise<void>;
}

export function ShareMobile({ share }: Props): ReactElement {
  const [copying, copyLink] = useCopyPostLink();

  return (
    <div className="flex flex-col items-start -mt-1 mb-5 laptop:hidden">
      <Button
        buttonSize="small"
        onClick={copyLink}
        pressed={copying}
        icon={<CopyIcon />}
        className="btn-tertiary-avocado my-1"
      >
        {copying ? 'Copied!' : 'Copy link'}
      </Button>
      <Button
        buttonSize="small"
        onClick={share}
        icon={<ShareIcon />}
        className="btn-tertiary my-1"
      >
        Share with your friends
      </Button>
    </div>
  );
}
