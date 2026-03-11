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
    title: 'Do I need to know how to code to use this?',
    description:
      'Nope! daily-dev-ask works inside coding tools like Claude Code, Cursor, and Codex. You just ask questions in plain English and your tool does the searching. If you are learning to code with AI, this gives it better sources to learn from.',
  },
  {
    title: "What's the difference between this and ChatGPT or web search?",
    description:
      "ChatGPT and web search pull from the entire internet, including outdated posts, SEO spam, and stuff nobody verified. daily-dev-ask only searches developer articles that the community has actually read and upvoted. Think of it like searching a senior developer's reading list instead of Google.",
  },
  {
    title: 'Is this free?',
    description:
      'daily-dev-ask requires a Plus subscription and an API token. You can get Plus at daily.dev/plus and create a token in your API settings.',
  },
  {
    title: 'What tools does it work with?',
    description:
      'Currently supported: Claude Code, Cursor, Codex, and OpenClaw. We are adding more integrations regularly.',
  },
  {
    title: 'Can I use this for any programming language or framework?',
    description:
      'Yes. daily.dev aggregates articles from thousands of developer publications covering every major language, framework, and tool. Whether you are working with React, Python, Rust, or anything else — if developers write about it, daily-dev-ask can find it.',
  },
];

export const AskFAQ = (): ReactElement => {
  const { logEvent } = useLogContext();

  const handleFAQChange = (value: string) => {
    if (value) {
      logEvent({
        event_name: LogEvent.Click,
        target_id: TargetId.AskPage,
        extra: JSON.stringify({ faq: value }),
      });
    }
  };

  return (
    <FlexCol className="w-full gap-10 pb-10">
      <Typography
        type={TypographyType.Title3}
        bold
        color={TypographyColor.Tertiary}
      >
        Frequently asked questions
      </Typography>
      <RadixAccordion
        items={faq}
        className="rounded-16 bg-surface-float [&_.AccordionTrigger]:items-start [&_.AccordionTrigger]:text-left"
        onValueChange={handleFAQChange}
      />
    </FlexCol>
  );
};
