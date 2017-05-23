# ChangeCharacterToSS

アクターやイベントのアニメーショングラフィックをSpriteStudioのアニメーションに置きかえる  
(今は先頭アクターのみ)

ざっくり不親切ドキュメント（後でちゃんと書く）

## サンプル

https://inababyakko.github.io/ChangeCharacterToSS/SampleProject/index.html

## ざっくり使い方

### データ作成

以下の8種類の名前が付いたアニメーションを作成し、JSONに変換して所定の場所へ配置

*　歩行時に再生されるアニメーション4方向
  - walk_down
  - walk_left
  - walk_right
  - walk_up
* 停止時に再生されるアニメーション4方向
  - idle_down
  - idle_left
  - idle_right
  - idle_up

### データベース設定

設定したいアクターのメモ欄、またはイベントページの「注釈」コマンド中に、以下のようなタグを入れる

<SSCharName: 読み込みたいアニメーションJSONファイル名(.jsonは抜く)>
　　　または
<SSキャラ名: 読み込みたいアニメーションJSONファイル名(.jsonは抜く)>

### 確認

これででるはず

## あとでやる

- ダッシュ時にモーションを変える
- 上下移動時にモーションを変えない
- 移動ルートの設定コマンドで再生するアニメーションファイルを変更する
- 移動ルートの設定コマンドで任意のモーションを一度だけ再生する
