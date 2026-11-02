import type { MouseEvent, ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { PostTypeToListCard } from '@dailydotdev/shared/src/components/cards/common/listCards';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import {
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/common';
import { fn } from 'storybook/test';
import ExtensionProviders from '../../extension/_providers';
import { defaultBootData, getBootMock } from '../../../mock/boot';
import { providerHandlers } from '../why-recommended/whyRecommended.mocks';
import { GistCard } from './GistCard';
import { gists } from './gists';
import { ProductionFlags } from './ProductionFlags';
import { TodayFeed } from './TodayFeed';
import feedJson from './feed.json';

// The first three pages of a real For You feed as api.daily.dev returned them,
// with every person swapped for a made-up profile. Freeform posts have no gist:
// they are already the content.
const posts = feedJson as unknown as Post[];

enum CardStyle {
  Gist = 'gist',
  GistGrid = 'gist-grid',
  Today = 'today',
}

const cardStyleLabel: Record<CardStyle, string> = {
  [CardStyle.Gist]: 'Gist',
  [CardStyle.GistGrid]: 'Gist grid',
  [CardStyle.Today]: 'Today',
};

// Phones always get the list layout, so a grid gist only exists from laptop up.
const phoneStyles = [CardStyle.Gist, CardStyle.Today];
const laptopStyles = [CardStyle.GistGrid, CardStyle.Gist, CardStyle.Today];

const listCardHandlers = {
  onPostClick: fn(),
  onPostAuxClick: fn(),
  onUpvoteClick: fn(),
  onDownvoteClick: fn(),
  onCommentClick: fn(),
  onBookmarkClick: fn(),
  onShare: fn(),
  onCopyLinkClick: fn(),
  onReadArticleClick: fn(),
};

/** Cards link to app.daily.dev; keep the canvas on the story. */
const preventNavigation = (event: MouseEvent): void => {
  const anchor = (event.target as HTMLElement).closest('a');
  if (anchor && anchor.target !== '_blank') {
    event.preventDefault();
  }
};

const GistColumn = (): ReactElement => (
  <div className="mx-auto flex w-full max-w-[40rem] flex-col">
    {posts.map((post) => {
      const gist = gists[post.id];
      if (gist) {
        return <GistCard key={post.id} post={post} gist={gist} />;
      }

      const ListCard = PostTypeToListCard[post.type];
      return <ListCard key={post.id} post={post} {...listCardHandlers} />;
    })}
  </div>
);

const StyleToggle = ({
  options,
  value,
  onChange,
}: {
  options: CardStyle[];
  value: CardStyle;
  onChange: (value: CardStyle) => void;
}): ReactElement => (
  <div className="flex gap-1 rounded-12 bg-surface-float p-1">
    {options.map((cardStyle) => (
      <Button
        key={cardStyle}
        type="button"
        size={ButtonSize.Small}
        variant={
          cardStyle === value ? ButtonVariant.Primary : ButtonVariant.Tertiary
        }
        pressed={cardStyle === value}
        onClick={() => onChange(cardStyle)}
      >
        {cardStyleLabel[cardStyle]}
      </Button>
    ))}
  </div>
);

// The production cards pick their layout from the window, not their column,
// so the phone stories set Storybook's viewport instead of a narrow column.
const Screen = ({
  options = phoneStyles,
  initialStyle = options[0],
  showToggle = true,
}: {
  options?: CardStyle[];
  initialStyle?: CardStyle;
  showToggle?: boolean;
}): ReactElement => {
  const [cardStyle, setCardStyle] = useState(initialStyle);

  return (
    <ExtensionProviders>
      <ProductionFlags>
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
        <div
          className="min-h-screen bg-background-default"
          onClickCapture={preventNavigation}
        >
          <div
            className={classNames(
              'sticky top-0 z-3 mx-auto flex items-center justify-between bg-background-default px-4 py-3',
              cardStyle === CardStyle.Gist && 'max-w-[40rem]',
            )}
          >
            <span className="font-bold text-text-primary typo-body">
              For you
            </span>
            {showToggle && (
              <StyleToggle
                options={options}
                value={cardStyle}
                onChange={setCardStyle}
              />
            )}
          </div>
          {cardStyle === CardStyle.Gist && <GistColumn />}
          {cardStyle === CardStyle.GistGrid && (
            <TodayFeed posts={posts} gists={gists} />
          )}
          {cardStyle === CardStyle.Today && (
            <TodayFeed posts={posts} />
          )}
        </div>
      </ProductionFlags>
    </ExtensionProviders>
  );
};

/** Each side gets a real phone viewport, so the production cards lay out as on a phone. */
const SideBySide = (): ReactElement => (
  <div className="flex min-h-screen justify-center gap-6 bg-background-default p-6">
    {[CardStyle.Today, CardStyle.Gist].map((cardStyle) => (
      <div key={cardStyle} className="flex flex-col gap-2">
        <span className="font-bold text-text-primary typo-body">
          {cardStyleLabel[cardStyle]}
        </span>
        <iframe
          title={cardStyleLabel[cardStyle]}
          src={`iframe.html?id=features-gist-feed--phone-${cardStyle}&viewMode=story&globals=theme:dark`}
          className="h-[50.75rem] w-[23.4375rem] rounded-16 border border-border-subtlest-tertiary"
        />
      </div>
    ))}
  </div>
);

const meta: Meta = {
  title: 'Features/Gist Feed',
  parameters: {
    layout: 'fullscreen',
    msw: { handlers: providerHandlers },
  },
  globals: { theme: 'dark' },
  // The account the production flags were read from: Plus, eco spacing and
  // the clickbait shield on, so the feed titles are the shielded ones.
  beforeEach: () => {
    getBootMock.mockReturnValue({
      ...defaultBootData,
      user: { ...defaultBootData.user, isPlus: true },
      settings: {
        ...defaultBootData.settings,
        spaciness: 'eco',
        flags: {
          sidebarSquadExpanded: true,
          sidebarCustomFeedsExpanded: true,
          sidebarOtherExpanded: true,
          sidebarResourcesExpanded: true,
          sidebarBookmarksExpanded: true,
          ...defaultBootData.settings.flags,
          clickbaitShieldEnabled: true,
        },
      },
      accessToken: { token: '1', expiresIn: '1' },
      visit: { sessionId: '1', visitId: '1' },
      feeds: [],
    });
  },
};

export default meta;

type Story = StoryObj;

const phoneViewport = { viewport: { value: 'mobile2', isRotated: false } };

export const Laptop: Story = {
  render: () => <Screen options={laptopStyles} />,
};

export const Phone: Story = {
  render: () => <Screen />,
  globals: phoneViewport,
};

export const TodayVersusGist: Story = {
  name: 'Today vs gist',
  render: () => <SideBySide />,
};

export const PhoneToday: Story = {
  tags: ['!dev'],
  render: () => <Screen initialStyle={CardStyle.Today} showToggle={false} />,
  globals: phoneViewport,
};

export const PhoneGist: Story = {
  tags: ['!dev'],
  render: () => <Screen initialStyle={CardStyle.Gist} showToggle={false} />,
  globals: phoneViewport,
};
