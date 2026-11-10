import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Case, Page } from '../hero-cover/parts';
import { GiveAwardFlow } from './production/GiveAward';
import { CommentWithAward, ProfileAwards } from './production/AwardPreviews';
import { productionAwards } from './data';

const meta: Meta = {
  title: 'GTA VI/1. Vice City award',
  parameters: { layout: 'fullscreen' },
  globals: { theme: 'dark' },
};

export default meta;

export const ViceCityAward: StoryObj = {
  name: '1. Vice City award',
  render: () => (
    <Page
      chapter="GTA VI · 1"
      question="How do readers celebrate release day with each other?"
      title="Vice City award"
      goal="A free, launch-week award that leads the award picker, so anyone can send one, Cores or not."
      metric="Awards sent during launch week against the week before, and first-time award givers."
    >
      <Case
        title="The picker"
        note="Give an Award as production draws it, with the Vice City award first: the same tile and icon size as every other award, priced Free. Click any award to walk the flow."
      >
        <div className="flex flex-wrap items-start gap-10">
          <GiveAwardFlow />
          <GiveAwardFlow isPhone />
        </div>
      </Case>

      <Case
        title="Note, then sent"
        note="The rest is production's flow. Proposed: a free award doesn't touch the balance, so the fees note gives way to when it stops being free (Nov 25)."
      >
        <div className="flex flex-wrap items-start gap-10">
          <GiveAwardFlow initialStep="COMMENT" />
          <GiveAwardFlow initialStep="SUCCESS" />
        </div>
      </Case>

      <Case
        title="After launch week"
        note="From Nov 26 the award leaves the picker and the grid is production's again. Awards already sent stay on posts and comments."
      >
        <GiveAwardFlow
          initialProduct={productionAwards[0]}
          isEventLive={false}
        />
      </Case>

      <Case
        title="Received: on a comment"
        note="Production's award count under a comment, with the Vice City award as the comment's featured award, at the size every featured award gets."
      >
        <CommentWithAward />
      </Case>

      <Case
        title="Received: on the profile"
        note="The profile's Badges & Awards widget, at production's award size. The Vice City award counts toward Total Awards like any other."
      >
        <div className="w-[22rem]">
          <ProfileAwards />
        </div>
      </Case>
    </Page>
  ),
};
