/**
 * GO-MOTION-V1 landing motion — hero entrance, section reveal, KPI count-up.
 * One shared IntersectionObserver. Progressive enhancement: content is fully
 * visible by default and only animated after JS confirms motion is allowed.
 */

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function countUp(el: HTMLElement) {
  const target = Number(el.dataset.countUp);
  if (Number.isNaN(target)) return;

  const suffix = el.dataset.countSuffix ?? '';
  const prefix = el.dataset.countPrefix ?? '';
  const duration = reducedMotion ? 0 : Number(el.dataset.countDuration ?? 1200);

  if (duration === 0) {
    el.textContent = `${prefix}${target}${suffix}`;
    return;
  }

  const start = performance.now();
  const animate = (now: number) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - (1 - progress) ** 3;
    el.textContent = `${prefix}${Math.round(target * eased)}${suffix}`;
    if (progress < 1) requestAnimationFrame(animate);
  };

  requestAnimationFrame(animate);
}

function init() {
  const revealTargets = Array.from(document.querySelectorAll<HTMLElement>('.landing-reveal'));
  const countTargets = Array.from(document.querySelectorAll<HTMLElement>('[data-count-up]'));

  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealTargets.forEach((el) => el.classList.add('is-visible'));
    countTargets.forEach(countUp);
    return;
  }

  document.documentElement.classList.add('motion-ready');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const el = entry.target as HTMLElement;
        if (!entry.isIntersecting) return;

        let finished = true;

        if (el.classList.contains('landing-reveal')) {
          el.classList.add('is-visible');
        }

        if (el.hasAttribute('data-count-up')) {
          if (entry.intersectionRatio >= 0.4) {
            countUp(el);
          } else {
            finished = false;
          }
        }

        if (finished) observer.unobserve(el);
      });
    },
    { threshold: [0.12, 0.4], rootMargin: '0px 0px -5% 0px' }
  );

  revealTargets.forEach((el) => observer.observe(el));
  countTargets.forEach((el) => observer.observe(el));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
