import { c as createSsrRpc } from "./createSsrRpc-CflJmRts.mjs";
import { a as createServerFn } from "./server-BjmrHUg4.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-DfWKUJS4.mjs";
const updateSavingTarget = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((data) => data).handler(createSsrRpc("65f2c32628d3e32ea947e615c7e37077766a388cb6fbba203ae3860c04e416fd"));
const updateFinancialProfile = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((data) => data).handler(createSsrRpc("f22f50eccfd39638dbbcaae729ae249d81d4cc4f6e6ae2d270db81284b66cd60"));
export {
  updateFinancialProfile as a,
  updateSavingTarget as u
};
