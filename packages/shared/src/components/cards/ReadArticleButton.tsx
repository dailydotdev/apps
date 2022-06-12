import classNames from 'classnames';
import React, { ReactElement } from 'react';
import { Button } from '../buttons/Button';
import OpenLinkIcon from '../icons/OpenLink';

interface ReadArticleButtonProps {
  href: string;
  className?: string;
}

export const ReadArticleButton = ({
  href,
  className,
}: ReadArticleButtonProps): ReactElement => (
  <Button
    tag="a"
    href={href}
    className={classNames('btn-primary', className)}
    buttonSize="small"
    rightIcon={<OpenLinkIcon className="ml-2" filled />}
    target="_blank"
  >
    Read article
  </Button>
);
