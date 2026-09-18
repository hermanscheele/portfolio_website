/* ============================================================
   Herman Scheele — portfolio interactions
   ============================================================ */
(function () {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = window.matchMedia("(hover: none)").matches;

  /* ---- current year ---- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- nav: scrolled state ---- */
  const nav = document.getElementById("nav");
  function onScroll() {
    const y = window.scrollY || document.documentElement.scrollTop;
    if (nav) nav.classList.toggle("scrolled", y > 12);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- per-card pointer spotlight ---- */
  if (!isTouch) {
    document.querySelectorAll(".card").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", e.clientX - r.left + "px");
        card.style.setProperty("--my", e.clientY - r.top + "px");
      });
    });
  }

  /* ---- typewriter skillset ---- */
  const typeText = document.getElementById("typeText");
  if (typeText) {
    const words = ["Math", "Python, Golang, C++", "Research", "Quant finance", "Machine learning"];
    if (prefersReduced) {
      typeText.textContent = words[0];
    } else {
      let wi = 0, ci = 0, deleting = false;
      const tick = () => {
        const w = words[wi];
        ci += deleting ? -1 : 1;
        typeText.textContent = w.slice(0, ci);
        let delay;
        if (!deleting && ci === w.length) { deleting = true; delay = 1500; }
        else if (deleting && ci === 0) { deleting = false; wi = (wi + 1) % words.length; delay = 350; }
        else { delay = deleting ? 40 : 85; }
        setTimeout(tick, delay);
      };
      setTimeout(tick, 600);
    }
  }

  /* ---- animated stat counters ---- */
  const stats = document.querySelectorAll(".stat-num[data-count]");
  const runCount = (el) => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    const dur = 1400;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      const val = Math.round(target * eased);
      el.textContent = val.toLocaleString("en-US") + (p === 1 ? suffix : "");
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if (stats.length) {
    if ("IntersectionObserver" in window && !prefersReduced) {
      const co = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              runCount(e.target);
              co.unobserve(e.target);
            }
          });
        },
        { threshold: 0.6 }
      );
      stats.forEach((s) => co.observe(s));
    } else {
      stats.forEach((s) => {
        s.textContent =
          parseFloat(s.dataset.count).toLocaleString("en-US") + (s.dataset.suffix || "");
      });
    }
  }
})();
