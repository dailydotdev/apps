import React, { useMemo } from 'react';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { FilterIcon } from '../icons';
import ContextMenu from '../fields/ContextMenu';
import useContextMenu from '../../hooks/useContextMenu';
import { Checkbox } from '../fields/Checkbox';
import useFeedSettings from '../../hooks/useFeedSettings';
import { useAdvancedSettings } from '../../hooks';
import { getContentCurationList } from '../filters/helpers';
import { useSearchContextProvider } from '../../contexts/search/SearchContext';

const SEARCH_FILTER_POST_TYPE_CONTEXT_ID = 'search-filter-post-type-context';

const SearchFilterPostTypeButton = () => {
  const { onMenuClick, isOpen, onHide } = useContextMenu({
    id: SEARCH_FILTER_POST_TYPE_CONTEXT_ID,
  });
  const { postTypes, setPostTypes } = useSearchContextProvider();
  const { advancedSettings } = useFeedSettings();
  const { selectedSettings } = useAdvancedSettings();
  const contentList = useMemo(() => {
    return [...getContentCurationList(advancedSettings)].map((item) => ({
      name: item.title,
      checked: selectedSettings[item.id] ?? item.defaultEnabledState,
      type: item.options?.type,
    }));
  }, [advancedSettings, selectedSettings]);

  if (
    contentList.length &&
    Object.getOwnPropertyNames(postTypes).length === 0
  ) {
    setPostTypes(
      contentList.reduce((acc, cur) => {
        acc[cur.type] = cur.checked;
        return acc;
      }, {}),
    );
  }

  const setPostType = (type: string, checked: boolean) => {
    setPostTypes((prev) => ({ ...prev, [type]: checked }));
  };

  // Render checkboxes as custom content in the context menu
  const options = [
    {
      label: '',
      Wrapper: () => (
        <div
          className="flex flex-col gap-2 px-2 py-2"
          tabIndex={-1}
          role="menuitem"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          {contentList.map(({ name, type }) => (
            <Checkbox
              key={type}
              name={type}
              checked={!!postTypes[type]}
              onToggleCallback={(checked) => setPostType(type, checked)}
            >
              {name}
            </Checkbox>
          ))}
        </div>
      ),
    },
  ];

  return (
    <>
      <Button
        variant={ButtonVariant.Float}
        icon={<FilterIcon />}
        size={ButtonSize.Small}
        onClick={onMenuClick}
        aria-label="Open post type filter menu"
      />
      <ContextMenu
        id={SEARCH_FILTER_POST_TYPE_CONTEXT_ID}
        options={options}
        isOpen={isOpen}
        onHidden={onHide}
      />
    </>
  );
};

export default SearchFilterPostTypeButton;
