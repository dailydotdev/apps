import React, { ReactElement, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import classNames from 'classnames';
import createDOMPurify from 'dompurify';
import MagnifyingIcon from '../../../icons/magnifying.svg';

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
    () => items.map((item) => ({ __html: DOMPurify.current.sanitize(item) })),
    [items],
  );

  useEffect(() => {
    DOMPurify.current = createDOMPurify(window);
  }, []);

  return createPortal(
    <div
      role="menu"
      className="react-contexify menu-secondary top-full mt-1"
      style={{
        position: 'absolute',
        top: placement?.y,
        left: placement?.x,
        opacity: isOpen ? 1 : 0,
        width: placement?.width,
      }}
    >
      {sanitizedItems.map((item, index) => (
        <div
          className={classNames(
            { focus: index === focusedItemIndex },
            'react-contexify__item',
          )}
          key={index}
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
