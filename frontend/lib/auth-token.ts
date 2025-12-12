import crypto from "crypto";

export function generateAuthToken(userId: string): string {
  const secret = process.env.AUTH_SECRET_KEY;

  if (!secret) {
    throw new Error(
      "SERVER ERROR: AUTH_SECRET_KEY is missing in environment variables."
    );
  }

  // 1. Set Expiry (e.g., 60 seconds from now)
  // Since this is server-to-server, it happens instantly, so 1 minute is plenty.
  const expiry = Date.now() + 60 * 1000;

  // 2. Prepare Data to Sign
  const dataToSign = `${userId}:${expiry}`;

  // 3. Generate HMAC SHA256 Signature
  const signature = crypto
    .createHmac("sha256", secret)
    .update(dataToSign)
    .digest("hex");

  // 4. Return the combined token
  return `${dataToSign}:${signature}`;
}
