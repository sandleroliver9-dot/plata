import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Lemon Squeezy firma cada webhook con HMAC-SHA256 (hex) del body crudo,
 * usando el "Signing secret" configurado al crear el webhook, y lo manda en
 * el header `X-Signature`. Sin esto, cualquiera podría pegarle un POST a
 * este endpoint simulando una compra y desbloquearse la cuenta gratis.
 */
export function verifyLemonSqueezySignature(rawBody: string, signatureHeader: string | null, secret: string): boolean {
  if (!signatureHeader || !secret) return false;
  const expected = createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
  const expectedBuffer = Buffer.from(expected, "utf8");
  const receivedBuffer = Buffer.from(signatureHeader, "utf8");
  if (expectedBuffer.length !== receivedBuffer.length) return false;
  return timingSafeEqual(expectedBuffer, receivedBuffer);
}
