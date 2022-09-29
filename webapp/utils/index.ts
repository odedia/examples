export const generateValueRange = (min: number, max: number) => {
  return Math.random() * (max - min) + min;
}