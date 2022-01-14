import React, { ReactElement, useContext, useEffect } from 'react';
import classNames from 'classnames';
import { IFlags } from 'flagsmith';
import PlusIcon from '../../../icons/plus.svg';
import FilterIcon from '../../../icons/outline/filter.svg';
import { Button } from '../buttons/Button';
import { Features, getFeatureValue } from '../../lib/featureManagement';
import { ButtonOrLink, ItemInner, NavItem, SidebarMenuItem } from './common';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { AnalyticsEvent } from '../../hooks/analytics/useAnalyticsQueue';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';

const statusColor = {
  success: {
    border: 'border-theme-status-success',
    shadow: 'shadow-2-avocado',
    button: 'btn-primary-avocado',
  },
  error: {
    border: 'border-theme-status-error',
    shadow: 'shadow-2-ketchup',
    button: 'btn-primary-ketchup',
  },
  help: {
    border: 'border-theme-status-help',
    shadow: 'shadow-2-cheese',
    button: 'btn-primary-cheese',
  },
  warning: {
    border: 'border-theme-status-warning',
    shadow: 'shadow-2-bun',
    button: 'btn-primary-bun',
  },
  cabbage: {
    border: 'border-theme-status-cabbage',
    shadow: 'shadow-2-cabbage',
    button: 'btn-primary-cabbage',
  },
  fill: {
    border: 'border-theme-status-fill',
    shadow: 'shadow-2-water',
    button: 'btn-primary-water',
  },
};

interface MyFeedButtonSharedProps {
  sidebarRendered?: boolean;
  sidebarExpanded: boolean;
  action: () => unknown;
  isActive?: boolean;
  useNavButtonsNotLinks?: boolean;
}
type UnfilteredMyFeedButtonProps = MyFeedButtonSharedProps & {
  flags: IFlags;
};
type MyFeedButtonProps = MyFeedButtonSharedProps & {
  item: SidebarMenuItem;
  flags: IFlags;
  filtered: boolean;
};
type FilteredMyFeedButtonProps = MyFeedButtonSharedProps & {
  item: SidebarMenuItem;
};

const getAnalyticsEvent = (
  eventName: string,
  copy: string,
): Partial<AnalyticsEvent> => ({
  event_name: eventName,
  target_type: 'my feed button',
  target_id: 'sidebar',
  feed_item_title: copy,
});

const UnfilteredMyFeedButton = ({
  sidebarExpanded,
  flags,
  action,
}: UnfilteredMyFeedButtonProps) => {
  const { trackEvent } = useContext(AnalyticsContext);

  const buttonCopy = getFeatureValue(Features.MyFeedButtonCopy, flags);
  const buttonColor = getFeatureValue(Features.MyFeedButtonColor, flags);
  const explainerCopy = getFeatureValue(Features.MyFeedExplainerCopy, flags);
  const explainerColor = getFeatureValue(Features.MyFeedExplainerColor, flags);

  useEffect(() => {
    trackEvent(getAnalyticsEvent('impression', buttonCopy));
  }, [buttonCopy]);

  const onClick = () => {
    trackEvent(getAnalyticsEvent('click', buttonCopy));
    action();
  };

  return (
    <div
      className={classNames(
        'h-[8.125rem] flex flex-col',
        !sidebarExpanded && 'justify-center',
      )}
    >
      <div
        className={classNames(
          `flex flex-col items-center rounded-12`,
          statusColor[explainerColor].border,
          sidebarExpanded
            ? `${statusColor[explainerColor].shadow} border p-3 m-4`
            : 'mx-3 ',
        )}
      >
        <p
          className={classNames(
            'typo-footnote transition-all w-[11.25rem] mb-3',
            sidebarExpanded
              ? 'transform opacity-100 ease-linear duration-200  delay-200'
              : 'transform duration-0 delay-0 opacity-0',
          )}
        >
          {explainerCopy}
        </p>

        <Button
          className={classNames('w-full', statusColor[buttonColor].button)}
          buttonSize={sidebarExpanded ? 'small' : 'xsmall'}
          icon={<PlusIcon />}
          iconOnly={!sidebarExpanded}
          onClick={onClick}
        >
          {sidebarExpanded && buttonCopy}
        </Button>
      </div>
    </div>
  );
};

const FilteredMyFeedButton = ({
  item,
  sidebarRendered,
  sidebarExpanded,
  action,
  isActive,
  useNavButtonsNotLinks,
}: FilteredMyFeedButtonProps) => {
  return (
    <NavItem className="mt-6" active={isActive}>
      <ButtonOrLink item={item} useNavButtonsNotLinks={useNavButtonsNotLinks}>
        <ItemInner item={item} sidebarExpanded={sidebarExpanded} />
      </ButtonOrLink>
      {sidebarRendered && (
        <SimpleTooltip placement="right" content="Feed filters">
          <Button
            iconOnly
            className="mr-3 btn-tertiary"
            buttonSize="xsmall"
            icon={<FilterIcon />}
            onClick={action}
          />
        </SimpleTooltip>
      )}
    </NavItem>
  );
};

export default function MyFeedButton({
  item,
  sidebarRendered,
  sidebarExpanded,
  filtered = false,
  flags,
  action,
  isActive,
  useNavButtonsNotLinks,
}: MyFeedButtonProps): ReactElement {
  if (filtered) {
    return (
      <FilteredMyFeedButton
        action={action}
        sidebarRendered={sidebarRendered}
        sidebarExpanded={sidebarExpanded}
        item={item}
        isActive={isActive}
        useNavButtonsNotLinks={useNavButtonsNotLinks}
      />
    );
  }

  if (!sidebarRendered) {
    return <></>;
  }

  return (
    <UnfilteredMyFeedButton
      action={action}
      sidebarExpanded={sidebarExpanded}
      flags={flags}
    />
  );
}
