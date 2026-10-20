/* ============================================================
   SyntaxHub — application logic
   Vanilla JS · JSON-driven · EN/AR aware
   ============================================================ */
(() => {
  "use strict";

  /* ----------------------------------------------------------
     Configuration 
     ---------------------------------------------------------- */
  const DATA_URL = "data/snippets.json";
  const LANG_STORAGE_KEY = "syntaxhub:lang";
  const FAVORITES_STORAGE_KEY = "syntaxhub:favorites";
  const FONT_STORAGE_KEY = "syntaxhub:codeFont";

  // Code font size: percentage steps persisted across visits
  const FONT_STEPS = [80, 90, 100, 110, 120, 130, 140, 150];
  const FONT_DEFAULT_INDEX = 2;

  // Map our language ids to Highlight.js language names
  const HLJS_ALIASES = {
    csharp: "csharp",
    cpp: "cpp",
    javascript: "javascript",
    typescript: "typescript",
    python: "python",
    java: "java",
    php: "php",
    sql: "sql",
    htmlcss: "xml",
  };

  const I18N = {
    en: {
      pageTitle: "SyntaxHub — Code Snippet Library",
      designedBy: "Designed & Developed by Ali Durra",
      heroTitle: "Find the right snippet, fast.",
      heroSubtitle:
        "A curated, copy-ready library of code patterns across nine languages — built for comfort, speed and clarity.",
      searchPlaceholder: "Search titles, descriptions or code…",
      searchAria: "Search snippets",
      clearSearch: "Clear search",
      languageSwitcher: "Language switcher",
      filterAria: "Language filters",
      snippetsHeading: "Code snippets",
      all: "All",
      statSnippets: "snippets",
      statLanguages: "languages",
      emptyTitle: "No snippets found",
      emptyText: "Try a different keyword or choose another language tab.",
      resetFilters: "Reset filters",
      errorTitle: "Couldn't load the snippet library",
      errorText:
        "The data file could not be fetched. Make sure data/snippets.json exists and the page is served over HTTP (for example python -m http.server).",
      retry: "Retry",
      copy: "Copy",
      copied: "Copied to Clipboard!",
      copiedLabel: "Copied! ✓",
      copyAria: "Copy code",
      favorite: "Save to favorites",
      unfavorite: "Remove from favorites",
      favorites: "Favorites",
      favoritesEmptyTitle: "No favorites yet",
      favoritesEmptyText:
        "Tap the star on any snippet to keep it here — favorites are saved in this browser.",
      copyFailed: "Copy failed. Please select the code manually.",
      view: "View full snippet",
      viewAria: "Open full snippet",
      close: "Close",
      skipToContent: "Skip to content",
      fontSize: "Code font size",
      fontDecrease: "Decrease code font size",
      fontIncrease: "Increase code font size",
      fontReset: "Reset code font size",
      footer: "© All Rights Reserved | Designed & Developed by Ali Durra",
    },
    ar: {
      pageTitle: "SyntaxHub — مكتبة مقاطع الكود",
      designedBy: "تصميم وتطوير علي درة",
      heroTitle: "اعثر على المقطع المناسب بسرعة.",
      heroSubtitle:
        "مكتبة منتقاة وجاهزة للنسخ لأنماط برمجية عبر تسع لغات — صُممت لراحة العين والسرعة والوضوح.",
      searchPlaceholder: "ابحث في العناوين أو الأوصاف أو الكود…",
      searchAria: "بحث في المقاطع",
      clearSearch: "مسح البحث",
      languageSwitcher: "مبدّل اللغة",
      filterAria: "تصفية حسب اللغة",
      snippetsHeading: "مقاطع الكود",
      all: "الكل",
      statSnippets: "مقطعًا",
      statLanguages: "لغات",
      emptyTitle: "لا توجد نتائج",
      emptyText: "جرّب كلمة مفتاحية أخرى أو اختر تبويب لغة مختلفًا.",
      resetFilters: "إعادة تعيين التصفية",
      errorTitle: "تعذّر تحميل مكتبة المقاطع",
      errorText:
        "لم يتم جلب ملف البيانات. تأكد من وجود data/snippets.json وأن الصفحة تُقدَّم عبر HTTP (مثل python -m http.server).",
      retry: "إعادة المحاولة",
      copy: "نسخ",
      copied: "تم نسخ الكود!",
      copiedLabel: "تم النسخ! ✓",
      copyAria: "نسخ الكود",
      favorite: "إضافة إلى المفضلة",
      unfavorite: "إزالة من المفضلة",
      favorites: "المفضلة",
      favoritesEmptyTitle: "لا توجد مفضلات بعد",
      favoritesEmptyText:
        "اضغط النجمة على أي مقطع لحفظه هنا — تُحفظ المفضلة في هذا المتصفح.",
      copyFailed: "فشل النسخ. يُرجى تحديد الكود يدويًا.",
      view: "عرض المقطع كاملًا",
      viewAria: "فتح المقطع كاملًا",
      close: "إغلاق",
      skipToContent: "تخطَّ إلى المحتوى",
      fontSize: "حجم خط الكود",
      fontDecrease: "تصغير خط الكود",
      fontIncrease: "تكبير خط الكود",
      fontReset: "إعادة حجم خط الكود",
      footer: "جميع الحقوق محفوظة © | تصميم وتطوير علي درّة",
    },
  };

  const LANG_CODE_LABELS = {
    csharp: "C#",
    cpp: "C++",
    javascript: "JavaScript",
    typescript: "TypeScript",
    python: "Python",
    java: "Java",
    php: "PHP",
    sql: "SQL",
    htmlcss: "HTML/CSS",
  };

  /* ----------------------------------------------------------
     State | حالة التطبيق
     ---------------------------------------------------------- */
  const state = {
    lang: "en",
    snippets: [],
    languages: [],
    topics: {},
    activeFilter: "all",
    query: "",
    favorites: new Set(),
    fontIndex: FONT_DEFAULT_INDEX,
    rendered: [],
    modalId: null,
    lastFocused: null,
  };

  /* ----------------------------------------------------------
     DOM references مراجع عناصر DOM
     ---------------------------------------------------------- */
  const el = {
    html: document.documentElement,
    filterBar: document.getElementById("filterBar"),
    grid: document.getElementById("snippetsGrid"),
    search: document.getElementById("search"),
    searchWrap: document.querySelector(".search-wrap"),
    clearSearch: document.getElementById("clearSearch"),
    empty: document.getElementById("emptyState"),
    error: document.getElementById("errorState"),
    resetFilters: document.getElementById("resetFilters"),
    retry: document.getElementById("retryLoad"),
    visibleCount: document.getElementById("visibleCount"),
    languageCount: document.getElementById("languageCount"),
    langButtons: Array.from(document.querySelectorAll(".lang-btn")),
    fontDecrease: document.getElementById("fontDecrease"),
    fontIncrease: document.getElementById("fontIncrease"),
    fontValue: document.getElementById("fontValue"),
    modal: document.getElementById("modal"),
    modalLang: document.getElementById("modalLang"),
    modalTitle: document.getElementById("modalTitle"),
    modalDesc: document.getElementById("modalDesc"),
    modalCode: document.getElementById("modalCode"),
    toast: document.getElementById("toast"),
    toastText: document.getElementById("toastText"),
  };

  let cardTemplate = null;

  /* ----------------------------------------------------------
     Helpers مساعدات
     ---------------------------------------------------------- */
  const t = (key) =>
    (I18N[state.lang] && I18N[state.lang][key]) || I18N.en[key] || key;

  const norm = (value) =>
    String(value == null ? "" : value)
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();

  const localized = (field, lang = state.lang) => {
    if (field == null) return "";
    if (typeof field === "string") return field;
    return field[lang] || field.en || field.ar || "";
  };

  const languageLabel = (id) => {
    const known = state.languages.find((l) => l.id === id);
    if (known) return known.label || known.name || id;
    return LANG_CODE_LABELS[id] || String(id);
  };

  /* ----------------------------------------------------------
     Persistence (localStorage) تخزين محلي
     ---------------------------------------------------------- */
  function readStorage(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw == null ? fallback : raw;
    } catch (_) {
      return fallback;
    }
  }

  function writeStorage(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (_) {
      /* storage unavailable or full — feature degrades gracefully */
    }
  }

  function loadFavorites() {
    const raw = readStorage(FAVORITES_STORAGE_KEY, "[]");
    try {
      const parsed = JSON.parse(raw);
      state.favorites = new Set(Array.isArray(parsed) ? parsed.map(String) : []);
    } catch (_) {
      state.favorites = new Set();
    }
  }

  function saveFavorites() {
    writeStorage(FAVORITES_STORAGE_KEY, JSON.stringify([...state.favorites]));
  }

  function isFavorite(id) {
    return state.favorites.has(id);
  }

  function toggleFavorite(id) {
    const nowFavorite = !isFavorite(id);
    if (nowFavorite) state.favorites.add(id);
    else state.favorites.delete(id);
    saveFavorites();
    return nowFavorite;
  }

  /* ----------------------------------------------------------
     Code font size خط حجم الخط
     ---------------------------------------------------------- */
  function loadFontIndex() {
    const stored = Number(readStorage(FONT_STORAGE_KEY, FONT_DEFAULT_INDEX));
    state.fontIndex = Number.isInteger(stored) && FONT_STEPS[stored] ? stored : FONT_DEFAULT_INDEX;
  }

  function applyFontSize() {
    const percent = FONT_STEPS[state.fontIndex];
    el.html.style.setProperty("--code-font-size", `${percent}%`);
    el.fontValue.textContent = `${percent}%`;

    el.fontDecrease.disabled = state.fontIndex === 0;
    el.fontIncrease.disabled = state.fontIndex === FONT_STEPS.length - 1;
    el.fontValue.title = t("fontReset");
    el.fontValue.classList.toggle("is-default", state.fontIndex === FONT_DEFAULT_INDEX);
  }

  function changeFontSize(delta) {
    const next = Math.min(FONT_STEPS.length - 1, Math.max(0, state.fontIndex + delta));
    if (next === state.fontIndex) return;
    state.fontIndex = next;
    writeStorage(FONT_STORAGE_KEY, String(next));
    applyFontSize();
  }

  function resetFontSize() {
    if (state.fontIndex === FONT_DEFAULT_INDEX) return;
    state.fontIndex = FONT_DEFAULT_INDEX;
    writeStorage(FONT_STORAGE_KEY, String(FONT_DEFAULT_INDEX));
    applyFontSize();
  }

  /* ----------------------------------------------------------
     Syntax highlighting
     ---------------------------------------------------------- */
  function hljs() {
    return window.hljs || null;
  }

  function hljsLanguage(id) {
    const lib = hljs();
    return (lib && HLJS_ALIASES[id]) || null;
  }

  /**
   * Paint syntax colors into a code element. Falls back to plain text when the
   * CDN is unavailable, and always keeps the raw code LTR and unmodified.
   */
  function paintCode(codeEl, snippet) {
    const source = snippet.code;
    const lib = hljs();
    const lang = hljsLanguage(snippet.language);

    if (!lib || !lang) {
      codeEl.textContent = source;
      delete codeEl.dataset.highlighted;
      return;
    }

    try {
      const result = lib.highlight(source, { language: lang, ignoreIllegals: true });
      codeEl.innerHTML = result.value;
      codeEl.classList.add("hljs");
      codeEl.dataset.highlighted = "yes";
    } catch (err) {
      console.warn("SyntaxHub: highlighting failed, showing plain code —", err);
      codeEl.textContent = source;
      delete codeEl.dataset.highlighted;
    }
  }

  /* ----------------------------------------------------------
     Language (EN / AR)
     ---------------------------------------------------------- */
  function setLanguage(lang, { persist = true } = {}) {
    state.lang = lang === "ar" ? "ar" : "en";
    const isAr = state.lang === "ar";

    el.html.setAttribute("lang", state.lang);
    el.html.setAttribute("dir", isAr ? "rtl" : "ltr");
    document.title = t("pageTitle");

    document.querySelectorAll("[data-i18n]").forEach((node) => {
      node.textContent = t(node.dataset.i18n);
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
      node.setAttribute("placeholder", t(node.dataset.i18nPlaceholder));
    });

    document.querySelectorAll("[data-i18n-aria]").forEach((node) => {
      node.setAttribute("aria-label", t(node.dataset.i18nAria));
    });

    el.langButtons.forEach((btn) => {
      const active = btn.dataset.lang === state.lang;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", String(active));
    });

    if (persist) {
      try {
        localStorage.setItem(LANG_STORAGE_KEY, state.lang);
      } catch (_) {
        /* storage unavailable — ignore */
      }
    }

    renderFilters();
    render();

    if (state.modalId) {
      const snippet = state.snippets.find((s) => s.id === state.modalId);
      if (snippet) fillModal(snippet);
    }
  }

  function detectInitialLanguage() {
    let stored = null;
    try {
      stored = localStorage.getItem(LANG_STORAGE_KEY);
    } catch (_) {
      /* ignore */
    }
    if (stored === "ar" || stored === "en") return stored;
    return "en";
  }

  /* ----------------------------------------------------------
     Data loading
     ---------------------------------------------------------- */
  async function loadData() {
    showState("loading");
    try {
      const response = await fetch(DATA_URL, { cache: "no-cache" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      const snippets = Array.isArray(data) ? data : data.snippets;

      if (!Array.isArray(snippets)) throw new Error("Invalid data format");

      state.snippets = snippets.filter(
        (s) => s && s.id && s.language && s.code,
      );
      state.languages = buildLanguages(
        Array.isArray(data.languages) ? data.languages : [],
      );
      state.topics =
        data.topics && typeof data.topics === "object" ? data.topics : {};
      state.activeFilter = "all";

      el.languageCount.textContent = String(visibleLanguageCount());
      el.visibleCount.textContent = String(state.snippets.length);
      renderFilters();
      render();
    } catch (err) {
      console.error("SyntaxHub: failed to load snippets —", err);
      showState("error");
    }
  }

  /** Merge declared languages with any languages found in the snippet data. */
  function buildLanguages(declared) {
    const map = new Map();

    declared.forEach((lang) => {
      if (!lang || !lang.id) return;
      map.set(lang.id, {
        id: lang.id,
        label: lang.label || lang.name || LANG_CODE_LABELS[lang.id] || lang.id,
        name: lang.name || lang.label || lang.id,
      });
    });

    state.snippets.forEach((snippet) => {
      if (!map.has(snippet.language)) {
        map.set(snippet.language, {
          id: snippet.language,
          label: LANG_CODE_LABELS[snippet.language] || snippet.language,
          name: snippet.language,
        });
      }
    });

    return Array.from(map.values());
  }

  function visibleLanguageCount() {
    const used = new Set(state.snippets.map((s) => s.language));
    return state.languages.filter((lang) => used.has(lang.id)).length;
  }

  function countFor(tabId) {
    if (tabId === "favorites") return state.favorites.size;
    if (tabId === "all") return state.snippets.length;
    return state.snippets.filter((s) => s.language === tabId).length;
  }

  /* ----------------------------------------------------------
     Filters
     ---------------------------------------------------------- */
  const FAVORITES_TAB = "favorites";

  function makeFilterTab({ id, label, icon }) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "filter-tab";
    btn.dataset.filter = id;
    btn.setAttribute("aria-pressed", String(state.activeFilter === id));
    btn.classList.toggle("is-active", state.activeFilter === id);

    const labelEl = document.createElement("span");
    labelEl.className = "tab-label";
    if (icon) {
      labelEl.innerHTML = icon;
      labelEl.append(document.createTextNode(" " + label));
    } else {
      labelEl.textContent = label;
    }

    const count = document.createElement("span");
    count.className = "tab-count";
    count.textContent = String(countFor(id));

    btn.append(labelEl, count);
    return btn;
  }

  const STAR_ICON =
    '<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true"><path d="M12 2.5l2.95 5.98 6.6.96-4.78 4.66 1.13 6.57L12 17.57l-5.9 3.1 1.13-6.57L2.45 9.44l6.6-.96L12 2.5z"/></svg>';

  function renderFilters() {
    const tabs = [
      { id: "all", label: t("all") },
      { id: FAVORITES_TAB, label: t("favorites"), icon: STAR_ICON },
    ].concat(state.languages.map((lang) => ({ id: lang.id, label: lang.label })));

    const frag = document.createDocumentFragment();
    tabs.forEach((tab) => frag.appendChild(makeFilterTab(tab)));
    el.filterBar.replaceChildren(frag);
  }

  /** Refresh only the tab counts and pressed states (keeps focus intact). */
  function syncFilters() {
    el.filterBar.querySelectorAll(".filter-tab").forEach((btn) => {
      const active = btn.dataset.filter === state.activeFilter;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", String(active));
      const count = btn.querySelector(".tab-count");
      if (count) count.textContent = String(countFor(btn.dataset.filter));
    });
  }

  function setFilter(filter) {
    if (state.activeFilter === filter) return;
    state.activeFilter = filter;
    syncFilters();
    render();
  }

  /* ----------------------------------------------------------
     Search & filtering
     ---------------------------------------------------------- */
  function matches(snippet, query) {
    if (!query) return true;

    const haystack = [
      snippet.title && snippet.title.en,
      snippet.title && snippet.title.ar,
      snippet.description && snippet.description.en,
      snippet.description && snippet.description.ar,
      snippet.code,
      snippet.language,
      LANG_CODE_LABELS[snippet.language],
      snippet.topic,
    ]
      .map(norm)
      .join(" ");

    return query.split(" ").every((token) => haystack.includes(token));
  }

  function getResults() {
    const query = norm(state.query);

    return state.snippets.filter((snippet) => {
      if (state.activeFilter === FAVORITES_TAB && !isFavorite(snippet.id))
        return false;
      if (
        state.activeFilter !== "all" &&
        state.activeFilter !== FAVORITES_TAB &&
        snippet.language !== state.activeFilter
      )
        return false;
      return matches(snippet, query);
    });
  }

  /* ----------------------------------------------------------
     Rendering
     ---------------------------------------------------------- */
  function getCardTemplate() {
    if (cardTemplate) return cardTemplate;

    const template = document.createElement("template");
    template.innerHTML = `
      <article class="snippet-card">
        <div class="card-head">
          <div class="card-heading">
            <span class="topic-chip"></span>
            <h3 class="card-title"></h3>
            <p class="card-desc"></p>
          </div>
          <div class="card-actions">
            <button type="button" class="fav-btn" data-favorite aria-pressed="false">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
                stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M12 3.2l2.7 5.47 6.04.88-4.37 4.26 1.03 6.02L12 16.99l-5.4 2.84 1.03-6.02-4.37-4.26 6.04-.88L12 3.2z" />
              </svg>
            </button>
            <span class="lang-chip"></span>
          </div>
        </div>
        <div class="code-box">
          <button type="button" class="copy-btn" data-copy>
            <svg class="icon-copy" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <rect x="9" y="9" width="11" height="11" rx="2"></rect>
              <path d="M5 15V5a2 2 0 0 1 2-2h10"></path>
            </svg>
            <span class="copy-label"></span>
          </button>
          <pre><code dir="ltr"></code></pre>
        </div>
        <div class="card-foot">
          <button type="button" class="open-btn" data-open>
            <span class="open-label"></span>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </div>
      </article>`;

    cardTemplate = template;
    return template;
  }

  function createCard(snippet, index) {
    const node = getCardTemplate().content.firstElementChild.cloneNode(true);

    node.dataset.id = snippet.id;
    node.dataset.language = snippet.language;
    node.style.animationDelay = `${Math.min(index, 8) * 35}ms`;

    const topicChip = node.querySelector(".topic-chip");
    topicChip.textContent = snippet.topic || "";
    topicChip.hidden = !snippet.topic;

    node.querySelector(".card-title").textContent = localized(snippet.title);
    node.querySelector(".card-desc").textContent = localized(
      snippet.description,
    );
    node.querySelector(".lang-chip").textContent = languageLabel(
      snippet.language,
    );

    const copyBtn = node.querySelector("[data-copy]");
    copyBtn.setAttribute(
      "aria-label",
      `${t("copyAria")}: ${localized(snippet.title)}`,
    );
    copyBtn.querySelector(".copy-label").textContent = t("copy");

    const code = node.querySelector("code");
    paintCode(code, snippet);
    // Only fade the bottom edge when the code actually overflows
    if (snippet.code.split("\n").length > 16) node.querySelector(".code-box").classList.add("is-scrollable");

    const favBtn = node.querySelector("[data-favorite]");
    syncFavoriteButton(favBtn, snippet);

    const openBtn = node.querySelector("[data-open]");
    openBtn.setAttribute(
      "aria-label",
      `${t("viewAria")}: ${localized(snippet.title)}`,
    );
    openBtn.querySelector(".open-label").textContent = t("view");

    return node;
  }

  /** Reflect favorite state on a card's star button (label, pressed state, tint). */
  function syncFavoriteButton(button, snippet) {
    if (!button) return;
    const saved = isFavorite(snippet.id);
    button.classList.toggle("is-active", saved);
    button.setAttribute("aria-pressed", String(saved));
    const label = saved
      ? `${t("unfavorite")}: ${localized(snippet.title)}`
      : `${t("favorite")}: ${localized(snippet.title)}`;
    button.setAttribute("aria-label", label);
    button.title = label;
  }

  function render() {
    const results = getResults();
    state.rendered = results;

    if (!state.snippets.length) {
      el.grid.replaceChildren();
      el.empty.hidden = true;
      el.visibleCount.textContent = "0";
      return;
    }

    showState(results.length ? "ready" : "empty");

    const frag = document.createDocumentFragment();
    results.forEach((snippet, index) => {
      try {
        frag.appendChild(createCard(snippet, index));
      } catch (err) {
        console.error("SyntaxHub: card render failed", snippet.id, err);
      }
    });
    el.grid.replaceChildren(frag);
    el.visibleCount.textContent = String(results.length);
  }

  function showState(kind) {
    // The empty panel explains favorites differently than a failed search
    const favoritesView = state.activeFilter === FAVORITES_TAB;
    el.empty.querySelector(".state-title").textContent = favoritesView
      ? t("favoritesEmptyTitle")
      : t("emptyTitle");
    el.empty.querySelector(".state-text").textContent = favoritesView
      ? t("favoritesEmptyText")
      : t("emptyText");

    el.error.hidden = kind !== "error";
    el.empty.hidden = kind !== "empty";
    el.grid.hidden = kind !== "ready" && kind !== "loading";

    if (kind === "loading") {
      el.grid.replaceChildren();
      el.empty.hidden = true;
      el.error.hidden = true;
    }
  }

  /* ----------------------------------------------------------
     Search input
     ---------------------------------------------------------- */
  let searchFrame = 0;

  function onSearchInput() {
    const value = el.search.value;
    el.searchWrap.classList.toggle("has-value", value.length > 0);
    el.clearSearch.hidden = value.length === 0;

    if (searchFrame) cancelAnimationFrame(searchFrame);
    searchFrame = requestAnimationFrame(() => {
      state.query = value;
      render();
    });
  }

  function clearSearch(focus = true) {
    el.search.value = "";
    state.query = "";
    el.searchWrap.classList.remove("has-value");
    el.clearSearch.hidden = true;
    render();
    if (focus) el.search.focus();
  }

  function resetFilters() {
    state.activeFilter = "all";
    el.filterBar.querySelectorAll(".filter-tab").forEach((btn) => {
      const active = btn.dataset.filter === "all";
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", String(active));
    });
    clearSearch(false);
  }

  /* ----------------------------------------------------------
     Clipboard | نسخ إلى الحافظة
     ---------------------------------------------------------- */
  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    // Fallback for file:// or older browsers
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.top = "-1000px";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch (_) {
      ok = false;
    }
    document.body.removeChild(area);
    if (!ok) throw new Error("Copy command failed");
    return true;
  }

  let toastTimer = 0;

  function showToast(message) {
    el.toastText.textContent = message;
    el.toast.classList.add("is-visible");

    clearTimeout(toastTimer);
    toastTimer = setTimeout(
      () => el.toast.classList.remove("is-visible"),
      2000,
    );
  }

  function flashCopied(button) {
    if (!button) return;
    const label = button.querySelector(".copy-label");
    button.classList.add("is-copied");
    if (label) label.textContent = t("copiedLabel");
    // Icon swap is CSS-only via .is-copied
    clearTimeout(button._copyTimer);
    button._copyTimer = setTimeout(() => {
      button.classList.remove("is-copied");
      if (label) label.textContent = t("copy");
    }, 2000);
  }

  async function handleCopy(code, button) {
    try {
      await copyText(code);
      showToast(t("copied"));
      flashCopied(button);
    } catch (err) {
      console.error("SyntaxHub: copy failed —", err);
      showToast(t("copyFailed"));
    }
  }

  /* ----------------------------------------------------------
     Modal
     ---------------------------------------------------------- */
  function fillModal(snippet) {
    el.modalLang.textContent = snippet.topic
      ? `${languageLabel(snippet.language)} · ${snippet.topic}`
      : languageLabel(snippet.language);
    el.modalTitle.textContent = localized(snippet.title);
    el.modalDesc.textContent = localized(snippet.description);
    paintCode(el.modalCode, snippet);

    const copyBtn = el.modal.querySelector("[data-copy]");
    copyBtn.setAttribute(
      "aria-label",
      `${t("copyAria")}: ${localized(snippet.title)}`,
    );
    copyBtn.querySelector(".copy-label").textContent = t("copy");
  }

  function openModal(id) {
    const snippet = state.snippets.find((s) => s.id === id);
    if (!snippet) return;

    state.modalId = id;
    state.lastFocused = document.activeElement;

    fillModal(snippet);
    el.modal.hidden = false;
    document.body.classList.add("modal-open");

    const closeBtn = el.modal.querySelector(".modal-close");
    requestAnimationFrame(() => closeBtn && closeBtn.focus());
  }

  function closeModal() {
    if (el.modal.hidden) return;
    el.modal.hidden = true;
    state.modalId = null;
    document.body.classList.remove("modal-open");

    if (state.lastFocused && typeof state.lastFocused.focus === "function") {
      state.lastFocused.focus();
    }
    state.lastFocused = null;
  }

  function trapFocus(event) {
    if (event.key !== "Tab" || el.modal.hidden) return;

    const focusables = el.modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    if (!focusables.length) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  /* ----------------------------------------------------------
     Events
     ---------------------------------------------------------- */
  function bindEvents() {
    el.filterBar.addEventListener("click", (event) => {
      const tab = event.target.closest(".filter-tab");
      if (tab) setFilter(tab.dataset.filter);
    });

    el.grid.addEventListener("click", (event) => {
      const card = event.target.closest(".snippet-card");
      if (!card) return;

      const copyBtn = event.target.closest("[data-copy]");
      if (copyBtn) {
        const snippet = state.snippets.find((s) => s.id === card.dataset.id);
        if (snippet) handleCopy(snippet.code, copyBtn);
        return;
      }

      const openBtn = event.target.closest("[data-open]");
      if (openBtn) {
        openModal(card.dataset.id);
        return;
      }

      const favBtn = event.target.closest("[data-favorite]");
      if (favBtn) {
        const snippet = state.snippets.find((s) => s.id === card.dataset.id);
        if (!snippet) return;
        toggleFavorite(snippet.id);
        syncFavoriteButton(favBtn, snippet);
        syncFilters();
        // In the Favorites tab the card itself no longer belongs in the list
        if (state.activeFilter === FAVORITES_TAB) render();
      }
    });

    el.fontDecrease.addEventListener("click", () => changeFontSize(-1));
    el.fontIncrease.addEventListener("click", () => changeFontSize(1));
    el.fontValue.addEventListener("click", resetFontSize);

    el.langButtons.forEach((btn) => {
      btn.addEventListener("click", () => setLanguage(btn.dataset.lang));
    });

    el.search.addEventListener("input", onSearchInput);

    el.search.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && el.search.value) {
        event.preventDefault();
        clearSearch();
      }
    });

    el.clearSearch.addEventListener("click", () => clearSearch());

    el.resetFilters.addEventListener("click", resetFilters);
    el.retry.addEventListener("click", loadData);

    el.modal.addEventListener("click", (event) => {
      if (event.target.closest("[data-close-modal]")) {
        closeModal();
        return;
      }
      const copyBtn = event.target.closest("[data-copy]");
      if (copyBtn && state.modalId) {
        const snippet = state.snippets.find((s) => s.id === state.modalId);
        if (snippet) handleCopy(snippet.code, copyBtn);
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        if (!el.modal.hidden) {
          event.preventDefault();
          closeModal();
          return;
        }
      }

      // Ctrl/⌘ + K or "/" focuses the search bar
      const isCmdK = (event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === "k";

      if (isCmdK) {
        event.preventDefault();
        el.search.focus();
        el.search.select();
        return;
      }

      // "/" jumps to search too, as long as the user is not already typing
      if (event.key === "/" && !event.ctrlKey && !event.metaKey && el.modal.hidden) {
        const target = event.target;
        const typing =
          target instanceof HTMLInputElement ||
          target instanceof HTMLTextAreaElement ||
          (target && target.isContentEditable);
        if (!typing) {
          event.preventDefault();
          el.search.focus();
          el.search.select();
        }
      }

      trapFocus(event);
    });
  }

  /* ----------------------------------------------------------
     Boot
     ---------------------------------------------------------- */
  function init() {
    loadFavorites();
    loadFontIndex();
    applyFontSize();
    bindEvents();
    setLanguage(detectInitialLanguage(), { persist: false });

    // Highlight.js is deferred, so it may not be ready yet. Render immediately
    // with plain code, then re-paint once the CDN script lands (or give up).
    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      loadData();
    };

    if (window.hljs) {
      start();
      return;
    }

    // Listen unconditionally: hljs may finish between this check and `load`.
    window.addEventListener("load", start);
    setTimeout(start, 2500);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
