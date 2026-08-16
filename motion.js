/* ===========================================================
   MOTION — Nisha Shastry's physical interaction layer.

   A tiny, dependency-free critically-damped spring (no Framer Motion,
   no npm — matches the site's plain HTML/CSS/JS constraint). Everything
   here follows the core interruptibility principle: motion always reads
   the CURRENT on-screen value and re-targets from there, never resets
   to a default before animating toward the new target.

   Two original, restrained signature interactions built on it:
     1. Physical tilt   — cover art / cards lift toward the pointer,
                           like a page tilting in the hand. Max 5deg.
     2. Ink-pool glow    — a soft gold highlight follows the pointer
                           across the surface, like light catching
                           gold leaf on a page edge.

   Both are decorative-only, skipped entirely under
   prefers-reduced-motion, and skipped on touch (no hover, no fine
   pointer) since they have no meaning without a mouse.
   =========================================================== */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- Tiny critically-damped spring ----------
     Always starts wherever it currently is (interruptible by design —
     calling .set() mid-motion just changes the target, never snaps). */
  function createSpring(stiffness, damping) {
    stiffness = stiffness || 180;
    damping = damping || 20;
    var value = 0, velocity = 0, target = 0;
    return {
      set: function (v) { target = v; },
      jump: function (v) { value = v; target = v; velocity = 0; },
      tick: function (dt) {
        var accel = -stiffness * (value - target) - damping * velocity;
        velocity += accel * dt;
        value += velocity * dt;
        return value;
      },
      get: function () { return value; },
      settled: function () {
        return Math.abs(value - target) < 0.01 && Math.abs(velocity) < 0.01;
      }
    };
  }
  window.__createSpring = createSpring;

  if (reduceMotion || !hasFinePointer) return;

  var TILT_SELECTOR = ".work-figure, .award-card, .press-card, .social-card";
  var MAX_TILT = 5; // degrees — restrained, physical, not gimmicky

  function attachPhysicalLayer(el) {
    if (el.__nishaMotionBound) return;
    el.__nishaMotionBound = true;

    var rx = createSpring(170, 22);
    var ry = createSpring(170, 22);
    var glowX = createSpring(120, 20);
    var glowY = createSpring(120, 20);
    rx.jump(0); ry.jump(0); glowX.jump(50); glowY.jump(50);

    var glow = document.createElement("div");
    glow.className = "ink-glow";
    glow.setAttribute("aria-hidden", "true");
    el.appendChild(glow);

    var raf = null;
    var lastT = null;

    function loop(t) {
      var dt = lastT ? Math.min((t - lastT) / 1000, 1 / 30) : 1 / 60;
      lastT = t;
      rx.tick(dt); ry.tick(dt); glowX.tick(dt); glowY.tick(dt);

      el.style.transform =
        "perspective(900px) rotateX(" + rx.get().toFixed(2) + "deg) rotateY(" + ry.get().toFixed(2) + "deg)";
      glow.style.setProperty("--gx", glowX.get().toFixed(1) + "%");
      glow.style.setProperty("--gy", glowY.get().toFixed(1) + "%");

      if (!rx.settled() || !ry.settled() || !glowX.settled() || !glowY.settled()) {
        raf = requestAnimationFrame(loop);
      } else {
        raf = null;
        lastT = null;
      }
    }
    function ensureLoop() {
      if (!raf) raf = requestAnimationFrame(loop);
    }

    el.addEventListener("pointermove", function (e) {
      var r = el.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width;
      var py = (e.clientY - r.top) / r.height;
      ry.set((px - 0.5) * MAX_TILT * 2);
      rx.set(-(py - 0.5) * MAX_TILT * 2);
      glowX.set(px * 100);
      glowY.set(py * 100);
      ensureLoop();
    });

    el.addEventListener("pointerleave", function () {
      rx.set(0); ry.set(0); glowX.set(50); glowY.set(50);
      ensureLoop();
    });
  }

  function scan() {
    document.querySelectorAll(TILT_SELECTOR).forEach(attachPhysicalLayer);
  }

  document.addEventListener("DOMContentLoaded", scan);
  // Catalogue cards render asynchronously via universe.js — watch for them
  // rather than re-running a timer.
  new MutationObserver(scan).observe(document.documentElement, { childList: true, subtree: true });
})();
