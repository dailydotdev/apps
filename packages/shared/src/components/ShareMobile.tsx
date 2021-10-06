import React, { ReactElement } from 'react';
import CopyIcon from '../../icons/copy.svg';
import ShareIcon from '../../icons/share.svg';
import { useCopyPostLink } from '../hooks/useCopyPostLink';
import { Button } from './buttons/Button';

export interface Props {
  share: () => Promise<void>;
}

export function ShareMobile({ share }: Props): ReactElement {
  const [copying, copyLink] = useCopyPostLink();

  return (
    <div className="flex laptop:hidden flex-col items-start -mt-1 mb-5">
      <Button
        buttonSize="small"
        onClick={copyLink}
        pressed={copying}
        icon={<CopyIcon />}
        className="my-1 btn-tertiary-avocado"
      >
        {copying ? 'Copied!' : 'Copy link'}
      </Button>
      <Button
        buttonSize="small"
        onClick={share}
        icon={<ShareIcon />}
        className="my-1 btn-tertiary"
      >
        Share with your friends
      </Button>
    </div>
  );
}
