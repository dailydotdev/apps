export const generateLogEventId = (now = new Date()): string => {
  const randomStr = (Math.random() + 1).toString(36).substring(8);
  const timePart = (now.getTime() / 1000).toFixed(0);
  return `${timePart}${randomStr}`;
};
