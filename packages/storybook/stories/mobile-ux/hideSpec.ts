// The hide-on-scroll rules for the phone shell (chapter 4e). Benchmarks and
// guidance land in hideResearch.ts once verified.

export const hideRules: [string, string][] = [
  ['Direction, not position', 'Scrolling down (reading on) hides the top chrome; any short scroll up brings it back, anywhere in the page. The top of the page is not the trigger; the finger’s direction is.'],
  ['One unit at the top', 'On a root the brand row and the page’s row (segments or chips) move as one block: they slide up together and come back together. Nothing is left half visible.'],
  ['The finger drives it', 'The block scrubs 1:1 with the scroll over its own height (92px on Home), so a slow scroll shows it leaving; a fast flick hides it at once. At the end of a scroll (300ms of stillness) it snaps to fully shown or fully hidden, whichever is nearer, in 180ms.'],
  ['Tolerances', '24px of downward movement before hiding starts (a nudge while reading does not take the chrome away); 8px of upward movement to start revealing (the reveal is eager, as on X). Numbers are in hideSpec and tuned in the demos.'],
  ['A dead zone at the top', 'Within the first 96px of the page the chrome is always fully shown, so a bounce or a small scroll near the top never hides it and it is always there when you land.'],
  ['Leaves keep their buttons', 'On a leaf the pinned segments hide with the scroll like a root’s row, but the floating back and action buttons stay: they are 38px, they float on the soft edge, and back is the way out. X’s variant, where they go too, is on the page as an arm.'],
  ['The bottom cluster keeps the decided shrink', 'It shrinks and pulls in on the same progress (chapter 3b) and grows back on scroll up. Hiding it entirely is mocked as an arm; Instagram, X and YouTube all keep the bottom bar.'],
  ['Content never jumps', 'The chrome is an overlay; the content keeps a constant top padding and simply passes under the chrome as it leaves, so hiding never reflows the feed.'],
  ['Reveal on intent, too', 'Tapping the status bar (native scroll-to-top) shows the chrome; opening the keyboard, a sheet or pull-to-refresh shows it; reduced motion swaps the slide for a 150ms fade with the same triggers.'],
];

export const hideLevers: [string, string, string][] = [
  ['Top block on roots', 'Hides (brand row + segments or chips)', 'X, Instagram home, YouTube, Threads'],
  ['Title and buttons on leaves', 'Stay; segments hide', 'Safari (small controls stay), X profile keeps its collapsed header'],
  ['Bottom cluster', 'Shrinks (decided); hide was set aside', 'Instagram, X, YouTube keep the bottom bar; iOS 26 minimises the tab bar'],
  ['Explore field', 'Stays compact at the bottom (decided in 3c)', 'iOS 26 search tab minimises with the bar'],
  ['Post page', 'Already decided in chapter 6: tab bar slides out, action bar shrinks', 'Medium, Substack hide top chrome on articles'],
];
