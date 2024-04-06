import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { WidgetContainer } from '../widgets/common';
import { FeedbackIcon, DocsIcon } from '../icons';
import { ListCardDivider } from '../cards/Card';
import { searchDocs, searchFeedback } from '../../lib/constants';
import { WithClassNameProps } from '../utilities';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';

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
