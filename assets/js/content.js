/* ============================================================
   サイトの中身 — ここを書き換えればページに反映されます
   ・日英で書き分ける文字列は { ja: "...", en: "..." } の形にする
   ・works / career / certs / resumeUrl が空なら、そのセクションは出ない
     （works が空のときは「整理中」の案内を出す）
   ============================================================ */
window.SITE_CONTENT = {
  /* 連絡先（メールアドレスは HTML に直接書かず、ここから組み立てる） */
  contact: {
    user: "ryota.akaba.0904",
    domain: "gmail.com",
  },

  /* アクセス解析（GoatCounter）。コードを入れたときだけ計測スクリプトを読み込む
     例: "ryota" と書くと https://ryota.goatcounter.com/count に送信する */
  analytics: {
    goatcounter: "",
  },

  /* 作品（ケーススタディ形式）。1 件の書き方:
    {
      title: "アプリ名",
      period: "2026.08 –",
      role: { ja: "個人開発", en: "Solo project" },
      summary: { ja: "一言でいうと何か", en: "One-line summary" },
      stack: ["Next.js", "TypeScript", "Supabase"],
      problem:    { ja: "どんな課題を解決したかったか", en: "..." },
      design:     { ja: "どう設計したか（構成・データ）", en: "..." },
      highlights: { ja: "工夫した点", en: "..." },
      learnings:  { ja: "学んだこと・次にやりたいこと", en: "..." },
      links: [
        { label: { ja: "サイトを見る", en: "Live site" }, url: "https://..." },
        { label: "GitHub", url: "https://github.com/ryota-ender/..." },
      ],
      image: "assets/works/example.png",           // 任意（16:9 推奨）
      imageAlt: { ja: "画面の説明", en: "Screen description" },
    },
  */
  works: [],

  /* 経歴。1 件の書き方:
     { period: "2026.04 –", title: { ja: "役割・内容", en: "..." }, org: { ja: "所属", en: "..." } } */
  career: [],

  /* 資格。1 件の書き方:
     { date: "2026.10", name: { ja: "資格名", en: "Certification name" } } */
  certs: [],

  /* 職務経歴書などの PDF（例: "assets/resume.pdf"） */
  resumeUrl: "",

  /* ライブの集計。生データは公開せず、集計した数字だけを載せる */
  music: {
    asOf: "2026-09",
    total: 48,
    artists: 14,
    venues: 34,
    byYear: [
      { year: 2023, count: 2 },
      { year: 2024, count: 7 },
      { year: 2025, count: 17 },
      { year: 2026, count: 22, partial: true },
    ],
    topArtists: [
      { name: "SEKAI NO OWARI", count: 18 },
      { name: "ずっと真夜中でいいのに。", count: 13 },
      { name: "Aooo", count: 3 },
      { name: "秘めごと", count: 3 },
      { name: "tuki.", count: 2 },
    ],
  },
};
