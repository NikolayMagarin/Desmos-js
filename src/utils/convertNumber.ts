// convert number to string avoiding using exponential notation
export const convertNumber = (value: number) => {
  const decimalsPart = value?.toString()?.split('.')?.[1] || '';
  const eDecimals = Number(decimalsPart?.split('e-')?.[1]) || 0;
  const countOfDecimals = decimalsPart.length + eDecimals;
  return Number(value).toFixed(countOfDecimals);
};
