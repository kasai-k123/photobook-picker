# フォトブック料金くらべ

Astro + TypeScriptで6社16商品の公式掲載情報を比較するサイトです。静的HTMLをCloudflare WorkersのStatic Assetsで配信し、操作イベントだけをWorkerで受信します。公開・デプロイは行っていません。

## ローカルで動かす

Node.js 24、npmを使用します。

```sh
npm ci
npm run dev
```

`npm run dev` は画面の開発用です。計測APIまで確認する場合は、次のビルド後に `npm run preview` を実行してください。ローカルではAnalytics Engineの本番データセットに書き込みません。

ローカルプレビューを含め、`EVENTS` bindingが未設定の場合、検証を通過した計測リクエストにはHTTP 503を返します。`writeDataPoint()` を例外なく呼び出せた場合のみHTTP 204、書き込み時の例外はHTTP 503です。いずれも `Cache-Control: no-store` を返します。計測APIが503でも、通常ページの配信・絞り込み・公式リンクへの移動は継続できます。

```sh
npm run check
npm test
npm run build
npm run preview
```

`build` はAstroの静的出力とWranglerの **dry-run** のみです。デプロイしません。生成物は `dist/` と `.worker-build/` に置かれ、Git管理対象外です。

## 公開URLとSEO

`.env.example` を `.env` にコピーし、公開先確定後に `SITE_URL` をサイトのオリジン（`https://` とホスト名。サブパス・クエリなし）に設定して再ビルドしてください。URLはハードコードしていません。Workersの実行時変数だけを変更しても静的HTMLは更新されません。

- 未設定・不正な値：全ページ `noindex, nofollow`、canonicalとOG URLを省略、空のサイトマップ、robotsで全クロール禁止。
- 有効な値：canonical・OG URL・robots・サイトマップに反映。サイトマップはトップ、6社詳細、比較方法、プライバシーの9ページ。
- 404：設定にかかわらずnoindex。WorkerがHTTP 404と `X-Robots-Tag` も返します。

公開前に本番オリジン、Cloudflareアカウント、Worker名を確認してください。`wrangler.jsonc` の `photobook-picker` はリポジトリに合わせた設定名であり、公開先の確定を意味しません。デプロイは別途明示的な判断で行ってください。

## データ・比較仕様

- 比較データ：`src/data/photobook-official-mvp-2026-10-21.json`（価格・仕様・リンクは調査時の値を維持。公開文言のみ調整）
- 調査メモ：`docs/research.md`（添付メモをそのまま収録）
- データファイルのSHA-256：`docs/data.sha256`
- 比較ロジック：`src/lib/catalog.ts`

価格は税込・1冊・割引なしで、商品に指定された配送方法の送料を使用します。ページ追加や別仕様の価格を推定しません。サイズは長辺160mm以下／160mm超230mm以下／230mm超。スマホ対応のみの絞り込みは `yes` のみです。未確認の表紙は「不明」、スマホ編集は「要確認」と表示します。

画面はJavaScriptなしでも全商品の情報を表示します。絞り込みと並べ替え、計測にはJavaScriptが必要です。利用者向けの比較条件・除外事項・出典は `/methodology/` に掲載しています。

## 計測

`POST /api/events` → Workersの `EVENTS` binding → Analytics Engineデータセット `photobook_picker_events`。

| イベント | 記録する対象 |
| --- | --- |
| `page_view` | 既知のページパス（404は固定値） |
| `comparison_interaction` | 操作した条件名／並べ替え／リセット |
| `service_detail_view` | サービスID |
| `outbound_click` | 商品・サービス・出典ID |

格納形式は `indexes[0]=イベント名`、`blobs=[イベント名, ページパス, 対象IDまたは条件名]`、`doubles=[1]` です。予算の入力値、クエリ、IP、User-Agent、参照元、Cookie、個人識別IDは記録しません。受信値は既知の識別子だけに制限し、追加フィールドは保存しません。同一オリジンのJSON POSTのみを受け付け、リクエスト本文は1KBまでです。

公式リンクは通常クリック・キーボード操作・中ボタンクリックを記録し、`keepalive` を使って遷移を妨げません。計測は通信状況やブロッカー等で欠損する場合があります。Workersの自動ログは無効にしています。実際のAnalytics Engine書き込み確認は、Cloudflareの接続・公開が未実施のため未確認です。

## テスト

Vitestの39テストで調査メモの4判定例、全16商品の価格合計、原本ハッシュ、サイズ境界、ソート、SEOの設定有無、イベント検証・書き込み、Workerの404、DOM上の絞り込み・計測送信を検証します。計測の未設定・成功・失敗時の応答と、計測が利用できない場合のページ配信・画面操作も検証します。公開URLあり・なしで実際にAstroをビルドし、全ページのメタ情報と商品表示値も検証します。テスト用出力先はGit管理外の `.test-build/` です。

ローカルWorkersでトップ・詳細ページ・robots・sitemapのHTTP 200、存在しないページのHTTP 404とnoindex、計測APIのHTTP 204を確認済みです。ブラウザ操作や追加の公式情報調査は行っていません。

## 残る未確認事項

- 公開URL・Cloudflareの実運用設定とAnalytics Engineへの実書き込み。
- MyBook ART-HC 180S・20ページのスマホ編集対応。
- キタムラのポケットブックの表紙分類。
- 調査メモに記載された別配送方法の適用条件。現状は確定JSONの配送方法のみを使用。
