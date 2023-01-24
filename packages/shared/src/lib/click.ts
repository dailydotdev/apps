export const combinedClicks = (func) => {
  return {
    onMouseUp: (event) => event.button === 1 && func,
    onClick: func,
  };
};
