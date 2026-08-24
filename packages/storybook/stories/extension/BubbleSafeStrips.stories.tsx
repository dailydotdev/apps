import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  BUBBLE_SAFE_VARIANTS,
  TOOLTIP_HEIGHT,
  TOOLTIP_MAX_FRACTION,
} from './_bubbleSafeStrips';
import {
  MOCK_LEAD_SPONSOR,
  MOCK_PARTNER_SPONSORS,
} from '@dailydotdev/shared/src/components/sponsors/mockSponsors';
import {
  Divider,
  PartnerRow,
  PrimaryLockup,
} from '@dailydotdev/shared/src/components/sponsors/SponsoredStrip';
import ExtensionProviders from './_providers';
import { MockFeedGrid, MockFeedHeader } from './_mockPostFeed';

// =============================================================
// Ten technical fixes for one problem: the browser paints its
// link tooltip over the bottom-left corner, which is where the
// strip's paid mark sits.
//
// Every variant keeps the bar the reader already liked — flush,
// full width, sticky, one row, no float. What changes is
// geometry, ordering, or what the page hands the browser.
//
// HOW TO USE THIS PAGE: hover a card. The black box that appears
// bottom-left is a stand-in for the browser's real tooltip, at
// roughly its real size, showing the real href of whatever you
// are hovering. It is a simulation — the real one is browser
// chrome and cannot be rendered by a page — but it is anchored
// and sized like the real thing, so if a variant survives this
// it will survive Chrome.
// =============================================================

const strip = {
  primary: MOCK_LEAD_SPONSOR,
  partners: MOCK_PARTNER_SPONSORS,
};

const meta: Meta = {
  title: 'Extension/Bubble-Safe Strips',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

/**
 * Stand-in for the browser's link tooltip: bottom-left, real
 * href, roughly the real size. Chrome jumps it to the opposite
 * corner when the pointer comes near, which this reproduces.
 */
const TooltipSim = (): ReactElement | null => {
  const [href, setHref] = useState<string | null>(null);
  const [flip, setFlip] = useState(false);

  useEffect(() => {
    const onOver = (event: PointerEvent) => {
      const anchor = (event.target as HTMLElement)?.closest?.('a[href]');

      setHref(anchor ? (anchor as HTMLAnchorElement).href : null);
    };
    const onMove = (event: PointerEvent) => {
      // Chrome relocates the bubble when the cursor nears it.
      setFlip(event.clientY > window.innerHeight - 80 && event.clientX < 400);
    };

    document.addEventListener('pointerover', onOver, { passive: true });
    document.addEventListener('pointermove', onMove, { passive: true });

    return () => {
      document.removeEventListener('pointerover', onOver);
      document.removeEventListener('pointermove', onMove);
    };
  }, []);

  if (!href) {
    return null;
  }

  return (
    <span
      className={`pointer-events-none fixed bottom-0 z-tooltip max-w-[50vw] truncate bg-[#202124] px-2 font-sans text-[#e8eaed] ${
        flip ? 'right-0' : 'left-0'
      }`}
      style={{
        height: TOOLTIP_HEIGHT,
        lineHeight: `${TOOLTIP_HEIGHT}px`,
        fontSize: 12,
      }}
    >
      {href}
    </span>
  );
};

const Note = ({ children }: { children: React.ReactNode }): ReactElement => (
  <p className="mb-3 max-w-[52rem] text-text-tertiary typo-footnote">
    {children}
  </p>
);

const Bench = ({
  children,
  linkStyle,
}: {
  children: ReactElement;
  linkStyle?: 'long' | 'short' | 'tracking';
}): ReactElement => (
  <ExtensionProviders>
    <div className="min-h-dvh bg-background-default">
      <div className="flex min-h-dvh flex-col">
        <div className="flex-1 p-6 pb-16">
          <MockFeedHeader />
          <MockFeedGrid linkStyle={linkStyle} />
        </div>
        {children}
      </div>
      <TooltipSim />
    </div>
  </ExtensionProviders>
);

// ---------------------------------------------------------------
// The problem, and the index
// ---------------------------------------------------------------
export const Overview: Story = {
  render: () => (
    <ExtensionProviders>
      <div className="min-h-dvh bg-background-default">
        <div className="mx-auto flex max-w-[60rem] flex-col gap-6 p-6">
          <div>
            <h1 className="font-bold text-text-primary typo-title2">
              Ten ways to keep the tooltip off the logos
            </h1>
            <Note>
              The bar stays exactly as it is in all ten — flush, full width,
              sticky, no float. Only the geometry, the ordering, or what the
              page hands the browser changes.
            </Note>
            <Note>
              <strong className="text-text-primary">
                What the URLs actually measure.
              </strong>{' '}
              Counted on the live feed, 28 links on one screen, at the 12px UI
              font the tooltip uses: nav and tag links run 33 characters and
              189px; post slugs run 68 characters and 393px, a quarter of a
              1440px screen; and promoted cards link through a signed token —
              742 characters — which Chrome clips at half the viewport. The
              tooltip is exactly as wide as the URL inside it, so those numbers
              are the fixes&apos; pass mark.
            </Note>
            <Note>
              <strong className="text-text-primary">
                That rules the horizontal fixes out as guarantees.
              </strong>{' '}
              A gutter has to be 400px to survive an ordinary post and half the
              bar to survive a promoted one, at which point there is no bar
              left. A vertical clearance is 26px no matter what the URL says.
              The <em>holds</em> column below is the honest verdict: “any URL”
              means the fix does not care how long the link is.
            </Note>
            <Note>
              Open any story and hover a card — a stand-in tooltip appears
              bottom-left with the real href, at roughly the real size.
            </Note>
          </div>
          {[
            'Give it nothing to cover',
            'Make it smaller',
            'Move only when it matters',
          ].map((family) => (
            <section key={family}>
              <h2 className="mb-2 font-bold text-text-primary typo-callout">
                {family}
              </h2>
              <table className="w-full border-collapse text-left">
                <tbody>
                  {BUBBLE_SAFE_VARIANTS.filter((v) => v.family === family).map(
                    (v) => (
                      <tr key={v.id}>
                        <td className="border-b border-border-subtlest-tertiary py-2 pr-4 align-top font-bold text-text-primary typo-footnote">
                          {v.name}
                        </td>
                        <td className="border-b border-border-subtlest-tertiary py-2 pr-4 align-top text-text-secondary typo-footnote">
                          {v.how}
                        </td>
                        <td className="border-b border-border-subtlest-tertiary py-2 pr-4 align-top text-text-tertiary typo-caption1">
                          {v.cost}
                        </td>
                        <td className="whitespace-nowrap border-b border-border-subtlest-tertiary py-2 align-top typo-caption1">
                          <span
                            className={
                              v.holds === 'width'
                                ? 'text-status-success'
                                : 'text-status-warning'
                            }
                          >
                            {
                              {
                                width: 'holds · any URL',
                                slug: 'holds · post links only',
                                short: 'needs shorter URLs',
                              }[v.holds]
                            }
                          </span>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </section>
          ))}
        </div>
      </div>
    </ExtensionProviders>
  ),
};

const [
  gutter,
  right,
  band,
  shorthref,
  narrow,
  lift,
  slide,
  adaptive,
  swap,
  centred,
] = BUBBLE_SAFE_VARIANTS;

export const Unfixed: Story = {
  name: '0 · Unfixed (the problem)',
  render: () => (
    <Bench>
      <div className="sticky bottom-0 z-3 flex h-10 w-full items-center gap-5 border-t border-border-subtlest-tertiary bg-background-default px-4 laptop:px-10">
        <PrimaryLockup primary={strip.primary} />
        <Divider />
        <PartnerRow partners={strip.partners} />
      </div>
    </Bench>
  ),
};

export const WorstCase: Story = {
  name: '0b · Worst case (promoted card)',
  render: () => (
    <Bench linkStyle="tracking">
      <div className="sticky bottom-0 z-3 flex h-10 w-full items-center gap-5 border-t border-border-subtlest-tertiary bg-background-default px-4 laptop:px-10">
        <PrimaryLockup primary={strip.primary} />
        <Divider />
        <PartnerRow partners={strip.partners} />
      </div>
    </Bench>
  ),
};

export const LeftGutter: Story = {
  name: `1 · ${gutter.name}`,
  render: () => <Bench>{<gutter.Strip {...strip} />}</Bench>,
};

export const RightAnchored: Story = {
  name: `2 · ${right.name}`,
  render: () => (
    <Bench linkStyle="tracking">{<right.Strip {...strip} />}</Bench>
  ),
};

export const SacrificialBand: Story = {
  name: `3 · ${band.name}`,
  render: () => <Bench linkStyle="tracking">{<band.Strip {...strip} />}</Bench>,
};

export const ShortHref: Story = {
  name: `4 · ${shorthref.name}`,
  render: () => (
    <Bench linkStyle="short">{<shorthref.Strip {...strip} />}</Bench>
  ),
};

export const NarrowAnchor: Story = {
  name: `5 · ${narrow.name}`,
  render: () => <Bench linkStyle="short">{<narrow.Strip {...strip} />}</Bench>,
};

export const LiftOnHover: Story = {
  name: `6 · ${lift.name}`,
  render: () => <Bench linkStyle="tracking">{<lift.Strip {...strip} />}</Bench>,
};

export const SlideOnHover: Story = {
  name: `7 · ${slide.name}`,
  render: () => <Bench>{<slide.Strip {...strip} />}</Bench>,
};

export const Adaptive: Story = {
  name: `8 · ${adaptive.name}`,
  render: () => <Bench>{<adaptive.Strip {...strip} />}</Bench>,
};

export const SwapEnds: Story = {
  name: `9 · ${swap.name}`,
  render: () => <Bench>{<swap.Strip {...strip} />}</Bench>,
};

export const Centred: Story = {
  name: `10 · ${centred.name}`,
  render: () => <Bench>{<centred.Strip {...strip} />}</Bench>,
};
