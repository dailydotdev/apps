import React, { ReactElement } from 'react';
import { Button } from '../buttons/Button';
import OpenLinkIcon from '../icons/OpenLink';

interface ReadArticleButtonProps {
  href: string;
  className?: string;
  openNewTab?: boolean;
  onClick?: (e: React.MouseEvent) => unknown;
}

export const ReadArticleButton = ({
  openNewTab,
  ...props
}: ReadArticleButtonProps): ReactElement => (
  <Button
    tag="a"
    {...props}
    buttonSize="small"
    rightIcon={<OpenLinkIcon className="ml-2" secondary />}
    target={openNewTab ? '_blank' : '_self'}
  >
    Read article
  </Button>
);
