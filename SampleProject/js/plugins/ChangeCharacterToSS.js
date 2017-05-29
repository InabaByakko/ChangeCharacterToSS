//=============================================================================
// ChangeCharacterToSS.js
//=============================================================================

/*:
* @plugindesc Replace actors' or events' graphics to animation made by OPTPiX SpriteStudio.
* @author Inaba Byakko
* 
* @param Suffix(walk)
* @desc An suffix of animation name which means walking motion. Default value is "walk"
* @default walk
*
* @param Suffix(idle)
* @desc An suffix of animation name which means idling motion. Default value is "idle"
* @default idle
* 
* @param UsingDashMotion
* @desc (On/OFF). Default value is "ON"
* @default walk
*
* @param Suffix(dash)
* @desc An suffix of animation name which means dashing motion. Default value is "dash"
* @default dash
*
* @help
* ** INFORMATION **
* This plug-in is depends on other plug-ins "SsPlayerForRPGMV".
* Please download from following URL and install above this plug-in.
* https://github.com/InabaByakko/SSPlayerForRPGMV
* 
* Plug-in commands:
*   (none)
*/

/*:ja
* @plugindesc アクターやイベントのアニメーショングラフィックをSpriteStudioのアニメーションに置きかえるプラグインです。
* @author Inaba Byakko
* 
* @param アニメ名(移動)
* @desc キャラクターの移動中に再生されるアニメーション名の接尾詩。デフォルトは"walk"
* @default walk
*
* @param アニメ名(停止)
* @desc キャラクターの停止中に再生されるアニメーション名の接尾詩。デフォルトは"idle"
* @default idle
*
* @param ダッシュ時にアニメーションを変更する
* @desc キャラクターのダッシュ移動中に再生するアニメーションを変更するか設定(ON/OFF)。デフォルトは"OFF"
* @default OFF
*
* @param アニメ名(ダッシュ)
* @desc オプションが有効の時、キャラクターのダッシュ移動中に再生されるアニメーション名の接尾詩。デフォルトは"dash"
* @default dash
* 
* @help
* ※注意
* 本プラグインの動作には、依存プラグイン「SsPlayerForRPGMV」
* が必要です。下のURLからダウンロードの上、本プラグインより
* 上の位置にインストールしてください。
* https://github.com/InabaByakko/SSPlayerForRPGMV
* 
* 【使い方】
*　素材の準備方法については、同梱された README.md をお読みください。
*
* ・アクターにグラフィック変更を適用する場合
*   データベース「アクター」のメモ欄に、以下のようなタグを挿入してください。
*  ----
*   <SSCharName: 読み込みたいアニメーションJSONファイル名(.jsonは抜く)>
*　　　または
*   <SSキャラ名: 読み込みたいアニメーションJSONファイル名(.jsonは抜く)>
*
*  例： img/animations/ssas/actor1.json を使用したい場合
*   <SSCharName: actor1>
*  ----
*
* ・イベントにグラフィック変更を適用する場合
*   変更を適用したいイベントページの「注釈」コマンドに、上記のタグを挿入
*  して下さい。
*   一番最初に挿入されたタグの内容が適用されます。
* 
* 【移動ルートの設定コマンド中で使うスクリプト】
*   - this.changeSsAnimation('アニメーションファイル名')
*     指定したキャラクターの再生するアニメーションのデータファイルを変更します。
*
*   - this.playSsMotion('モーション名')
*     指定したキャラクターのモーションを一度だけ再生します。
*
*   - this.changeSsIdleMotion('モーション名')
*     指定したキャラクターの停止中モーションを、指定した名前に変更します。
*
*   - this.changeSsWalkMotion('モーション名')
*     指定したキャラクターの歩行モーションを、指定した名前に変更します。
*
*   - this.changeSsDashMotion('モーション名')
*     指定したキャラクターのダッシュモーションを、指定した名前に変更します。
*
*   - this.resetSsIdleMotion()
*     指定したキャラクターの停止中モーションを元に戻します。
*
*   - this.resetSsWalkMotion()
*     指定したキャラクターの移動モーションを元に戻します。
*
*   - this.resetSsDashMotion()
*     指定したキャラクターのダッシュモーションを元に戻します。
*
* 【プラグインコマンド】
*   （なし）
*/
(function () {

  // 依存プラグイン導入チェック
  if (typeof SsSprite !== "function") {
    throw new Error(
      "Dependency plug-in 'SsPlayerForRPGMV' is not installed.");
  };
  // バージョンチェック（高さを取得するメソッドがあるかどうか）
  if (SsSprite.prototype.getHeight === undefined && SsSprite.prototype.getFrameHeight === undefined) {
    throw new Error(
      "'SsPlayerForRPGMV' version 0.4.0 or later will be required.");
  }

  var CCTS = {};

  var animationDir = SSP4MV.animationDir;

  // 接尾語収集
  var parameters = PluginManager.parameters('ChangeCharacterToSS');
  CCTS.Suffixes = {
    'walk': String(parameters["Suffix(walk)"] || parameters["アニメ名(移動)"] || 'walk'),
    'dash': String(parameters["Suffix(dash)"] || parameters["アニメ名(ダッシュ)"] || 'dash'),
    'idle': String(parameters["Suffix(idle)"] || parameters["アニメ名(停止)"] || 'idle')
  };

  CCTS.UsingDashMotion = String(parameters["UsingDashMotion"] || parameters["ダッシュ時にアニメーションを変更する"] || 'OFF').toUpperCase() === 'ON';

  // ノートタグ正規表現
  CCTS.regexpSSCharName = /<(?:SSCharName|SSキャラ名):[ ](.*)>/i

  //-----------------------------------------------------------------------------
  // DataManager
  //----------------------------------------------------
  // データベースロード時の処理
  CCTS.DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
  DataManager.isDatabaseLoaded = function () {
    if (!CCTS.DataManager_isDatabaseLoaded.call(this)) return false;
    if (!CCTS._loaded_Noteags) {
      this.processCCTSNotetags($dataActors);
      CCTS._loaded_Noteags = true;
    }
    return true;
  };
  //----------------------------------------------------
  // アクターのノートタグ処理
  DataManager.processCCTSNotetags = function (group) {
    for (var n = 1; n < group.length; n++) {
      var obj = group[n];
      var notedata = obj.note.split(/[\r\n]+/);

      for (var i = 0; i < notedata.length; i++) {
        var line = notedata[i];
        if (line.match(CCTS.regexpSSCharName)) {
          obj.ssCharName = String(RegExp.$1).replace(/\.json$/i, '');
        }
      }
    }
  };

  //-----------------------------------------------------------------------------
  // Game_Actor
  //----------------------------------------------------
  // DBにSSキャラが指定されていれば返す
  Game_Actor.prototype.ssCharName = function () {
    return this.actor().ssCharName ? this.actor().ssCharName : '';
  };

  //-----------------------------------------------------------------------------
  // Game_CharacterBase
  //----------------------------------------------------
  // メンバ初期化
  CCTS.Game_CharacterBase_initMembers = Game_CharacterBase.prototype.initMembers;
  Game_CharacterBase.prototype.initMembers = function() {
    CCTS.Game_CharacterBase_initMembers.call(this);
    this.ssCharName = '';
    this.requestedSsMotion = '';
    this._overridedIdleMotion = '';
    this._overridedWalkMotion = '';
    this._overridedDashMotion = '';
  };
  //----------------------------------------------------
  // SSアニメーションファイルを変更（移動ルート設定中に使う）
  Game_CharacterBase.prototype.changeSsAnimation = function(fileName) {
    this.ssCharName = fileName.replace(/\.json$/i, '');
  };
  //----------------------------------------------------
  // SSアニメーションのモーション（ページ）を１度だけ再生（移動ルート設定中に使う）
  Game_CharacterBase.prototype.playSsMotion = function(pageName) {
    if (this.ssCharName === '') {
      this.requestedSsMotion = '';
      return;
    }
    this.requestedSsMotion = pageName;
  };
  //----------------------------------------------------
  // SSアニメーションの停止中モーション名を変更（移動ルート設定中に使う）
  Game_CharacterBase.prototype.changeSsIdleMotion = function(pageName) {
    if (this.ssCharName === '') {
      return;
    }
    this._overridedIdleMotion = pageName;
  };
  //----------------------------------------------------
  // SSアニメーションの移動中モーション名を変更（移動ルート設定中に使う）
  Game_CharacterBase.prototype.changeSsWalkMotion = function(pageName) {
    if (this.ssCharName === '') {
      return;
    }
    this._overridedWalkMotion = pageName;
  };
  //----------------------------------------------------
  // SSアニメーションのダッシュ中モーション名を変更（移動ルート設定中に使う）
  Game_CharacterBase.prototype.changeSsDashMotion = function(pageName) {
    if (this.ssCharName === '') {
      return;
    }
    this._overridedDashMotion = pageName;
  };
  //----------------------------------------------------
  // SSアニメーションの停止中モーション名を元に戻す（移動ルート設定中に使う）
  Game_CharacterBase.prototype.resetSsIdleMotion = function() {
    this._overridedIdleMotion = '';
  };
  //----------------------------------------------------
  // SSアニメーションの移動中モーション名を変更（移動ルート設定中に使う）
  Game_CharacterBase.prototype.resetSsWalkMotion = function() {
    this._overridedWalkMotion = '';
  };
  //----------------------------------------------------
  // SSアニメーションのダッシュ中モーション名を変更（移動ルート設定中に使う）
  Game_CharacterBase.prototype.resetSsDashMotion = function() {
    this._overridedDashMotion = '';
  };
  //----------------------------------------------------
  // 停止中モーション名を取得
  Game_CharacterBase.prototype.getSsIdleMotion = function() {
    return (this._overridedIdleMotion === '' ? CCTS.Suffixes.idle : this._overridedIdleMotion);
  };
  //----------------------------------------------------
  // 移動中モーション名を取得
  Game_CharacterBase.prototype.getSsWalkMotion = function() {
    return (this._overridedWalkMotion === '' ? CCTS.Suffixes.walk : this._overridedWalkMotion);
  };
  //----------------------------------------------------
  // ダッシュ中モーション名を取得
  Game_CharacterBase.prototype.getSsDashMotion = function() {
    return (this._overridedDashMotion === '' ? CCTS.Suffixes.dash : this._overridedDashMotion);
  };

  //-----------------------------------------------------------------------------
  // Game_Event
  //----------------------------------------------------
  // イベントを読み込んだとき、ページが変わったときに処理
  CCTS.Game_Event_refresh = Game_Event.prototype.refresh;
  Game_Event.prototype.refresh = function () {
    var newPageIndex = this._erased ? -1 : this.findProperPageIndex();
    if (this._pageIndex !== newPageIndex) {
      CCTS.Game_Event_refresh.call(this);
      this.refreshSSChar();
    }
  };
  //----------------------------------------------------
  // イベントリストの注釈からノートタグを拾ってアニメ名設定
  Game_Event.prototype.refreshSSChar = function () {
    if (this.page() && this.list()) {
      var isSet = this.list().some(function (command) {
        if (command.code === 108 || command.code === 408) {
          return command.parameters.some(function (line) {
            if (line.match(CCTS.regexpSSCharName)) {
              this.ssCharName = String(RegExp.$1).replace(/\.json$/i, '');
              return true;
            }
            return false;
          }, this);
        }
        return false;
      }, this);
      if (isSet === false)
        this.ssCharName = '';
    } else {
      this.ssCharName = '';
    }
  };

  //-----------------------------------------------------------------------------
  // Game_Player
  //----------------------------------------------------
  // 先頭アクターのSSアニメーションセット
  CCTS.Game_Player_refresh = Game_Player.prototype.refresh;
  Game_Player.prototype.refresh = function () {
    CCTS.Game_Player_refresh.call(this);
    var actor = $gameParty.leader();
    this.ssCharName = actor ? actor.ssCharName() : '';
  };

  //-----------------------------------------------------------------------------
  // Game_Follower
  //----------------------------------------------------
  // 後続メンバーのSSアニメーションセット
  CCTS.Game_Follower_refresh = Game_Follower.prototype.refresh;
  Game_Follower.prototype.refresh = function () {
    CCTS.Game_Follower_refresh.call(this);
    this.ssCharName = (this.actor() ? this.actor().ssCharName() : '');
  };

  //-----------------------------------------------------------------------------
  // Sprite_Character
  //----------------------------------------------------
  // オブジェクト初期化
  CCTS.Sprite_Character_initMembers = Sprite_Character.prototype.initMembers;
  Sprite_Character.prototype.initMembers = function () {
    CCTS.Sprite_Character_initMembers.call(this);
    this._playingSsAnimation = null;
    this._ssSprite = new SsSprite(null, 0);
    this.addChild(this._ssSprite);
    this._playNextSsAnimationOnce = false;
  };
  //----------------------------------------------------
  // JSONファイルを読み出してセット
  Sprite_Character.prototype.loadSsAnimationSet = function (charName) {
    var xhr = new XMLHttpRequest();
    var url = animationDir + charName + ".json";
    xhr.open('GET', url);
    xhr.overrideMimeType('application/json');
    xhr.onload = function () {
      if (xhr.status < 400) {
        this._ssaData = JSON.parse(xhr.responseText);
        this._ssMotionsReady = true;
      }
    }.bind(this);
    xhr.send();
  };
  //----------------------------------------------------
  // セット済みデータからアニメページ名を後方一致で探す
  Sprite_Character.prototype.getAnimationData = function (name) {
    var animData = null;
    var dirName = '';
    switch (this._character.direction()) {
      case 2:
        dirName = '_down'; break;
      case 4:
        dirName = '_left'; break;
      case 6:
        dirName = '_right'; break;
      case 8:
        dirName = '_up'; break;
    }
    this._ssaData.some(function (data) {
      // 現在方向のサフィックスが付いたアニメーションがある場合は優先マッチング
      if ((new RegExp("_" + name + dirName + "$", "i")).test(data.name)) {
        animData = data;
        return true;
      }
      if ((new RegExp("_" + name + "$", "i")).test(data.name)) {
        animData = data;
        return true;        
      }
      return false;      
    });
    return animData;
  };
  //----------------------------------------------------
  // SSSpriteにアニメーションをセット
  Sprite_Character.prototype.setSsSprite = function (ssaData) {
    var imageList = new SsImageList(ssaData.images, animationDir,
      true);
    var animation = new SsAnimation(ssaData.animation, imageList);
    this._ssSprite.setAnimation(animation);
  };
  //----------------------------------------------------
  // アニメ名変更を検知
  CCTS.Sprite_Character_updateBitmap = Sprite_Character.prototype.updateBitmap;
  Sprite_Character.prototype.updateBitmap = function () {
    CCTS.Sprite_Character_updateBitmap.call(this);
    if (this._ssCharName !== this._character.ssCharName) {
      this._ssCharName = this._character.ssCharName;
      this.setCharacterSsData();
    }
    // ssSpriteにblendColor等の情報を継承
    if (this._ssSprite && this._ssCharName !== '') {
        this._ssSprite.setColorTone(this.getColorTone());
        this._ssSprite.setBlendColor(this.getBlendColor());
        this._ssSprite.blendMode = this.blendMode;
    }
  };
  //----------------------------------------------------
  // SSアニメがある場合はアニメーションデータをロード
  Sprite_Character.prototype.setCharacterSsData = function () {
    if (!this._ssCharName) {
      return;
    }
    this._ssMotionsReady = false;
    this.loadSsAnimationSet(this._ssCharName);
  };
  //----------------------------------------------------
  // アニメーションパターンを更新
  CCTS.Sprite_Character_updateCharacterFrame = Sprite_Character.prototype.updateCharacterFrame;
  Sprite_Character.prototype.updateCharacterFrame = function () {
    if (!this._ssSprite || !this._ssCharName || !this._ssMotionsReady) {
      if (this._ssSprite) this._ssSprite.setAnimation(null);
      return CCTS.Sprite_Character_updateCharacterFrame.call(this);
    }
    var ssaData = this.getAnimationData(this.getMotionName());
    if (ssaData && this._playingSsAnimation != ssaData) {
      this.setSsSprite(ssaData);
      if (this._playNextSsAnimationOnce) {
        this._playNextSsAnimationOnce = false;
        this._ssSprite.setLoop(1);
        this._ssSprite.setEndCallBack(function(){
          this._character.requestedSsMotion = '';
          this.updateCharacterFrame();
        }.bind(this));
      }else{
        this._ssSprite.setLoop(0);
        this._ssSprite.setEndCallBack(null);
      }
      this._playingSsAnimation = ssaData;
    }
    this.setFrame(0, 0, 0, this.patternHeight());
    if (this._upperBody) this._upperBody.visible = false;
    if (this._lowerBody) this._lowerBody.visible = false;
  };
  //----------------------------------------------------
  // キャラクターの状態に応じ有効なアニメ名を返す
  Sprite_Character.prototype.getMotionName = function () {
    if (this._character.requestedSsMotion) {
      var motion = this._character.requestedSsMotion;
      this._playNextSsAnimationOnce = true;
    } else {
      var motion = (this._character.checkStop(1) ? this._character.getSsIdleMotion() : 
      (CCTS.UsingDashMotion && this._character.isDashing() ? this._character.getSsDashMotion() : this._character.getSsWalkMotion()));
    }
    return motion;
  };
  //----------------------------------------------------
  // SSアニメが有効のとき幅と高さをSSアニメ基準で返す
  CCTS.Sprite_Character_patternWidth = Sprite_Character.prototype.patternWidth;
  Sprite_Character.prototype.patternWidth = function () {
    if (this._ssSprite.getAnimation() !== null) {
      if (SsSprite.prototype.getWidth !== undefined) return this._ssSprite.getWidth();
      return this._ssSprite.getFrameWidth();
    }
    return CCTS.Sprite_Character_patternWidth.call(this);
  };
  CCTS.Sprite_Character_patternHeight = Sprite_Character.prototype.patternHeight;
  Sprite_Character.prototype.patternHeight = function () {
    if (this._ssSprite.getAnimation() !== null) {
      if (SsSprite.prototype.getHeight !== undefined) return this._ssSprite.getHeight();
      return this._ssSprite.getFrameHeight();
    }
    return CCTS.Sprite_Character_patternHeight.call(this);
  };

})();
