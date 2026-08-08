import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { useAuthContext } from '../../../contexts/AuthContext';
import { Summary, SummaryArrow } from '../../../components/utilities/common';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import type { Deal } from '../types';
import { getDealAnsweredQuestions, getDealAnswerText } from '../dealsFormat';

interface DealAnsweredQuestionsProps {
  deal: Deal;
  now: number;
  headingTag?: TypographyTag.H2 | TypographyTag.H3;
  className?: string;
}

/**
 * Built on `<details>` rather than the Radix accordion because Radix unmounts
 * collapsed panels, which would keep every answer out of the HTML a crawler
 * reads. The answer text carries its cta exactly as the page copy builds it, so
 * an answer engine that lifts the answer also lifts the attribution.
 */
export const DealAnsweredQuestions = ({
  deal,
  now,
  headingTag = TypographyTag.H2,
  className,
}: DealAnsweredQuestionsProps): ReactElement | null => {
  const { isLoggedIn } = useAuthContext();
  const questions = getDealAnsweredQuestions(deal, now);

  if (isLoggedIn || !questions.length) {
    return null;
  }

  return (
    <section className={classNames('flex w-full flex-col gap-3', className)}>
      <Typography tag={headingTag} type={TypographyType.Title3} bold>
        Questions about this deal
      </Typography>
      <div className="flex flex-col">
        {questions.map((entry) => (
          <details
            key={entry.question}
            className="select-none border-b border-border-subtlest-tertiary"
          >
            <Summary className="py-3">
              <div className="flex items-center gap-4 font-bold text-text-primary typo-callout">
                {entry.question}
                <SummaryArrow />
              </div>
            </Summary>
            <p className="select-text pb-3 text-text-secondary typo-callout">
              {getDealAnswerText(entry)}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
};
