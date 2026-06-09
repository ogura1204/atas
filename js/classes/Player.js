// ===== constructor() 内の数値を以下に書き換え =====
    constructor(scene, x, y) {
        super(scene, x, y, 'player_bike');
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setCollideWorldBounds(true);

        // ★操作性のキレを向上
        this.speed = 450;
        this.jumpPower = -1100; // 重力が強い分、ジャンプ力も跳ね上げる
        this.facingRight = true;
        this.inLab = false; 

        this.isDashing = false;
        this.dashSpeed = 900;
        // ... (以下略) ...
    }

    // ===== fireBullet() を以下に書き換え（発射位置の補正） =====
    fireBullet(type) {
        // ★弾の発射位置を、主人公の中心から前方へズラす（銃口を表現）
        let offsetX = this.facingRight ? 60 : -60;
        let offsetY = 10; // 少し下げるなど、お持ちの画像に合わせて調整可能
        
        let bullet = this.bullets.get(this.x + offsetX, this.y + offsetY);
        
        if (bullet) {
            bullet.setActive(true).setVisible(true);
            bullet.body.allowGravity = false;
            bullet.setScale(type === 'heavy' ? 2 : 1);
            bullet.damageValue = type === 'heavy' ? 5 : 1;
            bullet.body.updateFromGameObject();
            
            let bulletSpeed = type === 'heavy' ? 800 : 1200; // 弾速もアップ
            bullet.setVelocityX(this.facingRight ? bulletSpeed : -bulletSpeed);
            if (this.atasEnergy < 100) this.atasEnergy += 1;
            
            // マズルフラッシュも銃口に合わせる
            let flash = this.scene.add.sprite(this.x + offsetX, this.y + offsetY, 'particle_fire');
            this.scene.tweens.add({ targets: flash, scale: 3, alpha: 0, duration: 150, onComplete: () => flash.destroy() });
        }
    }
