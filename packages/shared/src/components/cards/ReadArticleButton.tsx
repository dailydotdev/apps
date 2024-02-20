import React, { ReactElement } from 'react';
import {
  Button,
  ButtonIconPosition,
  ButtonProps,
  ButtonSize,
} from '../buttons/Button';
import { OpenLinkIcon } from '../icons';

type ReadArticleButtonProps = ButtonProps<'a'> & {
  content: string;
  href: string;
  openNewTab?: boolean;
};

export const ReadArticleButton = ({
  content,
  openNewTab,
  size = ButtonSize.Small,
  ...props
}: ReadArticleButtonProps): ReactElement => (
  <Button
    tag="a"
    size={size}
    icon={<OpenLinkIcon secondary />}
    iconPosition={ButtonIconPosition.Right}
    target={openNewTab ? '_blank' : '_self'}
    {...props}
  >
    {content}
  </Button>
);
