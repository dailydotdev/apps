import React, { ReactElement, ReactNode } from 'react';
import { Button, ButtonSize, ButtonVariant } from '../buttons/ButtonV2';
import LockIcon from '../icons/Lock';
import { PageContainerCentered } from '../utilities';
import { IconSize } from '../Icon';

interface UnauthorizedProps {
  children?: ReactNode;
  title?: string;
  description?: string;
}

const defaultTitle = `Oops! This link leads to a private discussion`;
const defaultDescription = `You don't seem to have access to this page. Try to ask the person who shared this link with you for permissions.`;

function Unauthorized({
  children,
  title = defaultTitle,
  description = defaultDescription,
}: UnauthorizedProps): ReactElement {
  return (
    <PageContainerCentered className="gap-4">
      <LockIcon
        secondary
        className="self-center text-theme-label-secondary"
        size={IconSize.XXLarge}
      />
      <h1 className="break-words-overflow px-16 text-center font-bold typo-title1">
        {title}
      </h1>
      <p className="px-10 text-center text-theme-label-tertiary">
        {description}
      </p>
      {children}
      <Button
        className="mt-6 w-fit"
        variant={ButtonVariant.Primary}
        size={ButtonSize.Large}
      >
        Back home
      </Button>
    </PageContainerCentered>
  );
}

export default Unauthorized;
