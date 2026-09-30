import { describe, expect, it } from "vitest";
import { buildLemonSqueezyCheckoutUrl, parseLemonSqueezyEvent } from "./lemonsqueezy";

describe("parseLemonSqueezyEvent", () => {
  it("extrae evento, user_id y status de un order_created típico", () => {
    const payload = {
      meta: { event_name: "order_created", custom_data: { user_id: "user-123" } },
      data: { attributes: { status: "paid" } },
    };
    expect(parseLemonSqueezyEvent(payload)).toEqual({ eventName: "order_created", userId: "user-123", status: "paid" });
  });

  it("devuelve userId null si no viene custom_data", () => {
    const payload = { meta: { event_name: "order_created" }, data: { attributes: { status: "paid" } } };
    expect(parseLemonSqueezyEvent(payload)).toEqual({ eventName: "order_created", userId: null, status: "paid" });
  });

  it("devuelve null si el payload no tiene forma de webhook", () => {
    expect(parseLemonSqueezyEvent({})).toBeNull();
    expect(parseLemonSqueezyEvent(null)).toBeNull();
  });
});

describe("buildLemonSqueezyCheckoutUrl", () => {
  it("agrega user_id y email como checkout overrides", () => {
    const url = buildLemonSqueezyCheckoutUrl("https://platium.lemonsqueezy.com/buy/abc-123", {
      userId: "user-123",
      email: "oliver@platium.app",
    });
    const parsed = new URL(url);
    expect(parsed.searchParams.get("checkout[custom][user_id]")).toBe("user-123");
    expect(parsed.searchParams.get("checkout[email]")).toBe("oliver@platium.app");
  });

  it("funciona sin email", () => {
    const url = buildLemonSqueezyCheckoutUrl("https://platium.lemonsqueezy.com/buy/abc-123", { userId: "user-123" });
    const parsed = new URL(url);
    expect(parsed.searchParams.get("checkout[custom][user_id]")).toBe("user-123");
    expect(parsed.searchParams.has("checkout[email]")).toBe(false);
  });
});
