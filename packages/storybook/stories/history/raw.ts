// Real posts from api.daily.dev (mostDiscussed, mostUpvoted and video
// feeds, 30 days), trimmed to what a history row needs. Regenerate rather
// than hand-edit.

export interface RawPost {
  id: string;
  title: string;
  image: string;
  readTime: number;
  numUpvotes: number;
  numComments: number;
  type: 'article' | 'video';
  summary: string;
  tags: string[];
  permalink: string;
  createdAt: string;
  source: { id: string; name: string; image: string; handle: string };
}

export const rawPosts: RawPost[] = [
  {
    id: 'mGfmauFls',
    title: 'Meet the developers rejecting AI',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/8e8fab1ba0fd06387c4e4e3fbf2388db?_a=AQAEuop',
    readTime: 9,
    numUpvotes: 276,
    numComments: 76,
    type: 'article',
    summary:
      "A growing number of developers are publicly rejecting AI coding tools, even at the cost of jobs, clients, and career stability. Developer Brett Chalupa's viral YouTube video announcing he's quitting AI coding drew over 900,000 views and struck a nerve,…",
    tags: ['career', 'github', 'ai-coding'],
    permalink:
      'https://daily.dev/posts/meet-the-developers-rejecting-ai-mgfmaufls',
    createdAt: '2026-09-21T10:17:06.681Z',
    source: {
      id: 'leaddev',
      name: 'LeadDev',
      image:
        'https://media.daily.dev/image/upload/s--u_Q34nzh--/f_auto,q_auto/v1774514111/logos/leaddev?_a=BAMAMiWQ0',
      handle: 'leaddev',
    },
  },
  {
    id: '05M7JtiW5',
    title: 'New open-source browser Blanc has a different kind of UI',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/ceb2cf53ff81d89f52b06c827607c94c?_a=AQAEuop',
    readTime: 4,
    numUpvotes: 70,
    numComments: 40,
    type: 'article',
    summary:
      "Blanc is a new open-source browser built on Electron/Chromium that ditches the traditional always-visible tab strip and toolbar for a floating 'island' UI that expands to reveal tabs, address bar, search, and history. Developer Anthony J. Loria claims it…",
    tags: ['open-source', 'linux', 'electron'],
    permalink:
      'https://daily.dev/posts/new-open-source-browser-blanc-has-a-different-kind-of-ui-05m7jtiw5',
    createdAt: '2026-09-30T18:23:42.607Z',
    source: {
      id: 'omgub',
      name: 'omg! ubuntu!',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/79e495adb3c3425785b9be27969a2562',
      handle: 'omgub',
    },
  },
  {
    id: '8YmexVcM0',
    title: "If You're Ambitious But Inconsistent (In Tech), Watch This…",
    image: 'https://i.ytimg.com/vi/EcpYM__4c8E/sddefault.jpg',
    readTime: 19,
    numUpvotes: 128,
    numComments: 9,
    type: 'video',
    summary:
      'A video transcript argues that inconsistent, sporadic study is why many aspiring DevOps engineers fail to build real Kubernetes and Docker skills despite watching many hours of tutorials. It proposes a structured daily system: a fixed 30-minute time slot…',
    tags: ['devops', 'career', 'kubernetes'],
    permalink:
      'https://daily.dev/posts/if-you-re-ambitious-but-inconsistent-in-tech-watch-this--8ymexvcm0',
    createdAt: '2026-10-06T13:41:22.092Z',
    source: {
      id: 'techworldwithnana',
      name: 'TechWorld with Nana',
      image:
        'https://media.daily.dev/image/upload/s--k4AAsort--/f_auto/v1728072817/logos/techworldwithnana',
      handle: 'techworldwithnana',
    },
  },
  {
    id: 'ZzQwAVqQs',
    title: "You don't need a Mac to develop iOS apps anymore — Expo blog",
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/09ae39fcfdb242e0d738e48d493a4f9c?_a=AQAEuop',
    readTime: 8,
    numUpvotes: 231,
    numComments: 33,
    type: 'article',
    summary:
      'Expo has launched EAS Simulator, a cloud-hosted iOS Simulator (and Android emulator) streamed to a browser tab, removing the requirement for a physical Mac to develop and test iOS apps. It supports Fast Refresh from Windows or Linux machines (demonstrated…',
    tags: ['ai-agents', 'mobile', 'ios'],
    permalink:
      'https://daily.dev/posts/you-don-t-need-a-mac-to-develop-ios-apps-anymore-expo-blog-zzqwavqqs',
    createdAt: '2026-09-14T13:24:27.718Z',
    source: {
      id: 'expo-blog',
      name: 'Expo Blog',
      image:
        'https://media.daily.dev/image/upload/s--E7LK6L3y--/f_auto,q_auto/v1774179051/logos/expo-blog?_a=BAMAMiWQ0',
      handle: 'expo-blog',
    },
  },
  {
    id: 'j4duNN9S2',
    title: 'Kate is the IDE you need to replace VS Code',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/f7b50d63c52429c585ff15368acb4669?_a=AQAEuop',
    readTime: 3,
    numUpvotes: 64,
    numComments: 30,
    type: 'article',
    summary:
      "Kate, KDE's free and open-source text editor, is presented as a lightweight alternative to VS Code. It offers a clean interface, built-in terminal, code completion for over 200 languages, and plugins for projects and builds, but lacks advanced debugging,…",
    tags: ['open-source', 'linux', 'devtools'],
    permalink:
      'https://daily.dev/posts/kate-is-the-ide-you-need-to-replace-vs-code-j4dunn9s2',
    createdAt: '2026-09-22T13:34:51.680Z',
    source: {
      id: 'xda-developers',
      name: 'XDA Developers',
      image:
        'https://media.daily.dev/image/upload/s--kCg6yyAP--/f_auto,q_auto/v1774964407/logos/xda-developers?_a=BAMAMiWQ0',
      handle: 'xda-developers',
    },
  },
  {
    id: 'JKsEou23l',
    title:
      'NGINX Complete Course: Reverse Proxy, Load Balancing, HTTPS & Docker',
    image: 'https://i.ytimg.com/vi/-sY9OBgohX0/sddefault.jpg',
    readTime: 128,
    numUpvotes: 110,
    numComments: 2,
    type: 'video',
    summary:
      'A hands-on course teaches NGINX from fundamentals to production deployment, covering it as a web server, reverse proxy, load balancer, HTTP cache, and security layer. The course walks through installing NGINX on a Linux VPS and configuring server blocks,…',
    tags: ['docker', 'nginx'],
    permalink:
      'https://daily.dev/posts/nginx-complete-course-reverse-proxy-load-balancing-https-docker-jkseou23l',
    createdAt: '2026-10-06T07:35:16.704Z',
    source: {
      id: 'youtube',
      name: 'YouTube',
      image:
        'https://media.daily.dev/image/upload/s--W5zMumpP--/f_auto/v1725350181/logos/youtube',
      handle: 'youtube',
    },
  },
  {
    id: 'KfPEpQdOl',
    title: "I burned out. Now I don't know how to start again.",
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/1023fb5b09e5b7e99b389a100dd58617?_a=AQAEuop',
    readTime: 3,
    numUpvotes: 125,
    numComments: 26,
    type: 'article',
    summary:
      'A developer shares a personal account of programming burnout, describing the overwhelm and loss of motivation that made it hard to even open a code editor, and asks the community how to start coding again. Commenters offer a range of suggestions - taking…',
    tags: ['open-source', 'productivity', 'mental-health'],
    permalink:
      'https://daily.dev/posts/i-burned-out-now-i-don-t-know-how-to-start-again--kfpepqdol',
    createdAt: '2026-09-28T14:15:08.397Z',
    source: {
      id: 'devto',
      name: 'DEV',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/devto',
      handle: 'devto',
    },
  },
  {
    id: 'XCmmeq8ZC',
    title: "I Think We're Forgetting How to Be Bored",
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/7eeedd824847f90cc09aade5c25acad5?_a=AQAEuop',
    readTime: 8,
    numUpvotes: 82,
    numComments: 25,
    type: 'article',
    summary:
      'A personal essay argues that constantly filling idle moments with phones, feeds, and instant AI answers has quietly eliminated boredom, and with it the undirected mental wandering that produces creative ideas, self-reflection, and tolerance for discomfort.…',
    tags: ['ai', 'productivity'],
    permalink:
      'https://daily.dev/posts/i-think-we-re-forgetting-how-to-be-bored-xcmmeq8zc',
    createdAt: '2026-10-07T17:01:04.220Z',
    source: {
      id: 'devto',
      name: 'DEV',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/devto',
      handle: 'devto',
    },
  },
  {
    id: '3GqfG5xk2',
    title: '12 things I miss since coding died',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/8ebd7b0dffeca7de6c43066758debf09?_a=AQAEuop',
    readTime: 10,
    numUpvotes: 134,
    numComments: 22,
    type: 'article',
    summary:
      'A nostalgic, personal reflection from an engineering manager mourning the craft of hand-written coding now that AI coding assistants like Claude have taken over much of the work. The author lists twelve experiences he misses—debugging mysteries, satisfying…',
    tags: ['career', 'leadership', 'ai-coding'],
    permalink:
      'https://daily.dev/posts/12-things-i-miss-since-coding-died-3gqfg5xk2',
    createdAt: '2026-10-06T06:05:48.654Z',
    source: {
      id: 'zaidesanton',
      name: 'Manager.dev',
      image:
        'https://media.daily.dev/image/upload/s--nwW90hoG--/f_auto/v1731601654/logos/Logo',
      handle: 'zaidesanton',
    },
  },
  {
    id: 'Hd2eBXFkz',
    title: 'Anthropic researchers are quitting... and now we know why',
    image: 'https://i.ytimg.com/vi/7r4ikZHm9AI/sddefault.jpg',
    readTime: 6,
    numUpvotes: 109,
    numComments: 21,
    type: 'video',
    summary:
      "A satirical, meme-heavy recap covers a viral resignation from an AI researcher warning that Anthropic and OpenAI are recklessly racing toward superintelligence, alongside Anthropic's own 154-page threat report detailing eight months of Claude misuse:…",
    tags: ['machine-learning', 'claude', 'anthropic'],
    permalink:
      'https://daily.dev/posts/anthropic-researchers-are-quitting-and-now-we-know-why-hd2ebxfkz',
    createdAt: '2026-09-15T17:50:27.728Z',
    source: {
      id: 'fireship',
      name: 'Fireship',
      image:
        'https://media.daily.dev/image/upload/s--75ndqrkr--/f_auto,t_logo/v1702882094/logos/fireship.jpg',
      handle: 'fireship',
    },
  },
  {
    id: 'yw5eXNpFH',
    title:
      "VS Code is the best writing app I've used, and I've not written a line of code in it for weeks",
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/c400f906aef9e26635846a99538903a5?_a=AQAEuop',
    readTime: 4,
    numUpvotes: 86,
    numComments: 22,
    type: 'article',
    summary:
      'An unconventional use case for VS Code is explored: as a full-fledged writing environment rather than a code editor. Zen Mode strips away UI clutter for distraction-free drafting, flexible pane layouts let writers view multiple documents side by side,…',
    tags: ['productivity', 'git', 'vscode'],
    permalink:
      'https://daily.dev/posts/vs-code-is-the-best-writing-app-i-ve-used-and-i-ve-not-written-a-line-of-code-in-it-for-weeks-yw5exnpfh',
    createdAt: '2026-09-16T14:33:31.634Z',
    source: {
      id: 'xda-developers',
      name: 'XDA Developers',
      image:
        'https://media.daily.dev/image/upload/s--kCg6yyAP--/f_auto,q_auto/v1774964407/logos/xda-developers?_a=BAMAMiWQ0',
      handle: 'xda-developers',
    },
  },
  {
    id: 'nkV09W80e',
    title: 'Advice to a beginning software engineer',
    image:
      'https://media.daily.dev/image/upload/s--CxzD6vbw--/f_auto/v1722860399/public/Placeholder%2005',
    readTime: 8,
    numUpvotes: 27,
    numComments: 21,
    type: 'article',
    summary:
      'An opinion piece offering career advice to junior software engineers navigating the post-ZIRP era and the rise of AI agents. The author warns against politically risky ZIRP-era advice like unionizing or picking fights, urging beginners instead to stay…',
    tags: ['career', 'ai-coding'],
    permalink:
      'https://daily.dev/posts/advice-to-a-beginning-software-engineer-nkv09w80e',
    createdAt: '2026-09-26T02:27:04.911Z',
    source: {
      id: 'seangoedecke',
      name: 'sean goedecke',
      image:
        'https://media.daily.dev/image/upload/s--WNgiZyDx--/f_auto,q_auto/v1765713419/logos/seangoedecke',
      handle: 'seangoedecke',
    },
  },
  {
    id: 'B2K4Imgfa',
    title: 'here is how to write BETTER frontend code',
    image: 'https://i.ytimg.com/vi/df2H7reofa8/sddefault.jpg',
    readTime: 4,
    numUpvotes: 82,
    numComments: 9,
    type: 'video',
    summary:
      'A YouTube-style rundown covers five lesser-known built-in browser features that can replace common JavaScript workarounds: requestIdleCallback for scheduling background work without blocking the main thread, the CSS :has() selector for parent-based styling…',
    tags: ['javascript', 'performance', 'css'],
    permalink:
      'https://daily.dev/posts/here-is-how-to-write-better-frontend-code-b2k4imgfa',
    createdAt: '2026-09-23T14:01:23.293Z',
    source: {
      id: 'codehead',
      name: 'CodeHead',
      image:
        'https://media.daily.dev/image/upload/s--ywzrIEkA--/f_auto/v1745508579/logos/codehead',
      handle: 'codehead',
    },
  },
  {
    id: 'mYGYNzanE',
    title: 'Yes, no AI is now a feature',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/6acb7cbbad8ab74983fb6fe6a57e061e?_a=AQAEuop',
    readTime: 4,
    numUpvotes: 155,
    numComments: 20,
    type: 'article',
    summary:
      'The Document Foundation explains why LibreOffice 26.8 ships without any default AI features, laying out six principles that any AI integration must satisfy: user-controlled execution location, no unauthorized data transmission, no telemetry, no…',
    tags: ['ai', 'open-source', 'linux'],
    permalink: 'https://daily.dev/posts/yes-no-ai-is-now-a-feature-mygynzane',
    createdAt: '2026-09-28T12:16:24.741Z',
    source: {
      id: 'lobsters',
      name: 'Lobsters',
      image:
        'https://media.daily.dev/image/upload/s--tl8v_Fku--/f_auto,t_logo/v1698841318/logos/lobste.jpg',
      handle: 'lobsters',
    },
  },
  {
    id: 'AzxnBHN3V',
    title:
      "Stop building side projects. Nobody cares — and here's the uncomfortable math.",
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/279f238255e1e5efc73a2a728f930e04?_a=AQAEuop',
    readTime: 8,
    numUpvotes: 48,
    numComments: 20,
    type: 'article',
    summary:
      "A developer argues that side projects have lost their signaling value now that AI can scaffold a polished app in an afternoon, making 'I built X repos' meaningless to recruiters. The real argument: the hard part was never writing code, it was getting a…",
    tags: ['ai', 'webdev', 'career'],
    permalink:
      'https://daily.dev/posts/stop-building-side-projects-nobody-cares-and-here-s-the-uncomfortable-math--azxnbhn3v',
    createdAt: '2026-09-25T01:49:39.391Z',
    source: {
      id: 'devto',
      name: 'DEV',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/devto',
      handle: 'devto',
    },
  },
  {
    id: 'oBDUfGZ7N',
    title: "Dear Coder: Open This If You're Feeling AI FOMO",
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/abc7e2dc25f7798fbc226f5658d2ed86?_a=AQAEuop',
    readTime: 1,
    numUpvotes: 189,
    numComments: 19,
    type: 'article',
    summary:
      'An opinion piece addresses AI FOMO among developers, arguing that fundamentals like avoiding N+1 problems, adding pagination, and preventing SQL injection matter more than chasing every new AI trend (MCP, agents, new models). The author encourages picking…',
    tags: ['ai', 'career', 'ai-coding'],
    permalink:
      'https://daily.dev/posts/dear-coder-open-this-if-you-re-feeling-ai-fomo-obdufgz7n',
    createdAt: '2026-09-28T23:04:16.023Z',
    source: {
      id: 'devto',
      name: 'DEV',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/devto',
      handle: 'devto',
    },
  },
  {
    id: '8eOv3hbFq',
    title: 'CSS animations to bring your site to life',
    image: 'https://i.ytimg.com/vi/ZSNiSdB8Ens/sddefault.jpg',
    readTime: 16,
    numUpvotes: 78,
    numComments: 1,
    type: 'video',
    summary:
      'A walkthrough of building animated expandable info cards using the native HTML details/summary elements combined with modern CSS features like content-visibility, transition-behavior: allow-discrete, and interpolate-size. Covers structuring content with…',
    tags: ['css'],
    permalink:
      'https://daily.dev/posts/css-animations-to-bring-your-site-to-life-8eov3hbfq',
    createdAt: '2026-09-30T13:16:20.502Z',
    source: {
      id: 'kevinpowell',
      name: 'Kevin Powell',
      image:
        'https://media.daily.dev/image/upload/s--XK5Rf0kM--/f_auto/v1717745137/logos/kevinpowell',
      handle: 'kevinpowell',
    },
  },
  {
    id: 'VNv8IMYss',
    title: 'Saving another 100TB of RAM with math (and Rust)',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/97e0fa12fbd2fe84838d03e16f3863fc?_a=AQAEuop',
    readTime: 13,
    numUpvotes: 109,
    numComments: 18,
    type: 'article',
    summary:
      'Cloudflare engineers reduced RAM usage in their Pingora Backend Router (PBR) load-balancing service by over 100TB globally through changes to their open-source pingora-ketama consistent hashing library. They explain how consistent hashing distributes…',
    tags: ['rust', 'cloudflare'],
    permalink:
      'https://daily.dev/posts/saving-another-100tb-of-ram-with-math-and-rust--vnv8imyss',
    createdAt: '2026-09-18T17:26:37.198Z',
    source: {
      id: 'cloudflare',
      name: 'Cloudflare',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/38522e1d11354cd6b7af66f9d4316735',
      handle: 'cloudflare',
    },
  },
  {
    id: 'SEJGD2oAU',
    title:
      'The Feature Flag Graveyard: How a Safety Net Becomes Technical Debt',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/c22d42d4470a95025a6bf419bb112faa?_a=AQAEuop',
    readTime: 5,
    numUpvotes: 16,
    numComments: 16,
    type: 'article',
    summary:
      'Feature flags introduced for safe releases often accumulate into unmanaged technical debt when nobody removes them after rollout. Uncleaned flags create combinatorial explosion of untested code paths, cognitive overhead during refactors, and real…',
    tags: ['architecture', 'cicd', 'technical-debt'],
    permalink:
      'https://daily.dev/posts/the-feature-flag-graveyard-how-a-safety-net-becomes-technical-debt-sejgd2oau',
    createdAt: '2026-09-13T14:08:47.282Z',
    source: {
      id: 'codecraftdiary',
      name: 'CodeCraft Diary',
      image:
        'https://media.daily.dev/image/upload/s--yr9zQpW7--/f_auto,q_auto/v1774964366/logos/codecraftdiary?_a=BAMAMiWQ0',
      handle: 'codecraftdiary',
    },
  },
  {
    id: '1XMQ9zlpA',
    title: 'An ex-OpenAI researcher just deleted language from the LLM...',
    image: 'https://i.ytimg.com/vi/TbkUKCm3CHQ/sddefault.jpg',
    readTime: 5,
    numUpvotes: 67,
    numComments: 9,
    type: 'video',
    summary:
      "A satirical, tongue-in-cheek video introduces 'Jev', a supposed new 'system one' AI model from ex-OpenAI researcher Diego Almeida's startup Typesafe AI (which raised $40 million). Jev is pitched as a fast, cheap, type-safe classifier that returns…",
    tags: ['machine-learning', 'llm', 'ai-agents'],
    permalink:
      'https://daily.dev/posts/an-ex-openai-researcher-just-deleted-language-from-the-llm--1xmq9zlpa',
    createdAt: '2026-09-21T17:55:39.265Z',
    source: {
      id: 'fireship',
      name: 'Fireship',
      image:
        'https://media.daily.dev/image/upload/s--75ndqrkr--/f_auto,t_logo/v1702882094/logos/fireship.jpg',
      handle: 'fireship',
    },
  },
  {
    id: '4I7VllOCg',
    title: 'Are LLMs still surprisingly bad at some simple tasks?',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/5546fa589075a9cb8277f30c15671d82?_a=AQAEuop',
    readTime: 8,
    numUpvotes: 52,
    numComments: 15,
    type: 'article',
    summary:
      'A year-long follow-up experiment tests whether modern LLMs (Gemini Flash and its extended thinking mode, Claude, Perplexity, and an unnamed GPT model) can correctly answer which top-level domains share names with valid HTML5 elements. Every model except…',
    tags: ['webdev', 'llm', 'html'],
    permalink:
      'https://daily.dev/posts/are-llms-still-surprisingly-bad-at-some-simple-tasks--4i7vllocg',
    createdAt: '2026-09-22T11:39:32.994Z',
    source: {
      id: 'shkspr',
      name: 'Terence Eden',
      image:
        'https://media.daily.dev/image/upload/s--nhylgPuf--/f_auto,q_auto/v1774964413/logos/shkspr?_a=BAMAMiWQ0',
      handle: 'shkspr',
    },
  },
  {
    id: 'IGmufOLb8',
    title: 'In This Game, Your Job Is to Peel an Endless Pile of Potatoes',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/38b7554da366447a9b5e498789e4fac0?_a=AQAEuop',
    readTime: 2,
    numUpvotes: 35,
    numComments: 15,
    type: 'article',
    summary:
      'Golden Horn Studios is developing Potato Please, a first-person physics-based simulation game where players peel an endless supply of potatoes to feed an army. The game features realistic vegetable-peeling mechanics, a Soviet-themed setting, and…',
    tags: ['game-development'],
    permalink:
      'https://daily.dev/posts/in-this-game-your-job-is-to-peel-an-endless-pile-of-potatoes-igmufolb8',
    createdAt: '2026-09-22T11:36:22.016Z',
    source: {
      id: '80lv',
      name: '80 LEVEL',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/78eebcd76c154e6bbfd565fed7dc4093',
      handle: '80lv',
    },
  },
  {
    id: 'vIbGyAxUC',
    title: 'Do you use :visited on links?',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/54fb83d5ab2a5d52e7027420e38f8dea?_a=AQAEuop',
    readTime: 2,
    numUpvotes: 17,
    numComments: 15,
    type: 'article',
    summary:
      'A blogger reflects on the CSS :visited pseudo-class, noting that most sites (including his own, previously) style visited links identically to unvisited ones. After noticing Miniflux, his RSS reader, usefully colors visited links purple, he decided to add…',
    tags: ['css', 'ui-design'],
    permalink: 'https://daily.dev/posts/do-you-use-visited-on-links--vibgyaxuc',
    createdAt: '2026-09-21T14:50:52.421Z',
    source: {
      id: 'lobsters',
      name: 'Lobsters',
      image:
        'https://media.daily.dev/image/upload/s--tl8v_Fku--/f_auto,t_logo/v1698841318/logos/lobste.jpg',
      handle: 'lobsters',
    },
  },
  {
    id: 'hsSp9jc9T',
    title: "is web dev finally back on it's feet??",
    image: 'https://i.ytimg.com/vi/7C-1t32dAqY/sddefault.jpg',
    readTime: 4,
    numUpvotes: 67,
    numComments: 9,
    type: 'video',
    summary:
      "The webdev job market is examined through layoff and hiring data: 2024 saw over 152K tech layoffs and a 25% drop in new grad hiring, fueling 'webdev is dead' takes alongside AI coding tools, no-code platforms, and framework fatigue. But recent CompTIA data…",
    tags: ['webdev', 'career', 'nextjs'],
    permalink:
      'https://daily.dev/posts/is-web-dev-finally-back-on-it-s-feet--hssp9jc9t',
    createdAt: '2026-09-14T14:50:19.552Z',
    source: {
      id: 'codehead',
      name: 'CodeHead',
      image:
        'https://media.daily.dev/image/upload/s--ywzrIEkA--/f_auto/v1745508579/logos/codehead',
      handle: 'codehead',
    },
  },
  {
    id: 'DVZBShH7e',
    title: 'The Quiet Weight of Working in Tech in the AI Era',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/a2a9dae44fb61763837b63aeacaa9763?_a=AQAEuop',
    readTime: 9,
    numUpvotes: 81,
    numComments: 15,
    type: 'article',
    summary:
      'A personal essay reflects on a distinct kind of exhaustion developers face in the AI era — not the familiar crunch-driven burnout, but a constant, low-grade pressure to keep up with rapidly shifting tools, models, and expectations that never lets up. The…',
    tags: ['ai', 'career', 'mental-health'],
    permalink:
      'https://daily.dev/posts/the-quiet-weight-of-working-in-tech-in-the-ai-era-dvzbshh7e',
    createdAt: '2026-09-15T08:32:46.838Z',
    source: {
      id: 'devto',
      name: 'DEV',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/devto',
      handle: 'devto',
    },
  },
  {
    id: 'PFMO5JfPF',
    title:
      "I replaced VS Code and Notepad++ with this one free open-source editor, and I haven't looked back",
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/552034067cc56c2fa9e76385905cb20f?_a=AQAEuop',
    readTime: 4,
    numUpvotes: 49,
    numComments: 14,
    type: 'article',
    summary:
      'A personal account of switching from using both Notepad++ and VS Code to relying primarily on Zed, an open-source code editor. Zed handles quick text edits well and, thanks to language server support, also provides autocomplete, diagnostics,…',
    tags: ['open-source', 'devtools', 'vscode'],
    permalink:
      'https://daily.dev/posts/i-replaced-vs-code-and-notepad-with-this-one-free-open-source-editor-and-i-haven-t-looked-back-pfmo5jfpf',
    createdAt: '2026-09-29T14:33:10.356Z',
    source: {
      id: 'xda-developers',
      name: 'XDA Developers',
      image:
        'https://media.daily.dev/image/upload/s--kCg6yyAP--/f_auto,q_auto/v1774964407/logos/xda-developers?_a=BAMAMiWQ0',
      handle: 'xda-developers',
    },
  },
  {
    id: 'nR7pSagww',
    title: 'AI loves rewriting codebases to Rust...',
    image: 'https://i.ytimg.com/vi/Z0Oq7gFSy3w/sddefault.jpg',
    readTime: 8,
    numUpvotes: 65,
    numComments: 6,
    type: 'video',
    summary:
      "Microsoft rewrote the GitHub Copilot agent runtime from TypeScript to Rust using a single engineer guided by Copilot itself, taking an incremental in-place rewrite approach instead of a big-bang rewrite like Bun's Zig-to-Rust migration. The switch removed…",
    tags: ['ai-agents', 'github', 'typescript'],
    permalink:
      'https://daily.dev/posts/ai-loves-rewriting-codebases-to-rust--nr7psagww',
    createdAt: '2026-09-25T15:02:00.445Z',
    source: {
      id: 'letsgetrusty',
      name: "Let's Get Rusty",
      image:
        'https://media.daily.dev/image/upload/s--iqd05ejH--/f_auto/v1725035314/logos/letsgetrusty',
      handle: 'letsgetrusty',
    },
  },
  {
    id: 'tWZXmJOjb',
    title: 'Hot Exit in Visual Studio',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/2d85f9c46d2c804a04b9b40b08fcd991?_a=AQAEuop',
    readTime: 2,
    numUpvotes: 67,
    numComments: 14,
    type: 'article',
    summary:
      "Visual Studio 2026 (September update, Insiders channel) introduces Hot Exit, a feature borrowed from VS Code that preserves unsaved files, edits, undo history, and window layout when you close the IDE. It's off by default and must be enabled under Tools →…",
    tags: ['devtools', 'vscode', 'visual-studio'],
    permalink: 'https://daily.dev/posts/hot-exit-in-visual-studio-twzxmjojb',
    createdAt: '2026-09-23T05:02:04.451Z',
    source: {
      id: 'bartwullems',
      name: 'The Art of Simplicity',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/52b68c70636d44f0901ae7cd107c9438',
      handle: 'bartwullems',
    },
  },
  {
    id: '6lmauEkPV',
    title:
      'Clean Code Is Not the Same as Clear Code: Comments Were Never the Problem',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/5170bd66ca346e5765e120a8576cd412?_a=AQAEuop',
    readTime: 12,
    numUpvotes: 75,
    numComments: 14,
    type: 'article',
    summary:
      "An engineering opinion piece argues that the 'clean code means no comments' philosophy is misguided, showing that some code (like dense regex) needs translation and some decisions (like a seemingly arbitrary constant of 47 instead of 50) need their…",
    tags: ['c#'],
    permalink:
      'https://daily.dev/posts/clean-code-is-not-the-same-as-clear-code-comments-were-never-the-problem-6lmauekpv',
    createdAt: '2026-09-22T10:09:26.865Z',
    source: {
      id: 'devto',
      name: 'DEV',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/devto',
      handle: 'devto',
    },
  },
  {
    id: '8bYgWtyr3',
    title: 'We now auto-approve and merge 15% of PRs',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/53ec4e15aa5ec4539937fc66efde34e9?_a=AQAEuop',
    readTime: 4,
    numUpvotes: 42,
    numComments: 14,
    type: 'article',
    summary:
      'An engineering lead describes building a GitHub Action that automatically approves and merges low-risk pull requests without human review, aiming to fix code review as a bottleneck to team velocity. The system relies on custom deterministic linters,…',
    tags: ['testing', 'cicd', 'leadership'],
    permalink:
      'https://daily.dev/posts/we-now-auto-approve-and-merge-15-of-prs-8bygwtyr3',
    createdAt: '2026-09-19T16:26:55.757Z',
    source: {
      id: 'swizec',
      name: 'swizec.com',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/a0733daf6e014e23a638ded7f2d4cd70',
      handle: 'swizec',
    },
  },
  {
    id: 'jxY8xlIqz',
    title: 'Skills Modern Devs Should Focus On',
    image: 'https://i.ytimg.com/vi/xWJ8sv2Jhag/sddefault.jpg',
    readTime: 5,
    numUpvotes: 67,
    numComments: 18,
    type: 'video',
    summary:
      'A YouTube-style video argues that since AI can generate code quickly but unreliably, the core developer skills worth building are no longer typing speed but judgment: knowing fundamentals (networking, HTTP, browsers), system design (caching, queues, CAP…',
    tags: ['career', 'cicd', 'sql'],
    permalink:
      'https://daily.dev/posts/skills-modern-devs-should-focus-on-jxy8xliqz',
    createdAt: '2026-10-06T15:00:45.352Z',
    source: {
      id: 'codehead',
      name: 'CodeHead',
      image:
        'https://media.daily.dev/image/upload/s--ywzrIEkA--/f_auto/v1745508579/logos/codehead',
      handle: 'codehead',
    },
  },
  {
    id: 'EYFcaEcVd',
    title: 'The absolute best AI tools to use in September 2026',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/13b7cf6d7f97c055caf6d12c0cf5e37f?_a=AQAEuop',
    readTime: 1,
    numUpvotes: 65,
    numComments: 14,
    type: 'article',
    summary:
      'A satirical, one-line post titled as if it were a definitive roundup of the best AI tools, but the entire body simply reads "It depends!" — a joke about how pointless and time-sensitive these listicle-style rankings are.',
    tags: ['ai'],
    permalink:
      'https://daily.dev/posts/the-absolute-best-ai-tools-to-use-in-september-2026-eyfcaecvd',
    createdAt: '2026-09-17T23:00:49.709Z',
    source: {
      id: 'cassidoo',
      name: "Cassidy's blog",
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/966796fea9ad4a66a968cfb562c59ad7',
      handle: 'cassidoo',
    },
  },
  {
    id: 'nZQKcHaM8',
    title: 'Agentic Skill Decay',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/ea2545340d64b8d4ec6bb32838907ad5?_a=AQAEuop',
    readTime: 19,
    numUpvotes: 89,
    numComments: 13,
    type: 'article',
    summary:
      'Addy Osmani argues that relying on coding agents can short-circuit the trial-and-error process that historically built engineering expertise. He cites an Anthropic study where junior engineers using AI assistants scored 50% on a follow-up quiz about a…',
    tags: ['ai-coding', 'claude-code', 'code-review'],
    permalink: 'https://daily.dev/posts/agentic-skill-decay-nzqkcham8',
    createdAt: '2026-09-20T18:35:04.149Z',
    source: {
      id: 'addy',
      name: 'Addy Osmani',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/858094e1be9f4b0d9bef229d84ab12b7',
      handle: 'addy',
    },
  },
  {
    id: 'JgSsSO5Gn',
    title: "Why Your Company Copied Netflix's Architecture",
    image: 'https://i.ytimg.com/vi/I_of74HSHiA/sddefault.jpg',
    readTime: 22,
    numUpvotes: 65,
    numComments: 5,
    type: 'video',
    summary:
      "A YouTube video traces the real history behind Netflix's shift to microservices and AWS, arguing that the popular narrative (a 2008 database outage caused the redesign) is misleading. The actual 2010 Netflix blog post cited unpredictable growth, wanting to…",
    tags: ['aws', 'career', 'microservices'],
    permalink:
      'https://daily.dev/posts/why-your-company-copied-netflix-s-architecture-jgssso5gn',
    createdAt: '2026-09-14T20:33:16.252Z',
    source: {
      id: 'fknight',
      name: 'ForrestKnight',
      image:
        'https://media.daily.dev/image/upload/s--dRXNb2_3--/f_auto/v1745508651/logos/fknight',
      handle: 'fknight',
    },
  },
  {
    id: 'tbbNjYj52',
    title: 'How Booking.com cut Node.js costs by 38% with Watt',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/825b8ae5d8b786796324258dde947b6a?_a=AQAEuop',
    readTime: 4,
    numUpvotes: 71,
    numComments: 12,
    type: 'article',
    summary:
      "Booking.com published a case study detailing how migrating their main Node.js rendering service from pm2 to Platformatic's Watt cut compute costs by 38%, using 30% fewer pods and 20% less memory per pod, while lowering latency by up to 10% at the p75, p99,…",
    tags: ['performance', 'nodejs'],
    permalink:
      'https://daily.dev/posts/how-booking-com-cut-node-js-costs-by-38-with-watt-tbbnjyj52',
    createdAt: '2026-10-05T10:08:46.097Z',
    source: {
      id: 'nodeland',
      name: 'Adventures in Nodeland',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/4ec40f35e6e440c7ab313b37d0039595',
      handle: 'nodeland',
    },
  },
  {
    id: '7p9nRlTLf',
    title: 'Microsoft doubles down on Rust',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/13209d6f78bf1f46ebda81f5dff37704?_a=AQAEuop',
    readTime: 7,
    numUpvotes: 29,
    numComments: 12,
    type: 'article',
    summary:
      'Microsoft has promoted Rust to Tier-1 language status internally, alongside C# and TypeScript, giving it a complete tool chain, Windows/Azure integration, and compliance with internal software lifecycle requirements. A key enabler is a new internal code…',
    tags: ['microsoft', 'rust'],
    permalink:
      'https://daily.dev/posts/microsoft-doubles-down-on-rust-7p9nrltlf',
    createdAt: '2026-10-01T09:06:26.541Z',
    source: {
      id: 'infoworld',
      name: 'InfoWorld',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/bf6d68a999064029b0bb09aa6268f1f3',
      handle: 'infoworld',
    },
  },
  {
    id: 'RFRxDV6yP',
    title: 'TanStack Charts 1.0',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/2077c4b091e1db9d30b1d1363fdc8e53?_a=AQAEuop',
    readTime: 8,
    numUpvotes: 157,
    numComments: 11,
    type: 'article',
    summary:
      'TanStack Charts has reached its 1.0 release. Author Tanner Linsley describes a charting library built around composable marks (lines, bars, points), scales, axes, and interactions, inspired by the Grammar of Graphics and Observable Plot. The library…',
    tags: ['javascript', 'react', 'typescript'],
    permalink: 'https://daily.dev/posts/tanstack-charts-1-0-rfrxdv6yp',
    createdAt: '2026-10-05T15:46:36.160Z',
    source: {
      id: 'tanstack-blog',
      name: 'TanStack',
      image:
        'https://media.daily.dev/image/upload/s--TVIrvIT7--/f_auto,q_auto/v1787487634/logos/tanstack-blog?_a=BAMAMicg0',
      handle: 'tanstack-blog',
    },
  },
  {
    id: '3wLIGsLJr',
    title: 'From Next.js To TanStack Start: Lovable Shows Why',
    image: 'https://i.ytimg.com/vi/EZdxLylUFAc/sddefault.jpg',
    readTime: 27,
    numUpvotes: 58,
    numComments: 1,
    type: 'video',
    summary:
      'Several companies including Lovable, Railway, and inest have migrated their production frontends from Next.js to TanStack Start, citing faster dev server startup, lower RAM usage, simpler mental models (fewer server/client boundary abstractions), and…',
    tags: ['webdev', 'react', 'nextjs'],
    permalink:
      'https://daily.dev/posts/from-next-js-to-tanstack-start-lovable-shows-why-3wligsljr',
    createdAt: '2026-09-16T10:33:51.897Z',
    source: {
      id: 'bytegrad',
      name: 'ByteGrad',
      image:
        'https://media.daily.dev/image/upload/s--UnJ6vKLR--/f_auto/v1732552127/logos/bytegrad',
      handle: 'bytegrad',
    },
  },
  {
    id: 'y1PrYXmAZ',
    title:
      'The LLM Blindspot: Why Models Forget What’s in the Middle of Your Prompt',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/85effa6b12c447702d718df867c392dd?_a=AQAEuop',
    readTime: 13,
    numUpvotes: 53,
    numComments: 11,
    type: 'article',
    summary:
      "LLMs often fail to use information buried in the middle of a long prompt, even when that information is clearly stated and within the model's context window, a phenomenon called the 'lost in the middle' effect. The 2023 'Lost in the Middle' study found a…",
    tags: ['llm', 'deep-learning', 'ai-coding'],
    permalink:
      'https://daily.dev/posts/the-llm-blindspot-why-models-forget-what-s-in-the-middle-of-your-prompt-y1pryxmaz',
    createdAt: '2026-10-05T15:33:40.599Z',
    source: {
      id: 'bytebytego',
      name: 'ByteByteGo',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/35be29234ee14d01a9cd049c52e12753',
      handle: 'bytebytego',
    },
  },
  {
    id: 'y1ICA44vN',
    title: 'Goodbye WordPress',
    image:
      'https://i0.wp.com/nolanlawson.com/wp-content/uploads/2026/09/new-screenshot-6-optimized.png?fit=1200%2C701&ssl=1',
    readTime: 7,
    numUpvotes: 51,
    numComments: 11,
    type: 'article',
    summary:
      'A long-time WordPress.com blogger explains why they migrated to a self-hosted Astro site on Cloudflare, citing recent WordPress drama, the clunky Gutenberg editor, and the $110/year cost. The migration preserved Markdown content but dropped comments,…',
    tags: ['wordpress', 'claude', 'self-hosting'],
    permalink: 'https://daily.dev/posts/goodbye-wordpress-y1ica44vn',
    createdAt: '2026-10-01T00:41:38.376Z',
    source: {
      id: 'nolanlawson',
      name: 'Read the Tea Leaves',
      image:
        'https://media.daily.dev/image/upload/s--hCPaPAOM--/f_auto/v1727446484/logos/nolanlawson',
      handle: 'nolanlawson',
    },
  },
  {
    id: 'D8LNYgDuu',
    title: 'Why the best programmers are switching to Linux',
    image: 'https://i.ytimg.com/vi/_5oi5O2sNyI/sddefault.jpg',
    readTime: 6,
    numUpvotes: 53,
    numComments: 18,
    type: 'video',
    summary:
      'A YouTube-style opinion rant argues that top programmers are increasingly ditching macOS for Linux, citing file-system performance benchmarks (Linux reportedly 175% faster than Mac and 355% faster than Windows 11 on pnpm install and git clean per…',
    tags: ['linux', 'ai-agents', 'cicd'],
    permalink:
      'https://daily.dev/posts/why-the-best-programmers-are-switching-to-linux-d8lnygduu',
    createdAt: '2026-10-08T15:13:59.344Z',
    source: {
      id: 'bigboxswe',
      name: 'bigboxSWE',
      image:
        'https://media.daily.dev/image/upload/s--KMRj-zRu--/f_auto/v1711188128/logos/bigboxswe',
      handle: 'bigboxswe',
    },
  },
  {
    id: 'DFJTpz2Tw',
    title:
      'Portainer stopped supporting its community edition, so I switched to this simpler Docker manager instead',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/eb60179569ab191256f708d083dfa02b?_a=AQAEuop',
    readTime: 5,
    numUpvotes: 44,
    numComments: 11,
    type: 'article',
    summary:
      'A long-time Portainer user explains switching to Dockge, a simpler open-source Docker Compose manager from the creator of Uptime Kuma, after Portainer kept its Community Edition on an older codebase while pivoting direction. Dockge treats Compose files on…',
    tags: ['docker', 'self-hosting', 'docker-compose'],
    permalink:
      'https://daily.dev/posts/portainer-stopped-supporting-its-community-edition-so-i-switched-to-this-simpler-docker-manager-ins-dfjtpz2tw',
    createdAt: '2026-09-30T23:01:32.743Z',
    source: {
      id: 'xda-developers',
      name: 'XDA Developers',
      image:
        'https://media.daily.dev/image/upload/s--kCg6yyAP--/f_auto,q_auto/v1774964407/logos/xda-developers?_a=BAMAMiWQ0',
      handle: 'xda-developers',
    },
  },
  {
    id: 'Lfny6jDqe',
    title: 'Docker: No space left on device',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/57d1d49bb667f52bc087e0f188c0687c?_a=AQAEuop',
    readTime: 2,
    numUpvotes: 98,
    numComments: 11,
    type: 'article',
    summary:
      "A developer hit a 'no space left on device' error from Docker caused by a full disk on the Docker engine. The fix walks through diagnosing usage with docker system df (and its verbose flag), then cleaning up with docker container prune, docker image prune,…",
    tags: ['docker', 'containers'],
    permalink:
      'https://daily.dev/posts/docker-no-space-left-on-device-lfny6jdqe',
    createdAt: '2026-09-29T05:46:18.107Z',
    source: {
      id: 'bartwullems',
      name: 'The Art of Simplicity',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/52b68c70636d44f0901ae7cd107c9438',
      handle: 'bartwullems',
    },
  },
  {
    id: 'rrFPegQZT',
    title: "Everyone's learning to prompt better. That's the wrong skill.",
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/d4dbc5b20c6f2d9ca1238ce4a32378aa?_a=AQAEuop',
    readTime: 10,
    numUpvotes: 53,
    numComments: 11,
    type: 'article',
    summary:
      'An opinion piece argues that prompt engineering is the wrong skill to chase because a better prompt only makes AI output more convincing, not more correct — and correctness is decided at review time, not at the moment of asking. The author illustrates this…',
    tags: ['ai', 'webdev', 'career'],
    permalink:
      'https://daily.dev/posts/everyone-s-learning-to-prompt-better-that-s-the-wrong-skill--rrfpegqzt',
    createdAt: '2026-09-28T07:19:06.907Z',
    source: {
      id: 'devto',
      name: 'DEV',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/devto',
      handle: 'devto',
    },
  },
  {
    id: 'TRyjlkOFY',
    title: "PewDiePie didn't trust Big AI... so he built his own",
    image: 'https://i.ytimg.com/vi/_5p1_TNSWqQ/sddefault.jpg',
    readTime: 5,
    numUpvotes: 53,
    numComments: 10,
    type: 'video',
    summary:
      "PewDiePie's open-source project Odysius (nearly 90,000 GitHub stars) has a new fine-tuned, uncensored model called Ajax, built on top of Alibaba's Qwen 3.5B parameter model. The video explains how he attempted to distill knowledge from OpenAI's models…",
    tags: ['machine-learning', 'deep-learning', 'openai'],
    permalink:
      'https://daily.dev/posts/pewdiepie-didn-t-trust-big-ai-so-he-built-his-own-tryjlkofy',
    createdAt: '2026-10-05T20:39:21.761Z',
    source: {
      id: 'fireship',
      name: 'Fireship',
      image:
        'https://media.daily.dev/image/upload/s--75ndqrkr--/f_auto,t_logo/v1702882094/logos/fireship.jpg',
      handle: 'fireship',
    },
  },
  {
    id: 'BM2onQaux',
    title: 'Blizzard Entertainment Announced Diablo V',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/02764cbb62d531fee8a4df8c0f6ab861?_a=AQAEuop',
    readTime: 4,
    numUpvotes: 35,
    numComments: 11,
    type: 'article',
    summary:
      'Blizzard Entertainment unveiled Diablo V at BlizzCon 2026, set 100 years after Diablo IV in a world where Diablo has conquered Sanctuary. Players take on the role of the Heir to Westmarch, gathering allies to dethrone the Lord of Terror. Three character…',
    tags: ['gaming'],
    permalink:
      'https://daily.dev/posts/blizzard-entertainment-announced-diablo-v-bm2onqaux',
    createdAt: '2026-09-14T10:15:47.878Z',
    source: {
      id: '80lv',
      name: '80 LEVEL',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/78eebcd76c154e6bbfd565fed7dc4093',
      handle: '80lv',
    },
  },
  {
    id: '7bvdmnnws',
    title: "Git 3.0's upcoming SHA-256 default will be a costly mistake",
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/a98ea39f67b1c3a47433515443307acf?_a=AQAEuop',
    readTime: 20,
    numUpvotes: 53,
    numComments: 10,
    type: 'article',
    summary:
      "Git co-founder Scott Chacon argues that Git 3.0's plan to make SHA-256 the default content hashing algorithm, replacing SHA-1, will be an enormously costly migration for negligible real-world security benefit. He explains that SHA-1's known weaknesses…",
    tags: ['security', 'git', 'version-control'],
    permalink:
      'https://daily.dev/posts/git-3-0-s-upcoming-sha-256-default-will-be-a-costly-mistake-7bvdmnnws',
    createdAt: '2026-10-01T13:56:39.396Z',
    source: {
      id: 'gitbutler',
      name: 'GitButler Blog',
      image:
        'https://media.daily.dev/image/upload/s--LrHsyt2T--/f_auto/v1692632054/squad_placeholder_sfwkmj',
      handle: 'gitbutler',
    },
  },
  {
    id: 'jcvsUgODn',
    title: 'Devs are finally fighting back',
    image: 'https://i.ytimg.com/vi/8tMBAq-I5HM/sddefault.jpg',
    readTime: 8,
    numUpvotes: 53,
    numComments: 37,
    type: 'video',
    summary:
      "A commentary piece argues that tech workers are pushing back against AI-driven layoffs and mismanagement, citing Meta's reassignment of 7,000 employees into AI training roles amid morale problems, Oracle layoffs, and the author's own frustrating experience…",
    tags: ['ai-agents', 'claude'],
    permalink:
      'https://daily.dev/posts/devs-are-finally-fighting-back-jcvsugodn',
    createdAt: '2026-10-05T12:12:16.276Z',
    source: {
      id: 'awesome-coding',
      name: 'Awesome',
      image:
        'https://media.daily.dev/image/upload/s--mj_0cdD8--/f_auto/v1710506099/logos/awesome-coding',
      handle: 'awesome-coding',
    },
  },
  {
    id: 'z4OUCB6LP',
    title: 'AI Hallucinated a Table That Was Never There',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/298b17d69c28df8cba3241f7f57053fd?_a=AQAEuop',
    readTime: 2,
    numUpvotes: 86,
    numComments: 10,
    type: 'article',
    summary:
      "A cartoon-style vignette introduces Cardinal, a fictional AI assistant that writes fluent but fabricated SQL queries against tables that don't exist in the actual database. The piece explains why AI hallucinates schema objects (it pattern-matches on…",
    tags: ['backend', 'sql', 'prompt-engineering'],
    permalink:
      'https://daily.dev/posts/ai-hallucinated-a-table-that-was-never-there-z4oucb6lp',
    createdAt: '2026-09-26T01:57:38.316Z',
    source: {
      id: 'sql-authority',
      name: 'SQL Authority',
      image:
        'https://media.daily.dev/image/upload/s--reCGnvgi--/f_auto,q_auto/v1780213436/logos/sql-authority?_a=BAMAMiWQ0',
      handle: 'sql-authority',
    },
  },
  {
    id: 'tQesVXF3J',
    title: 'WinApp CLI v0.7.0 Release Announcement',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/60c36f22c67507cc9873382f39464674?_a=AQAEuop',
    readTime: 11,
    numUpvotes: 72,
    numComments: 10,
    type: 'article',
    summary:
      'WinApp CLI v0.7.0 adds several major features for Windows app developers: running and UI-automating apps inside a throwaway Windows Sandbox with a new winapp target command family; building and launching Native AOT apps with package identity via winapp run…',
    tags: ['.net', 'winui'],
    permalink:
      'https://daily.dev/posts/winapp-cli-v0-7-0-release-announcement-tqesvxf3j',
    createdAt: '2026-09-25T17:48:49.304Z',
    source: {
      id: 'devblogs',
      name: 'DevBlogs',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/8f68b453325f482ebeb73fb780092713',
      handle: 'devblogs',
    },
  },
  {
    id: 'sju1wI5pt',
    title:
      "Microservices vs Monolithic Architecture: What Nobody Tells You Until You've Lived Through Both",
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/03c0e5f3fb24c0f34d3b2e929fcd8a10?_a=AQAEuop',
    readTime: 11,
    numUpvotes: 41,
    numComments: 10,
    type: 'article',
    summary:
      "A detailed comparison of monolithic and microservices architectures walks through real trade-offs beyond the diagram stage: deployment complexity, Conway's Law and team ownership, debugging and observability, data consistency, performance, scaling,…",
    tags: ['career', 'observability', 'microservices'],
    permalink:
      'https://daily.dev/posts/microservices-vs-monolithic-architecture-what-nobody-tells-you-until-you-ve-lived-through-both-sju1wi5pt',
    createdAt: '2026-09-16T07:19:27.133Z',
    source: {
      id: 'sitepoint',
      name: 'SitePoint',
      image:
        'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/sitepoint',
      handle: 'sitepoint',
    },
  },
  {
    id: 'MsFCKRbGk',
    title: 'How To get addicted to coding',
    image: 'https://i.ytimg.com/vi/d_y9pIXfZCw/sddefault.jpg',
    readTime: 7,
    numUpvotes: 49,
    numComments: 7,
    type: 'video',
    summary:
      'A personal essay arguing that lasting motivation for coding comes from genuine interest rather than motivational videos, framed through a dopamine-and-habit psychology lens. The author recounts a childhood love of building and engineering that led…',
    tags: ['career', 'c++'],
    permalink:
      'https://daily.dev/posts/how-to-get-addicted-to-coding-msfckrbgk',
    createdAt: '2026-10-04T15:18:33.409Z',
    source: {
      id: 'lowlevelgamedev',
      name: 'Low Level Game Dev',
      image:
        'https://media.daily.dev/image/upload/s--Mggt4-BY--/f_auto/v1724390809/logos/lowlevelgamedev',
      handle: 'lowlevelgamedev',
    },
  },
  {
    id: 'CrehqCUVO',
    title:
      'I brought back the best part of the Windows Vista era with this free app',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/f622c9cbb8a37e35f358fc5bb93f3794?_a=AQAEuop',
    readTime: 4,
    numUpvotes: 4,
    numComments: 10,
    type: 'article',
    summary:
      'A personal review of Aero Dock, a free and open-source Windows dock app inspired by RocketDock and Nexus Dock, that recreates the Windows Vista/Aero aesthetic. The app can replace the Windows taskbar, offers extensive customization including position,…',
    tags: ['windows'],
    permalink:
      'https://daily.dev/posts/i-brought-back-the-best-part-of-the-windows-vista-era-with-this-free-app-crehqcuvo',
    createdAt: '2026-09-15T23:02:08.074Z',
    source: {
      id: 'xda-developers',
      name: 'XDA Developers',
      image:
        'https://media.daily.dev/image/upload/s--kCg6yyAP--/f_auto,q_auto/v1774964407/logos/xda-developers?_a=BAMAMiWQ0',
      handle: 'xda-developers',
    },
  },
  {
    id: 'jvlaswdix',
    title:
      'Ubuntu on WSL finally replaced my Linux partition, and my Windows 11 PC no longer needs dual-boot',
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/5e81601e3ce206caf5b86db7310b8cdb?_a=AQAEuop',
    readTime: 3,
    numUpvotes: 31,
    numComments: 9,
    type: 'article',
    summary:
      'A personal account of switching from a Linux dual-boot setup to Windows Subsystem for Linux (WSL2) running Ubuntu, after a Windows update broke the GRUB bootloader. The author explains why WSL2 feels lighter than full VMs like VirtualBox or Hyper-V,…',
    tags: ['infrastructure', 'windows', 'ubuntu'],
    permalink:
      'https://daily.dev/posts/ubuntu-on-wsl-finally-replaced-my-linux-partition-and-my-windows-11-pc-no-longer-needs-dual-boot-jvlaswdix',
    createdAt: '2026-09-25T00:01:52.090Z',
    source: {
      id: 'xda-developers',
      name: 'XDA Developers',
      image:
        'https://media.daily.dev/image/upload/s--kCg6yyAP--/f_auto,q_auto/v1774964407/logos/xda-developers?_a=BAMAMiWQ0',
      handle: 'xda-developers',
    },
  },
  {
    id: 'BkbDbNDuV',
    title: 'Tailwind has a huge problem...',
    image: 'https://i.ytimg.com/vi/tHBbNNh1-OE/sddefault.jpg',
    readTime: 8,
    numUpvotes: 48,
    numComments: 7,
    type: 'video',
    summary:
      'Tailwind CSS, despite being installed over 110 million times weekly and used by major companies, saw Tailwind Labs lay off 75% of its small engineering team (three people) after documentation traffic fell 40% and revenue dropped nearly 80% since early…',
    tags: ['webdev', 'open-source', 'tailwind-css'],
    permalink: 'https://daily.dev/posts/tailwind-has-a-huge-problem--bkbdbnduv',
    createdAt: '2026-09-25T11:28:06.129Z',
    source: {
      id: 'awesome-coding',
      name: 'Awesome',
      image:
        'https://media.daily.dev/image/upload/s--mj_0cdD8--/f_auto/v1710506099/logos/awesome-coding',
      handle: 'awesome-coding',
    },
  },
  {
    id: 'DCI9yQeYF',
    title:
      "I gave my Obsidian vault to my NAS instead of Obsidian's servers and saved $96 a year",
    image:
      'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/86dc2bab2748e028ed680fe1273e32ff?_a=AQAEuop',
    readTime: 4,
    numUpvotes: 25,
    numComments: 9,
    type: 'article',
    summary:
      'A writer explains how they replaced the paid Obsidian Sync subscription with a self-hosted setup using the Obsidian LiveSync community plugin and a CouchDB instance running on a NAS via Docker or LXC. LiveSync keeps notes synchronized across desktop,…',
    tags: ['docker', 'self-hosting'],
    permalink:
      'https://daily.dev/posts/i-gave-my-obsidian-vault-to-my-nas-instead-of-obsidian-s-servers-and-saved-96-a-year-dci9yqeyf',
    createdAt: '2026-09-23T11:32:28.419Z',
    source: {
      id: 'xda-developers',
      name: 'XDA Developers',
      image:
        'https://media.daily.dev/image/upload/s--kCg6yyAP--/f_auto,q_auto/v1774964407/logos/xda-developers?_a=BAMAMiWQ0',
      handle: 'xda-developers',
    },
  },
  {
    id: '9tLNItvh5',
    title: 'Google is using AI to migrate C++ to Rust...',
    image: 'https://i.ytimg.com/vi/a3Aup1LwPhQ/sddefault.jpg',
    readTime: 4,
    numUpvotes: 45,
    numComments: 5,
    type: 'video',
    summary:
      "Google announced Gemini 4 Argon, a new frontier AI model, and revealed it's being used internally for large-scale code migrations, including rewriting C and C++ codebases (from tens of thousands to over 800,000 lines) into Rust. The rewrites go through…",
    tags: ['google', 'rust', 'c++'],
    permalink:
      'https://daily.dev/posts/google-is-using-ai-to-migrate-c-to-rust--9tlnitvh5',
    createdAt: '2026-10-07T15:24:10.946Z',
    source: {
      id: 'letsgetrusty',
      name: "Let's Get Rusty",
      image:
        'https://media.daily.dev/image/upload/s--iqd05ejH--/f_auto/v1725035314/logos/letsgetrusty',
      handle: 'letsgetrusty',
    },
  },
  {
    id: 'OelB3kJYY',
    title: 'update on git situation',
    image: 'https://i.ytimg.com/vi/6tGrDy1KBnc/sddefault.jpg',
    readTime: 10,
    numUpvotes: 44,
    numComments: 6,
    type: 'video',
    summary:
      'A self-hosted Git platform (referred to as Gitea) had a remote code execution vulnerability abusable via its diff/patch endpoint, allowing an attacker with ordinary write access—or even an unauthenticated visitor when open registration is enabled—to…',
    tags: ['linux', 'git', 'self-hosting'],
    permalink: 'https://daily.dev/posts/update-on-git-situation-oelb3kjyy',
    createdAt: '2026-09-21T15:34:58.442Z',
    source: {
      id: 'lowlevellearning',
      name: 'Low Level Learning',
      image:
        'https://media.daily.dev/image/upload/s--pjLyMMmx--/f_auto/v1724394406/logos/lowlevellearning',
      handle: 'lowlevellearning',
    },
  },
  {
    id: 'GbZDSoJhP',
    title:
      'I just replaced my entire tech stack with Postgres... #postgresql #database #coding',
    image: 'https://i.ytimg.com/vi/mrKhVHcP64s/sddefault.jpg',
    readTime: 1,
    numUpvotes: 42,
    numComments: 8,
    type: 'video',
    summary:
      'Argues that PostgreSQL can replace much of a typical modern stack—Redis for caching, Kafka for background jobs, Elasticsearch for search, and vector databases for AI features—criticizing the trend of stitching together many specialized SaaS services for…',
    tags: ['database', 'postgresql', 'kafka'],
    permalink:
      'https://daily.dev/posts/i-just-replaced-my-entire-tech-stack-with-postgres-postgresql-database-coding-gbzdsojhp',
    createdAt: '2026-09-19T16:26:17.612Z',
    source: {
      id: 'codinggopher',
      name: 'The Coding Gopher',
      image:
        'https://media.daily.dev/image/upload/s--pv2IKQMG--/f_auto/v1736753456/logos/codinggopher',
      handle: 'codinggopher',
    },
  },
  {
    id: '0aNZDfOlZ',
    title: 'I Redesigned VLC After 25 Years',
    image: 'https://i.ytimg.com/vi/ERFeOgqk324/sddefault.jpg',
    readTime: 21,
    numUpvotes: 40,
    numComments: 4,
    type: 'video',
    summary:
      'A long-time VLC user presents a comprehensive UI/UX redesign concept for the media player, covering color scheme, icon styles, control bar layout, queue vs. playlist distinction, subtitle management, settings reorganization, media library browsing, and…',
    tags: ['open-source', 'ui-design'],
    permalink:
      'https://daily.dev/posts/i-redesigned-vlc-after-25-years-0anzdfolz',
    createdAt: '2026-10-12T13:59:27.860Z',
    source: {
      id: 'juxtopposed',
      name: 'Juxtopposed',
      image:
        'https://media.daily.dev/image/upload/s--MdalXrrw--/f_auto/v1712315280/logos/juxtopposed',
      handle: 'juxtopposed',
    },
  },
  {
    id: 'Hry9s9VVB',
    title: 'Stack Overflow Is Dying and ChatGPT Killed It',
    image: 'https://i.ytimg.com/vi/muT3BZQmLhI/sddefault.jpg',
    readTime: 17,
    numUpvotes: 37,
    numComments: 22,
    type: 'video',
    summary:
      "A narrative history traces Stack Overflow's rise as the definitive Q&A resource for programmers, its cultural decline due to hostile gatekeeping and strict question standards, and its accelerating collapse after ChatGPT and coding agents made searching and…",
    tags: ['ai-agents', 'chatgpt'],
    permalink:
      'https://daily.dev/posts/stack-overflow-is-dying-and-chatgpt-killed-it-hry9s9vvb',
    createdAt: '2026-09-21T16:22:01.316Z',
    source: {
      id: 'devops-toolkit',
      name: 'DevOps Toolkit',
      image:
        'https://media.daily.dev/image/upload/s--VPsieX2o--/f_auto/v1704633572/logos/devops-toolkit.jpg',
      handle: 'devops-toolkit',
    },
  },
  {
    id: 'Rvo54Shm1',
    title: 'DHH has gone completely off the rails...',
    image: 'https://i.ytimg.com/vi/OuNKBjuV7A4/sddefault.jpg',
    readTime: 6,
    numUpvotes: 36,
    numComments: 3,
    type: 'video',
    summary:
      "A satirical commentary breaks down DHH's Rails World keynote in which he declared hand-written code economically dead, revealed the Hey email app is being rewritten from Ruby on Rails to AI-generated Rust with a claimed 95% cut in CPU and memory usage, and…",
    tags: ['rust', 'ai-coding', 'rails'],
    permalink:
      'https://daily.dev/posts/dhh-has-gone-completely-off-the-rails--rvo54shm1',
    createdAt: '2026-09-28T19:30:25.625Z',
    source: {
      id: 'fireship',
      name: 'Fireship',
      image:
        'https://media.daily.dev/image/upload/s--75ndqrkr--/f_auto,t_logo/v1702882094/logos/fireship.jpg',
      handle: 'fireship',
    },
  },
  {
    id: 'BjYAz50EA',
    title: 'Cloudflare saved 100 terabytes with just 5 Rust optimizations',
    image: 'https://i.ytimg.com/vi/NHugujESp_s/sddefault.jpg',
    readTime: 6,
    numUpvotes: 36,
    numComments: 0,
    type: 'video',
    summary:
      'Cloudflare cut memory usage of its Rust-based DNS cache (part of its Big Pineapple DNS platform) by roughly 100 terabytes using five optimizations: replacing Vec and String with Box-based fixed-size arrays and string slices to eliminate wasted capacity,…',
    tags: ['rust', 'cloudflare', 'dns'],
    permalink:
      'https://daily.dev/posts/cloudflare-saved-100-terabytes-with-just-5-rust-optimizations-bjyaz50ea',
    createdAt: '2026-09-27T15:10:35.218Z',
    source: {
      id: 'letsgetrusty',
      name: "Let's Get Rusty",
      image:
        'https://media.daily.dev/image/upload/s--iqd05ejH--/f_auto/v1725035314/logos/letsgetrusty',
      handle: 'letsgetrusty',
    },
  },
  {
    id: 'ZXFr5VTnM',
    title: 'The AI skeptics are changing sides...',
    image: 'https://i.ytimg.com/vi/DC1_MLzTpuY/sddefault.jpg',
    readTime: 8,
    numUpvotes: 33,
    numComments: 6,
    type: 'video',
    summary:
      "A YouTube-style commentary tracks how several prominent, previously AI-skeptical developers have shifted toward embracing AI-generated code. Notch (Minecraft creator) went from calling AI coding advocates 'incompetent or evil' to enjoying vibe coding…",
    tags: ['ai-coding', 'vibe-coding'],
    permalink:
      'https://daily.dev/posts/the-ai-skeptics-are-changing-sides--zxfr5vtnm',
    createdAt: '2026-10-09T09:29:06.615Z',
    source: {
      id: 'awesome-coding',
      name: 'Awesome',
      image:
        'https://media.daily.dev/image/upload/s--mj_0cdD8--/f_auto/v1710506099/logos/awesome-coding',
      handle: 'awesome-coding',
    },
  },
  {
    id: 'Dnpojr9DY',
    title: 'Meta brings Private Processing to its AI glasses',
    image: '',
    readTime: 2,
    numUpvotes: 0,
    numComments: 0,
    type: 'article',
    summary:
      'Meta is extending Private Processing, the confidential computing system originally built for WhatsApp, to its AI glasses. AI workloads run inside hardware-based confidential virtual machines so Meta says it cannot access user data. The desi',
    tags: ['privacy'],
    permalink:
      'https://daily.dev/posts/meta-brings-private-processing-to-its-ai-glasses-dnpojr9dy',
    createdAt: '2026-10-14T14:01:55.656Z',
    source: {
      id: 'collections',
      name: 'Collections',
      image:
        'https://media.daily.dev/image/upload/s--fk_6ycEi--/f_auto,q_auto/v1780996001/logos/collections?_a=BAMAMiWQ0',
      handle: 'collections',
    },
  },
  {
    id: 'whtli8Ms7',
    title: 'RubyGems 4.0.23 and Bundler 4.0.23 have been released',
    image:
      'https://media.daily.dev/image/upload/s--1KxV4ohY--/f_auto/v1722860400/public/Placeholder%2007',
    readTime: 1,
    numUpvotes: 0,
    numComments: 0,
    type: 'article',
    summary:
      'RubyGems 4.0.23 and Bundler 4.0.23 have been released with enhancements and bug fixes. Changes include updating vendored gems, dropping setuid/setgid/sticky bits when extracting gems, improved handling of invalid Windows path characters, bu',
    tags: ['ruby'],
    permalink:
      'https://daily.dev/posts/rubygems-4-0-23-and-bundler-4-0-23-have-been-released-whtli8ms7',
    createdAt: '2026-10-14T13:55:30.666Z',
    source: {
      id: '2f47d2af-05b4-46a4-b164-47487040e72b',
      name: 'Ruby Friends',
      image:
        'https://media.daily.dev/image/upload/s--14qkJuyt--/f_auto/v1748577380/squads/2f47d2af-05b4-46a4-b164-47487040e72b?_a=BAMClqUq0',
      handle: 'rubyfriends',
    },
  },
  {
    id: 'M3jfp4ES4',
    title: 'How MCP Guardrails Work',
    image:
      'https://media.daily.dev/image/upload/s--0F6bvwYP--/f_auto,pg_1/v1791984769/posts/M3jfp4ES4?_a=BAMAMicg0',
    readTime: 2,
    numUpvotes: 1,
    numComments: 0,
    type: 'article',
    summary:
      'Bifrost introduces MCP guardrails, policies designed to protect tool calls made through the Model Context Protocol by inspecting tool arguments before execution and tool results before they reach the agent. Unlike guardrails that evaluate L',
    tags: ['ai-agents', 'mcp', 'appsec'],
    permalink: 'https://daily.dev/posts/how-mcp-guardrails-work-m3jfp4es4',
    createdAt: '2026-10-14T13:32:48.743Z',
    source: {
      id: 'lfRKMBQjVJU9aG1HuqtVg',
      name: 'Anthony Max',
      image:
        'https://media.daily.dev/image/upload/s--IOCG5ocV--/f_auto/v1745861623/avatars/avatar_lfRKMBQjVJU9aG1HuqtVg',
      handle: 'lfrkmbqjvju9ag1huqtvg',
    },
  },
  {
    id: 'oo3EByGCR',
    title: 'When you code with headphones on, what actually helps you focus?',
    image: '',
    readTime: 1,
    numUpvotes: 0,
    numComments: 0,
    type: 'article',
    summary: '',
    tags: [],
    permalink:
      'https://daily.dev/posts/when-you-code-with-headphones-on-what-actually-helps-you-focus--oo3ebygcr',
    createdAt: '2026-10-12T10:25:15.988Z',
    source: {
      id: '12b15e83-e74a-4bb6-90af-d1da33da1536',
      name: 'Devs with ADHD',
      image:
        'https://media.daily.dev/image/upload/s--6TNsQgEE--/f_auto/v1755076272/squads/12b15e83-e74a-4bb6-90af-d1da33da1536?_a=BAMClqZW0',
      handle: 'clariti',
    },
  },
  {
    id: 'OXxsiaaEd',
    title: 'this is respectable',
    image:
      'https://media.daily.dev/image/upload/s--0_ODbtD2--/f_auto/v1722860399/public/Placeholder%2008',
    readTime: 1,
    numUpvotes: 0,
    numComments: 0,
    type: 'article',
    summary:
      'A brief, content-free post consisting only of the phrase "this is respectable" with no technical subject matter, context, or elaboration provided.',
    tags: [],
    permalink: 'https://daily.dev/posts/this-is-respectable-oxxsiaaed',
    createdAt: '2026-10-14T14:46:55.985Z',
    source: {
      id: 'scaling01',
      name: 'Lisan al Gaib',
      image:
        'https://media.daily.dev/image/upload/s--hqegMpK9--/f_auto,q_auto/v1783603655/logos/scaling01?_a=BAMAMicg0',
      handle: 'scaling01',
    },
  },
];
