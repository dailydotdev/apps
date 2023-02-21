export function formToJson<T>(form: HTMLFormElement, initialValue?: T): T {
  return Array.from(form.elements).reduce((acc, val: HTMLInputElement) => {
    if (val.name === '') {
      return acc;
    }
    if (val.type === 'checkbox') {
      return { ...acc, [val.name]: val.checked };
    }
    if (val.type === 'radio' && !val.checked) {
      return acc;
    }
    return {
      ...acc,
      [val.name]: val.value.length ? val.value : null,
    };
  }, initialValue);
}
