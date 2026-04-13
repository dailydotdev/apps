import type { ReactElement } from 'react';
import React from 'react';

export const OnboardingV2Styles = (): ReactElement => (
  // eslint-disable-next-line react/no-unknown-property
  <style jsx global>{`
    .onb-feed-stage:not(.onb-feed-unlocked) article:nth-of-type(n + 19) {
      display: none !important;
    }
    .onb-feed-stage:not(.onb-feed-unlocked) article:nth-of-type(18) ~ div {
      display: none !important;
    }
    .onb-hero .onb-float-1,
    .onb-hero .onb-float-2,
    .onb-hero .onb-float-3 {
      transform: translateY(calc(var(--scroll-y) * -0.15px));
    }
    .onb-feed-stage > main[class*='utilities_feedPage'] {
      padding-top: 0 !important;
    }

    /* fade-out handled by .onb-revealed nth-of-type rules below */

    /* ─── HERO PARALLAX ─── */
    .onb-hero {
      --scroll-y: 0;
      contain: content;
    }

    /* ─── HERO RADIAL GLOW ─── */
    @keyframes onb-hero-radial-breathe {
      0%,
      100% {
        opacity: 0.9;
        transform: scale(1) translateY(0);
      }
      50% {
        opacity: 1;
        transform: scale(1.04) translateY(-2%);
      }
    }
    .onb-hero .onb-hero-radial {
      background: radial-gradient(
        ellipse 80% 55% at 50% 0%,
        rgba(255, 255, 255, 0.065) 0%,
        rgba(255, 255, 255, 0.035) 28%,
        rgba(255, 255, 255, 0.015) 48%,
        transparent 74%
      );
      animation: onb-hero-radial-breathe 12s ease-in-out infinite;
      will-change: opacity, transform;
      transform: translateY(calc(var(--scroll-y) * -0.05px));
    }

    .onb-hero .onb-dot-grid {
      transform: translateY(calc(var(--scroll-y) * 0.04px));
      opacity: calc(1 - var(--scroll-y) * 0.001);
    }

    /* ─── RISING TAG CLOUD ─── */
    @keyframes onb-tag-rise {
      0% {
        opacity: 0;
        transform: translate3d(0, 0, 0) scale(0.88);
      }
      6% {
        opacity: 0.6;
        transform: translate3d(calc(var(--tag-drift-x, 0px) * 0.1), -6vh, 0)
          scale(0.95);
      }
      40% {
        opacity: 0.45;
        transform: translate3d(calc(var(--tag-drift-x, 0px) * 0.55), -28vh, 0)
          scale(1);
      }
      75% {
        opacity: 0.15;
        transform: translate3d(calc(var(--tag-drift-x, 0px) * 0.85), -52vh, 0)
          scale(1.01);
      }
      100% {
        opacity: 0;
        transform: translate3d(var(--tag-drift-x, 0px), -70vh, 0) scale(1.02);
      }
    }
    .onb-rising-tag {
      opacity: 0;
      animation: onb-tag-rise var(--tag-duration, 14s) linear infinite;
      animation-delay: var(--tag-delay, 0s);
      contain: layout style;
      will-change: transform, opacity;
      transform: translateZ(0);
    }

    /* ─── SHIMMER ─── */
    .onb-shimmer {
      position: relative;
      overflow: hidden;
    }
    .onb-shimmer::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(255, 255, 255, 0.06) 50%,
        transparent 100%
      );
      animation: onb-shimmer 2.4s ease-in-out infinite;
    }
    @keyframes onb-shimmer {
      from {
        transform: translateX(-100%);
      }
      to {
        transform: translateX(100%);
      }
    }

    /* ─── RING ANIMATIONS ─── */
    @keyframes onb-ring-spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
    .onb-ring-spin {
      animation: onb-ring-spin 12s linear infinite;
    }
    .onb-ring-spin-reverse {
      animation: onb-ring-spin 18s linear infinite reverse;
    }

    @keyframes onb-ring-pulse {
      0%,
      100% {
        transform: scale(1);
        opacity: 0.6;
      }
      50% {
        transform: scale(1.1);
        opacity: 1;
      }
    }
    .onb-ring-pulse {
      animation: onb-ring-pulse 3s ease-in-out infinite;
    }

    /* ─── CTA GLOW ─── */
    @keyframes onb-cta-glow {
      0%,
      100% {
        opacity: 0.5;
      }
      50% {
        opacity: 1;
      }
    }
    .onb-feed-stage:not(.onb-feed-unlocked) article.onb-revealed {
      opacity: 1 !important;
      transform: translateY(0) scale(1) !important;
    }
    .onb-feed-stage:not(.onb-feed-unlocked) article.onb-revealed:hover {
      transform: translateY(0) scale(1) !important;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25),
        0 0 0 1px rgba(255, 255, 255, 0.03) !important;
      border-color: rgba(255, 255, 255, 0.06) !important;
    }

    /* ─── CHIP POP ─── */
    @keyframes onb-chip-pop {
      0% {
        transform: scale(0.6);
        opacity: 0;
      }
      60% {
        transform: scale(1.08);
        opacity: 1;
      }
      100% {
        transform: scale(1);
        opacity: 1;
      }
    }
    .onb-chip-enter {
      animation: onb-chip-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both;
    }

    /* ─── FLOATING PARTICLES ─── */
    @keyframes onb-float-1 {
      0%,
      100% {
        transform: translate(0, 0) scale(1);
        opacity: 0.3;
      }
      25% {
        transform: translate(12px, -18px) scale(1.2);
        opacity: 0.6;
      }
      50% {
        transform: translate(-8px, -30px) scale(0.9);
        opacity: 0.4;
      }
      75% {
        transform: translate(16px, -12px) scale(1.1);
        opacity: 0.5;
      }
    }
    @keyframes onb-float-2 {
      0%,
      100% {
        transform: translate(0, 0) scale(1);
        opacity: 0.2;
      }
      33% {
        transform: translate(-16px, -22px) scale(1.3);
        opacity: 0.5;
      }
      66% {
        transform: translate(10px, -35px) scale(0.8);
        opacity: 0.3;
      }
    }
    @keyframes onb-float-3 {
      0%,
      100% {
        transform: translate(0, 0) scale(1);
        opacity: 0.25;
      }
      40% {
        transform: translate(20px, -14px) scale(1.15);
        opacity: 0.55;
      }
      80% {
        transform: translate(-12px, -28px) scale(0.85);
        opacity: 0.2;
      }
    }
    .onb-float-1 {
      animation: onb-float-1 14s ease-in-out infinite;
    }
    .onb-float-2 {
      animation: onb-float-2 18s ease-in-out infinite;
    }
    .onb-float-3 {
      animation: onb-float-3 22s ease-in-out infinite;
    }

    /* ─── GRADIENT TEXT SHIMMER ─── */
    @keyframes onb-gradient-shift {
      0% {
        background-position: 0% 50%;
      }
      50% {
        background-position: 100% 50%;
      }
      100% {
        background-position: 0% 50%;
      }
    }
    .onb-gradient-text {
      background-image: linear-gradient(
        90deg,
        var(--theme-accent-cabbage-default) 0%,
        var(--theme-accent-onion-default) 30%,
        var(--theme-accent-water-default) 60%,
        var(--theme-accent-cabbage-default) 100%
      );
      background-size: 200% auto;
      animation: onb-gradient-shift 10s ease-in-out infinite;
    }

    /* ─── BUTTON SHINE SWEEP ─── */
    .onb-btn-shine::after {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 50%;
      height: 100%;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.15),
        transparent
      );
      transition: left 0.6s ease;
    }
    .onb-btn-shine:hover::after {
      left: 120%;
    }

    /* ─── BUTTON GLOW BREATHING ─── */
    @keyframes onb-btn-breathe {
      0%,
      100% {
        opacity: 0.4;
        transform: scale(1);
      }
      50% {
        opacity: 0.7;
        transform: scale(1.05);
      }
    }
    .onb-btn-glow {
      animation: onb-btn-breathe 3s ease-in-out infinite;
    }

    /* ─── GITHUB IMPORT FLOW ─── */

    /* Orb: breathing glow behind the icon */
    @keyframes ghub-orb-breathe {
      0%,
      100% {
        transform: scale(1);
        opacity: 0.4;
      }
      50% {
        transform: scale(1.3);
        opacity: 0.75;
      }
    }
    .ghub-orb-glow {
      animation: ghub-orb-breathe 2.6s ease-in-out infinite;
    }

    /* Rings that rotate around the orb */
    @keyframes ghub-ring-spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
    .ghub-ring {
      animation: ghub-ring-spin 8s linear infinite;
    }
    .ghub-ring-reverse {
      animation: ghub-ring-spin 12s linear infinite reverse;
    }
    .onb-ring-slow {
      animation: ghub-ring-spin 18s linear infinite;
    }

    /* Particles that fly toward the orb center */
    @keyframes ghub-particle-in {
      0% {
        transform: translate(var(--px), var(--py)) scale(0.8);
        opacity: 0;
      }
      20% {
        opacity: 0.9;
      }
      80% {
        opacity: 0.6;
      }
      100% {
        transform: translate(0, 0) scale(0);
        opacity: 0;
      }
    }
    .ghub-particle {
      animation: ghub-particle-in var(--dur) ease-in infinite;
      animation-delay: var(--delay);
    }

    /* Step checklist fade-in */
    @keyframes ghub-step-in {
      from {
        transform: translateY(0.375rem);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
    .ghub-step-reveal {
      animation: ghub-step-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
    }

    .ghub-orb-paused {
      animation-play-state: paused !important;
    }
    @keyframes ghub-question-pulse {
      0%,
      100% {
        transform: scale(1);
        opacity: 0.9;
      }
      50% {
        transform: scale(1.06);
        opacity: 1;
      }
    }
    .ghub-question-pulse {
      animation: ghub-question-pulse 1.8s ease-in-out infinite;
    }

    /* Confetti for completion */
    @keyframes ghub-confetti {
      0% {
        transform: translateY(-0.625rem) rotate(0deg);
        opacity: 0;
      }
      15% {
        opacity: 1;
      }
      100% {
        transform: translateY(4rem) rotate(260deg);
        opacity: 0;
      }
    }
    .ghub-confetti {
      animation: ghub-confetti 1.6s ease-out infinite;
    }

    /* ─── FEED READY CELEBRATIONS ─── */
    @keyframes onb-confetti-fall {
      0% {
        transform: translateY(0) translateX(0) rotate(0deg) scale(1);
        opacity: 0;
      }
      5% {
        opacity: 1;
      }
      25% {
        opacity: 0.95;
      }
      75% {
        opacity: 0.7;
      }
      100% {
        transform: translateY(110vh) translateX(var(--confetti-drift, 0px))
          rotate(960deg) scale(0.2);
        opacity: 0;
      }
    }
    .onb-confetti-piece {
      animation: onb-confetti-fall 4s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
      filter: brightness(1.2);
    }
    .onb-confetti-star {
      clip-path: polygon(
        50% 0%,
        61% 35%,
        98% 35%,
        68% 57%,
        79% 91%,
        50% 70%,
        21% 91%,
        32% 57%,
        2% 35%,
        39% 35%
      );
    }
    @keyframes onb-confetti-stage-fade {
      0%,
      85% {
        opacity: 1;
      }
      100% {
        opacity: 0;
      }
    }
    .onb-confetti-stage {
      animation: onb-confetti-stage-fade 6s ease-out forwards;
    }

    @keyframes onb-ready-burst {
      0% {
        transform: translate(-50%, -33%) scale(0.4);
        opacity: 0;
      }
      20% {
        opacity: 1;
      }
      60% {
        opacity: 0.6;
      }
      100% {
        transform: translate(-50%, -33%) scale(1.2);
        opacity: 0;
      }
    }
    .onb-ready-burst {
      animation: onb-ready-burst 2.5s ease-out forwards;
    }

    @keyframes onb-ready-reveal {
      0% {
        transform: translateY(16px);
        opacity: 0;
      }
      100% {
        transform: translateY(0);
        opacity: 1;
      }
    }
    .onb-ready-reveal {
      opacity: 0;
      animation: onb-ready-reveal 0.6s ease-out forwards;
    }

    @keyframes onb-celebration-sparkle {
      0% {
        transform: scale(0) rotate(0deg);
        opacity: 0;
      }
      30% {
        transform: scale(1.2) rotate(90deg);
        opacity: 1;
      }
      100% {
        transform: scale(0) rotate(180deg);
        opacity: 0;
      }
    }
    .onb-sparkle {
      animation: onb-celebration-sparkle 1.2s ease-out forwards;
    }

    .onb-feed-unlocked article {
      opacity: 1 !important;
      transform: none !important;
      pointer-events: auto !important;
    }

    /* ─── AI PROCESSING ORB ─── */
    @keyframes onb-ai-orb-breathe {
      0%,
      100% {
        transform: scale(1);
        opacity: 0.3;
      }
      50% {
        transform: scale(1.35);
        opacity: 0.6;
      }
    }
    .onb-ai-orb-glow {
      animation: onb-ai-orb-breathe 2.5s ease-in-out infinite;
    }
    @keyframes onb-ai-ring-spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
    .onb-ai-ring {
      animation: onb-ai-ring-spin 10s linear infinite;
    }
    .onb-ai-ring-reverse {
      animation: onb-ai-ring-spin 7s linear infinite reverse;
    }

    /* ─── AI ICON GLOW ─── */
    @keyframes onb-ai-shimmer {
      0%,
      100% {
        box-shadow: 0 0 8px
            color-mix(
              in srgb,
              var(--theme-accent-onion-default) 15%,
              transparent
            ),
          0 0 20px
            color-mix(
              in srgb,
              var(--theme-accent-onion-default) 5%,
              transparent
            );
      }
      50% {
        box-shadow: 0 0 14px
            color-mix(
              in srgb,
              var(--theme-accent-onion-default) 25%,
              transparent
            ),
          0 0 32px
            color-mix(
              in srgb,
              var(--theme-accent-onion-default) 10%,
              transparent
            );
      }
    }
    .onb-ai-icon-glow {
      animation: onb-ai-shimmer 3s ease-in-out infinite;
    }

    /* ─── MODAL EXIT ─── */
    @keyframes onb-modal-out {
      from {
        transform: scale(1) translateY(0);
        opacity: 1;
      }
      to {
        transform: scale(0.92) translateY(16px);
        opacity: 0;
      }
    }
    .onb-modal-exit {
      animation: onb-modal-out 0.35s cubic-bezier(0.4, 0, 1, 1) forwards;
    }
    @keyframes onb-modal-backdrop-out {
      from {
        opacity: 1;
      }
      to {
        opacity: 0;
      }
    }
    .onb-modal-backdrop-exit {
      animation: onb-modal-backdrop-out 0.3s ease-in forwards;
    }

    /* ─── EXTENSION PROMO ─── */
    @keyframes onb-ext-enter {
      from {
        transform: scale(0.94) translateY(20px);
        opacity: 0;
      }
      to {
        transform: scale(1) translateY(0);
        opacity: 1;
      }
    }
    .onb-ext-enter {
      animation: onb-ext-enter 0.45s cubic-bezier(0.16, 1, 0.3, 1) both;
    }

    @keyframes onb-ext-reveal {
      from {
        transform: translateY(10px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
    .onb-ext-reveal {
      opacity: 0;
      animation: onb-ext-reveal 0.4s ease-out forwards;
    }

    @keyframes onb-ext-float {
      0%,
      100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-8px);
      }
    }
    .onb-ext-float {
      animation: onb-ext-float 5s ease-in-out infinite;
    }

    @keyframes onb-cta-shimmer {
      0% {
        transform: translateX(-130%) skewX(-20deg);
      }
      100% {
        transform: translateX(230%) skewX(-20deg);
      }
    }
    .onb-cta-shimmer {
      position: relative;
      overflow: hidden;
    }
    .onb-cta-shimmer::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(255, 255, 255, 0.18) 50%,
        transparent 100%
      );
      animation: onb-cta-shimmer 3.5s ease-in-out infinite;
      animation-delay: 1.2s;
      pointer-events: none;
    }

    @keyframes onb-accent-draw {
      from {
        transform: scaleX(0);
        opacity: 0;
      }
      to {
        transform: scaleX(1);
        opacity: 1;
      }
    }
    .onb-accent-draw {
      transform-origin: center;
      animation: onb-accent-draw 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both;
    }

    /* ─── PANEL FADE: progressive blur + dark overlay ─── */
    .onb-panel-fade {
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      mask-image: linear-gradient(
        to bottom,
        transparent 0%,
        rgba(0, 0, 0, 0.55) 10%,
        rgba(0, 0, 0, 0.9) 25%,
        black 40%
      );
      -webkit-mask-image: linear-gradient(
        to bottom,
        transparent 0%,
        rgba(0, 0, 0, 0.55) 10%,
        rgba(0, 0, 0, 0.9) 25%,
        black 40%
      );
    }
    .onb-feed-stage {
      content-visibility: auto;
      contain-intrinsic-size: 1px 1800px;
      contain: content;
    }
    /* ─── GLASSMORPHISM ─── */
    .onb-glass {
      background: rgba(255, 255, 255, 0.02);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      transition: background 0.35s ease, border-color 0.35s ease,
        box-shadow 0.35s ease;
    }
    .onb-glass:hover {
      background: rgba(255, 255, 255, 0.04);
      border-color: rgba(255, 255, 255, 0.1);
      box-shadow: 0 4px 32px rgba(0, 0, 0, 0.15),
        0 0 0 1px rgba(255, 255, 255, 0.04);
    }

    /* ─── CURSOR-TRACKING GLOW ─── */
    .onb-cursor-glow {
      --mouse-x: 50%;
      --mouse-y: 50%;
      position: relative;
    }
    .onb-cursor-glow::before {
      content: '';
      position: absolute;
      width: 320px;
      height: 320px;
      left: var(--mouse-x);
      top: var(--mouse-y);
      transform: translate(-50%, -50%);
      background: radial-gradient(
        circle,
        color-mix(in srgb, var(--theme-accent-onion-default) 6%, transparent) 0%,
        transparent 70%
      );
      border-radius: 50%;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.4s ease;
      z-index: 0;
    }
    .onb-cursor-glow:hover::before {
      opacity: 1;
    }

    .onb-eng-active-upvote,
    .onb-eng-active-upvote svg,
    .onb-eng-active-upvote span {
      color: var(--theme-actions-upvote-default) !important;
    }
    .onb-eng-active-comment,
    .onb-eng-active-comment svg,
    .onb-eng-active-comment span {
      color: var(--theme-actions-comment-default) !important;
    }

    .onb-eng-pulse {
      animation: onb-eng-pulse-anim 0.35s
        cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    @keyframes onb-eng-pulse-anim {
      0% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.2);
      }
      100% {
        transform: scale(1);
      }
    }

    .onb-eng-pos-relative {
      position: relative;
    }
    .onb-eng-floater-anchor {
      position: relative;
    }
    .onb-eng-floater {
      position: absolute;
      font-size: 0.6875rem;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
      pointer-events: none;
      z-index: 1;
      animation: onb-eng-float-anim 1.8s linear forwards;
      will-change: transform, opacity;
      transform: translateZ(0);
    }
    @keyframes onb-eng-float-anim {
      0% {
        transform: translateY(2px) scale(0.7);
        opacity: 0;
      }
      12% {
        transform: translateY(-2px) scale(1.05);
        opacity: 1;
      }
      35% {
        transform: translateY(-8px) scale(1);
        opacity: 0.9;
      }
      75% {
        transform: translateY(-18px);
        opacity: 0.4;
      }
      100% {
        transform: translateY(-26px) scale(0.95);
        opacity: 0;
      }
    }

    /* ─── MODAL CHECKLIST STAGGER ─── */
    @keyframes onb-check-in {
      from {
        transform: translateX(-8px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    .onb-check-item {
      animation: onb-check-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;
    }

    /* ─── MODAL ENTRANCE ─── */
    @keyframes onb-modal-in {
      from {
        transform: scale(0.92) translateY(16px);
        opacity: 0;
      }
      to {
        transform: scale(1) translateY(0);
        opacity: 1;
      }
    }
    .onb-modal-enter {
      animation: onb-modal-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
    }
    @keyframes onb-modal-backdrop-in {
      from {
        opacity: 0;
        backdrop-filter: blur(0);
      }
      to {
        opacity: 1;
        backdrop-filter: blur(12px);
      }
    }
    .onb-modal-backdrop {
      animation: onb-modal-backdrop-in 0.3s ease-out both;
      contain: content;
    }
    .onb-modal-enter.onb-glass {
      background: rgba(10, 12, 16, 0.9);
      border-color: rgba(255, 255, 255, 0.14);
      box-shadow: 0 28px 90px rgba(0, 0, 0, 0.62);
    }

    /* ─── FEED ARTICLE SCROLL-REVEAL ─── */
    .onb-feed-stage:not(.onb-feed-unlocked) article {
      opacity: 0;
      transform: translateY(0.75rem) scale(0.995);
      transition: opacity 0.38s cubic-bezier(0.16, 1, 0.3, 1),
        transform 0.38s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease,
        border-color 0.25s ease !important;
      transition-delay: var(--reveal-delay, 0ms);
    }

    /* ─── FEED FADE-OUT GRADIENT (bottom of visible articles) ─── */
    .onb-feed-stage:not(.onb-feed-unlocked)
      article:nth-of-type(13).onb-revealed {
      opacity: 0.88 !important;
    }
    .onb-feed-stage:not(.onb-feed-unlocked)
      article:nth-of-type(14).onb-revealed {
      opacity: 0.72 !important;
    }
    .onb-feed-stage:not(.onb-feed-unlocked)
      article:nth-of-type(15).onb-revealed {
      opacity: 0.52 !important;
    }
    .onb-feed-stage:not(.onb-feed-unlocked)
      article:nth-of-type(16).onb-revealed {
      opacity: 0.32 !important;
    }
    .onb-feed-stage:not(.onb-feed-unlocked)
      article:nth-of-type(17).onb-revealed {
      opacity: 0.15 !important;
    }
    .onb-feed-stage:not(.onb-feed-unlocked)
      article:nth-of-type(18).onb-revealed {
      opacity: 0.05 !important;
    }

    @media (max-width: 63.9375rem) {
      .onb-feed-stage:not(.onb-feed-unlocked) article:nth-of-type(n + 11) {
        display: none !important;
      }
      .onb-feed-stage:not(.onb-feed-unlocked) article:nth-of-type(10) ~ div {
        display: none !important;
      }

      .onb-feed-stage:not(.onb-feed-unlocked) article.onb-revealed:hover {
        box-shadow: none !important;
      }

      .onb-feed-stage:not(.onb-feed-unlocked)
        article:nth-of-type(7).onb-revealed {
        opacity: 0.88 !important;
      }
      .onb-feed-stage:not(.onb-feed-unlocked)
        article:nth-of-type(8).onb-revealed {
        opacity: 0.65 !important;
      }
      .onb-feed-stage:not(.onb-feed-unlocked)
        article:nth-of-type(9).onb-revealed {
        opacity: 0.38 !important;
      }
      .onb-feed-stage:not(.onb-feed-unlocked)
        article:nth-of-type(10).onb-revealed {
        opacity: 0.12 !important;
      }
    }

    /* ─── TOPIC PILLS (no interaction) ─── */
    .onb-marquee span {
      pointer-events: none;
    }

    /* ─── SCROLL PROGRESS LINE ─── */
    @keyframes onb-progress-glow {
      0%,
      100% {
        box-shadow: 0 0 6px 1px
          color-mix(in srgb, var(--theme-accent-onion-default) 30%, transparent);
      }
      50% {
        box-shadow: 0 0 12px 2px
          color-mix(in srgb, var(--theme-accent-onion-default) 50%, transparent);
      }
    }

    /* mobile rising tags already handled by .onb-rising-tag */

    /* ─── MOBILE MODAL SLIDE-UP ─── */
    @keyframes onb-modal-slide-up {
      from {
        transform: translateY(100%);
      }
      to {
        transform: translateY(0);
      }
    }
    @keyframes onb-modal-slide-down {
      from {
        transform: translateY(0);
      }
      to {
        transform: translateY(100%);
      }
    }
    @media (max-width: 655px) {
      .onb-modal-enter,
      .onb-ext-enter {
        animation: onb-modal-slide-up 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;
      }
      .onb-modal-exit {
        animation: onb-modal-slide-down 0.3s cubic-bezier(0.4, 0, 1, 1) forwards;
      }
    }
    @media (max-width: 63.9375rem) {
      .onb-panel-fade {
        backdrop-filter: none;
        -webkit-backdrop-filter: none;
      }
    }

    /* ─── OFF-SCREEN ANIMATION PAUSING ─── */
    .onb-hero-offscreen .onb-rising-tag,
    .onb-hero-offscreen .onb-hero-radial,
    .onb-hero-offscreen .onb-float-1,
    .onb-hero-offscreen .onb-float-2,
    .onb-hero-offscreen .onb-float-3,
    .onb-hero-offscreen .onb-gradient-text,
    .onb-hero-offscreen .onb-btn-glow {
      animation-play-state: paused !important;
    }
    .onb-hero-offscreen .onb-hero-radial,
    .onb-hero-offscreen .onb-rising-tag {
      will-change: auto !important;
    }

    .onb-panel-hidden .ghub-orb-glow,
    .onb-panel-hidden .ghub-ring,
    .onb-panel-hidden .ghub-ring-reverse,
    .onb-panel-hidden .onb-ring-slow,
    .onb-panel-hidden .ghub-particle,
    .onb-panel-hidden .onb-ai-orb-glow,
    .onb-panel-hidden .onb-ai-ring,
    .onb-panel-hidden .onb-ai-ring-reverse,
    .onb-panel-hidden .onb-btn-glow {
      animation-play-state: paused !important;
    }

    /* ─── CSS CONTAINMENT FOR ANIMATION CONTAINERS ─── */
    .onb-hero .onb-float-1,
    .onb-hero .onb-float-2,
    .onb-hero .onb-float-3,
    .ghub-particle,
    .onb-confetti-piece {
      contain: layout style;
    }

    /* ─── REDUCED MOTION ─── */
    @media (prefers-reduced-motion: reduce) {
      .onb-marquee,
      .onb-shimmer::after,
      .onb-chip-enter,
      .onb-ring-spin,
      .onb-ring-spin-reverse,
      .onb-ring-pulse,
      .onb-float-1,
      .onb-float-2,
      .onb-float-3,
      .onb-gradient-text,
      .onb-hero-radial,
      .onb-btn-glow,
      .onb-modal-enter,
      .onb-modal-exit,
      .onb-modal-backdrop,
      .onb-modal-backdrop-exit,
      .ghub-orb-glow,
      .ghub-ring,
      .ghub-ring-reverse,
      .ghub-particle,
      .ghub-confetti,
      .onb-confetti-piece,
      .onb-confetti-stage,
      .onb-ready-burst,
      .onb-ready-reveal,
      .onb-ai-orb-glow,
      .onb-ai-ring,
      .onb-ai-ring-reverse,
      .onb-ai-icon-glow,
      .onb-ring-slow,
      .onb-ext-enter,
      .onb-ext-reveal,
      .onb-sparkle,
      .onb-confetti-star,
      .onb-eng-pulse,
      .onb-eng-floater,
      .onb-rising-tag {
        animation: none !important;
        opacity: 1 !important;
      }
      .onb-btn-shine::after,
      .onb-cursor-glow::before {
        display: none;
      }
      .onb-feed-stage article {
        opacity: 1 !important;
        transform: none !important;
        transition: none !important;
      }
    }
  `}</style>
);
