/**
 * visit-presentation.ts — Client-side presentation mode for the Visit Dashboard.
 *
 * Reads ?present=1 from the browser URL (not static build output).
 * Hides BaseLayout site chrome via .site-chrome-* classes only.
 */

export const VISIT_PRESENT_PARAM = 'present';
export const VISIT_PRESENT_VALUE = '1';
export const VISIT_PRESENT_CLASS = 'visit-present';

/** Resolve an element by id within any ParentNode (querySelector — valid on ParentNode). */
export function queryById(root: ParentNode, id: string): HTMLElement | null {
  // Toolbar ids are static alphanumeric/hyphen tokens from our markup.
  if (!/^[\w-]+$/.test(id)) return null;
  const el = root.querySelector(`#${id}`);
  return el ? (el as HTMLElement) : null;
}

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

export function isFullscreenActive(doc: Document = document): boolean {
  return Boolean(doc.fullscreenElement);
}

/** Sync enter/exit control visibility on the presentation toolbar. */
export function syncPresentationToolbar(
  present: boolean,
  fullscreen: boolean,
  root: ParentNode = document,
): void {
  const toolbar = queryById(root, 'visit-presentation-toolbar');
  if (!toolbar) return;

  toolbar.setAttribute('data-presentation-active', present ? 'true' : 'false');
  toolbar.setAttribute('data-fullscreen-active', fullscreen ? 'true' : 'false');

  const enterBtn = queryById(root, 'visit-presentation-enter');
  const exitBtn = queryById(root, 'visit-presentation-exit');
  const fsEnterBtn = queryById(root, 'visit-fullscreen-enter');
  const fsExitBtn = queryById(root, 'visit-fullscreen-exit');

  if (enterBtn) enterBtn.hidden = present;
  if (exitBtn) exitBtn.hidden = !present;
  if (fsEnterBtn) fsEnterBtn.hidden = fullscreen;
  if (fsExitBtn) fsExitBtn.hidden = !fullscreen;
}

export function setPresentationMode(enabled: boolean, replaceUrl = true): void {
  applyPresentationMode(enabled);
  syncPresentationToolbar(enabled, isFullscreenActive());

  if (replaceUrl && typeof window !== 'undefined') {
    const url = new URL(window.location.href);
    if (enabled) {
      url.searchParams.set(VISIT_PRESENT_PARAM, VISIT_PRESENT_VALUE);
    } else {
      url.searchParams.delete(VISIT_PRESENT_PARAM);
    }
    history.replaceState(null, '', url.toString());
  }
}

export function initVisitPresentation(root: ParentNode = document): void {
  const toolbar = queryById(root, 'visit-presentation-toolbar');
  const enterBtn = queryById(root, 'visit-presentation-enter');
  const exitBtn = queryById(root, 'visit-presentation-exit');
  const fsEnterBtn = queryById(root, 'visit-fullscreen-enter');
  const fsExitBtn = queryById(root, 'visit-fullscreen-exit');

  const fromUrl = isPresentationMode();
  setPresentationMode(fromUrl, false);

  enterBtn?.addEventListener('click', () => {
    setPresentationMode(true);
  });

  exitBtn?.addEventListener('click', () => {
    setPresentationMode(false);
  });

  fsEnterBtn?.addEventListener('click', async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      // Fullscreen may be blocked; presentation CSS still applies.
    }
  });

  fsExitBtn?.addEventListener('click', async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch {
      // Ignore — user can still exit presentation mode.
    }
  });

  document.addEventListener('fullscreenchange', () => {
    syncPresentationToolbar(
      document.documentElement.classList.contains(VISIT_PRESENT_CLASS),
      isFullscreenActive(),
      root,
    );
  });

  if (toolbar) {
    toolbar.hidden = false;
  }
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initVisitPresentation());
  } else {
    initVisitPresentation();
  }
}
