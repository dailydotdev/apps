import type { ReactElement } from 'react';
import React from 'react';
import { cloudinaryCharmEmptyProfile } from '../../lib/image';
import {
  CharmEmptyState,
  CharmEmptyStatePlacement,
} from '../charm/CharmEmptyState';

// A custom image brings its own description; without one the default charm
// and its description are used.
type ProfileEmptyScreenImage =
  | { image: string; imageAlt: string }
  | { image?: never; imageAlt?: never };

export type ProfileEmptyScreenProps = {
  text: string;
  title: string;
  className?: string;
} & ProfileEmptyScreenImage;

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
