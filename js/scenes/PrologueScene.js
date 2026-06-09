export default class PrologueScene extends Phaser.Scene {
    constructor() { super('PrologueScene'); }

    create() {
        // ★UIレイヤーを非表示にする
        const uiLayer = document.getElementById('ui-layer');
        if (uiLayer) uiLayer.style.display = 'none';

        this.cameras.main.setBackgroundColor('#000000');
        this.texts = [
            "ブラックボックス化したパッチワーク・ワールド。",
            "全ては自動化され、人々は思考を放棄した。",
            "エラーの発生と無意識な「ロールバック」の連鎖。",
            "私は修復師（リノベーター）。",
            "自らの手でバグを解体し、",
            "この世界に正しい律動（リズム）を取り戻す。"
        ];
        this.currentIndex = 0;
        this.messageText = this.add.text(400, 225, this.texts[this.currentIndex], { fontSize: '20px', fill: '#fff', align: 'center' }).setOrigin(0.5);
        this.add.text(400, 400, "[画面をクリック、または Space / Enter キーで進行]", { fontSize: '14px', fill: '#aaa' }).setOrigin(0.5);

        const advance = () => {
            this.currentIndex++;
            if (this.currentIndex < this.texts.length) { 
                this.messageText.setText(this.texts[this.currentIndex]); 
            } else { 
                this.scene.start('LabScene'); 
            }
        };

        this.input.on('pointerdown', advance);
        this.input.keyboard.on('keydown-SPACE', advance);
        this.input.keyboard.on('keydown-ENTER', advance);
    }
}
