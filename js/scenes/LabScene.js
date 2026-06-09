import Player from '../classes/Player.js';

const ATAS_MASTER = {
    timings: { 't_hp50': '体力が半分以下の時', 't_heavy': 'ヘビー発射時', 't_jump': 'ジャンプ時' },
    attributes: { 'a_heal': '回復（修復コード）', 'a_fire': '炎（継続ダメージ）', 'a_gravity': '重力（行動遅延）' },
    actions: { 'ac_spin': 'その場で回転して発動', 'ac_bullet': '属性弾に変更し発射', 'ac_shield': '属性に応じたシールドを展開' }
};

export default class LabScene extends Phaser.Scene {
    constructor() { super('LabScene'); }

    create() {
        if(window.SM) window.SM.stopBGM();

        this.add.image(400, 225, 'lab_bg');
        this.platforms = this.physics.add.staticGroup();
        this.platforms.create(400, 425, 'ground');
        this.add.text(20, 20, '【 物理工房 - ラボ - 】', { fontSize: '20px', fill: '#00ffff' });

        this.initATASData();

        this.equipDisplay = this.add.text(400, 60, "", { fontSize: '14px', fill: '#aaa', align: 'center' }).setOrigin(0.5);
        this.updateEquipDisplay();

        this.facilities = this.physics.add.staticGroup();
        let monitor = this.facilities.create(100, 350, 'obj_monitor'); monitor.facilityType = 'stage';
        let boots = this.facilities.create(250, 375, 'obj_boots'); boots.facilityType = 'boots';
        let handgun = this.facilities.create(400, 385, 'obj_handgun'); handgun.facilityType = 'handgun';
        let bike = this.facilities.create(550, 375, 'obj_bike_disp'); bike.facilityType = 'bike';
        let server = this.facilities.create(720, 340, 'obj_server'); server.facilityType = 'save';
        let navBit = this.facilities.create(750, 200, 'obj_nav'); navBit.facilityType = 'nav';
        
        this.player = new Player(this, 400, 350);
        this.player.inLab = true;
        this.physics.add.collider(this.player, this.platforms);

        this.promptText = this.add.text(400, 150, 'Shotボタンでアクセス', { fontSize: '18px', fill: '#ffff00', fontStyle: 'bold' }).setOrigin(0.5);
        this.promptText.setVisible(false);
        this.currentTarget = null;
        this.activeMenu = null;

        this.events.on('interact', this.handleInteract, this);
    }

    initATASData() {
        if (!this.registry.get('eq_timing')) {
            this.registry.set('eq_timing', 't_hp50');
            this.registry.set('eq_attribute', 'a_heal');
            this.registry.set('eq_action', 'ac_spin');
            this.registry.set('inv_timings', ['t_hp50', 't_heavy', 't_jump']);
            this.registry.set('inv_attributes', ['a_heal', 'a_fire', 'a_gravity']);
            this.registry.set('inv_actions', ['ac_spin', 'ac_bullet', 'ac_shield']);
        }
    }

    updateEquipDisplay() {
        let t = ATAS_MASTER.timings[this.registry.get('eq_timing')];
        let a = ATAS_MASTER.attributes[this.registry.get('eq_attribute')];
        let ac = ATAS_MASTER.actions[this.registry.get('eq_action')];
        this.equipDisplay.setText(`現在のATAS構成：\n【${t}】＋【${a}】＋【${ac}】`);
    }

    update(time) {
        if (!this.player.isLocked) {
            this.player.update(time);
            let isOverlapping = false;
            this.facilities.getChildren().forEach(fac => {
                if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), fac.getBounds())) {
                    this.currentTarget = fac.facilityType;
                    this.promptText.setPosition(fac.x, fac.y - 80);
                    this.promptText.setVisible(true);
                    isOverlapping = true;
                }
            });
            if (!isOverlapping) { this.currentTarget = null; this.promptText.setVisible(false); }
        }
    }

    handleInteract() {
        if (this.player.isLocked || !this.currentTarget) return;
        this.player.isLocked = true;
        this.promptText.setVisible(false);

        switch(this.currentTarget) {
            case 'stage': this.openStageMenu(); break;
            case 'save':  this.openSaveMenu(); break;
            case 'nav':   this.openNavMenu(); break;
            case 'boots': this.openCustomizeMenu('ブーツ', 'eq_timing', 'inv_timings', ATAS_MASTER.timings); break;
            case 'handgun': this.openCustomizeMenu('ハンドガン', 'eq_attribute', 'inv_attributes', ATAS_MASTER.attributes); break;
            case 'bike':  this.openCustomizeMenu('バイク', 'eq_action', 'inv_actions', ATAS_MASTER.actions); break;
        }
    }

    createMenuBase(title) {
        this.activeMenu = this.add.group();
        let bg = this.add.rectangle(400, 225, 650, 350, 0x000000, 0.9).setStrokeStyle(2, 0x00ffff);
        let titleText = this.add.text(400, 80, title, { fontSize: '24px', fill: '#00ffff' }).setOrigin(0.5);
        this.activeMenu.add(bg); this.activeMenu.add(titleText);
        
        this.createMenuButton(400, 370, "閉じる (CLOSE)", () => {
            this.activeMenu.destroy(true);
            this.updateEquipDisplay();
            this.player.isLocked = false;
            this.time.delayedCall(100, () => { this.currentTarget = null; });
        }, 0x555555);
    }

    createMenuButton(x, y, text, callback, color = 0x336699) {
        let btnBg = this.add.rectangle(x, y, 500, 40, color).setInteractive();
        let btnText = this.add.text(x, y, text, { fontSize: '16px', fill: '#fff' }).setOrigin(0.5);
        btnBg.on('pointerdown', () => {
            btnBg.setFillStyle(0x6699cc);
            this.time.delayedCall(100, () => callback());
        });
        this.activeMenu.add(btnBg); this.activeMenu.add(btnText);
    }

    openCustomizeMenu(partName, eqKey, invKey, masterData) {
        this.createMenuBase(`【 ${partName} ロジックの組み替え 】`);
        let currentEquipId = this.registry.get(eqKey);
        let inventory = this.registry.get(invKey) || [];

        let startY = 140;
        inventory.forEach((itemId, index) => {
            let itemName = masterData[itemId];
            let isEquipped = (itemId === currentEquipId);
            let btnText = isEquipped ? `[ 装備中 ] ${itemName}` : `[ 変更 ] ${itemName}`;
            let btnColor = isEquipped ? 0x008800 : 0x336699; 

            this.createMenuButton(400, startY + (index * 50), btnText, () => {
                this.registry.set(eqKey, itemId);
                this.player.showNavMessage(`${partName}のコードを「${itemName}」に書き換えました。`);
                
                this.player.eqTiming = this.registry.get('eq_timing');
                this.player.eqAttribute = this.registry.get('eq_attribute');
                this.player.eqAction = this.registry.get('eq_action');
                this.player.updateATASUI();

                this.activeMenu.destroy(true);
                this.openCustomizeMenu(partName, eqKey, invKey, masterData);
            }, btnColor);
        });
    }

    openStageMenu() {
        this.createMenuBase("【 メインゲート - 出撃 - 】");
        let cleared = this.registry.get('clearedStages') || [];
        let s1Text = cleared.includes(1) ? "STAGE 1: 表層インフラ [CLEAR]" : "STAGE 1: 表層インフラ";
        this.createMenuButton(400, 140, s1Text, () => this.scene.start('Stage1'), cleared.includes(1) ? 0x555555 : 0x336699);
        let s2Text = cleared.includes(2) ? "STAGE 2: 交通管制ターミナル [CLEAR]" : "STAGE 2: 交通管制ターミナル";
        this.createMenuButton(400, 190, s2Text, () => this.scene.start('Stage2'), cleared.includes(2) ? 0x555555 : 0x336699);
        let s3Text = cleared.includes(3) ? "STAGE 3: 廃棄物処理プラント [CLEAR]" : "STAGE 3: 廃棄物処理プラント";
        this.createMenuButton(400, 240, s3Text, () => this.scene.start('Stage3'), cleared.includes(3) ? 0x555555 : 0x336699);

        if (cleared.includes(1) && cleared.includes(2) && cleared.includes(3)) {
            this.createMenuButton(400, 290, "STAGE 4: 中枢ネットワーク [未実装]", () => { this.player.showNavMessage("開発中です。"); }, 0x993300);
        } else {
            let lockText = this.add.text(400, 290, "--- 第2階層：未解禁 ---", { fontSize: '16px', fill: '#555' }).setOrigin(0.5);
            this.activeMenu.add(lockText);
        }
    }

    openSaveMenu() {
        this.createMenuBase("【 ローカルサーバー - 記録 - 】");
        this.add.text(400, 180, "現在の進行とATAS構成を端末に記録しますか？", { fontSize: '16px', fill: '#fff' }).setOrigin(0.5);
        this.createMenuButton(400, 240, "SYSTEM SAVE (実行)", () => {
            const saveData = {
                clearedStages: this.registry.get('clearedStages'),
                eq_timing: this.registry.get('eq_timing'), eq_attribute: this.registry.get('eq_attribute'), eq_action: this.registry.get('eq_action'),
                inv_timings: this.registry.get('inv_timings'), inv_attributes: this.registry.get('inv_attributes'), inv_actions: this.registry.get('inv_actions')
            };
            localStorage.setItem('patchwork_save', JSON.stringify(saveData));
            this.player.showNavMessage("ローカルストレージへの記録が完了しました。");
            let flash = this.add.rectangle(400, 225, 800, 450, 0xffffff, 0.3);
            this.tweens.add({ targets: flash, alpha: 0, duration: 300, onComplete: () => flash.destroy() });
        }, 0x993333);
    }

    openNavMenu() {
        this.createMenuBase("【 ナビゲーター通信 】");
        const dialogues = [
            "ナビ：ブーツ、ハンドガン、バイクの各シンボルから、抽出したコードを組み替えることができます。",
            "ナビ：組み合わせ次第で、生存率が劇的に変化します。色々と試してみてください。",
            "ナビ：装備を変更した後は、必ず右奥のサーバーでセーブを行ってください。"
        ];
        let randomText = dialogues[Math.floor(Math.random() * dialogues.length)];
        let chatText = this.add.text(400, 200, randomText, { fontSize: '16px', fill: '#fff', align: 'center', wordWrap: { width: 450 } }).setOrigin(0.5);
        this.activeMenu.add(chatText);
    }
}
