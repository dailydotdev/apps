import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { AdGrid } from '@dailydotdev/shared/src/components/cards/ad/AdGrid';
import { AdList } from '@dailydotdev/shared/src/components/cards/ad/AdList';
import { SignalAdList } from '@dailydotdev/shared/src/components/cards/ad/SignalAdList';
import { PostSidebarAdWidget } from '@dailydotdev/shared/src/components/post/PostSidebarAdWidget';
import { AdAsComment } from '@dailydotdev/shared/src/components/comments/AdAsComment';

import { ArticleGrid } from '@dailydotdev/shared/src/components/cards/article/ArticleGrid';
import { ShareGrid } from '@dailydotdev/shared/src/components/cards/share/ShareGrid';
import { CollectionGrid } from '@dailydotdev/shared/src/components/cards/collection/CollectionGrid';
import { FreeformGrid } from '@dailydotdev/shared/src/components/cards/Freeform/FreeformGrid';
import PollGrid from '@dailydotdev/shared/src/components/cards/poll/PollGrid';

import { ArticleList } from '@dailydotdev/shared/src/components/cards/article/ArticleList';
import { ShareList } from '@dailydotdev/shared/src/components/cards/share/ShareList';
import { CollectionList } from '@dailydotdev/shared/src/components/cards/collection/CollectionList';
import { FreeformList } from '@dailydotdev/shared/src/components/cards/Freeform/FreeformList';
import { PollList } from '@dailydotdev/shared/src/components/cards/poll/PollList';
import { SignalList } from '@dailydotdev/shared/src/components/cards/common/list/SignalList';

import {
  adImprovementsV3Feature,
  AdLabelVariant,
  featureAdLabel,
} from '@dailydotdev/shared/src/lib/featureManagement';

import {
  AdProviders,
  baseAd,
  COMMENT_POST_ID,
  Page,
  Section,
  SIDEBAR_POST_ID,
} from '../../experiments/adLabel.mocks';
import type { Slot } from './adPlacements.mocks';
import {
  actionHandlers,
  adProps,
  articlePost,
  collectionPost,
  defaultToolbar,
  DeviceFrame,
  isEmbedded,
  freeformPost,
  longCopyAd,
  networkAd,
  pollPost,
  shortCopyAd,
  SlotGrid,
  SlotStack,
  sharePost,
  taggedAd,
  Toolbar,
  videoPost,
  withFlags,
} from './adPlacements.mocks';

// ---------------------------------------------------------------------------
// Every placement an ad can take, lined up against the post-type cards it sits
// between in the same feed. The point of the page is the seam: source image,
// title, tags, metadata line, cover image and the bottom action row should read
// as one card family whichever slot they land in, and a row of cards should
// resolve to one height.
// ---------------------------------------------------------------------------

const gridSlots = (v3Tags: boolean): Slot[] => [
  {
    key: 'grid-article',
    label: 'Article',
    node: <ArticleGrid post={articlePost} {...actionHandlers} />,
  },
  {
    key: 'grid-ad',
    label: 'Ad (AdGrid)',
    isAd: true,
    node: <AdGrid ad={v3Tags ? taggedAd : shortCopyAd} {...adProps} />,
  },
  {
    key: 'grid-share',
    label: 'Share',
    node: <ShareGrid post={sharePost} {...actionHandlers} />,
  },
  {
    key: 'grid-collection',
    label: 'Collection',
    node: <CollectionGrid post={collectionPost} {...actionHandlers} />,
  },
  {
    key: 'grid-ad-long',
    label: 'Ad, long copy',
    isAd: true,
    node: <AdGrid ad={longCopyAd} {...adProps} />,
  },
  {
    key: 'grid-freeform',
    label: 'Freeform',
    node: <FreeformGrid post={freeformPost} {...actionHandlers} />,
  },
  {
    key: 'grid-video',
    label: 'Video',
    node: <ArticleGrid post={videoPost} {...actionHandlers} />,
  },
  {
    key: 'grid-ad-network',
    label: 'Ad, network creative',
    isAd: true,
    node: <AdGrid ad={networkAd} {...adProps} />,
  },
  {
    key: 'grid-poll',
    label: 'Poll',
    node: <PollGrid post={pollPost} {...actionHandlers} />,
  },
];

const listSlots = (v3Tags: boolean): Slot[] => [
  {
    key: 'list-article',
    label: 'Article',
    node: <ArticleList post={articlePost} {...actionHandlers} />,
  },
  {
    key: 'list-ad',
    label: 'Ad (AdList)',
    isAd: true,
    node: <AdList ad={v3Tags ? taggedAd : shortCopyAd} {...adProps} />,
  },
  {
    key: 'list-share',
    label: 'Share',
    node: <ShareList post={sharePost} {...actionHandlers} />,
  },
  {
    key: 'list-collection',
    label: 'Collection',
    node: <CollectionList post={collectionPost} {...actionHandlers} />,
  },
  {
    key: 'list-ad-long',
    label: 'Ad, long copy',
    isAd: true,
    node: <AdList ad={longCopyAd} {...adProps} />,
  },
  {
    key: 'list-freeform',
    label: 'Freeform',
    node: <FreeformList post={freeformPost} {...actionHandlers} />,
  },
  {
    key: 'list-poll',
    label: 'Poll',
    node: <PollList post={pollPost} {...actionHandlers} />,
  },
];

const signalSlots = (v3Tags: boolean): Slot[] => [
  {
    key: 'signal-article',
    label: 'Article',
    node: <SignalList post={articlePost} {...actionHandlers} />,
  },
  {
    key: 'signal-ad',
    label: 'Ad (SignalAdList)',
    isAd: true,
    node: <SignalAdList ad={v3Tags ? taggedAd : shortCopyAd} {...adProps} />,
  },
  {
    key: 'signal-share',
    label: 'Share',
    node: <SignalList post={sharePost} {...actionHandlers} />,
  },
];

const postPageSlots: Slot[] = [
  {
    key: 'sidebar-card',
    label: 'Ad, post sidebar (card)',
    isAd: true,
    width: '22rem',
    node: <PostSidebarAdWidget postId={SIDEBAR_POST_ID} />,
  },
  {
    key: 'sidebar-inline',
    label: 'Ad, post sidebar (inline)',
    isAd: true,
    width: '26rem',
    node: <PostSidebarAdWidget postId={SIDEBAR_POST_ID} variant="inline" />,
  },
  {
    key: 'comment',
    label: 'Ad, as a comment',
    isAd: true,
    width: '36rem',
    node: <AdAsComment postId={COMMENT_POST_ID} />,
  },
];

interface AnatomyRow {
  element: string;
  left: string;
  right: string;
  aligned: boolean;
}

const gridAnatomy: AnatomyRow[] = [
  {
    element: 'Source image',
    left: 'AuthorSourceStack: 32px author square in front, 32px source circle behind, opens on hover',
    right:
      'AdFavicon: one 32px circle (advertiser favicon), no stack, no hover card',
    aligned: false,
  },
  {
    element: 'Header inset',
    left: 'Avatar lines up with the title (mx-1.5 cancels the header -mx-1.5)',
    right:
      'Favicon gets mx-4 on the header itself, so its left edge depends on which margin utility wins',
    aligned: false,
  },
  {
    element: 'Header actions',
    left: 'Read post button plus the options menu, revealed on hover',
    right: 'None',
    aligned: false,
  },
  {
    element: 'Title',
    left: 'CardTitle, typo-title3, bold, line-clamp-3',
    right:
      'CardTitle, typo-title3, bold, line-clamp-3 (renders ad.description)',
    aligned: true,
  },
  {
    element: 'Tags row',
    left: 'PostTags, always rendered',
    right: 'PostTags on matchingTags, only while ad_improvements_v3 is on',
    aligned: false,
  },
  {
    element: 'Metadata line',
    left: 'PostMetadata: date, separator, read time',
    right:
      'AdAttribution: "Promoted by {advertiser}" (or "Ad" in the ad_label treatments)',
    aligned: false,
  },
  {
    element: 'Cover image',
    left: 'CardCover, h-40, rounded-12, px-1 side inset',
    right: 'AdImage on the same CardImage: h-40, rounded-12, mx-1 side inset',
    aligned: true,
  },
  {
    element: 'Bottom row',
    left: 'ActionButtons: upvote, comment, bookmark, copy link',
    right:
      '"Advertise here" and "Remove ads". The card can also render a primary CTA button, but served creatives carry no callToAction, so it never appears',
    aligned: false,
  },
  {
    element: 'Card height floor',
    left: 'min-h-card (24rem)',
    right:
      'No minimum: the ad card is only as tall as its content, so it can be the short one in a row',
    aligned: false,
  },
];

const placementAnatomy: AnatomyRow[] = [
  {
    element: 'Source image',
    left: 'Feed ad card and post sidebar widget both resolve it through getAdFaviconImageLink',
    right:
      'Ad as a comment uses the creative (ad.image) as its avatar, so the same ad shows a different source image on the post page',
    aligned: false,
  },
  {
    element: 'Title line',
    left: 'Sidebar widget leads with the company name, then the tagline in bold and the description',
    right:
      'Ad as a comment leads with the company, then repeats tagline plus description as one paragraph',
    aligned: true,
  },
  {
    element: 'Attribution',
    left: 'Sidebar widget shares AdAttribution, so the ad_label arms swap the wording',
    right:
      'Ad as a comment builds its own "Promoted by {advertiser}" string and ignores the flag',
    aligned: false,
  },
  {
    element: 'Call to action',
    left: 'Sidebar widget ships a "Visit" button',
    right: 'Ad as a comment has no button at all, only the whole-card link',
    aligned: false,
  },
];

const mobileAnatomy: AnatomyRow[] = [
  {
    element: 'Layout below laptop',
    left: 'Every post type falls back to its list card (useFeedLayout returns the mobile list layout under 1020px)',
    right:
      'The ad falls back to AdList too, so grid and list are the only two ad card layouts to review',
    aligned: true,
  },
  {
    element: 'Cover image',
    left: 'Stacks under the text and goes full width until mobileXL (500px), then sits on the right at w-40 / w-56',
    right:
      'AdImage uses the same list CardImage, so it follows the same stack-then-sidecar rule',
    aligned: true,
  },
  {
    element: 'Action row',
    left: 'ActionButtons move below the content on mobile (isMobile branch in ArticleList)',
    right:
      'The advertise and remove links stay in one row under the content at every width',
    aligned: false,
  },
  {
    element: 'Source line',
    left: '40px source avatar, source name and read time on their own line above the title',
    right:
      '32px favicon inline in the title block, no advertiser name line, attribution below the title',
    aligned: false,
  },
];

const removeAdAnatomy: AnatomyRow[] = [
  {
    element: 'Grid ad card',
    left: 'AdGrid passes variant=Tertiary, size Small',
    right: 'btn-tertiary-bacon: flat label on a transparent background',
    aligned: true,
  },
  {
    element: 'List ad card',
    left: 'AdList passes no variant, so RemoveAd falls back to its own Float default',
    right:
      'btn-tertiaryFloat-bacon: the same label sitting on an 8% filled surface, so it reads as a boxed button next to the flat grid one',
    aligned: false,
  },
  {
    element: 'Signal ad card',
    left: 'SignalAdList passes variant=Tertiary, icon only',
    right: 'Flat close icon, no label',
    aligned: true,
  },
  {
    element: 'Ad as a comment',
    left: 'AdAsComment passes variant=Tertiary, icon only',
    right: 'Flat close icon, no label',
    aligned: true,
  },
];

const AnatomyTable = ({
  caption,
  rows,
  headers = ['Post card', 'Ad card'],
}: {
  caption: string;
  rows: AnatomyRow[];
  headers?: [string, string];
}): ReactElement => (
  <div className="w-full overflow-x-auto">
    <table className="w-full min-w-[52rem] border-collapse text-left typo-footnote">
      <caption className="mb-2 text-left font-bold text-text-primary typo-callout">
        {caption}
      </caption>
      <thead>
        <tr className="text-text-tertiary">
          <th className="w-40 border-b border-border-subtlest-tertiary py-2 pr-4 font-normal">
            Element
          </th>
          <th className="border-b border-border-subtlest-tertiary py-2 pr-4 font-normal">
            {headers[0]}
          </th>
          <th className="border-b border-border-subtlest-tertiary py-2 pr-4 font-normal">
            {headers[1]}
          </th>
          <th className="w-24 border-b border-border-subtlest-tertiary py-2 font-normal">
            Match
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.element} className="align-top">
            <td className="border-b border-border-subtlest-tertiary py-2 pr-4 font-bold text-text-primary">
              {row.element}
            </td>
            <td className="border-b border-border-subtlest-tertiary py-2 pr-4 text-text-tertiary">
              {row.left}
            </td>
            <td className="border-b border-border-subtlest-tertiary py-2 pr-4 text-text-tertiary">
              {row.right}
            </td>
            <td
              className={
                row.aligned
                  ? 'border-b border-border-subtlest-tertiary py-2 text-action-upvote-default'
                  : 'border-b border-border-subtlest-tertiary py-2 text-accent-ketchup-default'
              }
            >
              {row.aligned ? 'consistent' : 'differs'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const useToolbar = () => {
  const [state, setState] = useState(defaultToolbar);

  return {
    state,
    toolbar: isEmbedded() ? null : (
      <Toolbar state={state} onChange={setState} />
    ),
  };
};

const StoryPage = ({ children }: { children: ReactNode }): ReactElement => (
  <AdProviders>
    <Page>{children}</Page>
  </AdProviders>
);

const GridFeedPage = (): ReactElement => {
  const { state, toolbar } = useToolbar();

  return (
    <StoryPage>
      {toolbar}
      <Section
        title="Grid feed"
        description="The ad card sits in the same CSS grid as every post type, so a row resolves to one height. Read down the cards: source image, title, tags, metadata line, cover image, bottom row."
        note="Post cards carry a min-h-card floor; the ad card has none, so in a sparse row it is the card that decides how short the row can get."
      >
        {withFlags(
          { [adImprovementsV3Feature.id]: state.v3Tags },
          <SlotGrid
            slots={gridSlots(state.v3Tags)}
            showHeights={state.showHeights}
            showGuides={state.showGuides}
          />,
        )}
      </Section>
      <Section title="Anatomy">
        <AnatomyTable
          caption="Grid card, element by element"
          rows={gridAnatomy}
        />
      </Section>
    </StoryPage>
  );
};

const ListFeedPage = (): ReactElement => {
  const { state, toolbar } = useToolbar();

  return (
    <StoryPage>
      {toolbar}
      <Section
        title="List feed"
        description="List cards stack, so the seam to watch is the left rail: avatar size, title baseline, tag row and the thumbnail on the right should hold one vertical rhythm from post to ad and back."
        note="The post list card puts a 40px source avatar on its own header line above the title. The ad card inlines a 32px favicon inside the title block, so the ad title starts on a different baseline."
      >
        {withFlags(
          { [adImprovementsV3Feature.id]: state.v3Tags },
          <SlotStack
            slots={listSlots(state.v3Tags)}
            showHeights={state.showHeights}
            showGuides={state.showGuides}
          />,
        )}
      </Section>
      <Section
        title="Signal feed"
        description="The signal feed uses its own compact list row. SignalAdList is the ad that sits between SignalList posts."
      >
        {withFlags(
          { [adImprovementsV3Feature.id]: state.v3Tags },
          <SlotStack
            slots={signalSlots(state.v3Tags)}
            showHeights={state.showHeights}
            showGuides={state.showGuides}
          />,
        )}
      </Section>
      <Section title="Anatomy">
        <AnatomyTable
          caption="The remove-ads control, placement by placement"
          rows={removeAdAnatomy}
          headers={['What the placement passes', 'How it renders']}
        />
      </Section>
    </StoryPage>
  );
};

const OtherPlacementsPage = (): ReactElement => {
  const { state, toolbar } = useToolbar();

  return (
    <StoryPage>
      {toolbar}
      <Section
        title="Post page placements"
        description="These are not feed cards, so they do not line up with a post row. They are here because they render the same ad payload and should still use the same source image, title and CTA language."
        note="Boosted post ads are not on this page: the feed renders them through the regular post card, so they are consistent by construction. Squad ads (SquadAdGrid / SquadAdList) are also left out because they resolve their squad and members through live queries."
      >
        {withFlags(
          { [adImprovementsV3Feature.id]: state.v3Tags },
          <SlotStack
            slots={postPageSlots}
            showHeights={state.showHeights}
            showGuides={state.showGuides}
          />,
        )}
      </Section>
      <Section title="Anatomy">
        <AnatomyTable
          caption="Post page placements against the feed ad card"
          rows={placementAnatomy}
          headers={['Feed card and sidebar widget', 'Ad as a comment']}
        />
      </Section>
    </StoryPage>
  );
};

const arms: { variant: AdLabelVariant; label: string; summary: string }[] = [
  {
    variant: AdLabelVariant.Control,
    label: 'control',
    summary: '"Promoted by {advertiser}", both links inline',
  },
  {
    variant: AdLabelVariant.Ad,
    label: 'ad',
    summary: '"Ad", both links still inline',
  },
  {
    variant: AdLabelVariant.AdOnly,
    label: 'ad_only',
    summary: '"Ad"; the advertise link is dropped, Remove ads stays inline',
  },
];

const ArmColumn = ({
  variant,
  label,
  summary,
  state,
}: {
  variant: AdLabelVariant;
  label: string;
  summary: string;
  state: { showHeights: boolean; showGuides: boolean; v3Tags: boolean };
}): ReactElement => (
  <div className="flex w-80 shrink-0 flex-col gap-3">
    <div className="flex flex-col gap-1">
      <code className="font-bold text-text-primary typo-footnote">
        ad_label = {label}
      </code>
      <span className="text-text-tertiary typo-caption1">{summary}</span>
    </div>
    {withFlags(
      {
        [featureAdLabel.id]: variant,
        [adImprovementsV3Feature.id]: state.v3Tags,
      },
      <SlotGrid
        slots={[
          {
            key: `arm-${label}`,
            label: 'Ad card',
            isAd: true,
            node: <AdGrid ad={shortCopyAd} {...adProps} />,
          },
        ]}
        columns={1}
        showHeights={state.showHeights}
        showGuides={state.showGuides}
      />,
    )}
  </div>
);

const ArmsPage = (): ReactElement => {
  const { state, toolbar } = useToolbar();

  return (
    <StoryPage>
      {toolbar}
      <Section
        title="ad_label arms"
        description="The card keeps Advertise here and Remove ads visible in the card body. ad_only drops the advertise link and the remove link stays inline."
      >
        <div className="flex flex-row flex-nowrap items-start gap-8 overflow-x-auto pb-2">
          {arms.map((arm) => (
            <ArmColumn key={arm.variant} {...arm} state={state} />
          ))}
        </div>
      </Section>
    </StoryPage>
  );
};

const MOBILE_CANVAS_ID =
  'components-cards-ad-placement-consistency--mobile-canvas';

const MobileCanvasPage = (): ReactElement => {
  const { state, toolbar } = useToolbar();

  return (
    <StoryPage>
      {toolbar}
      <Section title="List cards at the frame width">
        {withFlags(
          { [adImprovementsV3Feature.id]: state.v3Tags },
          <SlotStack
            slots={listSlots(state.v3Tags)}
            fit="viewport"
            showHeights={state.showHeights}
            showGuides={state.showGuides}
          />,
        )}
      </Section>
      <Section title="Signal feed">
        {withFlags(
          { [adImprovementsV3Feature.id]: state.v3Tags },
          <SlotStack
            slots={signalSlots(state.v3Tags)}
            fit="viewport"
            showHeights={state.showHeights}
            showGuides={state.showGuides}
          />,
        )}
      </Section>
    </StoryPage>
  );
};

const MobilePage = (): ReactElement => (
  <StoryPage>
    <Section
      title="Mobile and tablet"
      description="Every feed below laptop (1020px) renders the list layout, so this is the ad card most users actually see. Each frame is a real viewport, so the mobile list card shows its own layout: the cover stacks under the text and the action row moves below it."
    >
      <div className="flex w-full flex-row flex-nowrap items-start gap-8 overflow-x-auto pb-2">
        <DeviceFrame
          label="Phone"
          storyId={MOBILE_CANVAS_ID}
          width={390}
          height={1700}
        />
        <DeviceFrame
          label="Large phone"
          storyId={MOBILE_CANVAS_ID}
          width={430}
          height={1700}
        />
        <DeviceFrame
          label="Tablet"
          storyId={MOBILE_CANVAS_ID}
          width={820}
          height={1700}
        />
      </div>
    </Section>
    <Section title="Anatomy">
      <AnatomyTable
        caption="List card on mobile, element by element"
        rows={mobileAnatomy}
      />
      <AnatomyTable
        caption="The remove-ads control, placement by placement"
        rows={removeAdAnatomy}
        headers={['What the placement passes', 'How it renders']}
      />
    </Section>
  </StoryPage>
);

const AllPlacementsPage = (): ReactElement => {
  const { state, toolbar } = useToolbar();

  return (
    <StoryPage>
      {toolbar}
      <Section
        title="1. Grid feed"
        description="Ad cards between every post type, in one grid, so a row resolves to a single height."
      >
        {withFlags(
          { [adImprovementsV3Feature.id]: state.v3Tags },
          <SlotGrid
            slots={gridSlots(state.v3Tags)}
            showHeights={state.showHeights}
            showGuides={state.showGuides}
          />,
        )}
      </Section>
      <Section title="2. List feed">
        {withFlags(
          { [adImprovementsV3Feature.id]: state.v3Tags },
          <SlotStack
            slots={listSlots(state.v3Tags)}
            showHeights={state.showHeights}
            showGuides={state.showGuides}
          />,
        )}
      </Section>
      <Section title="3. Signal feed">
        {withFlags(
          { [adImprovementsV3Feature.id]: state.v3Tags },
          <SlotStack
            slots={signalSlots(state.v3Tags)}
            showHeights={state.showHeights}
            showGuides={state.showGuides}
          />,
        )}
      </Section>
      <Section
        title="4. ad_label arms"
        description="The ad_only arm drops the Advertise here link from the card body; the remove link stays inline."
      >
        <div className="flex flex-row flex-nowrap items-start gap-8 overflow-x-auto pb-2">
          {arms.map((arm) => (
            <ArmColumn key={arm.variant} {...arm} state={state} />
          ))}
        </div>
      </Section>
      <Section
        title="5. Mobile and tablet"
        description="Below laptop every feed renders the list layout, so this is the ad card most users see. Each frame is a real viewport."
      >
        <div className="flex w-full flex-row flex-nowrap items-start gap-8 overflow-x-auto pb-2">
          <DeviceFrame
            label="Phone"
            storyId={MOBILE_CANVAS_ID}
            width={390}
            height={1200}
          />
          <DeviceFrame
            label="Tablet"
            storyId={MOBILE_CANVAS_ID}
            width={820}
            height={1200}
          />
        </div>
      </Section>
      <Section
        title="6. Post page placements"
        description="Same ad payload, off the feed grid."
      >
        {withFlags(
          { [adImprovementsV3Feature.id]: state.v3Tags },
          <SlotStack
            slots={postPageSlots}
            showHeights={state.showHeights}
            showGuides={state.showGuides}
          />,
        )}
      </Section>
      <Section title="7. Anatomy">
        <AnatomyTable
          caption="Grid card, element by element"
          rows={gridAnatomy}
        />
        <AnatomyTable
          caption="List card on mobile, element by element"
          rows={mobileAnatomy}
        />
        <AnatomyTable
          caption="The remove-ads control, placement by placement"
          rows={removeAdAnatomy}
          headers={['What the placement passes', 'How it renders']}
        />
        <AnatomyTable
          caption="Post page placements against the feed ad card"
          rows={placementAnatomy}
          headers={['Feed card and sidebar widget', 'Ad as a comment']}
        />
      </Section>
    </StoryPage>
  );
};

const meta: Meta = {
  title: 'Components/Cards/Ad Placement Consistency',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `Every ad placement lined up against every post type, so the ad card can be read as one of the family: source image, title, tag row, metadata line, cover image, bottom action row and card height. Served with the ${baseAd.company} fixture.`,
      },
    },
  },
};

export default meta;

type Story = StoryObj;

export const AllPlacements: Story = {
  render: () => <AllPlacementsPage />,
  name: 'All placements',
};

export const GridFeed: Story = {
  render: () => <GridFeedPage />,
  name: 'Grid feed',
};

export const ListFeed: Story = {
  render: () => <ListFeedPage />,
  name: 'List and signal feeds',
};

export const Arms: Story = {
  render: () => <ArmsPage />,
  name: 'ad_label arms',
};

export const Mobile: Story = {
  render: () => <MobilePage />,
  name: 'Mobile and tablet (list layout)',
};

// The canvas the mobile frames embed. Kept as its own story so it can also be
// opened directly and driven with Storybook's own viewport controls.
export const MobileCanvas: Story = {
  render: () => <MobileCanvasPage />,
  name: 'Mobile canvas (embedded in the frames)',
};

export const PostPagePlacements: Story = {
  render: () => <OtherPlacementsPage />,
  name: 'Post page placements',
};
