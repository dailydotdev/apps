import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  ArrowIcon,
  SparkleIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import { ShareBrief } from './ShareBrief';
import { briefCopy } from './copy';

interface ClosingCardProps {
  totalStories: number;
  readMinutes: number;
  savedMinutes: number;
  progress: number;
  isComplete: boolean;
}

export const ClosingCard = ({
  totalStories,
  readMinutes,
  savedMinutes,
  progress,
  isComplete,
}: ClosingCardProps): ReactElement => (
  <section
    className={classNames(
      'relative mx-auto mt-12 max-w-2xl overflow-hidden rounded-16 border p-8 text-center transition-colors',
      isComplete
        ? 'border-brand-default/40 bg-gradient-to-b from-brand-float to-background-subtle'
        : 'border-border-subtlest-tertiary bg-background-subtle',
    )}
  >
    {isComplete ? (
      <span className="bg-brand-default/60 absolute inset-x-0 top-0 mx-auto inline-flex h-1 w-24 -translate-y-1/2 rounded-full blur-md" />
    ) : null}
    <div className="relative">
      {isComplete ? (
        <span className="mx-auto mb-3 inline-grid size-9 place-items-center rounded-full bg-brand-float text-brand-default">
          <SparkleIcon size={IconSize.XSmall} />
        </span>
      ) : null}
      <Typography
        type={TypographyType.Caption2}
        color={TypographyColor.Quaternary}
        bold
        className="mb-2 uppercase tracking-[0.18em]"
      >
        {isComplete ? 'Brief complete' : `${progress} of ${totalStories} read`}
      </Typography>
      <Typography
        tag={TypographyTag.H2}
        type={TypographyType.Title2}
        bold
        className="!leading-tight tracking-[-0.02em]"
      >
        {isComplete
          ? briefCopy.closingTitleDone
          : briefCopy.closingTitleProgress}
      </Typography>
      <Typography
        type={TypographyType.Body}
        color={TypographyColor.Secondary}
        className="mx-auto mt-2 max-w-prose"
      >
        {isComplete
          ? briefCopy.closingSubDone(totalStories, readMinutes, savedMinutes)
          : briefCopy.closingSubProgress(totalStories - progress)}
      </Typography>
      {isComplete ? (
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
          className="mt-3 italic"
        >
          {briefCopy.closingPivot}
        </Typography>
      ) : null}
      <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-2">
        <ShareBrief variant={ButtonVariant.Primary} />
        <Link href="#explore-bridge" passHref>
          <Button
            tag="a"
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            icon={<ArrowIcon className="rotate-180" />}
          >
            Jump to explore
          </Button>
        </Link>
      </div>
    </div>
  </section>
);
