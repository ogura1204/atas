const ATAS_MASTER = {
    timings: { 't_hp50': '体力低下', 't_heavy': '重射撃時', 't_jump': '跳躍時' },
    attributes: { 'a_heal': '修復', 'a_fire': '炎上', 'a_gravity': '重力' },
    actions: { 'ac_spin': '回転展開', 'ac_bullet': '属性弾', 'ac_shield': '防壁' }
};

export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'player_bike');
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setCollideWorldBounds(true);

        this.speed = 250;
        this.jumpPower = -500;
        this.facingRight = true;
        this.inLab = false; 

        this.isDashing = false;
        this.dashSpeed = 600;
        this.dashCooldown = 0;

        this.particles = scene.add.particles('particle');
        this.dustEmitter = this.particles.createEmitter({
            speed: { min: -50, max: 50 }, angle: { min: 250, max: 290 },
            scale: { start: 1, end: 0 }, alpha: { start: 0.5, end: 0 },
            lifespan: 300, gravityY: -50, on: false 
        });

        this.eqTiming = scene.registry.get('eq_timing') || 't_hp50';
        this.eqAttribute = scene.registry.get('eq_attribute') || 'a_heal';
        this.eqAction = scene.registry.get('eq_action') || 'ac_spin';

        this.maxHp = 10;
        this.hp = this.maxHp;
        this.isInvincible = false; 
        
        this.atasEnergy = 100;
        this.atasCooldown = false; 
        this.isSpinning = false; 

        this.maxGauge = 15;
        this.gauge = this.maxGauge;
        this.isReloading = false;
        this.reloadCompleteTime = 0;

        this.attackDownTime = 0;
        this.isAttackPressed = false;
        this.isRapidFiring = false;
        this.lastRapidTime = 0;
        this.rapidInterval = 200; 

        this.bullets = scene.physics.add.group({ defaultKey: 'bullet', maxSize: 50 });
        this.atasEffects = scene.physics.add.group();

        this.cursors = scene.input.keyboard.createCursorKeys();
        
        // ★ キーボードの追加（Z, X, C, Shift）
        this.keyZ = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
        this.keyX = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
        this.keyC = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);
        this.keyShift = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

        this.uiKeys = { left: false, right: false, up: false, dash: false };
        
        this.clearAndBindDOM('btn-left', () => this.uiKeys.left = true, () => this.uiKeys.left = false);
        this.clearAndBindDOM('btn-right', () => this.uiKeys.right = true, () => this.uiKeys.right = false);
        this.clearAndBindDOM('btn-jump', () => this.uiKeys.up = true, () => this.uiKeys.up = false);
        this.clearAndBindDOM('btn-dash', () => this.handleDash(), () => this.uiKeys.dash = false);
        this.clearAndBindDOM('btn-attack', () => this.handleAttackDown(), () => this.handleAttackUp());

        this.updateGaugeUI();
        this.updateATASUI();
    }

    clearAndBindDOM(id, onDown, onUp) {
        let el = document.getElementById(id);
        if (!el) return;
        let clone = el.cloneNode(true);
        el.parentNode.replaceChild(clone, el);
        const down = (e) => { e.preventDefault(); onDown(); };
        const up = (e) => { e.preventDefault(); onUp(); };
        clone.addEventListener('touchstart', down, {passive: false});
        clone.addEventListener('touchend', up, {passive: false});
        clone.addEventListener('mousedown', down);
        clone.addEventListener('mouseup', up);
        clone.addEventListener('mouseleave', up);
    }

    handleDash() {
        if (this.isLocked || this.isSpinning || this.inLab || this.isDashing || this.scene.time.now < this.dashCooldown) return;
        this.isDashing = true;
        this.isInvincible = true; 
        window.SM.playDash(); 
        
        let afterimageTimer = this.scene.time.addEvent({
            delay: 50, repeat: 4,
            callback: () => {
                let ghost = this.scene.add.sprite(this.x, this.y, 'player_bike').setAlpha(0.5);
                this.scene.tweens.add({ targets: ghost, alpha: 0, duration: 300, onComplete: () => ghost.destroy() });
            }
        });

        this.scene.time.delayedCall(200, () => {
            this.isDashing = false;
            this.isInvincible = false;
            this.dashCooldown = this.scene.time.now + 800; 
        });
    }

    takeDamage(amount) {
        if (this.isInvincible || this.isSpinning || this.isDashing) return;
        this.hp -= amount;
        if (this.hp < 0) this.hp = 0;
        this.isInvincible = true;
        this.setTint(0xff0000);
        this.updateGaugeUI();

        this.scene.time.delayedCall(1000, () => { this.isInvincible = false; this.clearTint(); });
        if (this.hp <= this.maxHp / 2 && this.eqTiming === 't_hp50') this.tryTriggerATAS();
    }

    tryTriggerATAS() {
        if (this.atasEnergy >= 30 && !this.atasCooldown) {
            this.atasEnergy -= 30;
            this.atasCooldown = true;
            this.executeATAS();
            this.updateGaugeUI();
            this.scene.time.delayedCall(5000, () => { this.atasCooldown = false; });
        }
    }

    executeATAS() {
        window.SM.playATAS(); 
        this.flashATASUI();   

        let attrKey = 'eff_heal';
        if (this.eqAttribute === 'a_fire') attrKey = 'eff_fire';
        if (this.eqAttribute === 'a_gravity') attrKey = 'eff_gravity';

        let effect = this.atasEffects.create(this.x, this.y, attrKey);
        effect.attribute = this.eqAttribute; 
        effect.actionType = this.eqAction;   
        effect.body.allowGravity = false;
        effect.setAlpha(0.7);

        if (this.eqAction === 'ac_spin') {
            this.showNavMessage("ATAS発動：【回転】＋【エリア展開】");
            this.isSpinning = true;
            this.setVelocity(0, 0);
            this.dustEmitter.explode(20, this.x, this.y + 20);
            this.scene.tweens.add({
                targets: this, angle: 360, duration: 400,
                onComplete: () => { this.angle = 0; this.isSpinning = false; }
            });
            this.scene.time.delayedCall(3000, () => { if(effect.active) effect.destroy(); });

        } else if (this.eqAction === 'ac_bullet') {
            this.showNavMessage("ATAS発動：【属性弾】");
            effect.setScale(0.5); 
            let vx = this.facingRight ? 500 : -500;
            effect.setVelocityX(vx);
            this.scene.time.delayedCall(2000, () => { if(effect.active) effect.destroy(); });

        } else if (this.eqAction === 'ac_shield') {
            this.showNavMessage("ATAS発動：【シールド展開】");
            effect.setScale(1.5); 
            this.scene.time.delayedCall(3000, () => { if(effect.active) effect.destroy(); });
        }
    }

    handleAttackDown() {
        if (this.isReloading || this.isSpinning) return;
        if (this.inLab) { this.scene.events.emit('interact'); return; }
        this.isAttackPressed = true;
        this.attackDownTime = this.scene.time.now;
        this.isRapidFiring = false;
    }

    handleAttackUp() {
        this.isAttackPressed = false;
        if (this.isReloading || this.isSpinning || this.inLab) return;
        if (!this.isRapidFiring) this.tryFireHeavy();
        this.isRapidFiring = false;
    }

    update(time) {
        if (this.isLocked || this.isSpinning) { this.setVelocityX(0); return; }

        // ★キーボードの入力を判定（Space または Xキー）
        if (Phaser.Input.Keyboard.JustDown(this.cursors.space) || Phaser.Input.Keyboard.JustDown(this.keyX)) this.handleAttackDown();
        if (Phaser.Input.Keyboard.JustUp(this.cursors.space) || Phaser.Input.Keyboard.JustUp(this.keyX)) this.handleAttackUp();

        // ★ダッシュのキーボード入力判定（C または Shiftキー）
        if (Phaser.Input.Keyboard.JustDown(this.keyC) || Phaser.Input.Keyboard.JustDown(this.keyShift)) this.handleDash();

        let isLeft = this.cursors.left.isDown || this.uiKeys.left;
        let isRight = this.cursors.right.isDown || this.uiKeys.right;
        // ★ジャンプの判定にZキーを追加
        let isUp = this.cursors.up.isDown || this.keyZ.isDown || this.uiKeys.up;

        if (this.isDashing) {
            this.setVelocityX(this.facingRight ? this.dashSpeed : -this.dashSpeed);
            this.setVelocityY(0); 
        } else {
            if (isLeft) { this.setVelocityX(-this.speed); this.facingRight = false; } 
            else if (isRight) { this.setVelocityX(this.speed); this.facingRight = true; } 
            else { this.setVelocityX(0); }
        }

        if (isUp && this.body.touching.down && !this.isDashing) { 
            this.setVelocityY(this.jumpPower); 
            window.SM.playJump(); 
            this.dustEmitter.explode(10, this.x, this.y + 20); 
            if (this.eqTiming === 't_jump') this.tryTriggerATAS();
        }

        this.atasEffects.getChildren().forEach(eff => {
            if (eff.active && eff.actionType === 'ac_shield') eff.setPosition(this.x, this.y);
        });

        if (this.isReloading) {
            this.updateGaugeUI(time);
            if (time >= this.reloadCompleteTime) {
                this.isReloading = false;
                this.gauge = this.maxGauge;
                this.updateGaugeUI();
                this.showNavMessage("リロード完了。");
            }
        } else if (this.gauge <= 0) {
            this.isReloading = true;
            this.reloadCompleteTime = time + 3000;
            this.showNavMessage("残弾ゼロ。冷却を開始。");
            this.updateGaugeUI(time);
        }

        if (this.isAttackPressed && !this.isReloading) {
            if (time - this.attackDownTime >= 200) {
                this.isRapidFiring = true;
                if (time >= this.lastRapidTime + this.rapidInterval) {
                    this.tryFireRapid();
                    this.lastRapidTime = time;
                }
            }
        }
    }

    tryFireRapid() {
        if (this.gauge >= 1) { 
            this.gauge -= 1; this.fireBullet('rapid'); this.updateGaugeUI(); 
            window.SM.playRapid();
        } else { this.emptyClick(); }
    }

    tryFireHeavy() {
        if (this.gauge >= 5) { 
            this.gauge -= 5; this.fireBullet('heavy'); this.updateGaugeUI(); 
            window.SM.playHeavy();
            if (this.eqTiming === 't_heavy') this.tryTriggerATAS();
        } else { this.emptyClick(); window.SM.playEmpty(); }
    }

    emptyClick() {
        this.setTint(0x555555);
        this.scene.time.delayedCall(100, () => this.clearTint());
    }

    fireBullet(type) {
        let bullet = this.bullets.get(this.x, this.y);
        if (bullet) {
            bullet.setActive(true).setVisible(true);
            bullet.body.allowGravity = false;
            bullet.setScale(type === 'heavy' ? 2 : 1);
            bullet.damageValue = type === 'heavy' ? 5 : 1;
            bullet.body.updateFromGameObject();
            let bulletSpeed = type === 'heavy' ? 400 : 600;
            bullet.setVelocityX(this.facingRight ? bulletSpeed : -bulletSpeed);
            if (this.atasEnergy < 100) this.atasEnergy += 1;
            
            let flash = this.scene.add.sprite(this.facingRight ? this.x + 20 : this.x - 20, this.y, 'particle_fire');
            this.scene.tweens.add({ targets: flash, scale: 2, alpha: 0, duration: 100, onComplete: () => flash.destroy() });
        }
    }

    updateATASUI() {
        const dTiming = document.getElementById('atas-timing');
        const dAttr = document.getElementById('atas-attribute');
        const dAction = document.getElementById('atas-action');
        if (dTiming) dTiming.innerText = ATAS_MASTER.timings[this.eqTiming];
        if (dAttr) dAttr.innerText = ATAS_MASTER.attributes[this.eqAttribute];
        if (dAction) dAction.innerText = ATAS_MASTER.actions[this.eqAction];
    }

    flashATASUI() {
        const display = document.getElementById('atas-display');
        if (display) {
            display.classList.remove('atas-flash');
            void display.offsetWidth; 
            display.classList.add('atas-flash');
        }
    }

    updateGaugeUI(time = 0) {
        const hpEl = document.querySelector('.hp-bar');
        if (hpEl) {
            let hpBars = '|'.repeat(this.hp);
            let hpEmpty = '.'.repeat(this.maxHp - this.hp);
            hpEl.innerText = `HP: ${hpBars}${hpEmpty}`;
        }
        const el = document.querySelector('.energy-bar');
        if (!el) return;
        if (this.isReloading) {
            let remain = Math.ceil((this.reloadCompleteTime - time) / 1000);
            el.innerText = `AMMO RELOAD: ${Math.max(remain, 0)}s`;
            el.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
        } else {
            let bars = '|'.repeat(this.gauge);
            let empty = '.'.repeat(this.maxGauge - this.gauge);
            el.innerText = `AMMO: ${bars}${empty} / ATAS: ${this.atasEnergy}%`;
            el.style.backgroundColor = 'rgba(0, 150, 255, 0.3)';
        }
    }

    showNavMessage(msg) {
        const nav = document.getElementById('nav-text');
        if (nav) nav.innerText = `ナビゲーター：${msg}`;
    }
}
