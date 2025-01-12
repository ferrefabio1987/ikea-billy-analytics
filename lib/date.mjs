export function parseDate(today) {
  const day = String(today.getDate()).padStart(2, '0')
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const year = String(today.getFullYear()).slice(-2)
  return `${day}/${month}/${year}`
}
