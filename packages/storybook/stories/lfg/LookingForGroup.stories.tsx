import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { Flow, FlowAction } from './Prototype';
import { happened, Prototype } from './Prototype';
import {
  examplePitches,
  helpMatchPost,
  incomingReachOuts,
  ME_ID,
  myPost,
  NOW,
  prelaunchPostIds,
  previousPitch,
  scamChat,
  thinBoardPostIds,
  users,
} from './data';
import { NotifType } from './store';
import { exampleDraft } from './screens/Create';

const meta: Meta = {
  title: 'Looking for group/Flows',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

const phone = { viewport: { value: 'mobile2', isRotated: false } };

const fillPitch: FlowAction[] = [
  {
    label: 'Fill an example pitch',
    show: (state) => !!state.composerFor && !!examplePitches[state.composerFor],
    run: (api) =>
      api.fillComposer(examplePitches[api.state.composerFor as string]),
  },
];

const findAndReachOut: Flow = {
  title: 'Find someone and reach out',
  scenario: { verified: { github: false, company: false, experience: false } },
  steps: [
    { label: 'Filter the board', done: happened('filter') },
    { label: 'Open a post', done: happened('open-post') },
    { label: 'Write a pitch', done: happened('open-composer') },
    { label: 'Stand out: GitHub, workplace or CV', done: happened('verify') },
    { label: 'Send the request', done: happened('send') },
    { label: 'They accept', done: happened('accepted') },
    { label: 'Reply in the chat', done: happened('message') },
  ],
  actions: [
    ...fillPitch,
    {
      label: 'Simulate: they accept',
      show: (state) =>
        state.events.includes('send') && !state.events.includes('accepted'),
      run: (api) => api.simulate.accept(),
    },
  ],
};

const postAndGetResponses: Flow = {
  title: "Post what you're looking for",
  scenario: {},
  steps: [
    { label: 'Start a post', done: happened('open-create') },
    { label: 'Agree to the house rules', done: happened('pledge') },
    { label: 'Publish', done: happened('publish') },
    { label: 'People reach out', done: happened('responses') },
    { label: 'Open your requests', done: happened('open-requests') },
  ],
  actions: [
    {
      label: 'Fill with an example',
      show: (state) => state.route.name === 'create',
      run: (api) => api.setDraft(exampleDraft),
    },
    {
      label: 'Simulate: people reach out',
      show: (state) =>
        state.events.includes('publish') && !state.events.includes('responses'),
      run: (api) => api.simulate.responses(),
    },
  ],
};

const reviewResponses: Flow = {
  title: 'Review responses',
  scenario: {
    withMyPost: true,
    withIncoming: true,
    route: { name: 'messages', tab: 'requests' },
    notifications: [
      {
        id: 'n-responses',
        type: NotifType.ReachOut,
        title: '3 people reached out about your post',
        body: myPost.title,
        at: NOW.toISOString(),
        unread: true,
        route: { name: 'messages', tab: 'requests' },
      },
    ],
  },
  steps: [
    { label: 'Compare the pitches', done: happened('open-request') },
    { label: 'Decline one quietly', done: happened('decline') },
    { label: 'Report the spam in Filtered', done: happened('report') },
    { label: 'Accept the best fit', done: happened('accept') },
    { label: 'Say hi', done: happened('message') },
  ],
};

const lior = incomingReachOuts.find((item) => item.fromId === 'lior');

const closeTheLoop: Flow = {
  title: 'Close the loop',
  scenario: {
    withMyPost: true,
    route: { name: 'post', id: myPost.id },
    extraReachOuts: incomingReachOuts
      .filter((item) => item.fromId !== 'growth')
      .map((item) =>
        item.fromId === 'lior'
          ? { ...item, status: 'accepted' as const }
          : item,
      ),
    chats: [
      {
        peerId: 'lior',
        postId: myPost.id,
        messages: [
          {
            id: 'l1',
            fromId: 'lior',
            body: lior?.pitch ?? '',
            at: lior?.createdAt ?? NOW.toISOString(),
          },
          {
            id: 'l2',
            fromId: ME_ID,
            body: 'Love the flame graph. Want to pair on the tree view Thursday evening?',
            at: NOW.toISOString(),
          },
          {
            id: 'l3',
            fromId: 'lior',
            body: "Thursday works. I'll bring a rough d3 sketch.",
            at: NOW.toISOString(),
          },
        ],
      },
    ],
  },
  steps: [
    { label: 'A week later: get a nudge', done: happened('week') },
    { label: 'Mark it as found', done: happened('found') },
    { label: 'Two weeks later: check in', done: happened('two-weeks') },
    { label: 'Confirm you worked together', done: happened('endorse') },
  ],
  actions: [
    {
      label: 'Skip ahead a week',
      show: (state) => !state.events.includes('week'),
      run: (api) => api.simulate.weekLater(),
    },
    {
      label: 'Skip ahead two weeks',
      show: (state) =>
        state.events.includes('found') && !state.events.includes('two-weeks'),
      run: (api) => api.simulate.twoWeeksLater(),
    },
  ],
};

const spamAndSafety: Flow = {
  title: 'Spam and safety',
  scenario: {
    withMyPost: true,
    withSentToday: true,
    route: { name: 'post', id: 'cofounder' },
    composerFor: 'cofounder',
    composerPrefill: {
      pitch: previousPitch.pitch,
      answers: examplePitches.cofounder.answers,
    },
    chats: [
      {
        peerId: 'kai',
        postId: myPost.id,
        unread: true,
        messages: scamChat,
      },
    ],
  },
  steps: [
    { label: 'A copy-paste pitch is held', done: happened('dup-warning') },
    { label: 'Contact details are blocked', done: happened('contact-warning') },
    { label: 'Pricing is blocked', done: happened('money-warning') },
    { label: "Out of today's reach-outs", done: happened('credits-warning') },
    { label: 'A stranger sends a repo to run', done: happened('link-warning') },
    { label: 'Report them', done: happened('report') },
  ],
  actions: [
    {
      label: 'Add a Telegram handle',
      show: (state) =>
        state.composerFor === 'cofounder' &&
        !state.events.includes('contact-warning'),
      run: (api) =>
        api.fillComposer({
          pitch: `${examplePitches.cofounder.pitch} Easier to talk on Telegram: @${users[ME_ID].username}`,
          answers: examplePitches.cofounder.answers,
        }),
    },
    {
      label: 'Add a rate',
      show: (state) =>
        state.events.includes('contact-warning') &&
        !state.events.includes('money-warning'),
      run: (api) =>
        api.fillComposer({
          pitch: `${examplePitches.cofounder.pitch} My rate is $60/hour until we sort out equity.`,
          answers: examplePitches.cofounder.answers,
        }),
    },
    {
      label: "Use up today's reach-outs",
      show: (state) =>
        state.events.includes('money-warning') &&
        !state.events.includes('credits-warning'),
      run: (api) => {
        api.simulate.exhaust();
        api.fillComposer(examplePitches.cofounder);
      },
    },
    {
      label: 'Open the chat with Kai',
      show: (state) =>
        state.events.includes('credits-warning') &&
        !state.events.includes('open-chat'),
      run: (api) =>
        api.navigate({ name: 'messages', tab: 'chats', peerId: 'kai' }),
    },
  ],
};

const theBadge: Flow = {
  title: 'The LFG badge',
  scenario: { route: { name: 'discussion' } },
  steps: [
    { label: 'Hover or tap a badged avatar', done: happened('hover-card') },
    { label: 'Open their profile', done: happened('open-profile') },
    { label: 'Reach out from the profile', done: happened('open-composer') },
    { label: 'Post, and get the badge', done: happened('my-badge') },
    { label: 'See it on your profile', done: happened('own-badge') },
  ],
  actions: [
    ...fillPitch,
    {
      label: 'Simulate: you publish a post',
      show: (state) =>
        state.events.includes('open-composer') &&
        !state.events.includes('my-badge'),
      run: (api) => api.simulate.myPost(),
    },
  ],
};

const helpOthers: Flow = {
  title: 'Help others',
  scenario: {},
  steps: [
    { label: 'Turn on Open to helping', done: happened('helper-on') },
    { label: 'A matching request comes in', done: happened('help-match') },
    { label: 'Open it', done: happened('open-help-post') },
    { label: 'Reach out', done: happened('send') },
  ],
  actions: [
    ...fillPitch,
    {
      label: `Simulate: ${
        users[helpMatchPost.authorId].name.split(' ')[0]
      } asks for help`,
      show: (state) =>
        state.events.includes('helper-on') &&
        !state.events.includes('help-match'),
      run: (api) => api.simulate.helpMatch(),
    },
  ],
};

const openingSoon: Flow = {
  title: 'Opening soon',
  scenario: {
    phase: 'prelaunch',
    postIds: prelaunchPostIds,
    notifications: [],
  },
  steps: [
    { label: 'Write your post', done: happened('open-create') },
    { label: 'Agree to the house rules', done: happened('pledge') },
    { label: 'Post it before connections open', done: happened('publish') },
    { label: 'See your badge on your profile', done: happened('own-badge') },
    {
      label: "Spot others' badges in the comments",
      done: happened('hover-card'),
    },
    { label: 'Connections open', done: happened('launch') },
    { label: 'First responses', done: happened('responses') },
  ],
  actions: [
    {
      label: 'Fill with an example',
      show: (state) => state.route.name === 'create',
      run: (api) => api.setDraft(exampleDraft),
    },
    {
      label: 'Simulate: connections open',
      show: (state) =>
        state.events.includes('publish') && !state.events.includes('launch'),
      run: (api) => api.simulate.launch(),
    },
    {
      label: 'Simulate: people reach out',
      show: (state) =>
        state.events.includes('launch') && !state.events.includes('responses'),
      run: (api) => api.simulate.responses(),
    },
  ],
};

const earlyDays: Flow = {
  title: 'Early days: a thin board',
  scenario: { postIds: thinBoardPostIds },
  steps: [
    { label: 'Pick a kind with no posts yet', done: happened('empty-kind') },
    { label: 'Meet someone ready to help', done: happened('open-profile') },
    { label: 'Post the first one', done: happened('publish') },
  ],
  actions: [
    {
      label: 'Fill with an example',
      show: (state) => state.route.name === 'create',
      run: (api) => api.setDraft(exampleDraft),
    },
  ],
};

const playground: Flow = {
  title: 'Playground: everything at once',
  scenario: {
    withMyPost: true,
    withIncoming: true,
    withSentToday: true,
    chats: [
      { peerId: 'kai', postId: myPost.id, unread: true, messages: scamChat },
    ],
  },
  steps: [],
  actions: [
    ...fillPitch,
    {
      label: 'Simulate: they accept',
      show: (state) =>
        state.reachOuts.some(
          (item) => item.fromId === ME_ID && item.status === 'pending',
        ),
      run: (api) => api.simulate.accept(),
    },
  ],
};

export const FindAndReachOut: Story = {
  name: '1. Find someone and reach out',
  render: () => <Prototype flow={findAndReachOut} />,
};

export const PostAndGetResponses: Story = {
  name: "2. Post what you're looking for",
  render: () => <Prototype flow={postAndGetResponses} />,
};

export const ReviewResponses: Story = {
  name: '3. Review responses',
  render: () => <Prototype flow={reviewResponses} />,
};

export const CloseTheLoop: Story = {
  name: '4. Close the loop',
  render: () => <Prototype flow={closeTheLoop} />,
};

export const SpamAndSafety: Story = {
  name: '5. Spam and safety',
  render: () => <Prototype flow={spamAndSafety} />,
};

export const TheBadge: Story = {
  name: '6. The LFG badge',
  render: () => <Prototype flow={theBadge} />,
};

export const HelpOthers: Story = {
  name: '7. Help others',
  render: () => <Prototype flow={helpOthers} />,
};

export const OpeningSoon: Story = {
  name: '8. Opening soon',
  render: () => <Prototype flow={openingSoon} />,
};

export const EarlyDays: Story = {
  name: '9. Early days: a thin board',
  render: () => <Prototype flow={earlyDays} />,
};

export const Playground: Story = {
  name: 'Playground',
  render: () => <Prototype flow={playground} />,
};

export const FindAndReachOutPhone: Story = {
  name: '1. Find someone and reach out (phone)',
  globals: phone,
  render: () => <Prototype flow={findAndReachOut} />,
};

export const ReviewResponsesPhone: Story = {
  name: '3. Review responses (phone)',
  globals: phone,
  render: () => <Prototype flow={reviewResponses} />,
};

export const TheBadgePhone: Story = {
  name: '6. The LFG badge (phone)',
  globals: phone,
  render: () => <Prototype flow={theBadge} />,
};

export const OpeningSoonPhone: Story = {
  name: '8. Opening soon (phone)',
  globals: phone,
  render: () => <Prototype flow={openingSoon} />,
};
