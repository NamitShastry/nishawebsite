/* ===========================================================
   UNIVERSE CAMERA — the shared cinematic camera + world system.

   ONE persistent Three.js renderer for the entire page (#universeCanvas,
   fixed full-viewport, painted above every section's own CSS atmosphere
   gradient and below all real content — see styles.css/universe.css for
   the stacking rationale). Everything below reads scroll, not the other
   way round: no code anywhere sets scrollY from an animation, so the
   browser's native scrolling, keyboard nav and screen readers are
   untouched.

   Architecture (kept as separate concerns in one small module rather
   than eight files, since the whole thing is ~350 lines):

     WORLDS            — the authored content: one entry per chapter of
                          Nisha's site, each with its own particle
                          formation + camera framing. This is the thing
                          you edit to add/adjust a world.
     buildWorldRanges() — maps each world onto real scroll pixels by
                          reading the matching <section>'s position.
                          Cached; only re-measured on load/resize, never
                          per scroll frame (Part 15: no per-frame layout
                          reads).
     CameraRig          — holds current + target position/lookAt and
                          exponentially damps current toward target each
                          frame. This is a critically-damped, always-
                          interruptible spring in disguise (Part 2 of
                          the earlier motion work, reused here rather
                          than reinvented): because it re-reads its own
                          live position every frame and simply damps
                          toward wherever the target currently is, a
                          reversed scroll changes the target and the
                          camera smoothly reverses too — there is no
                          separate "play forward / play backward"
                          timeline to desync.
     ParticleField       — one BufferGeometry shared by every world;
                          each world only supplies a target position
                          array, and the field is linearly blended
                          between the current and next world's shapes
                          across that world's own scroll span, so the
                          formation finishes morphing exactly as the
                          next chapter begins.

   The existing scroll-linked circle transform (script.js,
   window.__nishaCinematic) is left completely alone — it still owns
   the DOM image morph. This module only reads its `eased` value to
   dolly the shared camera through that same moment, so the one
   circle-forming gesture reads as a single camera move rather than
   two unrelated animations layered on top of each other.
   =========================================================== */
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

(function () {
  "use strict";

  var canvas = document.getElementById("universeCanvas");
  if (!canvas) return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) { canvas.style.display = "none"; return; }

  var hasFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var isMobile = window.innerWidth < 700;

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
  } catch (e) {
    canvas.style.display = "none";
    return; // no WebGL — every section's own CSS gradient is a complete fallback on its own
  }
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);

  /* ---------- reusable soft dot sprite (matches the ink-glow / gold-leaf
     material language used everywhere else on the site) ---------- */
  function makeDotTexture() {
    var c = document.createElement("canvas");
    c.width = c.height = 64;
    var ctx = c.getContext("2d");
    var g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.4, "rgba(255,255,255,.7)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
    var tex = new THREE.CanvasTexture(c);
    tex.needsUpdate = true;
    return tex;
  }
  var dotTexture = makeDotTexture();

  /* ===========================================================
     WORLD SHAPE GENERATORS
     Every generator returns a Float32Array(COUNT*3). Deliberately NOT
     random colors per world (Part 19/17: no rainbow effects) — every
     world shares the same three-color ink palette (gold / violet /
     cyan) already established site-wide; worlds differentiate through
     FORM and CAMERA FRAMING instead, which is what keeps this reading
     as "authored," not "generated."
     =========================================================== */
  function shapeOrigin(n) {
    // A vast, sparse, barely-there cosmos — restrained, matches the
    // hero's "expensive negative space" brief.
    var out = new Float32Array(n * 3);
    for (var i = 0; i < n; i++) {
      var r = 9 + Math.random() * 14;
      var theta = Math.random() * Math.PI * 2;
      var phi = Math.acos(2 * Math.random() - 1);
      out[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      out[i * 3 + 1] = r * Math.cos(phi) * 0.55;
      out[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta) - 4;
    }
    return out;
  }

  function shapeVision(n) {
    // Structured orbital rings — ideas taking shape, ambition given form.
    var out = new Float32Array(n * 3);
    var rings = [3.2, 5, 7];
    for (var i = 0; i < n; i++) {
      var ring = rings[i % rings.length];
      var a = Math.random() * Math.PI * 2;
      var incline = (i % rings.length) * 0.5 - 0.5;
      var rr = ring + (Math.random() - 0.5) * 0.6;
      out[i * 3] = Math.cos(a) * rr;
      out[i * 3 + 1] = Math.sin(a) * rr * Math.sin(incline) + (Math.random() - 0.5);
      out[i * 3 + 2] = Math.sin(a) * rr * Math.cos(incline) - 2;
    }
    return out;
  }

  function shapeAwards(n) {
    // A personal constellation — three bright hubs (the three award
    // cards) with scattered connective stars around them.
    var hubs = [[-3, 1.4, -1], [0, -1.2, 0.5], [3, 1.1, -1.2]];
    var out = new Float32Array(n * 3);
    for (var i = 0; i < n; i++) {
      var hub = hubs[i % hubs.length];
      var spread = (i % 5 === 0) ? 0.15 : 2.6; // a few tight "stars," most loosely scattered around
      out[i * 3] = hub[0] + (Math.random() - 0.5) * spread * 2;
      out[i * 3 + 1] = hub[1] + (Math.random() - 0.5) * spread;
      out[i * 3 + 2] = hub[2] + (Math.random() - 0.5) * spread * 1.6 - 1;
    }
    return out;
  }

  function shapePress(n) {
    // Flat drifting dust — an archive, fragments of history suspended in air.
    var out = new Float32Array(n * 3);
    for (var i = 0; i < n; i++) {
      out[i * 3] = (Math.random() - 0.5) * 16;
      out[i * 3 + 1] = (Math.random() - 0.5) * 7;
      out[i * 3 + 2] = (Math.random() - 0.5) * 3 - 1;
    }
    return out;
  }

  function shapeNovels(n) {
    // Vertical ink/paper streams — pages, columns of falling text.
    var out = new Float32Array(n * 3);
    var cols = 14;
    for (var i = 0; i < n; i++) {
      var col = i % cols;
      var cx = (col - cols / 2) * 0.9 + (Math.random() - 0.5) * 0.4;
      out[i * 3] = cx;
      out[i * 3 + 1] = (Math.random() - 0.5) * 10;
      out[i * 3 + 2] = (Math.random() - 0.5) * 4 - 2;
    }
    return out;
  }

  function shapeComics(n) {
    // Angular, dynamic shards — ink strokes with directional energy,
    // deliberately less symmetric than the literary world.
    var out = new Float32Array(n * 3);
    for (var i = 0; i < n; i++) {
      var line = (i % 9) - 4;
      var t = Math.random();
      out[i * 3] = line * 1.1 + (t - 0.5) * 3;
      out[i * 3 + 1] = (t - 0.5) * 10 + line * 0.4;
      out[i * 3 + 2] = (Math.random() - 0.5) * 5 - 1;
    }
    return out;
  }

  function shapeAudio(n) {
    // Concentric waves — sound made visible.
    var out = new Float32Array(n * 3);
    var rings = 6;
    for (var i = 0; i < n; i++) {
      var ring = (i % rings) + 1;
      var a = Math.random() * Math.PI * 2;
      var rr = ring * 1.15 + (Math.random() - 0.5) * 0.25;
      out[i * 3] = Math.cos(a) * rr;
      out[i * 3 + 1] = Math.sin(a) * rr * 0.4;
      out[i * 3 + 2] = (Math.random() - 0.5) * 2 - 1;
    }
    return out;
  }

  function shapeVideo(n) {
    // A wide cinematic (letterboxed) field — the screen itself.
    var out = new Float32Array(n * 3);
    for (var i = 0; i < n; i++) {
      out[i * 3] = (Math.random() - 0.5) * 18;
      out[i * 3 + 1] = (Math.random() - 0.5) * 3.4;
      out[i * 3 + 2] = (Math.random() - 0.5) * 4 - 1;
    }
    return out;
  }

  function shapeClosing(n) {
    // Calm, settled drift for Members/Social/Contact — the journey resting.
    var out = new Float32Array(n * 3);
    for (var i = 0; i < n; i++) {
      var r = 5 + Math.random() * 6;
      var theta = Math.random() * Math.PI * 2;
      out[i * 3] = Math.cos(theta) * r;
      out[i * 3 + 1] = (Math.random() - 0.5) * 4;
      out[i * 3 + 2] = Math.sin(theta) * r - 2;
    }
    return out;
  }

  /* ===========================================================
     WORLDS — the authored chapter list. `sectionId` maps each world
     onto a real DOM section, so ranges survive future content edits
     without touching this file (Part 6/7). `cameraTo`/`lookTo` are
     gentle, restrained offsets by design (Part 8: never sickening).
     =========================================================== */
  var WORLDS = [
    { id: "origin", sectionId: "about", shape: shapeOrigin, cam: [0, 0.3, 15], look: [0, 0, 0], ribbon: ["#C9A24B", "#B7A0DA"] },
    { id: "vision", sectionId: "vision", shape: shapeVision, cam: [1.6, 0.2, 10.5], look: [0, 0, 0], ribbon: ["#B7A0DA", "#CFEDEA"] },
    { id: "awards", sectionId: "awards", shape: shapeAwards, cam: [-1.3, 0.1, 8], look: [0, -0.2, 0], ribbon: ["#C9A24B", "#C9A24B"] },
    { id: "press", sectionId: "press", shape: shapePress, cam: [1.1, 0.4, 9], look: [-0.4, 0, 0], ribbon: ["#D9B876", "#8C6A2F"] },
    { id: "cinematic", sectionId: "cinematic", shape: shapePress, cam: [0, 0, 9], look: [0, 0, 0], ribbon: ["#C9A24B", "#B7A0DA"], isTransition: true },
    { id: "novels", sectionId: "novels", shape: shapeNovels, cam: [0, -0.2, 6.4], look: [0, 0, 0], ribbon: ["#B7A0DA", "#C9A24B"] },
    { id: "comics", sectionId: "comics", shape: shapeComics, cam: [1.4, 0.3, 7.2], look: [0, 0.2, 0], ribbon: ["#E0536B", "#C9A24B"] },
    { id: "audio", sectionId: "audiostories", shape: shapeAudio, cam: [0, 0, 8.6], look: [0, 0, 0], ribbon: ["#6FA9C9", "#B7A0DA"] },
    { id: "video", sectionId: "videostories", shape: shapeVideo, cam: [-1, 0.3, 9.2], look: [0, 0, 0], ribbon: ["#C9A24B", "#8C79B8"] },
    { id: "closing", sectionId: "members", shape: shapeClosing, cam: [0, 0, 12], look: [0, 0, 0], ribbon: ["#B7A0DA", "#6FC9B8"], spanTo: "contact" }
  ];

  var COUNT = isMobile ? 1400 : 4200;
  WORLDS.forEach(function (w) { w.positions = w.shape(COUNT); });

  var colors = new Float32Array(COUNT * 3);
  var sizes = new Float32Array(COUNT);
  var PALETTE = [
    [0.788, 0.635, 0.294], // gold
    [0.718, 0.627, 0.855], // violet
    [0.812, 0.929, 0.918]  // cyan
  ];
  for (var i = 0; i < COUNT; i++) {
    var c = PALETTE[(Math.random() * PALETTE.length) | 0];
    colors[i * 3] = c[0]; colors[i * 3 + 1] = c[1]; colors[i * 3 + 2] = c[2];
    sizes[i] = 0.05 + Math.random() * 0.1;
  }

  var current = new Float32Array(WORLDS[0].positions);
  var geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(current, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  var mat = new THREE.PointsMaterial({
    size: isMobile ? 0.08 : 0.09,
    map: dotTexture,
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
    opacity: 0.85
  });
  var points = new THREE.Points(geo, mat);
  scene.add(points);

  /* ---------- scroll → world ranges (measured, not guessed) ---------- */
  var ranges = []; // [{world, start, end}]
  function buildRanges() {
    ranges = [];
    for (var i = 0; i < WORLDS.length; i++) {
      var w = WORLDS[i];
      var startEl = document.getElementById(w.sectionId);
      if (!startEl) continue;
      var endEl = w.spanTo ? document.getElementById(w.spanTo) : startEl;
      var start = startEl.getBoundingClientRect().top + window.scrollY;
      var end = endEl.getBoundingClientRect().top + window.scrollY + endEl.offsetHeight;
      ranges.push({ world: w, start: start, end: Math.max(end, start + 1) });
    }
  }
  buildRanges();
  var resizeT = null;
  window.addEventListener("resize", function () {
    clearTimeout(resizeT);
    resizeT = setTimeout(buildRanges, 200);
  });

  function findWorldState(scrollY) {
    for (var i = 0; i < ranges.length; i++) {
      var r = ranges[i];
      if (scrollY < r.end || i === ranges.length - 1) {
        var span = r.end - r.start;
        var t = span > 0 ? Math.min(1, Math.max(0, (scrollY - r.start) / span)) : 0;
        var next = ranges[i + 1] ? ranges[i + 1].world : r.world;
        return { index: i, world: r.world, next: next, t: t };
      }
    }
    return { index: 0, world: WORLDS[0], next: WORLDS[0], t: 0 };
  }

  /* ---------- camera rig: reads current on-screen value, damps toward
     a live target — inherently interruptible, no separate reverse
     timeline required (see module header). ---------- */
  var camPos = new THREE.Vector3(0, 0, 15);
  var camTarget = new THREE.Vector3(0, 0, 15);
  var lookPos = new THREE.Vector3(0, 0, 0);
  var lookTarget = new THREE.Vector3(0, 0, 0);
  camera.position.copy(camPos);

  var pointerX = 0, pointerY = 0;
  if (hasFinePointer && !isMobile) {
    window.addEventListener("pointermove", function (e) {
      pointerX = (e.clientX / window.innerWidth - 0.5) * 2;
      pointerY = (e.clientY / window.innerHeight - 0.5) * 2;
    });
  }

  var lastWorldId = null;
  function applyState(state) {
    var w = state.world, n = state.next;
    var ease = state.t < 0.5 ? 2 * state.t * state.t : 1 - Math.pow(-2 * state.t + 2, 2) / 2;

    // Particle formation morphs across this world's own scroll span so
    // it finishes exactly as the next chapter begins.
    var from = w.positions, to = n.positions;
    var posAttr = geo.attributes.position;
    for (var i = 0; i < COUNT; i++) {
      var ix = i * 3;
      posAttr.array[ix] = from[ix] + (to[ix] - from[ix]) * ease;
      posAttr.array[ix + 1] = from[ix + 1] + (to[ix + 1] - from[ix + 1]) * ease;
      posAttr.array[ix + 2] = from[ix + 2] + (to[ix + 2] - from[ix + 2]) * ease;
    }
    posAttr.needsUpdate = true;

    // Camera framing blends the same way — a continuous move, not a cut.
    var mob = isMobile ? 0.45 : 1; // gentler amplitude on small screens
    camTarget.set(
      lerp(w.cam[0], n.cam[0], ease) * mob,
      lerp(w.cam[1], n.cam[1], ease) * mob,
      lerp(w.cam[2], n.cam[2], ease)
    );
    lookTarget.set(
      lerp(w.look[0], n.look[0], ease),
      lerp(w.look[1], n.look[1], ease),
      lerp(w.look[2], n.look[2], ease)
    );

    // The circle-morph transition (script.js) drives its own dolly-in
    // directly from the same eased value it already computes, so the
    // one gesture reads as a single camera move (Transition C).
    if (w.isTransition) {
      var cine = window.__nishaCinematic || { eased: 0 };
      camTarget.z = lerp(9, 3.2, cine.eased);
    }

    if (w.id !== lastWorldId) {
      lastWorldId = w.id;
      document.dispatchEvent(new CustomEvent("nisha:world", { detail: { id: w.id, ribbon: w.ribbon } }));
    }
  }
  function lerp(a, b, t) { return a + (b - a) * t; }

  var ticking = false;
  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(function () {
        applyState(findWorldState(window.scrollY));
        ticking = false;
      });
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- sizing ---------- */
  function resize() {
    var w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize", resize);

  /* ---------- render loop — damped toward the live target every
     frame, paused off-tab to avoid burning GPU on a hidden page. ---------- */
  var running = false, raf = null;
  var clock = new THREE.Clock();
  function frame() {
    if (!running) return;
    var dt = Math.min(clock.getDelta(), 1 / 30);
    var t = clock.getElapsedTime();

    camPos.x += (camTarget.x + pointerX * 0.35 - camPos.x) * 0.045;
    camPos.y += (camTarget.y - pointerY * 0.25 - camPos.y) * 0.045;
    camPos.z += (camTarget.z - camPos.z) * 0.06;
    lookPos.x += (lookTarget.x - lookPos.x) * 0.05;
    lookPos.y += (lookTarget.y - lookPos.y) * 0.05;
    lookPos.z += (lookTarget.z - lookPos.z) * 0.05;
    camera.position.copy(camPos);
    camera.lookAt(lookPos);

    points.rotation.y = t * 0.02;
    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  }
  function start() { if (!running) { running = true; clock.getDelta(); raf = requestAnimationFrame(frame); } }
  function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = null; }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stop(); else start();
  });

  applyState(findWorldState(window.scrollY));
  start();
})();
