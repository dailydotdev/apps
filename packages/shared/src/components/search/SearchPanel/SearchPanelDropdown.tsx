import { ReactElement } from 'react';
import React from 'react-syntax-highlighter/dist/cjs/languages/hljs/1c';
import { SearchProviderEnum } from '../../../graphql/search';
import { isExtension } from '../../../lib/func';
import { LogEvent } from '../../../lib/log';
import { ArrowIcon } from '../../icons';
import { SearchPanelAction } from './SearchPanelAction';
import { SearchPanelCustomAction } from './SearchPanelCustomAction';
import { SearchPanelPostSuggestions } from './SearchPanelPostSuggestions';
import { SearchPanelSourceSuggestions } from './SearchPanelSourceSuggestions';
import { SearchPanelTagSuggestions } from './SearchPanelTagSuggestions';
import { SearchPanelUserSuggestions } from './SearchPanelUserSuggestions';
import { feature } from '../../../lib/featureManagement';
import { useConditionalFeature } from '../../../hooks';
import { useSearchProvider } from '../../../hooks/search';
import { useLogContext } from '../../../contexts/LogContext';

type Props = {
  query?: string;
};

const SearchPanelDropdown = ({ query = '' }: Props): ReactElement => {
  const { search } = useSearchProvider();
  const { logEvent } = useLogContext();

  const { value: isUserSearchEnabled } = useConditionalFeature({
    feature: feature.searchUsers,
    shouldEvaluate: true,
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
