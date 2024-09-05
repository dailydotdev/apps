import classNames from 'classnames';
import React, { ReactElement } from 'react';

import { searchDocs, searchFeedback } from '../../lib/constants';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { ListCardDivider } from '../cards/Card';
import { DocsIcon, FeedbackIcon } from '../icons';
import { WithClassNameProps } from '../utilities';
import { WidgetContainer } from '../widgets/common';

export const SearchFeedback = ({
  className,
}: WithClassNameProps): ReactElement => (
  <WidgetContainer
    className={classNames('flex flex-col justify-around', className)}
  >
    <div className="flex p-4">
      <Button
        tag="a"
        target="_blank"
        rel="noopener"
        href={searchFeedback}
        icon={<FeedbackIcon />}
        variant={ButtonVariant.Tertiary}
        size={ButtonSize.Small}
      >
        Feedback
      </Button>
      <ListCardDivider className="mx-3" />
      <Button
        tag="a"
        target="_blank"
        rel="noopener"
        href={searchDocs}
        icon={<DocsIcon />}
        variant={ButtonVariant.Tertiary}
        size={ButtonSize.Small}
      >
        User guide
      </Button>
    </div>
    <p className="border-t border-border-subtlest-tertiary px-4 py-3 text-text-quaternary typo-subhead">
      daily.dev Search is in beta and can make mistakes. Verify important
      information.
    </p>
  </WidgetContainer>
);
