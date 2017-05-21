(function () {

  // 依存プラグイン導入チェック
  if (typeof SsSprite !== "function") {
    throw new Error(
      "Dependency plug-in 'SsPlayerForRPGMV' is not installed.");
  }

  var CCTS = {};

  var animationDir = SSP4MV.animationDir;

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
  // アクター・イベントのノートタグ処理
  DataManager.processCCTSNotetags = function (group) {
    for (var n = 1; n < group.length; n++) {
      var obj = group[n];
      var notedata = obj.note.split(/[\r\n]+/);

      for (var i = 0; i < notedata.length; i++) {
        var line = notedata[i];
        if (line.match(/<(?:SSCharName):[ ](.*)>/i) || line.match(/<(?:SSキャラ名):[ ](.*)>/i)) {
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
  // Game_Player
  //----------------------------------------------------
  // 戦闘アクターのSSアニメーションセット
  CCTS.Game_Player_refresh = Game_Player.prototype.refresh;
  Game_Player.prototype.refresh = function () {
    CCTS.Game_Player_refresh.call(this);
    var actor = $gameParty.leader();
    this.ssCharName = actor ? actor.ssCharName() : '';
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
  }
  //----------------------------------------------------
  // アニメ名変更を検知
  CCTS.Sprite_Character_updateBitmap = Sprite_Character.prototype.updateBitmap;
  Sprite_Character.prototype.updateBitmap = function () {
    if (this.isImageChanged()) {
      this._ssCharName = this._character.ssCharName;
      CCTS.Sprite_Character_updateBitmap.call(this);
    }
  };
  //----------------------------------------------------
  // アニメ名が変更されたか
  CCTS.Sprite_Character_isImageChanged = Sprite_Character.prototype.isImageChanged;
  Sprite_Character.prototype.isImageChanged = function () {
    return (CCTS.Sprite_Character_isImageChanged.call(this) ||
      this._ssCharName !== this._character.ssCharName);
  };
  //----------------------------------------------------
  // SSアニメがある場合はビットマップを無効化しSSアニメをセット
  CCTS.Sprite_Character_setCharacterBitmap = Sprite_Character.prototype.setCharacterBitmap;
  Sprite_Character.prototype.setCharacterBitmap = function () {
    if (!this._ssCharName) {
      return CCTS.Sprite_Character_setCharacterBitmap.call(this);
    }
    this._ssMotionsReady = false;
    this.loadSsAnimationSet(this._ssCharName);
  };
  //----------------------------------------------------
  // アニメーションパターンを更新
  CCTS.Sprite_Character_updateCharacterFrame = Sprite_Character.prototype.updateCharacterFrame;
  Sprite_Character.prototype.updateCharacterFrame = function () {
    if (!this._ssCharName) {
      return CCTS.Sprite_Character_updateCharacterFrame.call(this);
    }
    if (this._ssMotionsReady) {
      var ssaData = this.getAnimationData(this.getMotionName());
      if (ssaData && this._playingSsAnimation != ssaData) {
        this.setSsSprite(ssaData);
        this._ssSprite.setLoop(0);
        this._playingSsAnimation = ssaData;
      }
    }
  };
  //----------------------------------------------------
  // キャラクターの状態に応じ有効なアニメ名を返す
  Sprite_Character.prototype.getMotionName = function () {
    var motion = (this._character.checkStop(0) ? 'idle_' : 'walk_');
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
  }

})();