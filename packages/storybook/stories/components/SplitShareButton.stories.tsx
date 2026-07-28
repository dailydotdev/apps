import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { SplitShareButton } from '@dailydotdev/shared/src/components/share/SplitShareButton';
import { ShareActions } from '@dailydotdev/shared/src/components/share/ShareActions';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import {
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/common';
import { CopyIcon } from '@dailydotdev/shared/src/components/icons';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { mockShareLink, mockShareText, shareDecorator } from './share.mocks';

const link = mockShareLink;
const text = mockShareText;

const meta: Meta<typeof SplitShareButton> = {
  title: 'Components/Share/SplitShareButton',
  component: SplitShareButton,
  parameters: {
    docs: {
      description: {
        component: `The split share trigger measured against the plain design-system \`Button\`.
Every row renders the split control next to the standard label+icon button and the
standard icon-only button at the same \`ButtonSize\` and \`ButtonVariant\`, with the
computed geometry printed underneath so height, radius, type scale and padding can be
compared rather than eyeballed.`,
      },
    },
  },
  decorators: [shareDecorator('flex w-full flex-col gap-8 py-4')],
};

export default meta;

type Story = StoryObj<typeof SplitShareButton>;

const sizes = [
  { size: ButtonSize.Large, label: 'Large' },
  { size: ButtonSize.Medium, label: 'Medium' },
  { size: ButtonSize.Small, label: 'Small (used by the band)' },
  { size: ButtonSize.XSmall, label: 'XSmall' },
];

const variants = [
  { variant: ButtonVariant.Primary, label: 'Primary' },
  { variant: ButtonVariant.Secondary, label: 'Secondary' },
  { variant: ButtonVariant.Tertiary, label: 'Tertiary' },
  { variant: ButtonVariant.Float, label: 'Float' },
  { variant: ButtonVariant.Subtle, label: 'Subtle' },
];

/**
 * Reads the rendered geometry back out of the DOM. Hand-checking Tailwind
 * classes proves what was written, not what the browser resolved — for a
 * guideline check only the computed values count.
 */
const Measured = ({
  caption,
  children,
}: {
  caption: string;
  children: React.ReactNode;
}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [specs, setSpecs] = React.useState('');

  React.useEffect(() => {
    // The control root, not the wrapper: a wrapper around an inline-flex button
    // picks up line-height descender space and reads a few px taller than the
    // button actually is.
    const root = ref.current?.firstElementChild;
    const buttons = Array.from(ref.current?.querySelectorAll('button') ?? []);
    const [first] = buttons;

    if (!root || !first) {
      return;
    }

    const style = window.getComputedStyle(first);
    const box = root.getBoundingClientRect();
    const last = buttons[buttons.length - 1];
    const chevron =
      buttons.length > 1
        ? ` · chevron ${Math.round(
            last.getBoundingClientRect().width,
          )}×${Math.round(last.getBoundingClientRect().height)}`
        : '';

    setSpecs(
      [
        `${Math.round(box.height)}px tall`,
        `${Math.round(box.width)}px wide`,
        `radius ${style.borderRadius}`,
        `type ${style.fontSize}/${style.fontWeight}`,
        `pad ${style.paddingTop} ${style.paddingRight} ${style.paddingBottom} ${style.paddingLeft}`,
      ].join(' · ') + chevron,
    );
  }, []);

  return (
    <div className="flex flex-col items-start gap-1">
      <div ref={ref}>{children}</div>
      <Typography
        type={TypographyType.Caption2}
        color={TypographyColor.Quaternary}
      >
        {caption} — {specs}
      </Typography>
    </div>
  );
};

const Row = ({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) => (
  <section className="flex flex-col gap-3 border-t border-border-subtlest-tertiary pt-4">
    <div className="flex flex-col gap-0.5">
      <Typography bold type={TypographyType.Body}>
        {title}
      </Typography>
      {note && (
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          {note}
        </Typography>
      )}
    </div>
    <div className="flex flex-wrap items-start gap-8">{children}</div>
  </section>
);

// One size per row: the split control beside the two standard button shapes it
// is built from, so any drift in height, radius or type shows up immediately.
export const AgainstStandardButtons: Story = {
  render: () => (
    <>
      {sizes.map(({ size, label }) => (
        <Row
          key={size}
          title={label}
          note="Split control · standard label+icon button · standard icon-only button."
        >
          <Measured caption="split">
            <ShareActions
              link={link}
              text={text}
              variant="split"
              buttonVariant={ButtonVariant.Primary}
              buttonSize={size}
              label="Copy link"
              triggerText="Copy link"
            />
          </Measured>
          <Measured caption="Button (icon + label)">
            <Button
              type="button"
              variant={ButtonVariant.Primary}
              size={size}
              icon={<CopyIcon />}
            >
              Copy link
            </Button>
          </Measured>
          <Measured caption="Button (icon only)">
            <Button
              type="button"
              variant={ButtonVariant.Primary}
              size={size}
              icon={<CopyIcon />}
              aria-label="Copy link"
            />
          </Measured>
        </Row>
      ))}
    </>
  ),
};

// The same control across every button variant: the divider is a real border
// on the outlined fills and a drawn rule on the borderless ones, so it has to
// stay legible either way.
export const AcrossVariants: Story = {
  render: () => (
    <>
      {variants.map(({ variant, label }) => (
        <Row
          key={variant}
          title={label}
          note="Split control beside the standard button in the same variant."
        >
          <Measured caption="split">
            <ShareActions
              link={link}
              text={text}
              variant="split"
              buttonVariant={variant}
              buttonSize={ButtonSize.Small}
              label="Copy link"
              triggerText="Copy link"
            />
          </Measured>
          <Measured caption="Button (icon + label)">
            <Button
              type="button"
              variant={variant}
              size={ButtonSize.Small}
              icon={<CopyIcon />}
            >
              Copy link
            </Button>
          </Measured>
        </Row>
      ))}
    </>
  ),
};

const motionRules = [
  {
    title: 'Press and hover stay with the design system',
    body: 'No press-scale was added. `buttons-v2.css` rejects `transform: scale` on purpose — vestibular motion, and it fights inertial scrolling on mobile — and ships an inset shadow instead. Hover and press already transition over 0.15s ease-out.',
  },
  {
    title: 'Chevron turns to point at its menu — 200ms, easeOutExpo',
    body: 'The only state the trigger can still show once the menu covers the button. `cubic-bezier(0.16, 1, 0.3, 1)` decelerates into place with no overshoot, so it settles instead of wobbling. Transform only, so it stays on the compositor.',
  },
  {
    title: 'Copy confirmation cross-fades — 200ms, opacity + scale + blur',
    body: 'Click the copy half. Copying is rare and deliberate, so it earns real motion: the two glyphs share one grid cell and cross-fade, so the label never shifts and there is no snap. High-frequency motion stays calm; this is the moment worth animating.',
  },
  {
    title: 'The dropdown keeps the house animation',
    body: 'Its slide-and-fade comes from `DropdownMenuContent`, shared by every menu in the app. Tuning it here would make this one surface the odd one out.',
  },
  {
    title: 'Everything is reduced-motion guarded',
    body: 'Both new transitions carry `motion-reduce:transition-none`, so the states swap instantly for anyone who asked for less motion.',
  },
];

// The motion decisions, including the ones that were to leave things alone.
export const Motion: Story = {
  render: () => (
    <Row
      title="Motion"
      note="Interact with the control below while reading — click the chevron, then click the copy half."
    >
      <div className="flex flex-col gap-6">
        <ShareActions
          link={link}
          text={text}
          variant="split"
          buttonVariant={ButtonVariant.Primary}
          buttonSize={ButtonSize.Small}
          label="Copy link"
          triggerText="Copy link"
        />
        <ul className="flex max-w-2xl flex-col gap-3">
          {motionRules.map(({ title, body }) => (
            <li key={title} className="flex flex-col gap-0.5">
              <Typography bold type={TypographyType.Footnote}>
                {title}
              </Typography>
              <Typography
                type={TypographyType.Footnote}
                color={TypographyColor.Tertiary}
              >
                {body}
              </Typography>
            </li>
          ))}
        </ul>
      </div>
    </Row>
  ),
};

// Sat in a button group, which is where a split control has to hold its own:
// the outer corners round, the inner edges stay square, heights line up.
export const InAButtonRow: Story = {
  render: () => (
    <Row
      title="Alongside other actions"
      note="Standard buttons on either side of the split control, all at Small."
    >
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant={ButtonVariant.Float}
          size={ButtonSize.Small}
        >
          Upvote
        </Button>
        <Button
          type="button"
          variant={ButtonVariant.Float}
          size={ButtonSize.Small}
        >
          Comment
        </Button>
        <ShareActions
          link={link}
          text={text}
          variant="split"
          buttonVariant={ButtonVariant.Primary}
          buttonSize={ButtonSize.Small}
          label="Copy link"
          triggerText="Copy link"
        />
      </div>
    </Row>
  ),
};
