import classed from '@dailydotdev/shared/src/lib/classed';
import type { ReactElement, ReactNode } from 'react';
import React from 'react';

interface ClassName {
  container?: string;
  heading?: string;
}

interface AccountContentSectionProps {
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  className?: ClassName;
}

export const ContentHeading = classed('h2', 'font-bold typo-body');
export const ContentText = classed('p', 'mt-1 typo-callout text-text-tertiary');

function AccountContentSection({
  title,
  description,
  children,
  className = {},
}: AccountContentSectionProps): ReactElement {
  const { container, heading = 'mt-10' } = className;

  const content = (
    <>
      <ContentHeading
        id={title.toLowerCase().replace(/\s/g, '')}
        className={heading}
      >
        {title}
      </ContentHeading>
      {description && <ContentText>{description}</ContentText>}
      {children}
    </>
  );

  if (!container) {
    return content;
  }

  return <div className={container}>{content}</div>;
}

export default AccountContentSection;
