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
  burger: { 10:'#C68B67',20:'#BD815E',30:'#B47755',40:'#AA6D4B',50:'#9E5F3F',60:'#8F5233',70:'#84482B',80:'#7A3F24',90:'#70361D' },
  blueCheese: { 10:'#71E6F4',20:'#5EE0EF',30:'#48D8EA',40:'#2FCDE3',50:'#10BFD9',60:'#0BB1CB',70:'#08A6C2',80:'#059CBA',90:'#0391B0' },
  avocado: { 10:'#76F1C8',20:'#67EFBB',30:'#53E9AF',40:'#3CE29D',50:'#20D982',60:'#18CB6F',70:'#12C261',80:'#0DBA54',90:'#07B147' },
  lettuce: { 10:'#D0FC6E',20:'#C1F95D',30:'#B1F54C',40:'#9FF238',50:'#84EF20',60:'#6FE617',70:'#62DF12',80:'#55D80C',90:'#4BD107' },
  cheese: { 10:'#FFF76F',20:'#FFF35A',30:'#FFEF40',40:'#FFE923',50:'#FFDF00',60:'#FCD400',70:'#F9CC00',80:'#F6C400',90:'#F3BC00' },
  bun: { 10:'#FFB260',20:'#FFA455',30:'#FF9748',40:'#FF873B',50:'#FF732B',60:'#FA5F20',70:'#F55219',80:'#F04511',90:'#EB370A' },
  ketchup: { 10:'#F1746E',20:'#EB635E',30:'#E5514D',40:'#DD3D3A',50:'#D22523',60:'#C41A1A',70:'#BA1414',80:'#B00E10',90:'#A7070B' },
  bacon: { 10:'#FC7CD0',20:'#FB70C5',30:'#FB63BC',40:'#F956AF',50:'#F9439F',60:'#F0348A',70:'#E7297C',80:'#DF1F70',90:'#D61463' },
  cabbage: { 10:'#C16AFA',20:'#B95EF6',30:'#AC4EF4',40:'#A03FF1',50:'#8E2BEE',60:'#7A1FE2',70:'#6D17D7',80:'#600FCD',90:'#5607C2' },
  onion: { 10:'#9670F8',20:'#8662F4',30:'#7855F0',40:'#6947ED',50:'#5637E9',60:'#452CD7',70:'#3B25C8',80:'#331EBA',90:'#2C19AD' },
  water: { 10:'#6B85F9',20:'#5F78F7',30:'#5367F6',40:'#4657F3',50:'#353FF1',60:'#292BE9',70:'#2421E2',80:'#2119DC',90:'#1C11D5' },
  salt: { 0:'#FFFFFF',10:'#F9F8F9',20:'#F3F1F3',30:'#ECE9ED',40:'#E5E2E6',50:'#DCD7DE',60:'#D2CCD4',70:'#CBC4CE',80:'#C5BDC7',90:'#BFB5C2' },
  pepper: { 10:'#585167',20:'#4E485C',30:'#454051',40:'#3C3847',50:'#312D3A',60:'#26232C',70:'#1F1D25',80:'#1A181E',90:'#121015' },
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
const card: React.CSSProperties = { background: '#1A181E', color: '#FFFFFF', padding: 24, borderRadius: 12 };

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

// ===================== Story 1: raw ramps =====================
export const RawRamps: Story = {
  name: 'Raw ramps · old vs new',
  render: () => (
    <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: 4 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Raw color ramps — old (top) vs new (bottom)</h1>
      <p style={{ opacity: 0.7, maxWidth: 760 }}>
        Every family keeps its name and all nine shade levels. Hues shift toward a true-violet vibe;
        neutrals (pepper/salt) gain a subtle violet tint while their lightness ramp is preserved.
        Social colors and opacity percentages are unchanged.
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
