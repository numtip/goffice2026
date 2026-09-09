/**
 * visit-presentation.ts — Client-side presentation mode for the Visit Dashboard.
 *
 * Reads ?present=1 from the browser URL (not static build output).
 * Adds `visit-present` on <html>, hides site chrome, optional fullscreen toggle.
 */

export const VISIT_PRESENT_PARAM = 'present';
export const VISIT_PRESENT_VALUE = '1';
export const VISIT_PRESENT_CLASS = 'visit-present';

/** Parse presentation flag from a URL search string or URLSearchParams. */
export function isPresentationMode(
  search: string | URLSearchParams = typeof window !== 'undefined'
    ? window.location.search
    : '',
): boolean {
  const params =
    typeof search === 'string' ? new URLSearchParams(search) : search;
  return params.get(VISIT_PRESENT_PARAM) === VISIT_PRESENT_VALUE;
}

export function applyPresentationMode(enabled: boolean): void {
  document.documentElement.classList.toggle(VISIT_PRESENT_CLASS, enabled);
  document.body.classList.toggle(VISIT_PRESENT_CLASS, enabled);
}

export function initVisitPresentation(): void {
  const toolbar = document.getElementById('visit-presentation-toolbar');
  const toggleBtn = document.getElementById('visit-presentation-toggle');
  const fullscreenBtn = document.getElementById('visit-fullscreen-toggle');

  const fromUrl = isPresentationMode();
  applyPresentationMode(fromUrl);

  if (toggleBtn) {
    toggleBtn.setAttribute('aria-pressed', fromUrl ? 'true' : 'false');
    toggleBtn.addEventListener('click', () => {
      const next = !document.documentElement.classList.contains(VISIT_PRESENT_CLASS);
      applyPresentationMode(next);
      toggleBtn.setAttribute('aria-pressed', next ? 'true' : 'false');

      const url = new URL(window.location.href);
      if (next) {
        url.searchParams.set(VISIT_PRESENT_PARAM, VISIT_PRESENT_VALUE);
      } else {
        url.searchParams.delete(VISIT_PRESENT_PARAM);
      }
      history.replaceState(null, '', url.toString());
    });
  }

  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', async () => {
      try {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
        } else {
          await document.exitFullscreen();
        }
      } catch {
        // Fullscreen may be blocked; presentation CSS still applies.
      }
    });
  }

  if (toolbar) {
    toolbar.hidden = false;
  }
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVisitPresentation);
  } else {
    initVisitPresentation();
  }
}
