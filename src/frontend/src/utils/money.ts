export function formatPrice(price: bigint): string {
  return `$${(Number(price) / 100).toFixed(2)}`;
}

export function calculateEffectivePrice(price: bigint, discount?: bigint): bigint {
  if (!discount) return price;
  return price - (price * discount) / 100n;
}

export function calculateLineTotal(price: bigint, quantity: number, discount?: bigint): bigint {
  const effectivePrice = calculateEffectivePrice(price, discount);
  return effectivePrice * BigInt(quantity);
}
