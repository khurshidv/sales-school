#!/usr/bin/env node
// ============================================================
// translate-yandex.mjs
//
// Batch-translates all `uz: "..."` values in a TypeScript file
// via the free web endpoint of Yandex Translate (ru → uz).
//
// Requires a warm session captured from a live browser:
//   scripts/.yandex-session.json  — contains { sid, yu, yum, cookies, userAgent }
//
// The SID is ephemeral (~1h). If requests start returning 403,
// open translate.yandex.ru in Playwright MCP, trigger one
// translation to warm the session, copy SID + cookies from
// the network log, and update .yandex-session.json.
//
// Usage:
//   node scripts/translate-yandex.mjs [--dry-run] <file> [file...]
//
// Files left untouched by design (user manually edited Day 1):
//   game/data/scenarios/car-dealership/day1.ts
//   lib/i18n.tsx (marketing site)
// ============================================================

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SESSION_PATH = path.join(__dirname, '.yandex-session.json');
const BATCH_SIZE = 20;
// Raw char budget (Cyrillic urlencodes to ~3x, so ~1500 chars → ~4500 bytes form body)
const BATCH_MAX_CHARS = 1200;
const BATCH_SLEEP_MS = 600;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ─── Session ─────────────────────────────────────────────────

let session = null;
async function loadSession() {
  if (session) return session;
  const raw = await fs.readFile(SESSION_PATH, 'utf8');
  session = JSON.parse(raw);
  if (!session.sid || !session.yu || !session.yum || !session.cookies) {
    throw new Error('.yandex-session.json is missing required fields (sid, yu, yum, cookies)');
  }
  return session;
}

// ─── Yandex API call ─────────────────────────────────────────

async function translateBatch(texts, retries = 3) {
  const s = await loadSession();
  const params = new URLSearchParams();
  for (const t of texts) params.append('text', t);
  params.append('options', '4');

  const url =
    `https://translate.yandex.net/api/v1/tr.json/translate?id=${s.sid}-0-0` +
    `&srv=tr-text&source_lang=ru&target_lang=uz&reason=paste&format=text` +
    `&strategy=0&disable_cache&ajax=1&yu=${s.yu}&yum=${s.yum}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': s.userAgent,
      Cookie: s.cookies,
      Referer: 'https://translate.yandex.ru/',
      Origin: 'https://translate.yandex.ru',
      Accept: 'application/json',
      'Accept-Language': 'ru,en;q=0.9',
    },
    body: params.toString(),
  });

  if (!res.ok) {
    if ((res.status === 429 || res.status >= 500) && retries > 0) {
      await sleep(5000);
      return translateBatch(texts, retries - 1);
    }
    if (res.status === 413 && texts.length > 1) {
      // Payload too large — split batch in half and retry
      const mid = Math.ceil(texts.length / 2);
      const a = await translateBatch(texts.slice(0, mid), retries);
      await sleep(300);
      const b = await translateBatch(texts.slice(mid), retries);
      return [...a, ...b];
    }
    if (res.status === 403) {
      throw new Error(
        'Yandex 403 — session SID expired. Refresh scripts/.yandex-session.json ' +
          'via Playwright MCP (trigger a fresh translation on translate.yandex.ru).'
      );
    }
    throw new Error(`Yandex translate HTTP ${res.status}`);
  }

  const data = await res.json();
  if (data.code !== 200) {
    if (data.code === 405 || data.code === 403 || data.code === 401) {
      throw new Error(
        `Yandex API code ${data.code}: ${data.message || ''} — session expired, refresh session.`
      );
    }
    throw new Error(`Yandex API code ${data.code}: ${data.message || ''}`);
  }
  if (!Array.isArray(data.text) || data.text.length !== texts.length) {
    throw new Error(
      `Yandex response length mismatch: sent ${texts.length}, got ${data.text?.length}`
    );
  }
  return data.text;
}

// ─── JS string literal encode/decode ─────────────────────────

function decodeJsString(literal) {
  const quote = literal[0];
  const inner = literal.slice(1, -1);
  if (quote === '"') {
    try { return JSON.parse(literal); } catch {/* fall through */}
  }
  let out = '';
  for (let i = 0; i < inner.length; i++) {
    const c = inner[i];
    if (c === '\\') {
      const next = inner[i + 1];
      switch (next) {
        case "'": out += "'"; i++; break;
        case '"': out += '"'; i++; break;
        case '\\': out += '\\'; i++; break;
        case 'n': out += '\n'; i++; break;
        case 'r': out += '\r'; i++; break;
        case 't': out += '\t'; i++; break;
        case '`': out += '`'; i++; break;
        default: out += next ?? ''; i++; break;
      }
    } else {
      out += c;
    }
  }
  return out;
}

function encodeJsString(str, preferQuote) {
  let quote = preferQuote || "'";
  // Auto-flip to avoid excessive escaping
  if (quote === "'" && str.includes("'") && !str.includes('"')) quote = '"';
  else if (quote === '"' && str.includes('"') && !str.includes("'")) quote = "'";
  let out = quote;
  for (const c of str) {
    if (c === quote) out += '\\' + c;
    else if (c === '\\') out += '\\\\';
    else if (c === '\n') out += '\\n';
    else if (c === '\r') out += '\\r';
    else if (c === '\t') out += '\\t';
    else out += c;
  }
  out += quote;
  return out;
}

// ─── Pair extraction ─────────────────────────────────────────

const PROP_RE =
  /\b(uz|ru)\s*:\s*('(?:\\[\s\S]|[^'\\])*'|"(?:\\[\s\S]|[^"\\])*")/g;

function findPairs(content) {
  const matches = [];
  let m;
  PROP_RE.lastIndex = 0;
  while ((m = PROP_RE.exec(content)) !== null) {
    const literalStart = m.index + m[0].length - m[2].length;
    matches.push({
      key: m[1],
      literal: m[2],
      start: literalStart,
      end: m.index + m[0].length,
      fullStart: m.index,
    });
  }
  const pairs = [];
  let i = 0;
  while (i < matches.length - 1) {
    const a = matches[i];
    const b = matches[i + 1];
    if (a.key !== b.key) {
      const between = content.slice(a.end, b.fullStart);
      if (/^[\s,]*$/.test(between)) {
        const uz = a.key === 'uz' ? a : b;
        const ru = a.key === 'ru' ? a : b;
        pairs.push({ uz, ru });
        i += 2;
        continue;
      }
    }
    i += 1;
  }
  return pairs;
}

// ─── Placeholder protection ──────────────────────────────────

function protectPlaceholders(text) {
  const placeholders = [];
  const protectedText = text.replace(/\{[^}]+\}/g, (match) => {
    const token = `XZZX${placeholders.length}XZZX`;
    placeholders.push(match);
    return token;
  });
  return { protectedText, placeholders };
}

function restorePlaceholders(text, placeholders) {
  let out = text;
  placeholders.forEach((ph, i) => {
    const tokenRe = new RegExp(`XZZX${i}XZZX`, 'gi');
    out = out.replace(tokenRe, ph);
  });
  return out;
}

// ─── Process one file ────────────────────────────────────────

async function processFile(filePath, { dryRun }) {
  const content = await fs.readFile(filePath, 'utf8');
  const pairs = findPairs(content);
  const rel = path.relative(process.cwd(), filePath);
  console.log(`\n[${rel}] found ${pairs.length} uz/ru pairs`);
  if (pairs.length === 0) return { changed: 0 };

  const ruTexts = pairs.map((p) => decodeJsString(p.ru.literal));
  const protections = ruTexts.map(protectPlaceholders);

  // Group into batches bounded by both BATCH_SIZE and BATCH_MAX_CHARS
  const batches = [];
  {
    let cur = [];
    let curChars = 0;
    for (const p of protections) {
      const len = p.protectedText.length;
      if (
        cur.length > 0 &&
        (cur.length >= BATCH_SIZE || curChars + len > BATCH_MAX_CHARS)
      ) {
        batches.push(cur);
        cur = [];
        curChars = 0;
      }
      cur.push(p);
      curChars += len;
    }
    if (cur.length) batches.push(cur);
  }

  const newUzTexts = [];
  let cursor = 0;
  for (let b = 0; b < batches.length; b++) {
    const batch = batches[b].map((p) => p.protectedText);
    const from = cursor + 1;
    const to = cursor + batch.length;
    process.stdout.write(`  translating ${from}-${to}/${protections.length} ... `);
    const translated = await translateBatch(batch);
    for (let j = 0; j < translated.length; j++) {
      newUzTexts.push(restorePlaceholders(translated[j], batches[b][j].placeholders));
    }
    cursor += batch.length;
    console.log('ok');
    if (b < batches.length - 1) await sleep(BATCH_SLEEP_MS);
  }

  // Placeholder sanity check
  let warnings = 0;
  for (let i = 0; i < pairs.length; i++) {
    const origPh = (ruTexts[i].match(/\{[^}]+\}/g) || []).sort();
    const newPh = (newUzTexts[i].match(/\{[^}]+\}/g) || []).sort();
    if (JSON.stringify(origPh) !== JSON.stringify(newPh)) {
      warnings++;
      console.warn(`  ⚠ placeholder mismatch at idx ${i}:`);
      console.warn(`    ru  : ${ruTexts[i].slice(0, 80)}`);
      console.warn(`    uz  : ${newUzTexts[i].slice(0, 80)}`);
      console.warn(`    orig: ${origPh.join(', ')}`);
      console.warn(`    new : ${newPh.join(', ')}`);
    }
  }
  if (warnings) console.warn(`  ${warnings} placeholder warnings`);

  let newContent = content;
  for (let i = pairs.length - 1; i >= 0; i--) {
    const pair = pairs[i];
    const originalQuote = pair.uz.literal[0];
    const newLiteral = encodeJsString(newUzTexts[i], originalQuote);
    newContent =
      newContent.slice(0, pair.uz.start) + newLiteral + newContent.slice(pair.uz.end);
  }

  if (dryRun) {
    console.log(`  [DRY RUN] would replace ${pairs.length} uz literals`);
    for (let i = 0; i < Math.min(5, pairs.length); i++) {
      console.log(`    - ${pairs[i].uz.literal.slice(0, 120)}`);
      console.log(
        `    + ${encodeJsString(newUzTexts[i], pairs[i].uz.literal[0]).slice(0, 120)}`
      );
    }
  } else {
    await fs.writeFile(filePath, newContent, 'utf8');
    console.log(`  wrote ${pairs.length} uz replacements → ${rel}`);
  }
  return { changed: pairs.length };
}

// ─── CLI ─────────────────────────────────────────────────────

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const files = args.filter((a) => !a.startsWith('--'));

if (files.length === 0) {
  console.error('Usage: node scripts/translate-yandex.mjs [--dry-run] <file> [file...]');
  process.exit(1);
}

(async () => {
  let totalChanged = 0;
  for (const file of files) {
    const abs = path.resolve(file);
    try {
      const { changed } = await processFile(abs, { dryRun });
      totalChanged += changed;
    } catch (err) {
      console.error(`\n✖ Error processing ${file}: ${err.message}`);
      process.exit(1);
    }
  }
  console.log(
    `\n✓ Done. ${dryRun ? 'Would change' : 'Changed'} ${totalChanged} strings total.`
  );
})();
