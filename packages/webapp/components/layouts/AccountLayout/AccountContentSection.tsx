import classed from '@dailydotdev/shared/src/lib/classed';
import React, { ReactElement, ReactNode } from 'react';

interface ClassName {
  container?: string;
  heading?: string;
}

interface AccountContentSectionProps {
  title: string;
  description?: string;
  children?: ReactNode;
  className?: ClassName;
}

const ContentHeading = classed('h2', 'font-bold typo-body');
const ContentText = classed('p', 'mt-1 typo-callout text-text-tertiary');

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
