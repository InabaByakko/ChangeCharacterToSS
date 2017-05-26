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
* @plugindesc サイドビュー戦闘時の敵キャラアニメーションをSpriteStudioアニメーションに差し替えるプラグインです。
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
* 【プラグインコマンド】
*   （なし）
*/
(function () {

  // 依存プラグイン導入チェック
  if (typeof SsSprite !== "function") {
    throw new Error(
      "Dependency plug-in 'SsPlayerForRPGMV' is not installed.");
  };

  var CCTS = {};

  var animationDir = SSP4MV.animationDir;

  // 接尾語収集
  var parameters = PluginManager.parameters('ChangeCharacterToSS');
  CCTS.Suffixes = {
    'walk': String(parameters["Suffix(walk)"] || parameters["アニメ名(移動)"] || 'walk'),
    'idle': String(parameters["Suffix(idle)"] || parameters["アニメ名(停止)"] || 'idle')
  };

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
          obj.ssCharName = String(RegExp.$1);
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
              this.ssCharName = String(RegExp.$1);
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
    this._ssaData.some(function (data) {
      if ((new RegExp("_" + name + "$", "i")).test(data.name)) {
        animData = data;
      }
    }, this);
    return animData;
  };
  //----------------------------------------------------
  // SSSpriteにアニメーションをセット
  Sprite_Character.prototype.setSsSprite = function (ssaData) {
    var imageList = new SsImageList(ssaData.images, animationDir,
      true);
    var animation = new SsAnimation(ssaData.animation, imageList);
    this._ssSprite.setAnimation(animation);
    // 通常のBitmapを無効化
    //this.bitmap = new Bitmap(this._ssSprite.getWidth(), this._ssSprite.getHeight());
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
    if (!this._ssCharName || !this._ssMotionsReady) {
      this._ssSprite.setAnimation(null);
      return CCTS.Sprite_Character_updateCharacterFrame.call(this);
    }
    var ssaData = this.getAnimationData(this.getMotionName());
    if (ssaData && this._playingSsAnimation != ssaData) {
      this.setSsSprite(ssaData);
      this._ssSprite.setLoop(0);
      this._playingSsAnimation = ssaData;
    }
    this.setFrame(0, 0, 0, this._ssSprite.getHeight());
    if (this._upperBody) this._upperBody.visible = false;
    if (this._lowerBody) this._lowerBody.visible = false;
  };
  //----------------------------------------------------
  // キャラクターの状態に応じ有効なアニメ名を返す
  Sprite_Character.prototype.getMotionName = function () {
    var motion = (this._character.checkStop(0) ? CCTS.Suffixes.idle : CCTS.Suffixes.walk) + '_';
    switch (this._character.direction()) {
      case 2:
        return motion + 'down';
      case 4:
        return motion + 'left';
      case 6:
        return motion + 'right';
      case 8:
        return motion + 'up';
    }
    return 'walk_left';
  };
  //----------------------------------------------------
  // SSアニメが有効のとき幅と高さをSSアニメ基準で返す
  CCTS.Sprite_Character_patternWidth = Sprite_Character.prototype.patternWidth;
  Sprite_Character.prototype.patternWidth = function () {
    if (this._ssSprite.getAnimation() !== null) {
      return this._ssSprite.getWidth();
    }
    return CCTS.Sprite_Character_patternWidth.call(this);
  };
  CCTS.Sprite_Character_patternHeight = Sprite_Character.prototype.patternHeight;
  Sprite_Character.prototype.patternHeight = function () {
    if (this._ssSprite.getAnimation() !== null) {
      return this._ssSprite.getHeight();
    }
    return CCTS.Sprite_Character_patternHeight.call(this);
  };

})();