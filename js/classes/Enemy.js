export default class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, textureKey, hp, speed) {
        super(scene, x, y, textureKey);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setCollideWorldBounds(true);
        this.hp = hp;
        this.baseSpeed = speed;
        this.isBurned = false;
        this.isSlowed = false;
    }

    update() {
        if (!this.active) return;
        let currentSpeed = this.isSlowed ? this.baseSpeed / 2 : this.baseSpeed;
        let player = this.scene.player;
        if (player && player.active) {
            if (player.x < this.x) { this.setVelocityX(-currentSpeed); } 
            else { this.setVelocityX(currentSpeed); }
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
            if (this.texture.key.startsWith('boss')) { this.scene.events.emit('bossDefeated'); }
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
            delay: 1000,
            callback: () => {
                if (!this.active) { burnTimer.remove(); return; }
                this.takeDamage(1); 
                burnCount++;
                if (burnCount >= 3) {
                    this.isBurned = false;
                    if(this.active) this.clearTint();
                }
            }, repeat: 2
        });
    }

    applySlow(scene) {
        if (this.isSlowed) return;
        this.isSlowed = true;
        this.setTint(0x555555); 
        scene.time.delayedCall(2000, () => {
            if (this.active) { this.isSlowed = false; this.clearTint(); }
        });
    }
}
