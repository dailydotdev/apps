import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { ChromeIcon } from '@dailydotdev/shared/src/components/icons/Browser/Chrome';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import {
  CheckGlyph,
  CHROME_STORE,
  FEED_SHOT,
  GitHubMark,
  GoogleG,
  Header,
  LandingPage,
  MailGlyph,
  ProviderButton,
  SignupForm,
  StarGlyph,
  quotes,
} from './hero';
import { FeedCards, MiniFeed, postsThisWeek, rankPosts, stacks } from './feed';
import type { FeedAction } from './feed';
import type { Variation } from './variations';
import { realPosts } from '../hero-cover/realData';

/* Round two. Every variation names the platform or principle it borrows,
   and the internal number that makes it worth a test (docs in Smith's
   brain: landing-hero-experiment-proposal-2026-10, web-to-extension-
   conversion-2026-09, week1-retention-no-extension-web-cohort-2026-09). */

export type Variation2 = Variation & {
  /** Where the pattern comes from. */
  borrowed: string;
  /** The page scrolls inside a fixed frame. */
  scroll?: boolean;
  /** A second screen, when the variation is a sequence. */
  renderSecond?: () => ReactElement;
  secondLabel?: string;
  /** Picked by Tsahi as the direction to build. */
  final?: boolean;
  /** What production has to do, and what it cannot. */
  decision?: string;
};

/* ------------------------------------------------------------ shared */

const Stars = (): ReactElement => (
  <span className="lh-stars-sm" aria-hidden="true">
    {Array.from({ length: 5 }).map((_, i) => (
      // eslint-disable-next-line react/no-array-index-key
      <StarGlyph key={i} />
    ))}
  </span>
);

const Proof = ({ short = false }: { short?: boolean }): ReactElement => (
  <span className="lh-proof-inline">
    <Stars />
    <strong>4.9</strong>
    {short ? '· 400K developers' : 'on the Chrome Web Store · 400K developers'}
  </span>
);

const AddToChrome = ({
  label = 'Add to Chrome, it’s free',
  className,
}: {
  label?: string;
  className?: string;
}): ReactElement => (
  <a
    href={CHROME_STORE}
    className={classNames('lh-btn lh-btn-ghost lh-btn-sm', className)}
  >
    <ChromeIcon /> {label}
  </a>
);

const useFrameWindow = (ref: React.RefObject<HTMLElement>): Window | null => {
  const [view, setView] = useState<Window | null>(null);
  useEffect(() => {
    setView(ref.current?.ownerDocument.defaultView ?? null);
  }, [ref]);
  return view;
};

/** True once the element has scrolled above the frame's viewport. */
const useScrolledPast = (
  ref: React.RefObject<HTMLElement>,
  offset = 0,
): boolean => {
  const [past, setPast] = useState(false);
  const view = useFrameWindow(ref);
  useEffect(() => {
    if (!view || !ref.current) {
      return undefined;
    }
    const check = () => {
      const rect = ref.current?.getBoundingClientRect();
      setPast(!!rect && rect.bottom < offset);
    };
    check();
    view.addEventListener('scroll', check, { passive: true });
    return () => view.removeEventListener('scroll', check);
  }, [view, ref, offset]);
  return past;
};

const AuthSheet = ({
  title,
  body,
  onClose,
  center = false,
  primaryLabel,
}: {
  title: string;
  body: string;
  onClose: () => void;
  center?: boolean;
  primaryLabel?: string;
}): ReactElement => (
  <div className={classNames('lh-scrim', center && 'lh-scrim-center')}>
    <div
      className={classNames(
        'lh-sheet lh-sheet-wrap',
        center && 'lh-sheet-card',
      )}
    >
      <button
        type="button"
        className="lh-sheet-close"
        aria-label="Close"
        onClick={onClose}
      >
        ×
      </button>
      <h2>{title}</h2>
      <p>{body}</p>
      <SignupForm primaryLabel={primaryLabel} />
    </div>
  </div>
);

const Chips = ({
  picked,
  onToggle,
}: {
  picked: Set<string>;
  onToggle: (label: string) => void;
}): ReactElement => (
  <div className="lh-chips" role="group" aria-label="Your stack">
    {stacks.map((stack) => (
      <button
        key={stack.label}
        type="button"
        aria-pressed={picked.has(stack.label)}
        className={classNames(
          'lh-chip',
          picked.has(stack.label) && 'lh-chip-on',
        )}
        onClick={() => onToggle(stack.label)}
      >
        {picked.has(stack.label) && (
          <span style={{ width: '0.875rem', height: '0.875rem' }}>
            <CheckGlyph />
          </span>
        )}
        {stack.label}
      </button>
    ))}
  </div>
);

const usePicked = (initial: string[] = []) => {
  const [picked, setPicked] = useState(() => new Set(initial));
  const toggle = (label: string) =>
    setPicked((current) => {
      const next = new Set(current);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  return { picked, toggle };
};

/* ------------------------------------------------- window page (feed) */

const WindowPage = ({
  dock,
  onAction,
  columns = 3,
  count = 9,
  overlay,
  fade = false,
}: {
  dock?: ReactNode;
  onAction?: (action: FeedAction, post: Post) => void;
  columns?: 2 | 3;
  count?: number;
  overlay?: ReactNode;
  fade?: boolean;
}): ReactElement => (
  <div className="lh-root">
    <Header nav="minimal" />
    <div className="lh-container lh-window">
      <div className={classNames(!!dock && 'lh-window-grid')}>
        <div className={classNames(fade && 'lh-feed-fade')}>
          <div className="lh-window-head">
            <h1>What developers are reading today</h1>
            <span>Ranked by developers, not by an algorithm alone</span>
          </div>
          <FeedCards
            posts={realPosts.slice(0, count)}
            columns={columns}
            onAction={onAction}
          />
        </div>
        {dock}
      </div>
    </div>
    {overlay}
  </div>
);

/* ================================================= S · signup, round two */

const SharpForm = (): ReactElement => (
  <SignupForm
    buttons={
      <>
        <ProviderButton kind="google" />
        <div className="lh-half-row">
          <ProviderButton kind="github" label="GitHub" />
          <ProviderButton kind="email" label="Email" />
        </div>
      </>
    }
    after={
      <>
        <p className="lh-muted-row">
          Free forever <span className="lh-dot" /> No credit card{' '}
          <span className="lh-dot" /> <strong>1M+</strong> developers
        </p>
        <ol className="lh-steps">
          <li>
            <span className="lh-step-n">1</span> Sign up (10 seconds)
          </li>
          <li className="lh-steps-arrow" aria-hidden="true">
            →
          </li>
          <li>
            <span className="lh-step-n">2</span> Pick your stack
          </li>
          <li className="lh-steps-arrow" aria-hidden="true">
            →
          </li>
          <li>
            <span className="lh-step-n">3</span> Read here or on every new tab
          </li>
        </ol>
      </>
    }
  />
);

const Sharp = (): ReactElement => {
  const reasons = new Set(['React', 'AI & LLMs', 'Backend']);
  return (
    <LandingPage
      nav="minimal"
      headline="The best dev reads, ranked for your stack."
      headlineClassName="lh-h1-sharp"
      sub={
        <p className="lh-sub">
          One free feed, ranked by what developers are actually reading. Skim it
          in five minutes, then get back to building.
        </p>
      }
      form={<SharpForm />}
      aside={
        <div className="lh-aside-wide">
          <MiniFeed
            posts={rankPosts(reasons, 4)}
            reasons={reasons}
            title={
              <>
                <span>Your feed</span>
                <span>why it was picked</span>
              </>
            }
          />
        </div>
      }
    />
  );
};

const MinimalWall = (): ReactElement => {
  const [open, setOpen] = useState(false);
  return (
    <LandingPage
      nav="none"
      minimal
      headline="Read less. Know what matters."
      sub={
        <p className="lh-sub">
          The dev news, blogs and releases worth your time, ranked for your
          stack. Free.
        </p>
      }
      form={
        <div className="lh-form">
          <button
            type="button"
            className="lh-pill lh-pill-primary lh-pill-xl"
            onClick={() => setOpen(true)}
          >
            Get my feed, it’s free
          </button>
          <p className="lh-member">
            Already have an account?{' '}
            <a href="https://daily.dev/onboarding?action=login">Log in</a>
          </p>
        </div>
      }
      overlay={
        open && (
          <AuthSheet
            center
            title="Pick a way in"
            body="Ten seconds, then your feed."
            onClose={() => setOpen(false)}
          />
        )
      }
    />
  );
};

const WindowDocked = (): ReactElement => {
  const { picked, toggle } = usePicked(['React']);
  return (
    <WindowPage
      columns={2}
      count={8}
      dock={
        <aside className="lh-dock">
          <h2>Make this feed yours</h2>
          <p>Pick what you build with and we rank every post for it.</p>
          <Chips picked={picked} onToggle={toggle} />
          <SignupForm
            primaryLabel={`Continue with Google · save my feed (${picked.size})`}
          />
        </aside>
      }
    />
  );
};

const ScrollSheet = (): ReactElement => {
  const anchor = useRef<HTMLDivElement>(null);
  const past = useScrolledPast(anchor, 0);
  const [dismissed, setDismissed] = useState(false);
  return (
    <WindowPage
      fade
      overlay={
        <>
          <div ref={anchor} style={{ position: 'absolute', top: 1100 }} />
          {past && !dismissed && (
            <AuthSheet
              title="Keep reading, it’s free"
              body="Three posts in. Sign up and the feed is yours, ranked for your stack."
              onClose={() => setDismissed(true)}
            />
          )}
        </>
      }
    />
  );
};

const actionCopy: Record<FeedAction, { title: string; body: string }> = {
  upvote: {
    title: 'Count your upvote',
    body: 'Sign up and we’ll record it, then rank your feed around posts like this one.',
  },
  save: {
    title: 'Save it for later',
    body: 'Sign up and this post lands in your reading list, on every device.',
  },
  read: {
    title: 'Open it, then keep going',
    body: 'Sign up and we’ll take you to the post and remember where you left off.',
  },
};

const ActToJoin = (): ReactElement => {
  const [intent, setIntent] = useState<FeedAction | null>(null);
  return (
    <WindowPage
      onAction={(action) => setIntent(action)}
      overlay={
        intent && (
          <AuthSheet
            center
            title={actionCopy[intent].title}
            body={actionCopy[intent].body}
            onClose={() => setIntent(null)}
          />
        )
      }
    />
  );
};

const packs = [
  {
    name: 'AI engineer',
    meta: '14 sources · 3 squads · 9 topics',
    tags: ['llm', 'ai-agents', 'rag'],
  },
  {
    name: 'Frontend',
    meta: '12 sources · 2 squads · 7 topics',
    tags: ['react', 'javascript', 'css'],
  },
  {
    name: 'Backend & data',
    meta: '11 sources · 2 squads · 8 topics',
    tags: ['database', 'postgresql', 'nodejs'],
  },
  {
    name: 'DevOps & cloud',
    meta: '9 sources · 1 squad · 6 topics',
    tags: ['devops', 'open-source'],
  },
  {
    name: 'Systems',
    meta: '8 sources · 2 squads · 5 topics',
    tags: ['rust', 'golang', 'performance'],
  },
  {
    name: 'Career & craft',
    meta: '10 sources · 3 squads · 6 topics',
    tags: ['career', 'productivity'],
  },
];

const packLogos = (tags: string[]): string[] => {
  const seen = new Set<string>();
  const logos: string[] = [];
  realPosts.forEach((post) => {
    const image = post.source?.image;
    if (
      image &&
      !seen.has(image) &&
      post.tags?.some((tag) => tags.includes(tag))
    ) {
      seen.add(image);
      logos.push(image);
    }
  });
  return logos.slice(0, 4);
};

const StarterPacks = (): ReactElement => {
  const [pack, setPack] = useState<string | null>(null);
  return (
    <LandingPage
      headline="Pick a pack. Your feed is ready."
      sub={
        <p className="lh-sub">
          Each pack follows the sources, squads and topics developers in that
          corner read every day. Change anything later.
        </p>
      }
      form={
        <>
          <div className="lh-packs">
            {packs.map((item) => (
              <button
                key={item.name}
                type="button"
                className="lh-pack"
                onClick={() => setPack(item.name)}
              >
                <span className="lh-pack-logos">
                  {packLogos(item.tags).map((src) => (
                    <img key={src} src={src} alt="" />
                  ))}
                </span>
                <strong>{item.name}</strong>
                <small>{item.meta}</small>
                <span className="lh-pack-cta">Join with this pack →</span>
              </button>
            ))}
          </div>
          <p className="lh-member">
            Or <a href="https://daily.dev/onboarding">start from scratch</a> ·
            Already have an account?{' '}
            <a href="https://daily.dev/onboarding?action=login">Log in</a>
          </p>
        </>
      }
      overlay={
        pack && (
          <AuthSheet
            center
            title={`Join the ${pack} pack`}
            body="One tap, and the pack is already following for you."
            onClose={() => setPack(null)}
          />
        )
      }
    />
  );
};

const BuildYourFeed = (): ReactElement => {
  const { picked, toggle } = usePicked(['React', 'AI & LLMs']);
  return (
    <LandingPage
      sub={
        <div style={{ marginTop: '1.25rem', width: '100%' }}>
          <p className="lh-chip-label">1. What do you build with?</p>
          <Chips picked={picked} onToggle={toggle} />
        </div>
      }
      form={
        <SignupForm
          primaryLabel={`Continue with Google · save my feed (${picked.size})`}
        />
      }
      aside={
        <div className="lh-aside-wide">
          <MiniFeed
            posts={rankPosts(picked, 4)}
            reasons={picked}
            title={
              <>
                <span>Your feed, live</span>
                <span>{postsThisWeek(picked)} posts this week</span>
              </>
            }
            footer="Re-ranks as you pick. Nothing saved until you sign up."
          />
        </div>
      }
    />
  );
};

const TryFirstHero = (): ReactElement => (
  <LandingPage
    sub={
      <p className="lh-sub">
        Open today’s feed and read. Make an account when you want to keep it.
      </p>
    }
    form={
      <div className="lh-form">
        <a
          href="https://app.daily.dev/"
          className="lh-pill lh-pill-primary lh-pill-xl"
        >
          Start reading, no account needed
        </a>
        <p className="lh-alt-doors">
          or create an account with{' '}
          <a href="https://daily.dev/onboarding">
            <GoogleG className="" /> Google
          </a>{' '}
          ·{' '}
          <a href="https://daily.dev/onboarding">
            <GitHubMark className="" /> GitHub
          </a>{' '}
          ·{' '}
          <a href="https://daily.dev/onboarding?action=signupEmail">
            <MailGlyph className="" /> email
          </a>
        </p>
        <p className="lh-member">
          Already have an account?{' '}
          <a href="https://daily.dev/onboarding?action=login">Log in</a>
        </p>
      </div>
    }
  />
);

const TryFirstFeed = (): ReactElement => (
  <WindowPage
    columns={3}
    count={9}
    overlay={
      <div className="lh-sticky-bar">
        <span className="lh-sticky-copy">
          Like what you’re reading? Keep it.
          <small>
            Sign up and this feed is ranked for your stack from now on.
          </small>
        </span>
        <ProviderButton kind="google" label="Save my feed" />
        <ProviderButton kind="github" label="GitHub" />
      </div>
    }
  />
);

const OneTapCard = (): ReactElement => (
  <div
    className="lh-onetap"
    role="dialog"
    aria-label="Sign in to daily.dev with Google"
  >
    <div className="lh-onetap-head">
      <span>
        <GoogleG className="lh-onetap-g" /> Sign in to daily.dev with google.com
      </span>
      <button type="button" aria-label="Close">
        ×
      </button>
    </div>
    <div className="lh-onetap-user">
      <img src={quotes[3].image} alt="" />
      <span>
        <strong>Joud Awad</strong>
        <small>joud.awad@gmail.com</small>
      </span>
    </div>
    <button type="button" className="lh-onetap-cta">
      Continue as Joud
    </button>
    <p>
      To create your account, Google will share your name, email address and
      profile picture with daily.dev.
    </p>
  </div>
);

const PersonalizedGoogle = (): ReactElement => (
  <a
    href="https://daily.dev/onboarding"
    className="lh-pill lh-pill-primary lh-pill-me"
  >
    <img src={quotes[3].image} alt="" />
    <span>
      Continue as Joud
      <small>joud.awad@gmail.com</small>
    </span>
    <GoogleG />
  </a>
);

const ContinueAsYou = ({
  returning = false,
}: {
  returning?: boolean;
}): ReactElement => (
  <LandingPage
    form={
      <SignupForm
        buttons={
          <ul className="lh-providers">
            <li>
              {returning ? (
                <PersonalizedGoogle />
              ) : (
                <ProviderButton kind="google" />
              )}
            </li>
            <li>
              <ProviderButton kind="github" />
            </li>
            <li>
              <ProviderButton kind="email" />
            </li>
          </ul>
        }
      />
    }
    overlay={!returning && <OneTapCard />}
  />
);

const SmartNudges = (): ReactElement => {
  const anchor = useRef<HTMLDivElement>(null);
  const past = useScrolledPast(anchor, 0);
  const view = useFrameWindow(anchor);
  const [exit, setExit] = useState(false);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (!view) {
      return undefined;
    }
    const leave = (event: MouseEvent) => {
      if (event.clientY <= 0 && !shown) {
        setExit(true);
        setShown(true);
      }
    };
    const timer = view.setTimeout(() => {
      if (!shown) {
        setExit(true);
        setShown(true);
      }
    }, 12000);
    view.document.addEventListener('mouseout', leave);
    return () => {
      view.document.removeEventListener('mouseout', leave);
      view.clearTimeout(timer);
    };
  }, [view, shown]);
  return (
    <LandingPage
      afterColumn={<div ref={anchor} />}
      overlay={
        <>
          {past && (
            <div className="lh-sticky-bar">
              <span className="lh-sticky-copy">
                Your feed is one tap away.
                <small>Free forever · ranked for your stack</small>
              </span>
              <ProviderButton kind="google" />
              <ProviderButton kind="github" label="GitHub" />
            </div>
          )}
          {exit && (
            <div className="lh-scrim lh-scrim-center">
              <div
                className="lh-sheet lh-sheet-card lh-sheet-wrap"
                style={{ maxWidth: 560 }}
              >
                <button
                  type="button"
                  className="lh-sheet-close"
                  aria-label="Close"
                  onClick={() => setExit(false)}
                >
                  ×
                </button>
                <h2>Before you go: this week’s top 5</h2>
                <p>
                  What developers near you read most. One tap and it’s yours
                  daily.
                </p>
                <MiniFeed posts={realPosts.slice(0, 5)} />
                <div style={{ marginTop: '1rem' }}>
                  <ProviderButton
                    kind="google"
                    label="Get this feed with Google"
                  />
                </div>
              </div>
            </div>
          )}
        </>
      }
    />
  );
};

export const signupRoundTwo: Variation2[] = [
  {
    id: 'S1',
    title: 'Sharp',
    borrowed:
      'Medium, GitHub and LinkedIn’s doors; Smith’s recommended direction (Oct 26). Promise under 8 words, one sentence, one primary, the real product beside it.',
    hypothesis:
      'If the hero says what the product is and shows four real posts with the reason each was picked, more of the 85% who never scroll sign up, because today the headline is a brand line and the picture is mascot art.',
    change:
      'Outcome headline + one sentence. Google primary, GitHub and Email half-width. “Free forever · no credit card · 1M+ developers” and the 3-step line. A calm frame with 4 real posts, each tagged “Matches React”. Nav reduced to logo + Log in.',
    risk: 'Changes headline, nav and the art’s role at once, so it is a package test, not a factor test. Guardrail: login success and advertiser-path clicks (nav was restored for them on Oct 6).',
    render: () => <Sharp />,
  },
  {
    id: 'S2',
    title: 'The wall',
    borrowed:
      'Nikita Bier: “show them nothing more than a logo and a signup button”; Griffel’s minimal homepage (Dropbox, Quora, Pinterest era); Lazyweb’s plain-screens-win tests (Ring, AllTrails, Nextdoor, Spotify).',
    hypothesis:
      'If the first screen is one promise, one sentence and one button, more visitors act, because every other element on the page competes with the only decision that matters and 54% of visitors do nothing at all.',
    change:
      '“Read less. Know what matters.” One sentence. One button, “Get my feed, it’s free”, which opens the provider sheet. No nav, no video, no proof cards above the fold.',
    risk: 'Adds a tap before the providers (the sheet). Watch sheet-open → provider-click, and returning users who need Log in.',
    render: () => <MinimalWall />,
  },
  {
    id: 'S3',
    title: 'The window',
    borrowed:
      'X, Substack and Reddit logged out: the content is the page, the signup is a docked card beside it. Pinterest’s open browsing raised signup quality and retention.',
    hypothesis:
      'If the homepage is today’s feed with a docked “Make this feed yours” card, more high-intent visitors sign up and retain, because they see the product before any ask and the ask is next to the thing they want.',
    change:
      'Real feed cards, two columns. Docked right: stack chips plus the provider stack, the Google button counting the picks. Nav reduced to logo + Log in.',
    risk: 'Signups may fall before quality rises (Pinterest saw this). Read D7 per visitor, not signups alone. SEO upside: the feed gets indexed.',
    render: () => <WindowDocked />,
    scroll: true,
  },
  {
    id: 'S4',
    title: 'Scroll, then the sheet',
    borrowed:
      'Pinterest (browse three pages, then the wall), Threads web (scroll stops, a sheet rises), TikTok (feed plays, login sheet on interaction). Duolingo: the lesson before the account.',
    hypothesis:
      'If the feed is open and the ask arrives after about three rows, more visitors sign up with intent, because the sheet lands when they have already proven they want more.',
    change:
      'No form above the fold. After ~1100px of scrolling, a bottom sheet rises: “Keep reading, it’s free” with the provider stack. Dismissible; the feed stays readable.',
    risk: 'A wall that rises can feel like a trap. Keep it dismissible and show it once. Post-page walls have mostly lost here; this is the homepage, test last.',
    render: () => <ScrollSheet />,
    scroll: true,
  },
  {
    id: 'S5',
    title: 'Act to join',
    borrowed:
      'Pinterest added Save and Follow to logged-out pages and got +5% signups. Reddit prompts on vote and comment. The ask lands at the moment of intent.',
    hypothesis:
      'If the open feed carries real actions and the first upvote, save or read opens the signup with that action remembered, more visitors sign up, because the account now finishes something they started.',
    change:
      'Real cards with live buttons. Any action opens a centered sheet whose title names the action (“Save it for later”). The action completes after signup.',
    risk: 'Needs the action to actually complete post-signup, or the promise is broken. Instrument which action converts best.',
    render: () => <ActToJoin />,
    scroll: true,
  },
  {
    id: 'S6',
    title: 'Starter packs',
    borrowed:
      'Bluesky starter packs (a Lancaster/City/TU Darmstadt study: members gained up to 85% more followers and 60% more posts; packs carried the cold start). Pinterest and Spotify taste pickers.',
    hypothesis:
      'If the hero offers six curated packs instead of an empty account, more visitors sign up and reach 10+ follows on day 0, because a pack is a feed already built, and 10+ tags predicts installs 2.7x and retention.',
    change:
      'Six pack cards (sources, squads, topics) with real source logos. “Join with this pack” opens the sheet titled with the pack; onboarding pre-follows it. “Start from scratch” stays as a link.',
    risk: 'Six choices before the ask. Keep packs to one row of three on laptops, and watch time to first provider click.',
    render: () => <StarterPacks />,
  },
  {
    id: 'S7',
    title: 'Build your feed, live',
    borrowed:
      'Smith’s lead bet (concept A): a reversible micro-commitment with the result shown before the ask. Dupe and Death Clock: the aha in seconds. Gas and tbh: the first screen is a question.',
    hypothesis:
      'If picking a stack re-ranks a live feed beside the form and the Google button counts the picks, more visitors sign up and pick 10+ tags, because the first click is one they want to make anyway and it raises the cost of leaving.',
    change:
      '“1. What do you build with?” chips under the headline. A live frame of 4 real posts re-ranks per chip with “Matches …” reasons and a posts-this-week counter. Google reads “save my feed (n)”. Picks prefill onboarding.',
    risk: 'A choice above the form. It is not a competing destination, but read signups as non-inferior first. Power: ~2 weeks for +10% on desktop.',
    render: () => <BuildYourFeed />,
  },
  {
    id: 'S8',
    title: 'Try it first',
    borrowed:
      'Duolingo’s delayed signup (+20% DAU per their filing), Discord’s “Open in your browser”, Fab dropping its signup wall.',
    hypothesis:
      'If the primary button opens today’s feed with no account and the ask follows the first read as a sticky card, more visitors end up retained, because they commit after value instead of before it.',
    change:
      'Primary: “Start reading, no account needed” into the anonymous web app. Providers become one quiet line. Screen 2: the feed with a sticky “Keep it” bar after the first read.',
    risk: 'Signups will drop on day 0 by design. Judge on D7 retained accounts per visitor and on the sticky bar’s conversion. The boldest arm here.',
    render: () => <TryFirstHero />,
    renderSecond: () => <TryFirstFeed />,
    secondLabel: 'Screen 2 · the feed, no account',
  },
  {
    id: 'S9',
    title: 'Continue as you',
    final: true,
    borrowed:
      'Google’s personalized button and One Tap (Reddit: ~2x signups; Zapier: +7% from One Tap alone). Threads: “Continue with Instagram”, one identity, one tap.',
    hypothesis:
      'If every Chrome visitor signed into Google meets their own name and avatar in the hero, more of them press it, because a button that knows you is a confirmation, not a form.',
    change:
      'Two Google surfaces, both Google-rendered. First visit (screen 1): the standard “Continue with Google” pill plus Google’s One Tap card at the top right, which carries the visitor’s name, avatar and a “Continue as” button for anyone signed into Google in Chrome, first-timers included. Return visit (screen 2): the Google button itself renders personalized (name, address, avatar) through FedCM button mode, so it works with third-party cookies blocked. GitHub and email unchanged.',
    risk: 'Zapier saw duplicate-account tickets from “Continue as” presses by existing users; keep the member line prominent. Fix the ~37% social-auth boot failure first, or this amplifies it. The Google option becomes Google’s own button rendering (its pill, its themes, 400px max), not our white pill.',
    decision:
      'Picked as the signup final on Oct 28. What production can do: One Tap is already live on daily.dev (client id set, auto_select off, FedCM-aware), so Chrome visitors signed into Google already get the top-right “Continue as” card; the work is the hero button: render it with Google Identity Services in FedCM button mode (use_fedcm_for_button, button_auto_select) so returning Google users see their name and avatar on the button and sign in with one click, while first-timers see the standard Google button. What production cannot do: show a first-time visitor’s name on a button we draw ourselves. Google only reveals identity after consent, and the personalized button requires that this Google session has signed in to daily.dev before. No permission prompt from us is involved; the browser owns the One Tap and FedCM prompts.',
    render: () => <ContinueAsYou />,
    renderSecond: () => <ContinueAsYou returning />,
    secondLabel: 'Screen 2 · returning Google user (personalized button)',
    phoneNote: 'One Tap shows as a bottom sheet on phones.',
  },
  {
    id: 'S10',
    title: 'Smart nudges',
    borrowed:
      'Smith’s concept D: a sticky bar once the form scrolls away, and a once-only exit sheet with this week’s top 5. Reddit and Threads sticky prompts; signup_strip_column (+14%) showed visible controls win.',
    hypothesis:
      'If the 15% who scroll past the hero get a sticky signup bar, and leavers get one sheet with five real posts, more of them sign up, because the ask follows them instead of staying behind.',
    change:
      'Sticky bottom bar with Google and GitHub once the form is out of view. Exit intent (or 12s idle here) opens a sheet with this week’s top 5 and a one-tap Google button, once per visitor.',
    risk: 'Cheap and independent of every other arm. Exit sheets annoy on repeat; cap at once per 30 days, desktop only.',
    render: () => <SmartNudges />,
    scroll: true,
  },
];

/* =========================================== E · extension, round two */

const ValueCard = ({
  prominent = false,
}: {
  prominent?: boolean;
}): ReactElement => (
  <div
    className="lh-value-card"
    style={prominent ? { borderColor: 'rgba(192,132,252,0.5)' } : undefined}
  >
    <strong>Stay ahead without trying.</strong>
    <p>
      Your feed shows up on its own, every time you open your browser. No
      remembering, no searching, nothing to check.
    </p>
    <div className="lh-value-card-row">
      <Proof short />
      <AddToChrome />
    </div>
  </div>
);

const FinishLine = (): ReactElement => (
  <LandingPage
    overlay={
      <div className="lh-scrim lh-scrim-center">
        <div className="lh-finish">
          <h2>Your feed is ready.</h2>
          <p>One more step and it comes to you.</p>
          <ol className="lh-progress">
            <li className="lh-done">Account ✓</li>
            <li className="lh-done">Feed ✓</li>
            <li>Your browser</li>
          </ol>
          <ul className="lh-tiles">
            <li>
              <strong>It finds you</strong>
              Fresh posts for your stack, every time you open a tab.
            </li>
            <li>
              <strong>Zero effort</strong>
              No bookmark to remember, no site to check.
            </li>
            <li>
              <strong>Yours already</strong>
              Same feed, bookmarks and squads as your account.
            </li>
          </ul>
          <div className="lh-finish-actions">
            <a href={CHROME_STORE} className="lh-pill lh-pill-primary">
              <ChromeIcon /> Add to Chrome, it’s free
            </a>
            <button type="button" className="lh-text-btn">
              Not now
            </button>
          </div>
        </div>
      </div>
    }
  />
);

const ToggleHero = ({ after = false }: { after?: boolean }): ReactElement => (
  <LandingPage
    form={
      after ? (
        <div className="lh-form">
          <div className="lh-step-bar" aria-hidden="true">
            <span />
          </div>
          <p className="lh-muted-row" style={{ justifyContent: 'flex-start' }}>
            <strong>Account created.</strong> Step 2 of 2: let it come to you.
          </p>
          <a href={CHROME_STORE} className="lh-pill lh-pill-primary">
            <ChromeIcon /> Add to Chrome, it’s free
          </a>
          <p className="lh-muted-row">
            Your feed, every time you open a tab. Takes five seconds.
          </p>
          <button type="button" className="lh-text-btn">
            Skip, open my feed on the web
          </button>
        </div>
      ) : (
        <SignupForm
          after={
            <label className="lh-switch">
              <span className="lh-switch-track" aria-hidden="true" />
              <span>
                Also bring my feed to every new tab
                <small>
                  Your feed shows up on its own in Chrome. Set up right after
                  signup, switch off any time.
                </small>
              </span>
            </label>
          }
        />
      )
    }
  />
);

const ScrollAwayBar = (): ReactElement => {
  const anchor = useRef<HTMLDivElement>(null);
  const past = useScrolledPast(anchor, 0);
  const [closed, setClosed] = useState(false);
  return (
    <LandingPage
      afterColumn={<div ref={anchor} />}
      overlay={
        past &&
        !closed && (
          <div className="lh-sticky-bar">
            <span className="lh-sticky-copy">
              Stay ahead without trying.
              <small>
                Your feed, every time you open your browser · 4.9★ · 400K
                developers
              </small>
            </span>
            <AddToChrome />
            <button
              type="button"
              className="lh-bar-close"
              aria-label="Close"
              onClick={() => setClosed(true)}
            >
              ×
            </button>
          </div>
        )
      }
    />
  );
};

const OpenANewTab = (): ReactElement => {
  const [on, setOn] = useState(false);
  return (
    <LandingPage
      headline="Your next new tab is worth opening."
      sub={
        <>
          <p className="lh-sub">
            The dev reads that matter, ranked for your stack, waiting every time
            you open a tab.
          </p>
          <span className="lh-rating-chip">
            <StarGlyph /> 4.9 on the Chrome Web Store · Featured
          </span>
        </>
      }
      artExtra={
        <div className={classNames('lh-browser', on && 'lh-browser-on')}>
          <div className="lh-browser-tabs">
            <span className="lh-browser-tab">
              <ChromeIcon /> {on ? 'daily.dev' : 'New tab'}
            </span>
            <button
              type="button"
              className="lh-browser-plus"
              aria-label="Open a new tab"
              onClick={() => setOn(true)}
            >
              +
            </button>
          </div>
          <div className="lh-browser-url">
            {on ? 'daily.dev' : 'Search Google or type a URL'}
          </div>
          <div className="lh-browser-body">
            <div className="lh-browser-blank">
              Google
              <span />
            </div>
            <img className="lh-browser-feed" src={FEED_SHOT} alt="" />
          </div>
        </div>
      }
    />
  );
};

/* The /launch/ page's award laurels (recruiter-landing #617, Laurels.astro),
   same leaf path and type scale; the Chrome Web Store laurel links to the
   store, so the proof is also the door. */

const LEAF =
  'M12 2c-2 3-2 6 0 9 2-3 2-6 0-9Zm-5 4c-1 3 0 6 3 8 0-3-1-6-3-8Zm-3 6c0 3 2 5 5 6-1-3-3-5-5-6Zm1 6c1 2 3 3 6 3-1-2-3-3-6-3Z';

const Leaf = ({ flip = false }: { flip?: boolean }): ReactElement => (
  <svg
    className={classNames('lh-leaf', flip && 'lh-leaf-flip')}
    viewBox="0 0 12 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d={LEAF} />
  </svg>
);

const DownloadGlyph = (): ReactElement => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    style={{ width: '1.125rem', height: '1.125rem' }}
  >
    <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
  </svg>
);

const laurels = [
  { top: 'Product of the Year', bottom: 'Product Hunt' },
  { top: '4.9 ★ rating', bottom: 'Chrome Web Store', href: CHROME_STORE },
  {
    top: '20K+ stars',
    bottom: 'GitHub',
    href: 'https://github.com/dailydotdev/daily',
  },
];

const Laurels = ({
  centered = false,
}: {
  centered?: boolean;
}): ReactElement => (
  <ul
    className={classNames('lh-laurels', centered && 'lh-laurels-centered')}
    aria-label="daily.dev recognition"
  >
    {laurels.map((item) => {
      const body = (
        <>
          <Leaf />
          <span className="lh-laurel-text">
            <span className="lh-laurel-top">{item.top}</span>
            <span className="lh-laurel-bottom">{item.bottom}</span>
          </span>
          <Leaf flip />
        </>
      );
      return (
        <li key={item.top} className="lh-laurel">
          {item.href ? <a href={item.href}>{body}</a> : body}
        </li>
      );
    })}
  </ul>
);

export const extensionRoundTwo: Variation2[] = [
  {
    id: 'E1',
    title: 'The value row',
    borrowed:
      'B9 kept as it was: one compact dashed row under the providers, a tertiary button. Honey and Momentum for the copy order: the gain first, the mechanism in small type.',
    hypothesis:
      'If the stacked row says what the reader gains in one short line, installs rise without the signup loss, because the offer is now a benefit, not a feature, and it stays below the only primary.',
    change:
      '“Stay ahead without trying.” over “Your feed, every time you open your browser.” with the ghost Add to Chrome. Same row, same position as B9; shorter copy, no proof, nothing else.',
    risk: 'Still inside the column. Guardrail: hero signups on Windows desktop. Alternates for the top line: “Never fall behind.” / “Make every new tab count.” / “The news finds you.”',
    render: () => (
      <LandingPage
        form={
          <SignupForm
            after={
              <div className="lh-sub-card">
                <div>
                  <strong>Stay ahead without trying.</strong>
                  <small>Your feed, every time you open your browser.</small>
                </div>
                <AddToChrome label="Add to Chrome" />
              </div>
            }
          />
        }
      />
    ),
  },
  {
    id: 'E2',
    title: 'The header door, with proof',
    borrowed:
      'B7 kept. Loom (“Get Loom for free” + ghost “Install Chrome Extension”), Spotify web player (“Install App” in the header), Discord’s platform-aware button.',
    hypothesis:
      'If the ghost “Add to Chrome” in the header carries the store rating and is browser-aware, more visitors install without a signup loss, because the door is in the conventional place, away from the form, and it says why.',
    change:
      'Header ghost button: “Add to Chrome · 4.9★”, Chromium desktops only. Safari and Firefox see “Get the app”. Phones see nothing.',
    risk: 'Same screen as the form, the closest cousin of the arm that lost; its saving grace is weight. Watch Windows hero signups daily.',
    render: () => (
      <LandingPage
        headerExtra={
          <a
            href={CHROME_STORE}
            className="lh-btn lh-btn-ghost lh-btn-sm lh-desk-inline"
          >
            <ChromeIcon /> Add to Chrome{' '}
            <span style={{ opacity: 0.7 }}>· 4.9★</span>
          </a>
        }
      />
    ),
  },
  {
    id: 'E3',
    title: 'Loom’s second button',
    borrowed:
      'Loom’s hero: a primary “Get Loom for free” and a quieter “Install Chrome Extension” beside it. Raindrop: “Sign up” + “Download app”.',
    hypothesis:
      'If the extension is one dashed row under the providers, after an “or”, installs rise without signup loss, because it reads as an alternative route for the few who want it, not a second offer at equal weight.',
    change:
      'Under the three providers: an “or” rule, then a dashed full-width row “Get it free in your browser · 4.9★” linking to the store. Disclaimer and member line unchanged.',
    risk: 'Closest to the side-by-side loss in shape. Only run it against E1 and E2, with the smallest split.',
    render: () => (
      <LandingPage
        form={
          <SignupForm
            after={
              <>
                <p className="lh-or">or</p>
                <a href={CHROME_STORE} className="lh-ghost-row">
                  <ChromeIcon /> Get it free in your browser <Proof short />
                </a>
              </>
            }
          />
        }
      />
    ),
  },
  {
    id: 'E4',
    title: 'The finish line',
    borrowed:
      'Grammarly: no install button on the homepage; the extension is step two after the account. Smith concept C. onboarding_extension_showcase won +14% activation at the install moment. 88% of installs happen in the signup session.',
    hypothesis:
      'If the install ask comes right after the hero signup succeeds, as a card with two of three steps done, installs rise and signups hold, because the ask reaches everyone who signed up at the moment motivation is highest, and the hero itself is untouched.',
    change:
      'Hero unchanged. After a successful hero signup (Chrome/Edge desktop): “Your feed is ready” with Account ✓ Feed ✓ Your browser ◻, three benefit tiles, “Add to Chrome, it’s free” and “Not now”. The store opens in a popup and the page listens for the install.',
    risk: 'Needs the extension to ping the page when installed, and a decision on the later onboarding browserExtension step so we don’t ask twice. Primary metric: account + extension within 7 days.',
    render: () => <LandingPage />,
    renderSecond: () => <FinishLine />,
    secondLabel: 'Screen 2 · right after signup',
  },
  {
    id: 'E5',
    title: 'The ratings row',
    borrowed:
      'Rakuten’s hero footer (Trustpilot 4.6 · App Store 4.8 · Chrome Web Store 4.9, each a link), Honey’s “141,786 Chrome Store reviews”. Proof that is also a door.',
    hypothesis:
      'If the column ends on a ratings row where the Chrome Web Store chip links to the store, awareness and installs rise without a competing button, because the proof is why to trust the signup and, read closely, where else it lives.',
    change:
      'After the member line: “★ 4.9 Chrome Web Store · 2.9K ratings” (link) · 400K+ developers · Featured. Text and icons only.',
    risk: 'Quiet by design; may do nothing. Pairs with any other arm as the proof line.',
    render: () => (
      <LandingPage
        form={
          <SignupForm
            tail={
              <p className="lh-muted-row" style={{ marginTop: '0.25rem' }}>
                <a
                  href={CHROME_STORE}
                  className="lh-link"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                >
                  <Stars /> 4.9 on the Chrome Web Store
                </a>
                <span className="lh-dot" /> 2.9K ratings
                <span className="lh-dot" /> <strong>400K+</strong> developers
                <span className="lh-dot" /> Featured
              </p>
            }
          />
        }
      />
    ),
  },
  {
    id: 'E6',
    title: 'One button, then the next',
    borrowed:
      'Smith’s addendum: one decision, one control. The toggle is on by default; after success the same button becomes the install. Honey and Loom keep the page as the anchor while the store opens in a popup.',
    hypothesis:
      'If a default-on switch under the buttons says the feed will also come to every new tab, and the primary button turns into “Add to Chrome” only after the account exists, installs rise and signups hold, because the store hop can no longer cost a signup.',
    change:
      'Switch (on) under the providers: “Also bring my feed to every new tab”. Screen 2: a step bar at 1 of 2, the primary now “Add to Chrome, it’s free”, and “Skip, open my feed on the web”.',
    risk: 'Three arms: control, switch on, switch off (isolates the cost of the line). Store policy: the install must be confirmed in the store; never auto-install, always a visible skip.',
    render: () => <ToggleHero />,
    renderSecond: () => <ToggleHero after />,
    secondLabel: 'Screen 2 · after the account exists',
  },
  {
    id: 'E7',
    title: 'The scroll-away bar',
    borrowed:
      'Reddit and Threads sticky prompts; Smith’s sticky-bar nudge. A bar that appears only once the form has left the screen cannot compete with it.',
    hypothesis:
      'If the install offer appears as a slim bottom bar only after the hero form scrolls away, installs rise with no signup effect, because the 15% who scroll have already passed the signup decision.',
    change:
      'Once the form is out of view: “Stay ahead without trying. Your feed, every time you open your browser · 4.9★” with a ghost Add to Chrome and a close. Chromium desktops only.',
    risk: 'Collides with the signup sticky bar (S10) if both ship: signup bar first, extension bar on the second visit.',
    render: () => <ScrollAwayBar />,
    scroll: true,
  },
  {
    id: 'E8',
    title: 'The second visit',
    borrowed:
      'Pinterest and Reddit vary logged-out prompts for returning visitors. A visitor who came back without signing up is a different audience than a first-timer.',
    hypothesis:
      'If returning logged-out visitors get a hero that leads with “let it come to you”, installs rise among the people the signup already failed to convert, because the second visit is the moment the habit argument lands.',
    change:
      'Cookie-gated for returning logged-out visitors: eyebrow “Welcome back”, a sub-line “This time, let the feed come to you.”, and the value card (E1) above the providers instead of below.',
    risk: 'Small audience; needs the first-visit cookie. Measure on returning visitors only.',
    render: () => (
      <LandingPage
        eyebrow={<span className="lh-eyebrow">Welcome back</span>}
        sub={<p className="lh-sub">This time, let the feed come to you.</p>}
        form={<SignupForm before={<ValueCard prominent />} />}
      />
    ),
  },
  {
    id: 'E9',
    title: 'The retention claim',
    borrowed:
      'Honey and Grammarly sell the outcome (“17 million members”, “Finish work faster”). Our own number: converters retain +21pp D7 and 2.5x D30 within the most engaged stratum.',
    hypothesis:
      'If one line under the buttons states what the new tab does for the reader in our own numbers, installs rise without a competing control, because a true, specific claim beats a feature name.',
    change:
      'One line: “Developers who read on the new tab are 2.5× more likely to still be here a month later.” with a text link “Add to Chrome”. Nothing else moves.',
    risk: 'The number is controlled-within-stratum, not causal; legal and brand should sign off on the wording. Falls back to “most developers read it on the new tab”.',
    render: () => (
      <LandingPage
        form={
          <SignupForm
            after={
              <p className="lh-muted-row">
                Developers who read on the new tab are <strong>2.5×</strong>{' '}
                more likely to still be here a month later.{' '}
                <a href={CHROME_STORE} className="lh-link">
                  Add to Chrome
                </a>
              </p>
            }
          />
        }
      />
    ),
  },
  {
    id: 'E10',
    title: 'Open a new tab',
    borrowed:
      'Momentum’s hero (a blank Google tab turning into the dashboard) and Smith concept B. Primes the install without asking for it.',
    hypothesis:
      'If the hero art is a browser whose + button turns a blank tab into the feed, with the headline “Your next new tab is worth opening”, installs rise later in the funnel and signups hold, because the visitor has now seen the extension work and the signup stays the only CTA.',
    change:
      'The art gains a fake browser (Chromium desktops): click + and the blank new tab becomes the daily.dev feed. Headline and sub-line change; a 4.9 Web Store chip under them. Providers unchanged, no install button.',
    risk: 'Mostly front-end animation. The headline leads with the new tab, so it could read as extension-first to Safari and Firefox visitors; show them the plain headline.',
    render: () => <OpenANewTab />,
  },
  {
    id: 'E11',
    title: 'The laurels',
    borrowed:
      'The /launch/ page hero (recruiter-landing #617): three award laurels above the headline, Product Hunt, Chrome Web Store, GitHub, the way postiz.com shows its wins. Same component, same scale.',
    hypothesis:
      'If the hero opens on the three laurels and the Chrome Web Store one is a link, more visitors learn where the product lives and trust the signup, because the proof reads as recognition rather than a pitch, and the store is named without a second button.',
    change:
      'The Laurels row from /launch/ as the eyebrow above the headline: “Product of the Year · Product Hunt”, “4.9 ★ rating · Chrome Web Store” (links to the store), “20K+ stars · GitHub”. Nothing else in the column moves.',
    risk: 'Pushes the headline down about 40px on 760px art. Proof-only by design: pair it with E1 if a visible install path is wanted too.',
    render: () => <LandingPage eyebrow={<Laurels />} />,
  },
  {
    id: 'E12',
    title: 'The Discord pair',
    borrowed:
      'Discord’s hero: an OS-aware “Download for Mac” beside “Open Discord in your browser”. Here: the browser-aware install beside the web app, which opens on /onboarding.',
    hypothesis:
      'If the hero offers exactly two doors, the extension for this browser and “Open daily.dev in your browser”, more visitors end up with the extension and signups hold, because both doors lead to the same signup and the visitor only picks where they will read.',
    change:
      'The provider stack is replaced by two buttons: “Add to Chrome” (Edge on Edge; on Safari and Firefox the browser button becomes the primary and the install is hidden) and “Open daily.dev in your browser”, which goes to /onboarding where the providers live. Disclaimer and member line unchanged.',
    risk: 'This is the install-first shape the signup hero beat in September, and the two-door shape that lost in October. It trades hero signups for installs by design; judge it on account + extension within 7 days, not on signups, and run it last with the smallest split.',
    phoneNote:
      'Phones see only “Open daily.dev in your browser”; the store button needs a desktop.',
    render: () => (
      <LandingPage
        form={
          <SignupForm
            buttons={
              <div className="lh-pair">
                <a
                  href={CHROME_STORE}
                  className="lh-pill lh-pill-primary lh-desk-flex"
                >
                  <DownloadGlyph /> Add to Chrome
                </a>
                <a
                  href="https://daily.dev/onboarding"
                  className="lh-pill lh-pill-brand"
                >
                  Open daily.dev in your browser
                </a>
              </div>
            }
          />
        }
      />
    ),
  },
];
