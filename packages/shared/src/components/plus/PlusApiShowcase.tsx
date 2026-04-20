import type { ComponentType, ReactElement } from 'react';
import React, { useId } from 'react';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { anchorDefaultRel } from '../../lib/strings';
import type { IconProps } from '../Icon';
import { IconSize } from '../Icon';
import { AiIcon, MagicIcon, TerminalIcon } from '../icons';

type ShowcaseCard = {
  title: string;
  body: string;
  icon: ComponentType<IconProps>;
  iconClasses: string;
};

const showcaseCards: Array<ShowcaseCard> = [
  {
    title: 'Keep your coding agent current',
    body: `LLMs stop learning the day they ship. Wire daily.dev in so your agent can reference current libraries, recent CVEs, and what senior devs are actually reading. Pre-built integrations for Claude Code, Cursor, Codex, and OpenClaw.`,
    icon: AiIcon,
    iconClasses: 'bg-overlay-float-water text-accent-water-default',
  },
  {
    title: `Ship the internal tool you've been putting off`,
    body: `The Slack bot for #engineering. The weekly team digest. The tech radar dashboard. Whatever's been sitting in your Notes doc is a few endpoints away.`,
    icon: TerminalIcon,
    iconClasses: 'bg-overlay-float-bun text-accent-bun-default',
  },
  {
    title: 'Automate your own reading exactly how you want it',
    body: `Mirror your personalized feed to Notion, Obsidian, or email. Get alerts when the topics you follow start trending. Your workflow, no copy-paste.`,
    icon: MagicIcon,
    iconClasses: 'bg-overlay-float-cabbage text-accent-cabbage-default',
  },
];

const ShowcaseCardView = ({ card }: { card: ShowcaseCard }): ReactElement => {
  const { icon: Icon, iconClasses } = card;

  return (
    <div className="flex flex-1 flex-col rounded-16 border border-border-subtlest-tertiary bg-surface-float p-6">
      <div
        className={`mb-4 flex size-12 items-center justify-center rounded-12 ${iconClasses}`}
      >
        <Icon secondary size={IconSize.Medium} />
      </div>
      <Typography
        bold
        className="mb-2"
        color={TypographyColor.Primary}
        tag={TypographyTag.H3}
        type={TypographyType.Title3}
      >
        {card.title}
      </Typography>
      <Typography
        color={TypographyColor.Tertiary}
        type={TypographyType.Callout}
      >
        {card.body}
      </Typography>
    </div>
  );
};

export const PlusApiShowcase = (): ReactElement => {
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
        What you can build with the API
      </Typography>
      <div className="mx-auto flex max-w-5xl flex-col gap-4 laptop:flex-row">
        {showcaseCards.map((card) => (
          <ShowcaseCardView key={card.title} card={card} />
        ))}
      </div>
      <div className="mt-8 flex justify-center">
        <Button
          tag="a"
          href="https://docs.daily.dev/docs/plus/public-api"
          target="_blank"
          rel={anchorDefaultRel}
          size={ButtonSize.Medium}
          variant={ButtonVariant.Secondary}
        >
          Read the API docs
        </Button>
      </div>
    </section>
  );
};
