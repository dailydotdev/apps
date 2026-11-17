import type { ReactElement, ReactNode } from 'react';
import React, { useLayoutEffect, useRef, useState } from 'react';
import type { ModalProps } from '@dailydotdev/shared/src/components/modals/common/Modal';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import {
  getStartupsStarterOffer,
  StartupsPromoSpot,
  useStartupsPromo,
} from '@dailydotdev/shared/src/features/squads/hooks/useStartupsPromo';
import type { DeviceName } from '../../../sources/device';
import { Device } from '../../../sources/device';
import { CoresProviders, noop } from '../../real/providers';
import { boostablePost } from '../../real/screens';
import {
  durationOf,
  endedCampaign,
  endedCampaigns,
} from '../../flows/after-boost/fixtures';
import { BoostPostCompactModal } from '../purchase/BoostCompact';
import { BoostLiveRedesign } from '../purchase/BoostRedesign';
import { BoostStripCompact } from '../purchase/BoostStrip';
import { StartupsRibbonCard } from '../purchase/StartupsRibbonPromo';
import { BoostAgainModal } from './BoostAgainModal';
import { BoostsTab } from './BoostsPage';
import type { LimitedReachReason } from './CombinedAnalytics';
import {
  AnalyticsTab,
  BoostedChip,
  CombinedAnalytics,
  LimitedReachChip,
  limitedReach,
} from './CombinedAnalytics';

// Every width, tab, data case and pop-up of "Boost and analytics", for a
// careful review (the "All states" story). Pages render in devices of their
// own width, so each shows its real breakpoint; pop-ups open inside their
// device; small parts render frozen beside each other.

const sections = [
  { id: 'analytics-widths', title: 'Analytics tab · every width' },
  { id: 'boost-widths', title: 'Boost tab · every width' },
  { id: 'analytics-cases', title: 'Analytics tab · data cases' },
  { id: 'boost-cases', title: 'Boost tab · data cases' },
  { id: 'chips', title: 'Post chips and reach notes' },
  { id: 'strip', title: 'Own post strip' },
  { id: 'form', title: 'Boost your post' },
  { id: 'offer', title: 'Startups offer' },
  { id: 'live', title: 'Boost is live!' },
  { id: 'again', title: 'Boost again' },
  { id: 'light', title: 'Light theme' },
];

const Section = ({
  id,
  lead,
  children,
}: {
  id: string;
  lead: ReactNode;
  children: ReactNode;
}): ReactElement => {
  const title = sections.find((section) => section.id === id)?.title;

  return (
    <section id={id} className="flex scroll-mt-6 flex-col gap-5">
      <div className="flex flex-col gap-2">
        <h2 className="font-bold typo-title1">{title}</h2>
        <div className="max-w-[90ch] text-text-secondary typo-callout">
          {lead}
        </div>
      </div>
      {children}
    </section>
  );
};

const Row = ({ children }: { children: ReactNode }): ReactElement => (
  <div className="grid grid-cols-1 items-start gap-6 laptop:grid-cols-2">
    {children}
  </div>
);

/** Phone beside laptop, the phone kept to its own width */
const PhoneAndLaptop = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => (
  <div className="grid grid-cols-1 items-start gap-6 laptop:grid-cols-[23.5rem_1fr]">
    {children}
  </div>
);

type FrameModalProps = Pick<ModalProps, 'parentSelector' | 'bodyOpenClassName'>;

/** Opens a pop-up inside its device rather than over the catalog */
const ModalHost = ({
  children,
}: {
  children: (modalProps: FrameModalProps) => ReactNode;
}): ReactElement => {
  const [host, setHost] = useState<HTMLDivElement | null>(null);

  return (
    <>
      <div ref={setHost} />
      {host &&
        children({ parentSelector: () => host, bodyOpenClassName: null })}
    </>
  );
};

/** Reports its content's height, read in the device frame's own window */
const FitHeight = ({
  onHeight,
  children,
}: {
  onHeight: (height: number) => void;
  children: ReactNode;
}): ReactElement => {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const element = ref.current;
    const view = element?.ownerDocument.defaultView;
    if (!element || !view) {
      return undefined;
    }
    const observer = new view.ResizeObserver(() =>
      onHeight(Math.ceil(element.scrollHeight)),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [onHeight]);

  return <div ref={ref}>{children}</div>;
};

/** A page in a device as tall as the page, so nothing scrolls or trails */
const Analytics = ({
  device,
  label,
  theme,
  ...props
}: React.ComponentProps<typeof CombinedAnalytics> & {
  device: DeviceName;
  label?: string;
  theme?: 'dark' | 'light';
}): ReactElement => {
  const [height, setHeight] = useState(800);

  return (
    <Device
      device={device}
      label={label}
      url="/analytics"
      height={Math.max(height, 480)}
      theme={theme}
    >
      <FitHeight onHeight={setHeight}>
        <CombinedAnalytics {...props} />
      </FitHeight>
    </Device>
  );
};

const newPost = {
  ...boostablePost,
  id: 'sb-new-post',
  createdAt: new Date().toISOString(),
  tags: [],
} as Post;

const BoostForm = ({
  device,
  label,
  balance,
  post = boostablePost,
  initialMode,
  theme,
}: {
  device: DeviceName;
  label: string;
  balance: number;
  post?: Post;
  initialMode?: 'starter' | 'custom';
  theme?: 'dark' | 'light';
}): ReactElement => (
  <Device device={device} label={label} url={`/posts/${post.id}`} theme={theme}>
    <CoresProviders
      balance={balance}
      activePage="/posts/sb-boost-post"
      hasOwnLayout
    >
      <ModalHost>
        {(modalProps) => (
          <BoostPostCompactModal
            post={post}
            initialMode={initialMode}
            onBuyCores={noop}
            onBoost={noop}
            onRequestClose={noop}
            modalProps={modalProps}
          />
        )}
      </ModalHost>
    </CoresProviders>
  </Device>
);

const lastBoost = {
  days: durationOf(endedCampaign),
  coresPerDay: Math.round(
    (endedCampaign.flags.budget ?? 0) / durationOf(endedCampaign),
  ),
};

const BoostAgain = ({
  device,
  label,
  isSuccess,
}: {
  device: DeviceName;
  label: string;
  isSuccess?: boolean;
}): ReactElement => (
  <Device device={device} label={label} url="/notifications">
    <ModalHost>
      {(modalProps) => (
        <BoostAgainModal
          {...modalProps}
          isOpen
          post={endedCampaign.post as Post}
          lastBoost={lastBoost}
          initialScreen={isSuccess ? 'SUCCESS' : undefined}
          onRequestClose={noop}
          onSeeBoost={noop}
        />
      )}
    </ModalHost>
  </Device>
);

const Strip = ({
  device,
  title,
}: {
  device: DeviceName;
  title: ReactNode;
}): ReactElement => (
  <Device device={device} height={120} url="/posts/sb-boost-post">
    <div className="p-4">
      <BoostStripCompact title={title} onBoost={noop} onDismiss={noop} />
    </div>
  </Device>
);

const newTitle = (
  <>
    Boost to reach <strong>10k more devs</strong> now!
  </>
);

const takingOffTitle = (
  <>
    <strong>This post is taking off.</strong> Boost it now!
  </>
);

/** The ribbon card with and without the launch offer */
const OfferCards = (): ReactElement => {
  const promo = useStartupsPromo({ spot: StartupsPromoSpot.BoostPost });
  const launchOffer = promo.launchOffer ?? {
    cashback: promo.cashback,
    monthlyCredits: promo.monthlyCredits,
  };
  const ownRate = getStartupsStarterOffer(null);

  return (
    <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
      {[
        { label: 'During the launch offer', promo: { ...promo, launchOffer } },
        {
          label: 'Starter’s own rate',
          promo: { ...promo, ...ownRate, launchOffer: undefined },
        },
      ].map((card) => (
        <div key={card.label} className="flex flex-col gap-2">
          <span className="font-bold text-text-tertiary typo-caption1">
            {card.label}
          </span>
          <div className="max-w-[26.25rem]">
            <StartupsRibbonCard promo={card.promo} />
          </div>
        </div>
      ))}
    </div>
  );
};

const reasonLabels: Record<LimitedReachReason, string> = {
  ai_written: 'Reads as AI-written',
  promotional: 'Mostly about a product',
  oversold_title: 'Title oversells the post',
  language: 'Not in English',
};

export const AllStatesPage = (): ReactElement => (
  <div className="flex flex-col gap-16 bg-background-default px-6 py-10 text-text-primary laptop:px-10">
    <header className="flex flex-col gap-4">
      <h1 className="font-bold typo-mega2">Boost and analytics · All states</h1>
      <p className="max-w-[90ch] text-text-secondary typo-body">
        Each frame is a real width, frozen in one state. Pages show their own
        content; production’s sidebar and header go around them as in the
        numbered stories. Pop-ups open inside their frame.
      </p>
      <nav className="flex flex-wrap gap-2">
        {sections.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className="rounded-10 bg-surface-float px-3 py-1 typo-footnote hover:bg-surface-hover"
          >
            {section.title}
          </a>
        ))}
      </nav>
    </header>

    <Section
      id="analytics-widths"
      lead="Every post, boosted or not. The metric strip drives a 14-day chart with Boosted stacked on Organic; the legend toggles each layer. Your posts carries the Boosted and Limited reach chips; AI agents is locked without a Startups plan. Phones: the metric strip scrolls sideways and the table drops Comments."
    >
      <Analytics device="laptopL" />
      <Row>
        <Analytics device="tablet" />
        <Analytics device="phone" />
      </Row>
    </Section>

    <Section
      id="boost-widths"
      lead="Only the boosts: Impressions, Clicks on post, CTR, Users and Spend over one blue chart, then Live and Ended. Tablet and up: a table with Stop and Extend per row. Phones: a compact card per boost. Docs and Terms sit in the header."
    >
      <Analytics device="laptopL" initialTab={AnalyticsTab.Boost} />
      <Row>
        <Analytics device="tablet" initialTab={AnalyticsTab.Boost} />
        <Analytics device="phone" initialTab={AnalyticsTab.Boost} />
      </Row>
    </Section>

    <Section
      id="analytics-cases"
      lead="The chart's states and the data that changes the page: a muted layer leaves the totals to the other one, and the last layer showing can't be muted. With no boosts, the chart is organic alone, with no legend and no Boosted chips."
    >
      <Row>
        <Analytics
          device="laptop"
          label="Boosted muted"
          initialHidden={['Boosted']}
        />
        <Analytics
          device="laptop"
          label="Organic muted"
          initialHidden={['Organic']}
        />
        <Analytics
          device="laptop"
          label="Another metric picked · Upvotes"
          initialMetric="upvotes"
        />
        <Analytics device="laptop" label="Nothing boosted yet" campaigns={[]} />
      </Row>
      <PhoneAndLaptop>
        <Analytics
          device="phone"
          label="On a Startups plan · phone"
          hasStartupsPlan
        />
        <Analytics
          device="laptop"
          label="On a Startups plan · AI agents open"
          hasStartupsPlan
        />
      </PhoneAndLaptop>
    </Section>

    <Section
      id="boost-cases"
      lead="The Live and Ended tabs with and without boosts. Ended rows have Boost again as their only action. With nothing boosted, the chart goes and the empty state takes its place."
    >
      <PhoneAndLaptop>
        <Analytics
          device="phone"
          label="Ended tab · phone"
          initialTab={AnalyticsTab.Boost}
          initialBoostsTab={BoostsTab.Ended}
        />
        <Analytics
          device="laptop"
          label="Nothing live, only ended boosts"
          initialTab={AnalyticsTab.Boost}
          campaigns={endedCampaigns}
        />
      </PhoneAndLaptop>
      <PhoneAndLaptop>
        <Analytics
          device="phone"
          label="No boosts yet · phone"
          initialTab={AnalyticsTab.Boost}
          campaigns={[]}
        />
        <Analytics
          device="laptop"
          label="No boosts yet"
          initialTab={AnalyticsTab.Boost}
          campaigns={[]}
        />
      </PhoneAndLaptop>
    </Section>

    <Section
      id="chips"
      lead="Chips under a post's title in Your posts. Boosted opens the Boost tab. Limited reach shows production's note for its reason on hover and opens the docs on click; the four notes are below."
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-4">
          <span className="w-56 text-text-tertiary typo-footnote">Boosted</span>
          <BoostedChip onClick={noop} />
        </div>
        {(Object.keys(limitedReach) as LimitedReachReason[]).map((reason) => (
          <div
            key={reason}
            className="flex flex-col gap-2 border-t border-border-subtlest-tertiary pt-3 tablet:flex-row tablet:items-start tablet:gap-4"
          >
            <span className="w-56 shrink-0 text-text-tertiary typo-footnote">
              Limited reach · {reasonLabels[reason]}
            </span>
            <span className="shrink-0">
              <LimitedReachChip reason={reason} />
            </span>
            <p className="max-w-[60ch] text-text-secondary typo-footnote">
              {limitedReach[reason].body}
            </p>
          </div>
        ))}
      </div>
    </Section>

    <Section
      id="strip"
      lead="On your own post, under the title: the reach a boost adds, Boost, and the close button. A post that is taking off gets its own title."
    >
      <PhoneAndLaptop>
        <Strip device="phone" title={newTitle} />
        <Strip device="laptop" title={newTitle} />
        <Strip device="phone" title={takingOffTitle} />
        <Strip device="laptop" title={takingOffTitle} />
      </PhoneAndLaptop>
    </Section>

    <Section
      id="form"
      lead="Quick is a one-tap preset; Custom opens the sliders. The post's numbers sit in one strip under its title. Short of Cores, the button buys them; a post still being read shows a loader for its reach."
    >
      <PhoneAndLaptop>
        <BoostForm device="phone" label="Quick · phone" balance={2420} />
        <BoostForm
          device="laptop"
          label="Quick · enough Cores"
          balance={2420}
        />
        <BoostForm
          device="phone"
          label="Custom · phone"
          balance={2420}
          initialMode="custom"
        />
        <BoostForm
          device="laptop"
          label="Custom"
          balance={2420}
          initialMode="custom"
        />
        <BoostForm
          device="phone"
          label="Not enough Cores · phone"
          balance={20}
        />
        <BoostForm device="laptop" label="Not enough Cores" balance={20} />
        <BoostForm
          device="phone"
          label="Reading the post · phone"
          balance={2420}
          post={newPost}
        />
        <BoostForm
          device="laptop"
          label="Reading the post"
          balance={2420}
          post={newPost}
        />
      </PhoneAndLaptop>
    </Section>

    <Section
      id="offer"
      lead="The Startups offer in the boost form. During the launch offer, its multiple sits on the onion ribbon, in white on both themes; without it, the card has no ribbon. See plans opens the checkout; the close button hides every Startups offer."
    >
      <OfferCards />
    </Section>

    <Section
      id="live"
      lead="After Boost post: the rocket art with a check badge, See your boost, and the docs."
    >
      <PhoneAndLaptop>
        <Device device="phone" url="/posts/sb-boost-post">
          <ModalHost>
            {(modalProps) => (
              <BoostLiveRedesign
                onSeeBoost={noop}
                onRequestClose={noop}
                modalProps={modalProps}
              />
            )}
          </ModalHost>
        </Device>
        <Device device="laptop" url="/posts/sb-boost-post">
          <ModalHost>
            {(modalProps) => (
              <BoostLiveRedesign
                onSeeBoost={noop}
                onRequestClose={noop}
                modalProps={modalProps}
              />
            )}
          </ModalHost>
        </Device>
      </PhoneAndLaptop>
    </Section>

    <Section
      id="again"
      lead="From the boost-ended notification or an ended row: the form prefilled with the last budget and days, then its own success screen."
    >
      <PhoneAndLaptop>
        <BoostAgain device="phone" label="Prefilled · phone" />
        <BoostAgain device="laptop" label="Prefilled" />
        <BoostAgain device="phone" label="Boost is live · phone" isSuccess />
        <BoostAgain device="laptop" label="Boost is live" isSuccess />
      </PhoneAndLaptop>
    </Section>

    <Section
      id="light"
      lead="The same pages and pop-ups in light mode: chips, chart layers, the locked AI agents veil and the ribbon text."
    >
      <Analytics device="laptopL" theme="light" />
      <Row>
        <Analytics
          device="laptop"
          label="Boost tab"
          theme="light"
          initialTab={AnalyticsTab.Boost}
        />
        <Analytics device="phone" theme="light" />
      </Row>
      <PhoneAndLaptop>
        <BoostForm
          device="phone"
          label="Boost your post · phone"
          balance={2420}
          theme="light"
        />
        <BoostForm
          device="laptop"
          label="Boost your post"
          balance={2420}
          theme="light"
        />
      </PhoneAndLaptop>
    </Section>
  </div>
);
