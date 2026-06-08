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
`;
