import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { FlexCol, FlexRow } from '../../../components/utilities';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { ArrowIcon, VIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { GivebackSection } from './GivebackSection';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  {
    id: 'cost',
    question: 'Does this cost me anything?',
    answer:
      'No. daily.dev funds every donation. You never pay a cent. You just take small actions and we turn them into money for good causes.',
  },
  {
    id: 'how',
    question: 'How do my actions turn into donations?',
    answer:
      'Each approved action unlocks a fixed amount that daily.dev donates to the causes you picked. The community meter is the sum of everyone’s actions.',
  },
  {
    id: 'causes',
    question: 'Who chooses the causes?',
    answer:
      'You do. Pick from vetted nonprofits, or suggest your own. We review every suggestion before it goes live.',
  },
  {
    id: 'rejected',
    question: 'What if one of my actions gets rejected?',
    answer:
      'We add it to your contribution the moment you submit, because we trust you. If validation fails, we simply subtract it. No penalties, ever.',
  },
  {
    id: 'where',
    question: 'Where does the money actually go?',
    answer:
      'Straight to vetted nonprofits. We report receipts so every dollar the community unlocks is accounted for.',
  },
  {
    id: 'why',
    question: 'Why is daily.dev doing this?',
    answer:
      'We’d rather put our growth budget into causes the community cares about than burn it in ad auctions.',
  },
  {
    id: 'geo',
    question: 'Is Giveback available in my country?',
    answer:
      'We’re rolling it out gradually. If it isn’t live where you are yet, you’ll see a notice, and we’re working to reach everyone.',
  },
];

// If the FAQ didn't answer it, let the visitor write to us. This is a single
// question composer (no public thread) that sits at the bottom of the section.
const FaqQuestionComposer = (): ReactElement => {
  const [draft, setDraft] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const submit = () => {
    if (!draft.trim()) {
      return;
    }
    setSubmitted(true);
    setDraft('');
  };

  return (
    <FlexCol className="gap-4 border-t border-border-subtlest-tertiary pt-8">
      <FlexCol className="gap-1.5">
        <Typography tag={TypographyTag.H3} type={TypographyType.Title3} bold>
          Still have a question?
        </Typography>
        <Typography
          tag={TypographyTag.P}
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
        >
          If you didn&apos;t find your answer above, ask the team anything and
          we&apos;ll get back to you.
        </Typography>
      </FlexCol>

      {submitted ? (
        <FlexRow className="items-center gap-2 rounded-12 border border-border-subtlest-tertiary bg-surface-float px-4 py-3 text-status-success">
          <VIcon size={IconSize.Small} secondary />
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Callout}
            color={TypographyColor.StatusSuccess}
            bold
          >
            Thanks for reaching out — we&apos;ll get back to you soon.
          </Typography>
        </FlexRow>
      ) : (
        <FlexCol className="gap-2">
          <label htmlFor="giveback-question" className="flex flex-col gap-2">
            <Typography
              tag={TypographyTag.Span}
              bold
              type={TypographyType.Footnote}
            >
              Your question
            </Typography>
            <textarea
              id="giveback-question"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="What would you like to ask the team?"
              className="min-h-20 rounded-12 border border-border-subtlest-tertiary bg-surface-float px-3 py-2 text-text-primary typo-callout"
            />
          </label>
          <FlexRow className="justify-end">
            <Button
              type="button"
              size={ButtonSize.Small}
              variant={ButtonVariant.Primary}
              disabled={!draft.trim()}
              onClick={submit}
            >
              Send question
            </Button>
          </FlexRow>
        </FlexCol>
      )}
    </FlexCol>
  );
};

export const GivebackFaq = (): ReactElement => {
  const [openId, setOpenId] = useState<string | null>(faqs[0].id);

  return (
    <GivebackSection id="giveback-faq" title="Frequently asked questions">
      <div className="divide-y divide-border-subtlest-tertiary">
        {faqs.map((faq) => {
          const isOpen = openId === faq.id;

          return (
            <div key={faq.id}>
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpenId(isOpen ? null : faq.id)}
                className="group flex w-full items-center justify-between gap-4 py-4 text-left"
              >
                <Typography
                  tag={TypographyTag.Span}
                  bold
                  type={TypographyType.Callout}
                  className={classNames(
                    'transition-colors',
                    !isOpen && 'group-hover:text-text-secondary',
                  )}
                >
                  {faq.question}
                </Typography>
                <ArrowIcon
                  size={IconSize.Small}
                  className={classNames(
                    'shrink-0 transition-transform duration-300 ease-out',
                    isOpen
                      ? 'rotate-0 text-accent-cabbage-default'
                      : 'rotate-180 text-text-tertiary group-hover:text-text-primary',
                  )}
                />
              </button>
              <div
                className={classNames(
                  'grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none',
                  isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                )}
              >
                <div className="overflow-hidden">
                  <Typography
                    tag={TypographyTag.P}
                    type={TypographyType.Callout}
                    color={TypographyColor.Secondary}
                    className="max-w-2xl pb-4"
                  >
                    {faq.answer}
                  </Typography>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <FaqQuestionComposer />
    </GivebackSection>
  );
};
