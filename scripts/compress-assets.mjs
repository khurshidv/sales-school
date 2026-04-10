#!/usr/bin/env node
/**
 * compress-assets.mjs — one-shot JPG compression for scenario assets.
 *
 * Walks public/assets/scenarios/ and re-encodes every .jpg/.jpeg larger
 * than 200 KB with sharp + mozjpeg at quality 80, resizing to sensible
 * maxima per subfolder. Originals are backed up to
 * public/assets/.backup/<relpath> so the run is fully reversible.
 *
 * Idempotent: skips files already compressed (detected via backup presence
 * or size < threshold). Safe to re-run.
 *
 * Usage: node scripts/compress-assets.mjs [--dry-run] [--force]
 *
 * Dependencies: sharp (already installed transitively via next).
 */

import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const ASSETS_ROOT = path.join(PROJECT_ROOT, 'public/assets/scenarios');
const BACKUP_ROOT = path.join(PROJECT_ROOT, 'public/assets/.backup');

const THRESHOLD_BYTES = 200 * 1024; // 200 KB
const JPEG_QUALITY = 80;

const DRY_RUN = process.argv.includes('--dry-run');
const FORCE = process.argv.includes('--force');

/**
 * Resize targets per subfolder. "max" is the longest edge.
 * Backgrounds and ui are displayed full-screen in 16:9 landscape —
 * 1920x1080 is plenty for mobile + desktop HiDPI.
 */
function getResizeTarget(relPath) {
  const lower = relPath.toLowerCase();
  if (lower.includes('/characters/')) return { width: 768, height: 768, fit: 'inside' };
  if (lower.includes('/cars/')) return { width: 1024, height: 1024, fit: 'inside' };
  // backgrounds, ui, cutscenes
  return { width: 1920, height: 1080, fit: 'inside' };
}

async function* walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue; // skip .backup and hidden
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(full);
    } else {
      yield full;
    }
  }
}

function humanBytes(bytes) {
  if (bytes > 1024 * 1024) return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  if (bytes > 1024) return (bytes / 1024).toFixed(0) + ' KB';
  return bytes + ' B';
}

async function fileExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true });
}

async function compressOne(absPath) {
  const rel = path.relative(PROJECT_ROOT, absPath);
  const ext = path.extname(absPath).toLowerCase();
  if (ext !== '.jpg' && ext !== '.jpeg') return null;

  const stat = await fs.stat(absPath);
  if (stat.size < THRESHOLD_BYTES && !FORCE) {
    return { rel, skipped: 'below threshold', before: stat.size };
  }

  // Check backup — if already present, assume we already compressed this file.
  const backupPath = path.join(
    BACKUP_ROOT,
    path.relative(path.join(PROJECT_ROOT, 'public/assets'), absPath),
  );
  if (!FORCE && (await fileExists(backupPath))) {
    return { rel, skipped: 'already compressed (backup exists)', before: stat.size };
  }

  const target = getResizeTarget(absPath);
  const tmpPath = absPath + '.tmp-compress';

  if (DRY_RUN) {
    return { rel, dryRun: true, before: stat.size };
  }

  // Write compressed version to temp
  await sharp(absPath)
    .resize({
      width: target.width,
      height: target.height,
      fit: target.fit,
      withoutEnlargement: true,
    })
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true, progressive: true })
    .toFile(tmpPath);

  const newStat = await fs.stat(tmpPath);

  // Safety: if compressed is larger than original, skip (keep original).
  if (newStat.size >= stat.size) {
    await fs.unlink(tmpPath);
    return { rel, skipped: 'no savings', before: stat.size, after: newStat.size };
  }

  // Backup original, then replace in place.
  await ensureDir(path.dirname(backupPath));
  await fs.copyFile(absPath, backupPath);
  await fs.rename(tmpPath, absPath);

  return { rel, before: stat.size, after: newStat.size };
}

async function main() {
  console.log('=== compress-assets.mjs ===');
  console.log('Root:     ' + ASSETS_ROOT);
  console.log('Backup:   ' + BACKUP_ROOT);
  console.log('Threshold:' + humanBytes(THRESHOLD_BYTES));
  console.log('Quality:  ' + JPEG_QUALITY + ' (mozjpeg)');
  console.log('Mode:     ' + (DRY_RUN ? 'DRY RUN (no writes)' : 'WRITE'));
  if (FORCE) console.log('Force:    yes (ignore backup check)');
  console.log('');

  const results = [];
  let totalBefore = 0;
  let totalAfter = 0;
  let processed = 0;
  let skipped = 0;

  for await (const file of walk(ASSETS_ROOT)) {
    const result = await compressOne(file);
    if (!result) continue;
    results.push(result);
    totalBefore += result.before ?? 0;
    totalAfter += result.after ?? result.before ?? 0;
    if (result.skipped) {
      skipped++;
    } else {
      processed++;
      const saved = (result.before ?? 0) - (result.after ?? 0);
      const pct = result.before ? Math.round((saved / result.before) * 100) : 0;
      console.log(
        `  ✓ ${result.rel.padEnd(80)} ${humanBytes(result.before ?? 0).padStart(10)} → ${humanBytes(result.after ?? 0).padStart(10)}  (-${pct}%)`,
      );
    }
  }

  console.log('');
  console.log('=== Summary ===');
  console.log('Processed: ' + processed);
  console.log('Skipped:   ' + skipped);
  console.log('Total before: ' + humanBytes(totalBefore));
  console.log('Total after:  ' + humanBytes(totalAfter));
  const savedTotal = totalBefore - totalAfter;
  const pctTotal = totalBefore ? Math.round((savedTotal / totalBefore) * 100) : 0;
  console.log(`Saved:        ${humanBytes(savedTotal)} (-${pctTotal}%)`);
  console.log('');
  console.log('Originals backed up to: ' + BACKUP_ROOT);
  console.log('To rollback: mv public/assets/.backup/<file> back to its original path.');
}

main().catch((err) => {
  console.error('ERROR:', err);
  process.exit(1);
});
