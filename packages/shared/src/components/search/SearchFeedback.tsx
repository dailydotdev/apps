import React, { ReactElement } from 'react';
import { WidgetContainer } from '../widgets/common';
import { Button, ButtonSize } from '../buttons/Button';
import FeedbackIcon from '../icons/Feedback';
import { ListCardDivider } from '../cards/Card';
import TrafficLight from '../../svg/TrafficLight';
import { PageWidgets } from '../utilities';

export const SearchFeedback = (): ReactElement => (
  <PageWidgets
    tablet={false}
    className="order-last laptop:order-2 items-center"
  >
    <WidgetContainer className="flex justify-around p-4">
      <Button
        icon={<FeedbackIcon />}
        className="btn-tertiary"
        buttonSize={ButtonSize.Small}
      >
        Feedback
      </Button>
      <ListCardDivider className="mx-3" />
      <Button
        icon={<TrafficLight />}
        className="btn-tertiary"
        buttonSize={ButtonSize.Small}
      >
        Use cases
      </Button>
    </WidgetContainer>
  </PageWidgets>
);
