import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { LockIcon } from '../icons';
import { PageContainerCentered } from '../utilities';
import { IconSize } from '../Icon';
import { webappUrl } from '../../lib/constants';

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
        className="text-text-secondary self-center"
        size={IconSize.XXLarge}
      />
      <h1 className="break-words-overflow typo-title1 px-16 text-center font-bold">
        {title}
      </h1>
      <p className="text-text-tertiary px-10 text-center">{description}</p>
      {children}
      <Button
        className="mt-6 w-fit"
        variant={ButtonVariant.Primary}
        size={ButtonSize.Large}
        tag="a"
        href={webappUrl}
      >
        Back home
      </Button>
    </PageContainerCentered>
  );
}

export default Unauthorized;
