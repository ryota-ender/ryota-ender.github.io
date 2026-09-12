# ryota-ender.github.io

自己紹介・ポートフォリオページ（GitHub Pages）

公開 URL: https://ryota-ender.github.io

## 構成

```
├── index.html      # 自己紹介ページ（トップ）
├── 404.html        # 404 ページ
├── assets/
│   ├── avatar.png  # プロフィール画像（ローカル配信）
│   └── ogp.png     # SNS シェア用 OGP 画像（1200x630）
└── .gitignore
```

外部依存はフォント（Google Fonts）のみで、HTML / CSS / JavaScript は
`index.html` 1 ファイルにまとめてある。ビルド不要。

## デザイン方針

- **絵文字・アイコンは使わない。** セクション見出し、ボタン、スキル欄などは
  すべて文字・数値・罫線だけで構成する。矢印記号（↗ ↑ →）も使わない。
- ファビコンも絵文字ではなく「R」の文字マーク（インライン SVG のデータ URI）。
- 装飾は CSS のグラデーション・タイポグラフィ・余白で付ける。

## セクション

| セクション | 内容 |
| --- | --- |
| Hero | 名前・肩書き・タイピングアニメーション・数値サマリー |
| About | 自己紹介文と学習の経緯（STEP 01〜03 のタイムライン） |
| Skills | Java / MySQL / HTML・CSS / JavaScript / Python / Git（習熟度を数値とバーで表示） |
| Works | 現在は「整理中」の案内のみ。掲載する作品は今後追加する |
| Contact | メールリンク・アドレスのコピー・GitHub |

`prefers-reduced-motion` を指定している環境では、アニメーションとカスタムカーソルを止める。

## ローカルでの確認方法

```bash
cd ryota-ender.github.io
python3 -m http.server 8000
# → http://localhost:8000 を開く
```

## 履歴

- 2026-09-12: 絵文字・アイコンを全廃。LivePlan（静的版・PWA）をこのリポジトリから削除し、
  Works セクションを作り直した。以降、掲載する作品は他リポジトリの制作物から選んで追加する。
