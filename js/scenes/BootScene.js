export default class BootScene extends Phaser.Scene {
    constructor() { super('BootScene'); }

    preload() {
        // ========================================================
        // 【重要：本番の高画質画像を読み込む方法】
        // ご自身で作成した画像を「assets」フォルダに入れ、以下のコメントを外して下さい。
        // ========================================================
        /*
        this.load.image('player_bike', 'assets/player_bike_highres.png');
        this.load.image('obj_handgun', 'assets/handgun_detail.png');
        this.load.image('obj_boots', 'assets/boots_detail.png');
        
        // 背景（多重スクロール用）
        this.load.image('bg1_back', 'assets/stage1_sky.png');
        this.load.image('bg1_mid', 'assets/stage1_city.png');
        */
    }

    create() {
        // 画像が用意できるまでの仮素材（サイズを大きくし、フルHDに対応させています）
        this.createDummyTexture('bg1_back', 1280, 720, 0x111122); 
        this.createDummyTexture('bg1_mid', 1280, 720, 0x332222); 

        // ...(これまでのダミー生成コードはそのまま残しておいてください)
        this.createDummyTexture('bg2', 1280, 720, 0x223322);
        this.createDummyTexture('bg3', 1280, 720, 0x222233);
        this.createDummyTexture('player_bike', 80, 80, 0x00FFFF);  // 主人公も大きく
        this.createDummyTexture('enemy_base', 60, 60, 0xFF0000);  
        this.createDummyTexture('bullet', 24, 12, 0xFFFFAA);
        
        this.createDummyTexture('eff_heal', 100, 100, 0x00FF00);    
        this.createDummyTexture('eff_fire', 100, 100, 0xFF5500);    
        this.createDummyTexture('eff_gravity', 100, 100, 0x555555); 
        
        this.createDummyTexture('boss1', 200, 200, 0xFF5500); // ボスを巨大化
        this.createDummyTexture('boss2', 150, 300, 0xAA00FF);
        this.createDummyTexture('boss3', 250, 250, 0x555555);
        this.createDummyTexture('ground', 800, 100, 0x666666);
        this.createDummyTexture('platform', 300, 40, 0x555555);

        this.createDummyTexture('lab_bg', 1280, 720, 0x111118);
        this.createDummyTexture('obj_monitor', 120, 150, 0x0088ff); 
        this.createDummyTexture('obj_server', 100, 180, 0x00ff88); 
        this.createDummyTexture('obj_nav', 50, 50, 0xffff00); 
        this.createDummyTexture('obj_boots', 80, 100, 0x33cc33);   
        this.createDummyTexture('obj_handgun', 100, 60, 0xcc3333); 
        this.createDummyTexture('obj_bike_disp', 200, 100, 0x00aaff); 

        this.createParticleTexture('particle', 12, 0xffffff);
        this.createParticleTexture('particle_fire', 16, 0xffaa00);

        this.registry.set('clearedStages', []);
        this.scene.start('TitleScene');
    }

    createDummyTexture(key, width, height, color) {
        if (!this.textures.exists(key)) {
            let g = this.add.graphics();
            g.fillStyle(color, 1).fillRect(0, 0, width, height).generateTexture(key, width, height).destroy();
        }
    }
    createParticleTexture(key, size, color) {
        if (!this.textures.exists(key)) {
            let g = this.add.graphics();
            g.fillStyle(color, 1).fillCircle(size/2, size/2, size/2).generateTexture(key, size, size).destroy();
        }
    }
}
