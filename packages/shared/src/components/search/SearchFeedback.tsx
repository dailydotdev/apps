import React, { ReactElement } from 'react';
import { WidgetContainer } from '../widgets/common';
import { Button, ButtonSize } from '../buttons/Button';
import FeedbackIcon from '../icons/Feedback';
import { ListCardDivider } from '../cards/Card';
import { searchDocs, searchFeedback } from '../../lib/constants';
import DocsIcon from '../icons/Docs';

export const SearchFeedback = (): ReactElement => (
  <WidgetContainer className="flex justify-around p-4">
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
  </WidgetContainer>
);
