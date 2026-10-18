// Six real posts from the feed preview fixture (api.daily.dev `tagFeed`,
// 2026-10-14), so the first-read directions sit on a feed that looks real.
import type { Post } from '@dailydotdev/shared/src/graphql/posts';

export const FIRST_FEED_POSTS = [
  {
    id: 'sA0ThbCRM',
    title: 'JavaScript Event Loop Explained: Queue Tracing and Debugging Guide',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/f1b924a2feb217c0c92e9f117b10cfab?_a=AQAEuop',
    readTime: 16,
    permalink: 'https://api.daily.dev/r/sA0ThbCRM',
    commentsPermalink:
      'https://daily.dev/posts/javascript-event-loop-explained-queue-tracing-and-debugging-guide-sa0thbcrm',
    createdAt: '2026-10-09T16:38:06.765Z',
    numUpvotes: 85,
    numComments: 3,
    numAwards: 0,
    type: 'article',
    tags: ['javascript', 'nodejs'],
    slug: 'javascript-event-loop-explained-queue-tracing-and-debugging-guide-sa0thbcrm',
    domain: 'sitepoint.com',
    source: {
      id: 'sitepoint',
      handle: 'sitepoint',
      name: 'SitePoint',
      permalink: 'https://daily.dev/sources/sitepoint',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/sitepoint',
      type: 'machine',
    },
  },
  {
    id: 'rOq2jbA7U',
    title: 'When you just need to build a tiny desktop app: TinyJS',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/a13d983ce49ad6b07365202a0a638e58?_a=AQAEuop',
    readTime: 5,
    permalink: 'https://api.daily.dev/r/rOq2jbA7U',
    commentsPermalink:
      'https://daily.dev/posts/when-you-just-need-to-build-a-tiny-desktop-app-tinyjs-roq2jba7u',
    createdAt: '2026-10-13T08:12:40.548Z',
    numUpvotes: 48,
    numComments: 8,
    numAwards: 0,
    type: 'article',
    tags: ['javascript', 'electron', 'tauri'],
    slug: 'when-you-just-need-to-build-a-tiny-desktop-app-tinyjs-roq2jba7u',
    domain: 'devclass.com',
    source: {
      id: 'devclass',
      handle: 'devclass',
      name: 'DEVCLASS',
      permalink: 'https://daily.dev/sources/devclass',
      image:
        'https://media.daily.dev/image/upload/s--quq5_zKP--/f_auto/v1732552064/logos/devclass',
      type: 'machine',
    },
  },
  {
    id: 'k0pYA6Bws',
    title: 'Bootstrap 6 Alpha',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/f92ffd8f506843bd90b6e5fe51ea696b?_a=AQAEuop',
    readTime: 12,
    permalink: 'https://api.daily.dev/r/k0pYA6Bws',
    commentsPermalink: 'https://daily.dev/posts/bootstrap-6-alpha-k0pya6bws',
    createdAt: '2026-10-08T17:30:03.360Z',
    numUpvotes: 40,
    numComments: 4,
    numAwards: 0,
    type: 'article',
    tags: ['javascript', 'css', 'bootstrap-css'],
    slug: 'bootstrap-6-alpha-k0pya6bws',
    domain: 'blog.getbootstrap.com',
    source: {
      id: 'bootstrap',
      handle: 'bootstrap',
      name: 'Bootstrap',
      permalink: 'https://daily.dev/sources/bootstrap',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/ea4f1ba8a2d6493e853e77a6002c9c00',
      type: 'machine',
    },
  },
  {
    id: 'jpC9PqWrO',
    title: 'How to compile JavaScript into a single executable',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/d8b3360ff6f26d58bf455d67a4356420?_a=AQAEuop',
    readTime: 16,
    permalink: 'https://api.daily.dev/r/jpC9PqWrO',
    commentsPermalink:
      'https://daily.dev/posts/how-to-compile-javascript-into-a-single-executable-jpc9pqwro',
    createdAt: '2026-10-11T12:28:22.294Z',
    numUpvotes: 37,
    numComments: 6,
    numAwards: 0,
    type: 'article',
    tags: ['javascript', 'nodejs', 'deno', 'bun'],
    slug: 'how-to-compile-javascript-into-a-single-executable-jpc9pqwro',
    domain: 'flaviocopes.com',
    source: {
      id: 'flaviocopes',
      handle: 'flaviocopes',
      name: 'Flavio Copes',
      permalink: 'https://daily.dev/sources/flaviocopes',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/1f2dbd275797411bbd37bfdaaf0951a9',
      type: 'machine',
    },
  },
  {
    id: 'iDTOR7R4O',
    title: "GTA 1's Vehicle Physics Are Now Playable In Your Browser",
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/9ea5507f1553d9ad5f5ca7aa9c51cf67?_a=AQAEuop',
    readTime: 3,
    permalink: 'https://api.daily.dev/r/iDTOR7R4O',
    commentsPermalink:
      'https://daily.dev/posts/gta-1-s-vehicle-physics-are-now-playable-in-your-browser-idtor7r4o',
    createdAt: '2026-10-07T18:32:44.120Z',
    numUpvotes: 25,
    numComments: 0,
    numAwards: 0,
    type: 'article',
    tags: ['javascript', 'game-development', 'physics'],
    slug: 'gta-1-s-vehicle-physics-are-now-playable-in-your-browser-idtor7r4o',
    domain: '80.lv',
    source: {
      id: '80lv',
      handle: '80lv',
      name: '80 LEVEL',
      permalink: 'https://daily.dev/sources/80lv',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/78eebcd76c154e6bbfd565fed7dc4093',
      type: 'machine',
    },
  },
  {
    id: 'RFRxDV6yP',
    title: 'TanStack Charts 1.0',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/2077c4b091e1db9d30b1d1363fdc8e53?_a=AQAEuop',
    readTime: 8,
    permalink: 'https://api.daily.dev/r/RFRxDV6yP',
    commentsPermalink: 'https://daily.dev/posts/tanstack-charts-1-0-rfrxdv6yp',
    createdAt: '2026-10-05T15:46:36.160Z',
    numUpvotes: 172,
    numComments: 14,
    numAwards: 0,
    type: 'article',
    tags: ['javascript', 'react', 'typescript', 'data-visualization'],
    slug: 'tanstack-charts-1-0-rfrxdv6yp',
    domain: 'tanstack.com',
    source: {
      id: 'tanstack-blog',
      handle: 'tanstack-blog',
      name: 'TanStack',
      permalink: 'https://daily.dev/sources/tanstack-blog',
      image:
        'https://media.daily.dev/image/upload/s--TVIrvIT7--/f_auto,q_auto/v1787487634/logos/tanstack-blog?_a=BAMAMicg0',
      type: 'machine',
    },
  },
] as unknown as Post[];
