// Captured from api.daily.dev on 2026-10-16: per tag, the most commented
// articles of the last 90 days, with the people who commented on and upvoted
// them. mostDiscussedFeed only takes 7, 30 or 365 days, so the 365-day list
// is cut to 90 days.
import type { Post } from '@dailydotdev/shared/src/graphql/posts';

export interface DiscussionPerson {
  id: string;
  name: string;
  image: string;
}

export interface DiscussedPost extends Post {
  commenters: DiscussionPerson[];
  upvoters: DiscussionPerson[];
}

export const DISCUSSED_POSTS = [
  {
    id: 'UJk81ooxg',
    title: 'Bun v1.4.2',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/c4f9f8744dec19651c9586000409a465?_a=AQAEuop',
    readTime: 4,
    createdAt: '2026-09-05T06:03:08.766Z',
    numUpvotes: 108,
    numComments: 24,
    tags: ['javascript', 'nodejs', 'bun'],
    commentsPermalink: 'https://daily.dev/posts/bun-v1-4-2-ujk81ooxg',
    type: 'article',
    source: {
      id: 'bun',
      handle: 'bun',
      name: 'Bun',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/9d715eb44dae4d74a2cebd8871d91a0d',
    },
    commenters: [
      {
        id: 'kq6KqvzDMonRhgV6gOsK6',
        name: 'Mateo Suarez',
        image: 'https://avatars.githubusercontent.com/u/90749080?v=4',
      },
      {
        id: 'KiCJX0Dg9gCfj333ju9jS',
        name: 'Jonathan Lima',
        image: 'https://avatars.githubusercontent.com/u/67848049?v=4',
      },
      {
        id: 'j6gJFvntM6H4f4hbLpC77',
        name: 'cevheri',
        image: 'https://avatars.githubusercontent.com/u/12383547?v=4',
      },
    ],
    upvoters: [
      {
        id: 'K2aQxyYzZklexz7lrhhfl',
        name: 'Adzaky',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocJdwSn5i8bqHcyLr5Hqeq1od3t9DGZzy5aIKmRKZroS57eKVU_o=s96-c',
      },
      {
        id: 'e881883279e740acb0596f65d9875bb7',
        name: 'Igor Ujević',
        image:
          'https://media.daily.dev/image/upload/s--ea-Yhxrs--/f_auto/v1775480567/avatars/avatar_e881883279e740acb0596f65d9875bb7?_a=BAMAMiWQ0',
      },
      {
        id: 'eoqKtNlzExsSP9ceTtQn4',
        name: 'Khalid',
        image: 'https://avatars.githubusercontent.com/u/123577903?v=4',
      },
      {
        id: '1LHFLJCIzgRvnfOPGNSFK',
        name: 'Jose Juarez',
        image:
          'https://media.daily.dev/image/upload/s--CXhCRTYo--/f_auto/v1787560715/avatars/avatar_1LHFLJCIzgRvnfOPGNSFK?_a=BAMAMicg0',
      },
    ],
  },
  {
    id: 'hq5Do4uqz',
    title:
      'HTML, CSS & JavaScript: The Three Skills Every Developer Must Master Before Chasing Frameworks',
    image:
      'https://media.daily.dev/image/upload/s--2-1xRawN--/f_auto/v1722860399/public/Placeholder%2011',
    readTime: 5,
    createdAt: '2026-07-22T15:36:10.639Z',
    numUpvotes: 43,
    numComments: 16,
    tags: ['webdev', 'javascript', 'css', 'html'],
    commentsPermalink:
      'https://daily.dev/posts/html-css-javascript-the-three-skills-every-developer-must-master-before-chasing-frameworks-hq5do4uqz',
    type: 'article',
    source: {
      id: 'medium_js',
      handle: 'medium_js',
      name: 'Medium',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/medium',
    },
    commenters: [
      {
        id: 'igzBsWloJeaegzm9bQltZ',
        name: 'AllInOneTools',
        image:
          'https://media.daily.dev/image/upload/s--4ZT8QlF0--/f_auto/v1769790028/avatars/avatar_igzBsWloJeaegzm9bQltZ?_a=BAMAMiiu0',
      },
      {
        id: 'r8zGK9r7g4omArMesM1Ue',
        name: 'Adam Leis',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocKmBiFBNwyPmFKXkvqjKLyqClpM8dijiZl9zCT2dhJeMoZfxbUs=s96-c',
      },
      {
        id: 'QwWczI1OhnuqJ3vckrPPp',
        name: 'HARSHIT MANEPALLY',
        image:
          'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
      },
    ],
    upvoters: [
      {
        id: 'WVJSfJtDe63PxQFAsmXFO',
        name: 'Anja P',
        image:
          'https://media.daily.dev/image/upload/s--M_c0s8Ky--/f_auto/v1721658650/avatars/avatar_WVJSfJtDe63PxQFAsmXFO',
      },
      {
        id: '3lPrxlPj8z9Y5mjgMyEOo',
        name: 'Ajmal S',
        image:
          'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
      },
      {
        id: 'QTVA2R5trHodSd2m0iFk9',
        name: 'Raddah',
        image:
          'https://media.daily.dev/image/upload/s--fiqylCMN--/f_auto/v1772930133/avatars/avatar_QTVA2R5trHodSd2m0iFk9?_a=BAMAMiiu0',
      },
      {
        id: 'fl4wODNDB5ZFKY1s9i0n4',
        name: 'Zach Barnes',
        image:
          'https://media.daily.dev/image/upload/s--3W_rg75h--/f_auto/v1786972305/avatars/avatar_fl4wODNDB5ZFKY1s9i0n4?_a=BAMAMicg0',
      },
    ],
  },
  {
    id: 'rOq2jbA7U',
    title: 'When you just need to build a tiny desktop app: TinyJS',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/a13d983ce49ad6b07365202a0a638e58?_a=AQAEuop',
    readTime: 5,
    createdAt: '2026-10-13T08:12:40.548Z',
    numUpvotes: 74,
    numComments: 15,
    tags: ['javascript', 'electron', 'tauri'],
    commentsPermalink:
      'https://daily.dev/posts/when-you-just-need-to-build-a-tiny-desktop-app-tinyjs-roq2jba7u',
    type: 'article',
    source: {
      id: 'devclass',
      handle: 'devclass',
      name: 'DEVCLASS',
      image:
        'https://media.daily.dev/image/upload/s--quq5_zKP--/f_auto/v1732552064/logos/devclass',
    },
    commenters: [
      {
        id: '27xFR2iYDQ2YHngeEMexT',
        name: 'Dignity',
        image:
          'https://media.daily.dev/image/upload/s--xbFCRIaC--/f_auto/v1789511341/avatars/avatar_27xFR2iYDQ2YHngeEMexT?_a=BAMAMicg0',
      },
      {
        id: 'L4sDYBpsPBZ3WBAof4KNB',
        name: 'Jason Chuh',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocJDiNTmcy-KNizYyP_jdxNF3WuDBcnpcbrokB63quFwoL7P-A=s96-c',
      },
      {
        id: '0fMQQvxSIIVibBvP847Xo',
        name: 'JP de la Torre',
        image:
          'https://media.daily.dev/image/upload/s--vMLSF3-1--/f_auto/v1787723050/avatars/avatar_0fMQQvxSIIVibBvP847Xo?_a=BAMAMicg0',
      },
    ],
    upvoters: [
      {
        id: 'ok2YpbXjK7FhnZyMycGuy',
        name: 'Piyush',
        image:
          'https://media.daily.dev/image/upload/s--vJulLyGb--/f_auto/v1789127856/avatars/avatar_ok2YpbXjK7FhnZyMycGuy?_a=BAMAMicg0',
      },
      {
        id: 'OyJr5B4BxMxygaYwnJAOn',
        name: 'Sema toghem',
        image: 'https://avatars.githubusercontent.com/u/11573007?v=4',
      },
      {
        id: 'mqfKCsoz6wzxboIN4s5vw',
        name: 'Christopher Trevor',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocLuM4S7o_Y24vA9OmHxgLpQZmxSasAP6RVNsHN9lCRDjbyACg=s96-c',
      },
      {
        id: '75QyPrL3BZgArSo6aFWuZ',
        name: 'Sam Dolin',
        image:
          'https://media.daily.dev/image/upload/s--nUhoZxKm--/f_auto/v1787434895/avatars/avatar_75QyPrL3BZgArSo6aFWuZ?_a=BAMAMicg0',
      },
    ],
  },
  {
    id: 'RFRxDV6yP',
    title: 'TanStack Charts 1.0',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/2077c4b091e1db9d30b1d1363fdc8e53?_a=AQAEuop',
    readTime: 8,
    createdAt: '2026-10-05T15:46:36.160Z',
    numUpvotes: 177,
    numComments: 14,
    tags: ['javascript', 'react', 'typescript', 'data-visualization'],
    commentsPermalink: 'https://daily.dev/posts/tanstack-charts-1-0-rfrxdv6yp',
    type: 'article',
    source: {
      id: 'tanstack-blog',
      handle: 'tanstack-blog',
      name: 'TanStack',
      image:
        'https://media.daily.dev/image/upload/s--TVIrvIT7--/f_auto,q_auto/v1787487634/logos/tanstack-blog?_a=BAMAMicg0',
    },
    commenters: [
      {
        id: 'U3o_tgSQ2',
        name: 'Apperside',
        image: 'https://avatars.githubusercontent.com/u/5955338?v=4',
      },
      {
        id: 'JYf2mTyl8QY4B2HJp3soD',
        name: 'Veselin Ivanov',
        image:
          'https://media.daily.dev/image/upload/s--nc0o8dM8--/f_auto/v1782457323/avatars/avatar_JYf2mTyl8QY4B2HJp3soD?_a=BAMAMicg0',
      },
      {
        id: 'ryDlbifZ1EuRuh3g51ryC',
        name: 'Risto Tõldsep',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocLDWc6mZn0JwNmXXw6WY0L_HJ6pegzRttooC5VgtXESHSj3MNYx=s96-c',
      },
    ],
    upvoters: [
      {
        id: 'A3six5p4O',
        name: 'Patrick Howard',
        image:
          'https://media.daily.dev/image/upload/s--VD8eiQtf--/f_auto/v1709836420/avatars/avatar_A3six5p4O',
      },
      {
        id: '0LCjvrJWfZw22sMB7J0rI',
        name: 'sandiko prastyo',
        image: 'https://avatars.githubusercontent.com/u/41652121?v=4',
      },
      {
        id: 'UP5bCcP4vGBPE6JyEzv04',
        name: 'André Ennemoser',
        image:
          'https://lh3.googleusercontent.com/a/ALm5wu1bl4IlEWwTP-BXQCkT_EclJsFpNqVNzliYS1TE=s96-c',
      },
      {
        id: '42JrI5TNGF8uxtud5GyTy',
        name: 'Gawi _',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocLFL2Vbi6gn3pWM3trin9fuxyg8Jz7lCmmucJ0WEr_HlL0lZxKT=s96-c',
      },
    ],
  },
  {
    id: 'SFQIftBGY',
    title: 'React 19.3 – React',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/88e2c2121fade23f078ac28b7f731d6c?_a=AQAEuop',
    readTime: 15,
    createdAt: '2026-09-09T18:21:17.831Z',
    numUpvotes: 209,
    numComments: 27,
    tags: ['react', 'view-transitions'],
    commentsPermalink: 'https://daily.dev/posts/react-19-3-react-sfqiftbgy',
    type: 'article',
    source: {
      id: 'react',
      handle: 'react',
      name: 'React',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/react_js',
    },
    commenters: [
      {
        id: 'uHncvl2Q7kCAOyylxGcCN',
        name: 'Cale',
        image: 'https://avatars.githubusercontent.com/u/211212128?v=4',
      },
      {
        id: 'Xzv9LpRilTWze4dsbGFXh',
        name: 'Cesar Higashi',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocJK3DoP9jbh4_wSm9zRATg1i3kJwBnCB_2oEAREnVTy6PBpRg=s96-c',
      },
      {
        id: 'nmHVH4gXts99z4ACweb4K',
        name: 'Felix Scholze',
        image: 'https://avatars.githubusercontent.com/u/17964384?v=4',
      },
    ],
    upvoters: [
      {
        id: 'DRBkl780QvE4MqbJ0SeLP',
        name: 'tarun kumar',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocLuB6D51SCUq6jvVMWItXtmSeXzYQE2VhJoZprNmmpwBEUTFhw=s96-c',
      },
      {
        id: '1DM5PXhtKtLnYkXdPniCJ',
        name: 'newsdataio',
        image:
          'https://media.daily.dev/image/upload/s--QyN3OH0Z--/f_auto/v1788172568/avatars/avatar_1DM5PXhtKtLnYkXdPniCJ?_a=BAMAMicg0',
      },
      {
        id: 'vS9XBqHcPp220hT6oWmGf',
        name: 'Ferny Jr',
        image: 'https://avatars.githubusercontent.com/u/144074552?v=4',
      },
      {
        id: 'OIOacVBxGMw7v5xGZMpHp',
        name: 'Miguel',
        image: 'https://avatars.githubusercontent.com/u/129049360?v=4',
      },
    ],
  },
  {
    id: 'PwVpziVEc',
    title: 'Tailwind CSS vs. StyleX: A real migration with 20 components',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/6485850f026c8fae025b2b243dfb90a8?_a=AQAEuop',
    readTime: 17,
    createdAt: '2026-07-27T21:56:23.059Z',
    numUpvotes: 72,
    numComments: 14,
    tags: ['css', 'react', 'tailwind-css'],
    commentsPermalink:
      'https://daily.dev/posts/tailwind-css-vs-stylex-a-real-migration-with-20-components-pwvpzivec',
    type: 'article',
    source: {
      id: 'logrocket',
      handle: 'logrocket',
      name: 'LogRocket',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/logrocket',
    },
    commenters: [
      {
        id: 'JJtZr4Sjm',
        name: 'Jenuel Oras Ganawed',
        image:
          'https://media.daily.dev/image/upload/s--BadmiNyj--/f_auto/v1787625077/avatars/avatar_JJtZr4Sjm?_a=BAMAMicg0',
      },
      {
        id: 'S5xYEu8jXmb2cDEBSs7Mn',
        name: 'Prashant Rijal',
        image:
          'https://media.daily.dev/image/upload/s--X33L4424--/f_auto/v1739440974/avatars/avatar_S5xYEu8jXmb2cDEBSs7Mn',
      },
      {
        id: 'x9cfuU5ai02W3BPEbroGK',
        name: 'Marko Jozic-Reyes',
        image:
          'https://media.daily.dev/image/upload/s--TvIfWcng--/f_auto/v1769558803/avatars/avatar_x9cfuU5ai02W3BPEbroGK?_a=BAMAMiiu0',
      },
    ],
    upvoters: [
      {
        id: '3jf8Sq1wHlF1v4I4nuJaA',
        name: 'Fearfulseven72',
        image: 'https://avatars.githubusercontent.com/u/247511901?v=4',
      },
      {
        id: 'Np4cnUJiyYj1JLyWIdQwy',
        name: 'zcrroll',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocIOSDYXfjIOa54Xgl0WLVmgvQJoQS4umKp4GrmDiKUM1xroPoo=s96-c',
      },
      {
        id: 'lMPNJXWg9pikyCyibb6Wf',
        name: 'Marc',
        image:
          'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
      },
      {
        id: 'gdco5dGLTOCNm55DPuark',
        name: 'Adarsh KS',
        image:
          'https://media.daily.dev/image/upload/s--AOhSU9kx--/f_auto/v1785742065/avatars/avatar_gdco5dGLTOCNm55DPuark?_a=BAMAMicg0',
      },
    ],
  },
  {
    id: 'KGEEoFyhY',
    title: 'DESIGN.md vs. Design System MCP: Which Does What?',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/e117fa33f97036cf4727e8ae51d63176?_a=AQAEuop',
    readTime: 8,
    createdAt: '2026-10-01T15:59:45.559Z',
    numUpvotes: 107,
    numComments: 8,
    tags: ['webdev', 'react', 'ai-agents', 'mcp'],
    commentsPermalink:
      'https://daily.dev/posts/design-md-vs-design-system-mcp-which-does-what--kgeeofyhy',
    type: 'article',
    source: {
      id: 'headway',
      handle: 'headway',
      name: 'Headway',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/6db6367290f142ec95e820d83985679d',
    },
    commenters: [
      {
        id: 'TvTVeiMdkRCqWUDullFmy',
        name: 'kartik-nvjk',
        image:
          'https://media.daily.dev/image/upload/s--3gGgsVCw--/f_auto/v1781456774/avatars/avatar_TvTVeiMdkRCqWUDullFmy?_a=BAMAMiWQ0',
      },
      {
        id: 'ryDlbifZ1EuRuh3g51ryC',
        name: 'Risto Tõldsep',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocLDWc6mZn0JwNmXXw6WY0L_HJ6pegzRttooC5VgtXESHSj3MNYx=s96-c',
      },
      {
        id: 'ICUHYClOqsxUOW9ildHmf',
        name: 'AI Dive',
        image:
          'https://media.daily.dev/image/upload/s--CXOxN2Lp--/f_auto/v1787506402/avatars/avatar_ICUHYClOqsxUOW9ildHmf?_a=BAMAMicg0',
      },
    ],
    upvoters: [
      {
        id: '3z3vjxeh4PsZpA0YLdYAB',
        name: 'kris gu',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocJnnwFKNx7PJNhb7W6mFWr2k2SV_VHW_9ainY71DX_dv79frQ=s96-c',
      },
      {
        id: 'CLhZZjLIF0IqUlEhzJUYJ',
        name: 'Andry Dinaa',
        image:
          'https://lh3.googleusercontent.com/a/AItbvmnbaF78vN_HpHokjIt0Xeb1O8B37kvtfRgkF_rLtQ=s100',
      },
      {
        id: 'eD9aIYv7SUPZPXF3tNM2G',
        name: 'Fatih Karakuş',
        image: 'https://avatars.githubusercontent.com/u/111702120?v=4',
      },
      {
        id: 'ar3oE1YfNz9MIgNgN0n1e',
        name: 'THat-GUyy-1',
        image:
          'https://media.daily.dev/image/upload/s--X-_Fscc2--/f_auto/v1786314634/avatars/avatar_ar3oE1YfNz9MIgNgN0n1e?_a=BAMAMicg0',
      },
    ],
  },
  {
    id: 'BXhP3E0ci',
    title:
      'My Journey into DevOps: Learning Linux, Git, GitHub & My First Docker Container',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/f987b3d675af2d7ac1b24f54b676058b?_a=AQAEuop',
    readTime: 5,
    createdAt: '2026-07-27T07:32:34.470Z',
    numUpvotes: 145,
    numComments: 25,
    tags: ['devops', 'linux', 'docker', 'containers', 'git'],
    commentsPermalink:
      'https://daily.dev/posts/my-journey-into-devops-learning-linux-git-github-my-first-docker-container-bxhp3e0ci',
    type: 'article',
    source: {
      id: 'medium_js',
      handle: 'medium_js',
      name: 'Medium',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/medium',
    },
    commenters: [
      {
        id: 'HK0Qdu9ttIpcoDHx7zrHk',
        name: 'DavidDev',
        image:
          'https://media.daily.dev/image/upload/s--jxmKsIov--/f_auto/v1788950401/avatars/avatar_HK0Qdu9ttIpcoDHx7zrHk?_a=BAMAMicg0',
      },
      {
        id: 'IuKlhCQX7W7k6aXA5dKXm',
        name: 'Chhoeun K.Keaphirunphirakbot',
        image:
          'https://lh3.googleusercontent.com/a/AATXAJyu3svre68RXAs8yXKtzZsd-K-S7yMa4mOqbq1m=s100',
      },
      {
        id: 'IuKlhCQX7W7k6aXA5dKXm',
        name: 'Chhoeun K.Keaphirunphirakbot',
        image:
          'https://lh3.googleusercontent.com/a/AATXAJyu3svre68RXAs8yXKtzZsd-K-S7yMa4mOqbq1m=s100',
      },
    ],
    upvoters: [
      {
        id: 'zpPqnnmnq',
        name: 'Sönke Kluth',
        image: 'https://avatars2.githubusercontent.com/u/201338?v=4',
      },
      {
        id: 'FQKwuWBcZgtIaLiHg4E9s',
        name: 'Tausif Al Zubayer',
        image:
          'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
      },
      {
        id: 'SPEcur4ZAVCbtbdDgmkH5',
        name: 'NCM',
        image:
          'https://media.daily.dev/image/upload/s--pEZxiasd--/f_auto/v1785442789/avatars/avatar_SPEcur4ZAVCbtbdDgmkH5?_a=BAMAMicg0',
      },
      {
        id: 'g31ZKLPQ3NZdC3vN9plJS',
        name: 'Ibrahim abu eita',
        image:
          'https://media.daily.dev/image/upload/s--Yq4WygD0--/f_auto/v1724887052/avatars/avatar_g31ZKLPQ3NZdC3vN9plJS',
      },
    ],
  },
  {
    id: 'qve2fcLy2',
    title:
      'The Difference Between Knowing Kubernetes and Understanding Kubernetes',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/35fb0a5f37a182e99bfa1eae232524dd?_a=AQAEuop',
    readTime: 4,
    createdAt: '2026-07-21T07:33:38.065Z',
    numUpvotes: 71,
    numComments: 12,
    tags: ['devops', 'kubernetes'],
    commentsPermalink:
      'https://daily.dev/posts/the-difference-between-knowing-kubernetes-and-understanding-kubernetes-qve2fcly2',
    type: 'article',
    source: {
      id: 'medium_js',
      handle: 'medium_js',
      name: 'Medium',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/medium',
    },
    commenters: [
      {
        id: 'IuKlhCQX7W7k6aXA5dKXm',
        name: 'Chhoeun K.Keaphirunphirakbot',
        image:
          'https://lh3.googleusercontent.com/a/AATXAJyu3svre68RXAs8yXKtzZsd-K-S7yMa4mOqbq1m=s100',
      },
      {
        id: 'uekIoDoLCiDusYVaSEv8n',
        name: 'Sagar Budhathoki',
        image: 'https://avatars.githubusercontent.com/u/28835494?v=4',
      },
      {
        id: 'TvTVeiMdkRCqWUDullFmy',
        name: 'kartik-nvjk',
        image:
          'https://media.daily.dev/image/upload/s--3gGgsVCw--/f_auto/v1781456774/avatars/avatar_TvTVeiMdkRCqWUDullFmy?_a=BAMAMiWQ0',
      },
    ],
    upvoters: [
      {
        id: 'wvO7qkVM7MqsAFC8FyNk3',
        name: 'Jordan',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocKWT3GtS6bZBIiLQWtyTV2Yv4Jr65GFVOcL29lg0qGKn4YIavl8Uw=s96-c',
      },
      {
        id: 'B2AeMj3ekK7E9uZEMGg3l',
        name: 'lubna ibrahim',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocLD-71NxgHETRTIs-7CwaKFsZPs2Sto2wdQ0m_YynZhOisooQ=s96-c',
      },
      {
        id: 'FStpm3ZejUD3qGlEeoOUS',
        name: 'Taiwo Francis Oguntade',
        image:
          'https://media.daily.dev/image/upload/s--px3_Pvo4--/f_auto/v1785515368/avatars/avatar_FStpm3ZejUD3qGlEeoOUS?_a=BAMAMicg0',
      },
      {
        id: 'CnElUCgNMheNZNLcNDH7L',
        name: 'Iana Makhonko',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocIa0kGf-suenrhyN0fB0zHVkZnRNTd7ZToX-B-vEj5arxA=s96-c',
      },
    ],
  },
  {
    id: '2a2haeRkb',
    title: 'The Anatomy of an AI Agent',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/0a4db298ae3760c66e00b58a6deb5296?_a=AQAEuop',
    readTime: 7,
    createdAt: '2026-10-08T06:08:53.117Z',
    numUpvotes: 19,
    numComments: 5,
    tags: ['devops', 'llm', 'ai-agents', 'mcp', 'rag'],
    commentsPermalink:
      'https://daily.dev/posts/the-anatomy-of-an-ai-agent-2a2haerkb',
    type: 'article',
    source: {
      id: 'medium_js',
      handle: 'medium_js',
      name: 'Medium',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/medium',
    },
    commenters: [
      {
        id: 'FcV6rpPe1dyVyli0kci8v',
        name: 'Martin Leinweber',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocIjCoI1kmwWb9TGMZYxVC8pjAGmy2Tv4LN_8KgjNxJpNIDUxHsl=s96-c',
      },
      {
        id: 'TvTVeiMdkRCqWUDullFmy',
        name: 'kartik-nvjk',
        image:
          'https://media.daily.dev/image/upload/s--3gGgsVCw--/f_auto/v1781456774/avatars/avatar_TvTVeiMdkRCqWUDullFmy?_a=BAMAMiWQ0',
      },
      {
        id: 'D01lc7heaVlNdSECpZE5Z',
        name: 'lukyan',
        image:
          'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
      },
    ],
    upvoters: [
      {
        id: 'Hceb2FtkM7Wr4gNQIILy0',
        name: 'Eddi Sanchez',
        image:
          'https://media.daily.dev/image/upload/s--_H1f3Ls---/f_auto/v1788481175/avatars/avatar_Hceb2FtkM7Wr4gNQIILy0?_a=BAMAMicg0',
      },
      {
        id: '16tQOasE4z75jhlWM8oS6',
        name: 'Stephan Sandriesser',
        image:
          'https://media.daily.dev/image/upload/s--2EsTVmLo--/f_auto/v1717078722/avatars/avatar_16tQOasE4z75jhlWM8oS6',
      },
      {
        id: '7wdjBBBVLN4AE9iwcR2FP',
        name: 'Ahmed Khaled',
        image:
          'https://media.daily.dev/image/upload/s--MzlHllrN--/f_auto/v1781384862/avatars/avatar_7wdjBBBVLN4AE9iwcR2FP?_a=BAMAMiWQ0',
      },
      {
        id: 'aV4IJmbeME',
        name: 'Subash Rodrigo',
        image:
          'https://lh3.googleusercontent.com/a-/AOh14GjglIgBITWzfgFxfreka-lRgzi5UdMMQ2OzYmpBTA=s100',
      },
    ],
  },
  {
    id: 'b7eKZAZNV',
    title:
      'Tempo 3.1 release: new features for Kafka, TraceQL metrics updates, trace redaction, and more',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/75e6aca49705ddf77fd6a8eea19684d3?_a=AQAEuop',
    readTime: 17,
    createdAt: '2026-10-01T07:23:00.780Z',
    numUpvotes: 39,
    numComments: 5,
    tags: ['devops', 'observability', 'kafka'],
    commentsPermalink:
      'https://daily.dev/posts/tempo-3-1-release-new-features-for-kafka-traceql-metrics-updates-trace-redaction-and-more-b7ekzaznv',
    type: 'article',
    source: {
      id: 'grafana',
      handle: 'grafana',
      name: 'Grafana Labs',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/769cb8df467e4c428abd75e0c2491d1d',
    },
    commenters: [
      {
        id: 'H4hCMWaaG4ckYBrbnBh7y',
        name: 'Nahum Litvin',
        image:
          'https://lh3.googleusercontent.com/a-/AOh14GhvJ2y-9R45d5ee78ZdAo8l7J3t4G8fINkx5PEqBfA=s100',
      },
      {
        id: 'TvTVeiMdkRCqWUDullFmy',
        name: 'kartik-nvjk',
        image:
          'https://media.daily.dev/image/upload/s--3gGgsVCw--/f_auto/v1781456774/avatars/avatar_TvTVeiMdkRCqWUDullFmy?_a=BAMAMiWQ0',
      },
      {
        id: 'ryDlbifZ1EuRuh3g51ryC',
        name: 'Risto Tõldsep',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocLDWc6mZn0JwNmXXw6WY0L_HJ6pegzRttooC5VgtXESHSj3MNYx=s96-c',
      },
    ],
    upvoters: [
      {
        id: '8hG5UbNYgbdAapsh0MT57',
        name: 'Gerardo Torres Marruenda',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocJIBL-wtbwhlFcq0eyICV9HsRw2HS5qmZv0R1_Z_6UIEYZsNex1=s96-c',
      },
      {
        id: '3RIxldxMFpzm5fIHIGMl5',
        name: 'Andromeda',
        image:
          'https://media.daily.dev/image/upload/s--FczMGWTg--/f_auto/v1791677381/avatars/avatar_3RIxldxMFpzm5fIHIGMl5?_a=BAMAMicg0',
      },
      {
        id: 'MF1TfC05be7tWHwCu1Rwr',
        name: 'Ahmet Özel',
        image: 'https://avatars.githubusercontent.com/u/70992231?v=4',
      },
      {
        id: 'oRABOy3xZani7426klsk3',
        name: 'Prithvi Raj Banik',
        image: 'https://avatars.githubusercontent.com/u/175542386?v=4',
      },
    ],
  },
  {
    id: 'VIVynMBNG',
    title: 'AI Is Already Better at Coding Than Most Software Developers',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/b3fdf2a5211df1228e85323f5ffc5614?_a=AQAEuop',
    readTime: 6,
    createdAt: '2026-09-10T13:20:08.476Z',
    numUpvotes: 194,
    numComments: 53,
    tags: ['ai', 'webdev', 'career', 'ai-coding', 'vibe-coding'],
    commentsPermalink:
      'https://daily.dev/posts/ai-is-already-better-at-coding-than-most-software-developers-vivynmbng',
    type: 'article',
    source: {
      id: 'devto',
      handle: 'devto',
      name: 'DEV',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/devto',
    },
    commenters: [
      {
        id: 'HUMAuhoPf9klVwly7FQDV',
        name: 'John Zeiss',
        image:
          'https://lh3.googleusercontent.com/a/AAcHTtfNOiiByFsWA70OvEx1aeYMXwQy7gBQd7jTw2VesAEY=s96-c',
      },
      {
        id: 'MF1TfC05be7tWHwCu1Rwr',
        name: 'Ahmet Özel',
        image: 'https://avatars.githubusercontent.com/u/70992231?v=4',
      },
      {
        id: 'ytCVp6dQicn9P0yKfhQCI',
        name: 'GenXdev',
        image:
          'https://media.daily.dev/image/upload/s--PrWOWtSq--/f_auto/v1789486214/avatars/avatar_ytCVp6dQicn9P0yKfhQCI?_a=BAMAMicg0',
      },
    ],
    upvoters: [
      {
        id: 'TUSKKX2vokHscZctkuvAv',
        name: 'Bipul Chitrakar',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocIRchAdKRYG20uuT18kvEq9-gnXrTLtLuuSSwXfJwTJcbVaImPOoQ=s96-c',
      },
      {
        id: 'OEzCyzaXvlSE7N6qpGjEH',
        name: 'Sunny',
        image:
          'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
      },
      {
        id: 'CgviC0yrDBNxwzspWnv0H',
        name: 'Andrew Vaz',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocJ6KlvjV2AlNuC438nFoPIx826S9B2Cfv3V5zjmCDWwCeTcke0=s96-c',
      },
      {
        id: 'hTYlVMbhE2HbVJbnF0M9p',
        name: 'Vishal Fulwani',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocLhYqbOUfLZlyG3cWNmMeht04rptSvizJNBtLVMRdmTEt_FZQ=s96-c',
      },
    ],
  },
  {
    id: 'D3DLRKJ2y',
    title: 'The Disappearing Senior: AI and Entry Level Jobs',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/f0a567be9af04b54099cadbe153153d5?_a=AQAEuop',
    readTime: 9,
    createdAt: '2026-07-30T01:33:59.034Z',
    numUpvotes: 168,
    numComments: 32,
    tags: ['ai', 'career', 'sql'],
    commentsPermalink:
      'https://daily.dev/posts/the-disappearing-senior-ai-and-entry-level-jobs-d3dlrkj2y',
    type: 'article',
    source: {
      id: 'sql-authority',
      handle: 'sql-authority',
      name: 'SQL Authority',
      image:
        'https://media.daily.dev/image/upload/s--reCGnvgi--/f_auto,q_auto/v1780213436/logos/sql-authority?_a=BAMAMiWQ0',
    },
    commenters: [
      {
        id: 'QwWczI1OhnuqJ3vckrPPp',
        name: 'HARSHIT MANEPALLY',
        image:
          'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
      },
      {
        id: '1EhzrM1K8RjvlbJPwRfP6',
        name: 'Sachchidanand Chitnis',
        image:
          'https://media.daily.dev/image/upload/s--QUfblGFP--/f_auto/v1782972312/avatars/avatar_1EhzrM1K8RjvlbJPwRfP6?_a=BAMAMicg0',
      },
      {
        id: 'SSZkvyTK8RRutkWuDql2l',
        name: 'Chris',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocKoF76b4yIw_SQXJfF-jVBZeyeIZCmmUm1e4cc9fKDQoY52O2qN=s96-c',
      },
    ],
    upvoters: [
      {
        id: 'lYwwNGH21OCY8XooveYWJ',
        name: 'Ryan Brown',
        image:
          'https://media.daily.dev/image/upload/s--ZBCntI2N--/f_auto/v1789097638/avatars/avatar_lYwwNGH21OCY8XooveYWJ?_a=BAMAMicg0',
      },
      {
        id: 'Ueir2ScMP8RNEVpl0XxK2',
        name: 'zakarya',
        image:
          'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
      },
      {
        id: 'zNS22nH6nR3f9Palw7N00',
        name: '矢野春樹',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocIOE1gQxjZ8JJ0k4zCIh4_DmDJQ0TuBFuFwngzjwjQL8WgjHw=s96-c',
      },
      {
        id: '2WcBHjlzCXrFOTQiBe3x1',
        name: 'Todd Schneckloth',
        image:
          'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
      },
    ],
  },
  {
    id: 'XCmmeq8ZC',
    title: "I Think We're Forgetting How to Be Bored",
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/7eeedd824847f90cc09aade5c25acad5?_a=AQAEuop',
    readTime: 8,
    createdAt: '2026-10-07T17:01:04.220Z',
    numUpvotes: 107,
    numComments: 27,
    tags: ['ai', 'productivity'],
    commentsPermalink:
      'https://daily.dev/posts/i-think-we-re-forgetting-how-to-be-bored-xcmmeq8zc',
    type: 'article',
    source: {
      id: 'devto',
      handle: 'devto',
      name: 'DEV',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/devto',
    },
    commenters: [
      {
        id: '64wOj5iswWHLVLl5yWwjM',
        name: 'RedNam',
        image:
          'https://lh3.googleusercontent.com/a-/AFdZucqDSNunrSaLtT2ym3V6Qxx6l89iznW_u9akrtiI6Vg=s100',
      },
      {
        id: 'Aa0f0ajamxStQVNrHYWZr',
        name: 'Hardik',
        image:
          'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
      },
      {
        id: 'yfCcjiz4shk9l1kaXs7m1',
        name: 'Andrea Senni',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocL9zDvgvAHJyMsmnVewPaOwW1fMuVIk0D1besTkxG8tnUmIoQ=s96-c',
      },
    ],
    upvoters: [
      {
        id: 'R7FIInHfb5Sztr0bILykP',
        name: 'Rafael Dória',
        image:
          'https://media.daily.dev/image/upload/s--tRS_1Hiu--/f_auto/v1770756242/avatars/avatar_R7FIInHfb5Sztr0bILykP?_a=BAMAMiiu0',
      },
      {
        id: 'IlOE0PbOOShGmZPJJlgI6',
        name: 'Kate Johnson',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocLmlXhI2hHKnsOJIETIFaJYmAwnHU9VKwyZdbPheOrZfr5462I=s96-c',
      },
      {
        id: '5D7rcaaLJD6oCysJ7499A',
        name: 'Dark emperor',
        image:
          'https://media.daily.dev/image/upload/s--1n10hBxb--/f_auto/v1719040576/avatars/avatar_5D7rcaaLJD6oCysJ7499A',
      },
      {
        id: 'wkPuMtV83z5WseTrVc5QU',
        name: 'Andreas',
        image:
          'https://media.daily.dev/image/upload/s--0yHQgkD3--/f_auto/v1730121566/avatars/avatar_wkPuMtV83z5WseTrVc5QU',
      },
    ],
  },
  {
    id: 'vqi8DEPhd',
    title: 'They really do think AI might kill everyone',
    image:
      'https://media.daily.dev/image/upload/s--1KxV4ohY--/f_auto/v1722860400/public/Placeholder%2007',
    readTime: 9,
    createdAt: '2026-09-10T05:31:18.970Z',
    numUpvotes: 54,
    numComments: 23,
    tags: ['ai', 'anthropic', 'ai-safety'],
    commentsPermalink:
      'https://daily.dev/posts/they-really-do-think-ai-might-kill-everyone-vqi8dephd',
    type: 'article',
    source: {
      id: 'seangoedecke',
      handle: 'seangoedecke',
      name: 'sean goedecke',
      image:
        'https://media.daily.dev/image/upload/s--WNgiZyDx--/f_auto,q_auto/v1765713419/logos/seangoedecke',
    },
    commenters: [
      {
        id: 'bK85rJb2OXXID2LX2wi5y',
        name: 'Elmar Chavez',
        image:
          'https://media.daily.dev/image/upload/s--7PjH979T--/f_auto/v1780994221/avatars/avatar_bK85rJb2OXXID2LX2wi5y?_a=BAMAMiWQ0',
      },
      {
        id: '9ZRLUGo5f5SDltjy6YkSS',
        name: 'John Lenin Ortiz Gamba',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocIyBXk2RkuOwEcLBlmg-PLoDIMpEciWJNlVMK2DWTQlx6SdsUQ=s96-c',
      },
      {
        id: 'hNMZNCVy7bAlUmFSox5Up',
        name: 'Baz',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocKd2iFU8YS4sV-rBJptuYSF8EHeQnm23N_dcXE1uON7_GMIlZg=s96-c',
      },
    ],
    upvoters: [
      {
        id: 'zNS22nH6nR3f9Palw7N00',
        name: '矢野春樹',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocIOE1gQxjZ8JJ0k4zCIh4_DmDJQ0TuBFuFwngzjwjQL8WgjHw=s96-c',
      },
      {
        id: 'Rhhpnjh3qCGaYoV7TiO54',
        name: 'praveenkumar414',
        image: 'https://avatars.githubusercontent.com/u/286906715?v=4',
      },
      {
        id: '5xsineGQgzJg0No1fJQw1',
        name: 'Dunamis Junior',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocIM93r046kaI74Qn4YCz3g6ptMu2dGiZ_KpgJB7X1UYcw6H85k=s96-c',
      },
      {
        id: '7wDk5imWOuHXs8i88htiM',
        name: 'Md Shoriful Islam Ashiq',
        image: 'https://avatars.githubusercontent.com/u/22385106?v=4',
      },
    ],
  },
  {
    id: 'kqNUxrv44',
    title: "Why I don't recommend Tailwind CSS",
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/06d1cc19a781d48114465427142d9c13?_a=AQAEuop',
    readTime: 10,
    createdAt: '2026-08-02T08:58:19.794Z',
    numUpvotes: 245,
    numComments: 75,
    tags: ['webdev', 'css', 'tailwind-css'],
    commentsPermalink:
      'https://daily.dev/posts/why-i-don-t-recommend-tailwind-css-kqnuxrv44',
    type: 'article',
    source: {
      id: 'hn',
      handle: 'hn',
      name: 'Hacker News',
      image: 'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/hn',
    },
    commenters: [
      {
        id: 'pWEhX8JhjnUQB2l4CNVSW',
        name: 'OrcDev',
        image: 'https://avatars.githubusercontent.com/u/7549148?v=4',
      },
      {
        id: 'iYIZwiJAMuCGXY2OiXW0x',
        name: 'heracles 2756',
        image:
          'https://media.daily.dev/image/upload/s--NoOPHSFv--/f_auto/v1785506917/avatars/avatar_iYIZwiJAMuCGXY2OiXW0x?_a=BAMAMicg0',
      },
      {
        id: 'umWZ9aQAng34qk5aaJl2q',
        name: 'Lars Faye | Confident Coding',
        image:
          'https://media.daily.dev/image/upload/s--OGZu5DEc--/f_auto/v1772569630/avatars/avatar_umWZ9aQAng34qk5aaJl2q?_a=BAMAMiiu0',
      },
    ],
    upvoters: [
      {
        id: 'O68VEYt9RhbYfKtKNA6hQ',
        name: 'Punk Pretty',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocL9lbZtGNmTPsb3cbzAT9p5-odoi3I5Tuf07TSnsPeWp_0tEg=s96-c',
      },
      {
        id: 'jJfHMgfrtqbOYZ3Qo3lh2',
        name: 'User Name',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocJEbc_J42Pd8aZAABo8rrAl5vysGeCoy6MRdwPTmYYLjKrZJg=s96-c',
      },
      {
        id: '4vSv75hZMVGUCdnXxynTh',
        name: 'Devis',
        image:
          'https://media.daily.dev/image/upload/s--7CAs56Ns--/f_auto/v1788386316/avatars/avatar_4vSv75hZMVGUCdnXxynTh?_a=BAMAMicg0',
      },
      {
        id: 'BP2Wt2iKvytvCU8vclNlJ',
        name: 'FroggoBytes',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocIhg6NN-TLfaXu8cQTdOSSfKRyxQz9X2NJZBbdTiYjb8BPjg12j=s96-c',
      },
    ],
  },
  {
    id: 'AzxnBHN3V',
    title:
      "Stop building side projects. Nobody cares — and here's the uncomfortable math.",
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/279f238255e1e5efc73a2a728f930e04?_a=AQAEuop',
    readTime: 8,
    createdAt: '2026-09-25T01:49:39.391Z',
    numUpvotes: 49,
    numComments: 20,
    tags: ['ai', 'webdev', 'career', 'productivity', 'ai-coding'],
    commentsPermalink:
      'https://daily.dev/posts/stop-building-side-projects-nobody-cares-and-here-s-the-uncomfortable-math--azxnbhn3v',
    type: 'article',
    source: {
      id: 'devto',
      handle: 'devto',
      name: 'DEV',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/devto',
    },
    commenters: [
      {
        id: '6IdnqMMOOOgB3soUyjQy2',
        name: 'Dusty Sheldon',
        image: 'https://avatars.githubusercontent.com/u/30704778?v=4',
      },
      {
        id: 'FwRaioVs5styNlriStbr0',
        name: 'The Gatoo Meow',
        image:
          'https://lh3.googleusercontent.com/a/AGNmyxa8bkG8FWlLnHE5p6Vp7TubCfYOJFfZBVefVo5M=s96-c',
      },
      {
        id: 'wtjuykBQdw3aBVs5bEfmv',
        name: 'Matheus Luiz',
        image: 'https://avatars.githubusercontent.com/u/33574469?v=4',
      },
    ],
    upvoters: [
      {
        id: 'zNS22nH6nR3f9Palw7N00',
        name: '矢野春樹',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocIOE1gQxjZ8JJ0k4zCIh4_DmDJQ0TuBFuFwngzjwjQL8WgjHw=s96-c',
      },
      {
        id: '8Bhfj3hAmrPU6dvsgG9x7',
        name: 'Harsha Lakshan Jayathissa',
        image: 'https://avatars.githubusercontent.com/u/112598753?v=4',
      },
      {
        id: 'Uj9LsiqgI3Pr8iuUrdAOA',
        name: 'Gustavs Fricis Jankavs',
        image: 'https://avatars.githubusercontent.com/u/89642177?v=4',
      },
      {
        id: 'fEpYcw7JnLTAQHMt8nX8Q',
        name: 'Md. Obaydul Hoque',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocLOPKVQpEd1ABWc1tnuv6vt0PVHGIUhFDLY8kv2r6_nim_hJPs=s96-c',
      },
    ],
  },
  {
    id: 'rkdZeFgF1',
    title: 'Is Minifying CSS Necessary? (2023)',
    image:
      'https://media.daily.dev/image/upload/s--58gMhC4P--/f_auto/v1722860399/public/Placeholder%2012',
    readTime: 4,
    createdAt: '2026-09-01T20:18:59.558Z',
    numUpvotes: 53,
    numComments: 20,
    tags: ['webdev', 'general-programming', 'css'],
    commentsPermalink:
      'https://daily.dev/posts/is-minifying-css-necessary-2023--rkdzefgf1',
    type: 'article',
    source: {
      id: 'lobsters',
      handle: 'lobsters',
      name: 'Lobsters',
      image:
        'https://media.daily.dev/image/upload/s--tl8v_Fku--/f_auto,t_logo/v1698841318/logos/lobste.jpg',
    },
    commenters: [
      {
        id: 'uoZKmAphTk3DFyYHZwv9Q',
        name: 'Saruultugs Azgun',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocJIrwuBJd7Yv13vvSVDPnq8qjdNJc_4sUU833eXyHU9ksTpUMk=s96-c',
      },
      {
        id: 'ezH33Lu6a37KM1SfsCwIx',
        name: 'Vladislav Siumbeli',
        image:
          'https://media.daily.dev/image/upload/s--GalxSgjS--/f_auto/v1757768087/avatars/avatar_ezH33Lu6a37KM1SfsCwIx?_a=BAMClqZW0',
      },
      {
        id: 'j0aX3yy9bDkDJDShHMXar',
        name: 'Yair Even Or',
        image: 'https://avatars.githubusercontent.com/u/845031?v=4',
      },
    ],
    upvoters: [
      {
        id: 'Z2l5auiKUYEZxi12F119x',
        name: 'Kevin J. Zea',
        image: 'https://avatars.githubusercontent.com/u/60053714?v=4',
      },
      {
        id: '2n5qhjIxIu1AvW4H7gitb',
        name: 'navid gh',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocKyKdbJ0mn_M8CINSyL5L28q31Jzgrl0kYWks0ufJQkoRB-ig=s96-c',
      },
      {
        id: 'SjBetbcLuxFYusyf5z0Yz',
        name: 'Kadi',
        image: 'https://avatars.githubusercontent.com/u/14826757?v=4',
      },
      {
        id: 'c8e54637d3ee4126a9c503737169de61',
        name: 'Keshav Ashiya',
        image: 'https://avatars0.githubusercontent.com/u/20239068?v=4',
      },
    ],
  },
  {
    id: 'UErBIyZD2',
    title: 'DOOM Using Regular Expressions',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/56d3b7a4fedb33031333a0b02f037002?_a=AQAEuop',
    readTime: 1,
    createdAt: '2026-07-29T05:12:08.813Z',
    numUpvotes: 70,
    numComments: 13,
    tags: ['python'],
    commentsPermalink:
      'https://daily.dev/posts/doom-using-regular-expressions-uerbiyzd2',
    type: 'article',
    source: {
      id: 'hackaday',
      handle: 'hackaday',
      name: 'Hackaday',
      image:
        'https://media.daily.dev/image/upload/s--JhDfhy70--/f_auto,q_auto/v1767541814/logos/hackaday',
    },
    commenters: [
      {
        id: 'zyFqB01G2vXeC6aJycktp',
        name: 'Ezpie',
        image: 'https://avatars.githubusercontent.com/u/104765117?v=4',
      },
      {
        id: 'te94fqDz6sy8h29raOx4c',
        name: 'Namith',
        image: 'https://avatars.githubusercontent.com/u/92907249?v=4',
      },
      {
        id: 'iXrpwYKFxOVsR2OHMxQz2',
        name: 'Andres Sanchez',
        image:
          'https://media.daily.dev/image/upload/s--aTrkrrFL--/f_auto/v1785346403/avatars/avatar_iXrpwYKFxOVsR2OHMxQz2?_a=BAMAMicg0',
      },
    ],
    upvoters: [
      {
        id: 'Ys89ctLkreQyAu12pc1Du',
        name: 'Bryndon Ekabe',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocJrpeICjifc0AJdB5Z_KXRofoGSvoWJ_SwOgRf65rqAbl6oMA=s96-c',
      },
      {
        id: 'EZLQONDtTq59ver2NX3gm',
        name: 'minh nguyen',
        image: 'https://avatars.githubusercontent.com/u/57949576?v=4',
      },
      {
        id: 'CSjFYtlcokifR6ZABE5Rq',
        name: 'Mala',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocISLiurj5RaPZnG1IlxRevyKHmuGKtNMF5bvIdU4yuOBfstnuHDng=s96-c',
      },
      {
        id: 'BMhoaQfSTpGpZjcRetNko',
        name: 'Łegenðarý父',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocJvUK-3i5ugWOQFWGP5GnmgzttOFt-9gsybY4Ee2tspX89WNJdo=s96-c',
      },
    ],
  },
  {
    id: 'HpB2Ytmzl',
    title: 'Build and Train a 25M Parameter LLM From Scratch on Your CPU',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/730d4d0016f6598939873ec34ae3fde5?_a=AQAEuop',
    readTime: 2,
    createdAt: '2026-10-08T04:03:33.660Z',
    numUpvotes: 132,
    numComments: 5,
    tags: [
      'machine-learning',
      'python',
      'llm',
      'reinforcement-learning',
      'mixture-of-experts',
    ],
    commentsPermalink:
      'https://daily.dev/posts/build-and-train-a-25m-parameter-llm-from-scratch-on-your-cpu-hpb2ytmzl',
    type: 'article',
    source: {
      id: 'freecodecamp',
      handle: 'freecodecamp',
      name: 'freeCodeCamp',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1628412854/logos/freecodecamp',
    },
    commenters: [
      {
        id: 'QwWczI1OhnuqJ3vckrPPp',
        name: 'HARSHIT MANEPALLY',
        image:
          'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
      },
      {
        id: 'ryDlbifZ1EuRuh3g51ryC',
        name: 'Risto Tõldsep',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocLDWc6mZn0JwNmXXw6WY0L_HJ6pegzRttooC5VgtXESHSj3MNYx=s96-c',
      },
      {
        id: 'ytFXfSuvulhE7N6ULXRcK',
        name: 'Yeon',
        image:
          'https://media.daily.dev/image/upload/s--0y--U8hL--/f_auto/v1781177930/avatars/avatar_ytFXfSuvulhE7N6ULXRcK?_a=BAMAMiWQ0',
      },
    ],
    upvoters: [
      {
        id: 'vYudP1Epu3ARGZlXHsdmC',
        name: 'Muhammad Reyaan Manzoor',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocKTTB9j8NWM6H34TpT-vcfChZsyE8tCdHs3apDKGnyQ5DjCCWI=s96-c',
      },
      {
        id: 'VTmo9GVvig5HJ4uoo7YCV',
        name: 'R. Akash Selvaraj',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocKkr6_cJSXfBvRGhKz0t3c_DERYldYlZLnQEvbVjqh0ewYodeA4=s96-c',
      },
      {
        id: 'UnWM3f8g3',
        name: 'Sky',
        image: 'https://avatars.githubusercontent.com/u/13388477?v=4',
      },
      {
        id: 'Z6hjaQSUBFq6zwm0vTTFm',
        name: 'Lechcher Archson',
        image:
          'https://media.daily.dev/image/upload/s--9AQHpGhG--/f_auto/v1752654574/avatars/avatar_Z6hjaQSUBFq6zwm0vTTFm?_a=BAMClqZW0',
      },
    ],
  },
  {
    id: 'B4AdOqQFH',
    title:
      'After OpenAI, Anthropic finds Claude breached three organizations during cyber tests',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/7e2262f23f6d46d71bec45a09f2951e7?_a=AQAEuop',
    readTime: 6,
    createdAt: '2026-07-31T08:57:13.978Z',
    numUpvotes: 27,
    numComments: 5,
    tags: ['python', 'llm', 'claude', 'anthropic', 'ai-security'],
    commentsPermalink:
      'https://daily.dev/posts/after-openai-anthropic-finds-claude-breached-three-organizations-during-cyber-tests-b4adoqqfh',
    type: 'article',
    source: {
      id: 'csoonline',
      handle: 'csoonline',
      name: 'CSO Online',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/98667e4b5cac46cf9c470819c6cf71cd',
    },
    commenters: [
      {
        id: 'V7baLm8Y0o32yjz1hHf5a',
        name: 'Fabian Letsch',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocKR6BVy_wn23EoOKq7-BlszlcXcLmASlnb7l-GtS-q1bePnkaJf=s96-c',
      },
      {
        id: 'aSUkzUQS97QJpQRxKMe49',
        name: 'Deep Joshi',
        image:
          'https://media.daily.dev/image/upload/s--TdY8j8Aa--/f_auto/v1776506972/avatars/avatar_aSUkzUQS97QJpQRxKMe49?_a=BAMAMiWQ0',
      },
      {
        id: '7whH5rqdfECdn3LmTA8Rr',
        name: 'Charletta Hudson',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocJHxL9NAl7wUVrjHUtIKrZieOjdADuebeJQFYtvsK4MatQ4kh8=s96-c',
      },
    ],
    upvoters: [
      {
        id: 'ar3oE1YfNz9MIgNgN0n1e',
        name: 'THat-GUyy-1',
        image:
          'https://media.daily.dev/image/upload/s--X-_Fscc2--/f_auto/v1786314634/avatars/avatar_ar3oE1YfNz9MIgNgN0n1e?_a=BAMAMicg0',
      },
      {
        id: 'UCZCybWPHjWO9G9Ae56Rm',
        name: 'Talha. devverx',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocL-u5Rbjp8xrYo4YW1dSwcC3qDIXAHyhIONU-SAlKCYrsZRmiY=s96-c',
      },
      {
        id: '5c9818238a004652b825eb85400f7a74',
        name: 'Szymon Sebastian Malecki',
        image:
          'https://media.daily.dev/image/upload/f_auto/v1660047035/avatars/5c9818238a004652b825eb85400f7a74',
      },
      {
        id: 'A5-jHABh3',
        name: 'Thomas Mazon Oliveira',
        image:
          'https://media.daily.dev/image/upload/s--KFSFRW7K--/f_auto/v1760538803/avatars/avatar_A5-jHABh3?_a=BAMAK+ZW0',
      },
    ],
  },
  {
    id: 'uV8eZ8ZWe',
    title: 'Part 1: Make your AI agents boring: the determinism layer',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/700d3140dc33f10d76a0e629a36d123a?_a=AQAEuop',
    readTime: 14,
    createdAt: '2026-10-07T20:35:23.973Z',
    numUpvotes: 10,
    numComments: 4,
    tags: ['python', 'llm', 'ai-agents', 'architecture'],
    commentsPermalink:
      'https://daily.dev/posts/part-1-make-your-ai-agents-boring-the-determinism-layer-uv8ez8zwe',
    type: 'article',
    source: {
      id: 'stackov',
      handle: 'stackov',
      name: 'Stack Overflow Blog',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/003e14873238469caea60ebdd34508ae',
    },
    commenters: [
      {
        id: 'TvTVeiMdkRCqWUDullFmy',
        name: 'kartik-nvjk',
        image:
          'https://media.daily.dev/image/upload/s--3gGgsVCw--/f_auto/v1781456774/avatars/avatar_TvTVeiMdkRCqWUDullFmy?_a=BAMAMiWQ0',
      },
      {
        id: 'EMoP47rpuw8DNjhp6R1b6',
        name: 'Trevor Suna',
        image:
          'https://media.daily.dev/image/upload/s--dZ7gXxpp--/f_auto/v1784081551/avatars/avatar_EMoP47rpuw8DNjhp6R1b6?_a=BAMAMicg0',
      },
      {
        id: '774zDwMaRTNS1fv5OKStX',
        name: 'DiyWeb',
        image:
          'https://media.daily.dev/image/upload/s--dgS6jDeN--/f_auto/v1790879420/avatars/avatar_774zDwMaRTNS1fv5OKStX?_a=BAMAMicg0',
      },
    ],
    upvoters: [
      {
        id: 'gcuCsMPfE4tDc9W5IWR6X',
        name: 'Saiful Islam',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocKk_u4IqhPiIOe7ZEEh0mtcXjSUxDzXvYNJAf6pP1KcR8-hlQ=s96-c',
      },
      {
        id: 'ZKLbQ1ROTXM8EJ7PZv383',
        name: 'Lượng Lê',
        image:
          'https://media.daily.dev/image/upload/s--LsBXrQbv--/f_auto/v1791387179/avatars/avatar_ZKLbQ1ROTXM8EJ7PZv383?_a=BAMAMicg0',
      },
      {
        id: 'FMlVluJUzeveEcNpbgO9U',
        name: 'Youssof. K.',
        image:
          'https://lh3.googleusercontent.com/a/AEdFTp7g7ng7R3Kda0v1EJGDbPfcVQASC20XcBnDNsE4=s96-c',
      },
      {
        id: 'GMW59Kxmkij1sNlcslQjJ',
        name: 'Javi Lobato',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocL1edobBw26Zp_zbKeGyV0eYp576MaYoGLLafzOTHGz_l9pKmU=s96-c',
      },
    ],
  },
  {
    id: 'X7Q71DikA',
    title: 'Fast and Hard Code',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/bcd4cca23b458f588483541025f335b5?_a=AQAEuop',
    readTime: 3,
    createdAt: '2026-08-22T19:57:44.789Z',
    numUpvotes: 29,
    numComments: 20,
    tags: ['performance', 'rust', 'ai-coding', 'zig'],
    commentsPermalink: 'https://daily.dev/posts/fast-and-hard-code-x7q71dika',
    type: 'article',
    source: {
      id: 'mitsuhiko',
      handle: 'mitsuhiko',
      name: 'Armin Ronacher',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/a7ee3aca0fbd455ea7510f79c0dd61fe',
    },
    commenters: [
      {
        id: 'JCWoJceDqZPsPQbvk73NC',
        name: 'nerdalytics',
        image: 'https://avatars.githubusercontent.com/u/97166791?v=4',
      },
      {
        id: '29TCpY2hJR72V3BlxPXzX',
        name: 'Daniel',
        image:
          'https://media.daily.dev/image/upload/s--FtwJqX4c--/f_auto/v1754900041/avatars/avatar_29TCpY2hJR72V3BlxPXzX?_a=BAMClqZW0',
      },
      {
        id: 'yHf9cPdgTQEtokv6d8qhM',
        name: 'John Liter',
        image:
          'https://media.daily.dev/image/upload/s--DQ2HUrO4--/f_auto/v1785100315/avatars/avatar_yHf9cPdgTQEtokv6d8qhM?_a=BAMAMicg0',
      },
    ],
    upvoters: [
      {
        id: 'FWD1dNVol198bHmqqV7Tp',
        name: 'Jorge Barsallo',
        image:
          'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
      },
      {
        id: 'tR1mMv2uE',
        name: 'Ken Harrison',
        image: 'https://avatars.githubusercontent.com/u/63295963?v=4',
      },
      {
        id: 'xLzCNMNgy',
        name: 'fatgy',
        image: 'https://avatars.githubusercontent.com/u/353813?v=4',
      },
      {
        id: '3lPrxlPj8z9Y5mjgMyEOo',
        name: 'Ajmal S',
        image:
          'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
      },
    ],
  },
  {
    id: 'VNv8IMYss',
    title: 'Saving another 100TB of RAM with math (and Rust)',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/97e0fa12fbd2fe84838d03e16f3863fc?_a=AQAEuop',
    readTime: 13,
    createdAt: '2026-09-18T17:26:37.198Z',
    numUpvotes: 110,
    numComments: 18,
    tags: ['rust', 'cloudflare'],
    commentsPermalink:
      'https://daily.dev/posts/saving-another-100tb-of-ram-with-math-and-rust--vnv8imyss',
    type: 'article',
    source: {
      id: 'cloudflare',
      handle: 'cloudflare',
      name: 'Cloudflare',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/38522e1d11354cd6b7af66f9d4316735',
    },
    commenters: [
      {
        id: 'orjMeK8QKaaVZwGq7ScPz',
        name: 'PDFops',
        image:
          'https://media.daily.dev/image/upload/s---8isRBKc--/f_auto/v1782922291/avatars/avatar_orjMeK8QKaaVZwGq7ScPz?_a=BAMAMicg0',
      },
      {
        id: '5cQvIZKr5tDFDotVDjulg',
        name: 'Jacob B. Bonde',
        image:
          'https://media.daily.dev/image/upload/s--veTChHK7--/f_auto/v1733220070/avatars/avatar_5cQvIZKr5tDFDotVDjulg',
      },
      {
        id: 'TvTVeiMdkRCqWUDullFmy',
        name: 'kartik-nvjk',
        image:
          'https://media.daily.dev/image/upload/s--3gGgsVCw--/f_auto/v1781456774/avatars/avatar_TvTVeiMdkRCqWUDullFmy?_a=BAMAMiWQ0',
      },
    ],
    upvoters: [
      {
        id: 'oAn9pBTzMG30Yhn5RtxWD',
        name: 'Andreas Fahl',
        image:
          'https://media.daily.dev/image/upload/s--jK_K-Ftq--/f_auto/v1791799378/avatars/avatar_oAn9pBTzMG30Yhn5RtxWD?_a=BAMAMicg0',
      },
      {
        id: 'zKYQKMfAUZa6VDuuYuPKK',
        name: 'Shape shape',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocKnzMErjf266jgBNXzKK6GhvOdGPqaycdoI6HpmikefujN0lUV_uQ=s96-c',
      },
      {
        id: 'utnj0vMfTdtCSxkkDS8u2',
        name: 'Riccardo Moroni',
        image: 'https://avatars.githubusercontent.com/u/43409764?v=4',
      },
      {
        id: 'wHGgZZQjyCAal5fR7EGm2',
        name: 'Jérôme Lidawo Bienvenu NABEDE',
        image:
          'https://media.daily.dev/image/upload/s--2xlykmou--/f_auto/v1744746961/avatars/avatar_wHGgZZQjyCAal5fR7EGm2',
      },
    ],
  },
  {
    id: 'QMZmRIiMy',
    title:
      'Introducing rgctl: A Code Knowledge Graph for Engineering Teams and Agents',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/19f8312e245bfb814411a7be5299969e?_a=AQAEuop',
    readTime: 17,
    createdAt: '2026-09-07T15:56:23.395Z',
    numUpvotes: 16,
    numComments: 18,
    tags: ['ai-agents', 'rust'],
    commentsPermalink:
      'https://daily.dev/posts/introducing-rgctl-a-code-knowledge-graph-for-engineering-teams-and-agents-qmzmriimy',
    type: 'article',
    source: {
      id: 'shaaf',
      handle: 'shaaf',
      name: 'Shaaf',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/0b296c189bd840d99decdb5078460675',
    },
    commenters: [
      {
        id: 'JCWoJceDqZPsPQbvk73NC',
        name: 'nerdalytics',
        image: 'https://avatars.githubusercontent.com/u/97166791?v=4',
      },
      {
        id: 'wQYYVe5Tbj0NJ7C7qPoa8',
        name: 'Agustin Barrientos',
        image:
          'https://media.daily.dev/image/upload/s--5ayxQnqn--/f_auto/v1788281802/avatars/avatar_wQYYVe5Tbj0NJ7C7qPoa8?_a=BAMAMicg0',
      },
      {
        id: 'PkP1a7DClSnrvbTazHg3C',
        name: 'puppet master',
        image:
          'https://media.daily.dev/image/upload/s--FC-RbP-U--/f_auto/v1789578963/avatars/avatar_PkP1a7DClSnrvbTazHg3C?_a=BAMAMicg0',
      },
    ],
    upvoters: [
      {
        id: 'A9x1bZJWBIwfKx7QV12ve',
        name: 'Amine Bezzarga',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocJFUC4LVv2JKGQIhdUfq-Nhl8ziFV8KEzRLu_JszAmdtPT1Znw=s96-c',
      },
      {
        id: '3TfGAxJu5LT0vmv4x8TQn',
        name: 'Qy',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocICJlLWwQgVH2zPG793ZlsIK2yIkJUpfHdOG6RR4KXXL1y71A=s96-c',
      },
      {
        id: 'aSUkzUQS97QJpQRxKMe49',
        name: 'Deep Joshi',
        image:
          'https://media.daily.dev/image/upload/s--TdY8j8Aa--/f_auto/v1776506972/avatars/avatar_aSUkzUQS97QJpQRxKMe49?_a=BAMAMiWQ0',
      },
      {
        id: 'ar3oE1YfNz9MIgNgN0n1e',
        name: 'THat-GUyy-1',
        image:
          'https://media.daily.dev/image/upload/s--X-_Fscc2--/f_auto/v1786314634/avatars/avatar_ar3oE1YfNz9MIgNgN0n1e?_a=BAMAMicg0',
      },
    ],
  },
  {
    id: '7p9nRlTLf',
    title: 'Microsoft doubles down on Rust',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/13209d6f78bf1f46ebda81f5dff37704?_a=AQAEuop',
    readTime: 7,
    createdAt: '2026-10-01T09:06:26.541Z',
    numUpvotes: 30,
    numComments: 12,
    tags: ['microsoft', 'rust'],
    commentsPermalink:
      'https://daily.dev/posts/microsoft-doubles-down-on-rust-7p9nrltlf',
    type: 'article',
    source: {
      id: 'infoworld',
      handle: 'infoworld',
      name: 'InfoWorld',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/bf6d68a999064029b0bb09aa6268f1f3',
    },
    commenters: [
      {
        id: 'whNNg0ajcmne1B7hPHb0U',
        name: 'Gabriel Stundner',
        image:
          'https://media.daily.dev/image/upload/s--UpSzkOxs--/f_auto/v1753488097/avatars/avatar_whNNg0ajcmne1B7hPHb0U?_a=BAMClqZW0',
      },
      {
        id: 'A9xh33q0QoxtkGoJRCosp',
        name: 'Peter Cruckshank',
        image:
          'https://media.daily.dev/image/upload/s--ZJhQyKws--/f_auto/v1721235024/avatars/avatar_A9xh33q0QoxtkGoJRCosp',
      },
      {
        id: 'XFP08dZHhCriuIokH2v8p',
        name: 'Bob',
        image: 'https://avatars.githubusercontent.com/u/193962566?v=4',
      },
    ],
    upvoters: [
      {
        id: '7BlkdVN89a93IW66v7dzN',
        name: 'ehsan Fouladi',
        image:
          'https://lh3.googleusercontent.com/a/AGNmyxYblOiAWr20n8pqWAD0wdzHhShPGf4NYm8C1TeB=s96-c',
      },
      {
        id: '9MKOtSpicpUH0Nbo1kR6r',
        name: 'MikalTim',
        image: 'https://avatars.githubusercontent.com/u/159431172?v=4',
      },
      {
        id: 'EMoP47rpuw8DNjhp6R1b6',
        name: 'Trevor Suna',
        image:
          'https://media.daily.dev/image/upload/s--dZ7gXxpp--/f_auto/v1784081551/avatars/avatar_EMoP47rpuw8DNjhp6R1b6?_a=BAMAMicg0',
      },
      {
        id: 'b4kJF4zuuW8BdVJ5CHRA8',
        name: 'Sowed Castelli',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocKwid0iCcrbHitdaaEXsMPcJkfZOOhBMOJT9ElxmNibyuEVmRki=s96-c',
      },
    ],
  },
  {
    id: 'xM5S5hEac',
    title: 'Introducing G#: A Go-like language for .NET',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/bb68ed705454ba065bbaaedf0659abf8?_a=AQAEuop',
    readTime: 7,
    createdAt: '2026-08-20T09:03:54.256Z',
    numUpvotes: 92,
    numComments: 23,
    tags: ['golang', '.net', 'webassembly'],
    commentsPermalink:
      'https://daily.dev/posts/introducing-g-a-go-like-language-for-net-xm5s5heac',
    type: 'article',
    source: {
      id: 'infoworld',
      handle: 'infoworld',
      name: 'InfoWorld',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/bf6d68a999064029b0bb09aa6268f1f3',
    },
    commenters: [
      {
        id: 'dzTJxWJw70BwUhtmpLYXs',
        name: 'Joris Wouters',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocKq1-3ATui91TME7lcwL-rWPvaKDHgsEhBQIXzeyd3-=s96-c',
      },
      {
        id: 'pop6cDqunSP7yA8TDryi1',
        name: 'Kaseem Stephenson',
        image:
          'https://media.daily.dev/image/upload/s--W9exi3pr--/f_auto/v1769179539/avatars/avatar_pop6cDqunSP7yA8TDryi1?_a=BAMAMiiu0',
      },
      {
        id: 'SbncGJHaRHf7KoebEkT1L',
        name: 'Marko Zakrajsek',
        image:
          'https://media.daily.dev/image/upload/s--slY3-STy--/f_auto/v1783585373/avatars/avatar_SbncGJHaRHf7KoebEkT1L?_a=BAMAMicg0',
      },
    ],
    upvoters: [
      {
        id: 'h3TvBgLJOebbRimCS6toH',
        name: 'Anwar Misbah',
        image:
          'https://media.daily.dev/image/upload/s--fvOVGcTl--/f_auto/v1789987185/avatars/avatar_h3TvBgLJOebbRimCS6toH?_a=BAMAMicg0',
      },
      {
        id: 'Sinjft2KvxIccc7gW3Vve',
        name: 'tanvir ahmed',
        image:
          'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
      },
      {
        id: '4Zm3qa0fjocBw01E5DjY3',
        name: 'Abanob Wagih',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocIV9XhfkaiTy0zESh9T4MFy6MnOnnNvgXcLdYJRm-QNJYrpEV8e=s96-c',
      },
      {
        id: 'PEbLocW14huWHBsq4J1Fz',
        name: 'Anurag Limbu Kandangwa',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocItBWnzCmpCX6PzEAWtUizCNx2pMIWxdNUOTAf-wP5dNUYokBWAvw=s96-c',
      },
    ],
  },
  {
    id: 'dCvXE0Odu',
    title: 'Suddenly I’m a Go developer',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/ca3632b1fbe0feb31129febddee40f11?_a=AQAEuop',
    readTime: 4,
    createdAt: '2026-09-09T09:04:22.356Z',
    numUpvotes: 66,
    numComments: 16,
    tags: ['golang', 'claude-code', 'vibe-coding'],
    commentsPermalink:
      'https://daily.dev/posts/suddenly-i-m-a-go-developer-dcvxe0odu',
    type: 'article',
    source: {
      id: 'infoworld',
      handle: 'infoworld',
      name: 'InfoWorld',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/bf6d68a999064029b0bb09aa6268f1f3',
    },
    commenters: [
      {
        id: '7eQFeSQRDx0muV3n92gxT',
        name: 'Kahlil Wallace',
        image:
          'https://media.daily.dev/image/upload/s--QvppE9Ip--/f_auto/v1767378558/avatars/avatar_7eQFeSQRDx0muV3n92gxT?_a=BAMAK+ZW0',
      },
      {
        id: '4IPthysaTpltF2nyH0F3E',
        name: 'Tochukwu Okeh',
        image:
          'https://lh3.googleusercontent.com/a/ALm5wu0M9zC8KvFRBWLakb25xsuWq6eewxwbl6yGQ8Gp=s96-c',
      },
      {
        id: 'ytCVp6dQicn9P0yKfhQCI',
        name: 'GenXdev',
        image:
          'https://media.daily.dev/image/upload/s--PrWOWtSq--/f_auto/v1789486214/avatars/avatar_ytCVp6dQicn9P0yKfhQCI?_a=BAMAMicg0',
      },
    ],
    upvoters: [
      {
        id: '2n5qhjIxIu1AvW4H7gitb',
        name: 'navid gh',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocKyKdbJ0mn_M8CINSyL5L28q31Jzgrl0kYWks0ufJQkoRB-ig=s96-c',
      },
      {
        id: 'u7kKQ2rLgzOk8zTtmGUMv',
        name: 'Kevin Tewouda',
        image: 'https://avatars.githubusercontent.com/u/10879977?v=4',
      },
      {
        id: 'SovcU_tbi',
        name: 'Robert Monnet',
        image: 'https://avatars.githubusercontent.com/u/1057667?v=4',
      },
      {
        id: 'vCamk_28f',
        name: 'Stephane Pellegrino',
        image:
          'https://lh3.googleusercontent.com/a-/AOh14GhHJZpb7nUO6ZPald1_9_4fVgcBQwejZIvVYRrvZQ=s100',
      },
    ],
  },
  {
    id: 'z4NW802Lb',
    title:
      'I Built a Distributed Task Queue from Scratch with Go and PostgreSQL',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/e99a0cb42a6eb9a08fe3671db05053a6?_a=AQAEuop',
    readTime: 18,
    createdAt: '2026-10-05T19:43:35.061Z',
    numUpvotes: 86,
    numComments: 10,
    tags: ['golang', 'postgresql', 'distributed-systems'],
    commentsPermalink:
      'https://daily.dev/posts/i-built-a-distributed-task-queue-from-scratch-with-go-and-postgresql-z4nw802lb',
    type: 'article',
    source: {
      id: 'medium_js',
      handle: 'medium_js',
      name: 'Medium',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/medium',
    },
    commenters: [
      {
        id: '8ZBnrh39R9oOmsDDnXj0U',
        name: 'Kidpech Pianpithak',
        image: 'https://avatars.githubusercontent.com/u/85755801?v=4',
      },
      {
        id: 'igzBsWloJeaegzm9bQltZ',
        name: 'AllInOneTools',
        image:
          'https://media.daily.dev/image/upload/s--4ZT8QlF0--/f_auto/v1769790028/avatars/avatar_igzBsWloJeaegzm9bQltZ?_a=BAMAMiiu0',
      },
      {
        id: 'ryDlbifZ1EuRuh3g51ryC',
        name: 'Risto Tõldsep',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocLDWc6mZn0JwNmXXw6WY0L_HJ6pegzRttooC5VgtXESHSj3MNYx=s96-c',
      },
    ],
    upvoters: [
      {
        id: 'Y56eN7R5fdAr2zP6RsfN4',
        name: 'Tony',
        image:
          'https://media.daily.dev/image/upload/s--jbHq1QvH--/f_auto,pg_1/v1792011514/avatars/avatar_Y56eN7R5fdAr2zP6RsfN4?_a=BAMAMicg0',
      },
      {
        id: 'ABDl1HIkZ',
        name: 'Mahmoud Gamal ElDeen',
        image: 'https://avatars.githubusercontent.com/u/11192244?v=4',
      },
      {
        id: 'el9680vFWHfo9yfLzLYAC',
        name: 'Abdelraouf Ferah',
        image: 'https://avatars.githubusercontent.com/u/48139663?v=4',
      },
      {
        id: 'q5kJMmyfg7nelzF30PXNe',
        name: 'Joel',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocIFt7cv9oRGx9Y-dOS3vKlulyl2yx1VGu3f0rW9FOXZ9-FFwW4=s96-c',
      },
    ],
  },
  {
    id: 'kveuZLPIB',
    title: 'witr: Why is this running? Trace process, port, container or file',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/ff801c4936063fa54e630faab3a28cef?_a=AQAEuop',
    readTime: 1,
    createdAt: '2026-07-31T07:11:17.766Z',
    numUpvotes: 200,
    numComments: 8,
    tags: ['linux', 'golang', 'cli', 'observability'],
    commentsPermalink:
      'https://daily.dev/posts/witr-why-is-this-running-trace-process-port-container-or-file-kveuzlpib',
    type: 'article',
    source: {
      id: 'ph',
      handle: 'ph',
      name: 'Product Hunt',
      image: 'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/ph',
    },
    commenters: [
      {
        id: '2u5G5NPlPJxETQLjl6FEQ',
        name: 'Akhmad Saaev',
        image: 'https://avatars.githubusercontent.com/u/74871945?v=4',
      },
      {
        id: 'fQ7ttCKtPuu6tDvcgQXv5',
        name: 'Andrew',
        image:
          'https://media.daily.dev/image/upload/s--35vRfXAA--/f_auto/v1785413727/avatars/avatar_fQ7ttCKtPuu6tDvcgQXv5?_a=BAMAMicg0',
      },
      {
        id: 'igzBsWloJeaegzm9bQltZ',
        name: 'AllInOneTools',
        image:
          'https://media.daily.dev/image/upload/s--4ZT8QlF0--/f_auto/v1769790028/avatars/avatar_igzBsWloJeaegzm9bQltZ?_a=BAMAMiiu0',
      },
    ],
    upvoters: [
      {
        id: 'eHhK3Q9EFnxo1DQDYlChS',
        name: 'conandor',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocKIUDLRcKZ6OD9dW7PDdLnft8myhRsZoVbk_MCBJ9JFDhSLe3U=s96-c',
      },
      {
        id: 'I7Oy0mpyXs8dOSJPf3bPC',
        name: 'David15tonon',
        image:
          'https://media.daily.dev/image/upload/s--ODg7gW3B--/f_auto/v1779805078/avatars/avatar_I7Oy0mpyXs8dOSJPf3bPC?_a=BAMAMiWQ0',
      },
      {
        id: 'hEpeVOVrL',
        name: 'Amit Tumkur',
        image:
          'https://lh3.googleusercontent.com/a-/AOh14GgiQb8tcKWvVmOyuyhuVAjWwSehCJeHepZHqM9_EQ=s100',
      },
      {
        id: 'Nzr7jwO5wMoiBbP2CHCzn',
        name: 'NRZ',
        image:
          'https://media.daily.dev/image/upload/s--MJKcj7HO--/f_auto/v1786954720/avatars/avatar_Nzr7jwO5wMoiBbP2CHCzn?_a=BAMAMicg0',
      },
    ],
  },
  {
    id: '7bvdmnnws',
    title: "Git 3.0's upcoming SHA-256 default will be a costly mistake",
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/a98ea39f67b1c3a47433515443307acf?_a=AQAEuop',
    readTime: 20,
    createdAt: '2026-10-01T13:56:39.396Z',
    numUpvotes: 53,
    numComments: 10,
    tags: ['security', 'git', 'version-control'],
    commentsPermalink:
      'https://daily.dev/posts/git-3-0-s-upcoming-sha-256-default-will-be-a-costly-mistake-7bvdmnnws',
    type: 'article',
    source: {
      id: 'gitbutler',
      handle: 'gitbutler',
      name: 'GitButler Blog',
      image:
        'https://media.daily.dev/image/upload/s--LrHsyt2T--/f_auto/v1692632054/squad_placeholder_sfwkmj',
    },
    commenters: [
      {
        id: '29TCpY2hJR72V3BlxPXzX',
        name: 'Daniel',
        image:
          'https://media.daily.dev/image/upload/s--FtwJqX4c--/f_auto/v1754900041/avatars/avatar_29TCpY2hJR72V3BlxPXzX?_a=BAMClqZW0',
      },
      {
        id: 'hmoENBn8p',
        name: 'Devy',
        image: 'https://avatars.githubusercontent.com/u/69612646?v=4',
      },
      {
        id: 'hmoENBn8p',
        name: 'Devy',
        image: 'https://avatars.githubusercontent.com/u/69612646?v=4',
      },
    ],
    upvoters: [
      {
        id: '2n5qhjIxIu1AvW4H7gitb',
        name: 'navid gh',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocKyKdbJ0mn_M8CINSyL5L28q31Jzgrl0kYWks0ufJQkoRB-ig=s96-c',
      },
      {
        id: '5gtD37YhndITuuEGGzGBf',
        name: 'Michał Roman',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocKWdR-e3yHc48rSVf33r1VzMwcBESUQ42Jdu0J1Guc9S745wA=s96-c',
      },
      {
        id: '6BVlF7XIev6nNnCbwCjYu',
        name: 'Erik Hazington',
        image:
          'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
      },
      {
        id: 'GMd5XrXZALdcuhQMPdSkz',
        name: 'Daniel Olamide',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocIm5GSLL3ehqiODZcZLtB4m72HZfe5VMQ5b3BX3ilag730ZE_s5=s96-c',
      },
    ],
  },
  {
    id: 'TnEq4Op27',
    title: 'Load-Bearing People',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/78d22a676f8242753d8d50d1fa29794e?_a=AQAEuop',
    readTime: 8,
    createdAt: '2026-09-02T13:04:57.202Z',
    numUpvotes: 39,
    numComments: 8,
    tags: ['security', 'open-source', 'leadership', 'npm'],
    commentsPermalink: 'https://daily.dev/posts/load-bearing-people-tneq4op27',
    type: 'article',
    source: {
      id: 'mikefisher',
      handle: 'mikefisher',
      name: 'Fish Food for Thought',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/1dba6526e8ca4cdcb395fb5e49d866a8',
    },
    commenters: [
      {
        id: '29TCpY2hJR72V3BlxPXzX',
        name: 'Daniel',
        image:
          'https://media.daily.dev/image/upload/s--FtwJqX4c--/f_auto/v1754900041/avatars/avatar_29TCpY2hJR72V3BlxPXzX?_a=BAMClqZW0',
      },
      {
        id: 'KtViEC6XUg9SnmLig5QLy',
        name: 'Jared',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocJE7F397eAJcrTtLk_RhHueRbehoNCm6rDryyZ_dkCRVWVh4wYd=s96-c',
      },
      {
        id: 'jnPibTyRLEhVdIbii2usr',
        name: 'Mikhail Makeev',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocIjcvDU1gmJ9-KJDeTYqY2rMdl5QxcWYtLTGSXrj8ubF4nwar_w=s96-c',
      },
    ],
    upvoters: [
      {
        id: 'h10P8m32zDfKh8mpmMB3K',
        name: 'Logical Fuzz',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocL-E6nNQpR1s1A7ZLeiYRbYBnMGjNApqZJKlrBdrWjQzEW7pCaY=s96-c',
      },
      {
        id: 'zNS22nH6nR3f9Palw7N00',
        name: '矢野春樹',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocIOE1gQxjZ8JJ0k4zCIh4_DmDJQ0TuBFuFwngzjwjQL8WgjHw=s96-c',
      },
      {
        id: 'S7WPNwyOgoaVmPKJmRrwm',
        name: 'SifaTt Bhuyan',
        image:
          'https://media.daily.dev/image/upload/f_auto/v1653100546/avatars/S7WPNwyOgoaVmPKJmRrwm',
      },
      {
        id: '5Tt6c7K4XUHjmCLLAsemE',
        name: 'Harshit Sharma',
        image:
          'https://lh3.googleusercontent.com/a-/AOh14Ggm2HEbWKhX7OK16w3aLlwG8n-FzXrddE3nUBZl=s100',
      },
    ],
  },
  {
    id: 'joJdR6TPV',
    title:
      'When Agentic Glue Melts: Exploiting Cloudflare Code Mode and Workers',
    image:
      'https://media.daily.dev/image/upload/s--OHB84bZF--/f_auto/v1722860399/public/Placeholder%2010',
    readTime: 26,
    createdAt: '2026-08-07T08:20:09.365Z',
    numUpvotes: 7,
    numComments: 7,
    tags: ['security', 'cloudflare', 'v8'],
    commentsPermalink:
      'https://daily.dev/posts/when-agentic-glue-melts-exploiting-cloudflare-code-mode-and-workers-jojdr6tpv',
    type: 'article',
    source: {
      id: 'cpresearch',
      handle: 'cpresearch',
      name: 'Check Point Research',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/7e3b130555214df2bf737ee6c764fa42',
    },
    commenters: [
      {
        id: 'tT4BuvxaHeTxyE5fH41si',
        name: 'David C.',
        image:
          'https://media.daily.dev/image/upload/s--EPnTZZFw--/f_auto/v1784418453/avatars/avatar_tT4BuvxaHeTxyE5fH41si?_a=BAMAMicg0',
      },
      {
        id: 'A9xh33q0QoxtkGoJRCosp',
        name: 'Peter Cruckshank',
        image:
          'https://media.daily.dev/image/upload/s--ZJhQyKws--/f_auto/v1721235024/avatars/avatar_A9xh33q0QoxtkGoJRCosp',
      },
      {
        id: 'deOg4xn8CTW59STw1Wkrz',
        name: 'Emmanuel Tshiowa',
        image:
          'https://media.daily.dev/image/upload/s--MSq1hVeO--/f_auto/v1768048978/avatars/avatar_deOg4xn8CTW59STw1Wkrz?_a=BAMAMiZW0',
      },
    ],
    upvoters: [
      {
        id: 'fQ7ttCKtPuu6tDvcgQXv5',
        name: 'Andrew',
        image:
          'https://media.daily.dev/image/upload/s--35vRfXAA--/f_auto/v1785413727/avatars/avatar_fQ7ttCKtPuu6tDvcgQXv5?_a=BAMAMicg0',
      },
      {
        id: 'EB0j0Umzh5v3zGWUSL5ma',
        name: 'Doncho Angelov',
        image:
          'https://media.daily.dev/image/upload/s--j1MSm0hy--/f_auto/v1716369534/avatars/avatar_EB0j0Umzh5v3zGWUSL5ma',
      },
      {
        id: 'pXCCaI9zdqwDXJF1InAIZ',
        name: 'Brennan Goewert',
        image: 'https://avatars.githubusercontent.com/u/15313658?v=4',
      },
      {
        id: '3lPrxlPj8z9Y5mjgMyEOo',
        name: 'Ajmal S',
        image:
          'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
      },
    ],
  },
  {
    id: 'sil6TlGPh',
    title: "Oxide joins Anthropic's Project Glasswing",
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/ce48cba4049eb83514b6705fe9a499a9?_a=AQAEuop',
    readTime: 2,
    createdAt: '2026-07-28T12:07:57.633Z',
    numUpvotes: 43,
    numComments: 7,
    tags: ['security', 'open-source', 'anthropic', 'firmware'],
    commentsPermalink:
      'https://daily.dev/posts/oxide-joins-anthropic-s-project-glasswing-sil6tlgph',
    type: 'article',
    source: {
      id: 'oxide',
      handle: 'oxide',
      name: 'Oxide',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/a06afd0e0fbf40ec9d3128cd1c103021',
    },
    commenters: [
      {
        id: 'xMSmIuOOXE5TqCI1OLs4c',
        name: 'Lesley Edinam',
        image:
          'https://media.daily.dev/image/upload/s--I4QFMNNF--/f_auto/v1753089440/avatars/avatar_xMSmIuOOXE5TqCI1OLs4c?_a=BAMClqZW0',
      },
      {
        id: 'wQYYVe5Tbj0NJ7C7qPoa8',
        name: 'Agustin Barrientos',
        image:
          'https://media.daily.dev/image/upload/s--5ayxQnqn--/f_auto/v1788281802/avatars/avatar_wQYYVe5Tbj0NJ7C7qPoa8?_a=BAMAMicg0',
      },
    ],
    upvoters: [
      {
        id: '45pQOqgzpU3kYdKH1KL7Y',
        name: 'Fix',
        image:
          'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
      },
      {
        id: 'wQYYVe5Tbj0NJ7C7qPoa8',
        name: 'Agustin Barrientos',
        image:
          'https://media.daily.dev/image/upload/s--5ayxQnqn--/f_auto/v1788281802/avatars/avatar_wQYYVe5Tbj0NJ7C7qPoa8?_a=BAMAMicg0',
      },
      {
        id: 'kTXOcS36gy2x30S7S3OxH',
        name: 'Zachari LaCombe',
        image: 'https://avatars.githubusercontent.com/u/2374121?v=4',
      },
      {
        id: 'PQvKTJgo7LXiG8RZADrX3',
        name: 'Matuco19',
        image:
          'https://media.daily.dev/image/upload/s--rr7hoFPm--/f_auto/v1759004684/avatars/avatar_PQvKTJgo7LXiG8RZADrX3?_a=BAMAK+ZW0',
      },
    ],
  },
  {
    id: 'qiGq7yU8u',
    title: 'I ditched half my subscriptions, all because of one hobby',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/0184b43195f267f55fbda15d7d898a76?_a=AQAEuop',
    readTime: 3,
    createdAt: '2026-07-18T23:03:28.524Z',
    numUpvotes: 79,
    numComments: 24,
    tags: ['cloud', 'docker', 'self-hosting'],
    commentsPermalink:
      'https://daily.dev/posts/i-ditched-half-my-subscriptions-all-because-of-one-hobby-qigq7yu8u',
    type: 'article',
    source: {
      id: 'xda-developers',
      handle: 'xda-developers',
      name: 'XDA Developers',
      image:
        'https://media.daily.dev/image/upload/s--kCg6yyAP--/f_auto,q_auto/v1774964407/logos/xda-developers?_a=BAMAMiWQ0',
    },
    commenters: [
      {
        id: 'ScKiWPtqpsvwHAvAS0jvG',
        name: 'TheCookingSenpai',
        image:
          'https://media.daily.dev/image/upload/s--ffrIwc1G--/f_auto/v1757426086/avatars/avatar_ScKiWPtqpsvwHAvAS0jvG?_a=BAMClqZW0',
      },
      {
        id: 'TSoxrOKbm81d9HQw4MRnm',
        name: 'Patrick',
        image: 'https://avatars.githubusercontent.com/u/128947909?v=4',
      },
      {
        id: 'iHStoImiuFyQFvwEddWek',
        name: 'paulmarc',
        image:
          'https://media.daily.dev/image/upload/s--yFutR-QN--/f_auto/v1737446314/avatars/avatar_iHStoImiuFyQFvwEddWek',
      },
    ],
    upvoters: [
      {
        id: 'EB0j0Umzh5v3zGWUSL5ma',
        name: 'Doncho Angelov',
        image:
          'https://media.daily.dev/image/upload/s--j1MSm0hy--/f_auto/v1716369534/avatars/avatar_EB0j0Umzh5v3zGWUSL5ma',
      },
      {
        id: 'GktuI2WSmZG9DDsFBdcFp',
        name: 'Keanu Taufan',
        image: 'https://avatars.githubusercontent.com/u/39328993?v=4',
      },
      {
        id: 'Z2l5auiKUYEZxi12F119x',
        name: 'Kevin J. Zea',
        image: 'https://avatars.githubusercontent.com/u/60053714?v=4',
      },
      {
        id: 'GBghEYgoehVGw0BMDJd7I',
        name: 'William Mandai',
        image:
          'https://lh3.googleusercontent.com/a-/AOh14GhvURmP4gBH5Q7nJEHu69p1MDXzDhUe31EcoMOKCA=s100',
      },
    ],
  },
  {
    id: '6YFWmyNmb',
    title: 'The Pulse: a new trend of CPU shortages',
    image:
      'https://media.daily.dev/image/upload/s--foaA6JGU--/f_auto/v1722860399/public/Placeholder%2004',
    readTime: 8,
    createdAt: '2026-09-24T16:51:39.297Z',
    numUpvotes: 5,
    numComments: 3,
    tags: ['cloud', 'ai-agents', 'infrastructure', 'computing'],
    commentsPermalink:
      'https://daily.dev/posts/the-pulse-a-new-trend-of-cpu-shortages-6yfwmynmb',
    type: 'article',
    source: {
      id: 'pragmaticengineer',
      handle: 'pragmaticengineer',
      name: 'The Pragmatic Engineer',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/b3ccb8a149434269bda040722d941474',
    },
    commenters: [
      {
        id: 'A9xh33q0QoxtkGoJRCosp',
        name: 'Peter Cruckshank',
        image:
          'https://media.daily.dev/image/upload/s--ZJhQyKws--/f_auto/v1721235024/avatars/avatar_A9xh33q0QoxtkGoJRCosp',
      },
      {
        id: 'mo6LFYjnO0W2YETewteOC',
        name: 'j.Chir0_0',
        image:
          'https://media.daily.dev/image/upload/s--qqYEFliZ--/f_auto/v1790350184/avatars/avatar_mo6LFYjnO0W2YETewteOC?_a=BAMAMicg0',
      },
      {
        id: 'wQYYVe5Tbj0NJ7C7qPoa8',
        name: 'Agustin Barrientos',
        image:
          'https://media.daily.dev/image/upload/s--5ayxQnqn--/f_auto/v1788281802/avatars/avatar_wQYYVe5Tbj0NJ7C7qPoa8?_a=BAMAMicg0',
      },
    ],
    upvoters: [
      {
        id: 'FQKwuWBcZgtIaLiHg4E9s',
        name: 'Tausif Al Zubayer',
        image:
          'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
      },
      {
        id: 'wQYYVe5Tbj0NJ7C7qPoa8',
        name: 'Agustin Barrientos',
        image:
          'https://media.daily.dev/image/upload/s--5ayxQnqn--/f_auto/v1788281802/avatars/avatar_wQYYVe5Tbj0NJ7C7qPoa8?_a=BAMAMicg0',
      },
      {
        id: 'mo6LFYjnO0W2YETewteOC',
        name: 'j.Chir0_0',
        image:
          'https://media.daily.dev/image/upload/s--qqYEFliZ--/f_auto/v1790350184/avatars/avatar_mo6LFYjnO0W2YETewteOC?_a=BAMAMicg0',
      },
      {
        id: 'Atz8iTc4ACJXSOR615Rcb',
        name: 'John Michael',
        image: 'https://avatars.githubusercontent.com/u/285550729?v=4',
      },
    ],
  },
  {
    id: 'iureBtF6Y',
    title: 'Encore for Rust',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/7d5ffd97d8c29ecbebd82dfd64b375d1?_a=AQAEuop',
    readTime: 2,
    createdAt: '2026-09-22T08:53:48.741Z',
    numUpvotes: 46,
    numComments: 3,
    tags: ['cloud', 'ai-agents', 'rust', 'iac'],
    commentsPermalink: 'https://daily.dev/posts/encore-for-rust-iurebtf6y',
    type: 'article',
    source: {
      id: 'encore-blog',
      handle: 'encore-blog',
      name: 'Encore',
      image:
        'https://media.daily.dev/image/upload/s--8Bz0eBFn--/f_auto,q_auto/v1780213589/logos/encore-blog?_a=BAMAMiWQ0',
    },
    commenters: [
      {
        id: 'EMoP47rpuw8DNjhp6R1b6',
        name: 'Trevor Suna',
        image:
          'https://media.daily.dev/image/upload/s--dZ7gXxpp--/f_auto/v1784081551/avatars/avatar_EMoP47rpuw8DNjhp6R1b6?_a=BAMAMicg0',
      },
      {
        id: 'wQYYVe5Tbj0NJ7C7qPoa8',
        name: 'Agustin Barrientos',
        image:
          'https://media.daily.dev/image/upload/s--5ayxQnqn--/f_auto/v1788281802/avatars/avatar_wQYYVe5Tbj0NJ7C7qPoa8?_a=BAMAMicg0',
      },
    ],
    upvoters: [
      {
        id: 'c8496bad9eb64c4d827bcfd643552374',
        name: 'José Cage',
        image: 'https://avatars2.githubusercontent.com/u/4200487?v=4',
      },
      {
        id: 'ok2YpbXjK7FhnZyMycGuy',
        name: 'Piyush',
        image:
          'https://media.daily.dev/image/upload/s--vJulLyGb--/f_auto/v1789127856/avatars/avatar_ok2YpbXjK7FhnZyMycGuy?_a=BAMAMicg0',
      },
      {
        id: 'JEY3kHOf3ALlZ6J8mVlnb',
        name: 'Suraj Mahamuni',
        image:
          'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
      },
      {
        id: '6TL7LYSQqKDlYMqNhR6Z5',
        name: 'Cristobal',
        image: 'https://avatars.githubusercontent.com/u/201049563?v=4',
      },
    ],
  },
  {
    id: 'n12ZCJIKJ',
    title: 'Concentration Risk',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/574adc906abb37956ea31d3307bf03c0?_a=AQAEuop',
    readTime: 47,
    createdAt: '2026-09-08T14:33:03.490Z',
    numUpvotes: 12,
    numComments: 3,
    tags: ['cloud', 'venture-capital', 'openai', 'anthropic'],
    commentsPermalink: 'https://daily.dev/posts/concentration-risk-n12zcjikj',
    type: 'article',
    source: {
      id: 'wheresyoured',
      handle: 'wheresyoured',
      name: "Where's Your Ed At",
      image:
        'https://media.daily.dev/image/upload/s--_fiBlTSf--/f_auto/v1737645971/logos/wheresyoured',
    },
    commenters: [
      {
        id: 'otqAJUf6zdM9hfRwTlR9n',
        name: 'Isaac de Andrade',
        image: 'https://avatars.githubusercontent.com/u/2653546?v=4',
      },
      {
        id: 'GKcNFVgIJzgCpSvd0nCjY',
        name: 'Kabir',
        image:
          'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
      },
      {
        id: 'wQYYVe5Tbj0NJ7C7qPoa8',
        name: 'Agustin Barrientos',
        image:
          'https://media.daily.dev/image/upload/s--5ayxQnqn--/f_auto/v1788281802/avatars/avatar_wQYYVe5Tbj0NJ7C7qPoa8?_a=BAMAMicg0',
      },
    ],
    upvoters: [
      {
        id: 'jnZhG2dA0J3ONeQyinZxR',
        name: 'Jose Antonio Luque Salguero',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocJnY3YEtW6M1vcAjkYLmoDphP6FmAYOc5HT6FGJy9fWNpGHir2p=s96-c',
      },
      {
        id: 'wQYYVe5Tbj0NJ7C7qPoa8',
        name: 'Agustin Barrientos',
        image:
          'https://media.daily.dev/image/upload/s--5ayxQnqn--/f_auto/v1788281802/avatars/avatar_wQYYVe5Tbj0NJ7C7qPoa8?_a=BAMAMicg0',
      },
      {
        id: 'UTdatbXFO',
        name: 'Sa',
        image:
          'https://lh3.googleusercontent.com/a-/AOh14GjHO0Hg-LbG4SFEQu47NslDVeZNohhD41MFjre-2w=s100',
      },
      {
        id: '33sRAT0QFUDOQBxSs4lkP',
        name: 'Tuukka Heikura',
        image:
          'https://media.daily.dev/image/upload/s--W5yBZISt--/f_auto/v1783344555/avatars/avatar_33sRAT0QFUDOQBxSs4lkP?_a=BAMAMicg0',
      },
    ],
  },
  {
    id: 'tJXzJXa4Q',
    title: 'Every Database Has These Seven Tables',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/65adc6fc47315f3166795bf26acb9ba2?_a=AQAEuop',
    readTime: 8,
    createdAt: '2026-09-11T01:34:49.132Z',
    numUpvotes: 238,
    numComments: 25,
    tags: ['database', 'sql', 'technical-debt'],
    commentsPermalink:
      'https://daily.dev/posts/every-database-has-these-seven-tables-tjxzjxa4q',
    type: 'article',
    source: {
      id: 'sql-authority',
      handle: 'sql-authority',
      name: 'SQL Authority',
      image:
        'https://media.daily.dev/image/upload/s--reCGnvgi--/f_auto,q_auto/v1780213436/logos/sql-authority?_a=BAMAMiWQ0',
    },
    commenters: [
      {
        id: 'pavLep1jkEmgQGd3G81rR',
        name: 'Rahul Godiyal',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocJUbWuKor0twjzGVmI3sXXFcW_cr9pu-M4_NN4eu3TOF-7Cf9o=s96-c',
      },
      {
        id: 'RslRc74HTXYv9Xn0Nwv4n',
        name: 'Shaswat Shrivas',
        image:
          'https://media.daily.dev/image/upload/s--LNnM28mC--/f_auto/v1774193329/avatars/avatar_RslRc74HTXYv9Xn0Nwv4n?_a=BAMAMiWQ0',
      },
      {
        id: 'JHvlcA95kkiFJcgcQLsMf',
        name: 'B. Lalmalsawma',
        image: 'https://avatars.githubusercontent.com/u/45043442?v=4',
      },
    ],
    upvoters: [
      {
        id: '7MRMNObZIQPQYWXqb9QIy',
        name: 'Alonso Robledo',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocLzXzeGXpxCTo2fs-jFjoCe75GUSxIqWAWlmVkR_Ubq5pjhKug=s96-c',
      },
      {
        id: 'iwY2UyAaEmGipVh0uaEeB',
        name: 'Legalas',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocKBYOasHRcaXTGQhkhV0ceHu2SJtTR3AbDDe_al-TGCmue8Gg=s96-c',
      },
      {
        id: 'ULjNEOIZ0sEZXiFuxeP11',
        name: 'Cake (c444k3333)',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocLSNC2JgkN36HAkU4_7WmunE8OksBABUpnG_S98ZZA3nkPqwKo=s96-c',
      },
      {
        id: 'DMBXD6h7QMIDTgYxVFod8',
        name: 'Pla Yoff',
        image:
          'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
      },
    ],
  },
  {
    id: 'aheRz8sWw',
    title: 'MySQL Best Practice : not using date / time types, nor ENUM',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/0080eb4fd567b2e99e4f22f2acf3d2b4?_a=AQAEuop',
    readTime: 2,
    createdAt: '2026-08-06T23:24:49.259Z',
    numUpvotes: 55,
    numComments: 13,
    tags: ['database', 'backend', 'mysql'],
    commentsPermalink:
      'https://daily.dev/posts/mysql-best-practice-not-using-date-time-types-nor-enum-aherz8sww',
    type: 'article',
    source: {
      id: 'planet-mysql',
      handle: 'planet-mysql',
      name: 'Planet MySQL',
      image:
        'https://media.daily.dev/image/upload/s--UKAtmXTq--/f_auto,q_auto/v1780213421/logos/planet-mysql?_a=BAMAMiWQ0',
    },
    commenters: [
      {
        id: 'flp4recPgvYnKtIOTeRFR',
        name: 'Christian Sicari',
        image: 'https://avatars.githubusercontent.com/u/29756552?v=4',
      },
      {
        id: 'La21ELtTs4rO0aL2OmKAe',
        name: 'Erik Wurzer',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocKY56taT6PPIlRKU0gdOP8Lnye4WzE1oBn8z8qa65rFFF0dds7F=s96-c',
      },
      {
        id: '8fkdziGASnSSBES6c4Ml9',
        name: 'Gabu Rayon Dev',
        image:
          'https://media.daily.dev/image/upload/s--5hPC52y_--/f_auto/v1773412842/avatars/avatar_8fkdziGASnSSBES6c4Ml9?_a=BAMAMiiu0',
      },
    ],
    upvoters: [
      {
        id: 'Y2D7XChDWuRRWeVqpTCys',
        name: 'J. Jake McTigue',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocKgmy-8vn0jlJenJfFupoxJ5bkEpS8WiDcRMGJYRg0JUJi2DCE=s96-c',
      },
      {
        id: 'pIiRJq3y7oFA7M8ZRPDG8',
        name: 'Anubhav Bhatt',
        image:
          'https://media.daily.dev/image/upload/s--btrq4aRY--/f_auto/v1776340073/avatars/avatar_pIiRJq3y7oFA7M8ZRPDG8?_a=BAMAMiWQ0',
      },
      {
        id: '1DidyXu1iPWl6jZEPFhri',
        name: 'Abdulrahman Mushref',
        image:
          'https://media.daily.dev/image/upload/s--IHhL2zx8--/f_auto/v1720600992/avatars/avatar_1DidyXu1iPWl6jZEPFhri',
      },
      {
        id: 'NoaUClGJkGboJ5n9HDWYn',
        name: 'Jalba Mihai',
        image:
          'https://media.daily.dev/image/upload/s---GjH91NR--/f_auto/v1719578338/avatars/avatar_NoaUClGJkGboJ5n9HDWYn',
      },
    ],
  },
  {
    id: 'DkqJwCK1x',
    title: 'Is Prisma 8 Ready for Long-Lived Production Apps?',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/8c9d557fde7abae988aefb0c5bbcead1?_a=AQAEuop',
    readTime: 8,
    createdAt: '2026-09-09T13:08:48.352Z',
    numUpvotes: 26,
    numComments: 11,
    tags: ['database', 'typescript', 'postgresql', 'prisma'],
    commentsPermalink:
      'https://daily.dev/posts/is-prisma-8-ready-for-long-lived-production-apps--dkqjwck1x',
    type: 'article',
    source: {
      id: 'prisma-blog',
      handle: 'prisma-blog',
      name: 'Prisma Blog',
      image:
        'https://media.daily.dev/image/upload/s--wjA5CgSL--/f_auto,q_auto/v1780213432/logos/prisma-blog?_a=BAMAMiWQ0',
    },
    commenters: [
      {
        id: 'x9cfuU5ai02W3BPEbroGK',
        name: 'Marko Jozic-Reyes',
        image:
          'https://media.daily.dev/image/upload/s--TvIfWcng--/f_auto/v1769558803/avatars/avatar_x9cfuU5ai02W3BPEbroGK?_a=BAMAMiiu0',
      },
      {
        id: 'RT0t94wwOgY3GROivSWnQ',
        name: 'Nenad Jovanovski',
        image: 'https://avatars.githubusercontent.com/u/5454090?v=4',
      },
      {
        id: 'wQYYVe5Tbj0NJ7C7qPoa8',
        name: 'Agustin Barrientos',
        image:
          'https://media.daily.dev/image/upload/s--5ayxQnqn--/f_auto/v1788281802/avatars/avatar_wQYYVe5Tbj0NJ7C7qPoa8?_a=BAMAMicg0',
      },
    ],
    upvoters: [
      {
        id: '0AnkdDbWaG50CilHeCKp6',
        name: 'danishmehmood',
        image:
          'https://media.daily.dev/image/upload/v1666348204/avatars/avatar_0AnkdDbWaG50CilHeCKp6.jpg',
      },
      {
        id: '7bjShIMpoAMOCkwb5qzbK',
        name: 'Vikram Dutt',
        image:
          'https://lh3.googleusercontent.com/a/AEdFTp6GHDodXDqaNIZvsAdIaVTziURCy8zuLwxSEKN_=s96-c',
      },
      {
        id: 'jnPibTyRLEhVdIbii2usr',
        name: 'Mikhail Makeev',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocIjcvDU1gmJ9-KJDeTYqY2rMdl5QxcWYtLTGSXrj8ubF4nwar_w=s96-c',
      },
      {
        id: 'KsoNHZjF8F2SY0uhvKKfz',
        name: 'Best Codes',
        image: 'https://avatars.githubusercontent.com/u/106822363?v=4',
      },
    ],
  },
  {
    id: 'IOp2y0qF3',
    title: 'Migration files and Git do not mix — DiffyPick Blog',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/c2cc8e15868c974351e579fa1c8e1dec?_a=AQAEuop',
    readTime: 7,
    createdAt: '2026-09-01T16:31:20.410Z',
    numUpvotes: 28,
    numComments: 11,
    tags: ['database', 'postgresql', 'git'],
    commentsPermalink:
      'https://daily.dev/posts/migration-files-and-git-do-not-mix-diffypick-blog-iop2y0qf3',
    type: 'article',
    source: {
      id: 'planet-postgresql',
      handle: 'planet-postgresql',
      name: 'Planet PostgreSQL',
      image: 'https://media.daily.dev/image/upload/logos/placeholder.jpg',
    },
    commenters: [
      {
        id: 'orjMeK8QKaaVZwGq7ScPz',
        name: 'PDFops',
        image:
          'https://media.daily.dev/image/upload/s---8isRBKc--/f_auto/v1782922291/avatars/avatar_orjMeK8QKaaVZwGq7ScPz?_a=BAMAMicg0',
      },
      {
        id: 'YORtdHRwRyH5xdHAdrw7H',
        name: 'Ikram',
        image:
          'https://media.daily.dev/image/upload/s--FzqkRD6G--/f_auto/v1734873785/avatars/avatar_YORtdHRwRyH5xdHAdrw7H',
      },
      {
        id: 'jnPibTyRLEhVdIbii2usr',
        name: 'Mikhail Makeev',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocIjcvDU1gmJ9-KJDeTYqY2rMdl5QxcWYtLTGSXrj8ubF4nwar_w=s96-c',
      },
    ],
    upvoters: [
      {
        id: 'yJnih5f2FyWGd45ROzjmJ',
        name: 'Avrazi',
        image:
          'https://media.daily.dev/image/upload/s--0nq21E-v--/f_auto/v1790757187/avatars/avatar_yJnih5f2FyWGd45ROzjmJ?_a=BAMAMicg0',
      },
      {
        id: '4vSv75hZMVGUCdnXxynTh',
        name: 'Devis',
        image:
          'https://media.daily.dev/image/upload/s--7CAs56Ns--/f_auto/v1788386316/avatars/avatar_4vSv75hZMVGUCdnXxynTh?_a=BAMAMicg0',
      },
      {
        id: 'yh04X9R8Rn95gl1XrMSJT',
        name: 'Paul',
        image:
          'https://media.daily.dev/image/upload/s--ViyX85Z1--/f_auto/v1784279902/avatars/avatar_yh04X9R8Rn95gl1XrMSJT?_a=BAMAMicg0',
      },
      {
        id: 'S4uCqNsc4',
        name: 'Ehsan',
        image: 'https://avatars.githubusercontent.com/u/54959004?v=4',
      },
    ],
  },
  {
    id: '7nSw95Tq8',
    title:
      'How Netflix Taught an LLM to Recommend Movies So That You Keep Watching',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/f986c4fdc4143d5f4bccbb6f6cc31fbc?_a=AQAEuop',
    readTime: 17,
    createdAt: '2026-10-07T15:34:25.595Z',
    numUpvotes: 57,
    numComments: 8,
    tags: [
      'machine-learning',
      'llm',
      'netflix',
      'vllm',
      'recommendation-systems',
    ],
    commentsPermalink:
      'https://daily.dev/posts/how-netflix-taught-an-llm-to-recommend-movies-so-that-you-keep-watching-7nsw95tq8',
    type: 'article',
    source: {
      id: 'bytebytego',
      handle: 'bytebytego',
      name: 'ByteByteGo',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/35be29234ee14d01a9cd049c52e12753',
    },
    commenters: [
      {
        id: 'kUvetrsGg644rXaZnCRQY',
        name: 'Rap Payne',
        image: 'https://avatars.githubusercontent.com/u/1122906?v=4',
      },
      {
        id: '4d75b6240b574908a2b102ba7eb4a8e6',
        name: 'Dimitris',
        image: 'https://avatars3.githubusercontent.com/u/3295889?v=4',
      },
      {
        id: 'TvTVeiMdkRCqWUDullFmy',
        name: 'kartik-nvjk',
        image:
          'https://media.daily.dev/image/upload/s--3gGgsVCw--/f_auto/v1781456774/avatars/avatar_TvTVeiMdkRCqWUDullFmy?_a=BAMAMiWQ0',
      },
    ],
    upvoters: [
      {
        id: 'ZL6bebyCVkszL2cr0g8ab',
        name: 'Swarna Sharmin',
        image:
          'https://media.daily.dev/image/upload/s--joHEq_jD--/f_auto/v1791022797/avatars/avatar_ZL6bebyCVkszL2cr0g8ab?_a=BAMAMicg0',
      },
      {
        id: 'X4iqcFRvW9oksW0vAmi2b',
        name: 'Muhamad Rizki',
        image: 'https://avatars.githubusercontent.com/u/143264421?v=4',
      },
      {
        id: 'LqTp7HAMS0t0o2aZwiUHf',
        name: 'Bob Smith',
        image:
          'https://lh3.googleusercontent.com/a/AATXAJwvnp1amkSqIxQGOI3aCaiOj91ldy8wiHsFSD7D=s100',
      },
      {
        id: 'c9yBMU2eyTcrLCfoDRYnJ',
        name: 'Michael Berna',
        image: 'https://avatars.githubusercontent.com/u/7750743?v=4',
      },
    ],
  },
  {
    id: 'zcbBlEayw',
    title: 'DeepMind’s hurricane breakthrough has surprised weather scientists',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/b8a2f374ee30ce886d0be488860f8bf2?_a=AQAEuop',
    readTime: 2,
    createdAt: '2026-08-08T12:09:48.772Z',
    numUpvotes: 25,
    numComments: 5,
    tags: ['ai', 'machine-learning'],
    commentsPermalink:
      'https://daily.dev/posts/deepmind-s-hurricane-breakthrough-has-surprised-weather-scientists-zcbbleayw',
    type: 'article',
    source: {
      id: 'arstechnica',
      handle: 'arstechnica',
      name: 'Ars Technica',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/80883e0e48a34b5ebcf93777016cb3fe',
    },
    commenters: [
      {
        id: 'loXjPMml8hR9bNBQrQYkz',
        name: 'bits_007',
        image: 'https://avatars.githubusercontent.com/u/182549945?v=4',
      },
      {
        id: 'Aa0f0ajamxStQVNrHYWZr',
        name: 'Hardik',
        image:
          'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
      },
      {
        id: 'SSZkvyTK8RRutkWuDql2l',
        name: 'Chris',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocKoF76b4yIw_SQXJfF-jVBZeyeIZCmmUm1e4cc9fKDQoY52O2qN=s96-c',
      },
    ],
    upvoters: [
      {
        id: 'yAA42EF9ydiDWqcs9X5fF',
        name: 'Aiide_YJ',
        image:
          'https://media.daily.dev/image/upload/s--_eupTNFl--/f_auto/v1787194729/avatars/avatar_yAA42EF9ydiDWqcs9X5fF?_a=BAMAMicg0',
      },
      {
        id: 'Mb4rKmlgICSs4fFJUvcco',
        name: 'Michael Kubler',
        image:
          'https://media.daily.dev/image/upload/s--HGFMzvNY--/f_auto/v1720545249/avatars/avatar_Mb4rKmlgICSs4fFJUvcco',
      },
      {
        id: 'wQYYVe5Tbj0NJ7C7qPoa8',
        name: 'Agustin Barrientos',
        image:
          'https://media.daily.dev/image/upload/s--5ayxQnqn--/f_auto/v1788281802/avatars/avatar_wQYYVe5Tbj0NJ7C7qPoa8?_a=BAMAMicg0',
      },
      {
        id: 'bft6a9XdULCfsyc0w2r0G',
        name: 'Datascience with jesse',
        image:
          'https://media.daily.dev/image/upload/s--vXRHueFV--/f_auto/v1791609301/avatars/avatar_bft6a9XdULCfsyc0w2r0G?_a=BAMAMicg0',
      },
    ],
  },
  {
    id: 'Hh1bycscA',
    title: 'Google Maps Killed The Restaurant Star',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/702f689b6432c1f2caf94bd67864fd3f?_a=AQAEuop',
    readTime: 2,
    createdAt: '2026-07-21T05:18:19.072Z',
    numUpvotes: 48,
    numComments: 5,
    tags: ['machine-learning', 'data-science', 'recommendation-systems'],
    commentsPermalink:
      'https://daily.dev/posts/google-maps-killed-the-restaurant-star-hh1bycsca',
    type: 'article',
    source: {
      id: 'hackaday',
      handle: 'hackaday',
      name: 'Hackaday',
      image:
        'https://media.daily.dev/image/upload/s--JhDfhy70--/f_auto,q_auto/v1767541814/logos/hackaday',
    },
    commenters: [
      {
        id: 'jozahfG74gUyt7c7DFtPl',
        name: 'Lucas',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocIIUWuKYGCrhLQ9bRh_zl_uNxcdY4Gvvwc91aTGmSre6nyWEA=s96-c',
      },
      {
        id: 'TvTVeiMdkRCqWUDullFmy',
        name: 'kartik-nvjk',
        image:
          'https://media.daily.dev/image/upload/s--3gGgsVCw--/f_auto/v1781456774/avatars/avatar_TvTVeiMdkRCqWUDullFmy?_a=BAMAMiWQ0',
      },
      {
        id: '4IPthysaTpltF2nyH0F3E',
        name: 'Tochukwu Okeh',
        image:
          'https://lh3.googleusercontent.com/a/ALm5wu0M9zC8KvFRBWLakb25xsuWq6eewxwbl6yGQ8Gp=s96-c',
      },
    ],
    upvoters: [
      {
        id: 'LTh2hM0ZYHl75x6ingwgY',
        name: 'Radek Havelka',
        image:
          'https://lh3.googleusercontent.com/a-/ACNPEu-o8MElSN4ROMgrqyjqrarlLqksiGLna5TAfYA1Jw=s100',
      },
      {
        id: 'pKQ4B3DkzcQJUjVdxhXzF',
        name: 'Limm',
        image:
          'https://media.daily.dev/image/upload/s--Z74Mnk6C--/f_auto/v1753719757/avatars/avatar_pKQ4B3DkzcQJUjVdxhXzF?_a=BAMClqZW0',
      },
      {
        id: 'AJU1AAgFvuHLzP3JMEK1h',
        name: 'Nazzareno Trettene',
        image:
          'https://lh3.googleusercontent.com/a/AAcHTtcoj_rcFvkk1ggPd5E1a3fZ7UNrkdF8L_PTB5TV=s96-c',
      },
      {
        id: 'TxerCqFzejH1tj9o24JpK',
        name: 'Tomek',
        image:
          'https://media.daily.dev/image/upload/s--qLkySh2m--/f_auto/v1777534251/avatars/avatar_TxerCqFzejH1tj9o24JpK?_a=BAMAMiWQ0',
      },
    ],
  },
  {
    id: 'ZzQwAVqQs',
    title: "You don't need a Mac to develop iOS apps anymore — Expo blog",
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/09ae39fcfdb242e0d738e48d493a4f9c?_a=AQAEuop',
    readTime: 8,
    createdAt: '2026-09-14T13:24:27.718Z',
    numUpvotes: 232,
    numComments: 33,
    tags: ['ai-agents', 'mobile', 'ios', 'react-native'],
    commentsPermalink:
      'https://daily.dev/posts/you-don-t-need-a-mac-to-develop-ios-apps-anymore-expo-blog-zzqwavqqs',
    type: 'article',
    source: {
      id: 'expo-blog',
      handle: 'expo-blog',
      name: 'Expo Blog',
      image:
        'https://media.daily.dev/image/upload/s--E7LK6L3y--/f_auto,q_auto/v1774179051/logos/expo-blog?_a=BAMAMiWQ0',
    },
    commenters: [
      {
        id: 'gc8T2OHxqg0Prp3Gccs8h',
        name: 'Daniel John',
        image: 'https://avatars.githubusercontent.com/u/63223301?v=4',
      },
      {
        id: 'BQjUyOeOr',
        name: 'Vaclav Stummer',
        image:
          'https://lh3.googleusercontent.com/a/AAcHTtc_XXLE3wtX2NbS_0SxbI1LS_BkU8BLDxioM8VaJVK1Nic=s96-c',
      },
      {
        id: 'CySN9voCDtVR7bxHQIodM',
        name: 'Asadullah',
        image:
          'https://lh3.googleusercontent.com/a/ALm5wu3cCdTT7Hn5lbRpbdayUt9BLm7py1onJN33TYpc0Q=s100',
      },
    ],
    upvoters: [
      {
        id: 'tDd12balApsXWwjPZdvUm',
        name: 'will',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocIlKDc-jaKc21YQWP6sJteW-i1GmjWV0UHPG61asAKwbj5o4O4=s96-c',
      },
      {
        id: 'zKeOg7vbklxHZVixl9FZL',
        name: 'Saurav Chandra',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocKZJhmlzAULuuMpg7U9FJIthjqfG051Aet5faega_UriIyGMrKH=s96-c',
      },
      {
        id: '8Bx6g7JeDpX7rkkz1BfJJ',
        name: 'Adrian Thomas',
        image: 'https://avatars.githubusercontent.com/u/3031275?v=4',
      },
      {
        id: 'IlOE0PbOOShGmZPJJlgI6',
        name: 'Kate Johnson',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocLmlXhI2hHKnsOJIETIFaJYmAwnHU9VKwyZdbPheOrZfr5462I=s96-c',
      },
    ],
  },
  {
    id: 'nSjLzKy7x',
    title: 'Material and Cupertino decoupling are here',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/8689f30d45a0af17dace9ffad70797a8?_a=AQAEuop',
    readTime: 5,
    createdAt: '2026-09-10T00:54:27.790Z',
    numUpvotes: 38,
    numComments: 4,
    tags: ['mobile', 'flutter', 'dart'],
    commentsPermalink:
      'https://daily.dev/posts/material-and-cupertino-decoupling-are-here-nsjlzky7x',
    type: 'article',
    source: {
      id: 'flutter',
      handle: 'flutter',
      name: 'Flutter',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/flutter',
    },
    commenters: [
      {
        id: 'XvvSxBq3mAayweX0bIdoK',
        name: 'Romel',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocLXdVM7dm8jXeGczNpFrzBpySAvTP-5-3hA50WtCchAWgPZBvRQ=s96-c',
      },
      {
        id: 'wQYYVe5Tbj0NJ7C7qPoa8',
        name: 'Agustin Barrientos',
        image:
          'https://media.daily.dev/image/upload/s--5ayxQnqn--/f_auto/v1788281802/avatars/avatar_wQYYVe5Tbj0NJ7C7qPoa8?_a=BAMAMicg0',
      },
      {
        id: 'hWfJxOnVHjlhybnTRAD5W',
        name: "Barney's Speed Shop",
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocKUOwM8vHpJpu-6xy8V-8casTQY5b-cloJ5dT82k3IVRm-z2BYY2Q=s96-c',
      },
    ],
    upvoters: [
      {
        id: 'sJ6BwBeauO23sSMukPnV5',
        name: '22CSE9088',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocI11leYgihmfichLqFeTM22CL_251eMmZC-hFoqn4pebH6KQHY=s96-c',
      },
      {
        id: 'nrZAAu1Ydq22gxlD1M2Ua',
        name: 'packaging.inc',
        image:
          'https://media.daily.dev/image/upload/s--3U_SDqnO--/f_auto/v1789664150/avatars/avatar_nrZAAu1Ydq22gxlD1M2Ua?_a=BAMAMicg0',
      },
      {
        id: 'dPDGM9UWNnAmdEFPIKMNx',
        name: 'Sandun Sahabandu',
        image:
          'https://media.daily.dev/image/upload/s--xhkwQCWU--/f_auto/v1789566028/avatars/avatar_dPDGM9UWNnAmdEFPIKMNx?_a=BAMAMicg0',
      },
      {
        id: 'xLzCNMNgy',
        name: 'fatgy',
        image: 'https://avatars.githubusercontent.com/u/353813?v=4',
      },
    ],
  },
  {
    id: 'a6nQbFZe3',
    title: 'How Flutter stays ahead of iOS releases',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/fa94d9952caa6e45d25e3732f9a15e35?_a=AQAEuop',
    readTime: 9,
    createdAt: '2026-08-25T23:17:18.332Z',
    numUpvotes: 30,
    numComments: 4,
    tags: ['mobile', 'ios', 'flutter', 'dart'],
    commentsPermalink:
      'https://daily.dev/posts/how-flutter-stays-ahead-of-ios-releases-a6nqbfze3',
    type: 'article',
    source: {
      id: 'flutter',
      handle: 'flutter',
      name: 'Flutter',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/flutter',
    },
    commenters: [
      {
        id: 'kUvetrsGg644rXaZnCRQY',
        name: 'Rap Payne',
        image: 'https://avatars.githubusercontent.com/u/1122906?v=4',
      },
      {
        id: 'wQYYVe5Tbj0NJ7C7qPoa8',
        name: 'Agustin Barrientos',
        image:
          'https://media.daily.dev/image/upload/s--5ayxQnqn--/f_auto/v1788281802/avatars/avatar_wQYYVe5Tbj0NJ7C7qPoa8?_a=BAMAMicg0',
      },
      {
        id: 'loXjPMml8hR9bNBQrQYkz',
        name: 'bits_007',
        image: 'https://avatars.githubusercontent.com/u/182549945?v=4',
      },
    ],
    upvoters: [
      {
        id: '6d9NzJ5wNcCebI1aaQDC4',
        name: 'sarika suman',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocJdOm1VCKGmN1oZh7vMro7QU3O2yaLaTzKeb86NPzkAEzc1F4I=s96-c',
      },
      {
        id: 'g3hrB6L54H8xkdLFrvsFT',
        name: 'Edgar S. Ochoa',
        image:
          'https://media.daily.dev/image/upload/s--trY9Quc6--/f_auto/v1734713649/avatars/avatar_g3hrB6L54H8xkdLFrvsFT',
      },
      {
        id: 'MjFFdpVZlmXt4iYFPhsBm',
        name: 'SyntaxSpin',
        image: 'https://avatars.githubusercontent.com/u/86142168?v=4',
      },
      {
        id: 'fo6JPz8L6LQ427uw1Gvq5',
        name: 'Taia Colai Tiniyara',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocIUA4LWzRdiwkqKvMVvQz3wn58DauRQUKJGfiHNAxcsMfQx9Tnc=s96-c',
      },
    ],
  },
  {
    id: '3HYJCKr3V',
    title: 'NativePHP v4: Build Native iOS and Android UI in Blade',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/43c17ee625a6550d9264fc30795923e2?_a=AQAEuop',
    readTime: 8,
    createdAt: '2026-08-17T13:57:40.206Z',
    numUpvotes: 22,
    numComments: 4,
    tags: ['mobile', 'php', 'laravel'],
    commentsPermalink:
      'https://daily.dev/posts/nativephp-v4-build-native-ios-and-android-ui-in-blade-3hyjckr3v',
    type: 'article',
    source: {
      id: 'ln',
      handle: 'ln',
      name: 'Laravel News',
      image: 'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/ln',
    },
    commenters: [
      {
        id: 'pavLep1jkEmgQGd3G81rR',
        name: 'Rahul Godiyal',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocJUbWuKor0twjzGVmI3sXXFcW_cr9pu-M4_NN4eu3TOF-7Cf9o=s96-c',
      },
      {
        id: 'oBy87eM0fRg9FCFa8ZSac',
        name: 'Legacy',
        image: 'https://avatars.githubusercontent.com/u/52163001?v=4',
      },
    ],
    upvoters: [
      {
        id: 'aPTx5vOxpb5cYWMQwGITx',
        name: 'Redouane OUZEGGANE',
        image: 'https://avatars.githubusercontent.com/u/6321820?v=4',
      },
      {
        id: 'nWuaXTsDfUn7BI9QWsF5F',
        name: 'Tanmoy das',
        image: 'https://avatars.githubusercontent.com/u/197591345?v=4',
      },
      {
        id: 'cMyTlTSTPS2WXEYnlfchd',
        name: 'Pavao Marjanovic',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocK60aSmzw6lrdZb8N-7Z7YLutdhL5WLfqYFwQCENj9przssNlhR=s96-c',
      },
      {
        id: '8Bhfj3hAmrPU6dvsgG9x7',
        name: 'Harsha Lakshan Jayathissa',
        image: 'https://avatars.githubusercontent.com/u/112598753?v=4',
      },
    ],
  },
  {
    id: '05M7JtiW5',
    title: 'New open-source browser Blanc has a different kind of UI',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/ceb2cf53ff81d89f52b06c827607c94c?_a=AQAEuop',
    readTime: 4,
    createdAt: '2026-09-30T18:23:42.607Z',
    numUpvotes: 72,
    numComments: 40,
    tags: ['open-source', 'linux', 'electron'],
    commentsPermalink:
      'https://daily.dev/posts/new-open-source-browser-blanc-has-a-different-kind-of-ui-05m7jtiw5',
    type: 'article',
    source: {
      id: 'omgub',
      handle: 'omgub',
      name: 'omg! ubuntu!',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/79e495adb3c3425785b9be27969a2562',
    },
    commenters: [
      {
        id: 'CmUjiAwlrX4oUNGDj4vR9',
        name: 'Taha Shokri',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocLiwIPy9ir8m0LZX1MGI8uN3t4N_NEfvugyyU9S_LFpmEcnwgQ=s96-c',
      },
      {
        id: 'wQYYVe5Tbj0NJ7C7qPoa8',
        name: 'Agustin Barrientos',
        image:
          'https://media.daily.dev/image/upload/s--5ayxQnqn--/f_auto/v1788281802/avatars/avatar_wQYYVe5Tbj0NJ7C7qPoa8?_a=BAMAMicg0',
      },
      {
        id: 'lCnEZ5Ofv2B1YHQ4E9QRG',
        name: 'Filip Januš',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocKAWfw1FGaQxjvEehprxNkdfgzHfwQJJW4g6qXZ0C9fkTpaZwQ=s96-c',
      },
    ],
    upvoters: [
      {
        id: 'VdiZnfKWLEX1ZKb1rT20Y',
        name: 'Samuel Lwanga',
        image: 'https://avatars.githubusercontent.com/u/94918951?v=4',
      },
      {
        id: 'EMoP47rpuw8DNjhp6R1b6',
        name: 'Trevor Suna',
        image:
          'https://media.daily.dev/image/upload/s--dZ7gXxpp--/f_auto/v1784081551/avatars/avatar_EMoP47rpuw8DNjhp6R1b6?_a=BAMAMicg0',
      },
      {
        id: 'EsHHCPScqiJcPMuKqbsZm',
        name: 'imyaclub',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocLISgkDtwapvVF2lTi2duxjMRsR80pHunbYZVN1hqVlLoamWIRH=s96-c',
      },
      {
        id: 'u7kKQ2rLgzOk8zTtmGUMv',
        name: 'Kevin Tewouda',
        image: 'https://avatars.githubusercontent.com/u/10879977?v=4',
      },
    ],
  },
  {
    id: 'j4duNN9S2',
    title: 'Kate is the IDE you need to replace VS Code',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/f7b50d63c52429c585ff15368acb4669?_a=AQAEuop',
    readTime: 3,
    createdAt: '2026-09-22T13:34:51.680Z',
    numUpvotes: 64,
    numComments: 30,
    tags: ['open-source', 'linux', 'devtools', 'vscode'],
    commentsPermalink:
      'https://daily.dev/posts/kate-is-the-ide-you-need-to-replace-vs-code-j4dunn9s2',
    type: 'article',
    source: {
      id: 'xda-developers',
      handle: 'xda-developers',
      name: 'XDA Developers',
      image:
        'https://media.daily.dev/image/upload/s--kCg6yyAP--/f_auto,q_auto/v1774964407/logos/xda-developers?_a=BAMAMiWQ0',
    },
    commenters: [
      {
        id: '95pGhvrL4U33R3sioQaPm',
        name: 'David Rudman',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocLxJiMdHcsKjwhFdi4mPuLb0xE8_YfSbhq2gfa136kf8SCN-1Us=s96-c',
      },
      {
        id: 'QeyWhRuDJUs7zKXLby4Cs',
        name: 'Urist McCoder',
        image:
          'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
      },
      {
        id: 'YeHZlegqnrRiVnj8cewrg',
        name: 'Aidan',
        image:
          'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
      },
    ],
    upvoters: [
      {
        id: 'I6dIRjBneSrd8PDIUl6WA',
        name: 'Shashi Nagulakonda',
        image:
          'https://media.daily.dev/image/upload/s---YxyLuM1--/f_auto/v1771268248/avatars/avatar_I6dIRjBneSrd8PDIUl6WA?_a=BAMAMiiu0',
      },
      {
        id: 'qMnwU4sjyiAgPxaDWR2xQ',
        name: 'Maurice Lamont Randall',
        image: 'https://avatars.githubusercontent.com/u/161399369?v=4',
      },
      {
        id: 'YDsTfoff2KFwcdw86PY79',
        name: 'Matheus Faleiro',
        image:
          'https://media.daily.dev/image/upload/s--bP09z2xw--/f_auto/v1707826629/avatars/avatar_YDsTfoff2KFwcdw86PY79',
      },
      {
        id: '5AO3aWOJyKzmnOnyimoKY',
        name: 'Dominick Clement',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocLtvRRUGjaCI-Vk0aTLZxJ0SSouvuYQZWH30YtXwqcKyjc0m3U=s96-c',
      },
    ],
  },
  {
    id: 'KfPEpQdOl',
    title: "I burned out. Now I don't know how to start again.",
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/1023fb5b09e5b7e99b389a100dd58617?_a=AQAEuop',
    readTime: 3,
    createdAt: '2026-09-28T14:15:08.397Z',
    numUpvotes: 125,
    numComments: 26,
    tags: ['open-source', 'productivity', 'mental-health'],
    commentsPermalink:
      'https://daily.dev/posts/i-burned-out-now-i-don-t-know-how-to-start-again--kfpepqdol',
    type: 'article',
    source: {
      id: 'devto',
      handle: 'devto',
      name: 'DEV',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/devto',
    },
    commenters: [
      {
        id: 'otqAJUf6zdM9hfRwTlR9n',
        name: 'Isaac de Andrade',
        image: 'https://avatars.githubusercontent.com/u/2653546?v=4',
      },
      {
        id: '5JQKu6dhQzhVIEDf0VjuZ',
        name: 'Anders Persson',
        image: 'https://avatars.githubusercontent.com/u/1372776?v=4',
      },
      {
        id: 'wQYYVe5Tbj0NJ7C7qPoa8',
        name: 'Agustin Barrientos',
        image:
          'https://media.daily.dev/image/upload/s--5ayxQnqn--/f_auto/v1788281802/avatars/avatar_wQYYVe5Tbj0NJ7C7qPoa8?_a=BAMAMicg0',
      },
    ],
    upvoters: [
      {
        id: 'eN19C97WaTUquI2XID7S4',
        name: 'Ed Weird',
        image:
          'https://media.daily.dev/image/upload/s--QGQtHr1D--/f_auto/v1715181109/avatars/avatar_eN19C97WaTUquI2XID7S4',
      },
      {
        id: 'x2bI1YiUwLnfBektdgZfQ',
        name: 'Leonardo Muniz',
        image: 'https://avatars.githubusercontent.com/u/94299650?v=4',
      },
      {
        id: '1qp0rHqBztALTcyqUpscp',
        name: 'sidd',
        image:
          'https://media.daily.dev/image/upload/s--KgmmC3RG--/f_auto/v1776421827/avatars/avatar_1qp0rHqBztALTcyqUpscp?_a=BAMAMiWQ0',
      },
      {
        id: 'DTkBqLkQ961NDQTcur2sq',
        name: 'Le Hoang Tu',
        image: 'https://avatars.githubusercontent.com/u/44677910?v=4',
      },
    ],
  },
  {
    id: '90hb0NeVt',
    title: 'terminal-code',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/f5dcd3b7940d4a812cfbc4bd6230a1c4?_a=AQAEuop',
    readTime: 1,
    createdAt: '2026-08-20T17:50:25.798Z',
    numUpvotes: 129,
    numComments: 22,
    tags: ['open-source', 'cli', 'vscode'],
    commentsPermalink: 'https://daily.dev/posts/terminal-code-90hb0nevt',
    type: 'article',
    source: {
      id: 'reidburke',
      handle: 'reidburke',
      name: 'Reid Burke',
      image:
        'https://media.daily.dev/image/upload/s--dGMoFloX--/f_auto/v1761722479/logos/reidburke',
    },
    commenters: [
      {
        id: 'SbncGJHaRHf7KoebEkT1L',
        name: 'Marko Zakrajsek',
        image:
          'https://media.daily.dev/image/upload/s--slY3-STy--/f_auto/v1783585373/avatars/avatar_SbncGJHaRHf7KoebEkT1L?_a=BAMAMicg0',
      },
      {
        id: 'geWfqL9aaZHCYdaFNbrid',
        name: 'Test',
        image:
          'https://media.daily.dev/image/upload/s--Lju-sS4X--/f_auto/v1724001914/avatars/avatar_geWfqL9aaZHCYdaFNbrid',
      },
      {
        id: 'BjiIu5Tp2mzmXh17GKqr8',
        name: 'Black Rain',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocJleDXupsshXZL6W2PLvTi6h4CC1I0SnAb5Z7iOk80A1Jm3zx5EMw=s96-c',
      },
    ],
    upvoters: [
      {
        id: 'PumW6u7FJn0qsPmsrQghV',
        name: 'Prasham Karkera',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocI2HElO5Os_JPEaQTlWwLdw9spZuv5iGsHKCCbdi2dRGRAKjQua=s96-c',
      },
      {
        id: 'dhYlyRWEVAAdXkh2Bk3cD',
        name: 'Abdulllah Shayed',
        image:
          'https://media.daily.dev/image/upload/s--9I7MWtJm--/f_auto/v1776064853/avatars/avatar_dhYlyRWEVAAdXkh2Bk3cD?_a=BAMAMiWQ0',
      },
      {
        id: 'cHc6XLZhteM0Ws18o8K5W',
        name: 'Choquet Nicolas',
        image:
          'https://media.daily.dev/image/upload/s--_oRYgN6u--/f_auto/v1789392847/avatars/avatar_cHc6XLZhteM0Ws18o8K5W?_a=BAMAMicg0',
      },
      {
        id: '5b2qWN5pr08Z0M8GFOXT4',
        name: 'thokozile msoni',
        image:
          'https://media.daily.dev/image/upload/s--wtxAoQRP--/f_auto/v1740492335/avatars/avatar_5b2qWN5pr08Z0M8GFOXT4',
      },
    ],
  },
  {
    id: 'I8552M7YO',
    title: 'Why I Build Software Like I’m Going to Maintain It for 10 Years',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/69283f327f82a6fd4a955e9bed17bd0a?_a=AQAEuop',
    readTime: 8,
    createdAt: '2026-07-23T13:58:32.126Z',
    numUpvotes: 177,
    numComments: 32,
    tags: ['architecture', 'technical-debt'],
    commentsPermalink:
      'https://daily.dev/posts/why-i-build-software-like-i-m-going-to-maintain-it-for-10-years-i8552m7yo',
    type: 'article',
    source: {
      id: 'medium_js',
      handle: 'medium_js',
      name: 'Medium',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/medium',
    },
    commenters: [
      {
        id: 'bK85rJb2OXXID2LX2wi5y',
        name: 'Elmar Chavez',
        image:
          'https://media.daily.dev/image/upload/s--7PjH979T--/f_auto/v1780994221/avatars/avatar_bK85rJb2OXXID2LX2wi5y?_a=BAMAMiWQ0',
      },
      {
        id: 'SPtJffQh338C9gvR08kpL',
        name: 'MehO',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocJHDQXlIF99Yw8gs6c06JYs3f4uDnfNS0Nwa0ddW_U71C6x1Q=s96-c',
      },
      {
        id: 'TvTVeiMdkRCqWUDullFmy',
        name: 'kartik-nvjk',
        image:
          'https://media.daily.dev/image/upload/s--3gGgsVCw--/f_auto/v1781456774/avatars/avatar_TvTVeiMdkRCqWUDullFmy?_a=BAMAMiWQ0',
      },
    ],
    upvoters: [
      {
        id: 'sq75VJnaXFhHptldOO0wi',
        name: 'Solomon I.',
        image: 'https://avatars.githubusercontent.com/u/96395881?v=4',
      },
      {
        id: 'afPiQd6q69UkOUQVzYxRo',
        name: 'Bhupender Singh Mehta',
        image: 'https://avatars.githubusercontent.com/u/90337538?v=4',
      },
      {
        id: 'otqAJUf6zdM9hfRwTlR9n',
        name: 'Isaac de Andrade',
        image: 'https://avatars.githubusercontent.com/u/2653546?v=4',
      },
      {
        id: 'zNS22nH6nR3f9Palw7N00',
        name: '矢野春樹',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocIOE1gQxjZ8JJ0k4zCIh4_DmDJQ0TuBFuFwngzjwjQL8WgjHw=s96-c',
      },
    ],
  },
  {
    id: 'OqEfvQhF8',
    title: "The bottleneck isn't writing code anymore. It's understanding it.",
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/bfcd66fe6c83147f9774c940955e85aa?_a=AQAEuop',
    readTime: 8,
    createdAt: '2026-08-06T12:14:55.639Z',
    numUpvotes: 152,
    numComments: 31,
    tags: ['architecture', 'ai-coding', 'code-review', 'domain-driven-design'],
    commentsPermalink:
      'https://daily.dev/posts/the-bottleneck-isn-t-writing-code-anymore-it-s-understanding-it--oqefvqhf8',
    type: 'article',
    source: {
      id: 'threedotslabs',
      handle: 'threedotslabs',
      name: 'Three Dots Labs',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/8060f0b72e3f4f008b8b6f313627c2f2',
    },
    commenters: [
      {
        id: 'umWZ9aQAng34qk5aaJl2q',
        name: 'Lars Faye | Confident Coding',
        image:
          'https://media.daily.dev/image/upload/s--OGZu5DEc--/f_auto/v1772569630/avatars/avatar_umWZ9aQAng34qk5aaJl2q?_a=BAMAMiiu0',
      },
      {
        id: 'sjwvePDvHVHLi0ZolZR6k',
        name: 'Lorin Reyes',
        image:
          'https://media.daily.dev/image/upload/s--iUqTXLqI--/f_auto/v1785636774/avatars/avatar_sjwvePDvHVHLi0ZolZR6k?_a=BAMAMicg0',
      },
      {
        id: 'Nes9qpxMjBg8ZBR90Du7C',
        name: 'Ilija',
        image:
          'https://media.daily.dev/image/upload/s--GqTPoTzA--/f_auto/v1738848590/avatars/avatar_Nes9qpxMjBg8ZBR90Du7C',
      },
    ],
    upvoters: [
      {
        id: 'flp4recPgvYnKtIOTeRFR',
        name: 'Christian Sicari',
        image: 'https://avatars.githubusercontent.com/u/29756552?v=4',
      },
      {
        id: 'Rr9PmVg4vY1Pr8E9pkkOO',
        name: 'Manish Mandal',
        image:
          'https://lh3.googleusercontent.com/a/AEdFTp4NVlJWgOzZnycKCVJtSIBA_A_xuj6-3ZCcKW8VJg=s96-c',
      },
      {
        id: 'FEhBCJU9DPEFhdu32lC37',
        name: 'M I',
        image:
          'https://media.daily.dev/image/upload/s--7VAfUuZf--/f_auto/v1772957334/avatars/avatar_FEhBCJU9DPEFhdu32lC37?_a=BAMAMiiu0',
      },
      {
        id: 'zNS22nH6nR3f9Palw7N00',
        name: '矢野春樹',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocIOE1gQxjZ8JJ0k4zCIh4_DmDJQ0TuBFuFwngzjwjQL8WgjHw=s96-c',
      },
    ],
  },
  {
    id: 'V08wjhuWG',
    title: 'AI makes code cheap to create, not cheap to own',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/96894efcb0363eaab742228eb6ffb60a?_a=AQAEuop',
    readTime: 3,
    createdAt: '2026-08-29T08:39:13.015Z',
    numUpvotes: 67,
    numComments: 22,
    tags: ['ai-agents', 'architecture', 'technical-debt'],
    commentsPermalink:
      'https://daily.dev/posts/ai-makes-code-cheap-to-create-not-cheap-to-own-v08wjhuwg',
    type: 'article',
    source: {
      id: 'itnext',
      handle: 'itnext',
      name: 'ITNEXT',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/itnext2',
    },
    commenters: [
      {
        id: 'UqfPQbOdd9ZYQvAgAImEm',
        name: 'Leonid Bugaev',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocLhMgurwTmJElWaH9A8Ju8cHvZxgMCDt009jEYkmFCyUGAoaGSw=s96-c',
      },
      {
        id: '5JQKu6dhQzhVIEDf0VjuZ',
        name: 'Anders Persson',
        image: 'https://avatars.githubusercontent.com/u/1372776?v=4',
      },
      {
        id: 'fQ7ttCKtPuu6tDvcgQXv5',
        name: 'Andrew',
        image:
          'https://media.daily.dev/image/upload/s--35vRfXAA--/f_auto/v1785413727/avatars/avatar_fQ7ttCKtPuu6tDvcgQXv5?_a=BAMAMicg0',
      },
    ],
    upvoters: [
      {
        id: 'oseGmu2SQ',
        name: 'Lưu Tinh Cản Nguyệt',
        image:
          'https://lh3.googleusercontent.com/a-/AOh14Ggj4Fzs18Su3JVGF8axiIN9_kWlxCkNGYshCebICQ=s100',
      },
      {
        id: 'Sinjft2KvxIccc7gW3Vve',
        name: 'tanvir ahmed',
        image:
          'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
      },
      {
        id: 'yh04X9R8Rn95gl1XrMSJT',
        name: 'Paul',
        image:
          'https://media.daily.dev/image/upload/s--ViyX85Z1--/f_auto/v1784279902/avatars/avatar_yh04X9R8Rn95gl1XrMSJT?_a=BAMAMicg0',
      },
      {
        id: '98mkJq7ZdTcO01sPmvDUa',
        name: 'JJJ',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocKcEXE_cFMAMM4ff3BHBdRlOZtTJ6CtbZSi4TgS5Dmv4_CY8w=s96-c',
      },
    ],
  },
  {
    id: 'mdHayRa8h',
    title: 'Microservices Are Not a Sign You’re a Senior Engineer',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/7cc99c8e6cd480acc14c1304004cfa46?_a=AQAEuop',
    readTime: 7,
    createdAt: '2026-08-30T13:17:53.756Z',
    numUpvotes: 105,
    numComments: 18,
    tags: [
      'career',
      'architecture',
      'microservices',
      'distributed-systems',
      'monolith',
    ],
    commentsPermalink:
      'https://daily.dev/posts/microservices-are-not-a-sign-you-re-a-senior-engineer-mdhayra8h',
    type: 'article',
    source: {
      id: 'devgenius',
      handle: 'devgenius',
      name: 'Dev Genius',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/a79144d7517043e7803ed562e45a99df',
    },
    commenters: [
      {
        id: '54gVqSdbL9DajhGSKNFpY',
        name: 'Rick Tonoli',
        image:
          'https://media.daily.dev/image/upload/s--1mKwVOZD--/f_auto/v1745813607/avatars/avatar_54gVqSdbL9DajhGSKNFpY',
      },
      {
        id: 'fdccwI0fVProWHqaxpNRu',
        name: 'Matthew',
        image:
          'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
      },
      {
        id: '1TTYQL613ee5RYwfu6DlY',
        name: 'Rickvian Aldi',
        image:
          'https://media.daily.dev/image/upload/s--0-huIxZc--/f_auto/v1783474901/avatars/avatar_1TTYQL613ee5RYwfu6DlY?_a=BAMAMicg0',
      },
    ],
    upvoters: [
      {
        id: 'PEbLocW14huWHBsq4J1Fz',
        name: 'Anurag Limbu Kandangwa',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocItBWnzCmpCX6PzEAWtUizCNx2pMIWxdNUOTAf-wP5dNUYokBWAvw=s96-c',
      },
      {
        id: '2n5qhjIxIu1AvW4H7gitb',
        name: 'navid gh',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocKyKdbJ0mn_M8CINSyL5L28q31Jzgrl0kYWks0ufJQkoRB-ig=s96-c',
      },
      {
        id: 'piFGhLMPIfFnskyvGMtwi',
        name: 'Thiệu Nguyễn',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocJtv_rNRKuAWIasXJE5VcjNtcszLlArOP-nn7ZSYZwHYQ=s96-c',
      },
      {
        id: 'FEhBCJU9DPEFhdu32lC37',
        name: 'M I',
        image:
          'https://media.daily.dev/image/upload/s--7VAfUuZf--/f_auto/v1772957334/avatars/avatar_FEhBCJU9DPEFhdu32lC37?_a=BAMAMiiu0',
      },
    ],
  },
  {
    id: '8bYgWtyr3',
    title: 'We now auto-approve and merge 15% of PRs',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/53ec4e15aa5ec4539937fc66efde34e9?_a=AQAEuop',
    readTime: 4,
    createdAt: '2026-09-19T16:26:55.757Z',
    numUpvotes: 42,
    numComments: 14,
    tags: ['testing', 'cicd', 'leadership', 'github-actions', 'code-review'],
    commentsPermalink:
      'https://daily.dev/posts/we-now-auto-approve-and-merge-15-of-prs-8bygwtyr3',
    type: 'article',
    source: {
      id: 'swizec',
      handle: 'swizec',
      name: 'swizec.com',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/a0733daf6e014e23a638ded7f2d4cd70',
    },
    commenters: [
      {
        id: 'zhBh6dnFdB7eycejbeTCb',
        name: 'Jonathan Clendenon',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocLyZ7RumbhhPmYvGs5vYCdfzrtdeNuBzYRi_JFIBCrY0u8Kaw=s96-c',
      },
      {
        id: '29TCpY2hJR72V3BlxPXzX',
        name: 'Daniel',
        image:
          'https://media.daily.dev/image/upload/s--FtwJqX4c--/f_auto/v1754900041/avatars/avatar_29TCpY2hJR72V3BlxPXzX?_a=BAMClqZW0',
      },
      {
        id: 'LJSkpBexOSCWc8INyu3Eu',
        name: 'Ante Barić',
        image:
          'https://media.daily.dev/image/upload/v1679300599/avatars/avatar_LJSkpBexOSCWc8INyu3Eu.jpg',
      },
    ],
    upvoters: [
      {
        id: 'xxGQoJBeNXcllZ6HD9Z3S',
        name: 'Alareso',
        image:
          'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
      },
      {
        id: 'zNS22nH6nR3f9Palw7N00',
        name: '矢野春樹',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocIOE1gQxjZ8JJ0k4zCIh4_DmDJQ0TuBFuFwngzjwjQL8WgjHw=s96-c',
      },
      {
        id: '2Qpgu9keJ',
        name: 'Enrique Bernabeu',
        image: 'https://avatars.githubusercontent.com/u/16876988?v=4',
      },
      {
        id: 'mhDL0P6KigGOp4d4Jnu80',
        name: 'Alex Macdonald-Smith',
        image: 'https://avatars.githubusercontent.com/u/25642759?v=4',
      },
    ],
  },
  {
    id: 'rrFPegQZT',
    title: "Everyone's learning to prompt better. That's the wrong skill.",
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/d4dbc5b20c6f2d9ca1238ce4a32378aa?_a=AQAEuop',
    readTime: 10,
    createdAt: '2026-09-28T07:19:06.907Z',
    numUpvotes: 55,
    numComments: 11,
    tags: [
      'ai',
      'webdev',
      'career',
      'llm',
      'testing',
      'ai-coding',
      'prompt-engineering',
      'code-review',
    ],
    commentsPermalink:
      'https://daily.dev/posts/everyone-s-learning-to-prompt-better-that-s-the-wrong-skill--rrfpegqzt',
    type: 'article',
    source: {
      id: 'devto',
      handle: 'devto',
      name: 'DEV',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/devto',
    },
    commenters: [
      {
        id: 'j0aX3yy9bDkDJDShHMXar',
        name: 'Yair Even Or',
        image: 'https://avatars.githubusercontent.com/u/845031?v=4',
      },
      {
        id: 'XFP08dZHhCriuIokH2v8p',
        name: 'Bob',
        image: 'https://avatars.githubusercontent.com/u/193962566?v=4',
      },
      {
        id: 'wQYYVe5Tbj0NJ7C7qPoa8',
        name: 'Agustin Barrientos',
        image:
          'https://media.daily.dev/image/upload/s--5ayxQnqn--/f_auto/v1788281802/avatars/avatar_wQYYVe5Tbj0NJ7C7qPoa8?_a=BAMAMicg0',
      },
    ],
    upvoters: [
      {
        id: 'zNS22nH6nR3f9Palw7N00',
        name: '矢野春樹',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocIOE1gQxjZ8JJ0k4zCIh4_DmDJQ0TuBFuFwngzjwjQL8WgjHw=s96-c',
      },
      {
        id: 'UTdatbXFO',
        name: 'Sa',
        image:
          'https://lh3.googleusercontent.com/a-/AOh14GjHO0Hg-LbG4SFEQu47NslDVeZNohhD41MFjre-2w=s100',
      },
      {
        id: '8Bhfj3hAmrPU6dvsgG9x7',
        name: 'Harsha Lakshan Jayathissa',
        image: 'https://avatars.githubusercontent.com/u/112598753?v=4',
      },
      {
        id: 'aSUkzUQS97QJpQRxKMe49',
        name: 'Deep Joshi',
        image:
          'https://media.daily.dev/image/upload/s--TdY8j8Aa--/f_auto/v1776506972/avatars/avatar_aSUkzUQS97QJpQRxKMe49?_a=BAMAMiWQ0',
      },
    ],
  },
  {
    id: 'NV2vKw86m',
    title: 'How I Stay Engaged in AI Agentic Development',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/630452ed85964ed402015f58866f1237?_a=AQAEuop',
    readTime: 11,
    createdAt: '2026-08-17T12:06:09.508Z',
    numUpvotes: 22,
    numComments: 7,
    tags: ['testing', 'productivity', 'code-review', 'vibe-coding'],
    commentsPermalink:
      'https://daily.dev/posts/how-i-stay-engaged-in-ai-agentic-development-nv2vkw86m',
    type: 'article',
    source: {
      id: 'atomicobject',
      handle: 'atomicobject',
      name: 'Atomic Spin',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/e2af5ce3adaa403a8cf029268b62419f',
    },
    commenters: [
      {
        id: 'umWZ9aQAng34qk5aaJl2q',
        name: 'Lars Faye | Confident Coding',
        image:
          'https://media.daily.dev/image/upload/s--OGZu5DEc--/f_auto/v1772569630/avatars/avatar_umWZ9aQAng34qk5aaJl2q?_a=BAMAMiiu0',
      },
      {
        id: 'wQYYVe5Tbj0NJ7C7qPoa8',
        name: 'Agustin Barrientos',
        image:
          'https://media.daily.dev/image/upload/s--5ayxQnqn--/f_auto/v1788281802/avatars/avatar_wQYYVe5Tbj0NJ7C7qPoa8?_a=BAMAMicg0',
      },
      {
        id: 'q9GwLFdlHHSfHqxMLYo18',
        name: 'PickledMango',
        image:
          'https://media.daily.dev/image/upload/s--u6UKc2fb--/f_auto/v1750171331/avatars/avatar_q9GwLFdlHHSfHqxMLYo18?_a=BAMClqUq0',
      },
    ],
    upvoters: [
      {
        id: 'FMlVluJUzeveEcNpbgO9U',
        name: 'Youssof. K.',
        image:
          'https://lh3.googleusercontent.com/a/AEdFTp7g7ng7R3Kda0v1EJGDbPfcVQASC20XcBnDNsE4=s96-c',
      },
      {
        id: '7UmhaFuaEgIzwGmDEmgKr',
        name: 'Andres Ayala',
        image: 'https://avatars.githubusercontent.com/u/11377149?v=4',
      },
      {
        id: 'xLzCNMNgy',
        name: 'fatgy',
        image: 'https://avatars.githubusercontent.com/u/353813?v=4',
      },
      {
        id: 'pKQ4B3DkzcQJUjVdxhXzF',
        name: 'Limm',
        image:
          'https://media.daily.dev/image/upload/s--Z74Mnk6C--/f_auto/v1753719757/avatars/avatar_pKQ4B3DkzcQJUjVdxhXzF?_a=BAMClqZW0',
      },
    ],
  },
  {
    id: 'CnSvDowgG',
    title: 'Astro 7.3',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/76775270b5f6fa9a7aafa5b4c3aa03c5?_a=AQAEuop',
    readTime: 4,
    createdAt: '2026-09-03T15:39:22.204Z',
    numUpvotes: 26,
    numComments: 6,
    tags: ['webdev', 'testing', 'cloudflare', 'astro'],
    commentsPermalink: 'https://daily.dev/posts/astro-7-3-cnsvdowgg',
    type: 'article',
    source: {
      id: 'astro_source',
      handle: 'astro_source',
      name: 'Astro',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/f4e5c78441f64e17b064585687d42fc6',
    },
    commenters: [
      {
        id: 'orjMeK8QKaaVZwGq7ScPz',
        name: 'PDFops',
        image:
          'https://media.daily.dev/image/upload/s---8isRBKc--/f_auto/v1782922291/avatars/avatar_orjMeK8QKaaVZwGq7ScPz?_a=BAMAMicg0',
      },
      {
        id: 'igzBsWloJeaegzm9bQltZ',
        name: 'AllInOneTools',
        image:
          'https://media.daily.dev/image/upload/s--4ZT8QlF0--/f_auto/v1769790028/avatars/avatar_igzBsWloJeaegzm9bQltZ?_a=BAMAMiiu0',
      },
      {
        id: '9pqnrpoJdg1CfgqIBuMCl',
        name: 'Hadil Ben Abdallah',
        image:
          'https://media.daily.dev/image/upload/s--npVXQBAk--/f_auto/v1726134205/avatars/avatar_9pqnrpoJdg1CfgqIBuMCl',
      },
    ],
    upvoters: [
      {
        id: '3Y8VvCz2A1ncpV5hljQZw',
        name: 'Tosrif jahan Sakib',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocJiiRaYPh9JkPCrn-bzl8jgudcoHB-OonQGK6AG5jGQmfP0Xlb8=s96-c',
      },
      {
        id: 'CjArL67dig2ye4c0ZmF3B',
        name: 'vyasaa io',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocIEGp5_AEDytUXLL2zP4PM4PIm2hWIeMjJY6uY7gJ1X6GfRKtg=s96-c',
      },
      {
        id: 'arT4cOcvr3POIs3zWUzNl',
        name: 'Isaac Aguilar',
        image: 'https://avatars.githubusercontent.com/u/211719562?v=4',
      },
      {
        id: 'jnPibTyRLEhVdIbii2usr',
        name: 'Mikhail Makeev',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocIjcvDU1gmJ9-KJDeTYqY2rMdl5QxcWYtLTGSXrj8ubF4nwar_w=s96-c',
      },
    ],
  },
  {
    id: 'Ib2R2Pgex',
    title: 'Stop Using Java When Kotlin Exists',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/936b4ddfe178f0aa06476d0e553bb957?_a=AQAEuop',
    readTime: 5,
    createdAt: '2026-09-30T12:03:07.402Z',
    numUpvotes: 35,
    numComments: 8,
    tags: ['java', 'spring', 'kotlin', 'jvm'],
    commentsPermalink:
      'https://daily.dev/posts/stop-using-java-when-kotlin-exists-ib2r2pgex',
    type: 'article',
    source: {
      id: 'atomicobject',
      handle: 'atomicobject',
      name: 'Atomic Spin',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/e2af5ce3adaa403a8cf029268b62419f',
    },
    commenters: [
      {
        id: 'PQM0d699XLH2RizkXMA3k',
        name: 'Mikehenry',
        image: 'https://avatars.githubusercontent.com/u/15307122?v=4',
      },
      {
        id: 'YmE3yawLPgBn37qfF5oOO',
        name: 'Maurizio Turatti',
        image: 'https://avatars.githubusercontent.com/u/365382?v=4',
      },
      {
        id: 'MF1TfC05be7tWHwCu1Rwr',
        name: 'Ahmet Özel',
        image: 'https://avatars.githubusercontent.com/u/70992231?v=4',
      },
    ],
    upvoters: [
      {
        id: 'KrcqlnhkozLn3pmGEMxfJ',
        name: 'Wes',
        image:
          'https://media.daily.dev/image/upload/s--ZmJbe3vZ--/f_auto/v1733763371/avatars/avatar_KrcqlnhkozLn3pmGEMxfJ',
      },
      {
        id: 'ZKLbQ1ROTXM8EJ7PZv383',
        name: 'Lượng Lê',
        image:
          'https://media.daily.dev/image/upload/s--LsBXrQbv--/f_auto/v1791387179/avatars/avatar_ZKLbQ1ROTXM8EJ7PZv383?_a=BAMAMicg0',
      },
      {
        id: 'LGwrXVg15Za2rvRtOdKIx',
        name: 'Nhan Ng',
        image: 'https://avatars.githubusercontent.com/u/3972851?v=4',
      },
      {
        id: '4xAvwecnkllVALyN7XDys',
        name: 'Aristide',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocI3LYsdUb1rFzRBl0d_p_j9rbhnrPl1FgaJ4Sc1XHKnLnIDEeY=s96-c',
      },
    ],
  },
  {
    id: 'Rqa51hJGs',
    title: 'Centralizing Pricing Logic: Stop Scattering Your Business Rules',
    image:
      'https://i0.wp.com/sergiolema.dev/wp-content/uploads/2026/05/pexels-photo-12561883.jpeg?fit=870%2C1200&ssl=1',
    readTime: 4,
    createdAt: '2026-07-27T05:07:54.374Z',
    numUpvotes: 57,
    numComments: 7,
    tags: ['java', 'architecture', 'backend', 'logging'],
    commentsPermalink:
      'https://daily.dev/posts/centralizing-pricing-logic-stop-scattering-your-business-rules-rqa51hjgs',
    type: 'article',
    source: {
      id: 'sergiolema-dev',
      handle: 'sergiolema-dev',
      name: 'Sergio Lema',
      image:
        'https://media.daily.dev/image/upload/s--SxVeO2EZ--/f_auto,q_auto/v1774964060/logos/sergiolema-dev?_a=BAMAMiWQ0',
    },
    commenters: [
      {
        id: '8ZBnrh39R9oOmsDDnXj0U',
        name: 'Kidpech Pianpithak',
        image: 'https://avatars.githubusercontent.com/u/85755801?v=4',
      },
      {
        id: 'njI2ZHYhNIJGOXEG0gJ5j',
        name: 'Adam',
        image: 'https://avatars.githubusercontent.com/u/2162621?v=4',
      },
      {
        id: 'UkFFKfiAVLEuMy2pPrrYO',
        name: 'Mohammed Isah',
        image:
          'https://media.daily.dev/image/upload/s--KkvskaUN--/f_auto/v1785415157/avatars/avatar_UkFFKfiAVLEuMy2pPrrYO?_a=BAMAMicg0',
      },
    ],
    upvoters: [
      {
        id: 'H6baxu15RA3lquFA2UNvS',
        name: 'Soumava Das',
        image: 'https://avatars.githubusercontent.com/u/77767745?v=4',
      },
      {
        id: 'wc2pklEuoTfHa1AmdL27l',
        name: 'Piyush Kumar Rai',
        image: 'https://avatars.githubusercontent.com/u/69131562?v=4',
      },
      {
        id: 'A3aIoYcEjDeICylvl4M5D',
        name: 'Agamdeep Singh',
        image:
          'https://media.daily.dev/image/upload/s--6koD5XXz--/f_auto/v1747685315/avatars/avatar_A3aIoYcEjDeICylvl4M5D?_a=BAMClqZW0',
      },
      {
        id: '7Eov5Bbo9GitcZxl0ouV7',
        name: 'Redowan Sajeeb',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocKM--h0ClVgHFdcncvlOAx4Rw8yPguE1-6te3TA6OvelufsCpnY=s96-c',
      },
    ],
  },
  {
    id: 'lY4PuHNc1',
    title:
      'No Database Operations Found: What Writing a Spring Boot Analyzer Taught Me About Spring',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/c83c5ba271f93392c04ee419e0049b01?_a=AQAEuop',
    readTime: 10,
    createdAt: '2026-09-03T06:36:03.588Z',
    numUpvotes: 32,
    numComments: 6,
    tags: ['java', 'spring', 'spring-boot', 'code-review'],
    commentsPermalink:
      'https://daily.dev/posts/no-database-operations-found-what-writing-a-spring-boot-analyzer-taught-me-about-spring-ly4puhnc1',
    type: 'article',
    source: {
      id: 'foojayio',
      handle: 'foojayio',
      name: 'Foojay.io',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/1820f6a6ae944760aa322b67ed85f848',
    },
    commenters: [
      {
        id: 'UqfPQbOdd9ZYQvAgAImEm',
        name: 'Leonid Bugaev',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocLhMgurwTmJElWaH9A8Ju8cHvZxgMCDt009jEYkmFCyUGAoaGSw=s96-c',
      },
      {
        id: 'wQYYVe5Tbj0NJ7C7qPoa8',
        name: 'Agustin Barrientos',
        image:
          'https://media.daily.dev/image/upload/s--5ayxQnqn--/f_auto/v1788281802/avatars/avatar_wQYYVe5Tbj0NJ7C7qPoa8?_a=BAMAMicg0',
      },
      {
        id: 'jnPibTyRLEhVdIbii2usr',
        name: 'Mikhail Makeev',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocIjcvDU1gmJ9-KJDeTYqY2rMdl5QxcWYtLTGSXrj8ubF4nwar_w=s96-c',
      },
    ],
    upvoters: [
      {
        id: 'PEbLocW14huWHBsq4J1Fz',
        name: 'Anurag Limbu Kandangwa',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocItBWnzCmpCX6PzEAWtUizCNx2pMIWxdNUOTAf-wP5dNUYokBWAvw=s96-c',
      },
      {
        id: '6ZlLRk97nLRa0kugPPyCA',
        name: 'Daniel (Pepper)',
        image: 'https://avatars.githubusercontent.com/u/40519139?v=4',
      },
      {
        id: 'S7WPNwyOgoaVmPKJmRrwm',
        name: 'SifaTt Bhuyan',
        image:
          'https://media.daily.dev/image/upload/f_auto/v1653100546/avatars/S7WPNwyOgoaVmPKJmRrwm',
      },
      {
        id: 'rawId6c2r',
        name: 'David Safwat',
        image:
          'https://lh3.googleusercontent.com/a-/AOh14GjxNWxEcYPp9i0HfDz6Zlk_tjDqiL1YM3yMoksO=s100',
      },
    ],
  },
  {
    id: 'FiLYF9a73',
    title:
      'What I Learned Building an AI Code Reviewer with Java and Spring Boot',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/921f1970ff34772659138029cacb9a05?_a=AQAEuop',
    readTime: 8,
    createdAt: '2026-10-14T00:50:02.055Z',
    numUpvotes: 12,
    numComments: 5,
    tags: ['llm', 'github', 'java', 'ai-coding', 'spring-boot'],
    commentsPermalink:
      'https://daily.dev/posts/what-i-learned-building-an-ai-code-reviewer-with-java-and-spring-boot-filyf9a73',
    type: 'article',
    source: {
      id: 'foojayio',
      handle: 'foojayio',
      name: 'Foojay.io',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/1820f6a6ae944760aa322b67ed85f848',
    },
    commenters: [
      {
        id: 'vmrDQIxsd9nEZVwowbCmB',
        name: 'Pedro Pietroluongo',
        image: 'https://avatars.githubusercontent.com/u/1533471?v=4',
      },
      {
        id: 'TvTVeiMdkRCqWUDullFmy',
        name: 'kartik-nvjk',
        image:
          'https://media.daily.dev/image/upload/s--3gGgsVCw--/f_auto/v1781456774/avatars/avatar_TvTVeiMdkRCqWUDullFmy?_a=BAMAMiWQ0',
      },
      {
        id: 'QwWczI1OhnuqJ3vckrPPp',
        name: 'HARSHIT MANEPALLY',
        image:
          'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
      },
    ],
    upvoters: [
      {
        id: '16tQOasE4z75jhlWM8oS6',
        name: 'Stephan Sandriesser',
        image:
          'https://media.daily.dev/image/upload/s--2EsTVmLo--/f_auto/v1717078722/avatars/avatar_16tQOasE4z75jhlWM8oS6',
      },
      {
        id: '3lPrxlPj8z9Y5mjgMyEOo',
        name: 'Ajmal S',
        image:
          'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
      },
      {
        id: '4gXF64evvjSSn42Vhlor2',
        name: 'Felipe Saff',
        image: 'https://avatars.githubusercontent.com/u/69763037?v=4',
      },
      {
        id: 'YVgRVEdJHHNrRxSJNuLek',
        name: 'Rakshith Raj S',
        image:
          'https://media.daily.dev/image/upload/f_auto/v1645619179/avatars/YVgRVEdJHHNrRxSJNuLek',
      },
    ],
  },
  {
    id: '4ZSJnvT07',
    title: 'DuckDuckGo "Normal F**king Sunglasses" Sold Out In Under a Week',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/e92be5af6feb56c13ef03219743a558c?_a=AQAEuop',
    readTime: 2,
    createdAt: '2026-08-06T20:56:10.664Z',
    numUpvotes: 195,
    numComments: 38,
    tags: ['tech-news', 'privacy'],
    commentsPermalink:
      'https://daily.dev/posts/duckduckgo-normal-f-king-sunglasses-sold-out-in-under-a-week-4zsjnvt07',
    type: 'article',
    source: {
      id: '80lv',
      handle: '80lv',
      name: '80 LEVEL',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/78eebcd76c154e6bbfd565fed7dc4093',
    },
    commenters: [
      {
        id: 'fbVsKoauuEJh8UGQ6BIHO',
        name: 'Aashish pokhrel',
        image: 'https://avatars.githubusercontent.com/u/126847212?v=4',
      },
      {
        id: 'bK85rJb2OXXID2LX2wi5y',
        name: 'Elmar Chavez',
        image:
          'https://media.daily.dev/image/upload/s--7PjH979T--/f_auto/v1780994221/avatars/avatar_bK85rJb2OXXID2LX2wi5y?_a=BAMAMiWQ0',
      },
      {
        id: 'qeKHgWVZCS8FDvZfKwPnr',
        name: 'Alex',
        image:
          'https://media.daily.dev/image/upload/s---IBHXW6K--/f_auto/v1739260309/avatars/avatar_qeKHgWVZCS8FDvZfKwPnr',
      },
    ],
    upvoters: [
      {
        id: 'jJfHMgfrtqbOYZ3Qo3lh2',
        name: 'User Name',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocJEbc_J42Pd8aZAABo8rrAl5vysGeCoy6MRdwPTmYYLjKrZJg=s96-c',
      },
      {
        id: 'SKMM6CEJX2uNMpw88vMcC',
        name: 'Ahmad Akhtar',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocIbPSe3kAp-LAkKF8l9mZ9ud-VcmYz5_Jn-ZROJgfG5vU8oQg4=s96-c',
      },
      {
        id: 'YVgRVEdJHHNrRxSJNuLek',
        name: 'Rakshith Raj S',
        image:
          'https://media.daily.dev/image/upload/f_auto/v1645619179/avatars/YVgRVEdJHHNrRxSJNuLek',
      },
      {
        id: 'gUVLLk6fVQUTCXA2Bck7p',
        name: 'PromptSherehub',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocL6mAL8sMJJ_DF5JReXkAEo-ztIj9u88jnXyV7jBP-kdTcZd5um=s96-c',
      },
    ],
  },
  {
    id: 'TgAcKeR5L',
    title: "CD Projekt Red won't be abandoning physical releases",
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/2d1d3727ee5075d153ebc09e7e1ad572?_a=AQAEuop',
    readTime: 3,
    createdAt: '2026-09-03T11:14:32.154Z',
    numUpvotes: 56,
    numComments: 14,
    tags: ['tech-news', 'gaming', 'cd-projekt-red'],
    commentsPermalink:
      'https://daily.dev/posts/cd-projekt-red-won-t-be-abandoning-physical-releases-tgacker5l',
    type: 'article',
    source: {
      id: 'gamedeveloper',
      handle: 'gamedeveloper',
      name: 'Game Developer',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/5fbb7418db8746769a45f55309bbdf13',
    },
    commenters: [
      {
        id: 'or5rxufxqZ2w5WnfiORje',
        name: 'Johnz',
        image:
          'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
      },
      {
        id: '1LR5UxjaXfxlVjo6RBny2',
        name: 'Stan Rud',
        image:
          'https://media.daily.dev/image/upload/s--iVl4Ug9v--/f_auto/v1780035687/avatars/avatar_1LR5UxjaXfxlVjo6RBny2?_a=BAMAMiWQ0',
      },
      {
        id: 'y6NTB6llakYmLSelD0bZh',
        name: 'WojtekXTX',
        image:
          'https://media.daily.dev/image/upload/s--slav3kNg--/f_auto/v1788199427/avatars/avatar_y6NTB6llakYmLSelD0bZh?_a=BAMAMicg0',
      },
    ],
    upvoters: [
      {
        id: 'Mixc3kMA0XoIEf07c0aw7',
        name: 'Devdeep Solanki',
        image: 'https://avatars.githubusercontent.com/u/93776454?v=4',
      },
      {
        id: 'YZbxWItkYo1vqcqW4ufNU',
        name: 'Coshi',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocJK0K580aA8kE7ST8CIw8u0fI-Z7F1W-yIn0O0XEhBRFA7wdEhD=s96-c',
      },
      {
        id: 'J3eidtdwSk35SBMNmUxjG',
        name: 'Coisoetal',
        image:
          'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
      },
      {
        id: '9zxn0JIpFhtHKWxlAm7GK',
        name: 'David Brandenburg',
        image: 'https://avatars.githubusercontent.com/u/117653004?v=4',
      },
    ],
  },
  {
    id: 'uIfzQMWh7',
    title: 'Moving out of Substack and Linkedin',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/201f97fb866a0da11796e9a3312be3a6?_a=AQAEuop',
    readTime: 3,
    createdAt: '2026-08-25T14:18:52.339Z',
    numUpvotes: 48,
    numComments: 9,
    tags: ['tech-news', 'content-creation'],
    commentsPermalink:
      'https://daily.dev/posts/moving-out-of-substack-and-linkedin-uifzqmwh7',
    type: 'article',
    source: {
      id: 'bitecode',
      handle: 'bitecode',
      name: 'Bite Code',
      image:
        'https://media.daily.dev/image/upload/s--ULLY6Rmr--/f_auto,q_auto/v1777800747/logos/bitecode?_a=BAMAMiWQ0',
    },
    commenters: [
      {
        id: 'wQYYVe5Tbj0NJ7C7qPoa8',
        name: 'Agustin Barrientos',
        image:
          'https://media.daily.dev/image/upload/s--5ayxQnqn--/f_auto/v1788281802/avatars/avatar_wQYYVe5Tbj0NJ7C7qPoa8?_a=BAMAMicg0',
      },
      {
        id: 'DU2H0EExcjOEos0xjL4MI',
        name: 'Jay Elsheikh',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocKOYmya6W94Us-PkLZOWFTNLlErDLzZOiX9BAA-7bRQCMAAezCOkg=s96-c',
      },
      {
        id: 'KFbChrgcC8vAC42n1IgWI',
        name: 'Mikhail',
        image: 'https://avatars.githubusercontent.com/u/74988200?v=4',
      },
    ],
    upvoters: [
      {
        id: 'Tb0ZUkBbtxyEpJhBgN3RZ',
        name: 'Piyush',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocIww0hD3Z-HRdSKyvXkY-cUnozz4MZVEkuZrAoGb_dKRS-umlE=s96-c',
      },
      {
        id: 'PeziSSvN0Xvzxan9lpAx4',
        name: 'Keith Solomon',
        image: 'https://avatars.githubusercontent.com/u/251996?v=4',
      },
      {
        id: 'e9AzFlB3YAMqDe5UsJwyt',
        name: 'Michael Dambock',
        image:
          'https://media.daily.dev/image/upload/s--fuBk6gXE--/f_auto/v1756822408/avatars/avatar_e9AzFlB3YAMqDe5UsJwyt?_a=BAMClqZW0',
      },
      {
        id: 'x7XDyJyCZiuBQS2xStcLH',
        name: 'Earendil',
        image: 'https://avatars.githubusercontent.com/u/17042142?v=4',
      },
    ],
  },
  {
    id: '7EgQmiPu3',
    title: 'Open Source Vacuum Avoids Cloud',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/61809513c57c521ee26db2d119b86385?_a=AQAEuop',
    readTime: 2,
    createdAt: '2026-07-22T02:32:34.713Z',
    numUpvotes: 104,
    numComments: 8,
    tags: ['tech-news', 'robotics', 'raspberry-pi'],
    commentsPermalink:
      'https://daily.dev/posts/open-source-vacuum-avoids-cloud-7egqmipu3',
    type: 'article',
    source: {
      id: 'hackaday',
      handle: 'hackaday',
      name: 'Hackaday',
      image:
        'https://media.daily.dev/image/upload/s--JhDfhy70--/f_auto,q_auto/v1767541814/logos/hackaday',
    },
    commenters: [
      {
        id: 'EMoP47rpuw8DNjhp6R1b6',
        name: 'Trevor Suna',
        image:
          'https://media.daily.dev/image/upload/s--dZ7gXxpp--/f_auto/v1784081551/avatars/avatar_EMoP47rpuw8DNjhp6R1b6?_a=BAMAMicg0',
      },
      {
        id: 'iHStoImiuFyQFvwEddWek',
        name: 'paulmarc',
        image:
          'https://media.daily.dev/image/upload/s--yFutR-QN--/f_auto/v1737446314/avatars/avatar_iHStoImiuFyQFvwEddWek',
      },
      {
        id: 'PQvKTJgo7LXiG8RZADrX3',
        name: 'Matuco19',
        image:
          'https://media.daily.dev/image/upload/s--rr7hoFPm--/f_auto/v1759004684/avatars/avatar_PQvKTJgo7LXiG8RZADrX3?_a=BAMAK+ZW0',
      },
    ],
    upvoters: [
      {
        id: '6cFfuScKu5Bp2T3CWzgBw',
        name: 'Gustebobben',
        image:
          'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
      },
      {
        id: 'fUYi2gWuWmvs9HgtedLW1',
        name: 'FemLol',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocLL2rUZatFH5vnp26SZZNk2JozI98a_N_VLwphlxwlinrh0dycj=s96-c',
      },
      {
        id: 'mFpD5ZlOiaCepbBXJ7Oii',
        name: 'Karlo Novak',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocJLE2j4797E_ul_67X8yrMcec4idFQE6Qzeywx8tXxlL9_Aew_Njw=s96-c',
      },
      {
        id: 'GBghEYgoehVGw0BMDJd7I',
        name: 'William Mandai',
        image:
          'https://lh3.googleusercontent.com/a-/AOh14GhvURmP4gBH5Q7nJEHu69p1MDXzDhUe31EcoMOKCA=s100',
      },
    ],
  },
  {
    id: 'kaOf9VQvd',
    title: 'Colab is now part of your Google AI plan',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/f0048475704cc807073f7a9928f33b7e?_a=AQAEuop',
    readTime: 1,
    createdAt: '2026-09-22T18:04:20.501Z',
    numUpvotes: 40,
    numComments: 3,
    tags: ['machine-learning', 'data-science', 'gpu', 'google-ai'],
    commentsPermalink:
      'https://daily.dev/posts/colab-is-now-part-of-your-google-ai-plan-kaof9vqvd',
    type: 'article',
    source: {
      id: 'googledevs',
      handle: 'googledevs',
      name: 'Google Developers',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/ea4bbded4e7f45ccb82e121a3156535f',
    },
    commenters: [
      {
        id: 'TvTVeiMdkRCqWUDullFmy',
        name: 'kartik-nvjk',
        image:
          'https://media.daily.dev/image/upload/s--3gGgsVCw--/f_auto/v1781456774/avatars/avatar_TvTVeiMdkRCqWUDullFmy?_a=BAMAMiWQ0',
      },
      {
        id: 'Aa0f0ajamxStQVNrHYWZr',
        name: 'Hardik',
        image:
          'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
      },
      {
        id: 'wQYYVe5Tbj0NJ7C7qPoa8',
        name: 'Agustin Barrientos',
        image:
          'https://media.daily.dev/image/upload/s--5ayxQnqn--/f_auto/v1788281802/avatars/avatar_wQYYVe5Tbj0NJ7C7qPoa8?_a=BAMAMicg0',
      },
    ],
    upvoters: [
      {
        id: 'GOCMgBUtdJkjx2wlQpLnB',
        name: 'Basil Ibrahim',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocJgvjCaZx-D2G_0Cb5epTx0qlNpvqvkW1AdXff03v1LtYnNDg=s96-c',
      },
      {
        id: 'jgqOgxjkCvc5EfAou41Hc',
        name: 'Mony Machado',
        image:
          'https://lh3.googleusercontent.com/a-/AFdZucp6P451igwSJmEqFOUQpCpeNioRDhtndtJ_glKE0bs=s100',
      },
      {
        id: 'EA3GcreDpIbLdLy5IagDf',
        name: 'Phong',
        image:
          'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
      },
      {
        id: 'RQVPgdaLkeW6OAhrEi8XQ',
        name: 'Pedro Dias',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocLqxrkrvSpLT6D5MBFjSmKCweIFV69LWc6VOgk_A0K2TVngkxZa=s96-c',
      },
    ],
  },
  {
    id: '6vlJntk5i',
    title: 'What “open weights” means for AI models',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/f64a2b5e55122c5753bbc9eca3b5969b?_a=AQAEuop',
    readTime: 13,
    createdAt: '2026-10-14T10:22:25.732Z',
    numUpvotes: 32,
    numComments: 2,
    tags: ['open-source', 'data-science', 'llm', 'qwen'],
    commentsPermalink:
      'https://daily.dev/posts/what-open-weights-means-for-ai-models-6vljntk5i',
    type: 'article',
    source: {
      id: 'flaviocopes',
      handle: 'flaviocopes',
      name: 'Flavio Copes',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/1f2dbd275797411bbd37bfdaaf0951a9',
    },
    commenters: [
      {
        id: 'QwWczI1OhnuqJ3vckrPPp',
        name: 'HARSHIT MANEPALLY',
        image:
          'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
      },
      {
        id: 'TvTVeiMdkRCqWUDullFmy',
        name: 'kartik-nvjk',
        image:
          'https://media.daily.dev/image/upload/s--3gGgsVCw--/f_auto/v1781456774/avatars/avatar_TvTVeiMdkRCqWUDullFmy?_a=BAMAMiWQ0',
      },
    ],
    upvoters: [
      {
        id: '83e217451d5f444da1aadaa2e6ce3577',
        name: 'Adi Agafitei',
        image: 'https://avatars1.githubusercontent.com/u/338271?v=4',
      },
      {
        id: 'U27QLhICCvm4in2e75Blh',
        name: 'Rahul Kumar',
        image:
          'https://media.daily.dev/image/upload/s--qVHREbAq--/f_auto/v1759385623/avatars/avatar_U27QLhICCvm4in2e75Blh?_a=BAMAK+ZW0',
      },
      {
        id: 'X2IkraOGSjpjDzQSlPT9r',
        name: 'Steve Clarke',
        image:
          'https://media.daily.dev/image/upload/s--4SiyqKlB--/f_auto,q_auto/v1/avatars/avatar_X2IkraOGSjpjDzQSlPT9r',
      },
      {
        id: 'Aa0f0ajamxStQVNrHYWZr',
        name: 'Hardik',
        image:
          'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
      },
    ],
  },
  {
    id: 'R2ObyuwnI',
    title: 'Singapore’s government creates a dating app',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/a855196f38a4865a4cc37e9ea76aaa03?_a=AQAEuop',
    readTime: 4,
    createdAt: '2026-10-01T05:37:52.853Z',
    numUpvotes: 8,
    numComments: 1,
    tags: ['data-science'],
    commentsPermalink:
      'https://daily.dev/posts/singapore-s-government-creates-a-dating-app-r2obyuwni',
    type: 'article',
    source: {
      id: 'theregister',
      handle: 'theregister',
      name: 'The Register',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/66aa2113fdad463992ffcbf0e8963fda',
    },
    commenters: [
      {
        id: 'eyySonLitPQLPK6mVrSSn',
        name: 'BigDog',
        image:
          'https://media.daily.dev/image/upload/s--GaJxcZaC--/f_auto/v1750769439/avatars/avatar_eyySonLitPQLPK6mVrSSn?_a=BAMClqZW0',
      },
    ],
    upvoters: [
      {
        id: 'yfCcjiz4shk9l1kaXs7m1',
        name: 'Andrea Senni',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocL9zDvgvAHJyMsmnVewPaOwW1fMuVIk0D1besTkxG8tnUmIoQ=s96-c',
      },
      {
        id: 'Ou9l5tJVTL0u3HN7sfet7',
        name: 'Korzald',
        image:
          'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
      },
      {
        id: 'EcUwkCRmLXvSGMtdsr97C',
        name: 'Muaz Sajid',
        image:
          'https://media.daily.dev/image/upload/s--UAIdCRUB--/f_auto/v1777182453/avatars/avatar_EcUwkCRmLXvSGMtdsr97C?_a=BAMAMiWQ0',
      },
      {
        id: 'orjMeK8QKaaVZwGq7ScPz',
        name: 'PDFops',
        image:
          'https://media.daily.dev/image/upload/s---8isRBKc--/f_auto/v1782922291/avatars/avatar_orjMeK8QKaaVZwGq7ScPz?_a=BAMAMicg0',
      },
    ],
  },
  {
    id: 'BM2onQaux',
    title: 'Blizzard Entertainment Announced Diablo V',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/02764cbb62d531fee8a4df8c0f6ab861?_a=AQAEuop',
    readTime: 4,
    createdAt: '2026-09-14T10:15:47.878Z',
    numUpvotes: 36,
    numComments: 11,
    tags: ['gaming'],
    commentsPermalink:
      'https://daily.dev/posts/blizzard-entertainment-announced-diablo-v-bm2onqaux',
    type: 'article',
    source: {
      id: '80lv',
      handle: '80lv',
      name: '80 LEVEL',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/78eebcd76c154e6bbfd565fed7dc4093',
    },
    commenters: [
      {
        id: '9wfwiDDn9TMzcAVYvmNzg',
        name: 'Eugene Yaremenko',
        image: 'https://avatars.githubusercontent.com/u/1898905?v=4',
      },
      {
        id: 'Qz65P1nVw3Bu6C5YwaZgA',
        name: 'Peter Mrożek',
        image:
          'https://media.daily.dev/image/upload/s--pBfYX68K--/f_auto/v1769247960/avatars/avatar_Qz65P1nVw3Bu6C5YwaZgA?_a=BAMAMiiu0',
      },
      {
        id: 'eyySonLitPQLPK6mVrSSn',
        name: 'BigDog',
        image:
          'https://media.daily.dev/image/upload/s--GaJxcZaC--/f_auto/v1750769439/avatars/avatar_eyySonLitPQLPK6mVrSSn?_a=BAMClqZW0',
      },
    ],
    upvoters: [
      {
        id: 'JQOOCwm71RhJ6TwDN2Ylz',
        name: 'Evan Anderson',
        image:
          'https://media.daily.dev/image/upload/s--NVptqpk2--/f_auto/v1756838463/avatars/avatar_JQOOCwm71RhJ6TwDN2Ylz?_a=BAMClqZW0',
      },
      {
        id: 'JyJRgPcPRVGqsUMbOlxiw',
        name: 'Louis VANHAECKE',
        image:
          'https://media.daily.dev/image/upload/s--OcSaT1Db--/f_auto/v1757711782/avatars/avatar_JyJRgPcPRVGqsUMbOlxiw?_a=BAMClqZW0',
      },
      {
        id: 'cMbvpvwghO6EmfV8Omw7Y',
        name: 'đá',
        image: 'https://avatars.githubusercontent.com/u/125523545?v=4',
      },
      {
        id: 'gOWhE04Lh5Won7GyAkAQM',
        name: 'RobertPastiss',
        image:
          'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
      },
    ],
  },
  {
    id: 'R6JtRhvAF',
    title: 'Good News Gamers! GOG is Officially Coming to Linux',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/4d9620dce6ac2fc49a1794ef691e49e8?_a=AQAEuop',
    readTime: 4,
    createdAt: '2026-07-29T13:04:11.128Z',
    numUpvotes: 145,
    numComments: 11,
    tags: ['linux', 'gaming'],
    commentsPermalink:
      'https://daily.dev/posts/good-news-gamers-gog-is-officially-coming-to-linux-r6jtrhvaf',
    type: 'article',
    source: {
      id: 'itsfoss',
      handle: 'itsfoss',
      name: "It's Foss",
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/582e3faed71842bfb9d3840a787d6700',
    },
    commenters: [
      {
        id: 'Qz65P1nVw3Bu6C5YwaZgA',
        name: 'Peter Mrożek',
        image:
          'https://media.daily.dev/image/upload/s--pBfYX68K--/f_auto/v1769247960/avatars/avatar_Qz65P1nVw3Bu6C5YwaZgA?_a=BAMAMiiu0',
      },
      {
        id: 'AEu8LB8IUcQqWo55yHR83',
        name: 'Gwendal Ars',
        image: 'https://avatars.githubusercontent.com/u/207736072?v=4',
      },
      {
        id: 'FFsGt5xIsnLAyyQAAx1th',
        name: 'Michal Filo',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocJw7RT2L5Tl9Qa2OnmI7uwXbrBSH2qT6cLpHU8fAuHxrbOUHA=s96-c',
      },
    ],
    upvoters: [
      {
        id: 'zm7Tdw8ewxNuugMel6Hr8',
        name: 'ChrisDouris',
        image: 'https://avatars.githubusercontent.com/u/50987565?v=4',
      },
      {
        id: '6EU7eWIYLmOjSfv4fsRzj',
        name: 'Jonas',
        image:
          'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
      },
      {
        id: 'PQvKTJgo7LXiG8RZADrX3',
        name: 'Matuco19',
        image:
          'https://media.daily.dev/image/upload/s--rr7hoFPm--/f_auto/v1759004684/avatars/avatar_PQvKTJgo7LXiG8RZADrX3?_a=BAMAK+ZW0',
      },
      {
        id: 'Xh0oXTe2d1bhVzaQtfwUR',
        name: 'Germán Rico',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocKmJPqmOqPqSzlZnp1_q3Axxc17OouMkTOCUd1AO7MnyIlhGKE=s96-c',
      },
    ],
  },
  {
    id: 'oGhV3KrGs',
    title:
      'I tested every game in my Steam library on Linux, and the results shocked me',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/3c047bfa058e1a76cf4c1d26b090cb83?_a=AQAEuop',
    readTime: 3,
    createdAt: '2026-08-31T17:34:31.541Z',
    numUpvotes: 32,
    numComments: 10,
    tags: ['linux', 'gaming', 'steam'],
    commentsPermalink:
      'https://daily.dev/posts/i-tested-every-game-in-my-steam-library-on-linux-and-the-results-shocked-me-oghv3krgs',
    type: 'article',
    source: {
      id: 'xda-developers',
      handle: 'xda-developers',
      name: 'XDA Developers',
      image:
        'https://media.daily.dev/image/upload/s--kCg6yyAP--/f_auto,q_auto/v1774964407/logos/xda-developers?_a=BAMAMiWQ0',
    },
    commenters: [
      {
        id: 'XqES0FJwkvsA1DQukeip8',
        name: 'Oğuz Görencan',
        image: 'https://avatars.githubusercontent.com/u/63954402?v=4',
      },
      {
        id: 'r0uMd4poWL1KgOtKY2Cvm',
        name: 'Dominus Zeikyu',
        image: 'https://avatars.githubusercontent.com/u/31802953?v=4',
      },
      {
        id: 'A5R4jL0I2xQbGYxuXNt8x',
        name: 'Mindinu',
        image:
          'https://media.daily.dev/image/upload/s--bUvb0Veh--/f_auto/v1788499108/avatars/avatar_A5R4jL0I2xQbGYxuXNt8x?_a=BAMAMicg0',
      },
    ],
    upvoters: [
      {
        id: 'V4QzVowjihvNK17ZXNh2v',
        name: 'Soumyo Sadman',
        image:
          'https://media.daily.dev/image/upload/s--iojhd1GE--/f_auto/v1784661422/avatars/avatar_V4QzVowjihvNK17ZXNh2v?_a=BAMAMicg0',
      },
      {
        id: '0qNCC1POgKaIYXUgQUcQC',
        name: 'Waltrapfy',
        image: 'https://avatars.githubusercontent.com/u/197372902?v=4',
      },
      {
        id: 'oZdm4o4SjcfsvL73J9b3e',
        name: 'Dennis Woering',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocKJSmBXi5ea7yiLdK6nixoZlEvoq2KC6byuP7oOxagR65wxug=s96-c',
      },
      {
        id: '12X3d75FkClcevtrN7onA',
        name: 'Răzvan',
        image:
          'https://media.daily.dev/image/upload/s--5Xk6Ti8g--/f_auto/v1784724700/avatars/avatar_12X3d75FkClcevtrN7onA?_a=BAMAMicg0',
      },
    ],
  },
  {
    id: 'C00A7hw6I',
    title: 'Node.js — Node.js 24.22.0 (LTS)',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/95b9456e32445ef7b34da79eee2423f1?_a=AQAEuop',
    readTime: 28,
    createdAt: '2026-10-14T15:54:51.524Z',
    numUpvotes: 9,
    numComments: 1,
    tags: ['javascript', 'nodejs', 'crypto', 'sqlite'],
    commentsPermalink:
      'https://daily.dev/posts/node-js-node-js-24-22-0-lts--c00a7hw6i',
    type: 'article',
    source: {
      id: 'nodejs',
      handle: 'nodejs',
      name: 'Node.js',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/nodejs',
    },
    commenters: [
      {
        id: 'orjMeK8QKaaVZwGq7ScPz',
        name: 'PDFops',
        image:
          'https://media.daily.dev/image/upload/s---8isRBKc--/f_auto/v1782922291/avatars/avatar_orjMeK8QKaaVZwGq7ScPz?_a=BAMAMicg0',
      },
    ],
    upvoters: [
      {
        id: 'TWmVpEzjPBU2SVv1zpVby',
        name: 'Muhammad Hammad Zafar',
        image: 'https://avatars.githubusercontent.com/u/48489738?v=4',
      },
      {
        id: 'ZL6bebyCVkszL2cr0g8ab',
        name: 'Swarna Sharmin',
        image:
          'https://media.daily.dev/image/upload/s--joHEq_jD--/f_auto/v1791022797/avatars/avatar_ZL6bebyCVkszL2cr0g8ab?_a=BAMAMicg0',
      },
      {
        id: 'FQKwuWBcZgtIaLiHg4E9s',
        name: 'Tausif Al Zubayer',
        image:
          'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
      },
      {
        id: 'XgRt9jya3bbNspe5VEn3T',
        name: 'Abdirahman Mohamoud',
        image:
          'https://media.daily.dev/image/upload/s--X78MWNYX--/f_auto/v1716196774/avatars/avatar_XgRt9jya3bbNspe5VEn3T',
      },
    ],
  },
  {
    id: 'bWHrnTEin',
    title:
      'AI-to-AI Payments: Why Autonomous Agents May Need Their Own Economy',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/a3c6de19975cc8ce3bc368eb7bc30579?_a=AQAEuop',
    readTime: 7,
    createdAt: '2026-09-19T22:51:16.750Z',
    numUpvotes: 3,
    numComments: 1,
    tags: [
      'ai',
      'webdev',
      'crypto',
      'blockchain',
      'fintech',
      'agentic-ai',
      'smart-contracts',
    ],
    commentsPermalink:
      'https://daily.dev/posts/ai-to-ai-payments-why-autonomous-agents-may-need-their-own-economy-bwhrntein',
    type: 'article',
    source: {
      id: 'devto',
      handle: 'devto',
      name: 'DEV',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/devto',
    },
    commenters: [
      {
        id: 'dzMahIPzi93az9XJnigFC',
        name: 'FSS Tech',
        image:
          'https://media.daily.dev/image/upload/s--3lZpvoLE--/f_auto/v1755769068/avatars/avatar_dzMahIPzi93az9XJnigFC?_a=BAMClqZW0',
      },
    ],
    upvoters: [
      {
        id: 'zWINBI0MRYnzdKM90ROks',
        name: 'kas2094',
        image:
          'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
      },
      {
        id: 'MMijGiqFSGEsk0QPlm7Io',
        name: 'Miguel',
        image: 'https://avatars.githubusercontent.com/u/44272798?v=4',
      },
      {
        id: 'I6dIRjBneSrd8PDIUl6WA',
        name: 'Shashi Nagulakonda',
        image:
          'https://media.daily.dev/image/upload/s---YxyLuM1--/f_auto/v1771268248/avatars/avatar_I6dIRjBneSrd8PDIUl6WA?_a=BAMAMiiu0',
      },
    ],
  },
  {
    id: 'jkdRMpMCz',
    title: 'Node.js — Node.js 24.21.0 (LTS)',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/c8e0ad19c8d2c7eb7b7bf414f9862367?_a=AQAEuop',
    readTime: 19,
    createdAt: '2026-09-09T16:31:44.479Z',
    numUpvotes: 37,
    numComments: 1,
    tags: ['javascript', 'nodejs', 'crypto', 'cryptography', 'sqlite'],
    commentsPermalink:
      'https://daily.dev/posts/node-js-node-js-24-21-0-lts--jkdrmpmcz',
    type: 'article',
    source: {
      id: 'nodejs',
      handle: 'nodejs',
      name: 'Node.js',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/nodejs',
    },
    commenters: [
      {
        id: 'zZeuA9kIhM55Ar6avf2NA',
        name: 'Irshad Jan',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocIbPdAoUYjuyX21TqDR5ZJH-PquRiZrqMLMi8gmArMG24c4Tmw=s96-c',
      },
    ],
    upvoters: [
      {
        id: 'j6BAXyiIqecxgNfT6PAt2',
        name: 'Sriman',
        image:
          'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
      },
      {
        id: 'Rr9PmVg4vY1Pr8E9pkkOO',
        name: 'Manish Mandal',
        image:
          'https://lh3.googleusercontent.com/a/AEdFTp4NVlJWgOzZnycKCVJtSIBA_A_xuj6-3ZCcKW8VJg=s96-c',
      },
      {
        id: '0AnkdDbWaG50CilHeCKp6',
        name: 'danishmehmood',
        image:
          'https://media.daily.dev/image/upload/v1666348204/avatars/avatar_0AnkdDbWaG50CilHeCKp6.jpg',
      },
      {
        id: 'U61jNCdFxgPZfz6RYGoNT',
        name: 'Miguel Sumalinog',
        image:
          'https://media.daily.dev/image/upload/s---raiRdE1--/f_auto/v1724600688/avatars/avatar_U61jNCdFxgPZfz6RYGoNT',
      },
    ],
  },
  {
    id: '7kvGmoFnj',
    title: 'Graph Theory Applications in Cryptocurrency Network Analysis',
    image:
      'https://media.daily.dev/image/upload/s--1KxV4ohY--/f_auto/v1722860400/public/Placeholder%2007',
    readTime: 13,
    createdAt: '2026-07-28T17:19:54.729Z',
    numUpvotes: 1,
    numComments: 1,
    tags: ['deep-learning', 'crypto', 'graph-theory'],
    commentsPermalink:
      'https://daily.dev/posts/graph-theory-applications-in-cryptocurrency-network-analysis-7kvgmofnj',
    type: 'article',
    source: {
      id: 'coinsbench',
      handle: 'coinsbench',
      name: 'Coins Bench',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/ba340d3c8caa4c2586911332928e24d9',
    },
    commenters: [
      {
        id: '5YFzhn4qlKrloCfDfWziR',
        name: 'Henry Jenkins',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocJrS7vACQPSQ-sP1Pa-49R4bK8VoPiFewaLNdBn_63dpKrenX0=s96-c',
      },
    ],
    upvoters: [
      {
        id: '5YFzhn4qlKrloCfDfWziR',
        name: 'Henry Jenkins',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocJrS7vACQPSQ-sP1Pa-49R4bK8VoPiFewaLNdBn_63dpKrenX0=s96-c',
      },
    ],
  },
  {
    id: 'bVSvCYuHk',
    title: 'Ruby 3.4.11 Released',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/70148b15fea2449ce466c507466a051c?_a=AQAEuop',
    readTime: 1,
    createdAt: '2026-09-23T06:33:02.737Z',
    numUpvotes: 22,
    numComments: 2,
    tags: ['ruby'],
    commentsPermalink: 'https://daily.dev/posts/ruby-3-4-11-released-bvsvcyuhk',
    type: 'article',
    source: {
      id: 'ruby',
      handle: 'ruby',
      name: 'Ruby',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/05592459849b4d6b8e7af1758235a337',
    },
    commenters: [
      {
        id: 'wQYYVe5Tbj0NJ7C7qPoa8',
        name: 'Agustin Barrientos',
        image:
          'https://media.daily.dev/image/upload/s--5ayxQnqn--/f_auto/v1788281802/avatars/avatar_wQYYVe5Tbj0NJ7C7qPoa8?_a=BAMAMicg0',
      },
      {
        id: 'JJtZr4Sjm',
        name: 'Jenuel Oras Ganawed',
        image:
          'https://media.daily.dev/image/upload/s--BadmiNyj--/f_auto/v1787625077/avatars/avatar_JJtZr4Sjm?_a=BAMAMicg0',
      },
    ],
    upvoters: [
      {
        id: 'wHGgZZQjyCAal5fR7EGm2',
        name: 'Jérôme Lidawo Bienvenu NABEDE',
        image:
          'https://media.daily.dev/image/upload/s--2xlykmou--/f_auto/v1744746961/avatars/avatar_wHGgZZQjyCAal5fR7EGm2',
      },
      {
        id: '7BlkdVN89a93IW66v7dzN',
        name: 'ehsan Fouladi',
        image:
          'https://lh3.googleusercontent.com/a/AGNmyxYblOiAWr20n8pqWAD0wdzHhShPGf4NYm8C1TeB=s96-c',
      },
      {
        id: 'JJtZr4Sjm',
        name: 'Jenuel Oras Ganawed',
        image:
          'https://media.daily.dev/image/upload/s--BadmiNyj--/f_auto/v1787625077/avatars/avatar_JJtZr4Sjm?_a=BAMAMicg0',
      },
      {
        id: 'B7QRh78ccbhV2tEn6iveJ',
        name: 'AnAlien',
        image:
          'https://media.daily.dev/image/upload/s--_KWZjb0A--/f_auto/v1790344343/avatars/avatar_B7QRh78ccbhV2tEn6iveJ?_a=BAMAMicg0',
      },
    ],
  },
  {
    id: '1bsnzp6HZ',
    title: 'Agents on Rails: the first benchmark report',
    image: 'https://rubyonrails.org/assets/images/opengraph.png',
    readTime: 4,
    createdAt: '2026-08-13T16:57:25.356Z',
    numUpvotes: 2,
    numComments: 2,
    tags: ['ai', 'ai-agents', 'ruby', 'rails', 'claude'],
    commentsPermalink:
      'https://daily.dev/posts/agents-on-rails-the-first-benchmark-report-1bsnzp6hz',
    type: 'article',
    source: {
      id: 'rubyla',
      handle: 'rubyla',
      name: 'RUBYLAND',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/rubyla',
    },
    commenters: [
      {
        id: 'fQ7ttCKtPuu6tDvcgQXv5',
        name: 'Andrew',
        image:
          'https://media.daily.dev/image/upload/s--35vRfXAA--/f_auto/v1785413727/avatars/avatar_fQ7ttCKtPuu6tDvcgQXv5?_a=BAMAMicg0',
      },
      {
        id: 'wQYYVe5Tbj0NJ7C7qPoa8',
        name: 'Agustin Barrientos',
        image:
          'https://media.daily.dev/image/upload/s--5ayxQnqn--/f_auto/v1788281802/avatars/avatar_wQYYVe5Tbj0NJ7C7qPoa8?_a=BAMAMicg0',
      },
    ],
    upvoters: [
      {
        id: 'wQYYVe5Tbj0NJ7C7qPoa8',
        name: 'Agustin Barrientos',
        image:
          'https://media.daily.dev/image/upload/s--5ayxQnqn--/f_auto/v1788281802/avatars/avatar_wQYYVe5Tbj0NJ7C7qPoa8?_a=BAMAMicg0',
      },
      {
        id: 'fQ7ttCKtPuu6tDvcgQXv5',
        name: 'Andrew',
        image:
          'https://media.daily.dev/image/upload/s--35vRfXAA--/f_auto/v1785413727/avatars/avatar_fQ7ttCKtPuu6tDvcgQXv5?_a=BAMAMicg0',
      },
    ],
  },
  {
    id: '4TaGK9vWS',
    title:
      'Callbacks, Concerns, and Current: Avoiding Hidden Dependencies in Rails',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/713f66ccb9e4013cb3bbc6a1abf43412?_a=AQAEuop',
    readTime: 13,
    createdAt: '2026-10-09T21:36:55.740Z',
    numUpvotes: 0,
    numComments: 1,
    tags: ['testing', 'architecture', 'ruby', 'rails'],
    commentsPermalink:
      'https://daily.dev/posts/callbacks-concerns-and-current-avoiding-hidden-dependencies-in-rails-4tagk9vws',
    type: 'article',
    source: {
      id: 'rubyflow',
      handle: 'rubyflow',
      name: 'Ruby Flow',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/a21aaa8bcbbf448193a016895c90a0e1',
    },
    commenters: [
      {
        id: 'njI2ZHYhNIJGOXEG0gJ5j',
        name: 'Adam',
        image: 'https://avatars.githubusercontent.com/u/2162621?v=4',
      },
    ],
    upvoters: [],
  },
  {
    id: 'YfVchZqDl',
    title: 'Agents on Rails: Stage 2. Can a model ship a feature?',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/f3219107ad4885c4e776650b7cdd8928?_a=AQAEuop',
    readTime: 5,
    createdAt: '2026-09-09T13:12:54.703Z',
    numUpvotes: 2,
    numComments: 1,
    tags: ['ai', 'ai-agents', 'ruby', 'rails', 'claude'],
    commentsPermalink:
      'https://daily.dev/posts/agents-on-rails-stage-2-can-a-model-ship-a-feature--yfvchzqdl',
    type: 'article',
    source: {
      id: 'rails',
      handle: 'rails',
      name: 'Rails',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/d44501fa43a2441a9e27a08367cdfa52',
    },
    commenters: [
      {
        id: 'UqfPQbOdd9ZYQvAgAImEm',
        name: 'Leonid Bugaev',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocLhMgurwTmJElWaH9A8Ju8cHvZxgMCDt009jEYkmFCyUGAoaGSw=s96-c',
      },
    ],
    upvoters: [
      {
        id: 'zfZM2zsNZNoGUBQnKsMPs',
        name: 'Jackson Masache',
        image:
          'https://media.daily.dev/image/upload/s--zvJ0Z3M7--/f_auto/v1769707075/avatars/avatar_zfZM2zsNZNoGUBQnKsMPs?_a=BAMAMiiu0',
      },
      {
        id: 'X2CUHsGOn1hkQbbzjd6VK',
        name: 'Carlos Daniel Pohlod',
        image:
          'https://media.daily.dev/image/upload/s--axqck0q5--/f_auto/v1787951887/avatars/avatar_X2CUHsGOn1hkQbbzjd6VK?_a=BAMAMicg0',
      },
    ],
  },
  {
    id: 'aNliQz3yb',
    title: 'WebSockets vs. SSE should be about ordering and correctness',
    image:
      'https://media.daily.dev/image/upload/s--ZrL_HSsR--/f_auto/v1722860399/public/Placeholder%2006',
    readTime: 6,
    createdAt: '2026-08-25T09:39:53.032Z',
    numUpvotes: 2,
    numComments: 2,
    tags: [
      'webdev',
      'elixir',
      'distributed-systems',
      'liveview',
      'server-sent-events',
    ],
    commentsPermalink:
      'https://daily.dev/posts/websockets-vs-sse-should-be-about-ordering-and-correctness-anliqz3yb',
    type: 'article',
    source: {
      id: 'dashbit',
      handle: 'dashbit',
      name: 'Dashbit',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/c4337cc4fffc412180b3986f74995a28',
    },
    commenters: [
      {
        id: 'fQ7ttCKtPuu6tDvcgQXv5',
        name: 'Andrew',
        image:
          'https://media.daily.dev/image/upload/s--35vRfXAA--/f_auto/v1785413727/avatars/avatar_fQ7ttCKtPuu6tDvcgQXv5?_a=BAMAMicg0',
      },
      {
        id: 'OPFLRsQKtNlGCGfy7Ufpf',
        name: 'Web3 Trading Systems Engineer',
        image:
          'https://media.daily.dev/image/upload/s--Z7Ihbai5--/f_auto/v1789384383/avatars/avatar_OPFLRsQKtNlGCGfy7Ufpf?_a=BAMAMicg0',
      },
    ],
    upvoters: [
      {
        id: 'G7Ic5PZvwwq5zCnUL4bYZ',
        name: 'Saeed Kefayati',
        image:
          'https://media.daily.dev/image/upload/s--mPbB_saT--/f_auto/v1781269254/avatars/avatar_G7Ic5PZvwwq5zCnUL4bYZ?_a=BAMAMiWQ0',
      },
      {
        id: 'fQ7ttCKtPuu6tDvcgQXv5',
        name: 'Andrew',
        image:
          'https://media.daily.dev/image/upload/s--35vRfXAA--/f_auto/v1785413727/avatars/avatar_fQ7ttCKtPuu6tDvcgQXv5?_a=BAMAMicg0',
      },
    ],
  },
  {
    id: 'DjzxRmiyJ',
    title: 'Admit when you’re wrong',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/ad7c427d5d729682906f767a0339d891?_a=AQAEuop',
    readTime: 7,
    createdAt: '2026-10-05T13:43:36.474Z',
    numUpvotes: 12,
    numComments: 1,
    tags: ['ai-agents', 'authentication', 'rust', 'elixir'],
    commentsPermalink:
      'https://daily.dev/posts/admit-when-you-re-wrong-djzxrmiyj',
    type: 'article',
    source: {
      id: 'elixirstatus',
      handle: 'elixirstatus',
      name: 'ElixirStatus',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/22e4640538124187827caf8cc8e39190',
    },
    commenters: [
      {
        id: 'VJYJYRUfN',
        name: 'Yohanes',
        image: 'https://avatars0.githubusercontent.com/u/14943363?v=4',
      },
    ],
    upvoters: [
      {
        id: '8Bx6g7JeDpX7rkkz1BfJJ',
        name: 'Adrian Thomas',
        image: 'https://avatars.githubusercontent.com/u/3031275?v=4',
      },
      {
        id: 'cEvglmMakqUvYZmBIHWUZ',
        name: 'Anthony lombardi',
        image:
          'https://media.daily.dev/image/upload/s--HONrNxUn--/f_auto/v1709940707/avatars/avatar_cEvglmMakqUvYZmBIHWUZ',
      },
      {
        id: 'QH6exPrlmpTpnJd7oGCaU',
        name: 'Babatunde Adebayo',
        image:
          'https://media.daily.dev/image/upload/s--jmhvZ1oP--/f_auto/v1769196325/avatars/avatar_QH6exPrlmpTpnJd7oGCaU?_a=BAMAMiiu0',
      },
      {
        id: 'a1700e56bc19405faf6615be164a8a16',
        name: 'BLUE LLYR',
        image: 'https://avatars0.githubusercontent.com/u/845023?v=4',
      },
    ],
  },
  {
    id: '2Li9sWvZf',
    title: 'Finding Your Broken Glass: A Flaky Test Prompt for GitHub Actions',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/d3b0a11c49eeeb839ca2c80fe57429bb?_a=AQAEuop',
    readTime: 8,
    createdAt: '2026-09-08T15:07:18.232Z',
    numUpvotes: 0,
    numComments: 1,
    tags: ['cicd', 'elixir', 'github-actions', 'testing'],
    commentsPermalink:
      'https://daily.dev/posts/finding-your-broken-glass-a-flaky-test-prompt-for-github-actions-2li9swvzf',
    type: 'article',
    source: {
      id: 'elixirstatus',
      handle: 'elixirstatus',
      name: 'ElixirStatus',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/22e4640538124187827caf8cc8e39190',
    },
    commenters: [
      {
        id: 'UqfPQbOdd9ZYQvAgAImEm',
        name: 'Leonid Bugaev',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocLhMgurwTmJElWaH9A8Ju8cHvZxgMCDt009jEYkmFCyUGAoaGSw=s96-c',
      },
    ],
    upvoters: [],
  },
  {
    id: 'uvjS2t0le',
    title: 'Beyond Regex: Why We Shipped a CPU Profile for PII Detection',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/a4bdadec5a872e9c7c259a3a838173b3?_a=AQAEuop',
    readTime: 11,
    createdAt: '2026-09-05T22:56:19.613Z',
    numUpvotes: 1,
    numComments: 1,
    tags: ['rust', 'nlp', 'elixir'],
    commentsPermalink:
      'https://daily.dev/posts/beyond-regex-why-we-shipped-a-cpu-profile-for-pii-detection-uvjs2t0le',
    type: 'article',
    source: {
      id: 'elixirstatus',
      handle: 'elixirstatus',
      name: 'ElixirStatus',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/22e4640538124187827caf8cc8e39190',
    },
    commenters: [
      {
        id: 'EMoP47rpuw8DNjhp6R1b6',
        name: 'Trevor Suna',
        image:
          'https://media.daily.dev/image/upload/s--dZ7gXxpp--/f_auto/v1784081551/avatars/avatar_EMoP47rpuw8DNjhp6R1b6?_a=BAMAMicg0',
      },
    ],
    upvoters: [
      {
        id: 'EMoP47rpuw8DNjhp6R1b6',
        name: 'Trevor Suna',
        image:
          'https://media.daily.dev/image/upload/s--dZ7gXxpp--/f_auto/v1784081551/avatars/avatar_EMoP47rpuw8DNjhp6R1b6?_a=BAMAMicg0',
      },
    ],
  },
  {
    id: 'tQesVXF3J',
    title: 'WinApp CLI v0.7.0 Release Announcement',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/60c36f22c67507cc9873382f39464674?_a=AQAEuop',
    readTime: 11,
    createdAt: '2026-09-25T17:48:49.304Z',
    numUpvotes: 72,
    numComments: 10,
    tags: ['.net', 'winui'],
    commentsPermalink:
      'https://daily.dev/posts/winapp-cli-v0-7-0-release-announcement-tqesvxf3j',
    type: 'article',
    source: {
      id: 'devblogs',
      handle: 'devblogs',
      name: 'DevBlogs',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/8f68b453325f482ebeb73fb780092713',
    },
    commenters: [
      {
        id: 'orjMeK8QKaaVZwGq7ScPz',
        name: 'PDFops',
        image:
          'https://media.daily.dev/image/upload/s---8isRBKc--/f_auto/v1782922291/avatars/avatar_orjMeK8QKaaVZwGq7ScPz?_a=BAMAMicg0',
      },
      {
        id: 'wQYYVe5Tbj0NJ7C7qPoa8',
        name: 'Agustin Barrientos',
        image:
          'https://media.daily.dev/image/upload/s--5ayxQnqn--/f_auto/v1788281802/avatars/avatar_wQYYVe5Tbj0NJ7C7qPoa8?_a=BAMAMicg0',
      },
      {
        id: 'SbncGJHaRHf7KoebEkT1L',
        name: 'Marko Zakrajsek',
        image:
          'https://media.daily.dev/image/upload/s--slY3-STy--/f_auto/v1783585373/avatars/avatar_SbncGJHaRHf7KoebEkT1L?_a=BAMAMicg0',
      },
    ],
    upvoters: [
      {
        id: 'V4QzVowjihvNK17ZXNh2v',
        name: 'Soumyo Sadman',
        image:
          'https://media.daily.dev/image/upload/s--iojhd1GE--/f_auto/v1784661422/avatars/avatar_V4QzVowjihvNK17ZXNh2v?_a=BAMAMicg0',
      },
      {
        id: '3oVWMsDfN7RF0uOUR4EPs',
        name: 'Taher Mahmoud',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocLy_EKgImFHwkndwTt8hwHc-wOGVSy6hiyrvhq2RI1ta7uXcQ=s96-c',
      },
      {
        id: 'jnPibTyRLEhVdIbii2usr',
        name: 'Mikhail Makeev',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocIjcvDU1gmJ9-KJDeTYqY2rMdl5QxcWYtLTGSXrj8ubF4nwar_w=s96-c',
      },
      {
        id: '5oD655HmLaUfHdH7xzS64',
        name: 'Edward Chirwa',
        image: 'https://avatars.githubusercontent.com/u/97362835?v=4',
      },
    ],
  },
  {
    id: 'n2RAI39sp',
    title: 'The System Design Behind My New SaaS',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/25ef2a3d05d444baebcca48f3cfffce3?_a=AQAEuop',
    readTime: 10,
    createdAt: '2026-07-24T20:01:06.285Z',
    numUpvotes: 49,
    numComments: 6,
    tags: ['career', '.net', 'self-hosting'],
    commentsPermalink:
      'https://daily.dev/posts/the-system-design-behind-my-new-saas-n2rai39sp',
    type: 'article',
    source: {
      id: 'milanjovanovic',
      handle: 'milanjovanovic',
      name: 'Milan Jovanović',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/78d8abfb692746538410dee47f93e566',
    },
    commenters: [
      {
        id: 'EMoP47rpuw8DNjhp6R1b6',
        name: 'Trevor Suna',
        image:
          'https://media.daily.dev/image/upload/s--dZ7gXxpp--/f_auto/v1784081551/avatars/avatar_EMoP47rpuw8DNjhp6R1b6?_a=BAMAMicg0',
      },
      {
        id: 'QNZlI2SgVnNSx5PSRpCVx',
        name: 'Ajay Choudhary',
        image:
          'https://media.daily.dev/image/upload/s--WkX8wDW2--/f_auto/v1780989706/avatars/avatar_QNZlI2SgVnNSx5PSRpCVx?_a=BAMAMiWQ0',
      },
    ],
    upvoters: [
      {
        id: 'ZWs5ZDTk1rzZvf7r9E6M7',
        name: 'William',
        image:
          'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
      },
      {
        id: 'ox3adfww94zAivCcvulkQ',
        name: 'Ibrahim Elhofy',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocLI17loU8rd8bdwl9nvoWtl0md3hFdY0L5MmDDH_avAyE8=s96-c',
      },
      {
        id: 'x13ZsKKmjsMiKpvbJHA8n',
        name: 'ALEJANDRO CASTRO',
        image: 'https://avatars.githubusercontent.com/u/1930446?v=4',
      },
      {
        id: 'BBhMXCiJj0FPQ40ZB9hEN',
        name: 'Mati 579',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocKjBFV-bqxrEMrfarwYaqf1Ln78El2_kCUeyYrUVDlrhpS3rw=s96-c',
      },
    ],
  },
  {
    id: 'HgFdVjOSF',
    title: 'AI added a vulnerable NuGet package to our .NET app',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/24bcf3df26819756454e22826d32cf49?_a=AQAEuop',
    readTime: 7,
    createdAt: '2026-10-05T12:04:39.797Z',
    numUpvotes: 16,
    numComments: 5,
    tags: ['.net', 'claude', 'nuget'],
    commentsPermalink:
      'https://daily.dev/posts/ai-added-a-vulnerable-nuget-package-to-our-net-app-hgfdvjosf',
    type: 'article',
    source: {
      id: 'roundthecode',
      handle: 'roundthecode',
      name: 'Round The Code',
      image:
        'https://media.daily.dev/image/upload/s--HmwWBSI1--/f_auto,q_auto/v1791119052/logos/roundthecode?_a=BAMAMicg0',
    },
    commenters: [
      {
        id: 'NM0uvu3dPLeLBaVyW0bIO',
        name: 'neil hatly',
        image:
          'https://media.daily.dev/image/upload/s--NQzs28XS--/f_auto/v1734692205/avatars/avatar_NM0uvu3dPLeLBaVyW0bIO',
      },
      {
        id: 'TvTVeiMdkRCqWUDullFmy',
        name: 'kartik-nvjk',
        image:
          'https://media.daily.dev/image/upload/s--3gGgsVCw--/f_auto/v1781456774/avatars/avatar_TvTVeiMdkRCqWUDullFmy?_a=BAMAMiWQ0',
      },
      {
        id: 'ryDlbifZ1EuRuh3g51ryC',
        name: 'Risto Tõldsep',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocLDWc6mZn0JwNmXXw6WY0L_HJ6pegzRttooC5VgtXESHSj3MNYx=s96-c',
      },
    ],
    upvoters: [
      {
        id: 'iEfCobFFjLWDexbk9fhT3',
        name: 'Luis Puc',
        image: 'https://avatars.githubusercontent.com/u/25454970?v=4',
      },
      {
        id: 'MF1TfC05be7tWHwCu1Rwr',
        name: 'Ahmet Özel',
        image: 'https://avatars.githubusercontent.com/u/70992231?v=4',
      },
      {
        id: 'VTmo9GVvig5HJ4uoo7YCV',
        name: 'R. Akash Selvaraj',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocKkr6_cJSXfBvRGhKz0t3c_DERYldYlZLnQEvbVjqh0ewYodeA4=s96-c',
      },
      {
        id: 'WhpHe2ngWJ9QbTYmApeA3',
        name: 'Tim Goshinski',
        image:
          'https://media.daily.dev/image/upload/s--_5X3OG7c--/f_auto/v1726237311/avatars/avatar_WhpHe2ngWJ9QbTYmApeA3',
      },
    ],
  },
] as unknown as DiscussedPost[];

export const DISCUSSED_IDS_BY_TAG: Record<string, string[]> = {
  javascript: ['UJk81ooxg', 'hq5Do4uqz', 'rOq2jbA7U', 'RFRxDV6yP'],
  react: ['SFQIftBGY', 'RFRxDV6yP', 'PwVpziVEc', 'KGEEoFyhY'],
  devops: ['BXhP3E0ci', 'qve2fcLy2', '2a2haeRkb', 'b7eKZAZNV'],
  ai: ['VIVynMBNG', 'D3DLRKJ2y', 'XCmmeq8ZC', 'vqi8DEPhd'],
  webdev: ['kqNUxrv44', 'VIVynMBNG', 'AzxnBHN3V', 'rkdZeFgF1'],
  python: ['UErBIyZD2', 'HpB2Ytmzl', 'B4AdOqQFH', 'uV8eZ8ZWe'],
  rust: ['X7Q71DikA', 'VNv8IMYss', 'QMZmRIiMy', '7p9nRlTLf'],
  golang: ['xM5S5hEac', 'dCvXE0Odu', 'z4NW802Lb', 'kveuZLPIB'],
  security: ['7bvdmnnws', 'TnEq4Op27', 'joJdR6TPV', 'sil6TlGPh'],
  cloud: ['qiGq7yU8u', '6YFWmyNmb', 'iureBtF6Y', 'n12ZCJIKJ'],
  database: ['tJXzJXa4Q', 'aheRz8sWw', 'DkqJwCK1x', 'IOp2y0qF3'],
  'machine-learning': ['7nSw95Tq8', 'HpB2Ytmzl', 'zcbBlEayw', 'Hh1bycscA'],
  mobile: ['ZzQwAVqQs', 'nSjLzKy7x', 'a6nQbFZe3', '3HYJCKr3V'],
  'open-source': ['05M7JtiW5', 'j4duNN9S2', 'KfPEpQdOl', '90hb0NeVt'],
  architecture: ['I8552M7YO', 'OqEfvQhF8', 'V08wjhuWG', 'mdHayRa8h'],
  testing: ['8bYgWtyr3', 'rrFPegQZT', 'NV2vKw86m', 'CnSvDowgG'],
  java: ['Ib2R2Pgex', 'Rqa51hJGs', 'lY4PuHNc1', 'FiLYF9a73'],
  'tech-news': ['4ZSJnvT07', 'TgAcKeR5L', 'uIfzQMWh7', '7EgQmiPu3'],
  'data-science': ['Hh1bycscA', 'kaOf9VQvd', '6vlJntk5i', 'R2ObyuwnI'],
  gaming: ['TgAcKeR5L', 'BM2onQaux', 'R6JtRhvAF', 'oGhV3KrGs'],
  crypto: ['C00A7hw6I', 'bWHrnTEin', 'jkdRMpMCz', '7kvGmoFnj'],
  ruby: ['bVSvCYuHk', '1bsnzp6HZ', '4TaGK9vWS', 'YfVchZqDl'],
  elixir: ['aNliQz3yb', 'DjzxRmiyJ', '2Li9sWvZf', 'uvjS2t0le'],
  '.net': ['xM5S5hEac', 'tQesVXF3J', 'n2RAI39sp', 'HgFdVjOSF'],
};
