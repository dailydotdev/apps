import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Button,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  MoveToIcon,
  PlusIcon,
  VIcon,
} from '@dailydotdev/shared/src/components/icons';
import type { DeviceName } from '../surfaceChrome';
import {
  AVATAR,
  Category,
  Device,
  Rail,
  SurfacePage,
  Variant,
} from '../surfaceChrome';

type Spot = 'step' | 'progress';

const TARGETS = [
  ['X', 'bg-text-primary'],
  ['WhatsApp', 'bg-accent-avocado-default'],
  ['Facebook', 'bg-accent-bun-default'],
  ['Reddit', 'bg-accent-ketchup-default'],
  ['LinkedIn', 'bg-accent-blueCheese-default'],
  ['Telegram', 'bg-accent-water-default'],
  ['Email', 'bg-accent-burger-default'],
];

/* ---------------------------------------------------------- today: settings */

/* ------------------------------------------------------- proposed: the step */

const Slot = ({ filled }: { filled?: boolean }) =>
  filled ? (
    <div className="relative">
      <img alt="" className="size-14 rounded-full object-cover" src={AVATAR} />
      <span className="absolute -bottom-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full bg-accent-avocado-default">
        <VIcon className="size-3 text-white" />
      </span>
    </div>
  ) : (
    <span className="flex size-14 items-center justify-center rounded-full border border-dashed border-border-subtlest-tertiary text-text-quaternary">
      <PlusIcon />
    </span>
  );

/**
 * FunnelStepCtaWrapper's glass branch: a sticky top bar with the logo and
 * Skip, the step content on the 32rem rail, then a scrim, the glass bar with
 * a Medium Primary CTA, and the step dots.
 */
const StepScreen = ({ device, spot }: { device: DeviceName; spot: Spot }) => (
  <Device name={device}>
    <div className="flex flex-col">
      <div className="flex w-full items-center px-6 pt-6">
        <span className="flex-1 font-bold text-text-primary typo-callout">
          daily.dev
        </span>
        <Button
          icon={<MoveToIcon />}
          iconPosition={ButtonIconPosition.Right}
          size={ButtonSize.Small}
          variant={ButtonVariant.Tertiary}
        >
          Skip
        </Button>
      </div>

      <div className="mx-auto flex w-full max-w-[32rem] flex-col gap-4 px-6 py-8 text-center">
        <h2 className="font-bold text-text-primary typo-title1">
          Invite 3 friends, get a month of Plus
        </h2>
        <p className="text-text-primary typo-body">
          They get daily.dev, you both get Plus. It counts as soon as they sign
          up with your link.
        </p>

        <div className="my-2 flex items-center justify-center gap-4">
          <Slot filled={spot === 'progress'} />
          <Slot />
          <Slot />
        </div>

        {spot === 'progress' && (
          <span className="text-text-tertiary typo-footnote">
            1 of 3 joined
          </span>
        )}

        <div className="flex items-center gap-2 rounded-14 border border-border-subtlest-secondary px-3 py-2 text-left">
          <span className="min-w-0 flex-1 truncate text-text-primary typo-body">
            dly.to/tomer
          </span>
          <Button size={ButtonSize.Small} variant={ButtonVariant.Primary}>
            Copy link
          </Button>
        </div>

        <div className="flex flex-row flex-wrap justify-center gap-2 gap-y-4">
          {TARGETS.slice(0, device === 'Mobile' ? 5 : 7).map(
            ([label, tone]) => (
              <div
                key={label}
                className="flex w-16 flex-col items-center gap-1"
              >
                <span className={`size-10 rounded-full ${tone}`} />
                <span className="text-text-tertiary typo-caption2">
                  {label}
                </span>
              </div>
            ),
          )}
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-[32rem] flex-col gap-3 px-6 pb-6 pt-6">
        <div className="flex rounded-16 border border-border-subtlest-tertiary bg-surface-float p-2">
          <Button
            className="flex-1 whitespace-nowrap"
            size={ButtonSize.Medium}
            variant={ButtonVariant.Primary}
          >
            Continue
          </Button>
        </div>
        <div className="flex justify-center gap-1">
          {[0, 1, 2, 3, 4].map((dot) => (
            <span
              key={dot}
              className={`h-1.5 rounded-50 ${
                dot === 3
                  ? 'w-6 bg-text-primary'
                  : 'w-1.5 bg-border-subtlest-tertiary'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  </Device>
);

/* -------------------------------------------------------------------- page */

const InviteOnboarding = () => (
  <SurfacePage
    intro="The one surface on this board where the recommendation is placement, not payload. The invite already has the most complete share UI in the product — it is simply in settings, which is the last place a new account goes."
    map="Sharing map: Copy link leads (#6366). An image of a referral cannot be clicked, so snapshot has nothing to add here and is deliberately absent from every variation below."
    title="Invite friends — onboarding step"
  >
    <Category
      covers="#6366 · blocked on backend · FunnelStepCtaWrapper.tsx · StepHeadline.tsx"
      title="The proposed onboarding step"
      verdict="Same controls, moved to the moment the reward still means something. Built on the funnel step chrome: the logo and Skip in the sticky top bar, content on the 32rem rail, then the glass bar with a Medium Primary CTA and the step dots."
    >
      <Variant
        headline="Invite 3 friends, get a month of Plus"
        note="Three empty slots, the invite link and the same target row. Skip stays in the top bar, so the step never blocks the funnel. Needs the funnel JSON step and a Plus-grant mechanism — the frontend cannot ship alone."
        step="Proposed"
      >
        <Rail>
          <StepScreen device="Desktop" spot="step" />
          <StepScreen device="Tablet" spot="step" />
          <StepScreen device="Mobile" spot="step" />
        </Rail>
      </Variant>
      <Variant
        headline="One joined, two to go"
        note="The state that makes the step worth building: a filled slot turns an ask into a streak someone wants to finish. It also needs somewhere to live after onboarding ends, since the third friend rarely joins during signup."
        step="Progress"
      >
        <Rail>
          <StepScreen device="Desktop" spot="progress" />
          <StepScreen device="Mobile" spot="progress" />
        </Rail>
      </Variant>
    </Category>
  </SurfacePage>
);

const meta: Meta<typeof InviteOnboarding> = {
  title: 'Features/Snapshot/Surfaces/Invite onboarding',
  component: InviteOnboarding,
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const Variations: StoryObj<typeof InviteOnboarding> = {};
