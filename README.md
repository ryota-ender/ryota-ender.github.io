# ryota-ender.github.io

自己紹介・ポートフォリオページ（GitHub Pages）

公開 URL: https://ryota-ender.github.io （英語版: `?lang=en`）

## 構成

```
├── index.html               # ページの骨組み（日本語の文章もここ）
├── 404.html                 # 404 ページ（単体で完結）
├── robots.txt / sitemap.xml # 検索エンジン向け
├── assets/
│   ├── css/style.css        # 見た目（テーマの色はすべてここの変数）
│   ├── js/content.js        # 中身のデータ（作品・経歴・資格・ライブ集計など）
│   ├── js/i18n.js           # 英語訳と、JS で組み立てる文言
│   ├── js/main.js           # 動き（言語・配色の切り替え、描画など）
│   ├── avatar.png           # プロフィール画像
│   └── ogp.png              # SNS シェア用画像（1200x630）
├── .github/workflows/site-check.yml  # リンク切れ・Lighthouse の自動チェック
├── lighthouserc.json / lychee.toml   # 上のチェックの設定
└── .gitignore
```

ビルドは不要。外部依存は見出し用フォント（Google Fonts の Syne）のみで、
日本語の本文は OS 標準フォントで表示する（重い日本語 Web フォントは読み込まない）。

## デザイン方針

- **絵文字・アイコンは使わない。** 矢印の記号やハンバーガーアイコンも使わず、
  `MENU` / `TOP` / `JA / EN` / `LIGHT / DARK` のように文字で表す。
- 演出は「タイピング」「イコライザー」「スクロール表示」の 3 つだけ。背景の星とオーロラは静止画。
- 文字色はダーク・ライトとも背景に対してコントラスト比 4.5:1 以上（WCAG AA）。
- `prefers-reduced-motion` の環境ではアニメーションを止める。

## よく編集するところ

### 作品を載せる（`assets/js/content.js` の `works`）

配列に 1 件足すと Works にケーススタディ形式（課題 / 設計 / 工夫した点 / 学び）で並ぶ。
空のあいだは「整理中」の案内が出る。1 件目を足すと、ヒーローのボタンも
「プロフィールを見る」から「作品を見る」に自動で切り替わる。書き方は `content.js` 内のコメントを参照。

### 経歴・資格・職務経歴書（`career` / `certs` / `resumeUrl`）

どれか 1 つでも入れると「経歴・資格」セクションとナビの Career が現れる。すべて空なら出ない。

### ライブの集計（`music`）

参戦履歴の生データは公開せず、集計した数字だけを書く。
`asOf`（集計した年月）を更新すると、グラフの注記も変わる。

### タイムライン・NOW

`index.html` を直接編集する。英語は `i18n.js` の同じキー（`tl1_title` など）を直す。

### 文章を足す・直す

1. `index.html` に日本語で書き、要素に `data-i18n="キー"` を付ける
2. `assets/js/i18n.js` の `en` に同じキーで英訳を足す
   （中にタグを含む文は、キー名の末尾を `_html` にする）

## アクセス解析（任意）

[GoatCounter](https://www.goatcounter.com/)（無料・Cookie なし）でアカウントを作り、
`content.js` の `analytics.goatcounter` にコード（例: `"ryota"`）を入れると計測が始まる。
空のままなら計測スクリプトは読み込まない。

## 自動チェック（GitHub Actions）

`main` への push と PR のたびに次を実行する。

- **Link check**: lychee でリンク切れを検出（失敗したら赤くなる）
- **Lighthouse**: アクセシビリティ 0.95 未満で失敗、その他（性能・SEO・ベストプラクティス 0.9）は警告のみ。
  レポートは実行結果の Artifacts からダウンロードできる

フッターの「最終更新」日は、配信時の `Last-Modified`（GitHub Pages のデプロイ日時）から自動で表示される。

## ローカルでの確認方法

```bash
cd ryota-ender.github.io
python3 -m http.server 8000
# ブラウザで http://localhost:8000 を開く（英語版は http://localhost:8000/?lang=en）
```

## 履歴

- 2026-09-13: 20 項目の改善（スキルを数値から用途ベースに、NOW・ライブ集計・経歴欄の追加、
  ライト/ダーク切り替え、英語版、演出の削減、コントラスト・日本語改行・アクセシビリティの改善、
  フォント軽量化、メールアドレスの難読化、SEO ファイル、アクセス解析の受け口、自動チェック）。
  1 ファイル構成から CSS / JS を分割した。
- 2026-09-12: 絵文字・アイコンを全廃。LivePlan（静的版・PWA）をこのリポジトリから削除し、
  Works セクションを作り直した。以降、掲載する作品は他リポジトリの制作物から選んで追加する。
