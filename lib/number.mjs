export function parseNumber(value) {
  return value
    .toLocaleString('it-IT', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
    .replace('.', ',')
}
