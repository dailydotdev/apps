import type { ReactElement } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AdGrid } from '@dailydotdev/shared/src/components/cards/ad/AdGrid';
import { AdList } from '@dailydotdev/shared/src/components/cards/ad/AdList';
import { SignalAdList } from '@dailydotdev/shared/src/components/cards/ad/SignalAdList';
import { PostSidebarAdWidget } from '@dailydotdev/shared/src/components/post/PostSidebarAdWidget';
import { AdAsComment } from '@dailydotdev/shared/src/components/comments/AdAsComment';
import type { Ad } from '@dailydotdev/shared/src/graphql/posts';
import { adImprovementsV3Feature } from '@dailydotdev/shared/src/lib/featureManagement';
import {
  AdProviders,
  Arm,
  arms,
  baseAd,
  carbonAd,
  COMMENT_POST_ID,
  longCopyAd,
  noCtaAd,
  noop,
  noReferralAd,
  Page,
  Section,
  SIDEBAR_POST_ID,
  taggedAd,
  type ArmConfig,
} from './adLabel.mocks';

// ---------------------------------------------------------------------------
// Experiment: `ad_label`
//
// Control names the advertiser under the ad ("Promoted by Vercel"). The
// treatments hide the advertiser and disclose with a plain "Ad", to see how
// disclosure wording moves ad CTR. Every ad surface and card use case is laid
// out here, control first, so the arms can be compared side by side.
// ---------------------------------------------------------------------------

const feedProps = { index: 0, feedIndex: 0, onLinkClick: noop };

const ArmRow = ({
  render,
  className,
  overrides,
}: {
  render: (arm: ArmConfig) => ReactElement;
  className?: string;
  overrides?: Record<string, unknown>;
}): ReactElement => (
  <div className="flex flex-wrap items-start gap-8">
    {arms.map((arm) => (
      <Arm
        key={arm.variant}
        arm={arm}
        className={className}
        overrides={overrides}
      >
        {render(arm)}
      </Arm>
    ))}
  </div>
);

const meta: Meta = {
  title: 'Experiments/Ad label',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A/B test `ad_label`: hide the advertiser on ad cards and disclose with a plain "Ad" instead of "Promoted by {advertiser}". Primary metric is ad CTR (clicks / impressions on `target_type: "ad"` events).',
      },
    },
  },
};

export default meta;

export const Brief: StoryObj = {
  name: '0. Experiment brief',
  render: () => (
    <Page>
      <div className="flex max-w-[48rem] flex-col gap-4 typo-callout">
        <h2 className="font-bold typo-title2">Ad label experiment</h2>
        <p className="text-text-tertiary">
          Ad cards currently name the advertiser under the creative
          (&quot;Promoted by Vercel&quot;) and carry an &quot;Advertise
          here&quot; self-promo. The hypothesis is that the advertiser name
          reads as a disclosure of a paid placement twice over, and that a
          single neutral &quot;Ad&quot; label lets the creative do the work —
          moving CTR.
        </p>
        <div className="flex flex-col gap-2">
          <span className="font-bold">Flag</span>
          <code className="text-text-tertiary typo-footnote">
            ad_label (string) — default: control
          </code>
        </div>
        <div className="flex flex-col gap-2">
          <span className="font-bold">Arms</span>
          <ul className="flex list-disc flex-col gap-1 pl-4 text-text-tertiary">
            {arms.map((arm) => (
              <li key={arm.variant}>
                <code>{arm.variant}</code> — {arm.summary}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-2">
          <span className="font-bold">Measurement</span>
          <p className="text-text-tertiary">
            All arms already emit the ad events built by <code>adLogEvent</code>{' '}
            — <code>impression</code> and <code>click</code> with{' '}
            <code>target_type: &quot;ad&quot;</code> and{' '}
            <code>target_id: ad.source</code>. CTR = ad clicks / ad impressions,
            split by experiment arm. Guardrails: revenue per mille, and the{' '}
            <code>advertise here cta</code> click rate, which variant B removes
            from the card entirely.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <span className="font-bold">Coverage today</span>
          <ul className="flex list-disc flex-col gap-1 pl-4 text-text-tertiary">
            <li>
              Feed grid + list cards — label swap and the &quot;Advertise
              here&quot; removal.
            </li>
            <li>
              Signal card and post sidebar widget — label swap only; both still
              print the company name elsewhere on the card.
            </li>
            <li>
              Ad as comment — <strong>not covered</strong>; it builds its own
              attribution string.
            </li>
            <li>
              The advertiser logo stays in every arm. Dropping it too would be a
              stronger &quot;de-brand the ad&quot; test.
            </li>
          </ul>
        </div>
      </div>
    </Page>
  ),
};

export const FeedGrid: StoryObj = {
  name: '1. Feed card — grid',
  render: () => (
    <AdProviders>
      <Page>
        <Section
          title="Feed ad card — grid"
          description="The default feed card. The attribution sits under the title, above the creative."
        >
          <ArmRow
            className="max-w-[24rem]"
            render={() => <AdGrid ad={baseAd} {...feedProps} />}
          />
        </Section>
      </Page>
    </AdProviders>
  ),
};

export const FeedList: StoryObj = {
  name: '2. Feed card — list',
  render: () => (
    <AdProviders>
      <Page>
        <Section
          title="Feed ad card — list"
          description="List mode puts the creative on the right; the attribution sits below the title, outside the clamp."
        >
          <ArmRow
            className="max-w-[40rem]"
            render={() => <AdList ad={baseAd} {...feedProps} />}
          />
        </Section>
      </Page>
    </AdProviders>
  ),
};

export const SignalCard: StoryObj = {
  name: '3. Signal feed card',
  render: () => (
    <AdProviders>
      <Page>
        <Section
          title="Signal ad card"
          description="The signal feed renders ads as a compact row: avatar, advertiser name, then the attribution after a separator."
          note={
            <>
              <strong>Advertiser still named.</strong> This card prints the
              company next to the avatar, so the treatments turn the line into
              &quot;Vercel · Ad&quot;. Hiding the advertiser here needs the name
              and avatar handled too — a product decision for the rollout.
            </>
          }
        >
          <ArmRow
            className="max-w-[30rem]"
            render={() => <SignalAdList ad={baseAd} {...feedProps} />}
          />
        </Section>
      </Page>
    </AdProviders>
  ),
};

export const SidebarWidget: StoryObj = {
  name: '4. Post sidebar widget',
  render: () => (
    <AdProviders>
      <Page>
        <Section
          title="Post sidebar ad — card"
          description="The boxed widget on the post page sidebar. It shares `AdAttribution`, so the label swaps with the flag."
          note={
            <>
              <strong>Advertiser still named.</strong> The company sits on its
              own bold line above the attribution. The &quot;Advertise
              here&quot; removal is scoped to the feed cards, so the link stays
              here in every arm.
            </>
          }
        >
          <ArmRow
            className="max-w-[22rem]"
            render={() => <PostSidebarAdWidget postId={SIDEBAR_POST_ID} />}
          />
        </Section>
        <Section
          title="Post sidebar ad — inline"
          description="The flat in-content variant: company on the favicon line, attribution and advertise link below it."
        >
          <ArmRow
            className="max-w-[26rem]"
            render={() => (
              <PostSidebarAdWidget postId={SIDEBAR_POST_ID} variant="inline" />
            )}
          />
        </Section>
      </Page>
    </AdProviders>
  ),
};

export const AdComment: StoryObj = {
  name: '5. Ad as comment',
  render: () => (
    <AdProviders>
      <Page>
        <Section
          title="Ad as comment"
          description="The ad rendered inside the post's comment thread."
          note={
            <>
              <strong>Not covered by the flag today.</strong> This component
              builds its own &quot;Promoted by {'{advertiser}'}&quot; string
              instead of using the shared <code>AdAttribution</code>, so all
              three arms look identical. Moving it onto the shared component is
              part of the product implementation.
            </>
          }
        >
          <ArmRow
            className="max-w-[36rem]"
            render={() => <AdAsComment postId={COMMENT_POST_ID} />}
          />
        </Section>
      </Page>
    </AdProviders>
  ),
};

const useCases: Array<{
  title: string;
  description: string;
  ad: Ad;
  overrides?: Record<string, unknown>;
  isPlus?: boolean;
}> = [
  {
    title: 'No call to action',
    description:
      'Without `callToAction` the row starts with the advertise link — so variant B leaves only "Remove".',
    ad: noCtaAd,
  },
  {
    title: 'No referral link',
    description:
      'Control degrades to a bare "Promoted" (no advertiser to name), which makes it the closest arm to the treatments.',
    ad: noReferralAd,
  },
  {
    title: 'Network creative (Carbon)',
    description:
      'Carbon and EthicalAds creatives render contained over a blurred copy of themselves.',
    ad: carbonAd,
  },
  {
    title: 'Long copy',
    description: 'A description long enough to push the attribution down.',
    ad: longCopyAd,
  },
  {
    title: 'Matching tags (ad_improvements_v3)',
    description:
      'With `ad_improvements_v3` on, matched tags render between the copy and the attribution.',
    ad: taggedAd,
    overrides: { [adImprovementsV3Feature.id]: true },
  },
  {
    title: 'Plus subscriber',
    description: 'Plus members never see the "Remove" upsell.',
    ad: baseAd,
    isPlus: true,
  },
];

export const UseCases: StoryObj = {
  name: '6. Use cases',
  render: () => (
    <Page>
      {useCases.map((useCase) => (
        <AdProviders key={useCase.title} isPlus={useCase.isPlus}>
          <Section title={useCase.title} description={useCase.description}>
            <ArmRow
              className="max-w-[24rem]"
              overrides={useCase.overrides}
              render={() => <AdGrid ad={useCase.ad} {...feedProps} />}
            />
          </Section>
        </AdProviders>
      ))}
    </Page>
  ),
};

export const ControlOnly: StoryObj = {
  name: 'Reference — control, every surface',
  render: () => (
    <AdProviders>
      <Page>
        <Section
          title="Today's production look"
          description="Every ad surface as it renders on main, with the flag at its default."
        >
          <div className="flex flex-wrap items-start gap-8">
            <div className="w-full max-w-[24rem]">
              <AdGrid ad={baseAd} {...feedProps} />
            </div>
            <div className="w-full max-w-[40rem]">
              <AdList ad={baseAd} {...feedProps} />
            </div>
            <div className="w-full max-w-[30rem]">
              <SignalAdList ad={baseAd} {...feedProps} />
            </div>
            <div className="w-full max-w-[22rem]">
              <PostSidebarAdWidget postId={SIDEBAR_POST_ID} />
            </div>
            <div className="w-full max-w-[26rem]">
              <PostSidebarAdWidget postId={SIDEBAR_POST_ID} variant="inline" />
            </div>
            <div className="w-full max-w-[36rem]">
              <AdAsComment postId={COMMENT_POST_ID} />
            </div>
          </div>
        </Section>
      </Page>
    </AdProviders>
  ),
};

export const Treatment: StoryObj = {
  name: 'Reference — variant B, every surface',
  render: () => (
    <AdProviders>
      <Page>
        <Section
          title="ad_only, every surface"
          description="The strictest arm: advertiser hidden behind a plain 'Ad', no advertise link on the feed cards."
        >
          <Arm arm={arms[2]} className="max-w-none">
            <div className="flex flex-wrap items-start gap-8">
              <div className="w-full max-w-[24rem]">
                <AdGrid ad={baseAd} {...feedProps} />
              </div>
              <div className="w-full max-w-[40rem]">
                <AdList ad={baseAd} {...feedProps} />
              </div>
              <div className="w-full max-w-[30rem]">
                <SignalAdList ad={baseAd} {...feedProps} />
              </div>
              <div className="w-full max-w-[22rem]">
                <PostSidebarAdWidget postId={SIDEBAR_POST_ID} />
              </div>
              <div className="w-full max-w-[26rem]">
                <PostSidebarAdWidget
                  postId={SIDEBAR_POST_ID}
                  variant="inline"
                />
              </div>
              <div className="w-full max-w-[36rem]">
                <AdAsComment postId={COMMENT_POST_ID} />
              </div>
            </div>
          </Arm>
        </Section>
      </Page>
    </AdProviders>
  ),
};
