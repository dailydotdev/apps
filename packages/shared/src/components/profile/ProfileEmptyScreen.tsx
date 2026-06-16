import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { Image } from '../image/Image';

type EmptyScreenImage =
  | { image: string; imageAlt: string }
  | { image?: never; imageAlt?: never };

export type ProfileEmptyScreenProps = {
  text: string;
  title: string;
  className?: string;
  children?: ReactElement;
} & EmptyScreenImage;

export function ProfileEmptyScreen({
  text,
  title,
  className,
  children,
  image,
  imageAlt,
}: ProfileEmptyScreenProps): ReactElement {
  return (
    <div
      className={classNames(
        'flex flex-col items-center gap-4 px-4 py-6 text-center',
        className,
      )}
    >
      {image && (
        <Image
          className="h-40 w-40 object-contain"
          src={image}
          alt={imageAlt}
          loading="lazy"
        />
      )}
      <h3 className="font-bold typo-title3">{title}</h3>
      <p className="text-text-tertiary typo-callout">{text}</p>
      {children}
    </div>
  );
}
