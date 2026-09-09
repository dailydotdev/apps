---
name: tldr-reel
description: Build a "// TL;DR" short vertical video from a daily.dev article — the data contract, copy rules, image retrieval and timing derivation. Use when generating social video or slides for TikTok, YouTube Shorts or X from a daily.dev post.
---

# // TL;DR reel

A 26–30s vertical video that retells one daily.dev article. Music and on-screen
text only, **never a voiceover**. Six frames, one visual treatment, outro on the
app icon.

The goal is installs, not views. The format's job is to retell an article well
enough in half a minute that a developer wants the source.

```
python3 scripts/fetch_article.py <daily.dev url> --out bundle.json
python3 scripts/analyse_track.py track.mp3
```

The first resolves an article into every field the format needs plus scored
background candidates. The second derives the timing from the music. Both hit
public endpoints with no auth and print the flags that change what you build.

---

## The data contract

Everything below is verified against `api.daily.dev/graphql` **unauthenticated**.

### Available and reliable

| Field | Notes |
|---|---|
| `title` | The raw article headline |
| `summary` | ~4 sentences. **Can be null** on short or old posts |
| `image` | Exactly one cover. **Can be null**, or a shared placeholder |
| `tags` | Drives image retrieval |
| `readTime`, `numUpvotes`, `numComments`, `views` | |
| `source { name handle image }` | |
| `trending` | Integer or null |
| `creatorTwitter` | On the **post**, not the author. Often null |
| `topComments` | Via `TOP_COMMENTS_QUERY`. Not used by this format |

### Gated or unreliable — do not build on these

- **`smartTitle`** — `fetchSmartTitle` returns `UNAUTHENTICATED`. Needs a
  Personal Access Token. Use `title` instead.
- **`hero`**, **`communitySentiment`** — queryable but frequently `null`, even on
  well-engaged posts. Never load-bearing.

### `majorHeadlines` is the better front door

`majorHeadlines(first:)` returns the Happening Now highlights unauthenticated,
and each carries an **editorial `headline`** that is far more readable than
`title`, plus a `significance` flag:

> `headline`: "Tailwind Labs joins Shopify as Tailwind CSS remains MIT-licensed"
> `title`:    "Tailwind Labs is joining Shopify"

That closes the `smartTitle` gap without auth. It also makes content selection
easy: pull Happening Now, filter on `significance`, and the shortlist is already
editorial.

### Gotchas that cost real time

- **Post ids are case sensitive.** `va5uoAWAC` resolves; `va5uoawac` returns
  `NOT_FOUND`. `post(id:)` also accepts the full URL slug, so pasting a link works.
- **`searchPosts` returns nothing unauthenticated.** Use `tagFeed` with
  `ranking: TIME` and paginate for anything older than a few days.
- **Declared GraphQL variables must be used**, or the query is rejected outright.
- **A `Trends` or `Collections` source is daily.dev's own aggregation**, not an
  outside publisher. There is nobody to credit on the outro — drop the credit line
  and put image credits in the post caption.
- **True image size comes from the CDN**, not the API: read
  `server-timing: content-info;desc="width=…,height=…"`. Covers are typically
  800px on the long edge and `owidth`/`oheight` match, so there is no larger
  original to re-sign for.

---

## The format

Six frames. **Frame 1 is the thesis**, frames 2–5 are the sequence, then the outro.

| # | Frame | Job |
|---|---|---|
| 1 | Thesis | One sentence, no follow-up. The significance, not the event |
| 2 | | The complication, or the options |
| 3 | | The catch — what it costs |
| 4 | | The shift, or the real benefit |
| 5 | | The outcome, or the proof |
| — | Outro | App icon, CTA copy, both store badges |

### Frame 1 states significance, not the event

The single most important copy rule.

> "NVIDIA open-sourced Rust for CUDA." — what happened. A fact to file and scroll past.
> **"NVIDIA is bringing Rust directly to the GPU."** — why it matters.

Present tense. Written *from* the headline, never a transcription of it. It stands
alone: no follow-up line, and one step larger than the story frames. It is the
whole hook, so it is the one frame worth A/B testing per article.

**Test:** read frame 1 aloud to someone. If they say "and?" rather than "wait,
really?", it is reporting the event. Rewrite it before touching anything else.

### Frames 2–5: the two-line rule

Each is a **bold statement** and a **plain follow-up**:

- **Bold = the turn.** What changed.
- **Plain = the consequence.** What that meant.

Never two turns in one frame. Never a turn with no consequence. That structure is
what makes the sequence feel like it is going somewhere instead of listing facts.

**Voice:** sentence case, full stops, plain words, no adjectives doing emotional
work. Assumes a working developer; never explains what a terminal is.

### Order must matter

The requirement is **not** "does it tell a story" — it is "can the frames be
shuffled". Both of these work:

- **Chronological:** situation → complication → attempt → shift → outcome
- **Logical:** the news → the options → the catch → the benefit → the proof

If reordering the frames doesn't break anything, the article is wrong for this
format. First-person experience reports and launch/acquisition news fit best.

### Reading pace is the hard constraint

Silent text is the only channel. The readable ceiling is about **3 words per
second**; the deriver targets **2.85** for margin. **Hard cap 13 words per frame** —
past that, split or cut it; no amount of extra runtime fixes it.

**Runtime is an output, not a setting.** It falls out of bpm and word count, so
"make it 25 seconds" is not a spec this format can honour. Two tracks reached
almost the same length with different bar counts (14 vs 11) purely because of tempo.

### Banned

"You won't believe", "this changes everything", "devs hate this", emoji strings,
ALL CAPS, exclamation marks, and any statement the next frame doesn't pay off.
Every line must be literally true per the article.

**Brand:** "daily.dev" is always lowercase. Never state a user count — the phrasing
is "millions of developers".

---

## Frame geometry — 1080×1920

| Element | Position |
|---|---|
| Photo | `inset:0`, `object-fit:cover`, **always full bleed** |
| Scrim | `left:0 bottom:0 1080×1150`, `linear-gradient(to top, #0F1218, rgba(15,18,24,.88) 55%, rgba(15,18,24,.45) 78%, transparent)` |
| Type | `left:80 bottom:280 width:840`, last baseline y=1640 |

Type: statement **92px/800**, follow-up **62px/400**, both `#FFFFFF`, left
aligned, ragged right. Hierarchy is size and weight only — colour is not carrying
it, so both lines stay legible over any photo.

The scrim's stops are weighted for the type, not spread evenly: the copy sits in
the **0.85–0.95 alpha** band. Nothing else is on the frame — no logo, no chip, no
numbers, no title card.

**Safe zones:** platform chrome eats the top 220px, the right 160px, and roughly
the bottom 320–400px. The type at 280px clearance is deliberately tight, so
**captions must be one short line** on TikTok.

### Motion

- **Cuts land on the beat**; 0.55s crossfade, the incoming layer fading in on top
  so there is no luminance dip.
- **Ken Burns** on every photo, alternating direction per frame, roughly 1.05↔1.15
  plus a 1–2% translate. Nothing is ever static.
- **Typewriter at 21ms/char.** The old rule banned typewriter as slower than
  reading; at this rate the longest line lands in ~0.75s, leaving ~3s of read.
  Above ~35ms/char the ban applies again.
- **Each frame's copy fades out over its last 0.30s**, before the next layer
  arrives. Without this, outgoing and incoming text overlap for ~0.3s at every
  transition — the most common bug in this format.

### The outro

Illustration background with a sustained eased zoom, app icon at 240px with a
glow bloom on arrival, one paragraph at **68px weight 400** in four semantic
lines, then both store badges **stacked at 537px wide**.

Staged reveal: icon at +0.32s (after the crossfade clears), copy types from
+0.86s, badges rise **after** the copy finishes — the ask lands after the pitch.

Two things that will silently regress:

- **The glow must follow the icon.** Move the icon and a fixed glow ends up
  lighting the copy instead.
- **Store badges are not the same size out of the box.** Google's PNG carries 41px
  of transparent padding per side — its artwork is 564×168 inside a 646×250 file.
  Trim the padding, then match on **width** so stacked edges align, and keep the
  gap at or above a quarter of the badge height for Google's clear-space rule.
- **No repeating pulse or blink.** On a near-static frame it reads as a UI glitch,
  not atmosphere.

---

## Image retrieval

Every background must **fill the frame**. That single rule drives selection: a
9:16 crop keeps only ~28% of a 16:9 image's width.

**Order:** the article's own cover for frame 1 → same publisher as the article →
same tag, any publisher (credit each in the caption) → the cover at several crops.

**If the story is about a company, frame 1 is the company** — its logo, or its CEO.
Nothing identifies the subject faster. The mark must be the *subject* of the cover,
not a badge in a corner.

### What survives a full-bleed crop

- **Central or vertical subjects.** A receding aisle or corridor *gains* from 9:16.
- **Repeating patterns** are crop-proof — code bars, colour swatches, circuitry.
  A fragment reads the same as the whole.
- **Wide logo lockups do not survive.** A `logoA × logoB` pair crops to nonsense.
  Aim the crop instead: `object-position: 90%` puts the window on one mark so it
  lands whole. Crops are steerable; treat position as a per-frame decision.

### The visual gate

Topical retrieval alone is not enough. A first pass once matched "debugging" to
"aliasing bugs" and returned NVIDIA's *Efficient CUDA Debugging* covers — literal
insects, their own visual pun. Semantically apt, visually wrong.

**Reject:** burned-in text in the artwork (it competes with our type), human stock
photography, faces, literal-pun imagery, off-topic subjects sharing only a tag.

**Prefer:** abstract renders, product shots and real photography on dark grounds.
A publisher with strong art direction tends to yield a coherent set.

**Never place a statement over a recognisable person's face** — it reads as a quote
attributed to them. Bias the crop so faces sit in the upper third.

Two cheap signals worth scoring: **crop survival** `(h*9/16)/w`, and a
**photographic test** — mean absolute horizontal pixel difference separates real
photography from flat marketing graphics.

**No automated rule catches all of this.** Someone has to look at the frames
before publish.

---

## Publishing

The article's real headline never appears on screen, so the caption carries it —
along with source and image credits.

**YouTube Shorts** indexes titles, so front-load the keywords and keep it under
~60 chars. Use the thesis line so the video pays off its title immediately. Only
the first three hashtags display; skip `#shorts`, it does nothing now.

**TikTok:** one short caption line, or it collides with the type.

**X:** tag the companies and the author *only* when the framing is neutral or
positive about them — never as the target of a line that mocks or corrects them.
Max two handles. `creatorTwitter` is on the post and often null, so treat author
tagging as best-effort.

---

## Guardrails

- **Publisher images** appear unmodified and full bleed, so credit is load-bearing.
  Never use watermarked or paywalled images; keep a per-source opt-out; honour
  takedowns same day.
- **Music** needs commercial clearance on all three platforms *and* to be clear of
  YouTube Content ID — a claim can silently mute or block a Short.
- **A human approves every video before it publishes.** `publish` must be a
  separate command reading an approval the render step cannot write, using a
  different credential, and CI must never hold the posting credential.
