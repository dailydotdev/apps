import type { ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';
import { motion } from 'framer-motion';

interface DailyDjinnFigureProps {
  compact?: boolean;
  className?: string;
}

const PUPIL_TRAVEL_X = 16;
const PUPIL_TRAVEL_Y = 4;

export const DailyDjinnFigure = ({
  compact = false,
  className,
}: DailyDjinnFigureProps): ReactElement => {
  const leftEyeRef = useRef<HTMLDivElement>(null);
  const rightEyeRef = useRef<HTMLDivElement>(null);
  const leftPupilRef = useRef<HTMLDivElement>(null);
  const rightPupilRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    const noHover = window.matchMedia('(hover: none)').matches;
    if (reducedMotion || noHover) {
      return undefined;
    }

    let mouseX = 0;
    let mouseY = 0;
    let frame = 0;
    let hasPointer = false;

    const trackPupil = (
      eyeRef: React.RefObject<HTMLDivElement>,
      pupilRef: React.RefObject<HTMLDivElement>,
    ) => {
      const eye = eyeRef.current;
      const pupil = pupilRef.current;
      if (!eye || !pupil) {
        return;
      }
      const rect = eye.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = mouseX - cx;
      const dy = mouseY - cy;
      const normX = dx / PUPIL_TRAVEL_X;
      const normY = dy / PUPIL_TRAVEL_Y;
      const r = Math.hypot(normX, normY);
      const scale = r === 0 ? 0 : Math.min(1, 1 / r);
      pupil.style.transform = `translate3d(${dx * scale}px, ${
        dy * scale
      }px, 0)`;
    };

    const tick = () => {
      frame = 0;
      if (!hasPointer) {
        return;
      }
      trackPupil(leftEyeRef, leftPupilRef);
      trackPupil(rightEyeRef, rightPupilRef);
    };

    const handleMove = (event: MouseEvent) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      hasPointer = true;
      if (frame === 0) {
        frame = window.requestAnimationFrame(tick);
      }
    };

    const handleLeave = () => {
      hasPointer = false;
      if (leftPupilRef.current) {
        leftPupilRef.current.style.transform = '';
      }
      if (rightPupilRef.current) {
        rightPupilRef.current.style.transform = '';
      }
    };

    document.addEventListener('mousemove', handleMove, { passive: true });
    document.addEventListener('mouseleave', handleLeave);

    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseleave', handleLeave);
      if (frame !== 0) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, []);

  return (
    <motion.div
      layout
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={classNames(
        'djinn-figure relative flex w-full shrink-0 items-center justify-center',
        compact
          ? 'h-[18rem] max-w-[22rem] laptop:h-[24rem] laptop:max-w-[24rem]'
          : 'h-[20rem] max-w-[36rem] laptop:h-[26rem]',
        className,
      )}
    >
      <div
        aria-hidden
        className={classNames(
          'djinn-smoke-wrap pointer-events-none absolute',
          compact
            ? '-inset-x-12 -inset-y-10 laptop:-inset-x-20 laptop:-inset-y-12'
            : '-inset-x-24 -inset-y-16 laptop:-inset-x-[14vw] laptop:-inset-y-[6rem]',
        )}
      >
        <div className="djinn-smoke djinn-smoke-core absolute inset-0" />
        <div className="djinn-smoke djinn-smoke-1 absolute inset-0" />
        <div className="djinn-smoke djinn-smoke-2 absolute inset-0" />
        <div className="djinn-smoke djinn-smoke-3 absolute inset-0" />
        <div className="djinn-smoke djinn-smoke-4 absolute inset-0" />
      </div>

      <div
        aria-hidden
        className="djinn-eyes pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 items-center justify-center gap-10"
      >
        <div
          ref={leftEyeRef}
          className="djinn-eye relative flex h-10 w-16 items-center justify-center overflow-hidden rounded-[50%]"
        >
          <div ref={leftPupilRef} className="djinn-pupil djinn-iris" />
        </div>
        <div
          ref={rightEyeRef}
          className="djinn-eye relative flex h-10 w-16 items-center justify-center overflow-hidden rounded-[50%]"
        >
          <div ref={rightPupilRef} className="djinn-pupil djinn-iris" />
        </div>
      </div>

      <div
        aria-hidden
        className="djinn-veil pointer-events-none absolute inset-0"
      />

      {/* eslint-disable-next-line react/no-unknown-property */}
      <style jsx global>{`
        .djinn-smoke {
          will-change: transform, opacity;
          filter: blur(48px);
        }

        .djinn-smoke-core {
          background: radial-gradient(
            circle at 50% 50%,
            color-mix(
                in srgb,
                var(--theme-accent-cabbage-default) 70%,
                transparent
              )
              0%,
            transparent 50%
          );
          filter: blur(40px);
          opacity: 0.55;
          animation: djinn-drift-core 9s ease-in-out infinite;
        }
        .djinn-smoke-1 {
          background: radial-gradient(
            circle at 48% 52%,
            color-mix(
                in srgb,
                var(--theme-accent-cabbage-default) 55%,
                transparent
              )
              0%,
            transparent 65%
          );
          opacity: 0.5;
          animation: djinn-drift-1 11s ease-in-out infinite;
        }
        .djinn-smoke-2 {
          background: radial-gradient(
            circle at 54% 46%,
            color-mix(
                in srgb,
                var(--theme-accent-onion-default) 45%,
                transparent
              )
              0%,
            transparent 70%
          );
          opacity: 0.45;
          animation: djinn-drift-2 13s ease-in-out infinite;
        }
        .djinn-smoke-3 {
          background: radial-gradient(
            circle at 50% 58%,
            color-mix(
                in srgb,
                var(--theme-accent-cabbage-default) 35%,
                transparent
              )
              0%,
            transparent 75%
          );
          opacity: 0.4;
          animation: djinn-drift-3 8s ease-in-out infinite;
        }
        .djinn-smoke-4 {
          background: radial-gradient(
            circle at 50% 50%,
            color-mix(
                in srgb,
                var(--theme-accent-onion-default) 25%,
                transparent
              )
              0%,
            transparent 80%
          );
          opacity: 0.3;
          animation: djinn-drift-4 15s ease-in-out infinite;
        }

        .djinn-veil {
          background: radial-gradient(
              ellipse 60% 32% at 50% 50%,
              color-mix(
                  in srgb,
                  var(--theme-accent-cabbage-default) 50%,
                  transparent
                )
                0%,
              transparent 65%
            ),
            radial-gradient(
              ellipse 40% 20% at 50% 50%,
              color-mix(in srgb, var(--theme-text-primary) 28%, transparent) 0%,
              transparent 70%
            );
          filter: blur(18px);
          opacity: 0.45;
          will-change: transform, opacity;
          animation: djinn-veil-drift 11s ease-in-out infinite;
        }

        @keyframes djinn-veil-drift {
          0%,
          100% {
            transform: translate3d(-2%, 1%, 0) scale(1);
            opacity: 0.45;
          }
          50% {
            transform: translate3d(3%, -2%, 0) scale(1.08);
            opacity: 0.65;
          }
        }

        .djinn-eye {
          background: radial-gradient(
            ellipse at center,
            color-mix(in srgb, var(--theme-accent-onion-bolder) 38%, #000) 0%,
            color-mix(in srgb, var(--theme-accent-onion-bolder) 18%, #000) 38%,
            rgba(5, 1, 8, 0.7) 65%,
            rgba(5, 1, 8, 0.25) 85%,
            transparent 100%
          );
          box-shadow: 0 0 36px
              color-mix(
                in srgb,
                var(--theme-accent-cabbage-default) 55%,
                transparent
              ),
            0 0 90px
              color-mix(
                in srgb,
                var(--theme-accent-onion-bolder) 40%,
                transparent
              ),
            0 0 140px
              color-mix(in srgb, var(--theme-text-primary) 22%, transparent);
        }

        .djinn-pupil {
          transition: transform 250ms ease-out;
          will-change: transform;
        }
        .djinn-iris {
          position: relative;
          width: 2rem;
          height: 2rem;
          border-radius: 9999px;
          background: radial-gradient(
            circle at 50% 50%,
            #000 0%,
            #000 14%,
            color-mix(in srgb, var(--theme-accent-cabbage-default) 22%, #000)
              26%,
            color-mix(in srgb, var(--theme-accent-cabbage-default) 70%, #000)
              50%,
            color-mix(in srgb, var(--theme-accent-cabbage-default) 50%, #000)
              70%,
            color-mix(in srgb, var(--theme-accent-onion-bolder) 50%, #000) 90%,
            #000 100%
          );
          box-shadow: 0 0 12px
              color-mix(
                in srgb,
                var(--theme-accent-cabbage-default) 70%,
                transparent
              ),
            inset 0 0 6px rgba(0, 0, 0, 0.55);
        }

        @keyframes djinn-drift-core {
          0%,
          100% {
            transform: translate3d(0, 2%, 0) scale(1);
            opacity: 0.55;
          }
          33% {
            transform: translate3d(3%, -6%, 0) scale(1.18);
            opacity: 0.85;
          }
          66% {
            transform: translate3d(-2%, -3%, 0) scale(0.94);
            opacity: 0.7;
          }
        }
        @keyframes djinn-drift-1 {
          0%,
          100% {
            transform: translate3d(-4%, 4%, 0) scale(1) rotate(0deg);
            opacity: 0.45;
          }
          50% {
            transform: translate3d(8%, -12%, 0) scale(1.28) rotate(5deg);
            opacity: 0.8;
          }
        }
        @keyframes djinn-drift-2 {
          0%,
          100% {
            transform: translate3d(6%, 5%, 0) scale(1.05) rotate(0deg);
            opacity: 0.4;
          }
          50% {
            transform: translate3d(-11%, -10%, 0) scale(1.32) rotate(-7deg);
            opacity: 0.75;
          }
        }
        @keyframes djinn-drift-3 {
          0%,
          100% {
            transform: translate3d(-3%, 7%, 0) scale(1.1) rotate(0deg);
            opacity: 0.4;
          }
          50% {
            transform: translate3d(7%, -10%, 0) scale(0.88) rotate(4deg);
            opacity: 0.7;
          }
        }
        @keyframes djinn-drift-4 {
          0%,
          100% {
            transform: translate3d(2%, 6%, 0) scale(0.9);
            opacity: 0.3;
          }
          50% {
            transform: translate3d(-8%, -9%, 0) scale(1.22);
            opacity: 0.6;
          }
        }

        @keyframes djinn-pupil-idle {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }
          25% {
            transform: translate3d(${PUPIL_TRAVEL_X}px, 0, 0);
          }
          50% {
            transform: translate3d(0, ${PUPIL_TRAVEL_Y}px, 0);
          }
          75% {
            transform: translate3d(-${PUPIL_TRAVEL_X}px, 0, 0);
          }
        }

        @media (hover: none) {
          .djinn-pupil {
            animation: djinn-pupil-idle 8s ease-in-out infinite;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .djinn-smoke,
          .djinn-pupil {
            animation: none !important;
          }
          .djinn-pupil {
            transition: none !important;
          }
        }

        .djinn-progress-tick {
          background: color-mix(
            in srgb,
            var(--theme-accent-onion-bolder) 18%,
            transparent
          );
        }
        .djinn-progress-tick--active {
          background: color-mix(
            in srgb,
            var(--theme-accent-cabbage-default) 85%,
            transparent
          );
          box-shadow: 0 0 12px
            color-mix(
              in srgb,
              var(--theme-accent-cabbage-default) 65%,
              transparent
            );
        }

        .djinn-option {
          position: relative;
          background: color-mix(in srgb, #05010a 55%, transparent);
          border: 1px solid
            color-mix(
              in srgb,
              var(--theme-accent-onion-bolder) 35%,
              transparent
            );
          backdrop-filter: blur(6px);
          transition: border-color 200ms ease, background 200ms ease,
            box-shadow 250ms ease, transform 200ms ease;
        }
        .djinn-option:hover {
          border-color: color-mix(
            in srgb,
            var(--theme-accent-cabbage-default) 70%,
            transparent
          );
          background: color-mix(in srgb, #05010a 40%, transparent);
          box-shadow: 0 0 24px
            color-mix(
              in srgb,
              var(--theme-accent-cabbage-default) 35%,
              transparent
            );
        }
        .djinn-option:focus-visible {
          outline: none;
          border-color: color-mix(
            in srgb,
            var(--theme-accent-cabbage-default) 80%,
            transparent
          );
          box-shadow: 0 0 0 2px
            color-mix(
              in srgb,
              var(--theme-accent-cabbage-default) 65%,
              transparent
            );
        }
        .djinn-option--selected {
          border-color: color-mix(
            in srgb,
            var(--theme-accent-cabbage-default) 90%,
            transparent
          );
          background: color-mix(
            in srgb,
            var(--theme-accent-cabbage-default) 14%,
            #05010a
          );
          box-shadow: 0 0 32px
              color-mix(
                in srgb,
                var(--theme-accent-cabbage-default) 55%,
                transparent
              ),
            inset 0 0 24px
              color-mix(
                in srgb,
                var(--theme-accent-onion-bolder) 30%,
                transparent
              );
        }
      `}</style>
    </motion.div>
  );
};
