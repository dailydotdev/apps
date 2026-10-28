import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';

/* The homepage hero as production renders it (recruiter-landing
   apps/main-site, origin/main 2026-10-28): header, art, headline, the
   /onboarding signup block, the new-tab demo in its glass frame, and the
   proof cards under the fold. Variations compose these parts. */

export const HEADLINE = 'Where developers discover what’s next.';

export const HERO_COVER =
  'https://media.daily.dev/image/upload/s--NCILTqRq--/f_auto,q_auto/v1785661216/public/daily.dev%20-%20main%20image';
export const VIDEO_POSTER =
  'https://daily.dev/assets/marketing/new-tab-video-poster.webp';
export const VIDEO_MP4 = 'https://daily.dev/assets/marketing/hero-newtab.mp4';
export const FEED_SHOT = 'https://daily.dev/assets/marketing/hero-feed.jpg';
const LOGO = 'https://daily.dev/assets/brand/daily-dev-logo-light.svg';

export const CHROME_STORE =
  'https://chromewebstore.google.com/detail/dailydev-the-homepage-dev/jlmpjdjjbgclbocgajdjefcidcncaied';
const SIGNUP = 'https://daily.dev/onboarding';
const LOGIN = 'https://daily.dev/onboarding?action=login';

export const quotes = [
  {
    name: 'coppnic',
    title: 'Senior Developer, former CTO · ELPATO Medien',
    image:
      'https://media.daily.dev/image/upload/s--8VyNl1cb--/f_auto/v1732889303/avatars/avatar_z5bNZJIOpNguomDjmmrE2',
    text: 'Condensed news with industry relevant comments & a friendly community accelerate my opinion forming.',
  },
  {
    name: 'Sten Roger',
    title: 'CTO · Fieldnode',
    image: 'https://avatars.githubusercontent.com/u/45278?v=4',
    text: 'Amazing way to get latest news. Before I used to go to github.com/trending to look, but now I get it into my daily routine.',
  },
  {
    name: 'SarcasmoRex',
    title: 'Senior Staff Software Engineer',
    image:
      'https://media.daily.dev/image/upload/s--38g7WNfZ--/f_auto/v1738777498/avatars/avatar_osFxhrSqOmGcuzGADoWTZ',
    text: 'daily.dev has become my daily (no pun intended) source of insight into emerging tech and the conversations around it.',
  },
  {
    name: 'Joud Awad',
    title: 'Principal Solution Architect · Metalab',
    image:
      'https://media.daily.dev/image/upload/s--dOB9RaXY--/f_auto/v1773320801/avatars/avatar_iaC4JsBU0lV8wBsc85fSh?_a=BAMAMiiu0',
    text: 'daily.dev is my first source for news about programming.',
  },
  {
    name: 'The Dev Alex',
    title: 'Technician II, Supply Chain Services',
    image:
      'https://media.daily.dev/image/upload/s--ypfz8Hse--/f_auto/v1731086373/avatars/avatar_Tr72WSVlSkNCwF4rCk6Rg',
    text: 'It becomes the first thing I continuously see as a consistent reminder to get my reading on.',
  },
];

/* ------------------------------------------------------------------ glyphs */

export const GoogleG = ({
  className = 'lh-pill-icon',
}: {
  className?: string;
}): ReactElement => (
  <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
    <path
      fill="#EA4335"
      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
    />
    <path
      fill="#4285F4"
      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
    />
    <path
      fill="#FBBC05"
      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
    />
    <path
      fill="#34A853"
      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
    />
  </svg>
);

export const GitHubMark = ({
  className = 'lh-pill-icon-sm',
}: {
  className?: string;
}): ReactElement => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);

export const MailGlyph = ({
  className = 'lh-pill-icon-sm',
}: {
  className?: string;
}): ReactElement => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    aria-hidden="true"
  >
    <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
    <path d="M3 7l9 6 9-6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const StarGlyph = (): ReactElement => (
  <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
  </svg>
);

export const CheckGlyph = (): ReactElement => (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M4 10.5l4 4 8-9" />
  </svg>
);

export const ArrowGlyph = (): ReactElement => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    style={{ width: '0.875rem', height: '0.875rem' }}
  >
    <path d="M3 8h10M9 4l4 4-4 4" />
  </svg>
);

/* --------------------------------------------------------------- signup */

const providers = {
  google: { label: 'Continue with Google', icon: <GoogleG /> },
  github: { label: 'Continue with GitHub', icon: <GitHubMark /> },
  email: { label: 'Continue with email', icon: <MailGlyph /> },
} as const;

export type Provider = keyof typeof providers;

export const ProviderButton = ({
  kind,
  label,
  primary = kind === 'google',
  className,
}: {
  kind: Provider;
  label?: string;
  primary?: boolean;
  className?: string;
}): ReactElement => (
  <a
    href={SIGNUP}
    className={classNames(
      'lh-pill',
      primary ? 'lh-pill-primary' : 'lh-pill-secondary',
      className,
    )}
  >
    {providers[kind].icon}
    {label ?? providers[kind].label}
  </a>
);

export const Disclaimer = (): ReactElement => (
  <p className="lh-disclaimer">
    By continuing, you agree to the{' '}
    <a href="https://daily.dev/tos">Terms of Service</a> and{' '}
    <a href="https://daily.dev/privacy">Privacy Policy</a>.
  </p>
);

export const MemberLine = (): ReactElement => (
  <p className="lh-member">
    Already have an account? <a href={LOGIN}>Log in</a>
  </p>
);

/**
 * The production stack: Google, GitHub, email, the disclaimer, the member
 * line. `before` sits above the buttons, `after` between the buttons and the
 * disclaimer, `tail` after the member line.
 */
export const SignupForm = ({
  primaryLabel,
  before,
  after,
  tail,
  buttons,
}: {
  primaryLabel?: string;
  before?: ReactNode;
  after?: ReactNode;
  tail?: ReactNode;
  buttons?: ReactNode;
}): ReactElement => (
  <div aria-label="Login/Register options" className="lh-form">
    {before}
    {buttons ?? (
      <ul aria-label="Social login buttons" className="lh-providers">
        <li>
          <ProviderButton kind="google" label={primaryLabel} />
        </li>
        <li>
          <ProviderButton kind="github" />
        </li>
        <li>
          <ProviderButton kind="email" />
        </li>
      </ul>
    )}
    {after}
    <Disclaimer />
    <MemberLine />
    {tail}
  </div>
);

/* --------------------------------------------------------------- chrome */

export const Header = ({ extra }: { extra?: ReactNode }): ReactElement => (
  <header className="lh-header">
    <nav className="lh-container" aria-label="Main navigation">
      <div className="lh-header-bar">
        <div className="lh-header-side">
          <a href="https://daily.dev" aria-label="daily.dev home">
            <img
              className="lh-logo"
              src={LOGO}
              alt=""
              width={100}
              height={20}
            />
          </a>
          <div className="lh-nav">
            <button type="button" className="lh-nav-trigger">
              Advertise
            </button>
            <button type="button" className="lh-nav-trigger">
              Resources
            </button>
          </div>
        </div>
        <div className="lh-header-side">
          {extra}
          <a href={LOGIN} className="lh-login">
            Log in
          </a>
          <a href={SIGNUP} className="lh-btn">
            Sign up <ArrowGlyph />
          </a>
        </div>
      </div>
    </nav>
  </header>
);

export const VideoFrame = ({
  pill,
  caption,
  play = false,
}: {
  pill?: ReactNode;
  caption?: ReactNode;
  play?: boolean;
}): ReactElement => (
  <div className="lh-container lh-platforms">
    <div className="lh-frame">
      <div className="lh-glow" aria-hidden="true" />
      <div className="lh-glass">
        <div className="lh-glass-inner">
          {pill}
          {play ? (
            <video
              className="lh-video"
              src={VIDEO_MP4}
              poster={VIDEO_POSTER}
              muted
              loop
              autoPlay
              playsInline
            />
          ) : (
            <img
              className="lh-video"
              src={VIDEO_POSTER}
              alt="A blank new tab turning into the daily.dev feed"
            />
          )}
        </div>
      </div>
    </div>
    {caption}
  </div>
);

const GitHubProofMark = (): ReactElement => (
  <GitHubMark className="lh-proof-mark" />
);

export const ProofCards = (): ReactElement => (
  <section className="lh-container lh-proof">
    <p className="lh-proof-title">Millions of developers use it every day</p>
    <div className="lh-proof-grid">
      <div className="lh-proof-card">
        <div className="lh-stars" aria-hidden="true">
          {Array.from({ length: 5 }).map((_, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <span key={i} style={{ width: '1.5rem', height: '1.5rem' }}>
              <StarGlyph />
            </span>
          ))}
        </div>
        <p className="lh-proof-value">4.9 on Chrome</p>
        <p className="lh-proof-sub">3,000+ verified reviews</p>
      </div>
      <div className="lh-proof-card">
        <span style={{ width: '2rem', height: '2rem', color: '#fff' }}>
          <GitHubProofMark />
        </span>
        <p className="lh-proof-value">20K+ stars</p>
        <p className="lh-proof-sub">dailydotdev/daily on GitHub</p>
      </div>
      <div className="lh-proof-card">
        <span
          style={{
            display: 'inline-flex',
            width: '2rem',
            height: '2rem',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 999,
            background: '#ff6154',
            color: '#fff',
            fontWeight: 700,
          }}
        >
          P
        </span>
        <p className="lh-proof-value">Product of the Year</p>
        <p className="lh-proof-sub">Product Hunt · Community &amp; Social</p>
      </div>
      <div className="lh-proof-card">
        <div className="lh-avatars">
          {quotes.slice(0, 3).map((quote) => (
            <img
              key={quote.name}
              className="lh-avatar"
              src={quote.image}
              alt=""
            />
          ))}
        </div>
        <p className="lh-proof-value" style={{ fontSize: '0.875rem' }}>
          {quotes[0].name}
        </p>
        <p className="lh-proof-quote">{quotes[0].text}</p>
      </div>
    </div>
  </section>
);

/* ----------------------------------------------------------------- page */

export type LandingProps = {
  headline?: ReactNode;
  /** Above the headline. */
  eyebrow?: ReactNode;
  /** Under the headline, before the form. */
  sub?: ReactNode;
  form?: ReactNode;
  /** Under the form, inside the column. */
  afterColumn?: ReactNode;
  /** Right of the column on laptops, under it on phones. */
  aside?: ReactNode;
  /** Laid over the art, outside the column (laptops only). */
  artExtra?: ReactNode;
  backdrop?: 'illustration' | 'feed';
  headerExtra?: ReactNode;
  framePill?: ReactNode;
  frameCaption?: ReactNode;
  playVideo?: boolean;
};

const FeedBackdrop = (): ReactElement => (
  <div className="lh-feed-backdrop" aria-hidden="true">
    <div className="lh-feed-backdrop-orb" />
    <img src={FEED_SHOT} alt="" />
    <div className="lh-feed-backdrop-wash" />
  </div>
);

export const LandingPage = ({
  headline = HEADLINE,
  eyebrow,
  sub,
  form = <SignupForm />,
  afterColumn,
  aside,
  artExtra,
  backdrop = 'illustration',
  headerExtra,
  framePill,
  frameCaption,
  playVideo = false,
}: LandingProps): ReactElement => (
  <div className="lh-root">
    <Header extra={headerExtra} />
    <section className="lh-hero">
      <div className="lh-desk">
        <div className="lh-art-wrap">
          {backdrop === 'feed' ? (
            <>
              <div className="lh-feed-stage" />
              <FeedBackdrop />
            </>
          ) : (
            <>
              <img
                className="lh-art"
                src={HERO_COVER}
                alt="daily.dev: a developer and Dee exploring a world of developer content."
                width={2988}
                height={854}
              />
              <div className="lh-dome" aria-hidden="true" />
            </>
          )}
          {artExtra}
          <div className="lh-stage">
            <div className="lh-container lh-stage-inner">
              <div className="lh-lane">
                <div className="lh-column">
                  {eyebrow}
                  <h1 className="lh-h1">{headline}</h1>
                  {sub}
                  {form}
                  {afterColumn}
                </div>
                {aside && <div className="lh-aside">{aside}</div>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="lh-mob lh-centered">
        <div className="lh-art-wrap">
          <img
            className="lh-art-m"
            src={backdrop === 'feed' ? FEED_SHOT : HERO_COVER}
            alt=""
          />
          <div className="lh-art-m-fade" />
        </div>
        <div className="lh-container lh-mob-copy">
          {eyebrow}
          <h1 className="lh-h1-m">{headline}</h1>
          {sub}
          {form}
          {afterColumn}
          {aside && <div className="lh-quote-m">{aside}</div>}
        </div>
      </div>

      <VideoFrame pill={framePill} caption={frameCaption} play={playVideo} />
    </section>
    <ProofCards />
  </div>
);
