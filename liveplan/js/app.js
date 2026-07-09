/* ============================================================
 * LivePlan（静的版）
 *
 * 元は Java Servlet + JSP + MySQL の Web アプリ。
 * この静的版では以下のように置き換えている：
 *   - MySQL           → JSON ファイル（data/schedules.json ※非公開 / .sample.json ※公開）
 *   - サーバー側の更新 → localStorage（ブラウザごとに保存）
 *   - ログイン        → なし（個人用・デモ用のため省略）
 * ============================================================ */

(() => {
  "use strict";

  const STORAGE_KEY = "liveplan_data";
  const VIEW_KEY = "liveplan_view";

  /** fetch が使えない環境（file:// 直開き）用の最小フォールバック */
  const EMBEDDED_SAMPLE = [
    {
      id: 1, artistName: "月光スケッチ", liveTitle: "月光スケッチ ONE-MAN TOUR 「夜想曲」",
      liveDate: "2025-05-10", openTime: "17:00", startTime: "18:00",
      venue: "Zepp Haneda(TOKYO)", memo: "", liveType: "oneman", coArtists: "", setlist: "", image: ""
    },
    {
      id: 2, artistName: "Aurora Syndrome", liveTitle: "SUMMER BREEZE FESTIVAL 2025",
      liveDate: "2025-08-16", openTime: "09:30", startTime: "11:00",
      venue: "山中湖交流プラザ きらら", memo: "", liveType: "fes", coArtists: "ネオンテトラ", setlist: "", image: ""
    },
    {
      id: 3, artistName: "真夜中シネマ", liveTitle: "真夜中シネマ 単独公演 「午前0時の上映」",
      liveDate: "2026-07-25", openTime: "17:30", startTime: "18:30",
      venue: "日本武道館", memo: "武道館初単独！", liveType: "oneman", coArtists: "", setlist: "", image: ""
    }
  ];

  /* ---------------- 状態 ---------------- */
  let schedules = [];
  let dataSource = "sample"; // 'private' | 'sample' | 'browser'
  const filters = { artist: "", status: "", liveType: "", year: "", month: "" };
  let sortKey = "asc"; // 'asc' | 'desc' | 'artist'
  let currentView = "list"; // 'list' | 'cal' | 'stats'

  const now = new Date();
  let calYear = now.getFullYear();
  let calMonth = now.getMonth(); // 0-11

  /* ---------------- ユーティリティ ---------------- */
  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];

  function h(v) {
    return String(v ?? "")
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function todayStr() {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${m}-${day}`;
  }

  function typeLabel(t) {
    return { oneman: "ワンマン", taiban: "対バン", fes: "フェス" }[t] || "";
  }

  /** 開催ステータス: 'upcoming' | 'today' | 'past' */
  function statusOf(s) {
    const t = todayStr();
    if (s.liveDate > t) return "upcoming";
    if (s.liveDate === t) return "today";
    return "past";
  }

  const STATUS_LABEL = { upcoming: "開催前", today: "本日", past: "開催後" };
  const STATUS_BADGE = { upcoming: "badge-upcoming", today: "badge-today", past: "badge-past" };

  function mapUrl(venue) {
    return venue
      ? "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(venue)
      : "";
  }

  function toast(msg) {
    const el = $("#toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.remove("show"), 2400);
  }

  /* ---------------- データ読み込み・保存 ---------------- */
  async function loadData() {
    // 1) ブラウザ保存分（編集結果）が最優先
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        schedules = JSON.parse(saved);
        dataSource = "browser";
        return;
      }
    } catch (_) { /* localStorage 不可の環境は無視 */ }

    // 2) 非公開の実データ（ローカル環境のみ存在。公開サイトでは 404 になる）
    try {
      const r = await fetch("data/schedules.json", { cache: "no-store" });
      if (r.ok) {
        schedules = await r.json();
        dataSource = "private";
        return;
      }
    } catch (_) { /* 次へフォールバック */ }

    // 3) 公開用サンプルデータ
    try {
      const r = await fetch("data/schedules.sample.json", { cache: "no-store" });
      if (r.ok) {
        schedules = await r.json();
        dataSource = "sample";
        return;
      }
    } catch (_) { /* 次へフォールバック */ }

    // 4) file:// 直開きなど fetch 不可の場合
    schedules = structuredClone(EMBEDDED_SAMPLE);
    dataSource = "sample";
  }

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules));
    dataSource = "browser";
    renderDataBadge();
  }

  function nextId() {
    return schedules.reduce((mx, s) => Math.max(mx, s.id || 0), 0) + 1;
  }

  /* ---------------- 絞り込み・並び替え（旧 ScheduleDAO 相当） ---------------- */
  function filteredSchedules() {
    return schedules.filter((s) => {
      if (filters.artist && s.artistName !== filters.artist) return false;
      if (filters.status === "upcoming" && statusOf(s) === "past") return false;
      if (filters.status === "past" && statusOf(s) !== "past") return false;
      if (filters.liveType && s.liveType !== filters.liveType) return false;
      if (filters.year && !s.liveDate.startsWith(filters.year + "-")) return false;
      if (filters.month) {
        const m = String(filters.month).padStart(2, "0");
        if (s.liveDate.slice(5, 7) !== m) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortKey === "desc") return b.liveDate.localeCompare(a.liveDate);
      if (sortKey === "artist") {
        return a.artistName.localeCompare(b.artistName, "ja") ||
               a.liveDate.localeCompare(b.liveDate);
      }
      return a.liveDate.localeCompare(b.liveDate);
    });
  }

  const uniqueArtists = () =>
    [...new Set(schedules.map((s) => s.artistName))].sort((a, b) => a.localeCompare(b, "ja"));

  const uniqueYears = () =>
    [...new Set(schedules.map((s) => s.liveDate.slice(0, 4)))].sort();

  /* ---------------- ヘッダー・サマリー ---------------- */
  function renderDataBadge() {
    const label = { private: "ローカルデータ", sample: "サンプルデータ", browser: "ブラウザ保存" }[dataSource];
    $("#dataBadge").textContent = "📦 " + label;
  }

  function renderSummary() {
    const t = todayStr();
    const total = schedules.length;
    const untilToday = schedules.filter((s) => s.liveDate <= t).length;
    $("#attendTotal").textContent = total;
    $("#attendUntil").textContent = untilToday;

    // 次のライブまでカウントダウン
    const next = schedules
      .filter((s) => s.liveDate >= t)
      .sort((a, b) => a.liveDate.localeCompare(b.liveDate))[0];
    const box = $("#countdown");
    if (!next) {
      box.style.display = "none";
      return;
    }
    box.style.display = "";
    const days = Math.round((new Date(next.liveDate) - new Date(t)) / 86400000);
    $("#cdDays").innerHTML = days === 0
      ? "🎤 本日開催！"
      : `🎤 次のライブまで あと <em>${days}</em> 日`;
    $("#cdMeta").textContent = `${next.artistName} / ${next.liveTitle}（${next.liveDate}）`;
  }

  /* ---------------- フィルター UI ---------------- */
  function renderFilterOptions() {
    const artistSel = $("#fArtist");
    const yearSel = $("#fYear");
    artistSel.innerHTML =
      '<option value="">すべてのアーティスト</option>' +
      uniqueArtists().map((a) => `<option value="${h(a)}">${h(a)}</option>`).join("");
    yearSel.innerHTML =
      '<option value="">--</option>' +
      uniqueYears().map((y) => `<option value="${y}">${y}年</option>`).join("");
    artistSel.value = filters.artist;
    yearSel.value = filters.year;
  }

  function bindFilters() {
    const apply = () => {
      filters.artist = $("#fArtist").value;
      filters.status = $("#fStatus").value;
      filters.liveType = $("#fType").value;
      filters.year = $("#fYear").value;
      filters.month = $("#fMonth").value;
      renderList();
    };
    ["#fArtist", "#fStatus", "#fType", "#fYear", "#fMonth"].forEach((id) =>
      $(id).addEventListener("change", apply)
    );
    $("#fClear").addEventListener("click", () => {
      Object.keys(filters).forEach((k) => (filters[k] = ""));
      $$("#filterBar select").forEach((s) => (s.value = ""));
      renderList();
    });

    $$(".sort-bar [data-sort]").forEach((btn) =>
      btn.addEventListener("click", () => {
        sortKey = btn.dataset.sort;
        $$(".sort-bar [data-sort]").forEach((b) => b.classList.toggle("active", b === btn));
        renderList();
      })
    );
  }

  /* ---------------- 一覧ビュー ---------------- */
  function renderList() {
    const list = filteredSchedules();
    const grid = $("#cardGrid");
    $("#resultCount").textContent = `${list.length} 件`;

    if (list.length === 0) {
      grid.innerHTML =
        '<div class="empty-box card-surface" style="grid-column:1/-1;">条件に一致するスケジュールはありません。</div>';
      return;
    }

    grid.innerHTML = list.map((s, i) => {
      const st = statusOf(s);
      const delay = Math.min(i, 11) * 0.05;
      const img = s.image
        ? `<img class="card-img" src="${h(s.image)}" alt="" loading="lazy">`
        : "";
      const type = typeLabel(s.liveType)
        ? `<span class="badge badge-type">${h(typeLabel(s.liveType))}</span>`
        : "";
      return `
        <article class="schedule-card card-surface" data-id="${s.id}" style="animation-delay:${delay}s" tabindex="0" role="button" aria-label="${h(s.liveTitle)} の詳細">
          ${img}
          <div class="card-top">
            <div>
              <div class="date">${h(s.liveDate)}</div>
              <div class="times">開場 ${h(s.openTime || "--:--")} / 開演 ${h(s.startTime || "--:--")}</div>
            </div>
            <span class="badge ${STATUS_BADGE[st]}">${STATUS_LABEL[st]}</span>
          </div>
          <div class="card-body">
            <div class="artist-row">
              <span class="artist">${h(s.artistName)}</span>
              ${type}
            </div>
            <h3 class="title">${h(s.liveTitle)}</h3>
            <p class="venue">会場：${h(s.venue || "未定")}</p>
          </div>
        </article>`;
    }).join("");

    $$(".schedule-card", grid).forEach((card) => {
      const open = () => openDetail(Number(card.dataset.id));
      card.addEventListener("click", open);
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
      });
    });
  }

  /* ---------------- カレンダービュー ---------------- */
  function renderCalendar() {
    $("#calTitle").textContent = `${calYear}年 ${calMonth + 1}月`;

    const first = new Date(calYear, calMonth, 1);
    const startDow = first.getDay(); // 0=日
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const daysInPrev = new Date(calYear, calMonth, 0).getDate();
    const t = todayStr();

    // 日付ごとのイベント表
    const byDate = {};
    for (const s of schedules) {
      (byDate[s.liveDate] ??= []).push(s);
    }

    const cells = [];
    const totalCells = Math.ceil((startDow + daysInMonth) / 7) * 7;
    for (let i = 0; i < totalCells; i++) {
      const dayOffset = i - startDow + 1;
      let y = calYear, m = calMonth, d = dayOffset, other = false;
      if (dayOffset < 1) {
        other = true;
        m = calMonth - 1;
        d = daysInPrev + dayOffset;
        if (m < 0) { m = 11; y--; }
      } else if (dayOffset > daysInMonth) {
        other = true;
        m = calMonth + 1;
        d = dayOffset - daysInMonth;
        if (m > 11) { m = 0; y++; }
      }
      const dateStr = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const dow = i % 7;
      const events = byDate[dateStr] || [];
      const shown = events.slice(0, 3);
      const eventsHtml = shown.map((s) => {
        const st = statusOf(s);
        const cls = st === "today" ? "today-ev" : st;
        return `<button class="cal-event ${cls}" data-id="${s.id}" title="${h(s.artistName)} / ${h(s.liveTitle)}">${h(s.artistName)}</button>`;
      }).join("") +
        (events.length > 3 ? `<span class="cal-more">+${events.length - 3} 件</span>` : "");

      const dowCls = dow === 0 ? "sun" : dow === 6 ? "sat" : "";
      cells.push(`
        <div class="cal-cell${other ? " other" : ""}${dateStr === t ? " today" : ""}">
          <span class="day-num ${dowCls}">${d}</span>
          ${eventsHtml}
        </div>`);
    }

    const dows = ["日", "月", "火", "水", "木", "金", "土"]
      .map((w, i) => `<div class="cal-dow ${i === 0 ? "sun" : i === 6 ? "sat" : ""}">${w}</div>`)
      .join("");
    $("#calGrid").innerHTML = dows + cells.join("");

    $$("#calGrid .cal-event").forEach((btn) =>
      btn.addEventListener("click", () => openDetail(Number(btn.dataset.id)))
    );
  }

  function bindCalendarNav() {
    $("#calPrev").addEventListener("click", () => {
      calMonth--;
      if (calMonth < 0) { calMonth = 11; calYear--; }
      renderCalendar();
    });
    $("#calNext").addEventListener("click", () => {
      calMonth++;
      if (calMonth > 11) { calMonth = 0; calYear++; }
      renderCalendar();
    });
    $("#calToday").addEventListener("click", () => {
      const d = new Date();
      calYear = d.getFullYear();
      calMonth = d.getMonth();
      renderCalendar();
    });
  }

  /* ---------------- 統計ビュー（旧 StatsServlet 相当） ---------------- */
  function renderStats() {
    const t = todayStr();
    const total = schedules.length;
    const untilToday = schedules.filter((s) => s.liveDate <= t).length;
    const upcoming = total - untilToday;

    // 集計
    const byYear = {};
    const byArtist = {};
    for (const s of schedules) {
      const y = s.liveDate.slice(0, 4);
      byYear[y] = (byYear[y] || 0) + 1;
      byArtist[s.artistName] = (byArtist[s.artistName] || 0) + 1;
    }
    const years = Object.keys(byYear).sort();
    const artists = Object.entries(byArtist).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ja"));
    const top = artists[0];

    $("#stTotal").textContent = total;
    $("#stUntil").textContent = untilToday;
    $("#stUpcoming").textContent = upcoming;
    $("#stTop").textContent = top ? top[0] : "--";
    $("#stTopCount").textContent = top ? `${top[1]} 回参戦` : "";

    // 年別（縦棒・単一系列・直接ラベル付き）
    const maxY = Math.max(...years.map((y) => byYear[y]), 1);
    $("#yearChart").innerHTML = years.map((y, i) => `
      <div class="bar-col">
        <span class="bar-val">${byYear[y]}</span>
        <div class="bar" style="height:${(byYear[y] / maxY) * 100}%;animation-delay:${i * 0.06}s"
             title="${y}年: ${byYear[y]} 回"></div>
      </div>`).join("");
    $("#yearLabels").innerHTML = years.map((y) => `<span>${y}</span>`).join("");

    // アーティスト別（横棒・単一系列・直接ラベル付き）
    const maxA = Math.max(...artists.map(([, c]) => c), 1);
    $("#artistChart").innerHTML = artists.map(([name, count], i) => `
      <div class="bar-row">
        <span class="bar-label" title="${h(name)}">${h(name)}</span>
        <div class="bar-track">
          <div class="bar" style="width:${(count / maxA) * 100}%;animation-delay:${i * 0.05}s"
               title="${h(name)}: ${count} 回"></div>
        </div>
        <span class="bar-val">${count}</span>
      </div>`).join("");
  }

  /* ---------------- ビュー切替 ---------------- */
  function setView(v) {
    currentView = v;
    $("#listView").style.display = v === "list" ? "" : "none";
    $("#calView").style.display = v === "cal" ? "" : "none";
    $("#statsView").style.display = v === "stats" ? "" : "none";
    $$(".view-tabs button").forEach((b) => b.classList.toggle("active", b.dataset.view === v));
    if (v === "cal") renderCalendar();
    if (v === "stats") renderStats();
    try { localStorage.setItem(VIEW_KEY, v); } catch (_) {}
  }

  /* ---------------- モーダル共通 ---------------- */
  function openModal(id) {
    $(id).classList.add("show");
    document.body.style.overflow = "hidden";
  }
  function closeModal(id) {
    $(id).classList.remove("show");
    document.body.style.overflow = "";
  }
  function bindModalBasics() {
    $$(".modal-backdrop").forEach((bk) => {
      bk.addEventListener("click", (e) => {
        if (e.target === bk) closeModal("#" + bk.id);
      });
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") $$(".modal-backdrop.show").forEach((bk) => closeModal("#" + bk.id));
    });
    $$("[data-close]").forEach((btn) =>
      btn.addEventListener("click", () => closeModal(btn.dataset.close))
    );
  }

  /* ---------------- 詳細 / 編集 / 削除モーダル ---------------- */
  let detailId = null;

  function openDetail(id) {
    detailId = id;
    renderDetailSection("view");
    openModal("#detailModal");
  }

  function renderDetailSection(mode) {
    const s = schedules.find((x) => x.id === detailId);
    if (!s) return;
    const body = $("#detailBody");
    const foot = $("#detailFoot");
    const title = $("#detailTitle");
    const st = statusOf(s);

    if (mode === "view") {
      title.textContent = "スケジュール詳細";
      const map = mapUrl(s.venue);
      body.innerHTML = `
        ${s.image ? `<img class="detail-img" src="${h(s.image)}" alt="">` : ""}
        <dl class="detail-list">
          <dt>ステータス</dt><dd><span class="badge ${STATUS_BADGE[st]}">${STATUS_LABEL[st]}</span></dd>
          <dt>アーティスト</dt><dd>${h(s.artistName)}</dd>
          <dt>共演</dt><dd>${h(s.coArtists) || "（なし）"}</dd>
          <dt>タイトル</dt><dd>${h(s.liveTitle)}</dd>
          <dt>種別</dt><dd>${h(typeLabel(s.liveType)) || "（未設定）"}</dd>
          <dt>開催日</dt><dd>${h(s.liveDate)}</dd>
          <dt>時間</dt><dd>開場 ${h(s.openTime || "--:--")} / 開演 ${h(s.startTime || "--:--")}</dd>
          <dt>会場</dt><dd>${h(s.venue || "未定")}${map ? ` <a href="${map}" target="_blank" rel="noopener">🗺 地図で開く</a>` : ""}</dd>
          <dt>メモ</dt><dd>${h(s.memo) || "（なし）"}</dd>
          <dt>セットリスト</dt><dd class="mono">${h(s.setlist) || "（未記入）"}</dd>
        </dl>`;
      foot.innerHTML = `
        <button class="btn btn-danger to-left" id="dBtnDel">削除</button>
        <button class="btn" data-close="#detailModal">閉じる</button>
        <button class="btn btn-primary" id="dBtnEdit">編集</button>`;
      $("#dBtnDel").addEventListener("click", () => renderDetailSection("del"));
      $("#dBtnEdit").addEventListener("click", () => renderDetailSection("edit"));
      $("[data-close='#detailModal']", foot).addEventListener("click", () => closeModal("#detailModal"));

    } else if (mode === "edit") {
      title.textContent = "スケジュール編集";
      body.innerHTML = `<form id="editForm" class="form-grid">${formFields(s)}</form>`;
      foot.innerHTML = `
        <button class="btn" id="dBtnCancel">キャンセル</button>
        <button class="btn btn-primary" id="dBtnSave">更新</button>`;
      $("#dBtnCancel").addEventListener("click", () => renderDetailSection("view"));
      $("#dBtnSave").addEventListener("click", () => {
        const form = $("#editForm");
        if (!form.reportValidity()) return;
        Object.assign(s, readForm(form));
        persist();
        refreshAll();
        renderDetailSection("view");
        toast("更新しました 🎶");
      });

    } else if (mode === "del") {
      title.textContent = "削除の確認";
      body.innerHTML = `
        <p style="margin-bottom:8px;">このスケジュールを削除しますか？</p>
        <p style="color:var(--text-2);font-size:0.85rem;">${h(s.liveTitle)}（${h(s.liveDate)}）</p>`;
      foot.innerHTML = `
        <button class="btn" id="dBtnNo">いいえ</button>
        <button class="btn btn-danger" id="dBtnYes">はい、削除する</button>`;
      $("#dBtnNo").addEventListener("click", () => renderDetailSection("view"));
      $("#dBtnYes").addEventListener("click", () => {
        schedules = schedules.filter((x) => x.id !== detailId);
        persist();
        refreshAll();
        closeModal("#detailModal");
        toast("削除しました");
      });
    }
  }

  /* ---------------- 新規登録 ---------------- */
  function formFields(s = {}) {
    const sel = (v) => (s.liveType === v ? "selected" : "");
    return `
      <div>
        <label>アーティスト名（メイン）</label>
        <input type="text" name="artistName" required value="${h(s.artistName || "")}">
      </div>
      <div>
        <label>共演アーティスト <span class="opt">（複数はカンマ区切り）</span></label>
        <input type="text" name="coArtists" value="${h(s.coArtists || "")}" placeholder="例：月光スケッチ, ネオンテトラ">
      </div>
      <div>
        <label>ライブタイトル</label>
        <input type="text" name="liveTitle" required value="${h(s.liveTitle || "")}">
      </div>
      <div class="row-2">
        <div>
          <label>開催日</label>
          <input type="date" name="liveDate" required value="${h(s.liveDate || "")}">
        </div>
        <div>
          <label>種別</label>
          <select name="liveType">
            <option value="">--</option>
            <option value="oneman" ${sel("oneman")}>ワンマン</option>
            <option value="taiban" ${sel("taiban")}>対バン</option>
            <option value="fes" ${sel("fes")}>フェス</option>
          </select>
        </div>
      </div>
      <div class="row-2">
        <div>
          <label>開場時間</label>
          <input type="time" name="openTime" value="${h(s.openTime || "")}">
        </div>
        <div>
          <label>開演時間</label>
          <input type="time" name="startTime" value="${h(s.startTime || "")}">
        </div>
      </div>
      <div>
        <label>会場</label>
        <input type="text" name="venue" value="${h(s.venue || "")}">
      </div>
      <div>
        <label>画像 URL <span class="opt">（任意）</span></label>
        <input type="url" name="image" value="${h(s.image || "")}" placeholder="https://...">
      </div>
      <div>
        <label>メモ</label>
        <textarea name="memo" rows="3">${h(s.memo || "")}</textarea>
      </div>
      <div>
        <label>セットリスト <span class="opt">（開催後に追記OK）</span></label>
        <textarea name="setlist" rows="5" class="mono" placeholder="1. 〇〇&#10;2. △△">${h(s.setlist || "")}</textarea>
      </div>`;
  }

  function readForm(form) {
    const fd = new FormData(form);
    const get = (k) => (fd.get(k) || "").toString().trim();
    return {
      artistName: get("artistName"),
      coArtists: get("coArtists"),
      liveTitle: get("liveTitle"),
      liveDate: get("liveDate"),
      liveType: get("liveType"),
      openTime: get("openTime"),
      startTime: get("startTime"),
      venue: get("venue"),
      image: get("image"),
      memo: get("memo"),
      setlist: get("setlist"),
    };
  }

  function bindNewModal() {
    $("#btnNew").addEventListener("click", () => {
      $("#newForm").innerHTML = formFields();
      openModal("#newModal");
    });

    const doRegister = () => {
      const data = readForm($("#newForm"));
      schedules.push({ id: nextId(), ...data });
      persist();
      refreshAll();
      closeModal("#newModal");
      closeModal("#dupModal");
      toast("登録しました 🎉");
    };

    $("#btnRegister").addEventListener("click", () => {
      const form = $("#newForm");
      if (!form.reportValidity()) return;
      const data = readForm(form);
      // アーティスト × 日付の重複チェック（旧 dupWarnModal 相当）
      const dup = schedules.some(
        (s) => s.artistName === data.artistName && s.liveDate === data.liveDate
      );
      if (dup) {
        $("#dupMsg").textContent = `${data.artistName}（${data.liveDate}）`;
        openModal("#dupModal");
        return;
      }
      doRegister();
    });

    $("#btnDupOk").addEventListener("click", doRegister);
  }

  /* ---------------- 書き出し・初期化 ---------------- */
  function bindDataTools() {
    // 現在のデータを JSON ダウンロード（data/schedules.json を更新する用）
    $("#btnExport").addEventListener("click", () => {
      const blob = new Blob([JSON.stringify(schedules, null, 2)], {
        type: "application/json",
      });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "schedules.json";
      a.click();
      URL.revokeObjectURL(a.href);
      toast("JSON を書き出しました");
    });

    // ブラウザ保存分を消して JSON から再読込
    $("#btnReset").addEventListener("click", async () => {
      if (!confirm("ブラウザに保存した編集内容を消して、JSON ファイルの内容に戻します。よろしいですか？")) return;
      localStorage.removeItem(STORAGE_KEY);
      await loadData();
      refreshAll();
      renderFilterOptions();
      renderDataBadge();
      toast("初期化しました");
    });
  }

  /* ---------------- まとめて再描画 ---------------- */
  function refreshAll() {
    renderSummary();
    renderFilterOptions();
    renderList();
    if (currentView === "cal") renderCalendar();
    if (currentView === "stats") renderStats();
  }

  /* ---------------- 起動 ---------------- */
  document.addEventListener("DOMContentLoaded", async () => {
    await loadData();

    renderDataBadge();
    renderSummary();
    renderFilterOptions();
    renderList();

    bindFilters();
    bindCalendarNav();
    bindModalBasics();
    bindNewModal();
    bindDataTools();

    $$(".view-tabs button").forEach((btn) =>
      btn.addEventListener("click", () => setView(btn.dataset.view))
    );

    // URL ハッシュ（#cal / #stats）→ 前回のビュー → 一覧 の順で初期表示を決定
    const hashView = location.hash.replace("#", "");
    let savedView = null;
    try { savedView = localStorage.getItem(VIEW_KEY); } catch (_) {}
    if (["list", "cal", "stats"].includes(hashView)) {
      setView(hashView);
    } else {
      setView(savedView === "cal" || savedView === "stats" ? savedView : "list");
    }
  });
})();
