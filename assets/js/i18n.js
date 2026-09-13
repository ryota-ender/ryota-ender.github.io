/* ============================================================
   翻訳
   ・日本語は HTML に書いてある文をそのまま使う
   ・en: HTML の data-i18n / data-i18n-aria / data-i18n-alt のキーに対応する英語
   ・ja と en の両方にあるキーは、JS で組み立てる文言（動的な部分）
   ・キー名が _html で終わるものは HTML として差し込む
   ============================================================ */
window.SITE_I18N = {
  ja: {
    meta_title: "Ryota | Portfolio",
    meta_description: "Ryota のポートフォリオ。Web アプリケーションの開発を学びながら、Next.js / TypeScript / Java で自分が使うためのアプリを作っています。",
    phrases: ["Web アプリケーションを作っています", "Next.js / TypeScript / Java", "ライブとフェスが原動力です"],
    menu_open: "メニューを開く",
    menu_close: "メニューを閉じる",
    cta_profile: "プロフィールを見る",
    cta_works: "作品を見る",
    toast_copied: "メールアドレスをコピーしました",
    toast_copy_failed: "コピーできませんでした",
    year_note: "{year} 年は {month} 月時点",
    music_source: "自分で作ったライブ記録アプリの参戦履歴から集計（{year} 年 {month} 月時点）",
    aria_year: "{year}年: {count}公演",
    aria_artist: "{name}: {count}公演",
    tip_unit: "公演",
    case_problem: "課題",
    case_design: "設計",
    case_highlights: "工夫した点",
    case_learnings: "学び",
  },

  en: {
    /* 動的 */
    meta_title: "Ryota | Portfolio",
    meta_description: "Portfolio of Ryota, a developer in Japan learning web application development and building apps with Next.js, TypeScript and Java.",
    phrases: ["I build web applications", "Next.js / TypeScript / Java", "Powered by live music and festivals"],
    menu_open: "Open menu",
    menu_close: "Close menu",
    cta_profile: "View profile",
    cta_works: "View works",
    toast_copied: "Email address copied",
    toast_copy_failed: "Couldn't copy the address",
    year_note: "{year} counts through {month}",
    music_source: "Aggregated from the concert log in my own live-tracking app (as of {month} {year}).",
    aria_year: "{year}: {count} shows",
    aria_artist: "{name}: {count} shows",
    tip_unit: "shows",
    case_problem: "Problem",
    case_design: "Design",
    case_highlights: "Highlights",
    case_learnings: "Learnings",
    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],

    /* 共通 */
    skip: "Skip to content",
    nav_label: "Main",
    lang_label: "Language",
    theme_label: "Color theme",
    avatar_alt: "Profile image of Ryota",
    scroll_label: "Scroll down",
    to_top: "Back to top",
    updated: "Last updated",

    /* About */
    about_title: "About",
    tag_web: "Web apps",
    tag_db: "DB design",
    tag_fes: "Festival goer",
    about_p1_html: "Hi, I'm <span class=\"hl\">Ryota</span>. I'm learning web application development and building apps I actually want to use.",
    about_p2: "I learned the basics of server-side development with Python (Flask) and Java (Servlet / JSP) + MySQL, and I'm now building apps with Next.js, TypeScript and Supabase.",
    about_p3_html: "Live music and festivals keep me going. My theme is <span class=\"hl\">“build what I want, with my own hands.”</span>",
    timeline_label: "Timeline",
    tl1_title: "Learned the basics of web apps with Python / Flask",
    tl1_text: "Routing, templates and form handling — how a web app works under the hood",
    tl2_title: "Built LivePlan with Java (Servlet / JSP) + MySQL",
    tl2_text: "A concert schedule manager with login, designed and implemented in an MVC structure",
    tl3_title: "Built this site with HTML / CSS / JavaScript",
    tl3_text: "Hand-written without a framework and published on GitHub Pages",
    tl4_title: "Personal projects with Next.js / TypeScript / Supabase",
    tl4_text: "Building several apps with authentication, row-level security and PWA support",
    now_title: "What I'm working on",
    now_date: "As of September 2026",
    now1_title: "App development with Next.js and TypeScript",
    now1_text: "Getting comfortable with Server Components and Server Actions",
    now2_title: "Auth and data design with Supabase",
    now2_text: "Protecting each user's data with Row Level Security",
    now3_title: "Test automation",
    now3_text: "Building end-to-end checks with Playwright into my workflow",

    /* Skills */
    skills_title: "Skills",
    skills_lead: "Described by what I've actually used them for — not by self-rated percentages.",
    sk_java: "Designed and built a web app with login in an MVC structure",
    sk_mysql_tech: "Schema design / SQL",
    sk_mysql: "Table design for per-user data, and SQL with JOINs and aggregation",
    sk_python: "Small web apps with routing and templates",
    sk_supabase: "Email auth plus Row Level Security, so users can only read and write their own data",
    sk_html: "Responsive, accessible markup — this site is hand-written",
    sk_js: "UI without frameworks, and offline support with a Service Worker",
    sk_ts: "Expressing data structures with types to catch mistakes before runtime",
    sk_next: "App structure that separates server and client responsibilities",
    sk_tailwind: "Building UIs with utility classes",
    sk_git: "Small, meaningful commits, and automated checks with GitHub Actions",
    sk_vercel: "Deploying Next.js apps and managing environment variables",
    sk_pages: "Publishing static sites, including this one",

    /* Works */
    works_title: "Works",
    works_empty_title: "Works are being organized",
    works_empty_text: "I'm reorganizing my projects on GitHub. I'll add them here once they're ready.",
    works_empty_btn: "See repositories on GitHub",

    /* Music */
    music_title: "Live Music",
    music_lead: "Going to concerts and festivals is my favorite thing. These numbers come from the concert log I keep in my own app.",
    music_year_title: "Concerts per year",
    music_artist_title: "Most-seen artists",
    music_artist_sub: "Top 5 by number of shows",
    table_open: "Show as table",
    table_close: "Hide table",
    th_year: "Year",
    th_artist: "Artist",
    th_count: "Shows",

    /* Career */
    career_sec: "Career",
    career_title: "Career",
    certs_title: "Certifications",
    resume_btn: "View résumé (PDF)",

    /* Contact */
    contact_title: "Contact",
    contact_text: "Work, study buddies, concert friends — feel free to reach out.",
    contact_mail: "Send email",
    contact_copy: "Copy address",
  },
};
