"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
module.exports = void 0;
var _utils = require("./utils/index.cjs");
const DRIVER_NAME = "cloudflare-kv-binding";
var _default = (0, _utils.defineDriver)((opts = {}) => {
  const r = (key = "") => opts.base ? (0, _utils.joinKeys)(opts.base, key) : key;
  async function getKeys(base = "") {
    base = r(base);
    const binding = getBinding(opts.binding);
    const kvList = await binding.list(base ? {
      prefix: base
    } : void 0);
    return kvList.keys.map(key => key.name);
  }
  return {
    name: DRIVER_NAME,
    options: opts,
    async hasItem(key) {
      key = r(key);
      const binding = getBinding(opts.binding);
      return (await binding.get(key)) !== null;
    },
    getItem(key) {
      key = r(key);
      const binding = getBinding(opts.binding);
      return binding.get(key);
    },
    setItem(key, value) {
      key = r(key);
      const binding = getBinding(opts.binding);
      return binding.put(key, value);
    },
    removeItem(key) {
      key = r(key);
      const binding = getBinding(opts.binding);
      return binding.delete(key);
    },
    getKeys() {
      return getKeys().then(keys => keys.map(key => opts.base ? key.slice(opts.base.length) : key));
    },
    async clear(base) {
      const binding = getBinding(opts.binding);
      const keys = await getKeys(base);
      await Promise.all(keys.map(key => binding.delete(key)));
    }
  };
});
module.exports = _default;
function getBinding(binding = "STORAGE") {
  let bindingName = "[binding]";
  if (typeof binding === "string") {
    bindingName = binding;
    binding = globalThis[bindingName] || globalThis.__env__?.[bindingName];
  }
  if (!binding) {
    throw (0, _utils.createError)(DRIVER_NAME, `Invalid binding \`${bindingName}\`: \`${binding}\``);
  }
  for (const key of ["get", "put", "delete"]) {
    if (!(key in binding)) {
      throw (0, _utils.createError)(DRIVER_NAME, `Invalid binding \`${bindingName}\`: \`${key}\` key is missing`);
    }
  }
  return binding;
}