import React, { ReactElement, useMemo } from 'react';
import { createPortal } from 'react-dom';
import classNames from 'classnames';
import MagnifyingIcon from '../icons/Search';
import { useDomPurify } from '../../hooks/useDomPurify';

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
  const purify = useDomPurify();
  const sanitizedItems = useMemo(
    () =>
      items.map((item, index) => ({
        __html: purify?.sanitize?.(item),
        index,
      })),
    [items],
  );

  return createPortal(
    <div
      role="menu"
      className="react-contexify menu-secondary top-full mt-1"
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
