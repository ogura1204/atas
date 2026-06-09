import Player from '../classes/Player.js';
import Enemy from '../classes/Enemy.js';

export default class BaseStage extends Phaser.Scene {
    constructor(key) { super(key); }

    setupStage(config) {
        const uiLayer = document.getElementById('ui-layer');
        if (uiLayer) uiLayer.style.display = 'block';

        if(window.SM) {
            if(window.SM.ctx && window.SM.ctx.state === 'suspended') window.SM.ctx.resume();
            window.SM.playStageBGM(config.epilogueData.stageId);
        }

        this.physics.world.setBounds(0, 0, config.stageWidth, 720);

        this.bgBack = this.add.tileSprite(0, 360, config.stageWidth, 720, config.bgBack).setScrollFactor(0.1);
        this.bgMid = this.add.tileSprite(0, 360, config.stageWidth, 720, config.bgMid).setScrollFactor(0.4);
        
        this.explosionEmitter = this.add.particles(0, 0, 'particle_fire', {
            speed: { min: 100, max: 400 }, scale: { start: 2.0, end: 0 },
            alpha: { start: 1, end: 0 }, lifespan: 600, emitting: false
        });

        this.platforms = this.physics.add.staticGroup();
        this.hazards = this.physics.add.staticGroup();

        config.platformsData.forEach(p => {
            if(p.key === 'hazard') {
                this.hazards.create(p.x, p.y, p.key).setScale(p.scale || 1).refreshBody();
            } else {
                this.platforms.create(p.x, p.y, p.key).setScale(p.scale || 1).refreshBody();
            }
        });

        this.add.text(20, 20, config.title, { fontSize: '24px', fill: '#fff', fontStyle: 'bold' }).setScrollFactor(0);

        this.player = new Player(this, 100, 500);
        this.physics.add.collider(this.player, this.platforms);
        
        this.cameras.main.setBounds(0, 0, config.stageWidth, 720);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        this.enemyBullets = this.physics.add.group({ defaultKey: 'bullet', maxSize: 100 });

        this.allEnemies = this.physics.add.group();
        config.enemiesData.forEach(e => {
            this.allEnemies.add(new Enemy(this, e.x, e.y, e.key, e.hp, e.speed, e.type));
        });

        this.boss = new Enemy(this, config.bossData.x, config.bossData.y, config.bossData.key, config.bossData.hp, config.bossData.speed, config.bossData.type);
        this.boss.setActive(false).setVisible(false); 
        this.allEnemies.add(this.boss);
        this.physics.add.collider(this.allEnemies, this.platforms);

        this.dialogueTrigger = this.add.zone(config.triggerX, 360, 40, 720);
        this.physics.add.existing(this.dialogueTrigger, true);
        this.isDialogueActive = false;
        
        this.physics.add.overlap(this.player, this.dialogueTrigger, () => {
            if (!this.isDialogueActive && !this.boss.active) {
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

    setupCollisions() {
        this.physics.add.overlap(this.player.bullets, this.allEnemies, (b, e) => {
            if (b.active && e.active) { 
                let d = b.damageValue || 1; 
                b.setActive(false).setVisible(false); 
                e.takeDamage(d); 
                if (e.hp <= 0) {
                    if(window.SM) window.SM.playExplosion();
                    this.explosionEmitter.explode(30, e.x, e.y);
                } else {
                    if(window.SM) window.SM.playSynth(300, 'square', 0.05, 0.2);
                }
            }
        });
        
        this.physics.add.collider(this.player.bullets, this.platforms, (b) => { b.setActive(false).setVisible(false); });
        this.physics.add.collider(this.enemyBullets, this.platforms, (b) => { b.setActive(false).setVisible(false); });
        
        this.physics.add.collider(this.player, this.allEnemies, (player, enemy) => {
            if (!player.isInvincible && !player.isSpinning && !player.isDashing) {
                player.takeDamage(1); 
                player.setVelocityY(-400); 
                player.setVelocityX(player.x < enemy.x ? -300 : 300);
            }
        });

        this.physics.add.overlap(this.player, this.enemyBullets, (player, bullet) => {
            if (!player.isInvincible && !player.isSpinning && !player.isDashing && bullet.active) {
                player.takeDamage(1);
                bullet.setActive(false).setVisible(false);
            }
        });

        this.physics.add.collider(this.player, this.hazards, (player, hazard) => {
            if (!player.isInvincible) {
                player.takeDamage(2);
                player.setVelocityY(-600); 
            }
        });

        this.physics.add.overlap(this.player, this.player.atasEffects, (player, effect) => {
            if (effect.attribute === 'a_heal' && player.hp < player.maxHp) {
                player.hp += 3; 
                if (player.hp > player.maxHp) player.hp = player.maxHp;
                player.updateGaugeUI(); 
                player.showNavMessage("システム修復完了。");
                if (effect.actionType !== 'ac_shield') effect.destroy();
                else effect.attribute = 'none'; 
            }
        });

        this.physics.add.overlap(this.allEnemies, this.player.atasEffects, (enemy, effect) => {
            if (effect.attribute === 'a_fire') {
                enemy.applyBurn(this); 
                if (effect.actionType === 'ac_bullet') effect.destroy(); 
            } else if (effect.attribute === 'a_gravity') {
                enemy.applySlow(this); 
                if (effect.actionType === 'ac_bullet') effect.destroy();
            }
        });
    }

    startBossDialogue(dialogues) {
        this.isDialogueActive = true;
        this.player.isLocked = true; 
        this.currentDialogues = dialogues;
        this.dialogueIndex = 0;

        this.dialogueBg = this.add.graphics().setScrollFactor(0);
        this.dialogueBg.fillStyle(0x000000, 0.8).lineStyle(2, 0x00ffff);
        this.dialogueBg.fillRect(240, 550, 800, 100).strokeRect(240, 550, 800, 100);
        
        this.dialogueText = this.add.text(280, 580, this.currentDialogues[0], { fontSize: '20px', fill: '#fff' }).setScrollFactor(0);
        
        this.input.on('pointerdown', this.advanceDialogue, this);
        this.input.keyboard.on('keydown-SPACE', this.advanceDialogue, this);
        this.input.keyboard.on('keydown-ENTER', this.advanceDialogue, this);
        this.input.keyboard.on('keydown-X', this.advanceDialogue, this);
    }

    advanceDialogue() {
        if (!this.isDialogueActive) return;
        this.dialogueIndex++;
        if (this.dialogueIndex < this.currentDialogues.length) {
            this.dialogueText.setText(this.currentDialogues[this.dialogueIndex]);
        } else {
            this.isDialogueActive = false;
            this.dialogueBg.destroy();
            this.dialogueText.destroy();
            
            this.input.off('pointerdown', this.advanceDialogue, this);
            this.input.keyboard.off('keydown-SPACE', this.advanceDialogue, this);
            this.input.keyboard.off('keydown-ENTER', this.advanceDialogue, this);
            this.input.keyboard.off('keydown-X', this.advanceDialogue, this);
            
            this.player.isLocked = false;
            this.boss.setActive(true).setVisible(true);
            this.player.showNavMessage("戦闘開始！");
        }
    }

    update(time) {
        if (this.player) this.player.update(time);
        if (this.allEnemies) this.allEnemies.getChildren().forEach(e => { if (e.active) e.update(); });
        
        if (this.bgBack) this.bgBack.tilePositionX = this.cameras.main.scrollX * 0.1;
        if (this.bgMid) this.bgMid.tilePositionX = this.cameras.main.scrollX * 0.4;
    }
}
