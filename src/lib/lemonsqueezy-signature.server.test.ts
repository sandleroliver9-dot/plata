import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { verifyLemonSqueezySignature } from "./lemonsqueezy-signature.server";

describe("verifyLemonSqueezySignature", () => {
  const secret = "test-secret";
  const rawBody = JSON.stringify({ hola: "mundo" });

  it("acepta una firma válida", () => {
    const signature = createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
    expect(verifyLemonSqueezySignature(rawBody, signature, secret)).toBe(true);
  });

  it("rechaza una firma inválida", () => {
    expect(verifyLemonSqueezySignature(rawBody, "firma-trucha", secret)).toBe(false);
  });

  it("rechaza si falta el header", () => {
    expect(verifyLemonSqueezySignature(rawBody, null, secret)).toBe(false);
  });

  it("rechaza si falta el secret", () => {
    const signature = createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
    expect(verifyLemonSqueezySignature(rawBody, signature, "")).toBe(false);
  });

  it("no explota con firmas de largo distinto", () => {
    expect(verifyLemonSqueezySignature(rawBody, "abc", secret)).toBe(false);
  });
});
