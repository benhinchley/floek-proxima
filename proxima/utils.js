export const randomInt = max => Math.floor(Math.random() * Math.floor(max));

export const scale = (vmin, vmax, nmin, nmax) => value => {
  const percent = (value - vmin) / (vmax - vmin);
  if (percent > 1.0) return nmax;
  if (percent < 0.0) return nmin;
  return percent * (nmax - nmin) + nmin;
};

export const range = total =>
  Array.apply(null, { length: total }).map(Number.call, Number);

export const round = (number, decimals = 1) =>
  Math.round(number * Math.pow(10, decimals)) / Math.pow(10, decimals);

export const max = numbers => {
  let max = numbers[0];
  for (let i = 1; i < numbers.length; i++) {
    let num = Math.sign(numbers[i]) === -1 ? numbers[i] * -1 : numbers[i];
    if (max < num) max = num;
  }
  return max;
};

export const isWithin = (value, min, max) => {
  if (value >= min && value <= max) return true;
  return false;
};
