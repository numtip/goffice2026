#!/usr/bin/env node
/**
 * encode-hero-cinematic.mjs
 * =========================
 * Build production Landing Hero media from the MASTER clip.
 *
 * Master (never served, never modified):
 *   data/clips/greenbuit1.mp4
 *
 * Outputs (public, base-path safe via wow2-images / withBase):
 *   public/media/hero/green-office-building-hero-cinematic.mp4
 *   public/media/hero/green-office-building-hero-1920.webp
 *   public/media/hero/green-office-building-hero-1280.webp
 *   public/media/hero/green-office-building-hero-768.webp
 *
 * Requires ffmpeg + ffprobe on PATH (or FFMPEG_BIN / FFPROBE_BIN).
 *
 * Usage: node scripts/encode-hero-cinematic.mjs
 */

import { existsSync, mkdirSync, readdirSync, statSync, unlinkSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const MASTER = resolve(ROOT, 'data/clips/greenbuit1.mp4');
const OUT_DIR = resolve(ROOT, 'public/media/hero');
const VIDEO_OUT = resolve(OUT_DIR, 'green-office-building-hero-cinematic.mp4');
const MAX_BYTES = 10 * 1024 * 1024;
const TARGET_BYTES = 8 * 1024 * 1024;

const ffmpegBin = process.env.FFMPEG_BIN || 'ffmpeg';
const ffprobeBin = process.env.FFPROBE_BIN || 'ffprobe';

function run(bin, args, label) {
  const result = spawnSync(bin, args, { stdio: 'inherit' });
  if (result.error) {
    console.error(`Failed to spawn ${bin}: ${result.error.message}`);
    process.exit(1);
  }
  if (result.status !== 0) {
    console.error(`${label} failed with exit ${result.status}`);
    process.exit(result.status ?? 1);
  }
}

function probe(path) {
  const result = spawnSync(
    ffprobeBin,
    ['-v', 'error', '-show_format', '-show_streams', '-print_format', 'json', path],
    { encoding: 'utf8' }
  );
  if (result.status !== 0) {
    console.error('ffprobe failed');
    process.exit(result.status ?? 1);
  }
  return JSON.parse(result.stdout);
}

if (!existsSync(MASTER)) {
  console.error('Master clip missing:', MASTER);
  process.exit(1);
}

mkdirSync(OUT_DIR, { recursive: true });

const masterInfo = probe(MASTER);
const vStream = (masterInfo.streams || []).find((s) => s.codec_type === 'video');
console.log('--- Master ---');
console.log(`  file:     ${MASTER}`);
console.log(`  size:     ${(statSync(MASTER).size / (1024 * 1024)).toFixed(2)} MB`);
console.log(`  duration: ${masterInfo.format?.duration}s`);
console.log(`  video:    ${vStream?.width}x${vStream?.height} ${vStream?.codec_name} ${vStream?.r_frame_rate} ${Math.round(Number(vStream?.bit_rate || 0) / 1000)} kb/s`);

const scale = 'scale=1920:1080:flags=lanczos';
const passLog = resolve(OUT_DIR, 'ffmpeg2pass');

console.log('\n--- Encode cinematic MP4 (H.264, no audio, faststart) ---');
run(
  ffmpegBin,
  [
    '-y',
    '-i', MASTER,
    '-an',
    '-vf', scale,
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-profile:v', 'high',
    '-level', '4.1',
    '-preset', 'slow',
    '-b:v', '2200k',
    '-maxrate', '2400k',
    '-bufsize', '4400k',
    '-pass', '1',
    '-passlogfile', passLog,
    '-f', 'mp4',
    process.platform === 'win32' ? 'NUL' : '/dev/null',
  ],
  'ffmpeg pass 1'
);

run(
  ffmpegBin,
  [
    '-y',
    '-i', MASTER,
    '-an',
    '-vf', scale,
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-profile:v', 'high',
    '-level', '4.1',
    '-preset', 'slow',
    '-b:v', '2200k',
    '-maxrate', '2400k',
    '-bufsize', '4400k',
    '-movflags', '+faststart',
    '-pass', '2',
    '-passlogfile', passLog,
    VIDEO_OUT,
  ],
  'ffmpeg pass 2'
);

const videoBytes = statSync(VIDEO_OUT).size;
console.log(`\n  output: ${VIDEO_OUT}`);
console.log(`  size:   ${(videoBytes / (1024 * 1024)).toFixed(2)} MB`);

if (videoBytes > MAX_BYTES) {
  console.error(`BLOCKER: derivative is ${(videoBytes / (1024 * 1024)).toFixed(2)} MB (>10 MB). Do not ship.`);
  process.exit(2);
}
if (videoBytes > TARGET_BYTES) {
  console.warn(`WARN: derivative is ${(videoBytes / (1024 * 1024)).toFixed(2)} MB (target ≤8 MB, hard cap 10 MB).`);
}

const posters = [
  { w: 1920, h: 1080, name: 'green-office-building-hero-1920.webp' },
  { w: 1280, h: 720, name: 'green-office-building-hero-1280.webp' },
  { w: 768, h: 432, name: 'green-office-building-hero-768.webp' },
];

console.log('\n--- Poster stills (t=0.5s, matches video start) ---');
for (const poster of posters) {
  const out = resolve(OUT_DIR, poster.name);
  run(
    ffmpegBin,
    [
      '-y',
      '-ss', '0.5',
      '-i', MASTER,
      '-frames:v', '1',
      '-update', '1',
      '-vf', `scale=${poster.w}:${poster.h}:flags=lanczos`,
      '-c:v', 'libwebp',
      '-quality', '80',
      out,
    ],
    `poster ${poster.name}`
  );
  console.log(`  ${poster.name}  ${(statSync(out).size / 1024).toFixed(0)} KB`);
}

for (const name of readdirSync(OUT_DIR)) {
  if (name.startsWith('ffmpeg2pass')) {
    unlinkSync(resolve(OUT_DIR, name));
  }
}

const derived = probe(VIDEO_OUT);
const dv = (derived.streams || []).find((s) => s.codec_type === 'video');
console.log('\n--- Derivative ---');
console.log(`  duration: ${derived.format?.duration}s`);
console.log(`  video:    ${dv?.width}x${dv?.height} ${dv?.codec_name} ${dv?.r_frame_rate} ${Math.round(Number(dv?.bit_rate || 0) / 1000)} kb/s`);
console.log(`  audio:    ${(derived.streams || []).some((s) => s.codec_type === 'audio') ? 'PRESENT (fail)' : 'none'}`);
console.log('\nDone. Master clip was not modified.');
