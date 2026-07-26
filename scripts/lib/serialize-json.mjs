/**
 * Canonical JSON serialization for generated dashboard data.
 * UTF-8, 2-space indent, LF line endings, single trailing newline.
 */

import { readFileSync, writeFileSync } from 'node:fs';

/** @param {unknown} data */
export function serializeJson(data) {
  return `${JSON.stringify(data, null, 2)}\n`;
}

/** @param {string} filePath @param {unknown} data */
export function writeJsonFile(filePath, data) {
  writeFileSync(filePath, serializeJson(data), { encoding: 'utf8' });
}

/** @param {string} filePath */
export function readJsonFile(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

/** Rewrite file using canonical format without changing parsed values. */
export function normalizeJsonFile(filePath) {
  writeJsonFile(filePath, readJsonFile(filePath));
}
