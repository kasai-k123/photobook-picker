# 第6弾 フォトブック料金くらべ｜公式調査・MVP確定仕様

調査確認：2026-10-21。各社公式掲載値。GitHubは未変更。

## 結論

国内向け6社・16種類の製品/ページ数バリエーションを採用。税込・単品・通常価格のみ。価格の変動推定・自動ページ追加計算はしない。

## 採用商品（1冊・税込）

| メーカー | 商品・仕様 | サイズmm | 表紙分類 | ページ | 本体 | 比較用送料 | 参考合計 | スマホ編集 |
|---|---|---:|---|---:|---:|---:|---:|---|
| MyBook | book | 160×160 | hard | 16 | ¥2,420 | ¥220 | ¥2,640 | yes |
| MyBook | ART-SC 180S | 180×180 | soft | 20 | ¥3,840 | ¥650 | ¥4,490 | no |
| MyBook | ART-HC 180S | 186×186 | hard | 20 | ¥4,420 | ¥650 | ¥5,070 | unknown |
| フジフォトアルバム | オリジナルアルバム 210角 | 210×210 | hard | 12 | ¥4,620 | ¥990 | ¥5,610 | yes |
| フジフォトアルバム | オリジナルアルバム 210角 | 210×210 | hard | 24 | ¥6,930 | ¥990 | ¥7,920 | yes |
| フジフォトアルバム | オリジナルアルバム A4縦 | 210×297 | hard | 24 | ¥6,930 | ¥990 | ¥7,920 | yes |
| フォトレボ | ソフトカバー A5バーチカル | 140×200 | soft | 16 | ¥1,200 | ¥660 | ¥1,860 | yes |
| フォトレボ | ハードカバー A5バーチカル | 140×200 | hard | 16 | ¥2,400 | ¥660 | ¥3,060 | yes |
| フォトレボ | ソフトカバー M | 200×200 | soft | 24 | ¥3,560 | ¥660 | ¥4,220 | yes |
| Photoback | POCKET | 90×128 | flat_pasted | 16 | ¥1,210 | ¥677 | ¥1,887 | yes |
| Photoback | ROUGH | 150×150 | flat_pasted | 24 | ¥2,904 | ¥677 | ¥3,581 | yes |
| Photoback | LIFE | 148×210 | soft | 24 | ¥3,734 | ¥677 | ¥4,411 | yes |
| BON | BON写真集 S | 109×151 | hard | 24 | ¥2,200 | ¥180 | ¥2,380 | yes |
| BON | BON写真集 M | 151×212 | hard | 24 | ¥3,300 | ¥215 | ¥3,515 | yes |
| カメラのキタムラ | ポケットブック ましかく | 102×102 | unknown | 22 | ¥1,360 | ¥110 | ¥1,470 | yes |
| カメラのキタムラ | フォトプラスブック A5タテ | 150×200 | hard | 22 | ¥3,990 | ¥660 | ¥4,650 | yes |

※参考合計は指定した配送方法の税込価格。最安送料や同条件品質を保証しない。配送方法はJSONのshippingMethodに明記。

## MVPで実装すること

- トップ：サイズ帯、ページ数帯（1〜20ページ／21〜40ページ）、カバー、スマホ編集、送料込み上限予算で絞り込み。
- 表示：商品名、縦横サイズ(mm)、ページ数、表紙・製本、税込本体価格、送料、参考合計、選択した配送方法、公式リンク。
- 送料込み参考合計・本体価格の昇順ソート。サイズやページ数が違うことを明示。
- 6社詳細・比較方法・プライバシー・404と、Cloudflare Analytics Engineの4イベント（page_view / comparison_interaction / service_detail_view / outbound_click）。
- 比較・計測・SEOのテスト、SITE_URL未設定時noindexの仕様。
- 公式リンクのみ。ASPリンク導入は別途ユーザー判断。

## 実装の境界・条件

- 同じ「20ページ程度」でも各社の16/20/22/24ページは別の商品として正確に表示する。存在しない組み合わせは作らない。
- 発送日数は付記しても固定日時は設定しない（地域や注文状況で変動）。
- ページ追加時の料金計算、複数冊割引・キャンペーン、全商品カタログ化は行わない。
- JSON内の公式データと出典を実装入力に使用し、Codexによる追加公式Web調査は不要。
- ブランド名以外の見出しは自然な日本語にし、内部用語（MVP、unknown、スキーマ等）は公開ページに出さない。

## 注意事項・未確定

- サイトは全商品・全ページ数の比較ではない。掲載16バリエーションのみ。
- 各社のサイズ・ページ数・印刷方式・合紙製本・仕上がり品質は異なり、送料込み順が同等品質での安さを示すわけではない。
- 配送方法は混在。宅急便・ゆうメール・ネコポスなどの到着日数は比較しない。
- MyBook ART-HC 180S 20ページのスマホ編集対応は個別未確認。
- カメラのキタムラ ポケットブックの表紙はhard/softを断定しない。
- Photobackの290円ネコポスは公式に案内があるが、各商品・条件で使えるかの精査を省略し、宅急便677円を使った。
- MyBook ART-SC/ART-HCのゆうメール適用可否は商品/冊数で変わるため宅急便650円を使った。
- 割引・クーポン・会員特典・まとめ買い・代引き手数料・離島追加料金・納期保証は除外。
- フジフォトの公式サイトでは化粧箱オプション記載内に税込表記の食い違いがあるため、オプションは除外した。
- ASP公式紹介記事の掲載は、現在の提携承認や成果地点を保証しない。

## 掲載価格の元資料（すべて公式）

- **M1** MyBook book 商品仕様・価格：https://www.mybook.co.jp/products/book/book/
- **M2** MyBook ART-SC 価格表：https://www.mybook.co.jp/products/book/art-sc/price.html
- **M3** MyBook ART-HC 価格表：https://www.mybook.co.jp/products/book/art-hc/price.html
- **M4** MyBook 送料と配送：https://www.mybook.co.jp/price/
- **M5** MyBook 作成方法と対応商品：https://www.mybook.co.jp/products/book/
- **F1** フジフォト オリジナルフォトアルバム価格・送料：https://fujiphoto.co.jp/photoalbum/price.html
- **F2** フジフォト スマホ・PC対応：https://fujiphoto.co.jp/photoalbum/
- **R1** フォトレボ ソフトカバーA5バーチカル：https://photorevo.net/products_item/sa5v/
- **R2** フォトレボ ハードカバーA5バーチカル：https://photorevo.net/products_item/ha5v/
- **R3** フォトレボ ソフトカバーM：https://photorevo.net/products_item/sm/
- **R4** フォトレボ 通常配送の送料：https://photorevo.net/payment/
- **P1** Photoback POCKET：https://www.photoback.jp/book/pocket
- **P2** Photoback ROUGH：https://www.photoback.jp/book/rough
- **P3** Photoback LIFE：https://www.photoback.jp/book/life
- **B1** BON 写真集の通常価格・商品仕様：https://bon-book.jp/photobook/howtouse/
- **B2** BON 送料（1冊注文時）：https://bon-book.jp/law/
- **K1** カメラのキタムラ ポケットブック：https://photobook.kitamura.jp/pocketbook/
- **K2** カメラのキタムラ フォトプラスブック：https://photobook.kitamura.jp/photoplus/

## 初期テスト例

- 送料込み予算1,600円以下：カメラのキタムラ「ポケットブック ましかく」（1,470円）のみ。
- ページ数21〜40・ハードカバー・スマホ編集可・送料込み3,500円以下：BON S（2,380円）のみ。
- ページ数1〜20・ソフトカバー：フォトレボ A5バーチカル16P（1,860円）とMyBook ART-SC 180S 20P（4,490円）。
- 絞り込み時、MyBook ART-HC 180S 20Pのスマホ編集はunknownとして自動的に「対応」と断定しない。

## 調査結果の扱い

このデータは公式サイトの調査日時点の掲載内容を静的に転記したもの。価格や取り扱いが変更される可能性があるため、運用時は確認日を表示し、必要に応じて再確認する。
