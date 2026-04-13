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
  // ── Mount + tag reveal + feed visible state ──
  const [mounted, setMounted] = useState(false);
  const [tagsReady, setTagsReady] = useState(false);
  const [feedVisible, setFeedVisible] = useState(false);

  // ── Refs ──
  const heroRef = useRef<HTMLElement>(null);
  const prevBodyOverflowRef = useRef('');
  const scrollY = useRef(0);

  // ── Mount trigger ──
  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // ── Tag reveal timing ──
  useEffect(() => {
    if (!mounted) {
      return undefined;
    }
    let idleTimer: number | null = null;
    let revealTimer: ReturnType<typeof setTimeout> | null = null;

    const revealTags = () => {
      revealTimer = setTimeout(() => setTagsReady(true), 180);
    };

    if ('requestIdleCallback' in window) {
      idleTimer = window.requestIdleCallback(revealTags, { timeout: 1400 });
    } else {
      revealTimer = setTimeout(() => setTagsReady(true), 1200);
    }

    return () => {
      if (idleTimer !== null && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleTimer);
      }
      if (revealTimer !== null) {
        window.clearTimeout(revealTimer);
      }
    };
  }, [mounted]);

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

  // ── Feed article reveal + intersection observer ──
  useEffect(() => {
    if (!mounted) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setFeedVisible(true);
    }, 1400);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add('onb-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -40px 0px', threshold: 0.05 },
    );

    const observeFeedArticles = () => {
      document
        .querySelectorAll<HTMLElement>('.onb-feed-stage article')
        .forEach((article, i) => {
          if (!article.dataset.onbRevealDelay) {
            article.style.setProperty(
              '--reveal-delay',
              `${Math.min(i * 60, 400)}ms`,
            );
            // eslint-disable-next-line no-param-reassign
            article.dataset.onbRevealDelay = 'true';
          }

          if (article.classList.contains('onb-revealed')) {
            return;
          }

          observer.observe(article);
        });
    };

    observeFeedArticles();

    const mutationObserver = new MutationObserver((mutations) => {
      const hasNewArticles = mutations.some((mutation) =>
        Array.from(mutation.addedNodes).some(
          (node) =>
            node instanceof HTMLElement &&
            (node.tagName === 'ARTICLE' || node.querySelector('article')),
        ),
      );
      if (hasNewArticles) {
        observeFeedArticles();
      }
    });
    const feedContainer =
      document.querySelector('.onb-feed-stage') ?? document.body;
    mutationObserver.observe(feedContainer, {
      childList: true,
      subtree: true,
    });

    return () => {
      window.clearTimeout(timer);
      mutationObserver.disconnect();
      observer.disconnect();
    };
  }, [mounted]);

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
    tagsReady,
    feedVisible,
    heroRef,
    confettiParticles,
    isEdgeBrowser,
    extensionImages,
  };
}
