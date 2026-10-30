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

  /* ---- gaussian blur demo: σ slider ---- */
  const blurCanvas = document.getElementById("blurCanvas");
  const gaussCanvas = document.getElementById("gaussCanvas");
  const blurSrc = document.getElementById("blurSrc");
  const sigmaSlider = document.getElementById("sigmaSlider");
  if (blurCanvas && gaussCanvas && blurSrc && sigmaSlider) {
    const W = blurCanvas.width, H = blurCanvas.height;
    const bctx = blurCanvas.getContext("2d");
    const gctx = gaussCanvas.getContext("2d");
    const sigmaVal = document.getElementById("sigmaVal");
    const kernelVal = document.getElementById("kernelVal");
    let grey = null; // source luminance, Float32Array(W*H)
    let pending = false;

    // 1D gaussian weights, normalised; a 2D gaussian is separable, so blur rows then columns
    const kernel1d = (sigma) => {
      const r = Math.ceil(3 * sigma);
      const k = new Float32Array(2 * r + 1);
      let sum = 0;
      for (let i = -r; i <= r; i++) sum += k[i + r] = Math.exp(-(i * i) / (2 * sigma * sigma));
      for (let i = 0; i < k.length; i++) k[i] /= sum;
      return k;
    };

    const blurImage = (sigma) => {
      if (sigma < 0.05) return grey;
      const k = kernel1d(sigma), r = (k.length - 1) / 2;
      const tmp = new Float32Array(W * H), out = new Float32Array(W * H);
      for (let y = 0; y < H; y++) {
        const row = y * W;
        for (let x = 0; x < W; x++) {
          let s = 0;
          for (let i = -r; i <= r; i++) s += grey[row + Math.min(W - 1, Math.max(0, x + i))] * k[i + r];
          tmp[row + x] = s;
        }
      }
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          let s = 0;
          for (let i = -r; i <= r; i++) s += tmp[Math.min(H - 1, Math.max(0, y + i)) * W + x] * k[i + r];
          out[y * W + x] = s;
        }
      }
      return out;
    };

    const drawImage = (sigma) => {
      const px = blurImage(sigma);
      const img = bctx.createImageData(W, H);
      for (let i = 0; i < px.length; i++) {
        const v = px[i];
        img.data[4 * i] = img.data[4 * i + 1] = img.data[4 * i + 2] = v;
        img.data[4 * i + 3] = 255;
      }
      bctx.putImageData(img, 0, 0);
    };

    // 3D surface z = exp(-(x²+y²) / 2σ²), drawn back-to-front with simple shading
    const drawGauss = (sigma) => {
      const gw = gaussCanvas.width, gh = gaussCanvas.height;
      const s = Math.max(sigma, 0.15), N = 28, R = 9;
      const ca = Math.cos(-0.75), sa = Math.sin(-0.75);
      const proj = (x, y, z) => {
        const rx = x * ca - y * sa, ry = x * sa + y * ca;
        return [gw / 2 + rx * 10.5, gh * 0.78 + ry * 4.2 - z * gh * 0.58];
      };
      const z = (x, y) => Math.exp(-(x * x + y * y) / (2 * s * s));
      const quads = [];
      for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
          const x0 = -R + (2 * R * i) / N, x1 = -R + (2 * R * (i + 1)) / N;
          const y0 = -R + (2 * R * j) / N, y1 = -R + (2 * R * (j + 1)) / N;
          const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
          quads.push({
            depth: cx * sa + cy * ca,
            h: z(cx, cy),
            pts: [proj(x0, y0, z(x0, y0)), proj(x1, y0, z(x1, y0)), proj(x1, y1, z(x1, y1)), proj(x0, y1, z(x0, y1))],
          });
        }
      }
      quads.sort((a, b) => a.depth - b.depth);
      gctx.clearRect(0, 0, gw, gh);
      gctx.lineWidth = 0.6;
      gctx.strokeStyle = "rgba(247, 245, 238, 0.55)";
      for (const q of quads) {
        // ivory (#f0ece1) at the base -> warm near-black (#211d16) at the peak
        const t = Math.pow(q.h, 0.8);
        gctx.fillStyle = `rgb(${240 - 207 * t}, ${236 - 207 * t}, ${225 - 203 * t})`;
        gctx.beginPath();
        gctx.moveTo(q.pts[0][0], q.pts[0][1]);
        for (let p = 1; p < 4; p++) gctx.lineTo(q.pts[p][0], q.pts[p][1]);
        gctx.closePath();
        gctx.fill();
        gctx.stroke();
      }
    };

    const render = () => {
      pending = false;
      const sigma = parseFloat(sigmaSlider.value);
      sigmaVal.textContent = sigma.toFixed(1);
      const size = sigma < 0.05 ? 1 : 2 * Math.ceil(3 * sigma) + 1;
      kernelVal.textContent = `${size}×${size}`;
      drawGauss(sigma);
      if (grey) drawImage(sigma);
    };
    const schedule = () => {
      if (!pending) { pending = true; requestAnimationFrame(render); }
    };

    const loadSource = () => {
      bctx.drawImage(blurSrc, 0, 0, W, H);
      const d = bctx.getImageData(0, 0, W, H).data;
      grey = new Float32Array(W * H);
      for (let i = 0; i < grey.length; i++) grey[i] = d[4 * i];
      schedule();
    };
    if (blurSrc.complete && blurSrc.naturalWidth) loadSource();
    else blurSrc.addEventListener("load", loadSource);

    sigmaSlider.addEventListener("input", schedule);
    schedule();
  }
})();
