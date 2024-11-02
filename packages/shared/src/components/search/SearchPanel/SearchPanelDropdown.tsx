import React, { MutableRefObject, ReactElement } from 'react';
import { SearchProviderEnum } from '../../../graphql/search';
import { ArrowKeyEnum, isExtension } from '../../../lib/func';
import { LogEvent } from '../../../lib/log';
import { ArrowIcon } from '../../icons';
import { SearchPanelAction } from './SearchPanelAction';
import { SearchPanelCustomAction } from './SearchPanelCustomAction';
import { SearchPanelPostSuggestions } from './SearchPanelPostSuggestions';
import { SearchPanelSourceSuggestions } from './SearchPanelSourceSuggestions';
import { SearchPanelTagSuggestions } from './SearchPanelTagSuggestions';
import { SearchPanelUserSuggestions } from './SearchPanelUserSuggestions';
import { feature } from '../../../lib/featureManagement';
import { useConditionalFeature, useEventListener } from '../../../hooks';
import { useSearchProvider } from '../../../hooks/search';
import { useLogContext } from '../../../contexts/LogContext';

type Props = {
  anchor: MutableRefObject<HTMLElement>;
  query?: string;
};

const SearchPanelDropdown = ({ query = '', anchor }: Props): ReactElement => {
  const { search } = useSearchProvider();
  const { logEvent } = useLogContext();

  const { value: isUserSearchEnabled } = useConditionalFeature({
    feature: feature.searchUsers,
    shouldEvaluate: true,
  });

  useEventListener(anchor, 'keydown', (event) => {
    const navigableElements = [
      ...anchor.current.querySelectorAll<HTMLElement>(
        '[data-search-panel-item="true"]',
      ),
    ];
    let activeElementIndex = navigableElements.findIndex(
      (element) => element.getAttribute('data-search-panel-active') === 'true',
    );

    if (activeElementIndex === -1) {
      activeElementIndex = 0;
    }

    const keyToIndexModifier: Partial<Record<ArrowKeyEnum, number>> = {
      [ArrowKeyEnum.Up]: -1,
      [ArrowKeyEnum.Down]: 1,
    };

    if (activeElementIndex !== 0) {
      keyToIndexModifier[ArrowKeyEnum.Left] = -1;
      keyToIndexModifier[ArrowKeyEnum.Right] = 1;
    }

    const supportedKeys = Object.keys(keyToIndexModifier);

    const pressedKey = supportedKeys.find((key) => key === event.key);

    if (!pressedKey) {
      return;
    }

    event.preventDefault();

    const indexModifier = keyToIndexModifier[pressedKey];

    const nextElement = navigableElements[activeElementIndex + indexModifier];

    if (nextElement) {
      nextElement.focus();
    }
  });

  return (
    <div className="absolute w-full items-center overflow-y-auto rounded-b-16 border-0 border-border-subtlest-tertiary bg-background-default px-3 py-2 laptop:h-auto laptop:max-h-[30rem] laptop:border-x laptop:border-b laptop:bg-background-subtle laptop:shadow-2">
      <div className="flex flex-1 flex-col">
        <SearchPanelAction provider={SearchProviderEnum.Posts} />
        <SearchPanelAction provider={SearchProviderEnum.Chat} />
        {isExtension && (
          <SearchPanelAction provider={SearchProviderEnum.Google} />
        )}
        <SearchPanelTagSuggestions title="Tags" />
        <SearchPanelPostSuggestions title="Posts on daily.dev" />
        <SearchPanelSourceSuggestions title="Sources" />
        {isUserSearchEnabled && <SearchPanelUserSuggestions title="Users" />}
        <SearchPanelCustomAction
          provider={SearchProviderEnum.Posts}
          onClick={() => {
            logEvent({
              event_name: LogEvent.SubmitSearch,
              extra: JSON.stringify({
                query,
                provider: SearchProviderEnum.Posts,
              }),
            });

            search({
              provider: SearchProviderEnum.Posts,
              query,
            });
          }}
        >
          <div className="flex items-center justify-center text-text-tertiary typo-subhead">
            See more posts <ArrowIcon className="!size-4 rotate-90" />
          </div>
        </SearchPanelCustomAction>
      </div>
    </div>
  );
};

export default SearchPanelDropdown;
