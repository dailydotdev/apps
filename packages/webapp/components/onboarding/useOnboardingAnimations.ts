import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BrowserName,
  getCurrentBrowserName,
} from '@dailydotdev/shared/src/lib/func';
import { cloudinaryOnboardingExtension } from '@dailydotdev/shared/src/lib/image';

import type { OnboardingStep } from './OnboardingV2';

const CONFETTI_COLORS = [
  'bg-accent-cabbage-default',
  'bg-accent-onion-default',
  'bg-accent-cheese-default',
  'bg-accent-water-default',
  'bg-accent-avocado-default',
  'bg-accent-bacon-default',
];

type ConfettiParticle = {
  id: string;
  left: string;
  delay: string;
  color: string;
  size: 'sm' | 'md' | 'lg' | 'xl';
  shape: 'rect' | 'circle' | 'star';
  drift: number;
  speed: number;
};

function buildConfettiParticles(): ConfettiParticle[] {
  const particles: ConfettiParticle[] = [];
  const SIZES = ['sm', 'md', 'lg', 'xl'] as const;
  const SHAPES = ['rect', 'circle', 'star'] as const;
  for (let i = 0; i < 24; i += 1) {
    const col = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    const opacity = 65 + Math.round(Math.random() * 30);
    particles.push({
      id: `cf-${i}`,
      left: `${1 + Math.random() * 98}%`,
      delay: `${Math.round(Math.random() * 2400)}ms`,
      color: `${col}/${opacity}`,
      size: SIZES[Math.floor(Math.random() * SIZES.length)],
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      drift: Math.round(-40 + Math.random() * 80),
      speed: +(3.5 + Math.random() * 2.5).toFixed(1),
    });
  }
  return particles;
}

export function useOnboardingAnimations(step: OnboardingStep) {
  // ── Mount state ──
  const [mounted, setMounted] = useState(false);

  // ── Refs ──
  const heroRef = useRef<HTMLElement>(null);
  const prevBodyOverflowRef = useRef('');
  const scrollY = useRef(0);

  // ── Mount trigger ──
  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // ── Body overflow management ──
  useEffect(() => {
    const isModalOpen = step !== 'hero' && step !== 'complete';

    if (isModalOpen) {
      prevBodyOverflowRef.current = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = prevBodyOverflowRef.current;
      prevBodyOverflowRef.current = '';
    }
    return () => {
      document.body.style.overflow = prevBodyOverflowRef.current;
      prevBodyOverflowRef.current = '';
    };
  }, [step]);

  // ── Parallax scroll ──
  useEffect(() => {
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (prefersReduced) {
      return undefined;
    }

    let ticking = false;
    const onScroll = () => {
      scrollY.current = window.scrollY;
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          const hero = heroRef.current;
          if (hero) {
            const y = scrollY.current;
            hero.style.setProperty('--scroll-y', `${y}`);
          }
          ticking = false;
        });
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── Hero visibility tracking ──
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        hero.classList.toggle('onb-hero-offscreen', !entry.isIntersecting);
      },
      { threshold: 0 },
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  // ── Browser detection ──
  const [detectedBrowser, setDetectedBrowser] = useState(BrowserName.Chrome);
  useEffect(() => {
    setDetectedBrowser(getCurrentBrowserName());
  }, []);
  const isEdgeBrowser = detectedBrowser === BrowserName.Edge;
  const extensionImages =
    cloudinaryOnboardingExtension[
      isEdgeBrowser ? BrowserName.Edge : BrowserName.Chrome
    ];

  // ── Confetti ──
  const confettiParticles = useMemo(
    () => (step === 'complete' ? buildConfettiParticles() : []),
    [step],
  );

  return {
    mounted,
    heroRef,
    confettiParticles,
    isEdgeBrowser,
    extensionImages,
  };
}
