import type { ReactElement } from 'react';
import React from 'react';
import { LazyModal } from '../../../components/modals/common/types';
import {
  Typography,
  TypographyType,
  TypographyColor,
} from '../../../components/typography/Typography';
import { exportLinkedIn, exportLinkedInMobile } from '../../../lib/image';
import { useLazyModal } from '../../../hooks/useLazyModal';
import { OpenLinkIcon } from '../../../components/icons';
import { ButtonIconPosition } from '../../../components/buttons/common';

export function FeelingLazy(): ReactElement {
  const { openModal } = useLazyModal();

  return (
    <Typography type={TypographyType.Footnote} color={TypographyColor.Tertiary}>
      Feeling lazy?{' '}
      <button
        type="button"
        className="underline hover:no-underline"
        onClick={() =>
          openModal({
            type: LazyModal.ActionSuccess,
            props: {
              content: {
                title: 'Export from LinkedIn',
                description: 'Here’s how to get your CV from LinkedIn:',
                cover: exportLinkedIn,
                coverDrawer: exportLinkedInMobile,
                body: (
                  <ol className="flex flex-col gap-2 text-text-secondary typo-body">
                    <li>1. Go to your LinkedIn profile</li>
                    <li>2. Click &quot;More&quot; → &quot;Save to PDF&quot;</li>
                    <li>3. Download the file and upload it here</li>
                  </ol>
                ),
              },
              cta: {
                tag: 'a',
                copy: 'Go to your LinkedIn profile',
                href: 'https://www.linkedin.com/in/',
                rel: 'noopener',
                target: '_blank',
                icon: <OpenLinkIcon />,
                iconPosition: ButtonIconPosition.Right,
              },
            },
          })
        }
      >
        Import your CV from LinkedIn
      </button>
    </Typography>
  );
}
