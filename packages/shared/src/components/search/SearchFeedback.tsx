import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { WidgetContainer } from '../widgets/common';
import { Button, ButtonSize } from '../buttons/Button';
import FeedbackIcon from '../icons/Feedback';
import { ListCardDivider } from '../cards/Card';
import { searchDocs, searchFeedback } from '../../lib/constants';
import DocsIcon from '../icons/Docs';
import { WithClassNameProps } from '../utilities';

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
        className="btn-tertiary"
        buttonSize={ButtonSize.Small}
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
        className="btn-tertiary"
        buttonSize={ButtonSize.Small}
      >
        User guide
      </Button>
    </div>
    <p className="border-t border-theme-divider-tertiary px-4 py-3 text-theme-label-quaternary typo-subhead">
      daily.dev Search is in beta and can make mistakes. Verify important
      information.
    </p>
  </WidgetContainer>
);
