import { describe, expect, it } from "vitest";
import { mapRevenueCatStoreToPaymentSource, parseRevenueCatEvent } from "./revenuecat";

describe("parseRevenueCatEvent", () => {
  it("extrae type, app_user_id y store de un NON_RENEWING_PURCHASE típico", () => {
    const payload = {
      event: { type: "NON_RENEWING_PURCHASE", app_user_id: "user-123", store: "APP_STORE" },
    };
    expect(parseRevenueCatEvent(payload)).toEqual({ eventType: "NON_RENEWING_PURCHASE", userId: "user-123", store: "APP_STORE" });
  });

  it("devuelve null si no hay event", () => {
    expect(parseRevenueCatEvent({})).toBeNull();
    expect(parseRevenueCatEvent(null)).toBeNull();
  });

  it("devuelve null si event.type no es string", () => {
    expect(parseRevenueCatEvent({ event: {} })).toBeNull();
  });

  it("devuelve userId null si falta app_user_id", () => {
    const payload = { event: { type: "NON_RENEWING_PURCHASE" } };
    expect(parseRevenueCatEvent(payload)).toEqual({ eventType: "NON_RENEWING_PURCHASE", userId: null, store: null });
  });
});

describe("mapRevenueCatStoreToPaymentSource", () => {
  it("mapea APP_STORE y MAC_APP_STORE a apple", () => {
    expect(mapRevenueCatStoreToPaymentSource("APP_STORE")).toBe("apple");
    expect(mapRevenueCatStoreToPaymentSource("MAC_APP_STORE")).toBe("apple");
  });

  it("mapea PLAY_STORE a google", () => {
    expect(mapRevenueCatStoreToPaymentSource("PLAY_STORE")).toBe("google");
  });

  it("devuelve null para stores desconocidos o ausentes", () => {
    expect(mapRevenueCatStoreToPaymentSource("PROMOTIONAL")).toBeNull();
    expect(mapRevenueCatStoreToPaymentSource(null)).toBeNull();
  });
});
