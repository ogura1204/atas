import Player from '../classes/Player.js';

const ATAS_MASTER = {
    timings: { 't_hp50': '体力低下', 't_heavy': '重射撃時', 't_jump': '跳躍時' },
    attributes: { 'a_heal': '修復', 'a_fire': '炎上', 'a_gravity': '重力' },
    actions: { 'ac_spin': '回転展開', 'ac_bullet': '属性弾', 'ac_shield': '防壁' }
};

export default class LabScene extends Phaser.Scene {
    constructor() { super('LabScene'); }

    create() {
        const uiLayer = document.getElementById('ui-layer');
        if (uiLayer) uiLayer.style.display = 'block';

        if(window.SM) window.SM.stopBGM();

        this.add.image(640, 360, 'lab_bg');
        
        this.platforms = this.physics.add.staticGroup();
        this.platforms.create(640, 700, 'ground').setScale(2).refreshBody();

        this.add.text(30, 30, '【 物理工房 - ラボ - 】', { fontSize: '28px', fill: '#00ffff' });

        this.initATASData();

        this.equipDisplay = this.add.text(640, 80, "", { fontSize: '20px', fill: '#aaa', align: 'center' }).setOrigin(0.5);
        this.updateEquipDisplay();

        this.facilities = this.physics.add.staticGroup();
        let monitor = this.facilities.create(200, 580, 'obj_monitor'); monitor.facilityType = 'stage';
        let boots = this.facilities.create(450, 600, 'obj_boots'); boots.facilityType = 'boots';
        let handgun = this.facilities.create(650, 620, 'obj_handgun'); handgun.facilityType = 'handgun';
        let bike = this.facilities.create(850, 600, 'obj_bike_disp'); bike.facilityType = 'bike';
        let server = this.facilities.create(1100, 560, 'obj_server'); server.facilityType = 'save';
        let navBit = this.facilities.create(1200, 450, 'obj_nav'); navBit.facilityType = 'nav';
        
        this.player = new Player(this, 640, 500);
        this.player.inLab = true;
        this.physics.add.collider(this.player, this.platforms);

        this.promptText = this.add.text(640, 150, 'Xキーでアクセス', { fontSize: '22px', fill: '#ffff00', fontStyle: 'bold' }).setOrigin(0.5);
        this.promptText.setVisible(false);
        this.currentTarget = null;
        
        // ★キーボードUI用の管理変数
        this.activeMenu = null;
        this.menuButtons = [];
        this.selectedIndex = 0;
        
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keyX = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
        this.keyZ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z); // キャンセルキー

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
                    this.promptText.setPosition(fac.x, fac.y - 120);
                    this.promptText.setVisible(true);
                    isOverlapping = true;
                }
            });
            if (!isOverlapping) { this.currentTarget = null; this.promptText.setVisible(false); }
        } else if (this.activeMenu && this.menuButtons.length > 0) {
            // ★ キーボードによるメニュー選択ロジック
            if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
                this.selectedIndex = (this.selectedIndex - 1 + this.menuButtons.length) % this.menuButtons.length;
                this.updateMenuHighlight();
                if(window.SM) window.SM.playRapid(); // カーソル移動音
            }
            if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
                this.selectedIndex = (this.selectedIndex + 1) % this.menuButtons.length;
                this.updateMenuHighlight();
                if(window.SM) window.SM.playRapid();
            }
            if (Phaser.Input.Keyboard.JustDown(this.keyX)) {
                this.menuButtons[this.selectedIndex].callback();
                if(window.SM) window.SM.playJump(); // 決定音
            }
            if (Phaser.Input.Keyboard.JustDown(this.keyZ)) {
                this.closeMenu();
            }
        }
    }

    updateMenuHighlight() {
        this.menuButtons.forEach((btn, i) => {
            if (i === this.selectedIndex) {
                btn.bg.setFillStyle(0x00ffff); // 選択中ハイライト（シアン）
                btn.text.setFill('#000');
            } else {
                btn.bg.setFillStyle(btn.defaultColor); // 元の色
                btn.text.setFill('#fff');
            }
        });
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
        this.menuButtons = [];
        this.selectedIndex = 0;
        
        let bg = this.add.rectangle(640, 360, 800, 500, 0x000000, 0.9).setStrokeStyle(3, 0x00ffff);
        let titleText = this.add.text(640, 150, title, { fontSize: '32px', fill: '#00ffff' }).setOrigin(0.5);
        let helpText = this.add.text(640, 580, "十字キー：選択 / Xキー：決定 / Zキー：閉じる", { fontSize: '16px', fill: '#aaaaaa' }).setOrigin(0.5);
        
        this.activeMenu.add(bg); this.activeMenu.add(titleText); this.activeMenu.add(helpText);
    }

    closeMenu() {
        if (this.activeMenu) {
            this.activeMenu.destroy(true);
            this.activeMenu = null;
            this.menuButtons = [];
            this.updateEquipDisplay();
            this.time.delayedCall(100, () => { 
                this.player.isLocked = false; 
                this.currentTarget = null; 
            });
        }
    }

    createMenuButton(x, y, text, callback, color = 0x336699) {
        let btnBg = this.add.rectangle(x, y, 600, 50, color).setInteractive();
        let btnText = this.add.text(x, y, text, { fontSize: '22px', fill: '#fff' }).setOrigin(0.5);
        
        // 配列に保存（キーボード操作用）
        this.menuButtons.push({ bg: btnBg, text: btnText, callback: callback, defaultColor: color });
        
        // マウス操作も一応残しておく
        btnBg.on('pointerdown', () => { callback(); });
        
        this.activeMenu.add(btnBg); this.activeMenu.add(btnText);
    }

    openCustomizeMenu(partName, eqKey, invKey, masterData) {
        this.createMenuBase(`【 ${partName} ロジックの組み替え 】`);
        let currentEquipId = this.registry.get(eqKey);
        let inventory = this.registry.get(invKey) || [];

        let startY = 250;
        inventory.forEach((itemId, index) => {
            let itemName = masterData[itemId];
            let isEquipped = (itemId === currentEquipId);
            let btnText = isEquipped ? `[ 装備中 ] ${itemName}` : `[ 変更 ] ${itemName}`;
            let btnColor = isEquipped ? 0x008800 : 0x336699; 

            this.createMenuButton(640, startY + (index * 70), btnText, () => {
                this.registry.set(eqKey, itemId);
                this.player.showNavMessage(`${partName}のコードを「${itemName}」に書き換えました。`);
                
                this.player.eqTiming = this.registry.get('eq_timing');
                this.player.eqAttribute = this.registry.get('eq_attribute');
                this.player.eqAction = this.registry.get('eq_action');
                this.player.updateATASUI();

                this.closeMenu();
                this.openCustomizeMenu(partName, eqKey, invKey, masterData);
            }, btnColor);
        });
        this.updateMenuHighlight();
    }

    openStageMenu() {
        this.createMenuBase("【 メインゲート - 出撃 - 】");
        let cleared = this.registry.get('clearedStages') || [];
        
        this.createMenuButton(640, 240, cleared.includes(1) ? "STAGE 1: 表層インフラ [CLEAR]" : "STAGE 1: 表層インフラ", 
            () => this.scene.start('Stage1'), cleared.includes(1) ? 0x555555 : 0x336699);
            
        this.createMenuButton(640, 310, cleared.includes(2) ? "STAGE 2: 交通管制ターミナル [CLEAR]" : "STAGE 2: 交通管制ターミナル", 
            () => this.scene.start('Stage2'), cleared.includes(2) ? 0x555555 : 0x336699);
            
        this.createMenuButton(640, 380, cleared.includes(3) ? "STAGE 3: 廃棄物処理プラント [CLEAR]" : "STAGE 3: 廃棄物処理プラント", 
            () => this.scene.start('Stage3'), cleared.includes(3) ? 0x555555 : 0x336699);

        if (cleared.includes(1) && cleared.includes(2) && cleared.includes(3)) {
            this.createMenuButton(640, 450, "STAGE 4: 中枢ネットワーク [未実装]", () => { this.player.showNavMessage("開発中です。"); }, 0x993300);
        } else {
            this.createMenuButton(640, 450, "--- 第2階層：未解禁 ---", () => { this.player.showNavMessage("上の階層を全てクリアしてください。"); }, 0x333333);
        }
        this.updateMenuHighlight();
    }

    openSaveMenu() {
        this.createMenuBase("【 ローカルサーバー - 記録 - 】");
        this.add.text(640, 280, "現在の進行とATAS構成を端末に記録しますか？", { fontSize: '22px', fill: '#fff' }).setOrigin(0.5);
        this.createMenuButton(640, 380, "SYSTEM SAVE (実行)", () => {
            const saveData = {
                clearedStages: this.registry.get('clearedStages'),
                eq_timing: this.registry.get('eq_timing'), eq_attribute: this.registry.get('eq_attribute'), eq_action: this.registry.get('eq_action'),
                inv_timings: this.registry.get('inv_timings'), inv_attributes: this.registry.get('inv_attributes'), inv_actions: this.registry.get('inv_actions')
            };
            localStorage.setItem('patchwork_save', JSON.stringify(saveData));
            this.player.showNavMessage("ローカルストレージへの記録が完了しました。");
            this.closeMenu();
        }, 0x993333);
        this.updateMenuHighlight();
    }

    openNavMenu() {
        this.createMenuBase("【 ナビゲーター通信 】");
        const dialogues = [
            "ナビ：ブーツ、ハンドガン、バイクの各シンボルから、抽出したコードを組み替えることができます。",
            "ナビ：組み合わせ次第で、生存率が劇的に変化します。色々と試してみてください。",
            "ナビ：Zキーでメニューをキャンセル（閉じる）ことができます。"
        ];
        let randomText = dialogues[Math.floor(Math.random() * dialogues.length)];
        this.add.text(640, 320, randomText, { fontSize: '22px', fill: '#fff', align: 'center', wordWrap: { width: 600 } }).setOrigin(0.5);
        this.createMenuButton(640, 450, "了解", () => { this.closeMenu(); }, 0x336699);
        this.updateMenuHighlight();
    }
}
