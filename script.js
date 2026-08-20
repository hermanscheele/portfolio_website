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

  /* ---- reveal on scroll ---- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !prefersReduced) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in"));
  }

  /* ---- nav: scrolled state + scroll progress ---- */
  const nav = document.getElementById("nav");
  const progress = document.querySelector(".scroll-progress span");
  function onScroll() {
    const y = window.scrollY || document.documentElement.scrollTop;
    if (nav) nav.classList.toggle("scrolled", y > 12);
    if (progress) {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- active nav link via section observer ---- */
  const navLinks = Array.from(document.querySelectorAll(".nav-links a"));
  const linkFor = (id) => navLinks.find((a) => a.getAttribute("href") === "#" + id);
  const sections = navLinks
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);
  if ("IntersectionObserver" in window && sections.length) {
    const so = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            navLinks.forEach((l) => l.classList.remove("active"));
            const link = linkFor(e.target.id);
            if (link) link.classList.add("active");
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => so.observe(s));
  }

  /* ---- cursor spotlight ---- */
  const glow = document.querySelector(".cursor-glow");
  if (glow && !isTouch && !prefersReduced) {
    let rafId = null,
      tx = 0,
      ty = 0;
    window.addEventListener("mousemove", (e) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!rafId) {
        rafId = requestAnimationFrame(() => {
          glow.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
          rafId = null;
        });
      }
    });
  } else if (glow) {
    glow.style.display = "none";
  }

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
