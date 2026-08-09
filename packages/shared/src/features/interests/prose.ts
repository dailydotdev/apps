import classNames from 'classnames';

/**
 * How the agent's prose is set, wherever it is read.
 *
 * Its own module because the share sheet previews a reply and the transcript
 * renders one: importing the classes from the transcript would have the
 * transcript and its own child modal importing each other.
 */
export const transcriptProse = classNames(
  '[&_p]:my-3 [&_p]:text-pretty [&_p]:!leading-relaxed [&_p]:typo-callout',
  '[&_li]:text-pretty [&_li]:!leading-relaxed [&_li]:typo-callout [&_ol]:my-3 [&_ul]:my-3',
  '[&_h1]:mb-1.5 [&_h1]:mt-5 [&_h1]:text-balance [&_h1]:!leading-snug [&_h1]:typo-body',
  '[&_h2]:mb-1.5 [&_h2]:mt-5 [&_h2]:text-balance [&_h2]:!leading-snug [&_h2]:typo-body',
  '[&_h3]:mb-1.5 [&_h3]:mt-5 [&_h3]:text-balance [&_h3]:!leading-snug [&_h3]:typo-callout',
  '[&>*:first-child]:mt-0 [&>*:last-child]:mb-0',
);
