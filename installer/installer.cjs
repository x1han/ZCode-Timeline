#!/usr/bin/env node
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// installer/installer.mjs
var installer_exports = {};
__export(installer_exports, {
  main: () => main
});
module.exports = __toCommonJS(installer_exports);
var import_node_child_process3 = require("node:child_process");
var import_node_fs4 = require("node:fs");
var import_node_os3 = require("node:os");
var import_node_path9 = require("node:path");

// launcher/zcode-finder.mjs
var import_node_child_process = require("node:child_process");
var import_node_fs = require("node:fs");
var import_node_os = require("node:os");
var import_node_path = require("node:path");
var PATH_DELIM = process.platform === "win32" ? ";" : ":";
function buildCandidates() {
  const home = (0, import_node_os.homedir)();
  const explicit = [process.env.ZCODE_EXE];
  if (process.platform === "darwin") {
    return [
      ...explicit,
      "/Applications/ZCode.app/Contents/MacOS/ZCode",
      (0, import_node_path.join)(home, "Applications", "ZCode.app", "Contents", "MacOS", "ZCode"),
      ...pathDirs("ZCode")
    ].filter(Boolean);
  }
  if (process.platform === "linux") {
    return [
      ...explicit,
      "/opt/ZCode/ZCode",
      "/usr/local/ZCode/ZCode",
      (0, import_node_path.join)(home, ".local", "share", "ZCode", "ZCode"),
      ...pathDirs("ZCode")
    ].filter(Boolean);
  }
  const localAppData = process.env.LOCALAPPDATA || (0, import_node_path.join)(home, "AppData", "Local");
  return [
    ...explicit,
    "S:\\ZCode\\ZCode.exe",
    "S:\\zcode\\ZCode.exe",
    "C:\\ZCode\\ZCode.exe",
    "C:\\zcode\\ZCode.exe",
    "D:\\ZCode\\ZCode.exe",
    "D:\\zcode\\ZCode.exe",
    "E:\\ZCode\\ZCode.exe",
    "E:\\zcode\\ZCode.exe",
    (0, import_node_path.join)(localAppData, "Programs", "ZCode", "ZCode.exe"),
    (0, import_node_path.join)(localAppData, "Programs", "ZCode Desktop", "ZCode.exe"),
    (0, import_node_path.join)(home, "AppData", "Local", "Programs", "ZCode", "ZCode.exe"),
    "C:\\Program Files\\ZCode\\ZCode.exe",
    "C:\\Program Files (x86)\\ZCode\\ZCode.exe",
    ...pathDirs("ZCode.exe")
  ].filter(Boolean);
}
function pathDirs(name) {
  const out = [];
  for (const dir of (process.env.PATH || "").split(PATH_DELIM)) {
    if (!dir) continue;
    out.push((0, import_node_path.join)(dir, name));
  }
  return out;
}
function tryFile(p) {
  if (!p) return null;
  try {
    if ((0, import_node_fs.existsSync)(p)) return p;
  } catch {
  }
  return null;
}
function tryRunning() {
  if (process.platform !== "win32") return null;
  try {
    const cmd = `powershell -NoProfile -Command "$p = Get-Process -Name 'ZCode' -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty Path; if ($p) { $p } else { '' }"`;
    const out = (0, import_node_child_process.execSync)(cmd, { encoding: "utf8", timeout: 5e3, windowsHide: true }).trim();
    return out || null;
  } catch {
    return null;
  }
}
function findZCodeExe() {
  const explicit = tryFile(process.env.ZCODE_EXE);
  if (explicit) return { exePath: explicit, source: "env" };
  const running = tryRunning();
  if (running && tryFile(running)) return { exePath: running, source: "running" };
  for (const p of buildCandidates()) {
    const abs = tryFile(p);
    if (abs) return { exePath: abs, source: "candidate" };
  }
  throw new Error(
    "ZCode executable not found.\n  Set ZCODE_EXE to the full executable path.\n  The installer also searches common Windows, macOS, and Linux roots plus PATH."
  );
}

// node_modules/@electron/asar/lib/asar.js
var import_node_path6 = __toESM(require("node:path"), 1);

// node_modules/balanced-match/dist/esm/index.js
var balanced = (a, b, str) => {
  const ma = a instanceof RegExp ? maybeMatch(a, str) : a;
  const mb = b instanceof RegExp ? maybeMatch(b, str) : b;
  const r = ma !== null && mb != null && range(ma, mb, str);
  return r && {
    start: r[0],
    end: r[1],
    pre: str.slice(0, r[0]),
    body: str.slice(r[0] + ma.length, r[1]),
    post: str.slice(r[1] + mb.length)
  };
};
var maybeMatch = (reg, str) => {
  const m = str.match(reg);
  return m ? m[0] : null;
};
var range = (a, b, str) => {
  let begs, beg, left, right = void 0, result;
  let ai2 = str.indexOf(a);
  let bi2 = str.indexOf(b, ai2 + 1);
  let i = ai2;
  if (ai2 >= 0 && bi2 > 0) {
    if (a === b) {
      return [ai2, bi2];
    }
    begs = [];
    left = str.length;
    while (i >= 0 && !result) {
      if (i === ai2) {
        begs.push(i);
        ai2 = str.indexOf(a, i + 1);
      } else if (begs.length === 1) {
        const r = begs.pop();
        if (r !== void 0)
          result = [r, bi2];
      } else {
        beg = begs.pop();
        if (beg !== void 0 && beg < left) {
          left = beg;
          right = bi2;
        }
        bi2 = str.indexOf(b, i + 1);
      }
      i = ai2 < bi2 && ai2 >= 0 ? ai2 : bi2;
    }
    if (begs.length && right !== void 0) {
      result = [left, right];
    }
  }
  return result;
};

// node_modules/brace-expansion/dist/esm/index.js
var escSlash = "\0SLASH" + Math.random() + "\0";
var escOpen = "\0OPEN" + Math.random() + "\0";
var escClose = "\0CLOSE" + Math.random() + "\0";
var escComma = "\0COMMA" + Math.random() + "\0";
var escPeriod = "\0PERIOD" + Math.random() + "\0";
var escSlashPattern = new RegExp(escSlash, "g");
var escOpenPattern = new RegExp(escOpen, "g");
var escClosePattern = new RegExp(escClose, "g");
var escCommaPattern = new RegExp(escComma, "g");
var escPeriodPattern = new RegExp(escPeriod, "g");
var slashPattern = /\\\\/g;
var openPattern = /\\{/g;
var closePattern = /\\}/g;
var commaPattern = /\\,/g;
var periodPattern = /\\\./g;
var EXPANSION_MAX = 1e5;
function numeric(str) {
  return !isNaN(str) ? parseInt(str, 10) : str.charCodeAt(0);
}
function escapeBraces(str) {
  return str.replace(slashPattern, escSlash).replace(openPattern, escOpen).replace(closePattern, escClose).replace(commaPattern, escComma).replace(periodPattern, escPeriod);
}
function unescapeBraces(str) {
  return str.replace(escSlashPattern, "\\").replace(escOpenPattern, "{").replace(escClosePattern, "}").replace(escCommaPattern, ",").replace(escPeriodPattern, ".");
}
function parseCommaParts(str) {
  if (!str) {
    return [""];
  }
  const parts = [];
  const m = balanced("{", "}", str);
  if (!m) {
    return str.split(",");
  }
  const { pre, body, post } = m;
  const p = pre.split(",");
  p[p.length - 1] += "{" + body + "}";
  const postParts = parseCommaParts(post);
  if (post.length) {
    ;
    p[p.length - 1] += postParts.shift();
    p.push.apply(p, postParts);
  }
  parts.push.apply(parts, p);
  return parts;
}
function expand(str, options = {}) {
  if (!str) {
    return [];
  }
  const { max = EXPANSION_MAX } = options;
  if (str.slice(0, 2) === "{}") {
    str = "\\{\\}" + str.slice(2);
  }
  return expand_(escapeBraces(str), max, true).map(unescapeBraces);
}
function embrace(str) {
  return "{" + str + "}";
}
function isPadded(el) {
  return /^-?0\d/.test(el);
}
function lte(i, y) {
  return i <= y;
}
function gte(i, y) {
  return i >= y;
}
function expand_(str, max, isTop) {
  const expansions = [];
  for (; ; ) {
    const m = balanced("{", "}", str);
    if (!m)
      return [str];
    const pre = m.pre;
    if (/\$$/.test(m.pre)) {
      const post2 = m.post.length ? expand_(m.post, max, false) : [""];
      for (let k2 = 0; k2 < post2.length && k2 < max; k2++) {
        const expansion = pre + "{" + m.body + "}" + post2[k2];
        expansions.push(expansion);
      }
      return expansions;
    }
    const isNumericSequence = /^-?\d+\.\.-?\d+(?:\.\.-?\d+)?$/.test(m.body);
    const isAlphaSequence = /^[a-zA-Z]\.\.[a-zA-Z](?:\.\.-?\d+)?$/.test(m.body);
    const isSequence = isNumericSequence || isAlphaSequence;
    const isOptions = m.body.indexOf(",") >= 0;
    if (!isSequence && !isOptions) {
      if (m.post.match(/,(?!,).*\}/)) {
        str = m.pre + "{" + m.body + escClose + m.post;
        isTop = true;
        continue;
      }
      return [str];
    }
    const post = m.post.length ? expand_(m.post, max, false) : [""];
    let n7;
    if (isSequence) {
      n7 = m.body.split(/\.\./);
    } else {
      n7 = parseCommaParts(m.body);
      if (n7.length === 1 && n7[0] !== void 0) {
        n7 = expand_(n7[0], max, false).map(embrace);
        if (n7.length === 1) {
          return post.map((p) => m.pre + n7[0] + p);
        }
      }
    }
    let N2;
    if (isSequence && n7[0] !== void 0 && n7[1] !== void 0) {
      const x2 = numeric(n7[0]);
      const y = numeric(n7[1]);
      const width = Math.max(n7[0].length, n7[1].length);
      let incr = n7.length === 3 && n7[2] !== void 0 ? Math.max(Math.abs(numeric(n7[2])), 1) : 1;
      let test = lte;
      const reverse = y < x2;
      if (reverse) {
        incr *= -1;
        test = gte;
      }
      const pad = n7.some(isPadded);
      N2 = [];
      for (let i = x2; test(i, y) && N2.length < max; i += incr) {
        let c;
        if (isAlphaSequence) {
          c = String.fromCharCode(i);
          if (c === "\\") {
            c = "";
          }
        } else {
          c = String(i);
          if (pad) {
            const need = width - c.length;
            if (need > 0) {
              const z = new Array(need + 1).join("0");
              if (i < 0) {
                c = "-" + z + c.slice(1);
              } else {
                c = z + c;
              }
            }
          }
        }
        N2.push(c);
      }
    } else {
      N2 = [];
      for (let j2 = 0; j2 < n7.length; j2++) {
        N2.push.apply(N2, expand_(n7[j2], max, false));
      }
    }
    for (let j2 = 0; j2 < N2.length; j2++) {
      for (let k2 = 0; k2 < post.length && expansions.length < max; k2++) {
        const expansion = pre + N2[j2] + post[k2];
        if (!isTop || isSequence || expansion) {
          expansions.push(expansion);
        }
      }
    }
    return expansions;
  }
}

// node_modules/minimatch/dist/esm/assert-valid-pattern.js
var MAX_PATTERN_LENGTH = 1024 * 64;
var assertValidPattern = (pattern) => {
  if (typeof pattern !== "string") {
    throw new TypeError("invalid pattern");
  }
  if (pattern.length > MAX_PATTERN_LENGTH) {
    throw new TypeError("pattern is too long");
  }
};

// node_modules/minimatch/dist/esm/brace-expressions.js
var posixClasses = {
  "[:alnum:]": ["\\p{L}\\p{Nl}\\p{Nd}", true],
  "[:alpha:]": ["\\p{L}\\p{Nl}", true],
  "[:ascii:]": ["\\x00-\\x7f", false],
  "[:blank:]": ["\\p{Zs}\\t", true],
  "[:cntrl:]": ["\\p{Cc}", true],
  "[:digit:]": ["\\p{Nd}", true],
  "[:graph:]": ["\\p{Z}\\p{C}", true, true],
  "[:lower:]": ["\\p{Ll}", true],
  "[:print:]": ["\\p{C}", true],
  "[:punct:]": ["\\p{P}", true],
  "[:space:]": ["\\p{Z}\\t\\r\\n\\v\\f", true],
  "[:upper:]": ["\\p{Lu}", true],
  "[:word:]": ["\\p{L}\\p{Nl}\\p{Nd}\\p{Pc}", true],
  "[:xdigit:]": ["A-Fa-f0-9", false]
};
var braceEscape = (s) => s.replace(/[[\]\\-]/g, "\\$&");
var regexpEscape = (s) => s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
var rangesToString = (ranges) => ranges.join("");
var parseClass = (glob, position) => {
  const pos = position;
  if (glob.charAt(pos) !== "[") {
    throw new Error("not in a brace expression");
  }
  const ranges = [];
  const negs = [];
  let i = pos + 1;
  let sawStart = false;
  let uflag = false;
  let escaping = false;
  let negate = false;
  let endPos = pos;
  let rangeStart = "";
  WHILE: while (i < glob.length) {
    const c = glob.charAt(i);
    if ((c === "!" || c === "^") && i === pos + 1) {
      negate = true;
      i++;
      continue;
    }
    if (c === "]" && sawStart && !escaping) {
      endPos = i + 1;
      break;
    }
    sawStart = true;
    if (c === "\\") {
      if (!escaping) {
        escaping = true;
        i++;
        continue;
      }
    }
    if (c === "[" && !escaping) {
      for (const [cls, [unip, u, neg]] of Object.entries(posixClasses)) {
        if (glob.startsWith(cls, i)) {
          if (rangeStart) {
            return ["$.", false, glob.length - pos, true];
          }
          i += cls.length;
          if (neg)
            negs.push(unip);
          else
            ranges.push(unip);
          uflag = uflag || u;
          continue WHILE;
        }
      }
    }
    escaping = false;
    if (rangeStart) {
      if (c > rangeStart) {
        ranges.push(braceEscape(rangeStart) + "-" + braceEscape(c));
      } else if (c === rangeStart) {
        ranges.push(braceEscape(c));
      }
      rangeStart = "";
      i++;
      continue;
    }
    if (glob.startsWith("-]", i + 1)) {
      ranges.push(braceEscape(c + "-"));
      i += 2;
      continue;
    }
    if (glob.startsWith("-", i + 1)) {
      rangeStart = c;
      i += 2;
      continue;
    }
    ranges.push(braceEscape(c));
    i++;
  }
  if (endPos < i) {
    return ["", false, 0, false];
  }
  if (!ranges.length && !negs.length) {
    return ["$.", false, glob.length - pos, true];
  }
  if (negs.length === 0 && ranges.length === 1 && /^\\?.$/.test(ranges[0]) && !negate) {
    const r = ranges[0].length === 2 ? ranges[0].slice(-1) : ranges[0];
    return [regexpEscape(r), false, endPos - pos, false];
  }
  const sranges = "[" + (negate ? "^" : "") + rangesToString(ranges) + "]";
  const snegs = "[" + (negate ? "" : "^") + rangesToString(negs) + "]";
  const comb = ranges.length && negs.length ? "(" + sranges + "|" + snegs + ")" : ranges.length ? sranges : snegs;
  return [comb, uflag, endPos - pos, true];
};

// node_modules/minimatch/dist/esm/unescape.js
var unescape = (s, { windowsPathsNoEscape = false, magicalBraces = true } = {}) => {
  if (magicalBraces) {
    return windowsPathsNoEscape ? s.replace(/\[([^/\\])\]/g, "$1") : s.replace(/((?!\\).|^)\[([^/\\])\]/g, "$1$2").replace(/\\([^/])/g, "$1");
  }
  return windowsPathsNoEscape ? s.replace(/\[([^/\\{}])\]/g, "$1") : s.replace(/((?!\\).|^)\[([^/\\{}])\]/g, "$1$2").replace(/\\([^/{}])/g, "$1");
};

// node_modules/minimatch/dist/esm/ast.js
var _a;
var types = /* @__PURE__ */ new Set(["!", "?", "+", "*", "@"]);
var isExtglobType = (c) => types.has(c);
var isExtglobAST = (c) => isExtglobType(c.type);
var adoptionMap = /* @__PURE__ */ new Map([
  ["!", ["@"]],
  ["?", ["?", "@"]],
  ["@", ["@"]],
  ["*", ["*", "+", "?", "@"]],
  ["+", ["+", "@"]]
]);
var adoptionWithSpaceMap = /* @__PURE__ */ new Map([
  ["!", ["?"]],
  ["@", ["?"]],
  ["+", ["?", "*"]]
]);
var adoptionAnyMap = /* @__PURE__ */ new Map([
  ["!", ["?", "@"]],
  ["?", ["?", "@"]],
  ["@", ["?", "@"]],
  ["*", ["*", "+", "?", "@"]],
  ["+", ["+", "@", "?", "*"]]
]);
var usurpMap = /* @__PURE__ */ new Map([
  ["!", /* @__PURE__ */ new Map([["!", "@"]])],
  [
    "?",
    /* @__PURE__ */ new Map([
      ["*", "*"],
      ["+", "*"]
    ])
  ],
  [
    "@",
    /* @__PURE__ */ new Map([
      ["!", "!"],
      ["?", "?"],
      ["@", "@"],
      ["*", "*"],
      ["+", "+"]
    ])
  ],
  [
    "+",
    /* @__PURE__ */ new Map([
      ["?", "*"],
      ["*", "*"]
    ])
  ]
]);
var startNoTraversal = "(?!(?:^|/)\\.\\.?(?:$|/))";
var startNoDot = "(?!\\.)";
var addPatternStart = /* @__PURE__ */ new Set(["[", "."]);
var justDots = /* @__PURE__ */ new Set(["..", "."]);
var reSpecials = new Set("().*{}+?[]^$\\!");
var regExpEscape = (s) => s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
var qmark = "[^/]";
var star = qmark + "*?";
var starNoEmpty = qmark + "+?";
var ID = 0;
var AST = class {
  type;
  #root;
  #hasMagic;
  #uflag = false;
  #parts = [];
  #parent;
  #parentIndex;
  #negs;
  #filledNegs = false;
  #options;
  #toString;
  // set to true if it's an extglob with no children
  // (which really means one child of '')
  #emptyExt = false;
  id = ++ID;
  get depth() {
    return (this.#parent?.depth ?? -1) + 1;
  }
  [Symbol.for("nodejs.util.inspect.custom")]() {
    return {
      "@@type": "AST",
      id: this.id,
      type: this.type,
      root: this.#root.id,
      parent: this.#parent?.id,
      depth: this.depth,
      partsLength: this.#parts.length,
      parts: this.#parts
    };
  }
  constructor(type, parent, options = {}) {
    this.type = type;
    if (type)
      this.#hasMagic = true;
    this.#parent = parent;
    this.#root = this.#parent ? this.#parent.#root : this;
    this.#options = this.#root === this ? options : this.#root.#options;
    this.#negs = this.#root === this ? [] : this.#root.#negs;
    if (type === "!" && !this.#root.#filledNegs)
      this.#negs.push(this);
    this.#parentIndex = this.#parent ? this.#parent.#parts.length : 0;
  }
  get hasMagic() {
    if (this.#hasMagic !== void 0)
      return this.#hasMagic;
    for (const p of this.#parts) {
      if (typeof p === "string")
        continue;
      if (p.type || p.hasMagic)
        return this.#hasMagic = true;
    }
    return this.#hasMagic;
  }
  // reconstructs the pattern
  toString() {
    return this.#toString !== void 0 ? this.#toString : !this.type ? this.#toString = this.#parts.map((p) => String(p)).join("") : this.#toString = this.type + "(" + this.#parts.map((p) => String(p)).join("|") + ")";
  }
  #fillNegs() {
    if (this !== this.#root)
      throw new Error("should only call on root");
    if (this.#filledNegs)
      return this;
    this.toString();
    this.#filledNegs = true;
    let n7;
    while (n7 = this.#negs.pop()) {
      if (n7.type !== "!")
        continue;
      let p = n7;
      let pp = p.#parent;
      while (pp) {
        for (let i = p.#parentIndex + 1; !pp.type && i < pp.#parts.length; i++) {
          for (const part of n7.#parts) {
            if (typeof part === "string") {
              throw new Error("string part in extglob AST??");
            }
            part.copyIn(pp.#parts[i]);
          }
        }
        p = pp;
        pp = p.#parent;
      }
    }
    return this;
  }
  push(...parts) {
    for (const p of parts) {
      if (p === "")
        continue;
      if (typeof p !== "string" && !(p instanceof _a && p.#parent === this)) {
        throw new Error("invalid part: " + p);
      }
      this.#parts.push(p);
    }
  }
  toJSON() {
    const ret = this.type === null ? this.#parts.slice().map((p) => typeof p === "string" ? p : p.toJSON()) : [this.type, ...this.#parts.map((p) => p.toJSON())];
    if (this.isStart() && !this.type)
      ret.unshift([]);
    if (this.isEnd() && (this === this.#root || this.#root.#filledNegs && this.#parent?.type === "!")) {
      ret.push({});
    }
    return ret;
  }
  isStart() {
    if (this.#root === this)
      return true;
    if (!this.#parent?.isStart())
      return false;
    if (this.#parentIndex === 0)
      return true;
    const p = this.#parent;
    for (let i = 0; i < this.#parentIndex; i++) {
      const pp = p.#parts[i];
      if (!(pp instanceof _a && pp.type === "!")) {
        return false;
      }
    }
    return true;
  }
  isEnd() {
    if (this.#root === this)
      return true;
    if (this.#parent?.type === "!")
      return true;
    if (!this.#parent?.isEnd())
      return false;
    if (!this.type)
      return this.#parent?.isEnd();
    const pl = this.#parent ? this.#parent.#parts.length : 0;
    return this.#parentIndex === pl - 1;
  }
  copyIn(part) {
    if (typeof part === "string")
      this.push(part);
    else
      this.push(part.clone(this));
  }
  clone(parent) {
    const c = new _a(this.type, parent);
    for (const p of this.#parts) {
      c.copyIn(p);
    }
    return c;
  }
  static #parseAST(str, ast, pos, opt, extDepth) {
    const maxDepth = opt.maxExtglobRecursion ?? 2;
    let escaping = false;
    let inBrace = false;
    let braceStart = -1;
    let braceNeg = false;
    if (ast.type === null) {
      let i2 = pos;
      let acc2 = "";
      while (i2 < str.length) {
        const c = str.charAt(i2++);
        if (escaping || c === "\\") {
          escaping = !escaping;
          acc2 += c;
          continue;
        }
        if (inBrace) {
          if (i2 === braceStart + 1) {
            if (c === "^" || c === "!") {
              braceNeg = true;
            }
          } else if (c === "]" && !(i2 === braceStart + 2 && braceNeg)) {
            inBrace = false;
          }
          acc2 += c;
          continue;
        } else if (c === "[") {
          inBrace = true;
          braceStart = i2;
          braceNeg = false;
          acc2 += c;
          continue;
        }
        const doRecurse = !opt.noext && isExtglobType(c) && str.charAt(i2) === "(" && extDepth <= maxDepth;
        if (doRecurse) {
          ast.push(acc2);
          acc2 = "";
          const ext2 = new _a(c, ast);
          i2 = _a.#parseAST(str, ext2, i2, opt, extDepth + 1);
          ast.push(ext2);
          continue;
        }
        acc2 += c;
      }
      ast.push(acc2);
      return i2;
    }
    let i = pos + 1;
    let part = new _a(null, ast);
    const parts = [];
    let acc = "";
    while (i < str.length) {
      const c = str.charAt(i++);
      if (escaping || c === "\\") {
        escaping = !escaping;
        acc += c;
        continue;
      }
      if (inBrace) {
        if (i === braceStart + 1) {
          if (c === "^" || c === "!") {
            braceNeg = true;
          }
        } else if (c === "]" && !(i === braceStart + 2 && braceNeg)) {
          inBrace = false;
        }
        acc += c;
        continue;
      } else if (c === "[") {
        inBrace = true;
        braceStart = i;
        braceNeg = false;
        acc += c;
        continue;
      }
      const doRecurse = !opt.noext && isExtglobType(c) && str.charAt(i) === "(" && /* c8 ignore start - the maxDepth is sufficient here */
      (extDepth <= maxDepth || ast && ast.#canAdoptType(c));
      if (doRecurse) {
        const depthAdd = ast && ast.#canAdoptType(c) ? 0 : 1;
        part.push(acc);
        acc = "";
        const ext2 = new _a(c, part);
        part.push(ext2);
        i = _a.#parseAST(str, ext2, i, opt, extDepth + depthAdd);
        continue;
      }
      if (c === "|") {
        part.push(acc);
        acc = "";
        parts.push(part);
        part = new _a(null, ast);
        continue;
      }
      if (c === ")") {
        if (acc === "" && ast.#parts.length === 0) {
          ast.#emptyExt = true;
        }
        part.push(acc);
        acc = "";
        ast.push(...parts, part);
        return i;
      }
      acc += c;
    }
    ast.type = null;
    ast.#hasMagic = void 0;
    ast.#parts = [str.substring(pos - 1)];
    return i;
  }
  #canAdoptWithSpace(child) {
    return this.#canAdopt(child, adoptionWithSpaceMap);
  }
  #canAdopt(child, map = adoptionMap) {
    if (!child || typeof child !== "object" || child.type !== null || child.#parts.length !== 1 || this.type === null) {
      return false;
    }
    const gc = child.#parts[0];
    if (!gc || typeof gc !== "object" || gc.type === null) {
      return false;
    }
    return this.#canAdoptType(gc.type, map);
  }
  #canAdoptType(c, map = adoptionAnyMap) {
    return !!map.get(this.type)?.includes(c);
  }
  #adoptWithSpace(child, index) {
    const gc = child.#parts[0];
    const blank = new _a(null, gc, this.options);
    blank.#parts.push("");
    gc.push(blank);
    this.#adopt(child, index);
  }
  #adopt(child, index) {
    const gc = child.#parts[0];
    this.#parts.splice(index, 1, ...gc.#parts);
    for (const p of gc.#parts) {
      if (typeof p === "object")
        p.#parent = this;
    }
    this.#toString = void 0;
  }
  #canUsurpType(c) {
    const m = usurpMap.get(this.type);
    return !!m?.has(c);
  }
  #canUsurp(child) {
    if (!child || typeof child !== "object" || child.type !== null || child.#parts.length !== 1 || this.type === null || this.#parts.length !== 1) {
      return false;
    }
    const gc = child.#parts[0];
    if (!gc || typeof gc !== "object" || gc.type === null) {
      return false;
    }
    return this.#canUsurpType(gc.type);
  }
  #usurp(child) {
    const m = usurpMap.get(this.type);
    const gc = child.#parts[0];
    const nt2 = m?.get(gc.type);
    if (!nt2)
      return false;
    this.#parts = gc.#parts;
    for (const p of this.#parts) {
      if (typeof p === "object") {
        p.#parent = this;
      }
    }
    this.type = nt2;
    this.#toString = void 0;
    this.#emptyExt = false;
  }
  static fromGlob(pattern, options = {}) {
    const ast = new _a(null, void 0, options);
    _a.#parseAST(pattern, ast, 0, options, 0);
    return ast;
  }
  // returns the regular expression if there's magic, or the unescaped
  // string if not.
  toMMPattern() {
    if (this !== this.#root)
      return this.#root.toMMPattern();
    const glob = this.toString();
    const [re2, body, hasMagic, uflag] = this.toRegExpSource();
    const anyMagic = hasMagic || this.#hasMagic || this.#options.nocase && !this.#options.nocaseMagicOnly && glob.toUpperCase() !== glob.toLowerCase();
    if (!anyMagic) {
      return body;
    }
    const flags = (this.#options.nocase ? "i" : "") + (uflag ? "u" : "");
    return Object.assign(new RegExp(`^${re2}$`, flags), {
      _src: re2,
      _glob: glob
    });
  }
  get options() {
    return this.#options;
  }
  // returns the string match, the regexp source, whether there's magic
  // in the regexp (so a regular expression is required) and whether or
  // not the uflag is needed for the regular expression (for posix classes)
  // TODO: instead of injecting the start/end at this point, just return
  // the BODY of the regexp, along with the start/end portions suitable
  // for binding the start/end in either a joined full-path makeRe context
  // (where we bind to (^|/), or a standalone matchPart context (where
  // we bind to ^, and not /).  Otherwise slashes get duped!
  //
  // In part-matching mode, the start is:
  // - if not isStart: nothing
  // - if traversal possible, but not allowed: ^(?!\.\.?$)
  // - if dots allowed or not possible: ^
  // - if dots possible and not allowed: ^(?!\.)
  // end is:
  // - if not isEnd(): nothing
  // - else: $
  //
  // In full-path matching mode, we put the slash at the START of the
  // pattern, so start is:
  // - if first pattern: same as part-matching mode
  // - if not isStart(): nothing
  // - if traversal possible, but not allowed: /(?!\.\.?(?:$|/))
  // - if dots allowed or not possible: /
  // - if dots possible and not allowed: /(?!\.)
  // end is:
  // - if last pattern, same as part-matching mode
  // - else nothing
  //
  // Always put the (?:$|/) on negated tails, though, because that has to be
  // there to bind the end of the negated pattern portion, and it's easier to
  // just stick it in now rather than try to inject it later in the middle of
  // the pattern.
  //
  // We can just always return the same end, and leave it up to the caller
  // to know whether it's going to be used joined or in parts.
  // And, if the start is adjusted slightly, can do the same there:
  // - if not isStart: nothing
  // - if traversal possible, but not allowed: (?:/|^)(?!\.\.?$)
  // - if dots allowed or not possible: (?:/|^)
  // - if dots possible and not allowed: (?:/|^)(?!\.)
  //
  // But it's better to have a simpler binding without a conditional, for
  // performance, so probably better to return both start options.
  //
  // Then the caller just ignores the end if it's not the first pattern,
  // and the start always gets applied.
  //
  // But that's always going to be $ if it's the ending pattern, or nothing,
  // so the caller can just attach $ at the end of the pattern when building.
  //
  // So the todo is:
  // - better detect what kind of start is needed
  // - return both flavors of starting pattern
  // - attach $ at the end of the pattern when creating the actual RegExp
  //
  // Ah, but wait, no, that all only applies to the root when the first pattern
  // is not an extglob. If the first pattern IS an extglob, then we need all
  // that dot prevention biz to live in the extglob portions, because eg
  // +(*|.x*) can match .xy but not .yx.
  //
  // So, return the two flavors if it's #root and the first child is not an
  // AST, otherwise leave it to the child AST to handle it, and there,
  // use the (?:^|/) style of start binding.
  //
  // Even simplified further:
  // - Since the start for a join is eg /(?!\.) and the start for a part
  // is ^(?!\.), we can just prepend (?!\.) to the pattern (either root
  // or start or whatever) and prepend ^ or / at the Regexp construction.
  toRegExpSource(allowDot) {
    const dot = allowDot ?? !!this.#options.dot;
    if (this.#root === this) {
      this.#flatten();
      this.#fillNegs();
    }
    if (!isExtglobAST(this)) {
      const noEmpty = this.isStart() && this.isEnd() && !this.#parts.some((s) => typeof s !== "string");
      const src = this.#parts.map((p) => {
        const [re2, _2, hasMagic, uflag] = typeof p === "string" ? _a.#parseGlob(p, this.#hasMagic, noEmpty) : p.toRegExpSource(allowDot);
        this.#hasMagic = this.#hasMagic || hasMagic;
        this.#uflag = this.#uflag || uflag;
        return re2;
      }).join("");
      let start2 = "";
      if (this.isStart()) {
        if (typeof this.#parts[0] === "string") {
          const dotTravAllowed = this.#parts.length === 1 && justDots.has(this.#parts[0]);
          if (!dotTravAllowed) {
            const aps = addPatternStart;
            const needNoTrav = (
              // dots are allowed, and the pattern starts with [ or .
              dot && aps.has(src.charAt(0)) || // the pattern starts with \., and then [ or .
              src.startsWith("\\.") && aps.has(src.charAt(2)) || // the pattern starts with \.\., and then [ or .
              src.startsWith("\\.\\.") && aps.has(src.charAt(4))
            );
            const needNoDot = !dot && !allowDot && aps.has(src.charAt(0));
            start2 = needNoTrav ? startNoTraversal : needNoDot ? startNoDot : "";
          }
        }
      }
      let end = "";
      if (this.isEnd() && this.#root.#filledNegs && this.#parent?.type === "!") {
        end = "(?:$|\\/)";
      }
      const final2 = start2 + src + end;
      return [
        final2,
        unescape(src),
        this.#hasMagic = !!this.#hasMagic,
        this.#uflag
      ];
    }
    const repeated = this.type === "*" || this.type === "+";
    const start = this.type === "!" ? "(?:(?!(?:" : "(?:";
    let body = this.#partsToRegExp(dot);
    if (this.isStart() && this.isEnd() && !body && this.type !== "!") {
      const s = this.toString();
      const me2 = this;
      me2.#parts = [s];
      me2.type = null;
      me2.#hasMagic = void 0;
      return [s, unescape(this.toString()), false, false];
    }
    let bodyDotAllowed = !repeated || allowDot || dot || !startNoDot ? "" : this.#partsToRegExp(true);
    if (bodyDotAllowed === body) {
      bodyDotAllowed = "";
    }
    if (bodyDotAllowed) {
      body = `(?:${body})(?:${bodyDotAllowed})*?`;
    }
    let final = "";
    if (this.type === "!" && this.#emptyExt) {
      final = (this.isStart() && !dot ? startNoDot : "") + starNoEmpty;
    } else {
      const close = this.type === "!" ? (
        // !() must match something,but !(x) can match ''
        "))" + (this.isStart() && !dot && !allowDot ? startNoDot : "") + star + ")"
      ) : this.type === "@" ? ")" : this.type === "?" ? ")?" : this.type === "+" && bodyDotAllowed ? ")" : this.type === "*" && bodyDotAllowed ? `)?` : `)${this.type}`;
      final = start + body + close;
    }
    return [
      final,
      unescape(body),
      this.#hasMagic = !!this.#hasMagic,
      this.#uflag
    ];
  }
  #flatten() {
    if (!isExtglobAST(this)) {
      for (const p of this.#parts) {
        if (typeof p === "object") {
          p.#flatten();
        }
      }
    } else {
      let iterations = 0;
      let done = false;
      do {
        done = true;
        for (let i = 0; i < this.#parts.length; i++) {
          const c = this.#parts[i];
          if (typeof c === "object") {
            c.#flatten();
            if (this.#canAdopt(c)) {
              done = false;
              this.#adopt(c, i);
            } else if (this.#canAdoptWithSpace(c)) {
              done = false;
              this.#adoptWithSpace(c, i);
            } else if (this.#canUsurp(c)) {
              done = false;
              this.#usurp(c);
            }
          }
        }
      } while (!done && ++iterations < 10);
    }
    this.#toString = void 0;
  }
  #partsToRegExp(dot) {
    return this.#parts.map((p) => {
      if (typeof p === "string") {
        throw new Error("string type in extglob ast??");
      }
      const [re2, _2, _hasMagic, uflag] = p.toRegExpSource(dot);
      this.#uflag = this.#uflag || uflag;
      return re2;
    }).filter((p) => !(this.isStart() && this.isEnd()) || !!p).join("|");
  }
  static #parseGlob(glob, hasMagic, noEmpty = false) {
    let escaping = false;
    let re2 = "";
    let uflag = false;
    let inStar = false;
    for (let i = 0; i < glob.length; i++) {
      const c = glob.charAt(i);
      if (escaping) {
        escaping = false;
        re2 += (reSpecials.has(c) ? "\\" : "") + c;
        continue;
      }
      if (c === "*") {
        if (inStar)
          continue;
        inStar = true;
        re2 += noEmpty && /^[*]+$/.test(glob) ? starNoEmpty : star;
        hasMagic = true;
        continue;
      } else {
        inStar = false;
      }
      if (c === "\\") {
        if (i === glob.length - 1) {
          re2 += "\\\\";
        } else {
          escaping = true;
        }
        continue;
      }
      if (c === "[") {
        const [src, needUflag, consumed, magic] = parseClass(glob, i);
        if (consumed) {
          re2 += src;
          uflag = uflag || needUflag;
          i += consumed - 1;
          hasMagic = hasMagic || magic;
          continue;
        }
      }
      if (c === "?") {
        re2 += qmark;
        hasMagic = true;
        continue;
      }
      re2 += regExpEscape(c);
    }
    return [re2, unescape(glob), !!hasMagic, uflag];
  }
};
_a = AST;

// node_modules/minimatch/dist/esm/escape.js
var escape = (s, { windowsPathsNoEscape = false, magicalBraces = false } = {}) => {
  if (magicalBraces) {
    return windowsPathsNoEscape ? s.replace(/[?*()[\]{}]/g, "[$&]") : s.replace(/[?*()[\]\\{}]/g, "\\$&");
  }
  return windowsPathsNoEscape ? s.replace(/[?*()[\]]/g, "[$&]") : s.replace(/[?*()[\]\\]/g, "\\$&");
};

// node_modules/minimatch/dist/esm/index.js
var minimatch = (p, pattern, options = {}) => {
  assertValidPattern(pattern);
  if (!options.nocomment && pattern.charAt(0) === "#") {
    return false;
  }
  return new Minimatch(pattern, options).match(p);
};
var starDotExtRE = /^\*+([^+@!?*[(]*)$/;
var starDotExtTest = (ext2) => (f) => !f.startsWith(".") && f.endsWith(ext2);
var starDotExtTestDot = (ext2) => (f) => f.endsWith(ext2);
var starDotExtTestNocase = (ext2) => {
  ext2 = ext2.toLowerCase();
  return (f) => !f.startsWith(".") && f.toLowerCase().endsWith(ext2);
};
var starDotExtTestNocaseDot = (ext2) => {
  ext2 = ext2.toLowerCase();
  return (f) => f.toLowerCase().endsWith(ext2);
};
var starDotStarRE = /^\*+\.\*+$/;
var starDotStarTest = (f) => !f.startsWith(".") && f.includes(".");
var starDotStarTestDot = (f) => f !== "." && f !== ".." && f.includes(".");
var dotStarRE = /^\.\*+$/;
var dotStarTest = (f) => f !== "." && f !== ".." && f.startsWith(".");
var starRE = /^\*+$/;
var starTest = (f) => f.length !== 0 && !f.startsWith(".");
var starTestDot = (f) => f.length !== 0 && f !== "." && f !== "..";
var qmarksRE = /^\?+([^+@!?*[(]*)?$/;
var qmarksTestNocase = ([$0, ext2 = ""]) => {
  const noext = qmarksTestNoExt([$0]);
  if (!ext2)
    return noext;
  ext2 = ext2.toLowerCase();
  return (f) => noext(f) && f.toLowerCase().endsWith(ext2);
};
var qmarksTestNocaseDot = ([$0, ext2 = ""]) => {
  const noext = qmarksTestNoExtDot([$0]);
  if (!ext2)
    return noext;
  ext2 = ext2.toLowerCase();
  return (f) => noext(f) && f.toLowerCase().endsWith(ext2);
};
var qmarksTestDot = ([$0, ext2 = ""]) => {
  const noext = qmarksTestNoExtDot([$0]);
  return !ext2 ? noext : (f) => noext(f) && f.endsWith(ext2);
};
var qmarksTest = ([$0, ext2 = ""]) => {
  const noext = qmarksTestNoExt([$0]);
  return !ext2 ? noext : (f) => noext(f) && f.endsWith(ext2);
};
var qmarksTestNoExt = ([$0]) => {
  const len = $0.length;
  return (f) => f.length === len && !f.startsWith(".");
};
var qmarksTestNoExtDot = ([$0]) => {
  const len = $0.length;
  return (f) => f.length === len && f !== "." && f !== "..";
};
var defaultPlatform = typeof process === "object" && process ? typeof process.env === "object" && process.env && process.env.__MINIMATCH_TESTING_PLATFORM__ || process.platform : "posix";
var path = {
  win32: { sep: "\\" },
  posix: { sep: "/" }
};
var sep = defaultPlatform === "win32" ? path.win32.sep : path.posix.sep;
minimatch.sep = sep;
var GLOBSTAR = Symbol("globstar **");
minimatch.GLOBSTAR = GLOBSTAR;
var qmark2 = "[^/]";
var star2 = qmark2 + "*?";
var twoStarDot = "(?:(?!(?:\\/|^)(?:\\.{1,2})($|\\/)).)*?";
var twoStarNoDot = "(?:(?!(?:\\/|^)\\.).)*?";
var filter = (pattern, options = {}) => (p) => minimatch(p, pattern, options);
minimatch.filter = filter;
var ext = (a, b = {}) => Object.assign({}, a, b);
var defaults = (def) => {
  if (!def || typeof def !== "object" || !Object.keys(def).length) {
    return minimatch;
  }
  const orig = minimatch;
  const m = (p, pattern, options = {}) => orig(p, pattern, ext(def, options));
  return Object.assign(m, {
    Minimatch: class Minimatch extends orig.Minimatch {
      constructor(pattern, options = {}) {
        super(pattern, ext(def, options));
      }
      static defaults(options) {
        return orig.defaults(ext(def, options)).Minimatch;
      }
    },
    AST: class AST extends orig.AST {
      /* c8 ignore start */
      constructor(type, parent, options = {}) {
        super(type, parent, ext(def, options));
      }
      /* c8 ignore stop */
      static fromGlob(pattern, options = {}) {
        return orig.AST.fromGlob(pattern, ext(def, options));
      }
    },
    unescape: (s, options = {}) => orig.unescape(s, ext(def, options)),
    escape: (s, options = {}) => orig.escape(s, ext(def, options)),
    filter: (pattern, options = {}) => orig.filter(pattern, ext(def, options)),
    defaults: (options) => orig.defaults(ext(def, options)),
    makeRe: (pattern, options = {}) => orig.makeRe(pattern, ext(def, options)),
    braceExpand: (pattern, options = {}) => orig.braceExpand(pattern, ext(def, options)),
    match: (list, pattern, options = {}) => orig.match(list, pattern, ext(def, options)),
    sep: orig.sep,
    GLOBSTAR
  });
};
minimatch.defaults = defaults;
var braceExpand = (pattern, options = {}) => {
  assertValidPattern(pattern);
  if (options.nobrace || !/\{(?:(?!\{).)*\}/.test(pattern)) {
    return [pattern];
  }
  return expand(pattern, { max: options.braceExpandMax });
};
minimatch.braceExpand = braceExpand;
var makeRe = (pattern, options = {}) => new Minimatch(pattern, options).makeRe();
minimatch.makeRe = makeRe;
var match = (list, pattern, options = {}) => {
  const mm = new Minimatch(pattern, options);
  list = list.filter((f) => mm.match(f));
  if (mm.options.nonull && !list.length) {
    list.push(pattern);
  }
  return list;
};
minimatch.match = match;
var globMagic = /[?*]|[+@!]\(.*?\)|\[|\]/;
var regExpEscape2 = (s) => s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
var Minimatch = class {
  options;
  set;
  pattern;
  windowsPathsNoEscape;
  nonegate;
  negate;
  comment;
  empty;
  preserveMultipleSlashes;
  partial;
  globSet;
  globParts;
  nocase;
  isWindows;
  platform;
  windowsNoMagicRoot;
  maxGlobstarRecursion;
  regexp;
  constructor(pattern, options = {}) {
    assertValidPattern(pattern);
    options = options || {};
    this.options = options;
    this.maxGlobstarRecursion = options.maxGlobstarRecursion ?? 200;
    this.pattern = pattern;
    this.platform = options.platform || defaultPlatform;
    this.isWindows = this.platform === "win32";
    const awe = "allowWindowsEscape";
    this.windowsPathsNoEscape = !!options.windowsPathsNoEscape || options[awe] === false;
    if (this.windowsPathsNoEscape) {
      this.pattern = this.pattern.replace(/\\/g, "/");
    }
    this.preserveMultipleSlashes = !!options.preserveMultipleSlashes;
    this.regexp = null;
    this.negate = false;
    this.nonegate = !!options.nonegate;
    this.comment = false;
    this.empty = false;
    this.partial = !!options.partial;
    this.nocase = !!this.options.nocase;
    this.windowsNoMagicRoot = options.windowsNoMagicRoot !== void 0 ? options.windowsNoMagicRoot : !!(this.isWindows && this.nocase);
    this.globSet = [];
    this.globParts = [];
    this.set = [];
    this.make();
  }
  hasMagic() {
    if (this.options.magicalBraces && this.set.length > 1) {
      return true;
    }
    for (const pattern of this.set) {
      for (const part of pattern) {
        if (typeof part !== "string")
          return true;
      }
    }
    return false;
  }
  debug(..._2) {
  }
  make() {
    const pattern = this.pattern;
    const options = this.options;
    if (!options.nocomment && pattern.charAt(0) === "#") {
      this.comment = true;
      return;
    }
    if (!pattern) {
      this.empty = true;
      return;
    }
    this.parseNegate();
    this.globSet = [...new Set(this.braceExpand())];
    if (options.debug) {
      this.debug = (...args) => console.error(...args);
    }
    this.debug(this.pattern, this.globSet);
    const rawGlobParts = this.globSet.map((s) => this.slashSplit(s));
    this.globParts = this.preprocess(rawGlobParts);
    this.debug(this.pattern, this.globParts);
    let set = this.globParts.map((s, _2, __) => {
      if (this.isWindows && this.windowsNoMagicRoot) {
        const isUNC = s[0] === "" && s[1] === "" && (s[2] === "?" || !globMagic.test(s[2])) && !globMagic.test(s[3]);
        const isDrive = /^[a-z]:/i.test(s[0]);
        if (isUNC) {
          return [
            ...s.slice(0, 4),
            ...s.slice(4).map((ss2) => this.parse(ss2))
          ];
        } else if (isDrive) {
          return [s[0], ...s.slice(1).map((ss2) => this.parse(ss2))];
        }
      }
      return s.map((ss2) => this.parse(ss2));
    });
    this.debug(this.pattern, set);
    this.set = set.filter((s) => s.indexOf(false) === -1);
    if (this.isWindows) {
      for (let i = 0; i < this.set.length; i++) {
        const p = this.set[i];
        if (p[0] === "" && p[1] === "" && this.globParts[i][2] === "?" && typeof p[3] === "string" && /^[a-z]:$/i.test(p[3])) {
          p[2] = "?";
        }
      }
    }
    this.debug(this.pattern, this.set);
  }
  // various transforms to equivalent pattern sets that are
  // faster to process in a filesystem walk.  The goal is to
  // eliminate what we can, and push all ** patterns as far
  // to the right as possible, even if it increases the number
  // of patterns that we have to process.
  preprocess(globParts) {
    if (this.options.noglobstar) {
      for (const partset of globParts) {
        for (let j2 = 0; j2 < partset.length; j2++) {
          if (partset[j2] === "**") {
            partset[j2] = "*";
          }
        }
      }
    }
    const { optimizationLevel = 1 } = this.options;
    if (optimizationLevel >= 2) {
      globParts = this.firstPhasePreProcess(globParts);
      globParts = this.secondPhasePreProcess(globParts);
    } else if (optimizationLevel >= 1) {
      globParts = this.levelOneOptimize(globParts);
    } else {
      globParts = this.adjascentGlobstarOptimize(globParts);
    }
    return globParts;
  }
  // just get rid of adjascent ** portions
  adjascentGlobstarOptimize(globParts) {
    return globParts.map((parts) => {
      let gs2 = -1;
      while (-1 !== (gs2 = parts.indexOf("**", gs2 + 1))) {
        let i = gs2;
        while (parts[i + 1] === "**") {
          i++;
        }
        if (i !== gs2) {
          parts.splice(gs2, i - gs2);
        }
      }
      return parts;
    });
  }
  // get rid of adjascent ** and resolve .. portions
  levelOneOptimize(globParts) {
    return globParts.map((parts) => {
      parts = parts.reduce((set, part) => {
        const prev = set[set.length - 1];
        if (part === "**" && prev === "**") {
          return set;
        }
        if (part === "..") {
          if (prev && prev !== ".." && prev !== "." && prev !== "**") {
            set.pop();
            return set;
          }
        }
        set.push(part);
        return set;
      }, []);
      return parts.length === 0 ? [""] : parts;
    });
  }
  levelTwoFileOptimize(parts) {
    if (!Array.isArray(parts)) {
      parts = this.slashSplit(parts);
    }
    let didSomething = false;
    do {
      didSomething = false;
      if (!this.preserveMultipleSlashes) {
        for (let i = 1; i < parts.length - 1; i++) {
          const p = parts[i];
          if (i === 1 && p === "" && parts[0] === "")
            continue;
          if (p === "." || p === "") {
            didSomething = true;
            parts.splice(i, 1);
            i--;
          }
        }
        if (parts[0] === "." && parts.length === 2 && (parts[1] === "." || parts[1] === "")) {
          didSomething = true;
          parts.pop();
        }
      }
      let dd = 0;
      while (-1 !== (dd = parts.indexOf("..", dd + 1))) {
        const p = parts[dd - 1];
        if (p && p !== "." && p !== ".." && p !== "**" && !(this.isWindows && /^[a-z]:$/i.test(p))) {
          didSomething = true;
          parts.splice(dd - 1, 2);
          dd -= 2;
        }
      }
    } while (didSomething);
    return parts.length === 0 ? [""] : parts;
  }
  // First phase: single-pattern processing
  // <pre> is 1 or more portions
  // <rest> is 1 or more portions
  // <p> is any portion other than ., .., '', or **
  // <e> is . or ''
  //
  // **/.. is *brutal* for filesystem walking performance, because
  // it effectively resets the recursive walk each time it occurs,
  // and ** cannot be reduced out by a .. pattern part like a regexp
  // or most strings (other than .., ., and '') can be.
  //
  // <pre>/**/../<p>/<p>/<rest> -> {<pre>/../<p>/<p>/<rest>,<pre>/**/<p>/<p>/<rest>}
  // <pre>/<e>/<rest> -> <pre>/<rest>
  // <pre>/<p>/../<rest> -> <pre>/<rest>
  // **/**/<rest> -> **/<rest>
  //
  // **/*/<rest> -> */**/<rest> <== not valid because ** doesn't follow
  // this WOULD be allowed if ** did follow symlinks, or * didn't
  firstPhasePreProcess(globParts) {
    let didSomething = false;
    do {
      didSomething = false;
      for (let parts of globParts) {
        let gs2 = -1;
        while (-1 !== (gs2 = parts.indexOf("**", gs2 + 1))) {
          let gss = gs2;
          while (parts[gss + 1] === "**") {
            gss++;
          }
          if (gss > gs2) {
            parts.splice(gs2 + 1, gss - gs2);
          }
          let next = parts[gs2 + 1];
          const p = parts[gs2 + 2];
          const p2 = parts[gs2 + 3];
          if (next !== "..")
            continue;
          if (!p || p === "." || p === ".." || !p2 || p2 === "." || p2 === "..") {
            continue;
          }
          didSomething = true;
          parts.splice(gs2, 1);
          const other = parts.slice(0);
          other[gs2] = "**";
          globParts.push(other);
          gs2--;
        }
        if (!this.preserveMultipleSlashes) {
          for (let i = 1; i < parts.length - 1; i++) {
            const p = parts[i];
            if (i === 1 && p === "" && parts[0] === "")
              continue;
            if (p === "." || p === "") {
              didSomething = true;
              parts.splice(i, 1);
              i--;
            }
          }
          if (parts[0] === "." && parts.length === 2 && (parts[1] === "." || parts[1] === "")) {
            didSomething = true;
            parts.pop();
          }
        }
        let dd = 0;
        while (-1 !== (dd = parts.indexOf("..", dd + 1))) {
          const p = parts[dd - 1];
          if (p && p !== "." && p !== ".." && p !== "**") {
            didSomething = true;
            const needDot = dd === 1 && parts[dd + 1] === "**";
            const splin = needDot ? ["."] : [];
            parts.splice(dd - 1, 2, ...splin);
            if (parts.length === 0)
              parts.push("");
            dd -= 2;
          }
        }
      }
    } while (didSomething);
    return globParts;
  }
  // second phase: multi-pattern dedupes
  // {<pre>/*/<rest>,<pre>/<p>/<rest>} -> <pre>/*/<rest>
  // {<pre>/<rest>,<pre>/<rest>} -> <pre>/<rest>
  // {<pre>/**/<rest>,<pre>/<rest>} -> <pre>/**/<rest>
  //
  // {<pre>/**/<rest>,<pre>/**/<p>/<rest>} -> <pre>/**/<rest>
  // ^-- not valid because ** doens't follow symlinks
  secondPhasePreProcess(globParts) {
    for (let i = 0; i < globParts.length - 1; i++) {
      for (let j2 = i + 1; j2 < globParts.length; j2++) {
        const matched = this.partsMatch(globParts[i], globParts[j2], !this.preserveMultipleSlashes);
        if (matched) {
          globParts[i] = [];
          globParts[j2] = matched;
          break;
        }
      }
    }
    return globParts.filter((gs2) => gs2.length);
  }
  partsMatch(a, b, emptyGSMatch = false) {
    let ai2 = 0;
    let bi2 = 0;
    let result = [];
    let which = "";
    while (ai2 < a.length && bi2 < b.length) {
      if (a[ai2] === b[bi2]) {
        result.push(which === "b" ? b[bi2] : a[ai2]);
        ai2++;
        bi2++;
      } else if (emptyGSMatch && a[ai2] === "**" && b[bi2] === a[ai2 + 1]) {
        result.push(a[ai2]);
        ai2++;
      } else if (emptyGSMatch && b[bi2] === "**" && a[ai2] === b[bi2 + 1]) {
        result.push(b[bi2]);
        bi2++;
      } else if (a[ai2] === "*" && b[bi2] && (this.options.dot || !b[bi2].startsWith(".")) && b[bi2] !== "**") {
        if (which === "b")
          return false;
        which = "a";
        result.push(a[ai2]);
        ai2++;
        bi2++;
      } else if (b[bi2] === "*" && a[ai2] && (this.options.dot || !a[ai2].startsWith(".")) && a[ai2] !== "**") {
        if (which === "a")
          return false;
        which = "b";
        result.push(b[bi2]);
        ai2++;
        bi2++;
      } else {
        return false;
      }
    }
    return a.length === b.length && result;
  }
  parseNegate() {
    if (this.nonegate)
      return;
    const pattern = this.pattern;
    let negate = false;
    let negateOffset = 0;
    for (let i = 0; i < pattern.length && pattern.charAt(i) === "!"; i++) {
      negate = !negate;
      negateOffset++;
    }
    if (negateOffset)
      this.pattern = pattern.slice(negateOffset);
    this.negate = negate;
  }
  // set partial to true to test if, for example,
  // "/a/b" matches the start of "/*/b/*/d"
  // Partial means, if you run out of file before you run
  // out of pattern, then that's fine, as long as all
  // the parts match.
  matchOne(file, pattern, partial = false) {
    let fileStartIndex = 0;
    let patternStartIndex = 0;
    if (this.isWindows) {
      const fileDrive = typeof file[0] === "string" && /^[a-z]:$/i.test(file[0]);
      const fileUNC = !fileDrive && file[0] === "" && file[1] === "" && file[2] === "?" && /^[a-z]:$/i.test(file[3]);
      const patternDrive = typeof pattern[0] === "string" && /^[a-z]:$/i.test(pattern[0]);
      const patternUNC = !patternDrive && pattern[0] === "" && pattern[1] === "" && pattern[2] === "?" && typeof pattern[3] === "string" && /^[a-z]:$/i.test(pattern[3]);
      const fdi = fileUNC ? 3 : fileDrive ? 0 : void 0;
      const pdi = patternUNC ? 3 : patternDrive ? 0 : void 0;
      if (typeof fdi === "number" && typeof pdi === "number") {
        const [fd, pd] = [
          file[fdi],
          pattern[pdi]
        ];
        if (fd.toLowerCase() === pd.toLowerCase()) {
          pattern[pdi] = fd;
          patternStartIndex = pdi;
          fileStartIndex = fdi;
        }
      }
    }
    const { optimizationLevel = 1 } = this.options;
    if (optimizationLevel >= 2) {
      file = this.levelTwoFileOptimize(file);
    }
    if (pattern.includes(GLOBSTAR)) {
      return this.#matchGlobstar(file, pattern, partial, fileStartIndex, patternStartIndex);
    }
    return this.#matchOne(file, pattern, partial, fileStartIndex, patternStartIndex);
  }
  #matchGlobstar(file, pattern, partial, fileIndex, patternIndex) {
    const firstgs = pattern.indexOf(GLOBSTAR, patternIndex);
    const lastgs = pattern.lastIndexOf(GLOBSTAR);
    const [head, body, tail] = partial ? [
      pattern.slice(patternIndex, firstgs),
      pattern.slice(firstgs + 1),
      []
    ] : [
      pattern.slice(patternIndex, firstgs),
      pattern.slice(firstgs + 1, lastgs),
      pattern.slice(lastgs + 1)
    ];
    if (head.length) {
      const fileHead = file.slice(fileIndex, fileIndex + head.length);
      if (!this.#matchOne(fileHead, head, partial, 0, 0)) {
        return false;
      }
      fileIndex += head.length;
      patternIndex += head.length;
    }
    let fileTailMatch = 0;
    if (tail.length) {
      if (tail.length + fileIndex > file.length)
        return false;
      let tailStart = file.length - tail.length;
      if (this.#matchOne(file, tail, partial, tailStart, 0)) {
        fileTailMatch = tail.length;
      } else {
        if (file[file.length - 1] !== "" || fileIndex + tail.length === file.length) {
          return false;
        }
        tailStart--;
        if (!this.#matchOne(file, tail, partial, tailStart, 0)) {
          return false;
        }
        fileTailMatch = tail.length + 1;
      }
    }
    if (!body.length) {
      let sawSome = !!fileTailMatch;
      for (let i2 = fileIndex; i2 < file.length - fileTailMatch; i2++) {
        const f = String(file[i2]);
        sawSome = true;
        if (f === "." || f === ".." || !this.options.dot && f.startsWith(".")) {
          return false;
        }
      }
      return partial || sawSome;
    }
    const bodySegments = [[[], 0]];
    let currentBody = bodySegments[0];
    let nonGsParts = 0;
    const nonGsPartsSums = [0];
    for (const b of body) {
      if (b === GLOBSTAR) {
        nonGsPartsSums.push(nonGsParts);
        currentBody = [[], 0];
        bodySegments.push(currentBody);
      } else {
        currentBody[0].push(b);
        nonGsParts++;
      }
    }
    let i = bodySegments.length - 1;
    const fileLength = file.length - fileTailMatch;
    for (const b of bodySegments) {
      b[1] = fileLength - (nonGsPartsSums[i--] + b[0].length);
    }
    return !!this.#matchGlobStarBodySections(file, bodySegments, fileIndex, 0, partial, 0, !!fileTailMatch);
  }
  // return false for "nope, not matching"
  // return null for "not matching, cannot keep trying"
  #matchGlobStarBodySections(file, bodySegments, fileIndex, bodyIndex, partial, globStarDepth, sawTail) {
    const bs2 = bodySegments[bodyIndex];
    if (!bs2) {
      for (let i = fileIndex; i < file.length; i++) {
        sawTail = true;
        const f = file[i];
        if (f === "." || f === ".." || !this.options.dot && f.startsWith(".")) {
          return false;
        }
      }
      return sawTail;
    }
    const [body, after] = bs2;
    while (fileIndex <= after) {
      const m = this.#matchOne(file.slice(0, fileIndex + body.length), body, partial, fileIndex, 0);
      if (m && globStarDepth < this.maxGlobstarRecursion) {
        const sub = this.#matchGlobStarBodySections(file, bodySegments, fileIndex + body.length, bodyIndex + 1, partial, globStarDepth + 1, sawTail);
        if (sub !== false) {
          return sub;
        }
      }
      const f = file[fileIndex];
      if (f === "." || f === ".." || !this.options.dot && f.startsWith(".")) {
        return false;
      }
      fileIndex++;
    }
    return partial || null;
  }
  #matchOne(file, pattern, partial, fileIndex, patternIndex) {
    let fi2;
    let pi2;
    let pl;
    let fl;
    for (fi2 = fileIndex, pi2 = patternIndex, fl = file.length, pl = pattern.length; fi2 < fl && pi2 < pl; fi2++, pi2++) {
      this.debug("matchOne loop");
      let p = pattern[pi2];
      let f = file[fi2];
      this.debug(pattern, p, f);
      if (p === false || p === GLOBSTAR) {
        return false;
      }
      let hit;
      if (typeof p === "string") {
        hit = f === p;
        this.debug("string match", p, f, hit);
      } else {
        hit = p.test(f);
        this.debug("pattern match", p, f, hit);
      }
      if (!hit)
        return false;
    }
    if (fi2 === fl && pi2 === pl) {
      return true;
    } else if (fi2 === fl) {
      return partial;
    } else if (pi2 === pl) {
      return fi2 === fl - 1 && file[fi2] === "";
    } else {
      throw new Error("wtf?");
    }
  }
  braceExpand() {
    return braceExpand(this.pattern, this.options);
  }
  parse(pattern) {
    assertValidPattern(pattern);
    const options = this.options;
    if (pattern === "**")
      return GLOBSTAR;
    if (pattern === "")
      return "";
    let m;
    let fastTest = null;
    if (m = pattern.match(starRE)) {
      fastTest = options.dot ? starTestDot : starTest;
    } else if (m = pattern.match(starDotExtRE)) {
      fastTest = (options.nocase ? options.dot ? starDotExtTestNocaseDot : starDotExtTestNocase : options.dot ? starDotExtTestDot : starDotExtTest)(m[1]);
    } else if (m = pattern.match(qmarksRE)) {
      fastTest = (options.nocase ? options.dot ? qmarksTestNocaseDot : qmarksTestNocase : options.dot ? qmarksTestDot : qmarksTest)(m);
    } else if (m = pattern.match(starDotStarRE)) {
      fastTest = options.dot ? starDotStarTestDot : starDotStarTest;
    } else if (m = pattern.match(dotStarRE)) {
      fastTest = dotStarTest;
    }
    const re2 = AST.fromGlob(pattern, this.options).toMMPattern();
    if (fastTest && typeof re2 === "object") {
      Reflect.defineProperty(re2, "test", { value: fastTest });
    }
    return re2;
  }
  makeRe() {
    if (this.regexp || this.regexp === false)
      return this.regexp;
    const set = this.set;
    if (!set.length) {
      this.regexp = false;
      return this.regexp;
    }
    const options = this.options;
    const twoStar = options.noglobstar ? star2 : options.dot ? twoStarDot : twoStarNoDot;
    const flags = new Set(options.nocase ? ["i"] : []);
    let re2 = set.map((pattern) => {
      const pp = pattern.map((p) => {
        if (p instanceof RegExp) {
          for (const f of p.flags.split(""))
            flags.add(f);
        }
        return typeof p === "string" ? regExpEscape2(p) : p === GLOBSTAR ? GLOBSTAR : p._src;
      });
      pp.forEach((p, i) => {
        const next = pp[i + 1];
        const prev = pp[i - 1];
        if (p !== GLOBSTAR || prev === GLOBSTAR) {
          return;
        }
        if (prev === void 0) {
          if (next !== void 0 && next !== GLOBSTAR) {
            pp[i + 1] = "(?:\\/|" + twoStar + "\\/)?" + next;
          } else {
            pp[i] = twoStar;
          }
        } else if (next === void 0) {
          pp[i - 1] = prev + "(?:\\/|\\/" + twoStar + ")?";
        } else if (next !== GLOBSTAR) {
          pp[i - 1] = prev + "(?:\\/|\\/" + twoStar + "\\/)" + next;
          pp[i + 1] = GLOBSTAR;
        }
      });
      const filtered = pp.filter((p) => p !== GLOBSTAR);
      if (this.partial && filtered.length >= 1) {
        const prefixes = [];
        for (let i = 1; i <= filtered.length; i++) {
          prefixes.push(filtered.slice(0, i).join("/"));
        }
        return "(?:" + prefixes.join("|") + ")";
      }
      return filtered.join("/");
    }).join("|");
    const [open, close] = set.length > 1 ? ["(?:", ")"] : ["", ""];
    re2 = "^" + open + re2 + close + "$";
    if (this.partial) {
      re2 = "^(?:\\/|" + open + re2.slice(1, -1) + close + ")$";
    }
    if (this.negate)
      re2 = "^(?!" + re2 + ").+$";
    try {
      this.regexp = new RegExp(re2, [...flags].join(""));
    } catch {
      this.regexp = false;
    }
    return this.regexp;
  }
  slashSplit(p) {
    if (this.preserveMultipleSlashes) {
      return p.split("/");
    } else if (this.isWindows && /^\/\/[^/]+/.test(p)) {
      return ["", ...p.split(/\/+/)];
    } else {
      return p.split(/\/+/);
    }
  }
  match(f, partial = this.partial) {
    this.debug("match", f, this.pattern);
    if (this.comment) {
      return false;
    }
    if (this.empty) {
      return f === "";
    }
    if (f === "/" && partial) {
      return true;
    }
    const options = this.options;
    if (this.isWindows) {
      f = f.split("\\").join("/");
    }
    const ff = this.slashSplit(f);
    this.debug(this.pattern, "split", ff);
    const set = this.set;
    this.debug(this.pattern, "set", set);
    let filename = ff[ff.length - 1];
    if (!filename) {
      for (let i = ff.length - 2; !filename && i >= 0; i--) {
        filename = ff[i];
      }
    }
    for (const pattern of set) {
      let file = ff;
      if (options.matchBase && pattern.length === 1) {
        file = [filename];
      }
      const hit = this.matchOne(file, pattern, partial);
      if (hit) {
        if (options.flipNegate) {
          return true;
        }
        return !this.negate;
      }
    }
    if (options.flipNegate) {
      return false;
    }
    return this.negate;
  }
  static defaults(def) {
    return minimatch.defaults(def).Minimatch;
  }
};
minimatch.AST = AST;
minimatch.Minimatch = Minimatch;
minimatch.escape = escape;
minimatch.unescape = unescape;

// node_modules/@electron/asar/lib/wrapped-fs.js
var import_node_module = require("node:module");
var import_meta = { url: require("node:url").pathToFileURL(__filename).href };
var require2 = (0, import_node_module.createRequire)(require("node:url").pathToFileURL(__filename).href);
var fs = "electron" in process.versions ? require2("original-fs") : require2("node:fs");
var promisifiedMethods = [
  "lstat",
  "mkdtemp",
  "readFile",
  "stat",
  "writeFile",
  "symlink",
  "readlink"
];
var wrappedFs = Object.keys(fs).reduce((accum, method) => {
  return {
    ...accum,
    [method]: promisifiedMethods.includes(method) ? fs.promises[method] : fs[method]
  };
}, {
  // To make it more like fs-extra
  mkdirp: (dir) => fs.promises.mkdir(dir, { recursive: true }),
  mkdirpSync: (dir) => fs.mkdirSync(dir, { recursive: true })
});

// node_modules/@electron/asar/lib/filesystem.js
var import_node_os2 = __toESM(require("node:os"), 1);
var import_node_path2 = __toESM(require("node:path"), 1);
var import_promises2 = __toESM(require("node:stream/promises"), 1);

// node_modules/@electron/asar/lib/integrity.js
var import_node_crypto = __toESM(require("node:crypto"), 1);
var import_node_stream = __toESM(require("node:stream"), 1);
var import_promises = __toESM(require("node:stream/promises"), 1);
var ALGORITHM = "SHA256";
var BLOCK_SIZE = 4 * 1024 * 1024;
async function getFileIntegrity(inputFileStream) {
  const fileHash = import_node_crypto.default.createHash(ALGORITHM);
  const blockHashes = [];
  let blockHash = import_node_crypto.default.createHash(ALGORITHM);
  let currentBlockSize = 0;
  await import_promises.default.pipeline(inputFileStream, new import_node_stream.default.PassThrough({
    decodeStrings: false,
    transform(_chunk, encoding, callback) {
      fileHash.update(_chunk);
      let offset = 0;
      while (offset < _chunk.byteLength) {
        const remaining = BLOCK_SIZE - currentBlockSize;
        const end = Math.min(offset + remaining, _chunk.byteLength);
        const slice = offset === 0 && end === _chunk.byteLength ? _chunk : _chunk.subarray(offset, end);
        blockHash.update(slice);
        currentBlockSize += end - offset;
        if (currentBlockSize === BLOCK_SIZE) {
          blockHashes.push(blockHash.digest("hex"));
          blockHash = import_node_crypto.default.createHash(ALGORITHM);
          currentBlockSize = 0;
        }
        offset = end;
      }
      callback();
    },
    flush(callback) {
      if (currentBlockSize > 0 || blockHashes.length === 0) {
        blockHashes.push(blockHash.digest("hex"));
      }
      callback();
    }
  }));
  return {
    algorithm: ALGORITHM,
    hash: fileHash.digest("hex"),
    blockSize: BLOCK_SIZE,
    blocks: blockHashes
  };
}
function getFileIntegrityFromBuffer(data) {
  const hash = import_node_crypto.default.createHash(ALGORITHM).update(data).digest("hex");
  const blocks = [];
  for (let offset = 0; offset < data.length; offset += BLOCK_SIZE) {
    const end = Math.min(offset + BLOCK_SIZE, data.length);
    blocks.push(import_node_crypto.default.createHash(ALGORITHM).update(data.subarray(offset, end)).digest("hex"));
  }
  if (data.length === 0) {
    blocks.push(import_node_crypto.default.createHash(ALGORITHM).update(data).digest("hex"));
  }
  return { algorithm: ALGORITHM, hash, blockSize: BLOCK_SIZE, blocks };
}

// node_modules/@electron/asar/lib/filesystem.js
var UINT32_MAX = 2 ** 32 - 1;
var BUFFER_HASH_THRESHOLD = 2 * 1024 * 1024;
var Filesystem = class {
  src;
  header;
  headerSize;
  offset;
  constructor(src) {
    this.src = import_node_path2.default.resolve(src);
    this.header = { files: /* @__PURE__ */ Object.create(null) };
    this.headerSize = 0;
    this.offset = BigInt(0);
  }
  getRootPath() {
    return this.src;
  }
  getHeader() {
    return this.header;
  }
  getHeaderSize() {
    return this.headerSize;
  }
  setHeader(header, headerSize) {
    this.header = header;
    this.headerSize = headerSize;
  }
  searchNodeFromDirectory(p) {
    let json = this.header;
    const dirs = p.split(import_node_path2.default.sep);
    for (const dir of dirs) {
      if (dir !== ".") {
        if ("files" in json) {
          if (!json.files[dir]) {
            json.files[dir] = { files: /* @__PURE__ */ Object.create(null) };
          }
          json = json.files[dir];
        } else {
          throw new Error("Unexpected directory state while traversing: " + p);
        }
      }
    }
    return json;
  }
  searchNodeFromPath(p) {
    p = import_node_path2.default.relative(this.src, p);
    if (!p) {
      return this.header;
    }
    const name = import_node_path2.default.basename(p);
    const node = this.searchNodeFromDirectory(import_node_path2.default.dirname(p));
    if (!node.files) {
      node.files = /* @__PURE__ */ Object.create(null);
    }
    if (!node.files[name]) {
      node.files[name] = /* @__PURE__ */ Object.create(null);
    }
    return node.files[name];
  }
  insertDirectory(p, shouldUnpack) {
    const node = this.searchNodeFromPath(p);
    if (shouldUnpack) {
      node.unpacked = shouldUnpack;
    }
    node.files = node.files || /* @__PURE__ */ Object.create(null);
    return node.files;
  }
  insertFile(p, streamGenerator, shouldUnpack, file, options = {}) {
    const dirNode = this.searchNodeFromPath(import_node_path2.default.dirname(p));
    const node = this.searchNodeFromPath(p);
    if (shouldUnpack || dirNode.unpacked) {
      node.size = file.stat.size;
      node.unpacked = true;
      return getFileIntegrity(streamGenerator()).then((integrity) => {
        node.integrity = integrity;
      });
    }
    const transformed = options.transform && options.transform(p);
    if (transformed) {
      return this.insertFileAsync(p, streamGenerator, file, node, transformed);
    }
    const size = file.stat.size;
    if (size > UINT32_MAX) {
      throw new Error(`${p}: file size can not be larger than 4.2GB`);
    }
    node.size = size;
    node.offset = this.offset.toString();
    if (process.platform !== "win32" && file.stat.mode & 64) {
      node.executable = true;
    }
    if (size <= BUFFER_HASH_THRESHOLD) {
      try {
        const fileBuffer = wrappedFs.readFileSync(p);
        node.integrity = getFileIntegrityFromBuffer(fileBuffer);
        file.cachedBuffer = fileBuffer;
        this.offset += BigInt(size);
        return Promise.resolve();
      } catch {
      }
    }
    return getFileIntegrity(streamGenerator()).then((integrity) => {
      node.integrity = integrity;
      this.offset += BigInt(size);
    });
  }
  async insertFileAsync(p, streamGenerator, file, node, transformed) {
    const tmpdir = await wrappedFs.mkdtemp(import_node_path2.default.join(import_node_os2.default.tmpdir(), "asar-"));
    const tmpfile = import_node_path2.default.join(tmpdir, import_node_path2.default.basename(p));
    const out = wrappedFs.createWriteStream(tmpfile);
    await import_promises2.default.pipeline(streamGenerator(), transformed, out);
    file.transformed = {
      path: tmpfile,
      stat: await wrappedFs.lstat(tmpfile)
    };
    const size = file.transformed.stat.size;
    if (size > UINT32_MAX) {
      throw new Error(`${p}: file size can not be larger than 4.2GB`);
    }
    node.size = size;
    node.offset = this.offset.toString();
    if (process.platform !== "win32" && file.stat.mode & 64) {
      node.executable = true;
    }
    node.integrity = await getFileIntegrity(streamGenerator());
    this.offset += BigInt(size);
  }
  insertLink(p, shouldUnpack, parentPath = wrappedFs.realpathSync(import_node_path2.default.dirname(p)), symlink = wrappedFs.readlinkSync(p), src = wrappedFs.realpathSync(this.src)) {
    const link = this.resolveLink(src, parentPath, symlink);
    if (link.startsWith("..")) {
      throw new Error(`${p}: file "${link}" links out of the package`);
    }
    const node = this.searchNodeFromPath(p);
    const dirNode = this.searchNodeFromPath(import_node_path2.default.dirname(p));
    if (shouldUnpack || dirNode.unpacked) {
      node.unpacked = true;
    }
    node.link = link;
    return link;
  }
  resolveLink(src, parentPath, symlink) {
    const target = import_node_path2.default.join(parentPath, symlink);
    const link = import_node_path2.default.relative(src, target);
    return link;
  }
  listFiles(options) {
    const files = [];
    const fillFilesFromMetadata = function(basePath, metadata) {
      if (!("files" in metadata)) {
        return;
      }
      for (const [childPath, childMetadata] of Object.entries(metadata.files)) {
        const fullPath = import_node_path2.default.join(basePath, childPath);
        const packState = "unpacked" in childMetadata && childMetadata.unpacked ? "unpack" : "pack  ";
        files.push(options && options.isPack ? `${packState} : ${fullPath}` : fullPath);
        fillFilesFromMetadata(fullPath, childMetadata);
      }
    };
    fillFilesFromMetadata("/", this.header);
    return files;
  }
  getNode(p, followLinks = true) {
    const node = this.searchNodeFromDirectory(import_node_path2.default.dirname(p));
    const name = import_node_path2.default.basename(p);
    if ("link" in node && followLinks) {
      return this.getNode(import_node_path2.default.join(node.link, name));
    }
    if (name) {
      return node.files[name];
    } else {
      return node;
    }
  }
  getFile(p, followLinks = true) {
    const info = this.getNode(p, followLinks);
    if (!info) {
      throw new Error(`"${p}" was not found in this archive`);
    }
    if ("link" in info && followLinks) {
      return this.getFile(info.link, followLinks);
    } else {
      return info;
    }
  }
};

// node_modules/@electron/asar/lib/disk.js
var import_node_path3 = __toESM(require("node:path"), 1);

// node_modules/@electron/asar/lib/pickle.js
var SIZE_INT32 = 4;
var SIZE_UINT32 = 4;
var SIZE_INT64 = 8;
var SIZE_UINT64 = 8;
var SIZE_FLOAT = 4;
var SIZE_DOUBLE = 8;
var PAYLOAD_UNIT = 64;
var CAPACITY_READ_ONLY = 9007199254740992;
var alignInt = function(i, alignment) {
  return i + (alignment - i % alignment) % alignment;
};
var PickleIterator = class {
  payload;
  payloadOffset;
  readIndex;
  endIndex;
  constructor(pickle) {
    this.payload = pickle.getHeader();
    this.payloadOffset = pickle.getHeaderSize();
    this.readIndex = 0;
    this.endIndex = pickle.getPayloadSize();
  }
  readBool() {
    return this.readInt() !== 0;
  }
  readInt() {
    return this.readBytes(SIZE_INT32, Buffer.prototype.readInt32LE);
  }
  readUInt32() {
    return this.readBytes(SIZE_UINT32, Buffer.prototype.readUInt32LE);
  }
  readInt64() {
    return this.readBytes(SIZE_INT64, Buffer.prototype.readBigInt64LE);
  }
  readUInt64() {
    return this.readBytes(SIZE_UINT64, Buffer.prototype.readBigUInt64LE);
  }
  readFloat() {
    return this.readBytes(SIZE_FLOAT, Buffer.prototype.readFloatLE);
  }
  readDouble() {
    return this.readBytes(SIZE_DOUBLE, Buffer.prototype.readDoubleLE);
  }
  readString() {
    return this.readBytes(this.readInt()).toString();
  }
  readBytes(length, method) {
    const readPayloadOffset = this.getReadPayloadOffsetAndAdvance(length);
    if (method != null) {
      return method.call(this.payload, readPayloadOffset, length);
    } else {
      return this.payload.slice(readPayloadOffset, readPayloadOffset + length);
    }
  }
  getReadPayloadOffsetAndAdvance(length) {
    if (length > this.endIndex - this.readIndex) {
      this.readIndex = this.endIndex;
      throw new Error("Failed to read data with length of " + length);
    }
    const readPayloadOffset = this.payloadOffset + this.readIndex;
    this.advance(length);
    return readPayloadOffset;
  }
  advance(size) {
    const alignedSize = alignInt(size, SIZE_UINT32);
    if (this.endIndex - this.readIndex < alignedSize) {
      this.readIndex = this.endIndex;
    } else {
      this.readIndex += alignedSize;
    }
  }
};
var Pickle = class _Pickle {
  header;
  headerSize;
  capacityAfterHeader;
  writeOffset;
  constructor(buffer) {
    if (buffer) {
      this.header = buffer;
      this.headerSize = buffer.length - this.getPayloadSize();
      this.capacityAfterHeader = CAPACITY_READ_ONLY;
      this.writeOffset = 0;
      if (this.headerSize > buffer.length) {
        this.headerSize = 0;
      }
      if (this.headerSize !== alignInt(this.headerSize, SIZE_UINT32)) {
        this.headerSize = 0;
      }
      if (this.headerSize === 0) {
        this.header = Buffer.alloc(0);
      }
    } else {
      this.header = Buffer.alloc(0);
      this.headerSize = SIZE_UINT32;
      this.capacityAfterHeader = 0;
      this.writeOffset = 0;
      this.resize(PAYLOAD_UNIT);
      this.setPayloadSize(0);
    }
  }
  static createEmpty() {
    return new _Pickle();
  }
  static createFromBuffer(buffer) {
    return new _Pickle(buffer);
  }
  getHeader() {
    return this.header;
  }
  getHeaderSize() {
    return this.headerSize;
  }
  createIterator() {
    return new PickleIterator(this);
  }
  toBuffer() {
    return this.header.slice(0, this.headerSize + this.getPayloadSize());
  }
  writeBool(value) {
    return this.writeInt(value ? 1 : 0);
  }
  writeInt(value) {
    return this.writeBytes(value, SIZE_INT32, Buffer.prototype.writeInt32LE);
  }
  writeUInt32(value) {
    return this.writeBytes(value, SIZE_UINT32, Buffer.prototype.writeUInt32LE);
  }
  writeInt64(value) {
    return this.writeBytes(BigInt(value), SIZE_INT64, Buffer.prototype.writeBigInt64LE);
  }
  writeUInt64(value) {
    return this.writeBytes(BigInt(value), SIZE_UINT64, Buffer.prototype.writeBigUInt64LE);
  }
  writeFloat(value) {
    return this.writeBytes(value, SIZE_FLOAT, Buffer.prototype.writeFloatLE);
  }
  writeDouble(value) {
    return this.writeBytes(value, SIZE_DOUBLE, Buffer.prototype.writeDoubleLE);
  }
  writeString(value) {
    const length = Buffer.byteLength(value, "utf8");
    if (!this.writeInt(length)) {
      return false;
    }
    return this.writeBytes(value, length);
  }
  setPayloadSize(payloadSize) {
    return this.header.writeUInt32LE(payloadSize, 0);
  }
  getPayloadSize() {
    return this.header.readUInt32LE(0);
  }
  writeBytes(data, length, method) {
    const dataLength = alignInt(length, SIZE_UINT32);
    const newSize = this.writeOffset + dataLength;
    if (newSize > this.capacityAfterHeader) {
      this.resize(Math.max(this.capacityAfterHeader * 2, newSize));
    }
    if (method) {
      method.call(this.header, data, this.headerSize + this.writeOffset);
    } else {
      this.header.write(data, this.headerSize + this.writeOffset, length);
    }
    const endOffset = this.headerSize + this.writeOffset + length;
    this.header.fill(0, endOffset, endOffset + dataLength - length);
    this.setPayloadSize(newSize);
    this.writeOffset = newSize;
    return true;
  }
  resize(newCapacity) {
    newCapacity = alignInt(newCapacity, PAYLOAD_UNIT);
    const newHeader = Buffer.alloc(this.headerSize + newCapacity);
    this.header.copy(newHeader, 0, 0, this.headerSize + this.writeOffset);
    this.header = newHeader;
    this.capacityAfterHeader = newCapacity;
  }
};

// node_modules/@electron/asar/lib/disk.js
var filesystemCache = /* @__PURE__ */ Object.create(null);
async function copyFile(dest, src, filename) {
  const srcFile = import_node_path3.default.join(src, filename);
  const targetFile = import_node_path3.default.join(dest, filename);
  const [content, stats] = await Promise.all([
    wrappedFs.readFile(srcFile),
    wrappedFs.stat(srcFile),
    wrappedFs.mkdirp(import_node_path3.default.dirname(targetFile))
  ]);
  return wrappedFs.writeFile(targetFile, content, { mode: stats.mode });
}
async function streamTransformedFile(stream3, outStream) {
  return new Promise((resolve2, reject) => {
    stream3.pipe(outStream, { end: false });
    stream3.on("error", reject);
    stream3.on("end", () => resolve2());
  });
}
var writeFileListToStream = async function(dest, filesystem, out, lists, metadata) {
  const { files, links } = lists;
  let pendingBuffers = [];
  const flushPendingBuffers = async () => {
    if (pendingBuffers.length === 0)
      return;
    const combined = pendingBuffers.length === 1 ? pendingBuffers[0] : Buffer.concat(pendingBuffers);
    pendingBuffers = [];
    await new Promise((resolve2, reject) => {
      out.write(combined, (err3) => err3 ? reject(err3) : resolve2());
    });
  };
  for (const file of files) {
    if (file.unpack) {
      await flushPendingBuffers();
      const filename = import_node_path3.default.relative(filesystem.getRootPath(), file.filename);
      await copyFile(`${dest}.unpacked`, filesystem.getRootPath(), filename);
    } else {
      const fileMeta = metadata[file.filename];
      if (fileMeta.cachedBuffer) {
        pendingBuffers.push(fileMeta.cachedBuffer);
        fileMeta.cachedBuffer = void 0;
      } else {
        await flushPendingBuffers();
        const transformed = fileMeta.transformed;
        const stream3 = wrappedFs.createReadStream(transformed ? transformed.path : file.filename);
        await streamTransformedFile(stream3, out);
      }
    }
  }
  await flushPendingBuffers();
  for (const file of links.filter((f) => f.unpack)) {
    const filename = import_node_path3.default.relative(filesystem.getRootPath(), file.filename);
    const link = await wrappedFs.readlink(file.filename);
    await createSymlink(dest, filename, link);
  }
  return new Promise((resolve2, reject) => {
    out.on("error", reject);
    out.end(() => resolve2());
  });
};
async function writeFilesystem(dest, filesystem, lists, metadata) {
  const out = await createFilesystemWriteStream(filesystem, dest);
  return writeFileListToStream(dest, filesystem, out, lists, metadata);
}
function readArchiveHeaderSync(archivePath) {
  const fd = wrappedFs.openSync(archivePath, "r");
  let size;
  let headerBuf;
  try {
    const sizeBuf = Buffer.alloc(8);
    if (wrappedFs.readSync(fd, sizeBuf, 0, 8, null) !== 8) {
      throw new Error("Unable to read header size");
    }
    const sizePickle = Pickle.createFromBuffer(sizeBuf);
    size = sizePickle.createIterator().readUInt32();
    headerBuf = Buffer.alloc(size);
    if (wrappedFs.readSync(fd, headerBuf, 0, size, null) !== size) {
      throw new Error("Unable to read header");
    }
  } finally {
    wrappedFs.closeSync(fd);
  }
  const headerPickle = Pickle.createFromBuffer(headerBuf);
  const header = headerPickle.createIterator().readString();
  return { headerString: header, header: JSON.parse(header), headerSize: size };
}
function readFilesystemSync(archivePath) {
  if (!filesystemCache[archivePath]) {
    const header = readArchiveHeaderSync(archivePath);
    const filesystem = new Filesystem(archivePath);
    filesystem.setHeader(header.header, header.headerSize);
    filesystemCache[archivePath] = filesystem;
  }
  return filesystemCache[archivePath];
}
function readFileSync(filesystem, filename, info) {
  let buffer = Buffer.alloc(info.size);
  if (info.size <= 0) {
    return buffer;
  }
  if (info.unpacked) {
    buffer = wrappedFs.readFileSync(import_node_path3.default.join(`${filesystem.getRootPath()}.unpacked`, filename));
  } else {
    const fd = wrappedFs.openSync(filesystem.getRootPath(), "r");
    try {
      const offset = 8 + filesystem.getHeaderSize() + parseInt(info.offset);
      wrappedFs.readSync(fd, buffer, 0, info.size, offset);
    } finally {
      wrappedFs.closeSync(fd);
    }
  }
  return buffer;
}
async function createFilesystemWriteStream(filesystem, dest) {
  const headerPickle = Pickle.createEmpty();
  headerPickle.writeString(JSON.stringify(filesystem.getHeader()));
  const headerBuf = headerPickle.toBuffer();
  const sizePickle = Pickle.createEmpty();
  sizePickle.writeUInt32(headerBuf.length);
  const sizeBuf = sizePickle.toBuffer();
  const out = wrappedFs.createWriteStream(dest);
  await new Promise((resolve2, reject) => {
    out.on("error", reject);
    out.write(sizeBuf);
    return out.write(headerBuf, () => resolve2());
  });
  return out;
}
async function createSymlink(dest, filepath, link) {
  await wrappedFs.mkdirp(import_node_path3.default.join(`${dest}.unpacked`, import_node_path3.default.dirname(filepath)));
  await wrappedFs.symlink(link, import_node_path3.default.join(`${dest}.unpacked`, filepath)).catch(async (error) => {
    if (error.code === "EPERM" && error.syscall === "symlink") {
      throw new Error("Could not create symlinks for unpacked assets. On Windows, consider activating Developer Mode to allow non-admin users to create symlinks by following the instructions at https://docs.microsoft.com/en-us/windows/apps/get-started/enable-your-device-for-development.");
    }
    throw error;
  });
}

// node_modules/glob/dist/esm/index.min.js
var import_node_url = require("node:url");
var import_node_path4 = require("node:path");
var import_node_url2 = require("node:url");
var import_fs = require("fs");
var xi = __toESM(require("node:fs"), 1);
var import_promises3 = require("node:fs/promises");
var import_node_events = require("node:events");
var import_node_stream2 = __toESM(require("node:stream"), 1);
var import_node_string_decoder = require("node:string_decoder");
var Gt = (n7, t, e) => {
  let s = n7 instanceof RegExp ? ce(n7, e) : n7, i = t instanceof RegExp ? ce(t, e) : t, r = s !== null && i != null && ss(s, i, e);
  return r && { start: r[0], end: r[1], pre: e.slice(0, r[0]), body: e.slice(r[0] + s.length, r[1]), post: e.slice(r[1] + i.length) };
};
var ce = (n7, t) => {
  let e = t.match(n7);
  return e ? e[0] : null;
};
var ss = (n7, t, e) => {
  let s, i, r, o, h, a = e.indexOf(n7), l = e.indexOf(t, a + 1), u = a;
  if (a >= 0 && l > 0) {
    if (n7 === t) return [a, l];
    for (s = [], r = e.length; u >= 0 && !h; ) {
      if (u === a) s.push(u), a = e.indexOf(n7, u + 1);
      else if (s.length === 1) {
        let c = s.pop();
        c !== void 0 && (h = [c, l]);
      } else i = s.pop(), i !== void 0 && i < r && (r = i, o = l), l = e.indexOf(t, u + 1);
      u = a < l && a >= 0 ? a : l;
    }
    s.length && o !== void 0 && (h = [r, o]);
  }
  return h;
};
var fe = "\0SLASH" + Math.random() + "\0";
var ue = "\0OPEN" + Math.random() + "\0";
var qt = "\0CLOSE" + Math.random() + "\0";
var de = "\0COMMA" + Math.random() + "\0";
var pe = "\0PERIOD" + Math.random() + "\0";
var is = new RegExp(fe, "g");
var rs = new RegExp(ue, "g");
var ns = new RegExp(qt, "g");
var os2 = new RegExp(de, "g");
var hs = new RegExp(pe, "g");
var as = /\\\\/g;
var ls = /\\{/g;
var cs = /\\}/g;
var fs2 = /\\,/g;
var us = /\\./g;
var ds = 1e5;
function Ht(n7) {
  return isNaN(n7) ? n7.charCodeAt(0) : parseInt(n7, 10);
}
function ps(n7) {
  return n7.replace(as, fe).replace(ls, ue).replace(cs, qt).replace(fs2, de).replace(us, pe);
}
function ms(n7) {
  return n7.replace(is, "\\").replace(rs, "{").replace(ns, "}").replace(os2, ",").replace(hs, ".");
}
function me(n7) {
  if (!n7) return [""];
  let t = [], e = Gt("{", "}", n7);
  if (!e) return n7.split(",");
  let { pre: s, body: i, post: r } = e, o = s.split(",");
  o[o.length - 1] += "{" + i + "}";
  let h = me(r);
  return r.length && (o[o.length - 1] += h.shift(), o.push.apply(o, h)), t.push.apply(t, o), t;
}
function ge(n7, t = {}) {
  if (!n7) return [];
  let { max: e = ds } = t;
  return n7.slice(0, 2) === "{}" && (n7 = "\\{\\}" + n7.slice(2)), ht(ps(n7), e, true).map(ms);
}
function gs(n7) {
  return "{" + n7 + "}";
}
function ws(n7) {
  return /^-?0\d/.test(n7);
}
function ys(n7, t) {
  return n7 <= t;
}
function bs(n7, t) {
  return n7 >= t;
}
function ht(n7, t, e) {
  let s = [], i = Gt("{", "}", n7);
  if (!i) return [n7];
  let r = i.pre, o = i.post.length ? ht(i.post, t, false) : [""];
  if (/\$$/.test(i.pre)) for (let h = 0; h < o.length && h < t; h++) {
    let a = r + "{" + i.body + "}" + o[h];
    s.push(a);
  }
  else {
    let h = /^-?\d+\.\.-?\d+(?:\.\.-?\d+)?$/.test(i.body), a = /^[a-zA-Z]\.\.[a-zA-Z](?:\.\.-?\d+)?$/.test(i.body), l = h || a, u = i.body.indexOf(",") >= 0;
    if (!l && !u) return i.post.match(/,(?!,).*\}/) ? (n7 = i.pre + "{" + i.body + qt + i.post, ht(n7, t, true)) : [n7];
    let c;
    if (l) c = i.body.split(/\.\./);
    else if (c = me(i.body), c.length === 1 && c[0] !== void 0 && (c = ht(c[0], t, false).map(gs), c.length === 1)) return o.map((f) => i.pre + c[0] + f);
    let d;
    if (l && c[0] !== void 0 && c[1] !== void 0) {
      let f = Ht(c[0]), m = Ht(c[1]), p = Math.max(c[0].length, c[1].length), w = c.length === 3 && c[2] !== void 0 ? Math.abs(Ht(c[2])) : 1, g = ys;
      m < f && (w *= -1, g = bs);
      let E = c.some(ws);
      d = [];
      for (let y = f; g(y, m); y += w) {
        let b;
        if (a) b = String.fromCharCode(y), b === "\\" && (b = "");
        else if (b = String(y), E) {
          let z = p - b.length;
          if (z > 0) {
            let $ = new Array(z + 1).join("0");
            y < 0 ? b = "-" + $ + b.slice(1) : b = $ + b;
          }
        }
        d.push(b);
      }
    } else {
      d = [];
      for (let f = 0; f < c.length; f++) d.push.apply(d, ht(c[f], t, false));
    }
    for (let f = 0; f < d.length; f++) for (let m = 0; m < o.length && s.length < t; m++) {
      let p = r + d[f] + o[m];
      (!e || l || p) && s.push(p);
    }
  }
  return s;
}
var at = (n7) => {
  if (typeof n7 != "string") throw new TypeError("invalid pattern");
  if (n7.length > 65536) throw new TypeError("pattern is too long");
};
var Ss = { "[:alnum:]": ["\\p{L}\\p{Nl}\\p{Nd}", true], "[:alpha:]": ["\\p{L}\\p{Nl}", true], "[:ascii:]": ["\\x00-\\x7f", false], "[:blank:]": ["\\p{Zs}\\t", true], "[:cntrl:]": ["\\p{Cc}", true], "[:digit:]": ["\\p{Nd}", true], "[:graph:]": ["\\p{Z}\\p{C}", true, true], "[:lower:]": ["\\p{Ll}", true], "[:print:]": ["\\p{C}", true], "[:punct:]": ["\\p{P}", true], "[:space:]": ["\\p{Z}\\t\\r\\n\\v\\f", true], "[:upper:]": ["\\p{Lu}", true], "[:word:]": ["\\p{L}\\p{Nl}\\p{Nd}\\p{Pc}", true], "[:xdigit:]": ["A-Fa-f0-9", false] };
var lt = (n7) => n7.replace(/[[\]\\-]/g, "\\$&");
var Es = (n7) => n7.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
var we = (n7) => n7.join("");
var ye = (n7, t) => {
  let e = t;
  if (n7.charAt(e) !== "[") throw new Error("not in a brace expression");
  let s = [], i = [], r = e + 1, o = false, h = false, a = false, l = false, u = e, c = "";
  t: for (; r < n7.length; ) {
    let p = n7.charAt(r);
    if ((p === "!" || p === "^") && r === e + 1) {
      l = true, r++;
      continue;
    }
    if (p === "]" && o && !a) {
      u = r + 1;
      break;
    }
    if (o = true, p === "\\" && !a) {
      a = true, r++;
      continue;
    }
    if (p === "[" && !a) {
      for (let [w, [g, S, E]] of Object.entries(Ss)) if (n7.startsWith(w, r)) {
        if (c) return ["$.", false, n7.length - e, true];
        r += w.length, E ? i.push(g) : s.push(g), h = h || S;
        continue t;
      }
    }
    if (a = false, c) {
      p > c ? s.push(lt(c) + "-" + lt(p)) : p === c && s.push(lt(p)), c = "", r++;
      continue;
    }
    if (n7.startsWith("-]", r + 1)) {
      s.push(lt(p + "-")), r += 2;
      continue;
    }
    if (n7.startsWith("-", r + 1)) {
      c = p, r += 2;
      continue;
    }
    s.push(lt(p)), r++;
  }
  if (u < r) return ["", false, 0, false];
  if (!s.length && !i.length) return ["$.", false, n7.length - e, true];
  if (i.length === 0 && s.length === 1 && /^\\?.$/.test(s[0]) && !l) {
    let p = s[0].length === 2 ? s[0].slice(-1) : s[0];
    return [Es(p), false, u - e, false];
  }
  let d = "[" + (l ? "^" : "") + we(s) + "]", f = "[" + (l ? "" : "^") + we(i) + "]";
  return [s.length && i.length ? "(" + d + "|" + f + ")" : s.length ? d : f, h, u - e, true];
};
var W = (n7, { windowsPathsNoEscape: t = false, magicalBraces: e = true } = {}) => e ? t ? n7.replace(/\[([^\/\\])\]/g, "$1") : n7.replace(/((?!\\).|^)\[([^\/\\])\]/g, "$1$2").replace(/\\([^\/])/g, "$1") : t ? n7.replace(/\[([^\/\\{}])\]/g, "$1") : n7.replace(/((?!\\).|^)\[([^\/\\{}])\]/g, "$1$2").replace(/\\([^\/{}])/g, "$1");
var xs = /* @__PURE__ */ new Set(["!", "?", "+", "*", "@"]);
var be = (n7) => xs.has(n7);
var vs = "(?!(?:^|/)\\.\\.?(?:$|/))";
var Ct = "(?!\\.)";
var Cs = /* @__PURE__ */ new Set(["[", "."]);
var Ts = /* @__PURE__ */ new Set(["..", "."]);
var As = new Set("().*{}+?[]^$\\!");
var ks = (n7) => n7.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
var Kt = "[^/]";
var Se = Kt + "*?";
var Ee = Kt + "+?";
var Q = class n {
  type;
  #t;
  #s;
  #n = false;
  #r = [];
  #o;
  #S;
  #w;
  #c = false;
  #h;
  #u;
  #f = false;
  constructor(t, e, s = {}) {
    this.type = t, t && (this.#s = true), this.#o = e, this.#t = this.#o ? this.#o.#t : this, this.#h = this.#t === this ? s : this.#t.#h, this.#w = this.#t === this ? [] : this.#t.#w, t === "!" && !this.#t.#c && this.#w.push(this), this.#S = this.#o ? this.#o.#r.length : 0;
  }
  get hasMagic() {
    if (this.#s !== void 0) return this.#s;
    for (let t of this.#r) if (typeof t != "string" && (t.type || t.hasMagic)) return this.#s = true;
    return this.#s;
  }
  toString() {
    return this.#u !== void 0 ? this.#u : this.type ? this.#u = this.type + "(" + this.#r.map((t) => String(t)).join("|") + ")" : this.#u = this.#r.map((t) => String(t)).join("");
  }
  #a() {
    if (this !== this.#t) throw new Error("should only call on root");
    if (this.#c) return this;
    this.toString(), this.#c = true;
    let t;
    for (; t = this.#w.pop(); ) {
      if (t.type !== "!") continue;
      let e = t, s = e.#o;
      for (; s; ) {
        for (let i = e.#S + 1; !s.type && i < s.#r.length; i++) for (let r of t.#r) {
          if (typeof r == "string") throw new Error("string part in extglob AST??");
          r.copyIn(s.#r[i]);
        }
        e = s, s = e.#o;
      }
    }
    return this;
  }
  push(...t) {
    for (let e of t) if (e !== "") {
      if (typeof e != "string" && !(e instanceof n && e.#o === this)) throw new Error("invalid part: " + e);
      this.#r.push(e);
    }
  }
  toJSON() {
    let t = this.type === null ? this.#r.slice().map((e) => typeof e == "string" ? e : e.toJSON()) : [this.type, ...this.#r.map((e) => e.toJSON())];
    return this.isStart() && !this.type && t.unshift([]), this.isEnd() && (this === this.#t || this.#t.#c && this.#o?.type === "!") && t.push({}), t;
  }
  isStart() {
    if (this.#t === this) return true;
    if (!this.#o?.isStart()) return false;
    if (this.#S === 0) return true;
    let t = this.#o;
    for (let e = 0; e < this.#S; e++) {
      let s = t.#r[e];
      if (!(s instanceof n && s.type === "!")) return false;
    }
    return true;
  }
  isEnd() {
    if (this.#t === this || this.#o?.type === "!") return true;
    if (!this.#o?.isEnd()) return false;
    if (!this.type) return this.#o?.isEnd();
    let t = this.#o ? this.#o.#r.length : 0;
    return this.#S === t - 1;
  }
  copyIn(t) {
    typeof t == "string" ? this.push(t) : this.push(t.clone(this));
  }
  clone(t) {
    let e = new n(this.type, t);
    for (let s of this.#r) e.copyIn(s);
    return e;
  }
  static #i(t, e, s, i) {
    let r = false, o = false, h = -1, a = false;
    if (e.type === null) {
      let f = s, m = "";
      for (; f < t.length; ) {
        let p = t.charAt(f++);
        if (r || p === "\\") {
          r = !r, m += p;
          continue;
        }
        if (o) {
          f === h + 1 ? (p === "^" || p === "!") && (a = true) : p === "]" && !(f === h + 2 && a) && (o = false), m += p;
          continue;
        } else if (p === "[") {
          o = true, h = f, a = false, m += p;
          continue;
        }
        if (!i.noext && be(p) && t.charAt(f) === "(") {
          e.push(m), m = "";
          let w = new n(p, e);
          f = n.#i(t, w, f, i), e.push(w);
          continue;
        }
        m += p;
      }
      return e.push(m), f;
    }
    let l = s + 1, u = new n(null, e), c = [], d = "";
    for (; l < t.length; ) {
      let f = t.charAt(l++);
      if (r || f === "\\") {
        r = !r, d += f;
        continue;
      }
      if (o) {
        l === h + 1 ? (f === "^" || f === "!") && (a = true) : f === "]" && !(l === h + 2 && a) && (o = false), d += f;
        continue;
      } else if (f === "[") {
        o = true, h = l, a = false, d += f;
        continue;
      }
      if (be(f) && t.charAt(l) === "(") {
        u.push(d), d = "";
        let m = new n(f, u);
        u.push(m), l = n.#i(t, m, l, i);
        continue;
      }
      if (f === "|") {
        u.push(d), d = "", c.push(u), u = new n(null, e);
        continue;
      }
      if (f === ")") return d === "" && e.#r.length === 0 && (e.#f = true), u.push(d), d = "", e.push(...c, u), l;
      d += f;
    }
    return e.type = null, e.#s = void 0, e.#r = [t.substring(s - 1)], l;
  }
  static fromGlob(t, e = {}) {
    let s = new n(null, void 0, e);
    return n.#i(t, s, 0, e), s;
  }
  toMMPattern() {
    if (this !== this.#t) return this.#t.toMMPattern();
    let t = this.toString(), [e, s, i, r] = this.toRegExpSource();
    if (!(i || this.#s || this.#h.nocase && !this.#h.nocaseMagicOnly && t.toUpperCase() !== t.toLowerCase())) return s;
    let h = (this.#h.nocase ? "i" : "") + (r ? "u" : "");
    return Object.assign(new RegExp(`^${e}$`, h), { _src: e, _glob: t });
  }
  get options() {
    return this.#h;
  }
  toRegExpSource(t) {
    let e = t ?? !!this.#h.dot;
    if (this.#t === this && this.#a(), !this.type) {
      let a = this.isStart() && this.isEnd() && !this.#r.some((f) => typeof f != "string"), l = this.#r.map((f) => {
        let [m, p, w, g] = typeof f == "string" ? n.#E(f, this.#s, a) : f.toRegExpSource(t);
        return this.#s = this.#s || w, this.#n = this.#n || g, m;
      }).join(""), u = "";
      if (this.isStart() && typeof this.#r[0] == "string" && !(this.#r.length === 1 && Ts.has(this.#r[0]))) {
        let m = Cs, p = e && m.has(l.charAt(0)) || l.startsWith("\\.") && m.has(l.charAt(2)) || l.startsWith("\\.\\.") && m.has(l.charAt(4)), w = !e && !t && m.has(l.charAt(0));
        u = p ? vs : w ? Ct : "";
      }
      let c = "";
      return this.isEnd() && this.#t.#c && this.#o?.type === "!" && (c = "(?:$|\\/)"), [u + l + c, W(l), this.#s = !!this.#s, this.#n];
    }
    let s = this.type === "*" || this.type === "+", i = this.type === "!" ? "(?:(?!(?:" : "(?:", r = this.#d(e);
    if (this.isStart() && this.isEnd() && !r && this.type !== "!") {
      let a = this.toString();
      return this.#r = [a], this.type = null, this.#s = void 0, [a, W(this.toString()), false, false];
    }
    let o = !s || t || e || !Ct ? "" : this.#d(true);
    o === r && (o = ""), o && (r = `(?:${r})(?:${o})*?`);
    let h = "";
    if (this.type === "!" && this.#f) h = (this.isStart() && !e ? Ct : "") + Ee;
    else {
      let a = this.type === "!" ? "))" + (this.isStart() && !e && !t ? Ct : "") + Se + ")" : this.type === "@" ? ")" : this.type === "?" ? ")?" : this.type === "+" && o ? ")" : this.type === "*" && o ? ")?" : `)${this.type}`;
      h = i + r + a;
    }
    return [h, W(r), this.#s = !!this.#s, this.#n];
  }
  #d(t) {
    return this.#r.map((e) => {
      if (typeof e == "string") throw new Error("string type in extglob ast??");
      let [s, i, r, o] = e.toRegExpSource(t);
      return this.#n = this.#n || o, s;
    }).filter((e) => !(this.isStart() && this.isEnd()) || !!e).join("|");
  }
  static #E(t, e, s = false) {
    let i = false, r = "", o = false, h = false;
    for (let a = 0; a < t.length; a++) {
      let l = t.charAt(a);
      if (i) {
        i = false, r += (As.has(l) ? "\\" : "") + l;
        continue;
      }
      if (l === "*") {
        if (h) continue;
        h = true, r += s && /^[*]+$/.test(t) ? Ee : Se, e = true;
        continue;
      } else h = false;
      if (l === "\\") {
        a === t.length - 1 ? r += "\\\\" : i = true;
        continue;
      }
      if (l === "[") {
        let [u, c, d, f] = ye(t, a);
        if (d) {
          r += u, o = o || c, a += d - 1, e = e || f;
          continue;
        }
      }
      if (l === "?") {
        r += Kt, e = true;
        continue;
      }
      r += ks(l);
    }
    return [r, W(t), !!e, o];
  }
};
var tt = (n7, { windowsPathsNoEscape: t = false, magicalBraces: e = false } = {}) => e ? t ? n7.replace(/[?*()[\]{}]/g, "[$&]") : n7.replace(/[?*()[\]\\{}]/g, "\\$&") : t ? n7.replace(/[?*()[\]]/g, "[$&]") : n7.replace(/[?*()[\]\\]/g, "\\$&");
var O = (n7, t, e = {}) => (at(t), !e.nocomment && t.charAt(0) === "#" ? false : new D(t, e).match(n7));
var Rs = /^\*+([^+@!?\*\[\(]*)$/;
var Os = (n7) => (t) => !t.startsWith(".") && t.endsWith(n7);
var Fs = (n7) => (t) => t.endsWith(n7);
var Ds = (n7) => (n7 = n7.toLowerCase(), (t) => !t.startsWith(".") && t.toLowerCase().endsWith(n7));
var Ms = (n7) => (n7 = n7.toLowerCase(), (t) => t.toLowerCase().endsWith(n7));
var Ns = /^\*+\.\*+$/;
var _s = (n7) => !n7.startsWith(".") && n7.includes(".");
var Ls = (n7) => n7 !== "." && n7 !== ".." && n7.includes(".");
var Ws = /^\.\*+$/;
var Ps = (n7) => n7 !== "." && n7 !== ".." && n7.startsWith(".");
var js = /^\*+$/;
var Is = (n7) => n7.length !== 0 && !n7.startsWith(".");
var zs = (n7) => n7.length !== 0 && n7 !== "." && n7 !== "..";
var Bs = /^\?+([^+@!?\*\[\(]*)?$/;
var Us = ([n7, t = ""]) => {
  let e = Ce([n7]);
  return t ? (t = t.toLowerCase(), (s) => e(s) && s.toLowerCase().endsWith(t)) : e;
};
var $s = ([n7, t = ""]) => {
  let e = Te([n7]);
  return t ? (t = t.toLowerCase(), (s) => e(s) && s.toLowerCase().endsWith(t)) : e;
};
var Gs = ([n7, t = ""]) => {
  let e = Te([n7]);
  return t ? (s) => e(s) && s.endsWith(t) : e;
};
var Hs = ([n7, t = ""]) => {
  let e = Ce([n7]);
  return t ? (s) => e(s) && s.endsWith(t) : e;
};
var Ce = ([n7]) => {
  let t = n7.length;
  return (e) => e.length === t && !e.startsWith(".");
};
var Te = ([n7]) => {
  let t = n7.length;
  return (e) => e.length === t && e !== "." && e !== "..";
};
var Ae = typeof process == "object" && process ? typeof process.env == "object" && process.env && process.env.__MINIMATCH_TESTING_PLATFORM__ || process.platform : "posix";
var xe = { win32: { sep: "\\" }, posix: { sep: "/" } };
var qs = Ae === "win32" ? xe.win32.sep : xe.posix.sep;
O.sep = qs;
var A = Symbol("globstar **");
O.GLOBSTAR = A;
var Ks = "[^/]";
var Vs = Ks + "*?";
var Ys = "(?:(?!(?:\\/|^)(?:\\.{1,2})($|\\/)).)*?";
var Xs = "(?:(?!(?:\\/|^)\\.).)*?";
var Js = (n7, t = {}) => (e) => O(e, n7, t);
O.filter = Js;
var N = (n7, t = {}) => Object.assign({}, n7, t);
var Zs = (n7) => {
  if (!n7 || typeof n7 != "object" || !Object.keys(n7).length) return O;
  let t = O;
  return Object.assign((s, i, r = {}) => t(s, i, N(n7, r)), { Minimatch: class extends t.Minimatch {
    constructor(i, r = {}) {
      super(i, N(n7, r));
    }
    static defaults(i) {
      return t.defaults(N(n7, i)).Minimatch;
    }
  }, AST: class extends t.AST {
    constructor(i, r, o = {}) {
      super(i, r, N(n7, o));
    }
    static fromGlob(i, r = {}) {
      return t.AST.fromGlob(i, N(n7, r));
    }
  }, unescape: (s, i = {}) => t.unescape(s, N(n7, i)), escape: (s, i = {}) => t.escape(s, N(n7, i)), filter: (s, i = {}) => t.filter(s, N(n7, i)), defaults: (s) => t.defaults(N(n7, s)), makeRe: (s, i = {}) => t.makeRe(s, N(n7, i)), braceExpand: (s, i = {}) => t.braceExpand(s, N(n7, i)), match: (s, i, r = {}) => t.match(s, i, N(n7, r)), sep: t.sep, GLOBSTAR: A });
};
O.defaults = Zs;
var ke = (n7, t = {}) => (at(n7), t.nobrace || !/\{(?:(?!\{).)*\}/.test(n7) ? [n7] : ge(n7, { max: t.braceExpandMax }));
O.braceExpand = ke;
var Qs = (n7, t = {}) => new D(n7, t).makeRe();
O.makeRe = Qs;
var ti = (n7, t, e = {}) => {
  let s = new D(t, e);
  return n7 = n7.filter((i) => s.match(i)), s.options.nonull && !n7.length && n7.push(t), n7;
};
O.match = ti;
var ve = /[?*]|[+@!]\(.*?\)|\[|\]/;
var ei = (n7) => n7.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
var D = class {
  options;
  set;
  pattern;
  windowsPathsNoEscape;
  nonegate;
  negate;
  comment;
  empty;
  preserveMultipleSlashes;
  partial;
  globSet;
  globParts;
  nocase;
  isWindows;
  platform;
  windowsNoMagicRoot;
  regexp;
  constructor(t, e = {}) {
    at(t), e = e || {}, this.options = e, this.pattern = t, this.platform = e.platform || Ae, this.isWindows = this.platform === "win32";
    let s = "allowWindowsEscape";
    this.windowsPathsNoEscape = !!e.windowsPathsNoEscape || e[s] === false, this.windowsPathsNoEscape && (this.pattern = this.pattern.replace(/\\/g, "/")), this.preserveMultipleSlashes = !!e.preserveMultipleSlashes, this.regexp = null, this.negate = false, this.nonegate = !!e.nonegate, this.comment = false, this.empty = false, this.partial = !!e.partial, this.nocase = !!this.options.nocase, this.windowsNoMagicRoot = e.windowsNoMagicRoot !== void 0 ? e.windowsNoMagicRoot : !!(this.isWindows && this.nocase), this.globSet = [], this.globParts = [], this.set = [], this.make();
  }
  hasMagic() {
    if (this.options.magicalBraces && this.set.length > 1) return true;
    for (let t of this.set) for (let e of t) if (typeof e != "string") return true;
    return false;
  }
  debug(...t) {
  }
  make() {
    let t = this.pattern, e = this.options;
    if (!e.nocomment && t.charAt(0) === "#") {
      this.comment = true;
      return;
    }
    if (!t) {
      this.empty = true;
      return;
    }
    this.parseNegate(), this.globSet = [...new Set(this.braceExpand())], e.debug && (this.debug = (...r) => console.error(...r)), this.debug(this.pattern, this.globSet);
    let s = this.globSet.map((r) => this.slashSplit(r));
    this.globParts = this.preprocess(s), this.debug(this.pattern, this.globParts);
    let i = this.globParts.map((r, o, h) => {
      if (this.isWindows && this.windowsNoMagicRoot) {
        let a = r[0] === "" && r[1] === "" && (r[2] === "?" || !ve.test(r[2])) && !ve.test(r[3]), l = /^[a-z]:/i.test(r[0]);
        if (a) return [...r.slice(0, 4), ...r.slice(4).map((u) => this.parse(u))];
        if (l) return [r[0], ...r.slice(1).map((u) => this.parse(u))];
      }
      return r.map((a) => this.parse(a));
    });
    if (this.debug(this.pattern, i), this.set = i.filter((r) => r.indexOf(false) === -1), this.isWindows) for (let r = 0; r < this.set.length; r++) {
      let o = this.set[r];
      o[0] === "" && o[1] === "" && this.globParts[r][2] === "?" && typeof o[3] == "string" && /^[a-z]:$/i.test(o[3]) && (o[2] = "?");
    }
    this.debug(this.pattern, this.set);
  }
  preprocess(t) {
    if (this.options.noglobstar) for (let s = 0; s < t.length; s++) for (let i = 0; i < t[s].length; i++) t[s][i] === "**" && (t[s][i] = "*");
    let { optimizationLevel: e = 1 } = this.options;
    return e >= 2 ? (t = this.firstPhasePreProcess(t), t = this.secondPhasePreProcess(t)) : e >= 1 ? t = this.levelOneOptimize(t) : t = this.adjascentGlobstarOptimize(t), t;
  }
  adjascentGlobstarOptimize(t) {
    return t.map((e) => {
      let s = -1;
      for (; (s = e.indexOf("**", s + 1)) !== -1; ) {
        let i = s;
        for (; e[i + 1] === "**"; ) i++;
        i !== s && e.splice(s, i - s);
      }
      return e;
    });
  }
  levelOneOptimize(t) {
    return t.map((e) => (e = e.reduce((s, i) => {
      let r = s[s.length - 1];
      return i === "**" && r === "**" ? s : i === ".." && r && r !== ".." && r !== "." && r !== "**" ? (s.pop(), s) : (s.push(i), s);
    }, []), e.length === 0 ? [""] : e));
  }
  levelTwoFileOptimize(t) {
    Array.isArray(t) || (t = this.slashSplit(t));
    let e = false;
    do {
      if (e = false, !this.preserveMultipleSlashes) {
        for (let i = 1; i < t.length - 1; i++) {
          let r = t[i];
          i === 1 && r === "" && t[0] === "" || (r === "." || r === "") && (e = true, t.splice(i, 1), i--);
        }
        t[0] === "." && t.length === 2 && (t[1] === "." || t[1] === "") && (e = true, t.pop());
      }
      let s = 0;
      for (; (s = t.indexOf("..", s + 1)) !== -1; ) {
        let i = t[s - 1];
        i && i !== "." && i !== ".." && i !== "**" && (e = true, t.splice(s - 1, 2), s -= 2);
      }
    } while (e);
    return t.length === 0 ? [""] : t;
  }
  firstPhasePreProcess(t) {
    let e = false;
    do {
      e = false;
      for (let s of t) {
        let i = -1;
        for (; (i = s.indexOf("**", i + 1)) !== -1; ) {
          let o = i;
          for (; s[o + 1] === "**"; ) o++;
          o > i && s.splice(i + 1, o - i);
          let h = s[i + 1], a = s[i + 2], l = s[i + 3];
          if (h !== ".." || !a || a === "." || a === ".." || !l || l === "." || l === "..") continue;
          e = true, s.splice(i, 1);
          let u = s.slice(0);
          u[i] = "**", t.push(u), i--;
        }
        if (!this.preserveMultipleSlashes) {
          for (let o = 1; o < s.length - 1; o++) {
            let h = s[o];
            o === 1 && h === "" && s[0] === "" || (h === "." || h === "") && (e = true, s.splice(o, 1), o--);
          }
          s[0] === "." && s.length === 2 && (s[1] === "." || s[1] === "") && (e = true, s.pop());
        }
        let r = 0;
        for (; (r = s.indexOf("..", r + 1)) !== -1; ) {
          let o = s[r - 1];
          if (o && o !== "." && o !== ".." && o !== "**") {
            e = true;
            let a = r === 1 && s[r + 1] === "**" ? ["."] : [];
            s.splice(r - 1, 2, ...a), s.length === 0 && s.push(""), r -= 2;
          }
        }
      }
    } while (e);
    return t;
  }
  secondPhasePreProcess(t) {
    for (let e = 0; e < t.length - 1; e++) for (let s = e + 1; s < t.length; s++) {
      let i = this.partsMatch(t[e], t[s], !this.preserveMultipleSlashes);
      if (i) {
        t[e] = [], t[s] = i;
        break;
      }
    }
    return t.filter((e) => e.length);
  }
  partsMatch(t, e, s = false) {
    let i = 0, r = 0, o = [], h = "";
    for (; i < t.length && r < e.length; ) if (t[i] === e[r]) o.push(h === "b" ? e[r] : t[i]), i++, r++;
    else if (s && t[i] === "**" && e[r] === t[i + 1]) o.push(t[i]), i++;
    else if (s && e[r] === "**" && t[i] === e[r + 1]) o.push(e[r]), r++;
    else if (t[i] === "*" && e[r] && (this.options.dot || !e[r].startsWith(".")) && e[r] !== "**") {
      if (h === "b") return false;
      h = "a", o.push(t[i]), i++, r++;
    } else if (e[r] === "*" && t[i] && (this.options.dot || !t[i].startsWith(".")) && t[i] !== "**") {
      if (h === "a") return false;
      h = "b", o.push(e[r]), i++, r++;
    } else return false;
    return t.length === e.length && o;
  }
  parseNegate() {
    if (this.nonegate) return;
    let t = this.pattern, e = false, s = 0;
    for (let i = 0; i < t.length && t.charAt(i) === "!"; i++) e = !e, s++;
    s && (this.pattern = t.slice(s)), this.negate = e;
  }
  matchOne(t, e, s = false) {
    let i = this.options;
    if (this.isWindows) {
      let p = typeof t[0] == "string" && /^[a-z]:$/i.test(t[0]), w = !p && t[0] === "" && t[1] === "" && t[2] === "?" && /^[a-z]:$/i.test(t[3]), g = typeof e[0] == "string" && /^[a-z]:$/i.test(e[0]), S = !g && e[0] === "" && e[1] === "" && e[2] === "?" && typeof e[3] == "string" && /^[a-z]:$/i.test(e[3]), E = w ? 3 : p ? 0 : void 0, y = S ? 3 : g ? 0 : void 0;
      if (typeof E == "number" && typeof y == "number") {
        let [b, z] = [t[E], e[y]];
        b.toLowerCase() === z.toLowerCase() && (e[y] = b, y > E ? e = e.slice(y) : E > y && (t = t.slice(E)));
      }
    }
    let { optimizationLevel: r = 1 } = this.options;
    r >= 2 && (t = this.levelTwoFileOptimize(t)), this.debug("matchOne", this, { file: t, pattern: e }), this.debug("matchOne", t.length, e.length);
    for (var o = 0, h = 0, a = t.length, l = e.length; o < a && h < l; o++, h++) {
      this.debug("matchOne loop");
      var u = e[h], c = t[o];
      if (this.debug(e, u, c), u === false) return false;
      if (u === A) {
        this.debug("GLOBSTAR", [e, u, c]);
        var d = o, f = h + 1;
        if (f === l) {
          for (this.debug("** at the end"); o < a; o++) if (t[o] === "." || t[o] === ".." || !i.dot && t[o].charAt(0) === ".") return false;
          return true;
        }
        for (; d < a; ) {
          var m = t[d];
          if (this.debug(`
globstar while`, t, d, e, f, m), this.matchOne(t.slice(d), e.slice(f), s)) return this.debug("globstar found match!", d, a, m), true;
          if (m === "." || m === ".." || !i.dot && m.charAt(0) === ".") {
            this.debug("dot detected!", t, d, e, f);
            break;
          }
          this.debug("globstar swallow a segment, and continue"), d++;
        }
        return !!(s && (this.debug(`
>>> no match, partial?`, t, d, e, f), d === a));
      }
      let p;
      if (typeof u == "string" ? (p = c === u, this.debug("string match", u, c, p)) : (p = u.test(c), this.debug("pattern match", u, c, p)), !p) return false;
    }
    if (o === a && h === l) return true;
    if (o === a) return s;
    if (h === l) return o === a - 1 && t[o] === "";
    throw new Error("wtf?");
  }
  braceExpand() {
    return ke(this.pattern, this.options);
  }
  parse(t) {
    at(t);
    let e = this.options;
    if (t === "**") return A;
    if (t === "") return "";
    let s, i = null;
    (s = t.match(js)) ? i = e.dot ? zs : Is : (s = t.match(Rs)) ? i = (e.nocase ? e.dot ? Ms : Ds : e.dot ? Fs : Os)(s[1]) : (s = t.match(Bs)) ? i = (e.nocase ? e.dot ? $s : Us : e.dot ? Gs : Hs)(s) : (s = t.match(Ns)) ? i = e.dot ? Ls : _s : (s = t.match(Ws)) && (i = Ps);
    let r = Q.fromGlob(t, this.options).toMMPattern();
    return i && typeof r == "object" && Reflect.defineProperty(r, "test", { value: i }), r;
  }
  makeRe() {
    if (this.regexp || this.regexp === false) return this.regexp;
    let t = this.set;
    if (!t.length) return this.regexp = false, this.regexp;
    let e = this.options, s = e.noglobstar ? Vs : e.dot ? Ys : Xs, i = new Set(e.nocase ? ["i"] : []), r = t.map((a) => {
      let l = a.map((c) => {
        if (c instanceof RegExp) for (let d of c.flags.split("")) i.add(d);
        return typeof c == "string" ? ei(c) : c === A ? A : c._src;
      });
      l.forEach((c, d) => {
        let f = l[d + 1], m = l[d - 1];
        c !== A || m === A || (m === void 0 ? f !== void 0 && f !== A ? l[d + 1] = "(?:\\/|" + s + "\\/)?" + f : l[d] = s : f === void 0 ? l[d - 1] = m + "(?:\\/|\\/" + s + ")?" : f !== A && (l[d - 1] = m + "(?:\\/|\\/" + s + "\\/)" + f, l[d + 1] = A));
      });
      let u = l.filter((c) => c !== A);
      if (this.partial && u.length >= 1) {
        let c = [];
        for (let d = 1; d <= u.length; d++) c.push(u.slice(0, d).join("/"));
        return "(?:" + c.join("|") + ")";
      }
      return u.join("/");
    }).join("|"), [o, h] = t.length > 1 ? ["(?:", ")"] : ["", ""];
    r = "^" + o + r + h + "$", this.partial && (r = "^(?:\\/|" + o + r.slice(1, -1) + h + ")$"), this.negate && (r = "^(?!" + r + ").+$");
    try {
      this.regexp = new RegExp(r, [...i].join(""));
    } catch {
      this.regexp = false;
    }
    return this.regexp;
  }
  slashSplit(t) {
    return this.preserveMultipleSlashes ? t.split("/") : this.isWindows && /^\/\/[^\/]+/.test(t) ? ["", ...t.split(/\/+/)] : t.split(/\/+/);
  }
  match(t, e = this.partial) {
    if (this.debug("match", t, this.pattern), this.comment) return false;
    if (this.empty) return t === "";
    if (t === "/" && e) return true;
    let s = this.options;
    this.isWindows && (t = t.split("\\").join("/"));
    let i = this.slashSplit(t);
    this.debug(this.pattern, "split", i);
    let r = this.set;
    this.debug(this.pattern, "set", r);
    let o = i[i.length - 1];
    if (!o) for (let h = i.length - 2; !o && h >= 0; h--) o = i[h];
    for (let h = 0; h < r.length; h++) {
      let a = r[h], l = i;
      if (s.matchBase && a.length === 1 && (l = [o]), this.matchOne(l, a, e)) return s.flipNegate ? true : !this.negate;
    }
    return s.flipNegate ? false : this.negate;
  }
  static defaults(t) {
    return O.defaults(t).Minimatch;
  }
};
O.AST = Q;
O.Minimatch = D;
O.escape = tt;
O.unescape = W;
var si = typeof performance == "object" && performance && typeof performance.now == "function" ? performance : Date;
var Oe = /* @__PURE__ */ new Set();
var Vt = typeof process == "object" && process ? process : {};
var Fe = (n7, t, e, s) => {
  typeof Vt.emitWarning == "function" ? Vt.emitWarning(n7, t, e, s) : console.error(`[${e}] ${t}: ${n7}`);
};
var At = globalThis.AbortController;
var Re = globalThis.AbortSignal;
if (typeof At > "u") {
  Re = class {
    onabort;
    _onabort = [];
    reason;
    aborted = false;
    addEventListener(e, s) {
      this._onabort.push(s);
    }
  }, At = class {
    constructor() {
      t();
    }
    signal = new Re();
    abort(e) {
      if (!this.signal.aborted) {
        this.signal.reason = e, this.signal.aborted = true;
        for (let s of this.signal._onabort) s(e);
        this.signal.onabort?.(e);
      }
    }
  };
  let n7 = Vt.env?.LRU_CACHE_IGNORE_AC_WARNING !== "1", t = () => {
    n7 && (n7 = false, Fe("AbortController is not defined. If using lru-cache in node 14, load an AbortController polyfill from the `node-abort-controller` package. A minimal polyfill is provided for use by LRUCache.fetch(), but it should not be relied upon in other contexts (eg, passing it to other APIs that use AbortController/AbortSignal might have undesirable effects). You may disable this with LRU_CACHE_IGNORE_AC_WARNING=1 in the env.", "NO_ABORT_CONTROLLER", "ENOTSUP", t));
  };
}
var ii = (n7) => !Oe.has(n7);
var q = (n7) => n7 && n7 === Math.floor(n7) && n7 > 0 && isFinite(n7);
var De = (n7) => q(n7) ? n7 <= Math.pow(2, 8) ? Uint8Array : n7 <= Math.pow(2, 16) ? Uint16Array : n7 <= Math.pow(2, 32) ? Uint32Array : n7 <= Number.MAX_SAFE_INTEGER ? Tt : null : null;
var Tt = class extends Array {
  constructor(n7) {
    super(n7), this.fill(0);
  }
};
var ri = class ct {
  heap;
  length;
  static #t = false;
  static create(t) {
    let e = De(t);
    if (!e) return [];
    ct.#t = true;
    let s = new ct(t, e);
    return ct.#t = false, s;
  }
  constructor(t, e) {
    if (!ct.#t) throw new TypeError("instantiate Stack using Stack.create(n)");
    this.heap = new e(t), this.length = 0;
  }
  push(t) {
    this.heap[this.length++] = t;
  }
  pop() {
    return this.heap[--this.length];
  }
};
var ft = class Me {
  #t;
  #s;
  #n;
  #r;
  #o;
  #S;
  #w;
  #c;
  get perf() {
    return this.#c;
  }
  ttl;
  ttlResolution;
  ttlAutopurge;
  updateAgeOnGet;
  updateAgeOnHas;
  allowStale;
  noDisposeOnSet;
  noUpdateTTL;
  maxEntrySize;
  sizeCalculation;
  noDeleteOnFetchRejection;
  noDeleteOnStaleGet;
  allowStaleOnFetchAbort;
  allowStaleOnFetchRejection;
  ignoreFetchAbort;
  #h;
  #u;
  #f;
  #a;
  #i;
  #d;
  #E;
  #b;
  #p;
  #R;
  #m;
  #C;
  #T;
  #g;
  #y;
  #x;
  #A;
  #e;
  #_;
  static unsafeExposeInternals(t) {
    return { starts: t.#T, ttls: t.#g, autopurgeTimers: t.#y, sizes: t.#C, keyMap: t.#f, keyList: t.#a, valList: t.#i, next: t.#d, prev: t.#E, get head() {
      return t.#b;
    }, get tail() {
      return t.#p;
    }, free: t.#R, isBackgroundFetch: (e) => t.#l(e), backgroundFetch: (e, s, i, r) => t.#U(e, s, i, r), moveToTail: (e) => t.#W(e), indexes: (e) => t.#F(e), rindexes: (e) => t.#D(e), isStale: (e) => t.#v(e) };
  }
  get max() {
    return this.#t;
  }
  get maxSize() {
    return this.#s;
  }
  get calculatedSize() {
    return this.#u;
  }
  get size() {
    return this.#h;
  }
  get fetchMethod() {
    return this.#S;
  }
  get memoMethod() {
    return this.#w;
  }
  get dispose() {
    return this.#n;
  }
  get onInsert() {
    return this.#r;
  }
  get disposeAfter() {
    return this.#o;
  }
  constructor(t) {
    let { max: e = 0, ttl: s, ttlResolution: i = 1, ttlAutopurge: r, updateAgeOnGet: o, updateAgeOnHas: h, allowStale: a, dispose: l, onInsert: u, disposeAfter: c, noDisposeOnSet: d, noUpdateTTL: f, maxSize: m = 0, maxEntrySize: p = 0, sizeCalculation: w, fetchMethod: g, memoMethod: S, noDeleteOnFetchRejection: E, noDeleteOnStaleGet: y, allowStaleOnFetchRejection: b, allowStaleOnFetchAbort: z, ignoreFetchAbort: $, perf: J } = t;
    if (J !== void 0 && typeof J?.now != "function") throw new TypeError("perf option must have a now() method if specified");
    if (this.#c = J ?? si, e !== 0 && !q(e)) throw new TypeError("max option must be a nonnegative integer");
    let Z = e ? De(e) : Array;
    if (!Z) throw new Error("invalid max value: " + e);
    if (this.#t = e, this.#s = m, this.maxEntrySize = p || this.#s, this.sizeCalculation = w, this.sizeCalculation) {
      if (!this.#s && !this.maxEntrySize) throw new TypeError("cannot set sizeCalculation without setting maxSize or maxEntrySize");
      if (typeof this.sizeCalculation != "function") throw new TypeError("sizeCalculation set to non-function");
    }
    if (S !== void 0 && typeof S != "function") throw new TypeError("memoMethod must be a function if defined");
    if (this.#w = S, g !== void 0 && typeof g != "function") throw new TypeError("fetchMethod must be a function if specified");
    if (this.#S = g, this.#A = !!g, this.#f = /* @__PURE__ */ new Map(), this.#a = new Array(e).fill(void 0), this.#i = new Array(e).fill(void 0), this.#d = new Z(e), this.#E = new Z(e), this.#b = 0, this.#p = 0, this.#R = ri.create(e), this.#h = 0, this.#u = 0, typeof l == "function" && (this.#n = l), typeof u == "function" && (this.#r = u), typeof c == "function" ? (this.#o = c, this.#m = []) : (this.#o = void 0, this.#m = void 0), this.#x = !!this.#n, this.#_ = !!this.#r, this.#e = !!this.#o, this.noDisposeOnSet = !!d, this.noUpdateTTL = !!f, this.noDeleteOnFetchRejection = !!E, this.allowStaleOnFetchRejection = !!b, this.allowStaleOnFetchAbort = !!z, this.ignoreFetchAbort = !!$, this.maxEntrySize !== 0) {
      if (this.#s !== 0 && !q(this.#s)) throw new TypeError("maxSize must be a positive integer if specified");
      if (!q(this.maxEntrySize)) throw new TypeError("maxEntrySize must be a positive integer if specified");
      this.#G();
    }
    if (this.allowStale = !!a, this.noDeleteOnStaleGet = !!y, this.updateAgeOnGet = !!o, this.updateAgeOnHas = !!h, this.ttlResolution = q(i) || i === 0 ? i : 1, this.ttlAutopurge = !!r, this.ttl = s || 0, this.ttl) {
      if (!q(this.ttl)) throw new TypeError("ttl must be a positive integer if specified");
      this.#M();
    }
    if (this.#t === 0 && this.ttl === 0 && this.#s === 0) throw new TypeError("At least one of max, maxSize, or ttl is required");
    if (!this.ttlAutopurge && !this.#t && !this.#s) {
      let $t = "LRU_CACHE_UNBOUNDED";
      ii($t) && (Oe.add($t), Fe("TTL caching without ttlAutopurge, max, or maxSize can result in unbounded memory consumption.", "UnboundedCacheWarning", $t, Me));
    }
  }
  getRemainingTTL(t) {
    return this.#f.has(t) ? 1 / 0 : 0;
  }
  #M() {
    let t = new Tt(this.#t), e = new Tt(this.#t);
    this.#g = t, this.#T = e;
    let s = this.ttlAutopurge ? new Array(this.#t) : void 0;
    this.#y = s, this.#j = (o, h, a = this.#c.now()) => {
      if (e[o] = h !== 0 ? a : 0, t[o] = h, s?.[o] && (clearTimeout(s[o]), s[o] = void 0), h !== 0 && s) {
        let l = setTimeout(() => {
          this.#v(o) && this.#O(this.#a[o], "expire");
        }, h + 1);
        l.unref && l.unref(), s[o] = l;
      }
    }, this.#k = (o) => {
      e[o] = t[o] !== 0 ? this.#c.now() : 0;
    }, this.#N = (o, h) => {
      if (t[h]) {
        let a = t[h], l = e[h];
        if (!a || !l) return;
        o.ttl = a, o.start = l, o.now = i || r();
        let u = o.now - l;
        o.remainingTTL = a - u;
      }
    };
    let i = 0, r = () => {
      let o = this.#c.now();
      if (this.ttlResolution > 0) {
        i = o;
        let h = setTimeout(() => i = 0, this.ttlResolution);
        h.unref && h.unref();
      }
      return o;
    };
    this.getRemainingTTL = (o) => {
      let h = this.#f.get(o);
      if (h === void 0) return 0;
      let a = t[h], l = e[h];
      if (!a || !l) return 1 / 0;
      let u = (i || r()) - l;
      return a - u;
    }, this.#v = (o) => {
      let h = e[o], a = t[o];
      return !!a && !!h && (i || r()) - h > a;
    };
  }
  #k = () => {
  };
  #N = () => {
  };
  #j = () => {
  };
  #v = () => false;
  #G() {
    let t = new Tt(this.#t);
    this.#u = 0, this.#C = t, this.#P = (e) => {
      this.#u -= t[e], t[e] = 0;
    }, this.#I = (e, s, i, r) => {
      if (this.#l(s)) return 0;
      if (!q(i)) if (r) {
        if (typeof r != "function") throw new TypeError("sizeCalculation must be a function");
        if (i = r(s, e), !q(i)) throw new TypeError("sizeCalculation return invalid (expect positive integer)");
      } else throw new TypeError("invalid size value (must be positive integer). When maxSize or maxEntrySize is used, sizeCalculation or size must be set.");
      return i;
    }, this.#L = (e, s, i) => {
      if (t[e] = s, this.#s) {
        let r = this.#s - t[e];
        for (; this.#u > r; ) this.#B(true);
      }
      this.#u += t[e], i && (i.entrySize = s, i.totalCalculatedSize = this.#u);
    };
  }
  #P = (t) => {
  };
  #L = (t, e, s) => {
  };
  #I = (t, e, s, i) => {
    if (s || i) throw new TypeError("cannot set size without setting maxSize or maxEntrySize on cache");
    return 0;
  };
  *#F({ allowStale: t = this.allowStale } = {}) {
    if (this.#h) for (let e = this.#p; !(!this.#z(e) || ((t || !this.#v(e)) && (yield e), e === this.#b)); ) e = this.#E[e];
  }
  *#D({ allowStale: t = this.allowStale } = {}) {
    if (this.#h) for (let e = this.#b; !(!this.#z(e) || ((t || !this.#v(e)) && (yield e), e === this.#p)); ) e = this.#d[e];
  }
  #z(t) {
    return t !== void 0 && this.#f.get(this.#a[t]) === t;
  }
  *entries() {
    for (let t of this.#F()) this.#i[t] !== void 0 && this.#a[t] !== void 0 && !this.#l(this.#i[t]) && (yield [this.#a[t], this.#i[t]]);
  }
  *rentries() {
    for (let t of this.#D()) this.#i[t] !== void 0 && this.#a[t] !== void 0 && !this.#l(this.#i[t]) && (yield [this.#a[t], this.#i[t]]);
  }
  *keys() {
    for (let t of this.#F()) {
      let e = this.#a[t];
      e !== void 0 && !this.#l(this.#i[t]) && (yield e);
    }
  }
  *rkeys() {
    for (let t of this.#D()) {
      let e = this.#a[t];
      e !== void 0 && !this.#l(this.#i[t]) && (yield e);
    }
  }
  *values() {
    for (let t of this.#F()) this.#i[t] !== void 0 && !this.#l(this.#i[t]) && (yield this.#i[t]);
  }
  *rvalues() {
    for (let t of this.#D()) this.#i[t] !== void 0 && !this.#l(this.#i[t]) && (yield this.#i[t]);
  }
  [Symbol.iterator]() {
    return this.entries();
  }
  [Symbol.toStringTag] = "LRUCache";
  find(t, e = {}) {
    for (let s of this.#F()) {
      let i = this.#i[s], r = this.#l(i) ? i.__staleWhileFetching : i;
      if (r !== void 0 && t(r, this.#a[s], this)) return this.get(this.#a[s], e);
    }
  }
  forEach(t, e = this) {
    for (let s of this.#F()) {
      let i = this.#i[s], r = this.#l(i) ? i.__staleWhileFetching : i;
      r !== void 0 && t.call(e, r, this.#a[s], this);
    }
  }
  rforEach(t, e = this) {
    for (let s of this.#D()) {
      let i = this.#i[s], r = this.#l(i) ? i.__staleWhileFetching : i;
      r !== void 0 && t.call(e, r, this.#a[s], this);
    }
  }
  purgeStale() {
    let t = false;
    for (let e of this.#D({ allowStale: true })) this.#v(e) && (this.#O(this.#a[e], "expire"), t = true);
    return t;
  }
  info(t) {
    let e = this.#f.get(t);
    if (e === void 0) return;
    let s = this.#i[e], i = this.#l(s) ? s.__staleWhileFetching : s;
    if (i === void 0) return;
    let r = { value: i };
    if (this.#g && this.#T) {
      let o = this.#g[e], h = this.#T[e];
      if (o && h) {
        let a = o - (this.#c.now() - h);
        r.ttl = a, r.start = Date.now();
      }
    }
    return this.#C && (r.size = this.#C[e]), r;
  }
  dump() {
    let t = [];
    for (let e of this.#F({ allowStale: true })) {
      let s = this.#a[e], i = this.#i[e], r = this.#l(i) ? i.__staleWhileFetching : i;
      if (r === void 0 || s === void 0) continue;
      let o = { value: r };
      if (this.#g && this.#T) {
        o.ttl = this.#g[e];
        let h = this.#c.now() - this.#T[e];
        o.start = Math.floor(Date.now() - h);
      }
      this.#C && (o.size = this.#C[e]), t.unshift([s, o]);
    }
    return t;
  }
  load(t) {
    this.clear();
    for (let [e, s] of t) {
      if (s.start) {
        let i = Date.now() - s.start;
        s.start = this.#c.now() - i;
      }
      this.set(e, s.value, s);
    }
  }
  set(t, e, s = {}) {
    if (e === void 0) return this.delete(t), this;
    let { ttl: i = this.ttl, start: r, noDisposeOnSet: o = this.noDisposeOnSet, sizeCalculation: h = this.sizeCalculation, status: a } = s, { noUpdateTTL: l = this.noUpdateTTL } = s, u = this.#I(t, e, s.size || 0, h);
    if (this.maxEntrySize && u > this.maxEntrySize) return a && (a.set = "miss", a.maxEntrySizeExceeded = true), this.#O(t, "set"), this;
    let c = this.#h === 0 ? void 0 : this.#f.get(t);
    if (c === void 0) c = this.#h === 0 ? this.#p : this.#R.length !== 0 ? this.#R.pop() : this.#h === this.#t ? this.#B(false) : this.#h, this.#a[c] = t, this.#i[c] = e, this.#f.set(t, c), this.#d[this.#p] = c, this.#E[c] = this.#p, this.#p = c, this.#h++, this.#L(c, u, a), a && (a.set = "add"), l = false, this.#_ && this.#r?.(e, t, "add");
    else {
      this.#W(c);
      let d = this.#i[c];
      if (e !== d) {
        if (this.#A && this.#l(d)) {
          d.__abortController.abort(new Error("replaced"));
          let { __staleWhileFetching: f } = d;
          f !== void 0 && !o && (this.#x && this.#n?.(f, t, "set"), this.#e && this.#m?.push([f, t, "set"]));
        } else o || (this.#x && this.#n?.(d, t, "set"), this.#e && this.#m?.push([d, t, "set"]));
        if (this.#P(c), this.#L(c, u, a), this.#i[c] = e, a) {
          a.set = "replace";
          let f = d && this.#l(d) ? d.__staleWhileFetching : d;
          f !== void 0 && (a.oldValue = f);
        }
      } else a && (a.set = "update");
      this.#_ && this.onInsert?.(e, t, e === d ? "update" : "replace");
    }
    if (i !== 0 && !this.#g && this.#M(), this.#g && (l || this.#j(c, i, r), a && this.#N(a, c)), !o && this.#e && this.#m) {
      let d = this.#m, f;
      for (; f = d?.shift(); ) this.#o?.(...f);
    }
    return this;
  }
  pop() {
    try {
      for (; this.#h; ) {
        let t = this.#i[this.#b];
        if (this.#B(true), this.#l(t)) {
          if (t.__staleWhileFetching) return t.__staleWhileFetching;
        } else if (t !== void 0) return t;
      }
    } finally {
      if (this.#e && this.#m) {
        let t = this.#m, e;
        for (; e = t?.shift(); ) this.#o?.(...e);
      }
    }
  }
  #B(t) {
    let e = this.#b, s = this.#a[e], i = this.#i[e];
    return this.#A && this.#l(i) ? i.__abortController.abort(new Error("evicted")) : (this.#x || this.#e) && (this.#x && this.#n?.(i, s, "evict"), this.#e && this.#m?.push([i, s, "evict"])), this.#P(e), this.#y?.[e] && (clearTimeout(this.#y[e]), this.#y[e] = void 0), t && (this.#a[e] = void 0, this.#i[e] = void 0, this.#R.push(e)), this.#h === 1 ? (this.#b = this.#p = 0, this.#R.length = 0) : this.#b = this.#d[e], this.#f.delete(s), this.#h--, e;
  }
  has(t, e = {}) {
    let { updateAgeOnHas: s = this.updateAgeOnHas, status: i } = e, r = this.#f.get(t);
    if (r !== void 0) {
      let o = this.#i[r];
      if (this.#l(o) && o.__staleWhileFetching === void 0) return false;
      if (this.#v(r)) i && (i.has = "stale", this.#N(i, r));
      else return s && this.#k(r), i && (i.has = "hit", this.#N(i, r)), true;
    } else i && (i.has = "miss");
    return false;
  }
  peek(t, e = {}) {
    let { allowStale: s = this.allowStale } = e, i = this.#f.get(t);
    if (i === void 0 || !s && this.#v(i)) return;
    let r = this.#i[i];
    return this.#l(r) ? r.__staleWhileFetching : r;
  }
  #U(t, e, s, i) {
    let r = e === void 0 ? void 0 : this.#i[e];
    if (this.#l(r)) return r;
    let o = new At(), { signal: h } = s;
    h?.addEventListener("abort", () => o.abort(h.reason), { signal: o.signal });
    let a = { signal: o.signal, options: s, context: i }, l = (p, w = false) => {
      let { aborted: g } = o.signal, S = s.ignoreFetchAbort && p !== void 0, E = s.ignoreFetchAbort || !!(s.allowStaleOnFetchAbort && p !== void 0);
      if (s.status && (g && !w ? (s.status.fetchAborted = true, s.status.fetchError = o.signal.reason, S && (s.status.fetchAbortIgnored = true)) : s.status.fetchResolved = true), g && !S && !w) return c(o.signal.reason, E);
      let y = f, b = this.#i[e];
      return (b === f || S && w && b === void 0) && (p === void 0 ? y.__staleWhileFetching !== void 0 ? this.#i[e] = y.__staleWhileFetching : this.#O(t, "fetch") : (s.status && (s.status.fetchUpdated = true), this.set(t, p, a.options))), p;
    }, u = (p) => (s.status && (s.status.fetchRejected = true, s.status.fetchError = p), c(p, false)), c = (p, w) => {
      let { aborted: g } = o.signal, S = g && s.allowStaleOnFetchAbort, E = S || s.allowStaleOnFetchRejection, y = E || s.noDeleteOnFetchRejection, b = f;
      if (this.#i[e] === f && (!y || !w && b.__staleWhileFetching === void 0 ? this.#O(t, "fetch") : S || (this.#i[e] = b.__staleWhileFetching)), E) return s.status && b.__staleWhileFetching !== void 0 && (s.status.returnedStale = true), b.__staleWhileFetching;
      if (b.__returned === b) throw p;
    }, d = (p, w) => {
      let g = this.#S?.(t, r, a);
      g && g instanceof Promise && g.then((S) => p(S === void 0 ? void 0 : S), w), o.signal.addEventListener("abort", () => {
        (!s.ignoreFetchAbort || s.allowStaleOnFetchAbort) && (p(void 0), s.allowStaleOnFetchAbort && (p = (S) => l(S, true)));
      });
    };
    s.status && (s.status.fetchDispatched = true);
    let f = new Promise(d).then(l, u), m = Object.assign(f, { __abortController: o, __staleWhileFetching: r, __returned: void 0 });
    return e === void 0 ? (this.set(t, m, { ...a.options, status: void 0 }), e = this.#f.get(t)) : this.#i[e] = m, m;
  }
  #l(t) {
    if (!this.#A) return false;
    let e = t;
    return !!e && e instanceof Promise && e.hasOwnProperty("__staleWhileFetching") && e.__abortController instanceof At;
  }
  async fetch(t, e = {}) {
    let { allowStale: s = this.allowStale, updateAgeOnGet: i = this.updateAgeOnGet, noDeleteOnStaleGet: r = this.noDeleteOnStaleGet, ttl: o = this.ttl, noDisposeOnSet: h = this.noDisposeOnSet, size: a = 0, sizeCalculation: l = this.sizeCalculation, noUpdateTTL: u = this.noUpdateTTL, noDeleteOnFetchRejection: c = this.noDeleteOnFetchRejection, allowStaleOnFetchRejection: d = this.allowStaleOnFetchRejection, ignoreFetchAbort: f = this.ignoreFetchAbort, allowStaleOnFetchAbort: m = this.allowStaleOnFetchAbort, context: p, forceRefresh: w = false, status: g, signal: S } = e;
    if (!this.#A) return g && (g.fetch = "get"), this.get(t, { allowStale: s, updateAgeOnGet: i, noDeleteOnStaleGet: r, status: g });
    let E = { allowStale: s, updateAgeOnGet: i, noDeleteOnStaleGet: r, ttl: o, noDisposeOnSet: h, size: a, sizeCalculation: l, noUpdateTTL: u, noDeleteOnFetchRejection: c, allowStaleOnFetchRejection: d, allowStaleOnFetchAbort: m, ignoreFetchAbort: f, status: g, signal: S }, y = this.#f.get(t);
    if (y === void 0) {
      g && (g.fetch = "miss");
      let b = this.#U(t, y, E, p);
      return b.__returned = b;
    } else {
      let b = this.#i[y];
      if (this.#l(b)) {
        let Z = s && b.__staleWhileFetching !== void 0;
        return g && (g.fetch = "inflight", Z && (g.returnedStale = true)), Z ? b.__staleWhileFetching : b.__returned = b;
      }
      let z = this.#v(y);
      if (!w && !z) return g && (g.fetch = "hit"), this.#W(y), i && this.#k(y), g && this.#N(g, y), b;
      let $ = this.#U(t, y, E, p), J = $.__staleWhileFetching !== void 0 && s;
      return g && (g.fetch = z ? "stale" : "refresh", J && z && (g.returnedStale = true)), J ? $.__staleWhileFetching : $.__returned = $;
    }
  }
  async forceFetch(t, e = {}) {
    let s = await this.fetch(t, e);
    if (s === void 0) throw new Error("fetch() returned undefined");
    return s;
  }
  memo(t, e = {}) {
    let s = this.#w;
    if (!s) throw new Error("no memoMethod provided to constructor");
    let { context: i, forceRefresh: r, ...o } = e, h = this.get(t, o);
    if (!r && h !== void 0) return h;
    let a = s(t, h, { options: o, context: i });
    return this.set(t, a, o), a;
  }
  get(t, e = {}) {
    let { allowStale: s = this.allowStale, updateAgeOnGet: i = this.updateAgeOnGet, noDeleteOnStaleGet: r = this.noDeleteOnStaleGet, status: o } = e, h = this.#f.get(t);
    if (h !== void 0) {
      let a = this.#i[h], l = this.#l(a);
      return o && this.#N(o, h), this.#v(h) ? (o && (o.get = "stale"), l ? (o && s && a.__staleWhileFetching !== void 0 && (o.returnedStale = true), s ? a.__staleWhileFetching : void 0) : (r || this.#O(t, "expire"), o && s && (o.returnedStale = true), s ? a : void 0)) : (o && (o.get = "hit"), l ? a.__staleWhileFetching : (this.#W(h), i && this.#k(h), a));
    } else o && (o.get = "miss");
  }
  #$(t, e) {
    this.#E[e] = t, this.#d[t] = e;
  }
  #W(t) {
    t !== this.#p && (t === this.#b ? this.#b = this.#d[t] : this.#$(this.#E[t], this.#d[t]), this.#$(this.#p, t), this.#p = t);
  }
  delete(t) {
    return this.#O(t, "delete");
  }
  #O(t, e) {
    let s = false;
    if (this.#h !== 0) {
      let i = this.#f.get(t);
      if (i !== void 0) if (this.#y?.[i] && (clearTimeout(this.#y?.[i]), this.#y[i] = void 0), s = true, this.#h === 1) this.#H(e);
      else {
        this.#P(i);
        let r = this.#i[i];
        if (this.#l(r) ? r.__abortController.abort(new Error("deleted")) : (this.#x || this.#e) && (this.#x && this.#n?.(r, t, e), this.#e && this.#m?.push([r, t, e])), this.#f.delete(t), this.#a[i] = void 0, this.#i[i] = void 0, i === this.#p) this.#p = this.#E[i];
        else if (i === this.#b) this.#b = this.#d[i];
        else {
          let o = this.#E[i];
          this.#d[o] = this.#d[i];
          let h = this.#d[i];
          this.#E[h] = this.#E[i];
        }
        this.#h--, this.#R.push(i);
      }
    }
    if (this.#e && this.#m?.length) {
      let i = this.#m, r;
      for (; r = i?.shift(); ) this.#o?.(...r);
    }
    return s;
  }
  clear() {
    return this.#H("delete");
  }
  #H(t) {
    for (let e of this.#D({ allowStale: true })) {
      let s = this.#i[e];
      if (this.#l(s)) s.__abortController.abort(new Error("deleted"));
      else {
        let i = this.#a[e];
        this.#x && this.#n?.(s, i, t), this.#e && this.#m?.push([s, i, t]);
      }
    }
    if (this.#f.clear(), this.#i.fill(void 0), this.#a.fill(void 0), this.#g && this.#T) {
      this.#g.fill(0), this.#T.fill(0);
      for (let e of this.#y ?? []) e !== void 0 && clearTimeout(e);
      this.#y?.fill(void 0);
    }
    if (this.#C && this.#C.fill(0), this.#b = 0, this.#p = 0, this.#R.length = 0, this.#u = 0, this.#h = 0, this.#e && this.#m) {
      let e = this.#m, s;
      for (; s = e?.shift(); ) this.#o?.(...s);
    }
  }
};
var Ne = typeof process == "object" && process ? process : { stdout: null, stderr: null };
var oi = (n7) => !!n7 && typeof n7 == "object" && (n7 instanceof V || n7 instanceof import_node_stream2.default || hi(n7) || ai(n7));
var hi = (n7) => !!n7 && typeof n7 == "object" && n7 instanceof import_node_events.EventEmitter && typeof n7.pipe == "function" && n7.pipe !== import_node_stream2.default.Writable.prototype.pipe;
var ai = (n7) => !!n7 && typeof n7 == "object" && n7 instanceof import_node_events.EventEmitter && typeof n7.write == "function" && typeof n7.end == "function";
var G = Symbol("EOF");
var H = Symbol("maybeEmitEnd");
var K = Symbol("emittedEnd");
var kt = Symbol("emittingEnd");
var ut = Symbol("emittedError");
var Rt = Symbol("closed");
var _e = Symbol("read");
var Ot = Symbol("flush");
var Le = Symbol("flushChunk");
var P = Symbol("encoding");
var et = Symbol("decoder");
var v = Symbol("flowing");
var dt = Symbol("paused");
var st = Symbol("resume");
var C = Symbol("buffer");
var F = Symbol("pipes");
var T = Symbol("bufferLength");
var Yt = Symbol("bufferPush");
var Ft = Symbol("bufferShift");
var k = Symbol("objectMode");
var x = Symbol("destroyed");
var Xt = Symbol("error");
var Jt = Symbol("emitData");
var We = Symbol("emitEnd");
var Zt = Symbol("emitEnd2");
var B = Symbol("async");
var Qt = Symbol("abort");
var Dt = Symbol("aborted");
var pt = Symbol("signal");
var Y = Symbol("dataListeners");
var M = Symbol("discarded");
var mt = (n7) => Promise.resolve().then(n7);
var li = (n7) => n7();
var ci = (n7) => n7 === "end" || n7 === "finish" || n7 === "prefinish";
var fi = (n7) => n7 instanceof ArrayBuffer || !!n7 && typeof n7 == "object" && n7.constructor && n7.constructor.name === "ArrayBuffer" && n7.byteLength >= 0;
var ui = (n7) => !Buffer.isBuffer(n7) && ArrayBuffer.isView(n7);
var Mt = class {
  src;
  dest;
  opts;
  ondrain;
  constructor(t, e, s) {
    this.src = t, this.dest = e, this.opts = s, this.ondrain = () => t[st](), this.dest.on("drain", this.ondrain);
  }
  unpipe() {
    this.dest.removeListener("drain", this.ondrain);
  }
  proxyErrors(t) {
  }
  end() {
    this.unpipe(), this.opts.end && this.dest.end();
  }
};
var te = class extends Mt {
  unpipe() {
    this.src.removeListener("error", this.proxyErrors), super.unpipe();
  }
  constructor(t, e, s) {
    super(t, e, s), this.proxyErrors = (i) => this.dest.emit("error", i), t.on("error", this.proxyErrors);
  }
};
var di = (n7) => !!n7.objectMode;
var pi = (n7) => !n7.objectMode && !!n7.encoding && n7.encoding !== "buffer";
var V = class extends import_node_events.EventEmitter {
  [v] = false;
  [dt] = false;
  [F] = [];
  [C] = [];
  [k];
  [P];
  [B];
  [et];
  [G] = false;
  [K] = false;
  [kt] = false;
  [Rt] = false;
  [ut] = null;
  [T] = 0;
  [x] = false;
  [pt];
  [Dt] = false;
  [Y] = 0;
  [M] = false;
  writable = true;
  readable = true;
  constructor(...t) {
    let e = t[0] || {};
    if (super(), e.objectMode && typeof e.encoding == "string") throw new TypeError("Encoding and objectMode may not be used together");
    di(e) ? (this[k] = true, this[P] = null) : pi(e) ? (this[P] = e.encoding, this[k] = false) : (this[k] = false, this[P] = null), this[B] = !!e.async, this[et] = this[P] ? new import_node_string_decoder.StringDecoder(this[P]) : null, e && e.debugExposeBuffer === true && Object.defineProperty(this, "buffer", { get: () => this[C] }), e && e.debugExposePipes === true && Object.defineProperty(this, "pipes", { get: () => this[F] });
    let { signal: s } = e;
    s && (this[pt] = s, s.aborted ? this[Qt]() : s.addEventListener("abort", () => this[Qt]()));
  }
  get bufferLength() {
    return this[T];
  }
  get encoding() {
    return this[P];
  }
  set encoding(t) {
    throw new Error("Encoding must be set at instantiation time");
  }
  setEncoding(t) {
    throw new Error("Encoding must be set at instantiation time");
  }
  get objectMode() {
    return this[k];
  }
  set objectMode(t) {
    throw new Error("objectMode must be set at instantiation time");
  }
  get async() {
    return this[B];
  }
  set async(t) {
    this[B] = this[B] || !!t;
  }
  [Qt]() {
    this[Dt] = true, this.emit("abort", this[pt]?.reason), this.destroy(this[pt]?.reason);
  }
  get aborted() {
    return this[Dt];
  }
  set aborted(t) {
  }
  write(t, e, s) {
    if (this[Dt]) return false;
    if (this[G]) throw new Error("write after end");
    if (this[x]) return this.emit("error", Object.assign(new Error("Cannot call write after a stream was destroyed"), { code: "ERR_STREAM_DESTROYED" })), true;
    typeof e == "function" && (s = e, e = "utf8"), e || (e = "utf8");
    let i = this[B] ? mt : li;
    if (!this[k] && !Buffer.isBuffer(t)) {
      if (ui(t)) t = Buffer.from(t.buffer, t.byteOffset, t.byteLength);
      else if (fi(t)) t = Buffer.from(t);
      else if (typeof t != "string") throw new Error("Non-contiguous data written to non-objectMode stream");
    }
    return this[k] ? (this[v] && this[T] !== 0 && this[Ot](true), this[v] ? this.emit("data", t) : this[Yt](t), this[T] !== 0 && this.emit("readable"), s && i(s), this[v]) : t.length ? (typeof t == "string" && !(e === this[P] && !this[et]?.lastNeed) && (t = Buffer.from(t, e)), Buffer.isBuffer(t) && this[P] && (t = this[et].write(t)), this[v] && this[T] !== 0 && this[Ot](true), this[v] ? this.emit("data", t) : this[Yt](t), this[T] !== 0 && this.emit("readable"), s && i(s), this[v]) : (this[T] !== 0 && this.emit("readable"), s && i(s), this[v]);
  }
  read(t) {
    if (this[x]) return null;
    if (this[M] = false, this[T] === 0 || t === 0 || t && t > this[T]) return this[H](), null;
    this[k] && (t = null), this[C].length > 1 && !this[k] && (this[C] = [this[P] ? this[C].join("") : Buffer.concat(this[C], this[T])]);
    let e = this[_e](t || null, this[C][0]);
    return this[H](), e;
  }
  [_e](t, e) {
    if (this[k]) this[Ft]();
    else {
      let s = e;
      t === s.length || t === null ? this[Ft]() : typeof s == "string" ? (this[C][0] = s.slice(t), e = s.slice(0, t), this[T] -= t) : (this[C][0] = s.subarray(t), e = s.subarray(0, t), this[T] -= t);
    }
    return this.emit("data", e), !this[C].length && !this[G] && this.emit("drain"), e;
  }
  end(t, e, s) {
    return typeof t == "function" && (s = t, t = void 0), typeof e == "function" && (s = e, e = "utf8"), t !== void 0 && this.write(t, e), s && this.once("end", s), this[G] = true, this.writable = false, (this[v] || !this[dt]) && this[H](), this;
  }
  [st]() {
    this[x] || (!this[Y] && !this[F].length && (this[M] = true), this[dt] = false, this[v] = true, this.emit("resume"), this[C].length ? this[Ot]() : this[G] ? this[H]() : this.emit("drain"));
  }
  resume() {
    return this[st]();
  }
  pause() {
    this[v] = false, this[dt] = true, this[M] = false;
  }
  get destroyed() {
    return this[x];
  }
  get flowing() {
    return this[v];
  }
  get paused() {
    return this[dt];
  }
  [Yt](t) {
    this[k] ? this[T] += 1 : this[T] += t.length, this[C].push(t);
  }
  [Ft]() {
    return this[k] ? this[T] -= 1 : this[T] -= this[C][0].length, this[C].shift();
  }
  [Ot](t = false) {
    do
      ;
    while (this[Le](this[Ft]()) && this[C].length);
    !t && !this[C].length && !this[G] && this.emit("drain");
  }
  [Le](t) {
    return this.emit("data", t), this[v];
  }
  pipe(t, e) {
    if (this[x]) return t;
    this[M] = false;
    let s = this[K];
    return e = e || {}, t === Ne.stdout || t === Ne.stderr ? e.end = false : e.end = e.end !== false, e.proxyErrors = !!e.proxyErrors, s ? e.end && t.end() : (this[F].push(e.proxyErrors ? new te(this, t, e) : new Mt(this, t, e)), this[B] ? mt(() => this[st]()) : this[st]()), t;
  }
  unpipe(t) {
    let e = this[F].find((s) => s.dest === t);
    e && (this[F].length === 1 ? (this[v] && this[Y] === 0 && (this[v] = false), this[F] = []) : this[F].splice(this[F].indexOf(e), 1), e.unpipe());
  }
  addListener(t, e) {
    return this.on(t, e);
  }
  on(t, e) {
    let s = super.on(t, e);
    if (t === "data") this[M] = false, this[Y]++, !this[F].length && !this[v] && this[st]();
    else if (t === "readable" && this[T] !== 0) super.emit("readable");
    else if (ci(t) && this[K]) super.emit(t), this.removeAllListeners(t);
    else if (t === "error" && this[ut]) {
      let i = e;
      this[B] ? mt(() => i.call(this, this[ut])) : i.call(this, this[ut]);
    }
    return s;
  }
  removeListener(t, e) {
    return this.off(t, e);
  }
  off(t, e) {
    let s = super.off(t, e);
    return t === "data" && (this[Y] = this.listeners("data").length, this[Y] === 0 && !this[M] && !this[F].length && (this[v] = false)), s;
  }
  removeAllListeners(t) {
    let e = super.removeAllListeners(t);
    return (t === "data" || t === void 0) && (this[Y] = 0, !this[M] && !this[F].length && (this[v] = false)), e;
  }
  get emittedEnd() {
    return this[K];
  }
  [H]() {
    !this[kt] && !this[K] && !this[x] && this[C].length === 0 && this[G] && (this[kt] = true, this.emit("end"), this.emit("prefinish"), this.emit("finish"), this[Rt] && this.emit("close"), this[kt] = false);
  }
  emit(t, ...e) {
    let s = e[0];
    if (t !== "error" && t !== "close" && t !== x && this[x]) return false;
    if (t === "data") return !this[k] && !s ? false : this[B] ? (mt(() => this[Jt](s)), true) : this[Jt](s);
    if (t === "end") return this[We]();
    if (t === "close") {
      if (this[Rt] = true, !this[K] && !this[x]) return false;
      let r = super.emit("close");
      return this.removeAllListeners("close"), r;
    } else if (t === "error") {
      this[ut] = s, super.emit(Xt, s);
      let r = !this[pt] || this.listeners("error").length ? super.emit("error", s) : false;
      return this[H](), r;
    } else if (t === "resume") {
      let r = super.emit("resume");
      return this[H](), r;
    } else if (t === "finish" || t === "prefinish") {
      let r = super.emit(t);
      return this.removeAllListeners(t), r;
    }
    let i = super.emit(t, ...e);
    return this[H](), i;
  }
  [Jt](t) {
    for (let s of this[F]) s.dest.write(t) === false && this.pause();
    let e = this[M] ? false : super.emit("data", t);
    return this[H](), e;
  }
  [We]() {
    return this[K] ? false : (this[K] = true, this.readable = false, this[B] ? (mt(() => this[Zt]()), true) : this[Zt]());
  }
  [Zt]() {
    if (this[et]) {
      let e = this[et].end();
      if (e) {
        for (let s of this[F]) s.dest.write(e);
        this[M] || super.emit("data", e);
      }
    }
    for (let e of this[F]) e.end();
    let t = super.emit("end");
    return this.removeAllListeners("end"), t;
  }
  async collect() {
    let t = Object.assign([], { dataLength: 0 });
    this[k] || (t.dataLength = 0);
    let e = this.promise();
    return this.on("data", (s) => {
      t.push(s), this[k] || (t.dataLength += s.length);
    }), await e, t;
  }
  async concat() {
    if (this[k]) throw new Error("cannot concat in objectMode");
    let t = await this.collect();
    return this[P] ? t.join("") : Buffer.concat(t, t.dataLength);
  }
  async promise() {
    return new Promise((t, e) => {
      this.on(x, () => e(new Error("stream destroyed"))), this.on("error", (s) => e(s)), this.on("end", () => t());
    });
  }
  [Symbol.asyncIterator]() {
    this[M] = false;
    let t = false, e = async () => (this.pause(), t = true, { value: void 0, done: true });
    return { next: () => {
      if (t) return e();
      let i = this.read();
      if (i !== null) return Promise.resolve({ done: false, value: i });
      if (this[G]) return e();
      let r, o, h = (c) => {
        this.off("data", a), this.off("end", l), this.off(x, u), e(), o(c);
      }, a = (c) => {
        this.off("error", h), this.off("end", l), this.off(x, u), this.pause(), r({ value: c, done: !!this[G] });
      }, l = () => {
        this.off("error", h), this.off("data", a), this.off(x, u), e(), r({ done: true, value: void 0 });
      }, u = () => h(new Error("stream destroyed"));
      return new Promise((c, d) => {
        o = d, r = c, this.once(x, u), this.once("error", h), this.once("end", l), this.once("data", a);
      });
    }, throw: e, return: e, [Symbol.asyncIterator]() {
      return this;
    }, [Symbol.asyncDispose]: async () => {
    } };
  }
  [Symbol.iterator]() {
    this[M] = false;
    let t = false, e = () => (this.pause(), this.off(Xt, e), this.off(x, e), this.off("end", e), t = true, { done: true, value: void 0 }), s = () => {
      if (t) return e();
      let i = this.read();
      return i === null ? e() : { done: false, value: i };
    };
    return this.once("end", e), this.once(Xt, e), this.once(x, e), { next: s, throw: e, return: e, [Symbol.iterator]() {
      return this;
    }, [Symbol.dispose]: () => {
    } };
  }
  destroy(t) {
    if (this[x]) return t ? this.emit("error", t) : this.emit(x), this;
    this[x] = true, this[M] = true, this[C].length = 0, this[T] = 0;
    let e = this;
    return typeof e.close == "function" && !this[Rt] && e.close(), t ? this.emit("error", t) : this.emit(x), this;
  }
  static get isStream() {
    return oi;
  }
};
var vi = import_fs.realpathSync.native;
var wt = { lstatSync: import_fs.lstatSync, readdir: import_fs.readdir, readdirSync: import_fs.readdirSync, readlinkSync: import_fs.readlinkSync, realpathSync: vi, promises: { lstat: import_promises3.lstat, readdir: import_promises3.readdir, readlink: import_promises3.readlink, realpath: import_promises3.realpath } };
var Ue = (n7) => !n7 || n7 === wt || n7 === xi ? wt : { ...wt, ...n7, promises: { ...wt.promises, ...n7.promises || {} } };
var $e = /^\\\\\?\\([a-z]:)\\?$/i;
var Ri = (n7) => n7.replace(/\//g, "\\").replace($e, "$1\\");
var Oi = /[\\\/]/;
var L = 0;
var Ge = 1;
var He = 2;
var U = 4;
var qe = 6;
var Ke = 8;
var X = 10;
var Ve = 12;
var _ = 15;
var gt = ~_;
var se = 16;
var je = 32;
var yt = 64;
var j = 128;
var Nt = 256;
var Lt = 512;
var Ie = yt | j | Lt;
var Fi = 1023;
var ie = (n7) => n7.isFile() ? Ke : n7.isDirectory() ? U : n7.isSymbolicLink() ? X : n7.isCharacterDevice() ? He : n7.isBlockDevice() ? qe : n7.isSocket() ? Ve : n7.isFIFO() ? Ge : L;
var ze = new ft({ max: 2 ** 12 });
var bt = (n7) => {
  let t = ze.get(n7);
  if (t) return t;
  let e = n7.normalize("NFKD");
  return ze.set(n7, e), e;
};
var Be = new ft({ max: 2 ** 12 });
var _t = (n7) => {
  let t = Be.get(n7);
  if (t) return t;
  let e = bt(n7.toLowerCase());
  return Be.set(n7, e), e;
};
var Wt = class extends ft {
  constructor() {
    super({ max: 256 });
  }
};
var ne = class extends ft {
  constructor(t = 16 * 1024) {
    super({ maxSize: t, sizeCalculation: (e) => e.length + 1 });
  }
};
var Ye = Symbol("PathScurry setAsCwd");
var R = class {
  name;
  root;
  roots;
  parent;
  nocase;
  isCWD = false;
  #t;
  #s;
  get dev() {
    return this.#s;
  }
  #n;
  get mode() {
    return this.#n;
  }
  #r;
  get nlink() {
    return this.#r;
  }
  #o;
  get uid() {
    return this.#o;
  }
  #S;
  get gid() {
    return this.#S;
  }
  #w;
  get rdev() {
    return this.#w;
  }
  #c;
  get blksize() {
    return this.#c;
  }
  #h;
  get ino() {
    return this.#h;
  }
  #u;
  get size() {
    return this.#u;
  }
  #f;
  get blocks() {
    return this.#f;
  }
  #a;
  get atimeMs() {
    return this.#a;
  }
  #i;
  get mtimeMs() {
    return this.#i;
  }
  #d;
  get ctimeMs() {
    return this.#d;
  }
  #E;
  get birthtimeMs() {
    return this.#E;
  }
  #b;
  get atime() {
    return this.#b;
  }
  #p;
  get mtime() {
    return this.#p;
  }
  #R;
  get ctime() {
    return this.#R;
  }
  #m;
  get birthtime() {
    return this.#m;
  }
  #C;
  #T;
  #g;
  #y;
  #x;
  #A;
  #e;
  #_;
  #M;
  #k;
  get parentPath() {
    return (this.parent || this).fullpath();
  }
  get path() {
    return this.parentPath;
  }
  constructor(t, e = L, s, i, r, o, h) {
    this.name = t, this.#C = r ? _t(t) : bt(t), this.#e = e & Fi, this.nocase = r, this.roots = i, this.root = s || this, this.#_ = o, this.#g = h.fullpath, this.#x = h.relative, this.#A = h.relativePosix, this.parent = h.parent, this.parent ? this.#t = this.parent.#t : this.#t = Ue(h.fs);
  }
  depth() {
    return this.#T !== void 0 ? this.#T : this.parent ? this.#T = this.parent.depth() + 1 : this.#T = 0;
  }
  childrenCache() {
    return this.#_;
  }
  resolve(t) {
    if (!t) return this;
    let e = this.getRootString(t), i = t.substring(e.length).split(this.splitSep);
    return e ? this.getRoot(e).#N(i) : this.#N(i);
  }
  #N(t) {
    let e = this;
    for (let s of t) e = e.child(s);
    return e;
  }
  children() {
    let t = this.#_.get(this);
    if (t) return t;
    let e = Object.assign([], { provisional: 0 });
    return this.#_.set(this, e), this.#e &= ~se, e;
  }
  child(t, e) {
    if (t === "" || t === ".") return this;
    if (t === "..") return this.parent || this;
    let s = this.children(), i = this.nocase ? _t(t) : bt(t);
    for (let a of s) if (a.#C === i) return a;
    let r = this.parent ? this.sep : "", o = this.#g ? this.#g + r + t : void 0, h = this.newChild(t, L, { ...e, parent: this, fullpath: o });
    return this.canReaddir() || (h.#e |= j), s.push(h), h;
  }
  relative() {
    if (this.isCWD) return "";
    if (this.#x !== void 0) return this.#x;
    let t = this.name, e = this.parent;
    if (!e) return this.#x = this.name;
    let s = e.relative();
    return s + (!s || !e.parent ? "" : this.sep) + t;
  }
  relativePosix() {
    if (this.sep === "/") return this.relative();
    if (this.isCWD) return "";
    if (this.#A !== void 0) return this.#A;
    let t = this.name, e = this.parent;
    if (!e) return this.#A = this.fullpathPosix();
    let s = e.relativePosix();
    return s + (!s || !e.parent ? "" : "/") + t;
  }
  fullpath() {
    if (this.#g !== void 0) return this.#g;
    let t = this.name, e = this.parent;
    if (!e) return this.#g = this.name;
    let i = e.fullpath() + (e.parent ? this.sep : "") + t;
    return this.#g = i;
  }
  fullpathPosix() {
    if (this.#y !== void 0) return this.#y;
    if (this.sep === "/") return this.#y = this.fullpath();
    if (!this.parent) {
      let i = this.fullpath().replace(/\\/g, "/");
      return /^[a-z]:\//i.test(i) ? this.#y = `//?/${i}` : this.#y = i;
    }
    let t = this.parent, e = t.fullpathPosix(), s = e + (!e || !t.parent ? "" : "/") + this.name;
    return this.#y = s;
  }
  isUnknown() {
    return (this.#e & _) === L;
  }
  isType(t) {
    return this[`is${t}`]();
  }
  getType() {
    return this.isUnknown() ? "Unknown" : this.isDirectory() ? "Directory" : this.isFile() ? "File" : this.isSymbolicLink() ? "SymbolicLink" : this.isFIFO() ? "FIFO" : this.isCharacterDevice() ? "CharacterDevice" : this.isBlockDevice() ? "BlockDevice" : this.isSocket() ? "Socket" : "Unknown";
  }
  isFile() {
    return (this.#e & _) === Ke;
  }
  isDirectory() {
    return (this.#e & _) === U;
  }
  isCharacterDevice() {
    return (this.#e & _) === He;
  }
  isBlockDevice() {
    return (this.#e & _) === qe;
  }
  isFIFO() {
    return (this.#e & _) === Ge;
  }
  isSocket() {
    return (this.#e & _) === Ve;
  }
  isSymbolicLink() {
    return (this.#e & X) === X;
  }
  lstatCached() {
    return this.#e & je ? this : void 0;
  }
  readlinkCached() {
    return this.#M;
  }
  realpathCached() {
    return this.#k;
  }
  readdirCached() {
    let t = this.children();
    return t.slice(0, t.provisional);
  }
  canReadlink() {
    if (this.#M) return true;
    if (!this.parent) return false;
    let t = this.#e & _;
    return !(t !== L && t !== X || this.#e & Nt || this.#e & j);
  }
  calledReaddir() {
    return !!(this.#e & se);
  }
  isENOENT() {
    return !!(this.#e & j);
  }
  isNamed(t) {
    return this.nocase ? this.#C === _t(t) : this.#C === bt(t);
  }
  async readlink() {
    let t = this.#M;
    if (t) return t;
    if (this.canReadlink() && this.parent) try {
      let e = await this.#t.promises.readlink(this.fullpath()), s = (await this.parent.realpath())?.resolve(e);
      if (s) return this.#M = s;
    } catch (e) {
      this.#D(e.code);
      return;
    }
  }
  readlinkSync() {
    let t = this.#M;
    if (t) return t;
    if (this.canReadlink() && this.parent) try {
      let e = this.#t.readlinkSync(this.fullpath()), s = this.parent.realpathSync()?.resolve(e);
      if (s) return this.#M = s;
    } catch (e) {
      this.#D(e.code);
      return;
    }
  }
  #j(t) {
    this.#e |= se;
    for (let e = t.provisional; e < t.length; e++) {
      let s = t[e];
      s && s.#v();
    }
  }
  #v() {
    this.#e & j || (this.#e = (this.#e | j) & gt, this.#G());
  }
  #G() {
    let t = this.children();
    t.provisional = 0;
    for (let e of t) e.#v();
  }
  #P() {
    this.#e |= Lt, this.#L();
  }
  #L() {
    if (this.#e & yt) return;
    let t = this.#e;
    (t & _) === U && (t &= gt), this.#e = t | yt, this.#G();
  }
  #I(t = "") {
    t === "ENOTDIR" || t === "EPERM" ? this.#L() : t === "ENOENT" ? this.#v() : this.children().provisional = 0;
  }
  #F(t = "") {
    t === "ENOTDIR" ? this.parent.#L() : t === "ENOENT" && this.#v();
  }
  #D(t = "") {
    let e = this.#e;
    e |= Nt, t === "ENOENT" && (e |= j), (t === "EINVAL" || t === "UNKNOWN") && (e &= gt), this.#e = e, t === "ENOTDIR" && this.parent && this.parent.#L();
  }
  #z(t, e) {
    return this.#U(t, e) || this.#B(t, e);
  }
  #B(t, e) {
    let s = ie(t), i = this.newChild(t.name, s, { parent: this }), r = i.#e & _;
    return r !== U && r !== X && r !== L && (i.#e |= yt), e.unshift(i), e.provisional++, i;
  }
  #U(t, e) {
    for (let s = e.provisional; s < e.length; s++) {
      let i = e[s];
      if ((this.nocase ? _t(t.name) : bt(t.name)) === i.#C) return this.#l(t, i, s, e);
    }
  }
  #l(t, e, s, i) {
    let r = e.name;
    return e.#e = e.#e & gt | ie(t), r !== t.name && (e.name = t.name), s !== i.provisional && (s === i.length - 1 ? i.pop() : i.splice(s, 1), i.unshift(e)), i.provisional++, e;
  }
  async lstat() {
    if ((this.#e & j) === 0) try {
      return this.#$(await this.#t.promises.lstat(this.fullpath())), this;
    } catch (t) {
      this.#F(t.code);
    }
  }
  lstatSync() {
    if ((this.#e & j) === 0) try {
      return this.#$(this.#t.lstatSync(this.fullpath())), this;
    } catch (t) {
      this.#F(t.code);
    }
  }
  #$(t) {
    let { atime: e, atimeMs: s, birthtime: i, birthtimeMs: r, blksize: o, blocks: h, ctime: a, ctimeMs: l, dev: u, gid: c, ino: d, mode: f, mtime: m, mtimeMs: p, nlink: w, rdev: g, size: S, uid: E } = t;
    this.#b = e, this.#a = s, this.#m = i, this.#E = r, this.#c = o, this.#f = h, this.#R = a, this.#d = l, this.#s = u, this.#S = c, this.#h = d, this.#n = f, this.#p = m, this.#i = p, this.#r = w, this.#w = g, this.#u = S, this.#o = E;
    let y = ie(t);
    this.#e = this.#e & gt | y | je, y !== L && y !== U && y !== X && (this.#e |= yt);
  }
  #W = [];
  #O = false;
  #H(t) {
    this.#O = false;
    let e = this.#W.slice();
    this.#W.length = 0, e.forEach((s) => s(null, t));
  }
  readdirCB(t, e = false) {
    if (!this.canReaddir()) {
      e ? t(null, []) : queueMicrotask(() => t(null, []));
      return;
    }
    let s = this.children();
    if (this.calledReaddir()) {
      let r = s.slice(0, s.provisional);
      e ? t(null, r) : queueMicrotask(() => t(null, r));
      return;
    }
    if (this.#W.push(t), this.#O) return;
    this.#O = true;
    let i = this.fullpath();
    this.#t.readdir(i, { withFileTypes: true }, (r, o) => {
      if (r) this.#I(r.code), s.provisional = 0;
      else {
        for (let h of o) this.#z(h, s);
        this.#j(s);
      }
      this.#H(s.slice(0, s.provisional));
    });
  }
  #q;
  async readdir() {
    if (!this.canReaddir()) return [];
    let t = this.children();
    if (this.calledReaddir()) return t.slice(0, t.provisional);
    let e = this.fullpath();
    if (this.#q) await this.#q;
    else {
      let s = () => {
      };
      this.#q = new Promise((i) => s = i);
      try {
        for (let i of await this.#t.promises.readdir(e, { withFileTypes: true })) this.#z(i, t);
        this.#j(t);
      } catch (i) {
        this.#I(i.code), t.provisional = 0;
      }
      this.#q = void 0, s();
    }
    return t.slice(0, t.provisional);
  }
  readdirSync() {
    if (!this.canReaddir()) return [];
    let t = this.children();
    if (this.calledReaddir()) return t.slice(0, t.provisional);
    let e = this.fullpath();
    try {
      for (let s of this.#t.readdirSync(e, { withFileTypes: true })) this.#z(s, t);
      this.#j(t);
    } catch (s) {
      this.#I(s.code), t.provisional = 0;
    }
    return t.slice(0, t.provisional);
  }
  canReaddir() {
    if (this.#e & Ie) return false;
    let t = _ & this.#e;
    return t === L || t === U || t === X;
  }
  shouldWalk(t, e) {
    return (this.#e & U) === U && !(this.#e & Ie) && !t.has(this) && (!e || e(this));
  }
  async realpath() {
    if (this.#k) return this.#k;
    if (!((Lt | Nt | j) & this.#e)) try {
      let t = await this.#t.promises.realpath(this.fullpath());
      return this.#k = this.resolve(t);
    } catch {
      this.#P();
    }
  }
  realpathSync() {
    if (this.#k) return this.#k;
    if (!((Lt | Nt | j) & this.#e)) try {
      let t = this.#t.realpathSync(this.fullpath());
      return this.#k = this.resolve(t);
    } catch {
      this.#P();
    }
  }
  [Ye](t) {
    if (t === this) return;
    t.isCWD = false, this.isCWD = true;
    let e = /* @__PURE__ */ new Set([]), s = [], i = this;
    for (; i && i.parent; ) e.add(i), i.#x = s.join(this.sep), i.#A = s.join("/"), i = i.parent, s.push("..");
    for (i = t; i && i.parent && !e.has(i); ) i.#x = void 0, i.#A = void 0, i = i.parent;
  }
};
var Pt = class n2 extends R {
  sep = "\\";
  splitSep = Oi;
  constructor(t, e = L, s, i, r, o, h) {
    super(t, e, s, i, r, o, h);
  }
  newChild(t, e = L, s = {}) {
    return new n2(t, e, this.root, this.roots, this.nocase, this.childrenCache(), s);
  }
  getRootString(t) {
    return import_node_path4.win32.parse(t).root;
  }
  getRoot(t) {
    if (t = Ri(t.toUpperCase()), t === this.root.name) return this.root;
    for (let [e, s] of Object.entries(this.roots)) if (this.sameRoot(t, e)) return this.roots[t] = s;
    return this.roots[t] = new it(t, this).root;
  }
  sameRoot(t, e = this.root.name) {
    return t = t.toUpperCase().replace(/\//g, "\\").replace($e, "$1\\"), t === e;
  }
};
var jt = class n3 extends R {
  splitSep = "/";
  sep = "/";
  constructor(t, e = L, s, i, r, o, h) {
    super(t, e, s, i, r, o, h);
  }
  getRootString(t) {
    return t.startsWith("/") ? "/" : "";
  }
  getRoot(t) {
    return this.root;
  }
  newChild(t, e = L, s = {}) {
    return new n3(t, e, this.root, this.roots, this.nocase, this.childrenCache(), s);
  }
};
var It = class {
  root;
  rootPath;
  roots;
  cwd;
  #t;
  #s;
  #n;
  nocase;
  #r;
  constructor(t = process.cwd(), e, s, { nocase: i, childrenCacheSize: r = 16 * 1024, fs: o = wt } = {}) {
    this.#r = Ue(o), (t instanceof URL || t.startsWith("file://")) && (t = (0, import_node_url2.fileURLToPath)(t));
    let h = e.resolve(t);
    this.roots = /* @__PURE__ */ Object.create(null), this.rootPath = this.parseRootPath(h), this.#t = new Wt(), this.#s = new Wt(), this.#n = new ne(r);
    let a = h.substring(this.rootPath.length).split(s);
    if (a.length === 1 && !a[0] && a.pop(), i === void 0) throw new TypeError("must provide nocase setting to PathScurryBase ctor");
    this.nocase = i, this.root = this.newRoot(this.#r), this.roots[this.rootPath] = this.root;
    let l = this.root, u = a.length - 1, c = e.sep, d = this.rootPath, f = false;
    for (let m of a) {
      let p = u--;
      l = l.child(m, { relative: new Array(p).fill("..").join(c), relativePosix: new Array(p).fill("..").join("/"), fullpath: d += (f ? "" : c) + m }), f = true;
    }
    this.cwd = l;
  }
  depth(t = this.cwd) {
    return typeof t == "string" && (t = this.cwd.resolve(t)), t.depth();
  }
  childrenCache() {
    return this.#n;
  }
  resolve(...t) {
    let e = "";
    for (let r = t.length - 1; r >= 0; r--) {
      let o = t[r];
      if (!(!o || o === ".") && (e = e ? `${o}/${e}` : o, this.isAbsolute(o))) break;
    }
    let s = this.#t.get(e);
    if (s !== void 0) return s;
    let i = this.cwd.resolve(e).fullpath();
    return this.#t.set(e, i), i;
  }
  resolvePosix(...t) {
    let e = "";
    for (let r = t.length - 1; r >= 0; r--) {
      let o = t[r];
      if (!(!o || o === ".") && (e = e ? `${o}/${e}` : o, this.isAbsolute(o))) break;
    }
    let s = this.#s.get(e);
    if (s !== void 0) return s;
    let i = this.cwd.resolve(e).fullpathPosix();
    return this.#s.set(e, i), i;
  }
  relative(t = this.cwd) {
    return typeof t == "string" && (t = this.cwd.resolve(t)), t.relative();
  }
  relativePosix(t = this.cwd) {
    return typeof t == "string" && (t = this.cwd.resolve(t)), t.relativePosix();
  }
  basename(t = this.cwd) {
    return typeof t == "string" && (t = this.cwd.resolve(t)), t.name;
  }
  dirname(t = this.cwd) {
    return typeof t == "string" && (t = this.cwd.resolve(t)), (t.parent || t).fullpath();
  }
  async readdir(t = this.cwd, e = { withFileTypes: true }) {
    typeof t == "string" ? t = this.cwd.resolve(t) : t instanceof R || (e = t, t = this.cwd);
    let { withFileTypes: s } = e;
    if (t.canReaddir()) {
      let i = await t.readdir();
      return s ? i : i.map((r) => r.name);
    } else return [];
  }
  readdirSync(t = this.cwd, e = { withFileTypes: true }) {
    typeof t == "string" ? t = this.cwd.resolve(t) : t instanceof R || (e = t, t = this.cwd);
    let { withFileTypes: s = true } = e;
    return t.canReaddir() ? s ? t.readdirSync() : t.readdirSync().map((i) => i.name) : [];
  }
  async lstat(t = this.cwd) {
    return typeof t == "string" && (t = this.cwd.resolve(t)), t.lstat();
  }
  lstatSync(t = this.cwd) {
    return typeof t == "string" && (t = this.cwd.resolve(t)), t.lstatSync();
  }
  async readlink(t = this.cwd, { withFileTypes: e } = { withFileTypes: false }) {
    typeof t == "string" ? t = this.cwd.resolve(t) : t instanceof R || (e = t.withFileTypes, t = this.cwd);
    let s = await t.readlink();
    return e ? s : s?.fullpath();
  }
  readlinkSync(t = this.cwd, { withFileTypes: e } = { withFileTypes: false }) {
    typeof t == "string" ? t = this.cwd.resolve(t) : t instanceof R || (e = t.withFileTypes, t = this.cwd);
    let s = t.readlinkSync();
    return e ? s : s?.fullpath();
  }
  async realpath(t = this.cwd, { withFileTypes: e } = { withFileTypes: false }) {
    typeof t == "string" ? t = this.cwd.resolve(t) : t instanceof R || (e = t.withFileTypes, t = this.cwd);
    let s = await t.realpath();
    return e ? s : s?.fullpath();
  }
  realpathSync(t = this.cwd, { withFileTypes: e } = { withFileTypes: false }) {
    typeof t == "string" ? t = this.cwd.resolve(t) : t instanceof R || (e = t.withFileTypes, t = this.cwd);
    let s = t.realpathSync();
    return e ? s : s?.fullpath();
  }
  async walk(t = this.cwd, e = {}) {
    typeof t == "string" ? t = this.cwd.resolve(t) : t instanceof R || (e = t, t = this.cwd);
    let { withFileTypes: s = true, follow: i = false, filter: r, walkFilter: o } = e, h = [];
    (!r || r(t)) && h.push(s ? t : t.fullpath());
    let a = /* @__PURE__ */ new Set(), l = (c, d) => {
      a.add(c), c.readdirCB((f, m) => {
        if (f) return d(f);
        let p = m.length;
        if (!p) return d();
        let w = () => {
          --p === 0 && d();
        };
        for (let g of m) (!r || r(g)) && h.push(s ? g : g.fullpath()), i && g.isSymbolicLink() ? g.realpath().then((S) => S?.isUnknown() ? S.lstat() : S).then((S) => S?.shouldWalk(a, o) ? l(S, w) : w()) : g.shouldWalk(a, o) ? l(g, w) : w();
      }, true);
    }, u = t;
    return new Promise((c, d) => {
      l(u, (f) => {
        if (f) return d(f);
        c(h);
      });
    });
  }
  walkSync(t = this.cwd, e = {}) {
    typeof t == "string" ? t = this.cwd.resolve(t) : t instanceof R || (e = t, t = this.cwd);
    let { withFileTypes: s = true, follow: i = false, filter: r, walkFilter: o } = e, h = [];
    (!r || r(t)) && h.push(s ? t : t.fullpath());
    let a = /* @__PURE__ */ new Set([t]);
    for (let l of a) {
      let u = l.readdirSync();
      for (let c of u) {
        (!r || r(c)) && h.push(s ? c : c.fullpath());
        let d = c;
        if (c.isSymbolicLink()) {
          if (!(i && (d = c.realpathSync()))) continue;
          d.isUnknown() && d.lstatSync();
        }
        d.shouldWalk(a, o) && a.add(d);
      }
    }
    return h;
  }
  [Symbol.asyncIterator]() {
    return this.iterate();
  }
  iterate(t = this.cwd, e = {}) {
    return typeof t == "string" ? t = this.cwd.resolve(t) : t instanceof R || (e = t, t = this.cwd), this.stream(t, e)[Symbol.asyncIterator]();
  }
  [Symbol.iterator]() {
    return this.iterateSync();
  }
  *iterateSync(t = this.cwd, e = {}) {
    typeof t == "string" ? t = this.cwd.resolve(t) : t instanceof R || (e = t, t = this.cwd);
    let { withFileTypes: s = true, follow: i = false, filter: r, walkFilter: o } = e;
    (!r || r(t)) && (yield s ? t : t.fullpath());
    let h = /* @__PURE__ */ new Set([t]);
    for (let a of h) {
      let l = a.readdirSync();
      for (let u of l) {
        (!r || r(u)) && (yield s ? u : u.fullpath());
        let c = u;
        if (u.isSymbolicLink()) {
          if (!(i && (c = u.realpathSync()))) continue;
          c.isUnknown() && c.lstatSync();
        }
        c.shouldWalk(h, o) && h.add(c);
      }
    }
  }
  stream(t = this.cwd, e = {}) {
    typeof t == "string" ? t = this.cwd.resolve(t) : t instanceof R || (e = t, t = this.cwd);
    let { withFileTypes: s = true, follow: i = false, filter: r, walkFilter: o } = e, h = new V({ objectMode: true });
    (!r || r(t)) && h.write(s ? t : t.fullpath());
    let a = /* @__PURE__ */ new Set(), l = [t], u = 0, c = () => {
      let d = false;
      for (; !d; ) {
        let f = l.shift();
        if (!f) {
          u === 0 && h.end();
          return;
        }
        u++, a.add(f);
        let m = (w, g, S = false) => {
          if (w) return h.emit("error", w);
          if (i && !S) {
            let E = [];
            for (let y of g) y.isSymbolicLink() && E.push(y.realpath().then((b) => b?.isUnknown() ? b.lstat() : b));
            if (E.length) {
              Promise.all(E).then(() => m(null, g, true));
              return;
            }
          }
          for (let E of g) E && (!r || r(E)) && (h.write(s ? E : E.fullpath()) || (d = true));
          u--;
          for (let E of g) {
            let y = E.realpathCached() || E;
            y.shouldWalk(a, o) && l.push(y);
          }
          d && !h.flowing ? h.once("drain", c) : p || c();
        }, p = true;
        f.readdirCB(m, true), p = false;
      }
    };
    return c(), h;
  }
  streamSync(t = this.cwd, e = {}) {
    typeof t == "string" ? t = this.cwd.resolve(t) : t instanceof R || (e = t, t = this.cwd);
    let { withFileTypes: s = true, follow: i = false, filter: r, walkFilter: o } = e, h = new V({ objectMode: true }), a = /* @__PURE__ */ new Set();
    (!r || r(t)) && h.write(s ? t : t.fullpath());
    let l = [t], u = 0, c = () => {
      let d = false;
      for (; !d; ) {
        let f = l.shift();
        if (!f) {
          u === 0 && h.end();
          return;
        }
        u++, a.add(f);
        let m = f.readdirSync();
        for (let p of m) (!r || r(p)) && (h.write(s ? p : p.fullpath()) || (d = true));
        u--;
        for (let p of m) {
          let w = p;
          if (p.isSymbolicLink()) {
            if (!(i && (w = p.realpathSync()))) continue;
            w.isUnknown() && w.lstatSync();
          }
          w.shouldWalk(a, o) && l.push(w);
        }
      }
      d && !h.flowing && h.once("drain", c);
    };
    return c(), h;
  }
  chdir(t = this.cwd) {
    let e = this.cwd;
    this.cwd = typeof t == "string" ? this.cwd.resolve(t) : t, this.cwd[Ye](e);
  }
};
var it = class extends It {
  sep = "\\";
  constructor(t = process.cwd(), e = {}) {
    let { nocase: s = true } = e;
    super(t, import_node_path4.win32, "\\", { ...e, nocase: s }), this.nocase = s;
    for (let i = this.cwd; i; i = i.parent) i.nocase = this.nocase;
  }
  parseRootPath(t) {
    return import_node_path4.win32.parse(t).root.toUpperCase();
  }
  newRoot(t) {
    return new Pt(this.rootPath, U, void 0, this.roots, this.nocase, this.childrenCache(), { fs: t });
  }
  isAbsolute(t) {
    return t.startsWith("/") || t.startsWith("\\") || /^[a-z]:(\/|\\)/i.test(t);
  }
};
var rt = class extends It {
  sep = "/";
  constructor(t = process.cwd(), e = {}) {
    let { nocase: s = false } = e;
    super(t, import_node_path4.posix, "/", { ...e, nocase: s }), this.nocase = s;
  }
  parseRootPath(t) {
    return "/";
  }
  newRoot(t) {
    return new jt(this.rootPath, U, void 0, this.roots, this.nocase, this.childrenCache(), { fs: t });
  }
  isAbsolute(t) {
    return t.startsWith("/");
  }
};
var St = class extends rt {
  constructor(t = process.cwd(), e = {}) {
    let { nocase: s = true } = e;
    super(t, { ...e, nocase: s });
  }
};
var Cr = process.platform === "win32" ? Pt : jt;
var Xe = process.platform === "win32" ? it : process.platform === "darwin" ? St : rt;
var Di = (n7) => n7.length >= 1;
var Mi = (n7) => n7.length >= 1;
var Ni = Symbol.for("nodejs.util.inspect.custom");
var nt = class n4 {
  #t;
  #s;
  #n;
  length;
  #r;
  #o;
  #S;
  #w;
  #c;
  #h;
  #u = true;
  constructor(t, e, s, i) {
    if (!Di(t)) throw new TypeError("empty pattern list");
    if (!Mi(e)) throw new TypeError("empty glob list");
    if (e.length !== t.length) throw new TypeError("mismatched pattern list and glob list lengths");
    if (this.length = t.length, s < 0 || s >= this.length) throw new TypeError("index out of range");
    if (this.#t = t, this.#s = e, this.#n = s, this.#r = i, this.#n === 0) {
      if (this.isUNC()) {
        let [r, o, h, a, ...l] = this.#t, [u, c, d, f, ...m] = this.#s;
        l[0] === "" && (l.shift(), m.shift());
        let p = [r, o, h, a, ""].join("/"), w = [u, c, d, f, ""].join("/");
        this.#t = [p, ...l], this.#s = [w, ...m], this.length = this.#t.length;
      } else if (this.isDrive() || this.isAbsolute()) {
        let [r, ...o] = this.#t, [h, ...a] = this.#s;
        o[0] === "" && (o.shift(), a.shift());
        let l = r + "/", u = h + "/";
        this.#t = [l, ...o], this.#s = [u, ...a], this.length = this.#t.length;
      }
    }
  }
  [Ni]() {
    return "Pattern <" + this.#s.slice(this.#n).join("/") + ">";
  }
  pattern() {
    return this.#t[this.#n];
  }
  isString() {
    return typeof this.#t[this.#n] == "string";
  }
  isGlobstar() {
    return this.#t[this.#n] === A;
  }
  isRegExp() {
    return this.#t[this.#n] instanceof RegExp;
  }
  globString() {
    return this.#S = this.#S || (this.#n === 0 ? this.isAbsolute() ? this.#s[0] + this.#s.slice(1).join("/") : this.#s.join("/") : this.#s.slice(this.#n).join("/"));
  }
  hasMore() {
    return this.length > this.#n + 1;
  }
  rest() {
    return this.#o !== void 0 ? this.#o : this.hasMore() ? (this.#o = new n4(this.#t, this.#s, this.#n + 1, this.#r), this.#o.#h = this.#h, this.#o.#c = this.#c, this.#o.#w = this.#w, this.#o) : this.#o = null;
  }
  isUNC() {
    let t = this.#t;
    return this.#c !== void 0 ? this.#c : this.#c = this.#r === "win32" && this.#n === 0 && t[0] === "" && t[1] === "" && typeof t[2] == "string" && !!t[2] && typeof t[3] == "string" && !!t[3];
  }
  isDrive() {
    let t = this.#t;
    return this.#w !== void 0 ? this.#w : this.#w = this.#r === "win32" && this.#n === 0 && this.length > 1 && typeof t[0] == "string" && /^[a-z]:$/i.test(t[0]);
  }
  isAbsolute() {
    let t = this.#t;
    return this.#h !== void 0 ? this.#h : this.#h = t[0] === "" && t.length > 1 || this.isDrive() || this.isUNC();
  }
  root() {
    let t = this.#t[0];
    return typeof t == "string" && this.isAbsolute() && this.#n === 0 ? t : "";
  }
  checkFollowGlobstar() {
    return !(this.#n === 0 || !this.isGlobstar() || !this.#u);
  }
  markFollowGlobstar() {
    return this.#n === 0 || !this.isGlobstar() || !this.#u ? false : (this.#u = false, true);
  }
};
var _i = typeof process == "object" && process && typeof process.platform == "string" ? process.platform : "linux";
var ot = class {
  relative;
  relativeChildren;
  absolute;
  absoluteChildren;
  platform;
  mmopts;
  constructor(t, { nobrace: e, nocase: s, noext: i, noglobstar: r, platform: o = _i }) {
    this.relative = [], this.absolute = [], this.relativeChildren = [], this.absoluteChildren = [], this.platform = o, this.mmopts = { dot: true, nobrace: e, nocase: s, noext: i, noglobstar: r, optimizationLevel: 2, platform: o, nocomment: true, nonegate: true };
    for (let h of t) this.add(h);
  }
  add(t) {
    let e = new D(t, this.mmopts);
    for (let s = 0; s < e.set.length; s++) {
      let i = e.set[s], r = e.globParts[s];
      if (!i || !r) throw new Error("invalid pattern object");
      for (; i[0] === "." && r[0] === "."; ) i.shift(), r.shift();
      let o = new nt(i, r, 0, this.platform), h = new D(o.globString(), this.mmopts), a = r[r.length - 1] === "**", l = o.isAbsolute();
      l ? this.absolute.push(h) : this.relative.push(h), a && (l ? this.absoluteChildren.push(h) : this.relativeChildren.push(h));
    }
  }
  ignored(t) {
    let e = t.fullpath(), s = `${e}/`, i = t.relative() || ".", r = `${i}/`;
    for (let o of this.relative) if (o.match(i) || o.match(r)) return true;
    for (let o of this.absolute) if (o.match(e) || o.match(s)) return true;
    return false;
  }
  childrenIgnored(t) {
    let e = t.fullpath() + "/", s = (t.relative() || ".") + "/";
    for (let i of this.relativeChildren) if (i.match(s)) return true;
    for (let i of this.absoluteChildren) if (i.match(e)) return true;
    return false;
  }
};
var oe = class n5 {
  store;
  constructor(t = /* @__PURE__ */ new Map()) {
    this.store = t;
  }
  copy() {
    return new n5(new Map(this.store));
  }
  hasWalked(t, e) {
    return this.store.get(t.fullpath())?.has(e.globString());
  }
  storeWalked(t, e) {
    let s = t.fullpath(), i = this.store.get(s);
    i ? i.add(e.globString()) : this.store.set(s, /* @__PURE__ */ new Set([e.globString()]));
  }
};
var he = class {
  store = /* @__PURE__ */ new Map();
  add(t, e, s) {
    let i = (e ? 2 : 0) | (s ? 1 : 0), r = this.store.get(t);
    this.store.set(t, r === void 0 ? i : i & r);
  }
  entries() {
    return [...this.store.entries()].map(([t, e]) => [t, !!(e & 2), !!(e & 1)]);
  }
};
var ae = class {
  store = /* @__PURE__ */ new Map();
  add(t, e) {
    if (!t.canReaddir()) return;
    let s = this.store.get(t);
    s ? s.find((i) => i.globString() === e.globString()) || s.push(e) : this.store.set(t, [e]);
  }
  get(t) {
    let e = this.store.get(t);
    if (!e) throw new Error("attempting to walk unknown path");
    return e;
  }
  entries() {
    return this.keys().map((t) => [t, this.store.get(t)]);
  }
  keys() {
    return [...this.store.keys()].filter((t) => t.canReaddir());
  }
};
var Et = class n6 {
  hasWalkedCache;
  matches = new he();
  subwalks = new ae();
  patterns;
  follow;
  dot;
  opts;
  constructor(t, e) {
    this.opts = t, this.follow = !!t.follow, this.dot = !!t.dot, this.hasWalkedCache = e ? e.copy() : new oe();
  }
  processPatterns(t, e) {
    this.patterns = e;
    let s = e.map((i) => [t, i]);
    for (let [i, r] of s) {
      this.hasWalkedCache.storeWalked(i, r);
      let o = r.root(), h = r.isAbsolute() && this.opts.absolute !== false;
      if (o) {
        i = i.resolve(o === "/" && this.opts.root !== void 0 ? this.opts.root : o);
        let c = r.rest();
        if (c) r = c;
        else {
          this.matches.add(i, true, false);
          continue;
        }
      }
      if (i.isENOENT()) continue;
      let a, l, u = false;
      for (; typeof (a = r.pattern()) == "string" && (l = r.rest()); ) i = i.resolve(a), r = l, u = true;
      if (a = r.pattern(), l = r.rest(), u) {
        if (this.hasWalkedCache.hasWalked(i, r)) continue;
        this.hasWalkedCache.storeWalked(i, r);
      }
      if (typeof a == "string") {
        let c = a === ".." || a === "" || a === ".";
        this.matches.add(i.resolve(a), h, c);
        continue;
      } else if (a === A) {
        (!i.isSymbolicLink() || this.follow || r.checkFollowGlobstar()) && this.subwalks.add(i, r);
        let c = l?.pattern(), d = l?.rest();
        if (!l || (c === "" || c === ".") && !d) this.matches.add(i, h, c === "" || c === ".");
        else if (c === "..") {
          let f = i.parent || i;
          d ? this.hasWalkedCache.hasWalked(f, d) || this.subwalks.add(f, d) : this.matches.add(f, h, true);
        }
      } else a instanceof RegExp && this.subwalks.add(i, r);
    }
    return this;
  }
  subwalkTargets() {
    return this.subwalks.keys();
  }
  child() {
    return new n6(this.opts, this.hasWalkedCache);
  }
  filterEntries(t, e) {
    let s = this.subwalks.get(t), i = this.child();
    for (let r of e) for (let o of s) {
      let h = o.isAbsolute(), a = o.pattern(), l = o.rest();
      a === A ? i.testGlobstar(r, o, l, h) : a instanceof RegExp ? i.testRegExp(r, a, l, h) : i.testString(r, a, l, h);
    }
    return i;
  }
  testGlobstar(t, e, s, i) {
    if ((this.dot || !t.name.startsWith(".")) && (e.hasMore() || this.matches.add(t, i, false), t.canReaddir() && (this.follow || !t.isSymbolicLink() ? this.subwalks.add(t, e) : t.isSymbolicLink() && (s && e.checkFollowGlobstar() ? this.subwalks.add(t, s) : e.markFollowGlobstar() && this.subwalks.add(t, e)))), s) {
      let r = s.pattern();
      if (typeof r == "string" && r !== ".." && r !== "" && r !== ".") this.testString(t, r, s.rest(), i);
      else if (r === "..") {
        let o = t.parent || t;
        this.subwalks.add(o, s);
      } else r instanceof RegExp && this.testRegExp(t, r, s.rest(), i);
    }
  }
  testRegExp(t, e, s, i) {
    e.test(t.name) && (s ? this.subwalks.add(t, s) : this.matches.add(t, i, false));
  }
  testString(t, e, s, i) {
    t.isNamed(e) && (s ? this.subwalks.add(t, s) : this.matches.add(t, i, false));
  }
};
var Li = (n7, t) => typeof n7 == "string" ? new ot([n7], t) : Array.isArray(n7) ? new ot(n7, t) : n7;
var zt = class {
  path;
  patterns;
  opts;
  seen = /* @__PURE__ */ new Set();
  paused = false;
  aborted = false;
  #t = [];
  #s;
  #n;
  signal;
  maxDepth;
  includeChildMatches;
  constructor(t, e, s) {
    if (this.patterns = t, this.path = e, this.opts = s, this.#n = !s.posix && s.platform === "win32" ? "\\" : "/", this.includeChildMatches = s.includeChildMatches !== false, (s.ignore || !this.includeChildMatches) && (this.#s = Li(s.ignore ?? [], s), !this.includeChildMatches && typeof this.#s.add != "function")) {
      let i = "cannot ignore child matches, ignore lacks add() method.";
      throw new Error(i);
    }
    this.maxDepth = s.maxDepth || 1 / 0, s.signal && (this.signal = s.signal, this.signal.addEventListener("abort", () => {
      this.#t.length = 0;
    }));
  }
  #r(t) {
    return this.seen.has(t) || !!this.#s?.ignored?.(t);
  }
  #o(t) {
    return !!this.#s?.childrenIgnored?.(t);
  }
  pause() {
    this.paused = true;
  }
  resume() {
    if (this.signal?.aborted) return;
    this.paused = false;
    let t;
    for (; !this.paused && (t = this.#t.shift()); ) t();
  }
  onResume(t) {
    this.signal?.aborted || (this.paused ? this.#t.push(t) : t());
  }
  async matchCheck(t, e) {
    if (e && this.opts.nodir) return;
    let s;
    if (this.opts.realpath) {
      if (s = t.realpathCached() || await t.realpath(), !s) return;
      t = s;
    }
    let r = t.isUnknown() || this.opts.stat ? await t.lstat() : t;
    if (this.opts.follow && this.opts.nodir && r?.isSymbolicLink()) {
      let o = await r.realpath();
      o && (o.isUnknown() || this.opts.stat) && await o.lstat();
    }
    return this.matchCheckTest(r, e);
  }
  matchCheckTest(t, e) {
    return t && (this.maxDepth === 1 / 0 || t.depth() <= this.maxDepth) && (!e || t.canReaddir()) && (!this.opts.nodir || !t.isDirectory()) && (!this.opts.nodir || !this.opts.follow || !t.isSymbolicLink() || !t.realpathCached()?.isDirectory()) && !this.#r(t) ? t : void 0;
  }
  matchCheckSync(t, e) {
    if (e && this.opts.nodir) return;
    let s;
    if (this.opts.realpath) {
      if (s = t.realpathCached() || t.realpathSync(), !s) return;
      t = s;
    }
    let r = t.isUnknown() || this.opts.stat ? t.lstatSync() : t;
    if (this.opts.follow && this.opts.nodir && r?.isSymbolicLink()) {
      let o = r.realpathSync();
      o && (o?.isUnknown() || this.opts.stat) && o.lstatSync();
    }
    return this.matchCheckTest(r, e);
  }
  matchFinish(t, e) {
    if (this.#r(t)) return;
    if (!this.includeChildMatches && this.#s?.add) {
      let r = `${t.relativePosix()}/**`;
      this.#s.add(r);
    }
    let s = this.opts.absolute === void 0 ? e : this.opts.absolute;
    this.seen.add(t);
    let i = this.opts.mark && t.isDirectory() ? this.#n : "";
    if (this.opts.withFileTypes) this.matchEmit(t);
    else if (s) {
      let r = this.opts.posix ? t.fullpathPosix() : t.fullpath();
      this.matchEmit(r + i);
    } else {
      let r = this.opts.posix ? t.relativePosix() : t.relative(), o = this.opts.dotRelative && !r.startsWith(".." + this.#n) ? "." + this.#n : "";
      this.matchEmit(r ? o + r + i : "." + i);
    }
  }
  async match(t, e, s) {
    let i = await this.matchCheck(t, s);
    i && this.matchFinish(i, e);
  }
  matchSync(t, e, s) {
    let i = this.matchCheckSync(t, s);
    i && this.matchFinish(i, e);
  }
  walkCB(t, e, s) {
    this.signal?.aborted && s(), this.walkCB2(t, e, new Et(this.opts), s);
  }
  walkCB2(t, e, s, i) {
    if (this.#o(t)) return i();
    if (this.signal?.aborted && i(), this.paused) {
      this.onResume(() => this.walkCB2(t, e, s, i));
      return;
    }
    s.processPatterns(t, e);
    let r = 1, o = () => {
      --r === 0 && i();
    };
    for (let [h, a, l] of s.matches.entries()) this.#r(h) || (r++, this.match(h, a, l).then(() => o()));
    for (let h of s.subwalkTargets()) {
      if (this.maxDepth !== 1 / 0 && h.depth() >= this.maxDepth) continue;
      r++;
      let a = h.readdirCached();
      h.calledReaddir() ? this.walkCB3(h, a, s, o) : h.readdirCB((l, u) => this.walkCB3(h, u, s, o), true);
    }
    o();
  }
  walkCB3(t, e, s, i) {
    s = s.filterEntries(t, e);
    let r = 1, o = () => {
      --r === 0 && i();
    };
    for (let [h, a, l] of s.matches.entries()) this.#r(h) || (r++, this.match(h, a, l).then(() => o()));
    for (let [h, a] of s.subwalks.entries()) r++, this.walkCB2(h, a, s.child(), o);
    o();
  }
  walkCBSync(t, e, s) {
    this.signal?.aborted && s(), this.walkCB2Sync(t, e, new Et(this.opts), s);
  }
  walkCB2Sync(t, e, s, i) {
    if (this.#o(t)) return i();
    if (this.signal?.aborted && i(), this.paused) {
      this.onResume(() => this.walkCB2Sync(t, e, s, i));
      return;
    }
    s.processPatterns(t, e);
    let r = 1, o = () => {
      --r === 0 && i();
    };
    for (let [h, a, l] of s.matches.entries()) this.#r(h) || this.matchSync(h, a, l);
    for (let h of s.subwalkTargets()) {
      if (this.maxDepth !== 1 / 0 && h.depth() >= this.maxDepth) continue;
      r++;
      let a = h.readdirSync();
      this.walkCB3Sync(h, a, s, o);
    }
    o();
  }
  walkCB3Sync(t, e, s, i) {
    s = s.filterEntries(t, e);
    let r = 1, o = () => {
      --r === 0 && i();
    };
    for (let [h, a, l] of s.matches.entries()) this.#r(h) || this.matchSync(h, a, l);
    for (let [h, a] of s.subwalks.entries()) r++, this.walkCB2Sync(h, a, s.child(), o);
    o();
  }
};
var xt = class extends zt {
  matches = /* @__PURE__ */ new Set();
  constructor(t, e, s) {
    super(t, e, s);
  }
  matchEmit(t) {
    this.matches.add(t);
  }
  async walk() {
    if (this.signal?.aborted) throw this.signal.reason;
    return this.path.isUnknown() && await this.path.lstat(), await new Promise((t, e) => {
      this.walkCB(this.path, this.patterns, () => {
        this.signal?.aborted ? e(this.signal.reason) : t(this.matches);
      });
    }), this.matches;
  }
  walkSync() {
    if (this.signal?.aborted) throw this.signal.reason;
    return this.path.isUnknown() && this.path.lstatSync(), this.walkCBSync(this.path, this.patterns, () => {
      if (this.signal?.aborted) throw this.signal.reason;
    }), this.matches;
  }
};
var vt = class extends zt {
  results;
  constructor(t, e, s) {
    super(t, e, s), this.results = new V({ signal: this.signal, objectMode: true }), this.results.on("drain", () => this.resume()), this.results.on("resume", () => this.resume());
  }
  matchEmit(t) {
    this.results.write(t), this.results.flowing || this.pause();
  }
  stream() {
    let t = this.path;
    return t.isUnknown() ? t.lstat().then(() => {
      this.walkCB(t, this.patterns, () => this.results.end());
    }) : this.walkCB(t, this.patterns, () => this.results.end()), this.results;
  }
  streamSync() {
    return this.path.isUnknown() && this.path.lstatSync(), this.walkCBSync(this.path, this.patterns, () => this.results.end()), this.results;
  }
};
var Pi = typeof process == "object" && process && typeof process.platform == "string" ? process.platform : "linux";
var I = class {
  absolute;
  cwd;
  root;
  dot;
  dotRelative;
  follow;
  ignore;
  magicalBraces;
  mark;
  matchBase;
  maxDepth;
  nobrace;
  nocase;
  nodir;
  noext;
  noglobstar;
  pattern;
  platform;
  realpath;
  scurry;
  stat;
  signal;
  windowsPathsNoEscape;
  withFileTypes;
  includeChildMatches;
  opts;
  patterns;
  constructor(t, e) {
    if (!e) throw new TypeError("glob options required");
    if (this.withFileTypes = !!e.withFileTypes, this.signal = e.signal, this.follow = !!e.follow, this.dot = !!e.dot, this.dotRelative = !!e.dotRelative, this.nodir = !!e.nodir, this.mark = !!e.mark, e.cwd ? (e.cwd instanceof URL || e.cwd.startsWith("file://")) && (e.cwd = (0, import_node_url.fileURLToPath)(e.cwd)) : this.cwd = "", this.cwd = e.cwd || "", this.root = e.root, this.magicalBraces = !!e.magicalBraces, this.nobrace = !!e.nobrace, this.noext = !!e.noext, this.realpath = !!e.realpath, this.absolute = e.absolute, this.includeChildMatches = e.includeChildMatches !== false, this.noglobstar = !!e.noglobstar, this.matchBase = !!e.matchBase, this.maxDepth = typeof e.maxDepth == "number" ? e.maxDepth : 1 / 0, this.stat = !!e.stat, this.ignore = e.ignore, this.withFileTypes && this.absolute !== void 0) throw new Error("cannot set absolute and withFileTypes:true");
    if (typeof t == "string" && (t = [t]), this.windowsPathsNoEscape = !!e.windowsPathsNoEscape || e.allowWindowsEscape === false, this.windowsPathsNoEscape && (t = t.map((a) => a.replace(/\\/g, "/"))), this.matchBase) {
      if (e.noglobstar) throw new TypeError("base matching requires globstar");
      t = t.map((a) => a.includes("/") ? a : `./**/${a}`);
    }
    if (this.pattern = t, this.platform = e.platform || Pi, this.opts = { ...e, platform: this.platform }, e.scurry) {
      if (this.scurry = e.scurry, e.nocase !== void 0 && e.nocase !== e.scurry.nocase) throw new Error("nocase option contradicts provided scurry option");
    } else {
      let a = e.platform === "win32" ? it : e.platform === "darwin" ? St : e.platform ? rt : Xe;
      this.scurry = new a(this.cwd, { nocase: e.nocase, fs: e.fs });
    }
    this.nocase = this.scurry.nocase;
    let s = this.platform === "darwin" || this.platform === "win32", i = { braceExpandMax: 1e4, ...e, dot: this.dot, matchBase: this.matchBase, nobrace: this.nobrace, nocase: this.nocase, nocaseMagicOnly: s, nocomment: true, noext: this.noext, nonegate: true, optimizationLevel: 2, platform: this.platform, windowsPathsNoEscape: this.windowsPathsNoEscape, debug: !!this.opts.debug }, r = this.pattern.map((a) => new D(a, i)), [o, h] = r.reduce((a, l) => (a[0].push(...l.set), a[1].push(...l.globParts), a), [[], []]);
    this.patterns = o.map((a, l) => {
      let u = h[l];
      if (!u) throw new Error("invalid pattern object");
      return new nt(a, u, 0, this.platform);
    });
  }
  async walk() {
    return [...await new xt(this.patterns, this.scurry.cwd, { ...this.opts, maxDepth: this.maxDepth !== 1 / 0 ? this.maxDepth + this.scurry.cwd.depth() : 1 / 0, platform: this.platform, nocase: this.nocase, includeChildMatches: this.includeChildMatches }).walk()];
  }
  walkSync() {
    return [...new xt(this.patterns, this.scurry.cwd, { ...this.opts, maxDepth: this.maxDepth !== 1 / 0 ? this.maxDepth + this.scurry.cwd.depth() : 1 / 0, platform: this.platform, nocase: this.nocase, includeChildMatches: this.includeChildMatches }).walkSync()];
  }
  stream() {
    return new vt(this.patterns, this.scurry.cwd, { ...this.opts, maxDepth: this.maxDepth !== 1 / 0 ? this.maxDepth + this.scurry.cwd.depth() : 1 / 0, platform: this.platform, nocase: this.nocase, includeChildMatches: this.includeChildMatches }).stream();
  }
  streamSync() {
    return new vt(this.patterns, this.scurry.cwd, { ...this.opts, maxDepth: this.maxDepth !== 1 / 0 ? this.maxDepth + this.scurry.cwd.depth() : 1 / 0, platform: this.platform, nocase: this.nocase, includeChildMatches: this.includeChildMatches }).streamSync();
  }
  iterateSync() {
    return this.streamSync()[Symbol.iterator]();
  }
  [Symbol.iterator]() {
    return this.iterateSync();
  }
  iterate() {
    return this.stream()[Symbol.asyncIterator]();
  }
  [Symbol.asyncIterator]() {
    return this.iterate();
  }
};
var le = (n7, t = {}) => {
  Array.isArray(n7) || (n7 = [n7]);
  for (let e of n7) if (new D(e, t).hasMagic()) return true;
  return false;
};
function Bt(n7, t = {}) {
  return new I(n7, t).streamSync();
}
function Qe(n7, t = {}) {
  return new I(n7, t).stream();
}
function ts(n7, t = {}) {
  return new I(n7, t).walkSync();
}
async function Je(n7, t = {}) {
  return new I(n7, t).walk();
}
function Ut(n7, t = {}) {
  return new I(n7, t).iterateSync();
}
function es(n7, t = {}) {
  return new I(n7, t).iterate();
}
var ji = Bt;
var Ii = Object.assign(Qe, { sync: Bt });
var zi = Ut;
var Bi = Object.assign(es, { sync: Ut });
var Ui = Object.assign(ts, { stream: Bt, iterate: Ut });
var Ze = Object.assign(Je, { glob: Je, globSync: ts, sync: Ui, globStream: Qe, stream: Ii, globStreamSync: Bt, streamSync: ji, globIterate: es, iterate: Bi, globIterateSync: Ut, iterateSync: zi, Glob: I, hasMagic: le, escape: tt, unescape: W });
Ze.glob = Ze;

// node_modules/@electron/asar/lib/crawlfs.js
var import_node_path5 = __toESM(require("node:path"), 1);
async function determineFileType(filename) {
  const stat = await wrappedFs.lstat(filename);
  if (stat.isFile()) {
    return { type: "file", stat };
  } else if (stat.isDirectory()) {
    return { type: "directory", stat };
  } else if (stat.isSymbolicLink()) {
    return { type: "link", stat };
  }
  return null;
}
async function crawl(dir, options) {
  const metadata = {};
  const crawled = await Ze(dir, {
    windowsPathsNoEscape: true,
    ...options
  });
  const results = await Promise.all(crawled.sort().map(async (filename) => [filename, await determineFileType(filename)]));
  const links = [];
  const linkSet = /* @__PURE__ */ new Set();
  const filenames = results.map(([filename, type]) => {
    if (type) {
      metadata[filename] = type;
      if (type.type === "link") {
        links.push(filename);
        linkSet.add(filename);
      }
    }
    return filename;
  }).filter((filename) => {
    if (links.length === 0)
      return true;
    const isExactLink = linkSet.has(filename);
    for (const link of links) {
      if (isExactLink && filename === link)
        continue;
      if (filename.startsWith(link)) {
        const relativePath = import_node_path5.default.relative(link, import_node_path5.default.dirname(filename));
        if (!relativePath.startsWith(".."))
          return false;
      }
    }
    return true;
  });
  return [filenames, metadata];
}

// node_modules/@electron/asar/lib/asar.js
function isUnpackedDir(dirPath, pattern, unpackDirs) {
  if (dirPath.startsWith(pattern) || minimatch(dirPath, pattern)) {
    unpackDirs.add(dirPath);
    return true;
  } else {
    for (const unpackDir of unpackDirs) {
      if (dirPath.startsWith(unpackDir) && !import_node_path6.default.relative(unpackDir, dirPath).startsWith("..")) {
        return true;
      }
    }
    return false;
  }
}
async function createPackage(src, dest) {
  return createPackageWithOptions(src, dest, {});
}
async function createPackageWithOptions(src, dest, options) {
  const globOptions = options.globOptions ? options.globOptions : {};
  globOptions.dot = options.dot === void 0 ? true : options.dot;
  const pattern = src + (options.pattern ? options.pattern : "/**/*");
  const [filenames, metadata] = await crawl(pattern, globOptions);
  return createPackageFromFiles(src, dest, filenames, metadata, options);
}
async function createPackageFromFiles(src, dest, filenames, metadata = {}, options = {}) {
  src = import_node_path6.default.normalize(src);
  dest = import_node_path6.default.normalize(dest);
  filenames = filenames.map(function(filename) {
    return import_node_path6.default.normalize(filename);
  });
  const filesystem = new Filesystem(src);
  const files = [];
  const links = [];
  const unpackDirs = /* @__PURE__ */ new Set();
  let filenamesSorted = [];
  if (options.ordering) {
    const orderingFiles = (await wrappedFs.readFile(options.ordering)).toString().split("\n").map((line) => {
      if (line.includes(":")) {
        line = line.split(":").pop();
      }
      line = line.trim();
      if (line.startsWith("/")) {
        line = line.slice(1);
      }
      return line;
    });
    const ordering = [];
    for (const file of orderingFiles) {
      const pathComponents = file.split(import_node_path6.default.sep);
      let str = src;
      for (const pathComponent of pathComponents) {
        str = import_node_path6.default.join(str, pathComponent);
        ordering.push(str);
      }
    }
    let missing = 0;
    const total = filenames.length;
    const filenameSet = new Set(filenames);
    const sortedSet = /* @__PURE__ */ new Set();
    for (const file of ordering) {
      if (!sortedSet.has(file) && filenameSet.has(file)) {
        filenamesSorted.push(file);
        sortedSet.add(file);
      }
    }
    for (const file of filenames) {
      if (!sortedSet.has(file)) {
        filenamesSorted.push(file);
        sortedSet.add(file);
        missing += 1;
      }
    }
    console.log(`Ordering file has ${(total - missing) / total * 100}% coverage.`);
  } else {
    filenamesSorted = filenames;
  }
  const shouldUnpackPath = function(filename, relativePath, unpack, unpackDir) {
    let shouldUnpack = false;
    if (unpack) {
      shouldUnpack = minimatch(filename, unpack, { matchBase: true });
    }
    if (!shouldUnpack && unpackDir) {
      shouldUnpack = isUnpackedDir(relativePath, unpackDir, unpackDirs);
    }
    return shouldUnpack;
  };
  const missingMetadata = filenamesSorted.filter((f) => !metadata[f]);
  if (missingMetadata.length > 0) {
    const resolved = await Promise.all(missingMetadata.map(async (filename) => {
      const fileType = await determineFileType(filename);
      if (!fileType) {
        throw new Error("Unknown file type for file: " + filename);
      }
      return [filename, fileType];
    }));
    for (const [filename, fileType] of resolved) {
      metadata[filename] = fileType;
    }
  }
  for (const filename of filenamesSorted) {
    const file = metadata[filename];
    let shouldUnpack;
    switch (file.type) {
      case "directory":
        shouldUnpack = shouldUnpackPath(filename, import_node_path6.default.relative(src, filename), void 0, options.unpackDir);
        filesystem.insertDirectory(filename, shouldUnpack);
        break;
      case "file":
        shouldUnpack = shouldUnpackPath(filename, import_node_path6.default.relative(src, import_node_path6.default.dirname(filename)), options.unpack, options.unpackDir);
        files.push({ filename, unpack: shouldUnpack });
        await filesystem.insertFile(filename, () => wrappedFs.createReadStream(filename), shouldUnpack, file, options);
        break;
      case "link":
        shouldUnpack = shouldUnpackPath(filename, import_node_path6.default.relative(src, filename), options.unpack, options.unpackDir);
        links.push({ filename, unpack: shouldUnpack });
        filesystem.insertLink(filename, shouldUnpack);
        break;
    }
  }
  await wrappedFs.mkdirp(import_node_path6.default.dirname(dest));
  return writeFilesystem(dest, filesystem, { files, links }, metadata);
}
function listPackage(archivePath, options) {
  return readFilesystemSync(archivePath).listFiles(options);
}
function extractFile(archivePath, filename, followLinks = true) {
  const filesystem = readFilesystemSync(archivePath);
  const fileInfo = filesystem.getFile(filename, followLinks);
  if ("link" in fileInfo || "files" in fileInfo) {
    throw new Error("Expected to find file at: " + filename + " but found a directory or link");
  }
  return readFileSync(filesystem, filename, fileInfo);
}
function extractAll(archivePath, dest) {
  const filesystem = readFilesystemSync(archivePath);
  const filenames = filesystem.listFiles();
  const followLinks = process.platform === "win32";
  wrappedFs.mkdirpSync(dest);
  const headerSize = filesystem.getHeaderSize();
  const archiveSize = wrappedFs.statSync(archivePath).size;
  const dataStart = 8 + headerSize;
  const dataSize = archiveSize - dataStart;
  let dataBuf = null;
  if (dataSize > 0) {
    dataBuf = Buffer.alloc(dataSize);
    const fd = wrappedFs.openSync(archivePath, "r");
    try {
      wrappedFs.readSync(fd, dataBuf, 0, dataSize, dataStart);
    } finally {
      wrappedFs.closeSync(fd);
    }
  }
  const extractionErrors = [];
  for (const fullPath of filenames) {
    const filename = fullPath.substr(1);
    const destFilename = import_node_path6.default.join(dest, filename);
    const file = filesystem.getFile(filename, followLinks);
    if (import_node_path6.default.relative(dest, destFilename).startsWith("..")) {
      throw new Error(`${fullPath}: file "${destFilename}" writes out of the package`);
    }
    if ("files" in file) {
      wrappedFs.mkdirpSync(destFilename);
    } else if ("link" in file) {
      const linkSrcPath = import_node_path6.default.dirname(import_node_path6.default.join(dest, file.link));
      const linkDestPath = import_node_path6.default.dirname(destFilename);
      const relativePath = import_node_path6.default.relative(linkDestPath, linkSrcPath);
      try {
        wrappedFs.unlinkSync(destFilename);
      } catch {
      }
      const linkTo = import_node_path6.default.join(relativePath, import_node_path6.default.basename(file.link));
      if (import_node_path6.default.relative(dest, linkSrcPath).startsWith("..")) {
        throw new Error(`${fullPath}: file "${file.link}" links out of the package to "${linkSrcPath}"`);
      }
      wrappedFs.symlinkSync(linkTo, destFilename);
    } else {
      try {
        let content;
        if (file.unpacked) {
          content = wrappedFs.readFileSync(import_node_path6.default.join(`${filesystem.getRootPath()}.unpacked`, filename));
        } else if (file.size <= 0) {
          content = Buffer.alloc(0);
        } else {
          const offset = parseInt(file.offset);
          content = dataBuf.subarray(offset, offset + file.size);
        }
        wrappedFs.writeFileSync(destFilename, content);
        if (file.executable) {
          wrappedFs.chmodSync(destFilename, "755");
        }
      } catch (e) {
        extractionErrors.push(e);
      }
    }
  }
  if (extractionErrors.length) {
    throw new Error("Unable to extract some files:\n\n" + extractionErrors.map((error) => error.stack).join("\n\n"));
  }
}

// launcher/install.mjs
var import_node_child_process2 = require("node:child_process");
var import_node_fs3 = require("node:fs");
var import_node_path8 = require("node:path");
var import_promises4 = require("node:timers/promises");

// launcher/asar-patcher.mjs
var import_node_crypto2 = require("node:crypto");
var import_node_fs2 = require("node:fs");
var import_node_path7 = require("node:path");
var import_node_url3 = require("node:url");
var import_meta2 = { url: require("node:url").pathToFileURL(__filename).href };
var __dirname = (0, import_node_path7.dirname)((0, import_node_url3.fileURLToPath)(require("node:url").pathToFileURL(__filename).href));
var PROJECT_ROOT = (0, import_node_path7.resolve)(__dirname, "..");
var MARKER_BEGIN = "/* ::zcode-timeline:bootstrap:begin:: */";
var MARKER_END = "/* ::zcode-timeline:bootstrap:end:: */";
var MARKER_BEGIN_RENDERER = "<!-- ::zcode-timeline:renderer:begin:: -->";
var MARKER_END_RENDERER = "<!-- ::zcode-timeline:renderer:end:: -->";
var INSTALL_BUNDLE = (0, import_node_path7.join)(PROJECT_ROOT, "dist", "timeline.install.iife.js");
var INSTALL_BUNDLE_PARTS = ["out", "zcode-timeline", "timeline.install.iife.js"];
var RENDERER_INSTALL_BUNDLE_PARTS = ["out", "renderer", "zcode-timeline", "timeline.install.iife.js"];
var RENDERER_BLOCK = `${MARKER_BEGIN_RENDERER}
<script src="./zcode-timeline/timeline.install.iife.js" data-zcode-timeline="1"></script>
${MARKER_END_RENDERER}`;
var DEFAULT_MAX_BACKUPS = 1;
var PREPEND_BLOCK = `${MARKER_BEGIN}
import { app as __zcodeTimelineApp } from 'electron';
if (!process.env.ZCODE_TIMELINE_DISABLE) {
  try {
    __zcodeTimelineApp.commandLine.appendSwitch('remote-debugging-port', process.env.ZCODE_TIMELINE_PORT || '9229');
    __zcodeTimelineApp.commandLine.appendSwitch('remote-allow-origins', '*');
  } catch (_) { /* ignore */ }
}
${MARKER_END}
`;
function computeFileSha256(p) {
  const data = (0, import_node_fs2.readFileSync)(p);
  const h = (0, import_node_crypto2.createHash)("sha256");
  h.update(data);
  return h.digest("hex");
}
function loadState(stateFile) {
  if (!(0, import_node_fs2.existsSync)(stateFile)) return { originalHash: null, patchedHash: null, backups: [] };
  try {
    const j2 = JSON.parse((0, import_node_fs2.readFileSync)(stateFile, "utf8"));
    return {
      originalHash: j2.originalHash || null,
      patchedHash: j2.patchedHash || null,
      backups: Array.isArray(j2.backups) ? j2.backups : []
    };
  } catch {
    return { originalHash: null, patchedHash: null, backups: [] };
  }
}
function saveState(stateFile, state) {
  (0, import_node_fs2.writeFileSync)(stateFile, JSON.stringify(state, null, 2), "utf8");
}
function patchMainContent(content) {
  if (content.includes(MARKER_BEGIN) && content.includes(MARKER_END)) {
    return { content, changed: false };
  }
  return { content: PREPEND_BLOCK + content, changed: true };
}
function patchRendererContent(content) {
  if (content.includes(MARKER_BEGIN_RENDERER) && content.includes(MARKER_END_RENDERER)) {
    return { content, changed: false };
  }
  const headEnd = content.lastIndexOf("</head>");
  if (headEnd < 0) throw new Error("renderer index.html has no </head> tag");
  return {
    content: `${content.slice(0, headEnd)}${RENDERER_BLOCK}
  ${content.slice(headEnd)}`,
    changed: true
  };
}
function backupAsar(asarPath, hash, existingBackups) {
  const stamp = hash.slice(0, 12);
  const backupPath = `${asarPath}.original-${stamp}`;
  if (!(0, import_node_fs2.existsSync)(backupPath)) {
    (0, import_node_fs2.copyFileSync)(asarPath, backupPath);
  }
  const next = existingBackups.includes(backupPath) ? existingBackups : [...existingBackups, backupPath];
  return { path: backupPath, backups: next };
}
function pruneOldBackups(backups, keep, log3) {
  if (keep < 0) keep = 0;
  const sorted = [...backups].sort((a, b) => {
    const ea = (0, import_node_fs2.existsSync)(a);
    const eb = (0, import_node_fs2.existsSync)(b);
    if (ea && !eb) return -1;
    if (!ea && eb) return 1;
    if (!ea && !eb) return 0;
    return (0, import_node_fs2.statSync)(a).mtimeMs - (0, import_node_fs2.statSync)(b).mtimeMs;
  }).reverse();
  const toKeep = sorted.slice(0, Math.max(1, keep));
  const toDelete = sorted.slice(Math.max(1, keep));
  for (const p of toDelete) {
    if (!(0, import_node_fs2.existsSync)(p)) continue;
    try {
      (0, import_node_fs2.unlinkSync)(p);
      if (log3) log3(`[asar] pruned old backup: ${p}`);
    } catch (e) {
      if (log3) log3(`[asar] could not prune ${p}: ${e.message}`);
    }
  }
  return { kept: toKeep, pruned: toDelete.length, list: toKeep };
}
function extractAsarFile(asarPath, parts) {
  const candidates = [.../* @__PURE__ */ new Set([
    (0, import_node_path7.join)(...parts),
    parts.join("/"),
    parts.join("\\")
  ])];
  for (const candidate of candidates) {
    try {
      return extractFile(asarPath, candidate);
    } catch {
    }
  }
  return null;
}
function asarHasExpectedInstallBundle(asarPath, expectedBundle) {
  const rootBundle = extractAsarFile(asarPath, INSTALL_BUNDLE_PARTS);
  const rendererBundle = extractAsarFile(asarPath, RENDERER_INSTALL_BUNDLE_PARTS);
  return Boolean(
    rootBundle && rendererBundle && rootBundle.equals(expectedBundle) && rendererBundle.equals(expectedBundle)
  );
}
function getAsarMarkers(asarPath) {
  const main2 = extractAsarFile(asarPath, ["out", "main", "index.js"]);
  const renderer = extractAsarFile(asarPath, ["out", "renderer", "index.html"]);
  return {
    main: Boolean(main2 && main2.includes(MARKER_BEGIN) && main2.includes(MARKER_END)),
    renderer: Boolean(
      renderer && renderer.includes(MARKER_BEGIN_RENDERER) && renderer.includes(MARKER_END_RENDERER)
    )
  };
}
function extractEntry(asarPath, parts) {
  return extractAsarFile(asarPath, parts);
}
async function ensurePatched({ zcodeExePath, stateFile, stagingDir, maxBackups, installMode = false, installBundlePath, onLog } = {}) {
  const zcodeDir = (0, import_node_path7.dirname)(zcodeExePath);
  const asarPath = (0, import_node_path7.join)(zcodeDir, "resources", "app.asar");
  const statePath = stateFile || (0, import_node_path7.join)(PROJECT_ROOT, ".state.json");
  const stagingRoot = stagingDir || (0, import_node_path7.join)(PROJECT_ROOT, ".asar-staging");
  const bundlePath = installBundlePath || INSTALL_BUNDLE;
  if (!(0, import_node_fs2.existsSync)(asarPath)) {
    return { status: "failed", reason: `app.asar not found at ${asarPath}`, asarPath };
  }
  let expectedInstallBundle = null;
  if (installMode) {
    if (!(0, import_node_fs2.existsSync)(bundlePath)) {
      return {
        status: "failed",
        reason: `install bundle not found at ${bundlePath}; run "npm run build" first`,
        asarPath
      };
    }
    expectedInstallBundle = (0, import_node_fs2.readFileSync)(bundlePath);
    if (expectedInstallBundle.length < 1024) {
      return {
        status: "failed",
        reason: `install bundle is suspiciously small (${expectedInstallBundle.length} bytes)`,
        asarPath
      };
    }
  }
  const currentHash = computeFileSha256(asarPath);
  const state = loadState(statePath);
  const markers = getAsarMarkers(asarPath);
  const installBundleCurrent = !installMode || asarHasExpectedInstallBundle(asarPath, expectedInstallBundle);
  const requiredPatchPresent = markers.main && (!installMode || markers.renderer && installBundleCurrent);
  if (state.patchedHash === currentHash) {
    if (requiredPatchPresent) {
      return {
        status: "skipped",
        reason: installMode ? "asar already patched in install mode at this version" : "asar already patched at this version",
        asarPath,
        currentHash,
        stateFile: statePath
      };
    }
  } else if (requiredPatchPresent) {
    saveState(statePath, {
      originalHash: state.originalHash || currentHash,
      patchedHash: currentHash,
      backups: state.backups
    });
    return {
      status: "skipped",
      reason: "required markers and bundle present despite hash mismatch; state refreshed",
      asarPath,
      currentHash,
      stateFile: statePath
    };
  }
  let backupPath;
  let backups = state.backups;
  if (!state.originalHash) {
    const r = backupAsar(asarPath, currentHash, backups);
    backupPath = r.path;
    backups = r.backups;
  } else if (state.originalHash !== currentHash && state.patchedHash !== currentHash) {
    const r = backupAsar(asarPath, currentHash, backups);
    backupPath = r.path;
    backups = r.backups;
  }
  if ((0, import_node_fs2.existsSync)(stagingRoot)) (0, import_node_fs2.rmSync)(stagingRoot, { recursive: true, force: true });
  (0, import_node_fs2.mkdirSync)(stagingRoot, { recursive: true });
  try {
    extractAll(asarPath, stagingRoot);
  } catch (e) {
    (0, import_node_fs2.rmSync)(stagingRoot, { recursive: true, force: true });
    return { status: "failed", reason: `extractAll failed: ${e.message}`, asarPath, stateFile: statePath };
  }
  let mainAbs = (0, import_node_path7.join)(stagingRoot, "out\\main\\index.js");
  if (!(0, import_node_fs2.existsSync)(mainAbs)) mainAbs = (0, import_node_path7.join)(stagingRoot, "out/main/index.js");
  if (!(0, import_node_fs2.existsSync)(mainAbs)) {
    (0, import_node_fs2.rmSync)(stagingRoot, { recursive: true, force: true });
    return { status: "failed", reason: `main entry not found in staging`, asarPath, stateFile: statePath };
  }
  const mainPatch = patchMainContent((0, import_node_fs2.readFileSync)(mainAbs, "utf8"));
  if (mainPatch.changed) (0, import_node_fs2.writeFileSync)(mainAbs, mainPatch.content, "utf8");
  if (installMode) {
    let rendererAbs = (0, import_node_path7.join)(stagingRoot, "out\\renderer\\index.html");
    if (!(0, import_node_fs2.existsSync)(rendererAbs)) rendererAbs = (0, import_node_path7.join)(stagingRoot, "out/renderer/index.html");
    if (!(0, import_node_fs2.existsSync)(rendererAbs)) {
      (0, import_node_fs2.rmSync)(stagingRoot, { recursive: true, force: true });
      return { status: "failed", reason: "renderer index.html not found in staging", asarPath, stateFile: statePath };
    }
    try {
      const rendererPatch = patchRendererContent((0, import_node_fs2.readFileSync)(rendererAbs, "utf8"));
      if (rendererPatch.changed) (0, import_node_fs2.writeFileSync)(rendererAbs, rendererPatch.content, "utf8");
    } catch (e) {
      (0, import_node_fs2.rmSync)(stagingRoot, { recursive: true, force: true });
      return { status: "failed", reason: `renderer patch failed: ${e.message}`, asarPath, stateFile: statePath };
    }
    const rootBundleDir = (0, import_node_path7.join)(stagingRoot, ...INSTALL_BUNDLE_PARTS.slice(0, -1));
    const rendererBundleDir = (0, import_node_path7.join)(stagingRoot, ...RENDERER_INSTALL_BUNDLE_PARTS.slice(0, -1));
    (0, import_node_fs2.mkdirSync)(rootBundleDir, { recursive: true });
    (0, import_node_fs2.mkdirSync)(rendererBundleDir, { recursive: true });
    (0, import_node_fs2.copyFileSync)(bundlePath, (0, import_node_path7.join)(rootBundleDir, INSTALL_BUNDLE_PARTS.at(-1)));
    (0, import_node_fs2.copyFileSync)(bundlePath, (0, import_node_path7.join)(rendererBundleDir, RENDERER_INSTALL_BUNDLE_PARTS.at(-1)));
  }
  const tmpAsar = `${asarPath}.new`;
  if ((0, import_node_fs2.existsSync)(tmpAsar)) (0, import_node_fs2.rmSync)(tmpAsar, { force: true });
  try {
    await createPackage(stagingRoot, tmpAsar);
  } catch (e) {
    if ((0, import_node_fs2.existsSync)(tmpAsar)) (0, import_node_fs2.rmSync)(tmpAsar, { force: true });
    (0, import_node_fs2.rmSync)(stagingRoot, { recursive: true, force: true });
    return { status: "failed", reason: `createPackage failed: ${e.message}`, asarPath, stateFile: statePath };
  }
  try {
    const sz = (0, import_node_fs2.statSync)(tmpAsar).size;
    if (sz < 1024 * 1024) {
      (0, import_node_fs2.rmSync)(tmpAsar, { force: true });
      (0, import_node_fs2.rmSync)(stagingRoot, { recursive: true, force: true });
      return { status: "failed", reason: `pack produced a suspiciously small asar (${sz} bytes)`, asarPath, stateFile: statePath };
    }
    const list = listPackage(tmpAsar);
    if (!list || list.length < 100) {
      (0, import_node_fs2.rmSync)(tmpAsar, { force: true });
      (0, import_node_fs2.rmSync)(stagingRoot, { recursive: true, force: true });
      return { status: "failed", reason: `packed asar has only ${list?.length ?? 0} entries`, asarPath, stateFile: statePath };
    }
    const packedMarkers = getAsarMarkers(tmpAsar);
    if (!packedMarkers.main || installMode && !packedMarkers.renderer) {
      (0, import_node_fs2.rmSync)(tmpAsar, { force: true });
      (0, import_node_fs2.rmSync)(stagingRoot, { recursive: true, force: true });
      return {
        status: "failed",
        reason: `packed asar is missing required marker(s): ${JSON.stringify(packedMarkers)}`,
        asarPath,
        stateFile: statePath
      };
    }
    if (installMode && !asarHasExpectedInstallBundle(tmpAsar, expectedInstallBundle)) {
      (0, import_node_fs2.rmSync)(tmpAsar, { force: true });
      (0, import_node_fs2.rmSync)(stagingRoot, { recursive: true, force: true });
      return { status: "failed", reason: "packed asar is missing the install bundle", asarPath, stateFile: statePath };
    }
  } catch (e) {
    if ((0, import_node_fs2.existsSync)(tmpAsar)) (0, import_node_fs2.rmSync)(tmpAsar, { force: true });
    (0, import_node_fs2.rmSync)(stagingRoot, { recursive: true, force: true });
    return { status: "failed", reason: `verification of new asar failed: ${e.message}`, asarPath, stateFile: statePath };
  }
  try {
    (0, import_node_fs2.renameSync)(tmpAsar, asarPath);
  } catch (e) {
    (0, import_node_fs2.rmSync)(stagingRoot, { recursive: true, force: true });
    const isLocked = e?.code === "EPERM" || e?.code === "EACCES" || e?.code === "EBUSY";
    return {
      status: "failed",
      locked: isLocked,
      stagedAsar: (0, import_node_fs2.existsSync)(tmpAsar) ? tmpAsar : void 0,
      reason: isLocked ? `Could not replace app.asar: ${e.message}. The new archive remains staged at ${tmpAsar}.` : `rename failed: ${e.message}`,
      asarPath,
      stateFile: statePath
    };
  }
  (0, import_node_fs2.rmSync)(stagingRoot, { recursive: true, force: true });
  const newHash = computeFileSha256(asarPath);
  const keep = Number(
    maxBackups ?? process.env.ZCODE_TIMELINE_MAX_BACKUPS ?? DEFAULT_MAX_BACKUPS
  );
  const pruneResult = pruneOldBackups(backups, keep, onLog);
  backups = pruneResult.list;
  saveState(statePath, {
    originalHash: state.originalHash || currentHash,
    patchedHash: newHash,
    backups
  });
  return {
    status: "patched",
    asarPath,
    currentHash: newHash,
    previousHash: currentHash,
    backupPath,
    backupsKept: pruneResult.kept.length,
    backupsPruned: pruneResult.pruned,
    stateFile: statePath
  };
}
async function restoreOriginal({ zcodeExePath, stateFile } = {}) {
  const zcodeDir = (0, import_node_path7.dirname)(zcodeExePath);
  const asarPath = (0, import_node_path7.join)(zcodeDir, "resources", "app.asar");
  const statePath = stateFile || (0, import_node_path7.join)(PROJECT_ROOT, ".state.json");
  const state = loadState(statePath);
  if (!state.backups.length) return { ok: false, reason: "no backups recorded" };
  const backupPath = state.backups[state.backups.length - 1];
  if (!(0, import_node_fs2.existsSync)(backupPath)) return { ok: false, reason: `backup not found at ${backupPath}` };
  const tmpAsar = `${asarPath}.new`;
  (0, import_node_fs2.copyFileSync)(backupPath, tmpAsar);
  (0, import_node_fs2.renameSync)(tmpAsar, asarPath);
  saveState(statePath, { originalHash: null, patchedHash: null, backups: [] });
  return { ok: true, asarPath, restoredFrom: backupPath };
}

// launcher/install.mjs
var import_meta3 = { url: require("node:url").pathToFileURL(__filename).href };
var LOCK_POLL_MS = 2e3;
var LOCK_WAIT_MS = 5 * 60 * 1e3;
var INSTALL_BUNDLE_PARTS2 = ["out", "zcode-timeline", "timeline.install.iife.js"];
var RENDERER_INSTALL_BUNDLE_PARTS2 = ["out", "renderer", "zcode-timeline", "timeline.install.iife.js"];
function log(...args) {
  const ts2 = (/* @__PURE__ */ new Date()).toISOString().slice(11, 23);
  console.log(`[${ts2}]`, ...args);
}
function err(...args) {
  const ts2 = (/* @__PURE__ */ new Date()).toISOString().slice(11, 23);
  console.error(`[${ts2}]`, ...args);
}
function isLockError(e) {
  return e?.code === "EPERM" || e?.code === "EACCES" || e?.code === "EBUSY";
}
function isZCodeRunning() {
  try {
    if (process.platform === "win32") {
      const output = (0, import_node_child_process2.execFileSync)(
        "powershell",
        [
          "-NoProfile",
          "-Command",
          "@(Get-Process -Name 'ZCode' -ErrorAction SilentlyContinue).Count"
        ],
        { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], windowsHide: true, timeout: 5e3 }
      ).trim();
      return Number(output) > 0;
    }
    (0, import_node_child_process2.execFileSync)("pgrep", ["-x", "ZCode"], {
      stdio: "ignore",
      timeout: 5e3
    });
    return true;
  } catch {
    return false;
  }
}
async function waitForZCodeExit() {
  log("waiting for ZCode to close...");
  const deadline = Date.now() + LOCK_WAIT_MS;
  while (Date.now() < deadline) {
    if (!isZCodeRunning()) return true;
    await (0, import_promises4.setTimeout)(Math.min(LOCK_POLL_MS, deadline - Date.now()));
  }
  return !isZCodeRunning();
}
function findInstall() {
  const info = findZCodeExe();
  const appAsar = (0, import_node_path8.join)((0, import_node_path8.dirname)(info.exePath), "resources", "app.asar");
  return { ...info, appAsar };
}
async function install(opts = {}) {
  const onLog = opts.onLog || log;
  const found = opts.zcodeExePath ? { exePath: opts.zcodeExePath, source: opts.source || "override" } : findInstall();
  onLog(`ZCode found at: ${found.exePath} (source=${found.source})`);
  let result = await ensurePatched({
    zcodeExePath: found.exePath,
    installMode: true,
    installBundlePath: opts.installBundlePath,
    stateFile: opts.stateFile,
    stagingDir: opts.stagingDir,
    onLog
  });
  if (result.status === "failed" && result.locked) {
    const exited = await waitForZCodeExit();
    if (!exited) {
      throw new Error(
        `Timed out after 5 minutes waiting for ZCode to close. The original app.asar was not changed. The new archive remains staged at ${result.stagedAsar || `${found.appAsar}.new`}. Fully quit ZCode, then run "npm run install" again.`
      );
    }
    result = await ensurePatched({
      zcodeExePath: found.exePath,
      installMode: true,
      installBundlePath: opts.installBundlePath,
      stateFile: opts.stateFile,
      stagingDir: opts.stagingDir,
      onLog
    });
  }
  if (result.status === "failed") {
    if (result.locked) {
      throw new Error(
        `${result.reason} Fully quit ZCode and run "npm run install" again; the original app.asar is still intact.`
      );
    }
    throw new Error(result.reason || "ASAR install failed");
  }
  onLog(`[asar] status=${result.status}${result.reason ? ` reason=${result.reason}` : ""}`);
  if (result.backupPath) onLog(`[asar] backup of original: ${result.backupPath}`);
  onLog("Timeline installed. Start ZCode normally; no launcher daemon is required.");
}
async function uninstall() {
  const found = findInstall();
  log(`ZCode found at: ${found.exePath} (source=${found.source})`);
  try {
    const { existsSync: existsSync5 } = await import("node:fs");
    const { resolve: resolve2 } = await import("node:path");
    let stateFile;
    let dir = process.cwd();
    for (let i = 0; i < 6 && dir; i++) {
      const candidate = resolve2(dir, ".state.json");
      if (existsSync5(candidate)) {
        stateFile = candidate;
        break;
      }
      const parent = resolve2(dir, "..");
      if (parent === dir) break;
      dir = parent;
    }
    const result = await restoreOriginal({ zcodeExePath: found.exePath, stateFile });
    if (!result.ok) throw new Error(result.reason || "no original archive could be restored");
    log(`Restored original app.asar from: ${result.restoredFrom}`);
  } catch (e) {
    if (isLockError(e)) {
      throw new Error(
        `Could not restore app.asar while ZCode holds it open. Fully quit ZCode and run "npm run uninstall" again. The current app.asar was not partially written.`
      );
    }
    throw e;
  }
}
function status() {
  const found = findInstall();
  const markers = (0, import_node_fs3.existsSync)(found.appAsar) ? getAsarMarkers(found.appAsar) : { main: false, renderer: false };
  const rootBundle = (0, import_node_fs3.existsSync)(found.appAsar) ? extractEntry(found.appAsar, INSTALL_BUNDLE_PARTS2) : null;
  const rendererBundle = (0, import_node_fs3.existsSync)(found.appAsar) ? extractEntry(found.appAsar, RENDERER_INSTALL_BUNDLE_PARTS2) : null;
  const embeddedBundle = {
    exists: Boolean(rootBundle),
    size: rootBundle?.length ?? 0,
    rendererExists: Boolean(rendererBundle),
    rendererSize: rendererBundle?.length ?? 0
  };
  let patchStatus = "unpatched";
  if (markers.main && markers.renderer && embeddedBundle.exists && embeddedBundle.rendererExists) {
    patchStatus = "installed";
  } else if (markers.main && !markers.renderer) {
    patchStatus = "dev-only";
  } else if (markers.main || markers.renderer || embeddedBundle.exists || embeddedBundle.rendererExists) {
    patchStatus = "incomplete";
  }
  console.log(JSON.stringify({
    zcodeExe: found.exePath,
    appAsar: found.appAsar,
    patchStatus,
    embeddedBundle,
    markers
  }, null, 2));
}
async function runCli() {
  const command = process.argv[2] || "status";
  if (command === "install" && process.env.npm_lifecycle_event === "install" && process.env.npm_command === "install") {
    log('Dependencies installed. Run "npm run build", then "npm run install" to patch ZCode.');
    return;
  }
  if (command === "install") return install();
  if (command === "uninstall") return uninstall();
  if (command === "status") return status();
  throw new Error(`Unknown command "${command}". Use install, uninstall, or status.`);
}
var isDirectInvocation = require("node:url").pathToFileURL(__filename).href === `file://${process.argv[1]}`;
if (isDirectInvocation) {
  runCli().catch((e) => {
    err(e.message || e);
    process.exit(1);
  });
}

// installer/installer.mjs
var import_meta4 = { url: require("node:url").pathToFileURL(__filename).href };
var DEFAULT_INSTALL_DIR = process.env.ZCODE_TIMELINE_DIR || (0, import_node_path9.join)((0, import_node_os3.homedir)(), ".zcode-timeline");
var LOG_FILE = process.env.ZCODE_TIMELINE_LOG || (0, import_node_path9.join)((0, import_node_os3.homedir)(), ".zcode-timeline-install.log");
function tee(line) {
  try {
    (0, import_node_fs4.appendFileSync)(LOG_FILE, line + "\n", "utf8");
  } catch {
  }
}
function log2(...args) {
  const ts2 = (/* @__PURE__ */ new Date()).toISOString().slice(11, 23);
  const line = `[${ts2}] ${args.map((a) => typeof a === "string" ? a : JSON.stringify(a)).join(" ")}`;
  tee(line);
  console.log(line);
}
function err2(...args) {
  const ts2 = (/* @__PURE__ */ new Date()).toISOString().slice(11, 23);
  const line = `[${ts2}] ${args.map((a) => typeof a === "string" ? a : JSON.stringify(a)).join(" ")}`;
  tee(line);
  console.error(line);
}
process.on("uncaughtException", (e) => {
  err2("Uncaught exception:", e && e.message ? e.message : String(e));
  if (e && e.stack) err2(e.stack);
});
process.on("unhandledRejection", (e) => {
  err2("Unhandled rejection:", e && e.message ? e.message : String(e));
  if (e && e.stack) err2(e.stack);
});
function hasCommand(cmd) {
  try {
    const probe = process.platform === "win32" ? `where ${cmd}` : `command -v ${cmd}`;
    (0, import_node_child_process3.execSync)(probe, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}
function getVersion(cmd) {
  try {
    const out = (0, import_node_child_process3.execSync)(cmd, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    }).trim();
    const parts = out.split(/\s+/);
    return parts[parts.length - 1] || out;
  } catch {
    return null;
  }
}
function delay2(ms2) {
  return new Promise((resolve2) => setTimeout(resolve2, ms2));
}
async function isZCodeRunning2() {
  try {
    if (process.platform === "win32") {
      const out2 = (0, import_node_child_process3.execSync)(
        `powershell -NoProfile -Command "(Get-Process -Name 'ZCode' -ErrorAction SilentlyContinue | Measure-Object).Count"`,
        { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }
      ).trim();
      return Number(out2) > 0;
    }
    const out = (0, import_node_child_process3.execSync)("pgrep -x ZCode", {
      stdio: ["ignore", "pipe", "ignore"]
    }).toString();
    return out.trim().length > 0;
  } catch {
    return false;
  }
}
function killZCode() {
  try {
    if (process.platform === "win32") {
      (0, import_node_child_process3.execSync)("taskkill /F /IM ZCode.exe", { stdio: "pipe", shell: true });
    } else {
      (0, import_node_child_process3.execSync)("pkill -9 -x ZCode", { stdio: "pipe", shell: true });
    }
  } catch {
  }
}
async function main() {
  const argv = process.argv.slice(2);
  const noRestart = argv.includes("--no-restart");
  const skipBuild = argv.includes("--skip-build");
  log2("=== ZCode Timeline Installer ===");
  log2("Checking prerequisites...");
  const checks = [
    { name: "Node.js", cmd: "node", url: "https://nodejs.org/" },
    { name: "npm", cmd: "npm", url: "https://nodejs.org/" },
    { name: "git", cmd: "git", url: "https://git-scm.com/" }
  ];
  for (const c of checks) {
    if (!hasCommand(c.cmd)) {
      err2(`${c.name} is required but was not found on PATH.`);
      err2(`Install from: ${c.url}`);
      process.exit(1);
    }
    log2(`  ${c.name}: ${getVersion(`${c.cmd} --version`) || "OK"}`);
  }
  log2("Detecting ZCode installation...");
  let zcodeInfo;
  try {
    zcodeInfo = findZCodeExe();
  } catch (e) {
    err2(e.message);
    err2(
      "If ZCode is installed in an unusual location, set ZCODE_EXE to the\n  full path before running this installer, e.g.:\n    set ZCODE_EXE=C:\\Path\\To\\ZCode.exe"
    );
    process.exit(1);
  }
  log2(`  Found: ${zcodeInfo.exePath} (source=${zcodeInfo.source})`);
  if (await isZCodeRunning2()) {
    log2("");
    log2("  \u26A0  ZCode is currently running.");
    log2("  The installer needs to close ZCode to safely patch app.asar.");
    log2("  Any unsaved ZCode sessions will be lost on close.");
    log2("");
    for (let i = 5; i > 0; i--) {
      log2(`  Closing ZCode in ${i}s \u2014 press Ctrl+C to cancel...`);
      await delay2(1e3);
    }
    log2("  Closing ZCode now.");
    killZCode();
    await delay2(2e3);
    log2("  ZCode closed.");
    log2("");
  }
  log2(`Preparing install directory: ${DEFAULT_INSTALL_DIR}`);
  const bundlePath = (0, import_node_path9.join)(DEFAULT_INSTALL_DIR, "dist", "timeline.install.iife.js");
  try {
    (0, import_node_fs4.mkdirSync)((0, import_node_path9.dirname)(bundlePath), { recursive: true });
    (0, import_node_fs4.writeFileSync)(bundlePath, `;(function () {
  if (window.top !== window) return;
  try {
"use strict";(()=>{var Mr=Object.create;var no=Object.defineProperty;var Or=Object.getOwnPropertyDescriptor;var Dr=Object.getOwnPropertyNames;var Ur=Object.getPrototypeOf,Hr=Object.prototype.hasOwnProperty;var Il=(l,t)=>()=>(t||l((t={exports:{}}).exports,t),t.exports);var Rr=(l,t,e,a)=>{if(t&&typeof t=="object"||typeof t=="function")for(let u of Dr(t))!Hr.call(l,u)&&u!==e&&no(l,u,{get:()=>t[u],enumerable:!(a=Or(t,u))||a.enumerable});return l};var Pl=(l,t,e)=>(e=l!=null?Mr(Ur(l)):{},Rr(t||!l||!l.__esModule?no(e,"default",{value:l,enumerable:!0}):e,l));var bo=Il(A=>{"use strict";var oi=Symbol.for("react.transitional.element"),Nr=Symbol.for("react.portal"),xr=Symbol.for("react.fragment"),Br=Symbol.for("react.strict_mode"),qr=Symbol.for("react.profiler"),Yr=Symbol.for("react.consumer"),Gr=Symbol.for("react.context"),Xr=Symbol.for("react.forward_ref"),Lr=Symbol.for("react.suspense"),Qr=Symbol.for("react.memo"),mo=Symbol.for("react.lazy"),Zr=Symbol.for("react.activity"),co=Symbol.iterator;function jr(l){return l===null||typeof l!="object"?null:(l=co&&l[co]||l["@@iterator"],typeof l=="function"?l:null)}var ro={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},ho=Object.assign,vo={};function Oe(l,t,e){this.props=l,this.context=t,this.refs=vo,this.updater=e||ro}Oe.prototype.isReactComponent={};Oe.prototype.setState=function(l,t){if(typeof l!="object"&&typeof l!="function"&&l!=null)throw Error("takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,l,t,"setState")};Oe.prototype.forceUpdate=function(l){this.updater.enqueueForceUpdate(this,l,"forceUpdate")};function yo(){}yo.prototype=Oe.prototype;function si(l,t,e){this.props=l,this.context=t,this.refs=vo,this.updater=e||ro}var di=si.prototype=new yo;di.constructor=si;ho(di,Oe.prototype);di.isPureReactComponent=!0;var fo=Array.isArray;function fi(){}var j={H:null,A:null,T:null,S:null},go=Object.prototype.hasOwnProperty;function mi(l,t,e){var a=e.ref;return{$$typeof:oi,type:l,key:t,ref:a!==void 0?a:null,props:e}}function Vr(l,t){return mi(l.type,t,l.props)}function ri(l){return typeof l=="object"&&l!==null&&l.$$typeof===oi}function Kr(l){var t={"=":"=0",":":"=2"};return"$"+l.replace(/[=:]/g,function(e){return t[e]})}var oo=/\\/+/g;function ci(l,t){return typeof l=="object"&&l!==null&&l.key!=null?Kr(""+l.key):t.toString(36)}function Jr(l){switch(l.status){case"fulfilled":return l.value;case"rejected":throw l.reason;default:switch(typeof l.status=="string"?l.then(fi,fi):(l.status="pending",l.then(function(t){l.status==="pending"&&(l.status="fulfilled",l.value=t)},function(t){l.status==="pending"&&(l.status="rejected",l.reason=t)})),l.status){case"fulfilled":return l.value;case"rejected":throw l.reason}}throw l}function Me(l,t,e,a,u){var n=typeof l;(n==="undefined"||n==="boolean")&&(l=null);var i=!1;if(l===null)i=!0;else switch(n){case"bigint":case"string":case"number":i=!0;break;case"object":switch(l.$$typeof){case oi:case Nr:i=!0;break;case mo:return i=l._init,Me(i(l._payload),t,e,a,u)}}if(i)return u=u(l),i=a===""?"."+ci(l,0):a,fo(u)?(e="",i!=null&&(e=i.replace(oo,"$&/")+"/"),Me(u,t,e,"",function(s){return s})):u!=null&&(ri(u)&&(u=Vr(u,e+(u.key==null||l&&l.key===u.key?"":(""+u.key).replace(oo,"$&/")+"/")+i)),t.push(u)),1;i=0;var c=a===""?".":a+":";if(fo(l))for(var f=0;f<l.length;f++)a=l[f],n=c+ci(a,f),i+=Me(a,t,e,n,u);else if(f=jr(l),typeof f=="function")for(l=f.call(l),f=0;!(a=l.next()).done;)a=a.value,n=c+ci(a,f++),i+=Me(a,t,e,n,u);else if(n==="object"){if(typeof l.then=="function")return Me(Jr(l),t,e,a,u);throw t=String(l),Error("Objects are not valid as a React child (found: "+(t==="[object Object]"?"object with keys {"+Object.keys(l).join(", ")+"}":t)+"). If you meant to render a collection of children, use an array instead.")}return i}function Mu(l,t,e){if(l==null)return l;var a=[],u=0;return Me(l,a,"","",function(n){return t.call(e,n,u++)}),a}function wr(l){if(l._status===-1){var t=l._result;t=t(),t.then(function(e){(l._status===0||l._status===-1)&&(l._status=1,l._result=e)},function(e){(l._status===0||l._status===-1)&&(l._status=2,l._result=e)}),l._status===-1&&(l._status=0,l._result=t)}if(l._status===1)return l._result.default;throw l._result}var so=typeof reportError=="function"?reportError:function(l){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var t=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof l=="object"&&l!==null&&typeof l.message=="string"?String(l.message):String(l),error:l});if(!window.dispatchEvent(t))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",l);return}console.error(l)},Wr={map:Mu,forEach:function(l,t,e){Mu(l,function(){t.apply(this,arguments)},e)},count:function(l){var t=0;return Mu(l,function(){t++}),t},toArray:function(l){return Mu(l,function(t){return t})||[]},only:function(l){if(!ri(l))throw Error("React.Children.only expected to receive a single React element child.");return l}};A.Activity=Zr;A.Children=Wr;A.Component=Oe;A.Fragment=xr;A.Profiler=qr;A.PureComponent=si;A.StrictMode=Br;A.Suspense=Lr;A.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=j;A.__COMPILER_RUNTIME={__proto__:null,c:function(l){return j.H.useMemoCache(l)}};A.cache=function(l){return function(){return l.apply(null,arguments)}};A.cacheSignal=function(){return null};A.cloneElement=function(l,t,e){if(l==null)throw Error("The argument must be a React element, but you passed "+l+".");var a=ho({},l.props),u=l.key;if(t!=null)for(n in t.key!==void 0&&(u=""+t.key),t)!go.call(t,n)||n==="key"||n==="__self"||n==="__source"||n==="ref"&&t.ref===void 0||(a[n]=t[n]);var n=arguments.length-2;if(n===1)a.children=e;else if(1<n){for(var i=Array(n),c=0;c<n;c++)i[c]=arguments[c+2];a.children=i}return mi(l.type,u,a)};A.createContext=function(l){return l={$$typeof:Gr,_currentValue:l,_currentValue2:l,_threadCount:0,Provider:null,Consumer:null},l.Provider=l,l.Consumer={$$typeof:Yr,_context:l},l};A.createElement=function(l,t,e){var a,u={},n=null;if(t!=null)for(a in t.key!==void 0&&(n=""+t.key),t)go.call(t,a)&&a!=="key"&&a!=="__self"&&a!=="__source"&&(u[a]=t[a]);var i=arguments.length-2;if(i===1)u.children=e;else if(1<i){for(var c=Array(i),f=0;f<i;f++)c[f]=arguments[f+2];u.children=c}if(l&&l.defaultProps)for(a in i=l.defaultProps,i)u[a]===void 0&&(u[a]=i[a]);return mi(l,n,u)};A.createRef=function(){return{current:null}};A.forwardRef=function(l){return{$$typeof:Xr,render:l}};A.isValidElement=ri;A.lazy=function(l){return{$$typeof:mo,_payload:{_status:-1,_result:l},_init:wr}};A.memo=function(l,t){return{$$typeof:Qr,type:l,compare:t===void 0?null:t}};A.startTransition=function(l){var t=j.T,e={};j.T=e;try{var a=l(),u=j.S;u!==null&&u(e,a),typeof a=="object"&&a!==null&&typeof a.then=="function"&&a.then(fi,so)}catch(n){so(n)}finally{t!==null&&e.types!==null&&(t.types=e.types),j.T=t}};A.unstable_useCacheRefresh=function(){return j.H.useCacheRefresh()};A.use=function(l){return j.H.use(l)};A.useActionState=function(l,t,e){return j.H.useActionState(l,t,e)};A.useCallback=function(l,t){return j.H.useCallback(l,t)};A.useContext=function(l){return j.H.useContext(l)};A.useDebugValue=function(){};A.useDeferredValue=function(l,t){return j.H.useDeferredValue(l,t)};A.useEffect=function(l,t){return j.H.useEffect(l,t)};A.useEffectEvent=function(l){return j.H.useEffectEvent(l)};A.useId=function(){return j.H.useId()};A.useImperativeHandle=function(l,t,e){return j.H.useImperativeHandle(l,t,e)};A.useInsertionEffect=function(l,t){return j.H.useInsertionEffect(l,t)};A.useLayoutEffect=function(l,t){return j.H.useLayoutEffect(l,t)};A.useMemo=function(l,t){return j.H.useMemo(l,t)};A.useOptimistic=function(l,t){return j.H.useOptimistic(l,t)};A.useReducer=function(l,t,e){return j.H.useReducer(l,t,e)};A.useRef=function(l){return j.H.useRef(l)};A.useState=function(l){return j.H.useState(l)};A.useSyncExternalStore=function(l,t,e){return j.H.useSyncExternalStore(l,t,e)};A.useTransition=function(){return j.H.useTransition()};A.version="19.2.7"});var Sa=Il((cy,So)=>{"use strict";So.exports=bo()});var Uo=Il(w=>{"use strict";function gi(l,t){var e=l.length;l.push(t);l:for(;0<e;){var a=e-1>>>1,u=l[a];if(0<Ou(u,t))l[a]=t,l[e]=u,e=a;else break l}}function lt(l){return l.length===0?null:l[0]}function Uu(l){if(l.length===0)return null;var t=l[0],e=l.pop();if(e!==t){l[0]=e;l:for(var a=0,u=l.length,n=u>>>1;a<n;){var i=2*(a+1)-1,c=l[i],f=i+1,s=l[f];if(0>Ou(c,e))f<u&&0>Ou(s,c)?(l[a]=s,l[f]=e,a=f):(l[a]=c,l[i]=e,a=i);else if(f<u&&0>Ou(s,e))l[a]=s,l[f]=e,a=f;else break l}}return t}function Ou(l,t){var e=l.sortIndex-t.sortIndex;return e!==0?e:l.id-t.id}w.unstable_now=void 0;typeof performance=="object"&&typeof performance.now=="function"?(To=performance,w.unstable_now=function(){return To.now()}):(hi=Date,Eo=hi.now(),w.unstable_now=function(){return hi.now()-Eo});var To,hi,Eo,ft=[],Ht=[],$r=1,Yl=null,hl=3,bi=!1,Ta=!1,Ea=!1,Si=!1,Ao=typeof setTimeout=="function"?setTimeout:null,_o=typeof clearTimeout=="function"?clearTimeout:null,po=typeof setImmediate<"u"?setImmediate:null;function Du(l){for(var t=lt(Ht);t!==null;){if(t.callback===null)Uu(Ht);else if(t.startTime<=l)Uu(Ht),t.sortIndex=t.expirationTime,gi(ft,t);else break;t=lt(Ht)}}function Ti(l){if(Ea=!1,Du(l),!Ta)if(lt(ft)!==null)Ta=!0,Ue||(Ue=!0,De());else{var t=lt(Ht);t!==null&&Ei(Ti,t.startTime-l)}}var Ue=!1,pa=-1,Mo=5,Oo=-1;function Do(){return Si?!0:!(w.unstable_now()-Oo<Mo)}function vi(){if(Si=!1,Ue){var l=w.unstable_now();Oo=l;var t=!0;try{l:{Ta=!1,Ea&&(Ea=!1,_o(pa),pa=-1),bi=!0;var e=hl;try{t:{for(Du(l),Yl=lt(ft);Yl!==null&&!(Yl.expirationTime>l&&Do());){var a=Yl.callback;if(typeof a=="function"){Yl.callback=null,hl=Yl.priorityLevel;var u=a(Yl.expirationTime<=l);if(l=w.unstable_now(),typeof u=="function"){Yl.callback=u,Du(l),t=!0;break t}Yl===lt(ft)&&Uu(ft),Du(l)}else Uu(ft);Yl=lt(ft)}if(Yl!==null)t=!0;else{var n=lt(Ht);n!==null&&Ei(Ti,n.startTime-l),t=!1}}break l}finally{Yl=null,hl=e,bi=!1}t=void 0}}finally{t?De():Ue=!1}}}var De;typeof po=="function"?De=function(){po(vi)}:typeof MessageChannel<"u"?(yi=new MessageChannel,zo=yi.port2,yi.port1.onmessage=vi,De=function(){zo.postMessage(null)}):De=function(){Ao(vi,0)};var yi,zo;function Ei(l,t){pa=Ao(function(){l(w.unstable_now())},t)}w.unstable_IdlePriority=5;w.unstable_ImmediatePriority=1;w.unstable_LowPriority=4;w.unstable_NormalPriority=3;w.unstable_Profiling=null;w.unstable_UserBlockingPriority=2;w.unstable_cancelCallback=function(l){l.callback=null};w.unstable_forceFrameRate=function(l){0>l||125<l?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):Mo=0<l?Math.floor(1e3/l):5};w.unstable_getCurrentPriorityLevel=function(){return hl};w.unstable_next=function(l){switch(hl){case 1:case 2:case 3:var t=3;break;default:t=hl}var e=hl;hl=t;try{return l()}finally{hl=e}};w.unstable_requestPaint=function(){Si=!0};w.unstable_runWithPriority=function(l,t){switch(l){case 1:case 2:case 3:case 4:case 5:break;default:l=3}var e=hl;hl=l;try{return t()}finally{hl=e}};w.unstable_scheduleCallback=function(l,t,e){var a=w.unstable_now();switch(typeof e=="object"&&e!==null?(e=e.delay,e=typeof e=="number"&&0<e?a+e:a):e=a,l){case 1:var u=-1;break;case 2:u=250;break;case 5:u=1073741823;break;case 4:u=1e4;break;default:u=5e3}return u=e+u,l={id:$r++,callback:t,priorityLevel:l,startTime:e,expirationTime:u,sortIndex:-1},e>a?(l.sortIndex=e,gi(Ht,l),lt(ft)===null&&l===lt(Ht)&&(Ea?(_o(pa),pa=-1):Ea=!0,Ei(Ti,e-a))):(l.sortIndex=u,gi(ft,l),Ta||bi||(Ta=!0,Ue||(Ue=!0,De()))),l};w.unstable_shouldYield=Do;w.unstable_wrapCallback=function(l){var t=hl;return function(){var e=hl;hl=t;try{return l.apply(this,arguments)}finally{hl=e}}}});var Ro=Il((oy,Ho)=>{"use strict";Ho.exports=Uo()});var No=Il(gl=>{"use strict";var kr=Sa();function Co(l){var t="https://react.dev/errors/"+l;if(1<arguments.length){t+="?args[]="+encodeURIComponent(arguments[1]);for(var e=2;e<arguments.length;e++)t+="&args[]="+encodeURIComponent(arguments[e])}return"Minified React error #"+l+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function Rt(){}var yl={d:{f:Rt,r:function(){throw Error(Co(522))},D:Rt,C:Rt,L:Rt,m:Rt,X:Rt,S:Rt,M:Rt},p:0,findDOMNode:null},Fr=Symbol.for("react.portal");function Ir(l,t,e){var a=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:Fr,key:a==null?null:""+a,children:l,containerInfo:t,implementation:e}}var za=kr.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;function Hu(l,t){if(l==="font")return"";if(typeof t=="string")return t==="use-credentials"?t:""}gl.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=yl;gl.createPortal=function(l,t){var e=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11)throw Error(Co(299));return Ir(l,t,null,e)};gl.flushSync=function(l){var t=za.T,e=yl.p;try{if(za.T=null,yl.p=2,l)return l()}finally{za.T=t,yl.p=e,yl.d.f()}};gl.preconnect=function(l,t){typeof l=="string"&&(t?(t=t.crossOrigin,t=typeof t=="string"?t==="use-credentials"?t:"":void 0):t=null,yl.d.C(l,t))};gl.prefetchDNS=function(l){typeof l=="string"&&yl.d.D(l)};gl.preinit=function(l,t){if(typeof l=="string"&&t&&typeof t.as=="string"){var e=t.as,a=Hu(e,t.crossOrigin),u=typeof t.integrity=="string"?t.integrity:void 0,n=typeof t.fetchPriority=="string"?t.fetchPriority:void 0;e==="style"?yl.d.S(l,typeof t.precedence=="string"?t.precedence:void 0,{crossOrigin:a,integrity:u,fetchPriority:n}):e==="script"&&yl.d.X(l,{crossOrigin:a,integrity:u,fetchPriority:n,nonce:typeof t.nonce=="string"?t.nonce:void 0})}};gl.preinitModule=function(l,t){if(typeof l=="string")if(typeof t=="object"&&t!==null){if(t.as==null||t.as==="script"){var e=Hu(t.as,t.crossOrigin);yl.d.M(l,{crossOrigin:e,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0})}}else t==null&&yl.d.M(l)};gl.preload=function(l,t){if(typeof l=="string"&&typeof t=="object"&&t!==null&&typeof t.as=="string"){var e=t.as,a=Hu(e,t.crossOrigin);yl.d.L(l,e,{crossOrigin:a,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0,type:typeof t.type=="string"?t.type:void 0,fetchPriority:typeof t.fetchPriority=="string"?t.fetchPriority:void 0,referrerPolicy:typeof t.referrerPolicy=="string"?t.referrerPolicy:void 0,imageSrcSet:typeof t.imageSrcSet=="string"?t.imageSrcSet:void 0,imageSizes:typeof t.imageSizes=="string"?t.imageSizes:void 0,media:typeof t.media=="string"?t.media:void 0})}};gl.preloadModule=function(l,t){if(typeof l=="string")if(t){var e=Hu(t.as,t.crossOrigin);yl.d.m(l,{as:typeof t.as=="string"&&t.as!=="script"?t.as:void 0,crossOrigin:e,integrity:typeof t.integrity=="string"?t.integrity:void 0})}else yl.d.m(l)};gl.requestFormReset=function(l){yl.d.r(l)};gl.unstable_batchedUpdates=function(l,t){return l(t)};gl.useFormState=function(l,t,e){return za.H.useFormState(l,t,e)};gl.useFormStatus=function(){return za.H.useHostTransitionStatus()};gl.version="19.2.7"});var pi=Il((dy,Bo)=>{"use strict";function xo(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(xo)}catch(l){console.error(l)}}xo(),Bo.exports=No()});var wm=Il(ei=>{"use strict";var ul=Ro(),c0=Sa(),Pr=pi();function b(l){var t="https://react.dev/errors/"+l;if(1<arguments.length){t+="?args[]="+encodeURIComponent(arguments[1]);for(var e=2;e<arguments.length;e++)t+="&args[]="+encodeURIComponent(arguments[e])}return"Minified React error #"+l+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function f0(l){return!(!l||l.nodeType!==1&&l.nodeType!==9&&l.nodeType!==11)}function ou(l){var t=l,e=l;if(l.alternate)for(;t.return;)t=t.return;else{l=t;do t=l,t.flags&4098&&(e=t.return),l=t.return;while(l)}return t.tag===3?e:null}function o0(l){if(l.tag===13){var t=l.memoizedState;if(t===null&&(l=l.alternate,l!==null&&(t=l.memoizedState)),t!==null)return t.dehydrated}return null}function s0(l){if(l.tag===31){var t=l.memoizedState;if(t===null&&(l=l.alternate,l!==null&&(t=l.memoizedState)),t!==null)return t.dehydrated}return null}function qo(l){if(ou(l)!==l)throw Error(b(188))}function lh(l){var t=l.alternate;if(!t){if(t=ou(l),t===null)throw Error(b(188));return t!==l?null:l}for(var e=l,a=t;;){var u=e.return;if(u===null)break;var n=u.alternate;if(n===null){if(a=u.return,a!==null){e=a;continue}break}if(u.child===n.child){for(n=u.child;n;){if(n===e)return qo(u),l;if(n===a)return qo(u),t;n=n.sibling}throw Error(b(188))}if(e.return!==a.return)e=u,a=n;else{for(var i=!1,c=u.child;c;){if(c===e){i=!0,e=u,a=n;break}if(c===a){i=!0,a=u,e=n;break}c=c.sibling}if(!i){for(c=n.child;c;){if(c===e){i=!0,e=n,a=u;break}if(c===a){i=!0,a=n,e=u;break}c=c.sibling}if(!i)throw Error(b(189))}}if(e.alternate!==a)throw Error(b(190))}if(e.tag!==3)throw Error(b(188));return e.stateNode.current===e?l:t}function d0(l){var t=l.tag;if(t===5||t===26||t===27||t===6)return l;for(l=l.child;l!==null;){if(t=d0(l),t!==null)return t;l=l.sibling}return null}var J=Object.assign,th=Symbol.for("react.element"),Ru=Symbol.for("react.transitional.element"),Ra=Symbol.for("react.portal"),Be=Symbol.for("react.fragment"),m0=Symbol.for("react.strict_mode"),ec=Symbol.for("react.profiler"),r0=Symbol.for("react.consumer"),yt=Symbol.for("react.context"),Fc=Symbol.for("react.forward_ref"),ac=Symbol.for("react.suspense"),uc=Symbol.for("react.suspense_list"),Ic=Symbol.for("react.memo"),Ct=Symbol.for("react.lazy");Symbol.for("react.scope");var nc=Symbol.for("react.activity");Symbol.for("react.legacy_hidden");Symbol.for("react.tracing_marker");var eh=Symbol.for("react.memo_cache_sentinel");Symbol.for("react.view_transition");var Yo=Symbol.iterator;function Aa(l){return l===null||typeof l!="object"?null:(l=Yo&&l[Yo]||l["@@iterator"],typeof l=="function"?l:null)}var ah=Symbol.for("react.client.reference");function ic(l){if(l==null)return null;if(typeof l=="function")return l.$$typeof===ah?null:l.displayName||l.name||null;if(typeof l=="string")return l;switch(l){case Be:return"Fragment";case ec:return"Profiler";case m0:return"StrictMode";case ac:return"Suspense";case uc:return"SuspenseList";case nc:return"Activity"}if(typeof l=="object")switch(l.$$typeof){case Ra:return"Portal";case yt:return l.displayName||"Context";case r0:return(l._context.displayName||"Context")+".Consumer";case Fc:var t=l.render;return l=l.displayName,l||(l=t.displayName||t.name||"",l=l!==""?"ForwardRef("+l+")":"ForwardRef"),l;case Ic:return t=l.displayName||null,t!==null?t:ic(l.type)||"Memo";case Ct:t=l._payload,l=l._init;try{return ic(l(t))}catch{}}return null}var Ca=Array.isArray,z=c0.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,q=Pr.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,oe={pending:!1,data:null,method:null,action:null},cc=[],qe=-1;function nt(l){return{current:l}}function cl(l){0>qe||(l.current=cc[qe],cc[qe]=null,qe--)}function Z(l,t){qe++,cc[qe]=l.current,l.current=t}var ut=nt(null),$a=nt(null),jt=nt(null),dn=nt(null);function mn(l,t){switch(Z(jt,t),Z($a,l),Z(ut,null),t.nodeType){case 9:case 11:l=(l=t.documentElement)&&(l=l.namespaceURI)?Vs(l):0;break;default:if(l=t.tagName,t=t.namespaceURI)t=Vs(t),l=Nm(t,l);else switch(l){case"svg":l=1;break;case"math":l=2;break;default:l=0}}cl(ut),Z(ut,l)}function la(){cl(ut),cl($a),cl(jt)}function fc(l){l.memoizedState!==null&&Z(dn,l);var t=ut.current,e=Nm(t,l.type);t!==e&&(Z($a,l),Z(ut,e))}function rn(l){$a.current===l&&(cl(ut),cl($a)),dn.current===l&&(cl(dn),iu._currentValue=oe)}var zi,Go;function ne(l){if(zi===void 0)try{throw Error()}catch(e){var t=e.stack.trim().match(/\\n( *(at )?)/);zi=t&&t[1]||"",Go=-1<e.stack.indexOf(\`
    at\`)?" (<anonymous>)":-1<e.stack.indexOf("@")?"@unknown:0:0":""}return\`
\`+zi+l+Go}var Ai=!1;function _i(l,t){if(!l||Ai)return"";Ai=!0;var e=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{var a={DetermineComponentFrameRoot:function(){try{if(t){var y=function(){throw Error()};if(Object.defineProperty(y.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(y,[])}catch(h){var m=h}Reflect.construct(l,[],y)}else{try{y.call()}catch(h){m=h}l.call(y.prototype)}}else{try{throw Error()}catch(h){m=h}(y=l())&&typeof y.catch=="function"&&y.catch(function(){})}}catch(h){if(h&&m&&typeof h.stack=="string")return[h.stack,m.stack]}return[null,null]}};a.DetermineComponentFrameRoot.displayName="DetermineComponentFrameRoot";var u=Object.getOwnPropertyDescriptor(a.DetermineComponentFrameRoot,"name");u&&u.configurable&&Object.defineProperty(a.DetermineComponentFrameRoot,"name",{value:"DetermineComponentFrameRoot"});var n=a.DetermineComponentFrameRoot(),i=n[0],c=n[1];if(i&&c){var f=i.split(\`
\`),s=c.split(\`
\`);for(u=a=0;a<f.length&&!f[a].includes("DetermineComponentFrameRoot");)a++;for(;u<s.length&&!s[u].includes("DetermineComponentFrameRoot");)u++;if(a===f.length||u===s.length)for(a=f.length-1,u=s.length-1;1<=a&&0<=u&&f[a]!==s[u];)u--;for(;1<=a&&0<=u;a--,u--)if(f[a]!==s[u]){if(a!==1||u!==1)do if(a--,u--,0>u||f[a]!==s[u]){var v=\`
\`+f[a].replace(" at new "," at ");return l.displayName&&v.includes("<anonymous>")&&(v=v.replace("<anonymous>",l.displayName)),v}while(1<=a&&0<=u);break}}}finally{Ai=!1,Error.prepareStackTrace=e}return(e=l?l.displayName||l.name:"")?ne(e):""}function uh(l,t){switch(l.tag){case 26:case 27:case 5:return ne(l.type);case 16:return ne("Lazy");case 13:return l.child!==t&&t!==null?ne("Suspense Fallback"):ne("Suspense");case 19:return ne("SuspenseList");case 0:case 15:return _i(l.type,!1);case 11:return _i(l.type.render,!1);case 1:return _i(l.type,!0);case 31:return ne("Activity");default:return""}}function Xo(l){try{var t="",e=null;do t+=uh(l,e),e=l,l=l.return;while(l);return t}catch(a){return\`
Error generating stack: \`+a.message+\`
\`+a.stack}}var oc=Object.prototype.hasOwnProperty,Pc=ul.unstable_scheduleCallback,Mi=ul.unstable_cancelCallback,nh=ul.unstable_shouldYield,ih=ul.unstable_requestPaint,Rl=ul.unstable_now,ch=ul.unstable_getCurrentPriorityLevel,h0=ul.unstable_ImmediatePriority,v0=ul.unstable_UserBlockingPriority,hn=ul.unstable_NormalPriority,fh=ul.unstable_LowPriority,y0=ul.unstable_IdlePriority,oh=ul.log,sh=ul.unstable_setDisableYieldValue,su=null,Cl=null;function Gt(l){if(typeof oh=="function"&&sh(l),Cl&&typeof Cl.setStrictMode=="function")try{Cl.setStrictMode(su,l)}catch{}}var Nl=Math.clz32?Math.clz32:rh,dh=Math.log,mh=Math.LN2;function rh(l){return l>>>=0,l===0?32:31-(dh(l)/mh|0)|0}var Cu=256,Nu=262144,xu=4194304;function ie(l){var t=l&42;if(t!==0)return t;switch(l&-l){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:return 64;case 128:return 128;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:return l&261888;case 262144:case 524288:case 1048576:case 2097152:return l&3932160;case 4194304:case 8388608:case 16777216:case 33554432:return l&62914560;case 67108864:return 67108864;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 0;default:return l}}function Ln(l,t,e){var a=l.pendingLanes;if(a===0)return 0;var u=0,n=l.suspendedLanes,i=l.pingedLanes;l=l.warmLanes;var c=a&134217727;return c!==0?(a=c&~n,a!==0?u=ie(a):(i&=c,i!==0?u=ie(i):e||(e=c&~l,e!==0&&(u=ie(e))))):(c=a&~n,c!==0?u=ie(c):i!==0?u=ie(i):e||(e=a&~l,e!==0&&(u=ie(e)))),u===0?0:t!==0&&t!==u&&!(t&n)&&(n=u&-u,e=t&-t,n>=e||n===32&&(e&4194048)!==0)?t:u}function du(l,t){return(l.pendingLanes&~(l.suspendedLanes&~l.pingedLanes)&t)===0}function hh(l,t){switch(l){case 1:case 2:case 4:case 8:case 64:return t+250;case 16:case 32:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return t+5e3;case 4194304:case 8388608:case 16777216:case 33554432:return-1;case 67108864:case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function g0(){var l=xu;return xu<<=1,!(xu&62914560)&&(xu=4194304),l}function Oi(l){for(var t=[],e=0;31>e;e++)t.push(l);return t}function mu(l,t){l.pendingLanes|=t,t!==268435456&&(l.suspendedLanes=0,l.pingedLanes=0,l.warmLanes=0)}function vh(l,t,e,a,u,n){var i=l.pendingLanes;l.pendingLanes=e,l.suspendedLanes=0,l.pingedLanes=0,l.warmLanes=0,l.expiredLanes&=e,l.entangledLanes&=e,l.errorRecoveryDisabledLanes&=e,l.shellSuspendCounter=0;var c=l.entanglements,f=l.expirationTimes,s=l.hiddenUpdates;for(e=i&~e;0<e;){var v=31-Nl(e),y=1<<v;c[v]=0,f[v]=-1;var m=s[v];if(m!==null)for(s[v]=null,v=0;v<m.length;v++){var h=m[v];h!==null&&(h.lane&=-536870913)}e&=~y}a!==0&&b0(l,a,0),n!==0&&u===0&&l.tag!==0&&(l.suspendedLanes|=n&~(i&~t))}function b0(l,t,e){l.pendingLanes|=t,l.suspendedLanes&=~t;var a=31-Nl(t);l.entangledLanes|=t,l.entanglements[a]=l.entanglements[a]|1073741824|e&261930}function S0(l,t){var e=l.entangledLanes|=t;for(l=l.entanglements;e;){var a=31-Nl(e),u=1<<a;u&t|l[a]&t&&(l[a]|=t),e&=~u}}function T0(l,t){var e=t&-t;return e=e&42?1:lf(e),e&(l.suspendedLanes|t)?0:e}function lf(l){switch(l){case 2:l=1;break;case 8:l=4;break;case 32:l=16;break;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:l=128;break;case 268435456:l=134217728;break;default:l=0}return l}function tf(l){return l&=-l,2<l?8<l?l&134217727?32:268435456:8:2}function E0(){var l=q.p;return l!==0?l:(l=window.event,l===void 0?32:Vm(l.type))}function Lo(l,t){var e=q.p;try{return q.p=l,t()}finally{q.p=e}}var ee=Math.random().toString(36).slice(2),ol="__reactFiber$"+ee,Al="__reactProps$"+ee,da="__reactContainer$"+ee,sc="__reactEvents$"+ee,yh="__reactListeners$"+ee,gh="__reactHandles$"+ee,Qo="__reactResources$"+ee,ru="__reactMarker$"+ee;function ef(l){delete l[ol],delete l[Al],delete l[sc],delete l[yh],delete l[gh]}function Ye(l){var t=l[ol];if(t)return t;for(var e=l.parentNode;e;){if(t=e[da]||e[ol]){if(e=t.alternate,t.child!==null||e!==null&&e.child!==null)for(l=$s(l);l!==null;){if(e=l[ol])return e;l=$s(l)}return t}l=e,e=l.parentNode}return null}function ma(l){if(l=l[ol]||l[da]){var t=l.tag;if(t===5||t===6||t===13||t===31||t===26||t===27||t===3)return l}return null}function Na(l){var t=l.tag;if(t===5||t===26||t===27||t===6)return l.stateNode;throw Error(b(33))}function we(l){var t=l[Qo];return t||(t=l[Qo]={hoistableStyles:new Map,hoistableScripts:new Map}),t}function il(l){l[ru]=!0}var p0=new Set,z0={};function Se(l,t){ta(l,t),ta(l+"Capture",t)}function ta(l,t){for(z0[l]=t,l=0;l<t.length;l++)p0.add(t[l])}var bh=RegExp("^[:A-Z_a-z\\\\u00C0-\\\\u00D6\\\\u00D8-\\\\u00F6\\\\u00F8-\\\\u02FF\\\\u0370-\\\\u037D\\\\u037F-\\\\u1FFF\\\\u200C-\\\\u200D\\\\u2070-\\\\u218F\\\\u2C00-\\\\u2FEF\\\\u3001-\\\\uD7FF\\\\uF900-\\\\uFDCF\\\\uFDF0-\\\\uFFFD][:A-Z_a-z\\\\u00C0-\\\\u00D6\\\\u00D8-\\\\u00F6\\\\u00F8-\\\\u02FF\\\\u0370-\\\\u037D\\\\u037F-\\\\u1FFF\\\\u200C-\\\\u200D\\\\u2070-\\\\u218F\\\\u2C00-\\\\u2FEF\\\\u3001-\\\\uD7FF\\\\uF900-\\\\uFDCF\\\\uFDF0-\\\\uFFFD\\\\-.0-9\\\\u00B7\\\\u0300-\\\\u036F\\\\u203F-\\\\u2040]*$"),Zo={},jo={};function Sh(l){return oc.call(jo,l)?!0:oc.call(Zo,l)?!1:bh.test(l)?jo[l]=!0:(Zo[l]=!0,!1)}function $u(l,t,e){if(Sh(t))if(e===null)l.removeAttribute(t);else{switch(typeof e){case"undefined":case"function":case"symbol":l.removeAttribute(t);return;case"boolean":var a=t.toLowerCase().slice(0,5);if(a!=="data-"&&a!=="aria-"){l.removeAttribute(t);return}}l.setAttribute(t,""+e)}}function Bu(l,t,e){if(e===null)l.removeAttribute(t);else{switch(typeof e){case"undefined":case"function":case"symbol":case"boolean":l.removeAttribute(t);return}l.setAttribute(t,""+e)}}function ot(l,t,e,a){if(a===null)l.removeAttribute(e);else{switch(typeof a){case"undefined":case"function":case"symbol":case"boolean":l.removeAttribute(e);return}l.setAttributeNS(t,e,""+a)}}function Xl(l){switch(typeof l){case"bigint":case"boolean":case"number":case"string":case"undefined":return l;case"object":return l;default:return""}}function A0(l){var t=l.type;return(l=l.nodeName)&&l.toLowerCase()==="input"&&(t==="checkbox"||t==="radio")}function Th(l,t,e){var a=Object.getOwnPropertyDescriptor(l.constructor.prototype,t);if(!l.hasOwnProperty(t)&&typeof a<"u"&&typeof a.get=="function"&&typeof a.set=="function"){var u=a.get,n=a.set;return Object.defineProperty(l,t,{configurable:!0,get:function(){return u.call(this)},set:function(i){e=""+i,n.call(this,i)}}),Object.defineProperty(l,t,{enumerable:a.enumerable}),{getValue:function(){return e},setValue:function(i){e=""+i},stopTracking:function(){l._valueTracker=null,delete l[t]}}}}function dc(l){if(!l._valueTracker){var t=A0(l)?"checked":"value";l._valueTracker=Th(l,t,""+l[t])}}function _0(l){if(!l)return!1;var t=l._valueTracker;if(!t)return!0;var e=t.getValue(),a="";return l&&(a=A0(l)?l.checked?"true":"false":l.value),l=a,l!==e?(t.setValue(l),!0):!1}function vn(l){if(l=l||(typeof document<"u"?document:void 0),typeof l>"u")return null;try{return l.activeElement||l.body}catch{return l.body}}var Eh=/[\\n"\\\\]/g;function Zl(l){return l.replace(Eh,function(t){return"\\\\"+t.charCodeAt(0).toString(16)+" "})}function mc(l,t,e,a,u,n,i,c){l.name="",i!=null&&typeof i!="function"&&typeof i!="symbol"&&typeof i!="boolean"?l.type=i:l.removeAttribute("type"),t!=null?i==="number"?(t===0&&l.value===""||l.value!=t)&&(l.value=""+Xl(t)):l.value!==""+Xl(t)&&(l.value=""+Xl(t)):i!=="submit"&&i!=="reset"||l.removeAttribute("value"),t!=null?rc(l,i,Xl(t)):e!=null?rc(l,i,Xl(e)):a!=null&&l.removeAttribute("value"),u==null&&n!=null&&(l.defaultChecked=!!n),u!=null&&(l.checked=u&&typeof u!="function"&&typeof u!="symbol"),c!=null&&typeof c!="function"&&typeof c!="symbol"&&typeof c!="boolean"?l.name=""+Xl(c):l.removeAttribute("name")}function M0(l,t,e,a,u,n,i,c){if(n!=null&&typeof n!="function"&&typeof n!="symbol"&&typeof n!="boolean"&&(l.type=n),t!=null||e!=null){if(!(n!=="submit"&&n!=="reset"||t!=null)){dc(l);return}e=e!=null?""+Xl(e):"",t=t!=null?""+Xl(t):e,c||t===l.value||(l.value=t),l.defaultValue=t}a=a??u,a=typeof a!="function"&&typeof a!="symbol"&&!!a,l.checked=c?l.checked:!!a,l.defaultChecked=!!a,i!=null&&typeof i!="function"&&typeof i!="symbol"&&typeof i!="boolean"&&(l.name=i),dc(l)}function rc(l,t,e){t==="number"&&vn(l.ownerDocument)===l||l.defaultValue===""+e||(l.defaultValue=""+e)}function We(l,t,e,a){if(l=l.options,t){t={};for(var u=0;u<e.length;u++)t["$"+e[u]]=!0;for(e=0;e<l.length;e++)u=t.hasOwnProperty("$"+l[e].value),l[e].selected!==u&&(l[e].selected=u),u&&a&&(l[e].defaultSelected=!0)}else{for(e=""+Xl(e),t=null,u=0;u<l.length;u++){if(l[u].value===e){l[u].selected=!0,a&&(l[u].defaultSelected=!0);return}t!==null||l[u].disabled||(t=l[u])}t!==null&&(t.selected=!0)}}function O0(l,t,e){if(t!=null&&(t=""+Xl(t),t!==l.value&&(l.value=t),e==null)){l.defaultValue!==t&&(l.defaultValue=t);return}l.defaultValue=e!=null?""+Xl(e):""}function D0(l,t,e,a){if(t==null){if(a!=null){if(e!=null)throw Error(b(92));if(Ca(a)){if(1<a.length)throw Error(b(93));a=a[0]}e=a}e==null&&(e=""),t=e}e=Xl(t),l.defaultValue=e,a=l.textContent,a===e&&a!==""&&a!==null&&(l.value=a),dc(l)}function ea(l,t){if(t){var e=l.firstChild;if(e&&e===l.lastChild&&e.nodeType===3){e.nodeValue=t;return}}l.textContent=t}var ph=new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));function Vo(l,t,e){var a=t.indexOf("--")===0;e==null||typeof e=="boolean"||e===""?a?l.setProperty(t,""):t==="float"?l.cssFloat="":l[t]="":a?l.setProperty(t,e):typeof e!="number"||e===0||ph.has(t)?t==="float"?l.cssFloat=e:l[t]=(""+e).trim():l[t]=e+"px"}function U0(l,t,e){if(t!=null&&typeof t!="object")throw Error(b(62));if(l=l.style,e!=null){for(var a in e)!e.hasOwnProperty(a)||t!=null&&t.hasOwnProperty(a)||(a.indexOf("--")===0?l.setProperty(a,""):a==="float"?l.cssFloat="":l[a]="");for(var u in t)a=t[u],t.hasOwnProperty(u)&&e[u]!==a&&Vo(l,u,a)}else for(var n in t)t.hasOwnProperty(n)&&Vo(l,n,t[n])}function af(l){if(l.indexOf("-")===-1)return!1;switch(l){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var zh=new Map([["acceptCharset","accept-charset"],["htmlFor","for"],["httpEquiv","http-equiv"],["crossOrigin","crossorigin"],["accentHeight","accent-height"],["alignmentBaseline","alignment-baseline"],["arabicForm","arabic-form"],["baselineShift","baseline-shift"],["capHeight","cap-height"],["clipPath","clip-path"],["clipRule","clip-rule"],["colorInterpolation","color-interpolation"],["colorInterpolationFilters","color-interpolation-filters"],["colorProfile","color-profile"],["colorRendering","color-rendering"],["dominantBaseline","dominant-baseline"],["enableBackground","enable-background"],["fillOpacity","fill-opacity"],["fillRule","fill-rule"],["floodColor","flood-color"],["floodOpacity","flood-opacity"],["fontFamily","font-family"],["fontSize","font-size"],["fontSizeAdjust","font-size-adjust"],["fontStretch","font-stretch"],["fontStyle","font-style"],["fontVariant","font-variant"],["fontWeight","font-weight"],["glyphName","glyph-name"],["glyphOrientationHorizontal","glyph-orientation-horizontal"],["glyphOrientationVertical","glyph-orientation-vertical"],["horizAdvX","horiz-adv-x"],["horizOriginX","horiz-origin-x"],["imageRendering","image-rendering"],["letterSpacing","letter-spacing"],["lightingColor","lighting-color"],["markerEnd","marker-end"],["markerMid","marker-mid"],["markerStart","marker-start"],["overlinePosition","overline-position"],["overlineThickness","overline-thickness"],["paintOrder","paint-order"],["panose-1","panose-1"],["pointerEvents","pointer-events"],["renderingIntent","rendering-intent"],["shapeRendering","shape-rendering"],["stopColor","stop-color"],["stopOpacity","stop-opacity"],["strikethroughPosition","strikethrough-position"],["strikethroughThickness","strikethrough-thickness"],["strokeDasharray","stroke-dasharray"],["strokeDashoffset","stroke-dashoffset"],["strokeLinecap","stroke-linecap"],["strokeLinejoin","stroke-linejoin"],["strokeMiterlimit","stroke-miterlimit"],["strokeOpacity","stroke-opacity"],["strokeWidth","stroke-width"],["textAnchor","text-anchor"],["textDecoration","text-decoration"],["textRendering","text-rendering"],["transformOrigin","transform-origin"],["underlinePosition","underline-position"],["underlineThickness","underline-thickness"],["unicodeBidi","unicode-bidi"],["unicodeRange","unicode-range"],["unitsPerEm","units-per-em"],["vAlphabetic","v-alphabetic"],["vHanging","v-hanging"],["vIdeographic","v-ideographic"],["vMathematical","v-mathematical"],["vectorEffect","vector-effect"],["vertAdvY","vert-adv-y"],["vertOriginX","vert-origin-x"],["vertOriginY","vert-origin-y"],["wordSpacing","word-spacing"],["writingMode","writing-mode"],["xmlnsXlink","xmlns:xlink"],["xHeight","x-height"]]),Ah=/^[\\u0000-\\u001F ]*j[\\r\\n\\t]*a[\\r\\n\\t]*v[\\r\\n\\t]*a[\\r\\n\\t]*s[\\r\\n\\t]*c[\\r\\n\\t]*r[\\r\\n\\t]*i[\\r\\n\\t]*p[\\r\\n\\t]*t[\\r\\n\\t]*:/i;function ku(l){return Ah.test(""+l)?"javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')":l}function gt(){}var hc=null;function uf(l){return l=l.target||l.srcElement||window,l.correspondingUseElement&&(l=l.correspondingUseElement),l.nodeType===3?l.parentNode:l}var Ge=null,$e=null;function Ko(l){var t=ma(l);if(t&&(l=t.stateNode)){var e=l[Al]||null;l:switch(l=t.stateNode,t.type){case"input":if(mc(l,e.value,e.defaultValue,e.defaultValue,e.checked,e.defaultChecked,e.type,e.name),t=e.name,e.type==="radio"&&t!=null){for(e=l;e.parentNode;)e=e.parentNode;for(e=e.querySelectorAll('input[name="'+Zl(""+t)+'"][type="radio"]'),t=0;t<e.length;t++){var a=e[t];if(a!==l&&a.form===l.form){var u=a[Al]||null;if(!u)throw Error(b(90));mc(a,u.value,u.defaultValue,u.defaultValue,u.checked,u.defaultChecked,u.type,u.name)}}for(t=0;t<e.length;t++)a=e[t],a.form===l.form&&_0(a)}break l;case"textarea":O0(l,e.value,e.defaultValue);break l;case"select":t=e.value,t!=null&&We(l,!!e.multiple,t,!1)}}}var Di=!1;function H0(l,t,e){if(Di)return l(t,e);Di=!0;try{var a=l(t);return a}finally{if(Di=!1,(Ge!==null||$e!==null)&&(In(),Ge&&(t=Ge,l=$e,$e=Ge=null,Ko(t),l)))for(t=0;t<l.length;t++)Ko(l[t])}}function ka(l,t){var e=l.stateNode;if(e===null)return null;var a=e[Al]||null;if(a===null)return null;e=a[t];l:switch(t){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(a=!a.disabled)||(l=l.type,a=!(l==="button"||l==="input"||l==="select"||l==="textarea")),l=!a;break l;default:l=!1}if(l)return null;if(e&&typeof e!="function")throw Error(b(231,t,typeof e));return e}var pt=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),vc=!1;if(pt)try{He={},Object.defineProperty(He,"passive",{get:function(){vc=!0}}),window.addEventListener("test",He,He),window.removeEventListener("test",He,He)}catch{vc=!1}var He,Xt=null,nf=null,Fu=null;function R0(){if(Fu)return Fu;var l,t=nf,e=t.length,a,u="value"in Xt?Xt.value:Xt.textContent,n=u.length;for(l=0;l<e&&t[l]===u[l];l++);var i=e-l;for(a=1;a<=i&&t[e-a]===u[n-a];a++);return Fu=u.slice(l,1<a?1-a:void 0)}function Iu(l){var t=l.keyCode;return"charCode"in l?(l=l.charCode,l===0&&t===13&&(l=13)):l=t,l===10&&(l=13),32<=l||l===13?l:0}function qu(){return!0}function Jo(){return!1}function _l(l){function t(e,a,u,n,i){this._reactName=e,this._targetInst=u,this.type=a,this.nativeEvent=n,this.target=i,this.currentTarget=null;for(var c in l)l.hasOwnProperty(c)&&(e=l[c],this[c]=e?e(n):n[c]);return this.isDefaultPrevented=(n.defaultPrevented!=null?n.defaultPrevented:n.returnValue===!1)?qu:Jo,this.isPropagationStopped=Jo,this}return J(t.prototype,{preventDefault:function(){this.defaultPrevented=!0;var e=this.nativeEvent;e&&(e.preventDefault?e.preventDefault():typeof e.returnValue!="unknown"&&(e.returnValue=!1),this.isDefaultPrevented=qu)},stopPropagation:function(){var e=this.nativeEvent;e&&(e.stopPropagation?e.stopPropagation():typeof e.cancelBubble!="unknown"&&(e.cancelBubble=!0),this.isPropagationStopped=qu)},persist:function(){},isPersistent:qu}),t}var Te={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(l){return l.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},Qn=_l(Te),hu=J({},Te,{view:0,detail:0}),_h=_l(hu),Ui,Hi,_a,Zn=J({},hu,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:cf,button:0,buttons:0,relatedTarget:function(l){return l.relatedTarget===void 0?l.fromElement===l.srcElement?l.toElement:l.fromElement:l.relatedTarget},movementX:function(l){return"movementX"in l?l.movementX:(l!==_a&&(_a&&l.type==="mousemove"?(Ui=l.screenX-_a.screenX,Hi=l.screenY-_a.screenY):Hi=Ui=0,_a=l),Ui)},movementY:function(l){return"movementY"in l?l.movementY:Hi}}),wo=_l(Zn),Mh=J({},Zn,{dataTransfer:0}),Oh=_l(Mh),Dh=J({},hu,{relatedTarget:0}),Ri=_l(Dh),Uh=J({},Te,{animationName:0,elapsedTime:0,pseudoElement:0}),Hh=_l(Uh),Rh=J({},Te,{clipboardData:function(l){return"clipboardData"in l?l.clipboardData:window.clipboardData}}),Ch=_l(Rh),Nh=J({},Te,{data:0}),Wo=_l(Nh),xh={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},Bh={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},qh={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function Yh(l){var t=this.nativeEvent;return t.getModifierState?t.getModifierState(l):(l=qh[l])?!!t[l]:!1}function cf(){return Yh}var Gh=J({},hu,{key:function(l){if(l.key){var t=xh[l.key]||l.key;if(t!=="Unidentified")return t}return l.type==="keypress"?(l=Iu(l),l===13?"Enter":String.fromCharCode(l)):l.type==="keydown"||l.type==="keyup"?Bh[l.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:cf,charCode:function(l){return l.type==="keypress"?Iu(l):0},keyCode:function(l){return l.type==="keydown"||l.type==="keyup"?l.keyCode:0},which:function(l){return l.type==="keypress"?Iu(l):l.type==="keydown"||l.type==="keyup"?l.keyCode:0}}),Xh=_l(Gh),Lh=J({},Zn,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),$o=_l(Lh),Qh=J({},hu,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:cf}),Zh=_l(Qh),jh=J({},Te,{propertyName:0,elapsedTime:0,pseudoElement:0}),Vh=_l(jh),Kh=J({},Zn,{deltaX:function(l){return"deltaX"in l?l.deltaX:"wheelDeltaX"in l?-l.wheelDeltaX:0},deltaY:function(l){return"deltaY"in l?l.deltaY:"wheelDeltaY"in l?-l.wheelDeltaY:"wheelDelta"in l?-l.wheelDelta:0},deltaZ:0,deltaMode:0}),Jh=_l(Kh),wh=J({},Te,{newState:0,oldState:0}),Wh=_l(wh),$h=[9,13,27,32],ff=pt&&"CompositionEvent"in window,qa=null;pt&&"documentMode"in document&&(qa=document.documentMode);var kh=pt&&"TextEvent"in window&&!qa,C0=pt&&(!ff||qa&&8<qa&&11>=qa),ko=" ",Fo=!1;function N0(l,t){switch(l){case"keyup":return $h.indexOf(t.keyCode)!==-1;case"keydown":return t.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function x0(l){return l=l.detail,typeof l=="object"&&"data"in l?l.data:null}var Xe=!1;function Fh(l,t){switch(l){case"compositionend":return x0(t);case"keypress":return t.which!==32?null:(Fo=!0,ko);case"textInput":return l=t.data,l===ko&&Fo?null:l;default:return null}}function Ih(l,t){if(Xe)return l==="compositionend"||!ff&&N0(l,t)?(l=R0(),Fu=nf=Xt=null,Xe=!1,l):null;switch(l){case"paste":return null;case"keypress":if(!(t.ctrlKey||t.altKey||t.metaKey)||t.ctrlKey&&t.altKey){if(t.char&&1<t.char.length)return t.char;if(t.which)return String.fromCharCode(t.which)}return null;case"compositionend":return C0&&t.locale!=="ko"?null:t.data;default:return null}}var Ph={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function Io(l){var t=l&&l.nodeName&&l.nodeName.toLowerCase();return t==="input"?!!Ph[l.type]:t==="textarea"}function B0(l,t,e,a){Ge?$e?$e.push(a):$e=[a]:Ge=a,t=Nn(t,"onChange"),0<t.length&&(e=new Qn("onChange","change",null,e,a),l.push({event:e,listeners:t}))}var Ya=null,Fa=null;function l1(l){Hm(l,0)}function jn(l){var t=Na(l);if(_0(t))return l}function Po(l,t){if(l==="change")return t}var q0=!1;pt&&(pt?(Gu="oninput"in document,Gu||(Ci=document.createElement("div"),Ci.setAttribute("oninput","return;"),Gu=typeof Ci.oninput=="function"),Yu=Gu):Yu=!1,q0=Yu&&(!document.documentMode||9<document.documentMode));var Yu,Gu,Ci;function ls(){Ya&&(Ya.detachEvent("onpropertychange",Y0),Fa=Ya=null)}function Y0(l){if(l.propertyName==="value"&&jn(Fa)){var t=[];B0(t,Fa,l,uf(l)),H0(l1,t)}}function t1(l,t,e){l==="focusin"?(ls(),Ya=t,Fa=e,Ya.attachEvent("onpropertychange",Y0)):l==="focusout"&&ls()}function e1(l){if(l==="selectionchange"||l==="keyup"||l==="keydown")return jn(Fa)}function a1(l,t){if(l==="click")return jn(t)}function u1(l,t){if(l==="input"||l==="change")return jn(t)}function n1(l,t){return l===t&&(l!==0||1/l===1/t)||l!==l&&t!==t}var Bl=typeof Object.is=="function"?Object.is:n1;function Ia(l,t){if(Bl(l,t))return!0;if(typeof l!="object"||l===null||typeof t!="object"||t===null)return!1;var e=Object.keys(l),a=Object.keys(t);if(e.length!==a.length)return!1;for(a=0;a<e.length;a++){var u=e[a];if(!oc.call(t,u)||!Bl(l[u],t[u]))return!1}return!0}function ts(l){for(;l&&l.firstChild;)l=l.firstChild;return l}function es(l,t){var e=ts(l);l=0;for(var a;e;){if(e.nodeType===3){if(a=l+e.textContent.length,l<=t&&a>=t)return{node:e,offset:t-l};l=a}l:{for(;e;){if(e.nextSibling){e=e.nextSibling;break l}e=e.parentNode}e=void 0}e=ts(e)}}function G0(l,t){return l&&t?l===t?!0:l&&l.nodeType===3?!1:t&&t.nodeType===3?G0(l,t.parentNode):"contains"in l?l.contains(t):l.compareDocumentPosition?!!(l.compareDocumentPosition(t)&16):!1:!1}function X0(l){l=l!=null&&l.ownerDocument!=null&&l.ownerDocument.defaultView!=null?l.ownerDocument.defaultView:window;for(var t=vn(l.document);t instanceof l.HTMLIFrameElement;){try{var e=typeof t.contentWindow.location.href=="string"}catch{e=!1}if(e)l=t.contentWindow;else break;t=vn(l.document)}return t}function of(l){var t=l&&l.nodeName&&l.nodeName.toLowerCase();return t&&(t==="input"&&(l.type==="text"||l.type==="search"||l.type==="tel"||l.type==="url"||l.type==="password")||t==="textarea"||l.contentEditable==="true")}var i1=pt&&"documentMode"in document&&11>=document.documentMode,Le=null,yc=null,Ga=null,gc=!1;function as(l,t,e){var a=e.window===e?e.document:e.nodeType===9?e:e.ownerDocument;gc||Le==null||Le!==vn(a)||(a=Le,"selectionStart"in a&&of(a)?a={start:a.selectionStart,end:a.selectionEnd}:(a=(a.ownerDocument&&a.ownerDocument.defaultView||window).getSelection(),a={anchorNode:a.anchorNode,anchorOffset:a.anchorOffset,focusNode:a.focusNode,focusOffset:a.focusOffset}),Ga&&Ia(Ga,a)||(Ga=a,a=Nn(yc,"onSelect"),0<a.length&&(t=new Qn("onSelect","select",null,t,e),l.push({event:t,listeners:a}),t.target=Le)))}function ue(l,t){var e={};return e[l.toLowerCase()]=t.toLowerCase(),e["Webkit"+l]="webkit"+t,e["Moz"+l]="moz"+t,e}var Qe={animationend:ue("Animation","AnimationEnd"),animationiteration:ue("Animation","AnimationIteration"),animationstart:ue("Animation","AnimationStart"),transitionrun:ue("Transition","TransitionRun"),transitionstart:ue("Transition","TransitionStart"),transitioncancel:ue("Transition","TransitionCancel"),transitionend:ue("Transition","TransitionEnd")},Ni={},L0={};pt&&(L0=document.createElement("div").style,"AnimationEvent"in window||(delete Qe.animationend.animation,delete Qe.animationiteration.animation,delete Qe.animationstart.animation),"TransitionEvent"in window||delete Qe.transitionend.transition);function Ee(l){if(Ni[l])return Ni[l];if(!Qe[l])return l;var t=Qe[l],e;for(e in t)if(t.hasOwnProperty(e)&&e in L0)return Ni[l]=t[e];return l}var Q0=Ee("animationend"),Z0=Ee("animationiteration"),j0=Ee("animationstart"),c1=Ee("transitionrun"),f1=Ee("transitionstart"),o1=Ee("transitioncancel"),V0=Ee("transitionend"),K0=new Map,bc="abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");bc.push("scrollEnd");function Fl(l,t){K0.set(l,t),Se(t,[l])}var yn=typeof reportError=="function"?reportError:function(l){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var t=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof l=="object"&&l!==null&&typeof l.message=="string"?String(l.message):String(l),error:l});if(!window.dispatchEvent(t))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",l);return}console.error(l)},Gl=[],Ze=0,sf=0;function Vn(){for(var l=Ze,t=sf=Ze=0;t<l;){var e=Gl[t];Gl[t++]=null;var a=Gl[t];Gl[t++]=null;var u=Gl[t];Gl[t++]=null;var n=Gl[t];if(Gl[t++]=null,a!==null&&u!==null){var i=a.pending;i===null?u.next=u:(u.next=i.next,i.next=u),a.pending=u}n!==0&&J0(e,u,n)}}function Kn(l,t,e,a){Gl[Ze++]=l,Gl[Ze++]=t,Gl[Ze++]=e,Gl[Ze++]=a,sf|=a,l.lanes|=a,l=l.alternate,l!==null&&(l.lanes|=a)}function df(l,t,e,a){return Kn(l,t,e,a),gn(l)}function pe(l,t){return Kn(l,null,null,t),gn(l)}function J0(l,t,e){l.lanes|=e;var a=l.alternate;a!==null&&(a.lanes|=e);for(var u=!1,n=l.return;n!==null;)n.childLanes|=e,a=n.alternate,a!==null&&(a.childLanes|=e),n.tag===22&&(l=n.stateNode,l===null||l._visibility&1||(u=!0)),l=n,n=n.return;return l.tag===3?(n=l.stateNode,u&&t!==null&&(u=31-Nl(e),l=n.hiddenUpdates,a=l[u],a===null?l[u]=[t]:a.push(t),t.lane=e|536870912),n):null}function gn(l){if(50<wa)throw wa=0,Xc=null,Error(b(185));for(var t=l.return;t!==null;)l=t,t=l.return;return l.tag===3?l.stateNode:null}var je={};function s1(l,t,e,a){this.tag=l,this.key=e,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.refCleanup=this.ref=null,this.pendingProps=t,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=a,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function Ul(l,t,e,a){return new s1(l,t,e,a)}function mf(l){return l=l.prototype,!(!l||!l.isReactComponent)}function St(l,t){var e=l.alternate;return e===null?(e=Ul(l.tag,t,l.key,l.mode),e.elementType=l.elementType,e.type=l.type,e.stateNode=l.stateNode,e.alternate=l,l.alternate=e):(e.pendingProps=t,e.type=l.type,e.flags=0,e.subtreeFlags=0,e.deletions=null),e.flags=l.flags&65011712,e.childLanes=l.childLanes,e.lanes=l.lanes,e.child=l.child,e.memoizedProps=l.memoizedProps,e.memoizedState=l.memoizedState,e.updateQueue=l.updateQueue,t=l.dependencies,e.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext},e.sibling=l.sibling,e.index=l.index,e.ref=l.ref,e.refCleanup=l.refCleanup,e}function w0(l,t){l.flags&=65011714;var e=l.alternate;return e===null?(l.childLanes=0,l.lanes=t,l.child=null,l.subtreeFlags=0,l.memoizedProps=null,l.memoizedState=null,l.updateQueue=null,l.dependencies=null,l.stateNode=null):(l.childLanes=e.childLanes,l.lanes=e.lanes,l.child=e.child,l.subtreeFlags=0,l.deletions=null,l.memoizedProps=e.memoizedProps,l.memoizedState=e.memoizedState,l.updateQueue=e.updateQueue,l.type=e.type,t=e.dependencies,l.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext}),l}function Pu(l,t,e,a,u,n){var i=0;if(a=l,typeof l=="function")mf(l)&&(i=1);else if(typeof l=="string")i=rv(l,e,ut.current)?26:l==="html"||l==="head"||l==="body"?27:5;else l:switch(l){case nc:return l=Ul(31,e,t,u),l.elementType=nc,l.lanes=n,l;case Be:return se(e.children,u,n,t);case m0:i=8,u|=24;break;case ec:return l=Ul(12,e,t,u|2),l.elementType=ec,l.lanes=n,l;case ac:return l=Ul(13,e,t,u),l.elementType=ac,l.lanes=n,l;case uc:return l=Ul(19,e,t,u),l.elementType=uc,l.lanes=n,l;default:if(typeof l=="object"&&l!==null)switch(l.$$typeof){case yt:i=10;break l;case r0:i=9;break l;case Fc:i=11;break l;case Ic:i=14;break l;case Ct:i=16,a=null;break l}i=29,e=Error(b(130,l===null?"null":typeof l,"")),a=null}return t=Ul(i,e,t,u),t.elementType=l,t.type=a,t.lanes=n,t}function se(l,t,e,a){return l=Ul(7,l,a,t),l.lanes=e,l}function xi(l,t,e){return l=Ul(6,l,null,t),l.lanes=e,l}function W0(l){var t=Ul(18,null,null,0);return t.stateNode=l,t}function Bi(l,t,e){return t=Ul(4,l.children!==null?l.children:[],l.key,t),t.lanes=e,t.stateNode={containerInfo:l.containerInfo,pendingChildren:null,implementation:l.implementation},t}var us=new WeakMap;function jl(l,t){if(typeof l=="object"&&l!==null){var e=us.get(l);return e!==void 0?e:(t={value:l,source:t,stack:Xo(t)},us.set(l,t),t)}return{value:l,source:t,stack:Xo(t)}}var Ve=[],Ke=0,bn=null,Pa=0,Ll=[],Ql=0,It=null,tt=1,et="";function ht(l,t){Ve[Ke++]=Pa,Ve[Ke++]=bn,bn=l,Pa=t}function $0(l,t,e){Ll[Ql++]=tt,Ll[Ql++]=et,Ll[Ql++]=It,It=l;var a=tt;l=et;var u=32-Nl(a)-1;a&=~(1<<u),e+=1;var n=32-Nl(t)+u;if(30<n){var i=u-u%5;n=(a&(1<<i)-1).toString(32),a>>=i,u-=i,tt=1<<32-Nl(t)+u|e<<u|a,et=n+l}else tt=1<<n|e<<u|a,et=l}function rf(l){l.return!==null&&(ht(l,1),$0(l,1,0))}function hf(l){for(;l===bn;)bn=Ve[--Ke],Ve[Ke]=null,Pa=Ve[--Ke],Ve[Ke]=null;for(;l===It;)It=Ll[--Ql],Ll[Ql]=null,et=Ll[--Ql],Ll[Ql]=null,tt=Ll[--Ql],Ll[Ql]=null}function k0(l,t){Ll[Ql++]=tt,Ll[Ql++]=et,Ll[Ql++]=It,tt=t.id,et=t.overflow,It=l}var sl=null,K=null,C=!1,Vt=null,Vl=!1,Sc=Error(b(519));function Pt(l){var t=Error(b(418,1<arguments.length&&arguments[1]!==void 0&&arguments[1]?"text":"HTML",""));throw lu(jl(t,l)),Sc}function ns(l){var t=l.stateNode,e=l.type,a=l.memoizedProps;switch(t[ol]=l,t[Al]=a,e){case"dialog":D("cancel",t),D("close",t);break;case"iframe":case"object":case"embed":D("load",t);break;case"video":case"audio":for(e=0;e<uu.length;e++)D(uu[e],t);break;case"source":D("error",t);break;case"img":case"image":case"link":D("error",t),D("load",t);break;case"details":D("toggle",t);break;case"input":D("invalid",t),M0(t,a.value,a.defaultValue,a.checked,a.defaultChecked,a.type,a.name,!0);break;case"select":D("invalid",t);break;case"textarea":D("invalid",t),D0(t,a.value,a.defaultValue,a.children)}e=a.children,typeof e!="string"&&typeof e!="number"&&typeof e!="bigint"||t.textContent===""+e||a.suppressHydrationWarning===!0||Cm(t.textContent,e)?(a.popover!=null&&(D("beforetoggle",t),D("toggle",t)),a.onScroll!=null&&D("scroll",t),a.onScrollEnd!=null&&D("scrollend",t),a.onClick!=null&&(t.onclick=gt),t=!0):t=!1,t||Pt(l,!0)}function is(l){for(sl=l.return;sl;)switch(sl.tag){case 5:case 31:case 13:Vl=!1;return;case 27:case 3:Vl=!0;return;default:sl=sl.return}}function Re(l){if(l!==sl)return!1;if(!C)return is(l),C=!0,!1;var t=l.tag,e;if((e=t!==3&&t!==27)&&((e=t===5)&&(e=l.type,e=!(e!=="form"&&e!=="button")||Vc(l.type,l.memoizedProps)),e=!e),e&&K&&Pt(l),is(l),t===13){if(l=l.memoizedState,l=l!==null?l.dehydrated:null,!l)throw Error(b(317));K=Ws(l)}else if(t===31){if(l=l.memoizedState,l=l!==null?l.dehydrated:null,!l)throw Error(b(317));K=Ws(l)}else t===27?(t=K,ae(l.type)?(l=Wc,Wc=null,K=l):K=t):K=sl?Jl(l.stateNode.nextSibling):null;return!0}function he(){K=sl=null,C=!1}function qi(){var l=Vt;return l!==null&&(pl===null?pl=l:pl.push.apply(pl,l),Vt=null),l}function lu(l){Vt===null?Vt=[l]:Vt.push(l)}var Tc=nt(null),ze=null,bt=null;function xt(l,t,e){Z(Tc,t._currentValue),t._currentValue=e}function Tt(l){l._currentValue=Tc.current,cl(Tc)}function Ec(l,t,e){for(;l!==null;){var a=l.alternate;if((l.childLanes&t)!==t?(l.childLanes|=t,a!==null&&(a.childLanes|=t)):a!==null&&(a.childLanes&t)!==t&&(a.childLanes|=t),l===e)break;l=l.return}}function pc(l,t,e,a){var u=l.child;for(u!==null&&(u.return=l);u!==null;){var n=u.dependencies;if(n!==null){var i=u.child;n=n.firstContext;l:for(;n!==null;){var c=n;n=u;for(var f=0;f<t.length;f++)if(c.context===t[f]){n.lanes|=e,c=n.alternate,c!==null&&(c.lanes|=e),Ec(n.return,e,l),a||(i=null);break l}n=c.next}}else if(u.tag===18){if(i=u.return,i===null)throw Error(b(341));i.lanes|=e,n=i.alternate,n!==null&&(n.lanes|=e),Ec(i,e,l),i=null}else i=u.child;if(i!==null)i.return=u;else for(i=u;i!==null;){if(i===l){i=null;break}if(u=i.sibling,u!==null){u.return=i.return,i=u;break}i=i.return}u=i}}function ra(l,t,e,a){l=null;for(var u=t,n=!1;u!==null;){if(!n){if(u.flags&524288)n=!0;else if(u.flags&262144)break}if(u.tag===10){var i=u.alternate;if(i===null)throw Error(b(387));if(i=i.memoizedProps,i!==null){var c=u.type;Bl(u.pendingProps.value,i.value)||(l!==null?l.push(c):l=[c])}}else if(u===dn.current){if(i=u.alternate,i===null)throw Error(b(387));i.memoizedState.memoizedState!==u.memoizedState.memoizedState&&(l!==null?l.push(iu):l=[iu])}u=u.return}l!==null&&pc(t,l,e,a),t.flags|=262144}function Sn(l){for(l=l.firstContext;l!==null;){if(!Bl(l.context._currentValue,l.memoizedValue))return!0;l=l.next}return!1}function ve(l){ze=l,bt=null,l=l.dependencies,l!==null&&(l.firstContext=null)}function dl(l){return F0(ze,l)}function Xu(l,t){return ze===null&&ve(l),F0(l,t)}function F0(l,t){var e=t._currentValue;if(t={context:t,memoizedValue:e,next:null},bt===null){if(l===null)throw Error(b(308));bt=t,l.dependencies={lanes:0,firstContext:t},l.flags|=524288}else bt=bt.next=t;return e}var d1=typeof AbortController<"u"?AbortController:function(){var l=[],t=this.signal={aborted:!1,addEventListener:function(e,a){l.push(a)}};this.abort=function(){t.aborted=!0,l.forEach(function(e){return e()})}},m1=ul.unstable_scheduleCallback,r1=ul.unstable_NormalPriority,tl={$$typeof:yt,Consumer:null,Provider:null,_currentValue:null,_currentValue2:null,_threadCount:0};function vf(){return{controller:new d1,data:new Map,refCount:0}}function vu(l){l.refCount--,l.refCount===0&&m1(r1,function(){l.controller.abort()})}var Xa=null,zc=0,aa=0,ke=null;function h1(l,t){if(Xa===null){var e=Xa=[];zc=0,aa=Lf(),ke={status:"pending",value:void 0,then:function(a){e.push(a)}}}return zc++,t.then(cs,cs),t}function cs(){if(--zc===0&&Xa!==null){ke!==null&&(ke.status="fulfilled");var l=Xa;Xa=null,aa=0,ke=null;for(var t=0;t<l.length;t++)(0,l[t])()}}function v1(l,t){var e=[],a={status:"pending",value:null,reason:null,then:function(u){e.push(u)}};return l.then(function(){a.status="fulfilled",a.value=t;for(var u=0;u<e.length;u++)(0,e[u])(t)},function(u){for(a.status="rejected",a.reason=u,u=0;u<e.length;u++)(0,e[u])(void 0)}),a}var fs=z.S;z.S=function(l,t){dm=Rl(),typeof t=="object"&&t!==null&&typeof t.then=="function"&&h1(l,t),fs!==null&&fs(l,t)};var de=nt(null);function yf(){var l=de.current;return l!==null?l:Q.pooledCache}function ln(l,t){t===null?Z(de,de.current):Z(de,t.pool)}function I0(){var l=yf();return l===null?null:{parent:tl._currentValue,pool:l}}var ha=Error(b(460)),gf=Error(b(474)),Jn=Error(b(542)),Tn={then:function(){}};function os(l){return l=l.status,l==="fulfilled"||l==="rejected"}function P0(l,t,e){switch(e=l[e],e===void 0?l.push(t):e!==t&&(t.then(gt,gt),t=e),t.status){case"fulfilled":return t.value;case"rejected":throw l=t.reason,ds(l),l;default:if(typeof t.status=="string")t.then(gt,gt);else{if(l=Q,l!==null&&100<l.shellSuspendCounter)throw Error(b(482));l=t,l.status="pending",l.then(function(a){if(t.status==="pending"){var u=t;u.status="fulfilled",u.value=a}},function(a){if(t.status==="pending"){var u=t;u.status="rejected",u.reason=a}})}switch(t.status){case"fulfilled":return t.value;case"rejected":throw l=t.reason,ds(l),l}throw me=t,ha}}function ce(l){try{var t=l._init;return t(l._payload)}catch(e){throw e!==null&&typeof e=="object"&&typeof e.then=="function"?(me=e,ha):e}}var me=null;function ss(){if(me===null)throw Error(b(459));var l=me;return me=null,l}function ds(l){if(l===ha||l===Jn)throw Error(b(483))}var Fe=null,tu=0;function Lu(l){var t=tu;return tu+=1,Fe===null&&(Fe=[]),P0(Fe,l,t)}function Ma(l,t){t=t.props.ref,l.ref=t!==void 0?t:null}function Qu(l,t){throw t.$$typeof===th?Error(b(525)):(l=Object.prototype.toString.call(t),Error(b(31,l==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":l)))}function ld(l){function t(d,o){if(l){var r=d.deletions;r===null?(d.deletions=[o],d.flags|=16):r.push(o)}}function e(d,o){if(!l)return null;for(;o!==null;)t(d,o),o=o.sibling;return null}function a(d){for(var o=new Map;d!==null;)d.key!==null?o.set(d.key,d):o.set(d.index,d),d=d.sibling;return o}function u(d,o){return d=St(d,o),d.index=0,d.sibling=null,d}function n(d,o,r){return d.index=r,l?(r=d.alternate,r!==null?(r=r.index,r<o?(d.flags|=67108866,o):r):(d.flags|=67108866,o)):(d.flags|=1048576,o)}function i(d){return l&&d.alternate===null&&(d.flags|=67108866),d}function c(d,o,r,g){return o===null||o.tag!==6?(o=xi(r,d.mode,g),o.return=d,o):(o=u(o,r),o.return=d,o)}function f(d,o,r,g){var p=r.type;return p===Be?v(d,o,r.props.children,g,r.key):o!==null&&(o.elementType===p||typeof p=="object"&&p!==null&&p.$$typeof===Ct&&ce(p)===o.type)?(o=u(o,r.props),Ma(o,r),o.return=d,o):(o=Pu(r.type,r.key,r.props,null,d.mode,g),Ma(o,r),o.return=d,o)}function s(d,o,r,g){return o===null||o.tag!==4||o.stateNode.containerInfo!==r.containerInfo||o.stateNode.implementation!==r.implementation?(o=Bi(r,d.mode,g),o.return=d,o):(o=u(o,r.children||[]),o.return=d,o)}function v(d,o,r,g,p){return o===null||o.tag!==7?(o=se(r,d.mode,g,p),o.return=d,o):(o=u(o,r),o.return=d,o)}function y(d,o,r){if(typeof o=="string"&&o!==""||typeof o=="number"||typeof o=="bigint")return o=xi(""+o,d.mode,r),o.return=d,o;if(typeof o=="object"&&o!==null){switch(o.$$typeof){case Ru:return r=Pu(o.type,o.key,o.props,null,d.mode,r),Ma(r,o),r.return=d,r;case Ra:return o=Bi(o,d.mode,r),o.return=d,o;case Ct:return o=ce(o),y(d,o,r)}if(Ca(o)||Aa(o))return o=se(o,d.mode,r,null),o.return=d,o;if(typeof o.then=="function")return y(d,Lu(o),r);if(o.$$typeof===yt)return y(d,Xu(d,o),r);Qu(d,o)}return null}function m(d,o,r,g){var p=o!==null?o.key:null;if(typeof r=="string"&&r!==""||typeof r=="number"||typeof r=="bigint")return p!==null?null:c(d,o,""+r,g);if(typeof r=="object"&&r!==null){switch(r.$$typeof){case Ru:return r.key===p?f(d,o,r,g):null;case Ra:return r.key===p?s(d,o,r,g):null;case Ct:return r=ce(r),m(d,o,r,g)}if(Ca(r)||Aa(r))return p!==null?null:v(d,o,r,g,null);if(typeof r.then=="function")return m(d,o,Lu(r),g);if(r.$$typeof===yt)return m(d,o,Xu(d,r),g);Qu(d,r)}return null}function h(d,o,r,g,p){if(typeof g=="string"&&g!==""||typeof g=="number"||typeof g=="bigint")return d=d.get(r)||null,c(o,d,""+g,p);if(typeof g=="object"&&g!==null){switch(g.$$typeof){case Ru:return d=d.get(g.key===null?r:g.key)||null,f(o,d,g,p);case Ra:return d=d.get(g.key===null?r:g.key)||null,s(o,d,g,p);case Ct:return g=ce(g),h(d,o,r,g,p)}if(Ca(g)||Aa(g))return d=d.get(r)||null,v(o,d,g,p,null);if(typeof g.then=="function")return h(d,o,r,Lu(g),p);if(g.$$typeof===yt)return h(d,o,r,Xu(o,g),p);Qu(o,g)}return null}function S(d,o,r,g){for(var p=null,N=null,T=o,M=o=0,H=null;T!==null&&M<r.length;M++){T.index>M?(H=T,T=null):H=T.sibling;var x=m(d,T,r[M],g);if(x===null){T===null&&(T=H);break}l&&T&&x.alternate===null&&t(d,T),o=n(x,o,M),N===null?p=x:N.sibling=x,N=x,T=H}if(M===r.length)return e(d,T),C&&ht(d,M),p;if(T===null){for(;M<r.length;M++)T=y(d,r[M],g),T!==null&&(o=n(T,o,M),N===null?p=T:N.sibling=T,N=T);return C&&ht(d,M),p}for(T=a(T);M<r.length;M++)H=h(T,d,M,r[M],g),H!==null&&(l&&H.alternate!==null&&T.delete(H.key===null?M:H.key),o=n(H,o,M),N===null?p=H:N.sibling=H,N=H);return l&&T.forEach(function(Ut){return t(d,Ut)}),C&&ht(d,M),p}function E(d,o,r,g){if(r==null)throw Error(b(151));for(var p=null,N=null,T=o,M=o=0,H=null,x=r.next();T!==null&&!x.done;M++,x=r.next()){T.index>M?(H=T,T=null):H=T.sibling;var Ut=m(d,T,x.value,g);if(Ut===null){T===null&&(T=H);break}l&&T&&Ut.alternate===null&&t(d,T),o=n(Ut,o,M),N===null?p=Ut:N.sibling=Ut,N=Ut,T=H}if(x.done)return e(d,T),C&&ht(d,M),p;if(T===null){for(;!x.done;M++,x=r.next())x=y(d,x.value,g),x!==null&&(o=n(x,o,M),N===null?p=x:N.sibling=x,N=x);return C&&ht(d,M),p}for(T=a(T);!x.done;M++,x=r.next())x=h(T,d,M,x.value,g),x!==null&&(l&&x.alternate!==null&&T.delete(x.key===null?M:x.key),o=n(x,o,M),N===null?p=x:N.sibling=x,N=x);return l&&T.forEach(function(_r){return t(d,_r)}),C&&ht(d,M),p}function O(d,o,r,g){if(typeof r=="object"&&r!==null&&r.type===Be&&r.key===null&&(r=r.props.children),typeof r=="object"&&r!==null){switch(r.$$typeof){case Ru:l:{for(var p=r.key;o!==null;){if(o.key===p){if(p=r.type,p===Be){if(o.tag===7){e(d,o.sibling),g=u(o,r.props.children),g.return=d,d=g;break l}}else if(o.elementType===p||typeof p=="object"&&p!==null&&p.$$typeof===Ct&&ce(p)===o.type){e(d,o.sibling),g=u(o,r.props),Ma(g,r),g.return=d,d=g;break l}e(d,o);break}else t(d,o);o=o.sibling}r.type===Be?(g=se(r.props.children,d.mode,g,r.key),g.return=d,d=g):(g=Pu(r.type,r.key,r.props,null,d.mode,g),Ma(g,r),g.return=d,d=g)}return i(d);case Ra:l:{for(p=r.key;o!==null;){if(o.key===p)if(o.tag===4&&o.stateNode.containerInfo===r.containerInfo&&o.stateNode.implementation===r.implementation){e(d,o.sibling),g=u(o,r.children||[]),g.return=d,d=g;break l}else{e(d,o);break}else t(d,o);o=o.sibling}g=Bi(r,d.mode,g),g.return=d,d=g}return i(d);case Ct:return r=ce(r),O(d,o,r,g)}if(Ca(r))return S(d,o,r,g);if(Aa(r)){if(p=Aa(r),typeof p!="function")throw Error(b(150));return r=p.call(r),E(d,o,r,g)}if(typeof r.then=="function")return O(d,o,Lu(r),g);if(r.$$typeof===yt)return O(d,o,Xu(d,r),g);Qu(d,r)}return typeof r=="string"&&r!==""||typeof r=="number"||typeof r=="bigint"?(r=""+r,o!==null&&o.tag===6?(e(d,o.sibling),g=u(o,r),g.return=d,d=g):(e(d,o),g=xi(r,d.mode,g),g.return=d,d=g),i(d)):e(d,o)}return function(d,o,r,g){try{tu=0;var p=O(d,o,r,g);return Fe=null,p}catch(T){if(T===ha||T===Jn)throw T;var N=Ul(29,T,null,d.mode);return N.lanes=g,N.return=d,N}finally{}}}var ye=ld(!0),td=ld(!1),Nt=!1;function bf(l){l.updateQueue={baseState:l.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,lanes:0,hiddenCallbacks:null},callbacks:null}}function Ac(l,t){l=l.updateQueue,t.updateQueue===l&&(t.updateQueue={baseState:l.baseState,firstBaseUpdate:l.firstBaseUpdate,lastBaseUpdate:l.lastBaseUpdate,shared:l.shared,callbacks:null})}function Kt(l){return{lane:l,tag:0,payload:null,callback:null,next:null}}function Jt(l,t,e){var a=l.updateQueue;if(a===null)return null;if(a=a.shared,B&2){var u=a.pending;return u===null?t.next=t:(t.next=u.next,u.next=t),a.pending=t,t=gn(l),J0(l,null,e),t}return Kn(l,a,t,e),gn(l)}function La(l,t,e){if(t=t.updateQueue,t!==null&&(t=t.shared,(e&4194048)!==0)){var a=t.lanes;a&=l.pendingLanes,e|=a,t.lanes=e,S0(l,e)}}function Yi(l,t){var e=l.updateQueue,a=l.alternate;if(a!==null&&(a=a.updateQueue,e===a)){var u=null,n=null;if(e=e.firstBaseUpdate,e!==null){do{var i={lane:e.lane,tag:e.tag,payload:e.payload,callback:null,next:null};n===null?u=n=i:n=n.next=i,e=e.next}while(e!==null);n===null?u=n=t:n=n.next=t}else u=n=t;e={baseState:a.baseState,firstBaseUpdate:u,lastBaseUpdate:n,shared:a.shared,callbacks:a.callbacks},l.updateQueue=e;return}l=e.lastBaseUpdate,l===null?e.firstBaseUpdate=t:l.next=t,e.lastBaseUpdate=t}var _c=!1;function Qa(){if(_c){var l=ke;if(l!==null)throw l}}function Za(l,t,e,a){_c=!1;var u=l.updateQueue;Nt=!1;var n=u.firstBaseUpdate,i=u.lastBaseUpdate,c=u.shared.pending;if(c!==null){u.shared.pending=null;var f=c,s=f.next;f.next=null,i===null?n=s:i.next=s,i=f;var v=l.alternate;v!==null&&(v=v.updateQueue,c=v.lastBaseUpdate,c!==i&&(c===null?v.firstBaseUpdate=s:c.next=s,v.lastBaseUpdate=f))}if(n!==null){var y=u.baseState;i=0,v=s=f=null,c=n;do{var m=c.lane&-536870913,h=m!==c.lane;if(h?(R&m)===m:(a&m)===m){m!==0&&m===aa&&(_c=!0),v!==null&&(v=v.next={lane:0,tag:c.tag,payload:c.payload,callback:null,next:null});l:{var S=l,E=c;m=t;var O=e;switch(E.tag){case 1:if(S=E.payload,typeof S=="function"){y=S.call(O,y,m);break l}y=S;break l;case 3:S.flags=S.flags&-65537|128;case 0:if(S=E.payload,m=typeof S=="function"?S.call(O,y,m):S,m==null)break l;y=J({},y,m);break l;case 2:Nt=!0}}m=c.callback,m!==null&&(l.flags|=64,h&&(l.flags|=8192),h=u.callbacks,h===null?u.callbacks=[m]:h.push(m))}else h={lane:m,tag:c.tag,payload:c.payload,callback:c.callback,next:null},v===null?(s=v=h,f=y):v=v.next=h,i|=m;if(c=c.next,c===null){if(c=u.shared.pending,c===null)break;h=c,c=h.next,h.next=null,u.lastBaseUpdate=h,u.shared.pending=null}}while(!0);v===null&&(f=y),u.baseState=f,u.firstBaseUpdate=s,u.lastBaseUpdate=v,n===null&&(u.shared.lanes=0),te|=i,l.lanes=i,l.memoizedState=y}}function ed(l,t){if(typeof l!="function")throw Error(b(191,l));l.call(t)}function ad(l,t){var e=l.callbacks;if(e!==null)for(l.callbacks=null,l=0;l<e.length;l++)ed(e[l],t)}var ua=nt(null),En=nt(0);function ms(l,t){l=Mt,Z(En,l),Z(ua,t),Mt=l|t.baseLanes}function Mc(){Z(En,Mt),Z(ua,ua.current)}function Sf(){Mt=En.current,cl(ua),cl(En)}var ql=nt(null),Kl=null;function Bt(l){var t=l.alternate;Z(F,F.current&1),Z(ql,l),Kl===null&&(t===null||ua.current!==null||t.memoizedState!==null)&&(Kl=l)}function Oc(l){Z(F,F.current),Z(ql,l),Kl===null&&(Kl=l)}function ud(l){l.tag===22?(Z(F,F.current),Z(ql,l),Kl===null&&(Kl=l)):qt(l)}function qt(){Z(F,F.current),Z(ql,ql.current)}function Dl(l){cl(ql),Kl===l&&(Kl=null),cl(F)}var F=nt(0);function pn(l){for(var t=l;t!==null;){if(t.tag===13){var e=t.memoizedState;if(e!==null&&(e=e.dehydrated,e===null||Jc(e)||wc(e)))return t}else if(t.tag===19&&(t.memoizedProps.revealOrder==="forwards"||t.memoizedProps.revealOrder==="backwards"||t.memoizedProps.revealOrder==="unstable_legacy-backwards"||t.memoizedProps.revealOrder==="together")){if(t.flags&128)return t}else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===l)break;for(;t.sibling===null;){if(t.return===null||t.return===l)return null;t=t.return}t.sibling.return=t.return,t=t.sibling}return null}var zt=0,_=null,L=null,P=null,zn=!1,Ie=!1,ge=!1,An=0,eu=0,Pe=null,y1=0;function $(){throw Error(b(321))}function Tf(l,t){if(t===null)return!1;for(var e=0;e<t.length&&e<l.length;e++)if(!Bl(l[e],t[e]))return!1;return!0}function Ef(l,t,e,a,u,n){return zt=n,_=t,t.memoizedState=null,t.updateQueue=null,t.lanes=0,z.H=l===null||l.memoizedState===null?Bd:Cf,ge=!1,n=e(a,u),ge=!1,Ie&&(n=id(t,e,a,u)),nd(l),n}function nd(l){z.H=au;var t=L!==null&&L.next!==null;if(zt=0,P=L=_=null,zn=!1,eu=0,Pe=null,t)throw Error(b(300));l===null||el||(l=l.dependencies,l!==null&&Sn(l)&&(el=!0))}function id(l,t,e,a){_=l;var u=0;do{if(Ie&&(Pe=null),eu=0,Ie=!1,25<=u)throw Error(b(301));if(u+=1,P=L=null,l.updateQueue!=null){var n=l.updateQueue;n.lastEffect=null,n.events=null,n.stores=null,n.memoCache!=null&&(n.memoCache.index=0)}z.H=qd,n=t(e,a)}while(Ie);return n}function g1(){var l=z.H,t=l.useState()[0];return t=typeof t.then=="function"?yu(t):t,l=l.useState()[0],(L!==null?L.memoizedState:null)!==l&&(_.flags|=1024),t}function pf(){var l=An!==0;return An=0,l}function zf(l,t,e){t.updateQueue=l.updateQueue,t.flags&=-2053,l.lanes&=~e}function Af(l){if(zn){for(l=l.memoizedState;l!==null;){var t=l.queue;t!==null&&(t.pending=null),l=l.next}zn=!1}zt=0,P=L=_=null,Ie=!1,eu=An=0,Pe=null}function bl(){var l={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return P===null?_.memoizedState=P=l:P=P.next=l,P}function I(){if(L===null){var l=_.alternate;l=l!==null?l.memoizedState:null}else l=L.next;var t=P===null?_.memoizedState:P.next;if(t!==null)P=t,L=l;else{if(l===null)throw _.alternate===null?Error(b(467)):Error(b(310));L=l,l={memoizedState:L.memoizedState,baseState:L.baseState,baseQueue:L.baseQueue,queue:L.queue,next:null},P===null?_.memoizedState=P=l:P=P.next=l}return P}function wn(){return{lastEffect:null,events:null,stores:null,memoCache:null}}function yu(l){var t=eu;return eu+=1,Pe===null&&(Pe=[]),l=P0(Pe,l,t),t=_,(P===null?t.memoizedState:P.next)===null&&(t=t.alternate,z.H=t===null||t.memoizedState===null?Bd:Cf),l}function Wn(l){if(l!==null&&typeof l=="object"){if(typeof l.then=="function")return yu(l);if(l.$$typeof===yt)return dl(l)}throw Error(b(438,String(l)))}function _f(l){var t=null,e=_.updateQueue;if(e!==null&&(t=e.memoCache),t==null){var a=_.alternate;a!==null&&(a=a.updateQueue,a!==null&&(a=a.memoCache,a!=null&&(t={data:a.data.map(function(u){return u.slice()}),index:0})))}if(t==null&&(t={data:[],index:0}),e===null&&(e=wn(),_.updateQueue=e),e.memoCache=t,e=t.data[t.index],e===void 0)for(e=t.data[t.index]=Array(l),a=0;a<l;a++)e[a]=eh;return t.index++,e}function At(l,t){return typeof t=="function"?t(l):t}function tn(l){var t=I();return Mf(t,L,l)}function Mf(l,t,e){var a=l.queue;if(a===null)throw Error(b(311));a.lastRenderedReducer=e;var u=l.baseQueue,n=a.pending;if(n!==null){if(u!==null){var i=u.next;u.next=n.next,n.next=i}t.baseQueue=u=n,a.pending=null}if(n=l.baseState,u===null)l.memoizedState=n;else{t=u.next;var c=i=null,f=null,s=t,v=!1;do{var y=s.lane&-536870913;if(y!==s.lane?(R&y)===y:(zt&y)===y){var m=s.revertLane;if(m===0)f!==null&&(f=f.next={lane:0,revertLane:0,gesture:null,action:s.action,hasEagerState:s.hasEagerState,eagerState:s.eagerState,next:null}),y===aa&&(v=!0);else if((zt&m)===m){s=s.next,m===aa&&(v=!0);continue}else y={lane:0,revertLane:s.revertLane,gesture:null,action:s.action,hasEagerState:s.hasEagerState,eagerState:s.eagerState,next:null},f===null?(c=f=y,i=n):f=f.next=y,_.lanes|=m,te|=m;y=s.action,ge&&e(n,y),n=s.hasEagerState?s.eagerState:e(n,y)}else m={lane:y,revertLane:s.revertLane,gesture:s.gesture,action:s.action,hasEagerState:s.hasEagerState,eagerState:s.eagerState,next:null},f===null?(c=f=m,i=n):f=f.next=m,_.lanes|=y,te|=y;s=s.next}while(s!==null&&s!==t);if(f===null?i=n:f.next=c,!Bl(n,l.memoizedState)&&(el=!0,v&&(e=ke,e!==null)))throw e;l.memoizedState=n,l.baseState=i,l.baseQueue=f,a.lastRenderedState=n}return u===null&&(a.lanes=0),[l.memoizedState,a.dispatch]}function Gi(l){var t=I(),e=t.queue;if(e===null)throw Error(b(311));e.lastRenderedReducer=l;var a=e.dispatch,u=e.pending,n=t.memoizedState;if(u!==null){e.pending=null;var i=u=u.next;do n=l(n,i.action),i=i.next;while(i!==u);Bl(n,t.memoizedState)||(el=!0),t.memoizedState=n,t.baseQueue===null&&(t.baseState=n),e.lastRenderedState=n}return[n,a]}function cd(l,t,e){var a=_,u=I(),n=C;if(n){if(e===void 0)throw Error(b(407));e=e()}else e=t();var i=!Bl((L||u).memoizedState,e);if(i&&(u.memoizedState=e,el=!0),u=u.queue,Of(sd.bind(null,a,u,l),[l]),u.getSnapshot!==t||i||P!==null&&P.memoizedState.tag&1){if(a.flags|=2048,na(9,{destroy:void 0},od.bind(null,a,u,e,t),null),Q===null)throw Error(b(349));n||zt&127||fd(a,t,e)}return e}function fd(l,t,e){l.flags|=16384,l={getSnapshot:t,value:e},t=_.updateQueue,t===null?(t=wn(),_.updateQueue=t,t.stores=[l]):(e=t.stores,e===null?t.stores=[l]:e.push(l))}function od(l,t,e,a){t.value=e,t.getSnapshot=a,dd(t)&&md(l)}function sd(l,t,e){return e(function(){dd(t)&&md(l)})}function dd(l){var t=l.getSnapshot;l=l.value;try{var e=t();return!Bl(l,e)}catch{return!0}}function md(l){var t=pe(l,2);t!==null&&zl(t,l,2)}function Dc(l){var t=bl();if(typeof l=="function"){var e=l;if(l=e(),ge){Gt(!0);try{e()}finally{Gt(!1)}}}return t.memoizedState=t.baseState=l,t.queue={pending:null,lanes:0,dispatch:null,lastRenderedReducer:At,lastRenderedState:l},t}function rd(l,t,e,a){return l.baseState=e,Mf(l,L,typeof a=="function"?a:At)}function b1(l,t,e,a,u){if(kn(l))throw Error(b(485));if(l=t.action,l!==null){var n={payload:u,action:l,next:null,isTransition:!0,status:"pending",value:null,reason:null,listeners:[],then:function(i){n.listeners.push(i)}};z.T!==null?e(!0):n.isTransition=!1,a(n),e=t.pending,e===null?(n.next=t.pending=n,hd(t,n)):(n.next=e.next,t.pending=e.next=n)}}function hd(l,t){var e=t.action,a=t.payload,u=l.state;if(t.isTransition){var n=z.T,i={};z.T=i;try{var c=e(u,a),f=z.S;f!==null&&f(i,c),rs(l,t,c)}catch(s){Uc(l,t,s)}finally{n!==null&&i.types!==null&&(n.types=i.types),z.T=n}}else try{n=e(u,a),rs(l,t,n)}catch(s){Uc(l,t,s)}}function rs(l,t,e){e!==null&&typeof e=="object"&&typeof e.then=="function"?e.then(function(a){hs(l,t,a)},function(a){return Uc(l,t,a)}):hs(l,t,e)}function hs(l,t,e){t.status="fulfilled",t.value=e,vd(t),l.state=e,t=l.pending,t!==null&&(e=t.next,e===t?l.pending=null:(e=e.next,t.next=e,hd(l,e)))}function Uc(l,t,e){var a=l.pending;if(l.pending=null,a!==null){a=a.next;do t.status="rejected",t.reason=e,vd(t),t=t.next;while(t!==a)}l.action=null}function vd(l){l=l.listeners;for(var t=0;t<l.length;t++)(0,l[t])()}function yd(l,t){return t}function vs(l,t){if(C){var e=Q.formState;if(e!==null){l:{var a=_;if(C){if(K){t:{for(var u=K,n=Vl;u.nodeType!==8;){if(!n){u=null;break t}if(u=Jl(u.nextSibling),u===null){u=null;break t}}n=u.data,u=n==="F!"||n==="F"?u:null}if(u){K=Jl(u.nextSibling),a=u.data==="F!";break l}}Pt(a)}a=!1}a&&(t=e[0])}}return e=bl(),e.memoizedState=e.baseState=t,a={pending:null,lanes:0,dispatch:null,lastRenderedReducer:yd,lastRenderedState:t},e.queue=a,e=Cd.bind(null,_,a),a.dispatch=e,a=Dc(!1),n=Rf.bind(null,_,!1,a.queue),a=bl(),u={state:t,dispatch:null,action:l,pending:null},a.queue=u,e=b1.bind(null,_,u,n,e),u.dispatch=e,a.memoizedState=l,[t,e,!1]}function ys(l){var t=I();return gd(t,L,l)}function gd(l,t,e){if(t=Mf(l,t,yd)[0],l=tn(At)[0],typeof t=="object"&&t!==null&&typeof t.then=="function")try{var a=yu(t)}catch(i){throw i===ha?Jn:i}else a=t;t=I();var u=t.queue,n=u.dispatch;return e!==t.memoizedState&&(_.flags|=2048,na(9,{destroy:void 0},S1.bind(null,u,e),null)),[a,n,l]}function S1(l,t){l.action=t}function gs(l){var t=I(),e=L;if(e!==null)return gd(t,e,l);I(),t=t.memoizedState,e=I();var a=e.queue.dispatch;return e.memoizedState=l,[t,a,!1]}function na(l,t,e,a){return l={tag:l,create:e,deps:a,inst:t,next:null},t=_.updateQueue,t===null&&(t=wn(),_.updateQueue=t),e=t.lastEffect,e===null?t.lastEffect=l.next=l:(a=e.next,e.next=l,l.next=a,t.lastEffect=l),l}function bd(){return I().memoizedState}function en(l,t,e,a){var u=bl();_.flags|=l,u.memoizedState=na(1|t,{destroy:void 0},e,a===void 0?null:a)}function $n(l,t,e,a){var u=I();a=a===void 0?null:a;var n=u.memoizedState.inst;L!==null&&a!==null&&Tf(a,L.memoizedState.deps)?u.memoizedState=na(t,n,e,a):(_.flags|=l,u.memoizedState=na(1|t,n,e,a))}function bs(l,t){en(8390656,8,l,t)}function Of(l,t){$n(2048,8,l,t)}function T1(l){_.flags|=4;var t=_.updateQueue;if(t===null)t=wn(),_.updateQueue=t,t.events=[l];else{var e=t.events;e===null?t.events=[l]:e.push(l)}}function Sd(l){var t=I().memoizedState;return T1({ref:t,nextImpl:l}),function(){if(B&2)throw Error(b(440));return t.impl.apply(void 0,arguments)}}function Td(l,t){return $n(4,2,l,t)}function Ed(l,t){return $n(4,4,l,t)}function pd(l,t){if(typeof t=="function"){l=l();var e=t(l);return function(){typeof e=="function"?e():t(null)}}if(t!=null)return l=l(),t.current=l,function(){t.current=null}}function zd(l,t,e){e=e!=null?e.concat([l]):null,$n(4,4,pd.bind(null,t,l),e)}function Df(){}function Ad(l,t){var e=I();t=t===void 0?null:t;var a=e.memoizedState;return t!==null&&Tf(t,a[1])?a[0]:(e.memoizedState=[l,t],l)}function _d(l,t){var e=I();t=t===void 0?null:t;var a=e.memoizedState;if(t!==null&&Tf(t,a[1]))return a[0];if(a=l(),ge){Gt(!0);try{l()}finally{Gt(!1)}}return e.memoizedState=[a,t],a}function Uf(l,t,e){return e===void 0||zt&1073741824&&!(R&261930)?l.memoizedState=t:(l.memoizedState=e,l=rm(),_.lanes|=l,te|=l,e)}function Md(l,t,e,a){return Bl(e,t)?e:ua.current!==null?(l=Uf(l,e,a),Bl(l,t)||(el=!0),l):!(zt&42)||zt&1073741824&&!(R&261930)?(el=!0,l.memoizedState=e):(l=rm(),_.lanes|=l,te|=l,t)}function Od(l,t,e,a,u){var n=q.p;q.p=n!==0&&8>n?n:8;var i=z.T,c={};z.T=c,Rf(l,!1,t,e);try{var f=u(),s=z.S;if(s!==null&&s(c,f),f!==null&&typeof f=="object"&&typeof f.then=="function"){var v=v1(f,a);ja(l,t,v,xl(l))}else ja(l,t,a,xl(l))}catch(y){ja(l,t,{then:function(){},status:"rejected",reason:y},xl())}finally{q.p=n,i!==null&&c.types!==null&&(i.types=c.types),z.T=i}}function E1(){}function Hc(l,t,e,a){if(l.tag!==5)throw Error(b(476));var u=Dd(l).queue;Od(l,u,t,oe,e===null?E1:function(){return Ud(l),e(a)})}function Dd(l){var t=l.memoizedState;if(t!==null)return t;t={memoizedState:oe,baseState:oe,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:At,lastRenderedState:oe},next:null};var e={};return t.next={memoizedState:e,baseState:e,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:At,lastRenderedState:e},next:null},l.memoizedState=t,l=l.alternate,l!==null&&(l.memoizedState=t),t}function Ud(l){var t=Dd(l);t.next===null&&(t=l.alternate.memoizedState),ja(l,t.next.queue,{},xl())}function Hf(){return dl(iu)}function Hd(){return I().memoizedState}function Rd(){return I().memoizedState}function p1(l){for(var t=l.return;t!==null;){switch(t.tag){case 24:case 3:var e=xl();l=Kt(e);var a=Jt(t,l,e);a!==null&&(zl(a,t,e),La(a,t,e)),t={cache:vf()},l.payload=t;return}t=t.return}}function z1(l,t,e){var a=xl();e={lane:a,revertLane:0,gesture:null,action:e,hasEagerState:!1,eagerState:null,next:null},kn(l)?Nd(t,e):(e=df(l,t,e,a),e!==null&&(zl(e,l,a),xd(e,t,a)))}function Cd(l,t,e){var a=xl();ja(l,t,e,a)}function ja(l,t,e,a){var u={lane:a,revertLane:0,gesture:null,action:e,hasEagerState:!1,eagerState:null,next:null};if(kn(l))Nd(t,u);else{var n=l.alternate;if(l.lanes===0&&(n===null||n.lanes===0)&&(n=t.lastRenderedReducer,n!==null))try{var i=t.lastRenderedState,c=n(i,e);if(u.hasEagerState=!0,u.eagerState=c,Bl(c,i))return Kn(l,t,u,0),Q===null&&Vn(),!1}catch{}finally{}if(e=df(l,t,u,a),e!==null)return zl(e,l,a),xd(e,t,a),!0}return!1}function Rf(l,t,e,a){if(a={lane:2,revertLane:Lf(),gesture:null,action:a,hasEagerState:!1,eagerState:null,next:null},kn(l)){if(t)throw Error(b(479))}else t=df(l,e,a,2),t!==null&&zl(t,l,2)}function kn(l){var t=l.alternate;return l===_||t!==null&&t===_}function Nd(l,t){Ie=zn=!0;var e=l.pending;e===null?t.next=t:(t.next=e.next,e.next=t),l.pending=t}function xd(l,t,e){if(e&4194048){var a=t.lanes;a&=l.pendingLanes,e|=a,t.lanes=e,S0(l,e)}}var au={readContext:dl,use:Wn,useCallback:$,useContext:$,useEffect:$,useImperativeHandle:$,useLayoutEffect:$,useInsertionEffect:$,useMemo:$,useReducer:$,useRef:$,useState:$,useDebugValue:$,useDeferredValue:$,useTransition:$,useSyncExternalStore:$,useId:$,useHostTransitionStatus:$,useFormState:$,useActionState:$,useOptimistic:$,useMemoCache:$,useCacheRefresh:$};au.useEffectEvent=$;var Bd={readContext:dl,use:Wn,useCallback:function(l,t){return bl().memoizedState=[l,t===void 0?null:t],l},useContext:dl,useEffect:bs,useImperativeHandle:function(l,t,e){e=e!=null?e.concat([l]):null,en(4194308,4,pd.bind(null,t,l),e)},useLayoutEffect:function(l,t){return en(4194308,4,l,t)},useInsertionEffect:function(l,t){en(4,2,l,t)},useMemo:function(l,t){var e=bl();t=t===void 0?null:t;var a=l();if(ge){Gt(!0);try{l()}finally{Gt(!1)}}return e.memoizedState=[a,t],a},useReducer:function(l,t,e){var a=bl();if(e!==void 0){var u=e(t);if(ge){Gt(!0);try{e(t)}finally{Gt(!1)}}}else u=t;return a.memoizedState=a.baseState=u,l={pending:null,lanes:0,dispatch:null,lastRenderedReducer:l,lastRenderedState:u},a.queue=l,l=l.dispatch=z1.bind(null,_,l),[a.memoizedState,l]},useRef:function(l){var t=bl();return l={current:l},t.memoizedState=l},useState:function(l){l=Dc(l);var t=l.queue,e=Cd.bind(null,_,t);return t.dispatch=e,[l.memoizedState,e]},useDebugValue:Df,useDeferredValue:function(l,t){var e=bl();return Uf(e,l,t)},useTransition:function(){var l=Dc(!1);return l=Od.bind(null,_,l.queue,!0,!1),bl().memoizedState=l,[!1,l]},useSyncExternalStore:function(l,t,e){var a=_,u=bl();if(C){if(e===void 0)throw Error(b(407));e=e()}else{if(e=t(),Q===null)throw Error(b(349));R&127||fd(a,t,e)}u.memoizedState=e;var n={value:e,getSnapshot:t};return u.queue=n,bs(sd.bind(null,a,n,l),[l]),a.flags|=2048,na(9,{destroy:void 0},od.bind(null,a,n,e,t),null),e},useId:function(){var l=bl(),t=Q.identifierPrefix;if(C){var e=et,a=tt;e=(a&~(1<<32-Nl(a)-1)).toString(32)+e,t="_"+t+"R_"+e,e=An++,0<e&&(t+="H"+e.toString(32)),t+="_"}else e=y1++,t="_"+t+"r_"+e.toString(32)+"_";return l.memoizedState=t},useHostTransitionStatus:Hf,useFormState:vs,useActionState:vs,useOptimistic:function(l){var t=bl();t.memoizedState=t.baseState=l;var e={pending:null,lanes:0,dispatch:null,lastRenderedReducer:null,lastRenderedState:null};return t.queue=e,t=Rf.bind(null,_,!0,e),e.dispatch=t,[l,t]},useMemoCache:_f,useCacheRefresh:function(){return bl().memoizedState=p1.bind(null,_)},useEffectEvent:function(l){var t=bl(),e={impl:l};return t.memoizedState=e,function(){if(B&2)throw Error(b(440));return e.impl.apply(void 0,arguments)}}},Cf={readContext:dl,use:Wn,useCallback:Ad,useContext:dl,useEffect:Of,useImperativeHandle:zd,useInsertionEffect:Td,useLayoutEffect:Ed,useMemo:_d,useReducer:tn,useRef:bd,useState:function(){return tn(At)},useDebugValue:Df,useDeferredValue:function(l,t){var e=I();return Md(e,L.memoizedState,l,t)},useTransition:function(){var l=tn(At)[0],t=I().memoizedState;return[typeof l=="boolean"?l:yu(l),t]},useSyncExternalStore:cd,useId:Hd,useHostTransitionStatus:Hf,useFormState:ys,useActionState:ys,useOptimistic:function(l,t){var e=I();return rd(e,L,l,t)},useMemoCache:_f,useCacheRefresh:Rd};Cf.useEffectEvent=Sd;var qd={readContext:dl,use:Wn,useCallback:Ad,useContext:dl,useEffect:Of,useImperativeHandle:zd,useInsertionEffect:Td,useLayoutEffect:Ed,useMemo:_d,useReducer:Gi,useRef:bd,useState:function(){return Gi(At)},useDebugValue:Df,useDeferredValue:function(l,t){var e=I();return L===null?Uf(e,l,t):Md(e,L.memoizedState,l,t)},useTransition:function(){var l=Gi(At)[0],t=I().memoizedState;return[typeof l=="boolean"?l:yu(l),t]},useSyncExternalStore:cd,useId:Hd,useHostTransitionStatus:Hf,useFormState:gs,useActionState:gs,useOptimistic:function(l,t){var e=I();return L!==null?rd(e,L,l,t):(e.baseState=l,[l,e.queue.dispatch])},useMemoCache:_f,useCacheRefresh:Rd};qd.useEffectEvent=Sd;function Xi(l,t,e,a){t=l.memoizedState,e=e(a,t),e=e==null?t:J({},t,e),l.memoizedState=e,l.lanes===0&&(l.updateQueue.baseState=e)}var Rc={enqueueSetState:function(l,t,e){l=l._reactInternals;var a=xl(),u=Kt(a);u.payload=t,e!=null&&(u.callback=e),t=Jt(l,u,a),t!==null&&(zl(t,l,a),La(t,l,a))},enqueueReplaceState:function(l,t,e){l=l._reactInternals;var a=xl(),u=Kt(a);u.tag=1,u.payload=t,e!=null&&(u.callback=e),t=Jt(l,u,a),t!==null&&(zl(t,l,a),La(t,l,a))},enqueueForceUpdate:function(l,t){l=l._reactInternals;var e=xl(),a=Kt(e);a.tag=2,t!=null&&(a.callback=t),t=Jt(l,a,e),t!==null&&(zl(t,l,e),La(t,l,e))}};function Ss(l,t,e,a,u,n,i){return l=l.stateNode,typeof l.shouldComponentUpdate=="function"?l.shouldComponentUpdate(a,n,i):t.prototype&&t.prototype.isPureReactComponent?!Ia(e,a)||!Ia(u,n):!0}function Ts(l,t,e,a){l=t.state,typeof t.componentWillReceiveProps=="function"&&t.componentWillReceiveProps(e,a),typeof t.UNSAFE_componentWillReceiveProps=="function"&&t.UNSAFE_componentWillReceiveProps(e,a),t.state!==l&&Rc.enqueueReplaceState(t,t.state,null)}function be(l,t){var e=t;if("ref"in t){e={};for(var a in t)a!=="ref"&&(e[a]=t[a])}if(l=l.defaultProps){e===t&&(e=J({},e));for(var u in l)e[u]===void 0&&(e[u]=l[u])}return e}function Yd(l){yn(l)}function Gd(l){console.error(l)}function Xd(l){yn(l)}function _n(l,t){try{var e=l.onUncaughtError;e(t.value,{componentStack:t.stack})}catch(a){setTimeout(function(){throw a})}}function Es(l,t,e){try{var a=l.onCaughtError;a(e.value,{componentStack:e.stack,errorBoundary:t.tag===1?t.stateNode:null})}catch(u){setTimeout(function(){throw u})}}function Cc(l,t,e){return e=Kt(e),e.tag=3,e.payload={element:null},e.callback=function(){_n(l,t)},e}function Ld(l){return l=Kt(l),l.tag=3,l}function Qd(l,t,e,a){var u=e.type.getDerivedStateFromError;if(typeof u=="function"){var n=a.value;l.payload=function(){return u(n)},l.callback=function(){Es(t,e,a)}}var i=e.stateNode;i!==null&&typeof i.componentDidCatch=="function"&&(l.callback=function(){Es(t,e,a),typeof u!="function"&&(wt===null?wt=new Set([this]):wt.add(this));var c=a.stack;this.componentDidCatch(a.value,{componentStack:c!==null?c:""})})}function A1(l,t,e,a,u){if(e.flags|=32768,a!==null&&typeof a=="object"&&typeof a.then=="function"){if(t=e.alternate,t!==null&&ra(t,e,u,!0),e=ql.current,e!==null){switch(e.tag){case 31:case 13:return Kl===null?Hn():e.alternate===null&&k===0&&(k=3),e.flags&=-257,e.flags|=65536,e.lanes=u,a===Tn?e.flags|=16384:(t=e.updateQueue,t===null?e.updateQueue=new Set([a]):t.add(a),ki(l,a,u)),!1;case 22:return e.flags|=65536,a===Tn?e.flags|=16384:(t=e.updateQueue,t===null?(t={transitions:null,markerInstances:null,retryQueue:new Set([a])},e.updateQueue=t):(e=t.retryQueue,e===null?t.retryQueue=new Set([a]):e.add(a)),ki(l,a,u)),!1}throw Error(b(435,e.tag))}return ki(l,a,u),Hn(),!1}if(C)return t=ql.current,t!==null?(!(t.flags&65536)&&(t.flags|=256),t.flags|=65536,t.lanes=u,a!==Sc&&(l=Error(b(422),{cause:a}),lu(jl(l,e)))):(a!==Sc&&(t=Error(b(423),{cause:a}),lu(jl(t,e))),l=l.current.alternate,l.flags|=65536,u&=-u,l.lanes|=u,a=jl(a,e),u=Cc(l.stateNode,a,u),Yi(l,u),k!==4&&(k=2)),!1;var n=Error(b(520),{cause:a});if(n=jl(n,e),Ja===null?Ja=[n]:Ja.push(n),k!==4&&(k=2),t===null)return!0;a=jl(a,e),e=t;do{switch(e.tag){case 3:return e.flags|=65536,l=u&-u,e.lanes|=l,l=Cc(e.stateNode,a,l),Yi(e,l),!1;case 1:if(t=e.type,n=e.stateNode,(e.flags&128)===0&&(typeof t.getDerivedStateFromError=="function"||n!==null&&typeof n.componentDidCatch=="function"&&(wt===null||!wt.has(n))))return e.flags|=65536,u&=-u,e.lanes|=u,u=Ld(u),Qd(u,l,e,a),Yi(e,u),!1}e=e.return}while(e!==null);return!1}var Nf=Error(b(461)),el=!1;function fl(l,t,e,a){t.child=l===null?td(t,null,e,a):ye(t,l.child,e,a)}function ps(l,t,e,a,u){e=e.render;var n=t.ref;if("ref"in a){var i={};for(var c in a)c!=="ref"&&(i[c]=a[c])}else i=a;return ve(t),a=Ef(l,t,e,i,n,u),c=pf(),l!==null&&!el?(zf(l,t,u),_t(l,t,u)):(C&&c&&rf(t),t.flags|=1,fl(l,t,a,u),t.child)}function zs(l,t,e,a,u){if(l===null){var n=e.type;return typeof n=="function"&&!mf(n)&&n.defaultProps===void 0&&e.compare===null?(t.tag=15,t.type=n,Zd(l,t,n,a,u)):(l=Pu(e.type,null,a,t,t.mode,u),l.ref=t.ref,l.return=t,t.child=l)}if(n=l.child,!xf(l,u)){var i=n.memoizedProps;if(e=e.compare,e=e!==null?e:Ia,e(i,a)&&l.ref===t.ref)return _t(l,t,u)}return t.flags|=1,l=St(n,a),l.ref=t.ref,l.return=t,t.child=l}function Zd(l,t,e,a,u){if(l!==null){var n=l.memoizedProps;if(Ia(n,a)&&l.ref===t.ref)if(el=!1,t.pendingProps=a=n,xf(l,u))l.flags&131072&&(el=!0);else return t.lanes=l.lanes,_t(l,t,u)}return Nc(l,t,e,a,u)}function jd(l,t,e,a){var u=a.children,n=l!==null?l.memoizedState:null;if(l===null&&t.stateNode===null&&(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),a.mode==="hidden"){if(t.flags&128){if(n=n!==null?n.baseLanes|e:e,l!==null){for(a=t.child=l.child,u=0;a!==null;)u=u|a.lanes|a.childLanes,a=a.sibling;a=u&~n}else a=0,t.child=null;return As(l,t,n,e,a)}if(e&536870912)t.memoizedState={baseLanes:0,cachePool:null},l!==null&&ln(t,n!==null?n.cachePool:null),n!==null?ms(t,n):Mc(),ud(t);else return a=t.lanes=536870912,As(l,t,n!==null?n.baseLanes|e:e,e,a)}else n!==null?(ln(t,n.cachePool),ms(t,n),qt(t),t.memoizedState=null):(l!==null&&ln(t,null),Mc(),qt(t));return fl(l,t,u,e),t.child}function xa(l,t){return l!==null&&l.tag===22||t.stateNode!==null||(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),t.sibling}function As(l,t,e,a,u){var n=yf();return n=n===null?null:{parent:tl._currentValue,pool:n},t.memoizedState={baseLanes:e,cachePool:n},l!==null&&ln(t,null),Mc(),ud(t),l!==null&&ra(l,t,a,!0),t.childLanes=u,null}function an(l,t){return t=Mn({mode:t.mode,children:t.children},l.mode),t.ref=l.ref,l.child=t,t.return=l,t}function _s(l,t,e){return ye(t,l.child,null,e),l=an(t,t.pendingProps),l.flags|=2,Dl(t),t.memoizedState=null,l}function _1(l,t,e){var a=t.pendingProps,u=(t.flags&128)!==0;if(t.flags&=-129,l===null){if(C){if(a.mode==="hidden")return l=an(t,a),t.lanes=536870912,xa(null,l);if(Oc(t),(l=K)?(l=Bm(l,Vl),l=l!==null&&l.data==="&"?l:null,l!==null&&(t.memoizedState={dehydrated:l,treeContext:It!==null?{id:tt,overflow:et}:null,retryLane:536870912,hydrationErrors:null},e=W0(l),e.return=t,t.child=e,sl=t,K=null)):l=null,l===null)throw Pt(t);return t.lanes=536870912,null}return an(t,a)}var n=l.memoizedState;if(n!==null){var i=n.dehydrated;if(Oc(t),u)if(t.flags&256)t.flags&=-257,t=_s(l,t,e);else if(t.memoizedState!==null)t.child=l.child,t.flags|=128,t=null;else throw Error(b(558));else if(el||ra(l,t,e,!1),u=(e&l.childLanes)!==0,el||u){if(a=Q,a!==null&&(i=T0(a,e),i!==0&&i!==n.retryLane))throw n.retryLane=i,pe(l,i),zl(a,l,i),Nf;Hn(),t=_s(l,t,e)}else l=n.treeContext,K=Jl(i.nextSibling),sl=t,C=!0,Vt=null,Vl=!1,l!==null&&k0(t,l),t=an(t,a),t.flags|=4096;return t}return l=St(l.child,{mode:a.mode,children:a.children}),l.ref=t.ref,t.child=l,l.return=t,l}function un(l,t){var e=t.ref;if(e===null)l!==null&&l.ref!==null&&(t.flags|=4194816);else{if(typeof e!="function"&&typeof e!="object")throw Error(b(284));(l===null||l.ref!==e)&&(t.flags|=4194816)}}function Nc(l,t,e,a,u){return ve(t),e=Ef(l,t,e,a,void 0,u),a=pf(),l!==null&&!el?(zf(l,t,u),_t(l,t,u)):(C&&a&&rf(t),t.flags|=1,fl(l,t,e,u),t.child)}function Ms(l,t,e,a,u,n){return ve(t),t.updateQueue=null,e=id(t,a,e,u),nd(l),a=pf(),l!==null&&!el?(zf(l,t,n),_t(l,t,n)):(C&&a&&rf(t),t.flags|=1,fl(l,t,e,n),t.child)}function Os(l,t,e,a,u){if(ve(t),t.stateNode===null){var n=je,i=e.contextType;typeof i=="object"&&i!==null&&(n=dl(i)),n=new e(a,n),t.memoizedState=n.state!==null&&n.state!==void 0?n.state:null,n.updater=Rc,t.stateNode=n,n._reactInternals=t,n=t.stateNode,n.props=a,n.state=t.memoizedState,n.refs={},bf(t),i=e.contextType,n.context=typeof i=="object"&&i!==null?dl(i):je,n.state=t.memoizedState,i=e.getDerivedStateFromProps,typeof i=="function"&&(Xi(t,e,i,a),n.state=t.memoizedState),typeof e.getDerivedStateFromProps=="function"||typeof n.getSnapshotBeforeUpdate=="function"||typeof n.UNSAFE_componentWillMount!="function"&&typeof n.componentWillMount!="function"||(i=n.state,typeof n.componentWillMount=="function"&&n.componentWillMount(),typeof n.UNSAFE_componentWillMount=="function"&&n.UNSAFE_componentWillMount(),i!==n.state&&Rc.enqueueReplaceState(n,n.state,null),Za(t,a,n,u),Qa(),n.state=t.memoizedState),typeof n.componentDidMount=="function"&&(t.flags|=4194308),a=!0}else if(l===null){n=t.stateNode;var c=t.memoizedProps,f=be(e,c);n.props=f;var s=n.context,v=e.contextType;i=je,typeof v=="object"&&v!==null&&(i=dl(v));var y=e.getDerivedStateFromProps;v=typeof y=="function"||typeof n.getSnapshotBeforeUpdate=="function",c=t.pendingProps!==c,v||typeof n.UNSAFE_componentWillReceiveProps!="function"&&typeof n.componentWillReceiveProps!="function"||(c||s!==i)&&Ts(t,n,a,i),Nt=!1;var m=t.memoizedState;n.state=m,Za(t,a,n,u),Qa(),s=t.memoizedState,c||m!==s||Nt?(typeof y=="function"&&(Xi(t,e,y,a),s=t.memoizedState),(f=Nt||Ss(t,e,f,a,m,s,i))?(v||typeof n.UNSAFE_componentWillMount!="function"&&typeof n.componentWillMount!="function"||(typeof n.componentWillMount=="function"&&n.componentWillMount(),typeof n.UNSAFE_componentWillMount=="function"&&n.UNSAFE_componentWillMount()),typeof n.componentDidMount=="function"&&(t.flags|=4194308)):(typeof n.componentDidMount=="function"&&(t.flags|=4194308),t.memoizedProps=a,t.memoizedState=s),n.props=a,n.state=s,n.context=i,a=f):(typeof n.componentDidMount=="function"&&(t.flags|=4194308),a=!1)}else{n=t.stateNode,Ac(l,t),i=t.memoizedProps,v=be(e,i),n.props=v,y=t.pendingProps,m=n.context,s=e.contextType,f=je,typeof s=="object"&&s!==null&&(f=dl(s)),c=e.getDerivedStateFromProps,(s=typeof c=="function"||typeof n.getSnapshotBeforeUpdate=="function")||typeof n.UNSAFE_componentWillReceiveProps!="function"&&typeof n.componentWillReceiveProps!="function"||(i!==y||m!==f)&&Ts(t,n,a,f),Nt=!1,m=t.memoizedState,n.state=m,Za(t,a,n,u),Qa();var h=t.memoizedState;i!==y||m!==h||Nt||l!==null&&l.dependencies!==null&&Sn(l.dependencies)?(typeof c=="function"&&(Xi(t,e,c,a),h=t.memoizedState),(v=Nt||Ss(t,e,v,a,m,h,f)||l!==null&&l.dependencies!==null&&Sn(l.dependencies))?(s||typeof n.UNSAFE_componentWillUpdate!="function"&&typeof n.componentWillUpdate!="function"||(typeof n.componentWillUpdate=="function"&&n.componentWillUpdate(a,h,f),typeof n.UNSAFE_componentWillUpdate=="function"&&n.UNSAFE_componentWillUpdate(a,h,f)),typeof n.componentDidUpdate=="function"&&(t.flags|=4),typeof n.getSnapshotBeforeUpdate=="function"&&(t.flags|=1024)):(typeof n.componentDidUpdate!="function"||i===l.memoizedProps&&m===l.memoizedState||(t.flags|=4),typeof n.getSnapshotBeforeUpdate!="function"||i===l.memoizedProps&&m===l.memoizedState||(t.flags|=1024),t.memoizedProps=a,t.memoizedState=h),n.props=a,n.state=h,n.context=f,a=v):(typeof n.componentDidUpdate!="function"||i===l.memoizedProps&&m===l.memoizedState||(t.flags|=4),typeof n.getSnapshotBeforeUpdate!="function"||i===l.memoizedProps&&m===l.memoizedState||(t.flags|=1024),a=!1)}return n=a,un(l,t),a=(t.flags&128)!==0,n||a?(n=t.stateNode,e=a&&typeof e.getDerivedStateFromError!="function"?null:n.render(),t.flags|=1,l!==null&&a?(t.child=ye(t,l.child,null,u),t.child=ye(t,null,e,u)):fl(l,t,e,u),t.memoizedState=n.state,l=t.child):l=_t(l,t,u),l}function Ds(l,t,e,a){return he(),t.flags|=256,fl(l,t,e,a),t.child}var Li={dehydrated:null,treeContext:null,retryLane:0,hydrationErrors:null};function Qi(l){return{baseLanes:l,cachePool:I0()}}function Zi(l,t,e){return l=l!==null?l.childLanes&~e:0,t&&(l|=Hl),l}function Vd(l,t,e){var a=t.pendingProps,u=!1,n=(t.flags&128)!==0,i;if((i=n)||(i=l!==null&&l.memoizedState===null?!1:(F.current&2)!==0),i&&(u=!0,t.flags&=-129),i=(t.flags&32)!==0,t.flags&=-33,l===null){if(C){if(u?Bt(t):qt(t),(l=K)?(l=Bm(l,Vl),l=l!==null&&l.data!=="&"?l:null,l!==null&&(t.memoizedState={dehydrated:l,treeContext:It!==null?{id:tt,overflow:et}:null,retryLane:536870912,hydrationErrors:null},e=W0(l),e.return=t,t.child=e,sl=t,K=null)):l=null,l===null)throw Pt(t);return wc(l)?t.lanes=32:t.lanes=536870912,null}var c=a.children;return a=a.fallback,u?(qt(t),u=t.mode,c=Mn({mode:"hidden",children:c},u),a=se(a,u,e,null),c.return=t,a.return=t,c.sibling=a,t.child=c,a=t.child,a.memoizedState=Qi(e),a.childLanes=Zi(l,i,e),t.memoizedState=Li,xa(null,a)):(Bt(t),xc(t,c))}var f=l.memoizedState;if(f!==null&&(c=f.dehydrated,c!==null)){if(n)t.flags&256?(Bt(t),t.flags&=-257,t=ji(l,t,e)):t.memoizedState!==null?(qt(t),t.child=l.child,t.flags|=128,t=null):(qt(t),c=a.fallback,u=t.mode,a=Mn({mode:"visible",children:a.children},u),c=se(c,u,e,null),c.flags|=2,a.return=t,c.return=t,a.sibling=c,t.child=a,ye(t,l.child,null,e),a=t.child,a.memoizedState=Qi(e),a.childLanes=Zi(l,i,e),t.memoizedState=Li,t=xa(null,a));else if(Bt(t),wc(c)){if(i=c.nextSibling&&c.nextSibling.dataset,i)var s=i.dgst;i=s,a=Error(b(419)),a.stack="",a.digest=i,lu({value:a,source:null,stack:null}),t=ji(l,t,e)}else if(el||ra(l,t,e,!1),i=(e&l.childLanes)!==0,el||i){if(i=Q,i!==null&&(a=T0(i,e),a!==0&&a!==f.retryLane))throw f.retryLane=a,pe(l,a),zl(i,l,a),Nf;Jc(c)||Hn(),t=ji(l,t,e)}else Jc(c)?(t.flags|=192,t.child=l.child,t=null):(l=f.treeContext,K=Jl(c.nextSibling),sl=t,C=!0,Vt=null,Vl=!1,l!==null&&k0(t,l),t=xc(t,a.children),t.flags|=4096);return t}return u?(qt(t),c=a.fallback,u=t.mode,f=l.child,s=f.sibling,a=St(f,{mode:"hidden",children:a.children}),a.subtreeFlags=f.subtreeFlags&65011712,s!==null?c=St(s,c):(c=se(c,u,e,null),c.flags|=2),c.return=t,a.return=t,a.sibling=c,t.child=a,xa(null,a),a=t.child,c=l.child.memoizedState,c===null?c=Qi(e):(u=c.cachePool,u!==null?(f=tl._currentValue,u=u.parent!==f?{parent:f,pool:f}:u):u=I0(),c={baseLanes:c.baseLanes|e,cachePool:u}),a.memoizedState=c,a.childLanes=Zi(l,i,e),t.memoizedState=Li,xa(l.child,a)):(Bt(t),e=l.child,l=e.sibling,e=St(e,{mode:"visible",children:a.children}),e.return=t,e.sibling=null,l!==null&&(i=t.deletions,i===null?(t.deletions=[l],t.flags|=16):i.push(l)),t.child=e,t.memoizedState=null,e)}function xc(l,t){return t=Mn({mode:"visible",children:t},l.mode),t.return=l,l.child=t}function Mn(l,t){return l=Ul(22,l,null,t),l.lanes=0,l}function ji(l,t,e){return ye(t,l.child,null,e),l=xc(t,t.pendingProps.children),l.flags|=2,t.memoizedState=null,l}function Us(l,t,e){l.lanes|=t;var a=l.alternate;a!==null&&(a.lanes|=t),Ec(l.return,t,e)}function Vi(l,t,e,a,u,n){var i=l.memoizedState;i===null?l.memoizedState={isBackwards:t,rendering:null,renderingStartTime:0,last:a,tail:e,tailMode:u,treeForkCount:n}:(i.isBackwards=t,i.rendering=null,i.renderingStartTime=0,i.last=a,i.tail=e,i.tailMode=u,i.treeForkCount=n)}function Kd(l,t,e){var a=t.pendingProps,u=a.revealOrder,n=a.tail;a=a.children;var i=F.current,c=(i&2)!==0;if(c?(i=i&1|2,t.flags|=128):i&=1,Z(F,i),fl(l,t,a,e),a=C?Pa:0,!c&&l!==null&&l.flags&128)l:for(l=t.child;l!==null;){if(l.tag===13)l.memoizedState!==null&&Us(l,e,t);else if(l.tag===19)Us(l,e,t);else if(l.child!==null){l.child.return=l,l=l.child;continue}if(l===t)break l;for(;l.sibling===null;){if(l.return===null||l.return===t)break l;l=l.return}l.sibling.return=l.return,l=l.sibling}switch(u){case"forwards":for(e=t.child,u=null;e!==null;)l=e.alternate,l!==null&&pn(l)===null&&(u=e),e=e.sibling;e=u,e===null?(u=t.child,t.child=null):(u=e.sibling,e.sibling=null),Vi(t,!1,u,e,n,a);break;case"backwards":case"unstable_legacy-backwards":for(e=null,u=t.child,t.child=null;u!==null;){if(l=u.alternate,l!==null&&pn(l)===null){t.child=u;break}l=u.sibling,u.sibling=e,e=u,u=l}Vi(t,!0,e,null,n,a);break;case"together":Vi(t,!1,null,null,void 0,a);break;default:t.memoizedState=null}return t.child}function _t(l,t,e){if(l!==null&&(t.dependencies=l.dependencies),te|=t.lanes,!(e&t.childLanes))if(l!==null){if(ra(l,t,e,!1),(e&t.childLanes)===0)return null}else return null;if(l!==null&&t.child!==l.child)throw Error(b(153));if(t.child!==null){for(l=t.child,e=St(l,l.pendingProps),t.child=e,e.return=t;l.sibling!==null;)l=l.sibling,e=e.sibling=St(l,l.pendingProps),e.return=t;e.sibling=null}return t.child}function xf(l,t){return l.lanes&t?!0:(l=l.dependencies,!!(l!==null&&Sn(l)))}function M1(l,t,e){switch(t.tag){case 3:mn(t,t.stateNode.containerInfo),xt(t,tl,l.memoizedState.cache),he();break;case 27:case 5:fc(t);break;case 4:mn(t,t.stateNode.containerInfo);break;case 10:xt(t,t.type,t.memoizedProps.value);break;case 31:if(t.memoizedState!==null)return t.flags|=128,Oc(t),null;break;case 13:var a=t.memoizedState;if(a!==null)return a.dehydrated!==null?(Bt(t),t.flags|=128,null):e&t.child.childLanes?Vd(l,t,e):(Bt(t),l=_t(l,t,e),l!==null?l.sibling:null);Bt(t);break;case 19:var u=(l.flags&128)!==0;if(a=(e&t.childLanes)!==0,a||(ra(l,t,e,!1),a=(e&t.childLanes)!==0),u){if(a)return Kd(l,t,e);t.flags|=128}if(u=t.memoizedState,u!==null&&(u.rendering=null,u.tail=null,u.lastEffect=null),Z(F,F.current),a)break;return null;case 22:return t.lanes=0,jd(l,t,e,t.pendingProps);case 24:xt(t,tl,l.memoizedState.cache)}return _t(l,t,e)}function Jd(l,t,e){if(l!==null)if(l.memoizedProps!==t.pendingProps)el=!0;else{if(!xf(l,e)&&!(t.flags&128))return el=!1,M1(l,t,e);el=!!(l.flags&131072)}else el=!1,C&&t.flags&1048576&&$0(t,Pa,t.index);switch(t.lanes=0,t.tag){case 16:l:{var a=t.pendingProps;if(l=ce(t.elementType),t.type=l,typeof l=="function")mf(l)?(a=be(l,a),t.tag=1,t=Os(null,t,l,a,e)):(t.tag=0,t=Nc(null,t,l,a,e));else{if(l!=null){var u=l.$$typeof;if(u===Fc){t.tag=11,t=ps(null,t,l,a,e);break l}else if(u===Ic){t.tag=14,t=zs(null,t,l,a,e);break l}}throw t=ic(l)||l,Error(b(306,t,""))}}return t;case 0:return Nc(l,t,t.type,t.pendingProps,e);case 1:return a=t.type,u=be(a,t.pendingProps),Os(l,t,a,u,e);case 3:l:{if(mn(t,t.stateNode.containerInfo),l===null)throw Error(b(387));a=t.pendingProps;var n=t.memoizedState;u=n.element,Ac(l,t),Za(t,a,null,e);var i=t.memoizedState;if(a=i.cache,xt(t,tl,a),a!==n.cache&&pc(t,[tl],e,!0),Qa(),a=i.element,n.isDehydrated)if(n={element:a,isDehydrated:!1,cache:i.cache},t.updateQueue.baseState=n,t.memoizedState=n,t.flags&256){t=Ds(l,t,a,e);break l}else if(a!==u){u=jl(Error(b(424)),t),lu(u),t=Ds(l,t,a,e);break l}else{switch(l=t.stateNode.containerInfo,l.nodeType){case 9:l=l.body;break;default:l=l.nodeName==="HTML"?l.ownerDocument.body:l}for(K=Jl(l.firstChild),sl=t,C=!0,Vt=null,Vl=!0,e=td(t,null,a,e),t.child=e;e;)e.flags=e.flags&-3|4096,e=e.sibling}else{if(he(),a===u){t=_t(l,t,e);break l}fl(l,t,a,e)}t=t.child}return t;case 26:return un(l,t),l===null?(e=Fs(t.type,null,t.pendingProps,null))?t.memoizedState=e:C||(e=t.type,l=t.pendingProps,a=xn(jt.current).createElement(e),a[ol]=t,a[Al]=l,ml(a,e,l),il(a),t.stateNode=a):t.memoizedState=Fs(t.type,l.memoizedProps,t.pendingProps,l.memoizedState),null;case 27:return fc(t),l===null&&C&&(a=t.stateNode=qm(t.type,t.pendingProps,jt.current),sl=t,Vl=!0,u=K,ae(t.type)?(Wc=u,K=Jl(a.firstChild)):K=u),fl(l,t,t.pendingProps.children,e),un(l,t),l===null&&(t.flags|=4194304),t.child;case 5:return l===null&&C&&((u=a=K)&&(a=lv(a,t.type,t.pendingProps,Vl),a!==null?(t.stateNode=a,sl=t,K=Jl(a.firstChild),Vl=!1,u=!0):u=!1),u||Pt(t)),fc(t),u=t.type,n=t.pendingProps,i=l!==null?l.memoizedProps:null,a=n.children,Vc(u,n)?a=null:i!==null&&Vc(u,i)&&(t.flags|=32),t.memoizedState!==null&&(u=Ef(l,t,g1,null,null,e),iu._currentValue=u),un(l,t),fl(l,t,a,e),t.child;case 6:return l===null&&C&&((l=e=K)&&(e=tv(e,t.pendingProps,Vl),e!==null?(t.stateNode=e,sl=t,K=null,l=!0):l=!1),l||Pt(t)),null;case 13:return Vd(l,t,e);case 4:return mn(t,t.stateNode.containerInfo),a=t.pendingProps,l===null?t.child=ye(t,null,a,e):fl(l,t,a,e),t.child;case 11:return ps(l,t,t.type,t.pendingProps,e);case 7:return fl(l,t,t.pendingProps,e),t.child;case 8:return fl(l,t,t.pendingProps.children,e),t.child;case 12:return fl(l,t,t.pendingProps.children,e),t.child;case 10:return a=t.pendingProps,xt(t,t.type,a.value),fl(l,t,a.children,e),t.child;case 9:return u=t.type._context,a=t.pendingProps.children,ve(t),u=dl(u),a=a(u),t.flags|=1,fl(l,t,a,e),t.child;case 14:return zs(l,t,t.type,t.pendingProps,e);case 15:return Zd(l,t,t.type,t.pendingProps,e);case 19:return Kd(l,t,e);case 31:return _1(l,t,e);case 22:return jd(l,t,e,t.pendingProps);case 24:return ve(t),a=dl(tl),l===null?(u=yf(),u===null&&(u=Q,n=vf(),u.pooledCache=n,n.refCount++,n!==null&&(u.pooledCacheLanes|=e),u=n),t.memoizedState={parent:a,cache:u},bf(t),xt(t,tl,u)):(l.lanes&e&&(Ac(l,t),Za(t,null,null,e),Qa()),u=l.memoizedState,n=t.memoizedState,u.parent!==a?(u={parent:a,cache:a},t.memoizedState=u,t.lanes===0&&(t.memoizedState=t.updateQueue.baseState=u),xt(t,tl,a)):(a=n.cache,xt(t,tl,a),a!==u.cache&&pc(t,[tl],e,!0))),fl(l,t,t.pendingProps.children,e),t.child;case 29:throw t.pendingProps}throw Error(b(156,t.tag))}function st(l){l.flags|=4}function Ki(l,t,e,a,u){if((t=(l.mode&32)!==0)&&(t=!1),t){if(l.flags|=16777216,(u&335544128)===u)if(l.stateNode.complete)l.flags|=8192;else if(ym())l.flags|=8192;else throw me=Tn,gf}else l.flags&=-16777217}function Hs(l,t){if(t.type!=="stylesheet"||t.state.loading&4)l.flags&=-16777217;else if(l.flags|=16777216,!Xm(t))if(ym())l.flags|=8192;else throw me=Tn,gf}function Zu(l,t){t!==null&&(l.flags|=4),l.flags&16384&&(t=l.tag!==22?g0():536870912,l.lanes|=t,ia|=t)}function Oa(l,t){if(!C)switch(l.tailMode){case"hidden":t=l.tail;for(var e=null;t!==null;)t.alternate!==null&&(e=t),t=t.sibling;e===null?l.tail=null:e.sibling=null;break;case"collapsed":e=l.tail;for(var a=null;e!==null;)e.alternate!==null&&(a=e),e=e.sibling;a===null?t||l.tail===null?l.tail=null:l.tail.sibling=null:a.sibling=null}}function V(l){var t=l.alternate!==null&&l.alternate.child===l.child,e=0,a=0;if(t)for(var u=l.child;u!==null;)e|=u.lanes|u.childLanes,a|=u.subtreeFlags&65011712,a|=u.flags&65011712,u.return=l,u=u.sibling;else for(u=l.child;u!==null;)e|=u.lanes|u.childLanes,a|=u.subtreeFlags,a|=u.flags,u.return=l,u=u.sibling;return l.subtreeFlags|=a,l.childLanes=e,t}function O1(l,t,e){var a=t.pendingProps;switch(hf(t),t.tag){case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return V(t),null;case 1:return V(t),null;case 3:return e=t.stateNode,a=null,l!==null&&(a=l.memoizedState.cache),t.memoizedState.cache!==a&&(t.flags|=2048),Tt(tl),la(),e.pendingContext&&(e.context=e.pendingContext,e.pendingContext=null),(l===null||l.child===null)&&(Re(t)?st(t):l===null||l.memoizedState.isDehydrated&&!(t.flags&256)||(t.flags|=1024,qi())),V(t),null;case 26:var u=t.type,n=t.memoizedState;return l===null?(st(t),n!==null?(V(t),Hs(t,n)):(V(t),Ki(t,u,null,a,e))):n?n!==l.memoizedState?(st(t),V(t),Hs(t,n)):(V(t),t.flags&=-16777217):(l=l.memoizedProps,l!==a&&st(t),V(t),Ki(t,u,l,a,e)),null;case 27:if(rn(t),e=jt.current,u=t.type,l!==null&&t.stateNode!=null)l.memoizedProps!==a&&st(t);else{if(!a){if(t.stateNode===null)throw Error(b(166));return V(t),null}l=ut.current,Re(t)?ns(t,l):(l=qm(u,a,e),t.stateNode=l,st(t))}return V(t),null;case 5:if(rn(t),u=t.type,l!==null&&t.stateNode!=null)l.memoizedProps!==a&&st(t);else{if(!a){if(t.stateNode===null)throw Error(b(166));return V(t),null}if(n=ut.current,Re(t))ns(t,n);else{var i=xn(jt.current);switch(n){case 1:n=i.createElementNS("http://www.w3.org/2000/svg",u);break;case 2:n=i.createElementNS("http://www.w3.org/1998/Math/MathML",u);break;default:switch(u){case"svg":n=i.createElementNS("http://www.w3.org/2000/svg",u);break;case"math":n=i.createElementNS("http://www.w3.org/1998/Math/MathML",u);break;case"script":n=i.createElement("div"),n.innerHTML="<script><\\/script>",n=n.removeChild(n.firstChild);break;case"select":n=typeof a.is=="string"?i.createElement("select",{is:a.is}):i.createElement("select"),a.multiple?n.multiple=!0:a.size&&(n.size=a.size);break;default:n=typeof a.is=="string"?i.createElement(u,{is:a.is}):i.createElement(u)}}n[ol]=t,n[Al]=a;l:for(i=t.child;i!==null;){if(i.tag===5||i.tag===6)n.appendChild(i.stateNode);else if(i.tag!==4&&i.tag!==27&&i.child!==null){i.child.return=i,i=i.child;continue}if(i===t)break l;for(;i.sibling===null;){if(i.return===null||i.return===t)break l;i=i.return}i.sibling.return=i.return,i=i.sibling}t.stateNode=n;l:switch(ml(n,u,a),u){case"button":case"input":case"select":case"textarea":a=!!a.autoFocus;break l;case"img":a=!0;break l;default:a=!1}a&&st(t)}}return V(t),Ki(t,t.type,l===null?null:l.memoizedProps,t.pendingProps,e),null;case 6:if(l&&t.stateNode!=null)l.memoizedProps!==a&&st(t);else{if(typeof a!="string"&&t.stateNode===null)throw Error(b(166));if(l=jt.current,Re(t)){if(l=t.stateNode,e=t.memoizedProps,a=null,u=sl,u!==null)switch(u.tag){case 27:case 5:a=u.memoizedProps}l[ol]=t,l=!!(l.nodeValue===e||a!==null&&a.suppressHydrationWarning===!0||Cm(l.nodeValue,e)),l||Pt(t,!0)}else l=xn(l).createTextNode(a),l[ol]=t,t.stateNode=l}return V(t),null;case 31:if(e=t.memoizedState,l===null||l.memoizedState!==null){if(a=Re(t),e!==null){if(l===null){if(!a)throw Error(b(318));if(l=t.memoizedState,l=l!==null?l.dehydrated:null,!l)throw Error(b(557));l[ol]=t}else he(),!(t.flags&128)&&(t.memoizedState=null),t.flags|=4;V(t),l=!1}else e=qi(),l!==null&&l.memoizedState!==null&&(l.memoizedState.hydrationErrors=e),l=!0;if(!l)return t.flags&256?(Dl(t),t):(Dl(t),null);if(t.flags&128)throw Error(b(558))}return V(t),null;case 13:if(a=t.memoizedState,l===null||l.memoizedState!==null&&l.memoizedState.dehydrated!==null){if(u=Re(t),a!==null&&a.dehydrated!==null){if(l===null){if(!u)throw Error(b(318));if(u=t.memoizedState,u=u!==null?u.dehydrated:null,!u)throw Error(b(317));u[ol]=t}else he(),!(t.flags&128)&&(t.memoizedState=null),t.flags|=4;V(t),u=!1}else u=qi(),l!==null&&l.memoizedState!==null&&(l.memoizedState.hydrationErrors=u),u=!0;if(!u)return t.flags&256?(Dl(t),t):(Dl(t),null)}return Dl(t),t.flags&128?(t.lanes=e,t):(e=a!==null,l=l!==null&&l.memoizedState!==null,e&&(a=t.child,u=null,a.alternate!==null&&a.alternate.memoizedState!==null&&a.alternate.memoizedState.cachePool!==null&&(u=a.alternate.memoizedState.cachePool.pool),n=null,a.memoizedState!==null&&a.memoizedState.cachePool!==null&&(n=a.memoizedState.cachePool.pool),n!==u&&(a.flags|=2048)),e!==l&&e&&(t.child.flags|=8192),Zu(t,t.updateQueue),V(t),null);case 4:return la(),l===null&&Qf(t.stateNode.containerInfo),V(t),null;case 10:return Tt(t.type),V(t),null;case 19:if(cl(F),a=t.memoizedState,a===null)return V(t),null;if(u=(t.flags&128)!==0,n=a.rendering,n===null)if(u)Oa(a,!1);else{if(k!==0||l!==null&&l.flags&128)for(l=t.child;l!==null;){if(n=pn(l),n!==null){for(t.flags|=128,Oa(a,!1),l=n.updateQueue,t.updateQueue=l,Zu(t,l),t.subtreeFlags=0,l=e,e=t.child;e!==null;)w0(e,l),e=e.sibling;return Z(F,F.current&1|2),C&&ht(t,a.treeForkCount),t.child}l=l.sibling}a.tail!==null&&Rl()>Dn&&(t.flags|=128,u=!0,Oa(a,!1),t.lanes=4194304)}else{if(!u)if(l=pn(n),l!==null){if(t.flags|=128,u=!0,l=l.updateQueue,t.updateQueue=l,Zu(t,l),Oa(a,!0),a.tail===null&&a.tailMode==="hidden"&&!n.alternate&&!C)return V(t),null}else 2*Rl()-a.renderingStartTime>Dn&&e!==536870912&&(t.flags|=128,u=!0,Oa(a,!1),t.lanes=4194304);a.isBackwards?(n.sibling=t.child,t.child=n):(l=a.last,l!==null?l.sibling=n:t.child=n,a.last=n)}return a.tail!==null?(l=a.tail,a.rendering=l,a.tail=l.sibling,a.renderingStartTime=Rl(),l.sibling=null,e=F.current,Z(F,u?e&1|2:e&1),C&&ht(t,a.treeForkCount),l):(V(t),null);case 22:case 23:return Dl(t),Sf(),a=t.memoizedState!==null,l!==null?l.memoizedState!==null!==a&&(t.flags|=8192):a&&(t.flags|=8192),a?e&536870912&&!(t.flags&128)&&(V(t),t.subtreeFlags&6&&(t.flags|=8192)):V(t),e=t.updateQueue,e!==null&&Zu(t,e.retryQueue),e=null,l!==null&&l.memoizedState!==null&&l.memoizedState.cachePool!==null&&(e=l.memoizedState.cachePool.pool),a=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(a=t.memoizedState.cachePool.pool),a!==e&&(t.flags|=2048),l!==null&&cl(de),null;case 24:return e=null,l!==null&&(e=l.memoizedState.cache),t.memoizedState.cache!==e&&(t.flags|=2048),Tt(tl),V(t),null;case 25:return null;case 30:return null}throw Error(b(156,t.tag))}function D1(l,t){switch(hf(t),t.tag){case 1:return l=t.flags,l&65536?(t.flags=l&-65537|128,t):null;case 3:return Tt(tl),la(),l=t.flags,l&65536&&!(l&128)?(t.flags=l&-65537|128,t):null;case 26:case 27:case 5:return rn(t),null;case 31:if(t.memoizedState!==null){if(Dl(t),t.alternate===null)throw Error(b(340));he()}return l=t.flags,l&65536?(t.flags=l&-65537|128,t):null;case 13:if(Dl(t),l=t.memoizedState,l!==null&&l.dehydrated!==null){if(t.alternate===null)throw Error(b(340));he()}return l=t.flags,l&65536?(t.flags=l&-65537|128,t):null;case 19:return cl(F),null;case 4:return la(),null;case 10:return Tt(t.type),null;case 22:case 23:return Dl(t),Sf(),l!==null&&cl(de),l=t.flags,l&65536?(t.flags=l&-65537|128,t):null;case 24:return Tt(tl),null;case 25:return null;default:return null}}function wd(l,t){switch(hf(t),t.tag){case 3:Tt(tl),la();break;case 26:case 27:case 5:rn(t);break;case 4:la();break;case 31:t.memoizedState!==null&&Dl(t);break;case 13:Dl(t);break;case 19:cl(F);break;case 10:Tt(t.type);break;case 22:case 23:Dl(t),Sf(),l!==null&&cl(de);break;case 24:Tt(tl)}}function gu(l,t){try{var e=t.updateQueue,a=e!==null?e.lastEffect:null;if(a!==null){var u=a.next;e=u;do{if((e.tag&l)===l){a=void 0;var n=e.create,i=e.inst;a=n(),i.destroy=a}e=e.next}while(e!==u)}}catch(c){G(t,t.return,c)}}function le(l,t,e){try{var a=t.updateQueue,u=a!==null?a.lastEffect:null;if(u!==null){var n=u.next;a=n;do{if((a.tag&l)===l){var i=a.inst,c=i.destroy;if(c!==void 0){i.destroy=void 0,u=t;var f=e,s=c;try{s()}catch(v){G(u,f,v)}}}a=a.next}while(a!==n)}}catch(v){G(t,t.return,v)}}function Wd(l){var t=l.updateQueue;if(t!==null){var e=l.stateNode;try{ad(t,e)}catch(a){G(l,l.return,a)}}}function $d(l,t,e){e.props=be(l.type,l.memoizedProps),e.state=l.memoizedState;try{e.componentWillUnmount()}catch(a){G(l,t,a)}}function Va(l,t){try{var e=l.ref;if(e!==null){switch(l.tag){case 26:case 27:case 5:var a=l.stateNode;break;case 30:a=l.stateNode;break;default:a=l.stateNode}typeof e=="function"?l.refCleanup=e(a):e.current=a}}catch(u){G(l,t,u)}}function at(l,t){var e=l.ref,a=l.refCleanup;if(e!==null)if(typeof a=="function")try{a()}catch(u){G(l,t,u)}finally{l.refCleanup=null,l=l.alternate,l!=null&&(l.refCleanup=null)}else if(typeof e=="function")try{e(null)}catch(u){G(l,t,u)}else e.current=null}function kd(l){var t=l.type,e=l.memoizedProps,a=l.stateNode;try{l:switch(t){case"button":case"input":case"select":case"textarea":e.autoFocus&&a.focus();break l;case"img":e.src?a.src=e.src:e.srcSet&&(a.srcset=e.srcSet)}}catch(u){G(l,l.return,u)}}function Ji(l,t,e){try{var a=l.stateNode;W1(a,l.type,e,t),a[Al]=t}catch(u){G(l,l.return,u)}}function Fd(l){return l.tag===5||l.tag===3||l.tag===26||l.tag===27&&ae(l.type)||l.tag===4}function wi(l){l:for(;;){for(;l.sibling===null;){if(l.return===null||Fd(l.return))return null;l=l.return}for(l.sibling.return=l.return,l=l.sibling;l.tag!==5&&l.tag!==6&&l.tag!==18;){if(l.tag===27&&ae(l.type)||l.flags&2||l.child===null||l.tag===4)continue l;l.child.return=l,l=l.child}if(!(l.flags&2))return l.stateNode}}function Bc(l,t,e){var a=l.tag;if(a===5||a===6)l=l.stateNode,t?(e.nodeType===9?e.body:e.nodeName==="HTML"?e.ownerDocument.body:e).insertBefore(l,t):(t=e.nodeType===9?e.body:e.nodeName==="HTML"?e.ownerDocument.body:e,t.appendChild(l),e=e._reactRootContainer,e!=null||t.onclick!==null||(t.onclick=gt));else if(a!==4&&(a===27&&ae(l.type)&&(e=l.stateNode,t=null),l=l.child,l!==null))for(Bc(l,t,e),l=l.sibling;l!==null;)Bc(l,t,e),l=l.sibling}function On(l,t,e){var a=l.tag;if(a===5||a===6)l=l.stateNode,t?e.insertBefore(l,t):e.appendChild(l);else if(a!==4&&(a===27&&ae(l.type)&&(e=l.stateNode),l=l.child,l!==null))for(On(l,t,e),l=l.sibling;l!==null;)On(l,t,e),l=l.sibling}function Id(l){var t=l.stateNode,e=l.memoizedProps;try{for(var a=l.type,u=t.attributes;u.length;)t.removeAttributeNode(u[0]);ml(t,a,e),t[ol]=l,t[Al]=e}catch(n){G(l,l.return,n)}}var vt=!1,ll=!1,Wi=!1,Rs=typeof WeakSet=="function"?WeakSet:Set,nl=null;function U1(l,t){if(l=l.containerInfo,Zc=Gn,l=X0(l),of(l)){if("selectionStart"in l)var e={start:l.selectionStart,end:l.selectionEnd};else l:{e=(e=l.ownerDocument)&&e.defaultView||window;var a=e.getSelection&&e.getSelection();if(a&&a.rangeCount!==0){e=a.anchorNode;var u=a.anchorOffset,n=a.focusNode;a=a.focusOffset;try{e.nodeType,n.nodeType}catch{e=null;break l}var i=0,c=-1,f=-1,s=0,v=0,y=l,m=null;t:for(;;){for(var h;y!==e||u!==0&&y.nodeType!==3||(c=i+u),y!==n||a!==0&&y.nodeType!==3||(f=i+a),y.nodeType===3&&(i+=y.nodeValue.length),(h=y.firstChild)!==null;)m=y,y=h;for(;;){if(y===l)break t;if(m===e&&++s===u&&(c=i),m===n&&++v===a&&(f=i),(h=y.nextSibling)!==null)break;y=m,m=y.parentNode}y=h}e=c===-1||f===-1?null:{start:c,end:f}}else e=null}e=e||{start:0,end:0}}else e=null;for(jc={focusedElem:l,selectionRange:e},Gn=!1,nl=t;nl!==null;)if(t=nl,l=t.child,(t.subtreeFlags&1028)!==0&&l!==null)l.return=t,nl=l;else for(;nl!==null;){switch(t=nl,n=t.alternate,l=t.flags,t.tag){case 0:if(l&4&&(l=t.updateQueue,l=l!==null?l.events:null,l!==null))for(e=0;e<l.length;e++)u=l[e],u.ref.impl=u.nextImpl;break;case 11:case 15:break;case 1:if(l&1024&&n!==null){l=void 0,e=t,u=n.memoizedProps,n=n.memoizedState,a=e.stateNode;try{var S=be(e.type,u);l=a.getSnapshotBeforeUpdate(S,n),a.__reactInternalSnapshotBeforeUpdate=l}catch(E){G(e,e.return,E)}}break;case 3:if(l&1024){if(l=t.stateNode.containerInfo,e=l.nodeType,e===9)Kc(l);else if(e===1)switch(l.nodeName){case"HEAD":case"HTML":case"BODY":Kc(l);break;default:l.textContent=""}}break;case 5:case 26:case 27:case 6:case 4:case 17:break;default:if(l&1024)throw Error(b(163))}if(l=t.sibling,l!==null){l.return=t.return,nl=l;break}nl=t.return}}function Pd(l,t,e){var a=e.flags;switch(e.tag){case 0:case 11:case 15:mt(l,e),a&4&&gu(5,e);break;case 1:if(mt(l,e),a&4)if(l=e.stateNode,t===null)try{l.componentDidMount()}catch(i){G(e,e.return,i)}else{var u=be(e.type,t.memoizedProps);t=t.memoizedState;try{l.componentDidUpdate(u,t,l.__reactInternalSnapshotBeforeUpdate)}catch(i){G(e,e.return,i)}}a&64&&Wd(e),a&512&&Va(e,e.return);break;case 3:if(mt(l,e),a&64&&(l=e.updateQueue,l!==null)){if(t=null,e.child!==null)switch(e.child.tag){case 27:case 5:t=e.child.stateNode;break;case 1:t=e.child.stateNode}try{ad(l,t)}catch(i){G(e,e.return,i)}}break;case 27:t===null&&a&4&&Id(e);case 26:case 5:mt(l,e),t===null&&a&4&&kd(e),a&512&&Va(e,e.return);break;case 12:mt(l,e);break;case 31:mt(l,e),a&4&&em(l,e);break;case 13:mt(l,e),a&4&&am(l,e),a&64&&(l=e.memoizedState,l!==null&&(l=l.dehydrated,l!==null&&(e=G1.bind(null,e),ev(l,e))));break;case 22:if(a=e.memoizedState!==null||vt,!a){t=t!==null&&t.memoizedState!==null||ll,u=vt;var n=ll;vt=a,(ll=t)&&!n?rt(l,e,(e.subtreeFlags&8772)!==0):mt(l,e),vt=u,ll=n}break;case 30:break;default:mt(l,e)}}function lm(l){var t=l.alternate;t!==null&&(l.alternate=null,lm(t)),l.child=null,l.deletions=null,l.sibling=null,l.tag===5&&(t=l.stateNode,t!==null&&ef(t)),l.stateNode=null,l.return=null,l.dependencies=null,l.memoizedProps=null,l.memoizedState=null,l.pendingProps=null,l.stateNode=null,l.updateQueue=null}var W=null,El=!1;function dt(l,t,e){for(e=e.child;e!==null;)tm(l,t,e),e=e.sibling}function tm(l,t,e){if(Cl&&typeof Cl.onCommitFiberUnmount=="function")try{Cl.onCommitFiberUnmount(su,e)}catch{}switch(e.tag){case 26:ll||at(e,t),dt(l,t,e),e.memoizedState?e.memoizedState.count--:e.stateNode&&(e=e.stateNode,e.parentNode.removeChild(e));break;case 27:ll||at(e,t);var a=W,u=El;ae(e.type)&&(W=e.stateNode,El=!1),dt(l,t,e),Wa(e.stateNode),W=a,El=u;break;case 5:ll||at(e,t);case 6:if(a=W,u=El,W=null,dt(l,t,e),W=a,El=u,W!==null)if(El)try{(W.nodeType===9?W.body:W.nodeName==="HTML"?W.ownerDocument.body:W).removeChild(e.stateNode)}catch(n){G(e,t,n)}else try{W.removeChild(e.stateNode)}catch(n){G(e,t,n)}break;case 18:W!==null&&(El?(l=W,Js(l.nodeType===9?l.body:l.nodeName==="HTML"?l.ownerDocument.body:l,e.stateNode),sa(l)):Js(W,e.stateNode));break;case 4:a=W,u=El,W=e.stateNode.containerInfo,El=!0,dt(l,t,e),W=a,El=u;break;case 0:case 11:case 14:case 15:le(2,e,t),ll||le(4,e,t),dt(l,t,e);break;case 1:ll||(at(e,t),a=e.stateNode,typeof a.componentWillUnmount=="function"&&$d(e,t,a)),dt(l,t,e);break;case 21:dt(l,t,e);break;case 22:ll=(a=ll)||e.memoizedState!==null,dt(l,t,e),ll=a;break;default:dt(l,t,e)}}function em(l,t){if(t.memoizedState===null&&(l=t.alternate,l!==null&&(l=l.memoizedState,l!==null))){l=l.dehydrated;try{sa(l)}catch(e){G(t,t.return,e)}}}function am(l,t){if(t.memoizedState===null&&(l=t.alternate,l!==null&&(l=l.memoizedState,l!==null&&(l=l.dehydrated,l!==null))))try{sa(l)}catch(e){G(t,t.return,e)}}function H1(l){switch(l.tag){case 31:case 13:case 19:var t=l.stateNode;return t===null&&(t=l.stateNode=new Rs),t;case 22:return l=l.stateNode,t=l._retryCache,t===null&&(t=l._retryCache=new Rs),t;default:throw Error(b(435,l.tag))}}function ju(l,t){var e=H1(l);t.forEach(function(a){if(!e.has(a)){e.add(a);var u=X1.bind(null,l,a);a.then(u,u)}})}function Sl(l,t){var e=t.deletions;if(e!==null)for(var a=0;a<e.length;a++){var u=e[a],n=l,i=t,c=i;l:for(;c!==null;){switch(c.tag){case 27:if(ae(c.type)){W=c.stateNode,El=!1;break l}break;case 5:W=c.stateNode,El=!1;break l;case 3:case 4:W=c.stateNode.containerInfo,El=!0;break l}c=c.return}if(W===null)throw Error(b(160));tm(n,i,u),W=null,El=!1,n=u.alternate,n!==null&&(n.return=null),u.return=null}if(t.subtreeFlags&13886)for(t=t.child;t!==null;)um(t,l),t=t.sibling}var kl=null;function um(l,t){var e=l.alternate,a=l.flags;switch(l.tag){case 0:case 11:case 14:case 15:Sl(t,l),Tl(l),a&4&&(le(3,l,l.return),gu(3,l),le(5,l,l.return));break;case 1:Sl(t,l),Tl(l),a&512&&(ll||e===null||at(e,e.return)),a&64&&vt&&(l=l.updateQueue,l!==null&&(a=l.callbacks,a!==null&&(e=l.shared.hiddenCallbacks,l.shared.hiddenCallbacks=e===null?a:e.concat(a))));break;case 26:var u=kl;if(Sl(t,l),Tl(l),a&512&&(ll||e===null||at(e,e.return)),a&4){var n=e!==null?e.memoizedState:null;if(a=l.memoizedState,e===null)if(a===null)if(l.stateNode===null){l:{a=l.type,e=l.memoizedProps,u=u.ownerDocument||u;t:switch(a){case"title":n=u.getElementsByTagName("title")[0],(!n||n[ru]||n[ol]||n.namespaceURI==="http://www.w3.org/2000/svg"||n.hasAttribute("itemprop"))&&(n=u.createElement(a),u.head.insertBefore(n,u.querySelector("head > title"))),ml(n,a,e),n[ol]=l,il(n),a=n;break l;case"link":var i=Ps("link","href",u).get(a+(e.href||""));if(i){for(var c=0;c<i.length;c++)if(n=i[c],n.getAttribute("href")===(e.href==null||e.href===""?null:e.href)&&n.getAttribute("rel")===(e.rel==null?null:e.rel)&&n.getAttribute("title")===(e.title==null?null:e.title)&&n.getAttribute("crossorigin")===(e.crossOrigin==null?null:e.crossOrigin)){i.splice(c,1);break t}}n=u.createElement(a),ml(n,a,e),u.head.appendChild(n);break;case"meta":if(i=Ps("meta","content",u).get(a+(e.content||""))){for(c=0;c<i.length;c++)if(n=i[c],n.getAttribute("content")===(e.content==null?null:""+e.content)&&n.getAttribute("name")===(e.name==null?null:e.name)&&n.getAttribute("property")===(e.property==null?null:e.property)&&n.getAttribute("http-equiv")===(e.httpEquiv==null?null:e.httpEquiv)&&n.getAttribute("charset")===(e.charSet==null?null:e.charSet)){i.splice(c,1);break t}}n=u.createElement(a),ml(n,a,e),u.head.appendChild(n);break;default:throw Error(b(468,a))}n[ol]=l,il(n),a=n}l.stateNode=a}else l0(u,l.type,l.stateNode);else l.stateNode=Is(u,a,l.memoizedProps);else n!==a?(n===null?e.stateNode!==null&&(e=e.stateNode,e.parentNode.removeChild(e)):n.count--,a===null?l0(u,l.type,l.stateNode):Is(u,a,l.memoizedProps)):a===null&&l.stateNode!==null&&Ji(l,l.memoizedProps,e.memoizedProps)}break;case 27:Sl(t,l),Tl(l),a&512&&(ll||e===null||at(e,e.return)),e!==null&&a&4&&Ji(l,l.memoizedProps,e.memoizedProps);break;case 5:if(Sl(t,l),Tl(l),a&512&&(ll||e===null||at(e,e.return)),l.flags&32){u=l.stateNode;try{ea(u,"")}catch(S){G(l,l.return,S)}}a&4&&l.stateNode!=null&&(u=l.memoizedProps,Ji(l,u,e!==null?e.memoizedProps:u)),a&1024&&(Wi=!0);break;case 6:if(Sl(t,l),Tl(l),a&4){if(l.stateNode===null)throw Error(b(162));a=l.memoizedProps,e=l.stateNode;try{e.nodeValue=a}catch(S){G(l,l.return,S)}}break;case 3:if(fn=null,u=kl,kl=Bn(t.containerInfo),Sl(t,l),kl=u,Tl(l),a&4&&e!==null&&e.memoizedState.isDehydrated)try{sa(t.containerInfo)}catch(S){G(l,l.return,S)}Wi&&(Wi=!1,nm(l));break;case 4:a=kl,kl=Bn(l.stateNode.containerInfo),Sl(t,l),Tl(l),kl=a;break;case 12:Sl(t,l),Tl(l);break;case 31:Sl(t,l),Tl(l),a&4&&(a=l.updateQueue,a!==null&&(l.updateQueue=null,ju(l,a)));break;case 13:Sl(t,l),Tl(l),l.child.flags&8192&&l.memoizedState!==null!=(e!==null&&e.memoizedState!==null)&&(Fn=Rl()),a&4&&(a=l.updateQueue,a!==null&&(l.updateQueue=null,ju(l,a)));break;case 22:u=l.memoizedState!==null;var f=e!==null&&e.memoizedState!==null,s=vt,v=ll;if(vt=s||u,ll=v||f,Sl(t,l),ll=v,vt=s,Tl(l),a&8192)l:for(t=l.stateNode,t._visibility=u?t._visibility&-2:t._visibility|1,u&&(e===null||f||vt||ll||fe(l)),e=null,t=l;;){if(t.tag===5||t.tag===26){if(e===null){f=e=t;try{if(n=f.stateNode,u)i=n.style,typeof i.setProperty=="function"?i.setProperty("display","none","important"):i.display="none";else{c=f.stateNode;var y=f.memoizedProps.style,m=y!=null&&y.hasOwnProperty("display")?y.display:null;c.style.display=m==null||typeof m=="boolean"?"":(""+m).trim()}}catch(S){G(f,f.return,S)}}}else if(t.tag===6){if(e===null){f=t;try{f.stateNode.nodeValue=u?"":f.memoizedProps}catch(S){G(f,f.return,S)}}}else if(t.tag===18){if(e===null){f=t;try{var h=f.stateNode;u?ws(h,!0):ws(f.stateNode,!1)}catch(S){G(f,f.return,S)}}}else if((t.tag!==22&&t.tag!==23||t.memoizedState===null||t===l)&&t.child!==null){t.child.return=t,t=t.child;continue}if(t===l)break l;for(;t.sibling===null;){if(t.return===null||t.return===l)break l;e===t&&(e=null),t=t.return}e===t&&(e=null),t.sibling.return=t.return,t=t.sibling}a&4&&(a=l.updateQueue,a!==null&&(e=a.retryQueue,e!==null&&(a.retryQueue=null,ju(l,e))));break;case 19:Sl(t,l),Tl(l),a&4&&(a=l.updateQueue,a!==null&&(l.updateQueue=null,ju(l,a)));break;case 30:break;case 21:break;default:Sl(t,l),Tl(l)}}function Tl(l){var t=l.flags;if(t&2){try{for(var e,a=l.return;a!==null;){if(Fd(a)){e=a;break}a=a.return}if(e==null)throw Error(b(160));switch(e.tag){case 27:var u=e.stateNode,n=wi(l);On(l,n,u);break;case 5:var i=e.stateNode;e.flags&32&&(ea(i,""),e.flags&=-33);var c=wi(l);On(l,c,i);break;case 3:case 4:var f=e.stateNode.containerInfo,s=wi(l);Bc(l,s,f);break;default:throw Error(b(161))}}catch(v){G(l,l.return,v)}l.flags&=-3}t&4096&&(l.flags&=-4097)}function nm(l){if(l.subtreeFlags&1024)for(l=l.child;l!==null;){var t=l;nm(t),t.tag===5&&t.flags&1024&&t.stateNode.reset(),l=l.sibling}}function mt(l,t){if(t.subtreeFlags&8772)for(t=t.child;t!==null;)Pd(l,t.alternate,t),t=t.sibling}function fe(l){for(l=l.child;l!==null;){var t=l;switch(t.tag){case 0:case 11:case 14:case 15:le(4,t,t.return),fe(t);break;case 1:at(t,t.return);var e=t.stateNode;typeof e.componentWillUnmount=="function"&&$d(t,t.return,e),fe(t);break;case 27:Wa(t.stateNode);case 26:case 5:at(t,t.return),fe(t);break;case 22:t.memoizedState===null&&fe(t);break;case 30:fe(t);break;default:fe(t)}l=l.sibling}}function rt(l,t,e){for(e=e&&(t.subtreeFlags&8772)!==0,t=t.child;t!==null;){var a=t.alternate,u=l,n=t,i=n.flags;switch(n.tag){case 0:case 11:case 15:rt(u,n,e),gu(4,n);break;case 1:if(rt(u,n,e),a=n,u=a.stateNode,typeof u.componentDidMount=="function")try{u.componentDidMount()}catch(s){G(a,a.return,s)}if(a=n,u=a.updateQueue,u!==null){var c=a.stateNode;try{var f=u.shared.hiddenCallbacks;if(f!==null)for(u.shared.hiddenCallbacks=null,u=0;u<f.length;u++)ed(f[u],c)}catch(s){G(a,a.return,s)}}e&&i&64&&Wd(n),Va(n,n.return);break;case 27:Id(n);case 26:case 5:rt(u,n,e),e&&a===null&&i&4&&kd(n),Va(n,n.return);break;case 12:rt(u,n,e);break;case 31:rt(u,n,e),e&&i&4&&em(u,n);break;case 13:rt(u,n,e),e&&i&4&&am(u,n);break;case 22:n.memoizedState===null&&rt(u,n,e),Va(n,n.return);break;case 30:break;default:rt(u,n,e)}t=t.sibling}}function Bf(l,t){var e=null;l!==null&&l.memoizedState!==null&&l.memoizedState.cachePool!==null&&(e=l.memoizedState.cachePool.pool),l=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(l=t.memoizedState.cachePool.pool),l!==e&&(l!=null&&l.refCount++,e!=null&&vu(e))}function qf(l,t){l=null,t.alternate!==null&&(l=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==l&&(t.refCount++,l!=null&&vu(l))}function $l(l,t,e,a){if(t.subtreeFlags&10256)for(t=t.child;t!==null;)im(l,t,e,a),t=t.sibling}function im(l,t,e,a){var u=t.flags;switch(t.tag){case 0:case 11:case 15:$l(l,t,e,a),u&2048&&gu(9,t);break;case 1:$l(l,t,e,a);break;case 3:$l(l,t,e,a),u&2048&&(l=null,t.alternate!==null&&(l=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==l&&(t.refCount++,l!=null&&vu(l)));break;case 12:if(u&2048){$l(l,t,e,a),l=t.stateNode;try{var n=t.memoizedProps,i=n.id,c=n.onPostCommit;typeof c=="function"&&c(i,t.alternate===null?"mount":"update",l.passiveEffectDuration,-0)}catch(f){G(t,t.return,f)}}else $l(l,t,e,a);break;case 31:$l(l,t,e,a);break;case 13:$l(l,t,e,a);break;case 23:break;case 22:n=t.stateNode,i=t.alternate,t.memoizedState!==null?n._visibility&2?$l(l,t,e,a):Ka(l,t):n._visibility&2?$l(l,t,e,a):(n._visibility|=2,Ne(l,t,e,a,(t.subtreeFlags&10256)!==0||!1)),u&2048&&Bf(i,t);break;case 24:$l(l,t,e,a),u&2048&&qf(t.alternate,t);break;default:$l(l,t,e,a)}}function Ne(l,t,e,a,u){for(u=u&&((t.subtreeFlags&10256)!==0||!1),t=t.child;t!==null;){var n=l,i=t,c=e,f=a,s=i.flags;switch(i.tag){case 0:case 11:case 15:Ne(n,i,c,f,u),gu(8,i);break;case 23:break;case 22:var v=i.stateNode;i.memoizedState!==null?v._visibility&2?Ne(n,i,c,f,u):Ka(n,i):(v._visibility|=2,Ne(n,i,c,f,u)),u&&s&2048&&Bf(i.alternate,i);break;case 24:Ne(n,i,c,f,u),u&&s&2048&&qf(i.alternate,i);break;default:Ne(n,i,c,f,u)}t=t.sibling}}function Ka(l,t){if(t.subtreeFlags&10256)for(t=t.child;t!==null;){var e=l,a=t,u=a.flags;switch(a.tag){case 22:Ka(e,a),u&2048&&Bf(a.alternate,a);break;case 24:Ka(e,a),u&2048&&qf(a.alternate,a);break;default:Ka(e,a)}t=t.sibling}}var Ba=8192;function Ce(l,t,e){if(l.subtreeFlags&Ba)for(l=l.child;l!==null;)cm(l,t,e),l=l.sibling}function cm(l,t,e){switch(l.tag){case 26:Ce(l,t,e),l.flags&Ba&&l.memoizedState!==null&&hv(e,kl,l.memoizedState,l.memoizedProps);break;case 5:Ce(l,t,e);break;case 3:case 4:var a=kl;kl=Bn(l.stateNode.containerInfo),Ce(l,t,e),kl=a;break;case 22:l.memoizedState===null&&(a=l.alternate,a!==null&&a.memoizedState!==null?(a=Ba,Ba=16777216,Ce(l,t,e),Ba=a):Ce(l,t,e));break;default:Ce(l,t,e)}}function fm(l){var t=l.alternate;if(t!==null&&(l=t.child,l!==null)){t.child=null;do t=l.sibling,l.sibling=null,l=t;while(l!==null)}}function Da(l){var t=l.deletions;if(l.flags&16){if(t!==null)for(var e=0;e<t.length;e++){var a=t[e];nl=a,sm(a,l)}fm(l)}if(l.subtreeFlags&10256)for(l=l.child;l!==null;)om(l),l=l.sibling}function om(l){switch(l.tag){case 0:case 11:case 15:Da(l),l.flags&2048&&le(9,l,l.return);break;case 3:Da(l);break;case 12:Da(l);break;case 22:var t=l.stateNode;l.memoizedState!==null&&t._visibility&2&&(l.return===null||l.return.tag!==13)?(t._visibility&=-3,nn(l)):Da(l);break;default:Da(l)}}function nn(l){var t=l.deletions;if(l.flags&16){if(t!==null)for(var e=0;e<t.length;e++){var a=t[e];nl=a,sm(a,l)}fm(l)}for(l=l.child;l!==null;){switch(t=l,t.tag){case 0:case 11:case 15:le(8,t,t.return),nn(t);break;case 22:e=t.stateNode,e._visibility&2&&(e._visibility&=-3,nn(t));break;default:nn(t)}l=l.sibling}}function sm(l,t){for(;nl!==null;){var e=nl;switch(e.tag){case 0:case 11:case 15:le(8,e,t);break;case 23:case 22:if(e.memoizedState!==null&&e.memoizedState.cachePool!==null){var a=e.memoizedState.cachePool.pool;a!=null&&a.refCount++}break;case 24:vu(e.memoizedState.cache)}if(a=e.child,a!==null)a.return=e,nl=a;else l:for(e=l;nl!==null;){a=nl;var u=a.sibling,n=a.return;if(lm(a),a===e){nl=null;break l}if(u!==null){u.return=n,nl=u;break l}nl=n}}}var R1={getCacheForType:function(l){var t=dl(tl),e=t.data.get(l);return e===void 0&&(e=l(),t.data.set(l,e)),e},cacheSignal:function(){return dl(tl).controller.signal}},C1=typeof WeakMap=="function"?WeakMap:Map,B=0,Q=null,U=null,R=0,Y=0,Ol=null,Lt=!1,va=!1,Yf=!1,Mt=0,k=0,te=0,re=0,Gf=0,Hl=0,ia=0,Ja=null,pl=null,qc=!1,Fn=0,dm=0,Dn=1/0,Un=null,wt=null,al=0,Wt=null,ca=null,Et=0,Yc=0,Gc=null,mm=null,wa=0,Xc=null;function xl(){return B&2&&R!==0?R&-R:z.T!==null?Lf():E0()}function rm(){if(Hl===0)if(!(R&536870912)||C){var l=Nu;Nu<<=1,!(Nu&3932160)&&(Nu=262144),Hl=l}else Hl=536870912;return l=ql.current,l!==null&&(l.flags|=32),Hl}function zl(l,t,e){(l===Q&&(Y===2||Y===9)||l.cancelPendingCommit!==null)&&(fa(l,0),Qt(l,R,Hl,!1)),mu(l,e),(!(B&2)||l!==Q)&&(l===Q&&(!(B&2)&&(re|=e),k===4&&Qt(l,R,Hl,!1)),it(l))}function hm(l,t,e){if(B&6)throw Error(b(327));var a=!e&&(t&127)===0&&(t&l.expiredLanes)===0||du(l,t),u=a?B1(l,t):$i(l,t,!0),n=a;do{if(u===0){va&&!a&&Qt(l,t,0,!1);break}else{if(e=l.current.alternate,n&&!N1(e)){u=$i(l,t,!1),n=!1;continue}if(u===2){if(n=t,l.errorRecoveryDisabledLanes&n)var i=0;else i=l.pendingLanes&-536870913,i=i!==0?i:i&536870912?536870912:0;if(i!==0){t=i;l:{var c=l;u=Ja;var f=c.current.memoizedState.isDehydrated;if(f&&(fa(c,i).flags|=256),i=$i(c,i,!1),i!==2){if(Yf&&!f){c.errorRecoveryDisabledLanes|=n,re|=n,u=4;break l}n=pl,pl=u,n!==null&&(pl===null?pl=n:pl.push.apply(pl,n))}u=i}if(n=!1,u!==2)continue}}if(u===1){fa(l,0),Qt(l,t,0,!0);break}l:{switch(a=l,n=u,n){case 0:case 1:throw Error(b(345));case 4:if((t&4194048)!==t)break;case 6:Qt(a,t,Hl,!Lt);break l;case 2:pl=null;break;case 3:case 5:break;default:throw Error(b(329))}if((t&62914560)===t&&(u=Fn+300-Rl(),10<u)){if(Qt(a,t,Hl,!Lt),Ln(a,0,!0)!==0)break l;Et=t,a.timeoutHandle=xm(Cs.bind(null,a,e,pl,Un,qc,t,Hl,re,ia,Lt,n,"Throttled",-0,0),u);break l}Cs(a,e,pl,Un,qc,t,Hl,re,ia,Lt,n,null,-0,0)}}break}while(!0);it(l)}function Cs(l,t,e,a,u,n,i,c,f,s,v,y,m,h){if(l.timeoutHandle=-1,y=t.subtreeFlags,y&8192||(y&16785408)===16785408){y={stylesheets:null,count:0,imgCount:0,imgBytes:0,suspenseyImages:[],waitingForImages:!0,waitingForViewTransition:!1,unsuspend:gt},cm(t,n,y);var S=(n&62914560)===n?Fn-Rl():(n&4194048)===n?dm-Rl():0;if(S=vv(y,S),S!==null){Et=n,l.cancelPendingCommit=S(xs.bind(null,l,t,n,e,a,u,i,c,f,v,y,null,m,h)),Qt(l,n,i,!s);return}}xs(l,t,n,e,a,u,i,c,f)}function N1(l){for(var t=l;;){var e=t.tag;if((e===0||e===11||e===15)&&t.flags&16384&&(e=t.updateQueue,e!==null&&(e=e.stores,e!==null)))for(var a=0;a<e.length;a++){var u=e[a],n=u.getSnapshot;u=u.value;try{if(!Bl(n(),u))return!1}catch{return!1}}if(e=t.child,t.subtreeFlags&16384&&e!==null)e.return=t,t=e;else{if(t===l)break;for(;t.sibling===null;){if(t.return===null||t.return===l)return!0;t=t.return}t.sibling.return=t.return,t=t.sibling}}return!0}function Qt(l,t,e,a){t&=~Gf,t&=~re,l.suspendedLanes|=t,l.pingedLanes&=~t,a&&(l.warmLanes|=t),a=l.expirationTimes;for(var u=t;0<u;){var n=31-Nl(u),i=1<<n;a[n]=-1,u&=~i}e!==0&&b0(l,e,t)}function In(){return B&6?!0:(bu(0,!1),!1)}function Xf(){if(U!==null){if(Y===0)var l=U.return;else l=U,bt=ze=null,Af(l),Fe=null,tu=0,l=U;for(;l!==null;)wd(l.alternate,l),l=l.return;U=null}}function fa(l,t){var e=l.timeoutHandle;e!==-1&&(l.timeoutHandle=-1,F1(e)),e=l.cancelPendingCommit,e!==null&&(l.cancelPendingCommit=null,e()),Et=0,Xf(),Q=l,U=e=St(l.current,null),R=t,Y=0,Ol=null,Lt=!1,va=du(l,t),Yf=!1,ia=Hl=Gf=re=te=k=0,pl=Ja=null,qc=!1,t&8&&(t|=t&32);var a=l.entangledLanes;if(a!==0)for(l=l.entanglements,a&=t;0<a;){var u=31-Nl(a),n=1<<u;t|=l[u],a&=~n}return Mt=t,Vn(),e}function vm(l,t){_=null,z.H=au,t===ha||t===Jn?(t=ss(),Y=3):t===gf?(t=ss(),Y=4):Y=t===Nf?8:t!==null&&typeof t=="object"&&typeof t.then=="function"?6:1,Ol=t,U===null&&(k=1,_n(l,jl(t,l.current)))}function ym(){var l=ql.current;return l===null?!0:(R&4194048)===R?Kl===null:(R&62914560)===R||R&536870912?l===Kl:!1}function gm(){var l=z.H;return z.H=au,l===null?au:l}function bm(){var l=z.A;return z.A=R1,l}function Hn(){k=4,Lt||(R&4194048)!==R&&ql.current!==null||(va=!0),!(te&134217727)&&!(re&134217727)||Q===null||Qt(Q,R,Hl,!1)}function $i(l,t,e){var a=B;B|=2;var u=gm(),n=bm();(Q!==l||R!==t)&&(Un=null,fa(l,t)),t=!1;var i=k;l:do try{if(Y!==0&&U!==null){var c=U,f=Ol;switch(Y){case 8:Xf(),i=6;break l;case 3:case 2:case 9:case 6:ql.current===null&&(t=!0);var s=Y;if(Y=0,Ol=null,Je(l,c,f,s),e&&va){i=0;break l}break;default:s=Y,Y=0,Ol=null,Je(l,c,f,s)}}x1(),i=k;break}catch(v){vm(l,v)}while(!0);return t&&l.shellSuspendCounter++,bt=ze=null,B=a,z.H=u,z.A=n,U===null&&(Q=null,R=0,Vn()),i}function x1(){for(;U!==null;)Sm(U)}function B1(l,t){var e=B;B|=2;var a=gm(),u=bm();Q!==l||R!==t?(Un=null,Dn=Rl()+500,fa(l,t)):va=du(l,t);l:do try{if(Y!==0&&U!==null){t=U;var n=Ol;t:switch(Y){case 1:Y=0,Ol=null,Je(l,t,n,1);break;case 2:case 9:if(os(n)){Y=0,Ol=null,Ns(t);break}t=function(){Y!==2&&Y!==9||Q!==l||(Y=7),it(l)},n.then(t,t);break l;case 3:Y=7;break l;case 4:Y=5;break l;case 7:os(n)?(Y=0,Ol=null,Ns(t)):(Y=0,Ol=null,Je(l,t,n,7));break;case 5:var i=null;switch(U.tag){case 26:i=U.memoizedState;case 5:case 27:var c=U;if(i?Xm(i):c.stateNode.complete){Y=0,Ol=null;var f=c.sibling;if(f!==null)U=f;else{var s=c.return;s!==null?(U=s,Pn(s)):U=null}break t}}Y=0,Ol=null,Je(l,t,n,5);break;case 6:Y=0,Ol=null,Je(l,t,n,6);break;case 8:Xf(),k=6;break l;default:throw Error(b(462))}}q1();break}catch(v){vm(l,v)}while(!0);return bt=ze=null,z.H=a,z.A=u,B=e,U!==null?0:(Q=null,R=0,Vn(),k)}function q1(){for(;U!==null&&!nh();)Sm(U)}function Sm(l){var t=Jd(l.alternate,l,Mt);l.memoizedProps=l.pendingProps,t===null?Pn(l):U=t}function Ns(l){var t=l,e=t.alternate;switch(t.tag){case 15:case 0:t=Ms(e,t,t.pendingProps,t.type,void 0,R);break;case 11:t=Ms(e,t,t.pendingProps,t.type.render,t.ref,R);break;case 5:Af(t);default:wd(e,t),t=U=w0(t,Mt),t=Jd(e,t,Mt)}l.memoizedProps=l.pendingProps,t===null?Pn(l):U=t}function Je(l,t,e,a){bt=ze=null,Af(t),Fe=null,tu=0;var u=t.return;try{if(A1(l,u,t,e,R)){k=1,_n(l,jl(e,l.current)),U=null;return}}catch(n){if(u!==null)throw U=u,n;k=1,_n(l,jl(e,l.current)),U=null;return}t.flags&32768?(C||a===1?l=!0:va||R&536870912?l=!1:(Lt=l=!0,(a===2||a===9||a===3||a===6)&&(a=ql.current,a!==null&&a.tag===13&&(a.flags|=16384))),Tm(t,l)):Pn(t)}function Pn(l){var t=l;do{if(t.flags&32768){Tm(t,Lt);return}l=t.return;var e=O1(t.alternate,t,Mt);if(e!==null){U=e;return}if(t=t.sibling,t!==null){U=t;return}U=t=l}while(t!==null);k===0&&(k=5)}function Tm(l,t){do{var e=D1(l.alternate,l);if(e!==null){e.flags&=32767,U=e;return}if(e=l.return,e!==null&&(e.flags|=32768,e.subtreeFlags=0,e.deletions=null),!t&&(l=l.sibling,l!==null)){U=l;return}U=l=e}while(l!==null);k=6,U=null}function xs(l,t,e,a,u,n,i,c,f){l.cancelPendingCommit=null;do li();while(al!==0);if(B&6)throw Error(b(327));if(t!==null){if(t===l.current)throw Error(b(177));if(n=t.lanes|t.childLanes,n|=sf,vh(l,e,n,i,c,f),l===Q&&(U=Q=null,R=0),ca=t,Wt=l,Et=e,Yc=n,Gc=u,mm=a,t.subtreeFlags&10256||t.flags&10256?(l.callbackNode=null,l.callbackPriority=0,L1(hn,function(){return _m(),null})):(l.callbackNode=null,l.callbackPriority=0),a=(t.flags&13878)!==0,t.subtreeFlags&13878||a){a=z.T,z.T=null,u=q.p,q.p=2,i=B,B|=4;try{U1(l,t,e)}finally{B=i,q.p=u,z.T=a}}al=1,Em(),pm(),zm()}}function Em(){if(al===1){al=0;var l=Wt,t=ca,e=(t.flags&13878)!==0;if(t.subtreeFlags&13878||e){e=z.T,z.T=null;var a=q.p;q.p=2;var u=B;B|=4;try{um(t,l);var n=jc,i=X0(l.containerInfo),c=n.focusedElem,f=n.selectionRange;if(i!==c&&c&&c.ownerDocument&&G0(c.ownerDocument.documentElement,c)){if(f!==null&&of(c)){var s=f.start,v=f.end;if(v===void 0&&(v=s),"selectionStart"in c)c.selectionStart=s,c.selectionEnd=Math.min(v,c.value.length);else{var y=c.ownerDocument||document,m=y&&y.defaultView||window;if(m.getSelection){var h=m.getSelection(),S=c.textContent.length,E=Math.min(f.start,S),O=f.end===void 0?E:Math.min(f.end,S);!h.extend&&E>O&&(i=O,O=E,E=i);var d=es(c,E),o=es(c,O);if(d&&o&&(h.rangeCount!==1||h.anchorNode!==d.node||h.anchorOffset!==d.offset||h.focusNode!==o.node||h.focusOffset!==o.offset)){var r=y.createRange();r.setStart(d.node,d.offset),h.removeAllRanges(),E>O?(h.addRange(r),h.extend(o.node,o.offset)):(r.setEnd(o.node,o.offset),h.addRange(r))}}}}for(y=[],h=c;h=h.parentNode;)h.nodeType===1&&y.push({element:h,left:h.scrollLeft,top:h.scrollTop});for(typeof c.focus=="function"&&c.focus(),c=0;c<y.length;c++){var g=y[c];g.element.scrollLeft=g.left,g.element.scrollTop=g.top}}Gn=!!Zc,jc=Zc=null}finally{B=u,q.p=a,z.T=e}}l.current=t,al=2}}function pm(){if(al===2){al=0;var l=Wt,t=ca,e=(t.flags&8772)!==0;if(t.subtreeFlags&8772||e){e=z.T,z.T=null;var a=q.p;q.p=2;var u=B;B|=4;try{Pd(l,t.alternate,t)}finally{B=u,q.p=a,z.T=e}}al=3}}function zm(){if(al===4||al===3){al=0,ih();var l=Wt,t=ca,e=Et,a=mm;t.subtreeFlags&10256||t.flags&10256?al=5:(al=0,ca=Wt=null,Am(l,l.pendingLanes));var u=l.pendingLanes;if(u===0&&(wt=null),tf(e),t=t.stateNode,Cl&&typeof Cl.onCommitFiberRoot=="function")try{Cl.onCommitFiberRoot(su,t,void 0,(t.current.flags&128)===128)}catch{}if(a!==null){t=z.T,u=q.p,q.p=2,z.T=null;try{for(var n=l.onRecoverableError,i=0;i<a.length;i++){var c=a[i];n(c.value,{componentStack:c.stack})}}finally{z.T=t,q.p=u}}Et&3&&li(),it(l),u=l.pendingLanes,e&261930&&u&42?l===Xc?wa++:(wa=0,Xc=l):wa=0,bu(0,!1)}}function Am(l,t){(l.pooledCacheLanes&=t)===0&&(t=l.pooledCache,t!=null&&(l.pooledCache=null,vu(t)))}function li(){return Em(),pm(),zm(),_m()}function _m(){if(al!==5)return!1;var l=Wt,t=Yc;Yc=0;var e=tf(Et),a=z.T,u=q.p;try{q.p=32>e?32:e,z.T=null,e=Gc,Gc=null;var n=Wt,i=Et;if(al=0,ca=Wt=null,Et=0,B&6)throw Error(b(331));var c=B;if(B|=4,om(n.current),im(n,n.current,i,e),B=c,bu(0,!1),Cl&&typeof Cl.onPostCommitFiberRoot=="function")try{Cl.onPostCommitFiberRoot(su,n)}catch{}return!0}finally{q.p=u,z.T=a,Am(l,t)}}function Bs(l,t,e){t=jl(e,t),t=Cc(l.stateNode,t,2),l=Jt(l,t,2),l!==null&&(mu(l,2),it(l))}function G(l,t,e){if(l.tag===3)Bs(l,l,e);else for(;t!==null;){if(t.tag===3){Bs(t,l,e);break}else if(t.tag===1){var a=t.stateNode;if(typeof t.type.getDerivedStateFromError=="function"||typeof a.componentDidCatch=="function"&&(wt===null||!wt.has(a))){l=jl(e,l),e=Ld(2),a=Jt(t,e,2),a!==null&&(Qd(e,a,t,l),mu(a,2),it(a));break}}t=t.return}}function ki(l,t,e){var a=l.pingCache;if(a===null){a=l.pingCache=new C1;var u=new Set;a.set(t,u)}else u=a.get(t),u===void 0&&(u=new Set,a.set(t,u));u.has(e)||(Yf=!0,u.add(e),l=Y1.bind(null,l,t,e),t.then(l,l))}function Y1(l,t,e){var a=l.pingCache;a!==null&&a.delete(t),l.pingedLanes|=l.suspendedLanes&e,l.warmLanes&=~e,Q===l&&(R&e)===e&&(k===4||k===3&&(R&62914560)===R&&300>Rl()-Fn?!(B&2)&&fa(l,0):Gf|=e,ia===R&&(ia=0)),it(l)}function Mm(l,t){t===0&&(t=g0()),l=pe(l,t),l!==null&&(mu(l,t),it(l))}function G1(l){var t=l.memoizedState,e=0;t!==null&&(e=t.retryLane),Mm(l,e)}function X1(l,t){var e=0;switch(l.tag){case 31:case 13:var a=l.stateNode,u=l.memoizedState;u!==null&&(e=u.retryLane);break;case 19:a=l.stateNode;break;case 22:a=l.stateNode._retryCache;break;default:throw Error(b(314))}a!==null&&a.delete(t),Mm(l,e)}function L1(l,t){return Pc(l,t)}var Rn=null,xe=null,Lc=!1,Cn=!1,Fi=!1,Zt=0;function it(l){l!==xe&&l.next===null&&(xe===null?Rn=xe=l:xe=xe.next=l),Cn=!0,Lc||(Lc=!0,Z1())}function bu(l,t){if(!Fi&&Cn){Fi=!0;do for(var e=!1,a=Rn;a!==null;){if(!t)if(l!==0){var u=a.pendingLanes;if(u===0)var n=0;else{var i=a.suspendedLanes,c=a.pingedLanes;n=(1<<31-Nl(42|l)+1)-1,n&=u&~(i&~c),n=n&201326741?n&201326741|1:n?n|2:0}n!==0&&(e=!0,qs(a,n))}else n=R,n=Ln(a,a===Q?n:0,a.cancelPendingCommit!==null||a.timeoutHandle!==-1),!(n&3)||du(a,n)||(e=!0,qs(a,n));a=a.next}while(e);Fi=!1}}function Q1(){Om()}function Om(){Cn=Lc=!1;var l=0;Zt!==0&&k1()&&(l=Zt);for(var t=Rl(),e=null,a=Rn;a!==null;){var u=a.next,n=Dm(a,t);n===0?(a.next=null,e===null?Rn=u:e.next=u,u===null&&(xe=e)):(e=a,(l!==0||n&3)&&(Cn=!0)),a=u}al!==0&&al!==5||bu(l,!1),Zt!==0&&(Zt=0)}function Dm(l,t){for(var e=l.suspendedLanes,a=l.pingedLanes,u=l.expirationTimes,n=l.pendingLanes&-62914561;0<n;){var i=31-Nl(n),c=1<<i,f=u[i];f===-1?(!(c&e)||c&a)&&(u[i]=hh(c,t)):f<=t&&(l.expiredLanes|=c),n&=~c}if(t=Q,e=R,e=Ln(l,l===t?e:0,l.cancelPendingCommit!==null||l.timeoutHandle!==-1),a=l.callbackNode,e===0||l===t&&(Y===2||Y===9)||l.cancelPendingCommit!==null)return a!==null&&a!==null&&Mi(a),l.callbackNode=null,l.callbackPriority=0;if(!(e&3)||du(l,e)){if(t=e&-e,t===l.callbackPriority)return t;switch(a!==null&&Mi(a),tf(e)){case 2:case 8:e=v0;break;case 32:e=hn;break;case 268435456:e=y0;break;default:e=hn}return a=Um.bind(null,l),e=Pc(e,a),l.callbackPriority=t,l.callbackNode=e,t}return a!==null&&a!==null&&Mi(a),l.callbackPriority=2,l.callbackNode=null,2}function Um(l,t){if(al!==0&&al!==5)return l.callbackNode=null,l.callbackPriority=0,null;var e=l.callbackNode;if(li()&&l.callbackNode!==e)return null;var a=R;return a=Ln(l,l===Q?a:0,l.cancelPendingCommit!==null||l.timeoutHandle!==-1),a===0?null:(hm(l,a,t),Dm(l,Rl()),l.callbackNode!=null&&l.callbackNode===e?Um.bind(null,l):null)}function qs(l,t){if(li())return null;hm(l,t,!0)}function Z1(){I1(function(){B&6?Pc(h0,Q1):Om()})}function Lf(){if(Zt===0){var l=aa;l===0&&(l=Cu,Cu<<=1,!(Cu&261888)&&(Cu=256)),Zt=l}return Zt}function Ys(l){return l==null||typeof l=="symbol"||typeof l=="boolean"?null:typeof l=="function"?l:ku(""+l)}function Gs(l,t){var e=t.ownerDocument.createElement("input");return e.name=t.name,e.value=t.value,l.id&&e.setAttribute("form",l.id),t.parentNode.insertBefore(e,t),l=new FormData(l),e.parentNode.removeChild(e),l}function j1(l,t,e,a,u){if(t==="submit"&&e&&e.stateNode===u){var n=Ys((u[Al]||null).action),i=a.submitter;i&&(t=(t=i[Al]||null)?Ys(t.formAction):i.getAttribute("formAction"),t!==null&&(n=t,i=null));var c=new Qn("action","action",null,a,u);l.push({event:c,listeners:[{instance:null,listener:function(){if(a.defaultPrevented){if(Zt!==0){var f=i?Gs(u,i):new FormData(u);Hc(e,{pending:!0,data:f,method:u.method,action:n},null,f)}}else typeof n=="function"&&(c.preventDefault(),f=i?Gs(u,i):new FormData(u),Hc(e,{pending:!0,data:f,method:u.method,action:n},n,f))},currentTarget:u}]})}}for(Vu=0;Vu<bc.length;Vu++)Ku=bc[Vu],Xs=Ku.toLowerCase(),Ls=Ku[0].toUpperCase()+Ku.slice(1),Fl(Xs,"on"+Ls);var Ku,Xs,Ls,Vu;Fl(Q0,"onAnimationEnd");Fl(Z0,"onAnimationIteration");Fl(j0,"onAnimationStart");Fl("dblclick","onDoubleClick");Fl("focusin","onFocus");Fl("focusout","onBlur");Fl(c1,"onTransitionRun");Fl(f1,"onTransitionStart");Fl(o1,"onTransitionCancel");Fl(V0,"onTransitionEnd");ta("onMouseEnter",["mouseout","mouseover"]);ta("onMouseLeave",["mouseout","mouseover"]);ta("onPointerEnter",["pointerout","pointerover"]);ta("onPointerLeave",["pointerout","pointerover"]);Se("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));Se("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));Se("onBeforeInput",["compositionend","keypress","textInput","paste"]);Se("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));Se("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));Se("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var uu="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),V1=new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(uu));function Hm(l,t){t=(t&4)!==0;for(var e=0;e<l.length;e++){var a=l[e],u=a.event;a=a.listeners;l:{var n=void 0;if(t)for(var i=a.length-1;0<=i;i--){var c=a[i],f=c.instance,s=c.currentTarget;if(c=c.listener,f!==n&&u.isPropagationStopped())break l;n=c,u.currentTarget=s;try{n(u)}catch(v){yn(v)}u.currentTarget=null,n=f}else for(i=0;i<a.length;i++){if(c=a[i],f=c.instance,s=c.currentTarget,c=c.listener,f!==n&&u.isPropagationStopped())break l;n=c,u.currentTarget=s;try{n(u)}catch(v){yn(v)}u.currentTarget=null,n=f}}}}function D(l,t){var e=t[sc];e===void 0&&(e=t[sc]=new Set);var a=l+"__bubble";e.has(a)||(Rm(t,l,2,!1),e.add(a))}function Ii(l,t,e){var a=0;t&&(a|=4),Rm(e,l,a,t)}var Ju="_reactListening"+Math.random().toString(36).slice(2);function Qf(l){if(!l[Ju]){l[Ju]=!0,p0.forEach(function(e){e!=="selectionchange"&&(V1.has(e)||Ii(e,!1,l),Ii(e,!0,l))});var t=l.nodeType===9?l:l.ownerDocument;t===null||t[Ju]||(t[Ju]=!0,Ii("selectionchange",!1,t))}}function Rm(l,t,e,a){switch(Vm(t)){case 2:var u=bv;break;case 8:u=Sv;break;default:u=Kf}e=u.bind(null,t,e,l),u=void 0,!vc||t!=="touchstart"&&t!=="touchmove"&&t!=="wheel"||(u=!0),a?u!==void 0?l.addEventListener(t,e,{capture:!0,passive:u}):l.addEventListener(t,e,!0):u!==void 0?l.addEventListener(t,e,{passive:u}):l.addEventListener(t,e,!1)}function Pi(l,t,e,a,u){var n=a;if(!(t&1)&&!(t&2)&&a!==null)l:for(;;){if(a===null)return;var i=a.tag;if(i===3||i===4){var c=a.stateNode.containerInfo;if(c===u)break;if(i===4)for(i=a.return;i!==null;){var f=i.tag;if((f===3||f===4)&&i.stateNode.containerInfo===u)return;i=i.return}for(;c!==null;){if(i=Ye(c),i===null)return;if(f=i.tag,f===5||f===6||f===26||f===27){a=n=i;continue l}c=c.parentNode}}a=a.return}H0(function(){var s=n,v=uf(e),y=[];l:{var m=K0.get(l);if(m!==void 0){var h=Qn,S=l;switch(l){case"keypress":if(Iu(e)===0)break l;case"keydown":case"keyup":h=Xh;break;case"focusin":S="focus",h=Ri;break;case"focusout":S="blur",h=Ri;break;case"beforeblur":case"afterblur":h=Ri;break;case"click":if(e.button===2)break l;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":h=wo;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":h=Oh;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":h=Zh;break;case Q0:case Z0:case j0:h=Hh;break;case V0:h=Vh;break;case"scroll":case"scrollend":h=_h;break;case"wheel":h=Jh;break;case"copy":case"cut":case"paste":h=Ch;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":h=$o;break;case"toggle":case"beforetoggle":h=Wh}var E=(t&4)!==0,O=!E&&(l==="scroll"||l==="scrollend"),d=E?m!==null?m+"Capture":null:m;E=[];for(var o=s,r;o!==null;){var g=o;if(r=g.stateNode,g=g.tag,g!==5&&g!==26&&g!==27||r===null||d===null||(g=ka(o,d),g!=null&&E.push(nu(o,g,r))),O)break;o=o.return}0<E.length&&(m=new h(m,S,null,e,v),y.push({event:m,listeners:E}))}}if(!(t&7)){l:{if(m=l==="mouseover"||l==="pointerover",h=l==="mouseout"||l==="pointerout",m&&e!==hc&&(S=e.relatedTarget||e.fromElement)&&(Ye(S)||S[da]))break l;if((h||m)&&(m=v.window===v?v:(m=v.ownerDocument)?m.defaultView||m.parentWindow:window,h?(S=e.relatedTarget||e.toElement,h=s,S=S?Ye(S):null,S!==null&&(O=ou(S),E=S.tag,S!==O||E!==5&&E!==27&&E!==6)&&(S=null)):(h=null,S=s),h!==S)){if(E=wo,g="onMouseLeave",d="onMouseEnter",o="mouse",(l==="pointerout"||l==="pointerover")&&(E=$o,g="onPointerLeave",d="onPointerEnter",o="pointer"),O=h==null?m:Na(h),r=S==null?m:Na(S),m=new E(g,o+"leave",h,e,v),m.target=O,m.relatedTarget=r,g=null,Ye(v)===s&&(E=new E(d,o+"enter",S,e,v),E.target=r,E.relatedTarget=O,g=E),O=g,h&&S)t:{for(E=K1,d=h,o=S,r=0,g=d;g;g=E(g))r++;g=0;for(var p=o;p;p=E(p))g++;for(;0<r-g;)d=E(d),r--;for(;0<g-r;)o=E(o),g--;for(;r--;){if(d===o||o!==null&&d===o.alternate){E=d;break t}d=E(d),o=E(o)}E=null}else E=null;h!==null&&Qs(y,m,h,E,!1),S!==null&&O!==null&&Qs(y,O,S,E,!0)}}l:{if(m=s?Na(s):window,h=m.nodeName&&m.nodeName.toLowerCase(),h==="select"||h==="input"&&m.type==="file")var N=Po;else if(Io(m))if(q0)N=u1;else{N=e1;var T=t1}else h=m.nodeName,!h||h.toLowerCase()!=="input"||m.type!=="checkbox"&&m.type!=="radio"?s&&af(s.elementType)&&(N=Po):N=a1;if(N&&(N=N(l,s))){B0(y,N,e,v);break l}T&&T(l,m,s),l==="focusout"&&s&&m.type==="number"&&s.memoizedProps.value!=null&&rc(m,"number",m.value)}switch(T=s?Na(s):window,l){case"focusin":(Io(T)||T.contentEditable==="true")&&(Le=T,yc=s,Ga=null);break;case"focusout":Ga=yc=Le=null;break;case"mousedown":gc=!0;break;case"contextmenu":case"mouseup":case"dragend":gc=!1,as(y,e,v);break;case"selectionchange":if(i1)break;case"keydown":case"keyup":as(y,e,v)}var M;if(ff)l:{switch(l){case"compositionstart":var H="onCompositionStart";break l;case"compositionend":H="onCompositionEnd";break l;case"compositionupdate":H="onCompositionUpdate";break l}H=void 0}else Xe?N0(l,e)&&(H="onCompositionEnd"):l==="keydown"&&e.keyCode===229&&(H="onCompositionStart");H&&(C0&&e.locale!=="ko"&&(Xe||H!=="onCompositionStart"?H==="onCompositionEnd"&&Xe&&(M=R0()):(Xt=v,nf="value"in Xt?Xt.value:Xt.textContent,Xe=!0)),T=Nn(s,H),0<T.length&&(H=new Wo(H,l,null,e,v),y.push({event:H,listeners:T}),M?H.data=M:(M=x0(e),M!==null&&(H.data=M)))),(M=kh?Fh(l,e):Ih(l,e))&&(H=Nn(s,"onBeforeInput"),0<H.length&&(T=new Wo("onBeforeInput","beforeinput",null,e,v),y.push({event:T,listeners:H}),T.data=M)),j1(y,l,s,e,v)}Hm(y,t)})}function nu(l,t,e){return{instance:l,listener:t,currentTarget:e}}function Nn(l,t){for(var e=t+"Capture",a=[];l!==null;){var u=l,n=u.stateNode;if(u=u.tag,u!==5&&u!==26&&u!==27||n===null||(u=ka(l,e),u!=null&&a.unshift(nu(l,u,n)),u=ka(l,t),u!=null&&a.push(nu(l,u,n))),l.tag===3)return a;l=l.return}return[]}function K1(l){if(l===null)return null;do l=l.return;while(l&&l.tag!==5&&l.tag!==27);return l||null}function Qs(l,t,e,a,u){for(var n=t._reactName,i=[];e!==null&&e!==a;){var c=e,f=c.alternate,s=c.stateNode;if(c=c.tag,f!==null&&f===a)break;c!==5&&c!==26&&c!==27||s===null||(f=s,u?(s=ka(e,n),s!=null&&i.unshift(nu(e,s,f))):u||(s=ka(e,n),s!=null&&i.push(nu(e,s,f)))),e=e.return}i.length!==0&&l.push({event:t,listeners:i})}var J1=/\\r\\n?/g,w1=/\\u0000|\\uFFFD/g;function Zs(l){return(typeof l=="string"?l:""+l).replace(J1,\`
\`).replace(w1,"")}function Cm(l,t){return t=Zs(t),Zs(l)===t}function X(l,t,e,a,u,n){switch(e){case"children":typeof a=="string"?t==="body"||t==="textarea"&&a===""||ea(l,a):(typeof a=="number"||typeof a=="bigint")&&t!=="body"&&ea(l,""+a);break;case"className":Bu(l,"class",a);break;case"tabIndex":Bu(l,"tabindex",a);break;case"dir":case"role":case"viewBox":case"width":case"height":Bu(l,e,a);break;case"style":U0(l,a,n);break;case"data":if(t!=="object"){Bu(l,"data",a);break}case"src":case"href":if(a===""&&(t!=="a"||e!=="href")){l.removeAttribute(e);break}if(a==null||typeof a=="function"||typeof a=="symbol"||typeof a=="boolean"){l.removeAttribute(e);break}a=ku(""+a),l.setAttribute(e,a);break;case"action":case"formAction":if(typeof a=="function"){l.setAttribute(e,"javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");break}else typeof n=="function"&&(e==="formAction"?(t!=="input"&&X(l,t,"name",u.name,u,null),X(l,t,"formEncType",u.formEncType,u,null),X(l,t,"formMethod",u.formMethod,u,null),X(l,t,"formTarget",u.formTarget,u,null)):(X(l,t,"encType",u.encType,u,null),X(l,t,"method",u.method,u,null),X(l,t,"target",u.target,u,null)));if(a==null||typeof a=="symbol"||typeof a=="boolean"){l.removeAttribute(e);break}a=ku(""+a),l.setAttribute(e,a);break;case"onClick":a!=null&&(l.onclick=gt);break;case"onScroll":a!=null&&D("scroll",l);break;case"onScrollEnd":a!=null&&D("scrollend",l);break;case"dangerouslySetInnerHTML":if(a!=null){if(typeof a!="object"||!("__html"in a))throw Error(b(61));if(e=a.__html,e!=null){if(u.children!=null)throw Error(b(60));l.innerHTML=e}}break;case"multiple":l.multiple=a&&typeof a!="function"&&typeof a!="symbol";break;case"muted":l.muted=a&&typeof a!="function"&&typeof a!="symbol";break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"defaultValue":case"defaultChecked":case"innerHTML":case"ref":break;case"autoFocus":break;case"xlinkHref":if(a==null||typeof a=="function"||typeof a=="boolean"||typeof a=="symbol"){l.removeAttribute("xlink:href");break}e=ku(""+a),l.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",e);break;case"contentEditable":case"spellCheck":case"draggable":case"value":case"autoReverse":case"externalResourcesRequired":case"focusable":case"preserveAlpha":a!=null&&typeof a!="function"&&typeof a!="symbol"?l.setAttribute(e,""+a):l.removeAttribute(e);break;case"inert":case"allowFullScreen":case"async":case"autoPlay":case"controls":case"default":case"defer":case"disabled":case"disablePictureInPicture":case"disableRemotePlayback":case"formNoValidate":case"hidden":case"loop":case"noModule":case"noValidate":case"open":case"playsInline":case"readOnly":case"required":case"reversed":case"scoped":case"seamless":case"itemScope":a&&typeof a!="function"&&typeof a!="symbol"?l.setAttribute(e,""):l.removeAttribute(e);break;case"capture":case"download":a===!0?l.setAttribute(e,""):a!==!1&&a!=null&&typeof a!="function"&&typeof a!="symbol"?l.setAttribute(e,a):l.removeAttribute(e);break;case"cols":case"rows":case"size":case"span":a!=null&&typeof a!="function"&&typeof a!="symbol"&&!isNaN(a)&&1<=a?l.setAttribute(e,a):l.removeAttribute(e);break;case"rowSpan":case"start":a==null||typeof a=="function"||typeof a=="symbol"||isNaN(a)?l.removeAttribute(e):l.setAttribute(e,a);break;case"popover":D("beforetoggle",l),D("toggle",l),$u(l,"popover",a);break;case"xlinkActuate":ot(l,"http://www.w3.org/1999/xlink","xlink:actuate",a);break;case"xlinkArcrole":ot(l,"http://www.w3.org/1999/xlink","xlink:arcrole",a);break;case"xlinkRole":ot(l,"http://www.w3.org/1999/xlink","xlink:role",a);break;case"xlinkShow":ot(l,"http://www.w3.org/1999/xlink","xlink:show",a);break;case"xlinkTitle":ot(l,"http://www.w3.org/1999/xlink","xlink:title",a);break;case"xlinkType":ot(l,"http://www.w3.org/1999/xlink","xlink:type",a);break;case"xmlBase":ot(l,"http://www.w3.org/XML/1998/namespace","xml:base",a);break;case"xmlLang":ot(l,"http://www.w3.org/XML/1998/namespace","xml:lang",a);break;case"xmlSpace":ot(l,"http://www.w3.org/XML/1998/namespace","xml:space",a);break;case"is":$u(l,"is",a);break;case"innerText":case"textContent":break;default:(!(2<e.length)||e[0]!=="o"&&e[0]!=="O"||e[1]!=="n"&&e[1]!=="N")&&(e=zh.get(e)||e,$u(l,e,a))}}function Qc(l,t,e,a,u,n){switch(e){case"style":U0(l,a,n);break;case"dangerouslySetInnerHTML":if(a!=null){if(typeof a!="object"||!("__html"in a))throw Error(b(61));if(e=a.__html,e!=null){if(u.children!=null)throw Error(b(60));l.innerHTML=e}}break;case"children":typeof a=="string"?ea(l,a):(typeof a=="number"||typeof a=="bigint")&&ea(l,""+a);break;case"onScroll":a!=null&&D("scroll",l);break;case"onScrollEnd":a!=null&&D("scrollend",l);break;case"onClick":a!=null&&(l.onclick=gt);break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"innerHTML":case"ref":break;case"innerText":case"textContent":break;default:if(!z0.hasOwnProperty(e))l:{if(e[0]==="o"&&e[1]==="n"&&(u=e.endsWith("Capture"),t=e.slice(2,u?e.length-7:void 0),n=l[Al]||null,n=n!=null?n[e]:null,typeof n=="function"&&l.removeEventListener(t,n,u),typeof a=="function")){typeof n!="function"&&n!==null&&(e in l?l[e]=null:l.hasAttribute(e)&&l.removeAttribute(e)),l.addEventListener(t,a,u);break l}e in l?l[e]=a:a===!0?l.setAttribute(e,""):$u(l,e,a)}}}function ml(l,t,e){switch(t){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"img":D("error",l),D("load",l);var a=!1,u=!1,n;for(n in e)if(e.hasOwnProperty(n)){var i=e[n];if(i!=null)switch(n){case"src":a=!0;break;case"srcSet":u=!0;break;case"children":case"dangerouslySetInnerHTML":throw Error(b(137,t));default:X(l,t,n,i,e,null)}}u&&X(l,t,"srcSet",e.srcSet,e,null),a&&X(l,t,"src",e.src,e,null);return;case"input":D("invalid",l);var c=n=i=u=null,f=null,s=null;for(a in e)if(e.hasOwnProperty(a)){var v=e[a];if(v!=null)switch(a){case"name":u=v;break;case"type":i=v;break;case"checked":f=v;break;case"defaultChecked":s=v;break;case"value":n=v;break;case"defaultValue":c=v;break;case"children":case"dangerouslySetInnerHTML":if(v!=null)throw Error(b(137,t));break;default:X(l,t,a,v,e,null)}}M0(l,n,c,f,s,i,u,!1);return;case"select":D("invalid",l),a=i=n=null;for(u in e)if(e.hasOwnProperty(u)&&(c=e[u],c!=null))switch(u){case"value":n=c;break;case"defaultValue":i=c;break;case"multiple":a=c;default:X(l,t,u,c,e,null)}t=n,e=i,l.multiple=!!a,t!=null?We(l,!!a,t,!1):e!=null&&We(l,!!a,e,!0);return;case"textarea":D("invalid",l),n=u=a=null;for(i in e)if(e.hasOwnProperty(i)&&(c=e[i],c!=null))switch(i){case"value":a=c;break;case"defaultValue":u=c;break;case"children":n=c;break;case"dangerouslySetInnerHTML":if(c!=null)throw Error(b(91));break;default:X(l,t,i,c,e,null)}D0(l,a,u,n);return;case"option":for(f in e)if(e.hasOwnProperty(f)&&(a=e[f],a!=null))switch(f){case"selected":l.selected=a&&typeof a!="function"&&typeof a!="symbol";break;default:X(l,t,f,a,e,null)}return;case"dialog":D("beforetoggle",l),D("toggle",l),D("cancel",l),D("close",l);break;case"iframe":case"object":D("load",l);break;case"video":case"audio":for(a=0;a<uu.length;a++)D(uu[a],l);break;case"image":D("error",l),D("load",l);break;case"details":D("toggle",l);break;case"embed":case"source":case"link":D("error",l),D("load",l);case"area":case"base":case"br":case"col":case"hr":case"keygen":case"meta":case"param":case"track":case"wbr":case"menuitem":for(s in e)if(e.hasOwnProperty(s)&&(a=e[s],a!=null))switch(s){case"children":case"dangerouslySetInnerHTML":throw Error(b(137,t));default:X(l,t,s,a,e,null)}return;default:if(af(t)){for(v in e)e.hasOwnProperty(v)&&(a=e[v],a!==void 0&&Qc(l,t,v,a,e,void 0));return}}for(c in e)e.hasOwnProperty(c)&&(a=e[c],a!=null&&X(l,t,c,a,e,null))}function W1(l,t,e,a){switch(t){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"input":var u=null,n=null,i=null,c=null,f=null,s=null,v=null;for(h in e){var y=e[h];if(e.hasOwnProperty(h)&&y!=null)switch(h){case"checked":break;case"value":break;case"defaultValue":f=y;default:a.hasOwnProperty(h)||X(l,t,h,null,a,y)}}for(var m in a){var h=a[m];if(y=e[m],a.hasOwnProperty(m)&&(h!=null||y!=null))switch(m){case"type":n=h;break;case"name":u=h;break;case"checked":s=h;break;case"defaultChecked":v=h;break;case"value":i=h;break;case"defaultValue":c=h;break;case"children":case"dangerouslySetInnerHTML":if(h!=null)throw Error(b(137,t));break;default:h!==y&&X(l,t,m,h,a,y)}}mc(l,i,c,f,s,v,n,u);return;case"select":h=i=c=m=null;for(n in e)if(f=e[n],e.hasOwnProperty(n)&&f!=null)switch(n){case"value":break;case"multiple":h=f;default:a.hasOwnProperty(n)||X(l,t,n,null,a,f)}for(u in a)if(n=a[u],f=e[u],a.hasOwnProperty(u)&&(n!=null||f!=null))switch(u){case"value":m=n;break;case"defaultValue":c=n;break;case"multiple":i=n;default:n!==f&&X(l,t,u,n,a,f)}t=c,e=i,a=h,m!=null?We(l,!!e,m,!1):!!a!=!!e&&(t!=null?We(l,!!e,t,!0):We(l,!!e,e?[]:"",!1));return;case"textarea":h=m=null;for(c in e)if(u=e[c],e.hasOwnProperty(c)&&u!=null&&!a.hasOwnProperty(c))switch(c){case"value":break;case"children":break;default:X(l,t,c,null,a,u)}for(i in a)if(u=a[i],n=e[i],a.hasOwnProperty(i)&&(u!=null||n!=null))switch(i){case"value":m=u;break;case"defaultValue":h=u;break;case"children":break;case"dangerouslySetInnerHTML":if(u!=null)throw Error(b(91));break;default:u!==n&&X(l,t,i,u,a,n)}O0(l,m,h);return;case"option":for(var S in e)if(m=e[S],e.hasOwnProperty(S)&&m!=null&&!a.hasOwnProperty(S))switch(S){case"selected":l.selected=!1;break;default:X(l,t,S,null,a,m)}for(f in a)if(m=a[f],h=e[f],a.hasOwnProperty(f)&&m!==h&&(m!=null||h!=null))switch(f){case"selected":l.selected=m&&typeof m!="function"&&typeof m!="symbol";break;default:X(l,t,f,m,a,h)}return;case"img":case"link":case"area":case"base":case"br":case"col":case"embed":case"hr":case"keygen":case"meta":case"param":case"source":case"track":case"wbr":case"menuitem":for(var E in e)m=e[E],e.hasOwnProperty(E)&&m!=null&&!a.hasOwnProperty(E)&&X(l,t,E,null,a,m);for(s in a)if(m=a[s],h=e[s],a.hasOwnProperty(s)&&m!==h&&(m!=null||h!=null))switch(s){case"children":case"dangerouslySetInnerHTML":if(m!=null)throw Error(b(137,t));break;default:X(l,t,s,m,a,h)}return;default:if(af(t)){for(var O in e)m=e[O],e.hasOwnProperty(O)&&m!==void 0&&!a.hasOwnProperty(O)&&Qc(l,t,O,void 0,a,m);for(v in a)m=a[v],h=e[v],!a.hasOwnProperty(v)||m===h||m===void 0&&h===void 0||Qc(l,t,v,m,a,h);return}}for(var d in e)m=e[d],e.hasOwnProperty(d)&&m!=null&&!a.hasOwnProperty(d)&&X(l,t,d,null,a,m);for(y in a)m=a[y],h=e[y],!a.hasOwnProperty(y)||m===h||m==null&&h==null||X(l,t,y,m,a,h)}function js(l){switch(l){case"css":case"script":case"font":case"img":case"image":case"input":case"link":return!0;default:return!1}}function $1(){if(typeof performance.getEntriesByType=="function"){for(var l=0,t=0,e=performance.getEntriesByType("resource"),a=0;a<e.length;a++){var u=e[a],n=u.transferSize,i=u.initiatorType,c=u.duration;if(n&&c&&js(i)){for(i=0,c=u.responseEnd,a+=1;a<e.length;a++){var f=e[a],s=f.startTime;if(s>c)break;var v=f.transferSize,y=f.initiatorType;v&&js(y)&&(f=f.responseEnd,i+=v*(f<c?1:(c-s)/(f-s)))}if(--a,t+=8*(n+i)/(u.duration/1e3),l++,10<l)break}}if(0<l)return t/l/1e6}return navigator.connection&&(l=navigator.connection.downlink,typeof l=="number")?l:5}var Zc=null,jc=null;function xn(l){return l.nodeType===9?l:l.ownerDocument}function Vs(l){switch(l){case"http://www.w3.org/2000/svg":return 1;case"http://www.w3.org/1998/Math/MathML":return 2;default:return 0}}function Nm(l,t){if(l===0)switch(t){case"svg":return 1;case"math":return 2;default:return 0}return l===1&&t==="foreignObject"?0:l}function Vc(l,t){return l==="textarea"||l==="noscript"||typeof t.children=="string"||typeof t.children=="number"||typeof t.children=="bigint"||typeof t.dangerouslySetInnerHTML=="object"&&t.dangerouslySetInnerHTML!==null&&t.dangerouslySetInnerHTML.__html!=null}var lc=null;function k1(){var l=window.event;return l&&l.type==="popstate"?l===lc?!1:(lc=l,!0):(lc=null,!1)}var xm=typeof setTimeout=="function"?setTimeout:void 0,F1=typeof clearTimeout=="function"?clearTimeout:void 0,Ks=typeof Promise=="function"?Promise:void 0,I1=typeof queueMicrotask=="function"?queueMicrotask:typeof Ks<"u"?function(l){return Ks.resolve(null).then(l).catch(P1)}:xm;function P1(l){setTimeout(function(){throw l})}function ae(l){return l==="head"}function Js(l,t){var e=t,a=0;do{var u=e.nextSibling;if(l.removeChild(e),u&&u.nodeType===8)if(e=u.data,e==="/$"||e==="/&"){if(a===0){l.removeChild(u),sa(t);return}a--}else if(e==="$"||e==="$?"||e==="$~"||e==="$!"||e==="&")a++;else if(e==="html")Wa(l.ownerDocument.documentElement);else if(e==="head"){e=l.ownerDocument.head,Wa(e);for(var n=e.firstChild;n;){var i=n.nextSibling,c=n.nodeName;n[ru]||c==="SCRIPT"||c==="STYLE"||c==="LINK"&&n.rel.toLowerCase()==="stylesheet"||e.removeChild(n),n=i}}else e==="body"&&Wa(l.ownerDocument.body);e=u}while(e);sa(t)}function ws(l,t){var e=l;l=0;do{var a=e.nextSibling;if(e.nodeType===1?t?(e._stashedDisplay=e.style.display,e.style.display="none"):(e.style.display=e._stashedDisplay||"",e.getAttribute("style")===""&&e.removeAttribute("style")):e.nodeType===3&&(t?(e._stashedText=e.nodeValue,e.nodeValue=""):e.nodeValue=e._stashedText||""),a&&a.nodeType===8)if(e=a.data,e==="/$"){if(l===0)break;l--}else e!=="$"&&e!=="$?"&&e!=="$~"&&e!=="$!"||l++;e=a}while(e)}function Kc(l){var t=l.firstChild;for(t&&t.nodeType===10&&(t=t.nextSibling);t;){var e=t;switch(t=t.nextSibling,e.nodeName){case"HTML":case"HEAD":case"BODY":Kc(e),ef(e);continue;case"SCRIPT":case"STYLE":continue;case"LINK":if(e.rel.toLowerCase()==="stylesheet")continue}l.removeChild(e)}}function lv(l,t,e,a){for(;l.nodeType===1;){var u=e;if(l.nodeName.toLowerCase()!==t.toLowerCase()){if(!a&&(l.nodeName!=="INPUT"||l.type!=="hidden"))break}else if(a){if(!l[ru])switch(t){case"meta":if(!l.hasAttribute("itemprop"))break;return l;case"link":if(n=l.getAttribute("rel"),n==="stylesheet"&&l.hasAttribute("data-precedence"))break;if(n!==u.rel||l.getAttribute("href")!==(u.href==null||u.href===""?null:u.href)||l.getAttribute("crossorigin")!==(u.crossOrigin==null?null:u.crossOrigin)||l.getAttribute("title")!==(u.title==null?null:u.title))break;return l;case"style":if(l.hasAttribute("data-precedence"))break;return l;case"script":if(n=l.getAttribute("src"),(n!==(u.src==null?null:u.src)||l.getAttribute("type")!==(u.type==null?null:u.type)||l.getAttribute("crossorigin")!==(u.crossOrigin==null?null:u.crossOrigin))&&n&&l.hasAttribute("async")&&!l.hasAttribute("itemprop"))break;return l;default:return l}}else if(t==="input"&&l.type==="hidden"){var n=u.name==null?null:""+u.name;if(u.type==="hidden"&&l.getAttribute("name")===n)return l}else return l;if(l=Jl(l.nextSibling),l===null)break}return null}function tv(l,t,e){if(t==="")return null;for(;l.nodeType!==3;)if((l.nodeType!==1||l.nodeName!=="INPUT"||l.type!=="hidden")&&!e||(l=Jl(l.nextSibling),l===null))return null;return l}function Bm(l,t){for(;l.nodeType!==8;)if((l.nodeType!==1||l.nodeName!=="INPUT"||l.type!=="hidden")&&!t||(l=Jl(l.nextSibling),l===null))return null;return l}function Jc(l){return l.data==="$?"||l.data==="$~"}function wc(l){return l.data==="$!"||l.data==="$?"&&l.ownerDocument.readyState!=="loading"}function ev(l,t){var e=l.ownerDocument;if(l.data==="$~")l._reactRetry=t;else if(l.data!=="$?"||e.readyState!=="loading")t();else{var a=function(){t(),e.removeEventListener("DOMContentLoaded",a)};e.addEventListener("DOMContentLoaded",a),l._reactRetry=a}}function Jl(l){for(;l!=null;l=l.nextSibling){var t=l.nodeType;if(t===1||t===3)break;if(t===8){if(t=l.data,t==="$"||t==="$!"||t==="$?"||t==="$~"||t==="&"||t==="F!"||t==="F")break;if(t==="/$"||t==="/&")return null}}return l}var Wc=null;function Ws(l){l=l.nextSibling;for(var t=0;l;){if(l.nodeType===8){var e=l.data;if(e==="/$"||e==="/&"){if(t===0)return Jl(l.nextSibling);t--}else e!=="$"&&e!=="$!"&&e!=="$?"&&e!=="$~"&&e!=="&"||t++}l=l.nextSibling}return null}function $s(l){l=l.previousSibling;for(var t=0;l;){if(l.nodeType===8){var e=l.data;if(e==="$"||e==="$!"||e==="$?"||e==="$~"||e==="&"){if(t===0)return l;t--}else e!=="/$"&&e!=="/&"||t++}l=l.previousSibling}return null}function qm(l,t,e){switch(t=xn(e),l){case"html":if(l=t.documentElement,!l)throw Error(b(452));return l;case"head":if(l=t.head,!l)throw Error(b(453));return l;case"body":if(l=t.body,!l)throw Error(b(454));return l;default:throw Error(b(451))}}function Wa(l){for(var t=l.attributes;t.length;)l.removeAttributeNode(t[0]);ef(l)}var wl=new Map,ks=new Set;function Bn(l){return typeof l.getRootNode=="function"?l.getRootNode():l.nodeType===9?l:l.ownerDocument}var Ot=q.d;q.d={f:av,r:uv,D:nv,C:iv,L:cv,m:fv,X:sv,S:ov,M:dv};function av(){var l=Ot.f(),t=In();return l||t}function uv(l){var t=ma(l);t!==null&&t.tag===5&&t.type==="form"?Ud(t):Ot.r(l)}var ya=typeof document>"u"?null:document;function Ym(l,t,e){var a=ya;if(a&&typeof t=="string"&&t){var u=Zl(t);u='link[rel="'+l+'"][href="'+u+'"]',typeof e=="string"&&(u+='[crossorigin="'+e+'"]'),ks.has(u)||(ks.add(u),l={rel:l,crossOrigin:e,href:t},a.querySelector(u)===null&&(t=a.createElement("link"),ml(t,"link",l),il(t),a.head.appendChild(t)))}}function nv(l){Ot.D(l),Ym("dns-prefetch",l,null)}function iv(l,t){Ot.C(l,t),Ym("preconnect",l,t)}function cv(l,t,e){Ot.L(l,t,e);var a=ya;if(a&&l&&t){var u='link[rel="preload"][as="'+Zl(t)+'"]';t==="image"&&e&&e.imageSrcSet?(u+='[imagesrcset="'+Zl(e.imageSrcSet)+'"]',typeof e.imageSizes=="string"&&(u+='[imagesizes="'+Zl(e.imageSizes)+'"]')):u+='[href="'+Zl(l)+'"]';var n=u;switch(t){case"style":n=oa(l);break;case"script":n=ga(l)}wl.has(n)||(l=J({rel:"preload",href:t==="image"&&e&&e.imageSrcSet?void 0:l,as:t},e),wl.set(n,l),a.querySelector(u)!==null||t==="style"&&a.querySelector(Su(n))||t==="script"&&a.querySelector(Tu(n))||(t=a.createElement("link"),ml(t,"link",l),il(t),a.head.appendChild(t)))}}function fv(l,t){Ot.m(l,t);var e=ya;if(e&&l){var a=t&&typeof t.as=="string"?t.as:"script",u='link[rel="modulepreload"][as="'+Zl(a)+'"][href="'+Zl(l)+'"]',n=u;switch(a){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":n=ga(l)}if(!wl.has(n)&&(l=J({rel:"modulepreload",href:l},t),wl.set(n,l),e.querySelector(u)===null)){switch(a){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":if(e.querySelector(Tu(n)))return}a=e.createElement("link"),ml(a,"link",l),il(a),e.head.appendChild(a)}}}function ov(l,t,e){Ot.S(l,t,e);var a=ya;if(a&&l){var u=we(a).hoistableStyles,n=oa(l);t=t||"default";var i=u.get(n);if(!i){var c={loading:0,preload:null};if(i=a.querySelector(Su(n)))c.loading=5;else{l=J({rel:"stylesheet",href:l,"data-precedence":t},e),(e=wl.get(n))&&Zf(l,e);var f=i=a.createElement("link");il(f),ml(f,"link",l),f._p=new Promise(function(s,v){f.onload=s,f.onerror=v}),f.addEventListener("load",function(){c.loading|=1}),f.addEventListener("error",function(){c.loading|=2}),c.loading|=4,cn(i,t,a)}i={type:"stylesheet",instance:i,count:1,state:c},u.set(n,i)}}}function sv(l,t){Ot.X(l,t);var e=ya;if(e&&l){var a=we(e).hoistableScripts,u=ga(l),n=a.get(u);n||(n=e.querySelector(Tu(u)),n||(l=J({src:l,async:!0},t),(t=wl.get(u))&&jf(l,t),n=e.createElement("script"),il(n),ml(n,"link",l),e.head.appendChild(n)),n={type:"script",instance:n,count:1,state:null},a.set(u,n))}}function dv(l,t){Ot.M(l,t);var e=ya;if(e&&l){var a=we(e).hoistableScripts,u=ga(l),n=a.get(u);n||(n=e.querySelector(Tu(u)),n||(l=J({src:l,async:!0,type:"module"},t),(t=wl.get(u))&&jf(l,t),n=e.createElement("script"),il(n),ml(n,"link",l),e.head.appendChild(n)),n={type:"script",instance:n,count:1,state:null},a.set(u,n))}}function Fs(l,t,e,a){var u=(u=jt.current)?Bn(u):null;if(!u)throw Error(b(446));switch(l){case"meta":case"title":return null;case"style":return typeof e.precedence=="string"&&typeof e.href=="string"?(t=oa(e.href),e=we(u).hoistableStyles,a=e.get(t),a||(a={type:"style",instance:null,count:0,state:null},e.set(t,a)),a):{type:"void",instance:null,count:0,state:null};case"link":if(e.rel==="stylesheet"&&typeof e.href=="string"&&typeof e.precedence=="string"){l=oa(e.href);var n=we(u).hoistableStyles,i=n.get(l);if(i||(u=u.ownerDocument||u,i={type:"stylesheet",instance:null,count:0,state:{loading:0,preload:null}},n.set(l,i),(n=u.querySelector(Su(l)))&&!n._p&&(i.instance=n,i.state.loading=5),wl.has(l)||(e={rel:"preload",as:"style",href:e.href,crossOrigin:e.crossOrigin,integrity:e.integrity,media:e.media,hrefLang:e.hrefLang,referrerPolicy:e.referrerPolicy},wl.set(l,e),n||mv(u,l,e,i.state))),t&&a===null)throw Error(b(528,""));return i}if(t&&a!==null)throw Error(b(529,""));return null;case"script":return t=e.async,e=e.src,typeof e=="string"&&t&&typeof t!="function"&&typeof t!="symbol"?(t=ga(e),e=we(u).hoistableScripts,a=e.get(t),a||(a={type:"script",instance:null,count:0,state:null},e.set(t,a)),a):{type:"void",instance:null,count:0,state:null};default:throw Error(b(444,l))}}function oa(l){return'href="'+Zl(l)+'"'}function Su(l){return'link[rel="stylesheet"]['+l+"]"}function Gm(l){return J({},l,{"data-precedence":l.precedence,precedence:null})}function mv(l,t,e,a){l.querySelector('link[rel="preload"][as="style"]['+t+"]")?a.loading=1:(t=l.createElement("link"),a.preload=t,t.addEventListener("load",function(){return a.loading|=1}),t.addEventListener("error",function(){return a.loading|=2}),ml(t,"link",e),il(t),l.head.appendChild(t))}function ga(l){return'[src="'+Zl(l)+'"]'}function Tu(l){return"script[async]"+l}function Is(l,t,e){if(t.count++,t.instance===null)switch(t.type){case"style":var a=l.querySelector('style[data-href~="'+Zl(e.href)+'"]');if(a)return t.instance=a,il(a),a;var u=J({},e,{"data-href":e.href,"data-precedence":e.precedence,href:null,precedence:null});return a=(l.ownerDocument||l).createElement("style"),il(a),ml(a,"style",u),cn(a,e.precedence,l),t.instance=a;case"stylesheet":u=oa(e.href);var n=l.querySelector(Su(u));if(n)return t.state.loading|=4,t.instance=n,il(n),n;a=Gm(e),(u=wl.get(u))&&Zf(a,u),n=(l.ownerDocument||l).createElement("link"),il(n);var i=n;return i._p=new Promise(function(c,f){i.onload=c,i.onerror=f}),ml(n,"link",a),t.state.loading|=4,cn(n,e.precedence,l),t.instance=n;case"script":return n=ga(e.src),(u=l.querySelector(Tu(n)))?(t.instance=u,il(u),u):(a=e,(u=wl.get(n))&&(a=J({},e),jf(a,u)),l=l.ownerDocument||l,u=l.createElement("script"),il(u),ml(u,"link",a),l.head.appendChild(u),t.instance=u);case"void":return null;default:throw Error(b(443,t.type))}else t.type==="stylesheet"&&!(t.state.loading&4)&&(a=t.instance,t.state.loading|=4,cn(a,e.precedence,l));return t.instance}function cn(l,t,e){for(var a=e.querySelectorAll('link[rel="stylesheet"][data-precedence],style[data-precedence]'),u=a.length?a[a.length-1]:null,n=u,i=0;i<a.length;i++){var c=a[i];if(c.dataset.precedence===t)n=c;else if(n!==u)break}n?n.parentNode.insertBefore(l,n.nextSibling):(t=e.nodeType===9?e.head:e,t.insertBefore(l,t.firstChild))}function Zf(l,t){l.crossOrigin==null&&(l.crossOrigin=t.crossOrigin),l.referrerPolicy==null&&(l.referrerPolicy=t.referrerPolicy),l.title==null&&(l.title=t.title)}function jf(l,t){l.crossOrigin==null&&(l.crossOrigin=t.crossOrigin),l.referrerPolicy==null&&(l.referrerPolicy=t.referrerPolicy),l.integrity==null&&(l.integrity=t.integrity)}var fn=null;function Ps(l,t,e){if(fn===null){var a=new Map,u=fn=new Map;u.set(e,a)}else u=fn,a=u.get(e),a||(a=new Map,u.set(e,a));if(a.has(l))return a;for(a.set(l,null),e=e.getElementsByTagName(l),u=0;u<e.length;u++){var n=e[u];if(!(n[ru]||n[ol]||l==="link"&&n.getAttribute("rel")==="stylesheet")&&n.namespaceURI!=="http://www.w3.org/2000/svg"){var i=n.getAttribute(t)||"";i=l+i;var c=a.get(i);c?c.push(n):a.set(i,[n])}}return a}function l0(l,t,e){l=l.ownerDocument||l,l.head.insertBefore(e,t==="title"?l.querySelector("head > title"):null)}function rv(l,t,e){if(e===1||t.itemProp!=null)return!1;switch(l){case"meta":case"title":return!0;case"style":if(typeof t.precedence!="string"||typeof t.href!="string"||t.href==="")break;return!0;case"link":if(typeof t.rel!="string"||typeof t.href!="string"||t.href===""||t.onLoad||t.onError)break;switch(t.rel){case"stylesheet":return l=t.disabled,typeof t.precedence=="string"&&l==null;default:return!0}case"script":if(t.async&&typeof t.async!="function"&&typeof t.async!="symbol"&&!t.onLoad&&!t.onError&&t.src&&typeof t.src=="string")return!0}return!1}function Xm(l){return!(l.type==="stylesheet"&&!(l.state.loading&3))}function hv(l,t,e,a){if(e.type==="stylesheet"&&(typeof a.media!="string"||matchMedia(a.media).matches!==!1)&&!(e.state.loading&4)){if(e.instance===null){var u=oa(a.href),n=t.querySelector(Su(u));if(n){t=n._p,t!==null&&typeof t=="object"&&typeof t.then=="function"&&(l.count++,l=qn.bind(l),t.then(l,l)),e.state.loading|=4,e.instance=n,il(n);return}n=t.ownerDocument||t,a=Gm(a),(u=wl.get(u))&&Zf(a,u),n=n.createElement("link"),il(n);var i=n;i._p=new Promise(function(c,f){i.onload=c,i.onerror=f}),ml(n,"link",a),e.instance=n}l.stylesheets===null&&(l.stylesheets=new Map),l.stylesheets.set(e,t),(t=e.state.preload)&&!(e.state.loading&3)&&(l.count++,e=qn.bind(l),t.addEventListener("load",e),t.addEventListener("error",e))}}var tc=0;function vv(l,t){return l.stylesheets&&l.count===0&&on(l,l.stylesheets),0<l.count||0<l.imgCount?function(e){var a=setTimeout(function(){if(l.stylesheets&&on(l,l.stylesheets),l.unsuspend){var n=l.unsuspend;l.unsuspend=null,n()}},6e4+t);0<l.imgBytes&&tc===0&&(tc=62500*$1());var u=setTimeout(function(){if(l.waitingForImages=!1,l.count===0&&(l.stylesheets&&on(l,l.stylesheets),l.unsuspend)){var n=l.unsuspend;l.unsuspend=null,n()}},(l.imgBytes>tc?50:800)+t);return l.unsuspend=e,function(){l.unsuspend=null,clearTimeout(a),clearTimeout(u)}}:null}function qn(){if(this.count--,this.count===0&&(this.imgCount===0||!this.waitingForImages)){if(this.stylesheets)on(this,this.stylesheets);else if(this.unsuspend){var l=this.unsuspend;this.unsuspend=null,l()}}}var Yn=null;function on(l,t){l.stylesheets=null,l.unsuspend!==null&&(l.count++,Yn=new Map,t.forEach(yv,l),Yn=null,qn.call(l))}function yv(l,t){if(!(t.state.loading&4)){var e=Yn.get(l);if(e)var a=e.get(null);else{e=new Map,Yn.set(l,e);for(var u=l.querySelectorAll("link[data-precedence],style[data-precedence]"),n=0;n<u.length;n++){var i=u[n];(i.nodeName==="LINK"||i.getAttribute("media")!=="not all")&&(e.set(i.dataset.precedence,i),a=i)}a&&e.set(null,a)}u=t.instance,i=u.getAttribute("data-precedence"),n=e.get(i)||a,n===a&&e.set(null,u),e.set(i,u),this.count++,a=qn.bind(this),u.addEventListener("load",a),u.addEventListener("error",a),n?n.parentNode.insertBefore(u,n.nextSibling):(l=l.nodeType===9?l.head:l,l.insertBefore(u,l.firstChild)),t.state.loading|=4}}var iu={$$typeof:yt,Provider:null,Consumer:null,_currentValue:oe,_currentValue2:oe,_threadCount:0};function gv(l,t,e,a,u,n,i,c,f){this.tag=1,this.containerInfo=l,this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.next=this.pendingContext=this.context=this.cancelPendingCommit=null,this.callbackPriority=0,this.expirationTimes=Oi(-1),this.entangledLanes=this.shellSuspendCounter=this.errorRecoveryDisabledLanes=this.expiredLanes=this.warmLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=Oi(0),this.hiddenUpdates=Oi(null),this.identifierPrefix=a,this.onUncaughtError=u,this.onCaughtError=n,this.onRecoverableError=i,this.pooledCache=null,this.pooledCacheLanes=0,this.formState=f,this.incompleteTransitions=new Map}function Lm(l,t,e,a,u,n,i,c,f,s,v,y){return l=new gv(l,t,e,i,f,s,v,y,c),t=1,n===!0&&(t|=24),n=Ul(3,null,null,t),l.current=n,n.stateNode=l,t=vf(),t.refCount++,l.pooledCache=t,t.refCount++,n.memoizedState={element:a,isDehydrated:e,cache:t},bf(n),l}function Qm(l){return l?(l=je,l):je}function Zm(l,t,e,a,u,n){u=Qm(u),a.context===null?a.context=u:a.pendingContext=u,a=Kt(t),a.payload={element:e},n=n===void 0?null:n,n!==null&&(a.callback=n),e=Jt(l,a,t),e!==null&&(zl(e,l,t),La(e,l,t))}function t0(l,t){if(l=l.memoizedState,l!==null&&l.dehydrated!==null){var e=l.retryLane;l.retryLane=e!==0&&e<t?e:t}}function Vf(l,t){t0(l,t),(l=l.alternate)&&t0(l,t)}function jm(l){if(l.tag===13||l.tag===31){var t=pe(l,67108864);t!==null&&zl(t,l,67108864),Vf(l,67108864)}}function e0(l){if(l.tag===13||l.tag===31){var t=xl();t=lf(t);var e=pe(l,t);e!==null&&zl(e,l,t),Vf(l,t)}}var Gn=!0;function bv(l,t,e,a){var u=z.T;z.T=null;var n=q.p;try{q.p=2,Kf(l,t,e,a)}finally{q.p=n,z.T=u}}function Sv(l,t,e,a){var u=z.T;z.T=null;var n=q.p;try{q.p=8,Kf(l,t,e,a)}finally{q.p=n,z.T=u}}function Kf(l,t,e,a){if(Gn){var u=$c(a);if(u===null)Pi(l,t,a,Xn,e),a0(l,a);else if(Ev(u,l,t,e,a))a.stopPropagation();else if(a0(l,a),t&4&&-1<Tv.indexOf(l)){for(;u!==null;){var n=ma(u);if(n!==null)switch(n.tag){case 3:if(n=n.stateNode,n.current.memoizedState.isDehydrated){var i=ie(n.pendingLanes);if(i!==0){var c=n;for(c.pendingLanes|=2,c.entangledLanes|=2;i;){var f=1<<31-Nl(i);c.entanglements[1]|=f,i&=~f}it(n),!(B&6)&&(Dn=Rl()+500,bu(0,!1))}}break;case 31:case 13:c=pe(n,2),c!==null&&zl(c,n,2),In(),Vf(n,2)}if(n=$c(a),n===null&&Pi(l,t,a,Xn,e),n===u)break;u=n}u!==null&&a.stopPropagation()}else Pi(l,t,a,null,e)}}function $c(l){return l=uf(l),Jf(l)}var Xn=null;function Jf(l){if(Xn=null,l=Ye(l),l!==null){var t=ou(l);if(t===null)l=null;else{var e=t.tag;if(e===13){if(l=o0(t),l!==null)return l;l=null}else if(e===31){if(l=s0(t),l!==null)return l;l=null}else if(e===3){if(t.stateNode.current.memoizedState.isDehydrated)return t.tag===3?t.stateNode.containerInfo:null;l=null}else t!==l&&(l=null)}}return Xn=l,null}function Vm(l){switch(l){case"beforetoggle":case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"toggle":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 2;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 8;case"message":switch(ch()){case h0:return 2;case v0:return 8;case hn:case fh:return 32;case y0:return 268435456;default:return 32}default:return 32}}var kc=!1,$t=null,kt=null,Ft=null,cu=new Map,fu=new Map,Yt=[],Tv="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");function a0(l,t){switch(l){case"focusin":case"focusout":$t=null;break;case"dragenter":case"dragleave":kt=null;break;case"mouseover":case"mouseout":Ft=null;break;case"pointerover":case"pointerout":cu.delete(t.pointerId);break;case"gotpointercapture":case"lostpointercapture":fu.delete(t.pointerId)}}function Ua(l,t,e,a,u,n){return l===null||l.nativeEvent!==n?(l={blockedOn:t,domEventName:e,eventSystemFlags:a,nativeEvent:n,targetContainers:[u]},t!==null&&(t=ma(t),t!==null&&jm(t)),l):(l.eventSystemFlags|=a,t=l.targetContainers,u!==null&&t.indexOf(u)===-1&&t.push(u),l)}function Ev(l,t,e,a,u){switch(t){case"focusin":return $t=Ua($t,l,t,e,a,u),!0;case"dragenter":return kt=Ua(kt,l,t,e,a,u),!0;case"mouseover":return Ft=Ua(Ft,l,t,e,a,u),!0;case"pointerover":var n=u.pointerId;return cu.set(n,Ua(cu.get(n)||null,l,t,e,a,u)),!0;case"gotpointercapture":return n=u.pointerId,fu.set(n,Ua(fu.get(n)||null,l,t,e,a,u)),!0}return!1}function Km(l){var t=Ye(l.target);if(t!==null){var e=ou(t);if(e!==null){if(t=e.tag,t===13){if(t=o0(e),t!==null){l.blockedOn=t,Lo(l.priority,function(){e0(e)});return}}else if(t===31){if(t=s0(e),t!==null){l.blockedOn=t,Lo(l.priority,function(){e0(e)});return}}else if(t===3&&e.stateNode.current.memoizedState.isDehydrated){l.blockedOn=e.tag===3?e.stateNode.containerInfo:null;return}}}l.blockedOn=null}function sn(l){if(l.blockedOn!==null)return!1;for(var t=l.targetContainers;0<t.length;){var e=$c(l.nativeEvent);if(e===null){e=l.nativeEvent;var a=new e.constructor(e.type,e);hc=a,e.target.dispatchEvent(a),hc=null}else return t=ma(e),t!==null&&jm(t),l.blockedOn=e,!1;t.shift()}return!0}function u0(l,t,e){sn(l)&&e.delete(t)}function pv(){kc=!1,$t!==null&&sn($t)&&($t=null),kt!==null&&sn(kt)&&(kt=null),Ft!==null&&sn(Ft)&&(Ft=null),cu.forEach(u0),fu.forEach(u0)}function wu(l,t){l.blockedOn===t&&(l.blockedOn=null,kc||(kc=!0,ul.unstable_scheduleCallback(ul.unstable_NormalPriority,pv)))}var Wu=null;function n0(l){Wu!==l&&(Wu=l,ul.unstable_scheduleCallback(ul.unstable_NormalPriority,function(){Wu===l&&(Wu=null);for(var t=0;t<l.length;t+=3){var e=l[t],a=l[t+1],u=l[t+2];if(typeof a!="function"){if(Jf(a||e)===null)continue;break}var n=ma(e);n!==null&&(l.splice(t,3),t-=3,Hc(n,{pending:!0,data:u,method:e.method,action:a},a,u))}}))}function sa(l){function t(f){return wu(f,l)}$t!==null&&wu($t,l),kt!==null&&wu(kt,l),Ft!==null&&wu(Ft,l),cu.forEach(t),fu.forEach(t);for(var e=0;e<Yt.length;e++){var a=Yt[e];a.blockedOn===l&&(a.blockedOn=null)}for(;0<Yt.length&&(e=Yt[0],e.blockedOn===null);)Km(e),e.blockedOn===null&&Yt.shift();if(e=(l.ownerDocument||l).$$reactFormReplay,e!=null)for(a=0;a<e.length;a+=3){var u=e[a],n=e[a+1],i=u[Al]||null;if(typeof n=="function")i||n0(e);else if(i){var c=null;if(n&&n.hasAttribute("formAction")){if(u=n,i=n[Al]||null)c=i.formAction;else if(Jf(u)!==null)continue}else c=i.action;typeof c=="function"?e[a+1]=c:(e.splice(a,3),a-=3),n0(e)}}}function Jm(){function l(n){n.canIntercept&&n.info==="react-transition"&&n.intercept({handler:function(){return new Promise(function(i){return u=i})},focusReset:"manual",scroll:"manual"})}function t(){u!==null&&(u(),u=null),a||setTimeout(e,20)}function e(){if(!a&&!navigation.transition){var n=navigation.currentEntry;n&&n.url!=null&&navigation.navigate(n.url,{state:n.getState(),info:"react-transition",history:"replace"})}}if(typeof navigation=="object"){var a=!1,u=null;return navigation.addEventListener("navigate",l),navigation.addEventListener("navigatesuccess",t),navigation.addEventListener("navigateerror",t),setTimeout(e,100),function(){a=!0,navigation.removeEventListener("navigate",l),navigation.removeEventListener("navigatesuccess",t),navigation.removeEventListener("navigateerror",t),u!==null&&(u(),u=null)}}}function wf(l){this._internalRoot=l}ti.prototype.render=wf.prototype.render=function(l){var t=this._internalRoot;if(t===null)throw Error(b(409));var e=t.current,a=xl();Zm(e,a,l,t,null,null)};ti.prototype.unmount=wf.prototype.unmount=function(){var l=this._internalRoot;if(l!==null){this._internalRoot=null;var t=l.containerInfo;Zm(l.current,2,null,l,null,null),In(),t[da]=null}};function ti(l){this._internalRoot=l}ti.prototype.unstable_scheduleHydration=function(l){if(l){var t=E0();l={blockedOn:null,target:l,priority:t};for(var e=0;e<Yt.length&&t!==0&&t<Yt[e].priority;e++);Yt.splice(e,0,l),e===0&&Km(l)}};var i0=c0.version;if(i0!=="19.2.7")throw Error(b(527,i0,"19.2.7"));q.findDOMNode=function(l){var t=l._reactInternals;if(t===void 0)throw typeof l.render=="function"?Error(b(188)):(l=Object.keys(l).join(","),Error(b(268,l)));return l=lh(t),l=l!==null?d0(l):null,l=l===null?null:l.stateNode,l};var zv={bundleType:0,version:"19.2.7",rendererPackageName:"react-dom",currentDispatcherRef:z,reconcilerVersion:"19.2.7"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"&&(Ha=__REACT_DEVTOOLS_GLOBAL_HOOK__,!Ha.isDisabled&&Ha.supportsFiber))try{su=Ha.inject(zv),Cl=Ha}catch{}var Ha;ei.createRoot=function(l,t){if(!f0(l))throw Error(b(299));var e=!1,a="",u=Yd,n=Gd,i=Xd;return t!=null&&(t.unstable_strictMode===!0&&(e=!0),t.identifierPrefix!==void 0&&(a=t.identifierPrefix),t.onUncaughtError!==void 0&&(u=t.onUncaughtError),t.onCaughtError!==void 0&&(n=t.onCaughtError),t.onRecoverableError!==void 0&&(i=t.onRecoverableError)),t=Lm(l,1,!1,null,null,e,a,null,u,n,i,Jm),l[da]=t.current,Qf(l),new wf(t)};ei.hydrateRoot=function(l,t,e){if(!f0(l))throw Error(b(299));var a=!1,u="",n=Yd,i=Gd,c=Xd,f=null;return e!=null&&(e.unstable_strictMode===!0&&(a=!0),e.identifierPrefix!==void 0&&(u=e.identifierPrefix),e.onUncaughtError!==void 0&&(n=e.onUncaughtError),e.onCaughtError!==void 0&&(i=e.onCaughtError),e.onRecoverableError!==void 0&&(c=e.onRecoverableError),e.formState!==void 0&&(f=e.formState)),t=Lm(l,1,!0,t,e??null,a,u,f,n,i,c,Jm),t.context=Qm(null),e=t.current,a=xl(),a=lf(a),u=Kt(a),u.callback=null,Jt(e,u,a),e=a,t.current.lanes=e,mu(t,e),it(t),l[da]=t.current,Qf(l),new ti(t)};ei.version="19.2.7"});var km=Il((ry,$m)=>{"use strict";function Wm(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(Wm)}catch(l){console.error(l)}}Wm(),$m.exports=wm()});var dr=Il(ui=>{"use strict";var Xv=Symbol.for("react.transitional.element"),Lv=Symbol.for("react.fragment");function sr(l,t,e){var a=null;if(e!==void 0&&(a=""+e),t.key!==void 0&&(a=""+t.key),"key"in t){e={};for(var u in t)u!=="key"&&(e[u]=t[u])}else e=t;return t=e.ref,{$$typeof:Xv,type:l,key:a,ref:t!==void 0?t:null,props:e}}ui.Fragment=Lv;ui.jsx=sr;ui.jsxs=sr});var _e=Il((zy,mr)=>{"use strict";mr.exports=dr()});var io=\`/* timeline-src/styles.css\\r
 * Codex-style fixed panel on the chat's left side.\\r
 *\\r
 * Plain stack of bars \\u2014 no pill background. Bars packed with light gap.\\r
 * Gray (light) + black palette. Rail caps at 50 bars (405px tall) so even\\r
 * 100+ user messages stay navigable; beyond that the rail scrolls via\\r
 * mouse wheel \\u2014 the scrollbar itself is fully hidden (no right-side\\r
 * chrome visible).\\r
 */\\r
\\r
.zcode-timeline-host {\\r
  position: fixed;\\r
  /* JS computes the correct \\\`left\\\` to align with the chat scroll container's\\r
   * left edge (after ZCode's sidebar). The default below is a fallback. */\\r
  left: 272px;\\r
  top: 50%;\\r
  transform: translateY(-50%);\\r
  pointer-events: none;\\r
  z-index: 2147483600;\\r
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif;\\r
}\\r
\\r
.zcode-timeline-host * {\\r
  box-sizing: border-box;\\r
}\\r
\\r
/* ============== Rail ============== */\\r
.zcode-timeline-rail {\\r
  /* pointer-events: auto so the rail captures mouse wheel input \\u2014 the\\r
   * scrollbar itself is hidden (rules below) but wheel still drives\\r
   * overflow-y:auto. Side effect: clicks on the rail's empty space\\r
   * (the 4px top + 4px bottom padding, the 3px gaps between bars, and\\r
   * the ~3-5px on each side of the centered 14-17px bar) are captured\\r
   * here instead of falling through to the chat underneath. */\\r
  pointer-events: auto;\\r
  position: relative;\\r
  display: flex;\\r
  flex-direction: column;\\r
  align-items: center;\\r
  gap: 3px;                          /* 5 (bar) + 3 (gap) = 8 per slot */\\r
  width: 24px;\\r
  padding: 4px 0;\\r
  margin: 0;\\r
  /* Cap at exactly 50 bars tall. For \\u226450 bars the rail is shorter and\\r
   * stays centered vertically (host uses top:50% + translateY(-50%)).\\r
   * For >50 bars the rail locks at 405px and overflow-y:auto takes over\\r
   * \\u2014 the user wheels over the rail to navigate beyond. The Panel\\r
   * useEffect continues to call scrollIntoView({block:'center'}) on the\\r
   * active bar so it stays in view as the chat scrolls. The scrollbar\\r
   * itself is intentionally hidden (see scrollbar-width and the\\r
   * ::-webkit-scrollbar rule below) so the rail shows zero chrome.\\r
   *\\r
   * Math: 50 bars \\xD7 5px + 49 gaps \\xD7 3px + 4+4 padding = 405px. */\\r
  max-height: 405px;\\r
  overflow-y: auto;\\r
  /* Firefox 64+: hide the scrollbar without disabling overflow. */\\r
  scrollbar-width: none;\\r
  z-index: 2147483640;\\r
}\\r
\\r
/* WebKit/Chromium/Safari: also hide the scrollbar. Keeping the selector\\r
 * (with width:0 / display:none) instead of deleting it makes the\\r
 * override explicit and survives "Initialize-style" injection from\\r
 * ZCode's host page that might otherwise re-add a default WebKit\\r
 * scrollbar to scrollable elements. */\\r
.zcode-timeline-rail::-webkit-scrollbar {\\r
  width: 0;\\r
  height: 0;\\r
  display: none;\\r
}\\r
\\r
/* ============== Wrapper around rail (hosts absolute-positioned chevrons) ============== */\\r
/* The wrapper reserves vertical padding so the chevron strokes (\\u22488px tall\\r
 * with 3px round strokes) sit inside the padding zone without overlapping\\r
 * the first/last bar. 12px on each side gives ~8px of visual breathing\\r
 * room between the indicator's stroke end and the first/last bar. The\\r
 * wrapper's padding flows into the host's auto-height; the host's\\r
 * \\\`top:50%; transform:translateY(-50%)\\\` compensates so the rail's center\\r
 * stays put in the viewport. */\\r
.zcode-timeline-rail-wrapper {\\r
  position: relative;\\r
  padding: 12px 0;\\r
}\\r
\\r
/* ============== Chevron (overflow indicators) ============== */\\r
/* Static \\u2227 / \\u2228 caret markers at the top and bottom of the rail,\\r
 * signaling "more bars scroll this way". Drawn as SVG polylines with:\\r
 *   - stroke-width 3px  \\u2192 same thickness as the inactive bar dot\\r
 *   - stroke-linecap round + stroke-linejoin round  \\u2192 ends and apex\\r
 *     are perfect hemispheres, matching the bar-dot's border-radius:999px\\r
 * So each chevron visually reads as "two short thick pill-bars meeting\\r
 * at a rounded peak" \\u2014 same pill-shape grammar as the rest of the rail.\\r
 * Color matches the inactive bar dot. Rendered as siblings of the rail\\r
 * inside the wrapper (NOT inside the rail's flex column), so they don't\\r
 * take flex slots or contribute to scrollHeight. Conditional render \\u2014\\r
 * Panel's overflow useEffect removes them when there's no overflow in\\r
 * that direction. */\\r
.zcode-timeline-chevron {\\r
  position: absolute;\\r
  left: 50%;\\r
  transform: translateX(-50%);\\r
  width: 14px;\\r
  height: 8px;\\r
  pointer-events: none;\\r
  z-index: 2;\\r
  color: rgba(180, 185, 195, 0.55);  /* matches default bar-dot fill */\\r
}\\r
.zcode-timeline-chevron--up   { top: 0; }\\r
.zcode-timeline-chevron--down { bottom: 0; }\\r
.zcode-timeline-chevron svg {\\r
  display: block;\\r
  width: 100%;\\r
  height: 100%;\\r
  stroke: currentColor;\\r
  fill: none;\\r
  stroke-width: 3;                          /* matches .zcode-timeline-bar-dot height */\\r
  stroke-linecap: round;                    /* hemispherical ends \\u2192 like bar-dot pill caps */\\r
  stroke-linejoin: round;                   /* apex is rounded instead of mitered peak */\\r
}\\r
@media (prefers-color-scheme: dark) {\\r
  .zcode-timeline-chevron { color: rgba(170, 175, 185, 0.45); }\\r
}\\r
\\r
/* ============== Bar ============== */\\r
.zcode-timeline-bar {\\r
  position: relative;\\r
  flex: 0 0 auto;\\r
  width: 14px;\\r
  height: 5px;\\r
  padding: 0;\\r
  margin: 0;\\r
  border: none;\\r
  background: transparent;\\r
  cursor: pointer;\\r
  pointer-events: auto;\\r
  outline: none;\\r
  display: flex;\\r
  align-items: center;\\r
  justify-content: center;\\r
  transition: width 220ms cubic-bezier(0.4, 0, 0.2, 1),\\r
              height 220ms cubic-bezier(0.4, 0, 0.2, 1),\\r
              transform 220ms cubic-bezier(0.4, 0, 0.2, 1);\\r
}\\r
\\r
.zcode-timeline-bar-dot {\\r
  display: block;\\r
  width: 100%;\\r
  height: 3px;\\r
  border-radius: 999px;\\r
  background: rgba(180, 185, 195, 0.55);   /* lighter gray (default) */\\r
  transition: background-color 220ms ease,\\r
              height 220ms ease,\\r
              width 220ms ease;\\r
}\\r
\\r
/* Staircase:\\r
 *   is-primary = the bar in focus (hovered, or closest to viewport center)\\r
 *   is-near-1  = one slot away from primary \\u2014 slightly thicker, darker\\r
 *   is-near-2  = two slots away from primary \\u2014 a bit thicker, slightly darker\\r
 * Only one bar is primary at any time.\\r
 */\\r
\\r
/* distance 2 \\u2014 second-nearest to primary */\\r
.zcode-timeline-bar.is-near-2 .zcode-timeline-bar-dot {\\r
  height: 4px;\\r
  background: rgba(135, 140, 150, 0.75);\\r
}\\r
\\r
/* distance 1 \\u2014 nearest neighbor to primary */\\r
.zcode-timeline-bar.is-near-1 .zcode-timeline-bar-dot {\\r
  height: 4px;\\r
  background: rgba(70, 75, 85, 0.9);\\r
}\\r
\\r
/* distance 0 \\u2014 primary (active) */\\r
.zcode-timeline-bar.is-primary {\\r
  width: 17px;                       /* 1.2x of 14px default */\\r
}\\r
.zcode-timeline-bar.is-primary .zcode-timeline-bar-dot {\\r
  height: 5px;\\r
  background: #111;\\r
}\\r
\\r
.zcode-timeline-bar:focus-visible {\\r
  outline: 2px solid #111;\\r
  outline-offset: 2px;\\r
}\\r
\\r
/* dark theme \\u2014 flip gray to lighter gray, black stays near-white */\\r
@media (prefers-color-scheme: dark) {\\r
  .zcode-timeline-bar-dot { background: rgba(170, 175, 185, 0.45); }\\r
  .zcode-timeline-bar.is-near-2 .zcode-timeline-bar-dot { background: rgba(195, 200, 210, 0.65); }\\r
  .zcode-timeline-bar.is-near-1 .zcode-timeline-bar-dot { background: rgba(220, 225, 232, 0.85); }\\r
  .zcode-timeline-bar.is-primary .zcode-timeline-bar-dot { background: #f5f5f7; }\\r
  .zcode-timeline-bar:focus-visible { outline-color: #f5f5f7; }\\r
}\\r
\\r
/* ============== Tooltip ============== */\\r
/* Lightweight prompt hint \\u2014 first 100 chars of the user message. */\\r
.zcode-timeline-tooltip {\\r
  pointer-events: none;\\r
  position: fixed;\\r
  /* left/top set inline by JS to follow the hovered bar */\\r
  width: 280px;\\r
  max-width: 32vw;\\r
  overflow: hidden;\\r
  text-overflow: ellipsis;\\r
  white-space: nowrap;\\r
  background: rgba(28, 30, 36, 0.96);\\r
  color: #f1f3f5;\\r
  border-radius: 6px;\\r
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.30);\\r
  padding: 6px 10px;\\r
  font-size: 12px;\\r
  line-height: 1.4;\\r
  z-index: 2147483647;\\r
  animation: zcode-tl-fade-in 120ms ease-out;\\r
}\\r
\\r
@keyframes zcode-tl-fade-in {\\r
  from { opacity: 0; transform: translateX(-4px); }\\r
  to   { opacity: 1; transform: translateX(0); }\\r
}\`;var ct=Pl(Sa(),1),Er=Pl(km(),1);var rl={messages:[],hoveredId:null,tooltipId:null,clickedId:null,clickedAt:0},$f=new Set;function Dt(){return rl}function Ae(l){let t=rl.messages;if(t!==l){if(t.length===l.length){let e=!0;for(let a=0;a<t.length;a++)if(t[a]!==l[a]&&t[a].id!==l[a].id){e=!1;break}if(e)return}rl.messages=l,pu()}}function ai(l){rl.hoveredId!==l&&(rl.hoveredId=l,pu())}var Av=200,Eu=null,Wf=null;function Fm(l){Eu!=null&&(clearTimeout(Eu),Eu=null),Wf=l,Eu=setTimeout(()=>{Eu=null;let t=Wf;Wf=null,rl.hoveredId===t&&(rl.hoveredId=null,pu())},Av)}function Im(l){rl.tooltipId!==l&&(rl.tooltipId=l,pu())}function Pm(){rl.hoveredId===null&&rl.tooltipId===null&&rl.clickedId===null&&rl.clickedAt===0||(rl.hoveredId=null,rl.tooltipId=null,rl.clickedId=null,rl.clickedAt=0,pu())}function pu(){for(let l of $f)try{l()}catch{}}function lr(l){return $f.add(l),()=>$f.delete(l)}var ni=Pl(Sa(),1);var kf=['[data-message-author-role="user"]','[data-author="user"]','[data-role="user"]','article[data-message-author-role="user"]','[data-author-role="user"]','[data-message-id][data-role="user"]','[aria-label="user message"]','[aria-label="User message"]','[aria-label*="user message" i]','[class*="userMessage" i]','[class*="UserMessage" i]','[class*="user-message" i]','[class*="user_message" i]','[class*="humanMessage" i]','[class*="HumanMessage" i]'],zu=kf.slice();function tr(l){let t=l,e=null;for(;t&&t!==document.body;){let u=window.getComputedStyle(t).overflowY;(u==="auto"||u==="scroll"||u==="overlay")&&t.scrollHeight-t.clientHeight>100&&(!e||t.scrollHeight<e.size)&&(e={el:t,size:t.scrollHeight}),t=t.parentElement}return e?.el??null}function er(l=document.body){let t={},e=null;for(let a of zu){let u=0;try{u=l.querySelectorAll(a).length}catch{}t[a]=u,!e&&u>0&&(e=a)}return{matches:t,firstHit:e}}function ar(l){let t=l&&l.length?l:zu;for(let e of t){let a=[];try{a=Array.from(document.querySelectorAll(e))}catch{continue}if(a.length>0)return a}return[]}function _v(){return\`u_\${Math.random().toString(36).slice(2,10)}_\${Date.now().toString(36)}\`}function Mv(l){let t=[l.dataset?.messageId,l.dataset?.id,l.getAttribute("data-id"),l.getAttribute("id")];for(let e of t)if(e&&e.length>0&&e.length<200)return e;return _v()}var Ff=String.raw\`(?:\u5DF2)?(?:\u7F16\u8F91|\u5220\u9664|\u590D\u5236|\u56DE\u590D|\u5F15\u7528|\u64A4\u56DE|\u8F6C\u53D1|\u5206\u4EAB|\u8D5E|\u6536\u85CF|\u66F4\u591A|edited|deleted|copied)\`,If=String.raw\`\\d{1,2}:\\d{2}(?::\\d{2})?\`,Wl=String.raw\`[\\s\\p{Z}\\p{P}]*\`,ir=String.raw\`(?:[\xB7\\u00B7\\-\u2013\u2014][\\s\\p{Z}\\p{P}]*)?\`,Ov=['[role="toolbar"]','[role="group"][aria-label*="message actions" i]','[aria-label*="message actions" i]',"[data-message-actions]",'[data-testid*="message-actions" i]','[class*="messageActions" i]','[class*="MessageActions" i]','[class*="message-actions" i]','[class*="Message-actions" i]'],Dv=String.raw\`(?:\\d{1,2}:\\d{2}(?::\\d{2})?|(?:\u5DF2)?(?:\u7F16\u8F91|\u5220\u9664|\u590D\u5236|\u56DE\u590D|\u5F15\u7528|\u64A4\u56DE|\u8F6C\u53D1|\u5206\u4EAB|\u8D5E|\u6536\u85CF|\u66F4\u591A))\`,Uv=new RegExp(String.raw\`^[\\s\\p{Z}\\p{P}]*(?:\${Dv}[\\s\\p{Z}\\p{P}]*)+$\`,"u"),Hv=new RegExp(\`\${Wl}\${If}\${Wl}\${ir}\${Wl}\${Ff}?\${Wl}$\`,"u"),Rv=new RegExp(\`\${Wl}\${Ff}\${Wl}\${ir}\${Wl}\${If}\${Wl}$\`,"u"),Cv=new RegExp(\`\${Wl}\${If}\${Wl}$\`,"u"),Nv=new RegExp(\`\${Wl}\${Ff}\${Wl}$\`,"u");function ur(l){if(l.matches(Ov.join(",")))return!0;let t=(l.textContent||"").trim();return!!(t.length>0&&t.length<120&&Uv.test(t))}function xv(l){let t=l.cloneNode(!0);for(let u of Array.from(t.querySelectorAll("*")))ur(u)&&u.remove();let e=t.lastElementChild;e&&ur(e)&&e.remove();let a=(t.textContent||"").replace(/\\s+/g," ").trim();return a.length<8&&(a=(t.innerText||a||"").replace(/\\s+/g," ").trim()),a=a.replace(Hv,""),a=a.replace(Rv,""),a=a.replace(Cv,""),a=a.replace(Nv,""),a.slice(0,400)}function Bv(l,t){if(t&&t.contains(l)){let a=l.offsetTop;return t.scrollTop+a}return l.getBoundingClientRect().top+window.scrollY}function qv(l,t){if(!t){let u=l,n=0;for(;u&&(n+=u.offsetTop,u=u.offsetParent,u!==document.body););return n}let e=l.getBoundingClientRect(),a=t.getBoundingClientRect();return e.top-a.top+t.scrollTop}function Yv(l){return l.offsetTop}var nr=new WeakMap;function Gv(l){let t=l.textContent||"";return\`\${t.length}:\${t.slice(0,60)}\`}function ba(){let l=ar(),t=l[0]?tr(l[0]):null;return l.map(a=>{let u=qv(a,t),n=Yv(a),i=Gv(a),c=nr.get(a),f,s;return c&&c.hash===i&&a.isConnected?(f=c.text,s=c.id):(f=xv(a),s=Mv(a),nr.set(a,{text:f,id:s,hash:i})),{id:s,el:a,text:f,rect:()=>a.getBoundingClientRect(),getAbsoluteTop:()=>Bv(a,t),scrollContentTop:u,scrollOffsetTop:n}})}var Au=null;function cr(l){if(Au)return Au;let t="",e=!1,a=null,u=null,n=s=>{u!==s&&(a&&u&&a.disconnect(),a||(a=new MutationObserver(c)),a.observe(s,{childList:!0,subtree:!0}),u=s)},i=()=>{e=!1;try{let s=ba();n(document.body);let v=s.map(y=>\`\${y.id}:\${Math.round(y.getAbsoluteTop()/4)}\`).join("|");v!==t&&(t=v,Ae(s),l(s))}catch{}},c=()=>{e||(e=!0,requestAnimationFrame(()=>setTimeout(i,200)))};i();let f=()=>{e||(e=!0,requestAnimationFrame(()=>setTimeout(i,250)))};return window.addEventListener("resize",f,{passive:!0}),window.addEventListener("scroll",f,{passive:!0}),Au={stop:()=>{a&&a.disconnect(),window.removeEventListener("resize",f),window.removeEventListener("scroll",f),a=null,u=null,Au=null}},Au}function fr(l){if(!Array.isArray(l))return;let t=l.length===0?kf.slice():l.slice();zu.splice(0,zu.length,...t);let e=ba();Ae(e)}function or(l,t=-1,e="smooth"){let a=l.el;if(a&&a.isConnected){try{a.scrollIntoView({behavior:e,block:"center"})}catch{}return l}let u;try{u=ba(),Ae(u)}catch{return null}let n=null;if(t>=0&&t<u.length){let i=u[t];i.el.isConnected&&(n=i)}if(!n){let i=u.find(c=>c.id===l.id);i&&i.el.isConnected&&(n=i)}if(!n&&t===u.length-1&&u.length>0){let i=u[u.length-1];i.el.isConnected&&(n=i)}if(!n)return null;try{n.el.scrollIntoView({behavior:e,block:"center"})}catch{}return n}var Pf=Pl(_e(),1),rr=500,Qv=({anchor:l,index:t,primaryIndex:e,setPrimary:a,setTooltip:u,onPick:n})=>{let i=ni.useRef(null),c=(l.text||"(empty message)").replace(/\\s+/g," "),f=c.length>80?\`\${c.slice(0,80)}\\u2026\`:c,s=e==null?1/0:Math.abs(t-e),v=["zcode-timeline-bar"];e!=null&&s===0?v.push("is-primary"):s===1?v.push("is-near-1"):s===2&&v.push("is-near-2");let y=()=>{i.current!=null&&(clearTimeout(i.current),i.current=null)},m=()=>{a(l.id),y(),i.current=setTimeout(()=>{i.current=null,u(l.id)},rr)},h=()=>{Fm(l.id),y(),u(null)},S=()=>{a(l.id),y(),i.current=setTimeout(()=>{i.current=null,u(l.id)},rr)},E=()=>{a(null),y(),u(null)};return ni.useEffect(()=>()=>{y()},[]),(0,Pf.jsx)("button",{className:v.join(" "),"data-tl-id":l.id,"data-tl-index":t,"data-tl-distance":s,onMouseEnter:m,onMouseLeave:h,onFocus:S,onBlur:E,onClick:O=>{O.preventDefault(),ai(null),n(l),or(l,t),u(null)},"aria-label":f,children:(0,Pf.jsx)("span",{className:"zcode-timeline-bar-dot"})})},hr=Qv;var br=Pl(pi(),1),Tr=Pl(_e(),1),vr=100,_u=8,Zv=280,yr=40,gr=(l,t,e)=>Math.max(t,Math.min(e,l)),jv=({anchor:l})=>{let t=l?.text??"";if(!l||!t)return null;let e=t.replace(/\\s+/g," ").trim(),a=e.length>vr?e.slice(0,vr)+"\\u2026":e,u=null,n=null,i=l.id?document.querySelector(\`.zcode-timeline-bar[data-tl-id="\${CSS.escape(l.id)}"]\`):null;if(i){let s=i.getBoundingClientRect();u=s.top+s.height/2}let c=document.querySelector(".zcode-timeline-rail");if(c&&(n=c.getBoundingClientRect().right+_u),n!=null){let s=window.innerWidth-Zv-_u;n=gr(n,_u,s)}u!=null&&(u=gr(u,_u+yr/2,window.innerHeight-_u-yr/2));let f={left:n!=null?\`\${n}px\`:"56px",top:u!=null?\`\${u}px\`:"50%",transform:"translateY(-50%)"};return(0,br.createPortal)((0,Tr.jsx)("div",{className:"zcode-timeline-tooltip",style:f,children:a}),document.body)},Sr=jv;var vl=Pl(_e(),1),uo=0,Vv=1500,Kv=({anchors:l,primaryIndex:t,setPrimary:e,setTooltip:a,onBarClick:u})=>{let n=ct.useRef(null),i=ct.useRef(null),c=ct.useRef(null),[f,s]=ct.useState(!1),[v,y]=ct.useState(!1);return ct.useEffect(()=>{if(i.current=t,t==null||t<0)return;let m=n.current;m&&c.current==null&&(c.current=requestAnimationFrame(()=>{c.current=null;let h=Dt(),S=i.current;if(S==null||S<0||h.hoveredId!=null||!(Date.now()-uo<200))return;let O=m.querySelector(\`.zcode-timeline-bar[data-tl-index="\${S}"]\`);if(!O)return;let d=O.getBoundingClientRect(),o=m.getBoundingClientRect();d.top>=o.top&&d.bottom<=o.bottom||O.scrollIntoView({block:"center",behavior:"instant"})}))},[t]),ct.useEffect(()=>{let m=n.current;if(!m)return;let h=()=>{let E=m.scrollTop>0,O=m.scrollTop+m.clientHeight<m.scrollHeight-1;s(d=>d===E?d:E),y(d=>d===O?d:O)};h(),m.addEventListener("scroll",h,{passive:!0});let S=new ResizeObserver(h);return S.observe(m),()=>{m.removeEventListener("scroll",h),S.disconnect()}},[]),(0,vl.jsxs)("div",{className:"zcode-timeline-rail-wrapper",children:[f&&(0,vl.jsx)("span",{className:"zcode-timeline-chevron zcode-timeline-chevron--up","aria-hidden":"true",children:(0,vl.jsx)("svg",{viewBox:"0 0 14 8",width:"14",height:"8",children:(0,vl.jsx)("polyline",{points:"2,7 7,2 12,7"})})}),(0,vl.jsx)("div",{ref:n,className:"zcode-timeline-rail",children:l.map((m,h)=>(0,vl.jsx)(hr,{anchor:m,index:h,primaryIndex:t,setPrimary:e,setTooltip:a,onPick:u},m.id))}),v&&(0,vl.jsx)("span",{className:"zcode-timeline-chevron zcode-timeline-chevron--down","aria-hidden":"true",children:(0,vl.jsx)("svg",{viewBox:"0 0 14 8",width:"14",height:"8",children:(0,vl.jsx)("polyline",{points:"2,1 7,6 12,1"})})})]})};function lo(){let l=[...document.querySelectorAll(".h-full.overflow-y-auto"),...document.querySelectorAll("[data-chat-scroll]")];for(let t of l)if(t.clientHeight>200&&(t.scrollHeight>t.clientHeight+50||t.scrollTop>0))return t;return l[0]??null}var Jv=l=>ai(l),wv=l=>Im(l),Wv=l=>{};function to(l=-1){let{messages:t}=Dt();if(!t||t.length===0)return-1;let e=window.innerHeight/2;if(l>=0&&l<t.length){let n=t[l];if(n.el&&n.el.isConnected){let i=n.el.getBoundingClientRect();if(Math.abs(i.top+i.height/2-e)<window.innerHeight/2)return l}}let a=-1,u=1/0;for(let n=0;n<t.length;n++){let i=t[n];if(!i.el||!i.el.isConnected)continue;let c=i.el.getBoundingClientRect(),f=c.top+c.height/2,s=Math.abs(f-e);s<u&&(u=s,a=n)}return a}function eo(l,t){if(l.dead||globalThis.__zcodeTimelineInstance__!==l)return;let{root:e,host:a}=l;if(!a||!e)return;let u=t.messages??[],n=t.hoveredId==null?null:u.findIndex(s=>s.id===t.hoveredId),i;n!=null&&n>=0?i=n:i=l.cachedCenterIndex;let c=t.tooltipId==null?null:u.findIndex(s=>s.id===t.tooltipId),f=c!=null&&c>=0?u[c]:null;e.render((0,vl.jsxs)(vl.Fragment,{children:[(0,vl.jsx)(Kv,{anchors:u,primaryIndex:i>=0?i:null,setPrimary:Jv,setTooltip:wv,onBarClick:Wv}),(0,vl.jsx)(Sr,{anchor:f,index:c??0,total:u.length})]}))}function $v(l){let t=!1,e=()=>{if(t=!1,l.dead||Date.now()-l.lastTypedAt<Vv)return;let c=to(l.cachedCenterIndex);c!==l.cachedCenterIndex&&c>=0&&(l.cachedCenterIndex=c,eo(l,Dt()))},a=()=>{uo=Date.now(),!l.dead&&(t||(t=!0,requestAnimationFrame(e)))},u=null,n=()=>{if(l.dead)return null;let c=lo();if(c!==u){if(u&&l.observers.scroll)try{u.removeEventListener("scroll",l.observers.scroll.handler)}catch{}c?(c.addEventListener("scroll",a,{passive:!0}),l.observers.scroll={target:c,handler:a}):l.observers.scroll=null,u=c}return c};if(n(),typeof ResizeObserver<"u"){let c=new ResizeObserver(()=>{if(l.dead||globalThis.__zcodeTimelineInstance__!==l)return;let f=n()??lo();if(f){let s=f.getBoundingClientRect();try{l.host.style.left=\`\${Math.max(0,Math.round(s.left))+4}px\`}catch{}}a()});c.observe(document.body),l.observers.ro=c}let i=new MutationObserver(()=>{l.dead||n()});i.observe(document.body,{childList:!0,subtree:!0}),l.observers.chatRoot=i}function kv(){document.querySelectorAll(".zcode-timeline-host").forEach(e=>e.remove()),document.querySelectorAll(".zcode-timeline-tooltip").forEach(e=>e.remove());let l=document.createElement("div");l.className="zcode-timeline-host",document.body.appendChild(l);let t=lo();if(t){let e=t.getBoundingClientRect();l.style.left=\`\${Math.max(0,Math.round(e.left))+4}px\`}return l}function ao(l){if(l.dead=!0,globalThis.__zcodeTimelineInstance__===l&&(globalThis.__zcodeTimelineInstance__=null),l.unsubscribe)try{l.unsubscribe()}catch{}if(l.observers.scroll)try{l.observers.scroll.target.removeEventListener("scroll",l.observers.scroll.handler)}catch{}if(l.observers.ro)try{l.observers.ro.disconnect()}catch{}if(l.observers.chatRoot)try{l.observers.chatRoot.disconnect()}catch{}try{l.root.unmount()}catch{}if(l.host.parentElement)try{l.host.parentElement.removeChild(l.host)}catch{}for(let t of document.querySelectorAll(".zcode-timeline-tooltip"))try{t.remove()}catch{}}function pr(){Pm(),uo=Date.now(),globalThis.__zcodeTimelineInstance__&&ao(globalThis.__zcodeTimelineInstance__);let l=kv(),t;try{t=(0,Er.createRoot)(l)}catch(u){console.error("[zcode-timeline] createRoot failed:",u),l.remove();return}let e={root:t,host:l,cachedCenterIndex:to(),lastTypedAt:0,generation:0,unsubscribe:null,observers:{scroll:null,resize:null,ro:null,chatRoot:null},destroy:()=>ao(e),dead:!1,lastMessagesLen:Dt().messages.length,lastMessagesRef:Dt().messages};e.unsubscribe=lr(()=>{if(e.dead||globalThis.__zcodeTimelineInstance__!==e)return;let u=Dt();if(u.messages!==e.lastMessagesRef||u.messages.length!==e.lastMessagesLen){let n=u.messages.length>e.lastMessagesLen;e.lastMessagesRef=u.messages,e.lastMessagesLen=u.messages.length,n&&u.messages.length>0?(e.cachedCenterIndex=u.messages.length-1,e.lastTypedAt=Date.now()):e.cachedCenterIndex=to()}eo(e,Dt())}),$v(e),globalThis.__zcodeTimelineInstance__=e;let a=Dt();eo(e,{messages:a.messages,hoveredId:a.hoveredId,tooltipId:a.tooltipId})}function zr(){globalThis.__zcodeTimelineInstance__&&ao(globalThis.__zcodeTimelineInstance__)}var Ml=null;function Fv(){for(let l of document.querySelectorAll("style[data-zcode-timeline]"))l!==Ml&&l.remove();(!Ml||!Ml.isConnected)&&(Ml=document.querySelector("style[data-zcode-timeline]")),Ml||(Ml=document.createElement("style"),Ml.setAttribute("data-zcode-timeline",""),document.head.appendChild(Ml)),Ml.textContent=io}var ii=null;function Iv(){ii||(ii=cr(()=>{}))}function Pv(){ii?.stop(),ii=null}function Ar(){try{let l=ba();Ae(l),Fv(),pr(),Iv()}catch(l){console.error("[zcode-timeline] mount failed:",l)}}function ly(){Pv(),zr(),Ml&&Ml.parentElement&&Ml.parentElement.removeChild(Ml),Ml=null}function ty(){Ar()}function ey(l){fr(l)}function ay(){let l=er(document.body);return console.log("[zcode-timeline] DOM diagnose:",l),l}typeof window<"u"&&(window.__ZCODE_TIMELINE_MOUNT__=Ar,window.__ZCODE_TIMELINE_UNMOUNT__=ly,window.__ZCODE_TIMELINE_REFRESH__=ty,window.__ZCODE_TIMELINE_SET_SELECTORS__=ey,window.__ZCODE_TIMELINE_DIAGNOSE__=ay);})();
/*! Bundled license information:

react/cjs/react.production.js:
  (**
   * @license React
   * react.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

scheduler/cjs/scheduler.production.js:
  (**
   * @license React
   * scheduler.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react-dom/cjs/react-dom.production.js:
  (**
   * @license React
   * react-dom.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react-dom/cjs/react-dom-client.production.js:
  (**
   * @license React
   * react-dom-client.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react/cjs/react-jsx-runtime.production.js:
  (**
   * @license React
   * react-jsx-runtime.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)
*/

    const mountTimeline = () => {
      try {
        if (typeof window.__ZCODE_TIMELINE_MOUNT__ === 'function') {
          window.__ZCODE_TIMELINE_LOADED__ = true;
          window.__ZCODE_TIMELINE_MOUNT__();
        }
      } catch (e) {
        console.error('[zcode-timeline] mount failed:', e);
      }
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', mountTimeline, { once: true });
    } else {
      mountTimeline();
    }
  } catch (e) {
    console.error('[zcode-timeline] bundle failed:', e);
  }
})();
`, "utf8");
    log2(`  Wrote embedded bundle to: ${bundlePath}`);
  } catch (e) {
    err2(`  Failed to materialize bundle: ${e.message}`);
    err2(`  Make sure ${DEFAULT_INSTALL_DIR} is writable.`);
    pauseOnError();
    process.exit(1);
  }
  log2("Patching ZCode...");
  await install({
    zcodeExePath: zcodeInfo.exePath,
    installBundlePath: bundlePath,
    stateFile: (0, import_node_path9.join)(DEFAULT_INSTALL_DIR, ".state.json"),
    stagingDir: (0, import_node_path9.join)(DEFAULT_INSTALL_DIR, ".asar-staging"),
    onLog: log2
  });
  if (noRestart) {
    log2("--no-restart set; restart ZCode manually to activate.");
  } else {
    log2("Restarting ZCode...");
    const child = (0, import_node_child_process3.spawn)(zcodeInfo.exePath, [], {
      detached: true,
      stdio: "ignore",
      windowsHide: false
    });
    child.unref();
    log2(`  Launched ZCode (pid ${child.pid ?? "?"}).`);
  }
  log2("");
  log2("========================================");
  log2("  Timeline installed. Welcome.");
  log2("========================================");
}
var isDevDirectInvocation = require("node:url").pathToFileURL(__filename).href === `file://${process.argv[1]}`;
if (isDevDirectInvocation) {
  main().catch((e) => {
    err2("Install failed:", e && e.message ? e.message : String(e));
    if (process.env.ZCODE_TIMELINE_DEBUG && e && e.stack) err2(e.stack);
    pauseOnError();
    process.exit(1);
  });
}
function pauseOnError() {
  if (process.platform !== "win32") return;
  err2("");
  err2(`Full log: ${LOG_FILE}`);
  err2("Press any key to close this window...");
  try {
    (0, import_node_child_process3.execSync)("pause", { stdio: "inherit" });
  } catch {
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  main
});

if (require.main === module) {
  module.exports.main().catch((e) => {
    var ts = new Date().toISOString().slice(11, 23);
    console.error('[' + ts + '] Install failed:', e && e.message ? e.message : String(e));
    if (process.env.ZCODE_TIMELINE_DEBUG && e && e.stack) {
      console.error(e.stack);
    }
    if (process.platform === 'win32') {
      console.error('');
      var __logFile = process.env.ZCODE_TIMELINE_LOG || (require('os').homedir() + require('path').sep + '.zcode-timeline-install.log');
      console.error('Full log: ' + __logFile);
      console.error('Press any key to close this window...');
      try { require('child_process').execSync('pause', { stdio: 'inherit' }); } catch (_) {}
    }
    process.exit(1);
  });
}

