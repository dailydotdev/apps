import React, { ReactElement } from 'react';
import { Button } from '../buttons/Button';
import OpenLinkIcon from '../icons/OpenLink';

interface ReadArticleButtonProps {
  href: string;
  className?: string;
  onClick?: (e: React.MouseEvent) => unknown;
}

export const ReadArticleButton = (
  props: ReadArticleButtonProps,
): ReactElement => (
  <Button
    tag="a"
    {...props}
    buttonSize="small"
    rightIcon={<OpenLinkIcon className="ml-2" secondary />}
    target="_blank"
  >
    Read article
  </Button>
);
