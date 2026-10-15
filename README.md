# [ping-pong](https://poemoon0416.github.io/ping-pong)

- 2026/10/15公開
- 自分のゴールを守りつつ, 相手のゴールにボールを入れよう

## 操作説明

- シフトキーでゲームスタート
- マウスホイールで上下に移動
- シフトキーでボールをシュート
- 先に3点取った方が勝ち

- - -
- - -
- - -
- - -
- - -
- - -
- - -
- - -
- - -
- - -

## 以下経緯や中身の話

- - -
- - -
- - -
- - -
- - -
- - -
- - -
- - -
- - -
- - -

## 開発の経緯

- ブラウザで動くPONGのようなものをHTML/CSS/TypeScript(ゲーム本体)とNode.js(Webサーバ)でつくる

### 期間

- 3-4週間くらい((2025/11/25 or 2025/12/01)-2025/12/18)
- 100均のナノブロックで遊んだりサイゼリヤとか松屋で飯食ったりもしているので人間, メリークリスマス(?)

### 背景

- 近所のゲーセン(タイトーステーション)にて
- 太鼓の達人をやりにときどき遊びに行くのだが[アタリのPONGという卓球がテーマのレトロゲームが気になったのでちょっと遊んできた](https://www.taito.co.jp/pong)
- ふとTypeScriptで再現できるかもしれないと思ったので似たものを自分でつくってみた(作成にあたって参考にしたのはゲーセンで遊んだ公式のやつの挙動)

### PONGとは

- [PONG設置店舗](https://www.taito.co.jp/arc/0000002245)
- PONGとは: [Wiki](https://ja.wikipedia.org/wiki/%E3%83%9D%E3%83%B3_(%E3%82%B2%E3%83%BC%E3%83%A0)), [ゲームカタログ@Wiki](https://w.atwiki.jp/gcmatome/pages/211.html), [ファミ通](https://www.famitsu.com/news/201809/10163053.html), [Pixiv](https://dic.pixiv.net/a/PONG)
- PONGはいろんな人が再現したりカスタムしたりしているくらい有名なレトロゲームならしい(作成にあたって参考にしたのはゲーセンで遊んだ公式のやつの挙動)

## 苦労した点と工夫した点

### デザインと演出

- レトロゲームっぽくしてみた
  - 全体的に白黒シンプルでまとめる(色が少ない)
  - ゴールやシーン切替の際に少し間を置く(こまめに停止する)
  - ボールに対してプレイヤー・オートモードプレイヤー・コンピュータの動きを少しカクカクにする(動きが滑らかでない)
- シンプルな操作の再現
  - ハンドルを回す代わりにマウスホイールを回す
  - ボタンを押す代わりにシフトキー押下(ゲーム開始とキックオフ)

### サイズと位置

- サイズと位置は似たような概念(`offset`・`DOMRect`・`client`・`scroll`)が複数あるので, 気を付けて扱わないと表示がズレてしまう
  - しかもピクセル単位のズレで後から要素をセンタリング(中央揃え)できていないことに気付くケースもある
  - サイズと位置の扱いは複雑なので, 衝突判定を行うといったサイズと位置の扱いを責務とするユーティリティクラスの作成
- サイズ(`width/height`)においては似た概念の識別
  - `offset`/`DOMRect`は要素(要素領域)のサイズ(`border-box` = `content-box` + `border`, `margin`は含まないので注意)
    - `offset`は四捨五入で丸めた整数, `DOMRect`はサブピクセル単位の小数, `DOMRect`は`getBoundingClientRect()`メソッドで取得可能
  - `client`は内容(表示領域)のサイズ(`content-box` = `content` + `padding`), スクロール可能なピクセル数(`scroll` - `client`)やビューポートのサイズ(`<html>`要素の特例)の取得などに使う
  - `scroll`はフルの内容(スクロール領域)のサイズ(スクロールしないとみえない領域も`content`に含んだ`content-box`, `padding`も含むので注意)
- 位置(`top/right/bottom/left`)においては似た概念の識別に加え, 位置指定が競合しないようにするため, 基本的に`bottom/right`を使わず`top/left`を使うように統一する

### パラメータ調整

- ゲームバランスやデバッグの関係で後から色々なパラメータを調整する必要があるので動かしながら微調整
  - 移動速度(`moveXxxSpeed`), 移動の滑らかさ(`moveXxxMs`), シーン切替までの時間や1試合終了までの勝利数

### シーン切替

- シーン切替の際にイベントハンドラなどの非同期処理のクリアや位置の初期化を行わないと変な挙動をする
  - 突然プレイヤーの動きが高速になったり, 突然ワープしたり, 突然別のシーンが始まったり, 位置関係がぐちゃぐちゃになってしまう
  - 同じシーンを何度開始しても問題ないようにする必要があるので, シーン切替の中でクリアする処理もセットで呼んで副作用をなくす
- インスタンスのメソッドを`setInterval()`等のコールバックとして渡す場合は, `this`をバインドしないと`this`が`window`等のグローバルオブジェクトになってしまう
  - メソッド内で参照しているインスタンスフィールドが`undefined`になるので, デモが停止したりする(しかもその状態でゲーム自体は動き続ける)

## 具体的にやったこと

### JavaScript/TypeScriptでの検証

- JS/TSの諸々の基礎検証(`src`直下のいくつかのファイル, 下記の作成と並行)
- Node.jsでのWebサーバ(`http-server-html`)
- JSでのDOM操作と非同期関数(`static-random-color`)
- 一定時間ごとの更新(`dynamic-random-color`)
- 要素のサイズを扱う(`get-elem-size`)
- 要素の位置を扱う(`get-elem-pos`, `get-elem-range`(位置ではなかったので未使用))

### 検証内容の統合

- これまでの統合・プレイヤーの動き・コンピュータの動き・衝突判定(`key-down-move`)
  - 顔のキャラクターをプレイヤーとしてWASD方式で動かせる
  - 長押しでダッシュできる, `border`でエフェクトをつけた
  - コンピュータに衝突したらしゃべる
  - CSSで三角形や球体の置物をつくった
- これまでの統合・ボールの動き・シーン切替(`ping-pong`)
  - ポーズシーン: サイト訪問したら初期位置でちょっと止める, 一定時間後にデモシーンに移る
  - デモシーン: デモが動き続ける, オートモードで動くプレイヤーの速さとコンピュータの速さは少しズラす, シフトキー押下でキックオフシーンに移る
  - キックオフシーン: マウスホイールの上下で操作可能, ボールはプレイヤーを追従する, コンピュータは少し遅れてボールを追う, シフトキー押下でプレイングシーンに移る
  - プレイングシーン: ボールはグラウンドやプレイヤー/コンピュータに衝突したら反射する, ゴールしたら勝利した方にポイント加算, ポイントは常に表示される, ゴールしたとき1試合終了までの勝利数未満ならキックオフシーンに移動, そうでなければフィニッシュシーンに移動
  - フィニッシュシーン: WIN PLAYER!/WIN COMPUTER!を表示する, 一定時間後にポーズシーンに移る(これで一巡する)

## 感想

- 色々自分で調べて仕組みを理解しながら徐々に完成していくのが面白いと思った
- TypeScriptでFlash的なブラウザで動くレトロゲームが本当に作れるんだなという実感が得られた, 動くものが完成するのはやっぱり達成感がある
- ライブラリ等を使わないでつくったのでWebの低レイヤー(HTML/CSS/TypeScript/Node.js)に直接触れられて良かったと思う

## 動かし方と構成

- コンパイル: `npx tsc`
  - `src`のTSファイルを`dist`のJSファイルとしてコンパイルする
- アプリ起動: `node dist/pingPongHttpServer.js`
  - コマンドラインにURLが出てくるのでブラウザで開く
- ディレクトリ構成とルーティング
  - `src/.env`でファイルの場所を指定している
  - `.env`内の`SRC_APP_ROOT`からHTML/CSSファイルを返している
  - `.env`内の`DIST_APP_ROOT`からJS/js.mapファイルを返している
  - [補足: js.mapはTSファイルを返して型情報を補足するもの(デベロッパーツールでソースコードを見れるようになる)](https://developer.mozilla.org/ja/docs/Glossary/Source_map)
- ファイル形式
  - スコープをファイルごとに切り分けようとしてモジュールを使っていたはず
  - MIMEタイプを指定しないとモジュールのJSが動かなくてNode.jsでルータを書いたような記憶がある
    - [MIMEタイプ`text/javascript`の明記がないとCORSエラーでモジュールのJSが実行されない](https://developer.mozilla.org/ja/docs/Web/JavaScript/Guide/Modules#%E5%9F%BA%E6%9C%AC%E7%9A%84%E3%81%AA%E6%A7%8B%E9%80%A0%E3%81%AE%E4%BE%8B)
    - [テストはサーバ経由](https://developer.mozilla.org/ja/docs/Web/JavaScript/Guide/Modules#%E3%83%A2%E3%82%B8%E3%83%A5%E3%83%BC%E3%83%AB%E3%81%A8%E3%82%AF%E3%83%A9%E3%82%B7%E3%83%83%E3%82%AF%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%97%E3%83%88%E3%81%A8%E3%81%AE%E3%81%9D%E3%81%AE%E4%BB%96%E3%81%AE%E9%81%95%E3%81%84)
  - `script`タグに`type=module`と指定している(`index.html`)
    - 実際のところ, `index.html`を直接開いたとき, モジュール指定があると`Access to script at 'file:///D:/vsc/ping-pong-public/index.js' from origin 'null' has been blocked by CORS policy: Cross origin requests are only supported for protocol schemes: chrome, chrome-experimental-site-token-provider, chrome-extension, chrome-untrusted, data, http, https, isolated-app.`というCORSエラーが発生して, モジュール指定がないとインポートは使用できないというエラーが出る(デベロッパーツールのコンソールタブの`Selected context only`を外す)
    - `index.html`を直接開くときは相対パスで書かないと動かない点に注意(ローカルのルートはドライブ直下)
- ローカル環境での動作と公開の見通し
  - Node.jsを使っているが、サーバへのデータ保存といったサーバサイド機能は使っていないので、フロントエンドのみで完結可能
  - 静的型付けにしてみたくてTSを使っていて、index.htmlをそのまま開くとコンパイル後のJSしかみれずデバッグしにくいからルータ(`src/pingPongHttpServer.ts`)を書いたのかも(ファビコンとかもそのまま開くと動かないかも)
  - Node.jsはローカルでの開発(npmでのTSなど)および動作環境(ルータ, Webサーバ)として使っているだけなので、公開時はHTML/CSS/JS(コンパイル後)を別のリポジトリに分けてGitHubPagesを使うのが手っ取り早そう
- GitHubPagesでの公開
  - [公開URL](https://poemoon0416.github.io/ping-pong-page/)
  - 公開にあたっての改変
    - GitHubPagesに載せるファイルは`/docs`以下に配置
    - 別のリポジトリ(`ping-pong-page`)にブラウザで動くただのHTML/CSS/JSに再構成したファイル群を載せて公開する
    - GitHubPages内のルータからソースフォルダ直下の`index.html`を返すのだろうと想定する
    - `index.html`を起点に`link`タグや`script`タグを経由して各種ファイルにアクセスする
    - コンパイル後のJSのうち現在使っている`index.js`と`elemPosUtil.js`をソースフォルダ直下に抜き出しそれ以外のJS/TSファイルを削除する
    - `index.html`を相対パスにする(しなくても良いと思うけどローカルでJS以外の最初の画面すら見えなくなる)
    - `index.js`はモジュールのままでok(GitHubPages側で対応しているからだと思う)
  - ファビコンについて
    - [ファビコンの指定方法](https://developer.mozilla.org/ja/docs/Web/HTML/Reference/Attributes/rel#icon)
    - ファビコンの場所を明示しないと`<user-name>.github.io/favicon.ico`をみにいってしまう
    - アクセス失敗するとしばらくアクセスしないのか最初しかエラーでなかったので見落とさないように注意
  - 参考
    - [概要と公開URLの形式](https://docs.github.com/ja/pages/getting-started-with-github-pages/what-is-github-pages)
    - [サイト作成(ディレクトリ構成など)](https://docs.github.com/ja/pages/getting-started-with-github-pages/creating-a-github-pages-site)
    - [公開手順](https://docs.github.com/ja/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
