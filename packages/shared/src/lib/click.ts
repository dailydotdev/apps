export const combinedClicks = (func) => {
  return {
    onMouseUp: (event) => event.button === 1 && func(event),
    onClick: func,
  };
};
