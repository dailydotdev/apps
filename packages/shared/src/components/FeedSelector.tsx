import React, { ReactElement, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Dropdown } from './fields/Dropdown';
import { ButtonSize } from './buttons/common';
import { SharedFeedPage } from './utilities';
import { DiscussIcon, HotIcon, UpvoteIcon } from './icons';
import { IconSize } from './Icon';

interface FeedSelectorProps {
  currentFeed: SharedFeedPage;
  className?: string;
}

const feedOptions = [
  {
    value: SharedFeedPage.Popular,
    text: 'Popular',
    icon: (active: boolean) => (
      <HotIcon secondary={active} size={IconSize.Medium} className="mr-1" />
    ),
  },
  {
    value: SharedFeedPage.Upvoted,
    text: 'Most upvoted',
    icon: (active: boolean) => (
      <UpvoteIcon secondary={active} size={IconSize.Medium} className="mr-1" />
    ),
  },
  {
    value: SharedFeedPage.Discussed,
    text: 'Best discussions',
    icon: (active: boolean) => (
      <DiscussIcon secondary={active} size={IconSize.Medium} className="mr-1" />
    ),
  },
];

export default function FeedSelector({
  currentFeed,
  className,
}: FeedSelectorProps): ReactElement {
  const router = useRouter();
  const selectedFeedIdx = feedOptions.findIndex((f) => f.value === currentFeed);
  const handleSwitchFeed = useCallback(
    (feed: SharedFeedPage) => {
      const feedKey = feedOptions.find((f) => f.text === feed)?.value;
      if (feedKey === SharedFeedPage.MyFeed) {
        router.push('/');
      } else {
        router.push(`/${feedKey}`);
      }
    },
    [router],
  );

  return (
    <Dropdown
      dynamicMenuWidth
      shouldIndicateSelected
      buttonSize={ButtonSize.Medium}
      className={{ button: 'px-1', label: 'mr-5', container: className }}
      iconOnly={false}
      key="feed"
      icon={feedOptions[selectedFeedIdx].icon(true)}
      selectedIndex={selectedFeedIdx}
      renderItem={(_, index) => (
        <>
          <div className="pr-2">
            {feedOptions[index].icon(selectedFeedIdx === index)}
          </div>
          <span className="typo-callout">{feedOptions[index].text}</span>
        </>
      )}
      options={feedOptions.map((f) => f.text)}
      onChange={(feed: SharedFeedPage) => handleSwitchFeed(feed)}
    />
  );
}
