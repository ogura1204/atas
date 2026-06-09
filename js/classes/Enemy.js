export default class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, textureKey, hp, speed, type = 'melee') {
        super(scene, x, y, textureKey);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setCollideWorldBounds(true);
        
        this.hp = hp;
        this.baseSpeed = speed;
        this.enemyType = type; // ★ AIのタイプ（melee: 近接, shooter: 射撃, boss: ボス）
        this.isBurned = false;
        this.isSlowed = false;
        
        this.nextActionTime = 0; // 行動のクールダウン管理

        // 飛行タイプの場合は重力を無効化
        if (this.enemyType === 'flyer') {
            this.body.allowGravity = false;
        }
    }

    update(time) {
        if (!this.active) return;
        
        let currentSpeed = this.isSlowed ? this.baseSpeed / 2 : this.baseSpeed;
        let player = this.scene.player;
        if (!player || !player.active) return;

        let distanceX = Math.abs(player.x - this.x);
        let direction = player.x < this.x ? -1 : 1;

        // ★敵の種類（タイプ）に応じたAIの行動パターン
        switch (this.enemyType) {
            case 'melee':
                // ひたすらプレイヤーに向かって歩く（従来の動き）
                this.setVelocityX(currentSpeed * direction);
                break;

            case 'shooter':
                // 一定の距離を保ち、弾を撃ってくる
                if (distanceX > 400) {
                    this.setVelocityX(currentSpeed * direction);
                } else {
                    this.setVelocityX(0); // 止まって撃つ
                    if (time > this.nextActionTime) {
                        this.fireEnemyBullet(direction);
                        this.nextActionTime = time + 2000; // 2秒に1回発射
                    }
                }
                break;

            case 'flyer':
                // 空中をフワフワと波打って飛ぶギミック
                this.setVelocityX(currentSpeed * direction);
                this.setVelocityY(Math.sin(time / 200) * 100);
                break;

            case 'boss2': // 人型高機動ボス（素早いダッシュ）
                if (time > this.nextActionTime) {
                    this.setVelocityX(currentSpeed * direction * 3); // 3倍速ダッシュ
                    this.setVelocityY(-600); // ジャンプも混ぜる
                    this.nextActionTime = time + 1500;
                } else if (time > this.nextActionTime - 1000) {
                    this.setVelocityX(0); // ダッシュ後の隙
                }
                break;

            case 'boss3': // 超大型要塞ボス（動かず、大量の弾をばらまく）
                this.setVelocityX(0);
                if (time > this.nextActionTime) {
                    this.fireEnemyBullet(-1, 0);   // 直進
                    this.fireEnemyBullet(-1, -300); // ナナメ上
                    this.nextActionTime = time + 1000; // 1秒ごとに乱射
                    if(window.SM) window.SM.playHeavy(); // 重い発射音
                }
                break;
        }
    }

    // ★敵専用の弾を生成して発射する処理
    fireEnemyBullet(direction, velocityY = 0) {
        if (!this.scene.enemyBullets) return;
        let bullet = this.scene.enemyBullets.get(this.x + (direction * 40), this.y);
        if (bullet) {
            bullet.setActive(true).setVisible(true);
            bullet.body.allowGravity = false;
            bullet.setTint(0xff0000); // 敵の弾は赤色
            bullet.body.updateFromGameObject();
            bullet.setVelocityX(400 * direction);
            bullet.setVelocityY(velocityY);
        }
    }

    takeDamage(amount) {
        if (!this.active) return;
        this.hp -= amount;
        this.setTint(0xffffff);
        this.scene.time.delayedCall(100, () => { if(this.active) this.clearTint(); });

        if (this.hp <= 0) {
            this.setActive(false);
            this.body.enable = false; 
            if (this.enemyType.startsWith('boss')) { this.scene.events.emit('bossDefeated'); }
            this.scene.tweens.add({
                targets: this, scaleX: 0, scaleY: 0, duration: 200,
                onComplete: () => { this.destroy(); }
            });
        }
    }

    applyBurn(scene) {
        if (this.isBurned) return;
        this.isBurned = true;
        this.setTint(0xff5500); 
        let burnCount = 0;
        let burnTimer = scene.time.addEvent({
            delay: 1000, callback: () => {
                if (!this.active) { burnTimer.remove(); return; }
                this.takeDamage(1); 
                burnCount++;
                if (burnCount >= 3) { this.isBurned = false; if(this.active) this.clearTint(); }
            }, repeat: 2
        });
    }

    applySlow(scene) {
        if (this.isSlowed) return;
        this.isSlowed = true;
        this.setTint(0x555555); 
        scene.time.delayedCall(2000, () => { if (this.active) { this.isSlowed = false; this.clearTint(); } });
    }
}
