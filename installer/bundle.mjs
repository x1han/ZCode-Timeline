// Build helper: bundles installer/installer.mjs (ESM, with launcher/zcode-finder
// imports) into a single CommonJS file at installer/installer.cjs.
//
// We need this because @yao-pkg/pkg's static analysis does not follow
// dynamic `import()` calls into ESM files, and packaging ESM entries
// directly produces ERR_REQUIRE_ESM at runtime. A pre-bundled CJS file
// sidesteps both problems.

import { build } from 'esbuild';
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..');

// Pre-built timeline bundle is inlined into the installer as a string
// constant so the .exe doesn't need to clone the repo, run npm install,
// or invoke the build step at install time. The cloned public repo's
// build.mjs doesn't emit this file (that's a local refactor we haven't
// pushed yet), so this is the only way to make the .exe fully
// self-contained without forcing a git push first.
const installBundlePath = resolve(PROJECT_ROOT, 'dist', 'timeline.install.iife.js');
const installBundleSource = readFileSync(installBundlePath, 'utf8');

const out = resolve(__dirname, 'installer.cjs');
if (existsSync(out)) rmSync(out);

await build({
  // Replace the placeholder with the bundle content (as a JS string literal).
  // esbuild `define` only accepts entity names or JSON syntax — JSON.stringify
  // gives us a valid JS expression.
  define: {
    __TIMELINE_INSTALL_BUNDLE_PLACEHOLDER__: JSON.stringify(installBundleSource),
  },
  entryPoints: [resolve(__dirname, 'installer.mjs')],
  bundle: true,
  platform: 'node',
  target: 'node22',
  format: 'cjs',
  outfile: out,
  // We launch ZCode via spawn() — keep Node built-ins external, but esbuild
  // bundles relative file imports by default which is what we want.
  external: [],
  // Always call main() when this bundle is executed. We dropped the
  // import.meta.url guard in installer.mjs because pkg's process.argv[1]
  // is empty for snapshot-loaded scripts, so the guard never fired
  // there. Bundling now ensures main() runs whenever the .exe is invoked.
  footer: {
    js: `
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
`,
  },
  logLevel: 'info',
});

// Post-process: esbuild turns `import.meta.url` into `import_meta.url`
// where `import_meta` is an empty `{}` shim. Multiple bundled modules
// rely on this (asar-patcher.mjs's __dirname, install.mjs's
// isDirectInvocation, installer.mjs's isDevDirectInvocation, and
// @electron/asar's wrapped-fs.js's createRequire). esbuild assigns a
// unique shim name per module (import_meta, import_meta2, import_meta3,
// import_meta4, ...). Populate every shim's `.url` so all those usages
// resolve to a real file URL.
{
  const text = readFileSync(out, 'utf8');
  let fixed = text;

  // 1. Populate every empty `var import_meta\d* = {};` shim with a real url.
  fixed = fixed.replace(
    /var (import_meta\d*) = \{\};/g,
    'var $1 = { url: require("node:url").pathToFileURL(__filename).href };',
  );

  // 2. As a belt-and-suspenders fallback, replace any remaining
  //    `import_meta\d*\.url` references with the pathToFileURL expression
  //    directly. (After step 1 this should be a no-op.)
  fixed = fixed.replace(
    /(import_meta\d*)\.url/g,
    'require("node:url").pathToFileURL(__filename).href',
  );

  if (fixed !== text) {
    writeFileSync(out, fixed, 'utf8');
    console.log(`[bundle] patched ${out} (import.meta.url fix)`);
  }
}

console.log(`[bundle] wrote ${out}`);