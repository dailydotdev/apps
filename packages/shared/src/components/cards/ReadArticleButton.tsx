import React, { ReactElement } from 'react';
import { Button, ButtonSize } from '../buttons/Button';
import OpenLinkIcon from '../icons/OpenLink';

interface ReadArticleButtonProps {
  href: string;
  className?: string;
  openNewTab?: boolean;
  buttonSize?: ButtonSize;
  onClick?: (e: React.MouseEvent) => unknown;
}

export const ReadArticleButton = ({
  openNewTab,
  buttonSize = 'small',
  ...props
}: ReadArticleButtonProps): ReactElement => (
  <Button
    tag="a"
    {...props}
    buttonSize={buttonSize}
    rightIcon={<OpenLinkIcon className="ml-2" secondary />}
    target={openNewTab ? '_blank' : '_self'}
  >
    Read post
  </Button>
);
