import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import Link from './utilities/Link';
import type { ButtonV2Props } from './buttons/ButtonV2';
import { ButtonV2, ButtonSize, ButtonVariant } from './buttons/ButtonV2';
import { AlertDot, AlertColor } from './AlertDot';
import { getTagPageLink } from '../lib/links';

interface TagLinkProps {
  tag: string;
  className?: string;
  isSelected?: boolean;
  buttonProps?: ButtonV2Props<'a'>;
}

export function TagLink({
  tag,
  className,
  isSelected = false,
  buttonProps = {},
}: TagLinkProps): ReactElement {
  return (
    <Link href={getTagPageLink(tag)} passHref key={tag} prefetch={false}>
      <ButtonV2
        tag="a"
        size={ButtonSize.XSmall}
        variant={ButtonVariant.Float}
        className={classNames('relative', className)}
        {...buttonProps}
      >
        #{tag}
        {isSelected && (
          <AlertDot
            className="absolute right-1 top-1"
            color={AlertColor.Cabbage}
          />
        )}
      </ButtonV2>
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
}: TagLinksProps): ReactElement | null {
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
