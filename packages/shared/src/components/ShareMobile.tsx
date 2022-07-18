import React, { ReactElement } from 'react';
import CopyIcon from './icons/Copy';
import ShareIcon from './icons/Share';
import { useCopyPostLink } from '../hooks/useCopyPostLink';
import { Button } from './buttons/Button';
import { WidgetContainer } from './widgets/common';

export interface Props {
  link: string;
  share: () => Promise<void>;
}

export function ShareMobile({ share, link }: Props): ReactElement {
  const [copying, copyLink] = useCopyPostLink(link);

  return (
    <WidgetContainer className="flex laptop:hidden flex-col gap-2 items-start py-3 px-1">
      <Button
        buttonSize="small"
        onClick={() => copyLink()}
        pressed={copying}
        icon={<CopyIcon />}
        className="btn-tertiary-avocado"
      >
        {copying ? 'Copied!' : 'Copy link'}
      </Button>
      <Button
        buttonSize="small"
        onClick={share}
        icon={<ShareIcon />}
        className="btn-tertiary"
      >
        Share with your friends
      </Button>
    </WidgetContainer>
  );
}
