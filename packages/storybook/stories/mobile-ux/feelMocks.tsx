import type { CSSProperties, ReactElement, ReactNode } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons/Arrow';
import { ShareIcon } from '@dailydotdev/shared/src/components/icons/Share';
import { MenuIcon } from '@dailydotdev/shared/src/components/icons/Menu';
import { SortIcon } from '@dailydotdev/shared/src/components/icons/Sort';
import { PlusIcon } from '@dailydotdev/shared/src/components/icons/Plus';
import { UpvoteIcon } from '@dailydotdev/shared/src/components/icons/Upvote';
import { DownvoteIcon } from '@dailydotdev/shared/src/components/icons/Downvote';
import { DiscussIcon } from '@dailydotdev/shared/src/components/icons/Discuss';
import { BookmarkIcon } from '@dailydotdev/shared/src/components/icons/Bookmark';
import { HomeIcon } from '@dailydotdev/shared/src/components/icons/Home';
import { CompassIcon } from '@dailydotdev/shared/src/components/icons/Compass';
import { SquadIcon } from '@dailydotdev/shared/src/components/icons/Squad';
import { BellIcon } from '@dailydotdev/shared/src/components/icons/Bell';
import { LinkIcon } from '@dailydotdev/shared/src/components/icons/Link';
import { FlagIcon } from '@dailydotdev/shared/src/components/icons/Flag';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { Circle, RootCluster, chromeSpec } from './chrome';
import { BarMaterial, materials } from './floating';
import { quietChipClassName } from './rowStyle';
import { SheetRow } from './sheets';

// Chapter 9l: the feel pass. Source: jakub.kr (the essays "Less is more",
// "Details that make interfaces feel better", "The invisible side of design
// engineering", the Motion gesture and drag articles) and his open skills
// (github.com/jakubkrehel/skills: better-ui, better-layout,
// better-typography, better-accessibility, better-colors, better-writing),
// read on 1 Oct 2026. Every value below is his exact number, not a
// paraphrase; where our decisions already match, the row says Keeps.

const material = BarMaterial.Glass;

// The house curves. Interaction is Jakub's CSS approximation of a spring
// with no bounce, the one 4e already snaps on; travel is the iOS sheet
// curve chapter 7 decided for pushes and sheets.
export const curves = {
  interaction: 'cubic-bezier(0.2, 0, 0, 1)',
  travel: 'cubic-bezier(0.32, 0.72, 0, 1)',
};

const feelCss = `
.feel-press { transition-property: transform; transition-duration: 150ms; transition-timing-function: ease-out; -webkit-tap-highlight-color: transparent; touch-action: manipulation; cursor: pointer; }
.feel-press-92:active { transform: scale(0.92); }
.feel-press-96:active { transform: scale(0.96); }
.feel-icon { transition-property: opacity, transform, filter; transition-duration: 300ms; transition-timing-function: ${curves.interaction}; }
.feel-icon-out { opacity: 0; transform: scale(0.25); filter: blur(4px); }
.feel-icon-in { opacity: 1; transform: none; filter: blur(0); }
@keyframes feelSheetKeyframe { from { transform: translateY(100%); } to { transform: none; } }
.feel-sheet-keyframe { animation: feelSheetKeyframe 420ms ${curves.travel} both; }
.feel-sheet-open { transform: none; transition: transform 300ms ${curves.travel}; }
.feel-sheet-closed { transform: translateY(100%); transition: transform 200ms ease-out; }
.feel-scrim { transition: opacity 150ms ease-out; }
.feel-toast-enter { opacity: 1; transform: none; filter: blur(0); transition: opacity 300ms ${curves.interaction}, transform 300ms ${curves.interaction}, filter 300ms ${curves.interaction}; }
.feel-toast-before { opacity: 0; transform: translateY(8px); filter: blur(8px); }
.feel-toast-exit { opacity: 0; transform: none; filter: blur(4px); transition: opacity 150ms ease-out, filter 150ms ease-out; }
@media (prefers-reduced-motion: reduce) {
  .feel-press, .feel-icon, .feel-sheet-open, .feel-sheet-closed, .feel-toast-enter, .feel-toast-exit { transition-duration: 0.01ms; }
  .feel-sheet-keyframe { animation-duration: 0.01ms; }
}
`;

export const FeelMotion = (): ReactElement => (
  // eslint-disable-next-line react/no-danger
  <style dangerouslySetInnerHTML={{ __html: feelCss }} />
);

// ---------------------------------------------------------------------------
// The source, in one page

export interface FeelPrinciple {
  rule: string;
  value: string;
  where: string;
}

export const feelPrinciples: FeelPrinciple[] = [
  { rule: 'Restraint is the skill', value: 'Every element and every animation has to make the outcome better, or it goes. Removing is harder than adding; simplicity comes from understanding what people do with the thing.', where: 'Less is more, more or less' },
  { rule: 'Animate by frequency', value: 'A menu opened 200 times a day with a 300ms animation costs six hours a year. High-frequency interactions (keystrokes, row taps, tab switches) get instant feedback or at most 150ms of opacity or colour; rich motion is for rare moments.', where: 'Less is more; better-ui, Motion restraint' },
  { rule: 'Transitions for interactions, keyframes for one-shot sequences', value: 'A transition retargets mid-flight when the user changes their mind; a keyframe restarts from zero and feels broken. Anything the user can toggle or drag is a transition.', where: 'Details; better-ui, Interruptible animations' },
  { rule: 'Springs with no bounce', value: 'type: spring, bounce: 0, always. In CSS the same feel is cubic-bezier(0.2, 0, 0, 1). Tap 0.5s, focus 0.3s, hover 0.8s, exits 0.45s, all bounce 0.', where: 'Using gestures in Motion; better-ui, icon-transitions' },
  { rule: 'Enter = opacity, blur and a small translate', value: 'From opacity 0, translateY(8 to 12px), blur(4 to 8px). Split a staged entrance into chunks 100ms apart (words 80ms); never stagger a routine interaction.', where: 'Details; better-ui, enter-exit' },
  { rule: 'Exits are softer than enters', value: 'Opacity and blur do the work; a fixed translate of 12px at most, never the full height. Exit 150ms against an enter of 300ms. A drawer closing may slide fully out at 200ms ease-out because the spatial context matters.', where: 'Details; better-ui, enter-exit' },
  { rule: 'Press = scale 0.96', value: 'Exactly 0.96 on :active, never below 0.95 (exaggerated). transition-property: scale, 150ms ease-out, so a release mid-press returns smoothly. A static prop turns it off where it would distract.', where: 'better-ui, Scale on press' },
  { rule: 'Icon state changes cross-fade', value: 'Both icons in the DOM, one absolute: scale 0.25 to 1, opacity 0 to 1, blur 4px to 0, spring 0.3s bounce 0 (or 300ms on the interaction curve). For toggles like liked or bookmarked, never for static navigation icons.', where: 'Details; better-ui, icon-transitions' },
  { rule: 'Only compositor properties move', value: 'transform, opacity and filter. Never height, width, top, padding or border-radius on the way from one state to another. transition: all is banned; name the properties. will-change only on first-frame stutter, then reset.', where: 'better-ui, performance; will-change article' },
  { rule: 'Motion is never the only signal', value: 'Every animated state change leaves a static cue (a fill, a colour, a label) so it reads with reduced motion on or when the user blinked.', where: 'better-ui, Motion restraint' },
  { rule: 'Reduced motion is reduce, not remove', value: 'Slides and scales become opacity crossfades; parallax, autoplay and looping decoration go entirely; spinners, progress and press feedback stay. Wrap motion in prefers-reduced-motion: no-preference so it is opt-in.', where: 'better-accessibility, motion-and-zoom' },
  { rule: 'Concentric radius', value: 'Outer radius = inner radius + padding, whenever the inset is under 24px. Past that, the layers are independent surfaces.', where: 'Details; better-ui, surfaces' },
  { rule: 'Depth by shadow, structure by border', value: 'A card or floating control gets a layered transparent shadow (a 1px ring at 6%, 1px 2px at 6%, 2px 4px at 4%; one white ring at 8% in dark mode). Dividers stay borders.', where: 'Details; better-ui, surfaces' },
  { rule: 'Hit areas', value: '24px is the WCAG floor; 44px is the touch target for primary controls. Extend a small control with a pseudo-element on the button, never on the input; two hit areas never overlap. touch-action: manipulation on every control; hover styling behind (hover: hover).', where: 'better-accessibility, hit-areas' },
  { rule: 'Tabular numbers on anything that changes', value: 'font-variant-numeric: tabular-nums on counters, timers and prices, so digits do not jitter as they update.', where: 'Details; better-typography' },
  { rule: 'Wrap deliberately', value: 'text-wrap: balance on titles, text-wrap: pretty on descriptions, neither in long-form text. Smart punctuation, the real ellipsis, nbsp between a number and its unit.', where: 'Details; better-typography, wrapping' },
  { rule: 'Group with space, controls distinct', value: 'Gaps between groups at least twice the gap inside them. Every control has a shape, a border or a placement zone; a control styled like text is invisible. Bordered controls 12px apart, borderless ones 24px around, unless an established density keeps hit areas distinct.', where: 'better-layout' },
  { rule: 'One filled action per view', value: 'Filled colour marks the primary action; peers stay neutral. A selected state may use the accent on the glyph, since state is not emphasis.', where: 'better-colors, color-usage' },
  { rule: 'Copy that points forward', value: 'Verb-first buttons; a confirmation repeats the consequence (Delete project / Cancel); errors say how to fix, next to the failure, no oops; an empty state says what the place is and offers one next action. Toasts with an action stay until dismissed, or at least 5s and paused on hover.', where: 'better-writing; better-accessibility, Autoplay and timed UI' },
  { rule: 'The invisible side', value: 'Performance, hit areas, reduced motion and locale formatting are most of the job; the animation is the small visible part. Test at 320px and 200% zoom; keep text selectable; label icon-only buttons.', where: 'The invisible side of design engineering' },
];

// ---------------------------------------------------------------------------
// Every decision, against the source

export enum FeelVerdict {
  Keeps = 'keeps',
  Improve = 'improve',
  Fix = 'fix',
}

const verdictClassName: Record<FeelVerdict, string> = {
  [FeelVerdict.Keeps]: 'bg-surface-float text-text-tertiary',
  [FeelVerdict.Improve]: 'bg-overlay-float-cabbage text-accent-cabbage-default',
  [FeelVerdict.Fix]: 'bg-overlay-float-ketchup text-accent-ketchup-default',
};

const verdictLabel: Record<FeelVerdict, string> = {
  [FeelVerdict.Keeps]: 'Keeps',
  [FeelVerdict.Improve]: 'Improve',
  [FeelVerdict.Fix]: 'Fix',
};

export const FeelVerdictPill = ({ verdict }: { verdict: FeelVerdict }): ReactElement => (
  <span className={classNames('whitespace-nowrap rounded-6 px-1.5 py-0.5 font-bold uppercase tracking-wide typo-caption2', verdictClassName[verdict])}>
    {verdictLabel[verdict]}
  </span>
);

export interface FeelReviewRow {
  chapter: string;
  decided: string;
  against: string;
  verdict: FeelVerdict;
}

export const feelReview: FeelReviewRow[] = [
  { chapter: '3b', decided: 'Bar geometry: 56px at rest and 44 compact, radius 22 and 18, 4px inner padding, the selection lens at the outer radius minus 4.', against: 'Concentric: outer = inner + padding, exactly his formula. One radius family for the bar, the buttons, the field and the avatar (38 at 14) means one shape everywhere.', verdict: FeelVerdict.Keeps },
  { chapter: '3b', decided: 'The material: the blur-baseline surface at 88% over a 40px backdrop blur, a hairline ring from the border token, a 0 4px 30px shadow at 12%.', against: 'Depth by shadow, structure by border: the ring is a token so it adapts per theme, the shadow is transparent so it sits on any content. His one warning is translucent surfaces: the inactive glyph at 72% opacity changes contrast with whatever scrolls behind it. Measure it over the lightest card in both themes; raise the glyph to 80% only if it fails.', verdict: FeelVerdict.Improve },
  { chapter: '3b', decided: 'Selection is Tint: the active tab is the filled glyph in the primary colour, the others outline at 72%.', against: 'Outline default, fill active is his exact pairing, and fill plus opacity is two cues, so no meaning rides on colour alone. The swap stays instant: a tab switch is the highest-frequency interaction on the screen and his icon cross-fade is for toggles, not navigation icons.', verdict: FeelVerdict.Keeps },
  { chapter: '3b', decided: 'The continuous shrink: height 56 to 44, inset 20 to 40 and radius 22 to 18 scrub with the finger over 96px.', against: 'Height, padding and radius are layout properties; he moves only transform, opacity and filter. The shrink does not cost the user time (it follows the finger, nothing waits), so it passes the frequency test, but it must be built to hold 120Hz: the bottom row already moves on translateY; drive the capsule with a transform-based scale and counter-scaled glyphs, or a CSS variable set once per frame with contain: layout on the cluster, and measure in the wrapper. If frames drop, the fallback is two states (rest, compact) on a transform and opacity transition.', verdict: FeelVerdict.Improve },
  { chapter: '3b', decided: 'The Create square is the bar material with a primary glyph, beside the bar.', against: 'One filled action per view: nothing in the bar is filled, so the page’s own primary (Join, Follow, Post) keeps the only fill. A control with its own shape and placement zone reads as a control.', verdict: FeelVerdict.Keeps },
  { chapter: '3b, 4', decided: 'Top buttons and the avatar: 38px squares, 14px radius, 16px from the edges, 8px apart.', against: '38 is above the 24px floor and under the 44px touch target he uses for primary controls. Keep 38 visible and extend each hit area to 44 with a pseudo-element on the button (3px each side); the 8px gap leaves 2px between neighbouring hit areas, so nothing overlaps.', verdict: FeelVerdict.Fix },
  { chapter: '4, 9k', decided: 'The brand row: logo, then streak, the Plus square and the avatar at the row’s 12px gap; roots put the name where Home has the logo.', against: 'Borderless controls want 24px of clearance in his starting numbers, but the row is an established density with a 48px row height: give each control the row height as its hit area and keep the 12px gap. The streak count is already tabular.', verdict: FeelVerdict.Keeps },
  { chapter: '4c', decided: 'Rows: the 28px quiet chip at 4px gaps; segments plain with a tonal active, filter chips outlined with a primary-button active, links hairline, menus text with a chevron.', against: 'Controls distinct from content: every chip has a shape or a border, and the menu label’s chevron is its cue. The 28px height and 4px gap are under his 44 and 12; the row is 44px tall, so the hit area is the row height and the chip’s full width, which keeps the density and never overlaps. The chevron menu gets the same 44px.', verdict: FeelVerdict.Improve },
  { chapter: '4d', decided: 'One name size, 20px bold, beside the back button, in the brand row and as the hero name; post titles at title1, feed titles at title3.', against: 'Fewer sizes and weights is his first typography rule and one size is as few as it gets. What is missing is wrapping: text-wrap: balance on post and feed titles (two lines even instead of a long line and a word), text-wrap: pretty on summaries, descriptions and empty-state bodies.', verdict: FeelVerdict.Improve },
  { chapter: '4e', decided: 'Hide on scroll: the block moves on translateY with the finger, 140ms while scrubbing and 220ms on the snap, both on cubic-bezier(0.2, 0, 0, 1), snapping after 300ms of stillness; content never reflows; reduced motion swaps the slide for a 150ms fade.', against: 'Transform only, his curve exactly, interruptible by construction (a transition retargets on every scroll event), a static outcome either way. The one nit is the mock’s transition list, which names top; production names transform and opacity only.', verdict: FeelVerdict.Keeps },
  { chapter: '4e', decided: 'Covers scroll at half speed behind the hero (parallax on a transform).', against: 'Parallax is the first thing his reduced-motion table disables entirely. The cover moves 1:1 with the content when the setting is on; everything else about covers stands.', verdict: FeelVerdict.Fix },
  { chapter: '4e', decided: 'Once the block is hidden the content passes under the clock behind a 44px soft edge (8px blur under a light fade).', against: 'A backdrop blur re-renders every frame, but at 60px tall over a single strip it is the cheapest blur on the page, and it carries no motion of its own. Keep; verify on the oldest supported Android in the wrapper.', verdict: FeelVerdict.Keeps },
  { chapter: '4e', decided: 'On things, the returning block carries Join or Follow as a filled 38px button, with the menu just left of it.', against: 'One filled action per view: the hero’s full-width Follow and the block’s Follow never show at once, so the view always has exactly one fill.', verdict: FeelVerdict.Keeps },
  { chapter: '3c, 9d', decided: 'The search field: 52px at rest, 22 radius, a focused field is 52 everywhere; form fields are 48px rows; both set their text at the callout size.', against: 'His iOS rule: an input under 16px zooms the whole page on focus. Callout is 15px, so every field in the shell would zoom. The input itself renders at 16px or more (body is 17px) in every state, on the page and inside Spotlight; the label and helper text keep their sizes. His two recipes: size the input up on phones, or keep 16px and scale it down visually.', verdict: FeelVerdict.Fix },
  { chapter: '3d, 3c, 4b', decided: 'Full-page overlays: the composer, Spotlight and the sign-up page cover the whole screen, status bar included; sheets slide up from the bottom.', against: 'The mocks disagree with each other: Spotlight and sheets slide up on a 420ms keyframe, the composer appears with no motion at all. One rule: every overlay enters on a transition (300ms on the travel curve, the scrim fading in 150ms) and leaves faster (200ms ease-out, a full slide because the spatial context matters); a keyframe cannot be interrupted when the user taps close during the open.', verdict: FeelVerdict.Fix },
  { chapter: '4b, 9d', decided: 'Menus are sheets: a grabber, drag to dismiss past a third, one sheet at a time, damped over-drag.', against: 'His drag numbers: dragElastic 0.05 (barely any rubber band), dragMomentum off so the sheet lands where the finger decides, a commit threshold in pixels, a spring with no bounce back to the snap point. Plus the invisible side: the page behind is inert, overscroll-behavior: contain on the sheet, focus returns to what opened it, Escape closes on a keyboard.', verdict: FeelVerdict.Improve },
  { chapter: '6', decided: 'The action bar: upvote, downvote, comment, bookmark and share with counts beside the first and third; counts drop away as it goes compact.', against: 'The counts change on every tap and are proportional figures, so 999 to 1,000 shifts the whole bar: tabular-nums on both. The upvote and bookmark toggles are his textbook icon cross-fade (outline to fill, scale 0.25 to 1, blur 4 to 0, 300ms), with the colour change as the second cue.', verdict: FeelVerdict.Fix },
  { chapter: '6b', decided: 'The reading drawer: four heights, folding with the page scroll, rising around the capsule; the post page sinks into the drawer on Read while the page behind scales from 0.94.', against: 'The page reveal is a transform, good. The drawer animates height (a layout property) 420ms on a third curve, cubic-bezier(0.2, 0.8, 0.2, 1), and the title line folds by height too. Build the drawer at its full height and move it with translateY; fold the title with opacity and a clip; use the travel curve like every other sheet. Same look, no layout per frame.', verdict: FeelVerdict.Improve },
  { chapter: '7', decided: 'Press states: tab items and bar buttons scale to 0.92 on press, transparent tap highlight, touch-action: manipulation.', against: 'His number is exactly 0.96, never below 0.95, with transition-property: scale at 150ms ease-out so a release mid-press comes back smoothly. 0.92 is the exaggerated end he warns about.', verdict: FeelVerdict.Fix },
  { chapter: '7', decided: 'Push and pop: a leaf slides in from the right in 300ms on cubic-bezier(0.32, 0.72, 0, 1) and slides out on back; tab switches cross-fade in 150ms; header collapse 200ms.', against: 'The tab cross-fade sits exactly at his 150ms ceiling for high-frequency interactions. The push is a full slide both ways, which he allows when spatial context matters. Header collapse at 200ms conflicts with 4e’s 140 and 220; the spec file (9e, item 2) keeps 4e’s numbers.', verdict: FeelVerdict.Keeps },
  { chapter: '7', decided: 'Haptics: one light impact on a tab change, an upvote, a bookmark and a streak increment.', against: 'Not in the source. Consistent with his rule that motion is never the only signal: the haptic is a third cue beside the fill and the colour, never the only one.', verdict: FeelVerdict.Keeps },
  { chapter: '7, 4c', decided: 'Segments are a pager: the next panel drags in with the thumb inside a 27° cone past 56px and springs back if abandoned.', against: 'His drag recipe: elastic 0.05, momentum off, a pixel threshold, spring with no bounce to the snap point. Write those four numbers into the swipe hook and the pager matches the drawer and the sheets.', verdict: FeelVerdict.Keeps },
  { chapter: '9e', decided: 'The toast: 12px above the cluster, inside its inset, one at a time, with Undo.', against: 'No enter or exit was drawn. Enter from opacity 0, translateY(8px) and blur(8px) in 300ms; exit by opacity and blur only in 150ms, no movement. A toast that carries an action stays until dismissed, or at least 5s with the timer paused while a finger is on it, and it has a close control.', verdict: FeelVerdict.Fix },
  { chapter: '9e', decided: 'Loading: the block and the cluster at rest, pulsing skeletons in the content.', against: 'Progress and loading indicators are what reduced motion keeps, and nothing else on the page animates in on first paint, which is his skip-animation-on-load rule.', verdict: FeelVerdict.Keeps },
  { chapter: '9e', decided: 'Empty, error, offline and not found: a title, one line, one action (Turn on notifications, Browse Popular, Retry, Go to Home); the offline strip inverted with an icon and Retry.', against: 'His empty-state and error recipes almost word for word: orientation, one next action, verb-first, the error says how to fix it. The action is drawn as a 28px chip: make it a real button at the DS medium height (40px) so the one thing the page asks for is the easiest thing to hit; give Retry in the 36px strip a 44px hit area.', verdict: FeelVerdict.Improve },
  { chapter: '9d', decided: 'Forms: Save as the check icon, dimmed until something changed; back with unsaved changes asks once (Keep editing / Discard, Discard last and red).', against: 'A confirmation that repeats the consequence, destructive last and distinct: his dialog rule exactly. Dimmed-until-dirty is not the disabled-until-valid pattern he rejects, since nothing is being validated.', verdict: FeelVerdict.Keeps },
  { chapter: '9k, 3b', decided: 'The Plus square is the Plus glyph in the Plus colour; badges are the brand bubble, tabular, 8px radius.', against: 'One colour, one meaning: the Plus colour appears only where it means Plus; the bubble is tabular so a count never jitters.', verdict: FeelVerdict.Keeps },
  { chapter: 'all', decided: 'Every piece has its own motion numbers: 4e on cubic-bezier(0.2, 0, 0, 1), sheets and pushes on cubic-bezier(0.32, 0.72, 0, 1), the drawer on cubic-bezier(0.2, 0.8, 0.2, 1), the presentation kit on cubic-bezier(0.16, 1, 0.3, 1).', against: 'He runs one curve. Two are defensible here because they do two jobs: the interaction curve for anything the finger drives or toggles, the travel curve for anything that crosses the screen. The other two go.', verdict: FeelVerdict.Fix },
  { chapter: 'production', decided: 'The app already applies antialiased on the root, guards its existing animations for reduced motion, and lets members switch theme in settings.', against: 'Font smoothing and the guards are his rules, done. The theme switch smears: every element with a colour transition animates at once. His fix is four lines (disable transitions, force a reflow, restore next frame). Outside the shell, worth its own small PR.', verdict: FeelVerdict.Improve },
];

// ---------------------------------------------------------------------------
// The ten changes, drawn

const Stage = ({ children, height = 200, className }: { children: ReactNode; height?: number; className?: string }): ReactElement => (
  <div
    style={{ width: 375, height }}
    className={classNames('relative overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-default', className)}
  >
    {children}
  </div>
);

const StageLabel = ({ children }: { children: ReactNode }): ReactElement => (
  <span className="absolute left-4 top-3 text-text-quaternary typo-caption1">{children}</span>
);

const Gradient = (): ReactElement => (
  <div className="absolute inset-0 bg-gradient-to-br from-accent-onion-default via-accent-cabbage-default to-accent-bun-default opacity-40" />
);

// 1 · Press: 0.92 (chapter 7) against 0.96 (Jakub). Press and hold.
export const PressSpecimen = ({ scale }: { scale: 92 | 96 }): ReactElement => {
  const press = classNames('feel-press', scale === 92 ? 'feel-press-92' : 'feel-press-96');
  return (
    <Stage height={168}>
      <Gradient />
      <StageLabel>scale({scale === 92 ? '0.92' : '0.96'}), press and hold</StageLabel>
      <div className="absolute inset-x-0 top-10 flex items-center" style={{ paddingInline: chromeSpec.topInset, gap: chromeSpec.gap }}>
        <Circle material={material} fixed className={press}>
          <ArrowIcon size={IconSize.Small} className="-rotate-90" />
        </Circle>
        <span className="flex-1" />
        <Circle material={material} fixed className={press}>
          <ShareIcon size={IconSize.Small} />
        </Circle>
        <Circle material={material} fixed className={press}>
          <MenuIcon size={IconSize.Small} />
        </Circle>
      </div>
      <div className="absolute inset-x-0 bottom-2 flex items-end" style={{ paddingInline: chromeSpec.inset, gap: chromeSpec.gap }}>
        <div style={{ ...materials[material], height: chromeSpec.rest, borderRadius: chromeSpec.restRadius, padding: chromeSpec.padding }} className="flex flex-1 items-stretch">
          {[HomeIcon, CompassIcon, SquadIcon, BellIcon].map((Icon, index) => (
            <button
              key={Icon.name || index}
              type="button"
              className={classNames('flex flex-1 items-center justify-center text-text-primary', press, index !== 0 && 'opacity-[0.72]')}
              style={{ borderRadius: chromeSpec.restRadius - chromeSpec.padding }}
            >
              <Icon size={IconSize.Large} secondary={index === 0} />
            </button>
          ))}
        </div>
        <Circle material={material} className={press}>
          <PlusIcon size={IconSize.Large} />
        </Circle>
      </div>
    </Stage>
  );
};

const CrossFadeIcon = ({
  active,
  Icon,
  size = IconSize.Medium,
}: {
  active: boolean;
  Icon: typeof UpvoteIcon;
  size?: IconSize;
}): ReactElement => (
  <span className="relative flex">
    <span className={classNames('feel-icon flex', active ? 'feel-icon-out' : 'feel-icon-in')}>
      <Icon size={size} />
    </span>
    <span className={classNames('feel-icon absolute inset-0 flex', active ? 'feel-icon-in' : 'feel-icon-out')}>
      <Icon size={size} secondary />
    </span>
  </span>
);

// 2 · Icon swaps: the cross-fade on the toggles of the action bar, instant on
// the tabs. Tap upvote and bookmark; tap the tabs.
export const IconSwapSpecimen = ({ crossFade }: { crossFade: boolean }): ReactElement => {
  const [upvoted, setUpvoted] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [tab, setTab] = useState(0);
  const upvotes = 1284 + (upvoted ? 1 : 0);

  return (
    <Stage height={168}>
      <Gradient />
      <StageLabel>{crossFade ? 'toggles cross-fade (300ms), tabs instant' : 'everything instant'}</StageLabel>
      <div className="absolute inset-x-0 top-10 flex" style={{ paddingInline: chromeSpec.inset }}>
        <div style={{ ...materials[material], height: chromeSpec.accessory, borderRadius: chromeSpec.restRadius }} className="flex flex-1 items-center justify-between px-0.5">
          <button type="button" onClick={() => setUpvoted((value) => !value)} className={classNames('feel-press feel-press-96 flex h-full items-center gap-0.5 px-1.5 tabular-nums typo-caption1', upvoted ? 'text-accent-avocado-default' : 'text-text-secondary')}>
            {crossFade ? <CrossFadeIcon active={upvoted} Icon={UpvoteIcon} /> : <UpvoteIcon size={IconSize.Medium} secondary={upvoted} />}
            {upvotes.toLocaleString('en-US')}
          </button>
          <span className="flex h-full items-center px-1.5 text-text-secondary">
            <DownvoteIcon size={IconSize.Medium} />
          </span>
          <span className="flex h-full items-center gap-0.5 px-1.5 tabular-nums text-text-secondary typo-caption1">
            <DiscussIcon size={IconSize.Medium} />
            96
          </span>
          <button type="button" onClick={() => setBookmarked((value) => !value)} className={classNames('feel-press feel-press-96 flex h-full items-center px-1.5', bookmarked ? 'text-accent-bun-default' : 'text-text-secondary')}>
            {crossFade ? <CrossFadeIcon active={bookmarked} Icon={BookmarkIcon} /> : <BookmarkIcon size={IconSize.Medium} secondary={bookmarked} />}
          </button>
          <span className="flex h-full items-center px-1.5 text-text-secondary">
            <ShareIcon size={IconSize.Medium} />
          </span>
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-2 flex items-end" style={{ paddingInline: chromeSpec.inset, gap: chromeSpec.gap }}>
        <div style={{ ...materials[material], height: chromeSpec.rest, borderRadius: chromeSpec.restRadius, padding: chromeSpec.padding }} className="flex flex-1 items-stretch">
          {[HomeIcon, CompassIcon, SquadIcon, BellIcon].map((Icon, index) => (
            <button
              key={Icon.name || index}
              type="button"
              onClick={() => setTab(index)}
              className={classNames('feel-press feel-press-96 flex flex-1 items-center justify-center text-text-primary', index !== tab && 'opacity-[0.72]')}
              style={{ borderRadius: chromeSpec.restRadius - chromeSpec.padding }}
            >
              <Icon size={IconSize.Large} secondary={index === tab} />
            </button>
          ))}
        </div>
        <Circle material={material} className="feel-press feel-press-96">
          <PlusIcon size={IconSize.Large} />
        </Circle>
      </div>
    </Stage>
  );
};

const sheetRows: [typeof ShareIcon, string][] = [
  [BookmarkIcon, 'Save to bookmarks'],
  [LinkIcon, 'Copy link'],
  [ShareIcon, 'Share'],
  [FlagIcon, 'Report'],
];

// 3 · Sheets: a keyframe (today) against a transition. Tap open, then close
// before it has finished: the keyframe restarts, the transition reverses.
export const SheetSpecimen = ({ interruptible }: { interruptible: boolean }): ReactElement => {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const toggle = (): void => {
    if (interruptible) {
      setOpen((value) => !value);
      return;
    }
    setMounted((value) => !value);
  };

  const shown = interruptible ? open : mounted;

  return (
    <Stage height={320}>
      <StageLabel>{interruptible ? 'transition: 300ms in on the travel curve, 200ms out, reversible' : 'keyframe: 420ms in, no out, restarts'}</StageLabel>
      <div className="absolute inset-x-0 top-10 flex justify-center">
        <button type="button" onClick={toggle} className="feel-press feel-press-96 rounded-12 bg-text-primary px-4 py-2 font-bold text-surface-invert typo-callout">
          {shown ? 'Close' : 'Open the menu'}
        </button>
      </div>
      <span className="absolute inset-x-4 top-24 text-center text-text-tertiary typo-footnote">Tap twice, fast.</span>
      {(interruptible || mounted) && (
        <div
          className={classNames('feel-scrim absolute inset-0 bg-overlay-quaternary-onion', interruptible && !open && 'pointer-events-none opacity-0')}
          onClick={toggle}
          aria-hidden
        />
      )}
      {(interruptible || mounted) && (
        <div
          className={classNames(
            'absolute inset-x-0 bottom-0 flex flex-col rounded-t-24 bg-background-default pb-4',
            interruptible ? (open ? 'feel-sheet-open' : 'feel-sheet-closed') : 'feel-sheet-keyframe',
          )}
        >
          <span className="mx-auto mb-1 mt-2 h-1 w-9 rounded-2 bg-border-subtlest-secondary" />
          {sheetRows.map(([Icon, label]) => (
            <SheetRow key={label} icon={<Icon size={IconSize.Small} />} label={label} />
          ))}
        </div>
      )}
    </Stage>
  );
};

enum ToastPhase {
  Hidden = 'hidden',
  Before = 'before',
  Shown = 'shown',
  Exit = 'exit',
}

// 4 · The toast: enters with opacity, blur and 8px of travel; leaves with
// opacity and blur only. Carries Undo, so it stays 5s and pauses under a
// finger, and it can be closed.
export const ToastSpecimen = (): ReactElement => {
  const [phase, setPhase] = useState(ToastPhase.Hidden);
  const [remaining, setRemaining] = useState(5000);
  const paused = useRef(false);
  const timer = useRef<ReturnType<typeof setInterval>>();

  const dismiss = (): void => {
    setPhase((current) => (current === ToastPhase.Shown ? ToastPhase.Exit : current));
  };

  const show = (): void => {
    setRemaining(5000);
    setPhase(ToastPhase.Before);
    requestAnimationFrame(() => requestAnimationFrame(() => setPhase(ToastPhase.Shown)));
  };

  useEffect(() => {
    if (phase !== ToastPhase.Shown) {
      return undefined;
    }
    timer.current = setInterval(() => {
      if (paused.current) {
        return;
      }
      setRemaining((value) => {
        if (value <= 100) {
          dismiss();
          return 0;
        }
        return value - 100;
      });
    }, 100);
    return () => clearInterval(timer.current);
  }, [phase]);

  useEffect(() => {
    if (phase !== ToastPhase.Exit) {
      return undefined;
    }
    const done = setTimeout(() => setPhase(ToastPhase.Hidden), 160);
    return () => clearTimeout(done);
  }, [phase]);

  const toastClassName = {
    [ToastPhase.Hidden]: 'hidden',
    [ToastPhase.Before]: 'feel-toast-before',
    [ToastPhase.Shown]: 'feel-toast-enter',
    [ToastPhase.Exit]: 'feel-toast-exit',
  }[phase];

  return (
    <Stage height={200}>
      <StageLabel>enter 300ms (opacity, 8px, blur 8), exit 150ms (opacity, blur)</StageLabel>
      <div className="absolute inset-x-0 top-10 flex justify-center">
        <button type="button" onClick={show} className="feel-press feel-press-96 rounded-12 bg-text-primary px-4 py-2 font-bold text-surface-invert typo-callout">
          Save a post
        </button>
      </div>
      <div
        className={classNames('absolute z-3 flex h-12 items-center gap-3 rounded-14 bg-text-primary pl-4 pr-1 text-surface-invert shadow-2', toastClassName)}
        style={{ insetInline: chromeSpec.inset, bottom: 8 + chromeSpec.rest + 12 }}
        onPointerDown={() => {
          paused.current = true;
        }}
        onPointerUp={() => {
          paused.current = false;
        }}
        onPointerLeave={() => {
          paused.current = false;
        }}
        role="status"
      >
        <span className="min-w-0 flex-1 truncate typo-callout">Saved to Read it later</span>
        <button type="button" onClick={dismiss} className="feel-press feel-press-96 h-10 px-2 font-bold typo-callout">
          Undo
        </button>
        <button type="button" onClick={dismiss} aria-label="Close" className="feel-press feel-press-96 flex size-10 items-center justify-center">
          <PlusIcon size={IconSize.Small} className="rotate-45" />
        </button>
        <span className="absolute inset-x-4 bottom-1 h-px overflow-hidden rounded-2 bg-surface-invert/[0.16]">
          <span className="block h-full bg-surface-invert" style={{ width: `${(remaining / 5000) * 100}%`, transition: 'width 100ms linear' }} />
        </span>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-2">
        <RootCluster material={material} />
      </div>
    </Stage>
  );
};

const HitBox = ({ children, inset, className }: { children: ReactNode; inset: string; className?: string }): ReactElement => (
  <span className={classNames('relative flex', className)}>
    {children}
    <span className="pointer-events-none absolute rounded-6 border border-dashed border-accent-cabbage-default" style={{ inset }} aria-hidden />
  </span>
);

// 5 · Hit areas drawn: 44px around 38px buttons (3px each side, 2px left
// between neighbours), the row height around 28px chips.
export const HitAreaSpecimen = (): ReactElement => (
  <Stage height={168}>
    <StageLabel>dashed = the hit area, never overlapping</StageLabel>
    <div className="absolute inset-x-0 top-10 flex items-center" style={{ paddingInline: chromeSpec.topInset, gap: chromeSpec.gap }}>
      <HitBox inset="-3px">
        <Circle material={material} fixed>
          <ArrowIcon size={IconSize.Small} className="-rotate-90" />
        </Circle>
      </HitBox>
      <span className="min-w-0 flex-1 truncate px-1 font-bold typo-title3">Bookmarks</span>
      <HitBox inset="-3px">
        <Circle material={material} fixed>
          <SortIcon size={IconSize.Small} />
        </Circle>
      </HitBox>
      <HitBox inset="-3px">
        <Circle material={material} fixed>
          <MenuIcon size={IconSize.Small} />
        </Circle>
      </HitBox>
    </div>
    <div className="absolute inset-x-0 top-[6.25rem] flex h-11 items-center gap-1 px-4">
      {['Quick saves', 'Read it later', 'Frontend picks'].map((item, index) => (
        <HitBox key={item} inset="-8px 0">
          <span className={quietChipClassName(index === 0, false)}>{item}</span>
        </HitBox>
      ))}
    </div>
  </Stage>
);

// 6 · Tabular numbers on the counts: tap Play and watch the bar.
export const TabularSpecimen = (): ReactElement => {
  const [count, setCount] = useState(986);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) {
      return undefined;
    }
    const tick = setInterval(() => {
      setCount((value) => {
        if (value >= 1024) {
          setRunning(false);
          return 986;
        }
        return value + 1;
      });
    }, 90);
    return () => clearInterval(tick);
  }, [running]);

  const Bar = ({ tabular }: { tabular: boolean }): ReactElement => (
    <div style={{ ...materials[material], height: chromeSpec.accessory, borderRadius: chromeSpec.restRadius }} className={classNames('flex flex-1 items-center justify-between px-0.5', tabular && 'tabular-nums')}>
      <span className="flex h-full items-center gap-0.5 px-1.5 text-text-secondary typo-caption1">
        <UpvoteIcon size={IconSize.Medium} />
        {count.toLocaleString('en-US')}
      </span>
      <span className="flex h-full items-center px-1.5 text-text-secondary">
        <DownvoteIcon size={IconSize.Medium} />
      </span>
      <span className="flex h-full items-center gap-0.5 px-1.5 text-text-secondary typo-caption1">
        <DiscussIcon size={IconSize.Medium} />
        {Math.round(count / 11)}
      </span>
      <span className="flex h-full items-center px-1.5 text-text-secondary">
        <BookmarkIcon size={IconSize.Medium} />
      </span>
      <span className="flex h-full items-center px-1.5 text-text-secondary">
        <ShareIcon size={IconSize.Medium} />
      </span>
    </div>
  );

  return (
    <Stage height={200}>
      <Gradient />
      <StageLabel>proportional above, tabular below</StageLabel>
      <button type="button" onClick={() => setRunning(true)} className="feel-press feel-press-96 absolute right-4 top-2 rounded-10 bg-text-primary px-3 py-1 font-bold text-surface-invert typo-footnote">
        Play
      </button>
      <div className="absolute inset-x-0 top-12 flex" style={{ paddingInline: chromeSpec.inset }}>
        <Bar tabular={false} />
      </div>
      <div className="absolute inset-x-0 bottom-6 flex" style={{ paddingInline: chromeSpec.inset }}>
        <Bar tabular />
      </div>
    </Stage>
  );
};

const wrapTitle = 'Why the fastest teams stopped writing integration tests and what they do instead';
const wrapBody = 'A look at four engineering teams that replaced their integration suites with contract tests and production checks, what broke, and what they would not give back.';

// 7 · text-wrap: balance on the title, pretty on the summary.
export const WrapSpecimen = ({ wrapped }: { wrapped: boolean }): ReactElement => {
  const title: CSSProperties = wrapped ? ({ textWrap: 'balance' } as CSSProperties) : {};
  const body: CSSProperties = wrapped ? ({ textWrap: 'pretty' } as CSSProperties) : {};
  return (
    <Stage height={232}>
      <StageLabel>{wrapped ? 'balance on the title, pretty on the summary' : 'default wrapping'}</StageLabel>
      <article className="absolute inset-x-0 top-10 flex flex-col gap-3 px-4">
        <div className="flex items-center gap-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-max bg-accent-bun-default font-bold text-white typo-caption2">TB</span>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="font-bold typo-footnote">The Pragmatic Engineer</span>
            <span className="text-text-tertiary typo-caption1">7m read time · Today</span>
          </div>
        </div>
        <h3 className="font-bold leading-snug typo-title3" style={title}>{wrapTitle}</h3>
        <p className="text-text-secondary typo-footnote" style={body}>{wrapBody}</p>
      </article>
    </Stage>
  );
};

// ---------------------------------------------------------------------------
// The calls and the rules

export interface FeelCall {
  call: string;
  today: string;
  recommendation: string;
}

export const feelCalls: FeelCall[] = [
  { call: '1 · Press feedback', today: 'Chapter 7: scale 0.92 on press.', recommendation: 'scale(0.96) on every tappable control (bar items, top buttons, the avatar, chips, sheet rows, toast buttons), transition-property: scale at 150ms ease-out, tap highlight transparent, touch-action: manipulation. Nothing below 0.95.' },
  { call: '2 · Icon swaps', today: 'Outline to fill flips instantly everywhere.', recommendation: 'The cross-fade (both icons in the DOM, scale 0.25 to 1, blur 4 to 0, opacity, 300ms on the interaction curve) on toggles only: upvote, downvote, bookmark, the Save check as it enables. Tabs, back and menus stay instant.' },
  { call: '3 · Sheets and overlays', today: 'Sheets and Spotlight slide up on a 420ms keyframe with no exit; the composer has no motion.', recommendation: 'One rule for every sheet and full-page overlay: a transition in 300ms on the travel curve with the scrim fading 150ms, out in 200ms ease-out (a full slide, since the spatial context matters), interruptible either way. Drag to dismiss with elastic 0.05, no momentum, a pixel threshold, a bounce-free spring back. Background inert, overscroll contained, focus returned.' },
  { call: '4 · The toast', today: 'Drawn at rest only.', recommendation: 'In: opacity 0, translateY(8px), blur(8px) to rest in 300ms. Out: opacity and blur only, 150ms. With Undo it stays 5s, the timer pauses under a finger, and a close control is always there. role="status", one at a time.' },
  { call: '5 · Hit areas', today: '38px buttons, 28px chips, text Retry in a 36px strip, a 28px chip as the empty-state action.', recommendation: 'Visible sizes stay. Buttons and the avatar get a 44px hit area from a pseudo-element (3px each side); chips and the chevron menu take the row height (44) and their own width; Retry gets 44 the same way; the empty-state action becomes the DS medium button (40px). No two hit areas overlap.' },
  { call: '6 · Tabular numbers', today: 'The streak and the badge are tabular; the action bar counts, the Explore feed line and the search count line are not.', recommendation: 'tabular-nums on every number that can change while it is on screen: the action bar, the You row counts, list totals, the streak sheet grid.' },
  { call: '7 · Text: wrapping and input size', today: 'Default wrapping on every title and paragraph; the search and form fields set their text at the 15px callout size.', recommendation: 'text-wrap: balance on post titles, feed card titles, hero names and sheet titles; text-wrap: pretty on summaries, descriptions and empty-state bodies; neither in comment bodies or article text. Every input renders at 16px or more on phones (his iOS zoom rule), on the page and inside Spotlight, with labels unchanged.' },
  { call: '8 · Motion on transforms only', today: 'The bar shrink animates height, padding and radius per frame; the reading drawer animates height; the title line folds by height.', recommendation: 'Keep every decided look, change what moves: the drawer sits at full height and translates; the title folds by opacity and a clip; the shrink is driven by one CSS variable per frame on a contained cluster, measured at 120Hz in the wrapper, with a two-state transform fallback if it drops frames. The hide block, the page reveal and the cover already use transforms.' },
  { call: '9 · Two curves, not four', today: 'cubic-bezier(0.2, 0, 0, 1) in 4e, cubic-bezier(0.32, 0.72, 0, 1) in 7, cubic-bezier(0.2, 0.8, 0.2, 1) in 6b, cubic-bezier(0.16, 1, 0.3, 1) in the kit.', recommendation: 'Interaction: cubic-bezier(0.2, 0, 0, 1) for anything the finger drives or toggles (hide, shrink, snaps, icon swaps, toasts). Travel: cubic-bezier(0.32, 0.72, 0, 1) for anything that crosses the screen (sheets, overlays, pushes, the drawer). Durations: 150 for high-frequency feedback, 300 in, 150 to 200 out, 220 for a snap. Everything named in the spec file (9e, item 2).' },
  { call: '10 · Reduced motion', today: 'Hide on scroll swaps to a fade; nothing else is specified.', recommendation: 'Opt-in motion: the shell’s transitions live under prefers-reduced-motion: no-preference. With the setting on: the cover parallax is off, sheets and overlays crossfade instead of sliding, the shrink and the hide become fades, icon swaps are instant, skeletons and the press scale stay. Every animated state keeps its static cue (fill, colour, label), so nothing is lost.' },
];

export const feelRules: [string, string][] = [
  ['Animate by frequency', 'A tab switch, a chip tap and a keystroke get instant feedback or 150ms of opacity or colour. A sheet, a toast, a toggle get the full recipe. Nothing waits for an animation to finish.'],
  ['Transitions, not keyframes', 'Anything the user can toggle, drag or close mid-way is a CSS transition so it reverses from wherever it is. Keyframes only for one-shot sequences that run once (the milestone popup).'],
  ['Transforms, opacity, filter', 'That is the whole list of what moves. Height, width, padding, radius and top are set, never transitioned. transition-property is always named.'],
  ['Two curves, four durations', 'Interaction cubic-bezier(0.2, 0, 0, 1); travel cubic-bezier(0.32, 0.72, 0, 1). 150 feedback, 300 in, 150 to 200 out, 220 snap.'],
  ['Exits softer than enters', 'Out is opacity and blur, at most 12px of travel, half the duration of in. A closing sheet is the one full exit.'],
  ['Press is 0.96', 'Every tappable control, 150ms ease-out, tap highlight transparent, touch-action manipulation.'],
  ['One radius family', 'Outer = inner + padding under 24px of inset; above it, independent surfaces. The bar, the buttons, the field, the avatar and the block action share the 22, 18 and 14 family.'],
  ['44 to hit, whatever is visible', 'Pseudo-elements extend small controls; rows lend their height to chips; hit areas never overlap; decorative layers are pointer-events: none.'],
  ['Numbers that change are tabular; titles balance, bodies are pretty', 'tabular-nums, text-wrap: balance, text-wrap: pretty, in the components, not per page.'],
  ['A static cue for every animated state', 'Fill, colour or a label survives with reduced motion on; with it on, slides become fades and the parallax stops.'],
];

export const feelCuts: [string, string][] = [
  ['The bar shrink and the hide', 'Both run on every scroll, the highest frequency there is. They pass his test because they scrub with the finger: no one waits for them, and the snap is 220ms once per stop. They stay, built on transforms (call 8).'],
  ['The tab icon cross-fade', 'Tempting, and his icon recipe is exact, but a tab switch happens hundreds of times a day. Cut: the fill flips instantly (call 2).'],
  ['A staggered entrance for Home', 'His split-and-stagger recipe is for first loads and success states. Home is the most-opened page in the app: no entrance, the skeleton is enough (his skip-on-load rule).'],
  ['The 420ms sheet', 'A menu opened many times a day at 420ms is his six-hours-a-year example. 300 in, 200 out (call 3).'],
  ['Haptics on scroll', 'Chapter 7 keeps haptics for tab changes, votes, bookmarks and the streak. Nothing on the hide, the shrink or the snap: motion the finger drives needs no confirmation.'],
];
