import React, { ReactElement } from 'react';
import { Button, ButtonSize } from '../buttons/Button';
import OpenLinkIcon from '../icons/OpenLink';

interface ReadArticleButtonProps {
  content: string;
  href: string;
  className?: string;
  openNewTab?: boolean;
  buttonSize?: ButtonSize;
  onClick?: (e: React.MouseEvent) => unknown;
  title?: string;
  rel?: string;
}

export const ReadArticleButton = ({
  content,
  openNewTab,
  buttonSize = ButtonSize.Small,
  ...props
}: ReadArticleButtonProps): ReactElement => (
  <Button
    tag="a"
    {...props}
    buttonSize={buttonSize}
    rightIcon={<OpenLinkIcon className="ml-2" secondary />}
    target={openNewTab ? '_blank' : '_self'}
  >
    {content}
  </Button>
);
