import type { PointerEvent, ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
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
import { FlexCol } from '../../../../components/utilities';

// A single scratch-off card holding ONE secret — the secret unlocked at this
// level. Scratch the foil away with the cursor (or hit "Reveal" if you don't
// drag). The next level reveals the next secret.

const CARD_W = 288;
const CARD_H = 176;
// How much of the foil must be scratched off before it auto-reveals.
const REVEAL_AT = 0.45;

export const GivebackSecretScratch = ({
  fact,
}: {
  fact: string;
}): ReactElement => {
  const [revealed, setRevealed] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  // getImageData reads the whole canvas back from the GPU, so we only sample the
  // scratched ratio every few moves instead of on every pointermove.
  const moveCountRef = useRef(0);

  // Paint the foil once, on mount.
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) {
        return;
      }
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, CARD_W, CARD_H);
      // Colorful foil (our brand sweep: purple → pink → gold) over the dark
      // secret card behind it.
      const foil = ctx.createLinearGradient(0, 0, CARD_W, CARD_H);
      foil.addColorStop(0, '#8f43ff');
      foil.addColorStop(0.5, '#fe7ab6');
      foil.addColorStop(1, '#ffce3a');
      ctx.fillStyle = foil;
      ctx.fillRect(0, 0, CARD_W, CARD_H);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.textAlign = 'center';
      ctx.font = '800 13px ui-sans-serif, system-ui, -apple-system, sans-serif';
      ctx.fillText('SCRATCH TO REVEAL', CARD_W / 2, CARD_H / 2);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  const eraseAt = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) {
      return;
    }
    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) * CARD_W) / rect.width;
    const y = ((clientY - rect.top) * CARD_H) / rect.height;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();
  };

  // How much foil is gone (sampled every few pixels for speed).
  const scratchedRatio = (): number => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) {
      return 0;
    }
    const { data } = ctx.getImageData(0, 0, CARD_W, CARD_H);
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
        className="relative mx-auto h-44 w-72 max-w-full overflow-hidden rounded-24 border border-border-subtlest-tertiary"
        // Dark secret card behind the colorful foil (fixed dark in both themes).
        style={{ backgroundColor: '#17111f' }}
      >
        {/* The secret, underneath the foil. */}
        <FlexCol className="absolute inset-0 justify-between p-6">
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
            width={CARD_W}
            height={CARD_H}
            onPointerMove={onPointerMove}
            aria-label="Scratch to reveal the secret"
            className="absolute inset-0 size-full cursor-crosshair [touch-action:none]"
          />
        )}
      </div>

      {!revealed && (
        <Button
          type="button"
          size={ButtonSize.Medium}
          variant={ButtonVariant.Primary}
          onClick={() => setRevealed(true)}
        >
          Reveal
        </Button>
      )}
    </FlexCol>
  );
};
