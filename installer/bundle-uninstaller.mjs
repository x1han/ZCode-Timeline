// Build helper: bundles installer/uninstaller.mjs (ESM, with launcher/zcode-finder
// + launcher/install.mjs imports) into a single CommonJS file at
// installer/uninstaller.cjs.
//
// Why a separate bundler from installer/bundle.mjs?
//   - The installer bundles in a multi-MB timeline.install.iife.js as a
//     string constant via __TIMELINE_INSTALL_BUNDLE_PLACEHOLDER__. The
//     uninstaller has no such embedding — its only job is to call
//     restoreOriginal() against ZCode's app.asar — so we can keep this
//     bundler trivial.
//   - Keeping the two bundles independent means a future regression in
//     the install-time bundle (e.g., a new esbuild transform that breaks
//     IIFE bundling) can't also break the uninstaller.

import { build } from 'esbuild';
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const out = resolve(__dirname, 'uninstaller.cjs');
if (existsSync(out)) rmSync(out);

await build({
  entryPoints: [resolve(__dirname, 'uninstaller.mjs')],
  bundle: true,
  platform: 'node',
  target: 'node22',
  format: 'cjs',
  outfile: out,
  external: [],
  // Always call main() when this bundle is executed. The
  // `require.main === module` check that installer/bundle.mjs uses
  // doesn't reliably fire inside a pkg snapshot — both .exe files use
  // the same footer pattern in source, but installer.cjs happens to
  // also have a snapshot path where require.main equals module while
  // uninstaller.cjs does not (the snapshot loader seems to be tied to
  // whether the entry was loaded from the prebuilt cache or freshly
  // re-bundled, possibly because the bundle has different module
  // counts). Unconditionally invoking main() at the bottom is safe:
  // uninstaller.cjs is only ever used as the .exe entry point or
  // imported as a library, never as a nested dependency.
  // Always call main() when this bundle is executed. The
  // `require.main === module` check used by installer/bundle.mjs is
  // technically cleaner but unreliable in pkg snapshots (it depends on
  // whether pkg uses the snapshot's bundled main module as require.main,
  // which varies by pkg version and entry structure). Unconditionally
  // invoking main() at the bottom is safe: uninstaller.cjs is only ever
  // used as the .exe entry point or imported as a library, never as a
  // nested dependency, so a top-level invocation can only fire once.
  footer: {
    js: `
module.exports.main().catch((e) => {
  var ts = new Date().toISOString().slice(11, 23);
  console.error('[' + ts + '] Uninstall failed:', e && e.message ? e.message : String(e));
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
`,
  },
  logLevel: 'info',
});

// Post-process: same import.meta.url fix as installer/bundle.mjs.
{
  const text = readFileSync(out, 'utf8');
  let fixed = text;

  fixed = fixed.replace(
    /var (import_meta\d*) = \{\};/g,
    'var $1 = { url: require("node:url").pathToFileURL(__filename).href };',
  );
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