import Player from '../classes/Player.js';
import Enemy from '../classes/Enemy.js';

export default class BaseStage extends Phaser.Scene {
    constructor(key) { super(key); }

    setupStage(config) {
        const uiLayer = document.getElementById('ui-layer');
        if (uiLayer) uiLayer.style.display = 'block';

        // BGMブロック回避のため、ユーザー操作後のタイミングで強制再生
        if(window.SM) {
            window.SM.ctx.resume().then(() => {
                window.SM.playStageBGM(config.epilogueData.stageId);
            });
        }

        // ★ ステージの広さを設定（引数で指定された広さ）
        this.physics.world.setBounds(0, 0, config.stageWidth, 720);

        // ★ 3層のパララックス（多重スクロール）背景
        // scrollFactor を 0(動かない)〜1(カメラと同じ速度) で設定し奥行きを出す
        this.bgBack = this.add.tileSprite(0, 360, config.stageWidth, 720, config.bgBack).setScrollFactor(0.1);
        this.bgMid = this.add.tileSprite(0, 360, config.stageWidth, 720, config.bgMid).setScrollFactor(0.4);
        
        this.explosionEmitter = this.add.particles(0, 0, 'particle_fire', {
            speed: { min: 100, max: 400 }, scale: { start: 2.0, end: 0 },
            alpha: { start: 1, end: 0 }, lifespan: 600, emitting: false
        });

        this.platforms = this.physics.add.staticGroup();
        config.platformsData.forEach(p => {
            // ブロックを敷き詰める
            let block = this.platforms.create(p.x, p.y, p.key);
            if(p.scale) block.setScale(p.scale).refreshBody();
        });

        this.add.text(20, 20, config.title, { fontSize: '24px', fill: '#fff' }).setScrollFactor(0);

        // プレイヤー配置とカメラ追従設定
        this.player = new Player(this, 100, 500);
        this.physics.add.collider(this.player, this.platforms);
        
        // ★ カメラがプレイヤーを追いかける
        this.cameras.main.setBounds(0, 0, config.stageWidth, 720);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        this.allEnemies = this.physics.add.group();
        config.enemiesData.forEach(e => {
            this.allEnemies.add(new Enemy(this, e.x, e.y, e.key, e.hp, e.speed));
        });

        this.boss = new Enemy(this, config.bossData.x, config.bossData.y, config.bossData.key, config.bossData.hp, config.bossData.speed);
        this.boss.setActive(false).setVisible(false); 
        this.allEnemies.add(this.boss);
        this.physics.add.collider(this.allEnemies, this.platforms);

        // ボスエリアの会話トリガー
        this.dialogueTrigger = this.add.zone(config.triggerX, 360, 40, 720);
        this.physics.add.existing(this.dialogueTrigger, true);
        this.isDialogueActive = false;
        
        this.physics.add.overlap(this.player, this.dialogueTrigger, () => {
            if (!this.isDialogueActive && !this.boss.active) {
                // ★ ボス戦に入ったらカメラをボスエリアに固定する
                this.cameras.main.stopFollow();
                this.cameras.main.pan(config.triggerX + 400, 360, 1000, 'Sine.easeInOut');
                this.startBossDialogue(config.dialogues);
            }
        });

        this.events.on('bossDefeated', () => {
            if(window.SM) window.SM.stopBGM(); 
            this.scene.start('EpilogueScene', config.epilogueData);
        });

        this.setupCollisions();
    }

    // ... (setupCollisions等のメソッドは前回と同じため省略せずそのまま使用してください) ...
    // update メソッドに背景のスクロール補正を入れます
    
    update(time) {
        if (this.player) this.player.update(time);
        if (this.allEnemies) this.allEnemies.getChildren().forEach(e => { if (e.active) e.update(); });
        
        // 背景画像のタイル位置をカメラに合わせてズラす（パララックス効果）
        if (this.bgBack) this.bgBack.tilePositionX = this.cameras.main.scrollX * 0.1;
        if (this.bgMid) this.bgMid.tilePositionX = this.cameras.main.scrollX * 0.4;
    }
}
