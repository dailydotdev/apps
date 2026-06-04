import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { ArrowIcon } from '../../../components/icons';
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
      'No. daily.dev funds every donation. You never pay a cent — you just take small actions and we turn them into real money for good causes.',
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
      'You do. Pick from vetted nonprofits, or suggest your own — we review every suggestion before it goes live.',
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
      'We’d rather put our growth budget into causes the community cares about than burn it in ad auctions. You give back, we give back.',
  },
  {
    id: 'geo',
    question: 'Is Giveback available in my country?',
    answer:
      'We’re rolling it out gradually. If it isn’t live where you are yet, you’ll see a notice — and we’re working to reach everyone.',
  },
];

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
                className="flex w-full items-center justify-between gap-4 py-4 text-left"
              >
                <Typography
                  tag={TypographyTag.Span}
                  bold
                  type={TypographyType.Callout}
                >
                  {faq.question}
                </Typography>
                <ArrowIcon
                  size={IconSize.Small}
                  className={classNames(
                    'shrink-0 text-text-tertiary transition-transform',
                    isOpen ? 'rotate-0' : 'rotate-180',
                  )}
                />
              </button>
              {isOpen && (
                <Typography
                  tag={TypographyTag.P}
                  type={TypographyType.Callout}
                  color={TypographyColor.Secondary}
                  className="max-w-2xl pb-4"
                >
                  {faq.answer}
                </Typography>
              )}
            </div>
          );
        })}
      </div>
    </GivebackSection>
  );
};
