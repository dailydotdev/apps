export interface WeeklyQuizResultImageParams {
  name: string;
  imageUrl?: string | null;
  // The player's developer "level" (e.g. "Tab Spammer") — the hero headline.
  title: string;
  correctCount: number;
  totalQuestions: number;
  timeLabel: string;
  // "better than N% of players" flourish.
  percentile: number;
  rank?: number | null;
  logoUrl: string;
  // daily.dev brand logo, shown in the footer (best-effort; same-origin).
  brandLogoUrl?: string;
}

const FONT = 'system-ui, sans-serif';
// Short line that challenges others to play — kept on the shared image.
const CHALLENGE = 'Think you can beat me?';

const loadImage = (
  src: string,
  crossOrigin?: string,
): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    if (crossOrigin) {
      img.crossOrigin = crossOrigin;
    }
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

// Reads a theme accent token so the generated image tracks the design system;
// falls back to a sensible default if the var isn't resolvable.
const accent = (token: string, fallback: string): string => {
  if (typeof document === 'undefined') {
    return fallback;
  }
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(token)
    .trim();
  return value || fallback;
};

// Renders the player's result as a square social image (logo, avatar, name,
// level, score + time, rank, and a challenge line) and downloads it as a PNG.
// Fully client-side; the download lands in the browser's downloads folder.
// Sharing target may change later (native share sheet, upload, etc.).
export const generateWeeklyQuizResultImage = async (
  params: WeeklyQuizResultImageParams,
): Promise<void> => {
  if (typeof document === 'undefined') {
    return;
  }
  const size = 1080;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return;
  }

  // Shrinks the font until `text` fits within `maxWidth`, so long levels or
  // names never overflow the square.
  const fitFont = (
    text: string,
    weight: string,
    startPx: number,
    maxWidth: number,
    minPx = 32,
  ): void => {
    let px = startPx;
    ctx.font = `${weight} ${px}px ${FONT}`;
    while (ctx.measureText(text).width > maxWidth && px > minPx) {
      px -= 2;
      ctx.font = `${weight} ${px}px ${FONT}`;
    }
  };

  // Dark daily.dev surface (the quiz is always dark) with a soft brand-purple
  // aura near the top — matches the in-app look, not a bright arcade card.
  const bg = ctx.createLinearGradient(0, 0, size, size);
  bg.addColorStop(0, '#1b1a24');
  bg.addColorStop(1, '#0d0d12');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);
  const aura = (x: number, y: number, r: number, color: string) => {
    const g = ctx.createRadialGradient(x, y, 20, x, y, r);
    g.addColorStop(0, color);
    g.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  };
  aura(size * 0.5, size * 0.22, size * 0.55, 'rgba(107, 86, 221, 0.4)'); // onion
  aura(size * 0.66, size * 0.3, size * 0.45, 'rgba(186, 86, 225, 0.28)'); // cabbage

  // Logo (same-origin, no CORS concern). The mascot logo is ~square, so it's
  // kept compact at the top and everything else sits clearly below it.
  try {
    const logo = await loadImage(params.logoUrl);
    const logoWidth = 200;
    const logoHeight = (logo.height / logo.width) * logoWidth;
    ctx.drawImage(logo, (size - logoWidth) / 2, 40, logoWidth, logoHeight);
  } catch {
    // Logo is best-effort; keep going without it.
  }

  // Avatar circle, below the logo. crossOrigin so the canvas isn't tainted; if
  // the host doesn't allow CORS the load errors and we simply skip it (canvas
  // stays exportable).
  if (params.imageUrl) {
    try {
      const avatar = await loadImage(params.imageUrl, 'anonymous');
      const diameter = 132;
      const ax = (size - diameter) / 2;
      const ay = 250;
      ctx.save();
      ctx.beginPath();
      ctx.arc(
        ax + diameter / 2,
        ay + diameter / 2,
        diameter / 2,
        0,
        Math.PI * 2,
      );
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar, ax, ay, diameter, diameter);
      ctx.restore();
      ctx.lineWidth = 8;
      ctx.strokeStyle = '#fff';
      ctx.beginPath();
      ctx.arc(
        ax + diameter / 2,
        ay + diameter / 2,
        diameter / 2,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
    } catch {
      // Avatar is best-effort.
    }
  }

  ctx.textAlign = 'center';

  // Player name, just under the avatar.
  fitFont(params.name, 'bold', 46, 900);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.82)';
  ctx.fillText(params.name, size / 2, 452);

  // Developer level — the hero headline.
  fitFont(params.title, 'bold', 88, 980);
  ctx.fillStyle = '#fff';
  ctx.fillText(params.title, size / 2, 540);

  // Percentile flourish.
  ctx.font = `500 34px ${FONT}`;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.fillText(
    `You scored better than ${params.percentile}% of players`,
    size / 2,
    592,
  );

  // Score + time as two equal-weight stat cards — the shareable focal point.
  const roundRect = (x: number, y: number, w: number, h: number, r: number) => {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
  };
  const cardW = 380;
  const cardH = 185;
  const gap = 40;
  const startX = (size - (cardW * 2 + gap)) / 2;
  const cardY = 636;
  const cards = [
    {
      x: startX,
      big: `${params.correctCount}/${params.totalQuestions}`,
      label: 'CORRECT',
    },
    { x: startX + cardW + gap, big: params.timeLabel, label: 'TIME' },
  ];
  cards.forEach((card) => {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.14)';
    roundRect(card.x, cardY, cardW, cardH, 36);
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    roundRect(card.x, cardY, cardW, cardH, 36);
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = `bold 96px ${FONT}`;
    ctx.fillText(card.big, card.x + cardW / 2, cardY + 116);
    ctx.font = `700 32px ${FONT}`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.fillText(card.label, card.x + cardW / 2, cardY + 156);
  });

  // Leaderboard rank — a bright gold pill so it pops off the purple.
  if (params.rank) {
    const pillText = `LEADERBOARD RANK #${params.rank}`;
    ctx.font = `bold 38px ${FONT}`;
    const pillW = ctx.measureText(pillText).width + 76;
    const pillH = 78;
    const pillX = (size - pillW) / 2;
    const pillY = 856;
    const pill = ctx.createLinearGradient(pillX, pillY, pillX, pillY + pillH);
    pill.addColorStop(0, accent('--theme-accent-cheese-default', '#FFE24C'));
    pill.addColorStop(1, accent('--theme-accent-bun-default', '#FF9157'));
    ctx.fillStyle = pill;
    roundRect(pillX, pillY, pillW, pillH, pillH / 2);
    ctx.fill();
    ctx.fillStyle = '#1a1523';
    ctx.fillText(pillText, size / 2, pillY + 52);
  }

  // Challenge line — dares others to beat the score.
  ctx.font = `bold 46px ${FONT}`;
  ctx.fillStyle = '#fff';
  ctx.fillText(CHALLENGE, size / 2, 1002);

  // Footer: the daily.dev logo + a short CTA, centered as one group.
  const footText = 'Play at daily.dev';
  const footY = 1050;
  ctx.font = `bold 36px ${FONT}`;
  ctx.textAlign = 'left';
  const textW = ctx.measureText(footText).width;
  const markSize = 44;
  const groupGap = 14;
  const groupX = (size - (markSize + groupGap + textW)) / 2;
  if (params.brandLogoUrl) {
    try {
      const brand = await loadImage(params.brandLogoUrl);
      ctx.drawImage(
        brand,
        groupX,
        footY - markSize / 2 - 8,
        markSize,
        markSize,
      );
    } catch {
      // Brand logo is best-effort.
    }
  }
  ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
  ctx.fillText(footText, groupX + markSize + groupGap, footY + 6);
  ctx.textAlign = 'center';

  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = 'weekly-tech-news-quiz-result.png';
  document.body.appendChild(link);
  link.click();
  link.remove();
};
