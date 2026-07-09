# ryota-ender.github.io

自己紹介・ポートフォリオページ（GitHub Pages）

公開 URL: https://ryota-ender.github.io

## 構成

```
├── index.html                  # 自己紹介ページ（トップ）
├── liveplan/                   # LivePlan（ライブスケジュール管理）静的版
│   ├── index.html              # 一覧・カレンダー・統計の SPA
│   ├── css/style.css
│   ├── js/app.js
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

### データの読み込み優先順位

1. `localStorage`（ブラウザ上で編集した内容）
2. `data/schedules.json`（実データ。ローカル環境にのみ存在）
3. `data/schedules.sample.json`（公開サイトではこれが表示される）

実データは `.gitignore` に登録してあるため GitHub には上がらず、
公開サイトでは架空のサンプルデータが表示される。

### ローカルでの確認方法

`fetch` を使うため、ダブルクリックで開くのではなく簡易サーバーを起動する：

```bash
cd ryota-ender.github.io
python3 -m http.server 8000
# → http://localhost:8000 を開く
```

### 実データの更新方法

1. ブラウザ上で登録・編集・削除する（localStorage に保存される）
2. ヘッダーの「⬇ 書き出し」で `schedules.json` をダウンロード
3. `liveplan/data/schedules.json` を差し替える
4. 「↺ 初期化」で localStorage を消すと JSON の内容に戻せる
