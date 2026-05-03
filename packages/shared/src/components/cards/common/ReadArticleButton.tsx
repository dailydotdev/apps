import type { ReactElement } from 'react';
import React from 'react';
import type { ButtonV2Props } from '../../buttons/ButtonV2';
import {
  ButtonV2,
  ButtonIconPosition,
  ButtonSize,
} from '../../buttons/ButtonV2';
import { OpenLinkIcon, TwitterIcon } from '../../icons';
import type { Post } from '../../../graphql/posts';
import { isPostOrSharedPostTwitter } from '../../../graphql/posts';
import { IconSize } from '../../Icon';

export const getReadPostButtonIcon = (
  post: Pick<Post, 'type' | 'sharedPost'>,
): ReactElement =>
  isPostOrSharedPostTwitter(post) ? (
    <TwitterIcon size={IconSize.Size16} />
  ) : (
    <OpenLinkIcon secondary />
  );

type ReadArticleButtonProps = ButtonV2Props<'a'> & {
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
  <ButtonV2
    tag="a"
    size={size}
    icon={<OpenLinkIcon secondary />}
    iconPosition={ButtonIconPosition.Right}
    target={openNewTab ? '_blank' : '_self'}
    {...props}
  >
    {content}
  </ButtonV2>
);
