import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { Image } from '../image/Image';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import type { ButtonProps } from '../buttons/Button';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import Link from '../utilities/Link';

export interface CharmEmptyStateAction {
  label: string;
  icon?: ButtonProps<'button'>['icon'];
  /** Render as a link. Takes precedence over `onClick`. */
  href?: string;
  onClick?: () => void;
}

export interface CharmEmptyStateProps {
  /** Charm illustration URL (e.g. a `cloudinaryCharm*` constant from lib/image). */
  image: string;
  imageAlt: string;
  title: string;
  description?: ReactNode;
  /**
   * Optional call-to-action. Omit to render a message-only state (the charm
   * delivers a feeling without nudging an action).
   */
  action?: CharmEmptyStateAction;
  className?: string;
}

/**
 * Shared frame for the charm mascot in emotional product moments. Pairs a mood
 * illustration with copy and an optional action so every placement reads
 * consistently across the app.
 */
export function CharmEmptyState({
  image,
  imageAlt,
  title,
  description,
  action,
  className,
}: CharmEmptyStateProps): ReactElement {
  return (
    <div
      className={classNames(
        'flex w-full flex-col items-center px-6 text-center',
        className,
      )}
    >
      <Image
        src={image}
        alt={imageAlt}
        className="h-40 w-40 object-contain"
        loading="lazy"
      />
      <Typography
        tag={TypographyTag.H3}
        type={TypographyType.Title3}
        color={TypographyColor.Primary}
        bold
        center
        className="mt-4"
      >
        {title}
      </Typography>
      {description && (
        <Typography
          tag={TypographyTag.P}
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
          center
          className="mt-1 max-w-80"
        >
          {description}
        </Typography>
      )}
      {action &&
        (action.href ? (
          <Link href={action.href} passHref>
            <Button
              tag="a"
              variant={ButtonVariant.Primary}
              size={ButtonSize.Medium}
              icon={action.icon}
              className="mt-5"
            >
              {action.label}
            </Button>
          </Link>
        ) : (
          <Button
            type="button"
            variant={ButtonVariant.Primary}
            size={ButtonSize.Medium}
            icon={action.icon}
            onClick={action.onClick}
            className="mt-5"
          >
            {action.label}
          </Button>
        ))}
    </div>
  );
}
