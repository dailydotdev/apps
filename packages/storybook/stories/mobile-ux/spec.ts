// The one spec of numbers for the phone shell (9e, handoff item 2): every
// size, radius, inset, duration and tolerance the chapters decided, with the
// chapter and round it comes from. The mocks still carry their own copies
// (chromeSpec, hideSpec in hide.tsx, coverHeight, heightsFor); production
// reads this file only, as packages/shared/src/components/shell/constants.ts in
// the first PR of chapter 10. Where two mocks disagreed the row says which
// number won and why.

export interface SpecRow {
  group: string;
  name: string;
  value: string;
  from: string;
}

export const shell = {
  bar: { rest: 56, compact: 44, radiusRest: 22, radiusCompact: 18, inset: 20, compactInset: 40, padding: 4, gap: 8 },
  accessory: { rest: 52, compact: 44 },
  topButton: { size: 38, radius: 14, inset: 16, gap: 8, hit: 44 },
  row: { height: 44, chip: 28, chipRadius: 8, gap: 4, hit: 44 },
  title: 20,
  cover: { height: 168, scrimFrom: 0.35, scrimOver: 96, parallax: 0.5 },
  badge: { min: 18, radius: 8, top: -4, left: 16 },
  toast: { above: 12 },
  scroll: { travel: 64, deadZone: 96, hideTolerance: 24, revealTolerance: 8, stop: 300, scrub: 140, snap: 220, shrinkDistance: 96 },
  drawer: { bar: 72, card: 116, post: 600, fullOf: (frame: number): number => frame - 12 },
  motion: {
    interaction: 'cubic-bezier(0.2, 0, 0, 1)',
    travel: 'cubic-bezier(0.32, 0.72, 0, 1)',
    feedback: 150,
    enter: 300,
    exit: 200,
    exitSoft: 150,
    snap: 220,
    press: 0.96,
  },
  drag: { elastic: 0.05, commit: 56, cone: 27, velocity: 0.3, dismiss: 1 / 3 },
  statusEdge: { height: 60, blur: 8 },
  material: { alpha: 0.88, blur: 40, shadow: '0 4px 30px rgb(0 0 0 / 0.12)' },
  widths: { narrowest: 360, phoneBelow: 656 },
};

export const specRows: SpecRow[] = [
  { group: 'Bottom cluster', name: 'Bar height', value: '56 at rest, 44 compact', from: '3b, round 4' },
  { group: 'Bottom cluster', name: 'Bar radius', value: '22 at rest, 18 compact (follows the height)', from: '3b, round 4' },
  { group: 'Bottom cluster', name: 'Inset from the screen edges', value: '20 at rest, 40 compact; 8px above the safe area', from: '3b, round 4 (12px inset rejected with appleSpec)' },
  { group: 'Bottom cluster', name: 'Inner padding, gap to the Create square', value: '4 inside the bar; 8 between bar and square', from: '3b' },
  { group: 'Bottom cluster', name: 'Create square', value: 'Bar height square, bar material, primary glyph (Material tint)', from: '3b, round 5' },
  { group: 'Bottom cluster', name: 'Glyphs', value: 'IconSize.Large; active filled text-primary, inactive text-primary at 72% (raise to 80% only if contrast fails over the lightest card)', from: '3b (Tint), 9l' },
  { group: 'Bottom cluster', name: 'Badge', value: 'Bubble with railCountBubbleClass: cabbage, white caption1 bold tabular, radius 8, min 18px, 4px above and 16px into the icon; Activity only', from: '3b, 9e, round 5 (1 Oct)' },
  { group: 'Bottom cluster', name: 'Shrink', value: 'Height, inset and radius interpolate over 96px of scroll on the shared progress; two-state transform fallback if the wrapper drops frames', from: '3b, 4e, 9l call 8' },
  { group: 'Accessory (action bar, search field)', name: 'Height', value: '52 at rest, 44 compact; a focused field is 52 everywhere', from: '6, 3c, 9b call 3 (the 46 in one mock comment is stale)' },
  { group: 'Accessory (action bar, search field)', name: 'Radius', value: '22 at rest, 18 compact', from: '9b call 3' },
  { group: 'Top buttons', name: 'Size, radius, inset', value: '38px square, 14px radius, 16px from the edges, 8px apart; never move, never resize', from: '3b, 4, round 4' },
  { group: 'Top buttons', name: 'Hit area', value: '44px through a pseudo-element (3px each side); 2px stays between neighbours', from: '9l call 5' },
  { group: 'Top buttons', name: 'Avatar', value: '38px rounded square, radius 14, same ring and shadow; people square, squads and sources circles', from: '9c, round 5' },
  { group: 'Top block', name: 'Title', value: 'title3, 20px bold, plain text; one size everywhere (block, brand row, hero name)', from: '4d, round 5f' },
  { group: 'Top block', name: 'Row height, chip', value: '44px row; 28px quiet chip, radius 8, footnote bold, 4px gaps; the chip’s hit area is the row height', from: '4c, round 5o; 9l call 5' },
  { group: 'Top block', name: 'Segment, filter chip, link chip, menu', value: 'Segment: plain tertiary text, active = surface-float fill + subtlest-secondary hairline. Filter chip: subtlest-tertiary hairline, active = text-primary fill with surface-invert text. Link chip: hairline, no state. Menu: text + chevron', from: '4c, round 5o' },
  { group: 'Top block', name: 'Background', value: 'Solid page background; never translucent. Transparent only over a cover until the hero passes', from: '4, 4c, round 5d' },
  { group: 'Top block', name: 'Block action on things', value: 'Back · menu · name … Join/Follow (38px, filled) at the right edge once the block is solid', from: '4e, round 5k' },
  { group: 'Top block', name: 'Top strips', value: 'Offline strip and the 320×50 ad strip sit under the status bar above the block and never hide', from: '9e, 9f' },
  { group: 'Scroll', name: 'Travel', value: '64px: the block scrubs 1:1 with the finger over 64px', from: '4e (the 92 in hideRules was the Home block height, not the travel)' },
  { group: 'Scroll', name: 'Dead zone', value: '96px from the top; on hero pages pinAt + 200', from: '4e, round 5n' },
  { group: 'Scroll', name: 'Tolerances', value: '24px down before hiding, 8px up before revealing', from: '4e' },
  { group: 'Scroll', name: 'Stop and snap', value: '300ms of stillness, then snap to 0 or 1 in 220ms; 140ms transition while scrubbing', from: '4e, round 5n (180 and 140ms stop are stale)' },
  { group: 'Scroll', name: 'Reveal on intent', value: 'Status-bar tap, keyboard, a sheet, pull to refresh show the block; arrival never hides it', from: '4e, 9e states' },
  { group: 'Scroll', name: 'Status-bar edge', value: 'Once hidden: 44 + 16px edge, 8px blur under a light fade; the only blur at the top', from: '4e, round 5k' },
  { group: 'Covers', name: 'Cover', value: '168px at 375 wide, under the status bar, object-fit cover; scrim 35% to 0 over 96px; light status text', from: '4, round 5c' },
  { group: 'Covers', name: 'Parallax', value: 'Half speed on a transform; off under reduced motion', from: '4, 9l call 10' },
  { group: 'Overlays', name: 'Sheet', value: 'Grabber, drag to dismiss past a third, one at a time, covers the status bar; 300ms in on travel, 200ms out, scrim 150ms', from: '4b, 9d, round 6j, 9l call 3' },
  { group: 'Overlays', name: 'Drag', value: 'Elastic 0.05, no momentum, pixel threshold, spring back with no bounce; page behind inert, overscroll contained, focus returned', from: '9l call 3' },
  { group: 'Overlays', name: 'Full-page overlays', value: 'Composer, Spotlight, sign-up: same transition as a sheet, attached to the top, drag down past a third dismisses Spotlight', from: '3c, 3d, 9b' },
  { group: 'Overlays', name: 'Toast', value: '12px above whatever owns the bottom, inside the 20px inset; in 300ms (opacity, 8px, blur), out 150ms (opacity, blur); with an action stays 5s, paused under a finger, closable; role status', from: '9e, 9h, 9l call 4' },
  { group: 'Reading drawer', name: 'Heights', value: 'Bar 72 (12 + 52 + 8), Card 116, Post 600, Full = the viewport; the capsule never changes size', from: '6b, rounds 5t and 5u' },
  { group: 'Reading drawer', name: 'Fold', value: 'Continuous from page scroll: 24px tolerance, 64px travel, 300ms snap; moves on transform, the title folds by opacity and clip', from: '6b, 9l call 8' },
  { group: 'Motion', name: 'Curves', value: 'Interaction cubic-bezier(0.2, 0, 0, 1) for what the finger drives or toggles; travel cubic-bezier(0.32, 0.72, 0, 1) for what crosses the screen. No third curve', from: '4e, 7, 9l call 9' },
  { group: 'Motion', name: 'Durations', value: '150 feedback, 300 in, 150 to 200 out, 220 snap', from: '9l call 9' },
  { group: 'Motion', name: 'Press', value: 'scale(0.96), transition-property scale 150ms ease-out, tap highlight transparent, touch-action manipulation', from: '9l call 1 (0.92 in chapter 7 is withdrawn)' },
  { group: 'Motion', name: 'Icon swap', value: 'Toggles only (upvote, downvote, bookmark, the Save check): scale 0.25 to 1, blur 4 to 0, opacity, 300ms on the interaction curve. Tabs, back and menus instant', from: '9l call 2' },
  { group: 'Motion', name: 'Properties', value: 'transform, opacity, filter only; transition-property always named; reduced motion turns slides into fades, stops the parallax, keeps skeletons and the press', from: '9l calls 8 and 10' },
  { group: 'Motion', name: 'Push and pop', value: 'Leaf in from the right 300ms on travel, out on back; tab switch 150ms cross-fade; feature-detected, the cut is the fallback', from: '7' },
  { group: 'Gestures', name: 'Swipe', value: 'Axis lock after 10px; commit past 56px inside a 27° cone or 0.3px/ms past 32px; touch-action pan-y; segments only', from: '7, 4c' },
  { group: 'Gestures', name: 'Re-tap the lit root', value: 'Scroll to top; a second re-tap returns to the first segment', from: '5 (the Octal rule in chapter 7 is superseded)' },
  { group: 'Gestures', name: 'Haptics', value: 'One light impact on tab change, upvote, bookmark and a streak increment; wrapper work (step 4)', from: '7, 8' },
  { group: 'Type', name: 'Numbers, wrapping, inputs', value: 'tabular-nums on every changing number; text-wrap balance on titles and names, pretty on summaries and bodies; inputs stay at typo-body (17px) so iOS never zooms', from: '9l calls 6 and 7 (production inputs are already 17px)' },
  { group: 'Material', name: 'Floating material', value: 'blur-baseline surface (88%) over a 40px backdrop blur, hairline ring, 0 4px 30px 12% shadow; solid only under reduced transparency or when a WebView cannot blur', from: '3b, round 4i and 5w' },
  { group: 'Widths', name: 'Phone shell', value: 'Below 656px (tablet); 360px is the narrowest, nothing scales with width; landscape keeps the shell laid out for landscape', from: '9e, 9g' },
];
