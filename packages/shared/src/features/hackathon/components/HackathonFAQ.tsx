import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { FlexCol } from '../../../components/utilities';
import { RadixAccordion } from '../../../components/accordion';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetId } from '../../../lib/log';

const faq = [
  {
    title: 'When does the hackathon start/end?',
    description:
      'May 20th at 12:00 UTC. It runs for 5 days, fully async, so you can work on it at your own pace. It will end on May 25th 12:00 UTC.',
  },
  {
    title: 'Who can participate?',
    description:
      'Any developer with a daily.dev account. New users and beginners welcome.',
  },
  {
    title: 'Do I need a Plus subscription?',
    description:
      'No. The Public API is open to all hackathon participants for the duration of the event.',
  },
  {
    title: 'What stack should I use?',
    description:
      'Whatever you want. Next.js, TanStack Start, Vite, Python. Pick whatever lets you ship fastest. The OpenAPI spec works with any language.',
  },
  {
    title: 'Can I use AI?',
    description:
      'Yes. Claude Code, Cursor, Codex, vibe-code the whole thing if you want.',
  },
  {
    title: 'How do I submit my project?',
    description:
      'Post about your project on social media tagging @dailydotdev with a link to your live URL and a short summary. That post is your submission.',
  },
  {
    title: "What happens if I don't finish?",
    description:
      'Submit what you have. Half-finished but interesting beats polished but boring. We value creativity and usefulness as much as execution.',
  },
];

export const HackathonFAQ = (): ReactElement => {
  const { logEvent } = useLogContext();

  const handleFAQChange = (value: string) => {
    if (!value) {
      return;
    }
    logEvent({
      event_name: LogEvent.Click,
      target_id: TargetId.HackathonPage,
      extra: JSON.stringify({ faq: value }),
    });
  };

  return (
    <FlexCol className="w-full gap-7">
      <Typography
        type={TypographyType.Title3}
        bold
        color={TypographyColor.Tertiary}
        className="mx-auto"
      >
        Frequently asked questions (FAQ)
      </Typography>
      <RadixAccordion
        items={faq}
        className="rounded-16 bg-surface-float [&_.AccordionTrigger]:items-start [&_.AccordionTrigger]:text-left"
        onValueChange={handleFAQChange}
      />
    </FlexCol>
  );
};
