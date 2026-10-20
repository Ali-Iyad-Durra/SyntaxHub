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
  const VIEW_STORAGE_KEY = "syntaxhub:view";

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
      statTags: "topics",
      viewMode: "View mode",
      viewCard: "Cards",
      viewCompact: "Compact",
      tagFilterAria: "Filter by topic",
      allTags: "All topics",
      moreTags: "Show all topics",
      lessTags: "Show fewer",
      share: "Share",
      shareAria: "Copy link to this snippet",
      shareCopied: "Link copied!",
      shareFailed: "Couldn't copy the link. Copy it from the address bar instead.",
      linkInvalid: "That snippet link no longer exists — showing all snippets.",
      emptyTitle: "No snippets found",
      emptyText: "Try a different keyword or choose another language tab.",
      emptyTagTitle: "No snippets for this topic",
      emptyTagText: 'No snippets match {tag} right now. Try another topic or clear the filter.',
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
      statTags: "مواضيع",
      viewMode: "طريقة العرض",
      viewCard: "بطاقات",
      viewCompact: "مضغوط",
      tagFilterAria: "تصفية حسب الموضوع",
      allTags: "كل المواضيع",
      moreTags: "عرض كل المواضيع",
      lessTags: "عرض أقل",
      share: "مشاركة",
      shareAria: "نسخ رابط هذا المقطع",
      shareCopied: "تم نسخ الرابط!",
      shareFailed: "تعذّر نسخ الرابط. انسخه من شريط العنوان.",
      linkInvalid: "هذا الرابط لم يعد موجودًا — يتم عرض كل المقاطع.",
      emptyTitle: "لا توجد نتائج",
      emptyText: "جرّب كلمة مفتاحية أخرى أو اختر تبويب لغة مختلفًا.",
      emptyTagTitle: "لا توجد مقاطع لهذا الموضوع",
      emptyTagText: "لا توجد مقاطع مطابقة لـ {tag} حاليًا. جرّب موضوعًا آخر أو أزل التصفية.",
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
    activeTag: null,
    tagsExpanded: false,
    view: "card",
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
    tagCount: document.getElementById("tagCount"),
    stats: document.getElementById("stats"),
    langButtons: Array.from(document.querySelectorAll(".lang-btn")),
    fontDecrease: document.getElementById("fontDecrease"),
    fontIncrease: document.getElementById("fontIncrease"),
    fontValue: document.getElementById("fontValue"),
    tagBar: document.getElementById("tagBar"),
    tagCount: document.getElementById("tagCount"),
    viewToggle: document.getElementById("viewToggle"),
    viewButtons: Array.from(document.querySelectorAll(".view-btn")),
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
  /* ----------------------------------------------------------
     View mode (card / compact)
     ---------------------------------------------------------- */
  function applyView(view, { persist = true } = {}) {
    state.view = view === "compact" ? "compact" : "card";
    el.grid.classList.toggle("is-compact", state.view === "compact");
    el.viewToggle.dataset.mode = state.view;

    el.viewButtons.forEach((btn) => {
      const active = btn.dataset.view === state.view;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", String(active));
    });

    if (persist) writeStorage(VIEW_STORAGE_KEY, state.view);
  }

  /* ----------------------------------------------------------
     Tags
     ---------------------------------------------------------- */
  function tagLabel(tag) {
    const entry = state.tagLabels && state.tagLabels[tag];
    if (!entry) return tag;
    return typeof entry === "string" ? entry : localized(entry);
  }

  function tagCountFor(tag) {
    return state.snippets.filter((s) => Array.isArray(s.tags) && s.tags.includes(tag)).length;
  }

  /** All distinct tags used in the library, most frequent first. */
  function collectTags() {
    const counts = new Map();
    state.snippets.forEach((s) => {
      (s.tags || []).forEach((tag) => counts.set(tag, (counts.get(tag) || 0) + 1));
    });
    return [...counts.keys()].sort(
      (a, b) => counts.get(b) - counts.get(a) || a.localeCompare(b),
    );
  }

  function renderTagBar() {
    const tags = collectTags();

    if (!tags.length) {
      el.tagBar.hidden = true;
      return;
    }

    const frag = document.createDocumentFragment();

    const allBtn = document.createElement("button");
    allBtn.type = "button";
    allBtn.className = "tag-chip tag-chip-all";
    allBtn.dataset.tag = "";
    allBtn.textContent = t("allTags");
    allBtn.setAttribute("aria-pressed", String(!state.activeTag));
    allBtn.classList.toggle("is-active", !state.activeTag);
    frag.appendChild(allBtn);

    // Keep the strip short: the 14 most used topics, plus the active one,
    // and let the user expand the rest on demand.
    const visibleTags = state.tagsExpanded
      ? tags
      : tags.slice(0, TAG_PREVIEW_COUNT).concat(
          state.activeTag && !tags.slice(0, TAG_PREVIEW_COUNT).includes(state.activeTag)
            ? [state.activeTag]
            : [],
        );

    visibleTags.forEach((tag) => {
      const count = tagCountFor(tag);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "tag-chip";
      btn.dataset.tag = tag;
      btn.textContent = `#${tagLabel(tag)}`;
      const active = state.activeTag === tag;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", String(active));
      btn.title = `${tagLabel(tag)} — ${count}`;
      frag.appendChild(btn);
    });

    if (tags.length > TAG_PREVIEW_COUNT) {
      const toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "tag-chip tag-chip-more";
      toggle.dataset.tagMore = "true";
      toggle.setAttribute("aria-expanded", String(Boolean(state.tagsExpanded)));
      toggle.textContent = state.tagsExpanded
        ? t("lessTags")
        : `${t("moreTags")} \u2066(${tags.length - TAG_PREVIEW_COUNT})\u2069`;
      frag.appendChild(toggle);
    }

    el.tagBar.replaceChildren(frag);
    el.tagBar.hidden = false;
  }

  function setTag(tag) {
    state.activeTag = tag || null;
    el.tagBar.querySelectorAll(".tag-chip").forEach((chip) => {
      const active = (chip.dataset.tag || null) === state.activeTag;
      chip.classList.toggle("is-active", active);
      chip.setAttribute("aria-pressed", String(active));
    });
    render();
  }

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
    renderTagBar();
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
      state.tagLabels =
        data.tagLabels && typeof data.tagLabels === "object" ? data.tagLabels : {};
      state.activeFilter = "all";

      updateStats();
      renderFilters();
      renderTagBar();
      render();

      // Deep link: #snippet=<id> opens (and highlights) that card
      syncFromHash({ initial: true });
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
  const TAG_PREVIEW_COUNT = 14;

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
      if (
        state.activeTag &&
        !(Array.isArray(snippet.tags) && snippet.tags.includes(state.activeTag))
      )
        return false;
      return matches(snippet, query);
    });
  }

  /**
   * Hero counters: the library size is constant, the first counter follows the
   * current filter/search so users always see how many results are on screen.
   */
  function updateStats() {
    el.visibleCount.textContent = String(state.rendered.length || state.snippets.length);
    el.languageCount.textContent = String(visibleLanguageCount());
    const tags = new Set();
    state.snippets.forEach((s) => (s.tags || []).forEach((tag) => tags.add(tag)));
    el.tagCount.textContent = String(tags.size);
    el.stats.dataset.filtered = String(
      state.activeFilter !== "all" || state.activeTag || norm(state.query) ? "true" : "false",
    );
  }

  /* ----------------------------------------------------------
     Rendering
     ---------------------------------------------------------- */
  function getCardTemplate() {
    if (cardTemplate) return cardTemplate;

    const template = document.createElement("template");
    template.innerHTML = `
      <article class="snippet-card" id="snippet-card--">
        <div class="card-head">
          <div class="card-heading">
            <span class="topic-chip"></span>
            <h3 class="card-title"></h3>
            <p class="card-desc"></p>
            <ul class="card-tags"></ul>
          </div>
          <div class="card-actions">
            <button type="button" class="share-btn" data-share aria-label="">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M10 13a5 5 0 0 0 7.1 0l3-3a5 5 0 0 0-7.1-7.1L11.6 4.3"></path>
                <path d="M14 11a5 5 0 0 0-7.1 0l-3 3A5 5 0 0 0 11 21.1l1.4-1.4"></path>
              </svg>
            </button>
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

  /* ----------------------------------------------------------
     Deep links: every snippet has a stable #snippet=<id> URL
     ---------------------------------------------------------- */
  function snippetPath(id) {
    const url = new URL(window.location.href);
    url.hash = `snippet=${id}`;
    return url.pathname + url.search + url.hash;
  }

  function snippetLink(id) {
    return new URL(snippetPath(id), window.location.href).href;
  }

  function snippetFromHash() {
    const match = /(?:^#|&)snippet=([^&]+)/.exec(window.location.hash || "");
    if (!match) return null;
    try {
      return decodeURIComponent(match[1]);
    } catch (_) {
      return match[1];
    }
  }

  /** Clear search/tag/language filters so a linked card is guaranteed visible. */
  function clearNarrowing() {
    let changed = false;

    if (state.activeFilter !== "all") {
      state.activeFilter = "all";
      changed = true;
    }

    if (state.activeTag) {
      state.activeTag = null;
      changed = true;
    }

    if (state.query) {
      el.search.value = "";
      state.query = "";
      el.searchWrap.classList.remove("has-value");
      el.clearSearch.hidden = true;
      changed = true;
    }

    if (changed) {
      syncFilters();
      renderTagBar();
    }
  }

  function highlightCard(id) {
    const card = el.grid.querySelector(`[data-id="${CSS.escape(id)}"]`);
    if (!card) return false;

    card.classList.remove("is-target");
    // Force the animation to replay when the same link is opened twice
    void card.offsetWidth;
    card.classList.add("is-target");
    card.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => card.classList.remove("is-target"), 2600);
    return true;
  }

  function syncFromHash({ initial = false } = {}) {
    const id = snippetFromHash();
    if (!id) return false;

    if (!state.snippets.some((s) => s.id === id)) {
      if (initial) showToast(t("linkInvalid"));
      return false;
    }

    clearNarrowing();
    render();
    return highlightCard(id);
  }

  async function shareLink(snippet, button) {
    const url = snippetLink(snippet.id);
    const title = `${localized(snippet.title)} — SyntaxHub`;

    // Native share sheet on supported (mobile) browsers. We only use it when it
    // will actually open a sheet; a rejection usually means the browser refused
    // silently, so we fall back to copying the link instead of doing nothing.
    if (navigator.share) {
      let shared = false;
      try {
        await navigator.share({ title, url });
        shared = true;
      } catch (err) {
        if (err && err.name === "AbortError") {
          // user dismissed the native sheet — respect that
          return;
        }
      }
      if (shared) {
        showToast(t("shareCopied"));
        return;
      }
    }

    try {
      await copyText(url);
      showToast(t("shareCopied"));
      flashIcon(button);
      if (history.replaceState) {
        history.replaceState(null, "", snippetPath(snippet.id));
      }
    } catch (err) {
      console.error("SyntaxHub: share copy failed —", err);
      showToast(t("shareFailed"));
    }
  }

  function flashIcon(button) {
    if (!button) return;
    button.classList.add("is-copied");
    clearTimeout(button._shareTimer);
    button._shareTimer = setTimeout(() => button.classList.remove("is-copied"), 1600);
  }

  function renderTags(node, snippet) {
    const list = node.querySelector(".card-tags");
    const tags = snippet.tags || [];
    if (!tags.length) {
      list.hidden = true;
      return;
    }

    const frag = document.createDocumentFragment();
    tags.forEach((tag) => {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "tag-badge";
      btn.dataset.tag = tag;
      btn.textContent = `#${tagLabel(tag)}`;
      btn.setAttribute("aria-pressed", String(state.activeTag === tag));
      btn.classList.toggle("is-active", state.activeTag === tag);
      btn.title = t("tagFilterAria");
      li.appendChild(btn);
      frag.appendChild(li);
    });
    list.replaceChildren(frag);
  }

  function createCard(snippet, index) {
    const node = getCardTemplate().content.firstElementChild.cloneNode(true);

    node.id = `snippet-card--${snippet.id}`;
    node.dataset.id = snippet.id;
    node.dataset.language = snippet.language;
    node.style.animationDelay = `${Math.min(index, 8) * 35}ms`;

    const topicChip = node.querySelector(".topic-chip");
    topicChip.textContent = snippet.topic || "";
    topicChip.hidden = !snippet.topic;

    const title = localized(snippet.title);
    node.querySelector(".card-title").textContent = title;
    node.querySelector(".card-desc").textContent = localized(snippet.description);
    node.querySelector(".lang-chip").textContent = languageLabel(snippet.language);

    renderTags(node, snippet);

    const copyBtn = node.querySelector("[data-copy]");
    copyBtn.setAttribute("aria-label", `${t("copyAria")}: ${title}`);
    copyBtn.querySelector(".copy-label").textContent = t("copy");

    const code = node.querySelector("code");
    paintCode(code, snippet);
    // Only fade the bottom edge when the code actually overflows
    if (snippet.code.split("\n").length > 16) node.querySelector(".code-box").classList.add("is-scrollable");

    const favBtn = node.querySelector("[data-favorite]");
    syncFavoriteButton(favBtn, snippet);

    const shareBtn = node.querySelector("[data-share]");
    const shareLabel = `${t("shareAria")}: ${title}`;
    shareBtn.setAttribute("aria-label", shareLabel);
    shareBtn.title = shareLabel;

    const openBtn = node.querySelector("[data-open]");
    openBtn.setAttribute("aria-label", `${t("viewAria")}: ${title}`);
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
    updateStats();
  }

  function showState(kind) {
    // The empty panel explains favorites/tags differently than a failed search
    const favoritesView = state.activeFilter === FAVORITES_TAB;
    const tagView = Boolean(state.activeTag) && !favoritesView;
    el.empty.querySelector(".state-title").textContent = favoritesView
      ? t("favoritesEmptyTitle")
      : tagView
        ? t("emptyTagTitle")
        : t("emptyTitle");
    el.empty.querySelector(".state-text").textContent = favoritesView
      ? t("favoritesEmptyText")
      : tagView
        ? t("emptyTagText").replace("{tag}", tagLabel(state.activeTag))
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
    state.activeTag = null;
    el.filterBar.querySelectorAll(".filter-tab").forEach((btn) => {
      const active = btn.dataset.filter === "all";
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", String(active));
    });
    renderTagBar();
    clearSearch(false);
  }

  /* ----------------------------------------------------------
     Clipboard
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
    el.modalCode.textContent = snippet.code;
    paintCode(el.modalCode, snippet);

    const shareBtn = el.modal.querySelector("[data-share]");
    if (shareBtn) {
      const label = `${t("shareAria")}: ${localized(snippet.title)}`;
      shareBtn.setAttribute("aria-label", label);
      shareBtn.title = label;
    }

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

    // Tag chips in the filter strip
    el.tagBar.addEventListener("click", (event) => {
      const more = event.target.closest("[data-tag-more]");
      if (more) {
        state.tagsExpanded = !state.tagsExpanded;
        renderTagBar();
        return;
      }
      const chip = event.target.closest(".tag-chip");
      if (chip) setTag(chip.dataset.tag);
    });

    // View mode toggle
    el.viewToggle.addEventListener("click", (event) => {
      const btn = event.target.closest(".view-btn");
      if (btn) applyView(btn.dataset.view);
    });

    // One delegated handler for the whole grid (tags, share, copy, open, star)
    el.grid.addEventListener("click", (event) => {
      const badge = event.target.closest(".tag-badge");
      if (badge) {
        event.preventDefault();
        setTag(badge.dataset.tag);
        el.tagBar.scrollIntoView({ behavior: "smooth", block: "nearest" });
        return;
      }

      const card = event.target.closest(".snippet-card");
      if (!card) return;

      const shareBtn = event.target.closest("[data-share]");
      if (shareBtn) {
        const snippet = state.snippets.find((s) => s.id === card.dataset.id);
        if (snippet) shareLink(snippet, shareBtn);
        return;
      }

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

      // In compact view the whole row opens the snippet (but not the action buttons)
      if (
        el.grid.classList.contains("is-compact") &&
        !event.target.closest(".card-actions")
      ) {
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
      const shareBtn = event.target.closest("[data-share]");
      if (shareBtn && state.modalId) {
        const snippet = state.snippets.find((s) => s.id === state.modalId);
        if (snippet) shareLink(snippet, shareBtn);
        return;
      }
      const copyBtn = event.target.closest("[data-copy]");
      if (copyBtn && state.modalId) {
        const snippet = state.snippets.find((s) => s.id === state.modalId);
        if (snippet) handleCopy(snippet.code, copyBtn);
      }
    });

    // Back/forward navigation between deep links
    window.addEventListener("hashchange", () => syncFromHash({ initial: true }));

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
    applyView(readStorage(VIEW_STORAGE_KEY, "card"), { persist: false });
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
