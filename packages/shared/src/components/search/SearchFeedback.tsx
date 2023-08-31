import React, { ReactElement } from 'react';
import { WidgetContainer } from '../widgets/common';
import { Button, ButtonSize } from '../buttons/Button';
import FeedbackIcon from '../icons/Feedback';
import { ListCardDivider } from '../cards/Card';
import { PageWidgets } from '../utilities';
import { searchDocs, searchFeedback } from '../../lib/constants';
import DocsIcon from '../icons/Docs';

export const SearchFeedback = (): ReactElement => (
  <PageWidgets
    tablet={false}
    className="order-last laptop:order-2 items-center"
  >
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
  </PageWidgets>
);
