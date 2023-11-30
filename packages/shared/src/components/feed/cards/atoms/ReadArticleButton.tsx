import React, { ReactElement } from 'react';
import {
  Button,
  ButtonComponentProps,
  ButtonSize,
  StyledButtonProps,
} from '../../../buttons/Button';
import OpenLinkIcon from '../../../icons/OpenLink';
import useLeanPostActions from '../../../../hooks/post/useLeanPostActions';
import { Post } from '../../../../graphql/posts';
import { useActiveFeedContext } from '../../../../contexts';

interface ReadArticleButtonProps {
  className?: string;
  openNewTab?: boolean;
  buttonSize?: ButtonSize;
  post?: Post;
  rel?: string;
}

export const ReadArticleButton = ({
  openNewTab,
  post,
  buttonSize = ButtonSize.Small,
  ...props
}: ReadArticleButtonProps): ReactElement => {
  const { queryKey } = useActiveFeedContext();
  const { onDirectClick } = useLeanPostActions({ queryKey });
  const onClickHandler = (e: React.MouseEvent) => {
    onDirectClick(post);
  };
  return (
    <Button
      tag="a"
      href={post.permalink}
      title={post.title}
      {...props}
      buttonSize={buttonSize}
      rightIcon={<OpenLinkIcon className="ml-2" secondary />}
      onClick={onClickHandler}
      target={openNewTab ? '_blank' : '_self'}
    >
      Read post
    </Button>
  );
};
