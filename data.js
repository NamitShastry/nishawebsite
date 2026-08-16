/* ===========================================================
   DR. NISHA SHASTRY — CONTENT DATA
   Centralized source of truth for all catalogue content.
   To add a new work later: add one object to the matching array
   and drop the image into /images/<section>/ using the next
   sequential filename (novel9.png, comic6.png, audio3.png, video7.png...).
   No other code needs to change.
   =========================================================== */

/* ---------- NOVELS ---------- */
/* image: images/novel1.png ... novel8.png (in this order, directly inside /images — no subfolder)
   Confirmed mapping for all 8 covers:
     novel1.png -> Child of Two Worlds (Book 1)
     novel2.png -> Dharma's Reckoning (Book 2)
     novel3.png -> दो दुनिया का वारिस (Hindi, Part 1)
     novel4.png -> धर्मा का महायुद्ध (Hindi, Part 2)
     novel5.png -> केयूर का कहर
     novel6.png -> द इंटर्न
     novel7.png -> एक रहस्यमयी खेल
     novel8.png -> Poison Girl
   NOTE: use whatever extension matches the file's REAL format (.jpeg/.jpg for
   photos/WhatsApp exports, .png for true PNGs) — the extension must match
   the actual file content, not just be renamed, or it can silently fail to load. */
window.NOVELS = [
  {
    id: "child-of-two-worlds",
    image: "images/novel1.png",
    title: "Child of Two Worlds",
    series: "The Saga Untold",
    volume: "Book 1",
    language: "English",
    genre: "Science Fiction",
    description: "An ambitious science-fiction adventure involving worlds, civilizations and parallel realities. Dharma discovers his connection to the parallel universe of Muverse and confronts advanced civilizations, extraordinary technology and an interstellar empire.",
    theme: "cosmic",
    amazonUrl: "https://www.amazon.in/Child-Two-Worlds-Book-Untold/dp/8196403275",
    flipkartUrl: "https://www.flipkart.com/child-two-worlds-book-1-saga-untold/p/itm1c2ebc149d9a1"
  },
  {
    id: "dharmas-reckoning",
    image: "images/novel2.png",
    title: "Dharma\u2019s Reckoning",
    series: "The Saga Untold",
    volume: "Book 2 \u2014 Concluding Part",
    language: "English",
    genre: "Science Fiction",
    description: "The second and concluding part of The Saga Untold, involving Dharma, Supreme Commander Nokoevid, the Fran Galaxy and Muverse \u2014 with themes of rebellion, empire, destiny and cosmic warfare.",
    theme: "cosmic",
    amazonUrl: "https://www.amazon.in/-/hi/Dharmas-Reckoning-Book-Untold-Dharma/dp/9390347505",
    flipkartUrl: "https://www.flipkart.com/dharmas-reckoning-book-2-saga-untold-dharma-series/p/itmf8d8ac988eb71"
  },
  {
    id: "do-duniya-ka-waris",
    image: "images/novel3.png",
    title: "\u0926\u094B \u0926\u0941\u0928\u093F\u092F\u093E \u0915\u093E \u0935\u093E\u0930\u093F\u0938",
    series: "\u0905\u0928\u0915\u0939\u0940 \u0915\u0925\u093E \u2014 \u092D\u093E\u0917 \u090F\u0915",
    volume: "Hindi Edition",
    language: "Hindi",
    genre: "Science Fiction / Fantasy",
    description: "The Hindi edition connected to the Dharma saga \u2014 an interstellar adventure involving Dharma, another world, advanced civilizations, space politics, technology and war.",
    theme: "cosmic",
    amazonUrl: "https://www.amazon.in/Do-Duniya-Ka-Waris-Ankahi-ebook/dp/B0CPYMPQ21",
    flipkartUrl: "https://www.flipkart.com/hi/do-duniya-ka-waris-ek-ankahi-katha-bhaag-1/p/itm82925cf0ec4ae"
  },
  {
    id: "dharma-ka-mahayudh",
    image: "images/novel4.png",
    title: "\u0927\u0930\u094D\u092E\u093E \u0915\u093E \u092E\u0939\u093E\u092F\u0941\u0926\u094D\u0927",
    series: "\u0905\u0928\u0915\u0939\u0940 \u0915\u0925\u093E \u2014 \u092D\u093E\u0917 2",
    volume: "Hindi Edition",
    language: "Hindi",
    genre: "Science Fiction / Fantasy",
    description: "The Hindi continuation involving Dharma\u2019s confrontation with Supreme Commander Nokoevid, with conflicts spanning the Fran Galaxy and Muverse.",
    theme: "cosmic",
    amazonUrl: "https://www.amazon.in/Dharma-Ka-Mahayuddha-Ankahi-Katha/dp/9348578111",
    publisherUrl: "https://www.rajmangalpublishers.com/book/dharma-ka-mahayuddha-ankahi-katha-part-2"
  },
  {
    id: "keyur-ka-kahar-novel",
    image: "images/novel5.png",
    title: "\u0915\u0947\u092F\u0942\u0930 \u0915\u093E \u0915\u0939\u0930",
    series: "Dharma Universe",
    volume: "Standalone",
    language: "Hindi",
    genre: "Science Fiction Fantasy",
    description: "A science-fiction fantasy connected to the Dharma series, exploring Eritria\u2019s troubled past, Tejas, crime, conspiracy and social upheaval leading toward a larger interstellar conflict.",
    theme: "amber",
    amazonUrl: "https://www.amazon.in/Keyur-Kahar-Dr-Nisha-Shastry/dp/9348578987?s=bazaar",
    flipkartUrl: "https://www.flipkart.com/hi/keyur-ka-kahar/p/itm29a92daf082a8"
  },
  {
    id: "the-intern",
    image: "images/novel6.png",
    title: "\u0926 \u0907\u0902\u091F\u0930\u094D\u0928",
    series: "\u0925\u094D\u0930\u093F\u0932\u0930 \u092E\u0930\u094D\u0921\u0930 \u092E\u093F\u0938\u094D\u091F\u094D\u0930\u0940",
    volume: "Standalone",
    language: "Hindi",
    genre: "Thriller / Murder Mystery",
    description: "A murder mystery involving an intern, a pharmaceutical company, a mysterious professor\u2019s death and interconnected events surrounding a series of killings.",
    theme: "noir",
    amazonUrl: "https://www.amazon.in/Intern-Hindi-Dr-Nisha-Shastry-ebook/dp/B0DLGLFKZY",
    flipkartUrl: "https://www.flipkart.com/the-intern/p/itm7c24ea81bb649"
  },
  {
    id: "ek-rahasyamayi-khel",
    image: "images/novel7.png",
    title: "\u090F\u0915 \u0930\u0939\u0938\u094D\u092F\u092E\u092F\u0940 \u0916\u0947\u0932",
    series: "Standalone",
    volume: "",
    language: "Hindi",
    genre: "Psychological Crime Thriller",
    description: "A psychological crime thriller inspired by true events, involving mystery, fear, crime, psychological tension and unexpected twists.",
    theme: "noir",
    amazonUrl: "https://www.amazon.in/Rahasyamayi-Khel-Dr-Nisha-Shastry/dp/9348578324",
    flipkartUrl: "https://www.flipkart.com/ek-rahasyamayi-khel/p/itmf3dd7b9d4ab2a"
  },
  {
    id: "poison-girl",
    image: "images/novel8.png",
    title: "Poison Girl",
    series: "Standalone",
    volume: "",
    language: "English",
    genre: "Science Thriller",
    description: "A science-based thriller involving Natasha, the mysterious \u201cPoison Girl\u201d, dangerous events, murder, investigation, AI, identity, control and ethical questions surrounding scientific advancement.",
    theme: "toxic",
    amazonUrl: "https://www.amazon.com.br/Poison-Girl-Dr-Nisha-Shastry/dp/9349988828",
    flipkartUrl: "https://www.flipkart.com/poison-girl/p/itmd8087c4b160c6"
  }
];

/* ---------- COMICS (Ritugn universe) ---------- */
/* image: images/comic1.png ... comic5.png (in this order) */
window.COMICS = [
  {
    id: "the-glory-games",
    image: "images/comic1.png",
    title: "The Glory Games",
    issue: "Issue #1",
    universe: "Ritugn",
    language: "English",
    genre: "Superhero / Sci-Fi Action",
    description: "Set on distant Zydia, where the Glory Games determine power, Ritugn is drawn into an arena involving super-speed warriors, assassins and the undefeated champion known as The Ultimate \u2014 exploring the conflict between victory and justice.",
    theme: "cosmic",
    readUrl: "https://globalcomix.com/read/824779bd-5ab8-4e52-bbe9-85dae4860289/1/1"
  },
  {
    id: "the-terror-of-tamasur",
    image: "images/comic2.png",
    title: "The Terror of Tamasur",
    issue: "Issue #2",
    universe: "Ritugn",
    language: "English",
    genre: "Superhero / Sci-Fi Horror",
    description: "Involving Dr. Ishan Sharma, dark matter, a mysterious cosmic anomaly between Jupiter and Saturn, and Tamasur \u2014 a destructive dark-matter entity. Ritugn faces the threat while science and mythology intersect.",
    theme: "void",
    readUrl: "https://globalcomix.com/read/0399f25e-5713-4f93-a3bd-87fbfab05b0c/1"
  },
  {
    id: "wrath-of-zambara",
    image: "images/comic3.png",
    title: "Wrath of Zambara",
    issue: "Issue #3",
    universe: "Ritugn",
    language: "English",
    genre: "Superhero / Supernatural",
    description: "Involving the awakening of Zambara, forbidden black magic and supernatural forces \u2014 Ritugn confronts a powerful ancient deity.",
    theme: "amber",
    readUrl: "https://globalcomix.com/read/11b4c353-a828-441d-8115-9c6db5ddcc1c/1/1"
  },
  {
    id: "varka-heist",
    image: "images/comic4.png",
    title: "Varka Heist",
    issue: "Issue #4",
    universe: "Ritugn",
    language: "English",
    genre: "Superhero / Sci-Fi Action",
    description: "Involving Varka, alien forces, Nyara, Ritugn and Zorasta \u2014 a super-intelligent machine controlling civilizations and forcing them to harvest the energy source.",
    theme: "cosmic",
    readUrl: "https://globalcomix.com/read/cae29fd5-d963-445b-b1a4-bcfdb00425ad/1/1"
  },
  {
    id: "poison-girl-comic",
    image: "images/comic5.png",
    title: "Poison Girl",
    issue: "Standalone",
    universe: "Poison Girl",
    language: "English",
    genre: "Crime Thriller",
    description: "Involving Inspector Vijay Verma, mysterious poison attacks and the hidden criminal network Obsidian.",
    theme: "toxic",
    readUrl: "https://globalcomix.com/read/409fea17-5427-4887-960c-8b2ac11e049e/1"
  }
];

/* ---------- AUDIO STORIES ---------- */
/* image: images/audio1.png ... audio2.png (in this order) */
window.AUDIO_STORIES = [
  {
    id: "khuni-raat",
    image: "images/audio1.png",
    title: "Khuni Raat",
    language: "Hindi",
    genre: "Dark Mystery",
    description: "A dark mystery involving a beautiful woman committing brutal murders, psychological illness, serial-killer possibilities and a twist-oriented climax.",
    duration: "Coming soon",
    theme: "noir",
    listenUrl: "https://youtu.be/wWHXJdgEK_I"
  },
  {
    id: "keyur-ka-kahar-audio",
    image: "images/audio2.png",
    title: "Keyur ka Kahar",
    language: "English",
    genre: "Science Fiction",
    description: "A connected science-fiction story exploring Tejas\u2019s transformation into a violent criminal, social unrest, Eritria and the events preceding the Xor-Eritria war.",
    duration: "Coming soon",
    theme: "amber",
    listenUrl: "https://youtu.be/Gk18Z7UanN0"
  }
];

/* ---------- VIDEO STORIES ---------- */
/* image: images/video1.png ... video6.png (in this order) */
window.VIDEO_STORIES = [
  {
    id: "darkveil",
    image: "images/video1.png",
    title: "DarkVeil",
    language: "Hindi",
    genre: "Supernatural Thriller",
    description: "A dark supernatural thriller involving a plane crash, Yakhsh, the mysterious DarkVeil and a supernatural bargain that transforms Yakhsh into Assassin Prime.",
    theme: "void",
    watchUrl: "https://youtube.com/playlist?list=PLk07Q19O0k2C9cjuAieXpBshefyvI_3y0"
  },
  {
    id: "ritugn-video",
    image: "images/video2.png",
    title: "Ritugn",
    language: "Hindi",
    genre: "Sci-Fi / Mythology Superhero",
    description: "A science-fiction / mythology superhero series connecting ancient wisdom, future science, cosmic battles, dark matter, wormholes and celestial energies.",
    theme: "cosmic",
    watchUrl: "https://youtube.com/playlist?list=PLk07Q19O0k2Aa123nrbmw7Sp57dZORE0Q"
  },
  {
    id: "dharma-video",
    image: "images/video3.png",
    title: "Dharma",
    language: "Hindi",
    genre: "Science Fiction",
    description: "The Child of Two Worlds saga, involving Dharma, parallel worlds, mythology, artificial intelligence, interstellar empires and the conflict surrounding his identity and destiny.",
    theme: "cosmic",
    watchUrl: "https://youtu.be/4dwI1o234Mo"
  },
  {
    id: "anjan-katil",
    image: "images/video4.png",
    title: "Anjan Katil",
    language: "Hindi",
    genre: "Thriller / Horror",
    description: "A dark Hindi thriller/horror story involving mysterious family murders, revenge, hidden history and uncertainty over whether the killer is supernatural or human.",
    theme: "noir",
    watchUrl: "https://youtu.be/hY94QKo6rqU"
  },
  {
    id: "last-olethros",
    image: "images/video5.png",
    title: "Last Olethros",
    language: "Hindi",
    genre: "Mystical Sci-Fi / Fantasy",
    description: "A mystical sci-fi/fantasy saga involving eight civilizations, rival fronts and extraordinary characters with powers connected to elements, matter, probability, quantum computation and planetary forces.",
    theme: "amber",
    watchUrl: "https://youtu.be/h6d-u5VBbjI"
  },
  {
    id: "vanguard",
    image: "images/video6.png",
    title: "Vanguard",
    language: "English",
    genre: "Hard Science Fiction",
    description: "Set in a future where humanity has spread across the Solar System \u2014 involving interplanetary politics, technology, war, survival and expansion.",
    theme: "cosmic",
    watchUrl: "https://youtube.com/playlist?list=PLk07Q19O0k2BTKCavz0QEPF1sK658mdMH"
  }
];

/* ---------- SOCIAL LINKS ---------- */
/* Reusable data structure — add another object here to add a new platform
   card; no HTML/CSS changes required. URLs are used exactly as supplied. */
window.SOCIAL_LINKS = [
  {
    id: "instagram",
    platform: "Instagram",
    handle: "@imnish1992",
    url: "https://www.instagram.com/imnish1992/"
  },
  {
    id: "linkedin",
    platform: "LinkedIn",
    handle: "Dr. Nisha Shastry",
    url: "https://www.linkedin.com/in/dr-nisha-shastry-286854a9/"
  },
  {
    id: "youtube",
    platform: "YouTube",
    handle: "@nishashastry",
    url: "https://www.youtube.com/@nishashastry"
  }
];
