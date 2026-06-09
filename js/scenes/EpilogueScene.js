export default class EpilogueScene extends Phaser.Scene {
    constructor() { super('EpilogueScene'); }

    init(data) {
        this.bossName = data.bossName || "未知のバグ";
        this.reward = data.reward || "不明なコード";
        this.stageId = data.stageId || 0; 
    }

    create() {
        // ★UIレイヤーを非表示にする
        document.getElementById('ui-layer').style.display = 'none';

        this.cameras.main.setBackgroundColor('#001122');
        
        if (this.stageId > 0) {
            let cleared = this.registry.get('clearedStages') || [];
            if (!cleared.includes(this.stageId)) {
                cleared.push(this.stageId);
                this.registry.set('clearedStages', cleared);
            }
        }

        this.texts = [
            `【対象の解体完了】：${this.bossName}`,
            "エラーの元凶を物理的に破壊し、純粋なコードを抽出した。",
            `獲得：${this.reward}`,
            "……狂っていた環境の律動が、少しだけ正しいリズムを取り戻した。"
        ];
        this.currentIndex = 0;

        this.messageText = this.add.text(400, 225, this.texts[this.currentIndex], { fontSize: '18px', fill: '#fff', align: 'center' }).setOrigin(0.5);
        this.add.text(400, 400, "[画面をクリック、または Space / Enter キーで帰還]", { fontSize: '14px', fill: '#aaa' }).setOrigin(0.5);

        const advance = () => {
            this.currentIndex++;
            if (this.currentIndex < this.texts.length) { this.messageText.setText(this.texts[this.currentIndex]); } 
            else { this.scene.start('LabScene'); }
        };

        this.input.on('pointerdown', advance);
        this.input.keyboard.on('keydown-SPACE', advance);
        this.input.keyboard.on('keydown-ENTER', advance);
    }
}
