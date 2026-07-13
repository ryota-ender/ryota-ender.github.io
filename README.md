# ryota-ender.github.io

自己紹介・ポートフォリオページ（GitHub Pages）

公開 URL: https://ryota-ender.github.io

## 構成

```
├── index.html                  # 自己紹介ページ（トップ）
├── 404.html                    # 404 ページ
├── assets/
│   ├── avatar.png              # プロフィール画像（ローカル配信）
│   ├── ogp.png                 # SNS シェア用 OGP 画像（1200x630）
│   └── liveplan-shot.png       # Works 用 LivePlan プレビュー（サンプルデータ版）
├── liveplan/                   # LivePlan（ライブスケジュール管理）静的版・PWA
│   ├── index.html              # 一覧・カレンダー・統計の SPA
│   ├── css/style.css
│   ├── js/app.js
│   ├── manifest.webmanifest    # PWA マニフェスト
│   ├── sw.js                   # Service Worker（オフライン対応）
│   ├── icons/                  # PWA アイコン（192 / 512）
│   └── data/
│       ├── schedules.sample.json   # 公開用サンプルデータ（コミット対象）
│       └── schedules.json          # 実データ（.gitignore 済み・非公開）
└── .gitignore
```

## LivePlan について

もともと Java（Servlet / JSP）＋ MySQL で開発した Web アプリを、
GitHub Pages で動くように HTML / CSS / JavaScript へ移植したもの。

| 元の実装 | 静的版での置き換え |
| --- | --- |
| MySQL | JSON ファイル |
| サーバー側での登録・更新・削除 | localStorage（ブラウザごとに保存） |
| ログイン認証 | なし（個人用・デモ用のため省略） |

### 主な機能

- カード一覧（フリーワード検索・絞り込み・並び替え）
- 自作カレンダー表示（`#cal` で直接開ける）
- 統計ダッシュボード（年別・アーティスト別・会場別 TOP10、`#stats`）
- 登録・編集・削除（モーダル、フォーカストラップ対応）
- データメニュー：JSON 書き出し / JSON 読み込み / iCal (.ics) 書き出し / 初期化
- **PWA 対応**：スマホでホーム画面に追加するとアプリとして起動し、オフラインでも動作

### データの読み込み優先順位

1. `localStorage`（ブラウザ上で編集した内容）
2. `data/schedules.json`（実データ。ローカル環境にのみ存在）
3. `data/schedules.sample.json`（公開サイトではこれが表示される）

実データは `.gitignore` に登録してあるため GitHub には上がらず、
公開サイトでは架空のサンプルデータが表示される。

### ローカルでの確認方法

`fetch` / Service Worker を使うため、簡易サーバーを起動して確認する：

```bash
cd ryota-ender.github.io
python3 -m http.server 8000
# → http://localhost:8000 を開く
```

### 実データの更新方法

1. ブラウザ上で登録・編集・削除する（localStorage に保存される）
2. データメニューの「⬇ JSON 書き出し」で `schedules.json` をダウンロード
3. `liveplan/data/schedules.json` を差し替える
4. 「↺ 初期化」で localStorage を消すと JSON の内容に戻せる

別のブラウザ・端末に移すときは「📂 JSON 読み込み」で書き出したファイルを取り込む。

### iCal 書き出し

データメニューの「📅 iCal (.ics) 書き出し」で全スケジュールをカレンダーファイルにできる。
iPhone のカレンダーや Google カレンダーにそのまま取り込み可能
（終了時刻は管理していないため開演 +2 時間で仮置き）。

### Service Worker のキャッシュ更新

`liveplan/sw.js` の `VERSION` を上げると、次回アクセス時に古いキャッシュが削除される。
アプリ本体（HTML）とデータはネットワーク優先なので、通常は更新がそのまま反映される。
