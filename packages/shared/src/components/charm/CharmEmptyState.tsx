import type { MouseEventHandler, ReactElement, ReactNode } from 'react';
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

interface CharmEmptyStateActionBase {
  label: string;
  icon?: ButtonProps<'button'>['icon'];
  loading?: boolean;
}

/** Exactly one of `href` (renders a link) or `onClick` (renders a button). */
export type CharmEmptyStateAction =
  | (CharmEmptyStateActionBase & { href: string; onClick?: never })
  | (CharmEmptyStateActionBase & {
      onClick: MouseEventHandler<HTMLButtonElement>;
      href?: never;
    });

export enum CharmEmptyStatePlacement {
  /** Inside a block that sizes it, such as a comments list or a panel. */
  Inline = 'inline',
  /**
   * The page's own empty state: 16px under the block above it (the header,
   * segments or chips) at the page gutter. It never centres itself in the
   * viewport height, so the shell's chrome stays where it is.
   */
  Page = 'page',
}

const placementClassName: Record<CharmEmptyStatePlacement, string> = {
  [CharmEmptyStatePlacement.Inline]: 'px-6',
  [CharmEmptyStatePlacement.Page]: 'mt-4 px-4 tablet:mt-12 tablet:px-6',
};

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
  placement?: CharmEmptyStatePlacement;
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
  placement = CharmEmptyStatePlacement.Inline,
  className,
}: CharmEmptyStateProps): ReactElement {
  return (
    <div
      className={classNames(
        'flex w-full flex-col items-center text-center',
        placementClassName[placement],
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
            loading={action.loading}
            onClick={action.onClick}
            className="mt-5"
          >
            {action.label}
          </Button>
        ))}
    </div>
  );
}
