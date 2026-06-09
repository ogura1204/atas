export default class BootScene extends Phaser.Scene {
    constructor() { super('BootScene'); }
    create() {
        this.createDummyTexture('bg1', 800, 450, 0x332222);
        this.createDummyTexture('bg2', 800, 450, 0x223322);
        this.createDummyTexture('bg3', 800, 450, 0x222233);
        this.createDummyTexture('player_bike', 40, 40, 0x00FFFF); 
        this.createDummyTexture('enemy_base', 30, 30, 0xFF0000);  
        this.createDummyTexture('bullet', 12, 6, 0xFFFFAA);
        
        this.createDummyTexture('eff_heal', 60, 60, 0x00FF00);    
        this.createDummyTexture('eff_fire', 60, 60, 0xFF5500);    
        this.createDummyTexture('eff_gravity', 60, 60, 0x555555); 
        
        this.createDummyTexture('boss1', 80, 80, 0xFF5500); 
        this.createDummyTexture('boss2', 60, 120, 0xAA00FF);
        this.createDummyTexture('boss3', 100, 100, 0x555555);
        this.createDummyTexture('ground', 800, 50, 0x666666);
        this.createDummyTexture('platform', 150, 20, 0x555555);

        this.createDummyTexture('lab_bg', 800, 450, 0x111118);
        this.createDummyTexture('obj_monitor', 80, 100, 0x0088ff); 
        this.createDummyTexture('obj_server', 60, 120, 0x00ff88); 
        this.createDummyTexture('obj_nav', 30, 30, 0xffff00); 
        this.createDummyTexture('obj_boots', 40, 50, 0x33cc33);   
        this.createDummyTexture('obj_handgun', 50, 30, 0xcc3333); 
        this.createDummyTexture('obj_bike_disp', 100, 50, 0x00aaff); 

        this.createParticleTexture('particle', 6, 0xffffff);
        this.createParticleTexture('particle_fire', 8, 0xffaa00);

        this.registry.set('clearedStages', []);
        this.scene.start('TitleScene');
    }
    createDummyTexture(key, width, height, color) {
        let g = this.add.graphics();
        g.fillStyle(color, 1).fillRect(0, 0, width, height).generateTexture(key, width, height).destroy();
    }
    createParticleTexture(key, size, color) {
        let g = this.add.graphics();
        g.fillStyle(color, 1).fillCircle(size/2, size/2, size/2).generateTexture(key, size, size).destroy();
    }
}
