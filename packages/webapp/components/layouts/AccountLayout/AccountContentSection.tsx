import React, { ReactElement, ReactNode } from 'react';
import { AccountContentHeading, ContentText } from './common';

interface AccountContentSectionProps {
  title: string;
  description: string;
  children: ReactNode;
}

function AccountContentSection({
  title,
  description,
  children,
}: AccountContentSectionProps): ReactElement {
  return (
    <>
      <AccountContentHeading>{title}</AccountContentHeading>
      <ContentText>{description}</ContentText>
      {children}
    </>
  );
}

export default AccountContentSection;
