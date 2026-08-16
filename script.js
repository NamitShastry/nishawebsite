(function () {
  "use strict";

  if (window.__nishaNavBound) return; // universe.js may also wire nav on standalone pages
  window.__nishaNavBound = true;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Navbar scroll background ---------- */
  var navbar = document.getElementById("navbar");
  function onScrollNav() {
    if (window.scrollY > 40) navbar.classList.add("scrolled");
    else navbar.classList.remove("scrolled");
  }
  window.addEventListener("scroll", onScrollNav, { passive: true });
  onScrollNav();

  /* ---------- Mobile menu toggle ---------- */
  var toggle = document.getElementById("navToggle");
  var mobileMenu = document.getElementById("mobileMenu");
  toggle.addEventListener("click", function () {
    var isOpen = mobileMenu.classList.toggle("open");
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });
  document.querySelectorAll("[data-mobile]").forEach(function (link) {
    link.addEventListener("click", function () {
      mobileMenu.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });

  /* ---------- Active nav link on scroll ---------- */
  var navLinks = document.querySelectorAll("[data-nav]");
  var sections = Array.prototype.slice.call(
    document.querySelectorAll("main > section[id]")
  );
  function setActive() {
    var pos = window.scrollY + window.innerHeight * 0.35;
    var current = sections[0];
    sections.forEach(function (s) {
      if (s.offsetTop <= pos) current = s;
    });
    navLinks.forEach(function (l) {
      var match = l.getAttribute("href") === "#" + current.id;
      l.classList.toggle("active-link", match);
    });
  }
  window.addEventListener("scroll", setActive, { passive: true });
  setActive();

  /* ---------- Hero entrance sequence ---------- */
  var heroImageCol = document.querySelector(".hero__image-col");
  var heroParas = document.querySelectorAll(".hero__para");

  function runHeroEntrance() {
    if (reduceMotion) {
      heroImageCol.classList.add("in");
      heroParas.forEach(function (p) { p.classList.add("in"); });
      return;
    }
    setTimeout(function () { heroImageCol.classList.add("in"); }, 250);
    heroParas.forEach(function (p) {
      var order = parseInt(p.getAttribute("data-order"), 10) || 1;
      setTimeout(function () {
        p.classList.add("in");
      }, 550 + order * 260);
    });
  }
  window.addEventListener("DOMContentLoaded", runHeroEntrance);

  /* ---------- Generic scroll-reveal (IntersectionObserver) ---------- */
  var revealTargets = document.querySelectorAll(
    ".section-heading, .vision__text, .award-card, .press-card, .cinematic__heading"
  );

  if (reduceMotion) {
    revealTargets.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var el = entry.target;
            var group = el.closest(".awards, .press");
            if (group && el.matches(".award-card, .press-card")) {
              var siblings = Array.prototype.slice.call(
                group.querySelectorAll(".award-card, .press-card")
              );
              var idx = siblings.indexOf(el);
              setTimeout(function () { el.classList.add("in"); }, idx * 160);
            } else {
              el.classList.add("in");
            }
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -8% 0px" }
    );
    revealTargets.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Cinematic full-screen -> circle scroll transform ---------- */
  var cinematicSection = document.getElementById("cinematic");
  var circleWrap = document.getElementById("circleWrap");
  var cinematicHeading = document.getElementById("cinematicHeading");

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  var settled = false;

  function updateCinematic() {
    if (!cinematicSection) return;
    var rect = cinematicSection.getBoundingClientRect();
    var total = cinematicSection.offsetHeight - window.innerHeight;
    var scrolled = clamp(-rect.top, 0, total);
    var progress = total > 0 ? scrolled / total : 0;

    // Transform happens across the first ~55% of the pinned scroll distance.
    var t = clamp(progress / 0.55, 0, 1);
    // ease t
    var eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

    var vw = window.innerWidth;
    var vh = window.innerHeight;
    var finalSize = vw < 640 ? Math.min(240, vw * 0.62) : 420;

    var width = lerp(vw, finalSize, eased);
    var height = lerp(vh, finalSize, eased);
    var radius = lerp(0, 50, eased); // percent

    circleWrap.style.width = width + "px";
    circleWrap.style.height = height + "px";
    circleWrap.style.borderRadius = radius + "%";

    var glowStrength = eased;
    circleWrap.style.boxShadow =
      "0 0 " + (40 * glowStrength) + "px " + (10 * glowStrength) +
      "px rgba(201,162,75," + (0.35 * glowStrength) + "), 0 20px 60px rgba(34,29,44," + (0.25 * glowStrength) + ")";

    if (eased > 0.97 && !settled) {
      settled = true;
      circleWrap.classList.add("settled");
    } else if (eased < 0.97 && settled) {
      settled = false;
      circleWrap.classList.remove("settled");
    }

    // Heading reveals once the circle has mostly settled
    if (progress > 0.6) {
      cinematicHeading.classList.add("in");
    } else {
      cinematicHeading.classList.remove("in");
    }

    // Broadcast progress for the WebGL starfield (cosmic-scene.js) to read
    // each of its own animation frames — keeps the two systems in sync
    // without coupling them together.
    window.__nishaCinematic = { progress: progress, eased: eased };
  }

  if (reduceMotion) {
    // Show a simple static centered circle with heading visible, no scroll-linked transform
    circleWrap.style.width = "380px";
    circleWrap.style.height = "380px";
    circleWrap.style.borderRadius = "50%";
    cinematicHeading.classList.add("in");
  } else {
    var ticking = false;
    function onScrollCinematic() {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          updateCinematic();
          ticking = false;
        });
        ticking = true;
      }
    }
    window.addEventListener("scroll", onScrollCinematic, { passive: true });
    window.addEventListener("resize", onScrollCinematic);
    updateCinematic();
  }
})();
