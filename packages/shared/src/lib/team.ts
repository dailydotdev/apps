// Real daily.dev people whose faces we show next to "talk to a human"
// entry points (feedback button, company page support).
export const TEAM_MEMBERS = [
  {
    username: 'idoshamun',
    name: 'Ido Shamun',
    image:
      'https://media.daily.dev/image/upload/s---xy_OAwk--/f_auto,q_auto/v1703781380/avatars/avatar_28849d86070e4c099c877ab6837c61f0',
  },
  {
    username: 'kramer',
    name: 'Nimrod Kramer',
    image:
      'https://media.daily.dev/image/upload/v1682322243/avatars/avatar_1d339aa5b85c4e0ba85fdedb523c48d4.jpg',
  },
  {
    username: 'amar',
    name: 'Amar',
    image:
      'https://media.daily.dev/image/upload/s--W1oZyHsz--/f_auto/v1719829173/avatars/avatar_0pjeBcFKQqsnU97ZOj9EW',
  },
  {
    username: 'capjavert',
    name: 'Ante Barić',
    image:
      'https://media.daily.dev/image/upload/v1679300599/avatars/avatar_LJSkpBexOSCWc8INyu3Eu.jpg',
  },
  {
    username: 'dailydevtips',
    name: 'Chris Bongers',
    image:
      'https://media.daily.dev/image/upload/s--9gxFz1e7--/f_auto/v1705902590/avatars/avatar_JUNiIGCV-?_a=BAMAMiZW0',
  },
  {
    username: 'tsahimatsliah',
    name: 'Tsahi Matsliah',
    image:
      'https://media.daily.dev/image/upload/s--k80T3WJe--/f_auto,q_auto/v1703793130/avatars/avatar_5e0af68445e04c02b0656c3530664aff',
  },
  {
    username: 'dave28',
    name: 'Dave',
    image:
      'https://media.daily.dev/image/upload/s--C7nUVtfM--/f_auto,q_auto/v1/avatars/avatar_14yFjmSDxLUrr05G27mp6',
  },
  {
    username: 'vasn',
    name: 'Vas N',
    image:
      'https://lh3.googleusercontent.com/a-/AOh14GhZpI6rlti8BFP-fzWGDxrFlAmSfb72Vd6u7XS5=s100',
  },
] as const;

const FOUNDER_USERNAMES: ReadonlyArray<string> = [
  'kramer',
  'idoshamun',
  'tsahimatsliah',
];

export const FOUNDERS = TEAM_MEMBERS.filter(({ username }) =>
  FOUNDER_USERNAMES.includes(username),
);
