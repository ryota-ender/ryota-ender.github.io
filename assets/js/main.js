/* ============================================================
   Ryota Portfolio — main.js
   依存: content.js（中身） / i18n.js（翻訳）
   ============================================================ */
(() => {
  "use strict";

  const C = window.SITE_CONTENT;
  const I18N = window.SITE_I18N;
  const root = document.documentElement;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const osDark = matchMedia("(prefers-color-scheme: dark)");
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const SITE_URL = "https://ryota-ender.github.io/";

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) {
      try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch { /* 保存できない環境では何もしない */ }
    },
  };

  function el(tag, cls, text) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }

  let booted = false;

  /* ---------- 言語 ---------- */
  let lang = root.lang === "en" ? "en" : "ja";
  const t = (key) => I18N[lang][key] ?? I18N.ja[key] ?? "";
  const fmt = (s, vars) => s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
  const pick = (v) => (v && typeof v === "object" ? v[lang] ?? v.ja ?? "" : v ?? "");

  const original = new Map(); // HTML に書かれた日本語の原文
  function applyStatic() {
    $$("[data-i18n]").forEach((node) => {
      const key = node.dataset.i18n;
      const asHtml = key.endsWith("_html");
      if (!original.has(node)) original.set(node, asHtml ? node.innerHTML : node.textContent);
      const v = lang === "en" ? I18N.en[key] : original.get(node);
      if (v == null) return;
      if (asHtml) node.innerHTML = v;
      else node.textContent = v;
    });
    $$("[data-i18n-aria]").forEach((node) => {
      if (node.dataset.jaAria == null) node.dataset.jaAria = node.getAttribute("aria-label") || "";
      node.setAttribute("aria-label", lang === "en" ? I18N.en[node.dataset.i18nAria] ?? node.dataset.jaAria : node.dataset.jaAria);
    });
    $$("[data-i18n-alt]").forEach((node) => {
      if (node.dataset.jaAlt == null) node.dataset.jaAlt = node.getAttribute("alt") || "";
      node.setAttribute("alt", lang === "en" ? I18N.en[node.dataset.i18nAlt] ?? node.dataset.jaAlt : node.dataset.jaAlt);
    });
    document.title = t("meta_title");
    $('meta[name="description"]').setAttribute("content", t("meta_description"));
    $('link[rel="canonical"]').setAttribute("href", lang === "en" ? SITE_URL + "?lang=en" : SITE_URL);
  }

  function setLang(next) {
    lang = next;
    root.lang = next;
    store.set("lang", next === "en" ? "en" : null);
    const url = new URL(location.href);
    if (next === "en") url.searchParams.set("lang", "en");
    else url.searchParams.delete("lang");
    history.replaceState(null, "", url);
    render();
  }

  /* ---------- 配色 ---------- */
  const themeNow = () => root.dataset.theme || (osDark.matches ? "dark" : "light");
  function setTheme(next) {
    // OS と同じものを選んだら「OS に合わせる」に戻す
    if (next === (osDark.matches ? "dark" : "light")) {
      delete root.dataset.theme;
      store.set("theme", null);
    } else {
      root.dataset.theme = next;
      store.set("theme", next);
    }
    onThemeChange();
  }
  function onThemeChange() {
    syncPrefs();
    $('meta[name="theme-color"]').setAttribute("content", themeNow() === "dark" ? "#0c0914" : "#f6f5fa");
    drawStars();
  }
  osDark.addEventListener("change", onThemeChange);

  function syncPrefs() {
    $$("[data-set-lang]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.setLang === lang)));
    $$("[data-set-theme]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.setTheme === themeNow())));
  }
  document.addEventListener("click", (e) => {
    const lb = e.target.closest("[data-set-lang]");
    if (lb && lb.dataset.setLang !== lang) setLang(lb.dataset.setLang);
    const tb = e.target.closest("[data-set-theme]");
    if (tb) setTheme(tb.dataset.setTheme);
  });

  /* ---------- メニュー ---------- */
  const menuBtn = $("#menuBtn");
  const mobileMenu = $("#mobileMenu");
  function updateMenuLabel() {
    const open = mobileMenu.classList.contains("open");
    menuBtn.textContent = open ? "CLOSE" : "MENU";
    menuBtn.setAttribute("aria-label", t(open ? "menu_close" : "menu_open"));
  }
  function setMenu(open) {
    menuBtn.classList.toggle("open", open);
    mobileMenu.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    updateMenuLabel();
  }
  menuBtn.addEventListener("click", () => setMenu(!mobileMenu.classList.contains("open")));
  $$("#mobileMenu a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
  addEventListener("resize", () => { if (innerWidth > 900) setMenu(false); }, { passive: true });

  /* ---------- タイピング（読み上げ用に全文を別に持つ） ---------- */
  const typeEl = $("#typeTarget");
  const typeSr = $("#typeSr");
  let typeTimer = 0;
  function startTyping() {
    clearTimeout(typeTimer);
    const phrases = t("phrases");
    typeSr.textContent = phrases.join(" / ");
    if (reduced) { typeEl.textContent = phrases[0]; return; }
    let pi = 0, ci = 0, del = false;
    (function tick() {
      const p = phrases[pi];
      ci += del ? -1 : 1;
      typeEl.textContent = p.slice(0, ci);
      let wait = del ? 30 : 72;
      if (!del && ci === p.length) { wait = 1900; del = true; }
      else if (del && ci === 0) { del = false; pi = (pi + 1) % phrases.length; wait = 380; }
      typeTimer = setTimeout(tick, wait);
    })();
  }

  /* ---------- イコライザー ---------- */
  function buildEqualizer() {
    const eq = $("#equalizer");
    for (let i = 0; i < 26; i++) {
      const bar = document.createElement("span");
      if (reduced) {
        bar.style.transform = `scaleY(${(0.2 + Math.random() * 0.8).toFixed(2)})`;
      } else {
        bar.style.animationDuration = (0.5 + Math.random() * 0.9).toFixed(2) + "s";
        bar.style.animationDelay = (-Math.random()).toFixed(2) + "s";
      }
      eq.appendChild(bar);
    }
  }

  /* ---------- スクロール表示 ---------- */
  const io = !reduced && "IntersectionObserver" in window
    ? new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add("shown");
          io.unobserve(e.target);
        });
      }, { threshold: 0.12 })
    : null;
  function reveal(node, i = 0) {
    if (!io) { node.classList.add("shown"); return; }
    node.style.transitionDelay = (i % 4) * 0.07 + "s";
    io.observe(node);
  }

  /* ---------- 星（静的に 1 回だけ描く） ---------- */
  const canvas = $("#stars");
  const ctx = canvas.getContext("2d");
  const STARS = Array.from({ length: 120 }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: 0.35 + Math.random() * 1.1,
    a: 0.15 + Math.random() * 0.55,
  }));
  function drawStars() {
    const W = innerWidth, H = innerHeight, DPR = Math.min(devicePixelRatio || 1, 2);
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    const cs = getComputedStyle(root);
    ctx.fillStyle = cs.getPropertyValue("--star").trim() || "#fff";
    const k = parseFloat(cs.getPropertyValue("--star-alpha")) || 1;
    const n = Math.min(STARS.length, Math.round((W * H) / 15000));
    for (let i = 0; i < n; i++) {
      const s = STARS[i];
      ctx.globalAlpha = s.a * k;
      ctx.beginPath();
      ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  let resizeTimer = 0;
  addEventListener("resize", () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(drawStars, 150); }, { passive: true });

  /* ---------- スクロール連動（ナビ・進捗・トップへ） ---------- */
  const nav = $("#nav");
  const progress = $("#progress");
  const toTop = $("#toTop");
  function onScroll() {
    const st = scrollY;
    nav.classList.toggle("scrolled", st > 10);
    const max = root.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? Math.min(st / max, 1) : 0})`;
    toTop.classList.toggle("show", st > 560);
    hideTip();
  }
  addEventListener("scroll", onScroll, { passive: true });
  toTop.addEventListener("click", () => scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" }));

  let spy = null;
  function setupSpy() {
    if (spy) spy.disconnect();
    const links = $$(".nav-link");
    spy = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        links.forEach((a) => {
          if (a.getAttribute("href") === "#" + e.target.id) a.setAttribute("aria-current", "true");
          else a.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-42% 0px -52% 0px" });
    $$("main section.block").forEach((s) => { if (!s.hidden) spy.observe(s); });
  }

  /* ---------- ヒーロー ---------- */
  function renderHero() {
    $("#statSkills").textContent = $$(".skill-item").length;
    $("#statLives").textContent = C.music.total;
    $("#statVenues").textContent = C.music.venues;
    const hasWorks = C.works.length > 0;
    const cta = $("#heroCta");
    cta.href = hasWorks ? "#works" : "#about";
    cta.textContent = t(hasWorks ? "cta_works" : "cta_profile");
  }

  /* ---------- Works（ケーススタディ） ---------- */
  const CASE_KEYS = ["problem", "design", "highlights", "learnings"];
  function workCard(w) {
    const card = el("article", "card work reveal" + (booted ? " shown" : ""));
    if (w.image) {
      const img = el("img", "work-shot");
      img.src = w.image;
      img.alt = pick(w.imageAlt);
      img.loading = "lazy";
      card.append(img);
    }
    const body = el("div", "work-body");
    const meta = [w.period, pick(w.role)].filter(Boolean).join(" / ");
    if (meta) body.append(el("p", "work-meta", meta));
    body.append(el("h3", "work-title", pick(w.title)));
    if (w.summary) body.append(el("p", "work-summary", pick(w.summary)));
    if (w.stack && w.stack.length) {
      const ul = el("ul", "chips");
      w.stack.forEach((s) => ul.append(el("li", null, s)));
      body.append(ul);
    }
    const dl = el("dl", "case");
    CASE_KEYS.forEach((k) => {
      if (!w[k]) return;
      const item = el("div", "case-item");
      item.append(el("dt", null, t("case_" + k)), el("dd", null, pick(w[k])));
      dl.append(item);
    });
    if (dl.children.length) body.append(dl);
    if (w.links && w.links.length) {
      const links = el("div", "work-links");
      w.links.forEach((l, i) => {
        const a = el("a", "btn " + (i === 0 ? "btn-grad" : "btn-ghost"), pick(l.label));
        a.href = l.url;
        if (/^https?:/.test(l.url)) { a.target = "_blank"; a.rel = "noopener"; }
        links.append(a);
      });
      body.append(links);
    }
    card.append(body);
    return card;
  }
  function renderWorks() {
    const list = $("#worksList");
    const has = C.works.length > 0;
    $("#worksEmpty").hidden = has;
    list.hidden = !has;
    list.replaceChildren(...C.works.map(workCard));
  }

  /* ---------- 経歴・資格（データがあるときだけ出す） ---------- */
  function renderCareer() {
    const has = C.career.length > 0 || C.certs.length > 0 || !!C.resumeUrl;
    $("#career").hidden = !has;
    $$("[data-career-link]").forEach((n) => { n.hidden = !has; });
    if (!has) return;

    $("#careerBox").hidden = C.career.length === 0;
    $("#careerList").replaceChildren(...C.career.map((c) => {
      const li = el("li");
      const box = el("div");
      box.append(el("div", null, pick(c.title)));
      if (c.org) box.append(el("div", "org", pick(c.org)));
      li.append(el("time", null, c.period), box);
      return li;
    }));

    $("#certBox").hidden = C.certs.length === 0;
    $("#certList").replaceChildren(...C.certs.map((c) => {
      const li = el("li");
      li.append(el("time", null, c.date), el("div", null, pick(c.name)));
      return li;
    }));

    $("#resumeBox").hidden = !C.resumeUrl;
    if (C.resumeUrl) $("#resumeLink").href = C.resumeUrl;
  }

  function renumber() {
    let n = 0;
    $$("main section.block").forEach((s) => {
      if (s.hidden) return;
      n += 1;
      const no = $(".sec-no", s);
      if (no) no.textContent = String(n).padStart(2, "0");
    });
    let m = 0;
    $$("#mobileMenu a[href^='#']").forEach((a) => {
      if (a.hidden) return;
      m += 1;
      const no = $(".no", a);
      if (no) no.textContent = String(m).padStart(2, "0");
    });
  }

  /* ---------- Music（グラフ） ---------- */
  const tip = $("#vizTip");
  function hideTip() { tip.classList.remove("show"); }
  function showTip(value, label, x, y) {
    const row = el("span", "tip-label");
    row.append(el("i", "tip-key"), document.createTextNode(label));
    tip.replaceChildren(el("strong", null, value), row);
    tip.classList.add("show");
    const r = tip.getBoundingClientRect();
    let left = x + 14;
    let top = y - r.height - 12;
    if (left + r.width > innerWidth - 8) left = x - r.width - 14;
    if (top < 8) top = y + 18;
    tip.style.left = Math.max(8, left) + "px";
    tip.style.top = top + "px";
  }
  function bindTip(node, value, label) {
    node.addEventListener("pointermove", (e) => showTip(value, label, e.clientX, e.clientY));
    node.addEventListener("pointerleave", hideTip);
    node.addEventListener("focus", () => {
      const r = node.getBoundingClientRect();
      showTip(value, label, r.left + r.width / 2, r.top + 10);
    });
    node.addEventListener("blur", hideTip);
  }
  function tableRow(label, count) {
    const tr = el("tr");
    tr.append(el("td", null, label), el("td", "num", String(count)));
    return tr;
  }

  function renderMusic() {
    const m = C.music;
    const [year, month] = m.asOf.split("-").map(Number);
    const monthLabel = lang === "en" ? I18N.en.months[month - 1] : month;
    const partial = m.byYear.find((d) => d.partial);
    $("#yearNote").textContent = partial ? fmt(t("year_note"), { year: partial.year, month: monthLabel }) : "";
    $("#musicSource").textContent = fmt(t("music_source"), { year, month: monthLabel });

    // 年別（縦棒）
    const cols = $("#yearCols");
    const labels = $("#yearLabels");
    const maxY = Math.max(...m.byYear.map((d) => d.count));
    cols.style.setProperty("--n", m.byYear.length);
    labels.style.setProperty("--n", m.byYear.length);
    cols.replaceChildren();
    labels.replaceChildren();
    m.byYear.forEach((d) => {
      const col = el("span", "col");
      col.tabIndex = 0;
      col.setAttribute("role", "img");
      col.setAttribute("aria-label", fmt(t("aria_year"), { year: d.year, count: d.count }));
      const mark = el("span", "mark");
      mark.style.height = Math.max(3, (d.count / maxY) * 150) + "px";
      col.append(el("span", "val", String(d.count)), mark);
      bindTip(col, `${d.count} ${t("tip_unit")}`, String(d.year));
      cols.append(col);
      labels.append(el("span", null, String(d.year)));
    });

    // アーティスト（横棒）
    const maxA = Math.max(...m.topArtists.map((a) => a.count));
    $("#artistBars").replaceChildren(...m.topArtists.map((a) => {
      const li = el("li");
      const row = el("span", "bar-row");
      row.tabIndex = 0;
      row.setAttribute("role", "img");
      row.setAttribute("aria-label", fmt(t("aria_artist"), { name: a.name, count: a.count }));
      const lane = el("span", "lane");
      const mark = el("span", "mark");
      mark.style.setProperty("--p", (a.count / maxA).toFixed(3));
      lane.append(mark, el("span", "val", String(a.count)));
      row.append(el("span", "name", a.name), lane);
      bindTip(row, `${a.count} ${t("tip_unit")}`, a.name);
      li.append(row);
      return li;
    }));

    // 表（ホバーしなくても同じ値に届くように）
    $("#yearTbody").replaceChildren(...m.byYear.map((d) => tableRow(String(d.year), d.count)));
    $("#artistTbody").replaceChildren(...m.topArtists.map((a) => tableRow(a.name, a.count)));
  }

  /* ---------- 連絡先（アドレスは JS で組み立てる） ---------- */
  const mail = `${C.contact.user}@${C.contact.domain}`;
  $("#mailLink").href = "mailto:" + mail;

  const toastEl = $("#toast");
  let toastTimer = 0;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2200);
  }
  $("#copyMail").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(mail);
      toast(t("toast_copied"));
    } catch {
      toast(t("toast_copy_failed"));
    }
  });

  /* ---------- 最終更新日（配信時の Last-Modified から） ---------- */
  const lm = new Date(document.lastModified);
  if (!Number.isNaN(lm.getTime())) {
    const pad = (x) => String(x).padStart(2, "0");
    const out = $("#updated");
    out.textContent = `${lm.getFullYear()}.${pad(lm.getMonth() + 1)}.${pad(lm.getDate())}`;
    out.dateTime = `${lm.getFullYear()}-${pad(lm.getMonth() + 1)}-${pad(lm.getDate())}`;
    $("#updatedWrap").hidden = false;
  }

  /* ---------- アクセス解析（コードを設定したときだけ） ---------- */
  if (C.analytics && C.analytics.goatcounter) {
    const s = document.createElement("script");
    s.async = true;
    s.src = "https://gc.zgo.at/count.js";
    s.dataset.goatcounter = `https://${C.analytics.goatcounter}.goatcounter.com/count`;
    document.head.append(s);
  }

  /* ---------- 起動 ---------- */
  function render() {
    applyStatic();
    syncPrefs();
    updateMenuLabel();
    startTyping();
    renderHero();
    renderWorks();
    renderCareer();
    renderMusic();
    renumber();
  }

  buildEqualizer();
  render();
  setupSpy();
  $$(".reveal").forEach((n, i) => reveal(n, i));
  booted = true;
  onThemeChange();
  onScroll();
})();
