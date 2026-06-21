import { c as createSsrRpc } from "./createSsrRpc-CflJmRts.mjs";
import { a as createServerFn } from "./server-BjmrHUg4.mjs";
const getDolares = createServerFn({
  method: "GET"
}).handler(createSsrRpc("eaf8331df52ae575fb4470a7caf5df65793363269e37688d3a44ee5ea30aa27e"));
const getCryptoQuotes = createServerFn({
  method: "POST"
}).inputValidator((d) => d).handler(createSsrRpc("694561fb274a914bc76bc6cb408218244b5b46fcbd24f148794d9a528f983d52"));
const getStockQuotes = createServerFn({
  method: "POST"
}).inputValidator((d) => d).handler(createSsrRpc("594479d7a2aa23e01c3a5c58ea29a01f9f1b267cb87c24a8a01d86ea4cd716ee"));
const getInflacion = createServerFn({
  method: "GET"
}).handler(createSsrRpc("15ef5c823b2f47a284b37f8f3c14c8b61c48248244ca2dc916327fb586ef332d"));
export {
  getStockQuotes as a,
  getCryptoQuotes as b,
  getDolares as c,
  getInflacion as g
};
