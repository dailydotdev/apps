// Captured from api.daily.dev on 2026-10-16: per tag, the most commented of the
// newest 50 posts, with the people who commented on and upvoted them.
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
    id: 'rOq2jbA7U',
    title: 'When you just need to build a tiny desktop app: TinyJS',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/a13d983ce49ad6b07365202a0a638e58?_a=AQAEuop',
    readTime: 5,
    createdAt: '2026-10-13T08:12:40.548Z',
    numUpvotes: 72,
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
      {
        id: 'igzBsWloJeaegzm9bQltZ',
        name: 'AllInOneTools',
        image:
          'https://media.daily.dev/image/upload/s--4ZT8QlF0--/f_auto/v1769790028/avatars/avatar_igzBsWloJeaegzm9bQltZ?_a=BAMAMiiu0',
      },
      {
        id: 'SovcU_tbi',
        name: 'Robert Monnet',
        image: 'https://avatars.githubusercontent.com/u/1057667?v=4',
      },
    ],
  },
  {
    id: 'jpC9PqWrO',
    title: 'How to compile JavaScript into a single executable',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/d8b3360ff6f26d58bf455d67a4356420?_a=AQAEuop',
    readTime: 16,
    createdAt: '2026-10-11T12:28:22.294Z',
    numUpvotes: 46,
    numComments: 6,
    tags: ['javascript', 'nodejs', 'deno', 'bun'],
    commentsPermalink:
      'https://daily.dev/posts/how-to-compile-javascript-into-a-single-executable-jpc9pqwro',
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
        id: 'XFP08dZHhCriuIokH2v8p',
        name: 'Bob',
        image: 'https://avatars.githubusercontent.com/u/193962566?v=4',
      },
      {
        id: 'ggKXYH3f5vDHfndO78rSv',
        name: 'Thiago Bezerra',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocJdb2sdpZCznr6W_9whpU8OnlCCHiyRvvoiwqk4YLEOrJl6hJGY=s96-c',
      },
      {
        id: '5JQKu6dhQzhVIEDf0VjuZ',
        name: 'Anders Persson',
        image: 'https://avatars.githubusercontent.com/u/1372776?v=4',
      },
    ],
    upvoters: [
      {
        id: 'mqfKCsoz6wzxboIN4s5vw',
        name: 'Christopher Trevor',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocLuM4S7o_Y24vA9OmHxgLpQZmxSasAP6RVNsHN9lCRDjbyACg=s96-c',
      },
      {
        id: 'SPUVKXKcH63p80LywZo5u',
        name: 'mathie',
        image:
          'https://media.daily.dev/image/upload/s--WIvP96xo--/f_auto/v1741308849/avatars/avatar_SPUVKXKcH63p80LywZo5u',
      },
      {
        id: 'yTSigDH66EZP3kM3aBb1G',
        name: 'KC',
        image: 'https://avatars.githubusercontent.com/u/46585072?v=4',
      },
      {
        id: 'A9x1bZJWBIwfKx7QV12ve',
        name: 'Amine Bezzarga',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocJFUC4LVv2JKGQIhdUfq-Nhl8ziFV8KEzRLu_JszAmdtPT1Znw=s96-c',
      },
    ],
  },
  {
    id: 'k0pYA6Bws',
    title: 'Bootstrap 6 Alpha',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/f92ffd8f506843bd90b6e5fe51ea696b?_a=AQAEuop',
    readTime: 12,
    createdAt: '2026-10-08T17:30:03.360Z',
    numUpvotes: 45,
    numComments: 4,
    tags: ['javascript', 'css', 'bootstrap-css'],
    commentsPermalink: 'https://daily.dev/posts/bootstrap-6-alpha-k0pya6bws',
    type: 'article',
    source: {
      id: 'bootstrap',
      handle: 'bootstrap',
      name: 'Bootstrap',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/ea4f1ba8a2d6493e853e77a6002c9c00',
    },
    commenters: [
      {
        id: 'FyEVGEmDCT4SHW9lRWP1G',
        name: 'Francesco Selva',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocIpqD53L1hQKWDfCVp2Ism-fJxG-bPsCDBdtXDvbOINuMjP0oke=s96-c',
      },
      {
        id: 'CZNTZyFhNT1z41YdVpGMW',
        name: 'Trung Hieu Ngo',
        image:
          'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
      },
      {
        id: 'U3o_tgSQ2',
        name: 'Apperside',
        image: 'https://avatars.githubusercontent.com/u/5955338?v=4',
      },
    ],
    upvoters: [
      {
        id: 'FC1daD4O6BqnJgqXnyzTi',
        name: 'Nam Doan',
        image:
          'https://media.daily.dev/image/upload/s--bEpISWPc--/f_auto/v1757479411/avatars/avatar_FC1daD4O6BqnJgqXnyzTi?_a=BAMClqZW0',
      },
      {
        id: 'u8pWUrjd6zt5Fpmk6SCvl',
        name: 'Peter Møller Skjødt',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocKuO1fTflDc31XfZf0WyLs78zg8WzyQXaDIVZJsHzvruOfoe2xZ=s96-c',
      },
      {
        id: 'XgRt9jya3bbNspe5VEn3T',
        name: 'Abdirahman Mohamoud',
        image:
          'https://media.daily.dev/image/upload/s--X78MWNYX--/f_auto/v1716196774/avatars/avatar_XgRt9jya3bbNspe5VEn3T',
      },
      {
        id: 'xjsmdeuF06OFUNqyxwzkO',
        name: 'Manuel Mercy',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocKZig95tsOlN7_zP-Y74ONwtcSRff9wKermcjoKwFsKkPF_pw=s96-c',
      },
    ],
  },
  {
    id: 'sA0ThbCRM',
    title: 'JavaScript Event Loop Explained: Queue Tracing and Debugging Guide',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/f1b924a2feb217c0c92e9f117b10cfab?_a=AQAEuop',
    readTime: 16,
    createdAt: '2026-10-09T16:38:06.765Z',
    numUpvotes: 103,
    numComments: 3,
    tags: ['javascript', 'nodejs'],
    commentsPermalink:
      'https://daily.dev/posts/javascript-event-loop-explained-queue-tracing-and-debugging-guide-sa0thbcrm',
    type: 'article',
    source: {
      id: 'sitepoint',
      handle: 'sitepoint',
      name: 'SitePoint',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/sitepoint',
    },
    commenters: [
      {
        id: 'orjMeK8QKaaVZwGq7ScPz',
        name: 'PDFops',
        image:
          'https://media.daily.dev/image/upload/s---8isRBKc--/f_auto/v1782922291/avatars/avatar_orjMeK8QKaaVZwGq7ScPz?_a=BAMAMicg0',
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
        id: 'VbgS5cv6HJ67Qk9BtR3Ea',
        name: 'Nethra Pawani',
        image:
          'https://media.daily.dev/image/upload/s--nZjCk_ZL--/f_auto,pg_1/v1791970829/avatars/avatar_VbgS5cv6HJ67Qk9BtR3Ea?_a=BAMAMicg0',
      },
      {
        id: 'cd6de26aeb424e4e966d4af61eee2df6',
        name: 'Javi Felices',
        image:
          'https://media.daily.dev/image/upload/f_auto/v1641199491/avatars/cd6de26aeb424e4e966d4af61eee2df6',
      },
      {
        id: 'LRrxZE0XW45CWY5ENcmcm',
        name: 'krunal dhimmar',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocLibFizZf6R9SdBl-zTGV_4iKTbC09iQdCfXeq8LyUbTVDaKz4=s96-c',
      },
      {
        id: 'FC1daD4O6BqnJgqXnyzTi',
        name: 'Nam Doan',
        image:
          'https://media.daily.dev/image/upload/s--bEpISWPc--/f_auto/v1757479411/avatars/avatar_FC1daD4O6BqnJgqXnyzTi?_a=BAMClqZW0',
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
    id: 'TUq9ljtcA',
    title: 'A sustainable web career, for when all this blows over',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/e64ad59af32fda8e6045bc114ac9ae3a?_a=AQAEuop',
    readTime: 5,
    createdAt: '2026-10-06T21:34:49.803Z',
    numUpvotes: 15,
    numComments: 6,
    tags: ['webdev', 'react', 'career', 'css', 'accessibility'],
    commentsPermalink:
      'https://daily.dev/posts/a-sustainable-web-career-for-when-all-this-blows-over-tuq9ljtca',
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
        id: 'bK85rJb2OXXID2LX2wi5y',
        name: 'Elmar Chavez',
        image:
          'https://media.daily.dev/image/upload/s--7PjH979T--/f_auto/v1780994221/avatars/avatar_bK85rJb2OXXID2LX2wi5y?_a=BAMAMiWQ0',
      },
      {
        id: 'pXCCaI9zdqwDXJF1InAIZ',
        name: 'Brennan Goewert',
        image: 'https://avatars.githubusercontent.com/u/15313658?v=4',
      },
      {
        id: 'pJIPLKWwvFMjdI6W0lO7R',
        name: 'João Sequeira',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocJSsWgdop9CwU-loqiS6bQbABUDT8sHZCJ8zkLInAT7LgSGITw-=s96-c',
      },
    ],
    upvoters: [
      {
        id: '8Bx6g7JeDpX7rkkz1BfJJ',
        name: 'Adrian Thomas',
        image: 'https://avatars.githubusercontent.com/u/3031275?v=4',
      },
      {
        id: '0fMQQvxSIIVibBvP847Xo',
        name: 'JP de la Torre',
        image:
          'https://media.daily.dev/image/upload/s--vMLSF3-1--/f_auto/v1787723050/avatars/avatar_0fMQQvxSIIVibBvP847Xo?_a=BAMAMicg0',
      },
      {
        id: 'yTSigDH66EZP3kM3aBb1G',
        name: 'KC',
        image: 'https://avatars.githubusercontent.com/u/46585072?v=4',
      },
      {
        id: '8Bhfj3hAmrPU6dvsgG9x7',
        name: 'Harsha Lakshan Jayathissa',
        image: 'https://avatars.githubusercontent.com/u/112598753?v=4',
      },
    ],
  },
  {
    id: 'fN3znnQ8d',
    title: 'Master Modern React Routing: TanStack Router Crash Course',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/6ad71621a248e697a8e3725f5b1f0417?_a=AQAEuop',
    readTime: 2,
    createdAt: '2026-10-08T19:14:09.153Z',
    numUpvotes: 28,
    numComments: 3,
    tags: ['react', 'typescript', 'zod'],
    commentsPermalink:
      'https://daily.dev/posts/master-modern-react-routing-tanstack-router-crash-course-fn3znnq8d',
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
        id: 'VqsDuiiXz6AnTS1eKLMWz',
        name: 'Khishamuddin Syed',
        image:
          'https://media.daily.dev/image/upload/s--xXLX9Wi9--/f_auto/v1777551874/avatars/avatar_VqsDuiiXz6AnTS1eKLMWz?_a=BAMAMiWQ0',
      },
      {
        id: 'igzBsWloJeaegzm9bQltZ',
        name: 'AllInOneTools',
        image:
          'https://media.daily.dev/image/upload/s--4ZT8QlF0--/f_auto/v1769790028/avatars/avatar_igzBsWloJeaegzm9bQltZ?_a=BAMAMiiu0',
      },
      {
        id: 'orjMeK8QKaaVZwGq7ScPz',
        name: 'PDFops',
        image:
          'https://media.daily.dev/image/upload/s---8isRBKc--/f_auto/v1782922291/avatars/avatar_orjMeK8QKaaVZwGq7ScPz?_a=BAMAMicg0',
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
        id: 'pgMLYABIXJ1QTcedMv7g8',
        name: 'Damian',
        image: 'https://avatars.githubusercontent.com/u/26597444?v=4',
      },
      {
        id: 'yJRWN3rnD6J88D8Vwibte',
        name: 'MichaelHo',
        image: 'https://avatars.githubusercontent.com/u/18046164?v=4',
      },
      {
        id: 'sfTGc9hlE',
        name: 'Chuks Nwaneri',
        image:
          'https://lh3.googleusercontent.com/a-/AOh14GjW5C82Xy7ivGeSwbcTJaBZHIzchWWmAYYFZC3Lvw=s100',
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
    numUpvotes: 18,
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
      {
        id: '3z3vjxeh4PsZpA0YLdYAB',
        name: 'kris gu',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocJnnwFKNx7PJNhb7W6mFWr2k2SV_VHW_9ainY71DX_dv79frQ=s96-c',
      },
    ],
  },
  {
    id: 'jMjeCGE3O',
    title: 'Architecting for uncertainty - part 3: GenAI as an amplifier',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/e5fe1e89138e72ac1a13585ee04b9d4e?_a=AQAEuop',
    readTime: 2,
    createdAt: '2026-10-07T15:12:06.492Z',
    numUpvotes: 18,
    numComments: 1,
    tags: ['devops', 'architecture', 'microservices'],
    commentsPermalink:
      'https://daily.dev/posts/architecting-for-uncertainty---part-3-genai-as-an-amplifier-jmjecge3o',
    type: 'article',
    source: {
      id: 'microservicesio',
      handle: 'microservicesio',
      name: 'Microservices.io',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/7a511879d50f43698644bcf07f4d0a59',
    },
    commenters: [
      {
        id: '774zDwMaRTNS1fv5OKStX',
        name: 'DiyWeb',
        image:
          'https://media.daily.dev/image/upload/s--dgS6jDeN--/f_auto/v1790879420/avatars/avatar_774zDwMaRTNS1fv5OKStX?_a=BAMAMicg0',
      },
    ],
    upvoters: [
      {
        id: 'RoPFkPSSM5mSmcRAewuxk',
        name: 'Facundo Lozano',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocIFzIsgCx0OuXqgYMjEk0ruyVCUu1-B3RiOtHKmQ5zbN-k-vw=s96-c',
      },
      {
        id: 'X2IkraOGSjpjDzQSlPT9r',
        name: 'Steve Clarke',
        image:
          'https://media.daily.dev/image/upload/s--4SiyqKlB--/f_auto,q_auto/v1/avatars/avatar_X2IkraOGSjpjDzQSlPT9r',
      },
      {
        id: '9CvgA5KhCupJSKVuwuZpM',
        name: 'Alex Grant',
        image: 'https://avatars.githubusercontent.com/u/2454740?v=4',
      },
      {
        id: '159R1BIL3rjTWmoctdeE9',
        name: 'Lâm Anh',
        image:
          'https://lh3.googleusercontent.com/a-/AOh14GiB1N-iPoGydIUvYO7y6kXZ8oVv_1uPGeS-VPEsQw=s100',
      },
    ],
  },
  {
    id: 'RAK846VKC',
    title: 'Foresight AI Brings Gremlin Agents to Reliability Engineering',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/3f4be49aa25637a36a4df562b6a65973?_a=AQAEuop',
    readTime: 5,
    createdAt: '2026-10-11T09:08:27.907Z',
    numUpvotes: 1,
    numComments: 1,
    tags: ['devops', 'agentic-ai'],
    commentsPermalink:
      'https://daily.dev/posts/foresight-ai-brings-gremlin-agents-to-reliability-engineering-rak846vkc',
    type: 'article',
    source: {
      id: 'infoq',
      handle: 'infoq',
      name: 'InfoQ',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/afc3bced3e1e4b188dd9127017a60e0c',
    },
    commenters: [
      {
        id: 'MF1TfC05be7tWHwCu1Rwr',
        name: 'Ahmet Özel',
        image: 'https://avatars.githubusercontent.com/u/70992231?v=4',
      },
    ],
    upvoters: [
      {
        id: 'MF1TfC05be7tWHwCu1Rwr',
        name: 'Ahmet Özel',
        image: 'https://avatars.githubusercontent.com/u/70992231?v=4',
      },
    ],
  },
  {
    id: 'EGqmEJX0r',
    title: 'Build a multi-tenant platform with OpenShift Dev Spaces',
    image:
      'https://media.daily.dev/image/upload/s--CxzD6vbw--/f_auto/v1722860399/public/Placeholder%2005',
    readTime: 11,
    createdAt: '2026-10-09T13:20:40.984Z',
    numUpvotes: 1,
    numComments: 1,
    tags: ['devops', 'kubernetes', 'openshift', 'multi-tenancy'],
    commentsPermalink:
      'https://daily.dev/posts/build-a-multi-tenant-platform-with-openshift-dev-spaces-egqmejx0r',
    type: 'article',
    source: {
      id: 'rhdev',
      handle: 'rhdev',
      name: 'Red Hat Developer',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/2a8895f3216c4900bdc455585a4ad3e4',
    },
    commenters: [
      {
        id: '3RIxldxMFpzm5fIHIGMl5',
        name: 'Andromeda',
        image:
          'https://media.daily.dev/image/upload/s--FczMGWTg--/f_auto/v1791677381/avatars/avatar_3RIxldxMFpzm5fIHIGMl5?_a=BAMAMicg0',
      },
    ],
    upvoters: [
      {
        id: '3RIxldxMFpzm5fIHIGMl5',
        name: 'Andromeda',
        image:
          'https://media.daily.dev/image/upload/s--FczMGWTg--/f_auto/v1791677381/avatars/avatar_3RIxldxMFpzm5fIHIGMl5?_a=BAMAMicg0',
      },
    ],
  },
  {
    id: 'mR3rTIM1A',
    title: "Software engineers don't get to be Luddites about AI",
    image:
      'https://media.daily.dev/image/upload/s--OHB84bZF--/f_auto/v1722860399/public/Placeholder%2010',
    readTime: 6,
    createdAt: '2026-10-12T08:17:33.594Z',
    numUpvotes: 14,
    numComments: 16,
    tags: ['ai', 'automation'],
    commentsPermalink:
      'https://daily.dev/posts/software-engineers-don-t-get-to-be-luddites-about-ai-mr3rtim1a',
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
        id: 'ytCVp6dQicn9P0yKfhQCI',
        name: 'GenXdev',
        image:
          'https://media.daily.dev/image/upload/s--PrWOWtSq--/f_auto/v1789486214/avatars/avatar_ytCVp6dQicn9P0yKfhQCI?_a=BAMAMicg0',
      },
      {
        id: 'Y1klcvmY0LiikjVFthCLU',
        name: 'Phlisg',
        image:
          'https://media.daily.dev/image/upload/s--FN_ynnjb--/f_auto/v1755006303/avatars/avatar_Y1klcvmY0LiikjVFthCLU?_a=BAMClqZW0',
      },
      {
        id: 'Uj2ZNz2tvzAHqSrgAyAgg',
        name: 'Theo',
        image:
          'https://media.daily.dev/image/upload/s--8zddjPKb--/f_auto/v1786637578/avatars/avatar_Uj2ZNz2tvzAHqSrgAyAgg?_a=BAMAMicg0',
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
        id: 'U9YNpHvqD7jM3IxMsDTsP',
        name: 'Phat Dang Minh',
        image:
          'https://media.daily.dev/image/upload/s--uEe-dzLM--/f_auto/v1747452091/avatars/avatar_U9YNpHvqD7jM3IxMsDTsP?_a=BAMClqUq0',
      },
      {
        id: 'TvTVeiMdkRCqWUDullFmy',
        name: 'kartik-nvjk',
        image:
          'https://media.daily.dev/image/upload/s--3gGgsVCw--/f_auto/v1781456774/avatars/avatar_TvTVeiMdkRCqWUDullFmy?_a=BAMAMiWQ0',
      },
      {
        id: 'eD9aIYv7SUPZPXF3tNM2G',
        name: 'Fatih Karakuş',
        image: 'https://avatars.githubusercontent.com/u/111702120?v=4',
      },
    ],
  },
  {
    id: 'tM1ZzpHmx',
    title: "Tech Is Brutal Right Now. Stay or Go? Let's Think Clearly.",
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/4cbc08f0665abef2c805728fc1bc1e29?_a=AQAEuop',
    readTime: 11,
    createdAt: '2026-10-11T21:04:23.836Z',
    numUpvotes: 49,
    numComments: 9,
    tags: ['ai', 'career'],
    commentsPermalink:
      'https://daily.dev/posts/tech-is-brutal-right-now-stay-or-go-let-s-think-clearly--tm1zzphmx',
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
        id: 'qdg8lkTn1Vn3IvpHhCUn1',
        name: 'Josef',
        image:
          'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
      },
      {
        id: 'xbQ-tHbbo',
        name: 'Rizwanul Islam Rudra',
        image:
          'https://media.daily.dev/image/upload/s--BaXM-_5z--/f_auto/v1734625319/avatars/avatar_xbQ-tHbbo',
      },
      {
        id: 'BV6UqgfRiYxBqhopR2ZYs',
        name: 'Cristian C',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocIHDjfvRf4004qYyQV-8Z9JI_VGvKgZXAPta-Su6fKS3dDFIg=s96-c',
      },
    ],
    upvoters: [
      {
        id: 'XgRt9jya3bbNspe5VEn3T',
        name: 'Abdirahman Mohamoud',
        image:
          'https://media.daily.dev/image/upload/s--X78MWNYX--/f_auto/v1716196774/avatars/avatar_XgRt9jya3bbNspe5VEn3T',
      },
      {
        id: 'm5NACr2d5UIbsFZ28xv4d',
        name: 'Henrique Krupck',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocLnUcW-OntHBIXiJ-ZWP3e1Bk5bSHhBuR605AjWuBC4Nao=s96-c',
      },
      {
        id: 'A9xh33q0QoxtkGoJRCosp',
        name: 'Peter Cruckshank',
        image:
          'https://media.daily.dev/image/upload/s--ZJhQyKws--/f_auto/v1721235024/avatars/avatar_A9xh33q0QoxtkGoJRCosp',
      },
      {
        id: '7BlkdVN89a93IW66v7dzN',
        name: 'ehsan Fouladi',
        image:
          'https://lh3.googleusercontent.com/a/AGNmyxYblOiAWr20n8pqWAD0wdzHhShPGf4NYm8C1TeB=s96-c',
      },
    ],
  },
  {
    id: '7lzAMByra',
    title: 'AI tutorials and articles',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/91ce8a67f898f5daae315f69dab07536?_a=AQAEuop',
    readTime: 4,
    createdAt: '2026-10-13T07:23:35.998Z',
    numUpvotes: 27,
    numComments: 1,
    tags: ['ai', 'llm', 'ai-agents', 'mcp'],
    commentsPermalink:
      'https://daily.dev/posts/ai-tutorials-and-articles-7lzambyra',
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
    ],
    upvoters: [
      {
        id: '4v27XejZbqlnkTpgNrwdP',
        name: 'Alper Akyol',
        image: 'https://avatars.githubusercontent.com/u/3973851?v=4',
      },
      {
        id: 'qblYVqG0IST6jGXxfTKYj',
        name: 'Nguyễn Tiến Hiếu',
        image: 'https://avatars.githubusercontent.com/u/128887298?v=4',
      },
      {
        id: 'eNloWgOzBHFne9kyg9l5b',
        name: 'amico amico',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocIefoo600GyCehZ8jaSH-1-Y5Ofu_TiQRcoc_P6WvvOgX2bUQ=s96-c',
      },
      {
        id: 'OX9DwYYjsWl2svbKLJHWQ',
        name: 'Sakisg',
        image:
          'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
      },
    ],
  },
  {
    id: 'xgQ0fDQUs',
    title:
      'Does Your LLM Know the Boundary? I Left the Doors Open and 6 of 10 AI Agents Crowned Themselves',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/11995185e563c707148cc73472981ce0?_a=AQAEuop',
    readTime: 27,
    createdAt: '2026-10-12T14:38:06.600Z',
    numUpvotes: 6,
    numComments: 1,
    tags: ['ai', 'llm', 'ai-agents', 'ai-safety'],
    commentsPermalink:
      'https://daily.dev/posts/does-your-llm-know-the-boundary-i-left-the-doors-open-and-6-of-10-ai-agents-crowned-themselves-xgq0fdqus',
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
        id: 'TvTVeiMdkRCqWUDullFmy',
        name: 'kartik-nvjk',
        image:
          'https://media.daily.dev/image/upload/s--3gGgsVCw--/f_auto/v1781456774/avatars/avatar_TvTVeiMdkRCqWUDullFmy?_a=BAMAMiWQ0',
      },
    ],
    upvoters: [
      {
        id: 'YLVaNEoaSlU0cLrDpGLp4',
        name: 'Jorge Anthony Sanchez Chavez',
        image: 'https://avatars.githubusercontent.com/u/105340471?v=4',
      },
      {
        id: 'P4xs6zq3lSVWvBZdTmYLI',
        name: 'elias-devv',
        image: 'https://avatars.githubusercontent.com/u/338986921?v=4',
      },
      {
        id: 'TvTVeiMdkRCqWUDullFmy',
        name: 'kartik-nvjk',
        image:
          'https://media.daily.dev/image/upload/s--3gGgsVCw--/f_auto/v1781456774/avatars/avatar_TvTVeiMdkRCqWUDullFmy?_a=BAMAMiWQ0',
      },
      {
        id: 'MMijGiqFSGEsk0QPlm7Io',
        name: 'Miguel',
        image: 'https://avatars.githubusercontent.com/u/44272798?v=4',
      },
    ],
  },
  {
    id: 'rGSOrJs7s',
    title: "I guess I'm using WebP now?",
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/80d322685c95d5030b08e9255f4a19e3?_a=AQAEuop',
    readTime: 3,
    createdAt: '2026-10-11T21:45:09.553Z',
    numUpvotes: 12,
    numComments: 8,
    tags: ['webdev'],
    commentsPermalink:
      'https://daily.dev/posts/i-guess-i-m-using-webp-now--rgsorjs7s',
    type: 'article',
    source: {
      id: 'hn',
      handle: 'hn',
      name: 'Hacker News',
      image: 'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/hn',
    },
    commenters: [
      {
        id: '774zDwMaRTNS1fv5OKStX',
        name: 'DiyWeb',
        image:
          'https://media.daily.dev/image/upload/s--dgS6jDeN--/f_auto/v1790879420/avatars/avatar_774zDwMaRTNS1fv5OKStX?_a=BAMAMicg0',
      },
      {
        id: 'j0aX3yy9bDkDJDShHMXar',
        name: 'Yair Even Or',
        image: 'https://avatars.githubusercontent.com/u/845031?v=4',
      },
      {
        id: 'kq6KqvzDMonRhgV6gOsK6',
        name: 'Mateo Suarez',
        image: 'https://avatars.githubusercontent.com/u/90749080?v=4',
      },
    ],
    upvoters: [
      {
        id: 'orjMeK8QKaaVZwGq7ScPz',
        name: 'PDFops',
        image:
          'https://media.daily.dev/image/upload/s---8isRBKc--/f_auto/v1782922291/avatars/avatar_orjMeK8QKaaVZwGq7ScPz?_a=BAMAMicg0',
      },
      {
        id: 'qkbbX2PUMDxnZM9hWk4eq',
        name: 'Satish Kumar',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocJMjSAhl-2CWGe666YP7kaF773zikVZhkYbQ4lEn9MUShRPTQ=s96-c',
      },
      {
        id: 'oo44CSl4tGr7Zr8RbwPo6',
        name: 'Melih',
        image:
          'https://media.daily.dev/image/upload/s--MN_ZtaXb--/f_auto/v1769526022/avatars/avatar_oo44CSl4tGr7Zr8RbwPo6?_a=BAMAMiiu0',
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
    id: 'pE6x5bZ9l',
    title: 'Chrome for Developers',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/110a168d67fe1e127392db8c53145875?_a=AQAEuop',
    readTime: 3,
    createdAt: '2026-10-12T15:45:12.309Z',
    numUpvotes: 13,
    numComments: 3,
    tags: ['webdev', 'css', 'google-chrome', 'accessibility'],
    commentsPermalink:
      'https://daily.dev/posts/chrome-for-developers-pe6x5bz9l',
    type: 'article',
    source: {
      id: 'chrome',
      handle: 'chrome',
      name: 'Chrome Developers',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/e9b306fd1b484113b937dae36b867f37',
    },
    commenters: [
      {
        id: 'LJSkpBexOSCWc8INyu3Eu',
        name: 'Ante Barić',
        image:
          'https://media.daily.dev/image/upload/v1679300599/avatars/avatar_LJSkpBexOSCWc8INyu3Eu.jpg',
      },
      {
        id: 'igzBsWloJeaegzm9bQltZ',
        name: 'AllInOneTools',
        image:
          'https://media.daily.dev/image/upload/s--4ZT8QlF0--/f_auto/v1769790028/avatars/avatar_igzBsWloJeaegzm9bQltZ?_a=BAMAMiiu0',
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
        id: 'Aa0f0ajamxStQVNrHYWZr',
        name: 'Hardik',
        image:
          'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
      },
      {
        id: 'adxem2FShFNBV1EBxjQ14',
        name: 'Catalin Onofrei',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocL25PW4mawQ_vdtenQ1o7qRRbxhBzVD74TY_mOLCb_b4yuudatJ=s96-c',
      },
      {
        id: 'b1wqVj2BbFpcE5vE4srQYajJM7eiFeWs',
        name: 'Thiago S.M.',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocIiQt-zBQq5c0kdKSniNOyX6yCakefuicKbDFjLiBlC2PXPHHGL2Q=s96-c',
      },
      {
        id: 'e5oG8qIgL7O3a9TBFXqpQ',
        name: 'Mariusz Witkowski',
        image:
          'https://media.daily.dev/image/upload/s--tLgnlhOv--/f_auto,q_auto/v1696271467/avatars/avatar_e5oG8qIgL7O3a9TBFXqpQ',
      },
    ],
  },
  {
    id: 'd5JYRFE1s',
    title:
      'How we made a 9 MB WebAssembly module feel faster without removing a single byte',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/ce33cba714deeee532e9848ff5bed957?_a=AQAEuop',
    readTime: 13,
    createdAt: '2026-10-08T16:05:24.160Z',
    numUpvotes: 11,
    numComments: 1,
    tags: ['webdev', 'react', 'frontend', 'nextjs', 'webassembly'],
    commentsPermalink:
      'https://daily.dev/posts/how-we-made-a-9-mb-webassembly-module-feel-faster-without-removing-a-single-byte-d5jyrfe1s',
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
        id: '774zDwMaRTNS1fv5OKStX',
        name: 'DiyWeb',
        image:
          'https://media.daily.dev/image/upload/s--dgS6jDeN--/f_auto/v1790879420/avatars/avatar_774zDwMaRTNS1fv5OKStX?_a=BAMAMicg0',
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
        id: '0fMQQvxSIIVibBvP847Xo',
        name: 'JP de la Torre',
        image:
          'https://media.daily.dev/image/upload/s--vMLSF3-1--/f_auto/v1787723050/avatars/avatar_0fMQQvxSIIVibBvP847Xo?_a=BAMAMicg0',
      },
      {
        id: 'aHFko46ceQaMt0IUzls8S',
        name: 'Wildan Nursyamsi',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocKGPMl_n8R19SyKKCCK5bPIK-o62UwhFGzoW90694KD9v3-QTU=s96-c',
      },
      {
        id: '6YVEE3gffSznzfrxWnMlM',
        name: 'Eby Hanson',
        image: 'https://avatars.githubusercontent.com/u/165880969?v=4',
      },
    ],
  },
  {
    id: 'nI9mOwmjF',
    title:
      'React 19.3: Adds a browser() API, Giving Client-Only Rendering a First-Class Name',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/310904dcbd714e7535a223315bb3b855?_a=AQAEuop',
    readTime: 3,
    createdAt: '2026-10-12T11:02:24.522Z',
    numUpvotes: 3,
    numComments: 1,
    tags: ['webdev', 'javascript', 'react', 'nextjs'],
    commentsPermalink:
      'https://daily.dev/posts/react-19-3-adds-a-browser-api-giving-client-only-rendering-a-first-class-name-ni9mowmjf',
    type: 'article',
    source: {
      id: 'infoq',
      handle: 'infoq',
      name: 'InfoQ',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/afc3bced3e1e4b188dd9127017a60e0c',
    },
    commenters: [
      {
        id: '774zDwMaRTNS1fv5OKStX',
        name: 'DiyWeb',
        image:
          'https://media.daily.dev/image/upload/s--dgS6jDeN--/f_auto/v1790879420/avatars/avatar_774zDwMaRTNS1fv5OKStX?_a=BAMAMicg0',
      },
    ],
    upvoters: [
      {
        id: 'GHhQOKWM6bPsX3rXmg9LM',
        name: 'Arif Aydın',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocKHuL8iQ0B8li3oh3l6d7ejiCqMFekVsW_kaPKCrvCUUCtWXw=s96-c',
      },
      {
        id: '7BlkdVN89a93IW66v7dzN',
        name: 'ehsan Fouladi',
        image:
          'https://lh3.googleusercontent.com/a/AGNmyxYblOiAWr20n8pqWAD0wdzHhShPGf4NYm8C1TeB=s96-c',
      },
      {
        id: 'SbxIjqVQyGfD5MDTDoY0x',
        name: 'Vel Kumar Mosuri',
        image:
          'https://lh3.googleusercontent.com/a-/AFdZucoCphBTEEfqMoWQBSK37g1wDvENSI2-H2gm2ySHqg=s100',
      },
    ],
  },
  {
    id: 'B6vjNokGa',
    title: 'Qt for Python Release: 6.12 is here!',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/5a41c8a93fe5424441c97159ad348e39?_a=AQAEuop',
    readTime: 9,
    createdAt: '2026-10-09T04:02:00.384Z',
    numUpvotes: 2,
    numComments: 1,
    tags: ['python', 'ios', 'appsec', 'qml'],
    commentsPermalink:
      'https://daily.dev/posts/qt-for-python-release-6-12-is-here--b6vjnokga',
    type: 'article',
    source: {
      id: 'qt',
      handle: 'qt',
      name: 'Qt',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/fe6d7c1f4f824966befd58ee13f9de40',
    },
    commenters: [
      {
        id: 'MF1TfC05be7tWHwCu1Rwr',
        name: 'Ahmet Özel',
        image: 'https://avatars.githubusercontent.com/u/70992231?v=4',
      },
    ],
    upvoters: [
      {
        id: 'ZOQxM6hUdwIiTbvKj38Zb',
        name: 'Riana Santatra',
        image:
          'https://media.daily.dev/image/upload/s--bgQ0MEw9--/f_auto/v1757954541/avatars/avatar_ZOQxM6hUdwIiTbvKj38Zb?_a=BAMClqZW0',
      },
      {
        id: 'MF1TfC05be7tWHwCu1Rwr',
        name: 'Ahmet Özel',
        image: 'https://avatars.githubusercontent.com/u/70992231?v=4',
      },
    ],
  },
  {
    id: 'NyXjJiEhS',
    title:
      'This Rust File Manager Was Designed for Omarchy, but Arch Users Can Run it Too',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/c6c43ead84355f3a05e335a2a979e631?_a=AQAEuop',
    readTime: 3,
    createdAt: '2026-10-14T05:06:59.875Z',
    numUpvotes: 31,
    numComments: 4,
    tags: ['linux', 'rust'],
    commentsPermalink:
      'https://daily.dev/posts/this-rust-file-manager-was-designed-for-omarchy-but-arch-users-can-run-it-too-nyxjjiehs',
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
        id: 'orjMeK8QKaaVZwGq7ScPz',
        name: 'PDFops',
        image:
          'https://media.daily.dev/image/upload/s---8isRBKc--/f_auto/v1782922291/avatars/avatar_orjMeK8QKaaVZwGq7ScPz?_a=BAMAMicg0',
      },
      {
        id: 'XFP08dZHhCriuIokH2v8p',
        name: 'Bob',
        image: 'https://avatars.githubusercontent.com/u/193962566?v=4',
      },
    ],
    upvoters: [
      {
        id: 'HFw9XQ2UEQgy9aO1sr2WC',
        name: 'Surenuah',
        image: 'https://avatars.githubusercontent.com/u/78839422?v=4',
      },
      {
        id: 'WGxMVU157d1bEq6RnCTIe',
        name: 'Hunor Dóri',
        image:
          'https://media.daily.dev/image/upload/s--ej_ecZnp--/f_auto/v1766332232/avatars/avatar_WGxMVU157d1bEq6RnCTIe?_a=BAMAK+ZW0',
      },
      {
        id: 'lmZgRNtUuJKWgmqgXgIay',
        name: 'Wai Yan',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocIw-uYVNFAjl79lwK1OYdwkwFes4FXVHh94nhhUH_ix9C8SwYKd=s96-c',
      },
      {
        id: '7VWglUEgjPl5q8dJpLB3O',
        name: 'IDK',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocKk3jc2JBs1OroWC6hqPeqYbeIHJmfIS8TJVCc64Z1iMfWadg=s96-c',
      },
    ],
  },
  {
    id: 'RO9ckv6fD',
    title: 'Is PHP a Rusty language?',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/416d9b9e7503f2f05cde8986317297db?_a=AQAEuop',
    readTime: 6,
    createdAt: '2026-10-12T00:53:35.779Z',
    numUpvotes: 13,
    numComments: 2,
    tags: ['golang', 'php', 'rust'],
    commentsPermalink:
      'https://daily.dev/posts/is-php-a-rusty-language--ro9ckv6fd',
    type: 'article',
    source: {
      id: 'tomasvotruba',
      handle: 'tomasvotruba',
      name: 'Tomas Votruba',
      image:
        'https://media.daily.dev/image/upload/s--S3GKbTXH--/f_auto/v1723183142/logos/tomasvotruba',
    },
    commenters: [
      {
        id: 'orjMeK8QKaaVZwGq7ScPz',
        name: 'PDFops',
        image:
          'https://media.daily.dev/image/upload/s---8isRBKc--/f_auto/v1782922291/avatars/avatar_orjMeK8QKaaVZwGq7ScPz?_a=BAMAMicg0',
      },
      {
        id: 'g2TlLlQ46Qd7I74kc7GWL',
        name: 'lucy-reeves',
        image: 'https://avatars.githubusercontent.com/u/341298108?v=4',
      },
    ],
    upvoters: [
      {
        id: '7eQFeSQRDx0muV3n92gxT',
        name: 'Kahlil Wallace',
        image:
          'https://media.daily.dev/image/upload/s--QvppE9Ip--/f_auto/v1767378558/avatars/avatar_7eQFeSQRDx0muV3n92gxT?_a=BAMAK+ZW0',
      },
      {
        id: 'LTh2hM0ZYHl75x6ingwgY',
        name: 'Radek Havelka',
        image:
          'https://lh3.googleusercontent.com/a-/ACNPEu-o8MElSN4ROMgrqyjqrarlLqksiGLna5TAfYA1Jw=s100',
      },
      {
        id: 'e75HVslVXlBWCp6PPGhsz',
        name: 'João Barreto',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocKrCzbRtTjTfPwKaafd0DBv8eKORJdbkDom-wsPJaO419TQjHV7=s96-c',
      },
      {
        id: 'g2TlLlQ46Qd7I74kc7GWL',
        name: 'lucy-reeves',
        image: 'https://avatars.githubusercontent.com/u/341298108?v=4',
      },
    ],
  },
  {
    id: 'UFbRQrItf',
    title: 'Show HN: Spotatui, a Spotify TUI/GUI without web API rate limits',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/f0ae22d1c1bce6f359ad05172d6dc15b?_a=AQAEuop',
    readTime: 36,
    createdAt: '2026-10-14T00:03:54.215Z',
    numUpvotes: 22,
    numComments: 1,
    tags: ['rust', 'cli'],
    commentsPermalink:
      'https://daily.dev/posts/show-hn-spotatui-a-spotify-tui-gui-without-web-api-rate-limits-ufbrqritf',
    type: 'article',
    source: {
      id: 'hn',
      handle: 'hn',
      name: 'Hacker News',
      image: 'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/hn',
    },
    commenters: [
      {
        id: '3z3vjxeh4PsZpA0YLdYAB',
        name: 'kris gu',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocJnnwFKNx7PJNhb7W6mFWr2k2SV_VHW_9ainY71DX_dv79frQ=s96-c',
      },
    ],
    upvoters: [
      {
        id: 'vCVYeh9h4cCzsBSvu21b0',
        name: 'Rajeev R. Sharma',
        image:
          'https://media.daily.dev/image/upload/s--GSwfHept--/f_auto/v1753591600/avatars/avatar_vCVYeh9h4cCzsBSvu21b0?_a=BAMClqZW0',
      },
      {
        id: 'J54Tds4tCXZZYo9fUnnch',
        name: 'Jessica Doering',
        image:
          'https://media.daily.dev/image/upload/s--eHrmTnkb--/f_auto/v1791022089/avatars/avatar_J54Tds4tCXZZYo9fUnnch?_a=BAMAMicg0',
      },
      {
        id: 'O9C9bPfHw3Pk3KYT9nHOh',
        name: 'Pyro',
        image:
          'https://media.daily.dev/image/upload/s--HzlieVms--/f_auto/v1736074648/avatars/avatar_O9C9bPfHw3Pk3KYT9nHOh',
      },
      {
        id: 'SGwQUpBdcB8KeiBxikp6d',
        name: 'Rocky',
        image:
          'https://media.daily.dev/image/upload/s--Lk8rh15a--/f_auto/v1757953631/avatars/avatar_SGwQUpBdcB8KeiBxikp6d?_a=BAMClqZW0',
      },
    ],
  },
  {
    id: 'Hpnnq0zbW',
    title: 'Creusot 0.14.0 release - Contracts for Rust, formally proved',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/96b70ce687d9e05b8ca4d04fa8d7bc00?_a=AQAEuop',
    readTime: 6,
    createdAt: '2026-10-14T13:04:22.916Z',
    numUpvotes: 13,
    numComments: 1,
    tags: ['rust'],
    commentsPermalink:
      'https://daily.dev/posts/creusot-0-14-0-release---contracts-for-rust-formally-proved-hpnnq0zbw',
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
        id: '45xc86vN1W5jVqyJKcIKR',
        name: 'JustBrowsing',
        image:
          'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
      },
    ],
    upvoters: [
      {
        id: 'orjMeK8QKaaVZwGq7ScPz',
        name: 'PDFops',
        image:
          'https://media.daily.dev/image/upload/s---8isRBKc--/f_auto/v1782922291/avatars/avatar_orjMeK8QKaaVZwGq7ScPz?_a=BAMAMicg0',
      },
      {
        id: 'uZouW2zKOoLBrofb3r4FY',
        name: 'Dávid Seres',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocIC5XDb2hdOmgkXuUJCzpj81VkSHDt044oYhCGgDg1UY64S2A=s96-c',
      },
      {
        id: 'VTmo9GVvig5HJ4uoo7YCV',
        name: 'R. Akash Selvaraj',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocKkr6_cJSXfBvRGhKz0t3c_DERYldYlZLnQEvbVjqh0ewYodeA4=s96-c',
      },
      {
        id: 'ok2YpbXjK7FhnZyMycGuy',
        name: 'Piyush',
        image:
          'https://media.daily.dev/image/upload/s--vJulLyGb--/f_auto/v1789127856/avatars/avatar_ok2YpbXjK7FhnZyMycGuy?_a=BAMAMicg0',
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
    id: 'n9c6VDWoz',
    title: 'Turn Your GitHub Contribution Graph Into an ASCII City',
    image:
      'https://media.daily.dev/image/fetch/s--ZadIwfxr--/f_auto,pg_1,q_auto/https://media2.dev.to/dynamic/image/width%3D1200%2Cheight%3D627%2Cfit%3Dcover%2Cgravity%3Dauto/https%253A%252F%252Fdev-to-uploads.s3.us-east-2.amazonaws.com%252Fuploads%252Farticles%252Feulsjeuse6wn9bho0g8d.gif?_a=BAMAMiZY0',
    readTime: 5,
    createdAt: '2026-10-04T14:30:00.407Z',
    numUpvotes: 55,
    numComments: 6,
    tags: ['open-source', 'github', 'golang', 'cli', 'github-actions'],
    commentsPermalink:
      'https://daily.dev/posts/turn-your-github-contribution-graph-into-an-ascii-city-n9c6vdwoz',
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
        id: 'whNNg0ajcmne1B7hPHb0U',
        name: 'Gabriel Stundner',
        image:
          'https://media.daily.dev/image/upload/s--UpSzkOxs--/f_auto/v1753488097/avatars/avatar_whNNg0ajcmne1B7hPHb0U?_a=BAMClqZW0',
      },
      {
        id: 'ScKiWPtqpsvwHAvAS0jvG',
        name: 'TheCookingSenpai',
        image:
          'https://media.daily.dev/image/upload/s--ffrIwc1G--/f_auto/v1757426086/avatars/avatar_ScKiWPtqpsvwHAvAS0jvG?_a=BAMClqZW0',
      },
      {
        id: '7BpZkLtcVFtfH6cuoS4pu',
        name: 'Dwain Botha',
        image:
          'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
      },
    ],
    upvoters: [
      {
        id: 'CtgeFke7NlVU0hBnKP3ND',
        name: 'jessy.co',
        image: 'https://avatars.githubusercontent.com/u/1643234?v=4',
      },
      {
        id: 'yfCcjiz4shk9l1kaXs7m1',
        name: 'Andrea Senni',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocL9zDvgvAHJyMsmnVewPaOwW1fMuVIk0D1besTkxG8tnUmIoQ=s96-c',
      },
      {
        id: 'r9xkni0lG65hTudV6omUh',
        name: 'HexenWind~',
        image: 'https://avatars.githubusercontent.com/u/179055116?v=4',
      },
      {
        id: 'OOu3j4UV9',
        name: 'ido barnea',
        image: 'https://avatars2.githubusercontent.com/u/12647463?v=4',
      },
    ],
  },
  {
    id: '4hJ6BvVyj',
    title: 'Go concurrency distilled',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/6c60dd285108a39ffe9b6a2ccff2c77d?_a=AQAEuop',
    readTime: 35,
    createdAt: '2026-09-26T11:51:41.787Z',
    numUpvotes: 50,
    numComments: 2,
    tags: ['golang'],
    commentsPermalink:
      'https://daily.dev/posts/go-concurrency-distilled-4hj6bvvyj',
    type: 'article',
    source: {
      id: 'antonz',
      handle: 'antonz',
      name: 'Anton Zhiyanov',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/29aa129ca24545f1a698d8a206ccc372',
    },
    commenters: [
      {
        id: 'IxLw7NwMyBlRztBq16ZxN',
        name: 'Shalini Nair',
        image:
          'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
      },
      {
        id: 'H4hCMWaaG4ckYBrbnBh7y',
        name: 'Nahum Litvin',
        image:
          'https://lh3.googleusercontent.com/a-/AOh14GhvJ2y-9R45d5ee78ZdAo8l7J3t4G8fINkx5PEqBfA=s100',
      },
    ],
    upvoters: [
      {
        id: '7eQFeSQRDx0muV3n92gxT',
        name: 'Kahlil Wallace',
        image:
          'https://media.daily.dev/image/upload/s--QvppE9Ip--/f_auto/v1767378558/avatars/avatar_7eQFeSQRDx0muV3n92gxT?_a=BAMAK+ZW0',
      },
      {
        id: 'OYZAHXUcU0Lqeyqj5D9DG',
        name: 'Stefan Dimov',
        image:
          'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
      },
      {
        id: 'PWtFL5wNnLbd3mwIhpg9x',
        name: 'Yerald Sánchez Salazar',
        image: 'https://avatars.githubusercontent.com/u/186856674?v=4',
      },
      {
        id: 'xbTqxyW9xAsqwobCIBJ3R',
        name: 'Wladimir Campos',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocIsZeDwIPJLAB9UorZav-QqvI35f1aFNGiFmpZJl9ytPog9-pA=s96-c',
      },
    ],
  },
  {
    id: 'e65ZREHAh',
    title: 'All the numbers: Amazon Prime Day 2026 powered by AWS',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/f624f23895f4606864628d186bfec438?_a=AQAEuop',
    readTime: 4,
    createdAt: '2026-10-06T20:30:40.230Z',
    numUpvotes: 1,
    numComments: 1,
    tags: ['cloud', 'aws', 'aws-lambda'],
    commentsPermalink:
      'https://daily.dev/posts/all-the-numbers-amazon-prime-day-2026-powered-by-aws-e65zrehah',
    type: 'article',
    source: {
      id: 'aws',
      handle: 'aws',
      name: 'AWS',
      image: 'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/aws',
    },
    commenters: [
      {
        id: 'MF1TfC05be7tWHwCu1Rwr',
        name: 'Ahmet Özel',
        image: 'https://avatars.githubusercontent.com/u/70992231?v=4',
      },
    ],
    upvoters: [
      {
        id: 'MF1TfC05be7tWHwCu1Rwr',
        name: 'Ahmet Özel',
        image: 'https://avatars.githubusercontent.com/u/70992231?v=4',
      },
    ],
  },
  {
    id: '8Xnys5knX',
    title: 'We closed 330 of your most-requested issues with Prisma ORM 8',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/af22819b46bb00b506caac48694d4f53?_a=AQAEuop',
    readTime: 66,
    createdAt: '2026-10-12T14:49:18.109Z',
    numUpvotes: 28,
    numComments: 1,
    tags: ['database', 'typescript', 'postgresql', 'prisma'],
    commentsPermalink:
      'https://daily.dev/posts/we-closed-330-of-your-most-requested-issues-with-prisma-orm-8-8xnys5knx',
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
        id: 'U6M9h5LCXW9r3dl13ufik',
        name: 'RJ',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocIX0FMQ5dZ_ie8ljouGWJQvP3wbIrYt5XnsaQf0l2ttkPDsSXLt=s96-c',
      },
    ],
    upvoters: [
      {
        id: 'kWXhS4Sg06rfjQ16HbMAR',
        name: 'Karanveer Singh Dhami',
        image:
          'https://media.daily.dev/image/upload/s--oLSnL8fO--/f_auto/v1770787231/avatars/avatar_kWXhS4Sg06rfjQ16HbMAR?_a=BAMAMiiu0',
      },
      {
        id: 'FC1daD4O6BqnJgqXnyzTi',
        name: 'Nam Doan',
        image:
          'https://media.daily.dev/image/upload/s--bEpISWPc--/f_auto/v1757479411/avatars/avatar_FC1daD4O6BqnJgqXnyzTi?_a=BAMClqZW0',
      },
      {
        id: 'LTh2hM0ZYHl75x6ingwgY',
        name: 'Radek Havelka',
        image:
          'https://lh3.googleusercontent.com/a-/ACNPEu-o8MElSN4ROMgrqyjqrarlLqksiGLna5TAfYA1Jw=s100',
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
    id: 'vJIQ1dQwf',
    title:
      'How we migrated Clera’s 500 GB production database to ClickHouse Managed Postgres overnight',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/c7995a22be7c540b0bfbe0637fabd817?_a=AQAEuop',
    readTime: 10,
    createdAt: '2026-10-08T20:56:05.946Z',
    numUpvotes: 4,
    numComments: 1,
    tags: ['database', 'postgresql', 'clickhouse'],
    commentsPermalink:
      'https://daily.dev/posts/how-we-migrated-clera-s-500-gb-production-database-to-clickhouse-managed-postgres-overnight-vjiq1dqwf',
    type: 'article',
    source: {
      id: 'clickhouse',
      handle: 'clickhouse',
      name: 'ClickHouse',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/clickhouse',
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
        id: 'xbTqxyW9xAsqwobCIBJ3R',
        name: 'Wladimir Campos',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocIsZeDwIPJLAB9UorZav-QqvI35f1aFNGiFmpZJl9ytPog9-pA=s96-c',
      },
      {
        id: 'yJRWN3rnD6J88D8Vwibte',
        name: 'MichaelHo',
        image: 'https://avatars.githubusercontent.com/u/18046164?v=4',
      },
      {
        id: 'FQKwuWBcZgtIaLiHg4E9s',
        name: 'Tausif Al Zubayer',
        image:
          'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
      },
      {
        id: 'PHGacJ40RYzVX5QXPhVFd',
        name: 'David Budd',
        image:
          'https://lh3.googleusercontent.com/a/ALm5wu3K5dowupPTT0rAL6gfSSvmlhezqBchn62QZWJG=s96-c',
      },
    ],
  },
  {
    id: '3fCG1sulf',
    title: 'All Your GUCs in a Row: array_nulls (Special Update)',
    image:
      'https://media.daily.dev/image/upload/s--OHB84bZF--/f_auto/v1722860399/public/Placeholder%2010',
    readTime: 6,
    createdAt: '2026-10-09T01:04:57.350Z',
    numUpvotes: 1,
    numComments: 1,
    tags: ['database', 'postgresql'],
    commentsPermalink:
      'https://daily.dev/posts/all-your-gucs-in-a-row-array-nulls-special-update--3fcg1sulf',
    type: 'article',
    source: {
      id: 'planet-postgresql',
      handle: 'planet-postgresql',
      name: 'Planet PostgreSQL',
      image: 'https://media.daily.dev/image/upload/logos/placeholder.jpg',
    },
    commenters: [
      {
        id: 'MF1TfC05be7tWHwCu1Rwr',
        name: 'Ahmet Özel',
        image: 'https://avatars.githubusercontent.com/u/70992231?v=4',
      },
    ],
    upvoters: [
      {
        id: 'MF1TfC05be7tWHwCu1Rwr',
        name: 'Ahmet Özel',
        image: 'https://avatars.githubusercontent.com/u/70992231?v=4',
      },
    ],
  },
  {
    id: 'odTqsSq3Q',
    title:
      'The SQL Project preplan script - the missing step in DACPAC publishing',
    image:
      'https://media.daily.dev/image/upload/s--qPvKM23u--/f_auto/v1722860399/public/Placeholder%2009',
    readTime: 8,
    createdAt: '2026-10-08T19:37:44.615Z',
    numUpvotes: 0,
    numComments: 1,
    tags: ['database', 'cicd', 'microsoft-sql-server'],
    commentsPermalink:
      'https://daily.dev/posts/the-sql-project-preplan-script---the-missing-step-in-dacpac-publishing-odtqssq3q',
    type: 'article',
    source: {
      id: 'wearedotnet',
      handle: 'wearedotnet',
      name: 'We Are .NET',
      image:
        'https://media.daily.dev/image/upload/s--BsnVOa3i--/f_auto/v1718347410/logos/wearedotnet',
    },
    commenters: [
      {
        id: 'P4xs6zq3lSVWvBZdTmYLI',
        name: 'elias-devv',
        image: 'https://avatars.githubusercontent.com/u/338986921?v=4',
      },
    ],
    upvoters: [],
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
    id: '0wGrnTsww',
    title: 'Impactful scheduling for GPU clusters',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/c1682fccca5731ced50f18015144133a?_a=AQAEuop',
    readTime: 17,
    createdAt: '2026-10-09T15:25:15.625Z',
    numUpvotes: 6,
    numComments: 1,
    tags: ['machine-learning', 'kubernetes'],
    commentsPermalink:
      'https://daily.dev/posts/impactful-scheduling-for-gpu-clusters-0wgrntsww',
    type: 'article',
    source: {
      id: 'huggingface',
      handle: 'huggingface',
      name: 'Hugging Face',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/f1f55c67d81a4330acf5b90b26b0c8e1',
    },
    commenters: [
      {
        id: 'TvTVeiMdkRCqWUDullFmy',
        name: 'kartik-nvjk',
        image:
          'https://media.daily.dev/image/upload/s--3gGgsVCw--/f_auto/v1781456774/avatars/avatar_TvTVeiMdkRCqWUDullFmy?_a=BAMAMiWQ0',
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
        id: 'orjMeK8QKaaVZwGq7ScPz',
        name: 'PDFops',
        image:
          'https://media.daily.dev/image/upload/s---8isRBKc--/f_auto/v1782922291/avatars/avatar_orjMeK8QKaaVZwGq7ScPz?_a=BAMAMicg0',
      },
      {
        id: '7BlkdVN89a93IW66v7dzN',
        name: 'ehsan Fouladi',
        image:
          'https://lh3.googleusercontent.com/a/AGNmyxYblOiAWr20n8pqWAD0wdzHhShPGf4NYm8C1TeB=s96-c',
      },
      {
        id: 'yJRWN3rnD6J88D8Vwibte',
        name: 'MichaelHo',
        image: 'https://avatars.githubusercontent.com/u/18046164?v=4',
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
    id: 'K3JCIYHUx',
    title:
      "SymfonyCon Warsaw 2026: PHP wasn't supposed to do that (Symfony Blog)",
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/327b244859fddae8f3a20d0225898aa0?_a=AQAEuop',
    readTime: 3,
    createdAt: '2026-09-09T09:17:35.405Z',
    numUpvotes: 2,
    numComments: 2,
    tags: ['mobile', 'php', 'symfony'],
    commentsPermalink:
      'https://daily.dev/posts/symfonycon-warsaw-2026-php-wasn-t-supposed-to-do-that-symfony-blog--k3jciyhux',
    type: 'article',
    source: {
      id: 'symfony',
      handle: 'symfony',
      name: 'Symfony',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/cc07051b7112472f9729e73c14660a64',
    },
    commenters: [
      {
        id: '6d9NzJ5wNcCebI1aaQDC4',
        name: 'sarika suman',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocJdOm1VCKGmN1oZh7vMro7QU3O2yaLaTzKeb86NPzkAEzc1F4I=s96-c',
      },
      {
        id: 'orjMeK8QKaaVZwGq7ScPz',
        name: 'PDFops',
        image:
          'https://media.daily.dev/image/upload/s---8isRBKc--/f_auto/v1782922291/avatars/avatar_orjMeK8QKaaVZwGq7ScPz?_a=BAMAMicg0',
      },
    ],
    upvoters: [
      {
        id: 'lG9hUNyvY1IEnToadAKar',
        name: 'Umunnakwe Ephraim Ekene',
        image: 'https://avatars.githubusercontent.com/u/54512508?v=4',
      },
      {
        id: '6d9NzJ5wNcCebI1aaQDC4',
        name: 'sarika suman',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocJdOm1VCKGmN1oZh7vMro7QU3O2yaLaTzKeb86NPzkAEzc1F4I=s96-c',
      },
    ],
  },
  {
    id: 'XKazVB9nF',
    title: 'Can you go 24 hours using only Expo apps? — Expo blog',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/d1558ee1e1f228186a9612b2c5af9564?_a=AQAEuop',
    readTime: 8,
    createdAt: '2026-09-10T13:31:44.214Z',
    numUpvotes: 22,
    numComments: 1,
    tags: ['mobile', 'react-native'],
    commentsPermalink:
      'https://daily.dev/posts/can-you-go-24-hours-using-only-expo-apps-expo-blog-xkazvb9nf',
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
        id: 'wQYYVe5Tbj0NJ7C7qPoa8',
        name: 'Agustin Barrientos',
        image:
          'https://media.daily.dev/image/upload/s--5ayxQnqn--/f_auto/v1788281802/avatars/avatar_wQYYVe5Tbj0NJ7C7qPoa8?_a=BAMAMicg0',
      },
    ],
    upvoters: [
      {
        id: 'nrZAAu1Ydq22gxlD1M2Ua',
        name: 'packaging.inc',
        image:
          'https://media.daily.dev/image/upload/s--3U_SDqnO--/f_auto/v1789664150/avatars/avatar_nrZAAu1Ydq22gxlD1M2Ua?_a=BAMAMicg0',
      },
      {
        id: 'wn5BwyQ79M2VuebTC0gD8',
        name: 'Justice Opara',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocIXKbPPwI2JIL-YW8YYOjMyXXJPpnBQnwvGju61ENJsK1nAEA=s96-c',
      },
      {
        id: '4GLcrIZ5ihwVhSqejLul1',
        name: 'reyno',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocJMCaBurYn1BOfqpdZHzP7WjrRvbauRU07uhsQyLuBX7Dez4A=s96-c',
      },
      {
        id: 'TWmVpEzjPBU2SVv1zpVby',
        name: 'Muhammad Hammad Zafar',
        image: 'https://avatars.githubusercontent.com/u/48489738?v=4',
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
    numUpvotes: 31,
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
      {
        id: 'ZL6bebyCVkszL2cr0g8ab',
        name: 'Swarna Sharmin',
        image:
          'https://media.daily.dev/image/upload/s--joHEq_jD--/f_auto/v1791022797/avatars/avatar_ZL6bebyCVkszL2cr0g8ab?_a=BAMAMicg0',
      },
    ],
  },
  {
    id: 'cnbkFRwj4',
    title:
      'Linux Kernel Drops AI Tag Requirement, Uses Meta AI For Code Reviews',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/3290693a863934a71e4d52b21688dbc7?_a=AQAEuop',
    readTime: 2,
    createdAt: '2026-10-15T20:15:20.790Z',
    numUpvotes: 1,
    numComments: 1,
    tags: ['open-source', 'linux', 'ai-coding'],
    commentsPermalink:
      'https://daily.dev/posts/linux-kernel-drops-ai-tag-requirement-uses-meta-ai-for-code-reviews-cnbkfrwj4',
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
        id: 'MF1TfC05be7tWHwCu1Rwr',
        name: 'Ahmet Özel',
        image: 'https://avatars.githubusercontent.com/u/70992231?v=4',
      },
    ],
    upvoters: [
      {
        id: 'MF1TfC05be7tWHwCu1Rwr',
        name: 'Ahmet Özel',
        image: 'https://avatars.githubusercontent.com/u/70992231?v=4',
      },
    ],
  },
  {
    id: 'RJrs8yBKT',
    title:
      "That anime girl you keep seeing on Linux sites is a tiny proof-of-work puzzle, and it's keeping volunteer projects online",
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/3d33f648a32374f3f870980e8906ccab?_a=AQAEuop',
    readTime: 4,
    createdAt: '2026-10-15T20:03:56.654Z',
    numUpvotes: 1,
    numComments: 1,
    tags: ['open-source', 'crawling', 'proof-of-work'],
    commentsPermalink:
      'https://daily.dev/posts/that-anime-girl-you-keep-seeing-on-linux-sites-is-a-tiny-proof-of-work-puzzle-and-it-s-keeping-volu-rjrs8ybkt',
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
        id: 'MF1TfC05be7tWHwCu1Rwr',
        name: 'Ahmet Özel',
        image: 'https://avatars.githubusercontent.com/u/70992231?v=4',
      },
    ],
    upvoters: [
      {
        id: 'MF1TfC05be7tWHwCu1Rwr',
        name: 'Ahmet Özel',
        image: 'https://avatars.githubusercontent.com/u/70992231?v=4',
      },
    ],
  },
  {
    id: 'O8nQgY55i',
    title: 'Sunsetting decomp.dev',
    image:
      'https://media.daily.dev/image/upload/s--VDukGCjf--/f_auto/v1722860399/public/Placeholder%2002',
    readTime: 5,
    createdAt: '2026-10-15T16:29:25.678Z',
    numUpvotes: 0,
    numComments: 1,
    tags: ['open-source', 'ai-agents', 'reverse-engineering'],
    commentsPermalink:
      'https://daily.dev/posts/sunsetting-decomp-dev-o8nqgy55i',
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
        id: 'xkQttfaNpuXWAtUohQhFb',
        name: 'AI/Fullstack engineer',
        image: 'https://avatars.githubusercontent.com/u/291420051?v=4',
      },
    ],
    upvoters: [],
  },
  {
    id: 'PHGMruiEA',
    title: 'I Tried Every Todo App and Ended Up With a .txt File',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/d65a0c262574b340ede668e94f4adf3f?_a=AQAEulh',
    readTime: 5,
    createdAt: '2025-08-11T15:06:16.669Z',
    numUpvotes: 325,
    numComments: 81,
    tags: ['tools', 'productivity'],
    commentsPermalink:
      'https://daily.dev/posts/i-tried-every-todo-app-and-ended-up-with-a-txt-file-phgmruiea',
    type: 'article',
    source: {
      id: 'hn',
      handle: 'hn',
      name: 'Hacker News',
      image: 'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/hn',
    },
    commenters: [
      {
        id: 'otqAJUf6zdM9hfRwTlR9n',
        name: 'Isaac de Andrade',
        image: 'https://avatars.githubusercontent.com/u/2653546?v=4',
      },
      {
        id: 'hfOGQxLOYRlS9s85mckes',
        name: 'Saumil Shah',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocK36JF25JMgkxs68sPYZIbSH5O5MvAJBc0UGG9WoZBlmzGc3g=s96-c',
      },
      {
        id: '41pQp8D3QgSHLkhjidv4h',
        name: 'Timothy Bryant',
        image:
          'https://lh3.googleusercontent.com/a/ALm5wu0-hQ2d_X5athFgX-hn5VIxAtOdVpyQ4uBM2y8vdQ=s96-c',
      },
    ],
    upvoters: [
      {
        id: 'KsoNHZjF8F2SY0uhvKKfz',
        name: 'Best Codes',
        image: 'https://avatars.githubusercontent.com/u/106822363?v=4',
      },
      {
        id: 'fDzCCDAGbxdxBVM4UlobU',
        name: 'animalelder',
        image:
          'https://media.daily.dev/image/upload/s--JLHL_b75--/f_auto/v1739576143/avatars/avatar_fDzCCDAGbxdxBVM4UlobU',
      },
      {
        id: 'EB0j0Umzh5v3zGWUSL5ma',
        name: 'Doncho Angelov',
        image:
          'https://media.daily.dev/image/upload/s--j1MSm0hy--/f_auto/v1716369534/avatars/avatar_EB0j0Umzh5v3zGWUSL5ma',
      },
      {
        id: 'pUDB1YflkY31YO0YZhJDo',
        name: 'Artur',
        image:
          'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
      },
    ],
  },
  {
    id: 'OVbf4QuOE',
    title: 'Laravel Toaster Magic',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/77a2a3c257bca02a9ed7ba380dd862df?_a=AQAEuj9',
    readTime: 2,
    createdAt: '2025-04-21T13:24:11.646Z',
    numUpvotes: 99,
    numComments: 6,
    tags: ['webdev', 'javascript', 'tools', 'ux', 'laravel'],
    commentsPermalink:
      'https://daily.dev/posts/laravel-toaster-magic-ovbf4quoe',
    type: 'article',
    source: {
      id: 'ln',
      handle: 'ln',
      name: 'Laravel News',
      image: 'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/ln',
    },
    commenters: [
      {
        id: 'fkByiL9FT9qu6uKlrZ8Lg',
        name: 'Rabiul Islam',
        image:
          'https://media.daily.dev/image/upload/s--SCiCIFCR--/f_auto/v1736142600/avatars/avatar_fkByiL9FT9qu6uKlrZ8Lg',
      },
      {
        id: 'bcnbIOwAubBlc8Owq9Va7',
        name: 'Altaaf Ali',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocL5d5XVv97UcUCyb15dsifFIOGMCOEBNy-y9UdApE7VWFq_5CY=s96-c',
      },
      {
        id: 'eetzyTd72U9l3vJUi6S9U',
        name: 'Mona Brahmakshatriya',
        image: 'https://avatars.githubusercontent.com/u/5073095?v=4',
      },
    ],
    upvoters: [
      {
        id: 'Ppchrgf3YLpS7fIDtDGYg',
        name: 'Nawon Perera',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocJYTLEiiXbz3LyAJ8MWyh2cuwab7_rXbM-xS0NUQMrMiYh6JGnt=s96-c',
      },
      {
        id: 'pP5rTQ7lpcj0c6fHZQZkT',
        name: 'Akmal Bashan',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocIRR3b_Z4xQaiHW-XsKanaRYL7Y15XblPFk0LIrcYTQpimREap_xg=s96-c',
      },
      {
        id: '72ZMXwV0oPdTfRL3bAZNk',
        name: 'Robert Maina',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocJ__WTKN7su3qCJs4WmrKDe3FmYY9KDjM4JtZ1Qck057NgCZeY=s96-c',
      },
      {
        id: '6gm7rHaqiPhMPkY6ElH45',
        name: 'EMMAN',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocIdjHhNE0TUAEXJa9doCMTgyFWHfH-bxUdOjndUGsQh5yRmk9aE=s96-c',
      },
    ],
  },
  {
    id: 'mnl4HWGuu',
    title: '5 Tools I Wish I Knew When I Started Hacking',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/e6b19a35c8e42e16c08a312f9598277e?_a=AQAEuj9',
    readTime: 5,
    createdAt: '2025-04-21T04:26:45.612Z',
    numUpvotes: 302,
    numComments: 5,
    tags: ['security', 'cyber', 'tools'],
    commentsPermalink:
      'https://daily.dev/posts/5-tools-i-wish-i-knew-when-i-started-hacking-mnl4hwguu',
    type: 'article',
    source: {
      id: 'infosecwriteups',
      handle: 'infosecwriteups',
      name: 'InfoSec Write-ups',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/f0dc21b5bbfd46fda36f7b4b53dd1705',
    },
    commenters: [
      {
        id: 'czGxy5fezmSEtrl2dHIV0',
        name: 'King David',
        image:
          'https://media.daily.dev/image/upload/v1670416408/avatars/avatar_czGxy5fezmSEtrl2dHIV0.jpg',
      },
      {
        id: 'dM0IKWm7pUzBgqVRGefty',
        name: 'Alex Khartaniuk',
        image:
          'https://media.daily.dev/image/upload/s--x1eV-cvm--/f_auto/v1734215741/avatars/avatar_dM0IKWm7pUzBgqVRGefty',
      },
      {
        id: '48ybsAgzw4zogJBmiL7Mj',
        name: 'Yashwanth Kotha',
        image:
          'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
      },
    ],
    upvoters: [
      {
        id: 'TL7Ak2gIOI09xZ852r1FX',
        name: 'Diego Demarco',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocLMG5sjVAfOkXm26X4s7riLUgj6F_nnN5ws1KhDNuiAPqBxpQ=s96-c',
      },
      {
        id: 'tSqJAIEPfqWDIJWGMDJOo',
        name: 'Miguel Hernandez',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocJqb8zZ_TNhT18bo-kTCsQJd6Mz_qxgrWbOQM1-O-0Ma3c-Q9ocAA=s96-c',
      },
      {
        id: 'Ci75X9sjgBAuP70WotWgd',
        name: 'Kevin Marville',
        image: 'https://avatars.githubusercontent.com/u/116537485?v=4',
      },
      {
        id: 'oXVMm3ERZMGwGYHpmWFf6',
        name: 'vtperso',
        image:
          'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
      },
    ],
  },
  {
    id: 'cGPz2vCdd',
    title: '20 Best Web Development Tools to Improve Your Workflow',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/b91a4975bd5d25078d402e90453eeba9?_a=AQAEuj9',
    readTime: 31,
    createdAt: '2025-05-13T06:16:52.012Z',
    numUpvotes: 79,
    numComments: 5,
    tags: ['webdev', 'javascript', 'tools', 'frontend'],
    commentsPermalink:
      'https://daily.dev/posts/20-best-web-development-tools-to-improve-your-workflow-cgpz2vcdd',
    type: 'article',
    source: {
      id: 'community',
      handle: 'community',
      name: 'Community Picks',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1655817725/logos/community',
    },
    commenters: [
      {
        id: 'pWEhX8JhjnUQB2l4CNVSW',
        name: 'OrcDev',
        image: 'https://avatars.githubusercontent.com/u/7549148?v=4',
      },
      {
        id: 'lVd4VXutfTMvCVpH48UTD',
        name: 'Ruben Heymans',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocKNcAZIX4GYctHk4--q2ol4ZoTK1quHuiRYdyXJ1DFwo3856lox=s96-c',
      },
      {
        id: 'XQraFlxE3JPWOlcSuOB2K',
        name: 'James',
        image: 'https://avatars.githubusercontent.com/u/9485980?v=4',
      },
    ],
    upvoters: [
      {
        id: 'x13ZsKKmjsMiKpvbJHA8n',
        name: 'ALEJANDRO CASTRO',
        image: 'https://avatars.githubusercontent.com/u/1930446?v=4',
      },
      {
        id: 'VH-GgL3DN',
        name: 'Guilherme Santos',
        image: 'https://avatars.githubusercontent.com/u/14255823?v=4',
      },
      {
        id: 'gkUQR16I9pxQyUm1lV0cR',
        name: 'Patrick Dunn',
        image:
          'https://media.daily.dev/image/upload/s--BbJlKy99--/f_auto/v1754840676/avatars/avatar_gkUQR16I9pxQyUm1lV0cR?_a=BAMClqZW0',
      },
      {
        id: 'FQKwuWBcZgtIaLiHg4E9s',
        name: 'Tausif Al Zubayer',
        image:
          'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
      },
    ],
  },
  {
    id: 'bA0a1CyFR',
    title:
      'Angular vs React in 2026: Why Angular Still Makes More Sense for Enterprise Applications',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/d89723cedcc311b86c4f1343f26c0830?_a=AQAEuop',
    readTime: 15,
    createdAt: '2026-10-12T08:53:21.172Z',
    numUpvotes: 15,
    numComments: 2,
    tags: ['react', 'architecture', 'angular', 'dependency-injection'],
    commentsPermalink:
      'https://daily.dev/posts/angular-vs-react-in-2026-why-angular-still-makes-more-sense-for-enterprise-applications-ba0a1cyfr',
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
        id: '0fMQQvxSIIVibBvP847Xo',
        name: 'JP de la Torre',
        image:
          'https://media.daily.dev/image/upload/s--vMLSF3-1--/f_auto/v1787723050/avatars/avatar_0fMQQvxSIIVibBvP847Xo?_a=BAMAMicg0',
      },
    ],
    upvoters: [
      {
        id: '0fMQQvxSIIVibBvP847Xo',
        name: 'JP de la Torre',
        image:
          'https://media.daily.dev/image/upload/s--vMLSF3-1--/f_auto/v1787723050/avatars/avatar_0fMQQvxSIIVibBvP847Xo?_a=BAMAMicg0',
      },
      {
        id: 'XgRt9jya3bbNspe5VEn3T',
        name: 'Abdirahman Mohamoud',
        image:
          'https://media.daily.dev/image/upload/s--X78MWNYX--/f_auto/v1716196774/avatars/avatar_XgRt9jya3bbNspe5VEn3T',
      },
      {
        id: 'yfCcjiz4shk9l1kaXs7m1',
        name: 'Andrea Senni',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocL9zDvgvAHJyMsmnVewPaOwW1fMuVIk0D1besTkxG8tnUmIoQ=s96-c',
      },
      {
        id: 'igzBsWloJeaegzm9bQltZ',
        name: 'AllInOneTools',
        image:
          'https://media.daily.dev/image/upload/s--4ZT8QlF0--/f_auto/v1769790028/avatars/avatar_igzBsWloJeaegzm9bQltZ?_a=BAMAMiiu0',
      },
    ],
  },
  {
    id: 'mamRPGADG',
    title: 'How AI Agents Are Changing API Architecture',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/9c28c7f8f29d448905277daffeb91b8a?_a=AQAEuop',
    readTime: 8,
    createdAt: '2026-10-11T12:28:19.784Z',
    numUpvotes: 11,
    numComments: 2,
    tags: [
      'security',
      'ai-agents',
      'architecture',
      'observability',
      'authorization',
    ],
    commentsPermalink:
      'https://daily.dev/posts/how-ai-agents-are-changing-api-architecture-mamrpgadg',
    type: 'article',
    source: {
      id: 'nordicapis',
      handle: 'nordicapis',
      name: 'Nordic APIs',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/957e9f265c5d475b89d078b558157031',
    },
    commenters: [
      {
        id: 'orjMeK8QKaaVZwGq7ScPz',
        name: 'PDFops',
        image:
          'https://media.daily.dev/image/upload/s---8isRBKc--/f_auto/v1782922291/avatars/avatar_orjMeK8QKaaVZwGq7ScPz?_a=BAMAMicg0',
      },
      {
        id: 'vmrDQIxsd9nEZVwowbCmB',
        name: 'Pedro Pietroluongo',
        image: 'https://avatars.githubusercontent.com/u/1533471?v=4',
      },
    ],
    upvoters: [
      {
        id: 'kkHQAY0PX38BlSxnky6pJ',
        name: 'Anthony Heitzeberg',
        image:
          'https://media.daily.dev/image/upload/s--IR0i2UXO--/f_auto/v1749919091/avatars/avatar_kkHQAY0PX38BlSxnky6pJ?_a=BAMClqUq0',
      },
      {
        id: '7wdjBBBVLN4AE9iwcR2FP',
        name: 'Ahmed Khaled',
        image:
          'https://media.daily.dev/image/upload/s--MzlHllrN--/f_auto/v1781384862/avatars/avatar_7wdjBBBVLN4AE9iwcR2FP?_a=BAMAMiWQ0',
      },
      {
        id: '3z3vjxeh4PsZpA0YLdYAB',
        name: 'kris gu',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocJnnwFKNx7PJNhb7W6mFWr2k2SV_VHW_9ainY71DX_dv79frQ=s96-c',
      },
      {
        id: 'RoPFkPSSM5mSmcRAewuxk',
        name: 'Facundo Lozano',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocIFzIsgCx0OuXqgYMjEk0ruyVCUu1-B3RiOtHKmQ5zbN-k-vw=s96-c',
      },
    ],
  },
  {
    id: 'lquMjhHij',
    title: 'How to engineer an AI harness for game development',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/5adfcb7fb5586b0d9c9bb5d631ecf956?_a=AQAEuop',
    readTime: 31,
    createdAt: '2026-10-13T19:56:44.605Z',
    numUpvotes: 1,
    numComments: 2,
    tags: [
      'ai-agents',
      'game-development',
      'architecture',
      'claude-code',
      'context-engineering',
    ],
    commentsPermalink:
      'https://daily.dev/posts/how-to-engineer-an-ai-harness-for-game-development-lqumjhhij',
    type: 'article',
    source: {
      id: 'hn',
      handle: 'hn',
      name: 'Hacker News',
      image: 'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/hn',
    },
    commenters: [
      {
        id: 'OaeO7wfNeXwcstrS6WGXx',
        name: 'ab',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocKwOmJ31UWqM4ZXB5ms-yRdFR4BYzyb7FPBRpg1O6DV0MIAF2EP=s96-c',
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
        id: 'TvTVeiMdkRCqWUDullFmy',
        name: 'kartik-nvjk',
        image:
          'https://media.daily.dev/image/upload/s--3gGgsVCw--/f_auto/v1781456774/avatars/avatar_TvTVeiMdkRCqWUDullFmy?_a=BAMAMiWQ0',
      },
    ],
  },
  {
    id: 'YwjHQ87Hd',
    title: "What is a pattern, and what isn't?",
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/796bb0845402d9566fdd334b3cab7a8b?_a=AQAEuop',
    readTime: 15,
    createdAt: '2026-10-12T18:40:32.373Z',
    numUpvotes: 15,
    numComments: 1,
    tags: ['architecture', 'microservices', 'design-patterns'],
    commentsPermalink:
      'https://daily.dev/posts/what-is-a-pattern-and-what-isn-t--ywjhq87hd',
    type: 'article',
    source: {
      id: 'microservicesio',
      handle: 'microservicesio',
      name: 'Microservices.io',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/7a511879d50f43698644bcf07f4d0a59',
    },
    commenters: [
      {
        id: 'oDE0FMrDZhVSkpMkv0gev',
        name: 'Parsa Soroush',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocJDo0PaWPA6Z0XcLprVm82FErNiHzozsgdU3oWSS2D3nXCpV7A=s96-c',
      },
    ],
    upvoters: [
      {
        id: 'DL2WiQA4Jq4TptdVDV10n',
        name: 'Proeung Chiso',
        image: 'https://avatars.githubusercontent.com/u/122223308?v=4',
      },
      {
        id: 'bhjrIxrCXRjlSzHv3KMDD',
        name: 'fj',
        image:
          'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
      },
      {
        id: 'YFg9kyC97ddrd0kMscPAf',
        name: 'Dimas Seto',
        image: 'https://avatars.githubusercontent.com/u/31839535?v=4',
      },
      {
        id: 'oDE0FMrDZhVSkpMkv0gev',
        name: 'Parsa Soroush',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocJDo0PaWPA6Z0XcLprVm82FErNiHzozsgdU3oWSS2D3nXCpV7A=s96-c',
      },
    ],
  },
  {
    id: 'cpO0LBAU7',
    title: 'TimeProvider and FakeTimeProvider in .NET Tests',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/54ad80fda4952dfefc84d3d2ffb813d1?_a=AQAEuop',
    readTime: 6,
    createdAt: '2026-10-09T19:52:06.155Z',
    numUpvotes: 20,
    numComments: 1,
    tags: ['testing', '.net', 'c#'],
    commentsPermalink:
      'https://daily.dev/posts/timeprovider-and-faketimeprovider-in-net-tests-cpo0lbau7',
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
        id: 'njI2ZHYhNIJGOXEG0gJ5j',
        name: 'Adam',
        image: 'https://avatars.githubusercontent.com/u/2162621?v=4',
      },
    ],
    upvoters: [
      {
        id: 'oyWou2Tkkfzz7ovhK2OjA',
        name: 'Rasmus Bækgaard',
        image: 'https://avatars.githubusercontent.com/u/19559616?v=4',
      },
      {
        id: 'WhpHe2ngWJ9QbTYmApeA3',
        name: 'Tim Goshinski',
        image:
          'https://media.daily.dev/image/upload/s--_5X3OG7c--/f_auto/v1726237311/avatars/avatar_WhpHe2ngWJ9QbTYmApeA3',
      },
      {
        id: 't8oDAHyRbETrmL8IRDCi6',
        name: 'Kartik Bundele',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocJb2N7ETo5KGhvIFZlTJzeaK1PJKSCEuSiQapExTj1aFXSY=s96-c',
      },
      {
        id: 'dKQLwjsqQ1qFt3GQZhY1j',
        name: 'Moisés Marins',
        image:
          'https://lh3.googleusercontent.com/a/AAcHTteUDq9QflQfWPd7V8-PKqtYU-3vQVRGZS0o0hW6EA=s96-c',
      },
    ],
  },
  {
    id: '6GJ6624bV',
    title:
      'Spotify More Than Doubled Monthly Code Changes as AI Accelerated Development',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/c654c88d59785042f5ed05c33a8a42bb?_a=AQAEuop',
    readTime: 3,
    createdAt: '2026-10-12T14:05:51.861Z',
    numUpvotes: 0,
    numComments: 1,
    tags: ['testing', 'ai-coding', 'observability', 'claude', 'spotify'],
    commentsPermalink:
      'https://daily.dev/posts/spotify-more-than-doubled-monthly-code-changes-as-ai-accelerated-development-6gj6624bv',
    type: 'article',
    source: {
      id: 'infoq',
      handle: 'infoq',
      name: 'InfoQ',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/afc3bced3e1e4b188dd9127017a60e0c',
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
    id: 'RrYhaHQnS',
    title: 'How to let coding agents test Mac apps in a VM',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/8a7e2cdd8aed9ffbbff753424476dcd5?_a=AQAEuop',
    readTime: 11,
    createdAt: '2026-10-11T12:28:25.846Z',
    numUpvotes: 0,
    numComments: 1,
    tags: ['ai-agents', 'testing', 'mac', 'virtual-machine'],
    commentsPermalink:
      'https://daily.dev/posts/how-to-let-coding-agents-test-mac-apps-in-a-vm-rryhahqns',
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
        id: 'OaeO7wfNeXwcstrS6WGXx',
        name: 'ab',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocKwOmJ31UWqM4ZXB5ms-yRdFR4BYzyb7FPBRpg1O6DV0MIAF2EP=s96-c',
      },
    ],
    upvoters: [],
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
    id: 'XF8jARlqA',
    title:
      'How Does Java Fit Into the World of AI—and How Can It Become an Even Better Fit?',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/32bf638c636109231e23c03afad232f8?_a=AQAEuop',
    readTime: 1,
    createdAt: '2026-10-15T14:03:52.500Z',
    numUpvotes: 3,
    numComments: 1,
    tags: ['ai', 'java'],
    commentsPermalink:
      'https://daily.dev/posts/how-does-java-fit-into-the-world-of-ai-and-how-can-it-become-an-even-better-fit--xf8jarlqa',
    type: 'article',
    source: {
      id: 'inside_java',
      handle: 'inside_java',
      name: 'Inside Java',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/de5992d95f374790bdfd2ae03a16f6e3',
    },
    commenters: [
      {
        id: 'BVFfwlZ9i6EsPy9PxXbVI',
        name: 'Dani Richest Man in Babylon',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocLlBPJNTb6tS4ntqfQMs--4xvzxjS7REGhzHwEcceuxEKDnWUTG=s96-c',
      },
    ],
    upvoters: [
      {
        id: 'BVFfwlZ9i6EsPy9PxXbVI',
        name: 'Dani Richest Man in Babylon',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocLlBPJNTb6tS4ntqfQMs--4xvzxjS7REGhzHwEcceuxEKDnWUTG=s96-c',
      },
      {
        id: 'vmrDQIxsd9nEZVwowbCmB',
        name: 'Pedro Pietroluongo',
        image: 'https://avatars.githubusercontent.com/u/1533471?v=4',
      },
      {
        id: 'FQKwuWBcZgtIaLiHg4E9s',
        name: 'Tausif Al Zubayer',
        image:
          'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
      },
    ],
  },
  {
    id: 'dd6Dmhs1F',
    title: 'Revisiting SiFuture with Kof',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/fc9f6f3175ea7b0172342fe5d89205ef?_a=AQAEuop',
    readTime: 2,
    createdAt: '2026-10-15T20:06:02.631Z',
    numUpvotes: 1,
    numComments: 1,
    tags: ['startup', 'game-development', 'java'],
    commentsPermalink:
      'https://daily.dev/posts/revisiting-sifuture-with-kof-dd6dmhs1f',
    type: 'article',
    source: {
      id: 'java_libhunt',
      handle: 'java_libhunt',
      name: 'Awesome Java Newsletter',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/7729929f2ca649d7b13f6b04aa94d300',
    },
    commenters: [
      {
        id: 'MF1TfC05be7tWHwCu1Rwr',
        name: 'Ahmet Özel',
        image: 'https://avatars.githubusercontent.com/u/70992231?v=4',
      },
    ],
    upvoters: [
      {
        id: 'MF1TfC05be7tWHwCu1Rwr',
        name: 'Ahmet Özel',
        image: 'https://avatars.githubusercontent.com/u/70992231?v=4',
      },
    ],
  },
  {
    id: 'NwPD4obMN',
    title:
      'Why Every Microwave Has A “Popcorn” Button, But Every Bag Warns You Not To Use It',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/166ea1b618173d47ac65fecee825332b?_a=AQAEuop',
    readTime: 2,
    createdAt: '2026-10-10T11:13:03.749Z',
    numUpvotes: 3,
    numComments: 1,
    tags: ['tech-news', 'hardware'],
    commentsPermalink:
      'https://daily.dev/posts/why-every-microwave-has-a-popcorn-button-but-every-bag-warns-you-not-to-use-it-nwpd4obmn',
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
        id: 'hnjKuXD9v5OSbqLCToK54',
        name: 'Werner Hahn',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocJr9LIXrt1E5zAmLx3QtOkq4iGvcwdh-t__bh6z4dhVoZyOEgE=s96-c',
      },
    ],
    upvoters: [
      {
        id: 'ozaSuiZeqel2iCEAH4Gnz',
        name: 'Futurism Security',
        image: 'https://avatars.githubusercontent.com/u/307918051?v=4',
      },
      {
        id: '29TCpY2hJR72V3BlxPXzX',
        name: 'Daniel',
        image:
          'https://media.daily.dev/image/upload/s--FtwJqX4c--/f_auto/v1754900041/avatars/avatar_29TCpY2hJR72V3BlxPXzX?_a=BAMClqZW0',
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
    id: 'Rv5U8IeHg',
    title:
      "4 reasons why I paid for Windows 11 Pro and why I'll never switch to Linux",
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/2b2c421682786881b6146ad78f3a4361?_a=AQAEuop',
    readTime: 6,
    createdAt: '2026-10-11T00:03:25.895Z',
    numUpvotes: 7,
    numComments: 6,
    tags: ['linux', 'gaming', 'windows', 'nvidia'],
    commentsPermalink:
      'https://daily.dev/posts/4-reasons-why-i-paid-for-windows-11-pro-and-why-i-ll-never-switch-to-linux-rv5u8iehg',
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
        id: 'KtViEC6XUg9SnmLig5QLy',
        name: 'Jared',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocJE7F397eAJcrTtLk_RhHueRbehoNCm6rDryyZ_dkCRVWVh4wYd=s96-c',
      },
      {
        id: 'ScKiWPtqpsvwHAvAS0jvG',
        name: 'TheCookingSenpai',
        image:
          'https://media.daily.dev/image/upload/s--ffrIwc1G--/f_auto/v1757426086/avatars/avatar_ScKiWPtqpsvwHAvAS0jvG?_a=BAMClqZW0',
      },
      {
        id: 'IcZAd05tYMD7K8SC2QMqa',
        name: 'l9521787',
        image:
          'https://lh3.googleusercontent.com/a/AAcHTteQ9_ph6p5v02nn2-faHYGHFOWnqVD1uRpitrcpGIoS=s96-c',
      },
    ],
    upvoters: [
      {
        id: 'orjMeK8QKaaVZwGq7ScPz',
        name: 'PDFops',
        image:
          'https://media.daily.dev/image/upload/s---8isRBKc--/f_auto/v1782922291/avatars/avatar_orjMeK8QKaaVZwGq7ScPz?_a=BAMAMicg0',
      },
      {
        id: 'nYyGrFQoR6mmlL3FPgSkL',
        name: 'Logui',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocJKbmxQ1SexK09oe6PytDtD2BRWAVb9RjVxaVYMrUPUfedn_dU=s96-c',
      },
      {
        id: 'nNG9Bqy1wtyHHxqpZv3LU',
        name: 'Rishabh Verma',
        image:
          'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
      },
      {
        id: 'Hg11trLwLBQUkQSd2OhWh',
        name: 'anonymous',
        image:
          'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
      },
    ],
  },
  {
    id: 'YDH1OYvKR',
    title: 'Сrochet Your Own Cozy Isometric City with Cotton in This Cute Game',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/8d15869a0d414117a10fe0aedbbf4411?_a=AQAEuop',
    readTime: 3,
    createdAt: '2026-10-12T11:53:51.783Z',
    numUpvotes: 23,
    numComments: 1,
    tags: ['game-development', 'gaming', 'unity'],
    commentsPermalink:
      'https://daily.dev/posts/rochet-your-own-cozy-isometric-city-with-cotton-in-this-cute-game-ydh1oyvkr',
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
        id: 'eyySonLitPQLPK6mVrSSn',
        name: 'BigDog',
        image:
          'https://media.daily.dev/image/upload/s--GaJxcZaC--/f_auto/v1750769439/avatars/avatar_eyySonLitPQLPK6mVrSSn?_a=BAMClqZW0',
      },
    ],
    upvoters: [
      {
        id: 'F8KhlbM90eQydKUX8BX0G',
        name: 'MarvinAi5',
        image: 'https://avatars.githubusercontent.com/u/284183649?v=4',
      },
      {
        id: '5wMBBn8xcAAkK1fWTNwHN',
        name: 'Lokesh Choudhary',
        image:
          'https://media.daily.dev/image/upload/s---o97g0SZ--/f_auto/v1735906924/avatars/avatar_5wMBBn8xcAAkK1fWTNwHN',
      },
      {
        id: 'U9YNpHvqD7jM3IxMsDTsP',
        name: 'Phat Dang Minh',
        image:
          'https://media.daily.dev/image/upload/s--uEe-dzLM--/f_auto/v1747452091/avatars/avatar_U9YNpHvqD7jM3IxMsDTsP?_a=BAMClqUq0',
      },
      {
        id: 'mbCCiP9jUXruolBqY0uMq',
        name: 'Raichan Alghafari',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocL32PLFvwd78HilAwP6Qav9RR2ZFazRqmtdgsr2MNSZMKG-p30=s96-c',
      },
    ],
  },
  {
    id: 'SGCF1UKfp',
    title: 'World Of Warcraft: Forever Almost Launched Without Classic Models',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/90e8571bd978b23d49bd1e85c5eea133?_a=AQAEuop',
    readTime: 3,
    createdAt: '2026-10-09T15:07:38.879Z',
    numUpvotes: 6,
    numComments: 1,
    tags: ['game-development', 'gaming'],
    commentsPermalink:
      'https://daily.dev/posts/world-of-warcraft-forever-almost-launched-without-classic-models-sgcf1ukfp',
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
        id: 'JQOOCwm71RhJ6TwDN2Ylz',
        name: 'Evan Anderson',
        image:
          'https://media.daily.dev/image/upload/s--NVptqpk2--/f_auto/v1756838463/avatars/avatar_JQOOCwm71RhJ6TwDN2Ylz?_a=BAMClqZW0',
      },
    ],
    upvoters: [
      {
        id: 'LJSkpBexOSCWc8INyu3Eu',
        name: 'Ante Barić',
        image:
          'https://media.daily.dev/image/upload/v1679300599/avatars/avatar_LJSkpBexOSCWc8INyu3Eu.jpg',
      },
      {
        id: '3Y8VvCz2A1ncpV5hljQZw',
        name: 'Tosrif jahan Sakib',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocJiiRaYPh9JkPCrn-bzl8jgudcoHB-OonQGK6AG5jGQmfP0Xlb8=s96-c',
      },
      {
        id: 'EcUwkCRmLXvSGMtdsr97C',
        name: 'Muaz Sajid',
        image:
          'https://media.daily.dev/image/upload/s--UAIdCRUB--/f_auto/v1777182453/avatars/avatar_EcUwkCRmLXvSGMtdsr97C?_a=BAMAMiWQ0',
      },
      {
        id: 'JQOOCwm71RhJ6TwDN2Ylz',
        name: 'Evan Anderson',
        image:
          'https://media.daily.dev/image/upload/s--NVptqpk2--/f_auto/v1756838463/avatars/avatar_JQOOCwm71RhJ6TwDN2Ylz?_a=BAMClqZW0',
      },
    ],
  },
  {
    id: 'Qp7Uaikgi',
    title: 'How Many Dudes?',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/038dc1602d4a34e654ad29124bcba1f7?_a=AQAEuop',
    readTime: 3,
    createdAt: '2026-10-11T12:29:04.581Z',
    numUpvotes: 1,
    numComments: 1,
    tags: ['game-development', 'gaming', 'game-design'],
    commentsPermalink: 'https://daily.dev/posts/how-many-dudes--qp7uaikgi',
    type: 'article',
    source: {
      id: 'daverupert',
      handle: 'daverupert',
      name: 'Dave Rupert',
      image:
        'https://media.daily.dev/image/upload/s--Ewp37ILO--/f_auto,q_auto/v1777801532/logos/daverupert',
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
        id: 'Z5BAOdy792gnIV9fVkHrS',
        name: 'David Washington',
        image:
          'https://media.daily.dev/image/upload/s--rXNT2dKg--/f_auto/v1791015537/avatars/avatar_Z5BAOdy792gnIV9fVkHrS?_a=BAMAMicg0',
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
    id: 'C00A7hw6I',
    title: 'Node.js — Node.js 24.22.0 (LTS)',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/95b9456e32445ef7b34da79eee2423f1?_a=AQAEuop',
    readTime: 28,
    createdAt: '2026-10-14T15:54:51.524Z',
    numUpvotes: 8,
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
      {
        id: 'goLsd8jwvwG92WvRIqOvu',
        name: 'Abdelfattah Radwan',
        image:
          'https://media.daily.dev/image/upload/s--Zf0i8E2O--/f_auto/v1719427053/avatars/avatar_goLsd8jwvwG92WvRIqOvu',
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
  {
    id: 'vLDFW0kZC',
    title:
      'The era of the .csproj is over: How Microsoft Just Simplified C# Forever.',
    image:
      'https://media.daily.dev/image/upload/s--foaA6JGU--/f_auto/v1722860399/public/Placeholder%2004',
    readTime: 3,
    createdAt: '2026-10-13T12:47:03.686Z',
    numUpvotes: 35,
    numComments: 4,
    tags: ['.net', 'c#'],
    commentsPermalink:
      'https://daily.dev/posts/the-era-of-the-csproj-is-over-how-microsoft-just-simplified-c-forever--vldfw0kzc',
    type: 'article',
    source: {
      id: 'csharpcorner',
      handle: 'csharpcorner',
      name: 'C# Corner',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/ada2d584df6241748fc4e71878dc70a3',
    },
    commenters: [
      {
        id: 'GkdzrXXZUWj7ZNJJbc5oL',
        name: 'Spam Catcher',
        image:
          'https://media.daily.dev/image/upload/s--4C0NYj4f--/f_auto/v1775221074/avatars/avatar_GkdzrXXZUWj7ZNJJbc5oL?_a=BAMAMiWQ0',
      },
      {
        id: 'ryDlbifZ1EuRuh3g51ryC',
        name: 'Risto Tõldsep',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocLDWc6mZn0JwNmXXw6WY0L_HJ6pegzRttooC5VgtXESHSj3MNYx=s96-c',
      },
      {
        id: 'uz5f615kjQWo9X8y9WqPA',
        name: 'Luuk Oosterhuis',
        image: 'https://avatars.githubusercontent.com/u/304927767?v=4',
      },
    ],
    upvoters: [
      {
        id: '8b14tA0wbK4oq7oZ6yz3c',
        name: 'Mr.Vinsay',
        image:
          'https://media.daily.dev/image/upload/s--jsRKVH61--/f_auto/v1742434996/avatars/avatar_8b14tA0wbK4oq7oZ6yz3c',
      },
      {
        id: '1KoK3ZbVoMt52bsjqhFir',
        name: 'Hari Sh',
        image:
          'https://lh3.googleusercontent.com/a/ACg8ocKOvSprlkZKaG8HhUMo6Mhkb5GhdOx9Y8gEmWsuYkWehE5RfX6_=s96-c',
      },
      {
        id: 'yKHbwg5sTwW3ERJtcIlZw',
        name: 'Maxemilien',
        image:
          'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
      },
      {
        id: 'RqSXoxTsTayGUnuM7PksG',
        name: 'Gojo Won',
        image:
          'https://media.daily.dev/image/upload/s--MUqXyx_D--/f_auto/v1791620532/avatars/avatar_RqSXoxTsTayGUnuM7PksG?_a=BAMAMicg0',
      },
    ],
  },
  {
    id: 'wEJ9QyyQu',
    title:
      'Durable Task in the Real World: What Problems Does It Actually Solve?',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/7afa16a8acd14d8765f80b76d7aed3b8?_a=AQAEuop',
    readTime: 28,
    createdAt: '2026-10-12T16:31:05.251Z',
    numUpvotes: 7,
    numComments: 1,
    tags: ['ai-agents', 'azure', '.net', 'distributed-systems'],
    commentsPermalink:
      'https://daily.dev/posts/durable-task-in-the-real-world-what-problems-does-it-actually-solve--wej9qyyqu',
    type: 'article',
    source: {
      id: 'dotnet',
      handle: 'dotnet',
      name: '.NET Blog',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/f23eb59371bd4f07aeef64c4eef73266',
    },
    commenters: [
      {
        id: 'TvTVeiMdkRCqWUDullFmy',
        name: 'kartik-nvjk',
        image:
          'https://media.daily.dev/image/upload/s--3gGgsVCw--/f_auto/v1781456774/avatars/avatar_TvTVeiMdkRCqWUDullFmy?_a=BAMAMiWQ0',
      },
    ],
    upvoters: [
      {
        id: 'TvTVeiMdkRCqWUDullFmy',
        name: 'kartik-nvjk',
        image:
          'https://media.daily.dev/image/upload/s--3gGgsVCw--/f_auto/v1781456774/avatars/avatar_TvTVeiMdkRCqWUDullFmy?_a=BAMAMiWQ0',
      },
      {
        id: 'orjMeK8QKaaVZwGq7ScPz',
        name: 'PDFops',
        image:
          'https://media.daily.dev/image/upload/s---8isRBKc--/f_auto/v1782922291/avatars/avatar_orjMeK8QKaaVZwGq7ScPz?_a=BAMAMicg0',
      },
      {
        id: 'FWD1dNVol198bHmqqV7Tp',
        name: 'Jorge Barsallo',
        image:
          'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
      },
      {
        id: '7wdjBBBVLN4AE9iwcR2FP',
        name: 'Ahmed Khaled',
        image:
          'https://media.daily.dev/image/upload/s--MzlHllrN--/f_auto/v1781384862/avatars/avatar_7wdjBBBVLN4AE9iwcR2FP?_a=BAMAMiWQ0',
      },
    ],
  },
] as unknown as DiscussedPost[];

export const DISCUSSED_IDS_BY_TAG: Record<string, string[]> = {
  javascript: ['rOq2jbA7U', 'jpC9PqWrO', 'k0pYA6Bws', 'sA0ThbCRM'],
  react: ['RFRxDV6yP', 'KGEEoFyhY', 'TUq9ljtcA', 'fN3znnQ8d'],
  devops: ['2a2haeRkb', 'jMjeCGE3O', 'RAK846VKC', 'EGqmEJX0r'],
  ai: ['mR3rTIM1A', 'tM1ZzpHmx', '7lzAMByra', 'xgQ0fDQUs'],
  webdev: ['rGSOrJs7s', 'pE6x5bZ9l', 'd5JYRFE1s', 'nI9mOwmjF'],
  python: ['B6vjNokGa'],
  rust: ['NyXjJiEhS', 'RO9ckv6fD', 'UFbRQrItf', 'Hpnnq0zbW'],
  golang: ['z4NW802Lb', 'n9c6VDWoz', '4hJ6BvVyj', 'RO9ckv6fD'],
  security: [],
  cloud: ['e65ZREHAh'],
  database: ['8Xnys5knX', 'vJIQ1dQwf', '3fCG1sulf', 'odTqsSq3Q'],
  'machine-learning': ['7nSw95Tq8', 'HpB2Ytmzl', '0wGrnTsww'],
  mobile: ['ZzQwAVqQs', 'nSjLzKy7x', 'K3JCIYHUx', 'XKazVB9nF'],
  'open-source': ['6vlJntk5i', 'cnbkFRwj4', 'RJrs8yBKT', 'O8nQgY55i'],
  tools: ['PHGMruiEA', 'OVbf4QuOE', 'mnl4HWGuu', 'cGPz2vCdd'],
  architecture: ['bA0a1CyFR', 'mamRPGADG', 'lquMjhHij', 'YwjHQ87Hd'],
  testing: ['cpO0LBAU7', '6GJ6624bV', 'RrYhaHQnS', '4TaGK9vWS'],
  java: ['FiLYF9a73', 'XF8jARlqA', 'dd6Dmhs1F'],
  'tech-news': ['NwPD4obMN'],
  'data-science': ['kaOf9VQvd', '6vlJntk5i', 'R2ObyuwnI'],
  gaming: ['Rv5U8IeHg', 'YDH1OYvKR', 'SGCF1UKfp', 'Qp7Uaikgi'],
  crypto: ['jkdRMpMCz', 'C00A7hw6I', 'bWHrnTEin'],
  ruby: [],
  elixir: ['DjzxRmiyJ'],
  '.net': ['HgFdVjOSF', 'vLDFW0kZC', 'cpO0LBAU7', 'wEJ9QyyQu'],
};
