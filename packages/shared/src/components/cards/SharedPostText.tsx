import React, { ReactElement, useLayoutEffect, useRef } from 'react';

type SharedPostTextProps = {
  title: string;
  onHeightChange?: (height: number) => void;
};

export const SharedPostText = ({
  title,
  onHeightChange,
}: SharedPostTextProps): ReactElement => {
  const sharedPostTitleRef = useRef<HTMLDivElement>();
  useLayoutEffect(() => {
    if (!sharedPostTitleRef.current?.offsetHeight || !onHeightChange) {
      return;
    }
    onHeightChange(sharedPostTitleRef.current.offsetHeight);
  }, [sharedPostTitleRef.current?.offsetHeight]);

  return (
    <div className="px-2 pt-2 pb-3" ref={sharedPostTitleRef}>
      <p className="line-clamp-6 typo-callout">{title}</p>
    </div>
  );
};
