import React, { ReactElement } from 'react';
import CopyIcon from './icons/Copy';
import ShareIcon from './icons/Share';
import { useCopyPostLink } from '../hooks/useCopyPostLink';
import { Button, ButtonSize } from './buttons/Button';
import { WidgetContainer } from './widgets/common';

export interface Props {
  link: string;
  share: () => Promise<void>;
}

export function ShareMobile({ share, link }: Props): ReactElement {
  const [copying, copyLink] = useCopyPostLink(link);

  return (
    <WidgetContainer className="flex laptop:hidden flex-col gap-2 items-start p-3">
      <Button
        buttonSize={ButtonSize.Small}
        onClick={() => copyLink()}
        pressed={copying}
        icon={<CopyIcon />}
        className="btn-tertiary-avocado"
      >
        {copying ? 'Copied!' : 'Copy link'}
      </Button>
      <Button
        buttonSize={ButtonSize.Small}
        onClick={share}
        icon={<ShareIcon />}
        className="btn-tertiary-cabbage"
      >
        Share with your friends
      </Button>
    </WidgetContainer>
  );
}
