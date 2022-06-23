import React, { ReactElement, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import classNames from 'classnames';
import createDOMPurify from 'dompurify';
import MagnifyingIcon from '../icons/Search';

const preventDefault = (e: React.MouseEvent) => e.preventDefault();

export type AutoCompleteMenuProps = {
  placement: { x: number; y: number; width: number };
  focusedItemIndex: number;
  items: string[];
  onItemClick: (item: string) => unknown;
  isOpen: boolean;
};

export default function AutoCompleteMenu({
  placement,
  focusedItemIndex,
  items,
  onItemClick,
  isOpen,
}: AutoCompleteMenuProps): ReactElement {
  const DOMPurify = useRef<DOMPurify.DOMPurifyI>();
  const sanitizedItems = useMemo(
    () =>
      items.map((item, index) => ({
        __html: DOMPurify.current.sanitize(item),
        index,
      })),
    [items],
  );

  useEffect(() => {
    DOMPurify.current = createDOMPurify(window);
  }, []);

  return createPortal(
    <div
      role="menu"
      className="top-full mt-1 react-contexify menu-secondary"
      style={{
        position: 'absolute',
        top: placement?.y,
        left: placement?.x,
        opacity: isOpen ? 1 : 0,
        width: placement?.width ?? 0,
        transform: 'none',
      }}
    >
      {sanitizedItems.map((item, index) => (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions
        <div
          className={classNames(
            { focus: index === focusedItemIndex },
            'react-contexify__item',
          )}
          key={item.index}
          onClick={() => onItemClick(items[index])}
          onMouseDown={preventDefault}
        >
          <div className="react-contexify__item__content">
            <MagnifyingIcon />
            <span dangerouslySetInnerHTML={item} />
          </div>
        </div>
      ))}
    </div>,
    document.body,
  );
}
