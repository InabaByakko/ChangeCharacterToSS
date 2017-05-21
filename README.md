# ChangeCharacterToSS

アクターやイベントのアニメーショングラフィックをSpriteStudioのアニメーションに置きかえる  
(今は先頭アクターのみ)

ざっくり不親切ドキュメント（後でちゃんと書く）

## サンプル

https://InabaByakko.github.io/ChangeCharacterToSS/SampleProject/index.html

## ざっくり使い方

### データ作成

以下の8種類の名前が付いたアニメーションを作成し、JSONに変換して所定の場所へ配置

- walk_down
- walk_left
- walk_right
- walk_up
- idle_down
- idle_left
- idle_right
- idle_up

### データベース設定

設定したいアクターのメモ欄に、以下のようなタグを入れる

<SSCharName: ↑で配置したファイル名から.jsonを抜いたもの>

### 確認

これででるはず

## あとでやる

- ダッシュ時にモーションを変える
- 上下移動時にモーションを変えない
- 移動ルートの設定コマンドで再生するアニメーションファイルを変更する
- 移動ルートの設定コマンドで任意のモーションを一度だけ再生する