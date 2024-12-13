import React, { ReactElement } from 'react';
import classNames from 'classnames';
import Link from './utilities/Link';
import {
  Button,
  ButtonColor,
  ButtonProps,
  ButtonSize,
  ButtonVariant,
} from './buttons/Button';
import { AlertDot, AlertColor } from './AlertDot';
import { getTagPageLink } from '../lib/links';

interface TagLinkProps {
  tag: string;
  className?: string;
  isSelected?: boolean;
  buttonProps?: ButtonProps<'a'>;
}

export function TagLink({
  tag,
  className,
  isSelected = false,
  buttonProps = {},
}: TagLinkProps): ReactElement {
  return (
    <Link href={getTagPageLink(tag)} passHref key={tag} prefetch={false}>
      <Button
        tag="a"
        size={ButtonSize.XSmall}
        variant={ButtonVariant.Float}
        className={classNames('relative', className)}
        {...(isSelected && { color: ButtonColor.Cabbage })}
        {...buttonProps}
      >
        #{tag}
        {isSelected && (
          <AlertDot
            className="absolute right-1 top-1"
            color={AlertColor.Cabbage}
          />
        )}
      </Button>
    </Link>
  );
}

interface ClassName {
  container?: string;
  tag?: string;
}

interface TagLinksProps extends Pick<TagLinkProps, 'buttonProps'> {
  tags: string[];
  className?: ClassName;
}

export function TagLinks({
  tags,
  className = {},
  buttonProps,
}: TagLinksProps): ReactElement {
  if (tags.length === 0) {
    return null;
  }

  return (
    <div className={classNames('flex flex-wrap gap-2', className?.container)}>
      {tags.map((tag) => (
        <TagLink
          key={tag}
          tag={tag}
          className={className?.tag}
          buttonProps={buttonProps}
        />
      ))}
    </div>
  );
}
