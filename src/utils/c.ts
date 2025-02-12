export const convertScientificNotationNumber = (value: number) => {
  const decimalsPart = value?.toString()?.split('.')?.[1] || '';
  const eDecimals = Number(decimalsPart?.split('e-')?.[1]) || 0;
  const countOfDecimals = decimalsPart.length + eDecimals;
  return Number(value).toFixed(countOfDecimals);
  //0.4210854715202004e-14).toFixed(30)
};
