# ChangeCharacterToSS

アクターやイベントのアニメーショングラフィックをSpriteStudioのアニメーションに置きかえる  

ざっくり不親切ドキュメント（後でちゃんと書く）

## サンプル

https://inababyakko.github.io/ChangeCharacterToSS/SampleProject/index.html

## ざっくり使い方

### データ作成

以下の8種類の名前が付いたアニメーションを作成し、JSONに変換して所定の場所へ配置

- 歩行時に再生されるアニメーション4方向
  - walk_down
  - walk_left
  - walk_right
  - walk_up
- 停止時に再生されるアニメーション4方向
  - idle_down
  - idle_left
  - idle_right
  - idle_up

以上のアニメーション名は後方一致で参照されます。ssaeファイルなどには好きな名前を付けていただいてもかまいません。

### データベース設定

設定したいアクターのメモ欄、またはイベントページの「注釈」コマンド中に、以下のようなタグを入れる

<SSCharName: 読み込みたいアニメーションJSONファイル名(.jsonは抜く)>  
　　　または  
<SSキャラ名: 読み込みたいアニメーションJSONファイル名(.jsonは抜く)>

### 確認

これででるはず

## あとでやる

- 上下移動時にモーションを変えない
