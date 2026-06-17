import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

/**
 * Side-by-side documentation of the "purple re-tone" palette change.
 *
 * The token structure, names, shade levels and every opacity percentage are
 * unchanged — only the underlying hues of the raw ramps were shifted. The
 * swatch comparisons below are rendered with inline styles (theme-independent)
 * so the OLD and NEW palettes are always visible together; the "Components &
 * surfaces" story renders live Tailwind tokens and follows the Storybook theme
 * toolbar so you can eyeball dark and light.
 */

type Ramp = Record<string, string>;
type Palette = Record<string, Ramp>;

// Snapshot of the previous raw ramps (the 13 chromatic/neutral families that changed).
const OLD: Palette = {
  burger: { 10:'#C98464',20:'#C07A5B',30:'#B67052',40:'#AD6648',50:'#A0583C',60:'#914B31',70:'#864129',80:'#7C3822',90:'#722F1B' },
  blueCheese: { 10:'#6FF1F6',20:'#5CECF1',30:'#45E5ED',40:'#2CDCE6',50:'#0DCFDC',60:'#08C0CE',70:'#05B5C5',80:'#02AABD',90:'#009FB3' },
  avocado: { 10:'#74F3BC',20:'#65F1AE',30:'#51EBA0',40:'#39E58C',50:'#1DDC6F',60:'#15CE5C',70:'#0FC54F',80:'#0ABD42',90:'#04B435' },
  lettuce: { 10:'#DBFE6C',20:'#CCFB5B',30:'#BDF849',40:'#ACF535',50:'#92F21D',60:'#7DE914',70:'#6FE20F',80:'#62DB09',90:'#58D404' },
  cheese: { 10:'#FFF76F',20:'#FFF35A',30:'#FFEF40',40:'#FFE923',50:'#FFDF00',60:'#FCD400',70:'#F9CC00',80:'#F6C400',90:'#F3BC00' },
  bun: { 10:'#FFB760',20:'#FFAA55',30:'#FF9D48',40:'#FF8E3B',50:'#FF7A2B',60:'#FA6620',70:'#F55919',80:'#F04C11',90:'#EB3F0A' },
  ketchup: { 10:'#F3796C',20:'#ED685C',30:'#E7574B',40:'#E04337',50:'#D52B20',60:'#C72017',70:'#BD1911',80:'#B3110B',90:'#A90A05' },
  bacon: { 10:'#FE7AB6',20:'#FD6EA9',30:'#FD619D',40:'#FC538D',50:'#FC4079',60:'#F33163',70:'#EA2654',80:'#E21C48',90:'#D9113A' },
  cabbage: { 10:'#E669FB',20:'#E05CF8',30:'#D74CF6',40:'#CE3DF3',50:'#C029F0',60:'#AC1DE4',70:'#9E15D9',80:'#900DCF',90:'#8505C4' },
  onion: { 10:'#9D70F8',20:'#8D62F4',30:'#8055F0',40:'#7147ED',50:'#5F37E9',60:'#4E2CD7',70:'#4325C8',80:'#3B1EBA',90:'#3319AD' },
  water: { 10:'#68A6FC',20:'#5C9BFA',30:'#508CF9',40:'#427EF7',50:'#3169F5',60:'#2556ED',70:'#1D49E6',80:'#153CE0',90:'#0D31D9' },
  salt: { 0:'#FFFFFF',10:'#F5F8FC',20:'#EDF0F7',30:'#E4E9F2',40:'#DBE1ED',50:'#CFD6E6',60:'#C2CADE',70:'#B9C2D9',80:'#B0BBD4',90:'#A8B3CF' },
  pepper: { 10:'#525866',20:'#494E5B',30:'#404551',40:'#383C47',50:'#2D313A',60:'#22262D',70:'#1C1F26',80:'#17191F',90:'#0E1217' },
};

// The new re-toned ramps now shipping in the palette.
const NEW: Palette = {
  burger: { 10:'#E1CCBF',20:'#D1B7A6',30:'#BE9F8B',40:'#A6856F',50:'#916F58',60:'#7D5D48',70:'#6B4E3B',80:'#594130',90:'#473325' },
  blueCheese: { 10:'#B7F5FD',20:'#94E5F0',30:'#6CD1DF',40:'#3EBAC9',50:'#00A6B6',60:'#0092A1',70:'#00818E',80:'#00717D',90:'#00616B' },
  avocado: { 10:'#B7F7C7',20:'#96E8AC',30:'#70D68F',40:'#47BF72',50:'#19AB5A',60:'#00974C',70:'#008542',80:'#007539',90:'#0C6332' },
  lettuce: { 10:'#D5FEB5',20:'#BDF092',30:'#A2DF6C',40:'#88CB44',50:'#72B818',60:'#65A700',70:'#5B9701',80:'#548813',90:'#4C771E' },
  cheese: { 10:'#FFF8B6',20:'#F4E985',30:'#E6D858',40:'#D4C31B',50:'#C1B100',60:'#B1A300',70:'#A39500',80:'#968900',90:'#877C11' },
  bun: { 10:'#FFE1CC',20:'#FFC89E',30:'#FFA761',40:'#EA8B36',50:'#D67400',60:'#BC6500',70:'#A65800',80:'#924D00',90:'#7D4100' },
  ketchup: { 10:'#FEA196',20:'#F9857A',30:'#EF655B',40:'#DD423B',50:'#CA1C20',60:'#B20010',70:'#99000C',80:'#820008',90:'#6B0005' },
  bacon: { 10:'#FFB5CD',20:'#FF98BC',30:'#F976A8',40:'#E85692',50:'#D5397F',60:'#C0296F',70:'#AA2161',80:'#941F55',90:'#7C1D47' },
  cabbage: { 10:'#BC94F2',20:'#B17BF2',30:'#A35DED',40:'#913BE0',50:'#8112D2',60:'#6F00B8',70:'#5E009D',80:'#500086',90:'#40006D' },
  onion: { 10:'#A0ABF3',20:'#8B97F2',30:'#767FEB',40:'#6065DC',50:'#4E4FCD',60:'#413FB6',70:'#36329E',80:'#2C2986',90:'#221F6B' },
  water: { 10:'#92CAFF',20:'#6CB7FD',30:'#40A1F4',40:'#0087E0',50:'#0072BE',60:'#0061A2',70:'#00518A',80:'#004374',90:'#00355D' },
  salt: { 0:'#FFFFFF',10:'#F6F6FB',20:'#EEEEF3',30:'#E5E6EB',40:'#DCDCE1',50:'#D0D0D5',60:'#C3C3C9',70:'#B7B7BC',80:'#AAAAAF',90:'#9E9EA3' },
  pepper: { 10:'#62626B',20:'#56565E',30:'#494951',40:'#3C3C44',50:'#2E2E36',60:'#222229',70:'#19191F',80:'#131319',90:'#0E0E14' },
};

const FAMILIES = Object.keys(NEW);
const LEVELS = ['10','20','30','40','50','60','70','80','90'];
const WHITE = '#FFFFFF';

// ---------- color math ----------
const toRgb = (h: string): [number, number, number] => {
  const n = h.replace('#', '');
  return [parseInt(n.slice(0, 2), 16), parseInt(n.slice(2, 4), 16), parseInt(n.slice(4, 6), 16)];
};
const toHex = (r: number, g: number, b: number): string =>
  '#' + [r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0').toUpperCase()).join('');
const hue = (h: string): number => {
  let [r, g, b] = toRgb(h);
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  if (d === 0) return 0;
  let hh = 0;
  if (max === r) hh = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) hh = (b - r) / d + 2;
  else hh = (r - g) / d + 4;
  return Math.round(hh * 60);
};
// fg painted at `alpha` opacity over bg — mirrors color-mix(... transparent N%).
const over = (fg: string, bg: string, alpha: number): string => {
  const [r1, g1, b1] = toRgb(fg), [r2, g2, b2] = toRgb(bg);
  return toHex(r1 * alpha + r2 * (1 - alpha), g1 * alpha + g2 * (1 - alpha), b1 * alpha + b2 * (1 - alpha));
};

// ---------- semantic token resolver (mirrors base.css light/dark mixins) ----------
type Mode = 'dark' | 'light';
interface Token { group: string; label: string; resolve: (p: Palette, m: Mode) => string }

// accent shade per mode: [subtlest, subtler, subtle, default, bolder]
const accent = (p: Palette, fam: string, m: Mode, role: 'subtlest'|'subtler'|'subtle'|'default'|'bolder'): string => {
  const dark = { subtlest:'10', subtler:'20', subtle:'30', default:'40', bolder:'50' };
  const light = { subtlest:'90', subtler:'80', subtle:'70', default:'60', bolder:'50' };
  return p[fam][(m === 'dark' ? dark : light)[role]];
};
const bgDefault = (p: Palette, m: Mode) => (m === 'dark' ? p.pepper['90'] : WHITE);
const surfaceSecondary = (p: Palette, m: Mode) => (m === 'dark' ? p.salt['90'] : p.pepper['10']);

const TOKENS: Token[] = [
  { group:'Brand', label:'brand-default', resolve:(p,m)=>accent(p,'cabbage',m,'default') },
  { group:'Brand', label:'brand-bolder', resolve:(p,m)=>accent(p,'cabbage',m,'bolder') },
  { group:'Brand', label:'brand-float (8%)', resolve:(p,m)=>over(accent(p,'cabbage',m,'bolder'), bgDefault(p,m), 0.08) },
  { group:'Brand', label:'brand-hover (12%)', resolve:(p,m)=>over(accent(p,'cabbage',m,'bolder'), bgDefault(p,m), 0.12) },

  { group:'Backgrounds', label:'background-default', resolve:(p,m)=>bgDefault(p,m) },
  { group:'Backgrounds', label:'background-subtle', resolve:(p,m)=>(m==='dark'?p.pepper['70']:p.salt['10']) },
  { group:'Backgrounds', label:'background-popover', resolve:(p,m)=>(m==='dark'?p.pepper['70']:WHITE) },

  { group:'Surfaces', label:'surface-primary', resolve:(p,m)=>(m==='dark'?WHITE:p.pepper['90']) },
  { group:'Surfaces', label:'surface-secondary', resolve:(p,m)=>surfaceSecondary(p,m) },
  { group:'Surfaces', label:'surface-invert', resolve:(p,m)=>(m==='dark'?p.pepper['90']:WHITE) },
  { group:'Surfaces', label:'surface-float (8%)', resolve:(p,m)=>over(surfaceSecondary(p,m), bgDefault(p,m), 0.08) },
  { group:'Surfaces', label:'surface-hover (12%)', resolve:(p,m)=>over(surfaceSecondary(p,m), bgDefault(p,m), 0.12) },
  { group:'Surfaces', label:'surface-active (16%)', resolve:(p,m)=>over(surfaceSecondary(p,m), bgDefault(p,m), 0.16) },

  { group:'Text', label:'text-primary', resolve:(p,m)=>(m==='dark'?WHITE:p.pepper['90']) },
  { group:'Text', label:'text-secondary', resolve:(p,m)=>(m==='dark'?p.salt['50']:p.pepper['50']) },
  { group:'Text', label:'text-tertiary', resolve:(p,m)=>(m==='dark'?p.salt['90']:p.pepper['10']) },
  { group:'Text', label:'text-link', resolve:(p,m)=>accent(p,'water',m,'subtler') },

  { group:'Borders', label:'border-subtlest-primary', resolve:(p,m)=>(m==='dark'?p.salt['90']:p.pepper['10']) },
  { group:'Borders', label:'border-bolder-primary', resolve:(p,m)=>(m==='dark'?p.pepper['10']:p.salt['90']) },

  { group:'Status', label:'status-error', resolve:(p,m)=>accent(p,'ketchup',m,'default') },
  { group:'Status', label:'status-warning', resolve:(p,m)=>accent(p,'bun',m,'default') },
  { group:'Status', label:'status-help', resolve:(p,m)=>accent(p,'cheese',m,'default') },
  { group:'Status', label:'status-success', resolve:(p,m)=>accent(p,'avocado',m,'default') },
  { group:'Status', label:'status-info', resolve:(p,m)=>accent(p,'water',m,'default') },

  { group:'Actions', label:'upvote (avocado)', resolve:(p,m)=>accent(p,'avocado',m,'default') },
  { group:'Actions', label:'downvote (ketchup)', resolve:(p,m)=>accent(p,'ketchup',m,'default') },
  { group:'Actions', label:'comment (blueCheese)', resolve:(p,m)=>accent(p,'blueCheese',m,'default') },
  { group:'Actions', label:'bookmark (bun)', resolve:(p,m)=>accent(p,'bun',m,'default') },
  { group:'Actions', label:'share (cabbage)', resolve:(p,m)=>accent(p,'cabbage',m,'default') },
  { group:'Actions', label:'plus (bacon)', resolve:(p,m)=>accent(p,'bacon',m,'default') },
  { group:'Actions', label:'cores (cheese)', resolve:(p,m)=>accent(p,'cheese',m,'default') },

  // overlay base = onion-subtlest painted over the mode background at fixed opacities.
  { group:'Overlay base', label:'primary (64%)', resolve:(p,m)=>over(accent(p,'onion',m,'subtlest'), bgDefault(p,m), 0.64) },
  { group:'Overlay base', label:'secondary (40%)', resolve:(p,m)=>over(accent(p,'onion',m,'subtlest'), bgDefault(p,m), 0.40) },
  { group:'Overlay base', label:'tertiary (32%)', resolve:(p,m)=>over(accent(p,'onion',m,'subtlest'), bgDefault(p,m), 0.32) },
  { group:'Overlay base', label:'quaternary (24%)', resolve:(p,m)=>over(accent(p,'onion',m,'subtlest'), bgDefault(p,m), 0.24) },
];

// ---------- presentational helpers (inline-styled, theme-independent) ----------
const mono: React.CSSProperties = { fontFamily: 'monospace', fontSize: 11 };
const card: React.CSSProperties = { background: '#131318', color: '#FFFFFF', padding: 24, borderRadius: 12 };

const Swatch = ({ hex, w = 64, h = 40 }: { hex: string; w?: number; h?: number }) => (
  <div style={{ width: w, height: h, background: hex, borderRadius: 6, border: '1px solid rgba(255,255,255,0.12)' }} />
);

const Pair = ({ old, neu, label }: { old: string; neu: string; label?: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start' }}>
    {label && <div style={{ ...mono, opacity: 0.7 }}>{label}</div>}
    <div style={{ display: 'flex', gap: 4 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <Swatch hex={old} />
        <span style={{ ...mono, opacity: 0.55 }}>{old}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <Swatch hex={neu} />
        <span style={{ ...mono }}>{neu}</span>
      </div>
    </div>
  </div>
);

const meta: Meta = {
  title: 'Tokens/Palette Re-tone (Purple)',
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj;

// ===================== Story 0: guidelines =====================
const GUIDE: { token: string; value: string; note: string }[] = [
  { token: 'brand / share', value: NEW.cabbage['50'], note: 'docs purple #892BDC (Tailwind purple-600)' },
  { token: 'background-default (dark)', value: NEW.pepper['90'], note: 'near-black base — the sidebar/page surface' },
  { token: 'background-subtle (dark)', value: NEW.pepper['70'], note: 'sidebar + feed cards (#17171C, one step up from the page)' },
  { token: 'background-default (light)', value: WHITE, note: 'pure white; subtle surface is faint lavender salt.10' },
  { token: 'text-primary (dark)', value: WHITE, note: 'white on near-black' },
  { token: 'border-subtlest (dark)', value: NEW.salt['90'], note: 'low-contrast dividers' },
  { token: 'status-error / success / warning', value: NEW.ketchup['40'], note: 'kept functional (red / green / orange)' },
];

export const Guidelines: Story = {
  name: 'Guidelines',
  render: () => (
    <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Palette guideline — docs.daily.dev aligned</h1>
      <ul style={{ opacity: 0.8, maxWidth: 780, lineHeight: 1.6, paddingLeft: 18, margin: 0 }}>
        <li><b>Purple is the brand, not the surface.</b> The accent (cabbage) is the docs purple #892BDC; backgrounds stay neutral so the purple pops.</li>
        <li><b>Near-black dark mode.</b> Surfaces step #0F0F12 → #17171C → #1F1F25 for clear separation between sidebar, content and cards.</li>
        <li><b>Lavender-tinted light mode.</b> White base with a faint purple cast on subtle surfaces.</li>
        <li><b>Status stays functional.</b> Error/success/warning remain red/green/orange.</li>
        <li><b>Structure untouched.</b> Same token names, shade levels and opacity percentages — only hues moved.</li>
      </ul>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
        {GUIDE.map((g) => (
          <div key={g.token} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Swatch hex={g.value} w={48} h={28} />
            <span style={{ ...mono }}>{g.value}</span>
            <span style={{ fontWeight: 700, minWidth: 220 }}>{g.token}</span>
            <span style={{ opacity: 0.6 }}>{g.note}</span>
          </div>
        ))}
      </div>
    </div>
  ),
};

// ===================== Story 1: raw ramps =====================
export const RawRamps: Story = {
  name: 'Raw ramps · old vs new',
  render: () => (
    <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: 4 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Raw color ramps — old (top) vs new (bottom)</h1>
      <p style={{ opacity: 0.7, maxWidth: 760 }}>
        Every family keeps its name and all nine shade levels. Ramps are built in OKLCH for even
        perceptual steps: lightness eases from a per-hue light end to a dark end, chroma peaks mid-ramp,
        and out-of-gamut colors are chroma-fit. The brand (cabbage) is a saturated violet; dark neutrals
        (pepper) are near-black with a whisper of violet chroma; light neutrals (salt) a faint lavender.
        Status colors are each their own hue, kept distinguishable. Social colors and opacity percentages
        are unchanged.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 12 }}>
        {FAMILIES.map((fam) => (
          <div key={fam}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span style={{ fontWeight: 700, width: 96 }}>{fam}</span>
              <span style={{ ...mono, opacity: 0.6 }}>
                hue {hue(OLD[fam]['50'] || OLD[fam]['90'])}° → {hue(NEW[fam]['50'] || NEW[fam]['90'])}°
              </span>
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
              {LEVELS.map((lvl) => (
                <div key={lvl} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <Swatch hex={OLD[fam][lvl]} w={56} h={22} />
                  <Swatch hex={NEW[fam][lvl]} w={56} h={22} />
                  <span style={{ ...mono, opacity: 0.5 }}>{lvl}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
};

// ===================== Story 2: semantic tokens =====================
const ModeColumn = ({ mode }: { mode: Mode }) => {
  const groups = Array.from(new Set(TOKENS.map((t) => t.group)));
  return (
    <div style={{ flex: 1, minWidth: 360 }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, textTransform: 'capitalize', margin: '0 0 8px' }}>{mode} theme</h3>
      {groups.map((g) => (
        <div key={g} style={{ marginBottom: 16 }}>
          <div style={{ ...mono, opacity: 0.6, marginBottom: 6 }}>{g}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
            {TOKENS.filter((t) => t.group === g).map((t) => (
              <Pair key={t.label} label={t.label} old={t.resolve(OLD, mode)} neu={t.resolve(NEW, mode)} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export const SemanticTokens: Story = {
  name: 'Semantic tokens · old vs new',
  render: () => (
    <div style={{ ...card }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 4px' }}>Semantic tokens — old vs new (resolved)</h1>
      <p style={{ opacity: 0.7, maxWidth: 820 }}>
        Each pair shows the previous hex (left, dimmed) and the new hex (right). Values are resolved exactly
        as <code style={mono}>base.css</code> maps them per mode; alpha tokens (float/hover/overlay) are
        composited over the mode background at their unchanged opacity percentages.
      </p>
      <div style={{ display: 'flex', gap: 32, marginTop: 16, flexWrap: 'wrap' }}>
        <ModeColumn mode="dark" />
        <ModeColumn mode="light" />
      </div>
    </div>
  ),
};

// ===================== Story 3: live components & surfaces =====================
// Uses real Tailwind semantic classes — follows the Storybook theme toolbar (dark/light).
const Btn = ({ className, children }: { className: string; children: React.ReactNode }) => (
  <button type="button" className={`px-4 py-1.5 rounded-12 typo-callout font-bold ${className}`}>{children}</button>
);

const Surface = ({ title, className }: { title: string; className: string }) => (
  <div className={`flex flex-col gap-4 p-5 rounded-16 border border-border-subtlest-tertiary ${className}`}>
    <span className="typo-footnote text-text-tertiary">{title}</span>

    <div className="flex flex-wrap gap-2">
      <Btn className="bg-brand-default text-white">Primary</Btn>
      <Btn className="bg-surface-float text-text-primary">Float</Btn>
      <Btn className="border border-border-subtlest-primary text-text-primary">Secondary</Btn>
      <Btn className="bg-accent-cabbage-default text-white">Share</Btn>
    </div>

    <div className="flex flex-wrap items-center gap-4 typo-callout">
      <span className="text-accent-avocado-default">▲ Upvote</span>
      <span className="text-accent-ketchup-default">▼ Downvote</span>
      <span className="text-accent-blueCheese-default">💬 Comment</span>
      <span className="text-accent-bun-default">🔖 Bookmark</span>
      <span className="text-accent-bacon-default">★ Plus</span>
    </div>

    <div className="flex flex-wrap gap-2">
      <span className="px-2 py-0.5 rounded-8 typo-caption1 bg-accent-cabbage-flat text-accent-cabbage-default">brand tag</span>
      <span className="px-2 py-0.5 rounded-8 typo-caption1 bg-accent-onion-flat text-accent-onion-default">onion tag</span>
      <span className="px-2 py-0.5 rounded-8 typo-caption1 bg-accent-water-flat text-accent-water-default">water tag</span>
      <span className="px-2 py-0.5 rounded-8 typo-caption1 bg-accent-bacon-flat text-accent-bacon-default">bacon tag</span>
    </div>

    <div className="flex flex-wrap gap-2 typo-caption1">
      <span className="px-2 py-0.5 rounded-8 bg-status-success text-white">success</span>
      <span className="px-2 py-0.5 rounded-8 bg-status-error text-white">error</span>
      <span className="px-2 py-0.5 rounded-8 bg-status-warning text-black">warning</span>
      <span className="px-2 py-0.5 rounded-8 bg-status-help text-black">help</span>
      <span className="px-2 py-0.5 rounded-8 bg-status-info text-white">info</span>
    </div>

    <div className="flex flex-col gap-1">
      <span className="typo-body text-text-primary">Primary text on this surface</span>
      <span className="typo-callout text-text-secondary">Secondary text — supporting copy</span>
      <span className="typo-footnote text-text-tertiary">Tertiary / metadata</span>
      <span className="typo-callout text-text-link underline">An inline link</span>
    </div>

    <input
      className="px-3 py-2 rounded-10 bg-surface-float border border-border-subtlest-primary text-text-primary"
      placeholder="Input field"
      readOnly
    />
  </div>
);

export const ComponentsAndSurfaces: Story = {
  name: 'Components & surfaces · live',
  render: () => (
    <div className="flex flex-col gap-6 p-6 bg-background-default min-h-screen">
      <div>
        <h1 className="typo-title2 font-bold text-text-primary">Components on real surfaces</h1>
        <p className="typo-callout text-text-tertiary max-w-2xl">
          Rendered with live semantic tokens — use the Storybook theme toolbar to switch dark / light.
          Each panel is a different product background so you can verify contrast and that nothing breaks.
        </p>
      </div>
      <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        <Surface title="background-default" className="bg-background-default" />
        <Surface title="background-subtle" className="bg-background-subtle" />
        <Surface title="background-popover" className="bg-background-popover" />
        <Surface title="surface-float" className="bg-surface-float" />
      </div>

      <div
        className="relative overflow-hidden rounded-16 p-8 text-white"
        style={{ background: 'radial-gradient(circle at 50% 100%, var(--theme-accent-cabbage-default) 0%, color-mix(in srgb, var(--theme-accent-onion-default), transparent 28%) 10%, color-mix(in srgb, var(--theme-accent-onion-default), transparent 100%) 100%), var(--theme-background-default)' }}
      >
        <span className="typo-title3 font-bold">Brand gradient (cabbage → onion)</span>
        <p className="typo-callout opacity-80">The Plus / funnel gradient now reads as a true violet → indigo blend.</p>
      </div>
    </div>
  ),
};
