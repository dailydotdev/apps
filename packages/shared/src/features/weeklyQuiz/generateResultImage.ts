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

  // Arcade gradient background.
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, accent('--theme-accent-onion-default', '#6B56DD'));
  gradient.addColorStop(
    0.5,
    accent('--theme-accent-cabbage-default', '#BA56E1'),
  );
  gradient.addColorStop(1, accent('--theme-accent-bun-default', '#FF9157'));
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // Logo (same-origin, no CORS concern).
  try {
    const logo = await loadImage(params.logoUrl);
    const logoWidth = 460;
    const logoHeight = (logo.height / logo.width) * logoWidth;
    ctx.drawImage(logo, (size - logoWidth) / 2, 70, logoWidth, logoHeight);
  } catch {
    // Logo is best-effort; keep going without it.
  }

  // Avatar circle. crossOrigin so the canvas isn't tainted; if the host doesn't
  // allow CORS the load errors and we simply skip it (canvas stays exportable).
  if (params.imageUrl) {
    try {
      const avatar = await loadImage(params.imageUrl, 'anonymous');
      const diameter = 210;
      const ax = (size - diameter) / 2;
      const ay = 470;
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
  ctx.font = 'bold 58px system-ui, sans-serif';
  ctx.fillText(params.name, size / 2, 760);

  // Score + time, equal weight, side by side.
  const leftX = size * 0.31;
  const rightX = size * 0.69;
  ctx.font = 'bold 104px system-ui, sans-serif';
  ctx.fillText(`${params.correctCount}/${params.totalQuestions}`, leftX, 900);
  ctx.fillText(params.timeLabel, rightX, 900);
  ctx.font = '600 32px system-ui, sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.fillText('CORRECT', leftX, 950);
  ctx.fillText('TIME', rightX, 950);

  // Leaderboard rank.
  if (params.rank) {
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 46px system-ui, sans-serif';
    ctx.fillText(`Leaderboard rank #${params.rank}`, size / 2, 1024);
  }

  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = 'weekly-tech-news-quiz-result.png';
  document.body.appendChild(link);
  link.click();
  link.remove();
};
