// "17h", "45m", "1m": how long a room has, as its header says it.
export const formatTimeLeft = (
  expiresAt: string,
  now: number = Date.now(),
): string => {
  const left = new Date(expiresAt).getTime() - now;
  if (left <= 0) {
    return '0m';
  }
  const minutes = Math.ceil(left / (60 * 1000));
  if (minutes < 60) {
    return `${minutes}m`;
  }

  return `${Math.round(minutes / 60)}h`;
};
