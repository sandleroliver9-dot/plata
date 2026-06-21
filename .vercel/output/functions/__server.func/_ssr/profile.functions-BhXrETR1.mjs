import { c as createServerRpc } from "./createServerRpc-DJgxn4SY.mjs";
import { a as createServerFn } from "./server-BjmrHUg4.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-DfWKUJS4.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "node:stream";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
const updateSavingTarget_createServerFn_handler = createServerRpc({
  id: "65f2c32628d3e32ea947e615c7e37077766a388cb6fbba203ae3860c04e416fd",
  name: "updateSavingTarget",
  filename: "src/lib/profile.functions.ts"
}, (opts) => updateSavingTarget.__executeServer(opts));
const updateSavingTarget = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((data) => data).handler(updateSavingTarget_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    error
  } = await supabase.from("profiles").update({
    saving_target: data.savingTarget
  }).eq("id", userId);
  if (error) throw error;
  return {
    ok: true
  };
});
const updateFinancialProfile_createServerFn_handler = createServerRpc({
  id: "f22f50eccfd39638dbbcaae729ae249d81d4cc4f6e6ae2d270db81284b66cd60",
  name: "updateFinancialProfile",
  filename: "src/lib/profile.functions.ts"
}, (opts) => updateFinancialProfile.__executeServer(opts));
const updateFinancialProfile = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((data) => data).handler(updateFinancialProfile_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const payDay = Math.max(1, Math.min(31, Math.round(Number(data.payDay) || 1)));
  const salary = Math.max(0, Number(data.salary) || 0);
  const savingTarget = Math.max(0, Math.min(80, Math.round(Number(data.savingTarget) || 0)));
  const {
    error
  } = await supabase.from("profiles").update({
    pay_day: payDay,
    salary,
    saving_target: savingTarget,
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", userId);
  if (error) throw error;
  return {
    ok: true
  };
});
export {
  updateFinancialProfile_createServerFn_handler,
  updateSavingTarget_createServerFn_handler
};
