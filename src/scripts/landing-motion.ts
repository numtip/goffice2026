/** Lightweight homepage motion — scroll reveal, stagger, KPI count-up. Respects reduced motion. */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function revealOnScroll() {
  const targets = document.querySelectorAll<HTMLElement>('.landing-reveal');
  if (!targets.length) return;

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -5% 0px' }
  );

  targets.forEach((el) => observer.observe(el));
}

function countUp(el: HTMLElement) {
  const target = Number(el.dataset.countUp);
  if (Number.isNaN(target)) return;

  const suffix = el.dataset.countSuffix ?? '';
  const prefix = el.dataset.countPrefix ?? '';
  const duration = prefersReducedMotion ? 0 : Number(el.dataset.countDuration ?? 1200);

  if (duration === 0) {
    el.textContent = `${prefix}${target}${suffix}`;
    return;
  }

  const start = performance.now();
  const animate = (now: number) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - (1 - progress) ** 3;
    const value = Math.round(target * eased);
    el.textContent = `${prefix}${value}${suffix}`;
    if (progress < 1) requestAnimationFrame(animate);
  };

  requestAnimationFrame(animate);
}

function initCountUps() {
  document.querySelectorAll<HTMLElement>('[data-count-up]').forEach((el) => {
    if (prefersReducedMotion) {
      countUp(el);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            countUp(entry.target as HTMLElement);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
  });
}

function init() {
  revealOnScroll();
  initCountUps();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
