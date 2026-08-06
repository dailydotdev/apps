import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Post } from '../../graphql/posts';
import { useAuthContext } from '../../contexts/AuthContext';
import { Summary, SummaryArrow } from '../utilities/common';
import { widgetClasses } from '../widgets/common';
import { Typography, TypographyType } from '../typography/Typography';

interface PostAnsweredQuestionsProps {
  post: Post;
  className?: string;
}

/**
 * The visible twin of the FAQPage structured data. Anonymous visitors land here
 * from a search or an answer engine, so the questions that brought them are
 * worth answering on the page; logged-in readers came for the post itself and
 * get the feed's own surfaces instead.
 *
 * Built on `<details>` rather than the Radix accordion because Radix unmounts
 * collapsed panels, which would keep every answer out of the HTML a crawler
 * reads. The answer text carries its cta exactly as getFaqJsonLd builds it, so
 * the visible copy and the structured data stay identical.
 */
export const PostAnsweredQuestions = ({
  post,
  className,
}: PostAnsweredQuestionsProps): ReactElement | null => {
  const { isLoggedIn } = useAuthContext();
  const questions = post?.answeredQuestions;

  if (isLoggedIn || !questions?.length) {
    return null;
  }

  return (
    <section className={classNames('flex w-full flex-col gap-3', className)}>
      <Typography type={TypographyType.Body} bold>
        Questions this post answers
      </Typography>
      {questions.map(({ question, answer, cta }) => (
        <details
          key={question}
          className={classNames(
            'select-none overflow-hidden px-4 py-0',
            widgetClasses,
          )}
        >
          <Summary className="-mx-4 px-4 py-3 hover:bg-surface-hover">
            <div className="flex items-center gap-4 font-bold text-text-primary typo-callout">
              {question}
              <SummaryArrow />
            </div>
          </Summary>
          <p className="select-text pb-3 text-text-secondary typo-callout">
            {cta ? `${answer} ${cta}` : answer}
          </p>
        </details>
      ))}
    </section>
  );
};
