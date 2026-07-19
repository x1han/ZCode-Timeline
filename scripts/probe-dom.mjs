// scripts/probe-dom.mjs
// Connect to an already-running ZCode via CDP, dump the DOM head, and report
// which user-message selectors match.
//
// Use:   start ZCode normally, then run `npm run probe`.

import CDP from 'chrome-remote-interface';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const PORT = 9229;

const SELECTORS = [
  '[data-message-author-role="user"]',
  '[data-author="user"]',
  '[data-role="user"]',
  'article[data-message-author-role="user"]',
  '[data-author-role="user"]',
  '[data-message-id][data-role="user"]',
  '[aria-label="user message"]',
  '[aria-label="User message"]',
  '[aria-label*="user message" i]',
  '[class*="userMessage" i]',
  '[class*="UserMessage" i]',
  '[class*="user-message" i]',
  '[class*="user_message" i]',
];

async function main() {
  const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
  const targets = await res.json();
  const target = targets.find((t) => t.type === 'page' && !t.url.startsWith('devtools://'));
  if (!target) {
    console.error('[probe] no page target on port', PORT, '— is ZCode running?');
    process.exit(1);
  }

  const client = await CDP({ host: '127.0.0.1', port: PORT, target: target.id });
  const { Runtime, DOM } = client;
  await Promise.all([Runtime.enable(), DOM.enable()]);

  // Build diagnostic snippet
  const dump = `
    (function(){
      var results = {};
      var selectors = ${JSON.stringify(SELECTORS)};
      for (var i = 0; i < selectors.length; i++) {
        var sel = selectors[i];
        try {
          results[sel] = document.querySelectorAll(sel).length;
        } catch (e) {
          results[sel] = 'ERR ' + e.message;
        }
      }
      return {
        url: location.href,
        title: document.title,
        matches: results,
        htmlHead: document.documentElement.outerHTML.slice(0, 4000),
        mainSample: (document.querySelector('main, [role="main"]') || document.body).outerHTML.slice(0, 6000),
      };
    })()
  `;

  const { result } = await Runtime.evaluate({
    expression: dump,
    returnByValue: true,
    awaitPromise: false,
  });
  await client.close();

  const data = result.value;
  const out = {
    target: { id: target.id, url: target.url, title: target.title },
    page: { url: data.url, title: data.title },
    matches: data.matches,
    htmlHead: data.htmlHead,
    mainSample: data.mainSample,
  };
  const outPath = resolve(process.cwd(), 'dist-types', 'probe-result.json');
  mkdirSync(resolve(process.cwd(), 'dist-types'), { recursive: true });
  writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf8');

  console.log('[probe] target', target.id, '@', target.url);
  console.log('[probe] page title:', data.title);
  console.log('[probe] matches:');
  for (const [sel, count] of Object.entries(data.matches)) {
    console.log(`  ${String(count).padStart(4)}  ${sel}`);
  }
  console.log(`[probe] full report: ${outPath}`);
}

main().catch((e) => {
  console.error('[probe] failed:', e);
  process.exit(1);
});
