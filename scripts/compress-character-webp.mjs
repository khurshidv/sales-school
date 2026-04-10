#!/usr/bin/env node
/**
 * compress-character-webp.mjs — re-encode character sprites.
 *
 * 44 character WebP files in public/assets/scenarios/car-dealership/characters/
 * were generated at 896×1200px. The game displays them at most ~800px tall
 * in landscape, so we downscale to 768px height + re-encode at quality 70.
 * Expected: 6.1 MB → ~4.1 MB (~33% saving).
 *
 * Originals are backed up to public/assets/.backup/characters-pre-q70/
 * for safe rollback.
 *
 * Usage: node scripts/compress-character-webp.mjs [--dry-run]
 */

import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(
  PROJECT_ROOT,
  'public/assets/scenarios/car-dealership/characters',
);
const BACKUP_DIR = path.join(
  PROJECT_ROOT,
  'public/assets/.backup/characters-pre-q70',
);

const MAX_HEIGHT = 1024;
const MAX_WIDTH = 768;
const QUALITY = 70;
const DRY_RUN = process.argv.includes('--dry-run');

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

async function main() {
  console.log('=== compress-character-webp.mjs ===');
  console.log('Source: ' + SRC_DIR);
  console.log('Backup: ' + BACKUP_DIR);
  console.log(`Target: max ${MAX_WIDTH}×${MAX_HEIGHT}, WebP Q${QUALITY}`);
  console.log('Mode:   ' + (DRY_RUN ? 'DRY RUN' : 'WRITE'));
  console.log('');

  await fs.mkdir(BACKUP_DIR, { recursive: true });

  const entries = await fs.readdir(SRC_DIR);
  const webpFiles = entries.filter((f) => f.toLowerCase().endsWith('.webp'));

  let totalBefore = 0;
  let totalAfter = 0;
  let processed = 0;
  let skipped = 0;

  for (const file of webpFiles) {
    const src = path.join(SRC_DIR, file);
    const backup = path.join(BACKUP_DIR, file);

    // Skip if already backed up — means we already processed it.
    if (await fileExists(backup)) {
      const s = await fs.stat(src);
      totalBefore += s.size;
      totalAfter += s.size;
      skipped++;
      continue;
    }

    const stat = await fs.stat(src);
    const before = stat.size;

    if (DRY_RUN) {
      console.log(`  DRY ${file.padEnd(60)} ${humanBytes(before).padStart(10)}`);
      totalBefore += before;
      continue;
    }

    const tmp = src + '.tmp';
    await sharp(src)
      .resize({
        width: MAX_WIDTH,
        height: MAX_HEIGHT,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: QUALITY, effort: 6 })
      .toFile(tmp);

    const newStat = await fs.stat(tmp);
    const after = newStat.size;

    if (after >= before) {
      // No savings — keep original, drop tmp.
      await fs.unlink(tmp);
      totalBefore += before;
      totalAfter += before;
      skipped++;
      console.log(`  = ${file.padEnd(60)} ${humanBytes(before).padStart(10)} (no savings, kept)`);
      continue;
    }

    // Backup, then replace in place.
    await fs.copyFile(src, backup);
    await fs.rename(tmp, src);

    totalBefore += before;
    totalAfter += after;
    processed++;
    const pct = Math.round(((before - after) / before) * 100);
    console.log(
      `  ✓ ${file.padEnd(60)} ${humanBytes(before).padStart(10)} → ${humanBytes(after).padStart(10)}  (-${pct}%)`,
    );
  }

  console.log('');
  console.log('=== Summary ===');
  console.log(`Processed: ${processed}`);
  console.log(`Skipped:   ${skipped}`);
  console.log(`Total before: ${humanBytes(totalBefore)}`);
  console.log(`Total after:  ${humanBytes(totalAfter)}`);
  const saved = totalBefore - totalAfter;
  const pct = totalBefore ? Math.round((saved / totalBefore) * 100) : 0;
  console.log(`Saved:        ${humanBytes(saved)} (-${pct}%)`);
  console.log('');
  if (!DRY_RUN) {
    console.log('Originals backed up to: ' + BACKUP_DIR);
  }
}

main().catch((err) => {
  console.error('ERROR:', err);
  process.exit(1);
});
