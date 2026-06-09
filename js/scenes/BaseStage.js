// BaseStage.js 内の setupStage を修正
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
        // ★ダメージを受けるトゲなどのギミック（hazard）用のグループ
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

        // ★敵の弾グループを作成
        this.enemyBullets = this.physics.add.group({ defaultKey: 'bullet', maxSize: 100 });

        this.allEnemies = this.physics.add.group();
        config.enemiesData.forEach(e => {
            // ★ AIタイプ（e.type）をEnemyクラスに渡す
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

    // BaseStage.js 内の setupCollisions を修正
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
        
        // ★敵本体との接触ダメージ
        this.physics.add.collider(this.player, this.allEnemies, (player, enemy) => {
            if (!player.isInvincible && !player.isSpinning && !player.isDashing) {
                player.takeDamage(1); 
                player.setVelocityY(-400); // 弾き飛ばされる
                player.setVelocityX(player.x < enemy.x ? -300 : 300);
            }
        });

        // ★敵の弾との接触ダメージ
        this.physics.add.overlap(this.player, this.enemyBullets, (player, bullet) => {
            if (!player.isInvincible && !player.isSpinning && !player.isDashing && bullet.active) {
                player.takeDamage(1);
                bullet.setActive(false).setVisible(false);
            }
        });

        // ★ギミック（トゲや溶岩など）との接触ダメージ
        this.physics.add.collider(this.player, this.hazards, (player, hazard) => {
            if (!player.isInvincible) {
                player.takeDamage(2); // ギミックは痛い
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
