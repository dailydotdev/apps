# CPP Content Editing Guide — For AI Agents

> This guide is for AI coding agents tasked with editing daily.dev App Store Custom Product Page (CPP) content. Read this file first before making any changes.

## Quick Start

1. All content lives in **`cpp-data.js`** — this is the ONLY file you need to edit for content changes
2. The rendering engine is in **`app-store-cpp-preview.html`** — do NOT edit this unless asked to change visual layout
3. Image assets are in **`cpp-assets/`** and **`cpp-tablet-assets/`**
4. To preview, open `app-store-cpp-preview.html` in a browser (via a local server)

## File Structure

```
/apps/
├── cpp-data.js                    ← EDIT THIS — all topic/screen content
├── app-store-cpp-preview.html     ← rendering engine (don't edit for content)
├── CPP-EDITING-GUIDE.md           ← this file
├── app-store-cpp-guide.md         ← design spec / creative brief
├── cpp-assets/                    ← shared image assets
│   ├── hero/                      ← hero screen assets (logos, laurel, stars)
│   ├── tab1/ through tab5/        ← phone-specific screen assets
│   └── tablet/                    ← tablet-specific screen assets
└── cpp-tablet-assets/             ← pre-rendered tablet screenshots (per topic)
```

## Data Structure Overview

`cpp-data.js` exports `window.CPP_DATA` — an array of **topic objects**. Each topic has 6 **screens**.

```
window.CPP_DATA = [
  {                           ← Topic object
    id: 'ai-ml',             ← unique identifier (used in filenames)
    name: 'AI / ML ...',     ← display name in the UI tabs
    accent: '#2CDCE6',       ← accent color (hex)
    dot: '#2CDCE6',          ← tab dot color (usually same as accent)
    angle: 'Description...', ← description text shown below topic header
    screens: [                ← exactly 6 screens per topic
      { ... },               ← Screen 1: Hero
      { ... },               ← Screen 2: Personalization/Feed
      { ... },               ← Screen 3: Personalized
      { ... },               ← Screen 4: Discuss
      { ... },               ← Screen 5: Search
      { ... },               ← Screen 6: Features
    ]
  },
  ...
]
```

## Topics

There are currently 7 topics:

| Index | ID             | Name                    | Accent Color |
|-------|----------------|-------------------------|--------------|
| 0     | `master`       | Master (Default)        | `#CE3DF3`    |
| 1     | `ai-ml`        | AI / ML Developers      | `#2CDCE6`    |
| 2     | `frontend`     | Frontend / React        | `#3169F5`    |
| 3     | `career`       | Career Growth           | `#92F21D`    |
| 4     | `architecture` | Software Architecture   | `#9D70F8`    |
| 5     | `devtools`     | DevTools & Productivity | `#FF7A2B`    |
| 6     | `opensource`    | Open Source & Linux     | `#1DDC6F`    |

### Topic-Level Fields

| Field    | Type   | Required | Description                              |
|----------|--------|----------|------------------------------------------|
| `id`     | string | YES      | Unique slug used in filenames and URLs    |
| `name`   | string | YES      | Display name in the UI tab bar           |
| `accent` | string | YES      | Hex color for gradient glows             |
| `dot`    | string | YES      | Hex color for tab dot (usually = accent) |
| `angle`  | string | no       | Description text below the topic header  |

---

## Screen Types Reference

Each screen has a `label` and a `uiType` that controls what gets rendered inside the phone mockup.

### Screen 1: Hero (`uiType: 'hero'`)

The hero is the first screenshot — it shows the app's logo, social proof badges, stars, and a headline.

**Content fields:**

| Field         | Description                                  | Example                          |
|---------------|----------------------------------------------|----------------------------------|
| `hl`          | Top headline (lighter weight). Use `<br>` for line breaks | `'Your personalized<br>news feed for'` |
| `sub`         | Bold headline (heavy weight). Use `<br>` for line breaks  | `'AI & ML<br>developers'`      |
| `reviewsText` | Text shown below the 5 gold stars            | `'Top Choice for AI Devs'`     |
| `badge1.val`  | Left badge large number/text                 | `'500+'`                        |
| `badge1.label`| Left badge small label (next to val)         | `'Sources'`                     |
| `badge1.sub`  | Left badge subtext                           | `'Real-time AI news'`          |
| `badge1.iconHtml` | Left badge icon (emoji in a div)        | `'<div style="font-size:50px;">🤖</div>'` |
| `badge2.val`  | Right badge large text                       | `'589K+'`                       |
| `badge2.sub`  | Right badge subtext                          | `'AI Engagements'`             |
| `badge2.iconHtml` | Right badge icon (emoji in a div)       | `'<div style="font-size:45px;">🔥</div>'` |
| `heroFloats`  | Array of floating emoji icons beside the badges | See floats format below      |

**heroFloats format:**
```javascript
heroFloats: [
  { icon: '🤖', top: '55%', left: '5%', rot: '-15deg', size: 100 },
  { icon: '🧠', top: '60%', right: '5%', rot: '10deg', size: 90 },
]
```

### Screen 2: Personalization / Feed

This screen type varies by topic:

**If `uiType: 'feed'`** (used by master topic):

| Field | Description | Example |
|-------|-------------|---------|
| `hl`  | Title above phone | `'Learn new<br>things'` |
| `sub` | Subtitle | `'anywhere'` |

**If `uiType: 'tags'` with `label: 'Personalization'`** (used by segment topics):

| Field | Description | Example |
|-------|-------------|---------|
| `hl`  | Headline | `'Cut through<br>the noise'` |
| `sub` | Subtitle | `'Only the AI topics that matter'` |
| `on`  | Array of selected tag names | `['AI', 'Machine Learning', 'LLM']` |
| `off` | Array of unselected tag names | `['React', 'CSS', 'DevOps']` |

### Screen 3: Personalized (`label: 'Personalized'`)

Shows a phone with tag selection, floating icons, star rating, and a user quote.

| Field   | Description | Example |
|---------|-------------|---------|
| `hl`    | Title (usually "Personalized") | `'Personalized'` |
| `sub`   | Subtitle | `'for you'` |
| `quote` | User quote with author. Wrap author in `<span class="author">` | `'"Must have app for AI devs" <span class="author">ML Weekly</span>'` |
| `on`    | Selected tags shown in phone | `['AI', 'Machine Learning', 'LLM']` |
| `off`   | Unselected tags shown in phone | `['React', 'CSS']` |
| `tags`  | Floating tag pills around phone | `[{ text: 'ai', top: '48%', left: '12px', rot: '-1deg' }]` |
| `floats`| Floating emoji icons | See floats format |

### Screen 4: Discuss (`uiType: 'discuss'`)

Shows a discussion/article view inside the phone.

| Field          | Description | Example |
|----------------|-------------|---------|
| `hl`           | Headline | `'Discuss'` |
| `sub`          | Subtitle | `'with a global<br>dev community'` |
| `articleTitle`  | Title of the article shown in the phone | `'NVIDIA CEO Says...'` |
| `tldr`          | TLDR text shown below article | `'NVIDIA CEO believes...'` |
| `floats`        | Floating icons | See floats format |

### Screen 5: Search (`uiType: 'search'`)

Shows a search interface with an AI answer.

| Field    | Description | Example |
|----------|-------------|---------|
| `hl`     | Headline | `'Explore a world of'` |
| `sub`    | Subtitle | `'developer resources'` |
| `query`  | Search query text shown in search bar | `'How do transformers scale?'` |
| `answer` | AI answer text | `'Transformer attention scales...'` |
| `srcs`   | Array of source names shown as tags | `['arXiv', 'Illustrated Transformer']` |
| `posts`  | Optional: post cards shown below answer | See post format |
| `floats` | Floating icons | See floats format |

**Post format:**
```javascript
posts: [{
  title: 'Article title here',
  src: 'Source Name',        // source display name
  srcLetter: 'S',            // first letter for icon
  srcColor: '#FF5454',       // icon background color
  readTime: '8m',            // reading time
  upvotes: '892',            // upvote count
  comments: '67',            // comment count
  thumb: 'linear-gradient(...)' // optional thumbnail gradient
}]
```

### Screen 6: Features

The features screen shows a feature list headline and a phone with different content depending on `uiType`:

| Field | Description | Example |
|-------|-------------|---------|
| `hl`  | Feature list (uses `<span class="plus-icon">+</span>` prefix) | See below |
| `sub` | Footer text | `'and much more.'` |

**Standard feature list `hl`:**
```
'<span class="plus-icon">+</span> Bookmarks<br><span class="plus-icon">+</span> Squads<br><span class="plus-icon">+</span> DevCards'
```

**Phone content varies by `uiType`:**

- `uiType: 'profile'` — Shows a DevCard profile
- `uiType: 'squads'` — Shows squad cards. Requires `squads` array:
  ```javascript
  squads: [
    { n: 'LLM Builders', m: '12.4K', e: '🤖' },  // n=name, m=members, e=emoji
  ]
  ```
- `uiType: 'bookmarks'` — Shows bookmark folders. Requires `folders` array:
  ```javascript
  folders: [
    { n: 'Interview Prep', c: 42, e: '🎯' },  // n=name, c=count, e=emoji
  ]
  ```

---

## Floats Format (Floating 3D Icons)

Floating icons appear around the phone mockup on many screens:

```javascript
floats: [
  {
    icon: '💬',                                    // emoji or SVG string
    top: '30%',                                     // vertical position
    left: '-8px',                                   // horizontal position (use left OR right)
    // right: '-8px',                               // alternative to left
    bg: 'linear-gradient(135deg,#2CDCE6,#0a6a7a)', // background gradient
    rot: '6deg',                                    // rotation angle
  }
]
```

---

## Common Tasks

### Change a headline

Find the topic by `id`, then the screen by `label`, and update `hl` and/or `sub`:

```javascript
// Before
hl: 'Your personalized<br>news feed for',
sub: 'AI & ML<br>developers',

// After
hl: 'The #1 news<br>feed for',
sub: 'AI engineers',
```

### Change a hero badge

Find the hero screen (screen index 0) and update `badge1` or `badge2`:

```javascript
badge1: { iconHtml: '<div style="font-size:50px;">🤖</div>', val: '1K+', label: 'AI Sources', sub: 'Updated in real time' },
```

### Change tags on personalization screens

Update the `on` and `off` arrays:

```javascript
on: ['AI', 'Machine Learning', 'LLM', 'Deep Learning', 'Computer Vision'],
off: ['React', 'CSS', 'DevOps'],
```

### Change a discussion article

Update `articleTitle` and `tldr` on the Discuss screen:

```javascript
articleTitle: 'New Article Title Here',
tldr: 'Summary of the article for the TLDR section.',
```

### Change a search query

Update `query`, `answer`, and `srcs` on the Search screen:

```javascript
query: 'What is RAG in AI?',
answer: 'Retrieval-Augmented Generation combines LLMs with external knowledge bases...',
srcs: ['arXiv', 'LangChain Docs'],
```

### Change squad names

Update the `squads` array on the Features screen:

```javascript
squads: [
  { n: 'New Squad Name', m: '15.2K', e: '🚀' },
  { n: 'Another Squad', m: '8.1K', e: '💡' },
],
```

### Change the topic description

Update the `angle` field on the topic:

```javascript
angle: 'New description that appears below the topic header in the preview tool.',
```

### Change the accent color

Update both `accent` and `dot` to the same hex value:

```javascript
accent: '#FF5454',
dot: '#FF5454',
```

Available brand colors:
- `#CE3DF3` — cabbage (purple, brand default)
- `#2CDCE6` — blueCheese (cyan)
- `#3169F5` — water (blue)
- `#92F21D` — lettuce (lime green)
- `#9D70F8` — onion (light purple)
- `#FF7A2B` — bun (orange)
- `#1DDC6F` — avocado (green)
- `#FF5454` — ketchup (red)
- `#FFDF00` — cheese (yellow)

---

## Adding a New Topic

Copy an existing topic block (e.g., the AI/ML one) and change every value. The required structure:

```javascript
{
  id: 'your-topic-id',           // unique slug, lowercase with hyphens
  name: 'Your Topic Name',       // shown in the tab bar
  accent: '#HEX_COLOR',          // accent color
  dot: '#HEX_COLOR',             // same as accent
  angle: 'Description of this topic for the header.',

  screens: [
    // Screen 1: Hero (uiType: 'hero')
    { label: 'Hero', uiType: 'hero', hl: '...', sub: '...', reviewsText: '...', 
      badge1: { iconHtml: '...', val: '...', label: '...', sub: '...' },
      badge2: { iconHtml: '...', val: '...', sub: '...' },
      heroFloats: [{ icon: '...', top: '55%', left: '5%', rot: '-15deg', size: 100 }],
    },
    // Screen 2: Personalization (uiType: 'tags')
    { label: 'Personalization', hlPos: 'top', uiType: 'tags', hl: '...', sub: '...', 
      on: ['Tag1', 'Tag2'], off: ['Tag3', 'Tag4'] },
    // Screen 3: Personalized (uiType: 'tags', stars: true)
    { label: 'Personalized', hlPos: 'top', uiType: 'tags', stars: true, socialPos: 'middle',
      hl: 'Personalized', sub: 'for you', 
      quote: '"Quote text" <span class="author">Author</span>',
      on: ['Tag1', 'Tag2'], off: ['Tag3', 'Tag4'],
      tags: [{ text: 'tagname', top: '42%', right: '-4px', rot: '3deg' }],
      floats: [{ icon: '🔥', top: '55%', left: '-16px', bg: 'linear-gradient(135deg,#color1,#color2)', rot: '-10deg' }],
    },
    // Screen 4: Discuss (uiType: 'discuss')
    { label: 'Discuss', hlPos: 'top', uiType: 'discuss', hl: 'Discuss', sub: 'with a global<br>dev community',
      articleTitle: 'Article title', tldr: 'TLDR summary text.',
      floats: [{ icon: '💬', top: '30%', right: '-8px', bg: 'linear-gradient(135deg,#color1,#color2)', rot: '6deg' }],
    },
    // Screen 5: Search (uiType: 'search')
    { label: 'Search', hlPos: 'top', uiType: 'search', hl: 'Explore a world of', sub: 'developer resources',
      query: 'Search query text?', answer: 'AI answer text...', srcs: ['Source1', 'Source2'],
      floats: [{ icon: '✨', top: '26%', right: '-4px', bg: 'linear-gradient(135deg,#C9B0FF,#9D70F8)', rot: '12deg' }],
    },
    // Screen 6: Features (uiType: 'squads' or 'bookmarks' or 'profile')
    { label: 'Features', hlPos: 'top', uiType: 'squads',
      hl: '<span class="plus-icon">+</span> Bookmarks<br><span class="plus-icon">+</span> Squads<br><span class="plus-icon">+</span> DevCards',
      sub: 'and much more.',
      squads: [{ n: 'Squad Name', m: '10K', e: '🔥' }],
      floats: [{ icon: '📑', top: '28%', left: '-8px', bg: 'linear-gradient(135deg,#FFD700,#FF7A2B)', rot: '-6deg' }],
    },
  ],
},
```

Place the new topic anywhere in the array. It will appear as a new tab in the preview.

---

## Removing a Topic

Delete the entire topic object (from `{` to `},`) from the array. Make sure the commas are correct.

---

## Important Rules

1. **Use `<br>` for line breaks** in headlines and subtitles, not `\n`
2. **Escape single quotes** with `\'` in strings (e.g., `'Here\'s what happened'`)
3. **Keep headlines short**: 3-6 words per line, max 2 lines total
4. **Keep subtitles short**: 1 line, under 60 characters
5. **Badge values**: Keep them punchy — numbers, short words (e.g., `'500+'`, `'Top 10'`)
6. **Don't change `label` values** — the render engine uses labels like `'Hero'`, `'Personalized'`, `'Discuss'`, `'Search'`, `'Features'` to select the correct renderer
7. **Don't change `uiType` values** unless you understand the rendering implications
8. **Tags in `on`/`off` arrays** should be realistic developer topics
9. The `master` topic is the default listing (index 0) — always keep it first

## Downloading Assets

After editing content, the user opens `app-store-cpp-preview.html` in a browser and:
1. Clicks each topic tab to preview
2. Uses the "Download" button per topic or "Download All .zip" for everything
3. Switches between "iPhone 1320×2868" and "Tablet 2752×2064" export modes
4. The downloaded images are the final App Store screenshots

## Asset Directories

- `cpp-assets/hero/` — Logo SVGs, laurel wreath, star images
- `cpp-assets/tab1/` through `tab5/` — Phone screen images per screen type
- `cpp-assets/tablet/` — Tablet-specific images
- `cpp-tablet-assets/` — Pre-exported tablet screenshots (6 per topic)

Image URLs in the data file are relative paths (e.g., `'cpp-assets/hero/laurel.png'`). Some screens reference Figma API URLs for their assets.

## Editor

Each screen has a click-to-edit feature. Clicking a screenshot opens an editor with form fields. Changes made in the editor override the values from `cpp-data.js` and persist in `localStorage`. The editor is useful for quick tweaks and previewing, but for systematic content changes, edit `cpp-data.js` directly.

---

*Last updated: March 4, 2026*
