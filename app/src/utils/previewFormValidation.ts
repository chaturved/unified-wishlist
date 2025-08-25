export function isValidURL(value: string) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export function isValidPrice(price: string) {
  const regex = "^(?:\\d+(?:\\.\\d+)?|N/A)$";
  return !!price.match(regex);
}

export function isValueNA(value: string) {
  return value.trim().toLowerCase() === "n/a";
}

export function isValidCurrency(currency: string) {
  const regex = "^[A-Z]{3}$";
  return !!currency.match(regex);
}
