import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { RadixAccordion } from '../../../components/accordion';
import { CopyBlock } from '../../../components/CopyBlock';
import Logo, { LogoPosition } from '../../../components/Logo';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { useLogContext } from '../../../contexts/LogContext';
import useLogEventOnce from '../../../hooks/log/useLogEventOnce';
import { LogEvent } from '../../../lib/log';
import { AgentMark } from '../../squads/components/checkout/AgentMark';
import { agentMarks } from '../../squads/components/checkout/agentMarks';
import { agentOnboardingPrompt } from '../prompt';

const agents = [
  { label: 'Claude Code', mark: agentMarks['claude-code'] },
  { label: 'Codex', mark: agentMarks.codex },
  { label: 'Cursor', mark: agentMarks.cursor },
];

const steps = [
  {
    title: 'Paste the prompt',
    description:
      'Your agent reads the setup instructions and asks daily.dev for a link.',
  },
  {
    title: 'Create your account',
    description:
      'Open the link and continue with GitHub or Google. One click, no forms. Then head back to your agent.',
  },
  {
    title: 'Approve the plan',
    description:
      'With your OK, your agent looks at what you work on and shows the tags, sources and squads it wants to follow. Nothing changes until you approve.',
  },
];

const privacy = [
  'It asks before looking at your projects or GitHub.',
  'Only the names of technologies and topics are sent to daily.dev. Never code, file contents or private repository names.',
  'Its access is an API token on your account. You can see and revoke it anytime in your API settings.',
];

const faq = [
  {
    title: 'Is it free?',
    description:
      'Yes. Any daily.dev account works, and setting up your account does not count against the free API quota.',
  },
  {
    title: 'Which agents does it work with?',
    description:
      'Any agent that can read a web page and make HTTP requests. It is tested with Claude Code, Codex and Cursor.',
  },
  {
    title: 'I already have a daily.dev account. Can I use this?',
    description:
      'Yes. Open the link while signed in and connect your agent. It only suggests additions and never removes what you already follow.',
  },
  {
    title: 'What if my agent stops halfway?',
    description:
      'Nothing breaks. The next time you open daily.dev, the regular setup picks up where your agent left off.',
  },
  {
    title: 'Can I change what it set up?',
    description:
      'Everything it follows or changes is a normal setting on your account. Edit it in the app, or ask your agent to adjust it.',
  },
];

const Section = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}): ReactElement => (
  <section className="flex flex-col gap-4">
    <Typography bold tag={TypographyTag.H2} type={TypographyType.Title3}>
      {title}
    </Typography>
    {children}
  </section>
);

export const AgentOnboardingLanding = (): ReactElement => {
  const { logEvent } = useLogContext();

  useLogEventOnce(() => ({ event_name: LogEvent.ViewAgentOnboarding }));

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[40rem] flex-col gap-12 px-4 py-10 tablet:py-16">
      <Logo
        position={LogoPosition.Relative}
        logoClassName={{ container: 'h-8' }}
      />

      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <Typography
            bold
            tag={TypographyTag.H1}
            type={TypographyType.LargeTitle}
          >
            Let your agent set up daily.dev
          </Typography>
          <Typography
            type={TypographyType.Body}
            color={TypographyColor.Secondary}
          >
            Copy one prompt into your coding agent. You create the account in
            one click, and it builds a feed around what you actually work on.
          </Typography>
        </div>
        <CopyBlock
          text={agentOnboardingPrompt}
          label="Copy prompt"
          onCopy={() =>
            logEvent({ event_name: LogEvent.CopyAgentOnboardingPrompt })
          }
        />
        <ul className="flex flex-wrap items-center gap-4">
          {agents.map(({ label, mark }) => (
            <li key={label} className="flex items-center gap-2">
              <AgentMark
                mark={mark}
                className="size-6 rounded-6"
                glyphClassName="size-4"
              />
              <Typography
                type={TypographyType.Footnote}
                color={TypographyColor.Tertiary}
              >
                {label}
              </Typography>
            </li>
          ))}
        </ul>
      </section>

      <Section title="How it works">
        <ol className="flex flex-col gap-4">
          {steps.map(({ title, description }, index) => (
            <li key={title} className="flex gap-4">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-float font-bold text-text-primary typo-callout">
                {index + 1}
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <Typography bold type={TypographyType.Callout}>
                  {title}
                </Typography>
                <Typography
                  type={TypographyType.Callout}
                  color={TypographyColor.Tertiary}
                >
                  {description}
                </Typography>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="What your agent can and can't see">
        <ul className="flex list-disc flex-col gap-2 pl-5 text-text-tertiary typo-callout">
          {privacy.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Section>

      <Section title="Frequently asked questions">
        <RadixAccordion
          items={faq}
          className="rounded-16 bg-surface-float [&_.AccordionTrigger]:items-start [&_.AccordionTrigger]:text-left"
        />
      </Section>
    </main>
  );
};
