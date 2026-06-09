export default class TitleScene extends Phaser.Scene {
    constructor() { super('TitleScene'); }
    create() {
        this.cameras.main.setBackgroundColor('#000000');
        this.add.text(400, 150, "パッチワーク・ワールドの修復師", { fontSize: '36px', fill: '#00ffff', fontStyle: 'bold' }).setOrigin(0.5);
        const saveRaw = localStorage.getItem('patchwork_save');

        this.createButton(400, 250, "NEW GAME", () => {
            this.registry.set('clearedStages', []);
            this.scene.start('PrologueScene');
        });

        if (saveRaw) {
            this.createButton(400, 320, "CONTINUE", () => {
                const saveData = JSON.parse(saveRaw);
                this.registry.set('clearedStages', saveData.clearedStages || []);
                // 装備データも復元
                this.registry.set('eq_timing', saveData.eq_timing);
                this.registry.set('eq_attribute', saveData.eq_attribute);
                this.registry.set('eq_action', saveData.eq_action);
                this.registry.set('inv_timings', saveData.inv_timings);
                this.registry.set('inv_attributes', saveData.inv_attributes);
                this.registry.set('inv_actions', saveData.inv_actions);
                this.scene.start('LabScene');
            }, 0x008800); 
        }
    }
    createButton(x, y, text, callback, color = 0x336699) {
        let btnBg = this.add.rectangle(x, y, 300, 50, color).setInteractive();
        let btnText = this.add.text(x, y, text, { fontSize: '18px', fill: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
        btnBg.on('pointerdown', () => {
            btnBg.setFillStyle(0x6699cc);
            this.time.delayedCall(100, () => callback());
        });
    }
}
