/* ===========================================================
   SIGNATURE — Nisha Shastry's original interaction motifs.

   Two small, restrained systems, both desktop/fine-pointer only,
   both fully inert under prefers-reduced-motion, neither borrowed
   from any existing template:

     1. The Ribbon  — a bookmark-thread reading indicator fixed to
        the right edge of the viewport. Answers "where am I in this
        story?" (wayfinding) without looking like a generic progress
        bar — it's the same gold used throughout for glows/borders,
        framed as a ribbon laid into the page.

     2. The Ink Cursor — a minimal pointer replacement that blooms
        into a soft gold ring over anything interactive, echoing the
        "ink-pool" glow already used on cards (motion.js/universe.css)
        so the cursor itself feels like part of the same material
        language rather than a bolted-on gimmick.

   Both read live layout (getBoundingClientRect / scrollY) each
   frame via rAF — no fixed-duration animations to fight with the
   user, matching the interruptible-by-default approach the rest of
   the site already uses (script.js's cinematic scroll handler).
   =========================================================== */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- The Ribbon ---------- */
  function initRibbon() {
    var ribbon = document.createElement("div");
    ribbon.className = "ribbon";
    ribbon.setAttribute("aria-hidden", "true");
    var fill = document.createElement("div");
    fill.className = "ribbon__fill";
    var mark = document.createElement("div");
    mark.className = "ribbon__mark";
    ribbon.appendChild(fill);
    ribbon.appendChild(mark);
    document.body.appendChild(ribbon);

    // World-awareness: universe-camera.js dispatches this once per
    // chapter change (not per frame) as the shared camera crosses into
    // a new world — the ribbon's own gold thread just recolors to
    // match, so "how far have I travelled" also answers "which world
    // am I in" without becoming a second, competing indicator.
    document.addEventListener("nisha:world", function (e) {
      var c = e.detail && e.detail.ribbon;
      if (!c) return;
      ribbon.style.setProperty("--ribbon-c1", c[0]);
      ribbon.style.setProperty("--ribbon-c2", c[1]);
    });

    if (reduceMotion) {
      // Still useful as a static position cue; just skip the smooth tracking.
      fill.style.height = "0%";
      mark.style.top = "0%";
    }

    var ticking = false;
    function update() {
      var doc = document.documentElement;
      var scrollable = doc.scrollHeight - window.innerHeight;
      var pct = scrollable > 0 ? Math.min(100, Math.max(0, (window.scrollY / scrollable) * 100)) : 0;
      fill.style.height = pct + "%";
      mark.style.top = pct + "%";
      ticking = false;
    }
    function onScroll() {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
  }

  /* ---------- The Ink Cursor ---------- */
  function initInkCursor() {
    document.documentElement.classList.add("has-ink-cursor");

    var cursor = document.createElement("div");
    cursor.className = "ink-cursor";
    cursor.setAttribute("aria-hidden", "true");
    cursor.innerHTML = '<div class="ink-cursor__ring"></div><div class="ink-cursor__dot"></div>';
    document.body.appendChild(cursor);

    // Critically damped spring (motion.js) — the dot itself tracks the
    // pointer almost 1:1 (direct manipulation, Apple-design §2); the
    // ring trails just slightly so its "bloom" reads as physical.
    var sx = window.__createSpring ? window.__createSpring(340, 30) : null;
    var sy = window.__createSpring ? window.__createSpring(340, 30) : null;
    var x = window.innerWidth / 2, y = window.innerHeight / 2;
    if (sx) { sx.jump(x); sy.jump(y); }

    window.addEventListener("pointermove", function (e) {
      x = e.clientX; y = e.clientY;
      if (sx) { sx.set(x); sy.set(y); }
      var target = e.target.closest ? e.target.closest("a, button, [data-cursor-active]") : null;
      cursor.classList.toggle("is-active", !!target);
    });

    var raf = null, lastT = null;
    function loop(t) {
      var dt = lastT ? Math.min((t - lastT) / 1000, 1 / 30) : 1 / 60;
      lastT = t;
      if (sx) { sx.tick(dt); sy.tick(dt); }
      var cx = sx ? sx.get() : x;
      var cy = sy ? sy.get() : y;
      cursor.style.transform = "translate(" + cx + "px," + cy + "px)";
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    document.addEventListener("mouseleave", function () { cursor.style.opacity = "0"; });
    document.addEventListener("mouseenter", function () { cursor.style.opacity = "1"; });
  }

  /* ---------- Hero image: physical parallax tilt ----------
     A gentle, spring-driven perspective tilt on the portrait — same
     "object responding to intention" principle as motion.js's card
     tilt, applied to the hero's frame rather than duplicating that
     code (the hero frame isn't in motion.js's TILT_SELECTOR because
     it also carries the entrance animation, which needs to finish
     untouched first). */
  function initHeroParallax() {
    var frame = document.querySelector(".hero__image-frame");
    var col = document.querySelector(".hero__image-col");
    if (!frame || !col || !window.__createSpring) return;

    var rx = window.__createSpring(160, 20);
    var ry = window.__createSpring(160, 20);
    rx.jump(0); ry.jump(0);

    col.style.perspective = "1200px";
    frame.style.transformStyle = "preserve-3d";

    var raf = null, lastT = null, active = false;
    function loop(t) {
      var dt = lastT ? Math.min((t - lastT) / 1000, 1 / 30) : 1 / 60;
      lastT = t;
      rx.tick(dt); ry.tick(dt);
      frame.style.transform = "rotateX(" + rx.get().toFixed(2) + "deg) rotateY(" + ry.get().toFixed(2) + "deg)";
      if (!rx.settled() || !ry.settled()) {
        raf = requestAnimationFrame(loop);
      } else {
        raf = null; lastT = null;
      }
    }
    function ensureLoop() { if (!raf) raf = requestAnimationFrame(loop); }

    window.addEventListener("pointermove", function (e) {
      var r = frame.getBoundingClientRect();
      if (e.clientX < r.left - 200 || e.clientX > r.right + 200 || e.clientY < r.top - 200 || e.clientY > r.bottom + 200) {
        rx.set(0); ry.set(0); ensureLoop();
        return;
      }
      var px = (e.clientX - r.left) / r.width;
      var py = (e.clientY - r.top) / r.height;
      ry.set((px - 0.5) * 6);
      rx.set(-(py - 0.5) * 6);
      ensureLoop();
    });
  }

  function boot() {
    initRibbon();
    if (!reduceMotion && hasFinePointer) {
      initInkCursor();
      initHeroParallax();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
