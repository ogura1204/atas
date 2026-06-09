import BaseStage from './BaseStage.js';

export default class Stage2 extends BaseStage {
    constructor() { super('Stage2'); }

    create() {
        let groundData = [];
        // アスレチックのように途切れた足場（落下注意）
        for (let i = 0; i < 12; i++) {
            groundData.push({ x: 400 + (i * 700), y: 700, key: 'ground', scale: 0.8 });
            groundData.push({ x: 750 + (i * 700), y: 500, key: 'platform', scale: 0.5 });
        }

        let enemyData = [];
        for (let i = 1; i < 15; i++) {
            // flyer（空飛ぶ敵）を配置
            enemyData.push({ x: 500 * i, y: 300, key: 'enemy_base', hp: 3, speed: 150, type: 'flyer' });
        }

        this.setupStage({
            stageWidth: 8000, 
            bgBack: 'bg2_back', 
            bgMid: 'bg2_mid',
            title: 'STAGE 2: 交通管制ターミナル (空中回廊)',
            platformsData: groundData,
            enemiesData: enemyData,
            
            // ★ 人型ボス（boss2）。速い動きでダッシュ攻撃をしてくる
            bossData: { x: 7500, y: 600, key: 'boss2', hp: 300, speed: 450, type: 'boss2' },
            triggerX: 6800,
            
            dialogues: [
                "ナビ：管制ターミナルの異常な過負荷（サージ）を検知。",
                "ナビ：人型高機動システム「サージ・トラフィッカー」です。",
                "ナビ：非常に素早いです。ダッシュ回避（Cキー）を駆使して背後を取りましょう。"
            ],
            epilogueData: { stageId: 2, bossName: "サージ・トラフィッカー", reward: "【タイミング：ヘビー発射時 / 行動：属性弾発射】" }
        });
    }
}import BaseStage from './BaseStage.js';
export default class Stage2 extends BaseStage {
    constructor() { super('Stage2'); }
    create() {
        this.setupStage({
            bgKey: 'bg2', title: 'STAGE 2: 交通管制ターミナル',
            platformsData: [ { x: 400, y: 425, key: 'ground' }, { x: 300, y: 320, key: 'platform' }, { x: 300, y: 150, key: 'platform' }, { x: 600, y: 250, key: 'platform' } ],
            enemiesData: [ { x: 300, y: 250, key: 'enemy_base', hp: 3, speed: 50 }, { x: 600, y: 150, key: 'enemy_base', hp: 3, speed: 50 } ],
            bossData: { x: 750, y: 300, key: 'boss2', hp: 40, speed: 80 },
            triggerX: 650,
            dialogues: [ "ナビ：管制ターミナルの異常な過負荷（サージ）を検知。", "ナビ：システム「サージ・トラフィッカー」が雷の属性を持って暴走しています。", "ナビ：動きが速いです。ジャンプで立体的に回避してください。" ],
            epilogueData: { stageId: 2, bossName: "サージ・トラフィッカー", reward: "【タイミング：ヘビー発射時 / 行動：属性弾発射】" }
        });
    }
}
