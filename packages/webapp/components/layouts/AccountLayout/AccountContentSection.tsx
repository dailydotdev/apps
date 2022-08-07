import classed from '@dailydotdev/shared/src/lib/classed';
import React, { ReactElement, ReactNode } from 'react';

interface AccountContentSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  headingClassName?: string;
}

const ContentHeading = classed('h2', 'font-bold typo-headline');
const ContentText = classed('p', 'mt-1 typo-callout text-theme-label-tertiary');

function AccountContentSection({
  title,
  description,
  children,
  headingClassName = 'mt-10',
}: AccountContentSectionProps): ReactElement {
  return (
    <>
      <ContentHeading className={headingClassName}>{title}</ContentHeading>
      {description && <ContentText>{description}</ContentText>}
      {children}
    </>
  );
}

export default AccountContentSection;
