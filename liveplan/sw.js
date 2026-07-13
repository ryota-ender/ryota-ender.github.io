/* ============================================================
 * LivePlan Service Worker
 *
 * 方針:
 *  - ナビゲーションと data/*.json → ネットワーク優先（常に最新を試み、
 *    オフライン時はキャッシュにフォールバック）
 *  - CSS / JS / アイコンなど → キャッシュ優先（初回取得後は高速起動）
 *  - 更新時は VERSION を上げると古いキャッシュが自動削除される
 * ============================================================ */

const VERSION = "liveplan-v1";

const CORE_ASSETS = [
  "./",
  "index.html",
  "css/style.css",
  "js/app.js",
  "data/schedules.sample.json",
  "manifest.webmanifest",
  "icons/icon-192.png",
  "icons/icon-512.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(VERSION)
      // schedules.json（非公開データ）は公開サイトに存在しないため、
      // 1 つの失敗で全滅しないよう allSettled で個別に取得する
      .then((cache) => Promise.allSettled(CORE_ASSETS.map((url) => cache.add(url))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return; // Google Fonts などはブラウザに任せる

  const networkFirst = req.mode === "navigate" || url.pathname.includes("/data/");

  if (networkFirst) {
    e.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(VERSION).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() =>
          caches.match(req).then((cached) => cached || caches.match("index.html"))
        )
    );
  } else {
    e.respondWith(
      caches.match(req).then(
        (cached) =>
          cached ||
          fetch(req).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(VERSION).then((c) => c.put(req, copy));
            }
            return res;
          })
      )
    );
  }
});
