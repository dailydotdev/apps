import type { ReactElement } from 'react';
import React from 'react';
import { Button } from '../../../components/buttons/Button';
import { ButtonSize, ButtonVariant } from '../../../components/buttons/common';
import { LinkIcon, VIcon } from '../../../components/icons';
import { useCopyText } from '../../../hooks/useCopy';
import type { Deal } from '../types';
import { getDealShareUrl } from '../dealsFormat';

interface DealCopyLinkButtonProps {
  deal: Deal;
  className?: string;
}

export const DealCopyLinkButton = ({
  deal,
  className,
}: DealCopyLinkButtonProps): ReactElement => {
  const [isCopied, copyLink] = useCopyText(getDealShareUrl(deal));
  const copiedLabel = `Link to the ${deal.brand.name} deal copied`;

  return (
    <>
      <Button
        type="button"
        variant={ButtonVariant.Float}
        size={ButtonSize.Medium}
        icon={isCopied ? <VIcon secondary /> : <LinkIcon />}
        aria-label={`Copy the link to the ${deal.brand.name} deal`}
        onClick={() => copyLink({ message: '✅ Copied link to clipboard' })}
        className={className}
      />
      <span role="status" aria-live="polite" className="sr-only">
        {isCopied ? copiedLabel : ''}
      </span>
    </>
  );
};
