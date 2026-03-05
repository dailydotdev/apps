/**
 * ============================================================================
 *  daily.dev — App Store Custom Product Pages (CPP) Content Data
 * ============================================================================
 *
 *  HOW TO USE THIS FILE:
 *  This file defines ALL the content for the App Store CPP screenshot preview
 *  tool. The rendering engine (app-store-cpp-preview.html) reads this data
 *  and generates the visual screenshots.
 *
 *  WHAT YOU CAN EDIT:
 *  - Topic names, descriptions, and accent colors
 *  - Screen headlines, subtitles, and messaging
 *  - Badge values and labels (hero screens)
 *  - Tag lists for personalization screens
 *  - Discussion article titles and TLDRs
 *  - Search queries and AI answers
 *  - Squad names and member counts
 *  - Bookmark folder names
 *  - Asset/image URLs
 *
 *  IMPORTANT RULES:
 *  1. Use <br> for line breaks in headlines/subtitles (NOT \n)
 *  2. Keep headlines short: 3-6 words per line, max 2 lines
 *  3. Keep subtitles to 1 line, ~8-15 words
 *  4. Don't change field names (keys) — only change values
 *  5. Don't remove the window.CPP_DATA assignment
 *  6. To add a new topic, copy an existing topic block and change all values
 *  7. Each topic must have exactly 6 screens in this order:
 *     Hero → Feed/Personalization → Personalized → Discuss → Search → Features
 *
 *  See CPP-EDITING-GUIDE.md for complete documentation.
 * ============================================================================
 */

window.CPP_DATA = [

  // =========================================================================
  //  TOPIC: Master (Default)
  //  This is the generic/default listing — not tied to a specific audience
  // =========================================================================
  {
    id: 'master',
    name: 'Master (Default)',
    accent: '#CE3DF3',
    dot: '#CE3DF3',
    // angle: (none for master — it has no topic description)

    screens: [

      // --- Screen 1: Hero ---
      {
        label: 'Hero',
        uiType: 'hero',
        // CONTENT: Main headline split into top (lighter) and bold (heavy) lines
        hl: 'The world\u2019s best<br>dev app for',
        sub: 'staying<br>up to date',
        // Hero badge/float overrides not needed for master — uses defaults
      },

      // --- Screen 2: Feed ---
      {
        label: 'Feed',
        hlPos: 'top',
        uiType: 'feed',
        // CONTENT: Title and subtitle shown above the phone mockup
        hl: 'Learn new<br>things',
        sub: '<span style="color:rgba(255,255,255,0.7)">anywhere</span>',
        // VISUAL: Floating 3D icons beside the phone
        floats: [
          { icon: '<svg viewBox="0 0 24 24" fill="none" width="28" height="28" style="transform:translateY(3px)"><path d="M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16M4 19a1 1 0 1 1 2 0 1 1 0 0 1-2 0" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>', top: '26%', left: '-18px', bg: 'linear-gradient(135deg, #FF9A44, #FF5A00)', rot: '8deg' },
          { icon: '<svg viewBox="0 0 24 24" fill="none" width="28" height="28" style="transform:translateY(2px)"><path d="M10 3L8 21M16 3L14 21M4 9h16M3 15h16" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>', top: '42%', right: '-16px', bg: 'linear-gradient(135deg, #FF5E7E, #FF2E56)', rot: '-8deg' },
        ],
      },

      // --- Screen 3: Personalized ---
      {
        label: 'Personalized',
        hlPos: 'top',
        uiType: 'tags',
        stars: true,
        socialPos: 'middle',
        // CONTENT: Headline, subtitle, and user quote
        hl: 'Personalized',
        sub: 'for you',
        quote: '"Must have app for devs" <span class="author">James Barish</span>',
        // CONTENT: Tags shown as selected (on) and unselected (off)
        on: ['javascript', 'php', 'git', 'agile', 'aws'],
        off: ['ab testing', 'accessibility', 'adobe', 'alexa', 'alibaba'],
        // VISUAL: Floating tag pills around the phone
        tags: [
          { text: 'devops', top: '36%', right: '-4px', rot: '-4.5deg' },
          { text: 'ai', top: '42%', left: '4px', rot: '0.5deg' },
          { text: 'cloud', top: '50%', left: '-10px', rot: '-13deg' },
          { text: 'javascript', top: '44%', right: '-8px', rot: '-4.5deg' },
          { text: 'webdev', top: '82%', left: '-8px', rot: '-4.5deg' },
        ],
        // VISUAL: Floating emoji icons
        floats: [
          { icon: '🟡', top: '52%', left: '30%', bg: 'linear-gradient(135deg,#FFE600,#FFA500)', rot: '10deg' },
          { icon: '🐹', top: '58%', right: '14px', bg: 'linear-gradient(135deg,#2CDCE6,#0a7a8a)', rot: '-15deg' },
        ],
      },

      // --- Screen 4: Discuss ---
      {
        label: 'Discuss',
        hlPos: 'top',
        uiType: 'discuss',
        // CONTENT: Headline and subtitle
        hl: 'Discuss',
        sub: 'with a global<br>dev community',
        // CONTENT: Article shown inside the phone mockup
        articleTitle: 'NVIDIA CEO Shouldn\'t Learn to Code, AI Can Do It',
        tldr: 'Development is not about code. It\'s about converting an idea into something that works. It\'s a process. CODING is about tools and syntax.',
        // VISUAL: Floating icons
        floats: [
          { icon: '💬', top: '30%', right: '10px', bg: 'linear-gradient(135deg,#2CDCE6,#0a6a7a)', rot: '8deg' },
          { icon: '⬆️', top: '60%', right: '-6px', bg: 'linear-gradient(135deg,#1DDC6F,#0a8a4a)', rot: '8deg' },
        ],
      },

      // --- Screen 5: Search ---
      {
        label: 'Search',
        hlPos: 'top',
        uiType: 'search',
        // CONTENT: Headline and subtitle
        hl: 'Explore a world of',
        sub: 'developer<br>resources',
        // CONTENT: Search query and AI answer shown in the phone
        query: 'How to be a great developer?',
        answer: 'To be a great developer, here are 20 practical tips from senior programmers:\n1. Write code regularly to develop your skills\n2. Learn something from every project, even the boring ones...',
        srcs: ['senior-dev-tips.com'],
        // CONTENT: Post card shown below search
        posts: [
          { title: 'Great code isn\'t enough. Developers need to brag about it (Ep. 571)', src: 'daily.dev', srcLetter: 'D', srcColor: '#CE3DF3', readTime: '1m', upvotes: '571', comments: '89', thumb: 'linear-gradient(135deg,#3a1a4a,#1a0a2a)' },
        ],
        // VISUAL: Floating icons
        floats: [
          { icon: '✨', top: '22%', right: '-6px', bg: 'linear-gradient(135deg,#C9B0FF,#9D70F8)', rot: '15deg' },
          { icon: '🔍', top: '50%', left: '-4px', bg: 'linear-gradient(135deg,#4BA6FF,#2CDCE6)', rot: '-12deg' },
        ],
      },

      // --- Screen 6: Features ---
      {
        label: 'Features',
        hlPos: 'top',
        uiType: 'profile',
        // CONTENT: Feature list (each line is a feature)
        hl: '<span class="plus-icon">+</span> Bookmarks<br><span class="plus-icon">+</span> Squads<br><span class="plus-icon">+</span> DevCards',
        sub: 'and much more.',
        // VISUAL: Floating icons
        floats: [
          { icon: '📑', top: '32%', left: '-10px', bg: 'linear-gradient(135deg,#FFD700,#FF7A2B)', rot: '-5deg' },
          { icon: '⚛', top: '78%', right: '-10px', bg: 'linear-gradient(135deg,#CE3DF3,#8B2252)', rot: '8deg' },
        ],
      },
    ],
  },


  // =========================================================================
  //  TOPIC: AI / ML Developers
  //  Target audience: developers working with AI, machine learning, LLMs
  //  Accent color: blueCheese (#2CDCE6)
  // =========================================================================
  {
    id: 'ai-ml',
    name: 'AI / ML Developers',
    accent: '#2CDCE6',
    dot: '#2CDCE6',
    // CONTENT: Description shown below the topic header
    angle: 'Your personalized AI news feed: LLMs, agents, prompts, and ML papers from 500+ sources, updated in real time.',

    screens: [

      // --- Screen 1: Hero ---
      {
        label: 'Hero',
        uiType: 'hero',
        // CONTENT: Main headline split into top (lighter) and bold (heavy) lines
        hl: 'Your personalized<br>news feed for',
        sub: 'AI & ML<br>developers',
        // CONTENT: Two floating emoji icons on the hero
        heroFloats: [
          { icon: '🤖', top: '55%', left: '5%', rot: '-15deg', size: 100 },
          { icon: '🧠', top: '60%', right: '5%', rot: '10deg', size: 90 },
        ],
        // CONTENT: Left badge (badge 1)
        badge1: { iconHtml: '<div style="font-size:50px;">🤖</div>', val: '500+', label: 'Sources', sub: 'Real-time AI news' },
        // CONTENT: Right badge (badge 2)
        badge2: { iconHtml: '<div style="font-size:45px;">🔥</div>', val: '589K+', sub: 'AI Engagements' },
        // CONTENT: Text shown below the 5 gold stars
        reviewsText: 'Top Choice for AI Devs',
      },

      // --- Screen 2: Personalization (tag selection) ---
      {
        label: 'Personalization',
        hlPos: 'top',
        uiType: 'tags',
        // CONTENT: Headline and subtitle
        hl: 'Cut through<br>the noise',
        sub: 'Only the AI topics that matter',
        // CONTENT: Tags shown as selected (on) and unselected (off)
        on: ['AI', 'Machine Learning', 'LLM', 'GPT', 'Agents', 'Prompt Engineering', 'NLP'],
        off: ['React', 'CSS', 'DevOps', 'Docker'],
      },

      // --- Screen 3: Personalized (social proof) ---
      {
        label: 'Personalized',
        hlPos: 'top',
        uiType: 'tags',
        stars: true,
        socialPos: 'middle',
        // CONTENT: Headline, subtitle, and user quote
        hl: 'Personalized',
        sub: 'for you',
        quote: '"Must have app for AI devs" <span class="author">ML Weekly</span>',
        // CONTENT: Tags
        on: ['AI', 'Machine Learning', 'LLM', 'GPT', 'Agents', 'Prompt Eng'],
        off: ['React', 'CSS', 'DevOps', 'Docker'],
        // VISUAL: Floating tag pills
        tags: [
          { text: 'ai', top: '48%', left: '12px', rot: '-1deg' },
          { text: 'machinelearning', top: '40%', right: '-8px', rot: '3deg' },
          { text: 'LLM', top: '56%', left: '-4px', rot: '-13deg' },
        ],
        // VISUAL: Floating emoji icons
        floats: [
          { icon: '🤖', top: '55%', left: '-16px', bg: 'linear-gradient(135deg,#2CDCE6,#0a8a9a)', rot: '-10deg' },
          { icon: '🧠', top: '60%', right: '-14px', bg: 'linear-gradient(135deg,#9D70F8,#5F37E9)', rot: '12deg' },
        ],
      },

      // --- Screen 4: Discuss ---
      {
        label: 'Discuss',
        hlPos: 'top',
        uiType: 'discuss',
        // CONTENT: Headline and subtitle
        hl: 'Discuss',
        sub: 'with a global<br>dev community',
        // CONTENT: Article shown inside the phone mockup
        articleTitle: 'NVIDIA CEO Says Developers Shouldn\'t Learn to Code Anymore',
        tldr: 'NVIDIA CEO believes with AI advancements, traditional coding may become obsolete and humans should focus on practical areas.',
        // VISUAL: Floating icons
        floats: [
          { icon: '💬', top: '32%', right: '-10px', bg: 'linear-gradient(135deg,#2CDCE6,#0a6a7a)', rot: '8deg' },
        ],
      },

      // --- Screen 5: Search ---
      {
        label: 'Search',
        hlPos: 'top',
        uiType: 'search',
        // CONTENT: Headline and subtitle
        hl: 'Explore a world of',
        sub: 'developer resources',
        // CONTENT: Search query and AI answer
        query: 'How do transformers scale?',
        answer: 'Transformer attention scales quadratically O(n²) with sequence length. Flash Attention reduces memory to O(n)...',
        srcs: ['arXiv', 'Illustrated Transformer'],
        posts: [
          { title: 'Great code isn\'t enough. Developers need to brag about it', src: 'daily.dev', srcLetter: 'D', srcColor: '#CE3DF3', readTime: '1m', upvotes: '571', comments: '89', thumb: 'linear-gradient(135deg,#3a1a4a,#1a0a2a)' },
        ],
        // VISUAL: Floating icons
        floats: [
          { icon: '✨', top: '26%', right: '-6px', bg: 'linear-gradient(135deg,#C9B0FF,#9D70F8)', rot: '15deg' },
          { icon: '💡', top: '55%', left: '-12px', bg: 'linear-gradient(135deg,#4BA6FF,#2CDCE6)', rot: '-12deg' },
        ],
      },

      // --- Screen 6: Features ---
      {
        label: 'Features',
        hlPos: 'top',
        uiType: 'squads',
        // CONTENT: Feature list headline
        hl: '<span class="plus-icon">+</span> Bookmarks<br><span class="plus-icon">+</span> Squads<br><span class="plus-icon">+</span> DevCards',
        sub: 'and much more.',
        // CONTENT: Squad cards shown inside the phone
        squads: [
          { n: 'LLM Builders', m: '12.4K', e: '🤖' },
          { n: 'ML Paper Club', m: '8.7K', e: '📄' },
          { n: 'AI Agents', m: '6.2K', e: '🧠' },
          { n: 'Computer Vision', m: '5.1K', e: '👁' },
        ],
        // VISUAL: Floating icons
        floats: [
          { icon: '📑', top: '28%', left: '-10px', bg: 'linear-gradient(135deg,#FFD700,#FF7A2B)', rot: '-5deg' },
          { icon: '⚛', top: '70%', right: '-10px', bg: 'linear-gradient(135deg,#CE3DF3,#8B2252)', rot: '8deg' },
        ],
      },
    ],
  },


  // =========================================================================
  //  TOPIC: Frontend / React
  //  Target audience: frontend engineers (React, JS, TS, CSS)
  //  Accent color: water (#3169F5)
  // =========================================================================
  {
    id: 'frontend',
    name: 'Frontend / React',
    accent: '#3169F5',
    dot: '#3169F5',
    angle: 'React, JavaScript, TypeScript, and CSS articles curated for frontend engineers who want to stay sharp.',

    screens: [

      // --- Screen 1: Hero ---
      {
        label: 'Hero',
        uiType: 'hero',
        hl: 'The smartest<br>news feed for',
        sub: 'frontend<br>developers',
        heroFloats: [
          { icon: '⚛️', top: '58%', left: '6%', rot: '-10deg', size: 100 },
          { icon: '🎨', top: '52%', right: '8%', rot: '15deg', size: 90 },
        ],
        badge1: { iconHtml: '<div style="font-size:50px;">⚛️</div>', val: '100+', label: 'Sources', sub: 'Always up-to-date' },
        badge2: { iconHtml: '<div style="font-size:45px;">🎨</div>', val: 'UI / UX', sub: 'Top Curated Articles' },
        reviewsText: 'Stay sharp on the Frontend',
      },

      // --- Screen 2: Personalization ---
      {
        label: 'Personalization',
        hlPos: 'top',
        uiType: 'tags',
        hl: 'Matched to<br>your stack',
        sub: 'React, TS, CSS and more',
        on: ['React', 'JavaScript', 'TypeScript', 'CSS', 'Next.js', 'Tailwind CSS', 'Vue', 'Svelte'],
        off: ['Python', 'Go', 'Rust', 'DevOps'],
      },

      // --- Screen 3: Personalized ---
      {
        label: 'Personalized',
        hlPos: 'top',
        uiType: 'tags',
        stars: true,
        socialPos: 'middle',
        hl: 'Personalized',
        sub: 'for you',
        quote: '"Best frontend resource ever" <span class="author">Dev Weekly</span>',
        on: ['React', 'JavaScript', 'TypeScript', 'CSS', 'Next.js', 'Tailwind'],
        off: ['Python', 'Go', 'Rust', 'DevOps'],
        tags: [
          { text: 'javascript', top: '42%', right: '-4px', rot: '3deg' },
          { text: 'react', top: '50%', left: '4px', rot: '-5deg' },
          { text: 'css', top: '46%', left: '30%', rot: '2deg' },
        ],
        floats: [
          { icon: '💙', top: '58%', right: '-12px', bg: 'linear-gradient(135deg,#3169F5,#1a3aA5)', rot: '12deg' },
        ],
      },

      // --- Screen 4: Discuss ---
      {
        label: 'Discuss',
        hlPos: 'top',
        uiType: 'discuss',
        hl: 'Discuss',
        sub: 'with a global<br>dev community',
        articleTitle: 'Why Server Components Change Everything for React Developers',
        tldr: 'Server Components enable seamless server-client integration, reducing bundle sizes by up to 50%.',
        floats: [
          { icon: '💬', top: '30%', right: '-8px', bg: 'linear-gradient(135deg,#2CDCE6,#0a6a7a)', rot: '6deg' },
        ],
      },

      // --- Screen 5: Search ---
      {
        label: 'Search',
        hlPos: 'top',
        uiType: 'search',
        hl: 'Explore a world of',
        sub: 'developer resources',
        query: 'React vs Vue performance 2026',
        answer: 'React 20 with Server Components shows 40% faster TTI. Vue 4 with Vapor mode competitive on small apps...',
        srcs: ['React Blog', 'Web.dev'],
        posts: [
          { title: 'Building Accessible React Components the Right Way', src: 'Smashing Mag', srcLetter: 'S', srcColor: '#FF5454', readTime: '8m', upvotes: '892', comments: '67' },
        ],
        floats: [
          { icon: '✨', top: '26%', right: '-4px', bg: 'linear-gradient(135deg,#C9B0FF,#9D70F8)', rot: '12deg' },
        ],
      },

      // --- Screen 6: Features ---
      {
        label: 'Features',
        hlPos: 'top',
        uiType: 'squads',
        hl: '<span class="plus-icon">+</span> Bookmarks<br><span class="plus-icon">+</span> Squads<br><span class="plus-icon">+</span> DevCards',
        sub: 'and much more.',
        squads: [
          { n: 'React Devs', m: '24.1K', e: '⚛️' },
          { n: 'CSS Wizards', m: '11.3K', e: '🎨' },
          { n: 'TypeScript Community', m: '15.7K', e: '💙' },
          { n: 'Next.js Users', m: '9.4K', e: '▲' },
        ],
        floats: [
          { icon: '📑', top: '28%', left: '-8px', bg: 'linear-gradient(135deg,#FFD700,#FF7A2B)', rot: '-8deg' },
        ],
      },
    ],
  },


  // =========================================================================
  //  TOPIC: Career Growth
  //  Target audience: developers focused on career advancement
  //  Accent color: lettuce (#92F21D)
  // =========================================================================
  {
    id: 'career',
    name: 'Career Growth',
    accent: '#92F21D',
    dot: '#92F21D',
    angle: 'Level up your dev career: salary insights, interview prep, and career advice bookmarked by thousands of developers.',

    screens: [

      // --- Screen 1: Hero ---
      {
        label: 'Hero',
        uiType: 'hero',
        hl: 'Unlock your<br>potential in',
        sub: 'career<br>growth',
        heroFloats: [
          { icon: '🚀', top: '56%', left: '8%', rot: '-15deg', size: 95 },
          { icon: '🎯', top: '53%', right: '6%', rot: '12deg', size: 95 },
        ],
        badge1: { iconHtml: '<div style="font-size:50px;">📈</div>', val: '8.4%', label: 'Rate', sub: 'Highest bookmark rate' },
        badge2: { iconHtml: '<div style="font-size:45px;">💼</div>', val: 'Salary', sub: 'Insights & Interview Prep' },
        reviewsText: 'Level up your dev career',
      },

      // --- Screen 2: Personalization ---
      {
        label: 'Personalization',
        hlPos: 'top',
        uiType: 'tags',
        hl: 'Shape your<br>growth feed',
        sub: 'Follow the career signals you need',
        on: ['Career', 'Interview', 'Leadership', 'Growth', 'Salary', 'Resume'],
        off: ['React', 'Python', 'Docker', 'Linux'],
      },

      // --- Screen 3: Personalized ---
      {
        label: 'Personalized',
        hlPos: 'top',
        uiType: 'tags',
        stars: true,
        socialPos: 'middle',
        hl: 'Personalized',
        sub: 'for you',
        quote: '"Changed my trajectory" <span class="author">Senior Eng</span>',
        on: ['Career', 'Interview', 'Leadership', 'Growth', 'Salary', 'Resume'],
        off: ['React', 'Python', 'Docker', 'Linux'],
        tags: [
          { text: 'career', top: '44%', left: '10px', rot: '-3deg' },
          { text: 'growth', top: '50%', right: '-4px', rot: '4deg' },
        ],
      },

      // --- Screen 4: Discuss ---
      {
        label: 'Discuss',
        hlPos: 'top',
        uiType: 'discuss',
        hl: 'Discuss',
        sub: 'with a global<br>dev community',
        articleTitle: 'Should I Leave FAANG for a Startup? Here\'s What I Learned',
        tldr: 'After 4 years at Google, switching to a Series A startup doubled my growth rate and equity upside.',
        floats: [
          { icon: '💬', top: '32%', right: '-8px', bg: 'linear-gradient(135deg,#92F21D,#1DDC6F)', rot: '6deg' },
        ],
      },

      // --- Screen 5: Search ---
      {
        label: 'Search',
        hlPos: 'top',
        uiType: 'search',
        hl: 'Explore a world of',
        sub: 'developer resources',
        query: 'How to negotiate a tech salary?',
        answer: 'Research market rates on Levels.fyi. Always negotiate — 87% of hiring managers expect it. Start 15-20% above target...',
        srcs: ['Levels.fyi', 'Hacker News'],
        floats: [
          { icon: '✨', top: '26%', right: '-4px', bg: 'linear-gradient(135deg,#C9B0FF,#9D70F8)', rot: '12deg' },
        ],
      },

      // --- Screen 6: Features ---
      {
        label: 'Features',
        hlPos: 'top',
        uiType: 'bookmarks',
        hl: '<span class="plus-icon">+</span> Bookmarks<br><span class="plus-icon">+</span> Squads<br><span class="plus-icon">+</span> DevCards',
        sub: 'and much more.',
        folders: [
          { n: 'Interview Prep', c: 42, e: '🎯' },
          { n: 'Salary Negotiation', c: 18, e: '💰' },
          { n: 'Resume Tips', c: 15, e: '📝' },
          { n: 'Side Projects', c: 23, e: '🚀' },
        ],
        floats: [
          { icon: '📑', top: '28%', left: '-8px', bg: 'linear-gradient(135deg,#FFD700,#FF7A2B)', rot: '-6deg' },
        ],
      },
    ],
  },


  // =========================================================================
  //  TOPIC: Software Architecture
  //  Target audience: senior engineers, system design enthusiasts
  //  Accent color: onion-10 (#9D70F8)
  // =========================================================================
  {
    id: 'architecture',
    name: 'Software Architecture',
    accent: '#9D70F8',
    dot: '#9D70F8',
    angle: 'System design, architecture patterns, and scalability deep-dives saved and discussed by senior engineers.',

    screens: [

      // --- Screen 1: Hero ---
      {
        label: 'Hero',
        uiType: 'hero',
        hl: 'Deep dives on<br>scalability &',
        sub: 'software<br>architecture',
        heroFloats: [
          { icon: '🏗️', top: '55%', left: '5%', rot: '-8deg', size: 95 },
          { icon: '🌩️', top: '58%', right: '7%', rot: '10deg', size: 90 },
        ],
        badge1: { iconHtml: '<div style="font-size:50px;">🏗️</div>', val: 'Deep', label: 'Dives', sub: 'Architecture patterns' },
        badge2: { iconHtml: '<div style="font-size:45px;">🌩️</div>', val: 'Scale', sub: 'Discussions by senior devs' },
        reviewsText: 'Design systems that scale',
      },

      // --- Screen 2: Personalization ---
      {
        label: 'Personalization',
        hlPos: 'top',
        uiType: 'tags',
        hl: 'Filter for<br>architecture depth',
        sub: 'Only senior-level architecture topics',
        on: ['Architecture', 'System Design', 'Scalability', 'Microservices', 'Cloud', 'AWS'],
        off: ['React', 'CSS', 'Career'],
      },

      // --- Screen 3: Personalized ---
      {
        label: 'Personalized',
        hlPos: 'top',
        uiType: 'tags',
        stars: true,
        socialPos: 'middle',
        hl: 'Personalized',
        sub: 'for you',
        quote: '"My go-to for system design" <span class="author">Staff Eng</span>',
        on: ['Architecture', 'System Design', 'Scalability', 'Microservices', 'Cloud', 'AWS'],
        off: ['React', 'CSS', 'Career'],
        tags: [
          { text: 'architecture', top: '42%', right: '-4px', rot: '4deg' },
          { text: 'systemdesign', top: '50%', left: '4px', rot: '-6deg' },
        ],
      },

      // --- Screen 4: Discuss ---
      {
        label: 'Discuss',
        hlPos: 'top',
        uiType: 'discuss',
        hl: 'Discuss',
        sub: 'with a global<br>dev community',
        articleTitle: 'Our Team Regrets Going Serverless — Here\'s Why',
        tldr: 'Cold starts, vendor lock-in, and hidden costs made our team migrate back to containers after 18 months.',
        floats: [
          { icon: '💬', top: '30%', right: '-8px', bg: 'linear-gradient(135deg,#9D70F8,#5F37E9)', rot: '6deg' },
        ],
      },

      // --- Screen 5: Search ---
      {
        label: 'Search',
        hlPos: 'top',
        uiType: 'search',
        hl: 'Explore a world of',
        sub: 'developer resources',
        query: 'event-driven vs saga pattern',
        answer: 'Event-driven uses async events for service communication. Saga coordinates distributed transactions across services via choreography or orchestration...',
        srcs: ['Martin Fowler', 'Microservices.io'],
        floats: [
          { icon: '✨', top: '26%', right: '-4px', bg: 'linear-gradient(135deg,#C9B0FF,#9D70F8)', rot: '12deg' },
        ],
      },

      // --- Screen 6: Features ---
      {
        label: 'Features',
        hlPos: 'top',
        uiType: 'squads',
        hl: '<span class="plus-icon">+</span> Bookmarks<br><span class="plus-icon">+</span> Squads<br><span class="plus-icon">+</span> DevCards',
        sub: 'and much more.',
        squads: [
          { n: 'Netflix Tech', m: '890K', e: '🎬' },
          { n: 'Martin Fowler', m: '1.2M', e: '📖' },
          { n: 'InfoQ', m: '750K', e: '📰' },
          { n: 'Uber Eng', m: '620K', e: '🚗' },
        ],
        floats: [
          { icon: '📑', top: '28%', left: '-8px', bg: 'linear-gradient(135deg,#FFD700,#FF7A2B)', rot: '-6deg' },
        ],
      },
    ],
  },


  // =========================================================================
  //  TOPIC: DevTools & Productivity
  //  Target audience: developers interested in tooling and workflows
  //  Accent color: bun (#FF7A2B)
  // =========================================================================
  {
    id: 'devtools',
    name: 'DevTools & Productivity',
    accent: '#FF7A2B',
    dot: '#FF7A2B',
    angle: 'Discover the tools, workflows, and productivity hacks that top developers actually use.',

    screens: [

      // --- Screen 1: Hero ---
      {
        label: 'Hero',
        uiType: 'hero',
        hl: 'Stay ahead<br>with the latest',
        sub: 'devtools &<br>productivity',
        heroFloats: [
          { icon: '🛠️', top: '54%', left: '7%', rot: '-12deg', size: 90 },
          { icon: '⚡', top: '58%', right: '5%', rot: '15deg', size: 90 },
        ],
        badge1: { iconHtml: '<div style="font-size:50px;">🛠️</div>', val: 'Top 10', label: 'Tools', sub: 'Productivity hacks' },
        badge2: { iconHtml: '<div style="font-size:45px;">⚡</div>', val: 'Faster', sub: 'Workflows top devs use' },
        reviewsText: 'Optimize your dev setup',
      },

      // --- Screen 2: Personalization ---
      {
        label: 'Personalization',
        hlPos: 'top',
        uiType: 'tags',
        hl: 'Filter the<br>signal',
        sub: 'Pick tools and workflows you use',
        on: ['Developer Tools', 'Productivity', 'CLI', 'IDE', 'Git', 'Docker', 'CI/CD'],
        off: ['AI', 'React', 'Career', 'Linux'],
      },

      // --- Screen 3: Personalized ---
      {
        label: 'Personalized',
        hlPos: 'top',
        uiType: 'tags',
        stars: true,
        socialPos: 'middle',
        hl: 'Personalized',
        sub: 'for you',
        quote: '"Discover gems every week" <span class="author">10x Dev</span>',
        on: ['Developer Tools', 'Productivity', 'CLI', 'IDE', 'Git', 'Docker'],
        off: ['AI', 'React', 'Career', 'Linux'],
        tags: [
          { text: 'devtools', top: '42%', right: '-4px', rot: '3deg' },
          { text: 'productivity', top: '50%', left: '4px', rot: '-5deg' },
        ],
      },

      // --- Screen 4: Discuss ---
      {
        label: 'Discuss',
        hlPos: 'top',
        uiType: 'discuss',
        hl: 'Discuss',
        sub: 'with a global<br>dev community',
        articleTitle: 'Cursor vs GitHub Copilot: The 2026 AI Coding Tool Comparison',
        tldr: 'Cursor excels at multi-file edits and agentic workflows. Copilot remains stronger for inline completions.',
        floats: [
          { icon: '💬', top: '30%', right: '-8px', bg: 'linear-gradient(135deg,#FF7A2B,#FF5454)', rot: '6deg' },
        ],
      },

      // --- Screen 5: Search ---
      {
        label: 'Search',
        hlPos: 'top',
        uiType: 'search',
        hl: 'Explore a world of',
        sub: 'developer resources',
        query: 'Docker vs Podman for local dev',
        answer: 'Docker remains most popular. Podman is daemonless and rootless by default, more secure. Both support Compose now...',
        srcs: ['Docker Docs', 'Red Hat Blog'],
        floats: [
          { icon: '✨', top: '26%', right: '-4px', bg: 'linear-gradient(135deg,#C9B0FF,#9D70F8)', rot: '12deg' },
        ],
      },

      // --- Screen 6: Features ---
      {
        label: 'Features',
        hlPos: 'top',
        uiType: 'squads',
        hl: '<span class="plus-icon">+</span> Bookmarks<br><span class="plus-icon">+</span> Squads<br><span class="plus-icon">+</span> DevCards',
        sub: 'and much more.',
        squads: [
          { n: 'Terminal Fans', m: '8.9K', e: '💻' },
          { n: 'VS Code Power Users', m: '22.1K', e: '🔮' },
          { n: 'DevOps Tools', m: '15.4K', e: '🛠' },
          { n: 'AI Coding', m: '11.7K', e: '🤖' },
        ],
        floats: [
          { icon: '📑', top: '28%', left: '-8px', bg: 'linear-gradient(135deg,#FFD700,#FF7A2B)', rot: '-6deg' },
        ],
      },
    ],
  },


  // =========================================================================
  //  TOPIC: Open Source & Linux
  //  Target audience: OSS contributors, Linux enthusiasts
  //  Accent color: avocado (#1DDC6F)
  // =========================================================================
  {
    id: 'opensource',
    name: 'Open Source & Linux',
    accent: '#1DDC6F',
    dot: '#1DDC6F',
    angle: 'Track trending open source projects, GitHub repos, and Linux updates in one developer feed.',

    screens: [

      // --- Screen 1: Hero ---
      {
        label: 'Hero',
        uiType: 'hero',
        hl: 'Track trending<br>projects in',
        sub: 'open source<br>& Linux',
        heroFloats: [
          { icon: '🐧', top: '58%', left: '8%', rot: '-10deg', size: 100 },
          { icon: '💚', top: '53%', right: '6%', rot: '15deg', size: 90 },
        ],
        badge1: { iconHtml: '<div style="font-size:50px;">🐧</div>', val: 'Linux', label: 'Updates', sub: 'Trending distros' },
        badge2: { iconHtml: '<div style="font-size:45px;">🐙</div>', val: 'GitHub', sub: 'Open source feeds' },
        reviewsText: 'Track the OSS ecosystem',
      },

      // --- Screen 2: Personalization ---
      {
        label: 'Personalization',
        hlPos: 'top',
        uiType: 'tags',
        hl: 'Tune your OSS<br>feed',
        sub: 'Follow repos, Linux, and OSS topics',
        on: ['Open Source', 'GitHub', 'Linux', 'Rust', 'Go', 'Kubernetes'],
        off: ['React', 'CSS', 'Career', 'AI'],
      },

      // --- Screen 3: Personalized ---
      {
        label: 'Personalized',
        hlPos: 'top',
        uiType: 'tags',
        stars: true,
        socialPos: 'middle',
        hl: 'Personalized',
        sub: 'for you',
        quote: '"Best OSS discovery tool" <span class="author">Maintainer</span>',
        on: ['Open Source', 'GitHub', 'Linux', 'Rust', 'Go', 'Kubernetes'],
        off: ['React', 'CSS', 'Career', 'AI'],
        tags: [
          { text: 'opensource', top: '42%', right: '-4px', rot: '3deg' },
          { text: 'linux', top: '50%', left: '4px', rot: '-6deg' },
          { text: 'github', top: '46%', left: '35%', rot: '2deg' },
        ],
      },

      // --- Screen 4: Discuss ---
      {
        label: 'Discuss',
        hlPos: 'top',
        uiType: 'discuss',
        hl: 'Discuss',
        sub: 'with a global<br>dev community',
        articleTitle: 'Open Source Funding Crisis: What Can We Do About It?',
        tldr: 'Core maintainers of critical infrastructure earn below market rates. New models like Polar.sh and GitHub Sponsors evolving.',
        floats: [
          { icon: '💬', top: '30%', right: '-8px', bg: 'linear-gradient(135deg,#1DDC6F,#0a8a4a)', rot: '6deg' },
        ],
      },

      // --- Screen 5: Search ---
      {
        label: 'Search',
        hlPos: 'top',
        uiType: 'search',
        hl: 'Explore a world of',
        sub: 'developer resources',
        query: 'Best Linux distros for devs 2026',
        answer: 'Fedora 42 leads for cutting-edge. Ubuntu 26.04 LTS best for stability. Arch for customization. NixOS gaining momentum...',
        srcs: ['It\'s FOSS', 'DistroWatch'],
        floats: [
          { icon: '✨', top: '26%', right: '-4px', bg: 'linear-gradient(135deg,#C9B0FF,#9D70F8)', rot: '12deg' },
        ],
      },

      // --- Screen 6: Features ---
      {
        label: 'Features',
        hlPos: 'top',
        uiType: 'squads',
        hl: '<span class="plus-icon">+</span> Bookmarks<br><span class="plus-icon">+</span> Squads<br><span class="plus-icon">+</span> DevCards',
        sub: 'and much more.',
        squads: [
          { n: 'OSS Contributors', m: '19.8K', e: '💚' },
          { n: 'Linux Users', m: '16.3K', e: '🐧' },
          { n: 'Rust Community', m: '12.1K', e: '🦀' },
          { n: 'Go Developers', m: '10.7K', e: '🐹' },
        ],
        floats: [
          { icon: '📑', top: '28%', left: '-8px', bg: 'linear-gradient(135deg,#FFD700,#FF7A2B)', rot: '-6deg' },
        ],
      },
    ],
  },

];
