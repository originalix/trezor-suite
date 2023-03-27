export const convertTokenValueToDecimal = (value: string | number, decimals: number) =>
    Number(value) / 10 ** decimals;
