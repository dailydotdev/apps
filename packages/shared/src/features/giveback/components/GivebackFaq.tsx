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
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent } from '../../../lib/log';
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

export const GivebackFaq = (): ReactElement => {
  const { logEvent } = useLogContext();
  const [openId, setOpenId] = useState<string | null>(faqs[0].id);

  const toggle = (id: string, isOpen: boolean) => {
    if (!isOpen) {
      logEvent({ event_name: LogEvent.ClickGivebackFaq, target_id: id });
    }
    setOpenId(isOpen ? null : id);
  };

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
                onClick={() => toggle(faq.id, isOpen)}
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
                    className="max-w-2xl pb-4 [text-wrap:pretty]"
                  >
                    {faq.answer}
                  </Typography>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </GivebackSection>
  );
};
