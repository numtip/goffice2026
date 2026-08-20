/**
 * H1.5 cinematic hero media contract.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const HERO_DIR = resolve(ROOT, 'public/media/hero');
const VIDEO = resolve(HERO_DIR, 'green-office-building-hero-cinematic.mp4');
const POSTERS = [
  'green-office-building-hero-1920.webp',
  'green-office-building-hero-1280.webp',
  'green-office-building-hero-768.webp',
];
const MAX_VIDEO_BYTES = 10 * 1024 * 1024;

describe('H1.5 hero cinematic media', () => {
  it('ships the production MP4 under 10 MB', () => {
    assert.equal(existsSync(VIDEO), true, 'missing cinematic mp4');
    const size = statSync(VIDEO).size;
    assert.ok(size > 100_000, `mp4 too small: ${size}`);
    assert.ok(size <= MAX_VIDEO_BYTES, `mp4 exceeds 10 MB: ${size}`);
  });

  it('ships responsive poster stills', () => {
    for (const name of POSTERS) {
      const path = resolve(HERO_DIR, name);
      assert.equal(existsSync(path), true, `missing ${name}`);
      assert.ok(statSync(path).size > 8_000, `${name} too small`);
    }
  });

  it('does not serve the 40 MB master from public or the hero component', () => {
    const hero = readFileSync(resolve(ROOT, 'src/components/landing/LandingHero.astro'), 'utf8');
    const registry = readFileSync(resolve(ROOT, 'src/utils/wow2-images.ts'), 'utf8');
    assert.equal(hero.includes('greenbuit1'), false);
    assert.equal(hero.includes('data/clips'), false);
    assert.equal(/landingHeroAssetUrl\(['"][^'"]*greenbuit1/.test(registry), false);
    assert.equal(existsSync(resolve(ROOT, 'public/clips/greenbuit1.mp4')), false);
    assert.equal(existsSync(resolve(ROOT, 'public/data/clips/greenbuit1.mp4')), false);
    assert.equal(existsSync(resolve(ROOT, 'public/media/hero/greenbuit1.mp4')), false);
  });

  it('keeps dashboard WOW2 hero still separate from landing cinematic media', () => {
    const registry = readFileSync(resolve(ROOT, 'src/utils/wow2-images.ts'), 'utf8');
    assert.match(registry, /Executive Dashboard Hero\.webp/);
    assert.match(registry, /heroCinematicVideoUrl/);
    assert.match(registry, /landingHeroPosterUrl/);
  });
});
