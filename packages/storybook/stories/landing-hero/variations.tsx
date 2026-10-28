import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { ChromeIcon } from '@dailydotdev/shared/src/components/icons/Browser/Chrome';
import { EdgeIcon } from '@dailydotdev/shared/src/components/icons/Browser/Edge';
import { AppleIcon } from '@dailydotdev/shared/src/components/icons/Apple';
import { AndroidIcon } from '@dailydotdev/shared/src/components/icons/Android';
import {
  ArrowGlyph,
  CheckGlyph,
  CHROME_STORE,
  FEED_SHOT,
  GitHubMark,
  GoogleG,
  LandingPage,
  MailGlyph,
  ProviderButton,
  SignupForm,
  StarGlyph,
  quotes,
} from './hero';

export type Variation = {
  id: string;
  title: string;
  /** The bet, as "if … then … because …". */
  hypothesis: string;
  /** What moved compared with production. */
  change: string;
  /** What to watch, or why it could lose. */
  risk: string;
  /** Phones render differently from the laptop shot. */
  phoneNote?: string;
  render: () => ReactElement;
};

/* ------------------------------------------------------------ small bits */

const Stars = (): ReactElement => (
  <span className="lh-stars-sm" aria-hidden="true">
    {Array.from({ length: 5 }).map((_, i) => (
      // eslint-disable-next-line react/no-array-index-key
      <StarGlyph key={i} />
    ))}
  </span>
);

const Avatars = ({ count = 5 }: { count?: number }): ReactElement => (
  <span className="lh-avatars">
    {quotes.slice(0, count).map((quote) => (
      <img key={quote.name} className="lh-avatar" src={quote.image} alt="" />
    ))}
  </span>
);

const QuoteCard = ({
  quote,
}: {
  quote: (typeof quotes)[number];
}): ReactElement => (
  <figure className="lh-quote-card" style={{ margin: 0 }}>
    <Stars />
    <blockquote className="lh-quote-text" style={{ margin: '0.75rem 0 0' }}>
      “{quote.text}”
    </blockquote>
    <figcaption className="lh-quote-who">
      <img src={quote.image} alt="" />
      <span>
        <p className="lh-quote-name">{quote.name}</p>
        <p className="lh-quote-title">{quote.title}</p>
      </span>
    </figcaption>
  </figure>
);

const topics = [
  'React',
  'TypeScript',
  'AI & LLMs',
  'Python',
  'DevOps',
  'Rust',
  'Go',
  'Backend',
  'Mobile',
  'Security',
];

const TopicPicker = (): ReactElement => {
  const [picked, setPicked] = useState(
    () => new Set(['React', 'AI & LLMs', 'TypeScript']),
  );
  const toggle = (topic: string) =>
    setPicked((current) => {
      const next = new Set(current);
      if (next.has(topic)) {
        next.delete(topic);
      } else {
        next.add(topic);
      }
      return next;
    });
  return (
    <div>
      <p className="lh-chip-label">What do you build?</p>
      <div className="lh-chips" role="group" aria-label="Topics">
        {topics.map((topic) => (
          <button
            key={topic}
            type="button"
            aria-pressed={picked.has(topic)}
            className={classNames('lh-chip', picked.has(topic) && 'lh-chip-on')}
            onClick={() => toggle(topic)}
          >
            {picked.has(topic) && (
              <span style={{ width: '0.875rem', height: '0.875rem' }}>
                <CheckGlyph />
              </span>
            )}
            {topic}
          </button>
        ))}
      </div>
    </div>
  );
};

const favicon = (domain: string): string =>
  `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

const readingNow = [
  {
    domain: 'github.blog',
    title: 'Copilot can now review a pull request before you open it',
    upvotes: 412,
  },
  {
    domain: 'vercel.com',
    title: 'Next.js 16: the compiler is on by default',
    upvotes: 287,
  },
  {
    domain: 'blog.rust-lang.org',
    title: 'Announcing Rust 1.92: async closures everywhere',
    upvotes: 196,
  },
];

const LiveStrip = (): ReactElement => (
  <div className="lh-live">
    <div className="lh-live-head">
      <span>
        <span className="lh-live-dot" aria-hidden="true" />
        Developers are reading now
      </span>
      <span className="lh-live-time">updated 2 min ago</span>
    </div>
    <ul className="lh-live-list">
      {readingNow.map((post) => (
        <li key={post.domain} className="lh-live-item">
          <img src={favicon(post.domain)} alt="" />
          <span>{post.title}</span>
          <span className="lh-live-up">▲ {post.upvotes}</span>
        </li>
      ))}
    </ul>
  </div>
);

const Platform = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}): ReactElement => (
  <a
    href="https://daily.dev/apps"
    className="lh-platform"
    title={label}
    aria-label={label}
  >
    {children}
  </a>
);

const AddToChrome = ({ className }: { className?: string }): ReactElement => (
  <a
    href={CHROME_STORE}
    className={classNames('lh-btn lh-btn-ghost lh-btn-sm', className)}
  >
    <ChromeIcon /> Add to Chrome
  </a>
);

/* ===================================================== A · signup conversion */

export const signupVariations: Variation[] = [
  {
    id: 'A1',
    title: 'Proof in the hero',
    hypothesis:
      'If the trust signals that sit one screen below the fold (4.9 on Chrome, 20K+ stars, Product of the Year, real faces) move into the hero, more visitors press a provider, because the “is this legit?” question gets answered at the moment of choice.',
    change:
      'An avatar row with “Trusted by millions of developers” above the headline, and a one-line proof row under the buttons. Nothing else moves.',
    risk: 'Two more lines of copy in the column; on 760px art the column gets tight. Watch provider clicks, not just signups.',
    render: () => (
      <LandingPage
        eyebrow={
          <span className="lh-eyebrow">
            <Avatars />
            Trusted by millions of developers
          </span>
        }
        form={
          <SignupForm
            after={
              <p className="lh-muted-row">
                <Stars />
                <strong>4.9</strong> on Chrome
                <span className="lh-dot" />
                <strong>20K+</strong> GitHub stars
                <span className="lh-dot" />
                Product of the Year, Product Hunt
              </p>
            }
          />
        }
      />
    ),
  },
  {
    id: 'A2',
    title: 'The promise and the objections',
    hypothesis:
      'If the headline is followed by one sentence that says what you get and three words that kill the top objections (price, spam, effort), more visitors sign up, because today the hero makes a brand claim and never a product promise.',
    change:
      'A sub-headline under the H1 and a three-item check row (Free forever · No spam, ever · Set up in 2 minutes). The cheapest test on this list: copy only.',
    risk: 'Lengthens the column by ~80px. If the check row reads as marketing filler it could lower trust instead of raising it; keep the claims literal.',
    render: () => (
      <LandingPage
        sub={
          <>
            <p className="lh-sub">
              One feed with every dev blog, release and discussion worth your
              time, ranked for what you build.
            </p>
            <ul className="lh-check-row">
              <li>
                <CheckGlyph /> Free forever
              </li>
              <li>
                <CheckGlyph /> No spam, ever
              </li>
              <li>
                <CheckGlyph /> Set up in 2 minutes
              </li>
            </ul>
          </>
        }
      />
    ),
  },
  {
    id: 'A3',
    title: 'Pick your stack first',
    hypothesis:
      'If visitors choose two or three topics before they are asked for an account, more of them finish, because the account becomes the last step of something they already started (and the feed they are promised is visibly theirs).',
    change:
      'A “What do you build?” chip row above the buttons with three chips preselected, and the primary button renamed “Get my feed with Google”. The picks carry into onboarding as the tag step’s defaults.',
    risk: 'Adds a decision before the ask; if visitors treat it as a form it stalls. Needs the chips to be optional and preselected so the zero-effort path is unchanged.',
    render: () => (
      <LandingPage
        form={
          <SignupForm
            before={<TopicPicker />}
            primaryLabel="Get my feed with Google"
          />
        }
      />
    ),
  },
  {
    id: 'A4',
    title: 'Show the product, not the painting',
    hypothesis:
      'If the illustration gives way to the real feed behind the form, more visitors sign up, because they are signing up for something they have now seen, and the new-tab video below the fold is the only product shot today.',
    change:
      'The hero art becomes a tilted capture of the live feed under a dark wash; the column, headline and form are untouched. The video frame stays below.',
    risk: 'The illustration is part of what the winning reboot shipped, and this swaps the LCP asset. Run it last, and only if A1/A2 move nothing.',
    phoneNote: 'Phones get the feed capture as the banner instead of the art.',
    render: () => (
      <LandingPage
        backdrop="feed"
        sub={
          <p className="lh-sub">
            This is your feed: every dev blog, release and discussion, ranked
            for what you build.
          </p>
        }
      />
    ),
  },
  {
    id: 'A5',
    title: 'One door',
    hypothesis:
      'If the hero offers one primary action instead of three equal pills, more visitors act, because three same-shaped buttons read as a menu to evaluate while one button reads as the way in. Google already leads on /onboarding.',
    change:
      'A single, taller “Continue with Google”; GitHub and email become one quiet line of links beneath it. Disclaimer and member line unchanged.',
    risk: 'GitHub-first developers may bounce without noticing the links. Segment by provider: this wins only if Google gains more than GitHub and email lose.',
    render: () => (
      <LandingPage
        form={
          <SignupForm
            buttons={
              <>
                <ProviderButton kind="google" className="lh-pill-xl" />
                <p className="lh-alt-doors">
                  or continue with{' '}
                  <a href="https://daily.dev/onboarding">
                    <GitHubMark className="" /> GitHub
                  </a>{' '}
                  ·{' '}
                  <a href="https://daily.dev/onboarding?action=signupEmail">
                    <MailGlyph className="" /> email
                  </a>
                </p>
              </>
            }
          />
        }
      />
    ),
  },
  {
    id: 'A6',
    title: 'Email first',
    hypothesis:
      'If the hero opens with an email field and a “Create account” button, more visitors start, because typing an address is a smaller first step than an OAuth consent screen, and a typed address is intent we can follow up on even when they leave.',
    change:
      'An inline email row replaces the three pills; Google and GitHub become two half-width secondary buttons under an “or” rule. The /onboarding email form receives the address prefilled.',
    risk: 'Email signups verify less and retain worse than Google ones. Measure D7 retained accounts, not signups, or this can win on the wrong number.',
    render: () => (
      <LandingPage
        form={
          <SignupForm
            buttons={
              <>
                <form
                  className="lh-email-row"
                  onSubmit={(event) => event.preventDefault()}
                >
                  <input
                    className="lh-input"
                    type="email"
                    placeholder="Email address"
                    aria-label="Email address"
                  />
                  <button
                    type="submit"
                    className="lh-pill lh-pill-primary lh-pill-fit"
                  >
                    Create account
                  </button>
                </form>
                <p className="lh-or">or</p>
                <div className="lh-icon-doors">
                  <a
                    href="https://daily.dev/onboarding"
                    className="lh-pill lh-pill-secondary"
                  >
                    <GoogleG className="lh-pill-icon-sm" /> Google
                  </a>
                  <a
                    href="https://daily.dev/onboarding"
                    className="lh-pill lh-pill-secondary"
                  >
                    <GitHubMark /> GitHub
                  </a>
                </div>
              </>
            }
          />
        }
      />
    ),
  },
  {
    id: 'A7',
    title: 'The outcome headline',
    hypothesis:
      'If the headline names the visitor’s problem instead of the brand’s position, more visitors sign up, because “where developers discover what’s next” describes daily.dev and “stop hunting for dev news” describes them.',
    change:
      'Headline and a one-line sub only. Other lines to rotate through the same slot: “Your daily dev brief, ranked by what you build.” · “Everything developers are reading today, in one feed.” · “Never miss what your stack is talking about.”',
    risk: 'The tagline is also the brand line across the site. A win here is a copy decision for marketing, not just a hero change.',
    render: () => (
      <LandingPage
        headline="Stop hunting for dev news. It finds you."
        sub={
          <p className="lh-sub">
            Every blog, release and discussion that matters, in one feed. Ranked
            for what you build.
          </p>
        }
      />
    ),
  },
  {
    id: 'A8',
    title: 'A developer vouches',
    hypothesis:
      'If a named peer’s words sit beside the form, more visitors sign up, because a real face and title next to the ask does what anonymous stats cannot, and the Wall of Love is three screens away today.',
    change:
      'A frosted quote card hangs at the right edge of the lane on laptops, in the art’s empty region; on phones it follows the form. One quote, rotated weekly from the curated hero trio.',
    risk: 'Covers part of Dee and the dev at 1024–1200px. Needs a per-breakpoint check before shipping; could also pull eyes right, away from the buttons.',
    phoneNote: 'The card drops under the form.',
    render: () => <LandingPage aside={<QuoteCard quote={quotes[0]} />} />,
  },
  {
    id: 'A9',
    title: 'Reading now',
    hypothesis:
      'If the hero shows three posts developers are reading right now, more visitors sign up, because the feed stops being abstract: it is alive, specific and today’s, which is exactly what “discover what’s next” promises.',
    change:
      'A live strip under the buttons: a pulsing dot, three real post titles with source favicons and upvotes, “updated 2 min ago”. Fed by the popular feed, cached per minute.',
    risk: 'A post title the visitor dislikes can repel. Curate from the popular feed only, and never show the same source twice.',
    render: () => <LandingPage form={<SignupForm after={<LiveStrip />} />} />,
  },
  {
    id: 'A10',
    title: 'What happens next',
    hypothesis:
      'If the column says what is behind the button (three steps, about thirty seconds), more visitors press it, because the unknown length of a signup is a cost, and naming a short path makes the click cheap.',
    change:
      'One line of three numbered steps under the buttons: Pick a login · Choose your topics · Your feed is ready. Copy only.',
    risk: 'Tiny; it either helps a little or does nothing. Pairs well with A2 as one copy arm.',
    render: () => (
      <LandingPage
        form={
          <SignupForm
            after={
              <ol className="lh-steps">
                <li>
                  <span className="lh-step-n">1</span> Pick a login
                </li>
                <li className="lh-steps-arrow" aria-hidden="true">
                  →
                </li>
                <li>
                  <span className="lh-step-n">2</span> Choose your topics
                </li>
                <li className="lh-steps-arrow" aria-hidden="true">
                  →
                </li>
                <li>
                  <span className="lh-step-n">3</span> Your feed is ready
                </li>
              </ol>
            }
          />
        }
      />
    ),
  },
];

/* ================================================== B · extension awareness */

export const extensionVariations: Variation[] = [
  {
    id: 'B1',
    title: 'The footnote',
    hypothesis:
      'If one quiet sentence under the member line says the extension exists, install intent rises without touching signups, because it adds information and no competing control.',
    change:
      'One line after “Already have an account?”: “Also available as a browser extension for Chrome and Edge.” The link goes to /apps.',
    risk: 'May be too quiet to move anything. It is the floor of this chapter: if this does nothing, awareness alone is not the lever.',
    render: () => (
      <LandingPage
        form={
          <SignupForm
            tail={
              <p className="lh-muted-row" style={{ marginTop: '0.25rem' }}>
                Also available as a{' '}
                <a href="https://daily.dev/apps" className="lh-link">
                  browser extension
                </a>{' '}
                for Chrome and Edge.
              </p>
            }
          />
        }
      />
    ),
  },
  {
    id: 'B2',
    title: 'Available everywhere',
    hypothesis:
      'If a row of platform marks (Chrome, Edge, iOS, Android) closes the column, more visitors learn that daily.dev follows them, because the pattern is familiar from Spotify and Notion and asks for nothing.',
    change:
      'An “Also on” row of four monochrome icons under the member line, each linking to /apps. No button, no copy beyond the label.',
    risk: 'Icons without names are easy to skip. If B1 beats this, words beat marks here.',
    render: () => (
      <LandingPage
        form={
          <SignupForm
            tail={
              <p className="lh-platform-row">
                <span>Also on</span>
                <Platform label="Chrome extension">
                  <ChromeIcon />
                </Platform>
                <Platform label="Edge extension">
                  <EdgeIcon />
                </Platform>
                <Platform label="iOS app">
                  <AppleIcon />
                </Platform>
                <Platform label="Android app">
                  <AndroidIcon />
                </Platform>
              </p>
            }
          />
        }
      />
    ),
  },
  {
    id: 'B3',
    title: 'The rotating line',
    hypothesis:
      'If the headline’s last line cycles through the places daily.dev lives (on the web, on every new tab, on their phone), more visitors learn about the new tab, because it is said in the headline’s own breath and the motion draws the eye without adding a control.',
    change:
      'The full stop becomes a second line in the accent purple that rotates every three seconds. The form is untouched.',
    risk: 'Motion in the LCP element; respects reduced motion by showing the first line only. Three-second cadence must not feel like a ticker.',
    render: () => (
      <LandingPage
        headline={
          <>
            Where developers discover what’s next
            <span className="lh-rotator" aria-hidden="true">
              <span className="lh-rotator-track">
                <span>on the web.</span>
                <span>on every new tab.</span>
                <span>on their phone.</span>
                <span>on the web.</span>
              </span>
            </span>
          </>
        }
      />
    ),
  },
  {
    id: 'B4',
    title: 'The demo wears the badge',
    hypothesis:
      'If the install button lives on the new-tab demo instead of beside the signup, installs rise without hurting signups, because the demo is where the extension is already being shown, one screen below the form.',
    change:
      'A “New tab extension” pill on the glass frame and a caption row under it: “This is the daily.dev new tab” with a small ghost Add to Chrome. The hero column is untouched.',
    risk: 'Only visible after a scroll, so the lift is capped by scroll depth (about half of visitors reach the frame). A clean, low-risk first arm.',
    render: () => (
      <LandingPage
        framePill={
          <span className="lh-frame-pill">
            <ChromeIcon /> New tab extension
          </span>
        }
        frameCaption={
          <div className="lh-frame-caption">
            <span>
              <strong>This is the daily.dev new tab.</strong> Open a tab, your
              feed is there.
            </span>
            <AddToChrome />
          </div>
        }
      />
    ),
  },
  {
    id: 'B5',
    title: 'Step two, optional',
    hypothesis:
      'If the column frames the extension as the optional second step after the account, install intent rises later in the funnel without a hero CTA, because visitors arrive at the post-signup install prompt already expecting it.',
    change:
      'A dimmed two-step ladder under the buttons: “1 Create your account” (now) and “2 Add it to your browser” (optional, after). No link in the hero; the lift is measured at the onboarding install step.',
    risk: 'Slow to read out: the metric is install rate at the onboarding step, so the test needs the full funnel instrumented.',
    render: () => (
      <LandingPage
        form={
          <SignupForm
            after={
              <ol className="lh-ladder">
                <li className="lh-ladder-now">
                  <span className="lh-step-n">1</span> Create your account
                </li>
                <li className="lh-ladder-line" aria-hidden="true" />
                <li className="lh-ladder-later">
                  <span className="lh-step-n">2</span> Add it to your browser
                  (optional)
                </li>
              </ol>
            }
          />
        }
      />
    ),
  },
  {
    id: 'B6',
    title: 'Cameo in the art',
    hypothesis:
      'If a small frosted new-tab window floats in the illustration, more visitors learn the extension exists, because the message becomes part of the picture the eye explores anyway, not a part of the form it is weighing.',
    change:
      'A 300px mock browser window, tilted, hovering right of the lane: a tab bar, a slice of the feed, and “Also lives in your new tab”. It links to /apps. Laptops only.',
    risk: 'Competes with Dee for the art’s focal point and is one more thing to load. Phones get nothing, so pair it with B1 for the phone arm.',
    phoneNote: 'Nothing changes on phones; the art is a banner there.',
    render: () => (
      <LandingPage
        artExtra={
          <a href="https://daily.dev/apps" className="lh-cameo">
            <span className="lh-cameo-bar">
              <span className="lh-cameo-dots">
                <span />
                <span />
                <span />
              </span>
              <span className="lh-cameo-tab">
                <ChromeIcon /> New tab
              </span>
            </span>
            <img src={FEED_SHOT} alt="" />
            <span className="lh-cameo-label">
              <ChromeIcon />
              <span>
                Also lives in your new tab
                <small>The browser extension, free on Chrome and Edge</small>
              </span>
            </span>
          </a>
        }
      />
    ),
  },
  {
    id: 'B7',
    title: 'Header door',
    hypothesis:
      'If a ghost “Add to Chrome” sits in the header next to Log in, installs rise without hurting signups, because the header is the conventional place for a second product door and it is visible on every scroll, away from the form.',
    change:
      'One ghost button in the header, left of Log in, Chromium desktops only. The pre-signup header had “Get it now” in this spot.',
    risk: 'Same screen as the form, so it is the closest cousin of the arm that lost; the saving grace is weight (ghost, small, in the chrome). Watch hero signups on Windows first.',
    phoneNote: 'Not shown on phones.',
    render: () => (
      <LandingPage headerExtra={<AddToChrome className="lh-desk-inline" />} />
    ),
  },
  {
    id: 'B8',
    title: 'You’re on Chrome',
    hypothesis:
      'If a chip above the headline speaks to the visitor’s own browser (“You’re on Chrome. daily.dev can live in your new tab”), more of them learn about the extension, because a personal, context-aware line is read where a generic one is skipped.',
    change:
      'A browser-aware chip above the H1 that links to the demo frame below. On Safari and Firefox it says “Get the app” instead. Information, not a button.',
    risk: 'Pushes the headline down ~50px on 760px art. Says “Chrome” to Edge users unless the detection is right; reuse the platform classes from the removed experiment.',
    render: () => (
      <LandingPage
        eyebrow={
          <a href="#platforms" className="lh-chip-aware">
            <ChromeIcon />
            <span>
              You’re on Chrome.{' '}
              <strong>daily.dev can live in your new tab</strong>
            </span>
            <ArrowGlyph />
          </a>
        }
      />
    ),
  },
  {
    id: 'B9',
    title: 'Stacked, subordinate',
    hypothesis:
      'If the extension offer sits under the form as a dashed, tertiary card instead of beside it as a column, installs rise without the signup loss, because the loss came from two offers at equal weight, not from the offer existing.',
    change:
      'The lost column rebuilt as one row under the buttons: “Prefer it on every new tab?” with a small ghost Add to Chrome. The signup keeps the only primary button on the page.',
    risk: 'This is the arm closest to the one that lost 16% of signups. Run it with the smallest split and the signup guardrail armed from day one.',
    render: () => (
      <LandingPage
        form={
          <SignupForm
            after={
              <div className="lh-sub-card">
                <div>
                  <strong>Prefer it on every new tab?</strong>
                  <small>The same feed, as a browser extension.</small>
                </div>
                <AddToChrome />
              </div>
            }
          />
        }
      />
    ),
  },
  {
    id: 'B10',
    title: 'Opt in, install later',
    hypothesis:
      'If the hero captures install intent as a checkbox inside the signup instead of a second door beside it, installs rise and signups hold, because the visitor makes one decision now and the browser step happens right after the account exists.',
    change:
      'A checkbox under the buttons, off by default: “Also set daily.dev as my new tab”. Checked, onboarding opens the store install step before the feed; on phones it emails the link.',
    risk: 'A checked box is a promise the funnel must keep, so the onboarding install step has to exist before this ships. Default off keeps the control path identical.',
    render: () => (
      <LandingPage
        form={
          <SignupForm
            after={
              <label className="lh-optin">
                <input type="checkbox" />
                <span>
                  Also set daily.dev as my new tab
                  <small>
                    We’ll add the browser extension right after signup. You can
                    skip it.
                  </small>
                </span>
              </label>
            }
          />
        }
      />
    ),
  },
];
