import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { getTagPageLink } from '../../../../lib/links';

/** A tag as a link to its page on daily.dev */
export const IntelTag = ({
  tag,
  className,
}: {
  tag: string;
  className?: string;
}): ReactElement => (
  <a
    href={getTagPageLink(tag)}
    target="_blank"
    rel="noopener"
    className={classNames('hover:underline', className)}
  >
    #{tag}
  </a>
);

const TAG_PATTERN = /(#[\w-]+(?:\.[\w-]+)*)/g;

/** Text with every #tag in it as a link to the tag's page */
export const IntelText = ({ text }: { text: string }): ReactElement => (
  <>
    {text.split(TAG_PATTERN).map((part, index) =>
      // Split with a capture group puts the matches at odd indexes
      index % 2 ? (
        // eslint-disable-next-line react/no-array-index-key
        <IntelTag key={index} tag={part.slice(1)} />
      ) : (
        part
      ),
    )}
  </>
);
