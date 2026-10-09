import type { ReactElement } from 'react';
import React from 'react';
import type { ButtonProps } from '../buttons/Button';
import { cloudinaryCharmEmptyProfile } from '../../lib/image';
import type { CharmEmptyStateAction } from '../charm/CharmEmptyState';
import {
  CharmEmptyState,
  CharmEmptyStatePlacement,
} from '../charm/CharmEmptyState';

export type MyProfileEmptyScreenProps = {
  title?: string;
  text: string;
  cta: string;
  buttonProps?: ButtonProps<'a' | 'button'>;
  className?: string;
  image?: string;
  imageAlt?: string;
};

export function MyProfileEmptyScreen({
  title = 'Nothing here yet',
  text,
  cta,
  className,
  buttonProps,
  image = cloudinaryCharmEmptyProfile,
  imageAlt = 'daily.dev charm with an empty profile',
}: MyProfileEmptyScreenProps): ReactElement {
  const href = buttonProps && 'href' in buttonProps ? buttonProps.href : null;
  const action: CharmEmptyStateAction = href
    ? { label: cta, href, icon: buttonProps?.icon }
    : {
        label: cta,
        icon: buttonProps?.icon,
        loading: buttonProps?.loading,
        onClick: (event) => buttonProps?.onClick?.(event),
      };

  return (
    <CharmEmptyState
      placement={CharmEmptyStatePlacement.Page}
      className={className}
      image={image}
      imageAlt={imageAlt}
      title={title}
      description={text}
      action={action}
    />
  );
}
