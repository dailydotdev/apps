export const HERO_STYLES = `.onb-bg {
  background:
    radial-gradient(ellipse 65% 50% at 15% 18%,
      color-mix(in srgb, var(--theme-accent-cabbage-default) 8%, transparent) 0%,
      transparent 65%),
    radial-gradient(ellipse 55% 45% at 88% 32%,
      color-mix(in srgb, var(--theme-accent-water-default) 7%, transparent) 0%,
      transparent 70%),
    var(--theme-background-default);
}
.onb-orb {
  position: absolute;
  border-radius: 9999px;
  filter: blur(110px);
  mix-blend-mode: screen;
  pointer-events: none;
  opacity: 0.55;
  animation: onb-breathe 22s ease-in-out infinite;
}
.onb-orb--delay { animation-delay: -8s; }
@keyframes onb-breathe {
  0%, 100% { opacity: 0.48; }
  50% { opacity: 0.68; }
}
@media (prefers-reduced-motion: reduce) {
  .onb-orb { animation: none; opacity: 0.55; }
}
.onb-form-halo {
  background:
    radial-gradient(
      ellipse 78% 55% at 50% 92%,
      rgba(0, 0, 0, 1) 0%,
      rgba(0, 0, 0, 0.98) 20%,
      rgba(0, 0, 0, 0.9) 36%,
      rgba(0, 0, 0, 0.7) 52%,
      rgba(0, 0, 0, 0.4) 68%,
      rgba(0, 0, 0, 0.15) 82%,
      transparent 94%
    );
}
.onb-center-halo {
  background:
    radial-gradient(
      ellipse 55% 36% at 50% 54%,
      rgba(0, 0, 0, 0.96) 0%,
      rgba(0, 0, 0, 0.88) 22%,
      rgba(0, 0, 0, 0.68) 42%,
      rgba(0, 0, 0, 0.42) 60%,
      rgba(0, 0, 0, 0.18) 76%,
      transparent 92%
    );
}
.onb-bottom-vignette {
  background: linear-gradient(
    to bottom,
    transparent 0%,
    transparent 32%,
    rgba(0, 0, 0, 0.45) 56%,
    rgba(0, 0, 0, 0.85) 78%,
    rgba(0, 0, 0, 1) 100%
  );
}
.onb-top-fade {
  background: linear-gradient(
    to bottom,
    rgba(8, 8, 12, 0.55) 0%,
    rgba(8, 8, 12, 0.12) 28%,
    transparent 44%
  );
}
.onb-headline { text-shadow: 0 2px 32px rgba(0, 0, 0, 0.95), 0 0 64px rgba(0, 0, 0, 0.6); }
.onb-grid-mask {
  -webkit-mask-image:
    radial-gradient(
      ellipse 78% 58% at 50% 95%,
      transparent 0%,
      transparent 16%,
      rgba(0, 0, 0, 0.45) 36%,
      rgba(0, 0, 0, 0.95) 62%,
      black 100%
    );
  mask-image:
    radial-gradient(
      ellipse 78% 58% at 50% 95%,
      transparent 0%,
      transparent 16%,
      rgba(0, 0, 0, 0.45) 36%,
      rgba(0, 0, 0, 0.95) 62%,
      black 100%
    );
}
.onb-cover-shade {
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0) 60%,
    rgba(0, 0, 0, 0.35) 100%
  );
}
.onb-split-grid-mask {
  -webkit-mask-image:
    linear-gradient(
      to right,
      black 0%,
      black 55%,
      rgba(0, 0, 0, 0.75) 78%,
      transparent 100%
    );
  mask-image:
    linear-gradient(
      to right,
      black 0%,
      black 55%,
      rgba(0, 0, 0, 0.75) 78%,
      transparent 100%
    );
}
.onb-split-left-fade {
  background:
    linear-gradient(
      to right,
      transparent 0%,
      rgba(0, 0, 0, 0.25) 55%,
      rgba(0, 0, 0, 0.72) 82%,
      rgba(8, 8, 12, 1) 100%
    );
}
.onb-split-left-water-glow {
  background:
    radial-gradient(
      ellipse 85% 65% at 18% 100%,
      color-mix(in srgb, var(--theme-accent-water-default) 14%, transparent) 0%,
      color-mix(in srgb, var(--theme-accent-water-default) 5%, transparent) 42%,
      transparent 72%
    );
}
.onb-bg-split {
  background: var(--theme-background-default);
}
.onb-split-right-panel {
  background: var(--theme-background-default);
}

/* --- signup wall: panel background --- */

/* Stacked, the form is bottom-anchored like the cards/desk walls; the split
   layout centres it in its column instead. */
.onb-hero-main { justify-content: flex-end; }
@media (min-width: 1020px) {
  .onb-hero-main { justify-content: center; }
}

/* Compact phones. A 50dvh artwork band leaves too little room for the form on a
   short viewport, so it gives height back and the type tightens with it. Keyed
   on height rather than width because that is the axis under pressure — a
   375x812 phone gets the roomy treatment, a 375x667 one does not. */
.onb-art-half { height: 50dvh; }
@media (max-height: 759px) {
  .onb-art-half { height: 32dvh; }
  .onb-hero-logo svg { height: 1.375rem; }
  .onb-hero-headline { font-size: 1.5rem; line-height: 1.875rem; }
  .onb-hero-column { gap: 1rem; }
  .onb-split-cta { margin-bottom: 0.5rem; }
  .onb-split-login { margin-top: 0.25rem; font-size: 0.8125rem; }
}

/* Reaches full background by 88% rather than 100%: on short screens the form
   starts high enough that the last stretch of the ramp sits behind the logo,
   and a still-visible image there reads as clutter. */
.onb-art-fade {
  background: linear-gradient(
    to bottom,
    transparent 0%,
    color-mix(in srgb, var(--theme-background-default) 45%, transparent) 38%,
    color-mix(in srgb, var(--theme-background-default) 90%, transparent) 68%,
    var(--theme-background-default) 88%
  );
}
/* Smoked glass: a dark tint rather than the usual white one, so the card reads
   as a panel resting on the artwork instead of a bright patch cut out of it.
   The white hairline and inset highlight stay — they are what keep it glassy. */
.onb-glass-card {
  background: rgba(10, 12, 18, 0.32);
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(16px) saturate(140%);
  -webkit-backdrop-filter: blur(16px) saturate(140%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    0 8px 24px rgba(0, 0, 0, 0.4);
}
.onb-panel-frame {
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: color-mix(in srgb, var(--theme-accent-cabbage-default) 6%, transparent);
  /* small and soft, and on the theme-aware shadow tokens so light mode gets the
     salt-based shadow instead of a heavy black one. The colour around the panel
     comes from .onb-ambilight, not from here. */
  box-shadow:
    0 8px 24px -10px var(--theme-shadow-shadow1),
    0 2px 6px -2px var(--theme-shadow-shadow1);
}

/* Ambilight — the artwork itself, blurred and over-saturated behind the panel,
   so the halo is literally the image's own colours bleeding out of the frame
   (the TV backlight / YouTube ambient-mode trick). */
.onb-ambilight {
  filter: blur(28px) saturate(1.5);
  opacity: 0.3;
  animation: onb-ambilight-breathe 14s ease-in-out infinite;
}
@keyframes onb-ambilight-breathe {
  0%, 100% { opacity: 0.24; transform: scale(1); }
  50% { opacity: 0.36; transform: scale(1.02); }
}
@media (prefers-reduced-motion: reduce) {
  .onb-ambilight { animation: none; opacity: 0.3; }
}
`;
