import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { MagicIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';

interface FirstSessionWelcomeProps {
  className?: string;
}

/**
 * Welcome hero rendered at the top of the Customize sidebar on a brand-new
 * user's very first new tab.
 *
 * Quiet, theme-aware card: uses platform surface/text tokens so it reads
 * cleanly on both light and dark themes, and a single soft fade-in on
 * mount so the panel doesn't feel static. The accent comes from the
 * cabbage-tinted icon chip — everything else is plain typography.
 */
export const FirstSessionWelcome = ({
  className,
}: FirstSessionWelcomeProps): ReactElement => {
  return (
    <section
      aria-labelledby="newtab-welcome-title"
      className={classNames(
        'relative mx-3 mb-1 mt-2 flex flex-col gap-2.5 overflow-hidden rounded-16 p-4',
        'border border-border-subtlest-tertiary bg-surface-float',
        'motion-safe:animate-[newtab-welcome-in_0.5s_ease-out]',
        className,
      )}
    >
      <style>{`
        @keyframes newtab-welcome-in {
          from { opacity: 0; transform: translateY(0.25rem); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="flex items-center gap-2">
        <span
          aria-hidden
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-10 bg-overlay-float-cabbage text-accent-cabbage-default"
        >
          <MagicIcon size={IconSize.Size16} secondary />
        </span>
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
          bold
          className="uppercase tracking-[0.16em]"
        >
          Your dev reading habit
        </Typography>
      </div>

      <Typography
        id="newtab-welcome-title"
        tag={TypographyTag.H2}
        type={TypographyType.Title3}
        color={TypographyColor.Primary}
        bold
      >
        Make your new tab work for you.
      </Typography>

      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
      >
        Top dev stories every new tab — curated to your topics, paced to your
        day, and shaped around how you read.
      </Typography>
    </section>
  );
};
