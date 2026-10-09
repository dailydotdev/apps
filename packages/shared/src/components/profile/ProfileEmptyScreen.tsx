import type { ReactElement } from 'react';
import React from 'react';
import { cloudinaryCharmEmptyProfile } from '../../lib/image';
import {
  CharmEmptyState,
  CharmEmptyStatePlacement,
} from '../charm/CharmEmptyState';

export type ProfileEmptyScreenProps = {
  text: string;
  title: string;
  className?: string;
  image?: string;
  imageAlt?: string;
};

export function ProfileEmptyScreen({
  text,
  title,
  className,
  image = cloudinaryCharmEmptyProfile,
  imageAlt = 'daily.dev charm with an empty profile',
}: ProfileEmptyScreenProps): ReactElement {
  return (
    <CharmEmptyState
      placement={CharmEmptyStatePlacement.Page}
      className={className}
      image={image}
      imageAlt={imageAlt}
      title={title}
      description={text}
    />
  );
}
