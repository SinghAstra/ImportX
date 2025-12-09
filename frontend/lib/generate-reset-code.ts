export function generateResetCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function getExpirationTime(): Date {
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 10);
  return expiresAt;
}
