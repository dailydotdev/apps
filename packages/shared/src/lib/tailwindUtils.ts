export const addClassnameModifier = (modifier: string, classnames: string) => {
  return classnames
    .split(' ')
    .map((classname) => `${modifier}:${classname}`)
    .join(' ');
};
