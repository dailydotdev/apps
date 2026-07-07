import type { PointerEvent, ReactElement } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '../../../../components/typography/Typography';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import { VIcon } from '../../../../components/icons';
import { FlexCol } from '../../../../components/utilities';

// A single scratch-off card holding ONE secret — the secret unlocked at this
// level. Scratch the foil away with the cursor (or hit "Reveal" if you don't
// drag). The next level reveals the next secret.

// How much of the foil must be scratched off before it auto-reveals.
const REVEAL_AT = 0.45;

export const GivebackSecretScratch = ({
  fact,
}: {
  fact: string;
}): ReactElement => {
  const [revealed, setRevealed] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  // The card grows to fit the secret, so the foil buffer is sized to the card at
  // runtime rather than a fixed constant. Tracked here so erase/sample maths use
  // the live dimensions.
  const sizeRef = useRef({ w: 0, h: 0 });
  // getImageData reads the whole canvas back from the GPU, so we only sample the
  // scratched ratio every few moves instead of on every pointermove.
  const moveCountRef = useRef(0);

  const paintFoil = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    const { w, h } = sizeRef.current;
    if (!ctx || !w || !h) {
      return;
    }
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, w, h);
    // Colorful foil (our brand sweep: purple → pink → gold) over the dark
    // secret card behind it.
    const foil = ctx.createLinearGradient(0, 0, w, h);
    foil.addColorStop(0, '#8f43ff');
    foil.addColorStop(0.5, '#fe7ab6');
    foil.addColorStop(1, '#ffce3a');
    ctx.fillStyle = foil;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.textAlign = 'center';
    ctx.font = '800 13px ui-sans-serif, system-ui, -apple-system, sans-serif';
    ctx.fillText('SCRATCH TO REVEAL', w / 2, h / 2);
  }, []);

  // Match the foil buffer to the card's rendered size and repaint. Setting
  // width/height clears the canvas, so this only runs on real size changes.
  useEffect(() => {
    const card = cardRef.current;
    if (!card) {
      return undefined;
    }
    const apply = () => {
      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }
      const w = Math.round(card.clientWidth);
      const h = Math.round(card.clientHeight);
      if (!w || !h || (w === sizeRef.current.w && h === sizeRef.current.h)) {
        return;
      }
      sizeRef.current = { w, h };
      canvas.width = w;
      canvas.height = h;
      paintFoil();
    };
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(card);
    return () => observer.disconnect();
  }, [paintFoil]);

  const eraseAt = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const { w, h } = sizeRef.current;
    if (!canvas || !ctx || !w || !h) {
      return;
    }
    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) * w) / rect.width;
    const y = ((clientY - rect.top) * h) / rect.height;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();
  };

  // How much foil is gone (sampled every few pixels for speed).
  const scratchedRatio = (): number => {
    const ctx = canvasRef.current?.getContext('2d');
    const { w, h } = sizeRef.current;
    if (!ctx || !w || !h) {
      return 0;
    }
    const { data } = ctx.getImageData(0, 0, w, h);
    let clear = 0;
    let samples = 0;
    for (let i = 3; i < data.length; i += 4 * 8) {
      samples += 1;
      if (data[i] === 0) {
        clear += 1;
      }
    }
    return samples ? clear / samples : 0;
  };

  // Scratch just by moving the cursor over it — no click/drag needed. (Touch
  // still works: pointermove fires while a finger is down.)
  const SAMPLE_EVERY = 6;
  const onPointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    eraseAt(event.clientX, event.clientY);
    moveCountRef.current += 1;
    if (
      moveCountRef.current % SAMPLE_EVERY === 0 &&
      scratchedRatio() > REVEAL_AT
    ) {
      setRevealed(true);
    }
  };

  return (
    <FlexCol className="w-full items-center gap-4">
      <div
        ref={cardRef}
        className="relative mx-auto w-80 max-w-full overflow-hidden rounded-24 border border-border-subtlest-tertiary"
        // Dark secret card behind the colorful foil (fixed dark in both themes).
        style={{ backgroundColor: '#17111f' }}
      >
        {/* The secret, underneath the foil. In normal flow so the card grows to
            fit longer facts; min height keeps short secrets card-shaped. */}
        <FlexCol className="min-h-44 justify-between gap-4 p-6">
          <span className="font-black uppercase tracking-widest text-accent-cheese-default typo-caption2">
            Secret
          </span>
          <Typography
            tag={TypographyTag.P}
            type={TypographyType.Title3}
            className="text-white [text-wrap:balance]"
          >
            {fact}
          </Typography>
        </FlexCol>
        {/* Scratch foil on top. */}
        {!revealed && (
          <canvas
            ref={canvasRef}
            onPointerMove={onPointerMove}
            aria-label="Scratch to reveal the secret"
            className="absolute inset-0 size-full cursor-crosshair [touch-action:none]"
          />
        )}
      </div>

      {/* Kept mounted after reveal (swapped to a static confirmation) so the
          column doesn't jump when the button would otherwise disappear. */}
      <Button
        type="button"
        size={ButtonSize.Medium}
        variant={revealed ? ButtonVariant.Float : ButtonVariant.Primary}
        icon={revealed ? <VIcon secondary /> : undefined}
        disabled={revealed}
        onClick={() => setRevealed(true)}
      >
        {revealed ? 'Secret revealed' : 'Reveal'}
      </Button>
    </FlexCol>
  );
};
