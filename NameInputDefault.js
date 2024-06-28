/*=============================================================================
 NameInputDefault.js
----------------------------------------------------------------------------
 (C)2024 Triacontane
 This software is released under the MIT License.
 http://opensource.org/licenses/mit-license.php
----------------------------------------------------------------------------
 Version
 1.3.0 2024/06/29 名前入力NGプラグインで指定したNG文字列を候補から除外する機能を追加
 1.2.0 2024/03/24 デフォルト名の候補アクターをタグで指定できる機能を追加
 1.1.0 2024/03/19 初期値を適用するボタンを選択できる機能を追加
 1.0.0 2024/02/27 初版
----------------------------------------------------------------------------
 [Blog]   : https://triacontane.blogspot.jp/
 [Twitter]: https://twitter.com/triacontane/
 [GitHub] : https://github.com/triacontane/
=============================================================================*/

/*:
 * @plugindesc 名前入力のデフォルト名設定プラグイン
 * @target MZ
 * @url https://github.com/triacontane/RPGMakerMV/tree/mz_master/NameInputDefault.js
 * @base PluginCommonBase
 * @orderAfter PluginCommonBase
 * @author トリアコンタン
 *
 * @param nameList
 * @text 名前リスト
 * @desc 名前のデフォルト候補リストです。
 * @default []
 * @type struct<Name>[]
 *
 * @param defaultEmpty
 * @text 初期値を空にする
 * @desc 名前入力画面の初期値をアクター名に拘わらず空欄にします。
 * @default false
 * @type boolean
 *
 * @param defaultButton
 * @text 初期値適用ボタン
 * @desc 指定したボタンを押下するとデフォルト名称が適用されます。
 * @default
 * @type select
 * @option
 * @option shift
 * @option control
 * @option tab
 *
 * @param ngFilter
 * @text NGフィルター
 * @desc 別途公開している『名前入力NGプラグイン』で指定されたNG文字列を候補から除外します。
 * @default false
 * @type boolean
 *
 * @help NameInputDefault.js
 *
 * 名前入力画面でアクターのデフォルト名を設定できます。
 * 名称を空欄のまま決定しようとすると、デフォルト名が適用されます。
 * 複数の候補の中からランダムで選出することも可能です。
 *　
 * このプラグインの利用にはベースプラグイン『PluginCommonBase.js』が必要です。
 * 『PluginCommonBase.js』は、RPGツクールMZのインストールフォルダ配下の
 * 以下のフォルダに格納されています。
 * dlc/BasicResources/plugins/official
 *
 * 利用規約：
 *  作者に無断で改変、再配布が可能で、利用形態（商用、18禁利用等）
 *  についても制限はありません。
 *  このプラグインはもうあなたのものです。
 */

/*~struct~Name:
 *
 * @param actorId
 * @text アクターID
 * @desc 名前を設定するアクターのIDです。0を指定した場合、全てのアクターで候補になります。
 * @default 0
 * @type actor
 *
 * @param actorTag
 * @text アクタータグ
 * @desc 名前を設定するアクターのメモタグです。aaaと指定するとメモ欄に<aaa>と記載されたアクターが候補になります。
 * @default
 *
 * @param name
 * @text 名称
 * @desc アクターのデフォルト名称です。
 * @default
 *
 */

(() => {
    'use strict';
    const script = document.currentScript;
    const param = PluginManagerEx.createParameter(script);

    const _Window_NameEdit_setup = Window_NameEdit.prototype.setup;
    Window_NameEdit.prototype.setup = function(actor, maxLength) {
        _Window_NameEdit_setup.apply(this, arguments);
        if (param.defaultEmpty) {
            this._name = '';
            this._index = 0;
        }
    };

    const _Window_NameEdit_restoreDefault = Window_NameEdit.prototype.restoreDefault;
    Window_NameEdit.prototype.restoreDefault = function() {
        const names = param.nameList.filter(data => this.isDefaultNameTargetActor(data));
        if (names.length > 0) {
            this._defaultName = names[Math.randomInt(names.length)].name;
        }
        return _Window_NameEdit_restoreDefault.apply(this, arguments);
    };

    Window_NameEdit.prototype.isDefaultNameTargetActor = function(data) {
        if (!data.actorId && !data.actorTag) {
            return true;
        }
        if (param.ngFilter && this.isNgName && this.isNgName(data.name)) {
            return false;
        }
        return data.actorId === this._actor.actorId() ||
            PluginManagerEx.findMetaValue(this._actor.actor(), data.actorTag);
    };

    const _Window_NameInput_processHandling = Window_NameInput.prototype.processHandling;
    Window_NameInput.prototype.processHandling = function() {
        _Window_NameInput_processHandling.apply(this, arguments);
        if (param.defaultButton && Input.isTriggered(param.defaultButton)) {
            this._editWindow.restoreDefault();
            this.processJump();
            this.playCursorSound();
        }
    };
})();
