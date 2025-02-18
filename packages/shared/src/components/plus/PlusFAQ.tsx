import type { ReactElement, ReactNode } from 'react';
import React, { useId } from 'react';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { Accordion } from '../accordion';
import { anchorDefaultRel } from '../../lib/strings';
import { faq } from '../../lib/constants';
import { plusFAQs } from './common';

interface FAQ {
  question: string;
  answer: ReactNode;
}

const FAQItem = ({ item }: { item: FAQ }): ReactElement => (
  <div className="rounded-10 bg-surface-float px-6 py-4">
    <Accordion
      title={
        <Typography
          bold
          color={TypographyColor.Primary}
          tag={TypographyTag.Span}
        >
          {item.question}
        </Typography>
      }
    >
      <Typography
        color={TypographyColor.Tertiary}
        tag={TypographyTag.P}
        type={TypographyType.Callout}
      >
        {item.answer}
      </Typography>
    </Accordion>
  </div>
);

export const PlusFAQ = (): ReactElement => {
  const id = useId();
  const titleId = `${id}-title`;
  return (
    <section aria-labelledby={titleId} className="my-10 laptop:mt-4">
      <Typography
        bold
        className="mb-10 text-center"
        id={titleId}
        tag={TypographyTag.H2}
        type={TypographyType.Title3}
      >
        Frequently asked questions
      </Typography>
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        {plusFAQs.map((item) => (
          <FAQItem key={item.question} item={item} />
        ))}
      </div>
      <Typography
        className="mt-10 text-center"
        color={TypographyColor.Tertiary}
        type={TypographyType.Callout}
      >
        For technical or product related questions{' '}
        <a
          className="underline"
          href={faq}
          target="_blank"
          rel={anchorDefaultRel}
        >
          click here
        </a>{' '}
        or email us at{' '}
        <a
          className="underline"
          href="mailto:support@daily.dev?subject=I have a question about Plus membership"
          target="_blank"
          rel={anchorDefaultRel}
        >
          support@daily.dev
        </a>
      </Typography>
    </section>
  );
};
