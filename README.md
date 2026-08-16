# Dr. Nisha Shastry — Website (Plain HTML/CSS/JS)

No Node, no build step, no npm install. Just static files.

## Files
- `index.html` — **the whole website.** One continuous scrolling page: About → Novels → Comics → AudioStories → VideoStories → Members → Social → Contact. The navbar links (`#novels`, `#comics`, etc.) smooth-scroll straight to each section on this same page.
- `styles.css` — core design tokens, layout, animations (About/hero/awards/press/circle)
- `universe.css` — styling for the Novels/Comics/AudioStories/VideoStories sections
- `data.js` — **all novel/comic/audio/video content lives here** — add new works by adding one object per array
- `script.js` — nav, hero entrance, active-section highlighting, circle scroll-transform
- `universe.js` — renders the four catalogues into `index.html` from `data.js`
- `images/` — put ALL image files here directly (no subfolders — home page assets and every novel/comic/audio/video cover all live in this one flat folder)
- `novels.html`, `comics.html`, `audiostories.html`, `videostories.html` — kept only as redirects (`→ index.html#novels` etc.) in case any old link points at them; you can ignore or delete these.

## How to run
1. Open the `nisha-site` folder in VS Code.
2. Drop the home page images into `images/` using these **exact filenames**:
   - `photo.png`, `card1.png`, `card2.png`, `card3.png`, `cardleft.png`, `cardright.png`, `circle.png`
3. Drop catalogue artwork **directly into `images/`** (no subfolders), using sequential numbering that matches the real file format (use `.jpeg`/`.jpg` for photos, `.png` for true PNGs — check with `file yourimage.ext` in Terminal if unsure):
   - `images/novel1.jpeg` → `novel8.png` (Child of Two Worlds → Poison Girl, in the order listed in the master prompt)
   - `images/comic1.png` → `comic5.png` (The Glory Games → Poison Girl comic)
   - `images/audio1.png` → `audio2.png` (Khuni Raat → Keyur ka Kahar)
   - `images/video1.png` → `video6.png` (DarkVeil → Vanguard)
4. Open `index.html` directly in a browser (double-click it), **or**, for the smoothest experience, use the VS Code "Live Server" extension: right-click `index.html` → "Open with Live Server".

That's it — no terminal commands required. Until an image exists at a given path, that card automatically shows an elegant themed placeholder with the title — the moment the correctly-named file is added, it swaps in automatically. No code changes needed.

## The 3D "Cosmic Manuscript" scene
The cinematic circle section (`#cinematic`, between Press and Novels) now has a WebGL galaxy of particles behind it (`cosmic-scene.js`), synced to the same scroll progress that morphs the image into a circle — particles drift from a vast scattered cosmos into a tight glowing ring as you scroll. Built with Three.js loaded straight from a CDN (`https://cdn.jsdelivr.net/npm/three@0.160.0/...`) as a native ES module — no npm, no build step, matches everything else here.

**This one piece needs an internet connection** to load Three.js from the CDN (everything else on the site works fully offline via `file://`). If you're offline, that section just falls back to its plain dark gradient background — nothing breaks, it just won't have the particles. It also skips itself automatically under `prefers-reduced-motion` or if WebGL isn't available.

## Physical motion layer (`motion.js`)
Cover art and cards (novels/comics/audio/video, award cards, press cards, social cards) tilt gently toward the pointer and show a soft gold "ink-pool" glow that follows the cursor — a small dependency-free spring-physics system, desktop-only (skipped on touch and under reduced motion).

## Important: file extension must match the real file format
If an image doesn't show up on the page (but opens fine in Preview), the most common cause is a **mismatched extension** — e.g. a WhatsApp photo (which is always a real `.jpg`/JPEG) saved or renamed as `novel1.png`. Preview opens it anyway because it reads the actual file content, but the website loads it locally via `file://`, which trusts the extension — so a JPEG wearing a `.png` label fails to decode there even though it looks fine in Preview.

**To check:** open Terminal and run `file ~/Desktop/nisha/images/novels/novel1.png` (adjust the path). It will tell you the real format. If it says "JPEG" but the filename ends in `.png`, rename it to `.jpg` and update the matching `image:` path in `data.js` to end in `.jpg` too.

## Adding more content later
Open `data.js` and add a new object to the relevant array (`NOVELS`, `COMICS`, `AUDIO_STORIES`, `VIDEO_STORIES`), pointing `image` at the next sequential filename. The page will render it automatically — no HTML/CSS edits required.

## What's implemented
- Atmospheric animated background (lavender/blue/pink/gold, slow drifting light fields)
- Staggered navbar reveal, translucent-on-scroll navbar, animated mobile hamburger menu
- Hero: photo + full biography text with staggered paragraph reveal
- "My Vision" cinematic heading + vision statement, scroll-triggered
- "My Awards" — 3 stacked cards with background images, glowing animated borders, hover lift/zoom
- Press section — 2 side-by-side clickable cards (open in new tab, `rel="noopener noreferrer"`)
- Cinematic scroll-linked transformation: `circle.png` starts full-screen and morphs into a glowing floating circle as you scroll, reversible on scroll-up
- "Dive Deep Into The World of Stories" closing heading
- Stub anchor sections for Novels / Comics / AudioStories / VideoStories / Members / Social Media Handles (with the YouTube link) / Contact Me — ready for you to fill in later
- `prefers-reduced-motion` support — animations are disabled/simplified automatically
- Responsive down to mobile, no horizontal scroll, visible keyboard focus states

## What's on the catalogue pages
- Cinematic dark-atmosphere hero per page (Novels = cosmic literary, Comics = epic/energetic, Audio = sound-driven, Video = cinematic), all sharing the same typography/glow/nav language as the home page
- Each work: image on one side, title beneath it, description + metadata + links on the other side, alternating left/right on desktop for visual rhythm
- Amazon / Flipkart links (Novels), Read Issue (Comics), Watch Story (Video) — all marked **Coming Soon** until you provide real links in `data.js`
- Audio Stories include a fully-styled custom player UI (disabled state) with an idle waveform animation, ready to wire up to real audio later
- Scroll-triggered reveals, hover lift/glow on every card, a short cinematic loading veil on page entry, and full `prefers-reduced-motion` support

## Customizing
- Colors/fonts: edit the `:root` variables at the top of `styles.css`
- Text content: edit directly inside `index.html`
- Animation timing: search `--dur-fast`, `--dur-med`, `--dur-slow` in `styles.css`, and the `setTimeout`/delay values in `script.js`
