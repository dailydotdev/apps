import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  DevPlusIcon,
  EditIcon,
  GitHubIcon,
  LinkIcon,
  LinkedInIcon,
  MenuIcon,
  ReputationIcon,
  TwitterIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import type { Entry } from './data';
import { feedEntries, formatCount, team } from './data';
import {
  HomeFrame,
  PostsArea,
  SectionTitle,
  Separator,
  Tile,
  Widget,
} from './home';

// The profile page, rebuilt on the same frame as the squad Home, with the
// same change: Activity becomes the Posts tab and is the page; the CV and
// the readme move under About. Tsahi's public profile, as fetched on
// 16 Sep 2026; the counts that need a session are the ones on the live page.

const user = {
  name: 'Tsahi Matsliah',
  username: 'tsahimatsliah',
  bio: 'Co-Founder, CDO at daily.dev, Designing this platform',
  image:
    'https://media.daily.dev/image/upload/s--k80T3WJe--/f_auto,q_auto/v1703793130/avatars/avatar_5e0af68445e04c02b0656c3530664aff',
  cover:
    'https://media.daily.dev/image/upload/s--3rJakxg8--/f_auto,q_auto/v1703792493/covers/cover_5e0af68445e04c02b0656c3530664aff',
  company: {
    name: 'daily.dev',
    image:
      'https://daily-now-res.cloudinary.com/image/upload/s--MASZOhnv--/f_auto/v1614088267/landing/Daily.dev_logo',
  },
  joined: 'May 25. 2020',
  reputation: 3980,
  upvotes: 534,
  followers: 52,
  following: 12,
  posts: 38,
};

const author = team[2];
const posts: Entry[] = feedEntries.map((entry) => ({ ...entry, author }));

const ProfileHeader = ({ isOwner }: { isOwner: boolean }): ReactElement => (
  <div className="relative w-full overflow-hidden rounded-t-16">
    <div className="h-36">
      <img
        src={user.cover}
        alt="Cover"
        className="h-full w-full object-cover"
      />
    </div>
    <img
      src={user.image}
      alt="Avatar"
      className="absolute left-6 top-16 h-[7.5rem] w-[7.5rem] rounded-16 object-cover"
    />
    <div className="flex flex-col gap-3 px-6">
      <div className="mb-4 ml-auto mt-2 flex items-center gap-2">
        <Button
          className={classNames('text-text-secondary', !isOwner && 'invisible')}
          variant={ButtonVariant.Float}
          icon={<EditIcon />}
          aria-label="Edit profile"
        />
        <div className="flex items-center rounded-12 bg-surface-float p-0.5 typo-footnote">
          <span className="rounded-10 bg-background-default px-3 py-1 font-bold text-text-primary">
            Professional side
          </span>
          <span className="px-3 py-1 text-text-tertiary">Fun side</span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <span className="font-bold typo-title2">{user.name}</span>
        <DevPlusIcon
          className="text-action-plus-default"
          size={IconSize.Size16}
        />
      </div>
      <div className="flex flex-col gap-2">
        <span className="typo-body">{user.bio}</span>
        <div className="flex items-center text-text-secondary typo-subhead">
          <span className="flex items-center gap-1">
            <img src={user.company.image} alt="" className="size-4 rounded-4" />
            {user.company.name}
          </span>
        </div>
        <div className="flex items-center text-text-secondary typo-subhead">
          <span>@{user.username}</span>
          <Separator />
          <span>Joined {user.joined}</span>
        </div>
        {!isOwner && (
          <div className="flex items-center gap-2">
            <Button variant={ButtonVariant.Primary} size={ButtonSize.Small}>
              Follow
            </Button>
            <Button
              variant={ButtonVariant.Float}
              size={ButtonSize.Small}
              icon={<MenuIcon />}
              aria-label="More"
            />
          </div>
        )}
        <div className="-ml-1 grid w-fit grid-cols-[auto_auto] gap-x-2 gap-y-1 text-text-tertiary typo-footnote">
          <div className="flex">
            <ReputationIcon
              className="text-accent-onion-default"
              size={IconSize.Small}
            />
            <span className="flex items-center gap-1">
              <b className="text-text-primary typo-subhead">
                {formatCount(user.reputation)}
              </b>
              Reputation
            </span>
          </div>
          <span className="flex items-center gap-1">
            <b className="text-text-primary typo-subhead">{user.upvotes}</b>
            Upvotes
          </span>
          <span className="flex items-center gap-1 pl-6">
            <b className="text-text-primary typo-subhead">{user.followers}</b>
            Followers
          </span>
          <span className="flex items-center gap-1">
            <b className="text-text-primary typo-subhead">{user.following}</b>
            Following
          </span>
        </div>
      </div>
    </div>
  </div>
);

const AboutMe = (): ReactElement => (
  <div className="flex flex-col gap-4 py-4">
    <SectionTitle>About me</SectionTitle>
    <div className="flex flex-wrap items-center gap-2">
      {[
        <GitHubIcon key="gh" size={IconSize.XSmall} />,
        <LinkedInIcon key="li" size={IconSize.XSmall} />,
        <TwitterIcon key="x" size={IconSize.XSmall} />,
        <LinkIcon key="link" size={IconSize.XSmall} />,
      ].map((icon, index) => (
        <Button
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          variant={ButtonVariant.Subtle}
          size={ButtonSize.Small}
          icon={icon}
        />
      ))}
    </div>
    <div className="flex flex-col gap-3 text-text-primary typo-body">
      <p className="font-bold">Hello Dev World! 👋</p>
      <p>
        I&apos;m <b>Tsahi Matsliah</b>, the UX maestro behind the scenes at
        daily.dev. 🎨 As a <b>co-founder and Chief Design Officer</b>, I&apos;m
        not just crafting pixels. I make sure your daily.dev journey is smooth,
        cool, and exactly how you need it.
      </p>
      <p>My main focus at daily.dev</p>
      <p>
        <b>🌈 Easy Peasy Designs:</b> Making sure daily.dev is simple to use and
        looks great.
      </p>
      <p>
        <b>🧠 Dev-Focused Thinking:</b> Every cool feature is made with you, the
        devs, in mind.
      </p>
      <p>
        <b>💪 Keep Improving:</b> Always working to make daily.dev better based
        on what you tell us.
      </p>
    </div>
  </div>
);

const experiences = [
  {
    title: 'CDO and Co-Founder',
    company: 'daily.dev',
    when: 'Aug 2020',
    tags: ['Current', 'Verified'],
  },
  {
    title: 'Professional Freelancer',
    company: 'TsDesign',
    when: 'Jan 2007 · Tel Aviv-Yafo, Israel',
    tags: ['Current'],
  },
  {
    title: 'Co-Founder | Chief Design Officer',
    company: 'The Elegant Monkeys Ltd.',
    when: 'Jul 2013 - Jul 2020 · Tel Aviv-Yafo, Israel',
    tags: [],
  },
];

const Experiences = (): ReactElement => (
  <div className="flex flex-col gap-4 py-4">
    <SectionTitle>Work experiences</SectionTitle>
    <div className="flex flex-col gap-4">
      {experiences.map((job) => (
        <div key={job.title} className="flex gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-8 bg-surface-float text-text-tertiary typo-caption1">
            {job.company[0]}
          </span>
          <div className="flex flex-col gap-1">
            <span className="flex items-center gap-2">
              <span className="font-bold text-text-primary typo-callout">
                {job.title}
              </span>
              {job.tags.map((tag) => (
                <span
                  key={tag}
                  className={classNames(
                    'rounded-6 px-1.5 typo-caption2',
                    tag === 'Verified'
                      ? 'bg-accent-avocado-flat text-accent-avocado-default'
                      : 'bg-surface-float text-text-tertiary',
                  )}
                >
                  {tag}
                </span>
              ))}
            </span>
            <span className="text-text-tertiary typo-footnote">
              {job.company}
            </span>
            <span className="text-text-quaternary typo-footnote">
              {job.when}
            </span>
            <div className="mt-1 flex gap-2">
              {[
                'Photoshop',
                'User Interface Design',
                'Mobile Applications',
              ].map((skill) => (
                <span
                  key={skill}
                  className="rounded-8 border border-border-subtlest-tertiary px-2 py-0.5 text-text-secondary typo-caption1"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const readingTags = [
  ['AI Agents', 29],
  ['AI Coding', 26],
  ['Architecture', 25],
  ['Career', 25],
  ['Open Source', 23],
  ['Rust', 19],
] as const;

const ReadingOverview = (): ReactElement => (
  <Widget title="Reading Overview">
    <span className="text-text-link typo-footnote">Learn more</span>
    <div className="my-3 grid grid-cols-2 gap-2">
      <Tile value="19" label="Longest streak 🏆" />
      <Tile value="907" label="Total reading days" />
    </div>
    <span className="text-text-tertiary typo-subhead">
      Top tags by reading days
    </span>
    <div className="my-3 grid grid-cols-2 gap-2">
      {readingTags.map(([tag, share]) => (
        <div
          key={tag}
          className="relative flex justify-between overflow-hidden rounded-6 border border-border-subtlest-tertiary px-2 typo-caption1"
        >
          <span
            className="absolute bottom-0 left-0 top-0 bg-action-share-default opacity-40"
            style={{ width: `${share * 2}%` }}
          />
          <span className="relative z-1 my-auto text-text-primary">{tag}</span>
          <span className="relative z-1 my-auto text-text-secondary">
            +{share}%
          </span>
        </div>
      ))}
    </div>
    <span className="text-text-tertiary typo-subhead">
      Posts read in the last months (597)
    </span>
    <div className="mt-3 flex gap-0.5">
      {Array.from({ length: 26 }, (_, week) => (
        // eslint-disable-next-line react/no-array-index-key
        <div key={week} className="flex flex-col gap-0.5">
          {Array.from({ length: 7 }, (_, day) => {
            const level = (week * 3 + day * 5) % 7;
            return (
              <span
                // eslint-disable-next-line react/no-array-index-key
                key={day}
                className={classNames(
                  'size-2 rounded-6',
                  level < 2 && 'border border-border-subtlest-quaternary',
                  level >= 2 && level < 5 && 'bg-text-disabled',
                  level >= 5 && 'bg-text-primary',
                )}
              />
            );
          })}
        </div>
      ))}
    </div>
  </Widget>
);

const squads = [
  ['daily.dev World', '@dailydevworld', '10.2K members'],
  ['daily.dev Changelog', '@daily_updates', '11.5K members'],
  ['Devs with ADHD', '@clariti', '1.2K members'],
  ['All Frontend', '@allfrontend', '3.2K members'],
  ['Webflow', '@webflow', '42 members'],
];

const ActiveSquads = (): ReactElement => (
  <Widget title="Active in these Squads">
    <ul className="mt-4 flex flex-col gap-2">
      {squads.map(([name, handle, members]) => (
        <li key={handle} className="flex items-center gap-2">
          <span className="size-8 shrink-0 rounded-full bg-surface-hover" />
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-bold text-text-primary typo-callout">
              {name}
            </span>
            <span className="text-text-tertiary typo-footnote">{handle}</span>
            <span className="text-text-tertiary typo-footnote">{members}</span>
          </div>
        </li>
      ))}
    </ul>
    <div className="mt-auto pt-3">
      <Button
        variant={ButtonVariant.Float}
        size={ButtonSize.Small}
        className="w-full"
      >
        Show all Squads
      </Button>
    </div>
  </Widget>
);

const Badges = (): ReactElement => (
  <Widget title="Badges & Awards">
    <span className="text-text-link typo-footnote">Learn more</span>
    <div className="my-3 grid grid-cols-2 gap-2">
      <Tile value="x8" label="Top reader badge" />
      <Tile value="x0" label="Total Awards" />
    </div>
    <ul className="flex flex-col gap-2">
      {[
        ['cuda', 'August 2026'],
        ['opencode', 'July 2026'],
        ['wwdc', 'June 2026'],
        ['ios', 'April 2026'],
      ].map(([tag, date]) => (
        <li key={tag} className="flex items-center justify-between">
          <span className="rounded-6 bg-surface-float px-1.5 py-0.5 text-text-primary typo-caption1">
            {tag}
          </span>
          <span className="text-text-quaternary typo-caption1">{date}</span>
        </li>
      ))}
    </ul>
  </Widget>
);

export enum ProfileTab {
  Activity = 'activity',
  About = 'about',
}

const profileTabs = [
  { id: ProfileTab.Activity, label: 'Activity', count: user.posts },
  { id: ProfileTab.About, label: 'About' },
];

export const ProfileHome = ({
  isOwner = false,
  initialTab = ProfileTab.Activity,
}: {
  isOwner?: boolean;
  initialTab?: ProfileTab;
}): ReactElement => {
  const [tab, setTab] = useState<ProfileTab>(initialTab);

  return (
    <HomeFrame
      header={<ProfileHeader isOwner={isOwner} />}
      widgets={
        <>
          <ReadingOverview />
          <ActiveSquads />
          <Badges />
        </>
      }
    >
      <div className="flex items-center gap-6 border-b border-border-subtlest-tertiary px-6">
        {profileTabs.map((item) => (
          <button
            type="button"
            key={item.id}
            onClick={() => setTab(item.id)}
            className={classNames(
              'relative flex items-center gap-1.5 py-3 typo-callout',
              item.id === tab
                ? 'sq-tab-active font-bold text-text-primary'
                : 'text-text-tertiary hover:text-text-primary',
            )}
          >
            {item.label}
            {typeof item.count === 'number' && (
              <span className="sq-nums font-normal text-text-quaternary">
                {item.count}
              </span>
            )}
          </button>
        ))}
      </div>
      {tab === ProfileTab.Activity ? (
        <PostsArea sort="Posts" entries={posts.slice(0, 6)} />
      ) : (
        <div className="flex flex-col divide-y divide-border-subtlest-tertiary p-6">
          <div />
          <AboutMe />
          <Experiences />
        </div>
      )}
    </HomeFrame>
  );
};
