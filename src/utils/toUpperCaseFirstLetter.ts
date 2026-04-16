const toUpperCaseFirstLetter = (string: string) => {
  const splitedString = string.split('');
  const firstUpperLetter = splitedString[0].toUpperCase();
  const slicedString = splitedString.slice(1, splitedString.length).join('');
  const result = firstUpperLetter + slicedString;

  return result;
};

export { toUpperCaseFirstLetter };
