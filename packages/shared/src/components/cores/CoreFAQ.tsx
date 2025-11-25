import type { ReactElement } from 'react';
import React, { useId } from 'react';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { RadixAccordion } from '../accordion';
import { anchorDefaultRel } from '../../lib/strings';
import { feedback } from '../../lib/constants';
import { coresFAQItems } from './common';

export const CoreFAQ = (): ReactElement => {
  const id = useId();
  const titleId = `${id}-title`;

  return (
    <section aria-labelledby={titleId} className="my-10">
      <Typography
        bold
        className="mb-10 text-center"
        id={titleId}
        tag={TypographyTag.H2}
        type={TypographyType.Title3}
      >
        Frequently asked questions
      </Typography>
      <div className="w-xl mx-auto flex max-w-full flex-1 flex-col gap-4">
        <RadixAccordion items={coresFAQItems} />
      </div>
      items
      <Typography
        className="mt-10 text-center"
        color={TypographyColor.Tertiary}
        type={TypographyType.Callout}
      >
        For technical or product related questions{' '}
        <a
          className="underline"
          href={feedback}
          target="_blank"
          rel={anchorDefaultRel}
        >
          click here
        </a>{' '}
        or email us at{' '}
        <a
          className="underline"
          href="mailto:support@daily.dev?subject=I have a question about Cores"
          target="_blank"
          rel={anchorDefaultRel}
        >
          support@daily.dev
        </a>
      </Typography>
    </section>
  );
};
