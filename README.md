# ChangeCharacterToSS

アクターやイベントのアニメーショングラフィックをSpriteStudioのアニメーションに置きかえるプラグインです。  

\*\* [English document is under construction.](#) \*\*

### 注意
本プラグインの動作には、依存プラグイン「SsPlayerForRPGMV」が必要です。下のURLからダウンロードの上、
本プラグインより上の位置にインストールしてください。  
https://github.com/InabaByakko/SSPlayerForRPGMV

このソフトウェアは、MITライセンスのもとで公開されています。詳しくは LICENSE.md をお読み下さい。  

## デモ

https://inababyakko.github.io/ChangeCharacterToSS/SampleProject/index.html

SampleProject フォルダに上記デモのプロジェクトデータが格納されています。

## 動作環境

* SsPlayerForRPGMV ver 0.4.0以降
    * https://github.com/InabaByakko/SSPlayerForRPGMV
    * 0.1.7 以降 (0.2.2, 0.3.0除く) でも利用できますが、最新版での利用をおすすめします。
* Ss5ConverterToSSAJSON ver 1.0.2以降
    * https://github.com/SpriteStudio/Ss5ConverterToSSAJSON

## 使い方

### プロジェクトへの組込み

1. 右部の「Download ZIP」をクリックし、最新版のZIPアーカイブをダウンロードします。   
  
1. ダウンロードしたZIPファイルを解凍して出てきた ChangeCharacterToSS.js を、組み込みたいゲームプロジェクトのjs/pluginsフォルダへ入れます。  

1. ツクールエディタの「プラグイン管理」より「ChangeCharacterToSS」を追加します。  


### データ作成

1. SpriteStudioのエディタにて、以下の名前を末尾に含むモーションを作成してください。  
    - idle (キャラクターが停止しているときのモーション)
    - walk (キャラクターが移動しているときのモーション)
    - dash (キャラクターがダッシュしているときのモーション：プラグインパラメータで使用しないよう変更できます)
        - ssaeファイル名は任意のもので構いません。また、モーションによってssaeファイルが異なるものになっても問題ありません。
        - モーション名はプラグインパラメータで変更することができます。
1. キャラクターの向きに応じてモーションを変更したい場合は、向かせる方向分のモーションをさらに作成し、モーション名の末尾に _left / _right / _up / _down を付加してください。  
    - 例) 右向きの歩行モーションの場合、 walk_right という名前でモーションを作成
1. 他に使用したいモーションがある場合は、任意の名前で作成します。
    - こちらもキャラクターの方向に対応するモーション名をつけることで、異なるモーションを再生できます。
1. Ss5ConverterToSSAJSON を用いてJSONファイルに出力してください。  
    - 「1モーションを1ファイルで出力する」にはチェックを**入れないでください**。
1. SsPlayerForRPGMV で指定された所定のフォルダに、出力したJSONファイルとパーツ画像ファイルを格納してください。

アニメーションのサンプルプロジェクトを SampleAnimation フォルダに格納しています。参考にどうぞ。  
（このデータはSpriteStudio公式サンプルデータ「基本的なアニメーションのサンプル」を利用し、一部改変を加えたものです。利用条件などは、SampleAnimationフォルダ中のreadme.txtをお読みください。）

### データベース設定

設定したいアクターのメモ欄、またはイベントページの「注釈」コマンド中に、以下のようなタグを入れる

<SSCharName: 読み込みたいアニメーションJSONファイル名(.jsonは抜く)>  
　　　または  
<SSキャラ名: 読み込みたいアニメーションJSONファイル名(.jsonは抜く)>

### 途中でアニメーションやモーションを変更したい場合

イベントコマンド「移動ルートの変更」中にて特定のスクリプトを実行することで、プレイヤーまたは指定したイベントのアニメーションやモーションを変更することができます。  
詳しくは、プラグインヘルプをご覧ください。

([ツール]->[プラグイン管理]からChangeCharacterToSSを選択し[ヘルプ]、またはスクリプト入力ダイアログで右クリック->[プラグインヘルプ]->ChangeCharacterToSSを選択)

## 動作確認済みのサードパーティプラグイン
本プラグインは、以下のキャラクターまわりの処理に影響を与えるサードパーティプラグインを導入した際の動作検証を行っておりますが、
その他のプラグインとの競合が発生する場合があります。あらかじめご容赦ください。

* アナログムーブ
    - http://rev2nym.blog.fc2.com/blog-entry-5.html
* 半歩移動プラグイン
    - https://triacontane.blogspot.jp/2016/05/blog-post.html

動作確認が取れ次第、順次追加されます。
    
## バグを見つけた場合
 
ご迷惑をお掛けしております。もし問題のある動作を発見された場合は、[GithubのIssue](https://github.com/InabaByakko/ChangeCharacterToSS/issues)でトピックを立ててご報告いただくか、[Twitter@InabaByakko](https://twitter.com/InabaByakko)までご連絡をお願い致します。

Githubのご利用に慣れていらっしゃる方は、直接のPull Requestも歓迎しております。

---

- SpriteStudio, Web Technologyは、株式会社ウェブテクノロジの登録商標です。
- RPGツクールは、株式会社KADOKAWAの登録商標です。
- その他の商品名は各社の登録商標または商標です。
