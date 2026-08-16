(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Nav / mobile menu / footer year ----------
     On index.html, script.js already wires this up and sets
     window.__nishaNavBound, so this block steps aside there.
     On any standalone page (e.g. novels.html) that loads only
     data.js + universe.js, this runs and makes the page fully
     self-sufficient — no dependency on script.js. */
  if (!window.__nishaNavBound) {
    window.__nishaNavBound = true;

    var yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    var navbar = document.getElementById("navbar");
    if (navbar) {
      var onScrollNav = function () {
        if (window.scrollY > 40) navbar.classList.add("scrolled");
        else navbar.classList.remove("scrolled");
      };
      window.addEventListener("scroll", onScrollNav, { passive: true });
      onScrollNav();
    }

    var navToggle = document.getElementById("navToggle");
    var mobileMenu = document.getElementById("mobileMenu");
    if (navToggle && mobileMenu) {
      navToggle.addEventListener("click", function () {
        var isOpen = mobileMenu.classList.toggle("open");
        navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      });
      document.querySelectorAll("[data-mobile]").forEach(function (link) {
        link.addEventListener("click", function () {
          mobileMenu.classList.remove("open");
          navToggle.setAttribute("aria-expanded", "false");
        });
      });
    }
  }

  /* Note: on index.html the richer scroll-spy / hero-entrance /
     circle-transform behaviour still comes from script.js. This file's
     job is rendering catalogue content plus the shared reveal helper,
     and — as above — full nav wiring when running standalone. */

  /* ---------- Reusable scroll-reveal ---------- */
  function observeReveal(selector, staggerMs) {
    var els = document.querySelectorAll(selector);
    if (!els.length) return;
    if (reduceMotion) {
      els.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry, i) {
          if (entry.isIntersecting) {
            var el = entry.target;
            var delay = staggerMs ? i * staggerMs : 0;
            setTimeout(function () { el.classList.add("in"); }, delay);
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    els.forEach(function (el) { io.observe(el); });
  }
  window.observeReveal = observeReveal;

  /* ---------- Placeholder particle dust ---------- */
  function buildParticles(count) {
    var wrap = document.createElement("div");
    wrap.className = "work-figure__particles";
    for (var i = 0; i < count; i++) {
      var dot = document.createElement("span");
      dot.style.left = Math.random() * 100 + "%";
      dot.style.top = Math.random() * 100 + "%";
      dot.style.animationDelay = (Math.random() * 6).toFixed(2) + "s";
      wrap.appendChild(dot);
    }
    return wrap;
  }

  var THEME_GRADIENT = {
    cosmic: "radial-gradient(circle at 30% 20%, #B7A0DA, transparent 60%), radial-gradient(circle at 75% 80%, #6FA9C9, transparent 55%)",
    amber: "radial-gradient(circle at 30% 20%, #C9A24B, transparent 60%), radial-gradient(circle at 75% 80%, #8C6A2F, transparent 55%)",
    noir: "radial-gradient(circle at 30% 20%, #4A4359, transparent 60%), radial-gradient(circle at 75% 80%, #221D2C, transparent 55%)",
    toxic: "radial-gradient(circle at 30% 20%, #7FB88A, transparent 60%), radial-gradient(circle at 75% 80%, #35442E, transparent 55%)",
    void: "radial-gradient(circle at 30% 20%, #6B3F5C, transparent 60%), radial-gradient(circle at 75% 80%, #1A0E14, transparent 55%)"
  };

  var ICON_SVG = '<svg class="work-figure__placeholder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v17a1 1 0 0 1-1 1H6.5A2.5 2.5 0 0 1 4 18.5v-14Z"/><path d="M4 18.5A2.5 2.5 0 0 1 6.5 16H20"/></svg>';

  /* ---------- Build one figure (image with graceful placeholder fallback) ---------- */
  function buildFigure(item, opts) {
    opts = opts || {};
    var figure = document.createElement("div");
    figure.className = "work-figure" + (opts.videoStyle ? " work-figure--video" : "");
    figure.style.setProperty("--placeholder-bg", THEME_GRADIENT[item.theme] || THEME_GRADIENT.cosmic);

    var img = document.createElement("img");
    img.alt = item.title + (opts.videoStyle ? " thumbnail" : " cover artwork");
    img.loading = "lazy";

    var placeholder = document.createElement("div");
    placeholder.className = "work-figure__placeholder";
    placeholder.innerHTML =
      ICON_SVG +
      '<span class="work-figure__placeholder-title">' + item.title + "</span>" +
      '<span class="work-figure__placeholder-tag">' + (opts.tag || "Artwork Coming Soon") + "</span>" +
      '<span class="work-figure__placeholder-path">' + item.image + "</span>";
    placeholder.appendChild(buildParticles(10));

    function showImage() {
      img.style.display = "block";
      placeholder.style.display = "none";
    }
    function showPlaceholder() {
      img.style.display = "none";
      placeholder.style.display = "flex";
    }

    // Attach listeners BEFORE setting src — if src were set first, a
    // fast/cached local load could fire "load" before we're listening,
    // leaving the placeholder stuck on screen even though the image is fine.
    img.addEventListener("load", function () {
      if (img.naturalWidth > 0) showImage();
    });
    img.addEventListener("error", function () {
      showPlaceholder();
      console.warn(
        "[Nisha Shastry site] Image not found for \u201c" + item.title + "\u201d.\n" +
        "Expected file at: " + item.image + "\n" +
        "Check: (1) it's inside that exact folder, (2) the filename matches exactly " +
        "including capitalisation, (3) the extension is .png."
      );
    });

    // Start with placeholder visible.
    showPlaceholder();
    img.src = item.image;

    // Safety net: if the browser had already loaded/cached this image
    // synchronously (rare, but happens with some local file:// setups),
    // the load event may already have fired. Check directly too.
    if (img.complete && img.naturalWidth > 0) showImage();

    var glow = document.createElement("div");
    glow.className = "work-figure__glow";
    glow.setAttribute("aria-hidden", "true");

    // Cinematic curtain-wipe: covers the artwork until the row scrolls
    // into view, then wipes away left-to-right (professional reveal).
    var curtain = document.createElement("div");
    curtain.className = "work-figure__curtain";
    curtain.setAttribute("aria-hidden", "true");

    // Subtle diagonal light sweep on hover.
    var shine = document.createElement("div");
    shine.className = "work-figure__shine";
    shine.setAttribute("aria-hidden", "true");

    figure.appendChild(placeholder);
    figure.appendChild(img);
    figure.appendChild(curtain);
    figure.appendChild(shine);
    figure.appendChild(glow);
    return figure;
  }

  /* ---------- Purchase / action link — real link when a URL is supplied,
     otherwise a "Coming Soon" placeholder badge ---------- */
  function buyLink(label, badge, url) {
    if (url) {
      var a = document.createElement("a");
      a.className = "buy-link buy-link--live";
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.setAttribute("aria-label", label + " — opens in a new tab");
      a.innerHTML = label + '<span class="buy-link__badge buy-link__badge--live">Visit \u2192</span>';
      return a;
    }
    var span = document.createElement("span");
    span.className = "buy-link";
    span.setAttribute("role", "note");
    span.innerHTML = label + '<span class="buy-link__badge">' + badge + "</span>";
    return span;
  }

  /* ---------- Meta pill row ---------- */
  function metaPills(values) {
    var wrap = document.createElement("div");
    wrap.className = "work-row__meta";
    values.filter(Boolean).forEach(function (v) {
      var span = document.createElement("span");
      span.textContent = v;
      wrap.appendChild(span);
    });
    return wrap;
  }

  /* ---------- Waveform bars for audio player ---------- */
  function buildWave(count) {
    var wrap = document.createElement("div");
    wrap.className = "audio-player__wave";
    wrap.setAttribute("aria-hidden", "true");
    for (var i = 0; i < count; i++) {
      var bar = document.createElement("span");
      bar.style.animationDelay = (i * 0.09).toFixed(2) + "s";
      wrap.appendChild(bar);
    }
    return wrap;
  }

  /* =========================================================
     RENDER: NOVELS
     ========================================================= */
  function renderNovels(containerId) {
    var container = document.getElementById(containerId);
    if (!container || !window.NOVELS) return;
    window.NOVELS.forEach(function (novel) {
      var row = document.createElement("article");
      row.className = "work-row";

      var media = document.createElement("div");
      media.className = "work-row__media";
      media.appendChild(buildFigure(novel));
      var cap = document.createElement("div");
      cap.className = "work-figure__caption";
      cap.textContent = novel.title;
      media.appendChild(cap);

      var body = document.createElement("div");
      body.className = "work-row__body";
      body.innerHTML =
        '<span class="work-row__eyebrow">' + (novel.series || "Standalone") + "</span>" +
        '<h3 class="work-row__title">' + novel.title + "</h3>";
      body.appendChild(metaPills([novel.volume, novel.language, novel.genre]));
      var desc = document.createElement("p");
      desc.className = "work-row__desc";
      desc.textContent = novel.description;
      body.appendChild(desc);

      var links = document.createElement("div");
      links.className = "work-row__links";
      links.appendChild(buyLink("Amazon", "Coming Soon", novel.amazonUrl));
      links.appendChild(buyLink("Flipkart", "Coming Soon", novel.flipkartUrl));
      if (novel.publisherUrl) {
        links.appendChild(buyLink("Publisher", "Coming Soon", novel.publisherUrl));
      }
      body.appendChild(links);

      row.appendChild(media);
      row.appendChild(body);
      container.appendChild(row);
    });
    observeReveal("#" + containerId + " .work-row", 0);
  }

  /* =========================================================
     RENDER: COMICS
     ========================================================= */
  function renderComics(containerId) {
    var container = document.getElementById(containerId);
    if (!container || !window.COMICS) return;
    window.COMICS.forEach(function (comic) {
      var row = document.createElement("article");
      row.className = "work-row";

      var media = document.createElement("div");
      media.className = "work-row__media";
      media.appendChild(buildFigure(comic));
      var cap = document.createElement("div");
      cap.className = "work-figure__caption";
      cap.textContent = comic.title;
      media.appendChild(cap);

      var body = document.createElement("div");
      body.className = "work-row__body";
      body.innerHTML =
        '<span class="work-row__eyebrow">' + comic.universe + " \u2014 " + comic.issue + "</span>" +
        '<h3 class="work-row__title">' + comic.title + "</h3>";
      body.appendChild(metaPills([comic.language, comic.genre]));
      var desc = document.createElement("p");
      desc.className = "work-row__desc";
      desc.textContent = comic.description;
      body.appendChild(desc);

      var links = document.createElement("div");
      links.className = "work-row__links";
      links.appendChild(buyLink("Read Issue", "Coming Soon", comic.readUrl));
      body.appendChild(links);

      row.appendChild(media);
      row.appendChild(body);
      container.appendChild(row);
    });
    observeReveal("#" + containerId + " .work-row", 0);
  }

  /* =========================================================
     RENDER: AUDIO STORIES
     ========================================================= */
  function renderAudio(containerId) {
    var container = document.getElementById(containerId);
    if (!container || !window.AUDIO_STORIES) return;
    window.AUDIO_STORIES.forEach(function (story) {
      var row = document.createElement("article");
      row.className = "work-row";

      var media = document.createElement("div");
      media.className = "work-row__media";
      media.appendChild(buildFigure(story, { tag: "Artwork Coming Soon" }));
      var cap = document.createElement("div");
      cap.className = "work-figure__caption";
      cap.textContent = story.title;
      media.appendChild(cap);

      var body = document.createElement("div");
      body.className = "work-row__body";
      body.innerHTML =
        '<span class="work-row__eyebrow">Audio Story</span>' +
        '<h3 class="work-row__title">' + story.title + "</h3>";
      body.appendChild(metaPills([story.language, story.genre]));
      var desc = document.createElement("p");
      desc.className = "work-row__desc";
      desc.textContent = story.description;
      body.appendChild(desc);

      var player = document.createElement("div");
      player.className = "audio-player";
      player.innerHTML = '<button class="audio-player__btn" disabled aria-label="Play (coming soon)">\u25B6</button>';
      player.appendChild(buildWave(26));
      var meta = document.createElement("span");
      meta.className = "audio-player__meta";
      meta.textContent = story.duration;
      player.appendChild(meta);
      body.appendChild(player);

      var links = document.createElement("div");
      links.className = "work-row__links";
      links.appendChild(buyLink("Listen", "Coming Soon", story.listenUrl));
      body.appendChild(links);

      row.appendChild(media);
      row.appendChild(body);
      container.appendChild(row);
    });
    observeReveal("#" + containerId + " .work-row", 0);
  }

  /* =========================================================
     RENDER: VIDEO STORIES
     ========================================================= */
  function renderVideo(containerId) {
    var container = document.getElementById(containerId);
    if (!container || !window.VIDEO_STORIES) return;
    window.VIDEO_STORIES.forEach(function (video) {
      var row = document.createElement("article");
      row.className = "work-row";

      var media = document.createElement("div");
      media.className = "work-row__media";
      media.appendChild(buildFigure(video, { tag: "Thumbnail Coming Soon", videoStyle: true }));
      var cap = document.createElement("div");
      cap.className = "work-figure__caption";
      cap.textContent = video.title;
      media.appendChild(cap);

      var body = document.createElement("div");
      body.className = "work-row__body";
      body.innerHTML =
        '<span class="work-row__eyebrow">Video Story</span>' +
        '<h3 class="work-row__title">' + video.title + "</h3>";
      body.appendChild(metaPills([video.language, video.genre]));
      var desc = document.createElement("p");
      desc.className = "work-row__desc";
      desc.textContent = video.description;
      body.appendChild(desc);

      var links = document.createElement("div");
      links.className = "work-row__links";
      links.appendChild(buyLink("Watch Story", "Coming Soon", video.watchUrl));
      body.appendChild(links);

      row.appendChild(media);
      row.appendChild(body);
      container.appendChild(row);
    });
    observeReveal("#" + containerId + " .work-row", 0);
  }

  var PLATFORM_ICON = {
    instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.3" cy="6.7" r="0.7" fill="currentColor" stroke="none"/></svg>',
    linkedin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="3" y="3" width="18" height="18" rx="3"/><line x1="7.2" y1="10" x2="7.2" y2="17.2"/><circle cx="7.2" cy="6.6" r="0.9" fill="currentColor" stroke="none"/><path d="M11 17.2v-4.6c0-1.6 1.1-2.7 2.5-2.7s2.5 1.1 2.5 2.7v4.6"/><line x1="11" y1="10" x2="11" y2="17.2"/></svg>',
    youtube: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="2.4" y="6" width="19.2" height="12" rx="4"/><path d="M10.3 9.4l5.2 2.6-5.2 2.6z" fill="currentColor" stroke="none"/></svg>'
  };

  /* =========================================================
     RENDER: SOCIAL LINKS
     ========================================================= */
  function renderSocialLinks(containerId) {
    var container = document.getElementById(containerId);
    if (!container || !window.SOCIAL_LINKS) return;
    window.SOCIAL_LINKS.forEach(function (link, i) {
      var a = document.createElement("a");
      a.className = "social-card " + (i % 2 === 0 ? "card-left" : "card-right");
      a.href = link.url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.setAttribute("aria-label", "Visit Dr. Nisha Shastry on " + link.platform);
      a.innerHTML =
        '<div class="social-card__shine" aria-hidden="true"></div>' +
        '<div class="social-card__icon" aria-hidden="true">' + (PLATFORM_ICON[link.id] || "") + "</div>" +
        '<span class="social-card__platform">' + link.platform + "</span>" +
        '<span class="social-card__handle">' + link.handle + "</span>" +
        '<span class="social-card__cta">Visit Profile \u2192</span>';
      container.appendChild(a);
    });
    observeReveal("#" + containerId + " .social-card", 150);
  }

  window.renderNovels = renderNovels;
  window.renderComics = renderComics;
  window.renderAudio = renderAudio;
  window.renderVideo = renderVideo;
  window.renderSocialLinks = renderSocialLinks;
})();
