export interface WeeklyQuizResultImageParams {
  name: string;
  imageUrl?: string | null;
  correctCount: number;
  totalQuestions: number;
  timeLabel: string;
  rank?: number | null;
  logoUrl: string;
}

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
// score + time, leaderboard rank) and downloads it as a PNG. Fully client-side;
// the download lands in the browser's downloads folder. Sharing target may
// change later (native share sheet, upload, etc.).
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

  // Deep daily.dev purple background (matches the in-app surface) with a soft
  // top glow — reads as part of the app, not a generic arcade card.
  const onion = accent('--theme-accent-onion-default', '#6B56DD');
  const cabbage = accent('--theme-accent-cabbage-default', '#BA56E1');
  const bg = ctx.createLinearGradient(0, 0, size * 0.4, size);
  bg.addColorStop(0, onion);
  bg.addColorStop(0.55, cabbage);
  bg.addColorStop(1, onion);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);
  const glow = ctx.createRadialGradient(
    size / 2,
    120,
    40,
    size / 2,
    120,
    size * 0.7,
  );
  glow.addColorStop(0, 'rgba(255, 255, 255, 0.18)');
  glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, size, size);

  // Logo (same-origin, no CORS concern). The mascot logo is ~square, so it's
  // kept compact at the top and everything else sits clearly below it.
  try {
    const logo = await loadImage(params.logoUrl);
    const logoWidth = 340;
    const logoHeight = (logo.height / logo.width) * logoWidth;
    ctx.drawImage(logo, (size - logoWidth) / 2, 44, logoWidth, logoHeight);
  } catch {
    // Logo is best-effort; keep going without it.
  }

  // Avatar circle, below the logo. crossOrigin so the canvas isn't tainted; if
  // the host doesn't allow CORS the load errors and we simply skip it (canvas
  // stays exportable).
  if (params.imageUrl) {
    try {
      const avatar = await loadImage(params.imageUrl, 'anonymous');
      const diameter = 150;
      const ax = (size - diameter) / 2;
      const ay = 410;
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

  // Name.
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 56px system-ui, sans-serif';
  ctx.fillText(params.name, size / 2, 618);

  // Score + time as two equal-weight stat cards — the shareable focal point.
  const roundRect = (x: number, y: number, w: number, h: number, r: number) => {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
  };
  const cardW = 380;
  const cardH = 210;
  const gap = 40;
  const startX = (size - (cardW * 2 + gap)) / 2;
  const cardY = 668;
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
    ctx.font = 'bold 104px system-ui, sans-serif';
    ctx.fillText(card.big, card.x + cardW / 2, cardY + 128);
    ctx.font = '700 34px system-ui, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.fillText(card.label, card.x + cardW / 2, cardY + 172);
  });

  // Leaderboard rank — a bright gold pill so it pops off the purple.
  if (params.rank) {
    const pillText = `LEADERBOARD RANK #${params.rank}`;
    ctx.font = 'bold 40px system-ui, sans-serif';
    const pillW = ctx.measureText(pillText).width + 80;
    const pillH = 84;
    const pillX = (size - pillW) / 2;
    const pillY = 912;
    const pill = ctx.createLinearGradient(pillX, pillY, pillX, pillY + pillH);
    pill.addColorStop(0, accent('--theme-accent-cheese-default', '#FFE24C'));
    pill.addColorStop(1, accent('--theme-accent-bun-default', '#FF9157'));
    ctx.fillStyle = pill;
    roundRect(pillX, pillY, pillW, pillH, pillH / 2);
    ctx.fill();
    ctx.fillStyle = '#1a1523';
    ctx.fillText(pillText, size / 2, pillY + 56);
  }

  // Footer tagline so the post explains itself when shared.
  ctx.font = '600 34px system-ui, sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.fillText('Play the Weekly Tech News Quiz on daily.dev', size / 2, 1044);

  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = 'weekly-tech-news-quiz-result.png';
  document.body.appendChild(link);
  link.click();
  link.remove();
};
