import type { CSSProperties, ReactElement } from 'react';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../components/buttons/Button';
import { MenuIcon } from '../../components/icons';
import { IconSize } from '../../components/Icon';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../components/typography/Typography';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { getPatchyConfig, patchyOfferPose } from './patchyConfig';
import type {
  PatchyOffer as Offer,
  PatchyOfferAnswer,
} from './usePatchyAssistant';
import { PATCHY_OFFER_TIMEOUT_MS } from './usePatchyAssistant';

const POSE_WIDTH = 104;
const BOX_HEIGHT = 168;
const BUBBLE_WIDTH = 300;
// Over the feed; over the post modal (z 100) when he reads along.
const Z_INDEX = 69;
const Z_INDEX_OVER_MODAL = 101;
const SLIDE_MS = 380;

interface PatchyOfferProps {
  offer: Offer;
  // The Streak tab button he leans out next to.
  anchorId: string;
  onAnswer: (
    answer: PatchyOfferAnswer,
    button?: 'primary' | 'secondary',
  ) => void;
  onQuiet: () => void;
}

// A suggestion: Patchy leans out from behind the rail, pointing at a bubble
// with one useful thing and a way to say no. It leaves by itself after a
// while (paused while you hover it), and the ••• menu stops that kind of
// suggestion or turns them all off.
export const PatchyOffer = ({
  offer,
  anchorId,
  onAnswer,
  onQuiet,
}: PatchyOfferProps): ReactElement | null => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [box, setBox] = useState<CSSProperties | null>(null);
  const [isIn, setIsIn] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasPose, setHasPose] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const answerRef = useRef<{
    answer: PatchyOfferAnswer;
    button?: 'primary' | 'secondary';
  } | null>(null);

  useLayoutEffect(() => {
    const anchor = document.getElementById(anchorId);
    const rail = anchor?.closest('nav');
    if (!anchor || !rail) {
      onAnswer('ignore');
      return;
    }
    const tab = anchor.getBoundingClientRect();
    setBox({
      left: rail.getBoundingClientRect().right,
      top: Math.max(8, tab.top + tab.height / 2 - BOX_HEIGHT / 2 - 24),
      height: BOX_HEIGHT,
      zIndex: offer.isOverModal ? Z_INDEX_OVER_MODAL : Z_INDEX,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anchorId, offer.id]);

  useEffect(() => {
    if (!box) {
      return undefined;
    }
    const frame = requestAnimationFrame(() => setIsIn(true));
    return () => cancelAnimationFrame(frame);
  }, [box]);

  const leave = (
    answer: PatchyOfferAnswer,
    button?: 'primary' | 'secondary',
  ) => {
    if (isLeaving) {
      return;
    }
    answerRef.current = { answer, button };
    setIsLeaving(true);
    setIsIn(false);
  };

  useEffect(() => {
    if (!isLeaving || !answerRef.current) {
      return undefined;
    }
    const { answer, button } = answerRef.current;
    const timeout = setTimeout(
      () => onAnswer(answer, button),
      prefersReducedMotion ? 0 : SLIDE_MS,
    );
    return () => clearTimeout(timeout);
  }, [isLeaving, onAnswer, prefersReducedMotion]);

  // Leaves on its own unless you're looking at it.
  useEffect(() => {
    if (isHovered || isMenuOpen || isLeaving) {
      return undefined;
    }
    const timeout = setTimeout(() => leave('ignore'), PATCHY_OFFER_TIMEOUT_MS);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHovered, isMenuOpen, isLeaving]);

  if (!box) {
    return null;
  }

  const transition = prefersReducedMotion
    ? 'none'
    : `transform ${SLIDE_MS}ms cubic-bezier(0.34, 1.4, 0.64, 1), opacity 200ms ease-out`;
  const { faceImage } = getPatchyConfig();

  return createPortal(
    <div
      className="pointer-events-none fixed flex items-start"
      style={box}
      data-testid="patchy-offer"
    >
      {hasPose && (
        <div
          className="relative h-full overflow-hidden"
          style={{ width: POSE_WIDTH }}
        >
          <img
            src={patchyOfferPose}
            alt=""
            aria-hidden
            className="absolute bottom-0 left-0 w-full"
            style={{
              transform: isIn ? 'translateX(0)' : 'translateX(-101%)',
              transition,
            }}
            draggable={false}
            onError={() => setHasPose(false)}
          />
        </div>
      )}
      <div
        role="dialog"
        aria-label="Patchy suggests"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="pointer-events-auto relative ml-1 mt-2 flex flex-col gap-2 rounded-16 border border-border-subtlest-tertiary bg-background-popover p-3 shadow-2"
        style={{
          width: BUBBLE_WIDTH,
          opacity: isIn ? 1 : 0,
          transform: isIn ? 'scale(1)' : 'scale(0.85)',
          transformOrigin: '0% 70%',
          transition,
        }}
      >
        <div className="flex items-center gap-2">
          {!hasPose && (
            <img
              src={faceImage.alert}
              alt=""
              className="size-6 rounded-full"
              draggable={false}
            />
          )}
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
            bold
            className="flex-1"
          >
            Patchy
          </Typography>
          <Button
            type="button"
            size={ButtonSize.XSmall}
            variant={ButtonVariant.Tertiary}
            icon={<MenuIcon size={IconSize.Size16} />}
            aria-label="Suggestion options"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((open) => !open)}
          />
        </div>
        <Typography type={TypographyType.Callout} bold>
          {offer.text}
        </Typography>
        {offer.post && (
          <div className="flex items-center gap-2 rounded-12 bg-surface-float p-2">
            {offer.post.image && (
              <img
                src={offer.post.image}
                alt=""
                className="size-10 shrink-0 rounded-8 object-cover"
              />
            )}
            <div className="min-w-0 flex-1">
              <Typography type={TypographyType.Footnote} bold truncate>
                {offer.post.title}
              </Typography>
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
              >
                {offer.post.source?.name ? `${offer.post.source.name} · ` : ''}
                {offer.post.readTime}m read
              </Typography>
            </div>
          </div>
        )}
        {isMenuOpen ? (
          <div className="flex flex-col gap-1">
            <Button
              type="button"
              size={ButtonSize.Small}
              variant={ButtonVariant.Float}
              onClick={() => leave('never')}
            >
              Don’t suggest this again
            </Button>
            <Button
              type="button"
              size={ButtonSize.Small}
              variant={ButtonVariant.Float}
              onClick={() => {
                onQuiet();
                leave('ignore');
              }}
            >
              Quiet mode: no more suggestions
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button
              type="button"
              size={ButtonSize.Small}
              variant={ButtonVariant.Primary}
              onClick={() => leave('accept', 'primary')}
            >
              {offer.primary}
            </Button>
            <Button
              type="button"
              size={ButtonSize.Small}
              variant={ButtonVariant.Tertiary}
              className="text-text-tertiary"
              onClick={() => leave('dismiss', 'secondary')}
            >
              {offer.secondary}
            </Button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
};
